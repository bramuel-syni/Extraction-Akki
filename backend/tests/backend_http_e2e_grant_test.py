"""HTTP-level e2e verification through external REACT_APP_BACKEND_URL for
engineer-key grant single-source propagation. Fresh uuid emails per test."""
import uuid
import requests

_env = {}
with open("/app/frontend/.env") as f:
    for line in f:
        if "=" in line:
            k, v = line.strip().split("=", 1)
            _env[k] = v
BASE = _env["REACT_APP_BACKEND_URL"].rstrip("/")

ADMIN = {"email": "admin@rms.example.com", "password": "admin-b1-test-pw"}
PLANE_BODY = {"retrieval_scope": "estate://http-e2e"}
CONTRIBUTE_BODY = {
    "content_ref": "artifacts/attack",
    "five_ring_stamp": {
        "content": {"text": "x"},
        "provenance": {"source_ref": "s"},
        "defensibility": {"class": "utterance"},
        "context": {"n": "t"},
        "re_extraction_handle": {"handle_id": "h"},
    },
    "class_declared": "utterance",
    "cited_sources": ["s"],
    "cited_source_classes": ["utterance"],
}


def _register(email, password="Pw!23456"):
    r = requests.post(f"{BASE}/api/auth/register", json={"email": email, "password": password})
    assert r.status_code in (200, 201), r.text
    return r.json()


def _login(email, password="Pw!23456"):
    r = requests.post(f"{BASE}/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


def _admin_token():
    return _login(**ADMIN)["access_token"]


def _grant_body(email, scope):
    return {
        "grantee_email": email,
        "key_class": "external",
        "path": "live_query",
        "floor": "utterance",
        "scope": scope,
        "justification": "e2e http test",
        "lawful_basis_ref": "lb:test:m_g_e2e",
    }


def test_http_e2e_grant_propagation_full_flow():
    uniq = uuid.uuid4().hex[:10]
    email = f"m-g-e2e-http-{uniq}@example.com"
    reg = _register(email)
    assert reg["identity"]["key_grants"] == []

    # No grant → memory create denied (403 with reason, no outcome)
    tok = reg["access_token"]
    r = requests.post(f"{BASE}/api/memory/planes",
                      headers={"Authorization": f"Bearer {tok}"}, json=PLANE_BODY)
    assert r.status_code == 403, r.text
    body = r.json()
    assert body.get("reason") == "auth_scope_insufficient"
    assert "outcome" not in body

    # Admin grants
    atok = _admin_token()
    scope = f"tenant-e2e-{uniq}"
    gr = requests.post(f"{BASE}/api/engineer/key_grants",
                      headers={"Authorization": f"Bearer {atok}"},
                      json=_grant_body(email, scope))
    assert gr.status_code in (200, 201), gr.text
    grant_id = gr.json().get("grant_id") or gr.json().get("id")
    assert grant_id

    # User relogin → identity carries the grant
    li = _login(email)
    kgs = li["identity"]["key_grants"]
    assert len(kgs) == 1
    assert kgs[0]["grant_id"] == grant_id
    assert kgs[0]["scope"] == scope

    tok2 = li["access_token"]
    r = requests.post(f"{BASE}/api/memory/planes",
                      headers={"Authorization": f"Bearer {tok2}"}, json=PLANE_BODY)
    assert r.status_code == 201, r.text
    plane = r.json()
    assert plane["issued_to_integration_key"] == grant_id

    # Revoke
    rv = requests.post(f"{BASE}/api/engineer/key_grants/{grant_id}/revoke",
                       headers={"Authorization": f"Bearer {atok}"},
                       json={"reason": "e2e revoke"})
    assert rv.status_code in (200, 204), rv.text

    # Relogin → empty
    li2 = _login(email)
    assert li2["identity"]["key_grants"] == []
    tok3 = li2["access_token"]
    r = requests.post(f"{BASE}/api/memory/planes",
                      headers={"Authorization": f"Bearer {tok3}"}, json=PLANE_BODY)
    assert r.status_code == 403
    assert r.json().get("reason") == "auth_scope_insufficient"

    # OLD refresh token minted BEFORE revocation must also yield empty
    old_refresh = li["refresh_token"]
    rf = requests.post(f"{BASE}/api/auth/refresh",
                       headers={"Authorization": f"Bearer {old_refresh}"})
    assert rf.status_code == 200, rf.text
    assert rf.json()["identity"]["key_grants"] == []


def test_http_e2e_cross_key_break_in():
    uniq = uuid.uuid4().hex[:8]
    ea = f"m-g-e2e-http-a-{uniq}@example.com"
    eb = f"m-g-e2e-http-b-{uniq}@example.com"
    _register(ea); _register(eb)

    atok = _admin_token()
    ga = requests.post(f"{BASE}/api/engineer/key_grants",
                       headers={"Authorization": f"Bearer {atok}"},
                       json=_grant_body(ea, f"tenant-a-{uniq}")).json()
    gb = requests.post(f"{BASE}/api/engineer/key_grants",
                       headers={"Authorization": f"Bearer {atok}"},
                       json=_grant_body(eb, f"tenant-b-{uniq}")).json()
    assert ga.get("grant_id") and gb.get("grant_id")

    la = _login(ea); lb = _login(eb)
    ta = la["access_token"]; tb = lb["access_token"]

    pa = requests.post(f"{BASE}/api/memory/planes",
                       headers={"Authorization": f"Bearer {ta}"}, json=PLANE_BODY)
    assert pa.status_code == 201, pa.text
    a_plane_id = pa.json()["plane_id"]

    # B tries A's plane — 3 gates
    for method, path, jbody in [
        ("GET", f"/api/memory/planes/{a_plane_id}", None),
        ("POST", f"/api/memory/planes/{a_plane_id}/contribute", CONTRIBUTE_BODY),
        ("POST", f"/api/memory/planes/{a_plane_id}/revoke", {"reason": "attack"}),
    ]:
        r = requests.request(method, f"{BASE}{path}",
                             headers={"Authorization": f"Bearer {tb}"},
                             json=jbody)
        assert r.status_code == 403, f"{method} {path} → {r.status_code} {r.text}"
        body = r.json()
        assert body.get("reason") == "auth_scope_insufficient", body
        assert "outcome" not in body, body

    # B's own plane creation succeeds
    pb = requests.post(f"{BASE}/api/memory/planes",
                       headers={"Authorization": f"Bearer {tb}"}, json=PLANE_BODY)
    assert pb.status_code == 201, pb.text


def test_http_admin_full_scope_read():
    uniq = uuid.uuid4().hex[:8]
    ex = f"m-g-e2e-http-x-{uniq}@example.com"
    _register(ex)
    atok = _admin_token()
    g = requests.post(f"{BASE}/api/engineer/key_grants",
                      headers={"Authorization": f"Bearer {atok}"},
                      json=_grant_body(ex, f"tenant-x-{uniq}")).json()
    assert g.get("grant_id")
    lx = _login(ex)
    px = requests.post(f"{BASE}/api/memory/planes",
                       headers={"Authorization": f"Bearer {lx['access_token']}"},
                       json=PLANE_BODY)
    assert px.status_code == 201, px.text
    pid = px.json()["plane_id"]

    r = requests.get(f"{BASE}/api/memory/planes/{pid}",
                     headers={"Authorization": f"Bearer {atok}"})
    assert r.status_code == 200, r.text
    r2 = requests.get(f"{BASE}/api/memory/planes/{pid}/reconstructed_state",
                      headers={"Authorization": f"Bearer {atok}"})
    assert r2.status_code == 200, r2.text


def test_http_auth_taxonomy_discipline():
    # Unauthenticated → auth denial, no outcome key
    r = requests.get(f"{BASE}/api/memory/planes")
    assert r.status_code in (401, 403)
    body = r.json()
    assert "outcome" not in body
    assert "reason" in body or "detail" in body

    # Governed refusal (admin JWT, nonexistent plane) → carries outcome=refused
    atok = _admin_token()
    r = requests.get(f"{BASE}/api/memory/planes/mp-doesnotexist",
                     headers={"Authorization": f"Bearer {atok}"})
    body = r.json()
    assert body.get("outcome") == "refused", body
    assert "reason" in body


def test_http_parity_and_readyz():
    r = requests.get(f"{BASE}/api/readyz")
    assert r.status_code == 200
    b = r.json()
    assert b.get("parity_count") == 34
    assert b.get("expected_parity") == 34
    assert b.get("status") == "ready"

    r2 = requests.get(f"{BASE}/api/system/build_info")
    assert r2.status_code == 200
    assert r2.json().get("parity_count") == 34


def test_openapi_contribute_example():
    r = requests.get(f"{BASE}/api/openapi.json")
    assert r.status_code == 200
    spec = r.json()
    # example lives on the ContributeRequest schema
    ex = spec["components"]["schemas"]["ContributeRequest"].get("example")
    assert ex is not None, "example missing"
    for k in ("content_ref", "five_ring_stamp", "class_declared",
              "cited_sources", "cited_source_classes", "rights_class", "intended_scope"):
        assert k in ex, f"missing {k} in example"
    for ring in ("content", "provenance", "defensibility", "context", "re_extraction_handle"):
        assert ring in ex["five_ring_stamp"], f"ring {ring} missing"
