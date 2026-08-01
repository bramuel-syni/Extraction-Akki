"""UI-1-D live preview HTTP verification (Owner Message 521).
Tests hit the public preview URL (REACT_APP_BACKEND_URL) to prove what a real user sees.
"""
from __future__ import annotations
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def admin_token() -> str:
    r = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": "admin@rms.example.com", "password": "admin-b1-test-pw",
    }, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(admin_token) -> dict:
    return {"Authorization": f"Bearer {admin_token}"}


# --- Parity ---

def test_live_parity_36():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=10)
    assert r.status_code == 200
    b = r.json()
    assert b["parity_count"] == 36
    assert b["expected_parity"] == 36


# --- Registry: 4 axes ---

def test_live_registry_what_you_hold_four_axes(auth_headers):
    r = requests.get(f"{BASE_URL}/api/registry/what_you_hold", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    body = r.json()
    for axis in ("connected", "holdings", "intelligence", "backend"):
        assert axis in body


def test_live_registry_holdings_measured_unmeasured(auth_headers):
    r = requests.get(f"{BASE_URL}/api/registry/what_you_hold", headers=auth_headers, timeout=15)
    body = r.json()
    rows = body["holdings"]["rows"]
    for row in rows:
        assert isinstance(row["measured"], bool)
        if not row["measured"]:
            assert row["unmeasured_reason_plain"]


# --- Registry: briefs + gaps with CTA labels ---

def test_live_briefs_put_this_to_work_cta(auth_headers):
    r = requests.get(f"{BASE_URL}/api/registry/opportunity_briefs", headers=auth_headers, timeout=15)
    body = r.json()
    assert body["count"] >= 2
    for b in body["briefs"]:
        assert b["cta_label"] == "Put this to work"
        assert "Shape this objective" not in b.get("summary_plain", "")
    # Sample marking present.
    assert any(b.get("is_sample") is True for b in body["briefs"])


def test_live_gaps_queue_this_gap_cta(auth_headers):
    r = requests.get(f"{BASE_URL}/api/registry/gap_register", headers=auth_headers, timeout=15)
    body = r.json()
    assert body["count"] >= 3
    for g in body["gaps"]:
        assert g["cta_label"] == "Queue this gap"
    assert any(g.get("is_sample") is True for g in body["gaps"])


def test_live_queue_gap_idempotent(auth_headers):
    r = requests.get(f"{BASE_URL}/api/registry/gap_register", headers=auth_headers, timeout=15)
    open_gaps = [g for g in r.json()["gaps"] if g["state"] == "open"]
    assert open_gaps
    gid = open_gaps[0]["gap_id"]
    r1 = requests.post(f"{BASE_URL}/api/registry/gap_register/queue",
                       json={"gap_id": gid}, headers=auth_headers, timeout=15)
    assert r1.status_code == 200
    sid = r1.json()["queued_use_data_session_id"]
    r2 = requests.post(f"{BASE_URL}/api/registry/gap_register/queue",
                       json={"gap_id": gid}, headers=auth_headers, timeout=15)
    assert r2.json()["queued_use_data_session_id"] == sid


# --- Prove: 4 shapes ---

def test_live_prove_answered_shape(auth_headers):
    r = requests.post(f"{BASE_URL}/api/prove/ask", json={
        "question": "How many Q1 partner rebate rows carry an established-fact class?",
    }, headers=auth_headers, timeout=20)
    body = r.json()
    assert body["shape"] == "answered"
    assert body["trace_id"].startswith("trc-")


def test_live_prove_not_extracted_yet_offers_queue(auth_headers):
    r = requests.post(f"{BASE_URL}/api/prove/ask", json={
        "question": "Zzq unique question about outer-galaxy freight tonnage ratios 42.",
    }, headers=auth_headers, timeout=20)
    body = r.json()
    assert body["shape"] == "not_extracted_yet"
    assert body["queue_offered"] is True
    assert body["gap_id"].startswith("gap-")


def test_live_prove_evidence_cannot_support_no_queue(auth_headers):
    r = requests.post(f"{BASE_URL}/api/prove/ask", json={
        "question": "What price did the Q3 board approve for the enterprise tier?",
    }, headers=auth_headers, timeout=20)
    body = r.json()
    assert body["shape"] == "evidence_cannot_support_it"
    assert body.get("queue_offered") is False
    assert body["reason_code"]


def test_live_prove_something_broke_never_refusal(auth_headers):
    """DB-2 BINDING · a fault MUST NOT carry a refusal reason_code or queue offer."""
    r = requests.post(f"{BASE_URL}/api/prove/ask", json={
        "question": "Show the raw archive for the March broker export.",
    }, headers=auth_headers, timeout=20)
    body = r.json()
    assert body["shape"] == "something_broke"
    assert body["fault_channel_ref"]
    assert body["fault_reason_plain"]
    assert "reason_code" not in body
    assert body.get("queue_offered") is False


def test_live_prove_trace_three_layers(auth_headers):
    r1 = requests.post(f"{BASE_URL}/api/prove/ask", json={
        "question": "How many Q1 partner rebate rows carry an established-fact class?",
    }, headers=auth_headers, timeout=20)
    tid = r1.json()["trace_id"]
    r2 = requests.get(f"{BASE_URL}/api/prove/trace/{tid}", headers=auth_headers, timeout=15)
    body = r2.json()
    layers = body["walk_layers"]
    assert [x["layer"] for x in layers] == ["claim", "reasoning", "raw_facts"]
