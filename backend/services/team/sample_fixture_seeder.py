"""UI-1-E · Team surface sample fixtures.

Seeds per identity (idempotent):
  * 3 approval-surface items (one per class: over_threshold_commission,
    source_addition_pending, access_grant_request)
  * 2 grants + 1 revocation in engineer_key_grants
  * (constitutional seats are read from `users` and are not seeded here)

Every seeded row carries `is_sample=True` so the systemic page-level
sample-marking gate can assert SAMPLE badges render.

Owner Message 604 dispatch directive: "seeded sample queue items + grant
rows per identity incl. admin".
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, Sequence


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def seed_team_ui1e_fixtures_if_absent(sample_ops: Sequence[dict]) -> None:
    """Idempotent per-identity seeder invoked from server.py startup.

    `sample_ops` is the pre-computed list of (identity_email, tenant_id)
    demo/permanent operators — same list used by the UI-1-D seeder.
    Every insertion is guarded by an existence check.
    """
    from server import db

    for op in sample_ops:
        identity_email: str = op["identity_email"]
        uid_tail: str = (op.get("identity_id") or "")[-12:]
        # ---------- Class 1 · over_threshold_commission ---------------------
        await _seed_checker_over_threshold(db, identity_email, uid_tail)
        # ---------- Class 2 · source_addition_pending -----------------------
        await _seed_source_pending(db, identity_email, uid_tail)
        # ---------- Class 3 · access_grant_request --------------------------
        await _seed_pending_grant(db, identity_email, uid_tail)
        # ---------- Access register · active grants + 1 revoked -------------
        await _seed_access_register_rows(db, identity_email, uid_tail)


async def _seed_checker_over_threshold(db, email: str, uid_tail: str) -> None:
    coll = db.get_collection("checker_requests")
    req_id = f"sample-team-chk-{uid_tail}"
    if await coll.find_one({"request_id": req_id}) is not None:
        return
    await coll.insert_one({
        "request_id": req_id,
        "state": "pending_master_admin",
        "what_plain": (
            "Train-a-Model commission on Q3 partner feedback — proposed "
            "spend exceeds the standing auto-run ceiling."
        ),
        "criterion_crossed": "auto_run_ceiling_exceeded",
        "proposed_spend_usd": 1450.00,
        "cost_summary": "$1,450.00 (auto-run ceiling: $1,000.00)",
        "requested_by_email": email,
        "session_id": f"s-sample-held-{uid_tail}",
        "created_at_iso": _now_iso(),
        "is_sample": True,
    })


async def _seed_source_pending(db, email: str, uid_tail: str) -> None:
    coll = db.get_collection("connect_sources_store")
    src_id = f"sample-team-src-{uid_tail}"
    if await coll.find_one({"source_id": src_id}) is not None:
        return
    await coll.insert_one({
        "source_id": src_id,
        "source_name": "sample_broker_pipeline_awaiting_creds",
        "state": "awaiting_credentials",
        "ring": "R2",
        "domain": "revenue",
        "corpus_row_count": 0,
        "declared_by_email": email,
        "unmeasured_reason_plain": (
            "The broker pipeline was declared but its credential is not yet "
            "on file. Provide the API secret via the Connect surface."
        ),
        "created_at_iso": _now_iso(),
        "is_sample": True,
    })


async def _seed_pending_grant(db, email: str, uid_tail: str) -> None:
    coll = db.get_collection("engineer_key_grants")
    grant_id = f"sample-team-grant-pending-{uid_tail}"
    if await coll.find_one({"grant_id": grant_id}) is not None:
        return
    await coll.insert_one({
        "grant_id": grant_id,
        "grantee_email": "external.engineer@partner.example.com",
        "endpoint_scope": "GET /api/registry/what_you_hold (read-only)",
        "scope_summary": "read-only warehouse view of one identity's holdings",
        "requested_by_email": email,
        "grantor_email": None,
        "state": "pending_approval",
        "delegation_chain_length": 1,
        "created_at_iso": _now_iso(),
        "is_sample": True,
    })


async def _seed_access_register_rows(db, email: str, uid_tail: str) -> None:
    """2 active grants + 1 revoked (for propagation-state rendering)."""
    coll = db.get_collection("engineer_key_grants")
    active_1 = f"sample-team-grant-active-1-{uid_tail}"
    if await coll.find_one({"grant_id": active_1}) is None:
        await coll.insert_one({
            "grant_id": active_1,
            "grantee_email": "auditor@dpo.example.com",
            "endpoint_scope": "GET /api/govern/record (read-only auditor scope)",
            "scope_summary": "read-only auditor access to the Govern Record",
            "grantor_email": email,
            "state": "active",
            "created_at_iso": _now_iso(),
            "is_sample": True,
        })
    active_2 = f"sample-team-grant-active-2-{uid_tail}"
    if await coll.find_one({"grant_id": active_2}) is None:
        await coll.insert_one({
            "grant_id": active_2,
            "grantee_email": "partner@vendor.example.com",
            "endpoint_scope": "GET /api/prove/samples (shape-reference read)",
            "scope_summary": "read-only Prove sample reference",
            "grantor_email": email,
            "state": "active",
            "created_at_iso": _now_iso(),
            "is_sample": True,
        })
    revoked = f"sample-team-grant-revoked-{uid_tail}"
    if await coll.find_one({"grant_id": revoked}) is None:
        await coll.insert_one({
            "grant_id": revoked,
            "grantee_email": "former.contractor@ex.example.com",
            "endpoint_scope": "GET /api/use-data/sessions",
            "scope_summary": "expired contract · scope revoked",
            "grantor_email": email,
            "revoked_by_email": email,
            "revoke_reason_verbatim": "contract expired 2026-Q1; access no longer required.",
            "state": "revoked",
            "created_at_iso": _now_iso(),
            "revoked_at_iso": _now_iso(),
            "is_sample": True,
        })
