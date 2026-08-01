"""Connect sources service · Canon §4.1 record table + §4.4 source profile.

Stored in the `connect_sources` collection as governed non-frozen JSON
(no new frozen contract lands · Owner directive UI-1-C 2026-08-02).

State grammar (Canon §4.1 exact four):
  - connected: source connected and healthy; last_sync recent.
  - in_progress: source currently ingesting.
  - awaiting_credentials: source added, credentials not yet supplied.
  - failed: source connect attempt failed; carries an HONEST plain-language
    failure_reason (Owner ruling: 'The failed-state sample must carry an
    honest plain-language failure reason (never a bare "failed")').

Rights & PII posture live on the source (Canon §4.2 rules 2 + 3). The
mapping card (Source Profile) reads/writes `fields[]` here with per-field
resolution state (open · confirmed · needs_attention).
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from core import db


COLLECTION = "connect_sources"

# Canon §4.1 state grammar
STATE_CONNECTED = "connected"
STATE_IN_PROGRESS = "in_progress"
STATE_AWAITING_CREDENTIALS = "awaiting_credentials"
STATE_FAILED = "failed"
STATE_PENDING = "pending"  # freshly added by master_admin, before operator picks up
_ALL_STATES = {
    STATE_CONNECTED,
    STATE_IN_PROGRESS,
    STATE_AWAITING_CREDENTIALS,
    STATE_FAILED,
    STATE_PENDING,
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def cadence_plain(cadence_id: str) -> str:
    """Return the plain-language rendering of a cadence identifier.

    Canon §4.1: 'cadence in plain words'.
    """
    return {
        "hourly": "every hour",
        "daily_09": "each morning at 9",
        "daily_00": "each night at midnight",
        "weekly_mon": "every Monday morning",
        "monthly_1": "on the 1st of each month",
        "quarterly": "at the start of each quarter",
        "on_demand": "on demand · operator triggered",
    }.get(cadence_id, cadence_id)


def protocol_familiar(protocol_id: str) -> str:
    """Return the plain-language protocol form per Canon §4.1.

    Canon: 'Protocol in familiar form (database endpoint, transfer host,
    object-store endpoint, network share)'.
    """
    return {
        "postgres": "database endpoint",
        "mysql": "database endpoint",
        "sftp": "transfer host",
        "ftp": "transfer host",
        "s3": "object-store endpoint",
        "gcs": "object-store endpoint",
        "smb": "network share",
        "nfs": "network share",
        "http_json": "HTTP · JSON API",
        "webhook": "push · webhook receiver",
        "cms": "CMS connector",
    }.get(protocol_id, protocol_id)


async def list_sources() -> List[Dict[str, Any]]:
    """List all sources with sample-first sort (Owner UI-1-C follow-up)."""
    cursor = db[COLLECTION].find({}).sort([("is_sample", -1), ("added_at_iso", -1)])
    out: List[Dict[str, Any]] = []
    async for doc in cursor:
        doc.pop("_id", None)
        out.append(doc)
    return out


async def get_source(source_id: str) -> Optional[Dict[str, Any]]:
    doc = await db[COLLECTION].find_one({"source_id": source_id})
    if doc is None:
        return None
    doc.pop("_id", None)
    return doc


async def insert_source(payload: Dict[str, Any]) -> None:
    if payload.get("state") not in _ALL_STATES:
        raise ValueError(
            f"insert_source: state must be one of {sorted(_ALL_STATES)}; "
            f"got {payload.get('state')!r}"
        )
    payload.setdefault("added_at_iso", _now_iso())
    payload.setdefault("is_sample", False)
    await db[COLLECTION].insert_one(payload)


async def update_state(source_id: str, new_state: str, **kwargs) -> Optional[Dict[str, Any]]:
    if new_state not in _ALL_STATES:
        raise ValueError(f"update_state: state must be one of {sorted(_ALL_STATES)}")
    update: Dict[str, Any] = {"state": new_state, "state_updated_at_iso": _now_iso()}
    update.update(kwargs)
    result = await db[COLLECTION].find_one_and_update(
        {"source_id": source_id},
        {"$set": update},
        return_document=True,
    )
    if result:
        result.pop("_id", None)
    return result


async def count_by_state() -> Dict[str, int]:
    counts: Dict[str, int] = {s: 0 for s in _ALL_STATES}
    counts["total"] = 0
    async for doc in db[COLLECTION].find({}, {"state": 1}):
        st = doc.get("state")
        if st in counts:
            counts[st] += 1
        counts["total"] += 1
    return counts


async def last_sync_iso() -> Optional[str]:
    """Return the ISO timestamp of the most recent successful sync (any source)."""
    doc = await db[COLLECTION].find_one(
        {"state": STATE_CONNECTED, "last_sync_iso": {"$ne": None}},
        sort=[("last_sync_iso", -1)],
    )
    if doc is None:
        return None
    return doc.get("last_sync_iso")


# --------- §4.1 A5 amendment · declared registries -----------------------------


DECLARED_REGISTRIES_COLLECTION = "connect_declared_registries"


async def list_declared_registries() -> List[Dict[str, Any]]:
    """Class-D registries declared at Connect setup (Canon §4.2 A5).

    Each row: registry_name · schema_class {pseudonymize/redact/filter} ·
    is_empty · version (from /govern/registries) · last_updated_at_iso.
    Chips on the Connect home link into /govern/registries — Govern operates.
    """
    coll = db.get_collection(DECLARED_REGISTRIES_COLLECTION)
    cursor = coll.find({}).sort([("is_sample", -1), ("declared_at_iso", -1)])
    out: List[Dict[str, Any]] = []
    async for doc in cursor:
        doc.pop("_id", None)
        # Cross-reference the current Govern registry version if any.
        gov = await db["D_registries"].find_one(
            {"registry_name": doc["registry_name"], "state": "effective"},
            sort=[("version", -1)],
        )
        if gov is not None:
            doc["version"] = gov.get("version")
            doc["last_updated_at_iso"] = gov.get("effective_from_iso")
            doc["is_empty"] = False
        else:
            doc["version"] = None
            doc["last_updated_at_iso"] = None
            doc["is_empty"] = True
        out.append(doc)
    return out


async def declare_registry(payload: Dict[str, Any]) -> None:
    coll = db.get_collection(DECLARED_REGISTRIES_COLLECTION)
    payload.setdefault("declared_at_iso", _now_iso())
    payload.setdefault("is_sample", False)
    await coll.insert_one(payload)


async def declared_registry_exists(name: str) -> bool:
    coll = db.get_collection(DECLARED_REGISTRIES_COLLECTION)
    return await coll.find_one({"registry_name": name}) is not None
