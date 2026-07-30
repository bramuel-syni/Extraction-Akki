"""Trust Receipt v1 — SIBLING to the shield-service v0 receipt.

Owner ruling — P1 Stage A condition (i) (2026-07-30):
    "masking_tier lands as a NEW trust-receipt contract version BESIDE
    the frozen predecessor (trust_receipt v1 as a sibling contract
    module + its own snapshot) — NEVER a field added to the existing
    frozen shape. Parity 31→32 via seal event."

The predecessor: `backend/services/synisense/shield/trust_receipt.py`
is the service-side receipt builder. It labels its output as
`version: "v1"` (a coincidence of history — that label predates this
frozen-contract module). This module is the FROZEN-CONTRACT sibling
carrying the same shape plus the new `masking_tier` field. Post-P1
close, the shield service builds receipts conforming to THIS model;
the older shape without `masking_tier` is superseded.

The `masking_tier` field is validated at emission against the positive
allowlist at `docs/mandates/masking_tier_allowlist.v0.json` (Owner
condition (ii)). The allowlist is a GOVERNED change surface — new tiers
require a dated Owner ruling.

Freeze contract: this Pydantic model's `model_json_schema()` is
snapshotted to `tests/invariants/trust_receipt_v1.contract_snapshot.json`.
An invariant test fails on any drift. Bumping this schema requires a new
sibling (`trust_receipt_v2.py`) — never in-place edit.
"""
from __future__ import annotations

from typing import Dict, Literal

from pydantic import BaseModel, ConfigDict, Field


class TrustReceiptV1(BaseModel):
    """Trust Receipt v1 — masking-tier-carrying frozen shape.

    Fields carry forward from the shield-service v0 shape byte-verbatim.
    The single addition is `masking_tier: str` (Owner P1 condition i),
    validated against the positive allowlist at emission time.
    """
    model_config = ConfigDict(extra="forbid", frozen=False)

    receipt_id: str = Field(
        description="Unique receipt identifier (UUID v4, server-minted)."
    )
    audit_id: str = Field(
        description="Foreign key into the shield audit log; ties receipt to its call."
    )
    version: Literal["v1"] = Field(
        default="v1",
        description="Schema version. v1 is the masking_tier-carrying shape.",
    )
    tenant_id: str = Field(
        description="Tenant identity — the receipt's per-tenant HMAC key is derived from this via HKDF."
    )
    consumer_id: str = Field(
        description="The consumer (application / caller) that requested the LLM invocation."
    )
    purpose: str = Field(
        description="Purpose label under which the call was made (governed vocabulary)."
    )
    timestamp: str = Field(
        description="ISO-8601 UTC timestamp of receipt issuance."
    )
    llm_provider: str = Field(
        description="Provider name (openai / anthropic / gemini / etc.)."
    )
    llm_model: str = Field(
        description="Provider-specific model identifier used for the call."
    )
    de_id_summary: Dict[str, int] = Field(
        description="Counts per de-id class (e.g., PERSON, EMAIL, PHONE) landed by layers 1-3."
    )
    dilution_score: float = Field(
        description="Dilution metric: how much of the original identifier-bearing surface was replaced."
    )
    exposure_reduction_score: float = Field(
        description="Exposure-reduction metric: heuristic upper-bound on residual identifier surface."
    )
    request_hash: str = Field(
        description="SHA-256 of the request content (post-de-id, pre-LLM). Prefix `sha256:`."
    )
    response_hash: str = Field(
        description="SHA-256 of the LLM response (post-re-id, as returned to caller). Prefix `sha256:`."
    )
    masking_tier: str = Field(
        description=(
            "Masking-tier tag (P1 condition i). Legal values are the positive allowlist at "
            "docs/mandates/masking_tier_allowlist.v0.json. `full_deid` is the standard operating "
            "mode; other tiers document degraded paths (dev echo, unsupported language, perception "
            "fallback). Emission with a non-allowlist value is refused."
        )
    )
    signature: str = Field(
        description="HMAC-SHA256 hex signature over canonical JSON of receipt minus this field."
    )
