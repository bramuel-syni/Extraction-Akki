"""Contract-snapshot invariants — G0 freeze enforcement.

Pattern lifted from
/reference/akki-legacy/backend/tests/invariants/test_invariant_contract_snapshots.py
(Operating Protocol v2 §1.7: "Public contracts cannot change silently.").
Adapted from the legacy Protocol-signature pattern to Pydantic
`model_json_schema()` because RMS G0 contracts are data models, not method
Protocols.

Freeze contract: every public Pydantic schema below has a JSON snapshot
in this directory. The snapshot is compared on every CI run. ANY drift
fails loudly and requires re-blessing in code review.

The Qualification Matrix gets TWO snapshots:
  * schema_snapshot     — the model shape.
  * v0.content_snapshot — the actual v0 rule rows. Any cell edit must
                          land as `v1.json` (bumped rev) + a new content
                          snapshot, never silent v0 mutation.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

import pytest

from contracts.five_rings import NormalizedUnit
from contracts.objective_request import ObjectiveRequest
from contracts.qualification_matrix.loader import (
    QualificationMatrix,
    load_qualification_matrix,
)
# UI-1-A seal events (2026-07-31) — parity 34→35→36.
from contracts.use_data_wizard_session import UseDataWizardSession
from contracts.commission_verdict import CommissionVerdict

SNAPSHOT_DIR = Path(__file__).parent


def _read(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _canonical(obj: Any) -> str:
    return json.dumps(obj, indent=2, sort_keys=True)


def _diff_message(name: str, actual: Any, expected: Any) -> str:
    a = _canonical(actual)
    e = _canonical(expected)
    return (
        f"\n\n=== CONTRACT DRIFT — {name} ===\n"
        f"The frozen snapshot at\n  {SNAPSHOT_DIR}\nno longer matches the\n"
        f"live schema. If the change is intentional, re-bless the snapshot\n"
        f"in code review; otherwise revert the model edit.\n\n"
        f"EXPECTED (first 400 chars):\n{e[:400]}\n\n"
        f"ACTUAL   (first 400 chars):\n{a[:400]}\n"
    )


def test_five_rings_schema_frozen():
    expected = _read(SNAPSHOT_DIR / "five_rings.contract_snapshot.json")
    actual = NormalizedUnit.model_json_schema()
    assert _canonical(actual) == _canonical(expected), _diff_message(
        "five_rings (NormalizedUnit)", actual, expected
    )


def test_objective_request_schema_frozen():
    expected = _read(SNAPSHOT_DIR / "objective_request.contract_snapshot.json")
    actual = ObjectiveRequest.model_json_schema()
    assert _canonical(actual) == _canonical(expected), _diff_message(
        "objective_request (ObjectiveRequest)", actual, expected
    )


def test_qualification_matrix_schema_frozen():
    expected = _read(SNAPSHOT_DIR / "qualification_matrix.schema_snapshot.json")
    actual = QualificationMatrix.model_json_schema()
    assert _canonical(actual) == _canonical(expected), _diff_message(
        "qualification_matrix schema", actual, expected
    )


def test_qualification_matrix_v0_content_frozen():
    """Catches silent edits to v0.json. Cell edits MUST bump the rev."""
    expected = _read(SNAPSHOT_DIR / "qualification_matrix.v0.content_snapshot.json")
    actual = load_qualification_matrix("v0").model_dump()
    assert _canonical(actual) == _canonical(expected), _diff_message(
        "qualification_matrix v0 content", actual, expected
    )


# =============================================================================
# UI-1-A seal events (2026-07-31) — parity 34→35→36.
# Canon §6.2/§6.3 (UseDataWizardSession) + §6.4 (CommissionVerdict).
# D4b freeze arguments filed at
#   docs/stage_a_proposals/ui_1_stage_a_experience_canon_v1_2026-07-31.md §3.
# =============================================================================


def test_use_data_wizard_session_schema_frozen():
    expected = _read(SNAPSHOT_DIR / "use_data_wizard_session.contract_snapshot.json")
    actual = UseDataWizardSession.model_json_schema()
    assert _canonical(actual) == _canonical(expected), _diff_message(
        "use_data_wizard_session (UseDataWizardSession)", actual, expected
    )


def test_commission_verdict_schema_frozen():
    expected = _read(SNAPSHOT_DIR / "commission_verdict.contract_snapshot.json")
    actual = CommissionVerdict.model_json_schema()
    assert _canonical(actual) == _canonical(expected), _diff_message(
        "commission_verdict (CommissionVerdict)", actual, expected
    )
