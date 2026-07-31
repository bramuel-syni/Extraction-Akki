"""Wizard operator router — Phase 7 Stage B-1 (v3 §3.3 operator variant).

Endpoints:
  * POST /api/wizard/operator/session
      Initiate a fresh operator wizard session; returns
      `{session_id, trace_id, initiated_at}`.
  * POST /api/wizard/operator/{session_id}/turn
      Advance the state machine by one agent turn (Guard 3 fires:
      feasibility snapshot recorded). Body may carry the operator's
      response to the previous turn (`turn_ref`, `user_content`,
      optional `field`, `value`).
  * POST /api/wizard/operator/{session_id}/agent-assumption
      Record an agent-inferred value at preference tier (Guard 2:
      mint an AgentAssumption + paired CommittedValue with
      source="agent_assumed"). B-1 seldom emits this from the stub
      agent; kept as the mechanical entry for tests.
  * POST /api/wizard/operator/{session_id}/commit-review
      Render the marked-draft view (you_supplied / agent_assumed_items);
      Guard 1 pre-flight + provenance-preservation refusal returned as
      a bounded list of violations if any.
  * POST /api/wizard/operator/{session_id}/freeze
      Freeze the session — Guard 1/2/3 fire structurally. Returns
      frozen WizardCommitState_v0 body OR 422 with violations list.
      Writes wizard_freeze ledger row via `turn_ledger.record_wizard_freeze`.
  * GET  /api/wizard/operator/{session_id}
      Read-only snapshot (mid-session working state OR frozen state).

Constraints (LOAD-BEARING at B-1):
  * Uses `DeterministicStubAgent` — NO LLM at B-1.
  * Feasibility grounding via `services/mtafiti/floor_feasibility` (Ruling 4).
  * On freeze, `turn_ledger.record_wizard_freeze` is invoked — the
    stamp_audit sidecar carries `data_class="wizard_transcript"` per
    Owner E5 ruling; gate
    `test_turn_ledger_stamp_audit_sidecar_carries_wizard_transcript_data_class`
    protects the marker.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
import httpx
from httpx import ASGITransport

from contracts.wizard_commit_state import WizardCommitState_v0
from services.auth import auth_refusal, session_binding
from services.auth.dependencies import get_current_identity_or_none
from services.service_1.license_class_selection import derive_license_class
from services.wizard import (
    admission_handoff,
    operator_state_machine as osm,
    session_persistence,
    turn_ledger,
)
from services.wizard.agent_interface import DeterministicStubAgent
from services.wizard.source_tagging import SourceTagViolation


router = APIRouter(prefix="/wizard/operator", tags=["wizard-operator"])


async def _check_session_ownership_or_deny(session_id: str, request: Request):
    """Phase 8 Stage B-2 — session-ownership enforcement (Owner E2 ratified).

    Wired across ALL POST /{sid}/* and GET /{sid} operator endpoints.

    Semantics:
      * Session grandfathered (no binding on disk) → permit (pre-B-1 sessions).
      * Session bound + caller identity matches → permit.
      * Session bound + caller anonymous OR different identity → 403 with
        `{reason: "auth_identity_mismatch_for_wizard_session", detail: ...}`.

    Returns None (permit) OR a JSONResponse (deny). Caller short-circuits on
    deny per the router's E2-compliant return-fast pattern.
    """
    identity = await get_current_identity_or_none(request)
    caller_uid = identity.user_id if identity is not None else None
    if not await session_binding.check_binding(session_id, caller_uid):
        return auth_refusal.emit("auth_identity_mismatch_for_wizard_session")
    return None


# In-memory session cache — B-1 keeps working state in-process; Mongo
# holds the frozen snapshots and any mid-session persistence. B-2 will
# lift the cache into a request-scoped read from Mongo when the LLM
# integration lands and the state needs to survive worker restarts.
_SESSIONS: Dict[str, osm.OperatorSession] = {}


def _new_stub_agent() -> DeterministicStubAgent:
    """Agent-pluggable-with-stub-agent-first (Owner ruling, Phase 7 Stage A close):
    B-1 mounts the stub; B-2 will swap in the LLM-backed agent behind the
    same `WizardAgent` Protocol interface without state-machine changes.
    """
    return DeterministicStubAgent()


def _get_session_or_404(session_id: str) -> osm.OperatorSession:
    session = _SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"session_id={session_id!r} not found")
    return session


@router.post("/session")
async def post_session(request: Request):
    """Initiate a fresh operator wizard session.

    Phase 8 Stage B-2: if the caller carries a valid Bearer token, the new
    session is BOUND to the caller's identity in
    `services/auth/session_binding.py` (sidecar table). Subsequent operations
    on this session_id require the same caller identity — mismatch → 403
    `auth_identity_mismatch_for_wizard_session`. Anonymous callers create
    grandfathered sessions (no binding).
    """
    session = osm.new_operator_session()
    _SESSIONS[session.session_id] = session
    # Persist an initial snapshot to Mongo (mid-session, committed_at=None).
    snapshot = osm._to_frozen_commit_state(session, committed_at=None)
    await session_persistence.upsert_session(snapshot)
    # Phase 8 B-2: bind session to caller identity if authenticated.
    identity = await get_current_identity_or_none(request)
    if identity is not None:
        await session_binding.bind_session_to_identity(
            session.session_id, identity.user_id,
        )
    return JSONResponse(
        status_code=201,
        content={
            "session_id": session.session_id,
            "trace_id": session.trace_id,
            "initiated_at": session.initiated_at,
            "variant": "operator",
        },
    )


@router.post("/{session_id}/turn")
async def post_turn(session_id: str, request: Request):
    """Advance the state machine by one agent turn OR record an operator
    response to the previous turn.

    Body shape (all fields optional):
      * `turn_ref`: uuid of the turn being answered by the operator.
      * `user_content`: operator's free-text reply.
      * `field`: dotted-path field being supplied (e.g. "output.grain").
      * `value`: value being supplied for that field.

    If a `turn_ref` is provided → operator response is recorded first
    (Guard 1: paired CommittedValue with source="operator_supplied"),
    then the agent advances one turn. If no `turn_ref` → agent advances
    one turn immediately (first turn or reply-less advance).
    """
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    session = _get_session_or_404(session_id)
    body: Dict[str, Any] = await request.json() if await _has_body(request) else {}

    turn_ref: Optional[str] = body.get("turn_ref")
    user_content: str = body.get("user_content", "") or ""
    field_supplied: Optional[str] = body.get("field")
    value_supplied: Any = body.get("value")

    if turn_ref:
        osm.record_operator_response(
            session=session, turn_ref=turn_ref,
            user_content=user_content,
            field_supplied=field_supplied,
            value_supplied=value_supplied,
        )
    agent = _new_stub_agent()
    turn = osm.next_agent_turn(session, agent)
    # Persist mid-session snapshot.
    snapshot = osm._to_frozen_commit_state(session, committed_at=None)
    await session_persistence.upsert_session(snapshot)
    return {
        "session_id": session.session_id,
        "turn_ref": turn.turn_ref,
        "at": turn.at,
        "agent_content": turn.agent_content,
        "feasibility_snapshot_ref": turn.feasibility_snapshot_ref,
    }


@router.post("/{session_id}/agent-assumption")
async def post_agent_assumption(session_id: str, request: Request):
    """Guard 2 seam — record an agent-inferred value at preference tier.

    B-1 keeps this endpoint mechanically callable so the invariant gates
    can prove Guard 2 discipline against the stub agent's outputs.
    Buyer variant (B-2) will exercise this path more heavily via
    live-quote recommendations.

    Body: `{field: str, inferred_value: Any, evidence_ref: str = ""}`.
    """
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    session = _get_session_or_404(session_id)
    body = await request.json()
    field_name: str = body["field"]
    inferred_value: Any = body["inferred_value"]
    evidence_ref: str = body.get("evidence_ref", "")
    try:
        assumption = osm.record_agent_assumption(
            session=session, field_name=field_name,
            inferred_value=inferred_value, evidence_ref=evidence_ref,
            variant="operator",
        )
    except SourceTagViolation as exc:
        # Owner Condition A(i) landing (Phase 7 Stage B-2 dispatch, 2026-07-04):
        # mandatory-tier refusal on operator variant surfaces as 422.
        return JSONResponse(
            status_code=422,
            content={"violations": [str(exc)], "refused": True},
        )
    snapshot = osm._to_frozen_commit_state(session, committed_at=None)
    await session_persistence.upsert_session(snapshot)
    return {
        "assumption_id": assumption.assumption_id,
        "field": assumption.field,
        "at": assumption.at,
    }


@router.post("/{session_id}/commit-review")
async def post_commit_review(session_id: str, request: Request):
    """Paint the marked-draft view + Guard 1 pre-flight + provenance
    refusal enumeration + license_class_drift (B-3).

    B-3 extension: `license_class_drift: {committed: str, derived: str} | null`.
    Soft signal — NOT a hard refusal.

    Response body:
      * `you_supplied`: [{field, value}, ...]
      * `agent_assumed_items`: [{field, value}, ...]
      * `violations`: [str, ...] — empty iff ready to freeze.
      * `license_class_drift`: {committed, derived} | null.
    """
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    session = _get_session_or_404(session_id)
    agent = _new_stub_agent()
    snapshot = osm._to_frozen_commit_state(session, committed_at=None)
    review = agent.commit_review(snapshot)
    violations = osm.preflight_freeze(session)
    license_class_drift = _compute_license_class_drift(session, snapshot)
    return {
        "session_id": session.session_id,
        "you_supplied": review.you_supplied,
        "agent_assumed_items": review.agent_assumed_items,
        "violations": violations,
        "license_class_drift": license_class_drift,
        "ready_to_freeze": not violations,
    }


def _compute_license_class_drift(
    session: osm.OperatorSession,
    snapshot: WizardCommitState_v0,
):
    """Compute soft license_class_drift signal for operator variant.

    Same semantics as the buyer router version — see docstring on
    `routers/wizard_buyer.py::_compute_license_class_drift`. Returns
    None when no committed class OR when derived matches committed.
    """
    if session.license_class is None:
        return None
    from services.wizard.operator_state_machine import _iso_now
    committed_snapshot = snapshot.model_copy(update={"committed_at": _iso_now()})
    envelope_shim = _envelope_shim_from_session(session)
    derived = derive_license_class(envelope_shim, wizard_state=committed_snapshot)
    if derived == session.license_class:
        return None
    return {"committed": session.license_class, "derived": derived}


def _envelope_shim_from_session(session: osm.OperatorSession):
    from contracts.objective_request_v2 import Envelope
    return Envelope(
        lawful_basis=_extract_field_str(session, "envelope.lawful_basis", "legitimate_interest"),
        done_condition=_extract_field_str(session, "envelope.done_condition", "standing_floor"),
        budget=_extract_field_str(session, "envelope.budget", "default"),
        scope_ceiling=_extract_field_str(session, "envelope.scope_ceiling", "estate"),
        availability_snapshot={},
        floor_feasibility={},
        commissioner=f"wizard-operator-{session.session_id}",
        committed_at=session.initiated_at,
    )


def _extract_field_str(session: osm.OperatorSession, name: str, default: str) -> str:
    cv = session.committed_values.get(name)
    if cv is None or cv.value is None:
        return default
    return str(cv.value)


@router.post("/{session_id}/freeze")
async def post_freeze(session_id: str, request: Request):
    """Freeze the session — Guard 1/2 fire structurally on the
    WizardCommitState_v0 model_validator. Guard 3 already enforced
    per-turn via feasibility_snapshot_ref.

    Body (optional): `{license_class: str, lawful_basis_ref: str}`.
    B-1 does NOT mint an ObjectiveRequest_v2 — that lands at B-3 admission
    handoff. B-1 freezes the state and writes the wizard_freeze ledger
    row (with `data_class="wizard_transcript"` marker per Owner E5).
    """
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    session = _get_session_or_404(session_id)
    body: Dict[str, Any] = await request.json() if await _has_body(request) else {}
    license_class: Optional[str] = body.get("license_class")
    lawful_basis_ref: str = body.get("lawful_basis_ref", "wizard-lawful-basis-unset")

    if license_class is not None:
        session.license_class = license_class

    # Pre-flight — return violations without raising.
    violations = osm.preflight_freeze(session)
    if violations:
        return JSONResponse(
            status_code=422,
            content={"violations": violations, "ready_to_freeze": False},
        )
    # Phase 3 sub-cycle 1 gate (FB-4 · FB-18 gate_commit_requires_agreed_milestones):
    # the commission does not open until the milestone list is agreed.
    # Owner ruling 2026-08-01 Ruling 4 refusal-shape discipline: return a
    # GOVERNED REFUSAL envelope (outcome=refused), not a validation error.
    from services.wizard import milestones as milestones_service
    ml = await milestones_service.get_milestone_list(session_id)
    if not ml.agreed:
        return JSONResponse(
            status_code=422,
            content={
                "outcome": "refused",
                "reason": "milestones_not_agreed",
                "detail": (
                    "The milestone list is not yet agreed. The commission does "
                    "not open until the milestones (each carrying a done-condition "
                    "and an owner) are agreed by the operator."
                ),
                "milestones": [m.model_dump(mode="json") for m in ml.milestones],
            },
        )
    try:
        frozen = osm.freeze(session, frozen_objective_ref=None)
    except Exception as exc:  # pydantic ValidationError etc.
        return JSONResponse(
            status_code=422,
            content={"violations": [str(exc)], "ready_to_freeze": False},
        )
    # Persist frozen snapshot + wizard_freeze ledger row.
    await session_persistence.upsert_session(frozen)
    ledger_run_id = await turn_ledger.record_wizard_freeze(
        frozen, lawful_basis_ref=lawful_basis_ref,
    )
    # Clear the in-memory working session — it's now immutable on disk.
    _SESSIONS.pop(session.session_id, None)
    return {
        "session_id": frozen.session_id,
        "committed_at": frozen.committed_at,
        "trace_id": frozen.trace_id,
        "license_class": frozen.license_class,
        "ledger_run_id": ledger_run_id,
        "frozen_state": frozen.model_dump(mode="json"),
    }


@router.get("/{session_id}")
async def get_session(session_id: str, request: Request):
    """Read-only snapshot — Mongo is authoritative post-freeze."""
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    doc = await session_persistence.load_session(session_id)
    if doc is None:
        # Not persisted yet; check in-memory working state.
        session = _SESSIONS.get(session_id)
        if session is None:
            raise HTTPException(status_code=404, detail=f"session_id={session_id!r} not found")
        snapshot = osm._to_frozen_commit_state(session, committed_at=None)
        return snapshot.model_dump(mode="json")
    doc.pop("_id", None)
    return doc


@router.post("/{session_id}/handoff")
async def post_handoff(session_id: str, request: Request):
    """B-3 admission handoff — mint `ObjectiveRequest_v2` from the frozen
    wizard state and hand off to `POST /api/objectives`.

    See `routers/wizard_buyer.py::post_handoff` docstring — the operator
    variant mirrors the same semantics, but operator has no proposals
    (empty list passed to the composer).
    """
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    doc = await session_persistence.load_session(session_id)
    if doc is None:
        in_mem = _SESSIONS.get(session_id)
        if in_mem is None:
            raise HTTPException(status_code=404, detail=f"session_id={session_id!r} not found")
        return JSONResponse(
            status_code=422,
            content={
                "reason": "wizard_not_frozen",
                "detail": "handoff requires a frozen wizard session; call POST /freeze first.",
            },
        )
    doc.pop("_id", None)
    frozen_state = WizardCommitState_v0.model_validate(doc)
    if frozen_state.committed_at is None:
        return JSONResponse(
            status_code=422,
            content={
                "reason": "wizard_not_frozen",
                "detail": "handoff requires a frozen wizard session; call POST /freeze first.",
            },
        )
    obj_req = admission_handoff.compose_objective_request_from_frozen_state_with_proposals(
        frozen_state, [],  # operator has no proposals
    )
    from server import app as _fastapi_app
    payload = obj_req.model_dump(mode="json")
    async with httpx.AsyncClient(
        transport=ASGITransport(app=_fastapi_app),
        base_url="http://wizard-handoff-internal",
    ) as client:
        resp = await client.post("/api/objectives", json=payload)
    if resp.status_code == 202:
        body = resp.json()
        objective_id = body.get("objective_id")
        if objective_id and frozen_state.frozen_objective_ref != objective_id:
            updated = frozen_state.model_copy(update={"frozen_objective_ref": objective_id})
            await session_persistence.upsert_session(updated)
    return JSONResponse(status_code=resp.status_code, content=resp.json())


async def _has_body(request: Request) -> bool:
    """Best-effort body-presence check; POSTs with no JSON body should
    not error on `await request.json()`."""
    body_bytes = await request.body()
    return bool(body_bytes and body_bytes.strip())



# ============================================================================
# Phase 3 sub-cycle 1 — FB-4 milestone-list endpoints
# ============================================================================


@router.get("/{session_id}/milestones")
async def get_milestones(session_id: str, request: Request):
    """Return the milestone list for a session (empty non-agreed if not
    yet proposed). Owner ruling 2026-08-01 · FB-4."""
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    from services.wizard import milestones as milestones_service
    ml = await milestones_service.get_milestone_list(session_id)
    return ml.model_dump(mode="json")


@router.post("/{session_id}/milestones")
async def post_milestones(session_id: str, request: Request):
    """Propose a milestone list for a session. Every propose resets the
    agreed flag — operator must re-agree deliberately (Ruling 4 anti-
    laundering pattern applied to the milestones seam).

    Body: `{milestones: [{description, done_condition, owner, order_index?, status?}, ...]}`.
    """
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    body = await request.json() if await _has_body(request) else {}
    payload = body.get("milestones") or []
    for m in payload:
        for required in ("description", "done_condition", "owner"):
            if not m.get(required):
                return JSONResponse(
                    status_code=400,
                    content={
                        "reason": "malformed_payload",
                        "detail": f"Milestone missing required field {required!r}.",
                    },
                )
    from services.wizard import milestones as milestones_service
    ml = await milestones_service.propose_milestones(
        session_id=session_id, milestones_payload=payload,
    )
    return ml.model_dump(mode="json")


@router.post("/{session_id}/milestones/agree")
async def post_milestones_agree(session_id: str, request: Request):
    """Mark the milestone list as agreed. Refuses with governed refusal
    envelope if the list is empty or a milestone is missing a mandatory
    field."""
    denied = await _check_session_ownership_or_deny(session_id, request)
    if denied is not None:
        return denied
    body = await request.json() if await _has_body(request) else {}
    agreed_by = body.get("agreed_by") or "operator"
    from services.wizard import milestones as milestones_service
    try:
        ml = await milestones_service.agree_milestones(
            session_id=session_id, agreed_by=agreed_by,
        )
    except ValueError as exc:
        reason, _, _ = str(exc).partition(":")
        return JSONResponse(
            status_code=422,
            content={
                "outcome": "refused",
                "reason": reason,
                "detail": str(exc),
            },
        )
    return ml.model_dump(mode="json")
