"""/api/memory/* — Memory Service router (backend only per cycle-3 scope).

Owner ruling (3a, 2026-07-31): "Wire /api/memory/* now. Backend surface in
OpenAPI, exercised via engineer-key credentials, server-side scope
enforcement on every call."

Endpoints (per Stage A §6):
  * POST /api/memory/planes
  * GET  /api/memory/planes
  * GET  /api/memory/planes/{plane_id}
  * POST /api/memory/planes/{plane_id}/contribute
  * POST /api/memory/planes/{plane_id}/publish
  * POST /api/memory/planes/{plane_id}/revoke
  * GET  /api/memory/planes/{plane_id}/working_set
  * GET  /api/memory/planes/{plane_id}/retrieval_scope
  * GET  /api/memory/planes/{plane_id}/reconstructed_state

Refusal taxonomy (Owner E2 non-negotiable):
  * Governed refusals (plane_revoked, plane_not_found,
    contribution_over_class_cap, contribution_rights_forbid,
    contribution_shape_invalid, publication_gate_denied,
    publication_quality_threshold_unset, plane_scope_invalid) →
    HTTP 4xx with `{outcome: "refused", reason, detail}`.
  * Auth denials (auth_missing, auth_expired, auth_scope_insufficient) →
    HTTP 401/403 with `{reason, detail}` — NEVER `outcome`.

Auth model: every route requires an authenticated caller carrying either
the `engineer` / `admin` / `master_admin` role OR an engineer-key grant.
Cross-key access is inexpressible via the ScopedAccessor factory.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Body, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from services.auth import auth_refusal
from services.auth.dependencies import require_identity_or_deny
from services.auth.identity import Identity
from services.memory import (
    ledger_reconstructor,
    plane_registry,
    publication,
    revocation,
    scoped_accessor,
    write_back,
)
from services.memory.refusal import MemoryGovernedRefusal, build_refusal_response


router = APIRouter(prefix="/memory", tags=["memory"])


# -------------------- authz helpers --------------------


def _has_memory_authority(identity: Identity) -> bool:
    """A caller may reach the memory surface iff they carry an engineer /
    admin / master_admin role OR at least one engineer-key grant."""
    roles = set(identity.roles)
    if roles & {"engineer", "external_engineer", "admin", "master_admin"}:
        return True
    return bool(identity.key_grants)


async def _require_memory_authority(request: Request):
    """Return (identity, None) on permit, (None, JSONResponse) on deny."""
    result = await require_identity_or_deny(request)
    if isinstance(result, JSONResponse):
        return None, result
    identity: Identity = result
    if not _has_memory_authority(identity):
        return None, auth_refusal.emit(
            "auth_scope_insufficient",
            detail=(
                "Memory Service requires the `engineer` role (or admin/"
                "master_admin) OR at least one engineer-key grant. The "
                "caller identity is authenticated but lacks memory authority."
            ),
        )
    return identity, None


def _caller_integration_key(identity: Identity) -> str:
    """Derive the caller's integration key.

    Precedence:
      1. First key_grant's grant_id (engineer-key holders).
      2. identity.user_id (admins/master_admins act as their own key holder;
         plane ownership tied to user_id enables Owner-visible plane operations).
    """
    if identity.key_grants:
        return identity.key_grants[0].grant_id
    return identity.user_id


def _caller_tenant(identity: Identity) -> str:
    """Derive tenant scope. Admin/master_admin default to `default`; engineer-key
    grants ride whatever tenant they were minted against — for the initial
    implementation the identity does not carry a tenant field, so we use the
    key-grant scope if present, else `default`."""
    if identity.key_grants:
        return identity.key_grants[0].scope or "default"
    return "default"


def _authorize_plane_access(*, plane, identity: Identity) -> Optional[JSONResponse]:
    """Reject cross-key access before touching the accessor.

    Server-side scope enforcement (Owner (3a) verbatim). Admin / master_admin
    can inspect any plane; engineer-key holders are restricted to planes
    bound to their own key.
    """
    roles = set(identity.roles)
    if roles & {"admin", "master_admin"}:
        return None  # full scope
    caller_key = _caller_integration_key(identity)
    if plane.issued_to_integration_key != caller_key:
        return auth_refusal.emit(
            "auth_scope_insufficient",
            detail=(
                "Memory plane scope: caller may only reach planes bound to "
                "their own integration key. Foreign plane access denied."
            ),
        )
    return None


def _governed(exc: MemoryGovernedRefusal, status_code: int = 422) -> JSONResponse:
    """Translate a governed-refusal exception to the envelope response."""
    return JSONResponse(status_code=status_code, content=build_refusal_response(exc))


# -------------------- request models --------------------


class IssuePlaneRequest(BaseModel):
    retrieval_scope: str = Field(..., min_length=1)


class ContributeRequest(BaseModel):
    """POST /api/memory/planes/{plane_id}/contribute body.

    Required top-level fields (all present in this shape are required
    per Owner Stage A §7 five-ring + class-cap + rights-at-birth):
      * content_ref — URI-form pointer to the artifact whose extraction
        this contribution captures (five-ring stamp is the shape;
        content lives at the ref).
      * five_ring_stamp — dict carrying ALL five rings: content,
        provenance, defensibility, context, re_extraction_handle.
      * class_declared — Solva class ∈ {fact, utterance, non_factual};
        must not exceed max(cited_source_classes).
      * cited_sources — non-empty list of source refs.
      * cited_source_classes — parallel non-empty list of Solva classes.
      * rights_class — defaults to internal_only (widening requires
        the separate publication ceremony).
      * intended_scope — defaults to mind_context_only (registry
        publication is a separate governed act).
    """
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "content_ref": "artifacts/tenant-alpha/hour-1/extraction-v0.json",
                "five_ring_stamp": {
                    "content": {"text": "Sample utterance."},
                    "provenance": {"source_ref": "src-1"},
                    "defensibility": {"class": "utterance"},
                    "context": {"note": "Contextual metadata"},
                    "re_extraction_handle": {"handle_id": "h-1"},
                },
                "class_declared": "utterance",
                "cited_sources": ["src-1"],
                "cited_source_classes": ["utterance"],
                "rights_class": "internal_only",
                "intended_scope": "mind_context_only",
            }
        }
    )
    content_ref: str = Field(..., min_length=1)
    five_ring_stamp: Dict[str, Any]
    class_declared: str = Field(..., min_length=1)
    cited_sources: List[str] = Field(..., min_length=1)
    cited_source_classes: List[str] = Field(..., min_length=1)
    rights_class: str = "internal_only"
    intended_scope: str = "mind_context_only"


class PublishRequest(BaseModel):
    contribution_id: str = Field(..., min_length=1)
    quality_score: Optional[float] = None


class RevokeRequest(BaseModel):
    reason: str = Field(default="owner_action")


# -------------------- endpoints --------------------


@router.post("/planes", status_code=201)
async def post_plane(body: IssuePlaneRequest, request: Request):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.issue_plane(
        integration_key=_caller_integration_key(identity),
        tenant_id=_caller_tenant(identity),
        retrieval_scope=body.retrieval_scope,
    )
    # Ledger row for issuance.
    from services.memory import ledger as memory_ledger
    trace_id = f"trace-{plane.plane_id}"
    await memory_ledger.emit_plane_issued(
        plane_id=plane.plane_id,
        integration_key=plane.issued_to_integration_key,
        tenant_id=plane.tenant_id,
        retrieval_scope=plane.retrieval_scope,
        issued_at=plane.issued_at,
        actor=identity.user_id or identity.email or "memory-service",
        trace_id=trace_id,
    )
    return JSONResponse(status_code=201, content=plane.model_dump(mode="json"))


@router.get("/planes")
async def list_planes(request: Request):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    key = _caller_integration_key(identity)
    planes = await plane_registry.list_planes_for_integration_key(key)
    return {"planes": [p.model_dump(mode="json") for p in planes]}


@router.get("/planes/{plane_id}")
async def get_plane(plane_id: str, request: Request):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        return _governed(MemoryGovernedRefusal("plane_not_found",
                                               detail=f"Plane {plane_id!r} not found."))
    scope_deny = _authorize_plane_access(plane=plane, identity=identity)
    if scope_deny is not None:
        return scope_deny
    return plane.model_dump(mode="json")


@router.post("/planes/{plane_id}/contribute", status_code=201)
async def post_contribute(
    plane_id: str,
    body: ContributeRequest,
    request: Request,
):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        return _governed(MemoryGovernedRefusal("plane_not_found",
                                               detail=f"Plane {plane_id!r} not found."))
    scope_deny = _authorize_plane_access(plane=plane, identity=identity)
    if scope_deny is not None:
        return scope_deny
    if plane.state == "revoked":
        return _governed(MemoryGovernedRefusal(
            "plane_revoked",
            detail=f"Plane {plane_id!r} was revoked at {plane.revoked_at!r}.",
        ))
    try:
        accessor = await scoped_accessor.for_plane(
            plane_id=plane_id,
            integration_key=plane.issued_to_integration_key,
        )
    except scoped_accessor.PlaneScopeViolation as exc:
        return _governed(MemoryGovernedRefusal(
            "plane_scope_invalid", detail=str(exc)
        ))
    trace_id = f"trace-{plane_id}"
    actor = identity.user_id or identity.email or "memory-service"
    try:
        contribution = await write_back.write_contribution(
            accessor=accessor,
            content_ref=body.content_ref,
            five_ring_stamp=body.five_ring_stamp,
            class_declared=body.class_declared,
            cited_sources=body.cited_sources,
            cited_source_classes=body.cited_source_classes,
            rights_class=body.rights_class,
            intended_scope=body.intended_scope,
            actor=actor,
            trace_id=trace_id,
        )
    except MemoryGovernedRefusal as exc:
        return _governed(exc)
    return JSONResponse(status_code=201, content=contribution.model_dump(mode="json"))


@router.post("/planes/{plane_id}/publish")
async def post_publish(
    plane_id: str,
    body: PublishRequest,
    request: Request,
):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        return _governed(MemoryGovernedRefusal("plane_not_found",
                                               detail=f"Plane {plane_id!r} not found."))
    scope_deny = _authorize_plane_access(plane=plane, identity=identity)
    if scope_deny is not None:
        return scope_deny
    if plane.state == "revoked":
        return _governed(MemoryGovernedRefusal(
            "plane_revoked",
            detail=f"Plane {plane_id!r} was revoked at {plane.revoked_at!r}.",
        ))
    try:
        accessor = await scoped_accessor.for_plane(
            plane_id=plane_id,
            integration_key=plane.issued_to_integration_key,
        )
    except scoped_accessor.PlaneScopeViolation as exc:
        return _governed(MemoryGovernedRefusal(
            "plane_scope_invalid", detail=str(exc)
        ))
    trace_id = f"trace-{plane_id}"
    actor = identity.user_id or identity.email or "memory-service"
    try:
        updated = await publication.attempt_publication(
            accessor=accessor,
            contribution_id=body.contribution_id,
            actor=actor,
            trace_id=trace_id,
            quality_score=body.quality_score,
        )
    except MemoryGovernedRefusal as exc:
        return _governed(exc)
    return {"published_contribution": updated}


@router.post("/planes/{plane_id}/revoke")
async def post_revoke(
    plane_id: str,
    body: RevokeRequest,
    request: Request,
):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        return _governed(MemoryGovernedRefusal("plane_not_found",
                                               detail=f"Plane {plane_id!r} not found."))
    scope_deny = _authorize_plane_access(plane=plane, identity=identity)
    if scope_deny is not None:
        return scope_deny
    trace_id = f"trace-{plane_id}"
    revoked_by = identity.user_id or identity.email or "memory-service"
    try:
        result = await revocation.revoke_plane(
            plane_id=plane_id,
            revoked_by=revoked_by,
            reason=body.reason,
            trace_id=trace_id,
        )
    except MemoryGovernedRefusal as exc:
        return _governed(exc)
    return result


@router.get("/planes/{plane_id}/working_set")
async def get_working_set(plane_id: str, request: Request):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        return _governed(MemoryGovernedRefusal("plane_not_found",
                                               detail=f"Plane {plane_id!r} not found."))
    scope_deny = _authorize_plane_access(plane=plane, identity=identity)
    if scope_deny is not None:
        return scope_deny
    try:
        accessor = await scoped_accessor.for_plane(
            plane_id=plane_id,
            integration_key=plane.issued_to_integration_key,
        )
    except scoped_accessor.PlaneScopeViolation as exc:
        return _governed(MemoryGovernedRefusal(
            "plane_scope_invalid", detail=str(exc)
        ))
    try:
        entries = await accessor.list_working_set()
    except scoped_accessor.PlaneRevoked as exc:
        return _governed(MemoryGovernedRefusal("plane_revoked", detail=str(exc)))
    return {"plane_id": plane_id, "entries": entries}


@router.get("/planes/{plane_id}/retrieval_scope")
async def get_retrieval_scope(plane_id: str, request: Request):
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is None:
        return _governed(MemoryGovernedRefusal("plane_not_found",
                                               detail=f"Plane {plane_id!r} not found."))
    scope_deny = _authorize_plane_access(plane=plane, identity=identity)
    if scope_deny is not None:
        return scope_deny
    if plane.state == "revoked":
        return _governed(MemoryGovernedRefusal(
            "plane_revoked",
            detail=f"Plane {plane_id!r} was revoked at {plane.revoked_at!r}.",
        ))
    return {"plane_id": plane_id, "retrieval_scope": plane.retrieval_scope}


@router.get("/planes/{plane_id}/reconstructed_state")
async def get_reconstructed_state(plane_id: str, request: Request):
    """Ledger-reconstructible plane state (M-G8 · audit surface).

    Reads Northena append-only ledger; no writes. Cross-key callers still
    subject to _authorize_plane_access if the plane doc exists.
    """
    identity, deny = await _require_memory_authority(request)
    if deny is not None:
        return deny
    plane = await plane_registry.get_plane(plane_id)
    if plane is not None:
        scope_deny = _authorize_plane_access(plane=plane, identity=identity)
        if scope_deny is not None:
            return scope_deny
    state = await ledger_reconstructor.rebuild_state(plane_id)
    if state is None:
        return _governed(MemoryGovernedRefusal(
            "plane_not_found",
            detail=f"No ledger rows for plane {plane_id!r}.",
        ))
    return state
