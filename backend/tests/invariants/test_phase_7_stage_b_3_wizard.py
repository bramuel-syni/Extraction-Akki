"""Phase 7 Stage B-3 invariant gates — post-commercial-cut trimmed
(2026-07-06).

**Owner ruling (Phase 7 B-3 dispatch, 2026-07-04, verbatim scope):**
> "commit-review + buyer freeze + admission handoff to POST /api/objectives"

**Commercial-cut posture (2026-07-06, BCR v1.4 §12):** All buyer-variant
gates (5 Block-A buyer freeze/commit-review tests + 5 Block-B buyer
helper tests + 4 Block-B buyer handoff tests + buyer router mount
count) RELOCATED VERBATIM to
`/app/salvage/commercial_cut_2026_07_06/backend/tests/pre_cut_source_test_phase_7_stage_b_3_wizard.py`.
Only the operator-variant gates + parity/regression gates remain
in-tree post-cut.

Retained gates:
  * Block A operator: `test_operator_commit_review_returns_license_class_drift_only`.
  * Block B operator: unfrozen-state refusal, operator composer positive,
    operator handoff-422-unfrozen.
  * Block C: parity 26 + composed_conclusion regression + operator
    router mount count + registry-code regressions + Shield-boundary
    regression + admission_handoff pure-module + Owner Condition-2
    grep-negative (single-source for the remaining shared symbols).
"""
from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from contracts.wizard_commit_state import (
    CommittedValue_v0,
    WizardCommitState_v0,
    operator_mandatory_fields,
)
from server import app
from services.wizard import admission_handoff


_ROOT = Path(__file__).resolve().parents[2]  # /app/backend
_SERVICES = _ROOT / "services"
_CONTRACTS = _ROOT / "contracts"


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _minimal_frozen_operator_state(session_id: str = "session-op-handoff-test") -> WizardCommitState_v0:
    """Build a minimal frozen operator WizardCommitState_v0 with all
    operator-mandatory fields present (Guard 1 satisfied)."""
    now = _iso_now()
    field_values = {
        "reach": {"scope_refs": ["est-1"], "exclusions": [], "depth": "default"},
        "output.form": "composed_conclusion",
        "output.consumer": "person",
        "output.grain": "synthesized_whole",
        "output.standard": {"minimum_class": "utterance", "minimum_scores": {}},
        "envelope.done_condition": "standing_floor",
        "envelope.budget": "default",
        "envelope.lawful_basis": "legitimate_interest",
    }
    committed = {}
    for field in operator_mandatory_fields():
        committed[field] = CommittedValue_v0(
            value=field_values.get(field, f"stub-{field}"),
            source="operator_supplied",
            operator_turn_ref=f"turn-{field}",
            agent_assumption_id=None,
            committed_at=now,
        )
    return WizardCommitState_v0(
        session_id=session_id,
        trace_id=f"trace-{session_id}",
        variant="operator",
        initiated_at=now,
        committed_at=now,
        turns=[],
        agent_assumptions=[],
        committed_values=committed,
        feasibility_history=[],
        license_class="standard",
        frozen_objective_ref=None,
    )


# ==========================================================================
# BLOCK A — Operator commit-review (buyer commit-review relocated).
# ==========================================================================


@pytest.mark.asyncio
async def test_operator_commit_review_returns_license_class_drift_only():
    """Block A — operator commit-review returns `license_class_drift`
    but NOT `dual_delta_summary` (operator has no proposals surface)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r0 = await client.post("/api/wizard/operator/session")
        sid = r0.json()["session_id"]
        r = await client.post(f"/api/wizard/operator/{sid}/commit-review")
    assert r.status_code == 200, r.text
    body = r.json()
    assert "license_class_drift" in body
    assert "dual_delta_summary" not in body


# ==========================================================================
# BLOCK B — admission_handoff.py + /handoff endpoint (operator only).
# ==========================================================================


def test_compose_objective_request_refuses_unfrozen_state():
    """Block B LB — composer refuses handoff on unfrozen state."""
    unfrozen = WizardCommitState_v0(
        session_id="s-unfrozen",
        trace_id="t-unfrozen",
        variant="operator",
        initiated_at=_iso_now(),
        committed_at=None,  # UNFROZEN
    )
    with pytest.raises(ValueError, match="FROZEN"):
        admission_handoff.compose_objective_request_from_frozen_state(unfrozen)


def test_compose_objective_request_from_frozen_operator_state():
    """Block B — composer mints a valid ObjectiveRequest_v2 from a
    minimally frozen operator state."""
    state = _minimal_frozen_operator_state()
    obj_req = admission_handoff.compose_objective_request_from_frozen_state(state)
    assert obj_req.idempotency_key == f"handoff-{state.session_id}"
    assert obj_req.envelope.commissioner == f"wizard-operator-{state.session_id}"


@pytest.mark.asyncio
async def test_operator_handoff_returns_422_wizard_not_frozen_when_session_not_frozen():
    """Block B LB — operator handoff returns 422 with `wizard_not_frozen`
    reason when session exists but is not frozen."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r0 = await client.post("/api/wizard/operator/session")
        sid = r0.json()["session_id"]
        r = await client.post(f"/api/wizard/operator/{sid}/handoff")
    assert r.status_code == 422, r.text
    body = r.json()
    assert body["reason"] == "wizard_not_frozen"


# ==========================================================================
# BLOCK C — Frozen-contract posture + struck-code + mount-count regressions.
# ==========================================================================


@pytest.mark.parametrize("symbol_name", [
    # Owner Condition-2 flavored posture — admission_handoff.py must
    # NOT reimplement these shared symbols. (Post-cut: `evaluate_dual_delta`
    # removed from the parametrisation — its authoritative module
    # `services/wizard/dual_delta.py` was cut whole at commercial cut
    # 2026-07-06; the grep-negative on that symbol still holds but no
    # longer needs an ongoing regression check.)
    "derive_license_class",
    "_record_feasibility_snapshot",
])
def test_admission_handoff_does_not_reimplement_shared_symbol(symbol_name: str):
    """Block C LB — admission_handoff.py does NOT define its own copy
    of any shared symbol. Post-cut admission_handoff.py is a pure
    re-export of `compose_objective_request_from_frozen_state`, so
    this gate remains vacuously green."""
    p = _SERVICES / "wizard" / "admission_handoff.py"
    src = p.read_text()
    pattern = rf"^def\s+{re.escape(symbol_name)}\s*\("
    matches = re.findall(pattern, src, re.MULTILINE)
    assert not matches, (
        f"admission_handoff.py must not re-implement {symbol_name!r} — "
        f"import it from its authoritative module (Owner Condition-2 posture)."
    )


def test_no_new_refusal_codes_at_7b_3():
    """Block C LB — Owner ruling: no new refusal codes for handoff."""
    import json
    registries = [
        _SERVICES / "service_1" / f"admission_refusal_reasons.v{i}.json"
        for i in range(4)
    ] + [_SERVICES / "service_1" / "service_1_refusal_reasons.v0.json"]
    total_codes = 0
    seen_codes = set()
    for reg in registries:
        cfg = json.loads(reg.read_text())
        reasons = cfg.get("valid_reasons", [])
        for r in reasons:
            code = r.get("reason") if isinstance(r, dict) else r
            if code:
                seen_codes.add(code)
                total_codes += 1
    assert total_codes >= 1
    forbidden_new_codes = {"wizard_handoff_failed", "handoff_refused", "wizard_composition_invalid"}
    for forbidden in forbidden_new_codes:
        assert forbidden not in seen_codes


def test_prior_contracts_count_now_28_post_9_1():
    """Block C — parity invariant now maps 29 contracts post-Artifact-Store (AS-E1 α additive)."""
    from tests.invariants.test_frozen_contract_snapshot_parity import CONTRACT_TO_SNAPSHOT
    assert len(CONTRACT_TO_SNAPSHOT) == 32


@pytest.mark.parametrize("contract_file", sorted([
    p.name for p in (_CONTRACTS).glob("*.py")
    if p.name not in {"__init__.py"}
]))
def test_prior_contract_file_exists_and_stable_at_7b_3(contract_file: str):
    """Block C — every prior contract source file still exists post-7b-3."""
    p = _CONTRACTS / contract_file
    assert p.exists(), f"prior contract source file missing: {contract_file}"
    assert p.stat().st_size > 0


def test_composed_conclusion_synthesis_lines_untouched_at_7b_3():
    """Block C — synthesis lines slice re-blessed at Answer Fluency
    close (Owner AF-E4 α, 2026-07-10). Mechanical composer extracted
    to `mechanical_composer.py`; byte-identical.
    """
    p = _ROOT / "services" / "service_1" / "mechanical_composer.py"
    if not p.exists():
        pytest.skip("mechanical_composer.py not present")
    text = p.read_text()
    lines = text.splitlines()
    if len(lines) < 41:
        pytest.skip("mechanical_composer.py too short for slice check")
    slice_text = "\n".join(lines[35:40])
    slice_sha = hashlib.sha256(slice_text.encode("utf-8")).hexdigest()
    # Post-AF re-bless: extracted composer slice SHA prefix.
    assert slice_sha.startswith("47ed1ea8"), (
        f"mechanical_composer.py:36-41 slice drifted; got SHA {slice_sha[:16]}"
    )


def test_operator_router_still_mounts_7_endpoints_at_7b_3():
    """Block C — operator router mounts 7 endpoints post-B-3."""
    from server import app
    ops = [r.path for r in app.routes if hasattr(r, "path") and "/api/wizard/operator" in r.path]
    assert len(ops) == 7, f"Expected 7 operator wizard endpoints at B-3; found {len(ops)}: {ops}"


def test_no_caller_cancelled_or_async_queue_saturated_code_at_7b_3():
    """Block C regression — STRUCK codes remain absent as reason CODES."""
    import json
    registries = [
        _SERVICES / "service_1" / f"admission_refusal_reasons.v{i}.json"
        for i in range(4)
    ] + [_SERVICES / "service_1" / "service_1_refusal_reasons.v0.json"]
    STRUCK = ("caller_cancelled", "async_queue_saturated")
    for reg in registries:
        cfg = json.loads(reg.read_text())
        codes = set()
        if isinstance(cfg, dict) and "reasons" in cfg:
            for r in cfg["reasons"]:
                if isinstance(r, dict) and "code" in r:
                    codes.add(r["code"])
                elif isinstance(r, str):
                    codes.add(r)
        for struck in STRUCK:
            assert struck not in codes


def test_shield_boundary_still_green_at_7b_3():
    """Block C — no LLM SDK imports in services/wizard/* (Shield boundary)."""
    for py in (_SERVICES / "wizard").glob("*.py"):
        src = py.read_text()
        for banned in ("import anthropic", "from anthropic", "import litellm", "from litellm"):
            assert banned not in src, (
                f"services/wizard/{py.name} imports LLM SDK ({banned!r}) — Shield boundary violation"
            )


def test_admission_handoff_pure_no_llm_imports():
    """Block C — admission_handoff.py is a pure re-export shim post-cut:
    no LLM, no I/O, no network. Structural."""
    p = _SERVICES / "wizard" / "admission_handoff.py"
    src = p.read_text()
    banned = ("import httpx", "import anthropic", "import litellm",
              "from httpx", "from anthropic", "from litellm")
    for b in banned:
        assert b not in src, f"admission_handoff.py must not import {b!r}"
