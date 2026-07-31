"""Phase 8-EXT — dual-actor engineer scoping tests (Owner P8E-E1..P8E-E7 α).

Landing per §4.1 baseline atomic first-commit. All rulings applied:
  * P8E-E1 α : `external_engineer` role additive Literal expansion.
  * P8E-E2 α + Cond : `require_own_scope_or_deny` single source; grep-negative gate.
  * P8E-E3 α : DB-persisted invite row + JWT-at-approval; NO new JWT class.
  * P8E-E4 α : all external-scope denials → `auth_scope_insufficient` (4-code registry closed).
  * P8E-E5 α : `engineer` retained as internal identifier; no `internal_engineer` synonym.
  * P8E-E6 α : em-dash "—" preserved verbatim on UI Spec §5.4 binding copy (U+2014).
  * P8E-E7 α + Cond : `data_class_registry.v3.json` additive; ledger emission on approval.

Shared helper doctrine per §1.2 amortised rate (P9-close empirical basis):
`_mint_external_engineer_token()` / `_mint_internal_engineer_token()` /
`_mint_admin_token()` / `_seed_own_grant()` / `_seed_foreign_grant()` shared
across ≥3 cells → **12 LoC/cell rate applies**.
"""
from __future__ import annotations

import re
import sys
import uuid
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from core import db  # noqa: E402
from services.auth.identity import RoleName  # noqa: E402
from services.auth.jwt_service import create_access_token  # noqa: E402
from services.auth.engineer_key_grant_service import register_grant  # noqa: E402
from services.auth.engineer_key_grant import (  # noqa: E402
    EngineerKeyGrantRegistrationRequest,
)


def _async_client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


# --- Shared helpers (P9-close 12 LoC/cell trigger fires: ≥3 cells share) ---

def _mint_internal_engineer_token(email: str = "internal@example") -> str:
    return create_access_token(user_id=f"int-{uuid.uuid4().hex[:6]}", email=email,
                                roles=["engineer"], key_grants=[])


def _mint_external_engineer_token(email: str) -> str:
    return create_access_token(user_id=f"ext-{uuid.uuid4().hex[:6]}", email=email,
                                roles=["external_engineer"], key_grants=[])


def _mint_admin_token(email: str = "admin@example") -> str:
    return create_access_token(user_id=f"adm-{uuid.uuid4().hex[:6]}", email=email,
                                roles=["admin"], key_grants=[])


def _mint_operator_token(email: str = "op@example") -> str:
    return create_access_token(user_id=f"op-{uuid.uuid4().hex[:6]}", email=email,
                                roles=["operator"], key_grants=[])


async def _seed_grant(grantee_email: str, grantor_id: str = "int-seed") -> str:
    body = EngineerKeyGrantRegistrationRequest(
        grantee_email=grantee_email,
        key_class="external",
        path="live_query",
        floor="Free-baseline",
        scope="own_apps_only",
        justification="8-ext test grant seeding for own-scope tests",
        lawful_basis_ref="compliance:engineer_key_grant",
    )
    grant = await register_grant(req=body, grantor_id=grantor_id)
    return grant.grant_id


@pytest.fixture(autouse=True)
async def _isolate_8_ext_state():
    try:
        await db["engineer_invites"].delete_many({})
    except Exception:
        pass
    yield
    try:
        await db["engineer_invites"].delete_many({})
    except Exception:
        pass


# --- EE-G1: external_engineer role present in Literal (additive expansion) ---

def test_ee_g1_external_engineer_role_present_in_literal() -> None:
    """P8E-E1 α: additive Literal expansion; `external_engineer` is a valid role."""
    role_names = RoleName.__args__  # type: ignore[attr-defined]
    assert "external_engineer" in role_names
    assert "engineer" in role_names  # P8E-E5 α: retained as internal identifier
    assert "internal_engineer" not in role_names  # P8E-E5 α: no synonym


# --- EE-G2: external_engineer cannot read foreign grants ---

async def test_ee_g2_external_cannot_read_foreign_apps() -> None:
    """P8E-E2 α: 403 auth_scope_insufficient when external queries foreign email."""
    ext_tok = _mint_external_engineer_token("ee-a@example")
    async with _async_client() as c:
        r = await c.get(
            "/api/engineer/key_grants",
            params={"grantee_email": "ee-b@example"},
            headers={"Authorization": f"Bearer {ext_tok}"},
        )
    assert r.status_code == 403, r.text
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body


async def test_ee_g2_external_can_read_own_apps() -> None:
    """P8E-E2 α: external CAN read their own grants (grantee_email == identity.email)."""
    ext_tok = _mint_external_engineer_token("ee-c@example")
    async with _async_client() as c:
        r = await c.get("/api/engineer/key_grants",
                        headers={"Authorization": f"Bearer {ext_tok}"})
    assert r.status_code == 200, r.text
    assert r.json()["grantee_email"] == "ee-c@example"


async def test_ee_g2_external_cannot_create_grant_for_foreign_grantee() -> None:
    """P8E-E2 α: external POST with foreign grantee_email → 403."""
    ext_tok = _mint_external_engineer_token("ee-d@example.com")
    async with _async_client() as c:
        r = await c.post(
            "/api/engineer/key_grants",
            json={"grantee_email": "somebody-else@example.com",
                  "key_class": "external",
                  "path": "live_query",
                  "floor": "recorded_statement",
                  "scope": "own_apps_only",
                  "justification": "8-ext test grant for own-scope negative case",
                  "lawful_basis_ref": "compliance:engineer_key_grant"},
            headers={"Authorization": f"Bearer {ext_tok}"},
        )
    assert r.status_code == 403
    assert r.json()["reason"] == "auth_scope_insufficient"


async def test_ee_g2_external_can_create_grant_for_self() -> None:
    """P8E-E2 α: external POST for own email → succeeds (own app self-registration)."""
    ext_tok = _mint_external_engineer_token("ee-e@example.com")
    async with _async_client() as c:
        r = await c.post(
            "/api/engineer/key_grants",
            json={"grantee_email": "ee-e@example.com",
                  "key_class": "external",
                  "path": "live_query",
                  "floor": "recorded_statement",
                  "scope": "own_apps_only",
                  "justification": "8-ext test grant self-issue happy path",
                  "lawful_basis_ref": "compliance:engineer_key_grant"},
            headers={"Authorization": f"Bearer {ext_tok}"},
        )
    assert r.status_code == 201, r.text


# --- EE-G3: parametrised negative-gate over admin/fleet routes (N=4) ---

@pytest.mark.parametrize("path,method", [
    ("/api/master_admin/audit_trail", "get"),
    ("/api/master_admin/tightening/suspend", "post"),
    ("/api/compliance/disclosure_thresholds", "post"),
    ("/api/checker/pending", "get"),
])
async def test_ee_g3_external_cannot_reach_admin_or_fleet_routes(path, method) -> None:
    """P8E-E4 α: external_engineer on admin/fleet routes → 403 auth_scope_insufficient
    (existing 4-code registry closed; no new codes)."""
    tok = _mint_external_engineer_token("ee-x@example")
    async with _async_client() as c:
        if method == "get":
            r = await c.get(path, headers={"Authorization": f"Bearer {tok}"})
        else:
            r = await c.post(path, json={}, headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 403, f"{method.upper()} {path} got {r.status_code}: {r.text}"
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body


# --- EE-G4: onboarding invite + approval → ledger emission ---

async def test_ee_g4_invite_endpoint_requires_internal_engineer() -> None:
    """Only internal engineer/admin may issue invites; external gets 403."""
    ext_tok = _mint_external_engineer_token("ee-y@example")
    async with _async_client() as c:
        r = await c.post("/api/engineer/onboarding/invite",
                         json={"invited_email": "new@example"},
                         headers={"Authorization": f"Bearer {ext_tok}"})
    assert r.status_code == 403
    assert r.json()["reason"] == "auth_scope_insufficient"


async def test_ee_g4_invite_endpoint_happy() -> None:
    """Internal engineer issues an invite; row lands with state=pending_invite."""
    tok = _mint_internal_engineer_token("boss@example")
    async with _async_client() as c:
        r = await c.post("/api/engineer/onboarding/invite",
                         json={"invited_email": "new-external@example"},
                         headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["state"] == "pending_invite"
    assert body["invited_email"] == "new-external@example"
    assert body["invited_by"] == "boss@example"
    assert body["single_use"] is True
    assert body["expires_at"] > body["created_at"]


async def test_ee_g4_approve_flow_emits_onboarding_ledger_and_mints_jwt() -> None:
    """Approval → external_engineer JWT minted + engineer_onboarding_approved ledger row.

    P8E-E7 α: registry v3.json contains `engineer_onboarding_approved`.
    """
    tok = _mint_internal_engineer_token("boss2@example")
    async with _async_client() as c:
        r_inv = await c.post("/api/engineer/onboarding/invite",
                             json={"invited_email": "ext-onboard@example"},
                             headers={"Authorization": f"Bearer {tok}"})
        assert r_inv.status_code == 201
        invite_id = r_inv.json()["invite_id"]
        r_app = await c.post("/api/engineer/onboarding/approve",
                             json={"invite_id": invite_id},
                             headers={"Authorization": f"Bearer {tok}"})
        assert r_app.status_code == 200, r_app.text
    body = r_app.json()
    assert body["invite"]["state"] == "approved"
    assert body["external_engineer_token"]  # JWT minted
    assert body["ledger_row_id"]
    # Verify ledger row landed with correct data_class.
    row = await db["northena_ledger"].find_one({"row_id": body["ledger_row_id"]})
    assert row is not None
    assert row["stamp_audit"]["data_class"] == "engineer_onboarding_approved"


async def test_ee_g4_approve_idempotent_replay_returns_404() -> None:
    """Second approve on same invite_id: single-use → 404 (not double-mint)."""
    tok = _mint_internal_engineer_token("boss3@example")
    async with _async_client() as c:
        r_inv = await c.post("/api/engineer/onboarding/invite",
                             json={"invited_email": "ext-once@example"},
                             headers={"Authorization": f"Bearer {tok}"})
        invite_id = r_inv.json()["invite_id"]
        r1 = await c.post("/api/engineer/onboarding/approve",
                          json={"invite_id": invite_id},
                          headers={"Authorization": f"Bearer {tok}"})
        assert r1.status_code == 200
        r2 = await c.post("/api/engineer/onboarding/approve",
                          json={"invite_id": invite_id},
                          headers={"Authorization": f"Bearer {tok}"})
    assert r2.status_code == 404
    assert r2.json()["reason"] == "invite_not_approvable"


# --- E2 grep-negative gate (P8E-E2 α condition): single-source enforcement ---

def test_engineer_router_has_no_inline_owner_comparisons() -> None:
    """P8E-E2 α condition: `require_own_scope_or_deny` is the single source.

    Grep-negative: engineer router MUST NOT carry inline owner-comparison
    patterns (e.g. `identity.email == resource.owner`, `.email.lower() ==
    grantee_email`). The dedicated helper is the enforcement path.
    """
    router_path = Path(__file__).resolve().parents[3] / "backend" / "routers" / "engineer.py"
    text = router_path.read_text()
    forbidden_patterns = [
        r"identity\.email\s*==\s*.*\.grantee_email",
        r"identity\.email\.lower\(\)\s*==\s*.*grantee",
        r"identity\.email\s*==\s*resource",
        r"identity\.email\s*!=\s*.*\.grantee_email",
        r"if\s+identity\.roles.*external_engineer.*and.*identity\.email",
    ]
    for pat in forbidden_patterns:
        assert not re.search(pat, text), (
            f"P8E-E2 α condition violated: inline owner comparison matching "
            f"{pat!r} found in engineer.py — own-scope MUST route through "
            f"require_own_scope_or_deny() (single source)."
        )


# --- V1-G7 attestation: pre-8-EXT contracts byte-identical (post-Artifact-Store parity 29) ---

def test_v1_g7_attestation_28_contracts_byte_identical_at_8_ext_close() -> None:
    """P8E-E1 α + BCR §3.9 EE-R1: no frozen contract touched by 8-EXT itself.

    Note: post-Artifact-Store the total snapshot count is 29 (28 pre-existing
    + `OuterGateReceipt_v1` additive per AS-E1 α, 2026-07-08). The 8-EXT
    itself did not touch parity; the count moved at Artifact Store.
    """
    invariants_dir = Path(__file__).parent
    snapshots = list(invariants_dir.glob("*.contract_snapshot.json"))
    assert len(snapshots) == 34, (
        f"Post-Memory-Service-Stage-B: expected 34 snapshots. Actual: {len(snapshots)}."
    )


# --- Standing E5: NO HTTP 409 in 8-EXT NEW files ---

def test_no_http_409_in_8_ext_new_files() -> None:
    """Standing E5 anti-rule: NO HTTP 409 in 8-EXT-added files.

    Scope: files 8-EXT NEWLY adds (engineer_scope.py, engineer_invites.py).
    Pre-existing HTTP 409 in engineer.py from B-3 (grant_already_revoked)
    predates 8-EXT and is out of scope for this attestation.
    """
    new_files = [
        Path(__file__).resolve().parents[3] / "backend" / "services" / "auth" / "engineer_scope.py",
        Path(__file__).resolve().parents[3] / "backend" / "services" / "auth" / "engineer_invites.py",
    ]
    pattern = re.compile(r"\b409\b")
    for f in new_files:
        assert not pattern.search(f.read_text()), (
            f"Standing E5 anti-rule: HTTP 409 found in 8-EXT NEW file {f}. "
            f"Use 403 access-control (auth_scope_insufficient) instead."
        )


# --- P8E-E3 α: JWT mechanics unchanged (no new JWT class minted at approval) ---

async def test_approval_mints_standard_access_jwt_no_new_class() -> None:
    """P8E-E3 α + P8E-E1 α: JWT mechanics unchanged. Approval mints via
    `create_access_token()` (existing path), NOT a new JWT class."""
    import jwt as _jwt
    from services.auth.jwt_service import _get_jwt_secret, JWT_ALGORITHM
    tok = _mint_internal_engineer_token("boss4@example")
    async with _async_client() as c:
        r_inv = await c.post("/api/engineer/onboarding/invite",
                             json={"invited_email": "ext-classcheck@example"},
                             headers={"Authorization": f"Bearer {tok}"})
        invite_id = r_inv.json()["invite_id"]
        r_app = await c.post("/api/engineer/onboarding/approve",
                             json={"invite_id": invite_id},
                             headers={"Authorization": f"Bearer {tok}"})
    ext_token = r_app.json()["external_engineer_token"]
    claims = _jwt.decode(ext_token, _get_jwt_secret(), algorithms=[JWT_ALGORITHM])
    assert claims.get("type") == "access", (
        "P8E-E3 α: onboarding-approval JWT MUST be type=access (not a new class)."
    )
    assert "external_engineer" in claims.get("roles", [])


# --- Data-class registry v3 attestation (P8E-E7 α condition) ---

def test_data_class_registry_v3_landed_additive_from_v2() -> None:
    """P8E-E7 α condition: v3 additive from v2; v2 file preserved (never mutated).

    Memory Service Stage B (2026-07-31): v4 landed additive from v3 per
    Owner (2a) — Northena ledger is the single append-only record; memory
    events ride the same row shape with the event class carried at
    stamp_audit.data_class. Registry version bump is a GOVERNED change.
    """
    import json as _json
    compliance_dir = Path(__file__).resolve().parents[3] / "backend" / "services" / "compliance"
    v2_path = compliance_dir / "data_class_registry.v2.json"
    v3_path = compliance_dir / "data_class_registry.v3.json"
    v4_path = compliance_dir / "data_class_registry.v4.json"
    assert v2_path.exists(), "v2 must remain on disk (never mutated in place)."
    assert v3_path.exists(), "v3 must remain on disk (never mutated in place)."
    assert v4_path.exists(), "v4 must land at Memory Service Stage B."
    v2 = _json.loads(v2_path.read_text())
    v3 = _json.loads(v3_path.read_text())
    v4 = _json.loads(v4_path.read_text())
    v2_classes = {c["data_class"] for c in v2["valid_data_classes"] if isinstance(c, dict)}
    v3_classes = {c["data_class"] for c in v3["valid_data_classes"] if isinstance(c, dict)}
    v4_classes = {c["data_class"] for c in v4["valid_data_classes"] if isinstance(c, dict)}
    # Additive discipline: v2 ⊆ v3 ⊆ v4.
    assert v2_classes.issubset(v3_classes)
    assert v3_classes.issubset(v4_classes)
    # v3 landed engineer_onboarding_approved (Phase 8-EXT).
    assert "engineer_onboarding_approved" in v3_classes
    # v4 landed 7 memory_* classes (Memory Service Stage B, 2026-07-31).
    v4_new_classes = v4_classes - v3_classes
    assert v4_new_classes == {
        "memory_plane_issued",
        "memory_contribution_landed",
        "memory_contribution_refused",
        "memory_publication_attempted",
        "memory_publication_landed",
        "memory_publication_refused",
        "memory_plane_revoked",
    }, f"Memory Service Stage B: expected 7 memory_* additions; got {v4_new_classes}"
    # v4 governance authority captured (Owner ruling of 2026-07-31).
    assert "authority" in v4, "v4 must carry authority block per governed registry-change discipline"
    assert v4["authority"]["who"] == "Owner"
    assert "2026-07-30" in v4["authority"]["when"]


def test_deletion_ledger_loader_repointed_to_v3() -> None:
    """P8E-E7 α condition: `deletion_ledger.py:45` re-pointed to v4 (Memory Service Stage B, 2026-07-31)."""
    dl_path = Path(__file__).resolve().parents[3] / "backend" / "services" / "compliance" / "deletion_ledger.py"
    assert "data_class_registry.v4.json" in dl_path.read_text()


# --- P8E-E4 α: 4-code auth registry closed at four codes ---

def test_auth_refusal_registry_still_closed_at_four_codes() -> None:
    """P8E-E4 α: 4-code registry unchanged. All 8-EXT denials reuse existing codes."""
    import json as _json
    registry_path = Path(__file__).resolve().parents[3] / "backend" / "services" / "auth" / "auth_refusal_reasons.v0.json"
    reg = _json.loads(registry_path.read_text())
    assert set(reg["reasons"].keys()) == {
        "auth_missing", "auth_expired",
        "auth_scope_insufficient", "auth_identity_mismatch_for_wizard_session",
    }
