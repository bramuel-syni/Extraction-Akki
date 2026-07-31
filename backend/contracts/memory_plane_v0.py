"""MemoryPlane_v0 — frozen envelope for a memory plane.

Owner ruling (2026-07-30 cycle 3, option (b)) §condition (c2) verbatim:
    "write-back contract freeze-or-not argued on D4b — prior is FREEZE."

D4b argument (Stage A §3):
    - Environment-boundary crossing: YES (integration-key holder → platform).
    - Cross-language consumer likely: YES.
    - Additive path exists: YES (sibling-version bumps per BCR H5).
    - Rate of expected change: LOW (envelope is minimal).
    - Prior per D4b: FREEZE.

The plane is the memory identity for one integration key. It owns:
    - retrieval_scope: what registry/estate slice the key may read.
    - contribution_store_ref: where write-backs land (plane-local, per
      Integration Brief Part IV; plane isolation by construction via
      scoped_accessor).
    - working_set_ref: usage-proportional persistence surface (grows
      from observed use; references, not copies).

Plane isolation is a scoped-accessor property, NOT a schema property.
The schema records the plane's identity; the scoped_accessor enforces
that cross-plane reads are inexpressible.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class MemoryPlane_v0(BaseModel):
    """Memory Plane envelope — the one plane per integration key."""

    model_config = ConfigDict(extra="forbid")

    plane_id: str = Field(
        ...,
        min_length=1,
        description="Server-minted unique plane identifier (uuid-hex, prefix `mp-`).",
    )
    issued_to_integration_key: str = Field(
        ...,
        min_length=1,
        description="Integration key (or engineer key) this plane is bound to. Immutable.",
    )
    tenant_id: str = Field(
        ...,
        min_length=1,
        description="Multi-instance scope. Enforced by scoped_accessor at every read.",
    )
    retrieval_scope: str = Field(
        ...,
        description=(
            "The estate slice the plane may read (feed_id / grain filter / "
            "time window). Immutable after issue."
        ),
    )
    contribution_store_ref: str = Field(
        ...,
        description=(
            "Reference (URI-form) to the plane's contribution store partition. "
            "Plane-local; scoped_accessor enforces isolation by construction."
        ),
    )
    working_set_ref: str = Field(
        ...,
        description=(
            "Reference to the plane's working set (references, not copies). "
            "Grows from observed use per usage-proportional persistence rule."
        ),
    )
    state: Literal["active", "revoked"] = Field(
        default="active",
        description=(
            "Plane lifecycle state. Revocation freezes reads immediately "
            "(services/memory/revocation.py)."
        ),
    )
    issued_at: str = Field(
        ...,
        description="ISO-8601 UTC timestamp of plane issuance.",
    )
    revoked_at: Optional[str] = Field(
        default=None,
        description="ISO-8601 UTC timestamp of revocation, when applicable.",
    )
