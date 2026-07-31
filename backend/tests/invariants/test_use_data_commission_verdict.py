"""UI-1-A · Commission verdict engine + Change-a-Rule ceiling gates.

Enforcement cells:
    G-UD1  · rights_compatibility failure (missing declaration) → REFUSED absolute.
    G-UD2  · rights_compatibility training-non-inheritable → REFUSED absolute.
    G-UD3  · privacy_floor missing → REFUSED escalatable.
    G-UD4  · pii_posture missing → REFUSED absolute.
    G-UD5  · pii_posture class D not resolvable → REFUSED absolute.
    G-UD6  · budget_ceiling missing → REFUSED escalatable.
    G-UD7  · budget_ceiling above org limit → REFUSED escalatable.
    G-UD8  · scope_resolvability failure (not Connected/censused) → REFUSED escalatable.
    G-UD9  · all-pass under $1000 ceiling → RUNS_NOW · runs auto.
    G-UD10 · all-pass over $1000 ceiling → HELD_FOR_CHECK · DPO countersign.
    G-UD11 · verdict envelope carries five checks + auto-run ceiling always.
    G-UD12 · absolute refusal MUST have `route_to_approval is None` (§1.3).
    G-UD13 · escalatable refusal names route_to_approval + criterion.
    G-UD14 · POST /api/use_data/ceiling refused (Change-a-Rule only, §7.5).
    G-UD15 · GET /api/use_data/ceiling returns $1000 initial (Canon §4.2).
    G-UD16 · commit endpoint returns verdict envelope shape (contract-clean).
    G-UD17 · anonymous callers CANNOT read a session.
"""
from __future__ import annotations

import httpx
import pytest
from httpx import ASGITransport

from contracts.commission_verdict import (
    CheckName,
    CheckStatus,
    RefusalKind,
    VerdictOutcome,
)
from server import app  # type: ignore
from services.use_data.commission_verdict_engine import (
    AUTO_RUN_CEILING_USD_INITIAL,
    compose_verdict,
    evaluate_auto_run_ceiling,
    run_five_checks,
)


# ------------------------- pure-function gates -------------------------


def _all_pass_checks_args(**overrides):
    """Base args producing five passing checks."""
    args = dict(
        rights_declared="internal_only",
        training_rights_inheritable=True,
        privacy_floor_declared="k>=10",
        pii_posture_declared="pseudonymized",
        class_d_resolvable=True,
        proposed_budget_usd=500.0,
        org_budget_ceiling_usd=10_000.0,
        scope_source_ids=["src-a", "src-b"],
        connected_source_ids=["src-a", "src-b"],
        censused_source_ids=["src-a", "src-b"],
    )
    args.update(overrides)
    return args


def _verdict_from(args):
    checks = run_five_checks(**args)
    ceiling = evaluate_auto_run_ceiling(proposed_spend_usd=args["proposed_budget_usd"] or 0.0)
    return compose_verdict(session_id="s-test", checks=checks, auto_run_ceiling=ceiling)


def test_g_ud1_rights_missing_refused_absolute():
    v = _verdict_from(_all_pass_checks_args(rights_declared=None))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal is not None
    assert v.refusal.kind == RefusalKind.ABSOLUTE


def test_g_ud2_rights_training_non_inheritable_refused_absolute():
    v = _verdict_from(_all_pass_checks_args(
        rights_declared="training",
        training_rights_inheritable=False,
    ))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ABSOLUTE
    rights_check = next(c for c in v.checks if c.check == CheckName.RIGHTS_COMPATIBILITY)
    assert rights_check.status == CheckStatus.FAILED


def test_g_ud3_privacy_floor_missing_refused_escalatable():
    v = _verdict_from(_all_pass_checks_args(privacy_floor_declared=None))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ESCALATABLE


def test_g_ud4_pii_missing_refused_absolute():
    v = _verdict_from(_all_pass_checks_args(pii_posture_declared=None))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ABSOLUTE


def test_g_ud5_class_d_unresolvable_refused_absolute():
    v = _verdict_from(_all_pass_checks_args(class_d_resolvable=False))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ABSOLUTE


def test_g_ud6_budget_missing_refused_escalatable():
    v = _verdict_from(_all_pass_checks_args(proposed_budget_usd=None))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ESCALATABLE


def test_g_ud7_budget_above_org_ceiling_refused_escalatable():
    v = _verdict_from(_all_pass_checks_args(
        proposed_budget_usd=20_000.0,
        org_budget_ceiling_usd=10_000.0,
    ))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ESCALATABLE


def test_g_ud8_scope_not_connected_refused_escalatable():
    v = _verdict_from(_all_pass_checks_args(
        scope_source_ids=["src-a", "src-b", "src-x"],
        connected_source_ids=["src-a", "src-b"],
        censused_source_ids=["src-a", "src-b"],
    ))
    assert v.outcome == VerdictOutcome.REFUSED
    assert v.refusal.kind == RefusalKind.ESCALATABLE


def test_g_ud9_all_pass_under_ceiling_runs_now():
    v = _verdict_from(_all_pass_checks_args(proposed_budget_usd=500.0))
    assert v.outcome == VerdictOutcome.RUNS_NOW
    assert v.refusal is None
    assert v.auto_run_ceiling.at_or_under is True
    assert v.auto_run_ceiling.dpo_countersign_required is False


def test_g_ud10_all_pass_over_ceiling_held_for_check():
    v = _verdict_from(_all_pass_checks_args(proposed_budget_usd=2_500.0))
    assert v.outcome == VerdictOutcome.HELD_FOR_CHECK
    assert v.refusal is not None
    assert v.refusal.kind == RefusalKind.ESCALATABLE
    assert v.refusal.route_to_approval is not None
    assert v.auto_run_ceiling.dpo_countersign_required is True


def test_g_ud11_verdict_always_carries_five_checks_and_ceiling():
    for args in [
        _all_pass_checks_args(),
        _all_pass_checks_args(rights_declared=None),
        _all_pass_checks_args(proposed_budget_usd=2_500.0),
    ]:
        v = _verdict_from(args)
        assert len(v.checks) == 5
        names = {c.check for c in v.checks}
        assert names == {
            CheckName.RIGHTS_COMPATIBILITY,
            CheckName.PRIVACY_FLOOR,
            CheckName.PII_POSTURE,
            CheckName.BUDGET_CEILING,
            CheckName.SCOPE_RESOLVABILITY,
        }
        assert v.auto_run_ceiling.ceiling_usd == AUTO_RUN_CEILING_USD_INITIAL


def test_g_ud12_absolute_refusal_has_no_approval_route():
    """Canon §1.3: an absolute refusal MUST NOT carry route_to_approval."""
    for args in [
        _all_pass_checks_args(rights_declared=None),
        _all_pass_checks_args(pii_posture_declared=None),
        _all_pass_checks_args(class_d_resolvable=False),
    ]:
        v = _verdict_from(args)
        assert v.refusal is not None
        assert v.refusal.kind == RefusalKind.ABSOLUTE
        assert v.refusal.route_to_approval is None, (
            f"Absolute refusal must have route_to_approval=None; "
            f"got {v.refusal.route_to_approval!r} for args {args}"
        )
        assert v.refusal.bar_source is not None


def test_g_ud13_escalatable_refusal_names_route_and_criterion():
    args = _all_pass_checks_args(proposed_budget_usd=None)
    v = _verdict_from(args)
    assert v.refusal is not None
    assert v.refusal.kind == RefusalKind.ESCALATABLE
    assert v.refusal.route_to_approval is not None
    assert v.refusal.criterion


# ---------------------- HTTP-boundary gates (ASGITransport) ----------------------


async def _login_admin(ac: httpx.AsyncClient) -> str:
    r = await ac.post("/api/auth/login", json={
        "email": "admin@rms.example.com",
        "password": "admin-b1-test-pw",
    })
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.mark.asyncio
async def test_g_ud14_direct_ceiling_write_refused_change_a_rule_only():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_admin(ac)
        r = await ac.post(
            "/api/use_data/ceiling",
            json={"ceiling_usd": 5_000.0},
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 422, r.text
    body = r.json()
    assert body["outcome"] == "refused"
    assert body["reason"] == "auto_run_ceiling_change_a_rule_only"
    assert "Change-a-Rule" in body["detail"]


@pytest.mark.asyncio
async def test_g_ud15_ceiling_read_returns_initial_1000_usd():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_admin(ac)
        r = await ac.get(
            "/api/use_data/ceiling",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert r.status_code == 200
    body = r.json()
    assert body["ceiling_usd"] == 1000.0
    assert body["currency"] == "USD"
    assert body["change_path"] == "change_a_rule_ceremony_only"


@pytest.mark.asyncio
async def test_g_ud16_commit_returns_verdict_envelope():
    """End-to-end: open session · commit · receive verdict envelope."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_admin(ac)
        headers = {"Authorization": f"Bearer {token}"}
        r_open = await ac.post(
            "/api/use_data/session",
            json={"door": "integrate_an_app"},
            headers=headers,
        )
        assert r_open.status_code == 200, r_open.text
        sid = r_open.json()["session_id"]
        r_commit = await ac.post(
            f"/api/use_data/session/{sid}/commit",
            json={
                "rights_declared": "internal_only",
                "training_rights_inheritable": True,
                "privacy_floor_declared": "k>=10",
                "pii_posture_declared": "pseudonymized",
                "class_d_resolvable": True,
                "proposed_budget_usd": 500.0,
                "org_budget_ceiling_usd": 10_000.0,
                "scope_source_ids": ["src-a"],
                "connected_source_ids": ["src-a"],
                "censused_source_ids": ["src-a"],
                "values_confirmed": [
                    "rights",
                    "privacy_floor",
                    "pii_posture",
                    "budget",
                    "scope",
                ],
            },
            headers=headers,
        )
    assert r_commit.status_code == 200, r_commit.text
    body = r_commit.json()
    assert "session" in body
    assert "verdict" in body
    v = body["verdict"]
    assert v["outcome"] == "runs_now"
    assert v["refusal"] is None
    assert len(v["checks"]) == 5
    assert v["auto_run_ceiling"]["at_or_under"] is True
    assert v["auto_run_ceiling"]["dpo_countersign_required"] is False
    assert v["trust_receipt_ref"].startswith("trcv-")
    assert v["verbatim_carrier"] == "Every commission verdict lands in the record the DPO reads."


@pytest.mark.asyncio
async def test_g_ud17_session_lifecycle_forbids_anonymous_read():
    """Break-in: anonymous callers CANNOT read a session."""
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as ac:
        token = await _login_admin(ac)
        r_open = await ac.post(
            "/api/use_data/session",
            json={"door": "export_or_license"},
            headers={"Authorization": f"Bearer {token}"},
        )
        sid = r_open.json()["session_id"]
        # Anonymous cross-attempt.
        r_read = await ac.get(f"/api/use_data/session/{sid}")
    assert r_read.status_code == 401, r_read.text
    assert r_read.json().get("reason") == "auth_missing"
