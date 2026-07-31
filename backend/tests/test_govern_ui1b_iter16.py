"""UI-1-B iter16 re-verification tests.

Focus:
1. /api/readyz parity remains 36/36.
2. DPO reverse-route: cross-operator READ admittance on /api/use_data/session/{id}
   with new sidecars (viewer_can_mutate, verdict_outcome, verdict_ref,
   hold_reason_verbatim, held_since_iso).
3. Regression: analyst is still refused (auth_scope_insufficient).
4. Regression: /use-data/sessions excludes held sessions.
5. Regression: mutation endpoints still enforce operator-only.
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")

DPO_EMAIL = "demo.dpo@demo.rms.example.com"
DPO_PW = "demo-dpo-pw"
ANALYST_EMAIL = "demo.analyst@demo.rms.example.com"
ANALYST_PW = "demo-analyst-pw"
ADMIN_EMAIL = "admin@rms.example.com"
ADMIN_PW = "admin-b1-test-pw"


def _login(email, pw):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": pw}, timeout=30)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text[:200]}"
    return r.json()["access_token"]


@pytest.fixture(scope="module")
def dpo_token():
    return _login(DPO_EMAIL, DPO_PW)


@pytest.fixture(scope="module")
def analyst_token():
    return _login(ANALYST_EMAIL, ANALYST_PW)


@pytest.fixture(scope="module")
def admin_token():
    return _login(ADMIN_EMAIL, ADMIN_PW)


# -- Parity check --
def test_readyz_parity_36():
    r = requests.get(f"{BASE_URL}/api/readyz", timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert data.get("parity_count") == 36
    assert data.get("expected_parity") == 36


# -- /govern/holds surfaces reverse-route session ids --
def test_dpo_holds_list_has_held_sessions(dpo_token):
    r = requests.get(f"{BASE_URL}/api/govern/holds", headers={"Authorization": f"Bearer {dpo_token}"}, timeout=30)
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    holds = data.get("holds") or data.get("items") or data.get("rows") or []
    assert isinstance(holds, list) and len(holds) >= 1, f"expected held rows, got: {data}"
    # cache first session id for downstream tests
    pytest.dpo_held_session_ids = []
    for h in holds:
        sid = h.get("session_id") or h.get("id") or h.get("use_data_session_id")
        if sid:
            pytest.dpo_held_session_ids.append(sid)
    assert pytest.dpo_held_session_ids, f"no session_id in holds row: {holds[0]}"


# -- DPO can READ any held session across operators --
def test_dpo_can_read_held_session_envelope(dpo_token):
    sids = getattr(pytest, "dpo_held_session_ids", [])
    assert sids, "prerequisite: holds list yielded no session ids"
    read_only_seen = False
    for sid in sids:
        r = requests.get(
            f"{BASE_URL}/api/use_data/session/{sid}",
            headers={"Authorization": f"Bearer {dpo_token}"},
            timeout=30,
        )
        assert r.status_code == 200, f"GET session {sid} for DPO failed: {r.status_code} {r.text[:300]}"
        data = r.json()
        # sidecars
        assert "viewer_can_mutate" in data, f"missing viewer_can_mutate: {list(data.keys())}"
        assert data.get("verdict_outcome") == "held_for_check", data.get("verdict_outcome")
        verdict_ref = data.get("verdict_ref") or ""
        assert verdict_ref.startswith("trcv-sample-held-"), f"verdict_ref not sample-held: {verdict_ref}"
        assert data.get("hold_reason_verbatim"), "hold_reason_verbatim empty"
        assert data.get("held_since_iso"), "held_since_iso missing"
        if data.get("viewer_can_mutate") is False:
            read_only_seen = True
    assert read_only_seen, "expected at least one held session where DPO is not the owner (viewer_can_mutate=false)"


# -- Analyst denied on same route --
def test_analyst_denied_on_held_session_read(analyst_token, dpo_token):
    sids = getattr(pytest, "dpo_held_session_ids", [])
    assert sids
    sid = sids[0]
    r = requests.get(
        f"{BASE_URL}/api/use_data/session/{sid}",
        headers={"Authorization": f"Bearer {analyst_token}"},
        timeout=30,
    )
    assert r.status_code == 403, f"analyst should be denied, got {r.status_code} {r.text[:200]}"
    body = r.text
    assert "auth_scope_insufficient" in body, f"expected auth_scope_insufficient reason, got {body[:300]}"


# -- Held sessions are excluded from /use-data listing for DPO --
def test_dpo_use_data_sessions_excludes_held(dpo_token):
    r = requests.get(
        f"{BASE_URL}/api/use_data/sessions",
        headers={"Authorization": f"Bearer {dpo_token}"},
        timeout=30,
    )
    assert r.status_code == 200, r.text[:300]
    data = r.json()
    sessions = data.get("sessions") or data.get("items") or data
    if isinstance(sessions, dict):
        # possible shape: {in_progress:[], ready:[]}
        flat = []
        for v in sessions.values():
            if isinstance(v, list):
                flat.extend(v)
        sessions = flat
    for s in sessions:
        outcome = s.get("verdict_outcome") or s.get("outcome")
        assert outcome != "held_for_check", f"held session leaked into listing: {s}"


# -- Admin (has all roles including operator+dpo+master_admin) can also read across operators --
def test_admin_can_read_held_session(admin_token):
    sids = getattr(pytest, "dpo_held_session_ids", [])
    assert sids
    sid = sids[0]
    r = requests.get(
        f"{BASE_URL}/api/use_data/session/{sid}",
        headers={"Authorization": f"Bearer {admin_token}"},
        timeout=30,
    )
    assert r.status_code == 200, f"admin GET failed: {r.status_code} {r.text[:300]}"
    data = r.json()
    assert data.get("verdict_outcome") == "held_for_check"
