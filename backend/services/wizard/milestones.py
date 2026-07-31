"""Wizard milestone sidecar — Phase 3 sub-cycle 1 (Owner ruling 2026-08-01 · FB-4).

Milestones are agreed BEFORE freeze:
    "a proposed milestone list — the checklist of what must be done,
     in what order, for the commission to succeed — each milestone
     carrying a done-condition and an owner. The owner agrees the list
     at commission; the commission does not open until it is agreed;
     all reporting thereafter is against it."
     — Frontend Brief v2 FB-4 verbatim

Milestones live in a SIDECAR collection keyed by session_id so that
WizardCommitState_v0 (frozen contract, snapshot byte-identical) does
NOT gain new fields. The freeze gate (in routers/wizard_operator.py)
consults this sidecar and refuses freeze if the list is not agreed.

Later reporting (Commission View) reads this sidecar as one of the
"existing artifacts" per FB-18 gate_commission_view_reads_only_existing_artifacts.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from core import db


MILESTONES_COLLECTION = "wizard_session_milestones"


class Milestone(BaseModel):
    """A single milestone with description + done-condition + owner (all
    OPERATOR-supplied fields; agent-assumed values are NOT permitted here).

    NOTE: this is NOT a frozen contract — it is a milestone-record shape
    persisted in the sidecar collection. Owner ruling for freezing this
    would be a future D4b assessment.
    """
    model_config = ConfigDict(extra="forbid")

    milestone_id: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    done_condition: str = Field(..., min_length=1)
    owner: str = Field(..., min_length=1)
    order_index: int = Field(..., ge=0)
    status: str = Field(default="pending")  # pending · on_track · done · missed · behind


class MilestoneList(BaseModel):
    """Milestone list bound to a wizard session; carries the agreed flag."""
    model_config = ConfigDict(extra="forbid")

    session_id: str
    milestones: List[Milestone] = Field(default_factory=list)
    agreed: bool = Field(default=False)
    agreed_at: Optional[str] = None
    agreed_by: Optional[str] = None
    updated_at: str


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _mint_milestone_id() -> str:
    return f"ms-{uuid.uuid4().hex[:10]}"


async def get_milestone_list(session_id: str) -> MilestoneList:
    """Return the milestone list for a session; empty non-agreed list if
    none exists yet (safe read for the Commission View + freeze gate)."""
    doc = await db[MILESTONES_COLLECTION].find_one({"session_id": session_id})
    if doc is None:
        return MilestoneList(
            session_id=session_id, milestones=[], agreed=False,
            updated_at=_now_iso(),
        )
    doc.pop("_id", None)
    return MilestoneList.model_validate(doc)


async def propose_milestones(
    *, session_id: str, milestones_payload: List[dict],
) -> MilestoneList:
    """Propose a milestone list for a session. Resets `agreed=False` on
    every proposal (a new proposal supersedes prior agreement — the
    operator must re-agree deliberately)."""
    existing = await get_milestone_list(session_id)
    prior_ids = {m.milestone_id for m in existing.milestones}
    ms = []
    for i, m in enumerate(milestones_payload):
        mid = m.get("milestone_id") or _mint_milestone_id()
        # Preserve status if the milestone_id was already known.
        prior_status = None
        if mid in prior_ids:
            for prior in existing.milestones:
                if prior.milestone_id == mid:
                    prior_status = prior.status
                    break
        ms.append(Milestone(
            milestone_id=mid,
            description=m["description"],
            done_condition=m["done_condition"],
            owner=m["owner"],
            order_index=int(m.get("order_index", i)),
            status=prior_status or m.get("status", "pending"),
        ))
    ms.sort(key=lambda x: x.order_index)
    result = MilestoneList(
        session_id=session_id, milestones=ms, agreed=False,
        agreed_at=None, agreed_by=None, updated_at=_now_iso(),
    )
    await db[MILESTONES_COLLECTION].replace_one(
        {"session_id": session_id},
        {**result.model_dump(mode="json"), "_id": session_id},
        upsert=True,
    )
    return result


async def agree_milestones(*, session_id: str, agreed_by: str) -> MilestoneList:
    """Mark the milestone list as agreed. Refuses (raises ValueError) if
    the list is empty or all milestones lack done_condition/owner (the
    frontend enforces this on the wizard side; this is a defensive check
    at the backend seam)."""
    ml = await get_milestone_list(session_id)
    if not ml.milestones:
        raise ValueError("milestones_empty: cannot agree an empty list.")
    for m in ml.milestones:
        if not m.description or not m.done_condition or not m.owner:
            raise ValueError(
                f"milestones_incomplete: milestone {m.milestone_id} missing description/done_condition/owner."
            )
    now = _now_iso()
    await db[MILESTONES_COLLECTION].update_one(
        {"session_id": session_id},
        {"$set": {"agreed": True, "agreed_at": now, "agreed_by": agreed_by, "updated_at": now}},
    )
    ml.agreed = True
    ml.agreed_at = now
    ml.agreed_by = agreed_by
    ml.updated_at = now
    return ml
