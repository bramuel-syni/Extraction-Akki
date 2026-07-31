"""UI-1-A · Sample fixture seeder for the Use Data pipeline strip.

Owner viewable-build addendum (2026-07-31) verbatim:
    "seeded with fixture data VISIBLY MARKED as sample (AS-U2 — an
     unmarked sample is a hidden mock and prohibited)"

Seeded rows carry the sidecar `is_sample=True` flag on the persistence
doc; the surface renders a SAMPLE badge on each row. The frozen
`UseDataWizardSession` contract shape is UNTOUCHED.

Two fixtures land per demo identity:
    · One "In progress" session — an Integrate-an-App conversation
      with three fields set on Reflection, one open, one assumed.
    · One "Ready" session — an Export/License commission that ran
      auto (RUNS_NOW verdict scaffolded via a stub trust-receipt-ref).

The seeder is IDEMPOTENT: it skips if any session for the operator is
already flagged `is_sample=True`.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import List

from contracts.use_data_wizard_session import (
    CommissionCard,
    DialogueTurn,
    IntelCard,
    PlanPreviewCard,
    ReflectionCard,
    ReflectionField,
    SampleResultsCard,
    TestCard,
    UseDataWizardSession,
)
from core import db
from services.use_data import session_store


COLLECTION = "use_data_wizard_sessions"
REFUSALS_COLLECTION = "compliance_refusals"
CHECKER_COLLECTION = "checker_requests"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _fixture_in_progress(session_id: str, operator_id: str) -> UseDataWizardSession:
    return UseDataWizardSession(
        session_id=session_id,
        operator_id=operator_id,
        opened_at_iso=_now_iso(),
        door="integrate_an_app",
        dialogue=[
            DialogueTurn(
                turn_id=f"{session_id}-t1",
                role="user",
                text="Need a scoring API over our licensed customer utterances.",
                ts_iso=_now_iso(),
            ),
            DialogueTurn(
                turn_id=f"{session_id}-t2",
                role="agent",
                text="I hear you. As you narrow scope, Reflection updates on the left.",
                ts_iso=_now_iso(),
            ),
        ],
        reflection=ReflectionCard(fields=[
            ReflectionField(name="need", label="Need", state="set",
                            value="Score inbound customer utterances via API."),
            ReflectionField(name="scope", label="Scope", state="set",
                            value="Support channel · last 90 days."),
            ReflectionField(name="evidence_floor", label="Evidence floor", state="set",
                            value="recorded_statement (Owner-authorised)."),
            ReflectionField(name="rights", label="Rights posture", state="assumed",
                            value="internal_plus_partner (agent assumed · pending confirm)."),
            ReflectionField(name="output_form", label="Output form", state="open", value=None),
        ]),
        intel=IntelCard(
            unset=False,
            grounded_claims=[
                "Estate holds 4 licensed utterance corpora with training rights.",
                "Two carry k>=10 privacy floor by contract.",
            ],
        ),
        test=TestCard(offered=True),
        plan_preview=PlanPreviewCard(
            coverage_range_low_pct=68.0,
            coverage_range_high_pct=82.0,
            cost_low_usd=420.0,
            cost_high_usd=740.0,
            ceiling_usd=1000.0,
        ),
        commission=None,
    )


def _fixture_ready(session_id: str, operator_id: str) -> UseDataWizardSession:
    return UseDataWizardSession(
        session_id=session_id,
        operator_id=operator_id,
        opened_at_iso=_now_iso(),
        door="export_or_license",
        dialogue=[
            DialogueTurn(
                turn_id=f"{session_id}-t1",
                role="user",
                text="Export the licensed retention rows for the partner rebate audit.",
                ts_iso=_now_iso(),
            ),
        ],
        reflection=ReflectionCard(fields=[
            ReflectionField(name="need", label="Need", state="set",
                            value="Deliver retention rows for external audit."),
            ReflectionField(name="scope", label="Scope", state="set",
                            value="Q1 partner-licensed cohort."),
            ReflectionField(name="evidence_floor", label="Evidence floor", state="set",
                            value="established_fact."),
            ReflectionField(name="rights", label="Rights posture", state="set",
                            value="internal_plus_partner."),
            ReflectionField(name="output_form", label="Output form", state="set",
                            value="CSV export · receipted."),
        ]),
        commission=CommissionCard(
            door="export_or_license",
            values_confirmed=["rights", "privacy_floor", "pii_posture", "budget", "scope"],
            committed_at_iso=_now_iso(),
            verdict_ref="trcv-sample-ready-export-license-fixture",
        ),
    )


def _fixture_held(session_id: str, operator_id: str) -> UseDataWizardSession:
    """UI-1-B · seeded HELD-for-check Use Data session.

    Canon §7.6 Holds Surface reverse-route: this session appears in the
    holds surface and links back to /use-data/wizard/{session_id}.
    """
    return UseDataWizardSession(
        session_id=session_id,
        operator_id=operator_id,
        opened_at_iso=_now_iso(),
        door="train_a_model",
        dialogue=[
            DialogueTurn(
                turn_id=f"{session_id}-t1",
                role="user",
                text="Train a recall-oriented classifier over the licensed corpus.",
                ts_iso=_now_iso(),
            ),
        ],
        reflection=ReflectionCard(fields=[
            ReflectionField(name="need", label="Need", state="set",
                            value="Recall-oriented classifier · licensed corpus."),
            ReflectionField(name="scope", label="Scope", state="set",
                            value="12-month training window across three source families."),
            ReflectionField(name="evidence_floor", label="Evidence floor", state="set",
                            value="established_fact."),
            ReflectionField(name="rights", label="Rights posture", state="set",
                            value="internal_plus_partner."),
            ReflectionField(name="output_form", label="Output form", state="set",
                            value="model_artifact · versioned."),
        ]),
        commission=CommissionCard(
            door="train_a_model",
            values_confirmed=["rights", "privacy_floor", "pii_posture", "budget", "scope"],
            committed_at_iso=_now_iso(),
            verdict_ref="trcv-sample-held-train-a-model-fixture",
        ),
    )


async def seed_sample_fixtures_if_absent(operator_email_and_id: List[dict]) -> None:
    """Idempotent — skips per-session-id if already present.

    Called at startup for BOTH the demo-marked identities AND the
    permanent-seed identities (`admin`, `master`) so every user the
    Owner may log in with lands on `/use-data` with the two AS-U2
    marked sample rows visible above the fold.

    Owner iter14 addendum verbatim (2026-07-31):
        "the startup seeder must idempotently guarantee the two marked
         sample rows per EVERY demo identity INCLUDING admin"

    UI-1-B addendum (2026-07-31): also seed one HELD-for-check session
    per identity so the Trust Center → Holds → reverse-route walk-through
    is exercisable for every demo identity, ESPECIALLY the dpo.

    `operator_email_and_id`: list of {email, user_id} — every operator
    who should carry the two sample rows. Caller resolves.
    """
    coll = db[COLLECTION]
    for op in operator_email_and_id:
        uid = op["user_id"]
        # Use the last-12 hex of the ObjectId so each operator gets a
        # DISTINCT session_id (the first-8-hex prefix collides for users
        # created within the same second — the sub-timestamp bytes
        # differentiate them). This is the idempotency key.
        uid_suffix = uid[-12:]
        in_prog_id = f"s-sample-in-progress-{uid_suffix}"
        ready_id = f"s-sample-ready-{uid_suffix}"
        held_id = f"s-sample-held-{uid_suffix}"
        for sess_id, builder in (
            (in_prog_id, _fixture_in_progress),
            (ready_id, _fixture_ready),
        ):
            already = await coll.find_one({"session_id": sess_id})
            if already is not None:
                continue
            sess = builder(session_id=sess_id, operator_id=uid)
            await session_store.insert(sess, is_sample=True)
        # HELD-for-check sample: same envelope shape, but a sidecar
        # `verdict_outcome=held_for_check` + proposed_spend + held_since
        # so the /api/govern/holds surface can list it and Trust Center
        # counts it in the `holds.open` bucket.
        already_held = await coll.find_one({"session_id": held_id})
        if already_held is None:
            sess_held = _fixture_held(session_id=held_id, operator_id=uid)
            payload = sess_held.model_dump()
            payload["is_sample"] = True
            payload["instance_id"] = session_store._current_instance_id()
            payload["verdict_outcome"] = "held_for_check"
            payload["verdict_ref"] = "trcv-sample-held-train-a-model-fixture"
            payload["proposed_spend_usd"] = 1450.00
            payload["auto_run_ceiling_usd"] = 1000.00
            payload["held_since_iso"] = _now_iso()
            payload["hold_reason_verbatim"] = (
                "Proposed spend $1,450.00 exceeds auto-run ceiling $1,000.00. "
                "Pending policy check — single DPO countersign."
            )
            await coll.insert_one(payload)
    # UI-1-B sample fixtures for Trust Center record buckets (per Owner
    # directive: SAMPLE-marked rows so `refusals` / `rule_changes`
    # buckets render non-zero and are exercisable in the walk-through).
    await _seed_sample_refusals_if_absent()
    await _seed_sample_rule_changes_if_absent()


async def _seed_sample_refusals_if_absent() -> None:
    """Idempotent seed of sample refusal ledger rows for Trust Center §7.1.

    Two rows: one ABSOLUTE (rights_incompatibility), one ESCALATABLE
    (privacy_floor_below_threshold), one HELD_FOR_CHECK (auto_run_ceiling).
    """
    coll = db[REFUSALS_COLLECTION]
    now = _now_iso()
    fixtures = [
        {
            "refusal_id": "sample-refusal-absolute-rights",
            "class_hint": "absolute",
            "reason_code": "rights_compatibility_bar",
            "criterion_verbatim": (
                "Requested use exceeds the rights posture declared on the "
                "source registry (internal-only vs internal_plus_partner)."
            ),
            "route_to_approval": None,
            "issued_at_iso": now,
            "is_sample": True,
        },
        {
            "refusal_id": "sample-refusal-escalatable-privacy",
            "class_hint": "escalatable",
            "reason_code": "privacy_floor_below_threshold",
            "criterion_verbatim": (
                "Declared privacy floor k<10 on a partner-licensed corpus. "
                "Escalate for DPO review."
            ),
            "route_to_approval": "Escalate for DPO review",
            "issued_at_iso": now,
            "is_sample": True,
        },
        {
            "refusal_id": "sample-refusal-held-ceiling",
            "class_hint": "held_for_check",
            "reason_code": "auto_run_ceiling_exceeded",
            "criterion_verbatim": (
                "Proposed spend $1,450.00 exceeds auto-run ceiling $1,000.00. "
                "Pending policy check — single DPO countersign."
            ),
            "route_to_approval": "Pending policy check — single DPO countersign",
            "issued_at_iso": now,
            "is_sample": True,
        },
    ]
    for f in fixtures:
        already = await coll.find_one({"refusal_id": f["refusal_id"]})
        if already is None:
            await coll.insert_one(f)


async def _seed_sample_rule_changes_if_absent() -> None:
    """Idempotent seed of sample rule-change history rows.

    One `effective` (loosening-symmetric commissioned then applied),
    one `suspended` (canceled before effect — record kept, not deleted).
    """
    coll = db[CHECKER_COLLECTION]
    now = _now_iso()
    fixtures = [
        {
            "request_id": "sample-rc-effective-retention",
            "rule_class": "retention_windows",
            "from_value_ref": "180d",
            "to_value_ref": "365d",
            "consequence_class": "loosening_symmetric",
            "state": "effective",
            "initiator_id": "demo.dpo@demo.rms.example.com",
            "initiator_role": "compliance",
            "initiated_at": now,
            "countersigned_at": now,
            "effective_at": now,
            "is_sample": True,
        },
        {
            "request_id": "sample-rc-suspended-source-standing",
            "rule_class": "source_standing_table",
            "from_value_ref": "v3",
            "to_value_ref": "v4",
            "consequence_class": "tightening_unilateral",
            "state": "suspended",
            "prior_state": "pending_delay",
            "initiator_id": "demo.dpo@demo.rms.example.com",
            "initiator_role": "compliance",
            "initiated_at": now,
            "suspended_at": now,
            "suspended_by_id": "admin@rms.example.com",
            "suspended_by_role": "admin",
            "suspend_reason": (
                "Sample record — cancellation preserved (not deleted); "
                "cancel is a record, per Canon §7.5."
            ),
            "is_sample": True,
        },
    ]
    for f in fixtures:
        already = await coll.find_one({"request_id": f["request_id"]})
        if already is None:
            await coll.insert_one(f)
