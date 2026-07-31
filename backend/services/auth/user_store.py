"""Phase 8 Stage B-1 — Motor async Mongo user store.

Backed by `db.users` collection (indexed unique on `email`). The
Identity model round-trips through `user_doc_to_identity(...)`; the
password_hash is stripped before Identity ever leaves this module.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId

from core import db

from .identity import Identity, KeyGrant
from .password_hash import hash_password, verify_password


async def ensure_indexes() -> None:
    """Create unique index on users.email (idempotent)."""
    await db.users.create_index("email", unique=True)


def user_doc_to_identity(doc: Dict[str, Any]) -> Identity:
    """Convert a Mongo user doc to an Identity. Strips password_hash.

    NOTE (2026-07-31 single-source fix): the `key_grants` field on the
    Mongo user doc is VESTIGIAL — it is retained only for backward
    compatibility with pre-2026-07-31 seeded users, and is never
    read for auth purposes. The authoritative store for key-grants is
    the `engineer_key_grants` collection (single-source per EE-R4).

    For a real auth flow, use `resolve_identity(doc)` instead of this
    helper directly — `resolve_identity` derives `key_grants` from the
    single-source collection at identity-resolution time.
    """
    return Identity(
        user_id=str(doc["_id"]),
        email=doc["email"],
        name=doc.get("name"),
        roles=list(doc.get("roles", []) or []),
        key_grants=[KeyGrant(**g) for g in (doc.get("key_grants") or [])],
        created_at=doc.get("created_at", datetime.now(timezone.utc)),
    )


async def resolve_identity(doc: Dict[str, Any]) -> Identity:
    """Async identity resolver — SINGLE-SOURCE grant derivation.

    Owner ruling 2026-07-31 cycle 3 verification fix: engineer_key_grants
    collection is the ONE store of grant truth (EE-R4 no-parallel-mechanism).
    This helper builds the base Identity from the user doc and OVERWRITES
    `key_grants` with the derivation from the collection.

    Revocation of a grant naturally takes effect on the next call to this
    function (typically at token issuance time — login or refresh).
    """
    from services.auth.engineer_key_grant_service import (
        resolve_active_grants_for_email,
    )
    base = user_doc_to_identity(doc)
    derived_grants = await resolve_active_grants_for_email(base.email)
    return base.model_copy(update={"key_grants": derived_grants})


async def get_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Fetch raw user doc by lowercased email (includes password_hash)."""
    return await db.users.find_one({"email": email.lower()})


async def get_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Fetch raw user doc by _id string."""
    try:
        return await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return None


async def create_user(
    email: str,
    password_plaintext: str,
    name: Optional[str] = None,
    roles: Optional[List[str]] = None,
    key_grants: Optional[List[KeyGrant]] = None,
) -> Identity:
    """Register a new user. Raises `ValueError` if email already exists."""
    email_norm = email.lower().strip()
    existing = await db.users.find_one({"email": email_norm})
    if existing is not None:
        raise ValueError(f"email_already_registered:{email_norm}")
    doc = {
        "email": email_norm,
        "password_hash": hash_password(password_plaintext),
        "name": name,
        "roles": list(roles or ["ask_console_user"]),
        "key_grants": [g.model_dump() for g in (key_grants or [])],
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    return user_doc_to_identity(doc)


async def authenticate(email: str, password_plaintext: str) -> Optional[Identity]:
    """Verify credentials. Returns Identity on success, None on failure.

    Single-source-of-truth (2026-07-31): derives `key_grants` from the
    `engineer_key_grants` collection at login time via `resolve_identity`.
    """
    doc = await get_by_email(email)
    if doc is None:
        return None
    if not verify_password(password_plaintext, doc.get("password_hash", "")):
        return None
    return await resolve_identity(doc)


async def seed_admin_if_absent(
    admin_email: str,
    admin_password: str,
) -> None:
    """Idempotent admin seed. Only creates; does NOT overwrite existing password."""
    email_norm = admin_email.lower().strip()
    existing = await db.users.find_one({"email": email_norm})
    if existing is not None:
        return
    await db.users.insert_one(
        {
            "email": email_norm,
            "password_hash": hash_password(admin_password),
            "name": "Admin (seeded)",
            "roles": ["admin", "operator", "engineer", "buyer", "master_admin", "dpo"],
            "key_grants": [
                {
                    "grant_id": "admin-seed-external-live-query-floor-utterance-scope-estate",
                    "key_class": "external",
                    "path": "live_query",
                    "floor": "utterance",
                    "scope": "estate",
                }
            ],
            "created_at": datetime.now(timezone.utc),
        }
    )
