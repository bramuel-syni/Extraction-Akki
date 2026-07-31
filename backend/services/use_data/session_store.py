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

# MC-E2 α condition (Owner ruling 2026-07-14): every persistent collection
# carries an `instance_id` sidecar so the backfill-attestation test remains
# clean. The value is written from the ambient instance context at write
# time; the frozen UseDataWizardSession contract does not include this
# field, and reads whitelist by model_fields so the sidecar never leaks
# back into the wire format.
_DEFAULT_INSTANCE_ID = "instance_1"


def _current_instance_id() -> str:
    """Return the effective instance_id for a persistence write.

    Uses the shared multi_instance resolver if importable; falls back to
    `instance_1` (matches the tools/migrations/backfill_* default) so the
    module is safe to import in isolation.
    """
    try:
        from services.multi_instance import current_instance_id  # type: ignore
        return current_instance_id() or _DEFAULT_INSTANCE_ID
    except Exception:  # pragma: no cover — trivial fallback
        return _DEFAULT_INSTANCE_ID


async def ensure_indexes() -> None:
    """Unique index on session_id + operator_id lookup helper + MC-E2 compound."""
    coll = db[COLLECTION]
    await coll.create_index("session_id", unique=True)
    await coll.create_index("operator_id")
    await coll.create_index("is_sample")
    # MC-E2 α: compound (instance_id, session_id) enables instance-scoped
    # queries with lookup efficiency.
    await coll.create_index([("instance_id", 1), ("session_id", 1)], name="instance_id_compound")


def _to_doc(session: UseDataWizardSession, is_sample: bool = False) -> Dict[str, Any]:
    payload = session.model_dump()
    payload["is_sample"] = is_sample
    payload["instance_id"] = _current_instance_id()
    return payload


def _from_doc(doc: Dict[str, Any]) -> UseDataWizardSession:
    """Rehydrate the frozen contract from a persistence doc.

    WHITELIST by `UseDataWizardSession.model_fields` (rather than blacklisting
    the known sidecar keys `_id` + `is_sample`). This hardens the read path
    against ANY future sidecar residue on persistence docs — the MC-E2 α
    `instance_id` field, `_id`, `is_sample`, and any other sidecar the
    persistence layer may add over time. The frozen contract has
    `ConfigDict(extra="forbid")` so an unknown sidecar would raise
    ValidationError → 500; whitelisting closes that class of hazard.
    """
    allowed = set(UseDataWizardSession.model_fields.keys())
    stripped = {k: v for k, v in doc.items() if k in allowed}
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
    """List sessions belonging to an operator with sample flag preserved.

    Held-for-check sessions (`verdict_outcome=held_for_check` sidecar) are
    excluded from this listing — they belong on the Holds surface
    (Canon §7.6), not the Use Data pipeline strip.
    """
    cursor = db[COLLECTION].find({
        "operator_id": operator_id,
        "verdict_outcome": {"$ne": "held_for_check"},
    }).sort("opened_at_iso", -1)
    out: List[Dict[str, Any]] = []
    async for doc in cursor:
        out.append({
            "session": _from_doc(doc),
            "is_sample": bool(doc.get("is_sample", False)),
        })
    return out
