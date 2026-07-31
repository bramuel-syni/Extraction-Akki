"""UseDataWizardSession@v0 — the conversational-wizard session envelope.

Canon: `docs/mandates/AKKI_OS_EXPERIENCE_CANON_v1.md` §6.2 · §6.3 (six cards) ·
§11.1 (the card commits · dialogue shapes, cards commit).

Sealed at UI-1-A (2026-07-31) · parity 34→35 · D4b freeze arguments in the
Stage A `docs/stage_a_proposals/ui_1_stage_a_experience_canon_v1_2026-07-31.md`
§3.

Freeze contract: this Pydantic model's `model_json_schema()` is snapshotted
to `tests/invariants/use_data_wizard_session.contract_snapshot.json`.
"""
from __future__ import annotations

from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class Door(str, Enum):
    """Canon §6.1 — three doors on the Use Data landing.

    Same conversational wizard behind each; door is intent seed only.
    """

    INTEGRATE_AN_APP = "integrate_an_app"
    EXPORT_OR_LICENSE = "export_or_license"
    TRAIN_A_MODEL = "train_a_model"


class FieldState(str, Enum):
    """Canon §6.3 Reflection card — three field states per governed value.

    `set`     — a user-said value confirmed on the Commission card.
    `open`    — never named yet; render "— open" (never a placeholder).
    `assumed` — agent-supplied; carries the amber "agent assumed" chip.
    """

    SET = "set"
    OPEN = "open"
    ASSUMED = "assumed"


class DialogueTurnRole(str, Enum):
    """A conversational turn's speaker.

    `user`   — the operator.
    `agent`  — the wizard agent (through the SyniSense Shield chokepoint).
    """

    USER = "user"
    AGENT = "agent"


class DialogueTurn(BaseModel):
    """One turn in the wizard conversation.

    Canon §6.3: dialogue is the shaping channel; the card commits. Turns
    are read-only after write; the card holds the committed state.
    """

    model_config = ConfigDict(extra="forbid")

    turn_id: str = Field(..., description="Stable UUID for the turn.")
    role: DialogueTurnRole
    text: str = Field(..., description="Turn body, plain-language.")
    ts_iso: str = Field(..., description="ISO-8601 UTC timestamp of the turn.")


class ReflectionField(BaseModel):
    """One governed value on the Reflection card.

    Canon §6.3 Reflection: "the objective as it stands now, fields marked
    set / open / assumed default". Every field carries its state.
    """

    model_config = ConfigDict(extra="forbid")

    name: str = Field(..., description="Field identifier (e.g. 'reach', 'floor', 'budget').")
    label: str = Field(..., description="Plain-language label rendered on the card.")
    state: FieldState
    value: Optional[str] = Field(
        default=None,
        description="Concrete value when state==set or state==assumed. None when state==open.",
    )
    committed_by_ref: Optional[str] = Field(
        default=None,
        description=(
            "turn_id of the DialogueTurn that committed this value on the Commission card. "
            "None while state==open. For assumed values, the turn that surfaced the assumption."
        ),
    )


class ReflectionCard(BaseModel):
    """Canon §6.3 Reflection card — always visible.

    Renders the objective as it stands. Fields declare state; no field
    silently commits from dialogue (gate_card_commits_no_silent_dialogue_values).
    """

    model_config = ConfigDict(extra="forbid")

    fields: List[ReflectionField] = Field(default_factory=list)


class IntelCard(BaseModel):
    """Canon §6.3 Intel card — what the shield's grounded turn returned.

    Names the source of every claim rendered in the conversation; unset
    when no grounded claim has landed yet.
    """

    model_config = ConfigDict(extra="forbid")

    grounded_claims: List[str] = Field(default_factory=list)
    unset: bool = Field(
        default=True,
        description="True when no grounded claim has been served yet.",
    )


class TestCard(BaseModel):
    """Canon §6.3 Test card — offer, not push.

    Sample-run governed by the objective's budget; result promotable to
    Reflection in one action (Canon §6.3 winning-config promote).
    """

    model_config = ConfigDict(extra="forbid")

    offered: bool = Field(default=False, description="Test invitation shown.")
    last_run_ref: Optional[str] = Field(
        default=None,
        description="Trust-receipt ref for the most recent sample run. None until first run.",
    )
    winning_config_promoted: bool = Field(
        default=False,
        description="True after operator promotes the winning config to Reflection.",
    )


class PlanPreviewCard(BaseModel):
    """Canon §6.3 Plan preview — ranges + editable ceiling with halt note.

    Renders capacity, coverage, and cost ranges. Ceiling is editable inline.
    """

    model_config = ConfigDict(extra="forbid")

    coverage_range_low_pct: Optional[float] = Field(
        default=None, ge=0.0, le=100.0,
        description="Lower bound of coverage estimate (percent).",
    )
    coverage_range_high_pct: Optional[float] = Field(
        default=None, ge=0.0, le=100.0,
        description="Upper bound of coverage estimate.",
    )
    cost_low_usd: Optional[float] = Field(default=None, ge=0.0)
    cost_high_usd: Optional[float] = Field(default=None, ge=0.0)
    ceiling_usd: Optional[float] = Field(
        default=None, ge=0.0,
        description="Operator-set ceiling for this objective's spend.",
    )
    halt_note_verbatim: Literal[
        "Halts at ceiling. A halted run resumes only after you raise it or narrow the objective."
    ] = "Halts at ceiling. A halted run resumes only after you raise it or narrow the objective."


class SampleResultsCard(BaseModel):
    """Canon §6.3 Sample results — the receipt of a completed test.

    Renders volume, class distribution, per-hour cost from an executed
    sample; grounded (trust-receipt ref stamped).
    """

    model_config = ConfigDict(extra="forbid")

    grounded_by_receipt_ref: Optional[str] = Field(
        default=None,
        description="Trust receipt ID of the sample run that grounds these numbers.",
    )
    units_found: Optional[int] = Field(default=None, ge=0)
    class_distribution: dict = Field(
        default_factory=dict,
        description="{defensibility_class: fraction_in_[0,1]}",
    )
    per_hour_cost_usd: Optional[float] = Field(default=None, ge=0.0)


class CommissionCard(BaseModel):
    """Canon §6.3 Commission card + Canon §6.4 verdict entry point.

    Every governed value confirmed explicitly here before commit. On
    commit, the card produces a CommissionVerdict (sibling contract).
    """

    model_config = ConfigDict(extra="forbid")

    door: Door = Field(..., description="Which door was entered.")
    values_confirmed: List[str] = Field(
        default_factory=list,
        description="Reflection field names that have been explicitly confirmed on this card.",
    )
    committed_at_iso: Optional[str] = Field(
        default=None,
        description="ISO-8601 UTC of the commit action. None until commit.",
    )
    verdict_ref: Optional[str] = Field(
        default=None,
        description="Trust-receipt ref for the CommissionVerdict issued on commit.",
    )


class UseDataWizardSession(BaseModel):
    """Canon §6.2 · §6.3 · §11.1 — the conversational wizard session envelope.

    Envelope carrying:
      * the door (entry intent),
      * the dialogue as an append-only turn list,
      * the six cards' state,
      * the session identity (session_id + operator_id).

    Design law:
      * Dialogue shapes; the card commits.
      * Every governed value on the Commission card was explicitly
        confirmed (not silently inferred from a turn).
      * Agent-said values carry `state="assumed"` (amber chip) on
        Reflection until the operator confirms.

    Freeze: `model_json_schema()` matches
    `tests/invariants/use_data_wizard_session.contract_snapshot.json`
    byte-for-byte.
    """

    model_config = ConfigDict(extra="forbid")

    session_id: str = Field(
        ..., description="Stable UUID for this wizard session."
    )
    operator_id: str = Field(
        ..., description="User id of the operator running the wizard."
    )
    opened_at_iso: str = Field(
        ..., description="ISO-8601 UTC of session open."
    )
    door: Door = Field(
        ..., description="Which of the three landing doors seeded this session."
    )
    dialogue: List[DialogueTurn] = Field(default_factory=list)
    reflection: ReflectionCard = Field(default_factory=ReflectionCard)
    intel: IntelCard = Field(default_factory=IntelCard)
    test: TestCard = Field(default_factory=TestCard)
    plan_preview: PlanPreviewCard = Field(default_factory=PlanPreviewCard)
    sample_results: SampleResultsCard = Field(default_factory=SampleResultsCard)
    commission: Optional[CommissionCard] = Field(
        default=None,
        description="None until the operator opens the Commission card.",
    )
