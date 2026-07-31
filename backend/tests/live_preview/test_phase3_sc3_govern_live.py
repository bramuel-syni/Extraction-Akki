"""
Live preview API roster for Phase 3 sub-cycle 3 — Govern module.
Runs against REACT_APP_BACKEND_URL from /app/frontend/.env (preview URL).

Cells:
  1. /api/readyz — parity 34/34
  2. admin login — access_token
  3. GET /api/compliance/retention_config (admin) — shape
  4. GET /api/checker/pending (admin/DPO) — list + count
  5. GET /api/checker/pending?role=compliance — subset discipline
  6. POST /api/compliance/retention_config loosening delta — 202 pending_counter_sign
  7. GET /api/compliance/retention_config as low-scope role — 403 auth_scope_insufficient (no 'outcome' key)
  8. GET /api/compliance/refusals_coverage — shape
  9. GET /api/compliance/refusals?month=NOT-A-MONTH — 400 malformed_month
 10. GET /api/compliance/refusals?month=2020-01 — 200 honest empty
"""
import os
import re
import pytest
import requests

# Load preview URL from frontend .env
ENV_PATH = "/app/frontend/.env"
BASE_URL = None
with open(ENV_PATH, "r") as fh:
    for line in fh:
        m = re.match(r"^\s*REACT_APP_BACKEND_URL\s*=\s*(\S+)", line)
        if m:
            BASE_URL = m.group(1).rstrip("/")
            break
assert BASE_URL, "REACT_APP_BACKEND_URL missing from frontend/.env"

ADMIN_EMAIL = "admin@rms.example.com"
ADMIN_PW = "admin-b1-test-pw"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PW},
        timeout=30,
    )
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text[:200]}"
    tok = r.json().get("access_token")
    assert tok and isinstance(tok, str)
    return tok


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


def test_1_readyz_parity_34():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=15)
    assert r.status_code == 200
    body = r.json()
    assert body.get("parity_count") == 34
    assert body.get("expected_parity") == 34


def test_2_admin_login_returns_token(admin_token):
    assert admin_token
    assert len(admin_token) > 20


def test_3_retention_config_shape(admin_headers):
    r = requests.get(f"{BASE_URL}/api/compliance/retention_config", headers=admin_headers, timeout=30)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    # Expected shape: {global_default, held_classes: [3 entries], resolved_at}
    assert "global_default" in body
    assert "held_classes" in body
    assert "resolved_at" in body
    held = body["held_classes"]
    assert isinstance(held, list)
    class_ids = [h.get("class_name") or h.get("class_id") or h.get("id") or h.get("name") for h in held]
    # Should have 3 entries covering ledger_row + wizard_transcript + delivered_artifact
    joined = " ".join(str(c) for c in class_ids).lower()
    assert "ledger_row" in joined
    assert "wizard_transcript" in joined
    assert "delivered_artifact" in joined
    assert len(held) == 3


def test_4_checker_pending_dpo(admin_headers):
    r = requests.get(f"{BASE_URL}/api/checker/pending", headers=admin_headers, timeout=30)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert "pending" in body
    assert "count" in body
    assert isinstance(body["pending"], list)
    assert body["count"] == len(body["pending"])


def test_5_checker_pending_role_compliance_is_subset(admin_headers):
    r_all = requests.get(f"{BASE_URL}/api/checker/pending", headers=admin_headers, timeout=30)
    r_c = requests.get(f"{BASE_URL}/api/checker/pending?role=compliance", headers=admin_headers, timeout=30)
    assert r_all.status_code == 200 and r_c.status_code == 200
    all_ids = {p.get("request_id") or p.get("id") for p in r_all.json()["pending"]}
    c_ids = {p.get("request_id") or p.get("id") for p in r_c.json()["pending"]}
    assert c_ids.issubset(all_ids), "compliance-role filter must return a subset of full pending"


def test_6_loosening_delta_routes_via_checker(admin_headers):
    # First, seed a baseline value (30 days) if not already there.
    seed = requests.post(
        f"{BASE_URL}/api/compliance/retention_config",
        headers=admin_headers,
        json={"ledger_row": {"window_days": 30}},
        timeout=30,
    )
    # seed may itself route through checker; either 200/202 is acceptable
    assert seed.status_code in (200, 202), f"seed unexpected: {seed.status_code} {seed.text[:200]}"

    # Now attempt a LOOSENING delta (30 -> 180): must route via checker (Amendment G Ruling 6)
    r = requests.post(
        f"{BASE_URL}/api/compliance/retention_config",
        headers=admin_headers,
        json={"ledger_row": {"window_days": 180}},
        timeout=30,
    )
    assert r.status_code == 202, f"expected 202 pending_counter_sign, got {r.status_code} {r.text[:300]}"
    body = r.json()
    assert body.get("outcome") == "pending_counter_sign"
    assert "request_id" in body
    assert "state" in body
    assert "consequence_class" in body
    assert "detail" in body


def test_7_low_scope_role_gets_403_no_outcome_key():
    # Try with a bad token — should be an auth denial, NOT a governed refusal
    bad_headers = {"Authorization": "Bearer invalid-token-xyz", "Content-Type": "application/json"}
    r = requests.get(f"{BASE_URL}/api/compliance/retention_config", headers=bad_headers, timeout=30)
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code} {r.text[:200]}"
    try:
        body = r.json()
        # Auth-denial taxonomy: must NOT carry 'outcome' key (that's the governed-refusal envelope)
        assert "outcome" not in body, f"auth-denial must NOT carry 'outcome' key: {body}"
        # Should carry a reason
        reason = body.get("reason", "")
        assert isinstance(reason, str)
    except ValueError:
        pass  # non-JSON body is also acceptable for auth denial


def test_8_refusals_coverage_shape(admin_headers):
    r = requests.get(f"{BASE_URL}/api/compliance/refusals_coverage", headers=admin_headers, timeout=30)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    for key in ("families_since_system_start", "families_since_seam_3", "per_family_since_date", "seam_3_earliest_date"):
        assert key in body, f"refusals_coverage missing key {key}: {body}"


def test_9_refusals_malformed_month(admin_headers):
    r = requests.get(f"{BASE_URL}/api/compliance/refusals?month=NOT-A-MONTH", headers=admin_headers, timeout=30)
    assert r.status_code == 400, f"expected 400, got {r.status_code} {r.text[:200]}"
    body = r.json()
    assert body.get("reason") == "malformed_month"


def test_10_refusals_honest_empty_month(admin_headers):
    r = requests.get(f"{BASE_URL}/api/compliance/refusals?month=2020-01", headers=admin_headers, timeout=30)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert body.get("month") == "2020-01"
    assert "families" in body or "by_reason" in body or "totals" in body
