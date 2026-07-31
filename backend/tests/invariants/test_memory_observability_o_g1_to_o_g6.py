"""Phase 3 sub-cycle 2 — Plane observability aggregator gate roster (O-G1..O-G6).

Owner ruling 2026-08-02 (Ruling 2 · APPROVED-with-slot-in for Phase 3):
    "Rides the same /api/memory/* surface; read-only aggregate over the
    reconstructor; zero new frozen contracts unless the shape crosses an
    environment boundary (then D4b FREEZE)."

Gate roster:
    O-G1 : GET /api/memory/planes/{plane_id}/observability returns a
           well-shaped aggregate over Northena ledger rows.
    O-G2 : engineer-key cross-key attempt on the observability endpoint
           returns HTTP 403 auth_scope_insufficient (no `outcome` key).
    O-G3 : publication_acceptance_rate is None when attempted == 0
           (the metric is UNDEFINED without attempts).
    O-G4 : contribution_class_counts buckets exact class_declared values.
    O-G5 : revocation_history reflects memory_plane_revoked rows verbatim
           when the plane is revoked; is [] when active.
    O-G6 : plane_not_found → 4xx governed refusal with outcome=refused.

    O-G-Parity : parity remains 34/34 unchanged (no new frozen contract).
    O-G-Aggregate-Reads-Ledger-Only : the observability aggregator reads
        exclusively from the Northena ledger collection (no read of the
        memory_planes / memory_contributions doc collections). AST/reflection
        gate — belt-and-suspenders per Owner §6.10 rate.
"""
from __future__ import annotations

import ast
import inspect
import sys
import uuid
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from contracts.northena_ledger import NORTHENA_LEDGER_COLLECTION  # noqa: E402
from core import db  # noqa: E402
from services.auth.jwt_service import create_access_token  # noqa: E402
from services.health.parity_counter import EXPECTED_PARITY, count_frozen_contract_snapshots  # noqa: E402
from services.memory import (  # noqa: E402
    ledger as memory_ledger,
    ledger_reconstructor,
    plane_registry,
    revocation,
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


def _engineer_key_token(grant_id: str) -> str:
    return create_access_token(
        user_id=f"kh-{uuid.uuid4().hex[:6]}",
        email=f"kh-{grant_id}@example",
        roles=["engineer"],
        key_grants=[{
            "grant_id": grant_id,
            "key_class": "external",
            "path": "live_query",
            "floor": "utterance",
            "scope": "default",
        }],
    )


@pytest.fixture(autouse=True)
async def _isolate_memory_state():
    """Clean memory collections between tests."""
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


async def _issue_plane_and_ledger(integration_key: str, tenant_id: str = "tenant-1"):
    plane = await plane_registry.issue_plane(
        integration_key=integration_key,
        tenant_id=tenant_id,
        retrieval_scope="scope-x",
    )
    await memory_ledger.emit_plane_issued(
        plane_id=plane.plane_id,
        integration_key=plane.issued_to_integration_key,
        tenant_id=plane.tenant_id,
        retrieval_scope=plane.retrieval_scope,
        issued_at=plane.issued_at,
        actor="fixture",
        trace_id=f"trace-{plane.plane_id}",
    )
    return plane


# =============================================================================
# O-G1 · Aggregate shape + ledger bucketing.
# =============================================================================


async def test_o_g1_observability_returns_expected_aggregate_shape():
    plane = await _issue_plane_and_ledger(integration_key="k-alpha")
    # Emit a few contribution-landed rows across three classes.
    for cid, cls in (
        ("c-1", "fact"),
        ("c-2", "fact"),
        ("c-3", "utterance"),
        ("c-4", "non_factual"),
    ):
        await memory_ledger.emit_contribution_landed(
            plane_id=plane.plane_id,
            contribution_id=cid,
            class_declared=cls,
            cited_source_count=1,
            rights_class="internal_only",
            intended_scope="mind_context_only",
            tenant_id=plane.tenant_id,
            actor="admin",
            trace_id=f"trace-{cid}",
        )
    # One refusal.
    await memory_ledger.emit_contribution_refused(
        plane_id=plane.plane_id,
        refusal_reason="contribution_over_class_cap",
        detail="test",
        tenant_id=plane.tenant_id,
        actor="admin",
        trace_id="trace-refused-1",
    )
    # Two publications attempted, one landed, one refused.
    await memory_ledger.emit_publication_event(
        event_class="memory_publication_attempted",
        plane_id=plane.plane_id, contribution_id="c-1",
        tenant_id=plane.tenant_id, actor="admin", trace_id="t-attempt-1",
    )
    await memory_ledger.emit_publication_event(
        event_class="memory_publication_landed",
        plane_id=plane.plane_id, contribution_id="c-1",
        tenant_id=plane.tenant_id, actor="admin", trace_id="t-land-1",
    )
    await memory_ledger.emit_publication_event(
        event_class="memory_publication_attempted",
        plane_id=plane.plane_id, contribution_id="c-2",
        tenant_id=plane.tenant_id, actor="admin", trace_id="t-attempt-2",
    )
    await memory_ledger.emit_publication_event(
        event_class="memory_publication_refused",
        plane_id=plane.plane_id, contribution_id="c-2",
        tenant_id=plane.tenant_id, actor="admin", trace_id="t-ref-2",
    )
    async with _async_client() as ac:
        r = await ac.get(
            f"/api/memory/planes/{plane.plane_id}/observability",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["plane_id"] == plane.plane_id
    assert body["state"] == "active"
    assert body["contribution_class_counts"] == {
        "fact": 2, "utterance": 1, "non_factual": 1,
    }
    assert body["contribution_counts"] == {"landed": 4, "refused": 1}
    assert body["publication_counts"] == {"attempted": 2, "landed": 1, "refused": 1}
    # 1 landed / 2 attempted = 0.5
    assert body["publication_acceptance_rate"] == 0.5
    assert body["revocation_history"] == []


# =============================================================================
# O-G2 · Cross-key attempt → 403 auth_scope_insufficient (never outcome).
# =============================================================================


async def test_o_g2_cross_key_observability_denied_with_auth_taxonomy():
    # Plane bound to grant-alpha.
    plane = await _issue_plane_and_ledger(integration_key="grant-alpha")
    async with _async_client() as ac:
        r = await ac.get(
            f"/api/memory/planes/{plane.plane_id}/observability",
            headers={"Authorization": f"Bearer {_engineer_key_token('grant-BETA')}"},
        )
    assert r.status_code == 403, r.text
    body = r.json()
    # Auth-denial taxonomy: {reason, detail}. NEVER outcome.
    assert body.get("reason") == "auth_scope_insufficient"
    assert "detail" in body
    assert "outcome" not in body, (
        "O-G2 VIOLATED: auth-denial carries `outcome` key (should be reserved "
        "for governed refusals only, per Owner E2)."
    )


# =============================================================================
# O-G3 · publication_acceptance_rate is None when attempted == 0.
# =============================================================================


async def test_o_g3_publication_rate_none_when_no_attempts():
    plane = await _issue_plane_and_ledger(integration_key="k-alpha")
    # Landed contributions but ZERO publication attempts.
    await memory_ledger.emit_contribution_landed(
        plane_id=plane.plane_id,
        contribution_id="c-x",
        class_declared="utterance",
        cited_source_count=1,
        rights_class="internal_only",
        intended_scope="mind_context_only",
        tenant_id=plane.tenant_id,
        actor="admin",
        trace_id="trace-cx",
    )
    async with _async_client() as ac:
        r = await ac.get(
            f"/api/memory/planes/{plane.plane_id}/observability",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["publication_counts"]["attempted"] == 0
    assert body["publication_acceptance_rate"] is None, (
        "O-G3 VIOLATED: publication_acceptance_rate must be None when attempted==0 "
        "(metric is UNDEFINED; never present 0/0 as 0%)."
    )


# =============================================================================
# O-G4 · class_declared bucketing.
# =============================================================================


async def test_o_g4_class_declared_bucketing_reads_stamp_audit():
    plane = await _issue_plane_and_ledger(integration_key="k-alpha")
    for cid, cls in (
        ("c-a", "fact"), ("c-b", "fact"), ("c-c", "fact"),
        ("c-d", "utterance"), ("c-e", "non_factual"),
    ):
        await memory_ledger.emit_contribution_landed(
            plane_id=plane.plane_id,
            contribution_id=cid,
            class_declared=cls,
            cited_source_count=1,
            rights_class="internal_only",
            intended_scope="mind_context_only",
            tenant_id=plane.tenant_id,
            actor="admin",
            trace_id=f"trace-{cid}",
        )
    async with _async_client() as ac:
        r = await ac.get(
            f"/api/memory/planes/{plane.plane_id}/observability",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    body = r.json()
    assert body["contribution_class_counts"] == {
        "fact": 3, "utterance": 1, "non_factual": 1,
    }


# =============================================================================
# O-G5 · Revocation history reflects ledger rows verbatim.
# =============================================================================


async def test_o_g5_revocation_history_reflects_ledger_rows():
    plane = await _issue_plane_and_ledger(integration_key="k-alpha")
    # Revoke via the real revocation service (emits memory_plane_revoked row).
    await revocation.revoke_plane(
        plane_id=plane.plane_id,
        revoked_by="admin-99",
        reason="owner_action",
        trace_id=f"trace-revoke-{plane.plane_id}",
    )
    async with _async_client() as ac:
        r = await ac.get(
            f"/api/memory/planes/{plane.plane_id}/observability",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["state"] == "revoked"
    assert body["revocation_reason"] == "owner_action"
    assert body["revoked_by"] == "admin-99"
    assert len(body["revocation_history"]) == 1
    ev = body["revocation_history"][0]
    assert ev["revoked_by"] == "admin-99"
    assert ev["reason"] == "owner_action"
    assert ev["revoked_at"] is not None


# =============================================================================
# O-G6 · plane_not_found → governed refusal envelope (outcome=refused).
# =============================================================================


async def test_o_g6_unknown_plane_returns_governed_refusal():
    async with _async_client() as ac:
        r = await ac.get(
            "/api/memory/planes/plane-does-not-exist-xyz/observability",
            headers={"Authorization": f"Bearer {_admin_token()}"},
        )
    # Governed refusal (not a 404 shell). Router uses `_governed` shape.
    assert r.status_code in (404, 410, 422), r.text
    body = r.json()
    assert body.get("outcome") == "refused"
    assert body.get("reason") == "plane_not_found"


# =============================================================================
# O-G-Parity · parity remains 34/34 unchanged (no new frozen contract this cycle).
# =============================================================================


def test_o_g_parity_expected_parity_unchanged_at_34():
    assert EXPECTED_PARITY == 34, (
        "O-G-Parity VIOLATED: EXPECTED_PARITY changed. Phase 3 sub-cycle 2 "
        "must not add a frozen contract (Ruling 2 · zero new frozen contracts "
        "unless a shape crosses an env boundary — then D4b FREEZE, not now)."
    )
    assert count_frozen_contract_snapshots() == EXPECTED_PARITY, (
        "O-G-Parity VIOLATED: on-disk snapshot count diverged from EXPECTED_PARITY."
    )


# =============================================================================
# O-G-Aggregate-Reads-Ledger-Only · AST gate.
# =============================================================================


def test_o_g_aggregate_reads_ledger_only_no_mongo_planes_or_contribs():
    """The observability aggregator must NOT read from the memory_planes /
    memory_contributions collections directly. It reads Northena ledger rows.
    Reconstructor purity gate — belt-and-suspenders §6.10 AST rate.
    """
    source = inspect.getsource(ledger_reconstructor)
    tree = ast.parse(source)
    forbidden = ("memory_planes", "memory_contributions", "memory_working_set")
    for node in ast.walk(tree):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            if node.value in forbidden:
                pytest.fail(
                    f"O-G-Aggregate-Reads-Ledger-Only VIOLATED: "
                    f"ledger_reconstructor references collection {node.value!r}. "
                    f"The reconstructor must read ONLY Northena ledger rows."
                )
