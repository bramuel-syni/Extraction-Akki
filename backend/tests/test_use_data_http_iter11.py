"""
HTTP-level regression tests for /api/use_data/* on the preview URL.
Iteration 11 — verifies contracts described in review_request.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@rms.example.com"
ADMIN_PASSWORD = "admin-b1-test-pw"


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                      timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# --- readyz / build_info parity ------------------------------------------------
def test_readyz_parity_36():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["parity_count"] == 36
    assert data["expected_parity"] == 36
    assert data["status"] == "ready"


def test_build_info_parity_36():
    r = requests.get(f"{BASE_URL}/api/system/build_info", timeout=10)
    assert r.status_code == 200
    assert r.json()["parity_count"] == 36


# --- ceiling read/write --------------------------------------------------------
def test_ceiling_get_returns_1000_usd(h):
    r = requests.get(f"{BASE_URL}/api/use_data/ceiling", headers=h, timeout=10)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["ceiling_usd"] == 1000.0
    assert data["currency"] == "USD"
    assert data["change_path"] == "change_a_rule_ceremony_only"


def test_ceiling_write_refused_change_a_rule_only(h):
    r = requests.post(f"{BASE_URL}/api/use_data/ceiling", headers=h,
                      json={"ceiling_usd": 5000}, timeout=10)
    assert r.status_code == 422, r.text
    data = r.json()
    assert data.get("outcome") == "refused"
    assert data.get("reason") == "auto_run_ceiling_change_a_rule_only"


# --- door creation -------------------------------------------------------------
@pytest.mark.parametrize("door", ["integrate_an_app", "export_or_license", "train_a_model"])
def test_session_create_valid_doors(h, door):
    r = requests.post(f"{BASE_URL}/api/use_data/session", headers=h,
                      json={"door": door}, timeout=10)
    assert r.status_code in (200, 201), r.text
    data = r.json()
    # Envelope should reference door
    body_str = str(data)
    assert door in body_str


def test_session_create_invalid_door_rejected(h):
    r = requests.post(f"{BASE_URL}/api/use_data/session", headers=h,
                      json={"door": "delete_a_dataset"}, timeout=10)
    assert r.status_code == 422


# --- commit outcomes -----------------------------------------------------------
def _create_session(h, door="integrate_an_app"):
    r = requests.post(f"{BASE_URL}/api/use_data/session", headers=h,
                      json={"door": door}, timeout=10)
    assert r.status_code in (200, 201), r.text
    data = r.json()
    # find session id
    sid = data.get("session_id") or data.get("id") or data.get("sid")
    if not sid and isinstance(data.get("session"), dict):
        sid = data["session"].get("session_id") or data["session"].get("id")
    assert sid, f"no session id in {data}"
    return sid


ALL_PASS = {
    "rights_declared": "internal_only",
    "training_rights_inheritable": True,
    "privacy_floor_declared": "k>=10",
    "pii_posture_declared": "pseudonymized",
    "class_d_resolvable": True,
    "proposed_budget_usd": 500.0,
    "scope_source_ids": ["src-a"],
    "connected_source_ids": ["src-a"],
    "censused_source_ids": ["src-a"],
}


def _commit(h, sid, payload):
    return requests.post(f"{BASE_URL}/api/use_data/session/{sid}/commit",
                         headers=h, json=payload, timeout=15)


def test_commit_all_pass_runs_now(h):
    sid = _create_session(h)
    r = _commit(h, sid, ALL_PASS)
    assert r.status_code == 200, r.text
    data = r.json()
    verdict = data.get("verdict", data)
    assert verdict.get("outcome") == "runs_now"
    # 5 checks all passed
    checks = verdict.get("checks", [])
    assert len(checks) == 5
    assert all(c.get("status") == "passed" for c in checks)
    # ceiling at_or_under
    aur = verdict.get("auto_run_ceiling", {})
    assert aur.get("at_or_under") is True
    # verbatim carrier
    assert verdict.get("verbatim_carrier") == "Every commission verdict lands in the record the DPO reads."


def test_commit_rights_null_absolute_no_route(h):
    sid = _create_session(h)
    payload = {**ALL_PASS, "rights_declared": None}
    r = _commit(h, sid, payload)
    assert r.status_code in (200, 422), r.text
    verdict = r.json().get("verdict", r.json())
    assert verdict.get("outcome") == "refused"
    ref = verdict.get("refusal", {})
    assert ref.get("kind") == "absolute"
    assert ref.get("route_to_approval") is None


def test_commit_class_d_unresolvable_absolute_no_route(h):
    sid = _create_session(h)
    payload = {**ALL_PASS, "class_d_resolvable": False}
    r = _commit(h, sid, payload)
    verdict = r.json().get("verdict", r.json())
    assert verdict.get("outcome") == "refused"
    ref = verdict.get("refusal", {})
    assert ref.get("kind") == "absolute"
    assert ref.get("route_to_approval") is None


def test_commit_privacy_floor_missing_escalatable(h):
    sid = _create_session(h)
    payload = {**ALL_PASS, "privacy_floor_declared": None}
    r = _commit(h, sid, payload)
    verdict = r.json().get("verdict", r.json())
    assert verdict.get("outcome") == "refused"
    ref = verdict.get("refusal", {})
    assert ref.get("kind") == "escalatable"
    assert ref.get("route_to_approval") is not None


def test_commit_over_ceiling_held_for_check(h):
    sid = _create_session(h)
    payload = {**ALL_PASS, "proposed_budget_usd": 2500.0}
    r = _commit(h, sid, payload)
    assert r.status_code == 200, r.text
    verdict = r.json().get("verdict", r.json())
    assert verdict.get("outcome") == "held_for_check"
    aur = verdict.get("auto_run_ceiling", {})
    assert aur.get("dpo_countersign_required") is True
    assert aur.get("at_or_under") is False
    ref = verdict.get("refusal") or {}
    text = str(ref) + str(verdict)
    assert "Pending policy check" in text or "policy_check" in text.lower()


def test_anonymous_read_session_401(h):
    sid = _create_session(h)
    r = requests.get(f"{BASE_URL}/api/use_data/session/{sid}", timeout=10)
    assert r.status_code == 401
    data = r.json()
    # auth_missing marker somewhere
    assert "auth_missing" in str(data).lower() or "missing" in str(data).lower()
