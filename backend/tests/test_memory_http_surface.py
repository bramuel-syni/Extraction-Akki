"""HTTP surface smoke for Memory Service Stage B (iteration 5)."""
import os
import re
import requests
import pytest

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@rms.example.com"
ADMIN_PW = "admin-b1-test-pw"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PW}, timeout=15)
    assert r.status_code == 200, r.text
    tok = r.json().get("access_token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def hdr(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def plane(hdr):
    r = requests.post(f"{BASE}/api/memory/planes", headers=hdr, json={"retrieval_scope": "estate://smoke-a"}, timeout=15)
    assert r.status_code == 201, r.text
    return r.json()


def test_admin_login_returns_jwt(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 20


def test_readyz_parity_34():
    r = requests.get(f"{BASE}/api/readyz", timeout=10)
    assert r.status_code == 200
    b = r.json()
    assert b.get("status") == "ready"
    assert b.get("parity_count") == 36
    assert b.get("expected_parity") == 36
    assert b.get("db") == "ok"


def test_build_info_parity_34():
    r = requests.get(f"{BASE}/api/system/build_info", timeout=10)
    assert r.status_code == 200
    assert r.json().get("parity_count") == 36


def test_openapi_has_memory_paths():
    r = requests.get(f"{BASE}/api/openapi.json", timeout=15)
    assert r.status_code == 200
    paths = r.json().get("paths", {})
    for p in [
        "/api/memory/planes",
        "/api/memory/planes/{plane_id}",
        "/api/memory/planes/{plane_id}/contribute",
        "/api/memory/planes/{plane_id}/publish",
        "/api/memory/planes/{plane_id}/revoke",
        "/api/memory/planes/{plane_id}/working_set",
        "/api/memory/planes/{plane_id}/retrieval_scope",
        "/api/memory/planes/{plane_id}/reconstructed_state",
    ]:
        assert p in paths, f"missing {p}"


def test_plane_issue_shape(plane):
    assert re.match(r"^mp-[0-9a-f]{12}$", plane["plane_id"])
    for k in ("issued_to_integration_key", "tenant_id", "contribution_store_ref",
              "working_set_ref", "state", "issued_at"):
        assert k in plane, f"missing {k}"
    assert plane["state"] == "active"
    assert plane["contribution_store_ref"] == f"contributions:{plane['plane_id']}"
    assert plane["working_set_ref"] == f"working_set:{plane['plane_id']}"


def test_get_plane_matches(plane, hdr):
    r = requests.get(f"{BASE}/api/memory/planes/{plane['plane_id']}", headers=hdr, timeout=10)
    assert r.status_code == 200
    assert r.json()["plane_id"] == plane["plane_id"]


def test_unauth_get_plane_401_no_outcome(plane):
    r = requests.get(f"{BASE}/api/memory/planes/{plane['plane_id']}", timeout=10)
    assert r.status_code == 401
    b = r.json()
    assert b.get("reason") == "auth_missing"
    assert "outcome" not in b


def test_plane_not_found_governed(hdr):
    r = requests.get(f"{BASE}/api/memory/planes/mp-000000000000", headers=hdr, timeout=10)
    assert 400 <= r.status_code < 500
    b = r.json()
    assert b.get("outcome") == "refused"
    assert b.get("reason") == "plane_not_found"


def _stamp():
    return {
        "content": "hello",
        "provenance": "user-typed",
        "defensibility": "utterance",
        "context": "smoke",
        "re_extraction_handle": "handle-1",
    }


def _contrib_body(**overrides):
    body = {
        "content_ref": "content:test-ref",
        "five_ring_stamp": _stamp(),
        "class_declared": "utterance",
        "cited_sources": ["src-1"],
        "cited_source_classes": ["utterance"],
    }
    body.update(overrides)
    return body


def test_contribute_happy(plane, hdr):
    body = _contrib_body()
    r = requests.post(f"{BASE}/api/memory/planes/{plane['plane_id']}/contribute",
                      headers=hdr, json=body, timeout=15)
    assert r.status_code == 201, r.text
    b = r.json()
    assert b.get("rights_class") == "internal_only"
    assert b.get("intended_scope") == "mind_context_only"


def test_contribute_class_cap_refused(plane, hdr):
    body = _contrib_body(class_declared="fact")
    r = requests.post(f"{BASE}/api/memory/planes/{plane['plane_id']}/contribute",
                      headers=hdr, json=body, timeout=10)
    assert 400 <= r.status_code < 500
    b = r.json()
    assert b.get("outcome") == "refused"
    assert b.get("reason") == "contribution_over_class_cap"


def test_contribute_rights_forbid_refused(plane, hdr):
    body = _contrib_body(rights_class="registry_visible")
    r = requests.post(f"{BASE}/api/memory/planes/{plane['plane_id']}/contribute",
                      headers=hdr, json=body, timeout=10)
    assert 400 <= r.status_code < 500
    b = r.json()
    assert b.get("outcome") == "refused"
    assert b.get("reason") == "contribution_rights_forbid"


def test_contribute_shape_invalid(plane, hdr):
    bad = _stamp()
    del bad["provenance"]
    body = _contrib_body(five_ring_stamp=bad)
    r = requests.post(f"{BASE}/api/memory/planes/{plane['plane_id']}/contribute",
                      headers=hdr, json=body, timeout=10)
    assert 400 <= r.status_code < 500
    b = r.json()
    assert b.get("outcome") == "refused"
    assert b.get("reason") == "contribution_shape_invalid"


def test_publish_fail_loud_unset_threshold(plane, hdr):
    # First create a real contribution so publish reaches the threshold gate.
    rc = requests.post(f"{BASE}/api/memory/planes/{plane['plane_id']}/contribute",
                       headers=hdr, json=_contrib_body(), timeout=10)
    assert rc.status_code == 201, rc.text
    cid = rc.json().get("contribution_id")
    assert cid
    body = {"contribution_id": cid, "quality_score": 99.0}
    r = requests.post(f"{BASE}/api/memory/planes/{plane['plane_id']}/publish",
                      headers=hdr, json=body, timeout=10)
    assert 400 <= r.status_code < 500
    b = r.json()
    assert b.get("outcome") == "refused"
    assert b.get("reason") == "publication_quality_threshold_unset"


def test_revoke_and_idempotency_and_freeze(hdr):
    r = requests.post(f"{BASE}/api/memory/planes", headers=hdr,
                      json={"retrieval_scope": "estate://revoke-test"}, timeout=10)
    assert r.status_code == 201
    pid = r.json()["plane_id"]

    rc = requests.post(f"{BASE}/api/memory/planes/{pid}/contribute",
                       headers=hdr, json=_contrib_body(), timeout=10)
    assert rc.status_code == 201, rc.text

    r1 = requests.post(f"{BASE}/api/memory/planes/{pid}/revoke", headers=hdr,
                       json={"reason": "test"}, timeout=10)
    assert r1.status_code == 200
    assert r1.json().get("already_revoked") is False

    r2 = requests.post(f"{BASE}/api/memory/planes/{pid}/contribute", headers=hdr, json=_contrib_body(), timeout=10)
    assert 400 <= r2.status_code < 500
    assert r2.json().get("reason") == "plane_revoked"

    r3 = requests.post(f"{BASE}/api/memory/planes/{pid}/revoke", headers=hdr,
                       json={"reason": "test"}, timeout=10)
    assert r3.status_code == 200
    assert r3.json().get("already_revoked") is True

    r4 = requests.get(f"{BASE}/api/memory/planes/{pid}/reconstructed_state", headers=hdr, timeout=10)
    assert r4.status_code == 200
    rs = r4.json()
    assert rs.get("state") == "revoked"
    assert rs.get("contributions_landed_count", 0) >= 1
    assert isinstance(rs.get("contribution_ids"), list)
    assert "integration_key" in rs and "tenant_id" in rs
