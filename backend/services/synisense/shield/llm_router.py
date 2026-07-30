"""Synisense Shield — outbound LLM router (post-de-id).

Phase A:
- Single provider abstraction. The route selects a provider/model based
  on the request's `model_preference` ("analytical" | "generative" |
  "balanced"). Routing logic stays simple — Phase B will expand.
- Uses the universal LLM key via `emergentintegrations`. If
  the key is missing OR the SDK is unavailable, we fall back to a
  deterministic echo response so smoke tests are hermetic in CI.
- **No cloud LLM-NER calls.** The course correction explicitly removed
  this path. NER is now local-only (spaCy) in `deidentifier.py`.

Returns: `(response_text, llm_provider, llm_model)`. The Shield route
records all three in the audit log and trust receipt.

Chunk 18 (Track 4 item 1, 2026-05-21) — `emergentintegrations.LlmChat`
moved to module-level import (was inline inside `invoke()` for the
fallback-availability check pattern). Module-level import pays the
~500ms-1s cost ONCE at process startup instead of on every first
request post-deploy. The `_EMERGENT_AVAILABLE` flag preserves the
graceful-degradation semantics — if the package isn't importable we
still fall back to the echo path on call.
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Dict, Literal, Optional, Tuple

from services.synisense.exceptions import ServiceUnavailable

# Chunk 18 cold-start fix — module-level import + availability probe.
# This replaces the previous inline `try: from emergentintegrations.llm.chat
# import LlmChat, UserMessage` inside invoke(). The probe runs ONCE at
# import time; subsequent invocations skip the try/except cost.
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage  # noqa: WPS433
    _EMERGENT_AVAILABLE = True
except Exception as _exc:  # noqa: BLE001
    LlmChat = None  # type: ignore[assignment]
    UserMessage = None  # type: ignore[assignment]
    _EMERGENT_AVAILABLE = False
    _EMERGENT_IMPORT_ERROR = f"{type(_exc).__name__}: {str(_exc)[:200]}"
else:
    _EMERGENT_IMPORT_ERROR = None

# Chunk 18.5 cold-start fix — lift `litellm` + `get_integration_proxy_url`
# from per-call lazy imports to module-level. The previous code paid the
# import-cache lookup + module init on every cold path even though both
# are pure-python wrappers with no side-effects worth deferring.
# Module-level matches the LlmChat probe style above + uses the same
# `_EMERGENT_AVAILABLE` flag to short-circuit on missing deps.
try:
    import litellm  # noqa: WPS433
    from emergentintegrations.llm.utils import get_integration_proxy_url  # noqa: WPS433
    _LITELLM_AVAILABLE = True
except Exception as _lite_exc:  # noqa: BLE001
    litellm = None  # type: ignore[assignment]
    get_integration_proxy_url = None  # type: ignore[assignment]
    _LITELLM_AVAILABLE = False
    _LITELLM_IMPORT_ERROR = f"{type(_lite_exc).__name__}: {str(_lite_exc)[:200]}"
else:
    _LITELLM_IMPORT_ERROR = None

log = logging.getLogger("synisense.shield.llm_router")

ModelPreference = Literal["analytical", "generative", "balanced"]

# Provider/model selection table — locked for Phase A.
_PROVIDER_TABLE: dict = {
    "analytical": ("anthropic", "claude-sonnet-4-5-20250929"),
    "generative": ("openai", "gpt-4o"),
    "balanced":   ("gemini", "gemini-2.5-flash"),
}


def _provider_for(preference: ModelPreference) -> Tuple[str, str]:
    return _PROVIDER_TABLE.get(preference, _PROVIDER_TABLE["balanced"])


# ─────────────────────────────────────────────────────────────────────
# P1-R6 (Owner ruling 2026-07-30) — token-preservation clause LEADS the
# composed system prompt. Callers CANNOT strip the token clause even
# when they supply their own `system_msg` — this helper prepends the
# clause unconditionally. The caller's prompt follows AFTER a delimiter
# that carries a load-bearing statement.
#
# Break-in test: attempt to pass a system_msg that omits the token clause
# and observe that the composed message still leads with it.
# ─────────────────────────────────────────────────────────────────────
_TOKEN_PRESERVATION_CLAUSE = (
    "You are a privacy-governed assistant. The user message contains "
    "opaque tokens of the shape [[ENT_XXX_NNN]] — preserve them "
    "verbatim. Do not invent meanings for them."
)

_CALLER_PROMPT_DELIMITER = (
    "\n\n--- Caller-supplied context follows. Opaque tokens above MUST "
    "be preserved verbatim in your output. ---\n\n"
)


def _compose_system_message(caller_prompt: Optional[str]) -> str:
    """Compose the system message with the token-preservation clause LEADING.

    When `caller_prompt` is None, only the token clause + a short
    concise-response instruction ships. When `caller_prompt` is provided,
    the token clause LEADS, followed by the delimiter, followed by the
    caller's prompt. The caller cannot strip the token clause.
    """
    if caller_prompt is None:
        return _TOKEN_PRESERVATION_CLAUSE + " Respond concisely."
    return _TOKEN_PRESERVATION_CLAUSE + _CALLER_PROMPT_DELIMITER + caller_prompt


# ─────────────────────────────────────────────────────────────────────
# Deterministic echo fallback. Used when EMERGENT_LLM_KEY is missing OR
# when SYNISENSE_LLM_MODE=mock. Smoke tests opt into this so they don't
# burn LLM budget. The fallback intentionally echoes the de-identified
# content verbatim so `reidentify()` has tokens to swap back, exercising
# the full pipeline.
# ─────────────────────────────────────────────────────────────────────
def _mock_invoke(de_id_content: str) -> str:
    return de_id_content


async def invoke(
    de_id_content: str,
    *,
    model_preference: ModelPreference = "balanced",
    timeout_seconds: float = 20.0,
) -> Tuple[str, str, str]:
    """Call the consumer LLM with de-identified content.

    Returns `(response_text, provider, model)`. Raises
    `ServiceUnavailable` on hard failure (timeout / SDK exception /
    network) so the Shield can fail-closed and emit a 503.

    Backwards-compatible wrapper around `invoke_with_metering`. Existing
    callers that don't need token metering keep the 3-tuple shape. The
    Shield client + the legacy `/api/synisense/shield/invoke` route both
    use `invoke_with_metering` to capture exact provider usage.
    """
    text, provider, model, _usage = await invoke_with_metering(
        de_id_content,
        model_preference=model_preference,
        timeout_seconds=timeout_seconds,
    )
    return (text, provider, model)


async def invoke_with_metering(
    content: str,
    *,
    model_preference: ModelPreference = "balanced",
    timeout_seconds: float = 20.0,
    system_msg: Optional[str] = None,
    tenant_id: str = "default",
) -> Tuple[str, str, str, Dict[str, Any]]:
    """Same contract as `invoke()` but additionally returns a usage dict.

    Chunk 18 (Track 4 item 2, 2026-05-21) — token-accurate metering.

    IF-1 chokepoint reconnection (2026-07-14) — this function now carries
    the full custody chain: `deidentifier.deidentify(content, tenant_id)`
    → LLM (with the de-identified `redacted_text`) → `reidentifier.reidentify`
    on the response. Fail-closed per the deidentifier's own spec:
    `ServiceUnavailable` from deidentify propagates without an LLM call
    (raw `content` never reaches the outbound seam). Reidentify is
    pure-regex and pipes the LLM response through the per-request
    token_map before returning.

    spaCy-unloadable fallback: `deidentifier._ensure_spacy()` returns
    None → `ServiceUnavailable` → this function re-raises the same
    `ServiceUnavailable` → `fluency_synthesizer._invoke_llm_raw`
    catches and converts to `LLMUnavailableError` → service_1 routes
    to the mechanical arm per AF-E2 amended boundary.

    Tenant layer: `services.synisense.shield.tenant_entities.lookup_in_text`
    reads the catalogue at `tenant_catalogue.v0.json` (P1-R1 backfilled).
    Empty catalogues fall through to spaCy layer per the fail-closed rule.

    P1-R3 (Owner ruling 2026-07-30) — the previous `_shielded: bool = True`
    bypass parameter has been REMOVED from this function's signature.
    Tests that need to exercise the de-id-off path MUST monkeypatch
    `deidentifier.deidentify` at the module boundary (see the P1
    signature-inspection gate).

    `usage` shape:
      - Live SDK call: `{"input_tokens": int, "output_tokens": int, "method": "exact"}`
      - Mock / fallback: `{}` (caller must fall back to estimation).

    Phase 14 (2026-06-05) — `system_msg` kwarg. When provided, REPLACES
    the built-in privacy-governed system prompt for this call. When
    None (default for the 90+ existing call sites), the built-in
    prompt is preserved.

    P1-R6 (Owner ruling 2026-07-30) — even when the caller supplies its
    own `system_msg`, the token-preservation clause LEADS the composed
    prompt. Callers CANNOT strip the token clause; `_compose_system_message`
    always prepends it (see helper below).
    """
    provider, model = _provider_for(model_preference)

    # ── IF-1 chokepoint · deidentify inbound (P1-R3: always shielded) ──
    from services.synisense.shield import deidentifier, reidentifier
    de_id = await deidentifier.deidentify(content, tenant_id=tenant_id)
    llm_input = de_id.redacted_text
    token_map = de_id.token_map

    # Mock mode — explicit opt-in OR no key configured.
    llm_mode = os.environ.get("SYNISENSE_LLM_MODE", "").lower()
    emergent_key = os.environ.get("EMERGENT_LLM_KEY", "").strip()
    if llm_mode == "mock" or not emergent_key:
        if not emergent_key and llm_mode != "mock":
            log.info("synisense.shield.llm_router: EMERGENT_LLM_KEY absent — using echo fallback")
        mock_text = _mock_invoke(llm_input)
        try:
            mock_text = reidentifier.reidentify(mock_text, token_map)
        except Exception as exc:  # noqa: BLE001 — fail-closed: never return raw response
            raise ServiceUnavailable(
                f"reidentifier failure at chokepoint: {type(exc).__name__}: {str(exc)[:200]}"
            ) from exc
        return (mock_text, provider + ":mock", model + ":mock", {})

    # Live mode — call litellm directly so we can keep the ModelResponse
    # and pull `usage.prompt_tokens` / `usage.completion_tokens`. Module-
    # level import probe (Chunk 18 cold-start) covers the integrations SDK;
    # `_LITELLM_AVAILABLE` (Chunk 18.5) covers litellm + the proxy URL
    # helper. Both probes run ONCE at import time.
    if not _EMERGENT_AVAILABLE or not _LITELLM_AVAILABLE:
        log.warning(
            "synisense.shield.llm_router: SDK unavailable (emergent=%s litellm=%s)",
            _EMERGENT_IMPORT_ERROR or "ok",
            _LITELLM_IMPORT_ERROR or "ok",
        )
        mock_text = _mock_invoke(llm_input)
        try:
            mock_text = reidentifier.reidentify(mock_text, token_map)
        except Exception as exc:  # noqa: BLE001 — fail-closed
            raise ServiceUnavailable(
                f"reidentifier failure at chokepoint: {type(exc).__name__}: {str(exc)[:200]}"
            ) from exc
        return (mock_text, provider + ":mock", model + ":mock", {})

    try:
        proxy_url = get_integration_proxy_url()
        if provider == "gemini":
            litellm_model = f"gemini/{model}"
        else:
            litellm_model = model  # openai, anthropic via the universal LLM proxy
        params = {
            "model": litellm_model,
            "messages": [
                {
                    "role": "system",
                    "content": _compose_system_message(system_msg),
                },
                {"role": "user", "content": llm_input},
            ],
            "api_key": emergent_key,
            "api_base": proxy_url + "/llm",
            "custom_llm_provider": "openai",
        }
        response = await asyncio.wait_for(
            litellm.acompletion(**params),
            timeout=timeout_seconds,
        )
        # Extract text from the OpenAI-compatible response envelope.
        text = ""
        try:
            text = response.choices[0].message.content or ""
        except Exception:  # noqa: BLE001
            text = str(response)
        # ── IF-1 chokepoint · reidentify outbound ──
        # Pure regex; hard-PII classes render as [LABEL_••••last4]
        # or [LABEL_REDACTED], contextual classes rehydrate. See
        # `reidentifier._VISIBLE_STRATEGY` for the mapping.
        if _shielded_marker := True:  # unified reidentify path
            text = reidentifier.reidentify(text, token_map)
        usage: Dict[str, Any] = {}
        try:
            u = getattr(response, "usage", None)
            prompt = int(getattr(u, "prompt_tokens", 0) or 0)
            completion = int(getattr(u, "completion_tokens", 0) or 0)
            if prompt > 0 or completion > 0:
                usage = {
                    "input_tokens": prompt,
                    "output_tokens": completion,
                    "method": "exact",
                }
        except Exception:  # noqa: BLE001 — usage is best-effort; estimation path absorbs gaps
            usage = {}
        # Suppress unused-import warnings when emergentintegrations imports
        # have already been done at module load.
        _ = (LlmChat, UserMessage)
        return (text, provider, model, usage)
    except asyncio.TimeoutError as exc:
        raise ServiceUnavailable(
            f"LLM provider timeout after {timeout_seconds}s"
        ) from exc
    except ServiceUnavailable:
        # Deidentifier fail-closed already raised ServiceUnavailable;
        # re-raise verbatim so caller sees the same exception surface.
        raise
    except Exception as exc:  # noqa: BLE001
        log.warning("synisense.shield.llm_router: invoke failed (%s)", type(exc).__name__)
        raise ServiceUnavailable(
            f"LLM provider call failed: {type(exc).__name__}: {str(exc)[:200]}"
        ) from exc

# ─────────────────────────────────────────────────────────────────────
# Commercial-cut 2026-07-06 — SonnetWizardAgent extracted to salvage.
# ─────────────────────────────────────────────────────────────────────
# Owner ruling (BCR v1.4 §12): commercial half + buyer wizard variant
# cut. The `SonnetWizardAgent` class + `_sonnet_invoke` helper landed
# at Phase 7 Stage B-2 for the buyer wizard were moved verbatim to:
#   /app/salvage/commercial_cut_2026_07_06/backend/wizard/sonnet_wizard_agent_extracted.py
# Post-cut the operator wizard uses `DeterministicStubAgent`
# (unchanged); no live consumer of Sonnet-driven agent turns remains in
# the extractor tree.
