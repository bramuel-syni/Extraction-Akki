"""UI-1-A · Mongo-backed Use Data wizard session store.

Owner viewable-build addendum (2026-07-31) verbatim:
    "seeded state persists (Mongo-backed, not in-memory), and the
     preview reflects the latest close at all times."

The prior UI-1-A implementation used an in-process dict for session
state; that is retired here so demo fixtures survive backend restarts.

Collection: `use_data_wizard_sessions`
Doc shape: exactly the `UseDataWizardSession` model serialized via
`session.model_dump()`, keyed by `session_id`.

The `is_sample` flag on the document (NOT part of the frozen contract)
tags AS-U2-marked demo rows. It never crosses back into the frozen
contract; it lives in the persistence sidecar so the fixture visibly
carries a SAMPLE badge in the UI without corrupting the contract shape.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from core import db
from contracts.use_data_wizard_session import UseDataWizardSession


COLLECTION = "use_data_wizard_sessions"


async def ensure_indexes() -> None:
    """Unique index on session_id + operator_id lookup helper."""
    coll = db[COLLECTION]
    await coll.create_index("session_id", unique=True)
    await coll.create_index("operator_id")
    await coll.create_index("is_sample")


def _to_doc(session: UseDataWizardSession, is_sample: bool = False) -> Dict[str, Any]:
    payload = session.model_dump()
    payload["is_sample"] = is_sample
    return payload


def _from_doc(doc: Dict[str, Any]) -> UseDataWizardSession:
    # Strip the sidecar flags before rehydrating the frozen contract.
    stripped = {k: v for k, v in doc.items() if k not in ("_id", "is_sample")}
    return UseDataWizardSession(**stripped)


async def insert(session: UseDataWizardSession, is_sample: bool = False) -> None:
    await db[COLLECTION].insert_one(_to_doc(session, is_sample=is_sample))


async def upsert(session: UseDataWizardSession) -> None:
    """Replace-or-insert the full envelope; preserves `is_sample` if set."""
    coll = db[COLLECTION]
    existing = await coll.find_one({"session_id": session.session_id})
    is_sample = bool(existing.get("is_sample")) if existing else False
    await coll.replace_one(
        {"session_id": session.session_id},
        _to_doc(session, is_sample=is_sample),
        upsert=True,
    )


async def get(session_id: str) -> Optional[UseDataWizardSession]:
    doc = await db[COLLECTION].find_one({"session_id": session_id})
    if doc is None:
        return None
    return _from_doc(doc)


async def get_with_sample_flag(session_id: str) -> Optional[Dict[str, Any]]:
    """Return {session, is_sample} — for surfaces that must render SAMPLE badges."""
    doc = await db[COLLECTION].find_one({"session_id": session_id})
    if doc is None:
        return None
    return {"session": _from_doc(doc), "is_sample": bool(doc.get("is_sample", False))}


async def list_by_operator(operator_id: str) -> List[Dict[str, Any]]:
    """List sessions belonging to an operator with sample flag preserved."""
    cursor = db[COLLECTION].find({"operator_id": operator_id}).sort("opened_at_iso", -1)
    out: List[Dict[str, Any]] = []
    async for doc in cursor:
        out.append({
            "session": _from_doc(doc),
            "is_sample": bool(doc.get("is_sample", False)),
        })
    return out
