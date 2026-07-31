"""Live preview URL smoke tests for Phase 3 sub-cycle 2 (Memory + Registry)."""
import os
import requests
import pytest

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{BASE}/api/auth/login", json={
        "email": "admin@rms.example.com",
        "password": "admin-b1-test-pw",
    }, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def test_readyz_parity_34():
    r = requests.get(f"{BASE}/api/readyz", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data["parity_count"] == 36
    assert data["expected_parity"] == 36


def test_admin_login_returns_token(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 10


def test_memory_planes_list(admin_headers):
    r = requests.get(f"{BASE}/api/memory/planes", headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "planes" in body
    assert isinstance(body["planes"], list)


def test_memory_observability_nonexistent_plane_governed_refusal(admin_headers):
    r = requests.get(
        f"{BASE}/api/memory/planes/nonexistent-plane-xyz/observability",
        headers=admin_headers,
        timeout=15,
    )
    assert 400 <= r.status_code < 500, r.status_code
    body = r.json()
    assert body.get("outcome") == "refused"
    assert body.get("reason") == "plane_not_found"
    assert "detail" in body


def test_memory_planes_unauth_denies_without_outcome():
    # No token — should be auth denial (401), NO 'outcome' key present
    r = requests.get(f"{BASE}/api/memory/planes", timeout=15)
    assert r.status_code in (401, 403), r.status_code
    body = r.json()
    assert "outcome" not in body, f"auth denial must NOT carry outcome key; got {body}"


def test_memory_observability_shape_for_first_plane(admin_headers):
    r = requests.get(f"{BASE}/api/memory/planes", headers=admin_headers, timeout=15)
    planes = r.json().get("planes", [])
    if not planes:
        pytest.skip("no planes to observe in this environment")
    pid = planes[0].get("plane_id") or planes[0].get("id")
    r2 = requests.get(f"{BASE}/api/memory/planes/{pid}/observability", headers=admin_headers, timeout=15)
    assert r2.status_code == 200, r2.text
    body = r2.json()
    for key in ("plane_id", "state", "contribution_class_counts", "contribution_counts",
                "publication_counts", "publication_acceptance_rate", "revocation_history"):
        assert key in body, f"missing key {key} in observability body"
    ccc = body["contribution_class_counts"]
    for cls in ("fact", "utterance", "non_factual"):
        assert cls in ccc
    pc = body["publication_counts"]
    for k in ("attempted", "landed", "refused"):
        assert k in pc
    if pc["attempted"] == 0:
        assert body["publication_acceptance_rate"] is None, "rate MUST be null when attempted==0"
