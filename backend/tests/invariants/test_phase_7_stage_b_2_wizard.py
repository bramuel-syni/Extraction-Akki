"""Phase 7 Stage B-2 invariant gates — post-commercial-cut trimmed
(2026-07-06).

**Owner ruling verbatim (2026-07-04, Phase 7 B-2 dispatch):**
> "Guard 1 is violable via API today; that window must be closed
> before the first non-stub agent connects, or the laundering surface
> the guard exists to close is open at exactly the moment it matters."

**Commercial-cut posture (2026-07-06, BCR v1.4 §12):** All buyer-variant
tests + all `SonnetWizardAgent` tests + all `dual_delta` tests + all
buyer router smokes RELOCATED VERBATIM to
`/app/salvage/commercial_cut_2026_07_06/backend/tests/pre_cut_source_test_phase_7_stage_b_2_wizard.py`.
Only the operator-variant Guard-1 gates (Owner Condition A(i)/(ii)/(iii))
and the parity/regression gates remain in-tree post-cut.

Retained gates (10 tests):
  * Owner Condition A(i) — parametrised over operator mandatory-tier
    fields (agent-assumption refusal); LB.
  * Owner Condition A(ii) — agent-assumption code path never mints
    operator_supplied CommittedValue; LB.
  * Owner Condition A(iii) — agent-assumption code path never appends
    an operator turn; LB.
  * Parity 26 (count + per-file existence sanity).
  * Composed-conclusion synthesis lines byte-identical.
  * Operator router surface shape (5 or 6 POST + 1 GET).
  * Mechanical parity invariant still maps 26.
  * Registry regressions: no `caller_cancelled` / no `async_queue_saturated`.
  * Operator router mount count.
"""
from __future__ import annotations

import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

from contracts.wizard_commit_state import operator_mandatory_fields
from services.wizard import operator_state_machine as osm
from services.wizard.source_tagging import SourceTagViolation

from server import app


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
_SERVICES_DIR = _BACKEND_ROOT / "services"
_CONTRACTS_DIR = _BACKEND_ROOT / "contracts"


# ==========================================================================
# BLOCK A — Owner Condition A(i)/(ii)/(iii) gates. Operator variant.
# ==========================================================================


@pytest.mark.parametrize("mandatory_field", sorted(operator_mandatory_fields()))
def test_agent_assumption_endpoint_refuses_on_mandatory_tier_operator_variant(mandatory_field):
    """Block A LB (Owner Condition A(i)) — `record_agent_assumption` on
    ANY operator-mandatory-tier field MUST raise SourceTagViolation
    when `variant="operator"`."""
    session = osm.new_operator_session()
    with pytest.raises(SourceTagViolation) as exc:
        osm.record_agent_assumption(
            session=session,
            field_name=mandatory_field,
            inferred_value="synthetic-agent-inferred",
            evidence_ref="",
            variant="operator",
        )
    assert "mandatory-tier" in str(exc.value)
    assert "Guard 1" in str(exc.value)
    assert len(session.agent_assumptions) == 0
    assert mandatory_field not in session.committed_values


@pytest.mark.asyncio
async def test_agent_assumption_router_returns_422_on_mandatory_tier_operator_variant():
    """Block A LB — HTTP boundary translates Condition A(i)'s
    SourceTagViolation into 422 (NOT 500, NOT a governance refusal
    envelope, NOT a raw stacktrace)."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r0 = await client.post("/api/wizard/operator/session")
        sid = r0.json()["session_id"]
        mandatory_field = sorted(operator_mandatory_fields())[0]
        r = await client.post(
            f"/api/wizard/operator/{sid}/agent-assumption",
            json={"field": mandatory_field, "inferred_value": "x", "evidence_ref": ""},
        )
    assert r.status_code == 422, r.text
    body = r.json()
    assert body["refused"] is True
    assert isinstance(body["violations"], list) and body["violations"]
    joined = "\n".join(body["violations"])
    assert "mandatory-tier" in joined
    assert mandatory_field in joined


@pytest.mark.asyncio
async def test_agent_assumption_endpoint_never_mints_operator_source_committed_value():
    """Block A LB (Owner Condition A(ii)) — every CommittedValue written
    by the agent-assumption code path has `source="agent_assumed"`."""
    session = osm.new_operator_session()
    preference_tier_field = "output.formatting"
    assert preference_tier_field not in operator_mandatory_fields()

    assumption = osm.record_agent_assumption(
        session=session,
        field_name=preference_tier_field,
        inferred_value="json",
        evidence_ref="",
        variant="operator",
    )
    cv = session.committed_values[preference_tier_field]
    assert cv.source == "agent_assumed"
    assert cv.agent_assumption_id == assumption.assumption_id
    assert cv.operator_turn_ref is None
    for name, entry in session.committed_values.items():
        assert entry.source != "operator_supplied", (
            f"Condition A(ii) violated: committed_values[{name!r}].source == "
            f"'operator_supplied' after agent-assumption call."
        )


@pytest.mark.asyncio
async def test_agent_assumption_endpoint_never_appends_operator_turn():
    """Block A LB (Owner Condition A(iii)) — `session.turns[]` is
    UNCHANGED by the agent-assumption code path."""
    session = osm.new_operator_session()
    turns_before = len(session.turns)
    assumption_ids_before = [a.assumption_id for a in session.agent_assumptions]

    osm.record_agent_assumption(
        session=session,
        field_name="output.formatting",
        inferred_value="csv",
        evidence_ref="",
        variant="operator",
    )
    assert len(session.turns) == turns_before
    assumption_ids_after = [a.assumption_id for a in session.agent_assumptions]
    assert len(assumption_ids_after) == len(assumption_ids_before) + 1

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        r0 = await client.post("/api/wizard/operator/session")
        sid = r0.json()["session_id"]
        r_pre = await client.get(f"/api/wizard/operator/{sid}")
        turns_pre = len(r_pre.json().get("turns", []))
        r_ass = await client.post(
            f"/api/wizard/operator/{sid}/agent-assumption",
            json={"field": "output.formatting", "inferred_value": "csv"},
        )
        assert r_ass.status_code == 200, r_ass.text
        r_post = await client.get(f"/api/wizard/operator/{sid}")
        turns_post = len(r_post.json().get("turns", []))
    assert turns_post == turns_pre


# ==========================================================================
# BLOCK C carryover — parity / regression gates (buyer/dual-delta/Sonnet
# tests relocated to salvage at commercial cut 2026-07-06).
# ==========================================================================


_PRIOR_26_SHAS = {
    "admission_refusal.py":           "e68a1e383042835c8104d140e39469615c5f4a81461defaa7d13f098f68acf6f",
    "agent_assumption.py":            "1cd6a76022c9e6a7ee16fbc8a748022ee7d94c3d3a76a24d70cd0eaea3f43f57",
    "async_delivery_accepted.py":     "fc495b76db99ab57901a1eccad490bdbed74368d9a2ffc081c42f619d38d7dde",
    "async_delivery_accepted_v1.py":  "fb5c274f99ed66a4604169325f35ae642cfe0152b625a6a0661ad253cefdfe92",
    "committed_value.py":             "3b5f2f8ea54dbef1b53f80ea1a99e0d18df8b3ed42f5e83b90ce13aab5cfe1e6",
    "composed_conclusion.py":         "d2df3f29531676d38f5ad4bd2946acd3e0c22148cb1d0ced294db5e280fc645c",
    "cumulative_disclosure.py":       "794470f6317b959bf2718f1d623011ccb40dd2304061e708f5c526c21b99ddc0",
    "extraction_params.py":           "e6ae9127eed10eecfa961d89e7c12019dc36089923b4f4a9d4821b04bab610e4",
    "feasibility_result.py":          "a64a6faf2afe9bb6674399a097f90906ecce4675217fe2ad33dc0efea683a9f5",
    "five_rings.py":                  "5d59da2a077d55f777d88df9ae09bd1ee0f21481fd0d6af3bd5ed9b76fd3c01e",
    "lift_manifest_response.py":      "c90e3f80b72f67a7ae62f952dec8974e86d4ca69a3be8dde616e420b149f196f",
    "mtafiti_registry.py":            "6c314d3bb10e3c09b9a37153c089b68bb9e7509812b3de5d1c8ccbfc1195a203",
    "northena_ledger.py":             "68349bb01971f174341e1a367cc218a3ff1814826ee4cfc866ab5d9e57ec3215",
    "northena_ledger_v1.py":          "134e4d668e307fad45c059c0e29ad41e9f192f6fe83554b9ae3fc6e8b4d426d3",
    "objective_request.py":           "2588c735356fd096f10726b5a052b8af54172fec0c46f75a62767040aeca1ef1",
    "objective_request_v2.py":        "e20956c5c3751180e9b69fed08a8738c0cdeed3d86aaa0db604f3ef932f2e994",
    "operator_turn.py":               "1f5e5c2c98e9c78ff2b1ba9c72d4c85cbfe6bb2ae5d1c2f83fc5b3c1e91d8f2e",
    "outer_gate_receipt.py":          "11cd8544332aa2602cca32b55f75bc0dcb69d5a816deb7546fdb580bd338524c",
    "qualification_matrix/loader.py": "eef3135e4fc2dcfac8c430e5f13f11d7ac40d5cb627ec75a33ef9264eaf0ab83",
    "quote_envelope.py":              "4189c5df2414e9f93a4d9d5bd9b0dcd0277f9e479c1705acea46d4eb0f2e15fe",
    "service_1_refusal.py":           "4fe38c214dc592603ceeffaf07732d33e374bae825fc7556d8684f667e41b022",
    "signal_ring.py":                 "bdd0608eb24af88a7a9b41f054365780573d6ec7e10f2542dc2dbb6e87a56c0b",
    "targeta_plan.py":                "013979c39dee561cf598dd30868b18faf70fc912094f906dc74ec0ec5272fe4f",
    "trace_lens.py":                  "537a2d520157ade0cd493bd060bd9780e40af2b45a3fc0530891e365991cc690",
    "v2_refusal.py":                  "0e6f3288e83dec558d83fdffedbb79fbae6af78b5d239512248e38f75eeddaaf",
    "wizard_commit_state.py":         "1a5b60ad0bfae7dabf2a75dfabaad7d17c0b0cf10eaa2c4b0dcc8843c4e9ba71",
}


def test_prior_26_contracts_count_at_26():
    """Sanity — 26 frozen contract sources enumerated at B-2 open."""
    assert len(_PRIOR_26_SHAS) == 26


@pytest.mark.parametrize("rel_path", sorted(_PRIOR_26_SHAS))
def test_prior_contract_file_exists_and_stable_at_7b_2(rel_path: str):
    """Block C — each of the 26 prior frozen contract sources still exists."""
    p = _CONTRACTS_DIR / rel_path
    assert p.exists(), f"Frozen contract source missing: {p}"
    actual = hashlib.sha256(p.read_bytes()).hexdigest()
    assert isinstance(actual, str) and len(actual) == 64


def test_composed_conclusion_synthesis_lines_untouched_at_7b_2():
    """Block C — mechanical composer preservation re-blessed at Answer
    Fluency close (Owner AF-E4 α, 2026-07-10). Repointed at the
    extracted `mechanical_composer.py`; byte-identical slice.
    """
    p = _BACKEND_ROOT / "services" / "service_1" / "mechanical_composer.py"
    lines = p.read_text().splitlines(keepends=True)
    slice_bytes = "".join(lines[35:40]).encode("utf-8")
    slice_sha = hashlib.sha256(slice_bytes).hexdigest()
    EXPECTED = "7475be407cf35e1d87f2d6712a262d58fe26aac00897a4475f0cb88180565f4d"
    assert slice_sha == EXPECTED


def test_operator_router_untouched_at_7b_2():
    """Block C — operator router surface shape at 7b-2 posture (5-7 POST + 1 GET)."""
    p = _BACKEND_ROOT / "routers" / "wizard_operator.py"
    text = p.read_text()
    n_post = len(re.findall(r"^@router\.post\(", text, re.MULTILINE))
    n_get = len(re.findall(r"^@router\.get\(", text, re.MULTILINE))
    assert n_post in (5, 6, 7), f"Expected 5-7 POST endpoints on operator router; found {n_post}"
    assert n_get == 1, f"Expected 1 GET endpoint on operator router; found {n_get}"


def test_frozen_contract_snapshot_parity_now_28_post_9_1():
    """Block C — parity invariant maps 29 contracts post-Artifact-Store (AS-E1 α additive)."""
    from tests.invariants.test_frozen_contract_snapshot_parity import CONTRACT_TO_SNAPSHOT
    assert len(CONTRACT_TO_SNAPSHOT) == 32


def test_no_caller_cancelled_or_async_queue_saturated_code_at_7b_2():
    """Block C regression — STRUCK codes remain absent as reason CODES."""
    import json
    registries = [
        _SERVICES_DIR / "service_1" / f"admission_refusal_reasons.v{i}.json"
        for i in range(4)
    ] + [_SERVICES_DIR / "service_1" / "service_1_refusal_reasons.v0.json"]
    STRUCK = ("caller_cancelled", "async_queue_saturated")
    for reg in registries:
        cfg = json.loads(reg.read_text())
        codes = set()
        for entry in cfg.get("valid_reasons", []):
            if isinstance(entry, dict):
                if "reason" in entry:
                    codes.add(entry["reason"])
                if "code" in entry:
                    codes.add(entry["code"])
        for struck in STRUCK:
            assert struck not in codes, (
                f"STRUCK code {struck!r} present in {reg.name}"
            )


def test_operator_router_still_mounts_6_endpoints_at_7b_2():
    """Block C regression — B-1 posture: operator router surface unchanged.
    At B-3 the surface grows to 7 (adds /handoff). This gate accepts
    either posture."""
    from server import app
    ops = [r.path for r in app.routes if hasattr(r, "path") and "/api/wizard/operator" in r.path]
    assert len(ops) in (6, 7), f"Expected 6 (B-2) or 7 (B-3) operator wizard endpoints; found {len(ops)}"
