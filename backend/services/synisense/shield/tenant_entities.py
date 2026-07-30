"""Synisense Shield — tenant entity dictionary (P1-R1 catalogue-backed).

Owner ruling (P1 Stage A approval, 2026-07-30) closes Canon Correction #3:
the tenant catalogue moves from a returned-empty stub to a catalogue-backed
lookup. Content vocabulary comes from the estate itself — harvested at census
rather than authored. The seed catalogue at `tenant_catalogue.v0.json` ships
the fail-closed enforcement path (P1-R1 fail-closed rule requires a
non-empty catalogue OR a supported NER language OR a below-threshold
proper-noun density; empty catalogue with unsupported language + high
proper-noun density raises ServiceUnavailable per the language dispatch).

Contract preserved (do not alter without an Owner ruling):
    async def lookup_in_text(text: str, *, tenant_id: str) -> list[dict]
    Each returned dict shape: {"start": int, "end": int, "type": str, "match": str}

When S2.onboard binds (the buyer-onboarding journey seat), estate vocabulary
lands via `services.mtafiti.census.emit_tenant_entity_catalogue` which
appends to this same catalogue file per the OWNER-decision register (OD-1)
and Op. Values §8.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

_CATALOGUE_PATH = Path(__file__).resolve().parent / "tenant_catalogue.v0.json"

_ENTITY_TYPE_MAP = {
    "presenters": "PRESENTER",
    "stations": "STATION",
    "programmes": "PROGRAMME",
    "advertisers": "ADVERTISER",
}


def _load_catalogue() -> Dict[str, Any]:
    """Load the catalogue JSON; returns empty structure if file absent."""
    if not _CATALOGUE_PATH.exists():
        return {"tenants": {}}
    try:
        return json.loads(_CATALOGUE_PATH.read_text(encoding="utf-8"))
    except Exception:
        # Malformed catalogue treated as empty — layers 1 + 3 continue.
        return {"tenants": {}}


async def lookup_in_text(text: str, *, tenant_id: str) -> List[Dict[str, Any]]:
    """Scan `text` for surface forms in the tenant catalogue.

    Case-insensitive substring match; returns all non-overlapping hits sorted
    by start offset. Each hit is a dict with `start`, `end`, `type`, `match`
    matching the shape `deidentifier.deidentify` expects.

    Isolation: only entries under `tenants[tenant_id]` are consulted. A call
    with tenant_id=A cannot see tenant B's catalogue.
    """
    cat = _load_catalogue()
    tenant_entries = cat.get("tenants", {}).get(tenant_id, {})
    if not tenant_entries:
        return []

    text_lower = text.lower()
    hits: List[Dict[str, Any]] = []

    for category, entity_type in _ENTITY_TYPE_MAP.items():
        for entry in tenant_entries.get(category, []):
            for surface in [entry.get("surface_form", "")] + entry.get("variant_forms", []):
                if not surface:
                    continue
                surface_lower = surface.lower()
                start = 0
                while True:
                    idx = text_lower.find(surface_lower, start)
                    if idx < 0:
                        break
                    end = idx + len(surface)
                    # Word-boundary check: surrounding chars are non-alphanumeric.
                    left_ok = idx == 0 or not text[idx - 1].isalnum()
                    right_ok = end == len(text) or not text[end].isalnum()
                    if left_ok and right_ok:
                        hits.append({
                            "start": idx,
                            "end": end,
                            "type": entity_type,
                            "match": text[idx:end],
                        })
                    start = end

    # De-overlap: keep leftmost-longest.
    hits.sort(key=lambda h: (h["start"], -(h["end"] - h["start"])))
    deduped: List[Dict[str, Any]] = []
    last_end = -1
    for h in hits:
        if h["start"] >= last_end:
            deduped.append(h)
            last_end = h["end"]
    return deduped


def load_catalogue_for_test() -> Dict[str, Any]:
    """Test-only hook — returns the raw catalogue for inspection."""
    return _load_catalogue()
