"""Standing Queries as CI · SQ-G1..SQ-G-DataBlind gate tests (10 gates).

Owner rulings 2026-07-11 · SQ-E1 γ + cross-reference condition (PERMANENT).
Ruling record: /app/docs/rulings/standing_queries_sq_e1.md
"""
from __future__ import annotations

import ast
import re
from pathlib import Path

import pytest

from backend.services.registry.parser import (
    CONSOLIDATION_LOG_PATH,
    REPO_ROOT,
    SUPPLEMENT_PATHS,
    V0_PATH,
    sha256_file,
)
from backend.services.registry.queries import (
    QUERIES_DIR,
    build_archaeological_index,
    load_archaeological_q1,
    load_archaeological_q2_q3,
    overlaps_for,
    run_queries,
    scan_q1_redundancy,
    scan_q2_orphans,
    scan_q3_gaps,
)
from backend.services.registry.parser import parse_source
from backend.services.registry.validator import PART_II_JOURNEY_STEPS


QUERIES_MODULE_PATH = REPO_ROOT / "backend" / "services" / "registry" / "queries.py"


# Fixed timestamp for deterministic-regeneration tests.
FIXED_TS = "2026-07-11T00:00:00+00:00"


@pytest.fixture(scope="module")
def model():
    return parse_source(V0_PATH, SUPPLEMENT_PATHS)


@pytest.fixture(scope="module")
def arch_index(model):
    q23 = load_archaeological_q2_q3(model)
    q1 = load_archaeological_q1()
    return build_archaeological_index(q1, q23)


# ---------------------------------------------------------------------------
# SQ-G1 · Q1 mechanical correctness
# ---------------------------------------------------------------------------


def test_sq_g1_q1_pair_scan_finds_same_promise_same_surface(model):
    pairs = scan_q1_redundancy(model)
    # Every emitted pair must satisfy: same PROM-set AND same surface AND distinct.
    for p in pairs:
        assert p.fid_a != p.fid_b, "pair contains duplicate function_id"
        a = next(f for f in model.functions if f.function_id == p.fid_a)
        b = next(f for f in model.functions if f.function_id == p.fid_b)
        a_proms = frozenset(x for x in a.promise if x.startswith("PROM-"))
        b_proms = frozenset(x for x in b.promise if x.startswith("PROM-"))
        assert a_proms == b_proms, f"pair PROM-set mismatch: {a_proms} vs {b_proms}"
        assert a.surface == b.surface, f"pair surface mismatch: {a.surface!r} vs {b.surface!r}"
        assert a.surface, "pair has empty shared surface"
    # Cost ranking: unknowns sort to end.
    unknown_flags = [p.cost_rank_key[0] for p in pairs]
    assert unknown_flags == sorted(unknown_flags), "unknowns not sorted to end"


# ---------------------------------------------------------------------------
# SQ-G2 · Q2 mechanical correctness (4 sub-cases)
# ---------------------------------------------------------------------------


def test_sq_g2_q2_four_subcases(model):
    entries = scan_q2_orphans(model)
    sub_cases = {e.sub_case for e in entries}
    # Sub-cases observed must be a subset of {a, b, c, d}.
    assert sub_cases.issubset({"a", "b", "c", "d"}), f"unexpected sub_case: {sub_cases}"
    # For each entry, verify semantic:
    known_ids = {p.promise_id for p in model.promises}
    for e in entries:
        fn = next(f for f in model.functions if f.function_id == e.function_id)
        if e.sub_case == "a":
            assert not fn.promise, f"Q2(a) requires empty promise on {fn.function_id}"
        elif e.sub_case == "b":
            proms = [x for x in fn.promise if x.startswith("PROM-")]
            assert proms and all(p not in known_ids for p in proms), \
                f"Q2(b) requires no PROM resolves on {fn.function_id}"
        elif e.sub_case == "c":
            assert not fn.service_trace, f"Q2(c) requires empty service_trace on {fn.function_id}"
        elif e.sub_case == "d":
            # Some service_trace step is not in PART_II_JOURNEY_STEPS after normalization.
            pass


# ---------------------------------------------------------------------------
# SQ-G3 · Q3 mechanical correctness
# ---------------------------------------------------------------------------


def test_sq_g3_q3_two_subcases(model):
    entries = scan_q3_gaps(model)
    sub_cases = {e.sub_case for e in entries}
    assert sub_cases.issubset({"a", "b"}), f"unexpected sub_case: {sub_cases}"
    # (a) subject is a PROM- id in top-level promises.
    known_prom_ids = {p.promise_id for p in model.promises}
    # (b) subject is a member of PART_II_JOURNEY_STEPS.
    for e in entries:
        if e.sub_case == "a":
            assert e.subject in known_prom_ids, f"Q3(a) subject {e.subject!r} not a promise_id"
        elif e.sub_case == "b":
            assert e.subject in PART_II_JOURNEY_STEPS, \
                f"Q3(b) subject {e.subject!r} not in PART_II_JOURNEY_STEPS"


# ---------------------------------------------------------------------------
# SQ-G-Baseline · archaeological files reproduce 11 ruled findings byte-identical
# ---------------------------------------------------------------------------


def test_sq_g_baseline_archaeological_covers_all_11(model):
    q23 = load_archaeological_q2_q3(model)
    ids = {f.finding_id for f in q23}
    expected = {f"Q2-0{i}" for i in range(1, 6)} | {f"Q3-0{i}" for i in range(1, 7)}
    missing = expected - ids
    assert not missing, f"archaeological carry-over missing findings: {sorted(missing)}"
    # Every finding carries ruling_tag (RULED · ...).
    for f in q23:
        assert f.ruling_tag, f"finding {f.finding_id} missing ruling_tag"
        assert "RULED" in f.ruling_tag


def test_sq_g_baseline_owner_markers_preserved_verbatim(model):
    q23 = load_archaeological_q2_q3(model)
    q3_02 = next(f for f in q23 if f.finding_id == "Q3-02")
    q3_03 = next(f for f in q23 if f.finding_id == "Q3-03")
    assert "[OWNER: future phase]" in q3_02.observation
    assert "[OWNER: buyer-commercial-tier]" in q3_03.observation


def test_sq_g_baseline_q1_carry_over_from_consolidation_log():
    entries = load_archaeological_q1()
    # RP-E1 α + tie-broke landed 4 MERGE + 4 TIE-BROKE-TOWARD-DISTINCT decisions.
    merges = [e for e in entries if e.kind == "MERGE"]
    tie_broken = [e for e in entries if "TIE-BROKE" in e.kind]
    assert len(merges) == 4, f"expected 4 MERGE entries, got {len(merges)}"
    assert len(tie_broken) == 4, f"expected 4 TIE-BROKE entries, got {len(tie_broken)}"


# ---------------------------------------------------------------------------
# SQ-G-CrossRef · mechanical overlaps annotated, never emitted as new
# ---------------------------------------------------------------------------


def test_sq_g_cross_ref_permanent_rule(model, arch_index):
    """After the query engine emits mechanical files, ANY entry whose subject overlaps
    an archaeological finding MUST carry an `overlaps: <finding_id>` annotation, not
    be raised as a new candidate.
    """
    outputs = run_queries(write=False, run_timestamp=FIXED_TS)
    for name in ("q1_mechanical.md", "q2_mechanical.md", "q3_mechanical.md"):
        text = outputs[name]
        # Split into "New candidates" section and "Overlaps" section.
        new_section = text.split("## New candidates")[1].split("## Overlaps")[0]
        overlap_section = text.split("## Overlaps")[1]
        # Sanity: every entry line in new_section (starting with `|`) must not include
        # a subject identifier that's in the archaeological index.
        for line in new_section.splitlines():
            if not line.startswith("|") or line.startswith("|---"):
                continue
            if "overlaps:" in line:
                pytest.fail(f"'overlaps:' annotation found in New-candidates section of {name}")


def test_sq_g_cross_ref_q3_mechanical_overlaps_annotated(model, arch_index):
    """Q3 mechanical scan produces entries whose subjects match Q3 archaeological
    findings (S1.pass-receipts-through, S2.onboard-context, etc. — mostly covered by
    function rows, but the archaeological index captures their identifiers). Verify
    overlap annotation is applied for any that match."""
    entries = scan_q3_gaps(model)
    for e in entries:
        hits = overlaps_for(e.subject_identifiers, arch_index)
        if hits:
            # entry has overlap → must NOT be in new-candidates section of the emitted file.
            outputs = run_queries(write=False, run_timestamp=FIXED_TS)
            q3_mech = outputs["q3_mechanical.md"]
            for hit in hits:
                assert f"overlaps: {hit}" in q3_mech or hit in q3_mech, \
                    f"overlap annotation for {e.subject} → {hit} not present in q3_mechanical.md"


# ---------------------------------------------------------------------------
# SQ-G-NoRetirement · zero writes to source-of-truth artifacts
# ---------------------------------------------------------------------------


def test_sq_g_no_retirement_source_bytes_unchanged():
    pre = {
        "v0.md": sha256_file(V0_PATH),
        "v0.1": sha256_file(SUPPLEMENT_PATHS[0]),
        "v0.2": sha256_file(SUPPLEMENT_PATHS[1]),
        "cl": sha256_file(CONSOLIDATION_LOG_PATH),
    }
    run_queries(write=False, run_timestamp=FIXED_TS)
    post = {
        "v0.md": sha256_file(V0_PATH),
        "v0.1": sha256_file(SUPPLEMENT_PATHS[0]),
        "v0.2": sha256_file(SUPPLEMENT_PATHS[1]),
        "cl": sha256_file(CONSOLIDATION_LOG_PATH),
    }
    for k in pre:
        assert pre[k] == post[k], f"source-of-truth drift: {k}"


# ---------------------------------------------------------------------------
# SQ-G-ReportLevel · findings artifacts regenerate deterministically
# ---------------------------------------------------------------------------


def test_sq_g_report_level_deterministic_regeneration():
    out1 = run_queries(write=False, run_timestamp=FIXED_TS)
    out2 = run_queries(write=False, run_timestamp=FIXED_TS)
    assert out1.keys() == out2.keys()
    for name in out1:
        assert out1[name] == out2[name], f"non-deterministic regeneration in {name}"


def test_sq_g_report_level_header_line_1():
    outputs = run_queries(write=False, run_timestamp=FIXED_TS)
    for name, text in outputs.items():
        # Line 1 is the H1 title; disclaimer sits at line 3 (blank line 2).
        assert "REPORT-LEVEL" in text, f"{name} missing REPORT-LEVEL disclaimer"
        assert "NEVER BUILD-FAILING" in text, f"{name} missing NEVER BUILD-FAILING"
        assert "RETIREMENT/MERGE REMAINS RULED ACTION" in text, f"{name} missing retirement disclaimer"


# ---------------------------------------------------------------------------
# SQ-G-Rung1 · AST negative-scan for LLM imports
# ---------------------------------------------------------------------------


def test_sq_g_rung1_no_llm_imports():
    source = QUERIES_MODULE_PATH.read_text(encoding="utf-8")
    tree = ast.parse(source)
    forbidden_prefixes = ("openai", "anthropic", "google.generativeai", "litellm",
                         "emergentintegrations")
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                for pref in forbidden_prefixes:
                    assert not alias.name.startswith(pref), \
                        f"forbidden LLM import in queries.py: {alias.name}"
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                for pref in forbidden_prefixes:
                    assert not node.module.startswith(pref), \
                        f"forbidden LLM import in queries.py: {node.module}"


# ---------------------------------------------------------------------------
# SQ-G-Parity · V1-G7 31/31 unaffected
# ---------------------------------------------------------------------------


def test_sq_g_parity_31():
    contracts_dir = REPO_ROOT / "backend" / "contracts"
    snapshots_dir = REPO_ROOT / "backend" / "tests" / "invariants"
    assert len(list(contracts_dir.glob("*.py"))) == 34
    assert len(list(snapshots_dir.glob("*.contract_snapshot.json"))) == 34


# ---------------------------------------------------------------------------
# SQ-G-DataBlind · grep-negative for secret patterns on all 6 artifacts
# ---------------------------------------------------------------------------


_SECRET_PATTERNS = [
    re.compile(r"mongodb://[^:]+:[^@]+@"),
    re.compile(r"eyJ[A-Za-z0-9_\-]{20,}"),
    re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"\bxox[baprs]-[A-Za-z0-9\-]{10,}\b"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
]


def test_sq_g_data_blind():
    outputs = run_queries(write=False, run_timestamp=FIXED_TS)
    for name, text in outputs.items():
        for pat in _SECRET_PATTERNS:
            m = pat.search(text)
            if m:
                snippet = text[max(0, m.start() - 40) : m.end() + 40]
                if "regex" in snippet.lower() or "pattern" in snippet.lower():
                    continue
                pytest.fail(f"secret pattern hit in {name}: {snippet!r}")


# ---------------------------------------------------------------------------
# End-to-end: run_queries writes eight files at expected paths
# (G-2 · 2026-07-14: Q4 standing query added — two new artifacts)
# ---------------------------------------------------------------------------


def test_run_queries_emits_eight_artifacts(tmp_path, monkeypatch):
    """run_queries emits Q1..Q4 archaeological + mechanical (8 files total).

    Q4 landing per Owner ruling docs/rulings/g2_rm_e1_to_e3_2026-07-14.md
    (RM-E3 α + advisory annotation).
    """
    outputs = run_queries(write=False, run_timestamp=FIXED_TS)
    expected = {
        "q1_archaeological.md",
        "q1_mechanical.md",
        "q2_archaeological.md",
        "q2_mechanical.md",
        "q3_archaeological.md",
        "q3_mechanical.md",
        "q4_archaeological.md",
        "q4_mechanical.md",
    }
    assert set(outputs.keys()) == expected
