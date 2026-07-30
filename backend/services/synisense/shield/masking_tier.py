"""Synisense Shield — masking_tier allowlist reader (P1-R5 Owner condition ii).

Owner ruling (P1 Stage A approval, 2026-07-30) requires masking_tier to be
added to a trust-receipt allowlist registry as a GOVERNED change (positive
list — nothing appears by default).

The allowlist source of truth is `docs/mandates/masking_tier_allowlist.v0.json`.
Emission of a trust receipt with a `masking_tier` value NOT on the allowlist
is refused at write time.

The allowlist also records which values are admissible under `AKKI_ENV`:
some tiers (e.g., `dev_fallback`, `llm_dev_echo_fallback`) are admissible
ONLY in development/sandbox. Emission of a dev-only tier under
`AKKI_ENV=production` is refused.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict, List

_ALLOWLIST_PATH = Path(__file__).resolve().parents[4] / "docs" / "mandates" / "masking_tier_allowlist.v0.json"


class MaskingTierRefused(ValueError):
    """Raised when a trust receipt attempts to emit a non-allowlisted tier."""


def _load_allowlist() -> Dict:
    if not _ALLOWLIST_PATH.exists():
        # Failsafe: empty allowlist -> nothing admissible.
        return {"entries": []}
    return json.loads(_ALLOWLIST_PATH.read_text(encoding="utf-8"))


_ALLOWLIST = _load_allowlist()
_ENTRIES_BY_TIER: Dict[str, Dict] = {
    e["tier"]: e for e in _ALLOWLIST.get("entries", [])
}


def legal_tiers() -> List[str]:
    """Return the list of admissible masking-tier values."""
    return sorted(_ENTRIES_BY_TIER.keys())


def validate_tier(tier: str, *, akki_env: str = None) -> None:
    """Validate a masking-tier for emission. Raises MaskingTierRefused on refusal.

    If `akki_env` is None, reads from the AKKI_ENV env var (default `development`).
    """
    if not tier:
        raise MaskingTierRefused("masking_tier is required (empty string refused)")
    entry = _ENTRIES_BY_TIER.get(tier)
    if entry is None:
        raise MaskingTierRefused(
            f"masking_tier {tier!r} not on the positive allowlist. "
            f"Legal values: {legal_tiers()}. "
            f"Adding a new tier requires a governed change (Owner ruling + effective delay)."
        )
    if akki_env is None:
        akki_env = os.environ.get("AKKI_ENV", "development").lower()
    admissible = entry.get("admissible_under_env", ["development", "sandbox", "production"])
    if akki_env not in admissible:
        raise MaskingTierRefused(
            f"masking_tier {tier!r} not admissible under AKKI_ENV={akki_env!r}. "
            f"Admissible: {admissible}."
        )
