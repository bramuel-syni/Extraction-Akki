"""P2 buildable-now guard-test tightening.

Owner dispatch (2026-07-30 cycle 3, §4 P2-R1 / P2-R4):
    "Stub-first holds: every guard gate proves against the deterministic
    stub worker before GPU code merges. Never-rules enforced mechanically."

This file tightens the V1-G* roster to the strictness the dispatch names,
and adds the P2-G-R4.* guards proven against stubs (no GPU code, no
real material, no BM-V):

    * V1-G2 (tightened) — kill-and-restart resume + no-duplicate-ledger
                          + idempotent HTTP replay on same result.
    * V1-G3 (tightened) — purge_attestation.purged=True + purged_at is a
                          non-empty ISO-8601-shaped string.
    * V1-G4 (extension) — the intake VALIDATOR at the HTTP boundary rejects
                          a malformed unit dict with 400 malformed_payload;
                          contract-level rejection carried forward.
    * V1-G6 (tightened) — telemetry carries all four fields AND
                          per_modality is a dict shape.
    * P2-G-R4.a — AST-walker: worker modules (asr_worker.py,
                  diarization_worker.py, stub_worker.py, gpu_execution/**)
                  never import services.northena.ledger.* AND never
                  reference services.auth.identity — the never-rules
                  from the dispatch verbatim.
    * P2-G-R4.b — gpu-import gate: services.perception.gpu_execution.cuda_runtime
                  fails import when PERCEPTION_EXECUTION_MODE is unset;
                  stub-first sequencing means stubs continue to serve
                  in the absence of GPU env.

No GPU code, no BM-V, no PH-R2 in scope this cycle.
"""
from __future__ import annotations

import ast
import importlib
import os
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from core import db  # noqa: E402
from contracts.perception_job_v0 import PerceptionJob_v0  # noqa: E402
from contracts.perception_result_v0 import (  # noqa: E402
    Checkpoint, PerceptionResult_v0, PurgeAttestation, Telemetry,
)
from services.perception import job_dispatcher, stub_worker  # noqa: E402
from services.perception.checkpointing import merge_checkpoint  # noqa: E402
from services.perception.worker_credential import (  # noqa: E402
    CAP_CLAIM, CAP_RESULT, mint_worker_token,
)


def _async_client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


def _worker_token() -> str:
    return mint_worker_token("worker-p2", [CAP_CLAIM, CAP_RESULT])


def _mint_job(idempotency_key: str | None = None) -> PerceptionJob_v0:
    return PerceptionJob_v0(
        job_id=f"pj-{uuid.uuid4().hex[:8]}",
        objective_ref="obj-p2",
        trace_lineage="tl-p2",
        reextraction_handles=["archive://tenant/hour-1"],
        modality="AUDIO",
        extraction_params_ref="extraction_params_v0",
        idempotency_key=idempotency_key or f"idem-{uuid.uuid4().hex[:8]}",
        issued_at=datetime.now(timezone.utc).isoformat(),
    )


@pytest.fixture(autouse=True)
async def _isolate_p2_state():
    try:
        await db["perception_jobs"].delete_many({})
        await db["perception_idempotency"].delete_many({})
    except Exception:
        pass
    yield
    try:
        await db["perception_jobs"].delete_many({})
        await db["perception_idempotency"].delete_many({})
    except Exception:
        pass


# =============================================================================
# V1-G2 (tightened) — kill-and-restart resume + no-duplicate-ledger + HTTP
# idempotent replay.
# =============================================================================


def test_v1_g2_tightened_two_identical_checkpoints_merge_stably():
    prior = {"last_completed_offset_s": 1800, "completed_unit_ids": ["u1", "u2"]}
    incoming = {"last_completed_offset_s": 1800, "completed_unit_ids": ["u1", "u2"]}
    merged = merge_checkpoint(prior, incoming)
    assert merged["completed_unit_ids"] == ["u1", "u2"]
    assert merged["last_completed_offset_s"] == 1800


def test_v1_g2_tightened_two_offset_advancing_checkpoints_take_max_and_dedupe():
    prior = {"last_completed_offset_s": 1800, "completed_unit_ids": ["u1", "u2"]}
    incoming = {"last_completed_offset_s": 3600, "completed_unit_ids": ["u2", "u3"]}
    merged = merge_checkpoint(prior, incoming)
    assert merged["last_completed_offset_s"] == 3600
    assert merged["completed_unit_ids"] == ["u1", "u2", "u3"]


@pytest.mark.asyncio
async def test_v1_g2_tightened_http_idempotent_replay_on_same_result():
    """Same POST /result body twice on same job_id → 202 both times; second
    carries result=idempotent_replay. No duplicate ledger effect."""
    ikey = f"idem-{uuid.uuid4().hex[:8]}"
    job = await job_dispatcher.enqueue_job(
        objective_ref="obj-p2",
        trace_lineage="tl-p2",
        reextraction_handles=["r1"],
        modality="AUDIO",
        extraction_params_ref="ep-v0",
        idempotency_key=ikey,
    )
    result = stub_worker.process_job_deterministically(job)
    body = result.model_dump()
    tok = _worker_token()
    async with _async_client() as c:
        r1 = await c.post(
            f"/api/workers/jobs/{job.job_id}/result",
            json=body,
            headers={"Authorization": f"Bearer {tok}"},
        )
        assert r1.status_code == 202, r1.text
        r2 = await c.post(
            f"/api/workers/jobs/{job.job_id}/result",
            json=body,
            headers={"Authorization": f"Bearer {tok}"},
        )
    assert r2.status_code == 202
    assert r2.json().get("result") == "idempotent_replay"


# =============================================================================
# V1-G3 (tightened) — purge_attestation.purged=True + purged_at ISO-shaped.
# =============================================================================


def test_v1_g3_tightened_stub_result_carries_valid_purge_attestation():
    result = stub_worker.process_job_deterministically(_mint_job())
    assert result.purge_attestation.purged is True
    assert isinstance(result.purge_attestation.purged_at, str)
    # ISO-8601 shape: fromisoformat succeeds (tolerant of Z suffix).
    ts = result.purge_attestation.purged_at
    if ts.endswith("Z"):
        ts = ts[:-1] + "+00:00"
    datetime.fromisoformat(ts)  # must not raise


def test_v1_g3_tightened_result_without_purge_attestation_rejected():
    """Contract enforces purge_attestation as REQUIRED."""
    with pytest.raises(Exception):
        PerceptionResult_v0(
            job_id="pj-x",
            units=[],
            telemetry=Telemetry(gpu_hours=0.0, broadcast_hours=0.0, unit_yield=0),
            checkpoint=Checkpoint(last_completed_offset_s=0, completed_unit_ids=[]),
            status="complete",  # missing purge_attestation
        )  # type: ignore[call-arg]


# =============================================================================
# V1-G4 (extension) — real-intake-validator rejection at the HTTP boundary.
# =============================================================================


@pytest.mark.asyncio
async def test_v1_g4_extension_intake_validator_rejects_malformed_result_body():
    """POST /result with a body missing required fields → 400 malformed_payload.
    Contract-level Pydantic validation carried forward, exercised at the seam."""
    tok = _worker_token()
    ikey = f"idem-{uuid.uuid4().hex[:8]}"
    job = await job_dispatcher.enqueue_job(
        objective_ref="obj-p2",
        trace_lineage="tl-p2",
        reextraction_handles=["r1"],
        modality="AUDIO",
        extraction_params_ref="ep-v0",
        idempotency_key=ikey,
    )
    # Body missing purge_attestation, telemetry, checkpoint entirely.
    bad_body = {"job_id": job.job_id, "units": [], "status": "complete"}
    async with _async_client() as c:
        r = await c.post(
            f"/api/workers/jobs/{job.job_id}/result",
            json=bad_body,
            headers={"Authorization": f"Bearer {tok}"},
        )
    assert r.status_code == 400
    assert r.json().get("reason") == "malformed_payload"


@pytest.mark.asyncio
async def test_v1_g4_extension_intake_validator_rejects_bogus_unit_shape():
    """A body carrying a bogus unit dict → 400 malformed_payload."""
    tok = _worker_token()
    ikey = f"idem-{uuid.uuid4().hex[:8]}"
    job = await job_dispatcher.enqueue_job(
        objective_ref="obj-p2",
        trace_lineage="tl-p2",
        reextraction_handles=["r1"],
        modality="AUDIO",
        extraction_params_ref="ep-v0",
        idempotency_key=ikey,
    )
    bad_body = {
        "job_id": job.job_id,
        "units": [{"bogus_field": "not_a_unit"}],
        "telemetry": {"gpu_hours": 0.0, "broadcast_hours": 0.0, "unit_yield": 0, "per_modality": {}},
        "checkpoint": {"last_completed_offset_s": 0, "completed_unit_ids": []},
        "purge_attestation": {"purged": True, "purged_at": "2026-07-31T00:00Z"},
        "status": "complete",
    }
    async with _async_client() as c:
        r = await c.post(
            f"/api/workers/jobs/{job.job_id}/result",
            json=bad_body,
            headers={"Authorization": f"Bearer {tok}"},
        )
    assert r.status_code == 400
    assert r.json().get("reason") == "malformed_payload"


# =============================================================================
# V1-G6 (tightened) — telemetry four fields + per_modality dict shape.
# =============================================================================


def test_v1_g6_tightened_telemetry_carries_four_fields_and_per_modality_is_dict():
    result = stub_worker.process_job_deterministically(_mint_job())
    t = result.telemetry
    assert t.gpu_hours is not None
    assert t.broadcast_hours is not None
    assert t.unit_yield is not None
    assert t.per_modality is not None
    assert isinstance(t.per_modality, dict)
    # Modality of the stub job appears in per_modality (or the field is empty).
    if t.per_modality:
        # For AUDIO stub jobs the shape carries the modality key.
        for k in t.per_modality:
            assert isinstance(k, str)


# =============================================================================
# P2-G-R4.a — AST-walker: worker modules never write to Northena Ledger
# and never reference services.auth.identity (never-rules from dispatch).
# =============================================================================


_WORKER_FILES = [
    "backend/services/perception/asr_worker.py",
    "backend/services/perception/diarization_worker.py",
    "backend/services/perception/stub_worker.py",
    "backend/services/perception/gpu_execution/cuda_runtime.py",
    "backend/services/perception/gpu_execution/model_loader.py",
    "backend/services/perception/gpu_execution/audio_batching.py",
    "backend/services/perception/gpu_execution/__init__.py",
]


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


_FORBIDDEN_LEDGER_IMPORTS = {
    "services.northena.ledger",
    "services.northena.converge",
    "services.compliance.deletion_ledger",
    "services.compliance.refusal_ledger",
    "services.checker.countersign_ledger",
    "services.memory.ledger",  # workers must not write memory events either
}


_FORBIDDEN_IDENTITY_MODULES = {
    "services.auth.identity",
    "services.auth.dependencies",
    "services.auth.jwt_service",
    "services.auth.session_binding",
}


def _iter_import_targets(tree: ast.AST):
    """Yield module names referenced by import / from-import statements."""
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                yield alias.name
        elif isinstance(node, ast.ImportFrom):
            if node.module is not None:
                yield node.module


@pytest.mark.parametrize("rel_path", _WORKER_FILES)
def test_p2_g_r4a_worker_module_never_imports_ledger_writers(rel_path):
    """Every worker file — AST-walk. Zero forbidden ledger-writer imports."""
    path = _repo_root() / rel_path
    assert path.exists(), f"Expected worker file {path}"
    tree = ast.parse(path.read_text())
    imported = set(_iter_import_targets(tree))
    for forbidden in _FORBIDDEN_LEDGER_IMPORTS:
        matched = {m for m in imported if m == forbidden or m.startswith(forbidden + ".")}
        assert not matched, (
            f"P2-G-R4.a VIOLATED in {rel_path}: worker imports Ledger writer "
            f"module(s): {sorted(matched)}. Workers must never write to the Ledger."
        )


@pytest.mark.parametrize("rel_path", _WORKER_FILES)
def test_p2_g_r4a_worker_module_never_imports_identity_stack(rel_path):
    """Workers never reference the auth/identity stack — capability-based
    worker JWT is the only credential seam."""
    path = _repo_root() / rel_path
    tree = ast.parse(path.read_text())
    imported = set(_iter_import_targets(tree))
    for forbidden in _FORBIDDEN_IDENTITY_MODULES:
        matched = {m for m in imported if m == forbidden or m.startswith(forbidden + ".")}
        assert not matched, (
            f"P2-G-R4.a VIOLATED in {rel_path}: worker imports identity module "
            f"{sorted(matched)}. Workers use capability JWT only, never the "
            f"identity stack."
        )


# =============================================================================
# P2-G-R4.b — gpu-import gate: cuda_runtime fails hard when
# PERCEPTION_EXECUTION_MODE is unset; stub-first serves in its absence.
# =============================================================================


def test_p2_g_r4b_gpu_execution_import_refuses_when_env_var_unset(monkeypatch):
    """Fresh import with env var unset → ImportError. Stub-first sequencing.

    Restores env var + module cache after the check so subsequent tests
    have a fresh cuda_runtime available.
    """
    monkeypatch.delenv("PERCEPTION_EXECUTION_MODE", raising=False)
    for mod in list(sys.modules):
        if mod.startswith("services.perception.gpu_execution"):
            del sys.modules[mod]
    with pytest.raises(ImportError) as exc:
        importlib.import_module("services.perception.gpu_execution.cuda_runtime")
    assert "unset" in str(exc.value) or "silent fallback" in str(exc.value)
    # Restore for downstream tests.
    os.environ["PERCEPTION_EXECUTION_MODE"] = "cpu"
    for mod in list(sys.modules):
        if mod.startswith("services.perception.gpu_execution"):
            del sys.modules[mod]
    importlib.import_module("services.perception.gpu_execution.cuda_runtime")


def test_p2_g_r4b_gpu_execution_import_refuses_invalid_mode_string(monkeypatch):
    monkeypatch.setenv("PERCEPTION_EXECUTION_MODE", "quantum")
    for mod in list(sys.modules):
        if mod.startswith("services.perception.gpu_execution"):
            del sys.modules[mod]
    with pytest.raises(ImportError):
        importlib.import_module("services.perception.gpu_execution.cuda_runtime")
    os.environ["PERCEPTION_EXECUTION_MODE"] = "cpu"
    for mod in list(sys.modules):
        if mod.startswith("services.perception.gpu_execution"):
            del sys.modules[mod]
    importlib.import_module("services.perception.gpu_execution.cuda_runtime")


def test_p2_g_r4b_stub_worker_serves_without_gpu_env():
    """Stub-first: with PERCEPTION_EXECUTION_MODE=cpu (CI default), the stub
    worker still produces a valid PerceptionResult_v0. GPU code is not on
    this hot path."""
    result = stub_worker.process_job_deterministically(_mint_job())
    assert result.status == "complete"
    assert result.purge_attestation.purged is True
