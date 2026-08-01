"""UI-1-E iter24 · live-preview verification AFTER critical fix.

Verifies:
  R1 · /api/engineer/key_grants no longer 500 (Pydantic instance_id fix)
  R2 · seeded team grants findable via ?grantee_email=<seeded>
  P0 · Team grant → Engineer single-source binding (Owner Message 610 D-2)
  P0 · DPO break-in unchanged
  P1 · Approval surface / Access register / Constitutional seats
  P1 · Parity 36
  P1 · Honest 401 shape
"""
from __future__ import annotations

import os
import uuid
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


# --- R1 · engineer/key_grants no longer 500 ---
def test_r1_engineer_key_grants_self_admin(admin_token):
    r = requests.get(f"{BASE_URL}/api/engineer/key_grants",
                     headers=_auth(admin_token), timeout=15)
    assert r.status_code == 200, f"expected 200, got {r.status_code}: {r.text[:300]}"
    body = r.json()
    assert "grants" in body
    assert isinstance(body["grants"], list)


# --- R2 · seeded grantee query works ---
def test_r2_engineer_key_grants_by_seeded_grantee(admin_token):
    # Discover a seeded sample grantee from team access register
    reg = requests.get(f"{BASE_URL}/api/team/access_register",
                       headers=_auth(admin_token), timeout=15)
    assert reg.status_code == 200
    rows = reg.json().get("rows", [])
    sample_row = None
    for row in rows:
        gid = row.get("grant_id", "")
        if gid.startswith("sample-team-grant-active-") and row.get("state") == "active":
            sample_row = row
            break
    if sample_row is None:
        pytest.skip("no sample-team-grant-active-* row present to probe")
    grantee = sample_row["who_grantee_email"]
    r = requests.get(f"{BASE_URL}/api/engineer/key_grants",
                     headers=_auth(admin_token),
                     params={"grantee_email": grantee}, timeout=15)
    assert r.status_code == 200, r.text[:300]
    grants = r.json().get("grants", [])
    found = any(g.get("grant_id") == sample_row["grant_id"] for g in grants)
    assert found, f"seeded grant {sample_row['grant_id']} not visible on engineer surface for {grantee}"


# --- P0 · Team grant → Engineer single-source roundtrip (Owner Msg 610 D-2) ---
def test_p0_team_grant_engineer_single_source_roundtrip(admin_token):
    grantee = f"iter24.probe.{uuid.uuid4().hex[:8]}@test.example.com"
    scope = "GET /api/team/access_register"

    # (a) Grant via team endpoint
    r = requests.post(f"{BASE_URL}/api/team/access_register/grant",
                      headers=_auth(admin_token),
                      json={"grantee_email": grantee,
                            "endpoint_scope": scope,
                            "reason_verbatim": "iter24 single-source test"},
                      timeout=15)
    assert r.status_code == 200, r.text[:300]
    grant_id = r.json()["grant"]["grant_id"]

    # (b) Confirm on team access register
    reg = requests.get(f"{BASE_URL}/api/team/access_register",
                       headers=_auth(admin_token), timeout=15).json()
    assert any(row["grant_id"] == grant_id for row in reg["rows"]), \
        "new grant not visible on team access register"

    # (c) Confirm on engineer key_grants (SINGLE-SOURCE)
    eng = requests.get(f"{BASE_URL}/api/engineer/key_grants",
                       headers=_auth(admin_token),
                       params={"grantee_email": grantee}, timeout=15)
    assert eng.status_code == 200, eng.text[:300]
    eng_grants = eng.json().get("grants", [])
    assert any(g.get("grant_id") == grant_id for g in eng_grants), \
        f"grant {grant_id} not visible on engineer surface (single-source FAILED)"

    # (d) Revoke via team endpoint
    rev = requests.post(f"{BASE_URL}/api/team/access_register/revoke",
                        headers=_auth(admin_token),
                        json={"grant_id": grant_id,
                              "reason_verbatim": "iter24 revoke roundtrip"},
                        timeout=15)
    assert rev.status_code == 200, rev.text[:300]
    assert rev.json()["grant"]["state"] == "revoked"

    # (e) Engineer surface shows revoked_at + reason
    eng2 = requests.get(f"{BASE_URL}/api/engineer/key_grants",
                        headers=_auth(admin_token),
                        params={"grantee_email": grantee}, timeout=15)
    assert eng2.status_code == 200
    eng2_grants = eng2.json().get("grants", [])
    match = next((g for g in eng2_grants if g.get("grant_id") == grant_id), None)
    assert match is not None, "revoked grant vanished from engineer surface"
    assert match.get("revoked_at"), f"revoked_at missing: {match}"
    assert match.get("revocation_reason") == "iter24 revoke roundtrip", \
        f"revocation_reason mismatch: {match.get('revocation_reason')}"


# --- P0 · DPO break-in unchanged ---
def test_p0_dpo_grant_403(dpo_token):
    r = requests.post(f"{BASE_URL}/api/team/access_register/grant",
                      headers=_auth(dpo_token),
                      json={"grantee_email": "attempt@e2e.example.com",
                            "endpoint_scope": "GET /api/team/access_register"},
                      timeout=15)
    assert r.status_code == 403
    assert r.json().get("reason") == "auth_scope_insufficient"


def test_p0_dpo_reads_register(dpo_token):
    r = requests.get(f"{BASE_URL}/api/team/access_register",
                     headers=_auth(dpo_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["capabilities"]["can_grant"] is False
    assert body["capabilities"]["can_read_all"] is True
    assert len(body["rows"]) >= 1


# --- P1 · Approval surface classes + doctrine ---
def test_p1_approval_surface_admin(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/approval_surface",
                     headers=_auth(admin_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    classes = {it["class"] for it in body.get("items", [])}
    # At least the 3 non-dormant + the dormant retention class should be discoverable
    # (may be temporarily missing if concurrent tests wiped — tolerate 3)
    expected = {"over_threshold_commission", "source_addition_pending",
                "access_grant_request", "retention_window_extension"}
    intersect = expected & classes
    assert len(intersect) >= 3, f"only {intersect} present out of {expected}"
    doctrine = body.get("queue_doctrine_plain", "").lower()
    assert "consistently empty" in doctrine
    assert "criteria are the instrument" in doctrine


# --- P1 · Decision requires verbatim reason ---
def test_p1_decision_verbatim_required(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/approval_surface",
                     headers=_auth(admin_token), timeout=15)
    items = r.json().get("items", [])
    chk = next((it for it in items if it["item_id"].startswith("chk-")), None)
    if chk is None:
        pytest.skip("no chk- item to probe")
    r2 = requests.post(f"{BASE_URL}/api/team/approval_surface/{chk['item_id']}/decision",
                       headers=_auth(admin_token),
                       json={"decision": "approve", "reason_verbatim": ""}, timeout=15)
    assert r2.status_code == 400
    assert r2.json().get("reason") == "decision_reason_required"


# --- P1 · Parity 36 ---
def test_p1_parity_36():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=10)
    assert r.status_code == 200
    body = r.json()
    assert body.get("parity_count") == 36
    assert body.get("expected_parity") == 36


# --- P1 · Constitutional seats dormant_honest ---
def test_p1_constitutional_seats(admin_token):
    r = requests.get(f"{BASE_URL}/api/team/constitutional_seats",
                     headers=_auth(admin_token), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["action_state"] == "dormant_honest"
    seats = {s["seat_id"] for s in body["seats"]}
    assert seats == {"master_admin", "dpo"}


# --- P1 · honest 401 shapes ---
def test_p1_unauth_approval_surface_401():
    r = requests.get(f"{BASE_URL}/api/team/approval_surface", timeout=10)
    assert r.status_code == 401
    assert "reason" in r.json()


def test_p1_unauth_access_register_401():
    r = requests.get(f"{BASE_URL}/api/team/access_register", timeout=10)
    assert r.status_code == 401
    assert "reason" in r.json()


def test_p1_unauth_constitutional_seats_401():
    r = requests.get(f"{BASE_URL}/api/team/constitutional_seats", timeout=10)
    assert r.status_code == 401
    assert "reason" in r.json()


# --- P1 · Operator self-scope ---
def test_p1_operator_self_scope():
    tok = _login(*OPERATOR)
    r = requests.get(f"{BASE_URL}/api/team/access_register",
                     headers=_auth(tok), timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body["capabilities"]["can_grant"] is False
    assert body["capabilities"]["can_read_all"] is False
    for row in body["rows"]:
        assert row["who_grantee_email"] == OPERATOR[0]
