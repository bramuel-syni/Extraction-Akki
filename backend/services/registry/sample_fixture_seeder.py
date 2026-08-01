"""UI-1-D sample fixture seeder · Registry ('What You Hold') + Prove.

Owner UI-1-D dispatch (2026-08-02) · standing requirement F verbatim:
    "seeded sample answers/gaps/briefs per identity incl. admin"

Idempotent. Seeds:
    - 2 opportunity briefs per identity (with "Put this to work" CTA)
    - 3 gap register entries per identity (open, one queued, one high-rank)
    - 3 prove sample answers per identity keyed by question hash
      (one ANSWERED, one EVIDENCE_CANNOT_SUPPORT_IT, one hits NOT_EXTRACTED_YET)
"""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import List

from core import db


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _q_hash(q: str) -> str:
    return hashlib.sha1(q.encode("utf-8")).hexdigest()[:12]


async def seed_registry_prove_sample_fixtures_if_absent(operator_email_and_id: List[dict]) -> None:
    briefs_coll = db.get_collection("opportunity_briefs")
    gaps_coll = db.get_collection("registry_gap_register")
    answers_coll = db.get_collection("prove_sample_answers")

    for op in operator_email_and_id:
        uid = op["user_id"]
        suffix = uid[-8:]

        # 2 opportunity briefs per identity.
        for i, brief in enumerate([
            {
                "brief_id": f"brief-partner-rebate-{suffix}",
                "title": "Q1 partner rebate audit — licensed cohort",
                "summary_plain": (
                    "The partner-licensed retention rows already carry a "
                    "verdict-ready RUNS_NOW envelope. This brief opens Use "
                    "Data with Reflection filled for an export-or-license "
                    "commission."
                ),
                "prefill_door": "export_or_license",
                "prefill_scope": "Q1 partner-licensed cohort",
                "prefill_evidence_floor": "established_fact",
                "impact_class": "high",
                "is_sample": True,
            },
            {
                "brief_id": f"brief-retention-model-{suffix}",
                "title": "Retention model on 12-month training window",
                "summary_plain": (
                    "12 months of licensed corpus support a recall-oriented "
                    "classifier. This brief opens Use Data with Reflection "
                    "filled for a train-a-model commission."
                ),
                "prefill_door": "train_a_model",
                "prefill_scope": "12-month training window · three source families",
                "prefill_evidence_floor": "established_fact",
                "impact_class": "medium",
                "is_sample": True,
            },
        ]):
            if await briefs_coll.find_one({"brief_id": brief["brief_id"]}) is None:
                brief["created_at_iso"] = _now_iso()
                brief["operator_id"] = uid
                await briefs_coll.insert_one(brief)

        # 3 gap register entries per identity.
        for gap in [
            {
                "gap_id": f"gap-partner-tos-{suffix}",
                "question_plain": "What partner terms of service applied to the Q3 renewal cohort?",
                "originating_trace_id": f"trc-sample-{suffix}-a",
                "filed_by": op["email"],
                "filed_at_iso": _now_iso(),
                "rank_score": 0.87,
                "state": "open",
                "is_sample": True,
            },
            {
                "gap_id": f"gap-churn-drivers-{suffix}",
                "question_plain": "Which cohorts drove churn between month 3 and month 6?",
                "originating_trace_id": f"trc-sample-{suffix}-b",
                "filed_by": op["email"],
                "filed_at_iso": _now_iso(),
                "rank_score": 0.62,
                "state": "open",
                "is_sample": True,
            },
            {
                "gap_id": f"gap-already-queued-{suffix}",
                "question_plain": "How many sanctioned partners are active in ring 2?",
                "originating_trace_id": f"trc-sample-{suffix}-c",
                "filed_by": op["email"],
                "filed_at_iso": _now_iso(),
                "rank_score": 0.44,
                "state": "queued",
                "queued_use_data_session_id": f"s-gap-already-queued-{suffix}",
                "queued_at_iso": _now_iso(),
                "is_sample": True,
            },
        ]:
            if await gaps_coll.find_one({"gap_id": gap["gap_id"]}) is None:
                await gaps_coll.insert_one(gap)

    # Global sample prove answers (question-hash keyed; identity-agnostic).
    for entry in [
        # ANSWERED shape (class-with-claim + reasoning + raw facts).
        {
            "question_plain": "How many Q1 partner rebate rows carry an established-fact class?",
            "shape": "answered",
            "claim": "487 partner-rebate rows in Q1 meet the established-fact floor.",
            "defensibility_class": "established_fact",
            "reasoning_verbatim": (
                "Candidates considered: ring_1_established_fact (487 rows) "
                "vs ring_2_registered (2,041 rows). Ring 2 rows lack the "
                "second-party countersign required by the defensibility "
                "floor. Ring 1 corroboration: partner_ledger.q1_rebate_lines "
                "cross-verified against internal.rebate_receivables.q1."
            ),
            "candidates_considered": [
                "ring_1_established_fact · 487 rows",
                "ring_2_registered · 2,041 rows",
            ],
            "corroboration_notes": (
                "partner_ledger.q1_rebate_lines corroborates "
                "internal.rebate_receivables.q1 at row-key level."
            ),
            "probability_calibration": "confidence 0.97 · established_fact floor met.",
            "raw_facts": [
                {"fact": "partner_ledger.q1_rebate_lines row_count=487",
                 "source_ref": "src-sample-conn-*", "row_key": "q1_rebate"},
                {"fact": "internal.rebate_receivables.q1 row_count=487 (matched)",
                 "source_ref": "internal", "row_key": "q1_rebate"},
            ],
            "is_sample": True,
        },
        # EVIDENCE_CANNOT_SUPPORT_IT shape.
        {
            "question_plain": "What price did the Q3 board approve for the enterprise tier?",
            "shape": "evidence_cannot_support_it",
            "reason_code": "no_defensibility_floor",
            "wire_reason_verbatim": (
                "The corpus holds a Q3 board-meeting summary but the summary "
                "does not name a specific enterprise-tier price. The "
                "defensibility floor requires a specific price value, and "
                "no ring holds one at scope."
            ),
            "what_would_raise_it_plain": (
                "A Q3 board-minutes ingestion (currently declaration-only) "
                "would raise this to established_fact — but confirm the "
                "board minutes actually contain a specific price line."
            ),
            "queue_offered": False,
            "candidates_considered": [
                "ring_1_established_fact · 0 rows on 'enterprise_tier_price'",
                "ring_3_probable · 2 board-summary rows (no specific price)",
            ],
            "raw_facts": [
                {"fact": "Q3 board summary paragraph mentions 'enterprise tier repricing under review'",
                 "source_ref": "src-sample-inprog-*", "row_key": "q3_board_summary"},
            ],
            "is_sample": True,
        },
        # SOMETHING_BROKE shape example (fault channel).
        {
            "question_plain": "Show the raw archive for the March broker export.",
            "shape": "something_broke",
            "fault_channel_ref": "fault-archive-reader-dormant",
            "fault_reason_plain": (
                "The archive reader capability is dormant (awaiting OT-1a). "
                "The March broker export is registered but its extract is "
                "not yet available for the walk-a-proof view."
            ),
            "queue_offered": False,
            "is_sample": True,
        },
    ]:
        qhash = _q_hash(entry["question_plain"])
        entry["question_hash"] = qhash
        entry["created_at_iso"] = _now_iso()
        if await answers_coll.find_one({"question_hash": qhash}) is None:
            await answers_coll.insert_one(entry)
