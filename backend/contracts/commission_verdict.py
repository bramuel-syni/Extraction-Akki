"""CommissionVerdict@v0 — the five-check verdict envelope.

Canon: `docs/mandates/AKKI_OS_EXPERIENCE_CANON_v1.md` §6.4 (five checks + three
outcomes) · §1.3 (refusal grammar: escalatable vs absolute) · §4.2 (auto-run
ceiling: at/under → auto-run when rule-clean; above → single DPO countersign;
change-only via Change-a-Rule).

Sealed at UI-1-A (2026-07-31) · parity 35→36 · D4b freeze arguments in the
Stage A `docs/stage_a_proposals/ui_1_stage_a_experience_canon_v1_2026-07-31.md`
§3.

Freeze contract: this Pydantic model's `model_json_schema()` is snapshotted
to `tests/invariants/commission_verdict.contract_snapshot.json`.
"""
from __future__ import annotations

from enum import Enum
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class VerdictOutcome(str, Enum):
    """Canon §6.4 — three receipted outcomes.

    * runs_now      — every check passed; run auto-starts and the receipt
                      names the trust-receipt id.
    * refused       — a check failed with a refusal envelope (see
                      `refusal`); may be escalatable or absolute.
    * held_for_check — a check requires DPO countersign; the item enters
                      the Pending policy check queue. Reason plain.
    """

    RUNS_NOW = "runs_now"
    REFUSED = "refused"
    HELD_FOR_CHECK = "held_for_check"


class CheckName(str, Enum):
    """Canon §6.4 — the five commission checks."""

    RIGHTS_COMPATIBILITY = "rights_compatibility"
    PRIVACY_FLOOR = "privacy_floor"
    PII_POSTURE = "pii_posture"
    BUDGET_CEILING = "budget_ceiling"
    SCOPE_RESOLVABILITY = "scope_resolvability"


class CheckStatus(str, Enum):
    """Per-check outcome cell."""

    PASSED = "passed"
    FAILED = "failed"
    HELD = "held"


class CheckResult(BaseModel):
    """One per-check row on the verdict.

    Every referenced value renders in plain language on the Commission card
    (Canon §6.4).
    """

    model_config = ConfigDict(extra="forbid")

    check: CheckName
    status: CheckStatus
    plain_language_summary: str = Field(
        ...,
        description="One-line plain-language explanation of the result.",
    )
    detail: Optional[str] = Field(
        default=None,
        description="Longer narrative when helpful (e.g. named source lacking rights).",
    )


class RefusalKind(str, Enum):
    """Canon §1.3 — two refusal shapes distinguished in the envelope.

    * escalatable — refusal names the criterion + value + route. UI may
                    offer 'Escalate for review' as an affordance.
    * absolute    — refusal names the bar + source. UI renders NO
                    approval affordance of any kind.
    """

    ESCALATABLE = "escalatable"
    ABSOLUTE = "absolute"


class RefusalDetail(BaseModel):
    """Canon §1.3 refusal grammar.

    Present iff outcome==refused. Absent iff outcome==runs_now.
    On held_for_check, present as a policy-check reason with kind==escalatable.
    """

    model_config = ConfigDict(extra="forbid")

    kind: RefusalKind
    reason_code: str = Field(
        ...,
        description="Machine-stable reason code (versioned reason set).",
    )
    criterion: str = Field(
        ...,
        description="The named criterion that was breached (plain language).",
    )
    value: Optional[str] = Field(
        default=None,
        description=(
            "The value that crossed the criterion. Present on escalatable "
            "refusals; may be None on absolute where the bar itself is the "
            "point."
        ),
    )
    bar_source: Optional[str] = Field(
        default=None,
        description=(
            "Where the bar comes from (Canon section · rule id · rights source). "
            "Present on absolute refusals to name the source; may be None on "
            "escalatable where the criterion+value tell the story."
        ),
    )
    route_to_approval: Optional[str] = Field(
        default=None,
        description=(
            "Escalation route text. Present on escalatable. MUST be None on "
            "absolute (Canon §1.3: no approval affordance)."
        ),
    )


class AutoRunCeilingCheck(BaseModel):
    """Canon §4.2 auto-run ceiling — the seventh check embedded in verdict.

    Value at Owner ruling 2026-07-31 initial: $1,000 USD. Changeable ONLY
    via Change-a-Rule ceremony (Canon §7.5); direct-write refused server-side.
    """

    model_config = ConfigDict(extra="forbid")

    ceiling_usd: float = Field(
        ..., ge=0.0,
        description="Current effective ceiling. Read via the versioned rule store; direct-write refused.",
    )
    proposed_spend_usd: float = Field(
        ..., ge=0.0,
        description="This commission's ceiling read from the wizard's Plan preview.",
    )
    at_or_under: bool = Field(
        ...,
        description="True iff proposed_spend_usd ≤ ceiling_usd.",
    )
    dpo_countersign_required: bool = Field(
        ...,
        description=(
            "True iff proposed_spend_usd > ceiling_usd. Enters 'Pending policy check' "
            "requiring single DPO countersign. Cannot be bypassed."
        ),
    )


class CommissionVerdict(BaseModel):
    """Canon §6.4 — the verdict envelope stamped on Commission card commit.

    Every commission verdict is receipted; a trust receipt is issued and
    linked from the wizard session's Commission card (`verdict_ref`).

    Design law:
      * Fail-closed — a check whose status cannot be resolved MUST NOT
        default to `passed`.
      * Refusal grammar (§1.3): escalatable vs absolute distinguished in
        `refusal.kind`; frontend renders no approval affordance when
        kind==absolute.
      * Auto-run ceiling ($1,000 initial) is enforced server-side;
        direct-write refused per Change-a-Rule discipline.

    Freeze: `model_json_schema()` matches
    `tests/invariants/commission_verdict.contract_snapshot.json`
    byte-for-byte.
    """

    model_config = ConfigDict(extra="forbid")

    verdict_id: str = Field(..., description="Stable UUID for this verdict.")
    session_id: str = Field(
        ..., description="Wizard session that produced this verdict."
    )
    issued_at_iso: str = Field(
        ..., description="ISO-8601 UTC of verdict issuance."
    )
    outcome: VerdictOutcome
    checks: List[CheckResult] = Field(
        ...,
        description="Every one of the five checks with its status (fail-closed).",
    )
    auto_run_ceiling: AutoRunCeilingCheck = Field(
        ...,
        description="Canon §4.2 auto-run ceiling check embedded.",
    )
    refusal: Optional[RefusalDetail] = Field(
        default=None,
        description="Present iff outcome==refused. On held_for_check, present with kind==escalatable.",
    )
    trust_receipt_ref: str = Field(
        ...,
        description="Trust-receipt ID for this verdict (public, read-only).",
    )
    verbatim_carrier: Literal[
        "Every commission verdict lands in the record the DPO reads."
    ] = "Every commission verdict lands in the record the DPO reads."
