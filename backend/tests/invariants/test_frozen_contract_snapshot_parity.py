"""Mechanical parity invariant — every declared-frozen contract has
exactly one canonical `.contract_snapshot.json`, and every canonical
snapshot corresponds to exactly one declared-frozen contract.

Load-bearing rule that prevents the class of drift discovered on
2026-07-03 (14 declared / 11 enforced via canonical name). Owner
ruling Path B, Part 1, Term 4.

Enumeration rules:
  * Contract source is a `.py` file under `/app/backend/contracts/` at
    top level whose basename is not `__init__.py`, OR a package
    directory under `/app/backend/contracts/` whose `__init__.py` /
    `loader.py` defines frozen Pydantic model(s).
  * Canonical snapshot is any file matching
    `/app/backend/tests/invariants/*.contract_snapshot.json`.

The declared-frozen contract source → canonical snapshot MAPPING is
authoritative (the codebase does not enforce a filename convention
across all snapshots — mtafiti_registry.py → mtafiti_registry_record...,
targeta_plan.py → targeta_mining_plan..., etc.). Adding a new frozen
contract requires adding both the source and the snapshot AND
appending an entry to `CONTRACT_TO_SNAPSHOT`. Missing either side
fails this test.
"""
from pathlib import Path
from typing import Dict, Set

REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
CONTRACTS_DIR = REPO_ROOT / "backend" / "contracts"
INVARIANTS_DIR = REPO_ROOT / "backend" / "tests" / "invariants"


# The authoritative declared-frozen-contract → canonical-snapshot map.
# Every entry MUST correspond to a real source file/package and a real
# `.contract_snapshot.json` on disk. Adding a new frozen contract is a
# two-side edit: add the source AND the snapshot AND an entry here.
CONTRACT_TO_SNAPSHOT: Dict[str, str] = {
    "admission_refusal.py":           "admission_refusal.contract_snapshot.json",
    "agent_assumption.py":            "agent_assumption.contract_snapshot.json",
    "async_delivery_accepted.py":     "async_delivery_accepted.contract_snapshot.json",
    "async_delivery_accepted_v1.py":  "async_delivery_accepted_v1.contract_snapshot.json",
    "committed_value.py":             "committed_value.contract_snapshot.json",
    "composed_conclusion.py":         "composed_conclusion.contract_snapshot.json",
    "cumulative_disclosure.py":       "cumulative_disclosure_ledger.contract_snapshot.json",
    "extraction_params.py":           "extraction_params.contract_snapshot.json",
    "feasibility_result.py":          "feasibility_result.contract_snapshot.json",
    "five_rings.py":                  "five_rings.contract_snapshot.json",
    "lift_manifest_response.py":      "lift_manifest_envelope.contract_snapshot.json",
    "mtafiti_registry.py":            "mtafiti_registry_record.contract_snapshot.json",
    "northena_ledger.py":             "northena_ledger_row.contract_snapshot.json",
    "northena_ledger_v1.py":          "northena_ledger_v1.contract_snapshot.json",
    "objective_request.py":           "objective_request.contract_snapshot.json",
    "objective_request_v2.py":        "objective_request_v2.contract_snapshot.json",
    "operator_turn.py":               "operator_turn.contract_snapshot.json",
    "outer_gate_receipt.py":          "outer_gate_receipt.contract_snapshot.json",
    "outer_gate_receipt_v1.py":       "outer_gate_receipt_v1.contract_snapshot.json",
    "perception_job_v0.py":           "perception_job_v0.contract_snapshot.json",
    "perception_result_v0.py":        "perception_result_v0.contract_snapshot.json",
    "qualification_matrix":           "qualification_matrix.contract_snapshot.json",
    "quote_envelope.py":              "quote_envelope.contract_snapshot.json",
    "service_1_refusal.py":           "service_1_refusal.contract_snapshot.json",
    "signal_ring.py":                 "signal_ring.contract_snapshot.json",
    "targeta_plan.py":                "targeta_mining_plan.contract_snapshot.json",
    "trace_lens.py":                  "trace_lens_envelope.contract_snapshot.json",
    "v2_refusal.py":                  "v2_refusal_envelope.contract_snapshot.json",
    "wizard_commit_state.py":         "wizard_commit_state.contract_snapshot.json",
    "knowledge_artifact_v0.py":       "knowledge_artifact_v0.contract_snapshot.json",
    "callable_skill_provisioning_v0.py": "callable_skill_provisioning_v0.contract_snapshot.json",
    "trust_receipt_v1.py":               "trust_receipt_v1.contract_snapshot.json",  # P1 close 2026-07-30 · Owner condition (i)
}


def _enumerate_contract_sources() -> Set[str]:
    """Every `.py` file (excluding `__init__.py`) plus every package
    directory at the top level of `/app/backend/contracts/`."""
    out: Set[str] = set()
    for entry in CONTRACTS_DIR.iterdir():
        if entry.name.startswith("__") or entry.name.startswith("."):
            continue
        if entry.is_file() and entry.suffix == ".py":
            out.add(entry.name)
        elif entry.is_dir():
            out.add(entry.name)
    return out


def _enumerate_canonical_snapshots() -> Set[str]:
    """Every file matching `*.contract_snapshot.json` under invariants/."""
    return {p.name for p in INVARIANTS_DIR.glob("*.contract_snapshot.json")}


def test_every_frozen_contract_has_snapshot():
    """Every declared-frozen contract source is mapped and its snapshot exists on disk."""
    disk_sources = _enumerate_contract_sources()
    mapped_sources = set(CONTRACT_TO_SNAPSHOT.keys())
    unmapped = disk_sources - mapped_sources
    assert not unmapped, (
        f"Parity FAIL — contract source(s) on disk not mapped to a canonical "
        f".contract_snapshot.json: {sorted(unmapped)}. Add source→snapshot "
        f"entry to CONTRACT_TO_SNAPSHOT and create the snapshot, or excise the "
        f"source if it is not a frozen contract."
    )
    orphan_map_entries = mapped_sources - disk_sources
    assert not orphan_map_entries, (
        f"Parity FAIL — CONTRACT_TO_SNAPSHOT references source(s) not present "
        f"on disk under /app/backend/contracts/: {sorted(orphan_map_entries)}."
    )
    for src, snap in CONTRACT_TO_SNAPSHOT.items():
        snap_path = INVARIANTS_DIR / snap
        assert snap_path.exists(), (
            f"Parity FAIL — contract source {src!r} is mapped to {snap!r} but "
            f"the snapshot file does not exist at {snap_path}."
        )


def test_every_snapshot_maps_to_a_contract():
    """Every `.contract_snapshot.json` on disk is claimed by exactly one contract source."""
    disk_snapshots = _enumerate_canonical_snapshots()
    mapped_snapshots = set(CONTRACT_TO_SNAPSHOT.values())
    unclaimed = disk_snapshots - mapped_snapshots
    assert not unclaimed, (
        f"Parity FAIL — canonical snapshot(s) on disk not claimed by any contract "
        f"source in CONTRACT_TO_SNAPSHOT: {sorted(unclaimed)}. Either add the "
        f"claiming source or remove the orphan snapshot."
    )
    missing_snapshots = mapped_snapshots - disk_snapshots
    assert not missing_snapshots, (
        f"Parity FAIL — CONTRACT_TO_SNAPSHOT claims snapshot(s) not present on "
        f"disk: {sorted(missing_snapshots)}."
    )


def test_snapshot_mapping_is_bijective():
    """No two contract sources share a snapshot, and no snapshot claims are duplicated."""
    values = list(CONTRACT_TO_SNAPSHOT.values())
    assert len(values) == len(set(values)), (
        f"Parity FAIL — CONTRACT_TO_SNAPSHOT is not bijective (duplicate snapshot "
        f"claim). Values: {sorted(values)}"
    )
    keys = list(CONTRACT_TO_SNAPSHOT.keys())
    assert len(keys) == len(set(keys)), (
        f"Parity FAIL — CONTRACT_TO_SNAPSHOT is not bijective (duplicate source "
        f"claim). Keys: {sorted(keys)}"
    )
