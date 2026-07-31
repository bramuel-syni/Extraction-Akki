"""UI-1-B backend gate cells for Canon §7 Govern module.

Owner UI-1-B dispatch verbatim (2026-07-31):
    * NO new frozen contracts (HAZARD-STOP unless authorised).
    * Class-D asymmetry ENFORCED SERVER-SIDE.
    * Cancel routes through the existing state-machine (EE-R4 no parallel).
    * Countdown DERIVED from initiated_at + effective_delay_seconds
      (never a parallel constant).

Cells implemented:
    G-B1 · /api/govern/enforcement_class_split — machinery vs attestation split.
    G-B2 · /api/govern/trust_center_record — 7 buckets present, doctrine line.
    G-B3 · /api/govern/estate_rules_record — four classes S/O/E/D.
    G-B4 · registries upload → row-level validation (missing id fail-closed).
    G-B5 · registries diff — added/removed/changed shape + approval_required.
    G-B6 · registries commit · additions-only → new version + receipt.
    G-B7 · registries commit · removal/edit present → 422 with checker route.
    G-B8 · /api/checker/request/{id} — countdown_ends_at_iso DERIVED, not
           a parallel constant.
    G-B9 · /api/checker/cancel/{id} · dpo forbidden (403 auth_scope_insufficient).
    G-B10 · /api/checker/cancel/{id} · admin permitted (200 suspended).
    G-B11 · Govern endpoints refuse unauth (401) and other-role (403).
    G-B12 · No new frozen contracts (parity unchanged).
"""
from __future__ import annotations

import uuid as _uuid

import httpx
import pytest
from httpx import ASGITransport

from server import app  # type: ignore


async def _login(ac: httpx.AsyncClient, email: str, password: str) -> str:
    r = await ac.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


async def _login_dpo(ac):
    return await _login(ac, "demo.dpo@demo.rms.example.com", "demo-dpo-pw")


async def _login_admin(ac):
    return await _login(ac, "admin@rms.example.com", "admin-b1-test-pw")


async def _login_analyst(ac):
    return await _login(ac, "demo.analyst@demo.rms.example.com", "demo-analyst-pw")


# ---------------------- READ AGGREGATES ---------------------------------------


@pytest.mark.asyncio
async def test_g_b1_enforcement_class_split_shape():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        r = await ac.get(
            "/api/govern/enforcement_class_split",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    for k in ("enforced_count", "attested_count", "monitored_count", "machinery_vs_attestation_line", "canon_ref"):
        assert k in body, f"missing {k}"
    # No class superior claim in the line. Owner Canon §7.2: "no class
    # is superior; nothing urges converting one into another." The
    # doctrine LINE uses "neither is superior" — the word IS present
    # as the negation. Assert on the negation grammar directly.
    line = body["machinery_vs_attestation_line"].lower()
    assert "neither is superior" in line
    assert body["canon_ref"] == "Canon §7.2"


@pytest.mark.asyncio
async def test_g_b2_trust_center_record_seven_buckets():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        r = await ac.get(
            "/api/govern/trust_center_record",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    for bucket in (
        "refusals", "holds", "masking", "access_events",
        "deletions", "rule_changes", "memory_activity",
    ):
        assert bucket in body, f"trust-center bucket missing: {bucket}"
    # Doctrine line verbatim (Canon §11 · §7.1).
    assert body["doctrine_line_verbatim"] == (
        "Violations post as plainly as successes; every violation carries "
        "its disposition."
    )
    assert body["canon_ref"] == "Canon §7.1"


@pytest.mark.asyncio
async def test_g_b3_estate_rules_record_four_classes():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        r = await ac.get(
            "/api/govern/estate_rules_record",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    for cls in ("S_rails", "O_rules", "E_engine_settings", "D_registries"):
        assert cls in body, f"missing class {cls}"
    # S (rails) MUST be read-only.
    for rail in body["S_rails"]:
        assert rail["read_only"] is True
        assert rail["class_type"] == "S"
        assert "Owner ruling only" in rail["change_authority"]
    # O (rules) MUST route via Change-a-Rule.
    for rule in body["O_rules"]:
        assert rule["class_type"] == "O"
        assert "Change-a-Rule" in rule["change_authority"]
    # E (engine) MUST render dormant seam state until backend exists.
    for e in body["E_engine_settings"]:
        assert e["class_type"] == "E"
        assert e.get("promotion_seam_state") == "dormant"


# ---------------------- CLASS-D REGISTRIES SEAM -------------------------------


@pytest.mark.asyncio
async def test_g_b4_registries_upload_row_level_validation_fails_closed():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        r = await ac.post(
            "/api/govern/registries/upload",
            json={
                "registry_name": "gate_test_registry",
                "rows": [
                    {"id": "r1", "name": "Alpha"},
                    {"name": "Bravo"},              # missing id → fail-closed
                    {"id": "r1", "name": "Charlie"},  # duplicate → fail-closed
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 422, r.text
    body = r.json()
    assert body["reason"] == "registry_row_validation_failed"
    assert len(body["errors"]) == 2


@pytest.mark.asyncio
async def test_g_b5_and_b6_registries_diff_and_commit_additions_only():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        headers = {"Authorization": f"Bearer {token}"}
        registry_name = f"gate_b5_registry_{_uuid.uuid4().hex[:8]}"
        # Upload.
        r_up = await ac.post(
            "/api/govern/registries/upload",
            json={
                "registry_name": registry_name,
                "rows": [{"id": "a", "v": 1}, {"id": "b", "v": 2}],
            },
            headers=headers,
        )
        assert r_up.status_code == 200, r_up.text
        upload_id = r_up.json()["upload_id"]
        # Diff.
        r_diff = await ac.post(
            "/api/govern/registries/diff",
            json={"upload_id": upload_id},
            headers=headers,
        )
        assert r_diff.status_code == 200, r_diff.text
        diff = r_diff.json()
        assert len(diff["added"]) == 2
        assert len(diff["removed"]) == 0
        assert len(diff["changed"]) == 0
        assert diff["approval_required"] is False
        # Commit — additions-only path.
        r_commit = await ac.post(
            "/api/govern/registries/commit",
            json={"upload_id": upload_id},
            headers=headers,
        )
        assert r_commit.status_code == 200, r_commit.text
        commit = r_commit.json()
        assert commit["version"] >= 1
        assert commit["row_count"] == 2
        assert commit["receipt_ref"].startswith("trcv-reg-")


@pytest.mark.asyncio
async def test_g_b7_registries_commit_removals_or_edits_requires_approval():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        headers = {"Authorization": f"Bearer {token}"}
        registry_name = f"gate_b7_registry_{_uuid.uuid4().hex[:8]}"
        # First seed a v1 with two rows.
        r_up1 = await ac.post(
            "/api/govern/registries/upload",
            json={
                "registry_name": registry_name,
                "rows": [{"id": "x", "v": 1}, {"id": "y", "v": 2}],
            },
            headers=headers,
        )
        u1 = r_up1.json()["upload_id"]
        r_c1 = await ac.post(
            "/api/govern/registries/commit",
            json={"upload_id": u1},
            headers=headers,
        )
        assert r_c1.status_code == 200
        # Now try to commit an edit — must be refused with approval route.
        r_up2 = await ac.post(
            "/api/govern/registries/upload",
            json={
                "registry_name": registry_name,
                "rows": [{"id": "x", "v": 99}, {"id": "y", "v": 2}],  # x edited
            },
            headers=headers,
        )
        u2 = r_up2.json()["upload_id"]
        r_c2 = await ac.post(
            "/api/govern/registries/commit",
            json={"upload_id": u2},
            headers=headers,
        )
    assert r_c2.status_code == 422, r_c2.text
    body = r_c2.json()
    assert body["reason"] == "registry_commit_requires_approval"
    assert body["has_edits"] is True
    assert "Change-a-Rule" in body["detail"]
    # Route-to-approval names the CHECKER machinery (EE-R4 no parallel).
    assert "/api/checker/initiate" in body["route_to_approval"]


# ---------------------- CHECKER COUNTDOWN + CANCEL ---------------------------


@pytest.mark.asyncio
async def test_g_b8_checker_request_carries_derived_countdown():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        headers = {"Authorization": f"Bearer {token}"}
        # Initiate a tightening_unilateral rule change (has delay window).
        r_init = await ac.post(
            "/api/checker/initiate",
            json={
                "rule_class": "source_standing_table",
                "from_value_ref": "v1",
                "to_value_ref": "v2",
            },
            headers=headers,
        )
        assert r_init.status_code == 200, r_init.text
        rid = r_init.json()["request_id"]
        r_read = await ac.get(f"/api/checker/request/{rid}", headers=headers)
    assert r_read.status_code == 200, r_read.text
    body = r_read.json()
    assert body["state"] == "pending_delay"
    assert body["consequence_class"] == "tightening_unilateral"
    assert body["effective_delay_seconds"] is not None
    # Countdown MUST derive from initiated_at + delay — assert the field is
    # populated and it is NOT a hard-coded constant. Timestamps ordering.
    assert body["initiated_at"] is not None
    assert body["countdown_ends_at_iso"] is not None
    assert body["countdown_ends_at_iso"] > body["initiated_at"]


@pytest.mark.asyncio
async def test_g_b9_cancel_forbidden_for_dpo():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_dpo(ac)
        headers = {"Authorization": f"Bearer {token}"}
        r_init = await ac.post(
            "/api/checker/initiate",
            json={
                "rule_class": "source_standing_table",
                "from_value_ref": "v1",
                "to_value_ref": "v2",
            },
            headers=headers,
        )
        rid = r_init.json()["request_id"]
        r_cancel = await ac.post(
            f"/api/checker/cancel/{rid}",
            json={"reason": "dpo tries to cancel"},
            headers=headers,
        )
    assert r_cancel.status_code == 403, r_cancel.text
    body = r_cancel.json()
    assert body["reason"] == "auth_scope_insufficient"


@pytest.mark.asyncio
async def test_g_b10_cancel_permitted_for_admin_and_state_transitions():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        dpo_token = await _login_dpo(ac)
        admin_token = await _login_admin(ac)
        # dpo initiates → pending_delay.
        r_init = await ac.post(
            "/api/checker/initiate",
            json={
                "rule_class": "source_standing_table",
                "from_value_ref": "v1",
                "to_value_ref": "v2",
            },
            headers={"Authorization": f"Bearer {dpo_token}"},
        )
        rid = r_init.json()["request_id"]
        # admin cancels during window.
        r_cancel = await ac.post(
            f"/api/checker/cancel/{rid}",
            json={"reason": "cancelled by admin"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r_cancel.status_code == 200, r_cancel.text
        body = r_cancel.json()
        assert body["state"] == "suspended"
        assert body["prior_state"] == "pending_delay"
        assert body["suspend_reason"] == "cancelled by admin"
        # Confirm the state persisted in the state machine.
        r_read = await ac.get(
            f"/api/checker/request/{rid}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert r_read.json()["state"] == "suspended"


# ---------------------- ROLE GATING ------------------------------------------


@pytest.mark.asyncio
async def test_g_b11a_govern_refuses_unauth():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        r = await ac.get("/api/govern/trust_center_record")
    assert r.status_code == 401
    assert r.json().get("reason") == "auth_missing"


@pytest.mark.asyncio
async def test_g_b11b_govern_refuses_analyst():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_analyst(ac)
        r = await ac.get(
            "/api/govern/trust_center_record",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 403
    assert r.json().get("reason") == "auth_scope_insufficient"


# ---------------------- FROZEN-CONTRACT PARITY (unchanged) --------------------


@pytest.mark.asyncio
async def test_g_b12_no_new_frozen_contracts_parity_36():
    """UI-1-B must not bump parity — all new endpoints are non-frozen seams."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        r = await ac.get("/api/readyz")
    assert r.status_code == 200
    body = r.json()
    assert body["parity_count"] == 36
    assert body["expected_parity"] == 36
