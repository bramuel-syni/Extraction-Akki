"""Ledger reconstructor — rebuild plane state from Northena append-only rows.

Owner ruling (2026-07-30 cycle 3, option (b)) verbatim:
    "Plane state is ledger-reconstructible."

Given the plane's ledger records in chronological order, replaying them
produces the current plane state. Gate M-G8 exercises this: after writing
contributions, publishing some, and revoking the plane, delete the plane
registry entry; then rebuild plane state from the ledger and verify the
reconstruction matches the pre-deletion state.

This is deliberately read-only over the Northena ledger — no writes, no
side effects. The reconstructor is the audit surface, not a control-plane
mutator.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from contracts.northena_ledger import NORTHENA_LEDGER_COLLECTION
from core import db


async def _rows_for_plane(plane_id: str) -> List[dict]:
    """Fetch every ledger row whose stamp_audit.plane_id matches, in `at` order."""
    cursor = db[NORTHENA_LEDGER_COLLECTION].find({
        "stamp_audit.plane_id": plane_id,
    }).sort("at", 1)
    return [doc async for doc in cursor]


async def rebuild_state(plane_id: str) -> Optional[Dict[str, Any]]:
    """Rebuild a plane's state from the Northena ledger.

    Returns a dict with:
      * plane_id
      * state: "active" or "revoked"
      * revoked_at (if applicable)
      * issued_at (from memory_plane_issued row)
      * integration_key
      * tenant_id
      * retrieval_scope
      * contributions_landed_count
      * contributions_refused_count
      * publications_attempted_count
      * publications_landed_count
      * publications_refused_count
      * contribution_ids: list of contribution_ids that landed
      * published_contribution_ids: list of contribution_ids that reached
        registry-visible

    Returns None if no ledger rows exist for this plane.
    """
    rows = await _rows_for_plane(plane_id)
    if not rows:
        return None

    state: Dict[str, Any] = {
        "plane_id": plane_id,
        "state": "active",
        "revoked_at": None,
        "issued_at": None,
        "integration_key": None,
        "tenant_id": None,
        "retrieval_scope": None,
        "contributions_landed_count": 0,
        "contributions_refused_count": 0,
        "publications_attempted_count": 0,
        "publications_landed_count": 0,
        "publications_refused_count": 0,
        "contribution_ids": [],
        "published_contribution_ids": [],
    }

    for row in rows:
        stamp = row.get("stamp_audit") or {}
        data_class = stamp.get("data_class", "")
        if data_class == "memory_plane_issued":
            state["issued_at"] = stamp.get("issued_at") or row.get("at")
            state["integration_key"] = stamp.get("integration_key")
            state["tenant_id"] = stamp.get("tenant_id")
            state["retrieval_scope"] = stamp.get("retrieval_scope")
        elif data_class == "memory_contribution_landed":
            state["contributions_landed_count"] += 1
            cid = stamp.get("contribution_id")
            if cid:
                state["contribution_ids"].append(cid)
        elif data_class == "memory_contribution_refused":
            state["contributions_refused_count"] += 1
        elif data_class == "memory_publication_attempted":
            state["publications_attempted_count"] += 1
        elif data_class == "memory_publication_landed":
            state["publications_landed_count"] += 1
            cid = stamp.get("contribution_id")
            if cid:
                state["published_contribution_ids"].append(cid)
        elif data_class == "memory_publication_refused":
            state["publications_refused_count"] += 1
        elif data_class == "memory_plane_revoked":
            state["state"] = "revoked"
            state["revoked_at"] = stamp.get("revoked_at")

    return state
