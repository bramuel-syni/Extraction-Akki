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


# --------------------------------------------------------------------------
# Phase 3 sub-cycle 2 · observability aggregator (Owner Ruling 2 · plane-
# observability panel rides sub-cycle 2). Read-only over the same ledger
# rows the reconstructor consumes; buckets contributions by class and
# computes publication acceptance rate + revocation history.
#
# NOT a frozen contract — response is an untyped aggregate JSON body.
# Owner directive: "Zero new frozen contracts; if you find you need one,
# HAZARD-STOP and report instead." — this aggregator does not require one.
# --------------------------------------------------------------------------


async def rebuild_observability(plane_id: str) -> Optional[Dict[str, Any]]:
    """Read-only observability aggregate for the panel.

    Extends rebuild_state with:
      * contribution_class_counts: {fact, utterance, non_factual} (buckets
        computed from stamp_audit.class_declared on landed rows).
      * publication_acceptance_rate: landed / attempted (or None when
        attempted == 0; the metric is undefined without attempts).
      * revocation_history: list of {revoked_by, revoked_at, reason}
        (typically 0 or 1 entries for a plane).

    Reads the same Northena ledger rows the reconstructor uses. No new
    hot-path Mongo collection.
    """
    rows = await _rows_for_plane(plane_id)
    if not rows:
        return None

    result: Dict[str, Any] = {
        "plane_id": plane_id,
        "state": "active",
        "issued_at": None,
        "revoked_at": None,
        "revoked_by": None,
        "revocation_reason": None,
        "integration_key": None,
        "tenant_id": None,
        "contribution_class_counts": {"fact": 0, "utterance": 0, "non_factual": 0},
        "contribution_counts": {"landed": 0, "refused": 0},
        "publication_counts": {"attempted": 0, "landed": 0, "refused": 0},
        "publication_acceptance_rate": None,
        "revocation_history": [],
    }

    for row in rows:
        stamp = row.get("stamp_audit") or {}
        dc = stamp.get("data_class", "")
        if dc == "memory_plane_issued":
            result["issued_at"] = stamp.get("issued_at") or row.get("at")
            result["integration_key"] = stamp.get("integration_key")
            result["tenant_id"] = stamp.get("tenant_id")
        elif dc == "memory_contribution_landed":
            result["contribution_counts"]["landed"] += 1
            cls = stamp.get("class_declared") or "utterance"
            if cls in result["contribution_class_counts"]:
                result["contribution_class_counts"][cls] += 1
            # If a novel class ever arrives, bucket it honestly under its own key.
            else:
                result["contribution_class_counts"].setdefault(cls, 0)
                result["contribution_class_counts"][cls] += 1
        elif dc == "memory_contribution_refused":
            result["contribution_counts"]["refused"] += 1
        elif dc == "memory_publication_attempted":
            result["publication_counts"]["attempted"] += 1
        elif dc == "memory_publication_landed":
            result["publication_counts"]["landed"] += 1
        elif dc == "memory_publication_refused":
            result["publication_counts"]["refused"] += 1
        elif dc == "memory_plane_revoked":
            result["state"] = "revoked"
            result["revoked_at"] = stamp.get("revoked_at")
            result["revoked_by"] = stamp.get("revoked_by")
            result["revocation_reason"] = stamp.get("reason")
            result["revocation_history"].append({
                "revoked_by": stamp.get("revoked_by"),
                "revoked_at": stamp.get("revoked_at"),
                "reason": stamp.get("reason"),
            })

    # Publication acceptance rate. Owner Stage-A gate: null when attempted==0
    # (the metric is undefined without attempts — never present 0/0 as 0%).
    attempted = result["publication_counts"]["attempted"]
    if attempted > 0:
        result["publication_acceptance_rate"] = (
            result["publication_counts"]["landed"] / attempted
        )
    return result
