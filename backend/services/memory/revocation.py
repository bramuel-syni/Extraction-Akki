"""Revocation — immediate freeze of a plane.

Owner ruling (2026-07-30 cycle 3, option (b)) verbatim:
    "Revocation freezes immediately."

Effects on revocation:
  1. plane_registry.update_plane_state(new_state="revoked", revoked_at=now).
  2. Any subsequently-minted ScopedAccessor sees state="revoked" and raises
     PlaneRevoked on read/write attempts.
  3. Any in-flight ScopedAccessor whose _assert_active() is called AFTER
     the revocation raises PlaneRevoked. (Accessors that pre-fetched state
     from the plane doc will raise on their next _assert_active() call.)
  4. Ledger event memory_plane_revoked emitted.
  5. Attempting to revoke an already-revoked plane raises MemoryGovernedRefusal
     with reason plane_already_revoked. (This reason is NOT in the closed
     taxonomy — it is documented in memory_refusal_reasons.v0.json;
     see the note below.)

NOTE (Owner E2 taxonomy discipline): the initial reason set does NOT include
`plane_already_revoked` as a governed refusal because idempotency on revoke
is a state-machine question. The router returns 200 with a `already_revoked`
status marker on the current implementation; opening the reason set requires
an Owner ruling.
"""
from __future__ import annotations

from datetime import datetime, timezone

from services.memory import ledger as memory_ledger
from services.memory import plane_registry
from services.memory.refusal import MemoryGovernedRefusal


async def revoke_plane(
    *,
    plane_id: str,
    revoked_by: str,
    reason: str,
    trace_id: str,
) -> dict:
    """Freeze the plane; write ledger row; return the updated plane doc.

    Idempotency: re-revoking a revoked plane returns the current doc with
    `already_revoked` marker set. No governed refusal, no state churn.
    """
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        raise MemoryGovernedRefusal(
            "plane_not_found",
            detail=f"Plane {plane_id!r} does not exist.",
        )
    if plane.state == "revoked":
        return {"plane": plane.model_dump(mode="json"), "already_revoked": True}

    revoked_at = datetime.now(timezone.utc).isoformat()
    await plane_registry.update_plane_state(
        plane_id=plane_id,
        new_state="revoked",
        revoked_at=revoked_at,
    )
    await memory_ledger.emit_plane_revoked(
        plane_id=plane_id,
        tenant_id=plane.tenant_id,
        revoked_by=revoked_by,
        revoked_at=revoked_at,
        reason=reason,
        trace_id=trace_id,
    )
    fresh = await plane_registry.get_plane(plane_id)
    assert fresh is not None
    return {"plane": fresh.model_dump(mode="json"), "already_revoked": False}


async def freeze_check(*, plane_id: str) -> None:
    """Raise MemoryGovernedRefusal(plane_revoked) if the plane is revoked.

    Used at the router boundary as an early gate — quicker than round-tripping
    to the scoped accessor when the caller does not need one.
    """
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        raise MemoryGovernedRefusal(
            "plane_not_found",
            detail=f"Plane {plane_id!r} does not exist.",
        )
    if plane.state == "revoked":
        raise MemoryGovernedRefusal(
            "plane_revoked",
            detail=f"Plane {plane_id!r} was revoked at {plane.revoked_at!r}.",
        )
