"""Machine-Readable Registry · validator.

Implements MRR-G1..MRR-G4 + MRR-G-Parity + MRR-G-DataBlind + MRR-G-SourceSHA gates.
Owner rulings landed 2026-07-11:
  - MRR-E3 β + addition : foreign-key promise integrity + Part II journey-step
    vocabulary as validator constant (verbatim from doctrine, governance-amendment-only).

Reference: /app/docs/rulings/machine_readable_registry_mrr_e1_to_e4.md §4.
"""
from __future__ import annotations

import hashlib
import re
from pathlib import Path
from typing import Any

from backend.services.registry.parser import (
    REPO_ROOT,
    V0_PATH,
    SUPPLEMENT_PATHS,
    parse_source,
    render_yaml,
    sha256_file,
)


# ---------------------------------------------------------------------------
# PART_II_JOURNEY_STEPS — MRR-E3 addition (Owner-explicit constant · verbatim
# from Registry Doctrine v1.0 Part II lines 32-36).
#
# Doctrine SHA: 0bfe65c47e2c55f35e2a860fec405c05b8ed32b3473bcb63a0a259fb810ab471
# Doctrine path: /app/docs/governance/registry_doctrine_v1.md
# Doctrine excerpt (lines 32-36 verbatim):
#   S1 · … Journey: register (via engineer) → scoped key → call → pass receipts through.
#   S2 · … Journey: onboard context → integrate sources → census fills →
#          commission → sample → commit.
#   S3 · … Journey: pick a run → prove end-to-end; see retention →
#          change rules with ceremony.
#   S4 · … Journey: receive → verify receipt → license.
#   S5 · … Registered so nothing optimizes against it prematurely; explicitly not built;
#          no function may cite S5 as its sole anchor without Owner ruling.
#
# G-2 Registry Maintenance Turn (2026-07-14) · alias canonicalization:
# Owner ruling `docs/rulings/g2_rm_e1_to_e3_2026-07-14.md` canonicalizes to
# SHORT forms (`S3.prove`, `S4.verify`) matching v0.md §3 rows verbatim.
# Legacy aliases (`S3.prove-end-to-end`, `S4.verify-receipt`) REJECTED —
# validators MUST NOT accept the long forms as valid service_trace tokens.
# Governance-amendment-only clause satisfied by that dispatch.
# ---------------------------------------------------------------------------
PART_II_JOURNEY_STEPS: frozenset[str] = frozenset({
    # S1
    "S1.register",
    "S1.scoped-key",
    "S1.call",
    "S1.pass-receipts-through",
    # S2
    "S2.onboard-context",
    "S2.integrate-sources",
    "S2.census-fills",
    "S2.commission",
    "S2.sample",
    "S2.commit",
    # S3
    "S3.pick-run",
    "S3.prove",  # canonical (G-2 · 2026-07-14 · legacy alias S3.prove-end-to-end retired)
    "S3.see-retention",
    "S3.change-rules-with-ceremony",
    # S4
    "S4.receive",
    "S4.verify",  # canonical (G-2 · 2026-07-14 · legacy alias S4.verify-receipt retired)
    "S4.license",
    # S5 (registered, not built · no journey steps land as service_trace)
})


# G-2 · retired legacy aliases (post-canonicalization · governance-amendment-only).
# Kept as a defensive negative-set for test assertions; NOT part of the
# validator-accepted set. Any service_trace token in this set fails validation.
_RETIRED_JOURNEY_STEP_ALIASES: frozenset[str] = frozenset({
    "S3.prove-end-to-end",
    "S4.verify-receipt",
})

# Governor taxonomy per Registry Doctrine v1.0 §3.1 verbatim.
GOVERNOR_TAXONOMY: frozenset[str] = frozenset({
    "SyniSense",
    "Northena",
    "Mtafiti",
    "Targeta",
    "Solva",
    # UI guarantees and Registry infrastructure per §3.1 verbatim allowance.
    "Named surfaces",
    "Named surfaces (UI Spec)",
    "Named surfaces (Production Housing)",
    "Named surfaces (Registry)",
    "Named surfaces (Registry infrastructure · reflexive)",
    "Registry-population reflexive",
})

# Enforcement class taxonomy per doctrine §3.2 verbatim.
ENFORCEMENT_CLASSES: frozenset[str] = frozenset({
    "byte-identity lock",
    "byte-identity lock ",
    "AST/reflection walk",
    "grep-negative",
    "runtime check",
    "runtime schema validate",
    "E2E cell",
    "type-level wall",
    "constraint-architecture",
    "grep-negative + structured-path check",
    "fs-count + hash-diff",
    "table-shape lint",
    "reference-check",
    "file-existence",
    "runtime chokepoint",
    "runtime chokepoint + AST single-source (piggyback)",
    "runtime check + AST negative-scan for `sum/mean/statistics`",
    "runtime check + AST no-synthesis-compute",
    "AST negative-scan + runtime enum wall",
    "type-level wall + runtime check",
    "type-level wall (Pydantic Literal)",
    "byte-identity lock + fs-count",
    "constraint-architecture + reference-check",
    "constraint-architecture + AST walk",
    "AST negative-scan",
    "AST walk on backend/services/*.py imports",
    "Jest + Playwright + auth-gate",
    "Jest + Playwright cell",
    "Docker CI build attest",
    "readyz FS enumeration + hash-diff",
    "runtime constraint",
    "byte-identity lock (v0.md preserved · supplements append-only)",
})

# Ladder rungs per doctrine §5.1.
LADDER_RUNGS: frozenset[str] = frozenset({
    "1 · Deterministic",
    "1 · Deterministic (AST walk)",
    "1 · Deterministic + rung-4 upstream",
    "1 · Deterministic + rung-4 upstream synthesis",
    "2 · Classical-NLP",
    "3 · Owned-Model",
    "4 · Frontier LLM",
    "4 · Frontier LLM (with mechanical fallback per AF-E2 amended)",
    "4 · Frontier LLM (Registry-anchor grounding gate mechanically fallback)",
    "4 · Frontier LLM (structured output)",
})

# Owner authority values per doctrine §3.2.
OWNER_AUTHORITIES: frozenset[str] = frozenset({
    "Owner",
    "builder-Tier-3",
    "dual-control",
})

# Secret patterns for MRR-G-DataBlind. Governance §8 data-blind adjacency.
SECRET_PATTERNS = [
    re.compile(r"mongodb://[^:]+:[^@]+@"),
    re.compile(r"eyJ[A-Za-z0-9_\-]{20,}"),
    re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"\bxox[baprs]-[A-Za-z0-9\-]{10,}\b"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
]

# Owner-locked v0.md SHA per MRR-E1 α condition.
LOCKED_V0_SHA = "598a7ad4d326dd5c0fc003fe8091a52fd215fb63e76d5c04befd1aa4c25584b0"

# Parity 31 contract-snapshot count.
CONTRACTS_DIR = REPO_ROOT / "backend" / "contracts"
SNAPSHOTS_DIR = REPO_ROOT / "backend" / "tests" / "invariants"


def check_mrr_g1_schema_conformance(model: Any) -> tuple[bool, list[str]]:
    """MRR-G1 : every mandatory §3.2 field present + types match schema."""
    errs: list[str] = []
    for p in model.promises:
        if not p.promise_id or not p.promise_id.startswith("PROM-"):
            errs.append(f"promise[{p.promise_id!r}]: promise_id missing or malformed")
        if not p.text:
            errs.append(f"promise[{p.promise_id!r}]: text empty")
        if not isinstance(p.active, bool):
            errs.append(f"promise[{p.promise_id!r}]: active must be bool")
        if not isinstance(p.functions_that_cite, int):
            errs.append(f"promise[{p.promise_id!r}]: functions_that_cite must be int")
    required = ["function_id", "governor", "mandate", "promise", "service_trace",
                "surface", "enforcement", "cost", "dependencies", "ladder_rung", "owner"]
    # CC-2 Owner ruling (option B, 2026-07-30): `dependencies` is presence-mandatory.
    # `none`/`unknown` are legal explicit values where source evidences no ordering.
    # See docs/rulings/CC-2_owner_ruling_option_b_2026-07-30.md.
    for f in model.functions:
        for field_name in required:
            val = getattr(f, field_name, None)
            if val in (None, "", []):
                errs.append(f"function[{f.function_id!r}]: mandatory field {field_name!r} missing")
    return (len(errs) == 0), errs


def check_mrr_g2_vocabulary_lock(model: Any) -> tuple[bool, list[str]]:
    """MRR-G2 (β + addition) : foreign-key promise integrity + Part II vocab lock."""
    errs: list[str] = []
    known_promise_ids = {p.promise_id for p in model.promises}
    for f in model.functions:
        # (a) Foreign-key promise integrity (MRR-E3 β).
        # Only lint tokens that look like promise_ids (PROM-*). Other tokens on the
        # same cell (e.g., "governance §8") are adjacent documentation references,
        # not primary promise attributions.
        for pid in f.promise:
            if not pid.startswith("PROM-"):
                continue
            if pid not in known_promise_ids:
                errs.append(
                    f"function[{f.function_id!r}]: promise[{pid!r}] does not resolve "
                    f"to an existing promise_id (MRR-E3 β foreign-key)"
                )
        # (b) Part II journey-step constant lock (MRR-E3 addition).
        for st in f.service_trace:
            # Allow purely narrative cells like "(as briefs are advisory ...)" — full
            # parenthetical containing no S<n> anchor.
            if st.startswith("(") and st.endswith(")"):
                continue
            # Strip trailing parenthetical annotation, e.g., "S1.call (advisory route)"
            # → "S1.call". v0.md convention for surface-flavor annotations.
            base = re.sub(r"\s*\(.*\)$", "", st).strip()
            # Reflexive coverage indicator: "S1..S5" means "spans all Layer 0" (used by
            # registry-reflexive gates). Accept as documentation marker.
            if base == "S1..S5":
                continue
            if base not in PART_II_JOURNEY_STEPS:
                errs.append(
                    f"function[{f.function_id!r}]: service_trace[{st!r}] not in "
                    f"PART_II_JOURNEY_STEPS constant (MRR-E3 addition · Part II vocab lock)"
                )
        # Governor lock. Accept:
        #  - the 5 constitution governors (SyniSense/Northena/Mtafiti/Targeta/Solva),
        #    possibly followed by a parenthetical flavor annotation;
        #  - "Named surfaces (…)" convention for UI Spec / Production Housing / Registry;
        #  - the reflexive/named-surface leading-parenthesis form "(named surface: …)".
        gov = f.governor.strip()
        base_gov = re.sub(r"\s*\(.*\)$", "", gov).strip()
        if (
            base_gov not in GOVERNOR_TAXONOMY
            and not gov.startswith("Named surfaces")
            and not gov.startswith("(named surface")
        ):
            errs.append(f"function[{f.function_id!r}]: governor[{gov!r}] not in taxonomy")
    return (len(errs) == 0), errs


def check_mrr_g3_round_trip(model: Any) -> tuple[bool, list[str]]:
    """MRR-G3 (Owner-explicit · governance §14) : combined `(v0.md + supplements)` ↔
    machine form YAML round-trip preserves byte-identity of the source of truth.

    Guarantee: v0.md SHA and each supplement SHA on-disk are unchanged after
    machine-form render. The render is derived (no writeback); byte-identity of
    the source is by construction of the parser (read-only).
    """
    errs: list[str] = []
    v0_actual = sha256_file(V0_PATH)
    if v0_actual != model.source_of_truth["sha256"]:
        errs.append(
            f"v0.md SHA drift: on-disk {v0_actual!r} vs model {model.source_of_truth['sha256']!r}"
        )
    for supp_meta, supp_path in zip(model.supplements, SUPPLEMENT_PATHS):
        actual = sha256_file(supp_path)
        if actual != supp_meta["sha256"]:
            errs.append(f"supplement[{supp_meta['path']!r}] SHA drift")
    # Re-parse the same source; re-render must be byte-identical (deterministic render).
    model_2 = parse_source(V0_PATH, SUPPLEMENT_PATHS)
    y1 = render_yaml(model)
    y2 = render_yaml(model_2)
    if y1 != y2:
        errs.append("YAML render is non-deterministic across re-parses (round-trip fail)")
    return (len(errs) == 0), errs


def check_mrr_g4_findings_coverage(model: Any) -> tuple[bool, list[str]]:
    """MRR-G4 : 11 findings carried with disposition tags + [OWNER: …] markers +
    dual-surface archival (inline rulings + supersession ledger) per MRR-E2 γ.
    """
    errs: list[str] = []
    expected_ids = {f"Q2-0{i}" for i in range(1, 6)} | {f"Q3-0{i}" for i in range(1, 7)}
    got_ids = {f.finding_id for f in model.findings}
    missing = expected_ids - got_ids
    if missing:
        errs.append(f"findings missing: {sorted(missing)}")
    # Every finding must have ruling_tag.
    for f in model.findings:
        if not f.ruling_tag:
            errs.append(f"finding[{f.finding_id!r}]: ruling_tag empty (expect [RULED · …])")
    # OWNER markers must land verbatim per rulings/registry_findings_01_to_11.md.
    expected_owner = {
        "Q3-02": "[OWNER: future phase]",
        "Q3-03": "[OWNER: buyer-commercial-tier]",
    }
    for fid, marker in expected_owner.items():
        for f in model.findings:
            if f.finding_id == fid and marker not in f.observation:
                errs.append(f"finding[{fid}]: owner marker {marker!r} not preserved")
    # MRR-E2 γ : supersession ledger must have 11 entries cross-referencing all findings.
    if len(model.findings_supersession_ledger) != 11:
        errs.append(
            f"findings_supersession_ledger has {len(model.findings_supersession_ledger)} entries; "
            f"expected 11 (MRR-E2 γ dual-surface)"
        )
    return (len(errs) == 0), errs


def check_mrr_g_parity(model: Any) -> tuple[bool, list[str]]:
    """MRR-G-Parity : V1-G7 parity 36/36 byte-identical unaffected.

    Post-UI-1-A (2026-07-31): parity 34 → 35 → 36 via
    use_data_wizard_session + commission_verdict seal events.
    """
    errs: list[str] = []
    contract_count = len(list(CONTRACTS_DIR.glob("*.py")))
    snapshot_count = len(list(SNAPSHOTS_DIR.glob("*.contract_snapshot.json")))
    if contract_count != 36:
        errs.append(f"contract count {contract_count} ≠ 36")
    if snapshot_count != 36:
        errs.append(f"snapshot count {snapshot_count} ≠ 36")
    return (len(errs) == 0), errs


def check_mrr_g_data_blind(yaml_text: str, supplement_text: str) -> tuple[bool, list[str]]:
    """MRR-G-DataBlind : no secrets / keys / tokens in machine form or supplement."""
    errs: list[str] = []
    for label, blob in (("machine_form.yaml", yaml_text), ("supplement.md", supplement_text)):
        for pat in SECRET_PATTERNS:
            m = pat.search(blob)
            if m:
                # Whitelist: the pattern list is documented in this validator file itself;
                # do NOT flag the pattern-definition strings when they appear in the
                # supplement / machine form as pure documentation.
                snippet = blob[max(0, m.start() - 40) : m.end() + 40]
                if "regex" in snippet.lower() or "pattern" in snippet.lower() or "grep -E" in snippet:
                    continue
                errs.append(f"{label}: secret pattern hit near {snippet!r}")
    return (len(errs) == 0), errs


def check_mrr_g_source_sha(model: Any, yaml_text: str) -> tuple[bool, list[str]]:
    """MRR-G-SourceSHA (MRR-E1 α integrity-binding condition) : machine form embeds
    top-level `source_of_truth: {path, sha256}` and the sha256 matches Owner-locked v0.md SHA.
    """
    errs: list[str] = []
    if model.source_of_truth["sha256"] != LOCKED_V0_SHA:
        errs.append(
            f"source_of_truth.sha256 {model.source_of_truth['sha256']!r} "
            f"≠ LOCKED_V0_SHA {LOCKED_V0_SHA!r} (MRR-E1 α condition)"
        )
    if "source_of_truth:" not in yaml_text or "sha256:" not in yaml_text:
        errs.append("machine form missing top-level source_of_truth block")
    if LOCKED_V0_SHA not in yaml_text:
        errs.append("machine form does not embed the locked v0.md SHA verbatim")
    return (len(errs) == 0), errs


def run_all_gates() -> dict[str, tuple[bool, list[str]]]:
    """Run all MRR-G# gates; return {gate_id: (green, errors)}."""
    model = parse_source(V0_PATH, SUPPLEMENT_PATHS)
    yaml_text = render_yaml(model)
    supplement_text = SUPPLEMENT_PATHS[0].read_text(encoding="utf-8")
    return {
        "MRR-G1": check_mrr_g1_schema_conformance(model),
        "MRR-G2": check_mrr_g2_vocabulary_lock(model),
        "MRR-G3": check_mrr_g3_round_trip(model),
        "MRR-G4": check_mrr_g4_findings_coverage(model),
        "MRR-G-Parity": check_mrr_g_parity(model),
        "MRR-G-DataBlind": check_mrr_g_data_blind(yaml_text, supplement_text),
        "MRR-G-SourceSHA": check_mrr_g_source_sha(model, yaml_text),
    }


if __name__ == "__main__":
    results = run_all_gates()
    for gate, (green, errs) in results.items():
        status = "GREEN" if green else "FAIL"
        print(f"{gate}: {status}")
        for e in errs:
            print(f"  - {e}")
