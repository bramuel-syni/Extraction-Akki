"""UI-1-B iter15 — Govern module rebuild verification.

Tests the endpoints backing:
- §7.1 Trust Center two halves + record buckets
- §7.2 Enforcement class split
- §7.3 Estate rules record
- §7.4 Registries upload/diff/commit asymmetry
- §7.5 Rule change ceremony via checker
- §7.6 Holds surface reverse-route
- Parity + auth-scope refusal
"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://governance-scan-3.preview.emergentagent.com").rstrip("/")

ADMIN = ("admin@rms.example.com", "admin-b1-test-pw")
DPO = ("demo.dpo@demo.rms.example.com", "demo-dpo-pw")
ANALYST = ("demo.analyst@demo.rms.example.com", "demo-analyst-pw")


def _login(email, password):
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password}, timeout=30)
    assert r.status_code == 200, f"login failed for {email}: {r.status_code} {r.text}"
    tok = r.json().get("access_token")
    assert tok, f"no access_token in login response: {r.text}"
    return tok


@pytest.fixture(scope="module")
def admin_headers():
    return {"Authorization": f"Bearer {_login(*ADMIN)}"}


@pytest.fixture(scope="module")
def dpo_headers():
    return {"Authorization": f"Bearer {_login(*DPO)}"}


@pytest.fixture(scope="module")
def analyst_headers():
    return {"Authorization": f"Bearer {_login(*ANALYST)}"}


class TestParity:
    def test_parity_still_36(self):
        r = requests.get(f"{BASE_URL}/api/readyz", timeout=10)
        assert r.status_code == 200
        d = r.json()
        assert d["parity_count"] == 36
        assert d["expected_parity"] == 36


class TestTrustCenter:
    """§7.1 + §7.2"""

    def test_trust_center_record_as_dpo(self, dpo_headers):
        r = requests.get(f"{BASE_URL}/api/govern/trust_center_record", headers=dpo_headers, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Canon §7.1 record buckets: refusals, holds, masking, access(_events), deletions, rule_changes, memory(_activity)
        keys = set(data.keys())
        expected_prefixes = ["refusals", "holds", "masking", "access", "deletions", "rule_changes", "memory"]
        for prefix in expected_prefixes:
            assert any(k.startswith(prefix) for k in keys), f"missing bucket prefixed with '{prefix}': keys={keys}"
        # Doctrine line verbatim (rendered on UI as data-testid=govern-record-doctrine-verbatim)
        assert "doctrine_line_verbatim" in data
        assert "Violations post as plainly as successes" in data["doctrine_line_verbatim"]
        assert "every violation carries its disposition" in data["doctrine_line_verbatim"]

    def test_enforcement_class_split(self, dpo_headers):
        r = requests.get(f"{BASE_URL}/api/govern/enforcement_class_split", headers=dpo_headers, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Expect three sub-figures per §7.2
        keys = set(data.keys())
        # accept different naming conventions
        has_machinery = any("machin" in k.lower() or "enforc" in k.lower() for k in keys)
        has_attestation = any("attest" in k.lower() for k in keys)
        has_monitored = any("monitor" in k.lower() for k in keys)
        assert has_machinery and has_attestation and has_monitored, f"missing sub-figures. got: {keys}"


class TestEstateRules:
    """§7.3"""

    def test_estate_rules_record_has_soed(self, dpo_headers):
        r = requests.get(f"{BASE_URL}/api/govern/estate_rules_record", headers=dpo_headers, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        # Canon §7.3: S_rails / O_rules / E_engine_settings / D_registries
        keys = set(data.keys())
        for prefix in ("S_", "O_", "E_", "D_"):
            assert any(k.startswith(prefix) for k in keys), f"missing class '{prefix}' key. got: {keys}"


class TestRegistries:
    """§7.4 upload → diff → commit; asymmetry: removals refused server-side"""

    def test_additions_diff_and_commit(self, dpo_headers):
        # Step 1: upload
        rows = [{"id": "partner-gamma-t15", "name": "Gamma-T15"}]
        registry_name = f"partners_iter15_add_{int(time.time())}"
        r_up = requests.post(
            f"{BASE_URL}/api/govern/registries/upload",
            headers=dpo_headers,
            json={"registry_name": registry_name, "rows": rows},
            timeout=20,
        )
        assert r_up.status_code == 200, f"upload failed: {r_up.status_code} {r_up.text}"
        upload_id = r_up.json()["upload_id"]

        # Step 2: diff
        r = requests.post(
            f"{BASE_URL}/api/govern/registries/diff",
            headers=dpo_headers,
            json={"upload_id": upload_id},
            timeout=20,
        )
        assert r.status_code == 200, f"diff failed: {r.status_code} {r.text}"
        diff = r.json()
        assert len(diff.get("added", [])) == 1, f"expected 1 add, got: {diff}"
        assert diff.get("approval_required") is False, f"approval unexpectedly required: {diff}"

        # Step 3: commit
        r2 = requests.post(
            f"{BASE_URL}/api/govern/registries/commit",
            headers=dpo_headers,
            json={"upload_id": upload_id},
            timeout=20,
        )
        assert r2.status_code == 200, f"commit failed: {r2.status_code} {r2.text}"
        commit = r2.json()
        assert commit.get("version") or commit.get("registry_version"), f"no version in commit: {commit}"
        assert commit.get("receipt_ref") or commit.get("receipt"), f"no receipt_ref in commit: {commit}"

    def test_removal_requires_approval(self, dpo_headers):
        registry_name = f"partners_iter15_rem_{int(time.time())}"
        # Seed with two rows
        r_seed = requests.post(
            f"{BASE_URL}/api/govern/registries/upload",
            headers=dpo_headers,
            json={"registry_name": registry_name, "rows": [{"id": "t15-a", "name": "A"}, {"id": "t15-b", "name": "B"}]},
            timeout=20,
        )
        assert r_seed.status_code == 200
        seed_upload_id = r_seed.json()["upload_id"]
        r_seed_commit = requests.post(
            f"{BASE_URL}/api/govern/registries/commit",
            headers=dpo_headers,
            json={"upload_id": seed_upload_id},
            timeout=20,
        )
        assert r_seed_commit.status_code == 200, f"seed commit failed: {r_seed_commit.text}"

        # Now upload a subset (removes 'b')
        r_up2 = requests.post(
            f"{BASE_URL}/api/govern/registries/upload",
            headers=dpo_headers,
            json={"registry_name": registry_name, "rows": [{"id": "t15-a", "name": "A"}]},
            timeout=20,
        )
        assert r_up2.status_code == 200
        upload_id2 = r_up2.json()["upload_id"]
        # Diff must flag approval_required
        r_diff = requests.post(
            f"{BASE_URL}/api/govern/registries/diff",
            headers=dpo_headers,
            json={"upload_id": upload_id2},
            timeout=20,
        )
        assert r_diff.status_code == 200
        diff2 = r_diff.json()
        assert diff2.get("approval_required") is True, f"approval_required should be True on removal: {diff2}"
        assert len(diff2.get("removed", [])) == 1, f"expected 1 removal: {diff2}"
        # Commit must be refused
        r_commit2 = requests.post(
            f"{BASE_URL}/api/govern/registries/commit",
            headers=dpo_headers,
            json={"upload_id": upload_id2},
            timeout=20,
        )
        assert r_commit2.status_code in (400, 403, 409, 422), f"removal commit not refused: {r_commit2.status_code} {r_commit2.text}"


class TestChangeRuleCeremony:
    """§7.5 change rule via checker; cancel is admin-only"""

    def test_dpo_can_initiate_change_but_not_cancel(self, dpo_headers, admin_headers):
        # Initiate change via checker
        payload = {
            "rule_class": "retention_windows",
            "from_value_ref": "30",
            "to_value_ref": f"90-iter15-{int(time.time())}",
        }
        r = requests.post(f"{BASE_URL}/api/checker/initiate", headers=dpo_headers, json=payload, timeout=20)
        assert r.status_code in (200, 201, 202), f"initiate failed: {r.status_code} {r.text}"
        req = r.json()
        request_id = req.get("request_id")
        assert request_id, f"no request_id in response: {req}"

        # DPO cancel attempt — must be refused (server enforces master_admin/admin)
        rc_dpo = requests.post(
            f"{BASE_URL}/api/checker/cancel/{request_id}",
            headers=dpo_headers,
            json={"reason": "dpo trying"},
            timeout=15,
        )
        assert rc_dpo.status_code in (401, 403), f"DPO cancel not refused: {rc_dpo.status_code} {rc_dpo.text}"

        # Admin cancel succeeds
        rc_admin = requests.post(
            f"{BASE_URL}/api/checker/cancel/{request_id}",
            headers=admin_headers,
            json={"reason": "iter15 test cancel"},
            timeout=15,
        )
        assert rc_admin.status_code in (200, 202), f"admin cancel failed: {rc_admin.status_code} {rc_admin.text}"
        canceled = rc_admin.json()
        # State reflects cancellation
        state_str = str(canceled).lower()
        assert "cancel" in state_str or "suspend" in state_str, f"cancel state not reflected: {canceled}"

        # GET request to verify persisted state
        rget = requests.get(f"{BASE_URL}/api/checker/request/{request_id}", headers=admin_headers, timeout=15)
        assert rget.status_code == 200
        req_state = rget.json()
        rs = (req_state.get("state") or "").lower()
        assert "cancel" in rs or "suspend" in rs or req_state.get("canceled") or req_state.get("suspended"), (
            f"persisted state not canceled/suspended: {req_state}"
        )


class TestHolds:
    """§7.6 holds surface with SAMPLE badge + reverse-route"""

    def test_dpo_sees_held_sample_session(self, dpo_headers):
        r = requests.get(f"{BASE_URL}/api/govern/holds", headers=dpo_headers, timeout=15)
        assert r.status_code == 200, f"holds fetch failed: {r.status_code} {r.text}"
        data = r.json()
        holds = data if isinstance(data, list) else data.get("holds", [])
        assert isinstance(holds, list) and len(holds) > 0, f"no held sessions: {data}"
        # find at least one seeded sample held session
        sample_holds = [h for h in holds if (h.get("session_id", "").startswith("s-sample-held-") or h.get("is_sample"))]
        assert sample_holds, f"no sample held sessions seeded. got session_ids: {[h.get('session_id') for h in holds]}"
        h0 = sample_holds[0]
        # verdict envelope ref
        assert h0.get("verdict_ref") or h0.get("verdict_envelope_ref") or h0.get("envelope_ref"), (
            f"no verdict envelope ref on hold: {h0}"
        )


class TestAuthScope:
    """analyst gets AccessControlDenied on /govern surfaces (not a governed refusal)"""

    def test_analyst_denied_trust_center(self, analyst_headers):
        r = requests.get(f"{BASE_URL}/api/govern/trust_center_record", headers=analyst_headers, timeout=15)
        # 403 auth_scope_insufficient — NOT a governed refusal (no 'outcome' key)
        assert r.status_code in (401, 403), f"analyst not denied: {r.status_code} {r.text}"
        try:
            body = r.json()
            assert "outcome" not in body, f"denial carries 'outcome' — must not (governed refusal grammar leak): {body}"
        except ValueError:
            pass  # text/plain body is fine

    def test_analyst_denied_holds(self, analyst_headers):
        r = requests.get(f"{BASE_URL}/api/govern/holds", headers=analyst_headers, timeout=15)
        assert r.status_code in (401, 403), f"analyst holds not denied: {r.status_code} {r.text}"
        try:
            body = r.json()
            assert "outcome" not in body, f"holds denial carries outcome: {body}"
        except ValueError:
            pass
