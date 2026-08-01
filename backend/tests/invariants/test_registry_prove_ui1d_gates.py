"""UI-1-D backend gate roster (Owner ruling 2026-08-02 · Canon §5 + §9).

Cells:
  * gate_ui1d_registry_what_you_hold_four_axes
  * gate_ui1d_registry_holdings_measured_and_unmeasured_first_class
  * gate_ui1d_opportunity_briefs_put_this_to_work_cta
  * gate_ui1d_gap_register_queue_this_gap_cta
  * gate_ui1d_gap_register_queue_endpoint_idempotent_and_opens_session
  * gate_ui1d_prove_ask_answered_shape_carries_walk_link
  * gate_ui1d_prove_ask_not_extracted_yet_offers_queue
  * gate_ui1d_prove_ask_evidence_cannot_support_no_queue
  * gate_ui1d_prove_ask_something_broke_uses_fault_channel
  * gate_ui1d_prove_refusal_shape_mapping_table_complete
  * gate_ui1d_prove_trace_returns_three_walk_layers
  * gate_ui1d_sample_marking_present_on_seeded_rows
  * gate_ui1d_parity_36_no_new_frozen_contracts
  * gate_ui1d_db1_wire_reason_verbatim_in_response
"""
from __future__ import annotations

import sys
from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402


async def _admin_token(ac: httpx.AsyncClient) -> str:
    r = await ac.post("/api/auth/login", json={
        "email": "admin@rms.example.com", "password": "admin-b1-test-pw",
    })
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


# ---------- gate_ui1d_registry_what_you_hold_four_axes -----------------------


@pytest.mark.asyncio
async def test_d_r1_what_you_hold_returns_four_axes_and_canon_ref():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/registry/what_you_hold",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "canon_ref" in body and "Canon §5" in body["canon_ref"]
    # 4 axes present.
    for axis in ("connected", "holdings", "intelligence", "backend"):
        assert axis in body, f"missing axis: {axis}"
    # Connected axis grammar.
    conn = body["connected"]
    for k in ("connected", "in_progress", "awaiting_credentials", "failed", "total"):
        assert k in conn
    # Holdings axis is a warehouse view.
    hold = body["holdings"]
    for k in ("rows", "rings_axis", "domains_axis", "measured_count", "unmeasured_count"):
        assert k in hold
    # Backend axis names the ceiling seam (single source of truth).
    be = body["backend"]
    assert "auto_run_ceiling_usd" in be
    assert "ceiling_source_seam" in be
    assert "checker_requests" in be["ceiling_source_seam"]


# ---------- gate_ui1d_registry_holdings_measured_and_unmeasured_first_class --


@pytest.mark.asyncio
async def test_d_r2_holdings_row_shape_and_unmeasured_carries_honest_plain_reason():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/registry/what_you_hold",
                         headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    rows = body["holdings"]["rows"]
    assert isinstance(rows, list)
    # There is at least one seeded source in the fixture-capable identity.
    # Each row carries first-class measured/unmeasured discipline.
    for row in rows:
        for k in ("source_id", "source_name", "ring", "domain", "measured",
                  "method", "unmeasured_reason_plain", "corpus_row_count"):
            assert k in row, f"row missing key: {k}"
        # Measured is a bool.
        assert isinstance(row["measured"], bool)
        # Unmeasured rows MUST carry a plain-language reason (never null · never a code).
        if not row["measured"]:
            assert row["unmeasured_reason_plain"] is not None
            assert isinstance(row["unmeasured_reason_plain"], str)
            assert len(row["unmeasured_reason_plain"]) > 0


# ---------- gate_ui1d_opportunity_briefs_put_this_to_work_cta ---------------


@pytest.mark.asyncio
async def test_d_r3_opportunity_briefs_carry_put_this_to_work_cta_verbatim():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/registry/opportunity_briefs",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "canon_ref" in body
    assert "briefs" in body
    # Seeder produces at least 2 briefs per identity (admin identity is seeded).
    assert body["count"] >= 2, f"expected seeded briefs, got {body['count']}"
    for brief in body["briefs"]:
        # CTA rename per Canon C.4 · verbatim.
        assert brief["cta_label"] == "Put this to work", brief
        # CTA route opens Use Data with prefill.
        assert brief["cta_route"].startswith("/use-data?prefill_from_brief=")
        # Retired vocab MUST NOT appear.
        assert "Shape this objective" not in brief.get("cta_label", "")
        assert "Shape this objective" not in brief.get("summary_plain", "")


# ---------- gate_ui1d_gap_register_queue_this_gap_cta -----------------------


@pytest.mark.asyncio
async def test_d_r4_gap_register_carries_queue_this_gap_cta_and_state_grammar():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/registry/gap_register",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert "gaps" in body and body["count"] >= 3  # seeder produces 3 per identity
    for gap in body["gaps"]:
        assert gap["cta_label"] == "Queue this gap", gap
        assert gap["cta_route"].startswith("/use-data?prefill_from_gap=")
        assert gap["state"] in ("open", "queued")


# ---------- gate_ui1d_gap_register_queue_endpoint_idempotent_and_opens_session


@pytest.mark.asyncio
async def test_d_r5_queue_endpoint_opens_use_data_session_and_is_idempotent():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Read a gap to queue.
        r = await ac.get("/api/registry/gap_register",
                         headers={"Authorization": f"Bearer {tok}"})
        open_gaps = [g for g in r.json()["gaps"] if g["state"] == "open"]
        assert len(open_gaps) >= 1, "need at least one open gap for this test"
        gap_id = open_gaps[0]["gap_id"]
        # Queue it.
        r1 = await ac.post("/api/registry/gap_register/queue",
                           json={"gap_id": gap_id},
                           headers={"Authorization": f"Bearer {tok}"})
        assert r1.status_code == 200, r1.text
        b1 = r1.json()
        assert b1["gap_id"] == gap_id
        assert b1["queued_use_data_session_id"].startswith("s-gap-")
        assert b1["route"].startswith("/use-data?prefill_from_gap=")
        # Idempotent: second call yields same session_id.
        r2 = await ac.post("/api/registry/gap_register/queue",
                           json={"gap_id": gap_id},
                           headers={"Authorization": f"Bearer {tok}"})
        assert r2.status_code == 200
        assert r2.json()["queued_use_data_session_id"] == b1["queued_use_data_session_id"]


# ---------- gate_ui1d_prove_ask_answered_shape_carries_walk_link ------------


@pytest.mark.asyncio
async def test_d_p1_prove_ask_answered_shape_returns_claim_and_trace_id():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # This question matches the seeded ANSWERED sample.
        r = await ac.post("/api/prove/ask", json={
            "question": "How many Q1 partner rebate rows carry an established-fact class?",
        }, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["shape"] == "answered", body
    assert body["trace_id"].startswith("trc-")
    assert "claim" in body
    assert body["defensibility_class"] == "established_fact"


# ---------- gate_ui1d_prove_ask_not_extracted_yet_offers_queue --------------


@pytest.mark.asyncio
async def test_d_p2_prove_ask_never_seen_question_returns_not_extracted_yet_with_queue():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Deliberately unusual question — never seeded, forces NOT_EXTRACTED_YET.
        r = await ac.post("/api/prove/ask", json={
            "question": "Zzq unique question about outer-galaxy freight tonnage ratios never seeded 42.",
        }, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["shape"] == "not_extracted_yet", body
    assert body["queue_offered"] is True
    assert body["gap_id"].startswith("gap-")
    assert body["wire_reason_verbatim"], "wire reason must be verbatim (DB-1)"


# ---------- gate_ui1d_prove_ask_evidence_cannot_support_no_queue ------------


@pytest.mark.asyncio
async def test_d_p3_prove_ask_evidence_cannot_support_shape_no_queue():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Seeded EVIDENCE_CANNOT_SUPPORT sample question.
        r = await ac.post("/api/prove/ask", json={
            "question": "What price did the Q3 board approve for the enterprise tier?",
        }, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["shape"] == "evidence_cannot_support_it", body
    # NO queue offer on EVIDENCE_CANNOT_SUPPORT.
    assert body.get("queue_offered") is False
    # Reason code AND wire reason verbatim (DB-1) both present.
    assert body["reason_code"] in ("no_defensibility_floor", "no_lawful_basis",
                                    "composition_below_floor", "form_not_offerable")
    assert body["wire_reason_verbatim"]


# ---------- gate_ui1d_prove_ask_something_broke_uses_fault_channel ----------


@pytest.mark.asyncio
async def test_d_p4_prove_ask_something_broke_uses_fault_channel_never_refusal():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Seeded SOMETHING_BROKE sample question.
        r = await ac.post("/api/prove/ask", json={
            "question": "Show the raw archive for the March broker export.",
        }, headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    assert body["shape"] == "something_broke", body
    assert body["fault_channel_ref"], "fault channel ref required"
    assert body["fault_reason_plain"], "fault reason plain required"
    # DB-2 BINDING · a fault MUST NOT carry a refusal reason_code.
    assert "reason_code" not in body
    # A fault MUST NOT offer a queue.
    assert body.get("queue_offered") is False


# ---------- gate_ui1d_prove_refusal_shape_mapping_table_complete ------------


def test_d_p5_refusal_shape_mapping_table_covers_all_service_1_codes():
    """The presentation-layer mapping table maps all known service_1 refusal
    reason codes. Unknown codes route safely to EVIDENCE_CANNOT_SUPPORT.

    Owner ruling 2026-08-02 (Message 521 · combined 2b+2c): unambiguous
    mappings only; ambiguous codes are filed in docs/rulings/ for
    disposition.
    """
    from routers.registry import _REFUSAL_TO_SHAPE, _map_refusal_shape
    # The 4 known service_1 refusal codes are all mapped.
    for code in ("no_defensibility_floor", "no_lawful_basis",
                 "composition_below_floor", "form_not_offerable"):
        assert code in _REFUSAL_TO_SHAPE, f"missing mapping for {code}"
        assert _REFUSAL_TO_SHAPE[code] == "evidence_cannot_support_it"
    # Unknown codes route safely to EVIDENCE_CANNOT_SUPPORT (never a fault, never a queue).
    assert _map_refusal_shape("some_unknown_future_code") == "evidence_cannot_support_it"
    # Ambiguous codes are NEVER auto-mapped to NOT_EXTRACTED_YET.
    for code in _REFUSAL_TO_SHAPE.values():
        assert code in ("evidence_cannot_support_it", "not_extracted_yet")


# ---------- gate_ui1d_prove_trace_returns_three_walk_layers -----------------


@pytest.mark.asyncio
async def test_d_p6_prove_trace_returns_three_walk_layers():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Ask something first so a trace exists.
        r1 = await ac.post("/api/prove/ask", json={
            "question": "How many Q1 partner rebate rows carry an established-fact class?",
        }, headers={"Authorization": f"Bearer {tok}"})
        trace_id = r1.json()["trace_id"]
        # Walk it.
        r2 = await ac.get(f"/api/prove/trace/{trace_id}",
                          headers={"Authorization": f"Bearer {tok}"})
    assert r2.status_code == 200, r2.text
    body = r2.json()
    assert body["trace_id"] == trace_id
    assert "envelope" in body
    assert "walk_layers" in body
    layers = body["walk_layers"]
    assert len(layers) == 3, f"expected 3 layers, got {len(layers)}"
    assert [layer["layer"] for layer in layers] == ["claim", "reasoning", "raw_facts"]
    # Reasoning layer carries candidates + corroboration + probability.
    reasoning = layers[1]
    assert "candidates" in reasoning
    # Raw facts each link to a source.
    raw = layers[2]
    assert "facts" in raw


@pytest.mark.asyncio
async def test_d_p7_prove_trace_404_when_trace_absent():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/prove/trace/trc-does-not-exist",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 404
    assert r.json()["reason"] == "trace_not_found"


# ---------- gate_ui1d_prove_samples_endpoint_returns_all_four_shapes --------


@pytest.mark.asyncio
async def test_d_p8_prove_samples_endpoint_returns_all_four_seeded_shapes():
    """Owner UI-1-D re-verification 2026-08-02 · viewable-build standing:
    the /prove page renders the 4 shape samples by default. This gate
    asserts the source-of-truth endpoint returns all 4 shapes, each with
    is_sample=True and a resolvable trace_id.
    """
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/prove/samples",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["count"] == 4, body
    shapes = {s["shape"] for s in body["samples"]}
    assert shapes == {"answered", "not_extracted_yet",
                      "evidence_cannot_support_it", "something_broke"}
    for s in body["samples"]:
        assert s.get("is_sample") is True, s
        assert s.get("trace_id"), f"missing trace_id on shape={s['shape']}"


@pytest.mark.asyncio
async def test_d_p9_prove_samples_trace_ids_resolve_via_prove_trace():
    """Each seeded sample's trace_id resolves in /api/prove/trace/{id} —
    Walk-a-Proof descends from the default page render without requiring
    the user to compose a query.
    """
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        rs = await ac.get("/api/prove/samples",
                          headers={"Authorization": f"Bearer {tok}"})
        for s in rs.json()["samples"]:
            trace_id = s["trace_id"]
            rt = await ac.get(f"/api/prove/trace/{trace_id}",
                              headers={"Authorization": f"Bearer {tok}"})
            assert rt.status_code == 200, f"trace resolve failed for {trace_id}: {rt.text}"
            body = rt.json()
            assert body["trace_id"] == trace_id
            assert "envelope" in body
            assert body["envelope"]["shape"] == s["shape"]
            assert len(body["walk_layers"]) == 3


# ---------- gate_ui1d_sample_marking_present_on_seeded_rows -----------------


@pytest.mark.asyncio
async def test_d_s1_seeded_briefs_and_gaps_carry_is_sample_true():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        rb = await ac.get("/api/registry/opportunity_briefs",
                          headers={"Authorization": f"Bearer {tok}"})
        rg = await ac.get("/api/registry/gap_register",
                          headers={"Authorization": f"Bearer {tok}"})
    # At least one seeded row per surface carries is_sample=True.
    assert any(b.get("is_sample") is True for b in rb.json()["briefs"])
    assert any(g.get("is_sample") is True for g in rg.json()["gaps"])


# ---------- gate_ui1d_parity_36_no_new_frozen_contracts ---------------------


@pytest.mark.asyncio
async def test_d_g1_parity_36_unchanged_no_new_frozen_contracts():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        r = await ac.get("/api/readyz")
    assert r.status_code == 200
    b = r.json()
    assert b["parity_count"] == 36, f"parity drift: {b}"
    assert b["expected_parity"] == 36


# ---------- gate_ui1d_db1_wire_reason_verbatim_in_response ------------------


@pytest.mark.asyncio
async def test_d_d1_wire_reason_verbatim_in_refusal_response():
    """DB-1 BINDING: the wire reason renders verbatim in the honesty strip.
    The backend MUST return the wire reason unaltered; the frontend then
    renders it verbatim.
    """
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.post("/api/prove/ask", json={
            "question": "What price did the Q3 board approve for the enterprise tier?",
        }, headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    assert body["shape"] == "evidence_cannot_support_it"
    # The wire reason is a full sentence · not a code · not empty.
    wire = body["wire_reason_verbatim"]
    assert isinstance(wire, str) and len(wire) > 20
    assert "The corpus holds" in wire  # from the seeded verbatim reason
