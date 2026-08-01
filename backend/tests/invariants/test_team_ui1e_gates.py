"""UI-1-E backend gate roster · Canon §3.2 + operating model A.5.

Cells:
  * gate_ui1e_approval_surface_returns_aggregated_items_and_doctrine
  * gate_ui1e_approval_surface_link_across_to_govern_record
  * gate_ui1e_approval_decision_requires_verbatim_reason
  * gate_ui1e_approval_decision_verbatim_stored_and_ledger_event
  * gate_ui1e_approval_decision_reachable_from_govern_record
  * gate_ui1e_access_register_read_gate_master_admin_all_dpo_all_operator_self
  * gate_ui1e_access_register_dpo_break_in_grant_denied_shape
  * gate_ui1e_access_register_dpo_break_in_revoke_denied_shape
  * gate_ui1e_access_register_grant_revoke_end_to_end
  * gate_ui1e_constitutional_seats_render_dormant_honest_action_state
  * gate_ui1e_parity_36_no_new_frozen_contracts
"""
from __future__ import annotations

import sys
from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402


async def _token(ac: httpx.AsyncClient, email: str, password: str) -> str:
    r = await ac.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


async def _admin_token(ac: httpx.AsyncClient) -> str:
    return await _token(ac, "admin@rms.example.com", "admin-b1-test-pw")


async def _dpo_token(ac: httpx.AsyncClient) -> str:
    return await _token(ac, "demo.dpo@demo.rms.example.com", "demo-dpo-pw")


# ---------- Approval surface -----------------------------------------------


@pytest.mark.asyncio
async def test_e_a1_approval_surface_returns_items_counts_and_doctrine():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/team/approval_surface",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["canon_ref"].startswith("Canon §3.2")
    assert "items" in body
    assert body["counts"]["total"] >= 3  # seeded per identity (3 open + 1 dormant)
    # Doctrine line renders verbatim per Owner Message 604.
    assert "criteria are the instrument" in body["queue_doctrine_plain"].lower()
    # queue_reading is a valid value.
    assert body["queue_reading"] in ("empty", "healthy", "full")


@pytest.mark.asyncio
async def test_e_a2_approval_surface_items_carry_grammar_and_link_across_route():
    """Test-owned checker_requests row (avoids cross-suite mutation of the
    seeded sample; other suites transition the sample's state which would
    hide it from the approval-surface `state ∈ {pending_master_admin, ...}`
    query)."""
    from server import db
    coll = db.get_collection("checker_requests")
    request_id = "e_a2_test_request_ui1e"
    await coll.delete_many({"request_id": request_id})
    await coll.insert_one({
        "request_id": request_id,
        "state": "pending_master_admin",
        "what_plain": "e_a2 test row",
        "criterion_crossed": "auto_run_ceiling_exceeded",
        "proposed_spend_usd": 1450.00,
        "cost_summary": "$1,450.00",
        "session_id": "s-e-a2-test",
        "requested_by_email": "test@rms.example.com",
        "created_at_iso": "2026-08-02T00:00:00Z",
        "is_sample": False,
    })
    try:
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
            tok = await _admin_token(ac)
            r = await ac.get("/api/team/approval_surface",
                             headers={"Authorization": f"Bearer {tok}"})
        body = r.json()
        for item in body["items"]:
            for k in ("item_id", "class", "what", "which_criterion",
                      "cost_or_touch", "state", "linked_record_route"):
                assert k in item, f"missing {k} in {item}"
        # At least one over_threshold_commission carries a linked_record_route into Govern holds.
        chk_items = [i for i in body["items"] if i["class"] == "over_threshold_commission"]
        assert len(chk_items) >= 1, f"no chk items surfaced; items={body['items']}"
        assert "/govern/holds" in chk_items[0]["linked_record_route"]
        # Dormant-honest class(es) render with state_reason_plain.
        dormant_items = [i for i in body["items"] if i["state"] == "dormant_honest"]
        assert len(dormant_items) >= 1
        assert dormant_items[0]["state_reason_plain"], "dormant items need a plain reason"
    finally:
        await coll.delete_many({"request_id": request_id})


# ---------- Decision endpoint (D-1 binding) --------------------------------


@pytest.mark.asyncio
async def test_e_a3_decision_requires_verbatim_reason():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # missing reason → 400 decision_reason_required
        r = await ac.post("/api/team/approval_surface/chk-test/decision",
                          json={"decision": "approve"},
                          headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 400
        assert r.json()["reason"] == "decision_reason_required"
        # empty-whitespace reason → 400 decision_reason_required
        r = await ac.post("/api/team/approval_surface/chk-test/decision",
                          json={"decision": "approve", "reason_verbatim": "   "},
                          headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 400


@pytest.mark.asyncio
async def test_e_a4_decision_verbatim_stored_and_ledger_event_created():
    """Test uses a purpose-built (non-sample) checker_requests row so it
    does not pollute the seeded sample fixture (which other suites read).
    """
    from server import db
    coll = db.get_collection("checker_requests")
    request_id = "e_a4_test_request_ui1e"
    item_id = f"chk-{request_id}"
    # Seed a purpose-built row (idempotent for the test).
    await coll.delete_many({"request_id": request_id})
    await coll.insert_one({
        "request_id": request_id,
        "state": "pending_master_admin",
        "what_plain": "e_a4 test row · not a sample",
        "criterion_crossed": "auto_run_ceiling_exceeded",
        "proposed_spend_usd": 500.00,
        "cost_summary": "$500.00",
        "requested_by_email": "test@rms.example.com",
        "created_at_iso": "2026-08-02T00:00:00Z",
        "is_sample": False,
    })
    try:
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
            tok = await _admin_token(ac)
            reason = "Training scope is within Q3 budget; approved per commitments."
            r = await ac.post(
                f"/api/team/approval_surface/{item_id}/decision",
                json={"decision": "approve", "reason_verbatim": reason},
                headers={"Authorization": f"Bearer {tok}"},
            )
        assert r.status_code == 200, r.text
        body = r.json()
        # D-1 binding · verbatim.
        assert body["event"]["reason_verbatim"] == reason
        # Both approve and decline are ledger events — recorded in team_decision_events.
        assert body["event"]["event_id"].startswith("tde-")
        # Routed to the underlying seam (checker_requests) — link-across, no copy.
        assert body["seam_ack"]["routed_to"] == "checker_requests"
        # Reachable from the Govern record (D-1 binding).
        assert body["linked_govern_record_route"] == "/govern/holds"
    finally:
        await coll.delete_many({"request_id": request_id})


@pytest.mark.asyncio
async def test_e_a5_decision_persisted_and_appears_on_underlying_checker_record():
    from server import db
    coll = db.get_collection("checker_requests")
    request_id = "e_a5_test_request_ui1e"
    item_id = f"chk-{request_id}"
    await coll.delete_many({"request_id": request_id})
    await coll.insert_one({
        "request_id": request_id,
        "state": "pending_master_admin",
        "what_plain": "e_a5 test row · not a sample",
        "criterion_crossed": "auto_run_ceiling_exceeded",
        "requested_by_email": "test@rms.example.com",
        "created_at_iso": "2026-08-02T00:00:00Z",
        "is_sample": False,
    })
    try:
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
            tok = await _admin_token(ac)
            reason = "Ledger discipline check · reason recorded verbatim."
            await ac.post(f"/api/team/approval_surface/{item_id}/decision",
                          json={"decision": "decline", "reason_verbatim": reason},
                          headers={"Authorization": f"Bearer {tok}"})
        # The decision is recorded on the SAME underlying record (link-across, not copy).
        doc = await coll.find_one({"request_id": request_id})
        assert doc is not None
        assert any(d["reason_verbatim"] == reason and d["decision"] == "decline"
                   for d in (doc.get("team_decisions") or []))
    finally:
        await coll.delete_many({"request_id": request_id})


# ---------- Access register (Section B) ------------------------------------


@pytest.mark.asyncio
async def test_e_b1_access_register_admin_reads_all_grants_and_can_grant():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/team/access_register",
                         headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    assert body["capabilities"]["can_read_all"] is True
    assert body["capabilities"]["can_grant"] is True
    assert body["capabilities"]["can_revoke"] is True
    assert body["counts"]["total"] >= 3
    # Every row carries the required grammar.
    for row in body["rows"][:5]:
        for k in ("grant_id", "who_grantee_email", "what_scope",
                  "when_created_iso", "by_whom_grantor_email",
                  "state", "propagation_state_plain"):
            assert k in row, row


@pytest.mark.asyncio
async def test_e_b1a_access_register_sample_revoked_row_visible_in_first_slice():
    """Owner Message 611 · UI-1-E close binding: at least one SAMPLE revoked
    grant MUST be visible in the frontend's rendered slice (first 60 rows).
    The endpoint sorts sample-marked rows first so revoked samples always
    make the visible window even when the register has grown to hundreds
    of non-sample rows.
    """
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/team/access_register",
                         headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    # Visible slice (mirrors the frontend's .slice(0, 60)).
    visible = body["rows"][:60]
    revoked_samples = [r for r in visible
                       if r["state"] == "revoked" and r.get("is_sample")]
    assert len(revoked_samples) >= 1, (
        f"no sample revoked rows in first 60 · counts={body['counts']} · "
        f"total states in visible slice="
        f"{sorted({r['state'] for r in visible})}"
    )
    # The revoked sample carries the honest propagation state.
    rr = revoked_samples[0]
    assert "next login/refresh" in rr["propagation_state_plain"].lower()
    # Revoked timestamp is present.
    assert rr["when_revoked_iso"], f"revoked sample missing when_revoked_iso: {rr}"


@pytest.mark.asyncio
async def test_e_b2_access_register_dpo_reads_but_cannot_grant():
    """Owner Message 608 D-2 binding · break-in style role-gate cell.

    DPO reads the register (can_read_all=True), cannot grant (can_grant=False).
    """
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _dpo_token(ac)
        r = await ac.get("/api/team/access_register",
                         headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    assert body["capabilities"]["can_read_all"] is True
    assert body["capabilities"]["can_grant"] is False
    assert body["capabilities"]["can_revoke"] is False


@pytest.mark.asyncio
async def test_e_b3_dpo_break_in_grant_denied_correct_shape():
    """DPO attempts POST /grant → auth_scope_insufficient (correct auth-denial shape)."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _dpo_token(ac)
        r = await ac.post("/api/team/access_register/grant",
                          json={"grantee_email": "x@y.com", "endpoint_scope": "GET /api/foo"},
                          headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    # Detail explains WHICH role gate fired.
    assert "master_admin" in body["detail"].lower() or "DPO reads" in body["detail"]


@pytest.mark.asyncio
async def test_e_b4_dpo_break_in_revoke_denied_correct_shape():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _dpo_token(ac)
        r = await ac.post("/api/team/access_register/revoke",
                          json={"grant_id": "any", "reason_verbatim": "any"},
                          headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403
    assert r.json()["reason"] == "auth_scope_insufficient"


@pytest.mark.asyncio
async def test_e_b5_grant_revoke_end_to_end_via_team_surface():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Issue a grant.
        payload = {
            "grantee_email": "e2e.grantee@e2e.example.com",
            "endpoint_scope": "GET /api/e2e/probe",
            "scope_summary": "e2e grant/revoke round-trip",
            "reason_verbatim": "e2e integration test grant",
        }
        r1 = await ac.post("/api/team/access_register/grant",
                           json=payload,
                           headers={"Authorization": f"Bearer {tok}"})
        assert r1.status_code == 200, r1.text
        grant_id = r1.json()["grant"]["grant_id"]
        # Revoke it.
        r2 = await ac.post("/api/team/access_register/revoke",
                           json={"grant_id": grant_id, "reason_verbatim": "e2e revoke"},
                           headers={"Authorization": f"Bearer {tok}"})
        assert r2.status_code == 200
        assert r2.json()["grant"]["state"] == "revoked"
        # Re-revoke → 409 grant_already_revoked.
        r3 = await ac.post("/api/team/access_register/revoke",
                           json={"grant_id": grant_id, "reason_verbatim": "second try"},
                           headers={"Authorization": f"Bearer {tok}"})
        assert r3.status_code == 409
        assert r3.json()["reason"] == "grant_already_revoked"


# ---------- Constitutional seats (Section C) --------------------------------


@pytest.mark.asyncio
async def test_e_c1_seats_render_two_seats_action_state_dormant_honest():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/team/constitutional_seats",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    body = r.json()
    assert body["action_state"] == "dormant_honest"
    ids = {s["seat_id"] for s in body["seats"]}
    assert ids == {"master_admin", "dpo"}
    # Each seat carries a plain-language succession_path.
    for seat in body["seats"]:
        assert seat["succession_path_plain"]
        assert seat["action_dormant_reason_plain"]
        # No new frozen contract reference — honest disclosure of the block.
        assert "HAZARD-STOP" in seat["action_dormant_reason_plain"] or \
               "new frozen contract" in seat["action_dormant_reason_plain"]


# ---------- Parity + regression --------------------------------------------


@pytest.mark.asyncio
async def test_e_g1_parity_36_unchanged():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        r = await ac.get("/api/readyz")
    body = r.json()
    assert body["parity_count"] == 36
    assert body["expected_parity"] == 36
