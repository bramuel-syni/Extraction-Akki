"""UI-1-A Owner viewable-build addendum (2026-07-31) — iter12 verification.

Scope of this suite (addendum-only, not full regression):
  * Four demo identities can log in and receive access_token + roles.
  * GET /api/use_data/sessions returns 1 in_progress + 1 ready (AS-U2 samples).
  * GET /api/use_data/session/{id} carries top-level is_sample=true for samples
    and is_sample=false for fresh sessions.
  * Sample rows are properly per-operator scoped.
  * Total is_sample=true document count == 8 (2 per demo identity x 4).
  * Sessions survive a backend restart (Mongo-backed durability proof).
  * The idempotent seeder does not duplicate sample rows on restart.
"""
import os
import subprocess
import time
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")

DEMO_IDENTITIES = [
    ("demo.master_admin@demo.rms.example.com", "demo-master-admin-pw", "master_admin"),
    ("demo.dpo@demo.rms.example.com",          "demo-dpo-pw",          "dpo"),
    ("demo.operator@demo.rms.example.com",     "demo-operator-pw",     "operator"),
    ("demo.analyst@demo.rms.example.com",      "demo-analyst-pw",      "ask_console_user"),
]


def _login(email: str, password: str) -> str:
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password},
                      timeout=15)
    assert r.status_code == 200, f"login {email}: {r.status_code} {r.text[:200]}"
    return r.json()["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ── Demo identity logins ────────────────────────────────────────────────────
@pytest.mark.parametrize("email,password,expected_role", DEMO_IDENTITIES)
def test_demo_identity_login(email, password, expected_role):
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert "access_token" in body and body["access_token"]
    # identity block may be nested; check via /api/auth/me
    tok = body["access_token"]
    me = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert me.status_code == 200
    roles = me.json().get("identity", {}).get("roles") or me.json().get("roles", [])
    assert expected_role in roles, f"{email}: expected {expected_role} in {roles}"


# ── GET /api/use_data/sessions envelope shape ───────────────────────────────
@pytest.mark.parametrize("email,password,_role", DEMO_IDENTITIES)
def test_sessions_envelope_has_one_sample_each(email, password, _role):
    tok = _login(email, password)
    r = requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok), timeout=15)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    assert set(body.keys()) >= {"in_progress", "ready"}
    ip = [row for row in body["in_progress"] if row.get("is_sample")]
    rd = [row for row in body["ready"] if row.get("is_sample")]
    assert len(ip) == 1, f"{email}: expected 1 in_progress sample got {ip}"
    assert len(rd) == 1, f"{email}: expected 1 ready sample got {rd}"
    assert ip[0]["door"] == "integrate_an_app"
    assert rd[0]["door"] == "export_or_license"
    assert rd[0]["verdict_ref"] is not None
    # required row fields
    for row in ip + rd:
        for field in ("session_id", "door", "opened_at_iso", "is_sample"):
            assert field in row


# ── GET /api/use_data/session/{id} carries top-level is_sample=true ─────────
def test_sample_session_get_carries_top_level_is_sample_flag():
    tok = _login("demo.operator@demo.rms.example.com", "demo-operator-pw")
    listing = requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok), timeout=15).json()
    ip_id = listing["in_progress"][0]["session_id"]
    ready_id = listing["ready"][0]["session_id"]

    ip = requests.get(f"{BASE_URL}/api/use_data/session/{ip_id}", headers=_auth(tok), timeout=15)
    assert ip.status_code == 200, ip.text[:300]
    ip_body = ip.json()
    assert ip_body.get("is_sample") is True
    # Reflection: 3 set, 1 assumed, 1 open
    fields = ip_body["reflection"]["fields"]
    states = [f["state"] for f in fields]
    assert states.count("set") == 3
    assert states.count("assumed") == 1
    assert states.count("open") == 1

    rd = requests.get(f"{BASE_URL}/api/use_data/session/{ready_id}", headers=_auth(tok), timeout=15)
    assert rd.status_code == 200
    rd_body = rd.json()
    assert rd_body.get("is_sample") is True
    assert rd_body["commission"]["verdict_ref"] == "trcv-sample-ready-export-license-fixture"


# ── Cross-operator scoping ───────────────────────────────────────────────────
def test_cross_operator_scoping():
    tok_op = _login("demo.operator@demo.rms.example.com", "demo-operator-pw")
    tok_dpo = _login("demo.dpo@demo.rms.example.com", "demo-dpo-pw")
    op_ids = {r["session_id"] for r in
              requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok_op), timeout=15).json()["in_progress"]
              + requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok_op), timeout=15).json()["ready"]}
    dpo_ids = {r["session_id"] for r in
               requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok_dpo), timeout=15).json()["in_progress"]
               + requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok_dpo), timeout=15).json()["ready"]}
    assert op_ids and dpo_ids
    assert op_ids.isdisjoint(dpo_ids), f"scoping breach: shared IDs {op_ids & dpo_ids}"


# ── Mongo restart durability ─────────────────────────────────────────────────
@pytest.mark.durability
def test_new_session_survives_backend_restart():
    tok = _login("demo.operator@demo.rms.example.com", "demo-operator-pw")
    # Open a new (non-sample) session
    r = requests.post(f"{BASE_URL}/api/use_data/session",
                      headers=_auth(tok), json={"door": "train_a_model"}, timeout=15)
    assert r.status_code in (200, 201), r.text[:300]
    sess = r.json()
    sid = sess["session_id"]
    assert not sid.startswith("s-sample-")

    # Restart backend
    subprocess.run(["sudo", "supervisorctl", "restart", "backend"], check=True)
    time.sleep(8)

    # Re-login (token may still be valid but be safe)
    tok = _login("demo.operator@demo.rms.example.com", "demo-operator-pw")
    got = requests.get(f"{BASE_URL}/api/use_data/session/{sid}", headers=_auth(tok), timeout=15)
    assert got.status_code == 200, got.text[:300]
    body = got.json()
    assert body["session_id"] == sid
    assert body.get("is_sample") is False


# ── Idempotent seeder: 8 sample docs total, no dupes on restart ─────────────
def test_sample_doc_count_is_exactly_8():
    # Aggregate across all four demo identities
    total = 0
    for email, password, _ in DEMO_IDENTITIES:
        tok = _login(email, password)
        body = requests.get(f"{BASE_URL}/api/use_data/sessions", headers=_auth(tok), timeout=15).json()
        total += sum(1 for r in body["in_progress"] if r.get("is_sample"))
        total += sum(1 for r in body["ready"] if r.get("is_sample"))
    assert total == 8, f"expected 8 sample docs (2/identity x 4 identities), got {total}"
