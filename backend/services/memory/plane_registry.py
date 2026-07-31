"""Memory plane registry — Mongo-backed plane issue / lookup.

Owner ruling (2026-07-30 cycle 3, option (b)):
    "Every integration key ships with exactly one PLANE (retrieval scope +
    contribution store + working set). Plane isolation is by construction."

This module is the surface that mints new planes and looks them up. It does
NOT perform reads on plane contents — that is the scoped_accessor's job.
Cross-plane reads are inexpressible via the scoped_accessor (M-G1..M-G4
break-in gates).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from contracts.memory_plane_v0 import MemoryPlane_v0
from core import db

MEMORY_PLANE_COLLECTION = "memory_planes"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _mint_plane_id() -> str:
    return f"mp-{uuid.uuid4().hex[:12]}"


def _mint_contribution_store_ref(plane_id: str) -> str:
    """Plane-local contribution store partition reference.

    URI-form; scoped_accessor uses the plane_id embedded in the ref to
    enforce isolation. Any accessor asked for `contributions:{plane_id_A}`
    while holding a plane_id_B scope raises PlaneScopeViolation.
    """
    return f"contributions:{plane_id}"


def _mint_working_set_ref(plane_id: str) -> str:
    """Plane-local working set partition reference."""
    return f"working_set:{plane_id}"


async def issue_plane(
    *,
    integration_key: str,
    tenant_id: str,
    retrieval_scope: str,
) -> MemoryPlane_v0:
    """Mint a new plane bound to the integration key + tenant scope.

    Server-minted plane_id + contribution_store_ref + working_set_ref.
    Every seam call downstream (contribute, publish, read) must pass the
    plane_id and matching integration_key/tenant to the scoped_accessor.
    """
    plane_id = _mint_plane_id()
    plane = MemoryPlane_v0(
        plane_id=plane_id,
        issued_to_integration_key=integration_key,
        tenant_id=tenant_id,
        retrieval_scope=retrieval_scope,
        contribution_store_ref=_mint_contribution_store_ref(plane_id),
        working_set_ref=_mint_working_set_ref(plane_id),
        state="active",
        issued_at=_iso_now(),
    )
    await db[MEMORY_PLANE_COLLECTION].insert_one(plane.model_dump(mode="json"))
    return plane


async def get_plane(plane_id: str) -> Optional[MemoryPlane_v0]:
    """Return the plane envelope or None if not found."""
    doc = await db[MEMORY_PLANE_COLLECTION].find_one({"plane_id": plane_id})
    if not doc:
        return None
    doc.pop("_id", None)
    return MemoryPlane_v0.model_validate(doc)


async def list_planes_for_integration_key(integration_key: str) -> list:
    """List all planes bound to an integration key (owner-of-key scope)."""
    cursor = db[MEMORY_PLANE_COLLECTION].find({
        "issued_to_integration_key": integration_key,
    })
    out = []
    async for doc in cursor:
        doc.pop("_id", None)
        out.append(MemoryPlane_v0.model_validate(doc))
    return out


async def update_plane_state(
    *,
    plane_id: str,
    new_state: str,
    revoked_at: Optional[str] = None,
) -> None:
    """State-transition update (used by revocation). Append-only in ledger;
    the plane doc reflects the current lifecycle state."""
    update = {"state": new_state}
    if revoked_at is not None:
        update["revoked_at"] = revoked_at
    await db[MEMORY_PLANE_COLLECTION].update_one(
        {"plane_id": plane_id},
        {"$set": update},
    )
