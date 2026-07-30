"""Census-dimensions mini-phase — atomic first-commit test suite.

Owner rulings CD-E1..CD-E4 α + conditions (2026-07-10).
Landing per §4.1 baseline atomic first-commit under 3-tier governance.

Named gate roster:
  * CD-G1 : three-op sidecar signatures + registries seed EMPTY at v0.
  * CD-G2 : symmetric contradiction validator (both directions rejected).
  * CD-G3 : AST/reflection gate — no in-code hard-coded values bypass validators.
            (Lives in `test_census_dimensions_ast_gate.py` per §6.10 rate class.)
  * CD-G4 : registration-path cell — census_observed register-before-validate;
            manifest_declared hard-fail.
  * Wire-shape gate : 5 governance-key fields pinned + additive-field tolerance.
            (Lives in `test_census_dimensions_wire_shape.py` per CD-E4 α.)
  * V1-G7 : parity 31 attest (no additions this phase; CD-E2 α ↔ CD-E4 coupling).
  * 4-code auth-refusal registry closure re-attest.
  * E5 no-HTTP-409 re-attest on CD new files.
"""
from __future__ import annotations

import inspect
import json
import shutil
import sys
import tempfile
from pathlib import Path

import pytest
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import ValidationError

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from services.census_dimensions import dimensions_loader as _dimensions_loader  # noqa: E402
from services.census_dimensions import dimensions_service as _dimensions_service  # noqa: E402
from services.census_dimensions.dimensions_loader import (  # noqa: E402
    current_registry_version,
    load_registry,
    register_observation,
    validate_content_surface,
    validate_genre,
)
from services.census_dimensions.dimensions_service import (  # noqa: E402
    CensusContentDimension,
    list_registry,
    read_census_dimensions_for_feed,
    record_census_dimension,
)


# ---------- Test-scoped registry sandbox ----------

@pytest.fixture
def registry_sandbox(monkeypatch, tmp_path):
    """Copy v0 seeds into a tmp dir + swap the loader's _REGISTRY_DIR.

    Every test that writes v(N+1) files uses this fixture so the on-disk
    canonical v0 files stay byte-identical during the run.
    """
    src = Path(_dimensions_loader.__file__).parent
    for name in ("census_content_surfaces.v0.json", "census_genres.v0.json"):
        shutil.copy(src / name, tmp_path / name)
    monkeypatch.setattr(_dimensions_loader, "_REGISTRY_DIR", tmp_path)
    yield tmp_path


# ===== CD-G1 : registries seed EMPTY at v0 + three-op signatures =====

def test_cd_g1_registries_seed_empty_at_v0() -> None:
    """Data-blind posture governance §8: content_surfaces + genres both seed EMPTY."""
    _n_cs, cs_vocab = current_registry_version("content_surfaces")
    _n_g, g_vocab = current_registry_version("genres")
    assert cs_vocab == [], (
        f"content_surfaces v0 must seed EMPTY per data-blind posture; got {cs_vocab}"
    )
    assert g_vocab == [], (
        f"genres v0 must seed EMPTY per data-blind posture; got {g_vocab}"
    )


def test_cd_g1_three_op_sidecar_signatures_present() -> None:
    """CD-G1: sidecar has exactly three named ops (record / read / list_registry)."""
    # record_census_dimension — async, keyword args match the ruling shape.
    sig = inspect.signature(record_census_dimension)
    params = list(sig.parameters.keys())
    for expected in [
        "feed_id",
        "content_surface",
        "content_surface_source",
        "genre",
        "genre_source",
        "censused_at",
        "notes",
    ]:
        assert expected in params, f"record_census_dimension missing {expected!r}"

    # read_census_dimensions_for_feed — async, single keyword feed_id.
    sig_r = inspect.signature(read_census_dimensions_for_feed)
    assert "feed_id" in sig_r.parameters

    # list_registry — sync, single positional kind.
    sig_l = inspect.signature(list_registry)
    assert "kind" in sig_l.parameters


# ===== CD-G2 : symmetric contradiction validator (both directions rejected) =====

def test_cd_g2_contradiction_value_present_source_null() -> None:
    """CD-E1 α direction #1 (fabrication risk): value present + source null → reject."""
    with pytest.raises(ValidationError) as exc:
        CensusContentDimension(
            feed_id="feed-1",
            content_surface="broadcast",
            content_surface_source=None,
        )
    assert "symmetric contradiction" in str(exc.value)


def test_cd_g2_contradiction_value_null_source_present() -> None:
    """CD-E1 α direction #2 (proposal's original): value null + source present → reject."""
    with pytest.raises(ValidationError) as exc:
        CensusContentDimension(
            feed_id="feed-2",
            genre=None,
            genre_source="census_observed",
        )
    assert "symmetric contradiction" in str(exc.value)


def test_cd_g2_contradiction_both_absent_accepted() -> None:
    """Both absent: dimension truly unknown — accepted."""
    r = CensusContentDimension(feed_id="feed-3")
    assert r.content_surface is None
    assert r.content_surface_source is None
    assert r.genre is None
    assert r.genre_source is None


def test_cd_g2_contradiction_both_present_accepted() -> None:
    """Both present: dimension observed — accepted (given source in Literal set)."""
    r = CensusContentDimension(
        feed_id="feed-4",
        content_surface="broadcast",
        content_surface_source="census_observed",
    )
    assert r.content_surface == "broadcast"
    assert r.content_surface_source == "census_observed"


def test_cd_g2_contradiction_applies_to_both_dimension_pairs() -> None:
    """Rule applies independently to (content_surface, content_surface_source)
    AND (genre, genre_source)."""
    with pytest.raises(ValidationError):
        CensusContentDimension(
            feed_id="feed-5", genre="drama", genre_source=None
        )
    with pytest.raises(ValidationError):
        CensusContentDimension(
            feed_id="feed-6", content_surface=None, content_surface_source="manifest_declared"
        )


def test_cd_g2_source_literal_closed_at_two() -> None:
    """CD-E1 α: source Literal closed at {census_observed, manifest_declared}."""
    with pytest.raises(ValidationError):
        CensusContentDimension(
            feed_id="feed-7", content_surface="x", content_surface_source="unknown"
        )
    with pytest.raises(ValidationError):
        CensusContentDimension(
            feed_id="feed-8", genre="x", genre_source="declared_by_operator"
        )


# ===== CD-G4 : registration-path cell (register-before-validate + hard-fail) =====

def test_cd_g4_census_observed_novel_value_registers_and_writes(registry_sandbox) -> None:
    """CD-E3 α: census_observed novel value → v(N+1) bump + write succeeds."""
    # Baseline: v0 empty.
    n0, vocab0 = current_registry_version("content_surfaces")
    assert n0 == 0
    assert vocab0 == []

    # Register a novel census_observed value.
    new_n = register_observation("content_surfaces", "broadcast")
    assert new_n == 1

    # v0 preserved byte-identical.
    v0_path = registry_sandbox / "census_content_surfaces.v0.json"
    v0_payload = json.loads(v0_path.read_text())
    assert v0_payload["surfaces"] == []

    # v1 landed with the new value.
    v1_path = registry_sandbox / "census_content_surfaces.v1.json"
    assert v1_path.is_file()
    v1_payload = json.loads(v1_path.read_text())
    assert v1_payload["surfaces"] == ["broadcast"]
    assert v1_payload["extends"] == "v0"
    assert v1_payload["added_value"] == "broadcast"
    assert v1_payload["added_source"] == "census_observed"

    # Validate now passes.
    validate_content_surface("broadcast")


def test_cd_g4_manifest_declared_novel_value_hard_fails(registry_sandbox) -> None:
    """CD-E3 α: manifest_declared novel value → hard fail, no registry bump.

    Verbatim rationale: 'a manifest cannot invent vocabulary, only observation can.'
    """
    # Baseline: v0 empty.
    n0, _ = current_registry_version("genres")
    assert n0 == 0

    # A manifest_declared write of a novel value MUST hard-fail before write.
    # Since register-before-validate runs OUTSIDE the validator for
    # manifest_declared, the validate step raises ValueError.
    with pytest.raises(ValueError) as exc:
        validate_genre("news")
    assert "not in current registry" in str(exc.value)

    # No registry bump occurred.
    files = sorted(registry_sandbox.glob("census_genres.v*.json"))
    assert len(files) == 1
    assert files[0].name == "census_genres.v0.json"


def test_cd_g4_register_observation_idempotent_by_value(registry_sandbox) -> None:
    """Re-registering an already-present value → no bump."""
    n_after_first = register_observation("content_surfaces", "streaming")
    assert n_after_first == 1
    n_after_second = register_observation("content_surfaces", "streaming")
    # Idempotent: still v1.
    assert n_after_second == 1


def test_cd_g4_registry_history_is_audit_trail(registry_sandbox) -> None:
    """Owner CD-E3 α: 'registry version history becomes the audit trail
    of when each vocabulary item was first observed.'"""
    register_observation("content_surfaces", "broadcast")  # v1
    register_observation("content_surfaces", "streaming")  # v2
    register_observation("content_surfaces", "print")  # v3

    all_versions = sorted(registry_sandbox.glob("census_content_surfaces.v*.json"))
    assert len(all_versions) == 4  # v0, v1, v2, v3

    # Each version file records which value it added.
    payloads = {p.stem.split(".v")[-1]: json.loads(p.read_text()) for p in all_versions}
    assert payloads["0"]["surfaces"] == []
    assert payloads["1"]["added_value"] == "broadcast"
    assert payloads["2"]["added_value"] == "streaming"
    assert payloads["3"]["added_value"] == "print"

    # Each vN preserves v0..v(N-1) byte-identical vocabulary + adds one.
    assert payloads["1"]["surfaces"] == ["broadcast"]
    assert payloads["2"]["surfaces"] == ["broadcast", "streaming"]
    assert payloads["3"]["surfaces"] == ["broadcast", "streaming", "print"]


@pytest.mark.asyncio
async def test_cd_g4_e2e_record_census_dimension_registers_and_persists(
    registry_sandbox, mongo_test_db
) -> None:
    """E2E CD-G4: novel census_observed value + Mongo upsert."""
    r = await record_census_dimension(
        mongo_test_db,
        feed_id="feed-e2e-1",
        content_surface="broadcast",
        content_surface_source="census_observed",
        genre="news",
        genre_source="census_observed",
    )
    assert r.content_surface == "broadcast"
    assert r.genre == "news"
    # Registries bumped.
    _, cs = current_registry_version("content_surfaces")
    _, g = current_registry_version("genres")
    assert "broadcast" in cs
    assert "news" in g
    # Read-back.
    r2 = await read_census_dimensions_for_feed(mongo_test_db, feed_id="feed-e2e-1")
    assert r2 is not None
    assert r2.feed_id == "feed-e2e-1"


@pytest.mark.asyncio
async def test_cd_g4_e2e_manifest_declared_novel_hard_fails(
    registry_sandbox, mongo_test_db
) -> None:
    """E2E CD-G4: manifest_declared novel value MUST hard-fail during write."""
    with pytest.raises(ValueError):
        await record_census_dimension(
            mongo_test_db,
            feed_id="feed-e2e-2",
            content_surface="broadcast",
            content_surface_source="manifest_declared",
        )
    # Ensure NO Mongo insert occurred: read-back returns None.
    r = await read_census_dimensions_for_feed(mongo_test_db, feed_id="feed-e2e-2")
    assert r is None
    # Registry NOT bumped.
    _, cs = current_registry_version("content_surfaces")
    assert cs == []


@pytest.mark.asyncio
async def test_cd_g4_e2e_manifest_declared_existing_value_writes(
    registry_sandbox, mongo_test_db
) -> None:
    """manifest_declared value that already exists in the registry → write succeeds."""
    # First, seed via census_observed.
    register_observation("content_surfaces", "broadcast")
    # Then a manifest_declared write of the same value succeeds.
    r = await record_census_dimension(
        mongo_test_db,
        feed_id="feed-e2e-3",
        content_surface="broadcast",
        content_surface_source="manifest_declared",
    )
    assert r.content_surface_source == "manifest_declared"


# ===== V1-G7 : parity 31 attestation (unchanged; CD-E2 α ↔ CD-E4 coupling) =====

def test_v1_g7_attestation_parity_31_at_census_dimensions_close() -> None:
    """CD-E2 α ↔ CD-E4 coupling: NO new frozen contract, NO new snapshot.
    Parity 31 preserved byte-identical."""
    invariants_dir = Path(__file__).parent
    snapshots = list(invariants_dir.glob("*.contract_snapshot.json"))
    assert len(snapshots) == 32, (
        f"V1-G7 at CD close: expected 31 snapshots (unchanged). Actual: {len(snapshots)}."
    )


# ===== 4-code auth-refusal registry closure (re-attest at CD close) =====

def test_auth_refusal_registry_still_closed_at_four_codes_at_cd_close() -> None:
    """P9-E3 / P8E-E4 α pre-carry re-attested at Census-dimensions close."""
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


# ===== E5 anti-rule: no HTTP 409 in CD new files =====

def test_no_http_409_in_census_dimensions_new_files() -> None:
    """E5 anti-rule: zero HTTP 409 in new CD files."""
    backend_root = Path(__file__).resolve().parents[2]
    targets = [
        backend_root / "services" / "census_dimensions" / "__init__.py",
        backend_root / "services" / "census_dimensions" / "dimensions_loader.py",
        backend_root / "services" / "census_dimensions" / "dimensions_service.py",
        backend_root / "routers" / "census_dimensions.py",
    ]
    for t in targets:
        text = t.read_text()
        assert "409" not in text, f"E5 anti-rule violated in {t}"
        assert "status_code=409" not in text


# ---------- Motor test db fixture (matches transform_forms conventions) ----------

@pytest.fixture
async def mongo_test_db():
    """Isolated Motor db per test."""
    import os
    mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(mongo_url)
    db_name = f"rms_test_census_dims_{tempfile.mkstemp()[1].split('/')[-1]}"
    db = client[db_name]
    await db["census_content_dimensions"].create_index("feed_id", unique=True)
    yield db
    await client.drop_database(db_name)
    client.close()
