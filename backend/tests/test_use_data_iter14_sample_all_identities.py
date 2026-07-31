"""
Iter14 verification tests:
- SAMPLE seeding must be present for ALL 5 identities incl. admin
- Idempotent on restart
- in_progress[0] and ready[0] must be sample rows for each identity
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")

IDENTITIES = [
    ("admin@rms.example.com", "admin-b1-test-pw"),
    ("demo.master_admin@demo.rms.example.com", "demo-master-admin-pw"),
    ("demo.dpo@demo.rms.example.com", "demo-dpo-pw"),
    ("demo.operator@demo.rms.example.com", "demo-operator-pw"),
    ("demo.analyst@demo.rms.example.com", "demo-analyst-pw"),
]


def _login(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=15)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text[:400]}"
    body = r.json()
    tok = body.get("access_token") or body.get("token")
    assert tok, f"no access_token for {email}: {body}"
    return tok


@pytest.mark.parametrize("email,password", IDENTITIES)
def test_sample_pinned_for_identity(email, password):
    tok = _login(email, password)
    r = requests.get(f"{BASE_URL}/api/use_data/sessions", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
    assert r.status_code == 200, f"sessions fetch failed for {email}: {r.status_code} {r.text[:400]}"
    body = r.json()
    in_progress = body.get("in_progress") or []
    ready = body.get("ready") or []
    assert len(in_progress) >= 1, f"{email}: no in_progress rows"
    assert len(ready) >= 1, f"{email}: no ready rows"
    ip0 = in_progress[0]
    r0 = ready[0]
    assert ip0.get("is_sample") is True, f"{email}: in_progress[0].is_sample not True: {ip0}"
    assert str(ip0.get("session_id", "")).startswith("s-sample-in-progress-"), f"{email}: in_progress[0].session_id = {ip0.get('session_id')}"
    assert r0.get("is_sample") is True, f"{email}: ready[0].is_sample not True: {r0}"
    assert str(r0.get("session_id", "")).startswith("s-sample-ready-"), f"{email}: ready[0].session_id = {r0.get('session_id')}"


def test_sample_seed_idempotent_after_restart():
    """Restart backend twice and ensure sample count remains constant."""
    import subprocess, time

    # baseline count via admin
    tok = _login(*IDENTITIES[0])
    def _fetch_ids(t):
        # We cannot query Mongo directly here; instead validate each identity still has exactly 1 sample at [0] on each list.
        counts = {}
        for em, pw in IDENTITIES:
            tok2 = _login(em, pw)
            body = requests.get(f"{BASE_URL}/api/use_data/sessions", headers={"Authorization": f"Bearer {tok2}"}, timeout=15).json()
            ip_samples = [s for s in (body.get("in_progress") or []) if s.get("is_sample")]
            rd_samples = [s for s in (body.get("ready") or []) if s.get("is_sample")]
            counts[em] = (len(ip_samples), len(rd_samples))
        return counts

    before = _fetch_ids(tok)
    subprocess.run(["sudo", "supervisorctl", "restart", "backend"], check=True)
    time.sleep(8)
    # wait for backend to be live
    for _ in range(20):
        try:
            if requests.get(f"{BASE_URL}/api/readyz", timeout=5).status_code == 200:
                break
        except Exception:
            pass
        time.sleep(1)
    after = _fetch_ids(tok)
    assert before == after, f"sample counts changed after restart: before={before} after={after}"
    # Each identity should have exactly 1 sample per list
    for em, (ip, rd) in after.items():
        assert ip == 1, f"{em}: in_progress sample count = {ip}, expected 1"
        assert rd == 1, f"{em}: ready sample count = {rd}, expected 1"
