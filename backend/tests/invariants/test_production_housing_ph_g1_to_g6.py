"""§3.4 Production Housing PH-R1 — gate roster (PH-G1..PH-G6).

Owner rulings (2026-07-10):
    PH-E1 α · vault-class classification + no-secrets-in-image
    PH-E2 α · multi-stage single Dockerfile
    PH-E3 α · /readyz FS-enumeration sharing V1-G7 counter
    PH-E4 α · LLM swap seam doc + call-site inventory (Owner addition)
    Enhancement · /api/system/build_info (Owner promotion)
    Band `[900, 1,700]` RATIFIED

Gates:
    PH-G1 · env classification matches BCR annex
    PH-G2 · Dockerfile multistage + no-secrets-in-image
    PH-G3 · /readyz returns 200 with parity=31 · 503 on drift · 503 on DB down
    PH-G4 · llm_swap_seam doc exists + records target shape + call sites
    PH-G5 · /api/system/build_info returns git_sha + parity + no secrets
    PH-G6 · /readyz + build_info + V1-G7 share ONE authoritative counter
    Auxiliary · PH-G-Parity + PH-G-Docs
"""
from __future__ import annotations

import ast
import re
from pathlib import Path
from unittest.mock import patch, AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from server import app
from services.health import (
    EXPECTED_PARITY,
    count_frozen_contract_snapshots,
    parity_ok,
    snapshot_directory,
)

REPO_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = REPO_ROOT / "backend"
DOCS_HOUSING = REPO_ROOT / "docs" / "production_housing"


# ═════════════════════════════════════════════════════════════════════
# PH-G1 · env classification matches BCR v1.5 §3.4 annex verbatim
# ═════════════════════════════════════════════════════════════════════

def test_ph_g1_env_findings_audit_exists_and_references_bcr_annex():
    """PH-G1: audit file present · classifies vars per BCR §3.4 annex."""
    audit = DOCS_HOUSING / "env_findings_v0.md"
    assert audit.exists(), "env_findings_v0.md must land at PH-R1 (PH-E1 α)"
    text = audit.read_text()
    # References the annex + BCR v1.5.
    assert "BCR v1.5" in text
    assert "§3.4" in text
    # Every annex-named var must appear in the audit.
    for var in ("MONGO_URL", "JWT_SECRET", "LLM_PROVIDER", "LLM_API_KEY",
                "OBJECT_STORE_ENDPOINT", "OBJECT_STORE_CREDS", "PUBLIC_BASE_URL"):
        assert var in text, f"PH-G1: {var} not classified in env_findings_v0.md"


def test_ph_g1_env_findings_audit_contains_no_secret_values():
    """PH-G1: PH-E1 α · Owner explicit · no secret VALUES captured."""
    audit = DOCS_HOUSING / "env_findings_v0.md"
    text = audit.read_text()
    # Common secret patterns MUST NOT appear (rough regex sweep · no
    # base64-encoded JWTs · no mongodb credentials · no api keys).
    forbidden_patterns = [
        r"mongodb://[^:]+:[^@]+@",              # user:pass in URI
        r"eyJ[A-Za-z0-9_\-]{20,}",              # JWT-like tokens
        r"sk-[A-Za-z0-9]{20,}",                 # OpenAI-style secret keys
        r"AKIA[0-9A-Z]{16}",                    # AWS access key
    ]
    for pat in forbidden_patterns:
        assert re.search(pat, text) is None, (
            f"PH-G1: env findings audit MUST NOT contain secret values "
            f"(pattern matched: {pat})"
        )


# ═════════════════════════════════════════════════════════════════════
# PH-G2 · Dockerfile multi-stage + no-secrets-in-image
# ═════════════════════════════════════════════════════════════════════

def test_ph_g2_dockerfile_exists_and_is_multistage():
    """PH-G2: Dockerfile lands at repo root · two stages."""
    df = REPO_ROOT / "Dockerfile"
    assert df.exists(), "Dockerfile must land at repo root (PH-E2 α)"
    text = df.read_text()
    # Two FROM stages: frontend-build + backend-runtime.
    from_lines = [ln for ln in text.splitlines() if ln.strip().startswith("FROM ")]
    assert len(from_lines) >= 2, (
        f"PH-G2: Dockerfile must be multi-stage (found {len(from_lines)} FROM lines)"
    )
    assert "node:20-alpine" in text, "PH-G2: frontend-build stage must use node:20-alpine"
    assert "python:3.11-slim" in text, "PH-G2: backend-runtime stage must use python:3.11-slim"


def test_ph_g2_dockerfile_does_not_copy_dotenv():
    """PH-G2: PH-E1 α · Dockerfile MUST NOT `COPY .env`."""
    df = REPO_ROOT / "Dockerfile"
    text = df.read_text()
    # Look for any COPY of .env
    copy_dotenv = re.search(r"^\s*COPY\s+.*\.env", text, re.MULTILINE)
    assert copy_dotenv is None, (
        f"PH-G2: Dockerfile MUST NOT COPY .env (found: {copy_dotenv.group() if copy_dotenv else '-'})"
    )


def test_ph_g2_dockerignore_excludes_dotenv():
    """PH-G2: PH-E1 α · .dockerignore excludes .env files."""
    di = REPO_ROOT / ".dockerignore"
    assert di.exists(), ".dockerignore must land at PH-R1 (PH-E1 α)"
    text = di.read_text()
    # At minimum: `.env` and either `.env.*` or `*.env` present.
    assert ".env" in text
    assert ".env.*" in text or "*.env" in text, (
        "PH-G2: .dockerignore must exclude .env.* pattern too"
    )


def test_ph_g2_dockerfile_exposes_8001_and_has_healthcheck():
    """PH-G2: BCR annex healthcheck posture · EXPOSE 8001 · HEALTHCHECK curl /api/healthz."""
    df = REPO_ROOT / "Dockerfile"
    text = df.read_text()
    assert re.search(r"^\s*EXPOSE\s+8001", text, re.MULTILINE), "PH-G2: must EXPOSE 8001"
    assert re.search(r"HEALTHCHECK.*curl.*/api/healthz", text, re.DOTALL), (
        "PH-G2: HEALTHCHECK must curl /api/healthz per BCR annex"
    )


# ═════════════════════════════════════════════════════════════════════
# PH-G3 · /api/readyz FS-enumeration + DB-ping semantics
# ═════════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_ph_g3_healthz_returns_200_no_auth_no_db():
    """PH-G3: /api/healthz liveness · 200 · no auth · no DB touch."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/healthz")
    assert resp.status_code == 200
    body = resp.json()
    assert body == {"status": "alive"}


@pytest.mark.asyncio
async def test_ph_g3_readyz_returns_200_with_parity_31_when_healthy():
    """PH-G3: /api/readyz returns 200 with parity=31 when Mongo + FS both green."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/readyz")
    # In the test environment, Mongo may or may not be reachable.
    # If parity is right AND Mongo is up: 200. If Mongo is down: 503 with db_ping_failed.
    assert resp.status_code in (200, 503)
    body = resp.json()
    if resp.status_code == 200:
        assert body["status"] == "ready"
        assert body["parity_count"] == 34
        assert body["expected_parity"] == 34
        assert body["db"] == "ok"
    else:
        # 503 must be either db_ping_failed or parity_mismatch (never a refusal envelope).
        assert body["status"] == "not_ready"
        assert body["reason"] in ("db_ping_failed", "parity_mismatch")


@pytest.mark.asyncio
async def test_ph_g3_readyz_returns_503_on_db_down():
    """PH-G3: /api/readyz surfaces 503 when Mongo ping fails."""
    # Patch db.command to raise, simulating Mongo unavailable.
    with patch("routers.health.db") as mock_db:
        mock_db.command = AsyncMock(side_effect=RuntimeError("mongo unreachable"))
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/readyz")
    assert resp.status_code == 503
    body = resp.json()
    assert body["status"] == "not_ready"
    assert body["reason"] == "db_ping_failed"
    # Refusal taxonomy stays closed: 503 is infra readiness, NEVER a refusal envelope.
    assert "refusal" not in body
    assert "envelope" not in body


@pytest.mark.asyncio
async def test_ph_g3_readyz_returns_503_on_parity_drift():
    """PH-G3: /api/readyz surfaces 503 when parity != 31."""
    # Simulate parity drift by patching the shared counter.
    with patch("routers.health.count_frozen_contract_snapshots", return_value=99):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            resp = await client.get("/api/readyz")
    assert resp.status_code == 503
    body = resp.json()
    assert body["status"] == "not_ready"
    assert body["reason"] == "parity_mismatch"
    assert body["parity_count"] == 99
    assert body["expected_parity"] == 34


# ═════════════════════════════════════════════════════════════════════
# PH-G4 · LLM swap seam doc exists + records target shape + call sites
# ═════════════════════════════════════════════════════════════════════

def test_ph_g4_llm_swap_seam_doc_exists_and_records_target_shape():
    """PH-G4: PH-E4 α · seam doc lands + records BCR annex target shape."""
    seam_doc = DOCS_HOUSING / "llm_swap_seam.md"
    assert seam_doc.exists(), "llm_swap_seam.md must land at PH-R1 (PH-E4 α)"
    text = seam_doc.read_text()
    # BCR annex target shape recorded verbatim.
    assert "complete(messages, temperature, model)" in text, (
        "PH-G4: seam doc must record BCR annex target shape verbatim"
    )
    # Current shape (invoke_with_metering) documented for migration.
    assert "invoke_with_metering" in text


def test_ph_g4_llm_swap_seam_call_site_inventory_matches_repo():
    """PH-G4: PH-E4 α Owner addition · both call sites appear in seam doc AND repo."""
    seam_doc = DOCS_HOUSING / "llm_swap_seam.md"
    text = seam_doc.read_text()
    # Both post-cut call sites named in the doc.
    assert "fluency_synthesizer.py" in text
    assert "brief_synthesizer.py" in text
    # Both files actually exist in the repo and use invoke_with_metering.
    fluency = BACKEND_ROOT / "services/synisense/shield/fluency_synthesizer.py"
    brief = BACKEND_ROOT / "services/synisense/shield/brief_synthesizer.py"
    assert fluency.exists(), "PH-G4: fluency_synthesizer.py named in seam doc must exist"
    assert brief.exists(), "PH-G4: brief_synthesizer.py named in seam doc must exist"
    assert "invoke_with_metering" in fluency.read_text()
    assert "invoke_with_metering" in brief.read_text()


# ═════════════════════════════════════════════════════════════════════
# PH-G5 · /api/system/build_info endpoint · Owner enhancement promotion
# ═════════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_ph_g5_build_info_returns_git_sha_and_parity():
    """PH-G5: /api/system/build_info returns {git_sha, build_timestamp, parity_count}."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/system/build_info")
    assert resp.status_code == 200
    body = resp.json()
    # Payload shape (Owner explicit).
    assert set(body.keys()) == {"git_sha", "build_timestamp", "parity_count"}
    assert isinstance(body["git_sha"], str) and len(body["git_sha"]) > 0
    assert isinstance(body["build_timestamp"], str) and len(body["build_timestamp"]) > 0
    assert body["parity_count"] == 34  # Same counter as PH-E3.


@pytest.mark.asyncio
async def test_ph_g5_build_info_payload_no_secrets():
    """PH-G5: Owner explicit · no secrets in the payload."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/system/build_info")
    body = resp.json()
    # Keys are exactly the three Owner-approved.
    assert set(body.keys()) == {"git_sha", "build_timestamp", "parity_count"}
    # Grep-negative: values must not contain any secret-shaped string.
    for key, value in body.items():
        value_str = str(value)
        for pat in [r"mongodb://[^:]+:[^@]+@", r"eyJ[A-Za-z0-9_\-]{20,}", r"sk-[A-Za-z0-9]{20,}"]:
            assert re.search(pat, value_str) is None, (
                f"PH-G5: build_info payload key={key} contains secret-shaped value"
            )


# ═════════════════════════════════════════════════════════════════════
# PH-G6 · One authoritative parity counter (readyz + build_info + V1-G7)
# ═════════════════════════════════════════════════════════════════════

def test_ph_g6_shared_parity_counter_module_exists():
    """PH-G6: PH-E3 α · shared counter at services/health/parity_counter.py."""
    counter = BACKEND_ROOT / "services" / "health" / "parity_counter.py"
    assert counter.exists(), (
        "PH-G6: shared parity counter must exist at services/health/parity_counter.py"
    )


def test_ph_g6_shared_counter_returns_31():
    """PH-G6: the shared counter returns 31 (same as V1-G7 semantics)."""
    assert count_frozen_contract_snapshots() == 34
    assert EXPECTED_PARITY == 34
    assert parity_ok() is True


def test_ph_g6_readyz_and_build_info_use_shared_counter():
    """PH-G6: readyz + build_info + V1-G7 read from the SAME source module.

    AST attest: `routers/health.py` and `routers/system_info.py` and
    `tests/invariants/test_9_2a_real_perception.py` all import from
    `services.health` (the shared counter module).
    """
    health_source = (BACKEND_ROOT / "routers" / "health.py").read_text()
    system_info_source = (BACKEND_ROOT / "routers" / "system_info.py").read_text()
    v1_g7_source = (
        BACKEND_ROOT / "tests" / "invariants" / "test_9_2a_real_perception.py"
    ).read_text()

    # All three surfaces import from the shared counter module.
    assert "from services.health import" in health_source
    assert "count_frozen_contract_snapshots" in health_source

    assert "from services.health import" in system_info_source
    assert "count_frozen_contract_snapshots" in system_info_source

    assert "from services.health import" in v1_g7_source
    assert "count_frozen_contract_snapshots" in v1_g7_source


def test_ph_g6_snapshot_directory_matches_v1_g7_directory():
    """PH-G6: the shared counter's canonical directory is `tests/invariants/`."""
    canonical = snapshot_directory()
    expected = BACKEND_ROOT / "tests" / "invariants"
    assert canonical.resolve() == expected.resolve()


# ═════════════════════════════════════════════════════════════════════
# Auxiliary · PH-G-Parity + PH-G-Docs
# ═════════════════════════════════════════════════════════════════════

def test_ph_g_parity_31_preserved_at_ph_r1_landing():
    """Frozen contracts + snapshots byte-identical (parity 31)."""
    invariants_dir = BACKEND_ROOT / "tests" / "invariants"
    snapshots = list(invariants_dir.glob("*.contract_snapshot.json"))
    assert len(snapshots) == 34, (
        f"PH-G-Parity → Memory Service Stage B: expected 34 snapshots; found {len(snapshots)}"
    )


def test_ph_g_docs_all_four_production_housing_files_exist():
    """Standing Rule v3: four production_housing docs are on-disk canonical."""
    for name in (
        "env_findings_v0.md",
        "llm_swap_seam.md",
        "frontend_backend_split.md",
        "promotion_audit_v0.md",
    ):
        f = DOCS_HOUSING / name
        assert f.exists(), f"PH-G-Docs: {name} must exist under docs/production_housing/"


def test_ph_g_docs_all_reference_bcr_v1_5_and_owner_ruling_date():
    """Each production_housing doc references BCR v1.5 + Owner ruling landing."""
    for name in (
        "env_findings_v0.md",
        "llm_swap_seam.md",
        "frontend_backend_split.md",
        "promotion_audit_v0.md",
    ):
        text = (DOCS_HOUSING / name).read_text()
        assert "BCR v1.5" in text or "BCR" in text, f"PH-G-Docs: {name} must reference BCR"
        assert "2026-07-10" in text, f"PH-G-Docs: {name} must reference the Owner-ruling landing date"


def test_ph_g_ph_r1_rulings_record_exists_and_captures_all_rulings():
    """Rulings record for PH-E1..E4 + enhancement is on-disk canonical."""
    rulings = REPO_ROOT / "docs" / "rulings" / "production_housing_ph_r1_ph_e1_to_e4.md"
    assert rulings.exists()
    text = rulings.read_text()
    for anchor in ("PH-E1", "PH-E2", "PH-E3", "PH-E4", "build_info", "[900, 1,700]"):
        assert anchor in text, f"PH-R1 rulings record must reference {anchor}"


def test_ph_g_close_report_stage_a_and_rulings_linked_by_sha():
    """PH-R1 stage A proposal on-disk + rulings on-disk (SHA linkage attest)."""
    stage_a = REPO_ROOT / "docs" / "stage_a_proposals" / "production_housing_ph_r1.md"
    assert stage_a.exists()
    stage_a_text = stage_a.read_text()
    # Stage A is verbatim-linked from the rulings record.
    rulings_text = (REPO_ROOT / "docs" / "rulings" / "production_housing_ph_r1_ph_e1_to_e4.md").read_text()
    assert "production_housing_ph_r1.md" in rulings_text
    # Stage A references BCR v1.5 §3.4.
    assert "BCR v1.5" in stage_a_text
    assert "§3.4" in stage_a_text


# ═════════════════════════════════════════════════════════════════════
# Refusal taxonomy stays closed (503 on not-ready is infra, not refusal)
# ═════════════════════════════════════════════════════════════════════

def test_ph_g_readyz_source_never_uses_refusal_envelope():
    """AST attest: routers/health.py does NOT import or return a refusal envelope."""
    health_src = (BACKEND_ROOT / "routers" / "health.py").read_text()
    tree = ast.parse(health_src)
    # Grep-negative: no import of refusal contracts, no `refusal_reason` key.
    assert "admission_refusal" not in health_src.lower()
    assert "service_1_refusal" not in health_src.lower()
    # AST walk: no attribute access on `AdmissionRefusal` or `ServiceRefusal`.
    for node in ast.walk(tree):
        if isinstance(node, ast.Attribute):
            assert node.attr not in {"AdmissionRefusal", "ServiceRefusal"}
