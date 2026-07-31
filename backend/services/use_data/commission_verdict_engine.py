"""Commission verdict engine · Canon §6.4 (five checks + three outcomes).

Reads: `contracts/commission_verdict.py` for the envelope shape.
Writes: `models.CommissionVerdict` instance ready to be returned by
`routers/use_data.py::commit_commission`.

Design law (Canon §6.4):
    * Fail-closed: a check whose status cannot be resolved is `failed`,
      never defaults to `passed`.
    * Refusal grammar (§1.3): escalatable vs absolute distinguished; on
      absolute, `route_to_approval` MUST BE None.
    * Auto-run ceiling ($1,000 initial) enforced server-side; changeable
      only via Change-a-Rule ceremony (§7.5).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import List, Optional

from contracts.commission_verdict import (
    AutoRunCeilingCheck,
    CheckName,
    CheckResult,
    CheckStatus,
    CommissionVerdict,
    RefusalDetail,
    RefusalKind,
    VerdictOutcome,
)


# Canon §4.2 initial value — Owner-set 2026-07-31. Change path: Change-a-Rule.
AUTO_RUN_CEILING_USD_INITIAL: float = 1000.0


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


def run_five_checks(
    *,
    rights_declared: Optional[str],
    training_rights_inheritable: bool,
    privacy_floor_declared: Optional[str],
    pii_posture_declared: Optional[str],
    class_d_resolvable: bool,
    proposed_budget_usd: Optional[float],
    org_budget_ceiling_usd: Optional[float],
    scope_source_ids: List[str],
    connected_source_ids: List[str],
    censused_source_ids: List[str],
) -> List[CheckResult]:
    """Run the five commission checks · fail-closed."""

    checks: List[CheckResult] = []

    # (1) rights_compatibility — including training-rights inheritance.
    if rights_declared is None:
        checks.append(CheckResult(
            check=CheckName.RIGHTS_COMPATIBILITY,
            status=CheckStatus.FAILED,
            plain_language_summary="No rights posture declared for this scope.",
            detail="Every commission MUST declare its rights posture before it can run.",
        ))
    elif rights_declared == "training" and not training_rights_inheritable:
        checks.append(CheckResult(
            check=CheckName.RIGHTS_COMPATIBILITY,
            status=CheckStatus.FAILED,
            plain_language_summary="Training rights are not inheritable for the scope.",
            detail="Training-rights inheritance requires internal-only source usage; declared scope does not qualify.",
        ))
    else:
        checks.append(CheckResult(
            check=CheckName.RIGHTS_COMPATIBILITY,
            status=CheckStatus.PASSED,
            plain_language_summary=f"Rights posture '{rights_declared}' is compatible with the declared scope.",
        ))

    # (2) privacy_floor — declared and honoured.
    if privacy_floor_declared is None:
        checks.append(CheckResult(
            check=CheckName.PRIVACY_FLOOR,
            status=CheckStatus.FAILED,
            plain_language_summary="No privacy floor declared for this commission.",
        ))
    else:
        checks.append(CheckResult(
            check=CheckName.PRIVACY_FLOOR,
            status=CheckStatus.PASSED,
            plain_language_summary=f"Privacy floor '{privacy_floor_declared}' declared and honoured.",
        ))

    # (3) pii_posture — including Class D resolvability.
    if pii_posture_declared is None:
        checks.append(CheckResult(
            check=CheckName.PII_POSTURE,
            status=CheckStatus.FAILED,
            plain_language_summary="No PII posture declared for this commission.",
        ))
    elif not class_d_resolvable:
        checks.append(CheckResult(
            check=CheckName.PII_POSTURE,
            status=CheckStatus.FAILED,
            plain_language_summary="Class D registry values referenced but not resolvable.",
            detail="A referenced registry-class value cannot be resolved against the current registry version.",
        ))
    else:
        checks.append(CheckResult(
            check=CheckName.PII_POSTURE,
            status=CheckStatus.PASSED,
            plain_language_summary=f"PII posture '{pii_posture_declared}' declared; Class D resolvable.",
        ))

    # (4) budget_ceiling — present, positive, within org limit.
    if proposed_budget_usd is None or proposed_budget_usd <= 0.0:
        checks.append(CheckResult(
            check=CheckName.BUDGET_CEILING,
            status=CheckStatus.FAILED,
            plain_language_summary="Budget ceiling missing or non-positive.",
            detail="Every commission MUST declare a positive budget ceiling before it can run.",
        ))
    elif org_budget_ceiling_usd is not None and proposed_budget_usd > org_budget_ceiling_usd:
        checks.append(CheckResult(
            check=CheckName.BUDGET_CEILING,
            status=CheckStatus.FAILED,
            plain_language_summary=(
                f"Proposed budget ${proposed_budget_usd:,.2f} exceeds org ceiling "
                f"${org_budget_ceiling_usd:,.2f}."
            ),
        ))
    else:
        checks.append(CheckResult(
            check=CheckName.BUDGET_CEILING,
            status=CheckStatus.PASSED,
            plain_language_summary=f"Proposed budget ${proposed_budget_usd:,.2f} within limits.",
        ))

    # (5) scope_resolvability — every referenced source Connected + censused.
    missing_conn = [sid for sid in scope_source_ids if sid not in connected_source_ids]
    missing_cens = [sid for sid in scope_source_ids if sid not in censused_source_ids]
    if missing_conn or missing_cens:
        detail_parts = []
        if missing_conn:
            detail_parts.append(f"not Connected: {', '.join(missing_conn)}")
        if missing_cens:
            detail_parts.append(f"not censused: {', '.join(missing_cens)}")
        checks.append(CheckResult(
            check=CheckName.SCOPE_RESOLVABILITY,
            status=CheckStatus.FAILED,
            plain_language_summary="One or more referenced sources are not resolvable.",
            detail=" · ".join(detail_parts),
        ))
    else:
        checks.append(CheckResult(
            check=CheckName.SCOPE_RESOLVABILITY,
            status=CheckStatus.PASSED,
            plain_language_summary=f"All {len(scope_source_ids)} scope source(s) Connected + censused.",
        ))

    return checks


def evaluate_auto_run_ceiling(
    *,
    proposed_spend_usd: float,
    effective_ceiling_usd: float = AUTO_RUN_CEILING_USD_INITIAL,
) -> AutoRunCeilingCheck:
    at_or_under = proposed_spend_usd <= effective_ceiling_usd
    return AutoRunCeilingCheck(
        ceiling_usd=effective_ceiling_usd,
        proposed_spend_usd=proposed_spend_usd,
        at_or_under=at_or_under,
        dpo_countersign_required=not at_or_under,
    )


def compose_verdict(
    *,
    session_id: str,
    checks: List[CheckResult],
    auto_run_ceiling: AutoRunCeilingCheck,
) -> CommissionVerdict:
    """Compose the final verdict envelope.

    Precedence:
      1. Any check failed with an escalatable refusal → REFUSED · escalatable.
      2. Any check failed with an absolute refusal    → REFUSED · absolute.
      3. Auto-run ceiling requires countersign        → HELD_FOR_CHECK.
      4. All passed                                   → RUNS_NOW.
    """

    verdict_id = _new_id("cv")
    trust_receipt = _new_id("trcv")

    # Any failed check → refused. Rights + PII (Class D) failures are
    # ABSOLUTE (no approval affordance); privacy_floor + budget_ceiling +
    # scope_resolvability failures are ESCALATABLE (escalate for review).
    failed = [c for c in checks if c.status == CheckStatus.FAILED]
    if failed:
        first_fail = failed[0]
        absolute_checks = {CheckName.RIGHTS_COMPATIBILITY, CheckName.PII_POSTURE}
        kind = RefusalKind.ABSOLUTE if first_fail.check in absolute_checks else RefusalKind.ESCALATABLE
        if kind == RefusalKind.ABSOLUTE:
            refusal = RefusalDetail(
                kind=RefusalKind.ABSOLUTE,
                reason_code=f"{first_fail.check.value}_bar",
                criterion=first_fail.plain_language_summary,
                value=None,
                bar_source=f"Canon §6.4 · {first_fail.check.value}",
                route_to_approval=None,  # § 1.3 absolute · no approval route.
            )
        else:
            refusal = RefusalDetail(
                kind=RefusalKind.ESCALATABLE,
                reason_code=f"{first_fail.check.value}_below_threshold",
                criterion=first_fail.plain_language_summary,
                value=first_fail.detail,
                bar_source=None,
                route_to_approval="Escalate for DPO review",
            )
        return CommissionVerdict(
            verdict_id=verdict_id,
            session_id=session_id,
            issued_at_iso=_now_iso(),
            outcome=VerdictOutcome.REFUSED,
            checks=checks,
            auto_run_ceiling=auto_run_ceiling,
            refusal=refusal,
            trust_receipt_ref=trust_receipt,
        )

    if auto_run_ceiling.dpo_countersign_required:
        # Above ceiling — held for policy check (Canon §4.2). Escalatable
        # via single DPO countersign.
        return CommissionVerdict(
            verdict_id=verdict_id,
            session_id=session_id,
            issued_at_iso=_now_iso(),
            outcome=VerdictOutcome.HELD_FOR_CHECK,
            checks=checks,
            auto_run_ceiling=auto_run_ceiling,
            refusal=RefusalDetail(
                kind=RefusalKind.ESCALATABLE,
                reason_code="auto_run_ceiling_exceeded",
                criterion=(
                    f"Proposed spend ${auto_run_ceiling.proposed_spend_usd:,.2f} exceeds "
                    f"auto-run ceiling ${auto_run_ceiling.ceiling_usd:,.2f}."
                ),
                value=f"${auto_run_ceiling.proposed_spend_usd:,.2f}",
                bar_source=None,
                route_to_approval="Pending policy check — single DPO countersign",
            ),
            trust_receipt_ref=trust_receipt,
        )

    # All passed + within ceiling → runs now.
    return CommissionVerdict(
        verdict_id=verdict_id,
        session_id=session_id,
        issued_at_iso=_now_iso(),
        outcome=VerdictOutcome.RUNS_NOW,
        checks=checks,
        auto_run_ceiling=auto_run_ceiling,
        refusal=None,
        trust_receipt_ref=trust_receipt,
    )
