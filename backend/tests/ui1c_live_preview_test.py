"""UI-1-C live-preview integration tests via public REACT_APP_BACKEND_URL."""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "admin@rms.example.com", "password": "admin-b1-test-pw"},
                      timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def analyst_token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": "demo.analyst@demo.rms.example.com", "password": "demo-analyst-pw"},
                      timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


def _h(t):
    return {"Authorization": f"Bearer {t}"}


# --- Parity regression --------------------------------------------------------
def test_readyz_parity_36():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=15)
    assert r.status_code == 200
    j = r.json()
    assert j["parity_count"] == 36
    assert j["expected_parity"] == 36


# --- Landing shape ------------------------------------------------------------
def test_connect_landing_five_sections(admin_token):
    r = requests.get(f"{BASE_URL}/api/connect/landing", headers=_h(admin_token), timeout=15)
    assert r.status_code == 200
    b = r.json()
    assert b["canon_ref"] == "Canon §4.1"
    for k in ("headline", "status_banner", "cards", "record_rows", "footer"):
        assert k in b, f"missing {k}"
    assert b["footer"]["govern_link_route"].startswith("/govern")


# --- Single-source-of-truth ceiling (Owner's critical gate EE-R4) ------------
def test_ceiling_single_source_of_truth(admin_token):
    r_rules = requests.get(f"{BASE_URL}/api/connect/rules", headers=_h(admin_token), timeout=15)
    r_ceil = requests.get(f"{BASE_URL}/api/use_data/ceiling", headers=_h(admin_token), timeout=15)
    assert r_rules.status_code == 200
    assert r_ceil.status_code == 200
    rule7 = next(x for x in r_rules.json()["rules"] if x["rule_id"] == "rule7_commission_auto_run_ceiling")
    ceiling = r_ceil.json()["ceiling_usd"]
    assert rule7["value"] == ceiling == 1000.0, (
        f"parallel-mechanism defect: rule7={rule7['value']} vs ceiling={ceiling}"
    )
    print(f"MATCHED: rule7.value={rule7['value']} == /use_data/ceiling.ceiling_usd={ceiling}")


# --- Direct-write refuses -----------------------------------------------------
def test_direct_write_rule7_refuses(admin_token):
    r = requests.post(f"{BASE_URL}/api/connect/rules/rule7_commission_auto_run_ceiling",
                      headers=_h(admin_token), json={"value": 5000}, timeout=15)
    assert r.status_code == 422
    b = r.json()
    assert b["outcome"] == "refused"
    assert b["route"] == "/govern/change-rule"


# --- 4-state source grammar ---------------------------------------------------
def test_sources_four_states(admin_token):
    r = requests.get(f"{BASE_URL}/api/connect/sources", headers=_h(admin_token), timeout=15)
    assert r.status_code == 200
    srcs = r.json()["sources"]
    states = {s["state"] for s in srcs if s.get("is_sample")}
    assert {"connected", "in_progress", "awaiting_credentials", "failed"}.issubset(states), states
    failed = [s for s in srcs if s.get("state") == "failed" and s.get("is_sample")]
    assert failed
    for s in failed:
        assert len(s.get("failure_reason_plain", "")) > 20


# --- Role gate ----------------------------------------------------------------
def test_analyst_cannot_add_source(analyst_token):
    r = requests.post(f"{BASE_URL}/api/connect/sources",
                      headers=_h(analyst_token),
                      json={"source_id": "src-analyst-attempt", "name": "nope",
                            "protocol": "postgres", "cadence": "daily_09",
                            "rights_declared": "internal_only", "pii_posture": "pseudonymize"},
                      timeout=15)
    assert r.status_code == 403
    assert r.json()["reason"] == "auth_scope_insufficient"


def test_analyst_can_read_landing(analyst_token):
    r = requests.get(f"{BASE_URL}/api/connect/landing", headers=_h(analyst_token), timeout=15)
    assert r.status_code == 200


# --- Setup A5: declare a new registry -----------------------------------------
def test_setup_declare_registry(admin_token):
    name = f"ui1c_test_{int(time.time())}"
    r = requests.post(f"{BASE_URL}/api/connect/declared_registries",
                      headers=_h(admin_token),
                      json={"registry_name": name, "schema_class": "redact"},
                      timeout=15)
    assert r.status_code in (200, 201), r.text
    # List and confirm it appears empty-fail-closed
    r2 = requests.get(f"{BASE_URL}/api/connect/declared_registries",
                      headers=_h(admin_token), timeout=15)
    assert r2.status_code == 200
    names = [x.get("registry_name") or x.get("name") for x in r2.json()["declared"]]
    assert name in names
    row = next(x for x in r2.json()["declared"] if (x.get("registry_name") or x.get("name")) == name)
    assert row["is_empty"] is True
