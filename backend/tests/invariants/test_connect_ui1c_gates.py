"""UI-1-C backend gate roster (Owner ruling 2026-08-02 · Canon §4 Connect).

Cells:
  * gate_landing_five_section_shape
  * gate_seven_connect_rules_enumerated
  * gate_auto_run_ceiling_1000_change_a_rule_only
  * gate_auto_run_ceiling_single_source_of_truth (EE-R4 no parallel mechanism)
  * gate_source_state_grammar_four_states
  * gate_declared_registry_empty_fail_closed
  * gate_instance_config_defaults_marker_present
  * gate_parity_36_no_new_frozen_contracts
"""
from __future__ import annotations

import sys
from pathlib import Path

import httpx
import pytest
from httpx import ASGITransport

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from core import db  # noqa: E402


async def _admin_token(ac: httpx.AsyncClient) -> str:
    r = await ac.post("/api/auth/login", json={
        "email": "admin@rms.example.com", "password": "admin-b1-test-pw",
    })
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


async def _analyst_token(ac: httpx.AsyncClient) -> str:
    r = await ac.post("/api/auth/login", json={
        "email": "demo.analyst@demo.rms.example.com", "password": "demo-analyst-pw",
    })
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


# ---------- gate_landing_five_section_shape ----------------------------------


@pytest.mark.asyncio
async def test_c_b1_landing_returns_five_sections_and_canon_ref():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/connect/landing", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["canon_ref"] == "Canon §4.1"
    # Five sections present, in shape.
    assert "headline" in body and "kind" in body["headline"] and "text" in body["headline"]
    assert body["headline"]["kind"] in ("pre_connection", "steady_state")
    assert "status_banner" in body
    assert "cards" in body
    assert "record_rows" in body
    assert "footer" in body
    # Footer link to Govern (Connect LINKS to Govern, never duplicates).
    assert body["footer"]["govern_link_route"].startswith("/govern")


# ---------- gate_seven_connect_rules_enumerated ------------------------------


@pytest.mark.asyncio
async def test_c_b2_seven_rules_enumerated_with_rule_7_ceiling_1000_by_default():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/connect/rules", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    rules = body["rules"]
    assert len(rules) == 7, f"expected 7 Connect rules, got {len(rules)}"
    ids = {r_["rule_id"] for r_ in rules}
    assert "rule7_commission_auto_run_ceiling" in ids
    rule7 = next(r_ for r_ in rules if r_["rule_id"] == "rule7_commission_auto_run_ceiling")
    assert rule7["value"] == 1000.0
    assert rule7["value_display"] == "$1,000.00"
    assert rule7["unit"] == "USD"
    assert rule7["infinity_permitted"] is True
    assert "Change-a-Rule" in rule7["change_authority"]


# ---------- gate_auto_run_ceiling_1000_change_a_rule_only --------------------


@pytest.mark.asyncio
async def test_c_b3_direct_write_ceiling_refuses_via_governed_envelope():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Attempt to raise the ceiling directly. MUST refuse.
        r = await ac.post(
            "/api/connect/rules/rule7_commission_auto_run_ceiling",
            headers={"Authorization": f"Bearer {tok}"},
            json={"value": 5000},
        )
    assert r.status_code == 422, r.text
    body = r.json()
    assert body["outcome"] == "refused"
    assert body["reason"] == "connect_rule_change_a_rule_only"
    assert body["route"] == "/govern/change-rule"
    assert body["rule_class"] == "auto_run_ceiling_usd"


@pytest.mark.asyncio
async def test_c_b4_direct_write_ceiling_via_use_data_ceiling_also_refuses():
    """The pre-UI-1-C /api/use_data/ceiling POST also refuses (belt + suspenders)."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.post(
            "/api/use_data/ceiling",
            headers={"Authorization": f"Bearer {tok}"},
            json={"ceiling_usd": 9999.99},
        )
    assert r.status_code == 422
    body = r.json()
    assert body["outcome"] == "refused"
    assert body["reason"] == "auto_run_ceiling_change_a_rule_only"


# ---------- gate_auto_run_ceiling_single_source_of_truth (EE-R4) -------------


@pytest.mark.asyncio
async def test_c_b5_ceiling_read_from_single_source_of_truth():
    """The ceiling exposed on /connect/rules == the ceiling read by
    /use_data/ceiling. If someone (illicit ceremony bypass) inserts a
    higher `effective` row for auto_run_ceiling_usd, BOTH endpoints
    reflect the same new value — no parallel mechanism.
    """
    from services.connect.rulebook import get_effective_auto_run_ceiling_usd
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        # Baseline: rule7 == $1,000 · use_data/ceiling == $1,000.
        r_rules = await ac.get("/api/connect/rules", headers={"Authorization": f"Bearer {tok}"})
        r_ceil = await ac.get("/api/use_data/ceiling", headers={"Authorization": f"Bearer {tok}"})
    assert r_rules.status_code == 200 and r_ceil.status_code == 200
    rule7 = next(r for r in r_rules.json()["rules"] if r["rule_id"] == "rule7_commission_auto_run_ceiling")
    assert rule7["value"] == r_ceil.json()["ceiling_usd"]
    # Inject an `effective` row (simulating a ceremony completion) and
    # confirm BOTH endpoints move together (single source of truth).
    marker_rid = "test-c-b5-effective-ceiling"
    coll = db.get_collection("checker_requests")
    await coll.insert_one({
        "request_id": marker_rid,
        "rule_class": "auto_run_ceiling_usd",
        "state": "effective",
        "from_value_ref": "1000",
        "to_value_ref": "2500",
        "effective_at": "2026-08-02T12:00:00Z",
    })
    try:
        async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
            tok = await _admin_token(ac)
            r_rules = await ac.get("/api/connect/rules", headers={"Authorization": f"Bearer {tok}"})
            r_ceil = await ac.get("/api/use_data/ceiling", headers={"Authorization": f"Bearer {tok}"})
        rule7_after = next(r for r in r_rules.json()["rules"] if r["rule_id"] == "rule7_commission_auto_run_ceiling")
        assert rule7_after["value"] == 2500.0
        assert r_ceil.json()["ceiling_usd"] == 2500.0
        assert rule7_after["value"] == r_ceil.json()["ceiling_usd"]  # SAME value everywhere.
        # Bare service call also aligned.
        engine_read = await get_effective_auto_run_ceiling_usd()
        assert engine_read == 2500.0
    finally:
        await coll.delete_one({"request_id": marker_rid})


# ---------- gate_source_state_grammar_four_states ----------------------------


@pytest.mark.asyncio
async def test_c_b6_source_state_grammar_all_four_seeded_per_identity():
    """Seeded fixtures render all four states with SAMPLE flag."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/connect/sources", headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200
    sources = r.json()["sources"]
    states = {s["state"] for s in sources if s.get("is_sample")}
    assert {"connected", "in_progress", "awaiting_credentials", "failed"}.issubset(states), (
        f"expected all 4 states seeded; got {states}"
    )
    # Every failed sample carries an HONEST plain-language reason.
    failed_samples = [s for s in sources if s.get("state") == "failed" and s.get("is_sample")]
    assert len(failed_samples) >= 1
    for s in failed_samples:
        reason = s.get("failure_reason_plain")
        assert reason is not None and len(reason) > 20 and reason.lower() != "failed"


# ---------- gate_declared_registry_empty_fail_closed -------------------------


@pytest.mark.asyncio
async def test_c_b7_declared_registries_reflect_empty_state_from_govern():
    """A declared registry with NO effective versions in /govern/registries
    renders is_empty=True (FAIL-CLOSED until first load).
    """
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/connect/declared_registries",
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["canon_ref"] == "Canon §4.2 · A5"
    # At least one seeded sample declared registry is present.
    seeded = [r for r in body["declared"] if r.get("is_sample")]
    assert len(seeded) >= 1
    # Each declared registry either points into /govern/registries with a
    # version (loaded) or renders is_empty=True (fail-closed until first load).
    for r_ in body["declared"]:
        assert "is_empty" in r_
        if r_["is_empty"] is True:
            assert r_.get("version") is None


# ---------- gate_instance_config_defaults_marker_present ----------------------


@pytest.mark.asyncio
async def test_c_b8_instance_config_defaults_marker_present():
    """QRB evidence-class discipline: defaulted fields are honest-marked."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        r = await ac.get("/api/instance/config")
    assert r.status_code == 200
    body = r.json()
    # The three defaulted fields carry a `defaults` array marker.
    assert "defaults" in body
    for field in ("deployment_target", "primary_regulator", "credentials_holder"):
        assert field in body["defaults"] or body.get(field) is not None
    # If the field is defaulted, it must be discoverable via the array.
    assert isinstance(body["defaults"], list)


# ---------- gate_parity_36_no_new_frozen_contracts ---------------------------


@pytest.mark.asyncio
async def test_c_b9_parity_36_unchanged():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        r = await ac.get("/api/readyz")
    assert r.status_code == 200
    body = r.json()
    assert body["parity_count"] == 36, "UI-1-C must not bump parity (Owner HAZARD-STOP)"
    assert body["expected_parity"] == 36


# ---------- gate_role_gate_master_admin_only_adds_source ---------------------


@pytest.mark.asyncio
async def test_c_b10_add_source_role_gate_master_admin_only():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        # Analyst — no master_admin role — refused.
        tok_analyst = await _analyst_token(ac)
        r = await ac.post(
            "/api/connect/sources",
            headers={"Authorization": f"Bearer {tok_analyst}"},
            json={
                "source_id": "src-analyst-attempt", "name": "should-not-land",
                "protocol": "postgres", "cadence": "daily_09",
                "rights_declared": "internal_only", "pii_posture": "pseudonymize",
            },
        )
    assert r.status_code == 403
    assert r.json()["reason"] == "auth_scope_insufficient"


# ---------- gate_landing_carries_default_markers_in_banner --------------------


@pytest.mark.asyncio
async def test_c_b11_landing_banner_carries_default_markers_until_confirmed():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        tok = await _admin_token(ac)
        r = await ac.get("/api/connect/landing", headers={"Authorization": f"Bearer {tok}"})
    body = r.json()
    banner = body["status_banner"]
    assert isinstance(banner["defaults"], list)
    # Owner-accepted defaults present.
    assert banner["deployment_target"] == "RMS Local"
    assert banner["primary_regulator"] == "DPO capacity"
    # Defaults set → field_is_default true for each.
    for field in ("deployment_target", "primary_regulator", "credentials_holder"):
        assert banner["field_is_default"].get(field) is True, (
            f"field {field} should carry a DEFAULT marker until confirmed"
        )
