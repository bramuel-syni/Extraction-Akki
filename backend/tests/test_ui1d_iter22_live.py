"""
Live-preview HTTP tests for UI-1-D iter22 (Owner Message 606 fixes):
- /api/prove/samples returns 4 shape envelopes
- each sample trace_id resolves via /api/prove/trace/{id}
- /api/prove/ask returns 401 with actionable reason when unauthenticated
"""
import os
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@rms.example.com"
ADMIN_PW = "admin-b1-test-pw"
OP_EMAIL = "demo.operator@demo.rms.example.com"
OP_PW = "demo-operator-pw"


def _login(email: str, pw: str) -> str:
    r = requests.post(f"{BASE}/api/auth/login", json={"email": email, "password": pw}, timeout=15)
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    tok = r.json().get("access_token")
    assert tok, "no access_token in login response"
    return tok


@pytest.fixture(scope="module")
def admin_headers():
    return {"Authorization": f"Bearer {_login(ADMIN_EMAIL, ADMIN_PW)}"}


@pytest.fixture(scope="module")
def op_headers():
    return {"Authorization": f"Bearer {_login(OP_EMAIL, OP_PW)}"}


def test_readyz_parity():
    r = requests.get(f"{BASE}/api/readyz", timeout=10)
    assert r.status_code == 200
    d = r.json()
    assert d.get("parity_count") == 36 and d.get("expected_parity") == 36


def test_prove_samples_returns_four_shapes(admin_headers):
    r = requests.get(f"{BASE}/api/prove/samples", headers=admin_headers, timeout=15)
    assert r.status_code == 200, f"body={r.text}"
    d = r.json()
    assert d.get("count") == 4
    samples = d.get("samples") or []
    shapes = sorted([s.get("shape") for s in samples])
    assert shapes == sorted(["answered", "not_extracted_yet", "evidence_cannot_support_it", "something_broke"])
    for s in samples:
        assert s.get("is_sample") is True
        assert isinstance(s.get("trace_id"), str) and s["trace_id"]


def test_prove_samples_trace_ids_all_resolve(admin_headers):
    r = requests.get(f"{BASE}/api/prove/samples", headers=admin_headers, timeout=15)
    assert r.status_code == 200
    for s in r.json()["samples"]:
        tid = s["trace_id"]
        tr = requests.get(f"{BASE}/api/prove/trace/{tid}", headers=admin_headers, timeout=15)
        assert tr.status_code == 200, f"trace {tid} did not resolve: {tr.status_code} {tr.text}"
        body = tr.json()
        assert body["trace_id"] == tid
        assert body["envelope"]["shape"] == s["shape"]
        layers = body.get("walk_layers", [])
        assert len(layers) == 3, f"expected 3 walk_layers for {tid}, got {len(layers)}"
        assert [L["layer"] for L in layers] == ["claim", "reasoning", "raw_facts"]


def test_prove_ask_without_auth_returns_401_or_403_with_reason():
    r = requests.post(f"{BASE}/api/prove/ask", json={"question": "test"}, timeout=15)
    assert r.status_code in (401, 403), f"expected 401/403, got {r.status_code}"
    # honest reason present (verbatim or structured)
    body_text = r.text.lower()
    assert any(k in body_text for k in ["auth", "credential", "token", "unauthorized", "not authenticated"]), body_text


def test_prove_samples_cross_identity_operator(op_headers):
    r = requests.get(f"{BASE}/api/prove/samples", headers=op_headers, timeout=15)
    assert r.status_code == 200
    assert r.json().get("count") == 4


def test_prove_ask_answered_shape(admin_headers):
    r = requests.post(
        f"{BASE}/api/prove/ask",
        headers=admin_headers,
        json={"question": "How many Q1 partner rebate rows carry an established-fact class?"},
        timeout=20,
    )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("shape") == "answered"
    assert body.get("trace_id")


def test_prove_ask_never_seen_returns_not_extracted_yet(admin_headers):
    r = requests.post(
        f"{BASE}/api/prove/ask",
        headers=admin_headers,
        json={"question": "Zzq unique never-seeded question 42"},
        timeout=20,
    )
    assert r.status_code == 200
    assert r.json().get("shape") == "not_extracted_yet"


def test_prove_ask_evidence_cannot_support(admin_headers):
    r = requests.post(
        f"{BASE}/api/prove/ask",
        headers=admin_headers,
        json={"question": "What price did the Q3 board approve for the enterprise tier?"},
        timeout=20,
    )
    assert r.status_code == 200
    assert r.json().get("shape") == "evidence_cannot_support_it"


def test_prove_ask_something_broke(admin_headers):
    r = requests.post(
        f"{BASE}/api/prove/ask",
        headers=admin_headers,
        json={"question": "Show the raw archive for the March broker export."},
        timeout=20,
    )
    assert r.status_code == 200
    assert r.json().get("shape") == "something_broke"
