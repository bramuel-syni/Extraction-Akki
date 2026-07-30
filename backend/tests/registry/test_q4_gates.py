"""G-2 Registry Maintenance · Q4 R4 attest cells (rows #1-4, #6, #7).

Owner ruling: docs/rulings/g2_rm_e1_to_e3_2026-07-14.md · RM-E3 α + advisory
annotation. Q4 standing query: behavioral-rule attestation scan. First-run
findings are a DELIVERABLE per Owner-explicit "First Q4 run's findings are a
deliverable, not a defect".
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

from backend.services.registry.parser import (
    REPO_ROOT,
    SUPPLEMENT_PATHS,
    V0_PATH,
    V1_PATH,
    parse_source,
)
from backend.services.registry.queries import (
    QUERIES_DIR,
    annotate_q4_mechanical_overlaps,
    build_archaeological_index,
    load_archaeological_q1,
    load_archaeological_q2_q3,
    run_q4,
    scan_q4_behavioral_rules,
)


Q4_ARCH_PATH = QUERIES_DIR / "q4_archaeological.md"
Q4_MECH_PATH = QUERIES_DIR / "q4_mechanical.md"


# ---------------------------------------------------------------------------
# R4 row #1 · akki.registry.q4_standing_query_run
# ---------------------------------------------------------------------------


def test_q4_standing_query_runs_and_emits_two_files():
    """R4 #1: run_q4() emits both q4_archaeological.md and q4_mechanical.md."""
    outputs = run_q4(write=True, run_timestamp="2026-07-14T00:00:00+00:00")
    assert "q4_archaeological.md" in outputs
    assert "q4_mechanical.md" in outputs
    assert Q4_ARCH_PATH.exists()
    assert Q4_MECH_PATH.exists()


# ---------------------------------------------------------------------------
# R4 row #2 · akki.registry.q4_archaeological_byte_identical_reproduction
# ---------------------------------------------------------------------------


def test_q4_archaeological_reproduction_byte_identical():
    """R4 #2: successive runs of Q4 archaeological emit byte-identical output
    (SQ-G-Baseline pattern extended)."""
    ts = "2026-07-14T00:00:00+00:00"
    a = run_q4(write=False, run_timestamp=ts)["q4_archaeological.md"]
    b = run_q4(write=False, run_timestamp=ts)["q4_archaeological.md"]
    assert a == b, "Q4 archaeological reproduction NOT byte-identical"


# ---------------------------------------------------------------------------
# R4 row #3 · akki.registry.q4_mechanical_scan_reports_unverified_rules
# ---------------------------------------------------------------------------


def test_q4_mechanical_scan_emits_report_level_artifact():
    """R4 #3: Q4 mechanical scan is report-level (NEVER build-failing).

    Even if UNVERIFIED entries surface, the scan itself PASSES (report-level).
    Per RM-E3 α: first-run findings are a DELIVERABLE.
    """
    outputs = run_q4(write=False, run_timestamp="2026-07-14T00:00:00+00:00")
    mech_text = outputs["q4_mechanical.md"]
    assert "REPORT-LEVEL" in mech_text
    assert "NEVER BUILD-FAILING" in mech_text
    assert "RM-E3 α" in mech_text


def test_q4_mechanical_flags_client_promise_when_present():
    """RM-E3 α: UNVERIFIED-on-client-promise rows carry the escalation flag."""
    model = parse_source(V0_PATH, SUPPLEMENT_PATHS)
    entries = scan_q4_behavioral_rules(model)
    for e in entries:
        if e.is_client_promise:
            assert e.escalation_flag == "[CLIENT-PROMISE · UNVERIFIED · ESCALATE-AT-CLOSE]"


# ---------------------------------------------------------------------------
# R4 row #4 · akki.registry.q4_cross_reference_condition_holds
# ---------------------------------------------------------------------------


def test_q4_cross_reference_condition_holds():
    """R4 #4: SQ-E1 γ cross-reference PERMANENT — any Q4 entry overlapping an
    archaeological finding is annotated `overlaps: <finding_id>`, never raised
    as new."""
    model = parse_source(V0_PATH, SUPPLEMENT_PATHS)
    q23 = load_archaeological_q2_q3(model)
    q1_arch = load_archaeological_q1()
    arch_index = build_archaeological_index(q1_arch, q23)
    entries = scan_q4_behavioral_rules(model)
    overlaps = annotate_q4_mechanical_overlaps(entries, arch_index)
    # If any overlap surfaced, verify each has non-empty hits (annotation applied).
    for entry, hits in overlaps:
        assert hits, f"Q4 overlap without hits (SQ-E1 γ violation): {entry.function_id}"


# ---------------------------------------------------------------------------
# R4 row #6 · akki.registry.q4_parity_gate
# ---------------------------------------------------------------------------


def test_q4_run_holds_parity_31():
    """R4 #6: Q4 execution is doc-only + query-engine additive; Parity 31 held."""
    contracts_dir = REPO_ROOT / "backend" / "contracts"
    contract_count = len(list(contracts_dir.glob("*.py")))
    assert contract_count == 32, f"Parity 31 violation: {contract_count} contracts"

    snapshots_dir = REPO_ROOT / "backend" / "tests" / "invariants"
    snapshot_count = len(list(snapshots_dir.glob("*.contract_snapshot.json")))
    assert snapshot_count == 32, f"Parity 31 snapshot violation: {snapshot_count}"


# ---------------------------------------------------------------------------
# R4 row #7 · akki.registry.q4_data_blind_gate
# ---------------------------------------------------------------------------


_SECRET_PATTERNS = [
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bsk-[a-zA-Z0-9]{20,}\b"),
    re.compile(r"\bmongodb\+srv://"),
    re.compile(r"\bBearer\s+[a-zA-Z0-9._-]{20,}\b"),
    re.compile(r"\beyJ[a-zA-Z0-9._-]{20,}"),  # JWT
]


def test_q4_artifacts_data_blind():
    """R4 #7: Q4 artifacts carry zero secrets (governance §8 data-blind extended)."""
    outputs = run_q4(write=False, run_timestamp="2026-07-14T00:00:00+00:00")
    for name, text in outputs.items():
        for pat in _SECRET_PATTERNS:
            match = pat.search(text)
            assert not match, f"Q4 artifact {name} carries secret-shaped token: {match.group(0)[:20] if match else ''}"
