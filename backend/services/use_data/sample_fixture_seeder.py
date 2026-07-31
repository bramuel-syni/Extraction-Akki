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
    from contracts.use_data_wizard_session import CommissionCard
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


async def seed_sample_fixtures_if_absent(operator_email_and_id: List[dict]) -> None:
    """Idempotent — skips per-session-id if already present.

    Called at startup for BOTH the demo-marked identities AND the
    permanent-seed identities (`admin`, `master`) so every user the
    Owner may log in with lands on `/use-data` with the two AS-U2
    marked sample rows visible above the fold.

    Owner iter14 addendum verbatim (2026-07-31):
        "the startup seeder must idempotently guarantee the two marked
         sample rows per EVERY demo identity INCLUDING admin"

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
        for sess_id, builder in ((in_prog_id, _fixture_in_progress), (ready_id, _fixture_ready)):
            already = await coll.find_one({"session_id": sess_id})
            if already is not None:
                continue
            sess = builder(session_id=sess_id, operator_id=uid)
            await session_store.insert(sess, is_sample=True)
