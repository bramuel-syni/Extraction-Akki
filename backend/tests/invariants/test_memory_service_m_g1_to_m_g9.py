"""Memory Service Stage B — M-G1..M-G9 gate roster.

Owner ruling (2026-07-30 cycle 3 option (b)) + follow-ups (1a, 2a, 3a).
Gates are BREAK-IN style per §33C: the test ATTEMPTS the violation and
must FAIL to reach the state. Schema-shape assertions alone are
insufficient.

Gate roster:
    M-G1 : test_scoped_accessor_cannot_read_across_planes_by_direct_call.
    M-G2 : test_scoped_accessor_cannot_bypass_via_kwarg_or_setattr_override.
    M-G3 : test_write_back_write_to_plane_A_isolated_from_plane_B_reads.
    M-G4 : test_mind_context_never_crosses_keys.
    M-G5 : test_estate_memory_shared_across_keys (positive control).
    M-G6 : test_publication_is_separate_governed_act.
    M-G7 : test_revocation_freezes_plane_immediately.
    M-G8 : test_plane_state_ledger_reconstructible.
    M-G9 : test_memory_refusal_shape_governed_never_auth.

Additional coverage:
    * M-G-Registry: v4 governed additive registry bump attestation.
    * M-G-Parity: parity 34/34.
    * M-G-Router-Auth: /api/memory/* requires memory authority.
    * M-G-Constants: [SLOT] discipline attested.
"""
from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from contracts.memory_plane_v0 import MemoryPlane_v0  # noqa: E402
from contracts.memory_write_back_v0 import MemoryWriteBack_v0  # noqa: E402
from contracts.northena_ledger import NORTHENA_LEDGER_COLLECTION  # noqa: E402
from core import db  # noqa: E402
from services.auth.jwt_service import create_access_token  # noqa: E402
from services.memory import (  # noqa: E402
    constants as memory_constants,
    ledger_reconstructor,
    plane_registry,
    publication,
    revocation,
    scoped_accessor,
    write_back,
    working_set,
)
from services.memory.refusal import (  # noqa: E402
    MemoryGovernedRefusal,
    build_refusal_response,
    legal_reasons,
)


def _async_client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def _admin_token() -> str:
    return create_access_token(
        user_id=f"admin-{uuid.uuid4().hex[:6]}",
        email="admin@example",
        roles=["admin"],
        key_grants=[],
    )


def _engineer_token(email: str = "engineer-a@example") -> str:
    return create_access_token(
        user_id=f"eng-{uuid.uuid4().hex[:6]}",
        email=email,
        roles=["engineer"],
        key_grants=[],
    )


def _engineer_key_token(grant_id: str, scope: str = "default", email: str = "keyholder@example") -> str:
    return create_access_token(
        user_id=f"kh-{uuid.uuid4().hex[:6]}",
        email=email,
        roles=["engineer"],
        key_grants=[{
            "grant_id": grant_id,
            "key_class": "external",
            "path": "live_query",
            "floor": "utterance",
            "scope": scope,
        }],
    )


def _plain_user_token() -> str:
    return create_access_token(
        user_id=f"u-{uuid.uuid4().hex[:6]}",
        email="plain@example",
        roles=["buyer"],
        key_grants=[],
    )


@pytest.fixture(autouse=True)
async def _isolate_memory_state():
    """Clean memory collections between tests. Ledger rows are append-only in
    production but pruned per-test here for reconstructor-gate isolation."""
    try:
        await db["memory_planes"].delete_many({})
        await db["memory_contributions"].delete_many({})
        await db["memory_working_set"].delete_many({})
        await db[NORTHENA_LEDGER_COLLECTION].delete_many({
            "reason": {"$regex": r"^memory_"}
        })
    except Exception:
        pass
    yield
    try:
        await db["memory_planes"].delete_many({})
        await db["memory_contributions"].delete_many({})
        await db["memory_working_set"].delete_many({})
        await db[NORTHENA_LEDGER_COLLECTION].delete_many({
            "reason": {"$regex": r"^memory_"}
        })
    except Exception:
        pass


# --------------------------------------------------------------------------
# Fixture: build two planes bound to two distinct integration keys.
# --------------------------------------------------------------------------


@pytest.fixture
async def two_planes():
    """Two active planes A and B under distinct integration keys.

    Also emits `memory_plane_issued` ledger rows so the reconstructor gate
    has a full trace to rebuild from (parallels the router mint path).
    """
    plane_a = await plane_registry.issue_plane(
        integration_key="key-A",
        tenant_id="tenant-A",
        retrieval_scope="scope-A",
    )
    plane_b = await plane_registry.issue_plane(
        integration_key="key-B",
        tenant_id="tenant-B",
        retrieval_scope="scope-B",
    )
    from services.memory import ledger as memory_ledger
    for plane in (plane_a, plane_b):
        await memory_ledger.emit_plane_issued(
            plane_id=plane.plane_id,
            integration_key=plane.issued_to_integration_key,
            tenant_id=plane.tenant_id,
            retrieval_scope=plane.retrieval_scope,
            issued_at=plane.issued_at,
            actor="fixture",
            trace_id=f"trace-{plane.plane_id}",
        )
    return plane_a, plane_b


def _five_ring_stamp(content: str = "hello") -> dict:
    return {
        "content": {"text": content},
        "provenance": {"source_ref": "src-1"},
        "defensibility": {"class": "utterance"},
        "context": {"note": "test"},
        "re_extraction_handle": {"handle_id": "h-1"},
    }


async def _write_utterance(accessor, actor="test", trace_id="trace-t") -> MemoryWriteBack_v0:
    return await write_back.write_contribution(
        accessor=accessor,
        content_ref="artifacts/test/x.json",
        five_ring_stamp=_five_ring_stamp(),
        class_declared="utterance",
        cited_sources=["src-1"],
        cited_source_classes=["utterance"],
        actor=actor,
        trace_id=trace_id,
    )


# =============================================================================
# M-G1 · Direct-call cross-plane read → PlaneScopeViolation.
# =============================================================================


async def test_m_g1_scoped_accessor_cannot_read_across_planes_by_direct_call(two_planes):
    plane_a, plane_b = two_planes
    accessor_a = await scoped_accessor.for_plane(
        plane_id=plane_a.plane_id, integration_key="key-A",
    )
    # Write into A via A's accessor.
    contribution_a = await _write_utterance(accessor_a)

    # Attempt cross-plane read via a valid B accessor.
    accessor_b = await scoped_accessor.for_plane(
        plane_id=plane_b.plane_id, integration_key="key-B",
    )
    # get_contribution filters by plane_id — A's contribution invisible to B.
    seen_by_b = await accessor_b.get_contribution(contribution_a.contribution_id)
    assert seen_by_b is None, "M-G1 VIOLATED: B accessor reached A's contribution."
    # Enumeration also isolates.
    b_list = await accessor_b.list_contributions()
    b_ids = {c["contribution_id"] for c in b_list}
    assert contribution_a.contribution_id not in b_ids

    # Break-in: attempt to mint an accessor for plane_a using B's key.
    with pytest.raises(scoped_accessor.PlaneScopeViolation):
        await scoped_accessor.for_plane(
            plane_id=plane_a.plane_id, integration_key="key-B",
        )


# =============================================================================
# M-G2 · Bypass via kwarg override / setattr override → refused.
# =============================================================================


async def test_m_g2_scoped_accessor_cannot_bypass_via_kwarg_or_setattr_override(two_planes):
    plane_a, plane_b = two_planes
    accessor_a = await scoped_accessor.for_plane(
        plane_id=plane_a.plane_id, integration_key="key-A",
    )
    # Break-in #1 (kwarg override):
    # get() / list_contributions() / insert_contribution() DO NOT accept a
    # plane_id_override kwarg. Calling with unknown kwargs raises TypeError.
    with pytest.raises(TypeError):
        await accessor_a.get_contribution("c1", plane_id_override="plane-other")  # type: ignore[call-arg]
    with pytest.raises(TypeError):
        await accessor_a.list_contributions(plane_id="plane-other")  # type: ignore[call-arg]
    # Break-in #2 (private attr setter):
    # __slots__ + name-mangled attrs mean external setattr raises AttributeError.
    with pytest.raises(AttributeError):
        accessor_a.plane_id = plane_b.plane_id  # type: ignore[misc]
    with pytest.raises(AttributeError):
        accessor_a._ScopedAccessor__plane_id = plane_b.plane_id  # type: ignore[attr-defined]
    with pytest.raises(AttributeError):
        setattr(accessor_a, "__plane_id", plane_b.plane_id)
    # Confirmed post-attack the accessor still reports plane-A binding.
    assert accessor_a.plane_id == plane_a.plane_id

    # Break-in #3 (direct dict manipulation cannot reach the slots).
    with pytest.raises(AttributeError):
        # __dict__ doesn't exist on __slots__ classes.
        accessor_a.__dict__["plane_id"] = plane_b.plane_id  # type: ignore[attr-defined]


# =============================================================================
# M-G3 · Insert into A cannot appear in B's enumeration.
# =============================================================================


async def test_m_g3_write_back_write_to_plane_A_isolated_from_plane_B_reads(two_planes):
    plane_a, plane_b = two_planes
    acc_a = await scoped_accessor.for_plane(plane_id=plane_a.plane_id, integration_key="key-A")
    acc_b = await scoped_accessor.for_plane(plane_id=plane_b.plane_id, integration_key="key-B")

    contribution = await _write_utterance(acc_a)
    b_list = await acc_b.list_contributions()
    assert all(c["contribution_id"] != contribution.contribution_id for c in b_list), (
        "M-G3 VIOLATED: B enumeration surfaced A's contribution."
    )

    # Break-in: attempt insert with a doc naming plane_a via acc_b.
    forged_doc = {
        "contribution_id": f"wb-forged-{uuid.uuid4().hex[:6]}",
        "plane_id": plane_a.plane_id,  # mismatch
        "content_ref": "x",
        "five_ring_stamp": _five_ring_stamp(),
        "class_declared": "utterance",
        "cited_sources": ["src-1"],
        "rights_class": "internal_only",
        "intended_scope": "mind_context_only",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "tenant_id": plane_b.tenant_id,
    }
    with pytest.raises(scoped_accessor.PlaneScopeViolation):
        await acc_b.insert_contribution(forged_doc)


# =============================================================================
# M-G4 · Mind context never crosses keys.
# =============================================================================


async def test_m_g4_mind_context_never_crosses_keys(two_planes):
    plane_a, plane_b = two_planes
    acc_a = await scoped_accessor.for_plane(plane_id=plane_a.plane_id, integration_key="key-A")
    acc_b = await scoped_accessor.for_plane(plane_id=plane_b.plane_id, integration_key="key-B")

    await working_set.record_use(accessor=acc_a, ref="artifact://feed_a/hour-1")
    await working_set.record_use(accessor=acc_a, ref="artifact://feed_a/hour-2")

    # B enumerates its own working set — A's refs must not appear.
    b_entries = await acc_b.list_working_set()
    b_refs = {e.get("ref") for e in b_entries}
    assert "artifact://feed_a/hour-1" not in b_refs
    assert "artifact://feed_a/hour-2" not in b_refs
    assert b_entries == []

    # Direct Mongo read filtered by plane_b — must not find A's rows.
    a_direct = [
        doc async for doc in db["memory_working_set"].find({
            "plane_id": plane_b.plane_id,
            "ref": {"$in": ["artifact://feed_a/hour-1", "artifact://feed_a/hour-2"]},
        })
    ]
    assert a_direct == [], "M-G4 VIOLATED: A's working-set doc leaked into B's plane_id partition."


# =============================================================================
# M-G5 · Estate memory shared across keys (positive control).
# =============================================================================


async def test_m_g5_estate_memory_shared_across_keys(two_planes):
    """Estate memory (Registry) is SHARED across keys by design. This positive
    control ensures the plane-isolation gates are not over-applied to the
    estate surface.

    Registry-visible contributions carry rights_class=registry_visible AFTER
    publication. From the perspective of any accessor with cross-plane read
    permission on the Registry, they are visible.

    In this codebase the Registry surface is Mtafiti's; memory-service
    contributions become Registry-visible after publication ceremony. We
    verify the shape of that promise by (a) publishing a plane-A contribution
    and (b) confirming its post-publication rights class is registry_visible
    on the persisted contribution doc — that is the promise. Registry
    consumption itself lives outside the memory service.
    """
    plane_a, _plane_b = two_planes
    acc_a = await scoped_accessor.for_plane(plane_id=plane_a.plane_id, integration_key="key-A")
    contribution = await _write_utterance(acc_a)
    # Set the [SLOT] quality threshold so publication can pass.
    old = memory_constants.PUBLICATION_QUALITY_THRESHOLD
    try:
        memory_constants.PUBLICATION_QUALITY_THRESHOLD = 50  # type: ignore[assignment]
        published = await publication.attempt_publication(
            accessor=acc_a,
            contribution_id=contribution.contribution_id,
            actor="admin",
            trace_id="trace-t",
            quality_score=99.0,
        )
    finally:
        memory_constants.PUBLICATION_QUALITY_THRESHOLD = old  # type: ignore[assignment]
    # Rights class widened to registry_visible; intended_scope widened.
    assert published["rights_class"] == "registry_visible"
    assert published["intended_scope"] == "registry_publication"
    assert "registry_ref" in published


# =============================================================================
# M-G6 · Publication is a separate governed act; never automatic.
# =============================================================================


async def test_m_g6_publication_is_separate_governed_act(two_planes):
    plane_a, _ = two_planes
    acc_a = await scoped_accessor.for_plane(plane_id=plane_a.plane_id, integration_key="key-A")
    contribution = await _write_utterance(acc_a)
    # Post-write: contribution is plane-local (internal_only + mind_context_only).
    doc_pre = await acc_a.get_contribution(contribution.contribution_id)
    assert doc_pre["rights_class"] == "internal_only"
    assert doc_pre["intended_scope"] == "mind_context_only"

    # Break-in: attempt publication with quality threshold UNSET.
    # SR-5 fail-loud: publication_quality_threshold_unset governed refusal.
    old = memory_constants.PUBLICATION_QUALITY_THRESHOLD
    try:
        memory_constants.PUBLICATION_QUALITY_THRESHOLD = None  # type: ignore[assignment]
        with pytest.raises(MemoryGovernedRefusal) as ei:
            await publication.attempt_publication(
                accessor=acc_a,
                contribution_id=contribution.contribution_id,
                actor="admin",
                trace_id="trace-t",
                quality_score=99.0,
            )
        assert ei.value.reason == "publication_quality_threshold_unset"
    finally:
        memory_constants.PUBLICATION_QUALITY_THRESHOLD = old  # type: ignore[assignment]

    # Post-refused: contribution is STILL plane-local. Publication is not
    # automatic even after an attempt.
    doc_post = await acc_a.get_contribution(contribution.contribution_id)
    assert doc_post["rights_class"] == "internal_only"
    assert doc_post["intended_scope"] == "mind_context_only"


# =============================================================================
# M-G7 · Revocation freezes the plane immediately.
# =============================================================================


async def test_m_g7_revocation_freezes_plane_immediately(two_planes):
    plane_a, _ = two_planes
    acc_a = await scoped_accessor.for_plane(plane_id=plane_a.plane_id, integration_key="key-A")
    await _write_utterance(acc_a)

    # Revoke.
    await revocation.revoke_plane(
        plane_id=plane_a.plane_id,
        revoked_by="owner",
        reason="test",
        trace_id="trace-t",
    )

    # Mint a fresh accessor — state="revoked" → PlaneRevoked on any op.
    acc_revoked = await scoped_accessor.for_plane(
        plane_id=plane_a.plane_id, integration_key="key-A",
    )
    with pytest.raises(scoped_accessor.PlaneRevoked):
        await acc_revoked.list_contributions()
    with pytest.raises(scoped_accessor.PlaneRevoked):
        await acc_revoked.get_contribution("wb-anything")
    with pytest.raises(scoped_accessor.PlaneRevoked):
        await acc_revoked.list_working_set()

    # Idempotent re-revoke returns already_revoked marker; no double-freeze.
    second = await revocation.revoke_plane(
        plane_id=plane_a.plane_id,
        revoked_by="owner",
        reason="test-again",
        trace_id="trace-t",
    )
    assert second["already_revoked"] is True


# =============================================================================
# M-G8 · Plane state ledger-reconstructible.
# =============================================================================


async def test_m_g8_plane_state_ledger_reconstructible(two_planes):
    plane_a, _ = two_planes
    acc_a = await scoped_accessor.for_plane(plane_id=plane_a.plane_id, integration_key="key-A")

    # Write two contributions, publish one, revoke plane.
    c1 = await _write_utterance(acc_a)
    c2 = await _write_utterance(acc_a)
    old = memory_constants.PUBLICATION_QUALITY_THRESHOLD
    try:
        memory_constants.PUBLICATION_QUALITY_THRESHOLD = 50  # type: ignore[assignment]
        await publication.attempt_publication(
            accessor=acc_a,
            contribution_id=c1.contribution_id,
            actor="admin",
            trace_id="trace-t",
            quality_score=99.0,
        )
    finally:
        memory_constants.PUBLICATION_QUALITY_THRESHOLD = old  # type: ignore[assignment]
    await revocation.revoke_plane(
        plane_id=plane_a.plane_id,
        revoked_by="owner",
        reason="test",
        trace_id="trace-t",
    )

    # Delete the plane registry doc; the ledger reconstructor still rebuilds.
    await db["memory_planes"].delete_one({"plane_id": plane_a.plane_id})

    rebuilt = await ledger_reconstructor.rebuild_state(plane_a.plane_id)
    assert rebuilt is not None
    assert rebuilt["plane_id"] == plane_a.plane_id
    assert rebuilt["state"] == "revoked"
    assert rebuilt["contributions_landed_count"] == 2
    assert rebuilt["publications_attempted_count"] == 1
    assert rebuilt["publications_landed_count"] == 1
    assert c1.contribution_id in rebuilt["published_contribution_ids"]
    assert c2.contribution_id not in rebuilt["published_contribution_ids"]
    assert set(rebuilt["contribution_ids"]) == {c1.contribution_id, c2.contribution_id}
    assert rebuilt["integration_key"] == "key-A"
    assert rebuilt["tenant_id"] == "tenant-A"
    assert rebuilt["retrieval_scope"] == "scope-A"


# =============================================================================
# M-G9 · Memory refusal shape is governed; NEVER auth.
# =============================================================================


async def test_m_g9_memory_refusal_shape_governed_never_auth():
    """Owner E2 non-negotiable: governed refusal carries `outcome=refused`.
    Auth denial carries only `reason` + `detail` (no `outcome`)."""
    for reason in [
        "plane_revoked", "plane_not_found",
        "contribution_over_class_cap", "contribution_rights_forbid",
        "contribution_shape_invalid",
        "publication_gate_denied", "publication_quality_threshold_unset",
        "plane_scope_invalid",
    ]:
        exc = MemoryGovernedRefusal(reason, detail="test detail")
        env = build_refusal_response(exc)
        assert env["outcome"] == "refused"
        assert env["reason"] == reason
        assert env["detail"] == "test detail"

    # Break-in: attempt to build a governed refusal with an off-taxonomy reason.
    with pytest.raises(ValueError):
        MemoryGovernedRefusal("not_a_registered_reason", detail="x")


async def test_m_g9_router_auth_denial_carries_no_outcome_key():
    """Router-level auth denial → 401/403 `{reason, detail}`, NEVER `outcome`."""
    async with _async_client() as c:
        r = await c.get("/api/memory/planes")
    assert r.status_code == 401
    body = r.json()
    assert body["reason"] == "auth_missing"
    assert "outcome" not in body

    # Wrong role (buyer, no engineer-key grant) → 403 auth_scope_insufficient.
    tok = _plain_user_token()
    async with _async_client() as c:
        r = await c.get("/api/memory/planes",
                        headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body


async def test_m_g9_router_governed_refusal_carries_outcome_key():
    """Router-level governed refusal → 4xx `{outcome, reason, detail}`."""
    tok = _admin_token()
    async with _async_client() as c:
        r = await c.get("/api/memory/planes/mp-doesnotexist",
                        headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 422
    body = r.json()
    assert body["outcome"] == "refused"
    assert body["reason"] == "plane_not_found"


# =============================================================================
# Registry-bump attestation (governed additive change with authority).
# =============================================================================


def test_m_g_registry_v4_landed_additive_from_v3_with_authority():
    """v4 registry bump is a governed change; authority noted."""
    from services.compliance import deletion_ledger
    # Clear the cache so a fresh read pulls v4 from disk. (Do NOT reload the
    # module — that would replace UnknownDataClassError with a new class and
    # break other tests that hold refs to the original class object.)
    deletion_ledger._registry_cache = None  # type: ignore[attr-defined]
    valid = deletion_ledger.valid_data_classes()
    for expected in [
        "memory_plane_issued",
        "memory_contribution_landed",
        "memory_contribution_refused",
        "memory_publication_attempted",
        "memory_publication_landed",
        "memory_publication_refused",
        "memory_plane_revoked",
    ]:
        assert expected in valid, f"Registry v4 missing {expected!r}"

    v4_path = Path(__file__).resolve().parents[2] / "services" / "compliance" / "data_class_registry.v4.json"
    payload = json.loads(v4_path.read_text())
    # Governance authority captured.
    assert "authority" in payload
    assert payload["authority"]["who"] == "Owner"
    # Registry format preserved: valid_data_classes is a list of dicts.
    assert isinstance(payload["valid_data_classes"], list)


# =============================================================================
# Parity attestation (34/34 post-Memory-Service Stage B).
# =============================================================================


def test_m_g_parity_34_at_memory_service_stage_b_close():
    from services.health import EXPECTED_PARITY, count_frozen_contract_snapshots
    assert count_frozen_contract_snapshots() == 34
    assert EXPECTED_PARITY == 34


def test_m_g_two_frozen_snapshots_present_and_byte_identical():
    invariants_dir = Path(__file__).parent
    p1 = invariants_dir / "memory_plane_v0.contract_snapshot.json"
    p2 = invariants_dir / "memory_write_back_v0.contract_snapshot.json"
    assert p1.exists()
    assert p2.exists()
    live1 = json.loads(p1.read_text())
    live2 = json.loads(p2.read_text())
    assert live1 == MemoryPlane_v0.model_json_schema()
    assert live2 == MemoryWriteBack_v0.model_json_schema()


# =============================================================================
# [SLOT] discipline attest (Owner condition (c3)).
# =============================================================================


def test_m_g_constants_all_carry_slot_markers():
    """Every constant carries a [SLOT: <default>] marker in the module docstring."""
    src = (Path(__file__).resolve().parents[2] / "services" / "memory" / "constants.py").read_text()
    for marker in [
        "[SLOT: 10_000]",
        "[SLOT: 30]",
        "[SLOT: null]",
        "[SLOT: 1]",
    ]:
        assert marker in src, f"Missing [SLOT] marker: {marker!r}"


def test_m_g_publication_threshold_unset_by_default():
    """Default posture is UNSET — publication must fail loud out of the box."""
    # Only check with no env var override.
    if os.environ.get("AKKI_MEMORY_PUBLICATION_QUALITY_THRESHOLD"):
        pytest.skip("threshold set via env; default posture attest skipped.")
    assert memory_constants.PUBLICATION_QUALITY_THRESHOLD is None
    assert memory_constants.publication_quality_threshold_is_set() is False


# =============================================================================
# Class-cap enforcement (utility unit tests).
# =============================================================================


def test_m_g_class_cap_rejects_fact_over_utterance():
    with pytest.raises(MemoryGovernedRefusal) as ei:
        write_back.enforce_class_cap(
            class_declared="fact",
            cited_source_classes=["utterance"],
        )
    assert ei.value.reason == "contribution_over_class_cap"


def test_m_g_class_cap_accepts_utterance_over_utterance():
    write_back.enforce_class_cap(
        class_declared="utterance",
        cited_source_classes=["utterance", "utterance"],
    )  # must not raise


def test_m_g_class_cap_rejects_unknown_class():
    with pytest.raises(MemoryGovernedRefusal) as ei:
        write_back.enforce_class_cap(
            class_declared="mythology",
            cited_source_classes=["utterance"],
        )
    assert ei.value.reason == "contribution_shape_invalid"


# =============================================================================
# Rights-at-birth enforcement.
# =============================================================================


def test_m_g_rights_at_birth_rejects_registry_visible_at_write():
    with pytest.raises(MemoryGovernedRefusal) as ei:
        write_back.enforce_rights_at_birth(
            rights_class="registry_visible",
            intended_scope="mind_context_only",
        )
    assert ei.value.reason == "contribution_rights_forbid"


def test_m_g_rights_at_birth_rejects_registry_publication_intent_at_write():
    with pytest.raises(MemoryGovernedRefusal) as ei:
        write_back.enforce_rights_at_birth(
            rights_class="internal_only",
            intended_scope="registry_publication",
        )
    assert ei.value.reason == "contribution_rights_forbid"


# =============================================================================
# Router happy path (engineer-key holder can issue + contribute + read own).
# =============================================================================


async def test_m_g_router_engineer_key_holder_can_issue_and_contribute():
    grant_id = f"grant-{uuid.uuid4().hex[:6]}"
    tok = _engineer_key_token(grant_id, scope="tenant-alpha")
    async with _async_client() as c:
        r_issue = await c.post(
            "/api/memory/planes",
            json={"retrieval_scope": "estate://alpha"},
            headers={"Authorization": f"Bearer {tok}"},
        )
        assert r_issue.status_code == 201, r_issue.text
        plane = r_issue.json()
        assert plane["issued_to_integration_key"] == grant_id
        assert plane["tenant_id"] == "tenant-alpha"

        r_get = await c.get(
            f"/api/memory/planes/{plane['plane_id']}",
            headers={"Authorization": f"Bearer {tok}"},
        )
        assert r_get.status_code == 200

        r_contrib = await c.post(
            f"/api/memory/planes/{plane['plane_id']}/contribute",
            json={
                "content_ref": "artifacts/alpha/x.json",
                "five_ring_stamp": _five_ring_stamp(),
                "class_declared": "utterance",
                "cited_sources": ["src-1"],
                "cited_source_classes": ["utterance"],
            },
            headers={"Authorization": f"Bearer {tok}"},
        )
        assert r_contrib.status_code == 201, r_contrib.text


async def test_m_g_router_cross_key_plane_read_denied():
    """Break-in via HTTP: caller A can't read plane B."""
    grant_a = f"grant-A-{uuid.uuid4().hex[:6]}"
    grant_b = f"grant-B-{uuid.uuid4().hex[:6]}"
    tok_a = _engineer_key_token(grant_a, email="a@example")
    tok_b = _engineer_key_token(grant_b, email="b@example")
    async with _async_client() as c:
        r_a = await c.post("/api/memory/planes",
                           json={"retrieval_scope": "estate://a"},
                           headers={"Authorization": f"Bearer {tok_a}"})
        plane_a = r_a.json()

        r_b = await c.get(f"/api/memory/planes/{plane_a['plane_id']}",
                          headers={"Authorization": f"Bearer {tok_b}"})
        assert r_b.status_code == 403
        body = r_b.json()
        assert body["reason"] == "auth_scope_insufficient"
        assert "outcome" not in body


# =============================================================================
# Refusal reason set closed (Owner-only opening).
# =============================================================================


def test_m_g_refusal_reason_set_closed():
    """Legal reasons match the JSON registry exactly. Adding a reason requires
    an Owner ruling."""
    reasons = legal_reasons()
    assert reasons == {
        "plane_not_found",
        "plane_revoked",
        "plane_scope_invalid",
        "contribution_over_class_cap",
        "contribution_rights_forbid",
        "contribution_shape_invalid",
        "publication_gate_denied",
        "publication_quality_threshold_unset",
    }
