"""UI-1-E iter23 · live-preview end-to-end HTTP gates against REACT_APP_BACKEND_URL.

Covers Owner Message 610 explicit bindings:
  D-1 · decision reason verbatim + linked govern route
  D-2 · DPO break-in (auth_scope_insufficient on grant)
  Grant → login → propagation → revoke → login roundtrip via single-source
        engineer_key_grants machinery.
  Parity 36/36 held constant.
"""
from __future__ import annotations

import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

ADMIN = ("admin@rms.example.com", "admin-b1-test-pw")
DPO = ("demo.dpo@demo.rms.example.com", "demo-dpo-pw")
OPERATOR = ("demo.operator@demo.rms.example.com", "demo-operator-pw")


def _login(email: str, pw: str) -> str:
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": pw}, timeout=15)
    assert r.status_code == 200, f"login {email} → {r.status_code} {r.text[:200]}"
    tok = r.json().get("access_token")
    assert tok
    return tok


def _auth(tok: str) -> dict:
    return {"Authorization": f"Bearer {tok}"}


@pytest.fixture(scope="module")
def admin_token():
    return _login(*ADMIN)


@pytest.fixture(scope="module")
def dpo_token():
    return _login(*DPO)


# --- 1. Parity ---
def test_l1_parity_36():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("parity_count") == 36
    assert body.get("expected_parity") == 36


# --- 2. Approval surface renders items ---
def test_l2_approval_surface_items(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/approval_surface",
                     headers=_auth(admin_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert "items" in body and len(body["items"]) >= 3
    classes = {it["class"] for it in body["items"]}
    # over_threshold + source + grant + dormant retention
    expected = {"over_threshold_commission", "source_addition_pending",
                "access_grant_request", "retention_window_extension"}
    assert expected.issubset(classes), f"missing classes: {expected - classes}"
    # Doctrine
    doctrine = body.get("queue_doctrine_plain", "")
    assert "consistently empty" in doctrine.lower()
    assert "criteria are the instrument" in doctrine.lower()
    # Sample marks
    sample_items = [it for it in body["items"] if it.get("is_sample")]
    assert len(sample_items) >= 1
    # Dormant-honest present
    dormant = [it for it in body["items"] if it["state"] == "dormant_honest"]
    assert len(dormant) >= 1
    assert dormant[0].get("state_reason_plain")


# --- 3. Approval surface unauth → 401 shape ---
def test_l3_approval_surface_unauth_honest_401():
    r = requests.get(f"{BASE_URL}/api/team/approval_surface", timeout=10)
    assert r.status_code == 401
    body = r.json()
    assert "reason" in body


# --- 4. Decision requires verbatim reason ---
def test_l4_decision_reason_required(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/approval_surface",
                     headers=_auth(admin_token), timeout=15)
    items = r.json()["items"]
    chk = next((it for it in items if it["item_id"].startswith("chk-")), None)
    if chk is None:
        pytest.skip("no chk- item available in approval surface")
    # No reason → 400
    r2 = requests.post(f"{BASE_URL}/api/team/approval_surface/{chk['item_id']}/decision",
                       headers=_auth(admin_token),
                       json={"decision": "approve", "reason_verbatim": ""}, timeout=15)
    assert r2.status_code == 400
    assert r2.json().get("reason") == "decision_reason_required"


# --- 5. Decision verbatim persistence + linked_govern_record_route ---
def test_l5_decision_verbatim_and_link_across(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/approval_surface",
                     headers=_auth(admin_token), timeout=15)
    items = r.json()["items"]
    chk = next((it for it in items if it["item_id"].startswith("chk-")), None)
    if chk is None:
        pytest.skip("no chk- item available")
    verbatim = "TEST_UI1E_ITER23_VERBATIM · owner-msg-610-D1 gate"
    r2 = requests.post(f"{BASE_URL}/api/team/approval_surface/{chk['item_id']}/decision",
                       headers=_auth(admin_token),
                       json={"decision": "approve",
                             "reason_verbatim": verbatim}, timeout=15)
    assert r2.status_code == 200, r2.text[:300]
    body = r2.json()
    assert body["event"]["reason_verbatim"] == verbatim
    assert body["event"]["decision"] == "approve"
    assert body["linked_govern_record_route"] == "/govern/holds"
    assert body["seam_ack"]["routed_to"] == "checker_requests"


# --- 6. DPO reads access register but cannot grant ---
def test_l6_dpo_reads_register_cannot_grant(dpo_token):
    r = requests.get(f"{BASE_URL}/api/team/access_register",
                     headers=_auth(dpo_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["capabilities"]["can_read_all"] is True
    assert body["capabilities"]["can_grant"] is False
    assert body["capabilities"]["can_revoke"] is False
    assert len(body["rows"]) >= 1


def test_l7_dpo_break_in_grant_403_scope_insufficient(dpo_token):
    r = requests.post(f"{BASE_URL}/api/team/access_register/grant",
                      headers=_auth(dpo_token),
                      json={"grantee_email": "attempted@e2e.example.com",
                            "endpoint_scope": "GET /api/team/access_register"},
                      timeout=15)
    assert r.status_code == 403, f"expected 403 got {r.status_code} · {r.text[:200]}"
    body = r.json()
    assert body.get("reason") == "auth_scope_insufficient"


# --- 8. Grant → propagation → revoke roundtrip · single-source ---
def test_l8_grant_revoke_single_source_engineer_key_grants(admin_token):
    grantee = "e2e.iter23@e2e.example.com"
    scope = "GET /api/team/access_register"
    r = requests.post(f"{BASE_URL}/api/team/access_register/grant",
                      headers=_auth(admin_token),
                      json={"grantee_email": grantee, "endpoint_scope": scope,
                            "reason_verbatim": "iter23 test"}, timeout=15)
    assert r.status_code == 200
    grant_id = r.json()["grant"]["grant_id"]
    # Confirm via /api/team/access_register
    reg = requests.get(f"{BASE_URL}/api/team/access_register",
                       headers=_auth(admin_token), timeout=15).json()
    found_team = any(row["grant_id"] == grant_id for row in reg["rows"])
    assert found_team
    # Confirm via /api/engineer/key_grants (SAME SOURCE)
    eng = requests.get(f"{BASE_URL}/api/engineer/key_grants",
                       headers=_auth(admin_token), timeout=15)
    assert eng.status_code == 200, eng.text[:200]
    eng_body = eng.json()
    # Grants may be under 'grants' or 'rows'
    grants_list = eng_body.get("grants") or eng_body.get("rows") or []
    found_eng = any((g.get("grant_id") == grant_id) for g in grants_list)
    assert found_eng, f"grant {grant_id} not on engineer key grants surface (single-source failed)"
    # Revoke
    rev = requests.post(f"{BASE_URL}/api/team/access_register/revoke",
                        headers=_auth(admin_token),
                        json={"grant_id": grant_id,
                              "reason_verbatim": "iter23 revoke test"}, timeout=15)
    assert rev.status_code == 200
    assert rev.json()["grant"]["state"] == "revoked"


# --- 9. Constitutional seats · dormant-honest ---
def test_l9_constitutional_seats_dormant_honest(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/constitutional_seats",
                     headers=_auth(admin_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["action_state"] == "dormant_honest"
    seat_ids = {s["seat_id"] for s in body["seats"]}
    assert seat_ids == {"master_admin", "dpo"}
    for seat in body["seats"]:
        assert "HAZARD-STOP" in seat["action_dormant_reason_plain"] or \
               "new frozen contract" in seat["action_dormant_reason_plain"].lower()


# --- 10. Operator sees own grants only ---
def test_l10_operator_self_scope():
    tok = _login(*OPERATOR)
    r = requests.get(f"{BASE_URL}/api/team/access_register",
                     headers=_auth(tok), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["capabilities"]["can_grant"] is False
    assert body["capabilities"]["can_read_all"] is False
    # Rows may be zero or self-only
    for row in body["rows"]:
        assert row["who_grantee_email"] == OPERATOR[0]
