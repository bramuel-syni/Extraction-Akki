"""M-G-E2E · End-to-end engineer-key propagation gate (2026-07-31 verification fix).

Owner-ruled defect from independent verification (2026-07-31 cycle 3):
    "POST /api/engineer/key_grants persists to the engineer_key_grants
    collection but the grantee's users.key_grants array is never updated.
    Consequence: on next login the grantee's JWT carries key_grants: []
    and can never pass _has_memory_authority."

Fix landed per Owner's option (b) SINGLE-SOURCE derivation:
`engineer_key_grants` collection is the ONE store of grant truth
(EE-R4 no-parallel-mechanism verbatim). Identity resolution at login /
refresh derives active grants from the collection so there is exactly
one place to write, one place to read, no mirror to drift.

This suite exercises the full HTTP path (no in-process helpers) —
break-in style: every assertion demonstrates the enforcement works
at the wire seam, not just the unit boundary.
"""
from __future__ import annotations

import sys
import uuid
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from server import app  # noqa: E402
from core import db  # noqa: E402


def _client() -> AsyncClient:
    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest.fixture
async def admin_token():
    async with _client() as c:
        r = await c.post(
            "/api/auth/login",
            json={"email": "admin@rms.example.com", "password": "admin-b1-test-pw"},
        )
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


async def _register(email: str, password: str = "password-e2e-1234") -> tuple[str, str]:
    """Register a fresh user; return (user_id, access_token)."""
    async with _client() as c:
        r = await c.post(
            "/api/auth/register",
            json={"email": email, "password": password, "name": "E2E User"},
        )
    assert r.status_code == 201, r.text
    body = r.json()
    return body["identity"]["user_id"], body["access_token"]


async def _login(email: str, password: str = "password-e2e-1234") -> dict:
    async with _client() as c:
        r = await c.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


async def _grant(admin_tok: str, grantee_email: str, scope: str = "tenant-e2e") -> str:
    """Admin issues an engineer-key grant to grantee_email; return grant_id."""
    async with _client() as c:
        r = await c.post(
            "/api/engineer/key_grants",
            headers={"Authorization": f"Bearer {admin_tok}"},
            json={
                "grantee_email": grantee_email,
                "key_class": "external",
                "path": "live_query",
                "floor": "utterance",
                "scope": scope,
                "justification": "M-G-E2E propagation gate",
                "lawful_basis_ref": "lb:test:m_g_e2e",
            },
        )
    assert r.status_code == 201, r.text
    return r.json()["grant_id"]


async def _revoke(admin_tok: str, grant_id: str) -> None:
    async with _client() as c:
        r = await c.post(
            f"/api/engineer/key_grants/{grant_id}/revoke",
            headers={"Authorization": f"Bearer {admin_tok}"},
            json={"reason": "M-G-E2E revocation gate"},
        )
    assert r.status_code == 200, r.text


@pytest.fixture(autouse=True)
async def _cleanup():
    yield
    # Best-effort cleanup: kill any m-g-e2e users + grants + planes so
    # the suite is re-runnable without residue.
    try:
        await db.users.delete_many({"email": {"$regex": r"^m-g-e2e-"}})
    except Exception:
        pass
    try:
        await db["engineer_key_grants"].delete_many(
            {"grantee_email": {"$regex": r"^m-g-e2e-"}}
        )
    except Exception:
        pass
    try:
        await db["memory_planes"].delete_many({"tenant_id": "tenant-e2e"})
    except Exception:
        pass


# =============================================================================
# M-G-E2E-1 · Fresh user WITHOUT a grant is denied at the memory surface.
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_fresh_user_without_grant_denied_at_memory_surface():
    email = f"m-g-e2e-fresh-{uuid.uuid4().hex[:6]}@example.com"
    _, tok = await _register(email)
    async with _client() as c:
        r = await c.post(
            "/api/memory/planes",
            headers={"Authorization": f"Bearer {tok}"},
            json={"retrieval_scope": "any"},
        )
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    # Owner E2 taxonomy non-negotiable: no `outcome` key on auth denials.
    assert "outcome" not in body


# =============================================================================
# M-G-E2E-2 · After admin grant, user's next login carries the grant + can
# reach the memory surface via HTTP.
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_grant_propagates_to_next_login_and_unlocks_memory_surface(admin_token):
    email = f"m-g-e2e-grant-{uuid.uuid4().hex[:6]}@example.com"
    await _register(email)

    # Pre-grant: login carries no grants.
    login_pre = await _login(email)
    assert login_pre["identity"]["key_grants"] == []

    grant_id = await _grant(admin_token, email, scope="tenant-e2e")

    # Post-grant: login carries the grant with the correct scope-tuple.
    login_post = await _login(email)
    grants = login_post["identity"]["key_grants"]
    assert len(grants) == 1
    assert grants[0]["grant_id"] == grant_id
    assert grants[0]["scope"] == "tenant-e2e"
    assert grants[0]["path"] == "live_query"
    assert grants[0]["floor"] == "utterance"
    assert grants[0]["key_class"] == "external"

    tok = login_post["access_token"]

    # User creates a plane via HTTP under their own key.
    async with _client() as c:
        r = await c.post(
            "/api/memory/planes",
            headers={"Authorization": f"Bearer {tok}"},
            json={"retrieval_scope": "estate://e2e-user"},
        )
    assert r.status_code == 201, r.text
    plane = r.json()
    assert plane["issued_to_integration_key"] == grant_id
    assert plane["tenant_id"] == "tenant-e2e"


# =============================================================================
# M-G-E2E-3 · Cross-key HTTP break-in: engineer-key holder A cannot read
# plane owned by engineer-key holder B (BREAK-IN style: attempt the read,
# must fail to reach the state).
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_cross_key_holder_cannot_read_foreign_plane_via_http(admin_token):
    email_a = f"m-g-e2e-a-{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"m-g-e2e-b-{uuid.uuid4().hex[:6]}@example.com"
    await _register(email_a)
    await _register(email_b)
    await _grant(admin_token, email_a, scope="tenant-e2e")
    await _grant(admin_token, email_b, scope="tenant-e2e")

    login_a = await _login(email_a)
    login_b = await _login(email_b)
    tok_a = login_a["access_token"]
    tok_b = login_b["access_token"]

    # A creates a plane.
    async with _client() as c:
        r = await c.post(
            "/api/memory/planes",
            headers={"Authorization": f"Bearer {tok_a}"},
            json={"retrieval_scope": "estate://plane-a"},
        )
    assert r.status_code == 201, r.text
    plane_a = r.json()

    # Break-in: B attempts to GET plane A.
    async with _client() as c:
        r = await c.get(
            f"/api/memory/planes/{plane_a['plane_id']}",
            headers={"Authorization": f"Bearer {tok_b}"},
        )
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body  # auth denial ≠ governed refusal

    # Break-in: B attempts to CONTRIBUTE to plane A.
    async with _client() as c:
        r = await c.post(
            f"/api/memory/planes/{plane_a['plane_id']}/contribute",
            headers={"Authorization": f"Bearer {tok_b}"},
            json={
                "content_ref": "artifacts/attack",
                "five_ring_stamp": {
                    "content": {"text": "x"}, "provenance": {"source_ref": "s"},
                    "defensibility": {"class": "utterance"},
                    "context": {"n": "t"}, "re_extraction_handle": {"handle_id": "h"},
                },
                "class_declared": "utterance",
                "cited_sources": ["s"],
                "cited_source_classes": ["utterance"],
            },
        )
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body

    # Break-in: B attempts to REVOKE plane A.
    async with _client() as c:
        r = await c.post(
            f"/api/memory/planes/{plane_a['plane_id']}/revoke",
            headers={"Authorization": f"Bearer {tok_b}"},
            json={"reason": "attack"},
        )
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body


# =============================================================================
# M-G-E2E-4 · Admin full-scope read is SPEC-INTENDED (recorded decision,
# not accident): admin can read any plane; assert it explicitly.
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_admin_full_scope_read_is_intentional(admin_token):
    """Owner spec: admin/master_admin bypass plane-scope enforcement — this
    is a governed decision, not a bug. Recorded here as a positive gate.

    Rationale: admin/master_admin surfaces are the audit lane; without a
    full-scope read the audit lane cannot function. The audit is
    ledger-visible (memory_plane_issued row carries who issued the plane).
    """
    email = f"m-g-e2e-adminscope-{uuid.uuid4().hex[:6]}@example.com"
    await _register(email)
    await _grant(admin_token, email, scope="tenant-e2e")
    login = await _login(email)
    tok = login["access_token"]

    async with _client() as c:
        r = await c.post(
            "/api/memory/planes",
            headers={"Authorization": f"Bearer {tok}"},
            json={"retrieval_scope": "estate://plane-under-user"},
        )
    assert r.status_code == 201
    plane = r.json()

    # Admin reads user's plane — MUST succeed (spec-intended).
    async with _client() as c:
        r = await c.get(
            f"/api/memory/planes/{plane['plane_id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert r.status_code == 200
    assert r.json()["plane_id"] == plane["plane_id"]

    # Admin reads user's plane's reconstructed_state — MUST succeed.
    async with _client() as c:
        r = await c.get(
            f"/api/memory/planes/{plane['plane_id']}/reconstructed_state",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
    assert r.status_code == 200


# =============================================================================
# M-G-E2E-5 · Revocation propagates on next login — grant is removed from
# JWT and user loses memory-surface authority. Break-in: attempt to use
# grant after revocation (via a NEW login) must fail.
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_revocation_propagates_at_next_login(admin_token):
    email = f"m-g-e2e-revoke-{uuid.uuid4().hex[:6]}@example.com"
    await _register(email)
    grant_id = await _grant(admin_token, email, scope="tenant-e2e")

    # Pre-revocation login carries the grant.
    login1 = await _login(email)
    assert len(login1["identity"]["key_grants"]) == 1

    await _revoke(admin_token, grant_id)

    # Post-revocation login must NOT carry the grant.
    login2 = await _login(email)
    assert login2["identity"]["key_grants"] == []

    # Break-in: attempt to reach memory surface with the new token → 403.
    tok = login2["access_token"]
    async with _client() as c:
        r = await c.post(
            "/api/memory/planes",
            headers={"Authorization": f"Bearer {tok}"},
            json={"retrieval_scope": "any"},
        )
    assert r.status_code == 403
    body = r.json()
    assert body["reason"] == "auth_scope_insufficient"
    assert "outcome" not in body


# =============================================================================
# M-G-E2E-6 · /api/auth/refresh path also derives from single source.
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_refresh_path_also_single_source_derived(admin_token):
    email = f"m-g-e2e-refresh-{uuid.uuid4().hex[:6]}@example.com"
    await _register(email)
    login_pre = await _login(email)
    refresh_token = login_pre["refresh_token"]

    # Admin grants after login.
    grant_id = await _grant(admin_token, email, scope="tenant-e2e")

    # Refresh — must pick up the new grant.
    async with _client() as c:
        r = await c.post(
            "/api/auth/refresh",
            headers={"Authorization": f"Bearer {refresh_token}"},
        )
    assert r.status_code == 200, r.text
    body = r.json()
    grants = body["identity"]["key_grants"]
    assert len(grants) == 1
    assert grants[0]["grant_id"] == grant_id

    # Revocation propagates through refresh too.
    await _revoke(admin_token, grant_id)
    new_refresh = body["refresh_token"]
    async with _client() as c:
        r = await c.post(
            "/api/auth/refresh",
            headers={"Authorization": f"Bearer {new_refresh}"},
        )
    assert r.status_code == 200, r.text
    assert r.json()["identity"]["key_grants"] == []


# =============================================================================
# M-G-E2E-7 · Single-source-of-truth attest: engineer_key_grants collection
# is the ONE store; users.key_grants is vestigial + is NEVER read for auth.
# =============================================================================


@pytest.mark.asyncio
async def test_m_g_e2e_single_source_users_key_grants_never_read_for_auth(admin_token):
    """Break-in scenario: hand-write a rogue grant into users.key_grants
    (bypassing the engineer_key_grants collection). The rogue grant MUST
    NOT surface at login — the single-source derivation ignores the mirror.
    This is the EE-R4 no-parallel-mechanism gate proven at the wire seam.
    """
    email = f"m-g-e2e-mirror-{uuid.uuid4().hex[:6]}@example.com"
    await _register(email)

    # Rogue grant written directly to users.key_grants (mirror). This
    # simulates any accidental legacy code that writes to the vestigial
    # users.key_grants field. Single-source discipline says: ignore it.
    rogue = {
        "grant_id": "rogue-grant-must-be-ignored",
        "key_class": "external",
        "path": "live_query",
        "floor": "utterance",
        "scope": "rogue-scope",
    }
    await db.users.update_one({"email": email}, {"$set": {"key_grants": [rogue]}})

    # Login: JWT must carry NO grants (mirror ignored, collection empty).
    login = await _login(email)
    assert login["identity"]["key_grants"] == [], (
        "M-G-E2E-7 VIOLATED: users.key_grants mirror was read. Single-source "
        "derivation must read ONLY from engineer_key_grants collection."
    )
