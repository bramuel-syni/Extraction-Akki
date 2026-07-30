"""P1-R4 — Production-scoped startup guards (Owner scoping clarification).

Owner ruling (P1 Stage A approval, 2026-07-30) verbatim scoping:

    "hard-fail startup (P1-R4) is PRODUCTION-SCOPED — sandbox/dev echo
    mode stays functional; runtime masking failure still falls to the
    mechanical arm (never a hard crash of a live call)."

Under AKKI_ENV=production, this module refuses to boot on absent secret /
absent admin seed / mock LLM. Under AKKI_ENV=development or sandbox, it
logs structured warnings and continues.

Called from `server.py` at ASGI startup BEFORE any request-serving code
runs; a failed guard raises `StartupGuardFailure` which propagates out
of the app lifecycle and causes the process to exit non-zero.
"""
from __future__ import annotations

import logging
import os
from typing import List, Tuple

log = logging.getLogger("synisense.startup_guard")


class StartupGuardFailure(RuntimeError):
    """Raised when a production-scoped startup guard fails.
    Propagation causes ASGI startup to fail; the process exits non-zero."""


def akki_env() -> str:
    """Return normalised AKKI_ENV (development | sandbox | production).

    Reads AKKI_ENV first, falling back to ENVIRONMENT for legacy compat.
    Defaults to `development` when unset.
    """
    raw = (os.environ.get("AKKI_ENV") or os.environ.get("ENVIRONMENT") or "development").strip().lower()
    if raw in ("prod", "production"):
        return "production"
    if raw in ("sandbox", "stage", "staging"):
        return "sandbox"
    return "development"


def is_production() -> bool:
    return akki_env() == "production"


def check_startup_guards() -> Tuple[bool, List[str]]:
    """Run production startup guards.

    Returns (ok, warnings_or_failures).

    Under production: any failure returns (False, [reasons]). Caller
    (server.py) raises StartupGuardFailure and the process exits non-zero.

    Under development/sandbox: (True, [warnings]) — warnings surface at
    the /api/readyz payload's `masking_tier: dev_fallback` line.
    """
    env = akki_env()
    findings: List[str] = []

    # Guard 1: SYNISENSE_MASTER_SECRET
    if not os.environ.get("SYNISENSE_MASTER_SECRET", "").strip():
        findings.append(
            "SYNISENSE_MASTER_SECRET is unset. Trust-receipt signatures "
            "invalidate on every restart. Production emission of receipts "
            "under this posture is prohibited."
        )

    # Guard 2: admin seed (ADMIN_EMAIL + ADMIN_PASSWORD).
    if not os.environ.get("ADMIN_EMAIL", "").strip():
        findings.append("ADMIN_EMAIL is unset. Admin seed will not run; login is broken.")
    if not os.environ.get("ADMIN_PASSWORD", "").strip():
        findings.append("ADMIN_PASSWORD is unset. Admin seed will not run; login is broken.")

    # Guard 3: LLM key OR explicit mock mode.
    llm_mode = os.environ.get("SYNISENSE_LLM_MODE", "").strip().lower()
    emergent_key = os.environ.get("EMERGENT_LLM_KEY", "").strip()
    if not emergent_key and llm_mode != "mock":
        findings.append(
            "EMERGENT_LLM_KEY is unset and SYNISENSE_LLM_MODE is not 'mock'. "
            "Shield router will fall back to echo mode."
        )

    if env == "production" and findings:
        # Production: any finding is fatal.
        for f in findings:
            log.error("synisense.startup_guard: %s", f)
        return (False, findings)

    # dev/sandbox: findings become warnings.
    for f in findings:
        log.warning("synisense.startup_guard [dev-fallback]: %s", f)
    return (True, findings)


def enforce_startup_guards() -> None:
    """Call this at ASGI startup. Raises StartupGuardFailure on production violation."""
    ok, findings = check_startup_guards()
    env = akki_env()
    if not ok:
        joined = " | ".join(findings)
        log.critical(
            "synisense.startup_guard: PRODUCTION STARTUP REFUSED. AKKI_ENV=%s. %s",
            env, joined,
        )
        raise StartupGuardFailure(
            f"Production startup guards failed under AKKI_ENV={env}: {joined}"
        )
    if findings:
        log.warning(
            "synisense.startup_guard: %d dev-fallback finding(s) recorded; "
            "AKKI_ENV=%s continues to boot with degraded posture.",
            len(findings), env,
        )
