"""/api/use_data/* · Canon §6 conversational wizard + Commission verdict.

Routes:
    POST   /api/use_data/session               open wizard session
    GET    /api/use_data/session/{session_id}  read session envelope
    POST   /api/use_data/session/{session_id}/turn     append dialogue turn
    POST   /api/use_data/session/{session_id}/reflection  set/open/assumed field
    POST   /api/use_data/session/{session_id}/plan        plan preview values
    POST   /api/use_data/session/{session_id}/commit      commit → CommissionVerdict
    GET    /api/use_data/ceiling                       read effective auto-run ceiling
    POST   /api/use_data/ceiling                       REFUSED · Change-a-Rule only

Session state is held in-memory for UI-1-A; persistence is a UI-1-B fold.

Design law:
    * Every governed value confirmed on the Commission card at commit time —
      never silently taken from dialogue (gate_card_commits_no_silent_dialogue_values).
    * Auto-run ceiling change-only via Change-a-Rule (Canon §4.2 · §7.5) —
      the ceiling read is fixed at AUTO_RUN_CEILING_USD_INITIAL here; direct-write
      to /api/use_data/ceiling is REFUSED.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from contracts.use_data_wizard_session import (
    CommissionCard,
    DialogueTurn,
    DialogueTurnRole,
    Door,
    FieldState,
    PlanPreviewCard,
    ReflectionCard,
    ReflectionField,
    UseDataWizardSession,
)
from services.auth.dependencies import require_identity_or_deny
from services.auth.identity import Identity
from services.use_data.commission_verdict_engine import (
    AUTO_RUN_CEILING_USD_INITIAL,
    compose_verdict,
    evaluate_auto_run_ceiling,
    run_five_checks,
)


router = APIRouter(prefix="/use_data", tags=["use_data"])


# In-memory session store (UI-1-A scope · durability lands in UI-1-B).
_SESSIONS: Dict[str, UseDataWizardSession] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


async def _resolve_identity(request: Request):
    """Return (identity, None) on permit, (None, JSONResponse) on deny."""
    result = await require_identity_or_deny(request)
    if isinstance(result, JSONResponse):
        return None, result
    return result, None


def _forbid_other_operator(session: UseDataWizardSession, identity: Identity) -> Optional[JSONResponse]:
    if session.operator_id != identity.user_id:
        return JSONResponse(
            status_code=403,
            content={
                "reason": "auth_scope_insufficient",
                "detail": "Session belongs to a different operator.",
            },
        )
    return None


class OpenSessionBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    door: Door


@router.post("/session")
async def open_session(body: OpenSessionBody, request: Request):
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    session = UseDataWizardSession(
        session_id=_new_id("s"),
        operator_id=identity.user_id,
        opened_at_iso=_now_iso(),
        door=body.door,
    )
    _SESSIONS[session.session_id] = session
    return session


@router.get("/session/{session_id}")
async def get_session(session_id: str, request: Request):
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    session = _SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    forbidden = _forbid_other_operator(session, identity)
    if forbidden is not None:
        return forbidden
    return session


class AppendTurnBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    role: DialogueTurnRole
    text: str


@router.post("/session/{session_id}/turn")
async def append_turn(session_id: str, body: AppendTurnBody, request: Request):
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    session = _SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    forbidden = _forbid_other_operator(session, identity)
    if forbidden is not None:
        return forbidden
    turn = DialogueTurn(
        turn_id=_new_id("t"),
        role=body.role,
        text=body.text,
        ts_iso=_now_iso(),
    )
    session.dialogue.append(turn)
    return session


class ReflectionUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str
    label: str
    state: FieldState
    value: Optional[str] = None


@router.post("/session/{session_id}/reflection")
async def upsert_reflection_field(session_id: str, body: ReflectionUpdate, request: Request):
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    session = _SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    forbidden = _forbid_other_operator(session, identity)
    if forbidden is not None:
        return forbidden
    fields = [f for f in session.reflection.fields if f.name != body.name]
    fields.append(ReflectionField(
        name=body.name,
        label=body.label,
        state=body.state,
        value=body.value,
        committed_by_ref=None,  # commit sets this at Commission-card time.
    ))
    session.reflection = ReflectionCard(fields=fields)
    return session


class PlanPreviewBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    coverage_range_low_pct: Optional[float] = None
    coverage_range_high_pct: Optional[float] = None
    cost_low_usd: Optional[float] = None
    cost_high_usd: Optional[float] = None
    ceiling_usd: Optional[float] = None


@router.post("/session/{session_id}/plan")
async def set_plan(session_id: str, body: PlanPreviewBody, request: Request):
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    session = _SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    forbidden = _forbid_other_operator(session, identity)
    if forbidden is not None:
        return forbidden
    session.plan_preview = PlanPreviewCard(
        coverage_range_low_pct=body.coverage_range_low_pct,
        coverage_range_high_pct=body.coverage_range_high_pct,
        cost_low_usd=body.cost_low_usd,
        cost_high_usd=body.cost_high_usd,
        ceiling_usd=body.ceiling_usd,
    )
    return session


class CommitBody(BaseModel):
    """Every governed value confirmed EXPLICITLY on the Commission card.

    Canon §6.4 requires these are not read from dialogue — they are the
    operator's confirmed values at commit time.
    """

    model_config = ConfigDict(extra="forbid")
    rights_declared: Optional[str] = None
    training_rights_inheritable: bool = False
    privacy_floor_declared: Optional[str] = None
    pii_posture_declared: Optional[str] = None
    class_d_resolvable: bool = True
    proposed_budget_usd: Optional[float] = None
    org_budget_ceiling_usd: Optional[float] = None
    scope_source_ids: List[str] = Field(default_factory=list)
    connected_source_ids: List[str] = Field(default_factory=list)
    censused_source_ids: List[str] = Field(default_factory=list)
    values_confirmed: List[str] = Field(default_factory=list)


@router.post("/session/{session_id}/commit")
async def commit_commission(session_id: str, body: CommitBody, request: Request):
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    session = _SESSIONS.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="session not found")
    forbidden = _forbid_other_operator(session, identity)
    if forbidden is not None:
        return forbidden

    checks = run_five_checks(
        rights_declared=body.rights_declared,
        training_rights_inheritable=body.training_rights_inheritable,
        privacy_floor_declared=body.privacy_floor_declared,
        pii_posture_declared=body.pii_posture_declared,
        class_d_resolvable=body.class_d_resolvable,
        proposed_budget_usd=body.proposed_budget_usd,
        org_budget_ceiling_usd=body.org_budget_ceiling_usd,
        scope_source_ids=body.scope_source_ids,
        connected_source_ids=body.connected_source_ids,
        censused_source_ids=body.censused_source_ids,
    )
    proposed_spend = body.proposed_budget_usd or 0.0
    ceiling = evaluate_auto_run_ceiling(proposed_spend_usd=proposed_spend)
    verdict = compose_verdict(
        session_id=session_id,
        checks=checks,
        auto_run_ceiling=ceiling,
    )
    session.commission = CommissionCard(
        door=session.door,
        values_confirmed=body.values_confirmed,
        committed_at_iso=_now_iso(),
        verdict_ref=verdict.trust_receipt_ref,
    )
    return {"session": session.model_dump(), "verdict": verdict.model_dump()}


class CeilingWriteBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ceiling_usd: float


@router.post("/ceiling")
async def refuse_direct_ceiling_write(body: CeilingWriteBody, request: Request):
    """Canon §4.2 · §7.5 — auto-run ceiling changeable only via Change-a-Rule.

    Direct-write refused. Refusal envelope carries `outcome=refused`
    (governed refusal, escalatable) with the required change-a-rule route.
    """
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    return JSONResponse(
        status_code=422,
        content={
            "outcome": "refused",
            "reason": "auto_run_ceiling_change_a_rule_only",
            "detail": (
                "The auto-run ceiling changes only via the Change-a-Rule ceremony "
                "(Canon §7.5). Direct write to /api/use_data/ceiling is refused."
            ),
            "route_to_approval": "Open Govern · Change a rule",
        },
    )


@router.get("/ceiling")
async def read_ceiling(request: Request):
    """Read the effective auto-run ceiling (Canon §4.2 initial $1,000)."""
    identity, denial = await _resolve_identity(request)
    if denial is not None:
        return denial
    return {
        "ceiling_usd": AUTO_RUN_CEILING_USD_INITIAL,
        "currency": "USD",
        "change_path": "change_a_rule_ceremony_only",
        "canon_ref": "Canon §4.2 · §7.5",
    }
