"""Working set — usage-proportional persistence.

Owner ruling (2026-07-30 cycle 3, option (b)) verbatim:
    "Working-set persistence is usage-proportional; storage cost is
    measured, not committed to in advance."

Design:
  * A working-set entry is a reference (URI-form pointer), NEVER content.
  * Every use records `last_used_at` + increments `use_count`.
  * When the plane's working set exceeds WORKING_SET_MAX_REFS_PER_PLANE
    [SLOT], the least-recently-used entries are evicted.
  * A halflife decay computes an effective score for LRU-like ordering:
    score = use_count * exp(-days_since_last_use / halflife_days).

Constants are [SLOT]s per Owner condition (c3):
  * WORKING_SET_MAX_REFS_PER_PLANE (default 10_000).
  * WORKING_SET_EVICTION_HALFLIFE_DAYS (default 30).
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import List

from core import db
from services.memory import constants
from services.memory.scoped_accessor import (
    MEMORY_WORKING_SET_COLLECTION,
    ScopedAccessor,
)


async def record_use(*, accessor: ScopedAccessor, ref: str) -> None:
    """Record a use of `ref` in the plane's working set. Wraps the accessor's
    isolation-preserving upsert."""
    await accessor.record_working_set_use(ref)


def _score(*, use_count: int, days_since_last_use: float) -> float:
    """LRU-ish decay: score = use_count * exp(-days_since_last_use / halflife)."""
    halflife = constants.WORKING_SET_EVICTION_HALFLIFE_DAYS or 1
    return use_count * math.exp(-days_since_last_use / halflife)


def _parse_iso(ts: str) -> datetime:
    """Parse an ISO-8601 timestamp; tolerant of trailing Z."""
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    return datetime.fromisoformat(ts)


async def evict_by_halflife(*, accessor: ScopedAccessor) -> int:
    """Evict least-scored entries when the plane's working set exceeds the cap.

    Returns the number of entries evicted. Uses [SLOT] constants; no hand-tuned
    values.
    """
    cap = constants.WORKING_SET_MAX_REFS_PER_PLANE
    entries = await accessor.list_working_set()
    if len(entries) <= cap:
        return 0
    now = datetime.now(timezone.utc)
    scored = []
    for e in entries:
        last_used_at = e.get("last_used_at", now.isoformat())
        try:
            dt = _parse_iso(last_used_at)
        except Exception:
            dt = now
        days_since = max(0.0, (now - dt).total_seconds() / 86400.0)
        scored.append((
            _score(use_count=int(e.get("use_count", 1)),
                   days_since_last_use=days_since),
            e,
        ))
    scored.sort(key=lambda pair: pair[0])  # lowest score first
    to_evict = scored[: len(entries) - cap]
    evicted = 0
    for _, doc in to_evict:
        result = await db[MEMORY_WORKING_SET_COLLECTION].delete_one({
            "plane_id": accessor.plane_id,
            "tenant_id": accessor.tenant_id,
            "ref": doc.get("ref"),
        })
        evicted += result.deleted_count
    return evicted
