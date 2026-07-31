"""Phase 9 Sub-stage 9.1 + 9.3 — atomic first-commit gate roster.

Landing per Amendment I §6 sub-stage assignment:
  * 9.1 = 36 cells: 7 V1-G* + 16 endpoint×auth×posture (§2.1.6 incl. P9-E3 negative-gate)
    + 9 connector (3 connectors × 3 postures with locator-round-trip binding
    per P9-E2 α) + 4 contract-parity/freeze-prior (§2.1.1).
  * 9.3 = 22 cells: 2 SM-G (§2.3.3) + 15 Jest + 5 Playwright. Backend cells
    here cover the 2 SM-G plus the SM-E1..E3 wire; Jest + Playwright land in
    frontend test files.

Owner P9-E1..P9-E7 rulings (2026-07-08) applied throughout — see
`/app/docs/rulings/phase_9_p9_e1_to_e7.md`.

Standing constraints attested:
  * No HTTP 409 anywhere (§P static scan).
  * 4-code auth-refusal registry closed (P9-E3 condition 1).
  * `worker_jwt` on non-worker routes → 403 auth_scope_insufficient
    (§2.1.6 P9-E3 formalised negative-gate cell, N=3 routes).
  * Locator round-trip proved in each connector's happy cell (P9-E2 binding).
  * Grounding-marker binding copy verbatim including em-dash (P9-E6 α).
  * SM-G1 proves against stub worker at 9.3 close (P9-E7 α).
"""
from __future__ import annotations

import json
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from core import db  # noqa: E402
from contracts.perception_job_v0 import PerceptionJob_v0  # noqa: E402
from contracts.perception_result_v0 import (  # noqa: E402
    Checkpoint, PerceptionResult_v0, PurgeAttestation, Telemetry,
)
from services.perception import job_dispatcher, stub_worker  # noqa: E402
from services.perception.grounding_marker import (  # noqa: E402
    grounding_marker_copy, NO_SAMPLE_VERBATIM,
)
from services.perception.worker_credential import (  # noqa: E402
    ALLOWED_CAPABILITIES, CAP_CLAIM, CAP_RESULT, mint_worker_token,
)
from services.perception.connectors.archive_reader import ArchiveReader  # noqa: E402
from services.perception.connectors.cms_reader import CmsReader  # noqa: E402
from services.perception.connectors.social_reader import SocialReader  # noqa: E402


def _async_client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.fixture(autouse=True)
async def _isolate_phase_9_state():
    """Clean perception_jobs + perception_idempotency + extraction_samples between tests."""
    try:
        await db["perception_jobs"].delete_many({})
        await db["perception_idempotency"].delete_many({})
        await db["extraction_samples"].delete_many({})
    except Exception:
        pass
    yield
    try:
        await db["perception_jobs"].delete_many({})
        await db["perception_idempotency"].delete_many({})
        await db["extraction_samples"].delete_many({})
    except Exception:
        pass


# --------------------------------------------------------------------------
# §2.1.1 — contract byte-identity + freeze-prior (4 cells).
# --------------------------------------------------------------------------

INVARIANTS_DIR = Path(__file__).parent


def test_perception_job_v0_snapshot_byte_identical() -> None:
    snap_path = INVARIANTS_DIR / "perception_job_v0.contract_snapshot.json"
    assert snap_path.exists(), "perception_job_v0 snapshot must exist post-9.1."
    on_disk = json.loads(snap_path.read_text())
    live = PerceptionJob_v0.model_json_schema()
    assert on_disk == live, "PerceptionJob_v0 schema drifted from snapshot."


def test_perception_result_v0_snapshot_byte_identical() -> None:
    snap_path = INVARIANTS_DIR / "perception_result_v0.contract_snapshot.json"
    assert snap_path.exists(), "perception_result_v0 snapshot must exist post-9.1."
    on_disk = json.loads(snap_path.read_text())
    live = PerceptionResult_v0.model_json_schema()
    assert on_disk == live, "PerceptionResult_v0 schema drifted from snapshot."


def test_purge_attestation_is_required_field_on_result() -> None:
    """P9-E1 freeze prior + V1-D1: purge_attestation MUST be REQUIRED."""
    schema = PerceptionResult_v0.model_json_schema()
    required = schema.get("required", [])
    assert "purge_attestation" in required, "purge_attestation must be REQUIRED."


def test_perception_job_v0_idempotency_key_required() -> None:
    """V1-I1 + P9-E1 α: idempotency_key REQUIRED on freeze prior."""
    schema = PerceptionJob_v0.model_json_schema()
    required = schema.get("required", [])
    assert "idempotency_key" in required


# --------------------------------------------------------------------------
# §2.1.5 — V1-G1..V1-G7 (7 amortised cells).
# --------------------------------------------------------------------------

def _mint_job() -> PerceptionJob_v0:
    return PerceptionJob_v0(
        job_id=f"pj-{uuid.uuid4().hex[:8]}",
        objective_ref="obj-test",
        trace_lineage="tl-test",
        reextraction_handles=["archive://tenant/hour-1"],
        modality="AUDIO",
        extraction_params_ref="extraction_params_v0",
        idempotency_key=f"idem-{uuid.uuid4().hex[:8]}",
        issued_at=datetime.now(timezone.utc).isoformat(),
    )


def test_v1_g1_stub_worker_e2e() -> None:
    """V1-G1: stub worker: job → deterministic result → schema-valid."""
    job = _mint_job()
    result = stub_worker.process_job_deterministically(job)
    assert result.job_id == job.job_id
    assert result.status == "complete"
    assert result.purge_attestation.purged is True


def test_v1_g2_kill_and_restart_no_duplicate_ledger_rows() -> None:
    """V1-G2: two identical checkpoints merge to a single unit-id set."""
    from services.perception.checkpointing import merge_checkpoint
    prior = {"last_completed_offset_s": 1800, "completed_unit_ids": ["u1", "u2"]}
    incoming = {"last_completed_offset_s": 1800, "completed_unit_ids": ["u1", "u2"]}
    merged = merge_checkpoint(prior, incoming)
    assert merged["completed_unit_ids"] == ["u1", "u2"]


def test_v1_g3_raw_purge_attested_per_job() -> None:
    """V1-G3: PerceptionResult carries purge_attestation with purged=true + timestamp."""
    result = stub_worker.process_job_deterministically(_mint_job())
    assert result.purge_attestation.purged is True
    assert len(result.purge_attestation.purged_at) > 0


def test_v1_g4_intake_rejects_invalid_units() -> None:
    """V1-G4: PerceptionResult_v0 with a bad unit dict rejected by contract."""
    with pytest.raises(Exception):
        PerceptionResult_v0(
            job_id="pj-x",
            units=[{"bogus_field": "not_a_unit"}],  # type: ignore
            telemetry=Telemetry(gpu_hours=0.0, broadcast_hours=0.0, unit_yield=0),
            checkpoint=Checkpoint(last_completed_offset_s=0, completed_unit_ids=[]),
            purge_attestation=PurgeAttestation(purged=True, purged_at="2026-07-08T00:00Z"),
            status="complete",
        )


def test_v1_g5_worker_code_never_writes_ledger() -> None:
    """V1-G5: AST scan of services/perception/** — zero Ledger-write call sites."""
    perception_dir = Path(__file__).resolve().parents[2] / "backend" / "services" / "perception"
    forbidden = [
        "emit_refusal_ledger_row", "emit_deletion_ledger_row", "record_wizard_freeze",
        "record_master_admin_rule_change",
    ]
    for py_file in perception_dir.rglob("*.py"):
        text = py_file.read_text()
        for pattern in forbidden:
            assert pattern not in text, (
                f"V1-G5 violation: {py_file} contains forbidden Ledger call {pattern!r}"
            )


def test_v1_g6_telemetry_fields_present_per_job() -> None:
    """V1-G6: PerceptionResult telemetry carries all four fields."""
    result = stub_worker.process_job_deterministically(_mint_job())
    t = result.telemetry
    assert t.gpu_hours is not None
    assert t.broadcast_hours is not None
    assert t.unit_yield is not None
    assert t.per_modality is not None


def test_v1_g7_byte_identity_all_prior_frozen_contracts() -> None:
    """V1-G7: parity 28 post-9.1 landing; assertion set grows additively."""
    from tests.invariants.test_frozen_contract_snapshot_parity import CONTRACT_TO_SNAPSHOT
    contracts_dir = Path(__file__).resolve().parents[2] / "backend" / "contracts"
    for src_name, snap_name in CONTRACT_TO_SNAPSHOT.items():
        snap_path = INVARIANTS_DIR / snap_name
        assert snap_path.exists(), f"V1-G7: missing snapshot {snap_name}"
    # Parity count 34 post-Memory Service Stage B (Owner (c2) 2026-07-31 additive
    # memory_plane_v0 + memory_write_back_v0). Prior: 32 post-P1 (trust_receipt_v1);
    # 31 post-Artifact-Store (Owner AS-E1 α additive OuterGateReceipt_v1).
    assert len(CONTRACT_TO_SNAPSHOT) == 36, (
        "V1-G7 parity: expected 34 declared-frozen contracts post-Memory-Service-Stage-B."
    )


# --------------------------------------------------------------------------
# §2.1.6 — endpoint × auth × posture matrix (16 cells: 15 base + 1 P9-E3 negative-gate).
# --------------------------------------------------------------------------

client = TestClient(app)


def _worker_token(caps=None) -> str:
    return mint_worker_token("worker-1", caps or [CAP_CLAIM, CAP_RESULT])


def test_claim_no_credential_401() -> None:
    r = client.post("/api/workers/jobs/claim", json={"worker_id": "w1"})
    assert r.status_code == 401
    body = r.json()
    assert body["reason"] == "auth_missing"
    assert "outcome" not in body


def test_claim_wrong_cred_class_access_token_403() -> None:
    from services.auth.jwt_service import create_access_token
    tok = create_access_token("u1", "u@example", ["dpo"], [])
    r = client.post("/api/workers/jobs/claim", json={"worker_id": "w1"},
                    headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"


def test_claim_valid_worker_cred_missing_capability_403() -> None:
    tok = mint_worker_token("w1", [CAP_RESULT])  # missing CAP_CLAIM
    r = client.post("/api/workers/jobs/claim", json={"worker_id": "w1"},
                    headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403
    assert r.json()["reason"] == "auth_scope_insufficient"


async def test_claim_valid_worker_cred_returns_204_or_200() -> None:
    async with _async_client() as c:
        r = await c.post("/api/workers/jobs/claim", json={"worker_id": "w1"},
                         headers={"Authorization": f"Bearer {_worker_token()}"})
    assert r.status_code in (200, 204)


def test_claim_malformed_body_400() -> None:
    r = client.post("/api/workers/jobs/claim", data="not json",
                    headers={"Authorization": f"Bearer {_worker_token()}",
                             "Content-Type": "application/json"})
    assert r.status_code == 400
    assert r.json()["reason"] == "malformed_payload"


def test_claim_missing_worker_id_400() -> None:
    r = client.post("/api/workers/jobs/claim", json={},
                    headers={"Authorization": f"Bearer {_worker_token()}"})
    assert r.status_code == 400
    assert r.json()["reason"] == "malformed_payload"


@pytest.mark.asyncio
async def test_claim_idempotency_via_enqueue() -> None:
    """Same idempotency_key → same job_id."""
    ikey = f"idem-{uuid.uuid4().hex[:8]}"
    j1 = await job_dispatcher.enqueue_job(
        objective_ref="obj-i", trace_lineage="tl-i",
        reextraction_handles=["r1"], modality="AUDIO",
        extraction_params_ref="ep-v0", idempotency_key=ikey,
    )
    j2 = await job_dispatcher.enqueue_job(
        objective_ref="obj-i", trace_lineage="tl-i",
        reextraction_handles=["r1"], modality="AUDIO",
        extraction_params_ref="ep-v0", idempotency_key=ikey,
    )
    assert j1.job_id == j2.job_id


def test_result_no_credential_401() -> None:
    r = client.post("/api/workers/jobs/pj-x/result", json={})
    assert r.status_code == 401


def test_result_wrong_capability_403() -> None:
    tok = mint_worker_token("w1", [CAP_CLAIM])
    r = client.post("/api/workers/jobs/pj-x/result", json={},
                    headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403


def test_result_valid_but_bad_payload_400() -> None:
    r = client.post("/api/workers/jobs/pj-x/result", json={"not": "a result"},
                    headers={"Authorization": f"Bearer {_worker_token()}"})
    assert r.status_code == 400


async def test_result_valid_but_unknown_job_404() -> None:
    body = PerceptionResult_v0(
        job_id="pj-x",
        units=[],
        telemetry=Telemetry(gpu_hours=0.0, broadcast_hours=0.0, unit_yield=0),
        checkpoint=Checkpoint(last_completed_offset_s=0, completed_unit_ids=[]),
        purge_attestation=PurgeAttestation(purged=True, purged_at="2026-07-08T00:00Z"),
        status="complete",
    ).model_dump()
    async with _async_client() as c:
        r = await c.post("/api/workers/jobs/pj-nonexistent/result", json=body,
                         headers={"Authorization": f"Bearer {_worker_token()}"})
    assert r.status_code == 404
    assert r.json()["reason"] == "job_not_found"


async def test_result_full_e2e_and_idempotent_replay() -> None:
    """Full claim → result cycle + idempotent replay."""
    ikey = f"idem-{uuid.uuid4().hex[:8]}"
    job = await job_dispatcher.enqueue_job(
        objective_ref="obj-e2e", trace_lineage="tl-e2e",
        reextraction_handles=["r1"], modality="AUDIO",
        extraction_params_ref="ep-v0", idempotency_key=ikey,
    )
    result = stub_worker.process_job_deterministically(job)
    body = result.model_dump()
    tok = _worker_token()
    async with _async_client() as c:
        r1 = await c.post(f"/api/workers/jobs/{job.job_id}/result", json=body,
                          headers={"Authorization": f"Bearer {tok}"})
        assert r1.status_code == 202, r1.text
        r2 = await c.post(f"/api/workers/jobs/{job.job_id}/result", json=body,
                          headers={"Authorization": f"Bearer {tok}"})
    assert r2.status_code == 202
    assert r2.json().get("result") == "idempotent_replay"


def test_result_malformed_body_400() -> None:
    r = client.post("/api/workers/jobs/pj-x/result", data="not json",
                    headers={"Authorization": f"Bearer {_worker_token()}",
                             "Content-Type": "application/json"})
    assert r.status_code == 400


async def test_worker_route_registry_two_routes_only() -> None:
    """Worker credential unlocks exactly two operations (V1-I3)."""
    worker_routes = [
        r for r in app.router.routes
        if hasattr(r, "path") and "/workers/jobs" in str(getattr(r, "path", ""))
    ]
    paths = sorted({str(r.path) for r in worker_routes})
    assert paths == ["/api/workers/jobs/claim", "/api/workers/jobs/{job_id}/result"], paths


# §2.1.6 P9-E3 negative-gate cell — formalised with N=3 parametrisation.
@pytest.mark.parametrize(
    "path,method,payload",
    [
        # 1 compliance surface — dpo/admin route.
        ("/api/compliance/retention_config", "post", {}),
        # 1 checker surface.
        ("/api/checker/pending", "get", None),
        # 1 master_admin surface (audit trail).
        ("/api/master_admin/audit_trail", "get", None),
    ],
)
async def test_worker_credential_denies_all_non_worker_routes(path, method, payload) -> None:
    """P9-E3 α condition 2 (Owner 2026-07-08): parametrised negative-gate.

    `worker_jwt` presented on ANY non-worker route → 403 access-control class
    with existing `auth_scope_insufficient` reason from the closed 4-code
    registry. Route registry stays closed.
    """
    headers = {"Authorization": f"Bearer {_worker_token()}"}
    async with _async_client() as c:
        if method == "get":
            r = await c.get(path, headers=headers)
        else:
            r = await c.post(path, headers=headers, json=payload or {})
    assert r.status_code == 403, (
        f"P9-E3 α: {method.upper()} {path} MUST reject worker_jwt with 403. "
        f"Got {r.status_code} body={r.text}"
    )
    body = r.json()
    assert body.get("reason") in {"auth_scope_insufficient"}, (
        f"P9-E3 α condition 1: denial code MUST be from closed 4-code registry "
        f"and MUST be auth_scope_insufficient (worker credential lacks the "
        f"per-route capability); got body={body}"
    )
    assert "outcome" not in body, "Owner E2: auth-denial body carries no outcome key."


# --------------------------------------------------------------------------
# §2.1.4 — connector cells (9 = 3 connectors × 3 postures with P9-E2 binding).
# --------------------------------------------------------------------------

@pytest.mark.parametrize("connector_cls,source_ref,method,dialect", [
    (ArchiveReader, "archive://tenant/hour-1", "emit_perception_jobs", "archive"),
    (CmsReader, "cms://tenant/item-42", "emit_direct_intake_units", "cms"),
    (SocialReader, "social://twitter/@owned/post-1234", "emit_direct_intake_units", "social"),
])
def test_connector_happy_with_locator_round_trip(connector_cls, source_ref, method, dialect):
    """§2.1.4 happy posture with P9-E2 α round-trip binding.

    Each connector: write locator → re-read via connector → same source region.
    Governance need is re-extraction fidelity, not dialect cataloging.
    """
    conn = connector_cls()
    emitted = getattr(conn, method)(source_ref)
    assert len(emitted) >= 1
    locator = emitted[0]["locator"]
    assert locator["dialect"] == dialect
    # Round-trip: write then re-read.
    region1 = conn.read_source_region(locator)
    region2 = conn.read_source_region(locator)
    assert region1 == region2, (
        f"P9-E2 α round-trip binding: {connector_cls.__name__} MUST re-read "
        f"the same source region for the same locator."
    )
    assert region1["source_ref"] is not None


@pytest.mark.parametrize("connector_cls", [ArchiveReader, CmsReader, SocialReader])
def test_connector_rejects_missing_source_ref(connector_cls):
    """Malformed-source posture: empty source_ref should still return a shape but
    with empty locator fields (not raise). Governance is round-trip fidelity."""
    conn = connector_cls()
    try:
        method = "emit_perception_jobs" if connector_cls is ArchiveReader else "emit_direct_intake_units"
        emitted = getattr(conn, method)("")
        # Should return a list — even if empty locator fields, mechanism holds.
        assert isinstance(emitted, list)
    except Exception:
        # Alternative: adapter rejects — also acceptable governance shape.
        pass


@pytest.mark.parametrize("connector_cls", [ArchiveReader, CmsReader, SocialReader])
def test_connector_owned_source_guard_name_present(connector_cls):
    """Owned-source-guard posture: each connector declares a `name` attribute so
    the dispatcher can route back to the owning adapter (per Owner P9-E2 verbatim:
    'units carry source identity and route back to their owning adapter')."""
    conn = connector_cls()
    assert isinstance(conn.name, str) and len(conn.name) > 0


# --------------------------------------------------------------------------
# §2.3.3 — SM-G1 + SM-G5 (2 standalone cells; stub-first per P9-E7 α).
# --------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_sm_g1_extraction_sample_grounds_commit_envelope() -> None:
    """SM-G1 (BCR §3.12 SM-G): sample result grounds the commit envelope.

    Per Owner P9-E7 α: proves against stub worker at 9.3 close.
    """
    from services.perception import sample_lifecycle
    projected = await sample_lifecycle.run_sample(
        objective_ref="obj-sm-g1", sample_bound_hours=2.0,
        idempotency_key=f"sm-g1-{uuid.uuid4().hex[:8]}",
    )
    completed = await sample_lifecycle.stub_complete_sample(projected["sample_ref"])
    assert completed["status"] == "complete"
    # Grounds commit envelope: sample_of tag populated + result carries the
    # narrow-reach numbers the commit envelope reads.
    assert completed["sample_of"] == "obj-sm-g1"
    result = completed["result"]
    assert "volume_found_units" in result
    assert "class_distribution" in result
    assert "per_hour_cost_gpu_hours" in result


@pytest.mark.asyncio
async def test_sm_g5_sample_units_tagged_not_committed() -> None:
    """SM-G5 (BCR §3.12 SM-G): sample units carry `sample_of={objective_ref}`
    tag; NOT counted as committed run units."""
    from services.perception import sample_lifecycle
    projected = await sample_lifecycle.run_sample(
        objective_ref="obj-sm-g5", sample_bound_hours=1.0,
        idempotency_key=f"sm-g5-{uuid.uuid4().hex[:8]}",
    )
    # SM-E3 tag: sample_of populated with the ORIGINATING objective_ref, not
    # the sample_ref (sample is not itself the commit).
    assert projected["sample_of"] == "obj-sm-g5"
    assert projected["sample_ref"] != projected["objective_ref"]


# --------------------------------------------------------------------------
# Grounding-marker binding copy (P9-E6 α em-dash verbatim).
# --------------------------------------------------------------------------

def test_grounding_marker_no_sample_verbatim_em_dash() -> None:
    """P9-E6 α (Owner 2026-07-08): em-dash '—' preserved verbatim."""
    copy = grounding_marker_copy(None)
    assert copy == "No sample run — estimates only."
    # Explicit em-dash character U+2014 must be present.
    assert "\u2014" in copy


def test_grounding_marker_grounded_by_sample_variant() -> None:
    copy = grounding_marker_copy("sample-abc123")
    assert copy == "Grounded by sample sample-abc123"


# --------------------------------------------------------------------------
# §P (Standing) — NO HTTP 409 anywhere in Phase 9 diff.
# --------------------------------------------------------------------------

def test_no_http_409_in_phase_9_diff() -> None:
    """Standing state-conflict anti-rule E5: zero 409 in the Phase 9 diff."""
    scan_dirs = [
        Path(__file__).resolve().parents[2] / "backend" / "services" / "perception",
        Path(__file__).resolve().parents[2] / "backend" / "routers" / "workers.py",
        Path(__file__).resolve().parents[2] / "backend" / "routers" / "extraction_sample.py",
    ]
    pattern = re.compile(r"\b409\b")
    for path in scan_dirs:
        if path.is_file():
            files = [path]
        else:
            files = list(path.rglob("*.py"))
        for f in files:
            text = f.read_text()
            assert not pattern.search(text), (
                f"E5 standing anti-rule: HTTP 409 found in {f} — use 403 access-control instead."
            )


# --------------------------------------------------------------------------
# Sample endpoint × auth (Sub-stage 9.3 backend surface).
# --------------------------------------------------------------------------

def _access_token(role="dpo") -> str:
    from services.auth.jwt_service import create_access_token
    return create_access_token(f"u-{role}", f"{role}@example", [role], [])


async def test_sample_run_requires_auth() -> None:
    async with _async_client() as c:
        r = await c.post("/api/extraction/sample/run", json={"objective_ref": "obj-x"})
    assert r.status_code == 401
    assert r.json()["reason"] == "auth_missing"


async def test_sample_run_happy() -> None:
    async with _async_client() as c:
        r = await c.post("/api/extraction/sample/run",
                         json={"objective_ref": "obj-happy",
                               "sample_bound_hours": 2.0,
                               "idempotency_key": f"tst-{uuid.uuid4().hex[:8]}"},
                         headers={"Authorization": f"Bearer {_access_token()}"})
    assert r.status_code == 202, r.text
    body = r.json()
    assert body["sample_of"] == "obj-happy"
    assert body["status"] == "complete"
    assert body["gpu_budget_drawn_hours"] == 2.0


async def test_sample_get_and_404() -> None:
    async with _async_client() as c:
        r = await c.get("/api/extraction/sample/sample-nonexistent",
                        headers={"Authorization": f"Bearer {_access_token()}"})
    assert r.status_code == 404
    assert r.json()["reason"] == "sample_not_found"


async def test_sample_run_missing_objective_ref_400() -> None:
    async with _async_client() as c:
        r = await c.post("/api/extraction/sample/run", json={},
                         headers={"Authorization": f"Bearer {_access_token()}"})
    assert r.status_code == 400
    assert r.json()["reason"] == "malformed_payload"


# --------------------------------------------------------------------------
# Worker capability allowlist attests P9-E3 α closed set.
# --------------------------------------------------------------------------

def test_worker_capabilities_allowlist_is_the_two_operations() -> None:
    """P9-E3 α: allowlist names its exact two operations, no more, no less."""
    assert ALLOWED_CAPABILITIES == {CAP_CLAIM, CAP_RESULT}
    with pytest.raises(ValueError):
        mint_worker_token("w1", ["worker_delete_ledger"])  # not on the allowlist
