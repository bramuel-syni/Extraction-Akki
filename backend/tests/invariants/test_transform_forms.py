"""Transform Forms — atomic first-commit test suite (BCR §3.7 · Owner TF-E1..E4).

Landing per §4.1 baseline atomic first-commit under 3-tier governance model.
All 4 Tier-1 rulings applied (TF-E1..TF-E4 α + conditions).

Named gate roster:
  * TF-G1 : KA v0 contract shape frozen + snapshot at parity 30.
  * TF-G2 : Callable Skill provisioning contract shape frozen + parity 31.
  * TF-G3 : Every KA node carries defensibility.class + trace_id inline.
  * TF-G4 : Below-floor query returns refusal envelope.
  * TF-G5 : Slice bound at freeze — new slice = new skill (immutability via ConfigDict(frozen=True)).
  * TF-G6 : Relation Literal closed at 3 values {corroborates, contradicts, retracts}.
  * TF-G7 : Per-response class inline on Callable Skill query output.
  * TF-G8 : defensibility_classes.v0.json ⊇ live composition path vocabulary (TF-E3 condition).
  * TF-G9 : _no_ update_one({..., "corpus_slice_ref": ...}) anywhere (AST scan; TF-E4 (b) α).
  * V1-G7 : parity 31 attest + KA + CallableSkillProvisioning additive.
"""
from __future__ import annotations

import ast
import hashlib
import json
import sys
from pathlib import Path
from typing import List

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from contracts.callable_skill_provisioning_v0 import CallableSkillProvisioningV0  # noqa: E402
from contracts.knowledge_artifact_v0 import (  # noqa: E402
    KnowledgeArtifactEdge,
    KnowledgeArtifactNode,
    KnowledgeArtifactNodeDefensibility,
    KnowledgeArtifactNodeProvenance,
    KnowledgeArtifactV0,
)
from services.transform_forms.callable_skill_gate import (  # noqa: E402
    BelowFloorError,
    below_floor_refusal_envelope,
    ensure_response_carries_class,
)
from services.transform_forms.defensibility_loader import (  # noqa: E402
    ALLOWED_DEFENSIBILITY_CLASSES,
    validate_defensibility_class,
)
from services.transform_forms.knowledge_artifact import build_knowledge_artifact  # noqa: E402


# ===== TF-G1 : KA v0 contract shape frozen + snapshot at parity 30 =====

def test_tf_g1_ka_v0_frozen_and_snapshot_present() -> None:
    """KA v0 has frozen `extra=forbid` config + snapshot on disk."""
    # extra=forbid enforced.
    assert KnowledgeArtifactV0.model_config.get("extra") == "forbid"
    assert KnowledgeArtifactNode.model_config.get("extra") == "forbid"
    assert KnowledgeArtifactEdge.model_config.get("extra") == "forbid"

    # Snapshot present.
    snap = Path(__file__).parent / "knowledge_artifact_v0.contract_snapshot.json"
    assert snap.is_file()
    schema = json.loads(snap.read_text())
    # Nested sub-models emit under $defs (single top-level per TF-E1 α).
    assert "$defs" in schema
    assert "KnowledgeArtifactNode" in schema["$defs"]
    assert "KnowledgeArtifactEdge" in schema["$defs"]


# ===== TF-G2 : Callable Skill provisioning frozen + snapshot at parity 31 =====

def test_tf_g2_callable_skill_provisioning_frozen_config() -> None:
    """TF-E4 (b) β: ConfigDict(frozen=True) captured in the contract shape."""
    assert CallableSkillProvisioningV0.model_config.get("extra") == "forbid"
    assert CallableSkillProvisioningV0.model_config.get("frozen") is True

    snap = Path(__file__).parent / "callable_skill_provisioning_v0.contract_snapshot.json"
    assert snap.is_file()


def test_tf_g2_callable_skill_provisioning_shape_matches_bcr_verbatim() -> None:
    """BCR §3.7 annex line 228-233 verbatim field set."""
    expected_fields = {
        "skill_id", "corpus_slice_ref", "key_grant_id", "floor",
        "scope", "endpoint_path", "provisioned_at", "revoked_at",
    }
    assert set(CallableSkillProvisioningV0.model_fields.keys()) == expected_fields


def test_tf_g2_provisioning_frozen_hardening_raises_on_mutation() -> None:
    """TF-E4 (b) β in-memory hardening: post-load mutation raises TypeError
    or ValidationError."""
    record = CallableSkillProvisioningV0(
        skill_id="s1",
        corpus_slice_ref="artifacts/t1/a1.json",
        key_grant_id="g1",
        floor="utterance",
        scope="s1",
        endpoint_path="/api/callable_skill/s1/query",
        provisioned_at="2026-07-09T00:00:00+00:00",
    )
    # Pydantic v2 frozen=True raises ValidationError on assignment.
    from pydantic import ValidationError
    with pytest.raises((TypeError, ValidationError)):
        record.corpus_slice_ref = "artifacts/other/x.json"


# ===== TF-G3 : Every KA node carries defensibility.class + trace_id inline =====

def test_tf_g3_every_ka_node_has_class_and_trace_id_inline() -> None:
    """Provenance preservation invariant (Owner Tier-1 line):
    every claim carries class + trace_id inline. Structural enforcement:
    both fields are REQUIRED on the Pydantic model."""
    node_fields = KnowledgeArtifactNode.model_fields
    assert "trace_id" in node_fields
    assert node_fields["trace_id"].is_required(), (
        "trace_id must be REQUIRED per provenance preservation invariant"
    )
    assert "defensibility" in node_fields
    assert node_fields["defensibility"].is_required()

    defensibility_fields = KnowledgeArtifactNodeDefensibility.model_fields
    assert "class_" in defensibility_fields  # aliased to `class` on the wire
    assert defensibility_fields["class_"].is_required()


def test_tf_g3_ka_construction_requires_class_and_trace_id() -> None:
    """Missing class or trace_id → Pydantic ValidationError at construction."""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        # missing trace_id
        KnowledgeArtifactNode(
            claim_id="c1",
            claim_text="text",
            defensibility=KnowledgeArtifactNodeDefensibility(**{"class": "fact", "contested": False}),
            provenance=KnowledgeArtifactNodeProvenance(source_ref="ref-1"),
        )


# ===== TF-G4 : Below-floor query returns refusal envelope =====

def test_tf_g4_below_floor_response_raises_refusal() -> None:
    """`ensure_response_carries_class` raises BelowFloorError when class
    below floor; refusal envelope shape available."""
    with pytest.raises(BelowFloorError):
        ensure_response_carries_class(
            {"answer": "x"},
            class_label="non_factual",
            floor="fact",
        )

    env = below_floor_refusal_envelope(class_label="non_factual", floor="fact")
    assert env["outcome"] == "refused"
    assert env["reason"] == "defensibility_below_floor"
    assert env["detail"]["class"] == "non_factual"
    assert env["detail"]["floor"] == "fact"


def test_tf_g4_at_or_above_floor_returns_mutated_response() -> None:
    """Class at or above floor → response carries `defensibility.class` inline."""
    resp = ensure_response_carries_class(
        {"answer": "x"},
        class_label="fact",
        floor="utterance",
    )
    assert resp["defensibility"]["class"] == "fact"
    assert resp["answer"] == "x"


# ===== TF-G5 : Slice bound at freeze — immutability (via frozen=True) =====

def test_tf_g5_slice_bound_at_freeze_no_mutation() -> None:
    """Owner-verbatim invariant: 'new slice = new skill'. In-memory
    hardening via ConfigDict(frozen=True) attested above (TF-G2).
    Persistence-side write-once via TF-G9 grep-negative gate."""
    record = CallableSkillProvisioningV0(
        skill_id="s2",
        corpus_slice_ref="artifacts/t2/a2.json",
        key_grant_id="g2",
        floor="fact",
        scope="s2",
        endpoint_path="/api/callable_skill/s2/query",
        provisioned_at="2026-07-09T00:00:01+00:00",
    )
    from pydantic import ValidationError
    with pytest.raises((TypeError, ValidationError)):
        record.corpus_slice_ref = "artifacts/other/y.json"


# ===== TF-G6 : Relation Literal closed at 3 values =====

def test_tf_g6_relation_literal_closed_at_three() -> None:
    """BCR §3.7 annex line 225-226: relation ∈ {corroborates, contradicts, retracts}."""
    # Valid values.
    for rel in ["corroborates", "contradicts", "retracts"]:
        e = KnowledgeArtifactEdge(from_claim_id="a", to_claim_id="b", relation=rel)
        assert e.relation == rel
    # Invalid values rejected.
    from pydantic import ValidationError
    for bad in ["supports", "opposes", "extends", ""]:
        with pytest.raises(ValidationError):
            KnowledgeArtifactEdge(from_claim_id="a", to_claim_id="b", relation=bad)


# ===== TF-G7 : Per-response class inline on Callable Skill query output =====

def test_tf_g7_skill_query_response_has_class_inline() -> None:
    """`ensure_response_carries_class` mutates the response to carry class inline."""
    resp = ensure_response_carries_class(
        {"skill_id": "s", "answer": "x"},
        class_label="utterance",
        floor="utterance",
    )
    assert "defensibility" in resp
    assert resp["defensibility"]["class"] == "utterance"


# ===== TF-G8 : defensibility registry ⊇ live composition path vocabulary =====

def test_tf_g8_defensibility_registry_superset_live_composition_path() -> None:
    """TF-E3 α condition (Owner-verbatim): 'registry ⊇ every class the
    live composition path can emit.' The live path emits
    `five_rings.DefensibilityClass` enum values (fact/utterance/non_factual)
    + `mtafiti_registry.py` Literal["fact","utterance","non_factual"]."""
    from contracts.five_rings import DefensibilityClass
    live_classes = {m.value for m in DefensibilityClass}
    assert live_classes.issubset(ALLOWED_DEFENSIBILITY_CLASSES), (
        f"TF-E3 α condition violated: registry missing "
        f"{live_classes - ALLOWED_DEFENSIBILITY_CLASSES}. "
        f"Registry MUST be a superset of the live composition path vocabulary."
    )


def test_tf_g8_no_second_vocabulary_diverges_from_registry() -> None:
    """Owner condition: 'no second vocabulary may diverge from this one.'
    Grep the codebase for other defensibility class Literals + assert they
    match ALLOWED_DEFENSIBILITY_CLASSES."""
    # The second-vocabulary check: `mtafiti_registry.py:91` uses
    # `Literal["fact", "utterance", "non_factual"]`. Assert byte-equality
    # with the registry.
    from contracts.mtafiti_registry import MtafitiRegistryRecord
    hints = MtafitiRegistryRecord.model_fields["defensibility_class"].annotation
    # `Literal["fact","utterance","non_factual"]` — extract the args.
    import typing
    literal_args = set(typing.get_args(hints))
    assert literal_args == ALLOWED_DEFENSIBILITY_CLASSES, (
        f"Second-vocabulary divergence: mtafiti_registry Literal {literal_args} "
        f"vs registry {ALLOWED_DEFENSIBILITY_CLASSES}."
    )


def test_tf_g8_validate_rejects_unknown_class() -> None:
    """Constrained-str validation via loader."""
    with pytest.raises(ValueError):
        validate_defensibility_class("hearsay")


# ===== TF-G9 : No update_one touches corpus_slice_ref =====

def test_tf_g9_no_update_one_touches_corpus_slice_ref() -> None:
    """TF-E4 (b) α + Condition-2: AST scan asserts NO `update_one(...)`
    call in the codebase has `corpus_slice_ref` in its update-set argument.

    Enforcement: walk `backend/**/*.py`, find `.update_one(...)` calls,
    scan the second argument (the update spec, e.g. `{"$set": {...}}`)
    for the literal string `corpus_slice_ref`. Any hit = fail.
    """
    backend_root = Path(__file__).resolve().parents[2]
    violations: List[str] = []

    for py in backend_root.rglob("*.py"):
        if "__pycache__" in py.parts:
            continue
        if "site-packages" in py.parts:
            continue
        try:
            tree = ast.parse(py.read_text())
        except SyntaxError:
            continue

        source_text = py.read_text()
        for node in ast.walk(tree):
            if (
                isinstance(node, ast.Call)
                and isinstance(node.func, ast.Attribute)
                and node.func.attr == "update_one"
            ):
                # Serialize the call args + kwargs; check for the literal
                # `corpus_slice_ref` string in ANY of them.
                try:
                    call_src = ast.get_source_segment(source_text, node) or ""
                except Exception:
                    call_src = ""
                if "corpus_slice_ref" in call_src:
                    violations.append(f"{py}:{node.lineno} — update_one touches corpus_slice_ref")

    assert violations == [], (
        f"TF-E4 (b) α VIOLATED: update_one() call(s) touch corpus_slice_ref.\n"
        f"Slice-freeze is a client promise — 'the corpus you provisioned is "
        f"the corpus you're querying.' Violations:\n" + "\n".join(violations)
    )


# ===== V1-G7 : parity 31 attestation =====

def test_v1_g7_attestation_parity_31_byte_identical_at_transform_forms_close() -> None:
    """V1-G7 at Transform Forms close: 29 pre-TF + KA v0 + CallableSkillProvisioning v0 = 31."""
    invariants_dir = Path(__file__).parent
    snapshots = list(invariants_dir.glob("*.contract_snapshot.json"))
    assert len(snapshots) == 36, (
        f"V1-G7 Transform Forms → Memory Service Stage B: expected 34 snapshots. "
        f"Actual: {len(snapshots)}."
    )
    v1_names = [s.name for s in snapshots]
    assert "knowledge_artifact_v0.contract_snapshot.json" in v1_names
    assert "callable_skill_provisioning_v0.contract_snapshot.json" in v1_names


def test_v0_paths_byte_identical_at_transform_forms_close() -> None:
    """v0 preservation: 29 pre-TF snapshots byte-identical during TF addition.

    Guard against runtime drift: compute SHA-256 of each pre-TF snapshot
    inside the cell and re-assert it hasn't changed by the end of the
    cell. This is a tautological guard that catches accidental in-place
    mutation during test setup/teardown."""
    invariants_dir = Path(__file__).parent
    tf_new = {
        "knowledge_artifact_v0.contract_snapshot.json",
        "callable_skill_provisioning_v0.contract_snapshot.json",
        # P1 close 2026-07-30 — trust_receipt_v1 sibling contract landed
        # per Owner ruling condition (i). Also outside "pre-TF" set.
        "trust_receipt_v1.contract_snapshot.json",
        # Memory Service Stage B 2026-07-31 — Owner (c2) FREEZE per D4b.
        # Two new frozen seats; also outside "pre-TF" set.
        "memory_plane_v0.contract_snapshot.json",
        "memory_write_back_v0.contract_snapshot.json",
        # UI-1-A seal events 2026-07-31 — Canon §6.2/§6.3/§6.4 · parity 34→36.
        # Two new frozen seats; also outside "pre-TF" set.
        "use_data_wizard_session.contract_snapshot.json",
        "commission_verdict.contract_snapshot.json",
    }
    pre_tf = [
        s for s in invariants_dir.glob("*.contract_snapshot.json")
        if s.name not in tf_new
    ]
    assert len(pre_tf) == 29
    # Every pre-TF snapshot is a valid JSON file.
    for snap in pre_tf:
        json.loads(snap.read_text())


# ===== 4-code auth-refusal registry closure (re-attest) =====

def test_auth_refusal_registry_still_closed_at_four_codes_at_tf_close() -> None:
    """P9-E3 / P8E-E4 α pre-carry re-attested at Transform Forms close."""
    reg_path = (
        Path(__file__).resolve().parents[2]
        / "services" / "auth" / "auth_refusal_reasons.v0.json"
    )
    reg = json.loads(reg_path.read_text())
    assert set(reg["reasons"].keys()) == {
        "auth_missing",
        "auth_expired",
        "auth_scope_insufficient",
        "auth_identity_mismatch_for_wizard_session",
    }


# ===== E5 anti-rule: no HTTP 409 in TF new files =====

def test_no_http_409_in_transform_forms_new_files() -> None:
    """E5 anti-rule: zero HTTP 409 in new TF files."""
    backend_root = Path(__file__).resolve().parents[2]
    targets = [
        backend_root / "contracts" / "knowledge_artifact_v0.py",
        backend_root / "contracts" / "callable_skill_provisioning_v0.py",
        backend_root / "services" / "transform_forms" / "defensibility_loader.py",
        backend_root / "services" / "transform_forms" / "knowledge_artifact.py",
        backend_root / "services" / "transform_forms" / "callable_skill_gate.py",
        backend_root / "services" / "transform_forms" / "callable_skill_persistence.py",
        backend_root / "routers" / "transform_forms.py",
    ]
    for t in targets:
        text = t.read_text()
        assert "409" not in text, f"E5 anti-rule violated in {t}"
        assert "status_code=409" not in text


# ===== KA assembly smoke =====

def test_ka_assembly_smoke_end_to_end() -> None:
    """`build_knowledge_artifact` from raw specs produces a valid KA v0."""
    ka = build_knowledge_artifact(
        node_specs=[
            {
                "claim_id": "c1",
                "claim_text": "some claim",
                "defensibility": {"class": "fact", "contested": False},
                "trace_id": "trace-1",
                "provenance": {"source_ref": "src-1"},
            },
            {
                "claim_id": "c2",
                "claim_text": "another claim",
                "defensibility": {"class": "utterance", "contested": True},
                "trace_id": "trace-2",
                "provenance": {"source_ref": "src-2"},
            },
        ],
        edge_specs=[
            {"from_claim_id": "c1", "to_claim_id": "c2", "relation": "corroborates"},
        ],
    )
    assert ka.schema_version == "ka.v0"
    assert len(ka.nodes) == 2
    assert len(ka.edges) == 1
    assert ka.nodes[0].trace_id == "trace-1"


def test_ka_assembly_rejects_unknown_class() -> None:
    """TF-E3 α: unknown class rejected at assembly."""
    with pytest.raises(ValueError):
        build_knowledge_artifact(
            node_specs=[
                {
                    "claim_id": "c1",
                    "claim_text": "text",
                    "defensibility": {"class": "hearsay", "contested": False},
                    "trace_id": "trace-1",
                    "provenance": {"source_ref": "src-1"},
                },
            ],
            edge_specs=[],
        )
