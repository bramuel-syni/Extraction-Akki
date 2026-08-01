"""Phase 8 Stage B-3 Second Commit — E4 Engineer key-grant registration record.

**Status:** UNFROZEN Pydantic runtime record awaiting Owner D4b ruling.

Owner E4 dispatch steer (Phase 8 Stage A):
    "Grant schema as Pydantic runtime record at B-3 open; freeze-or-not
     (D4b) argued against ACTUAL wire exposure once the Engineer §4
     surface exists to expose it."

This module carries the runtime shape for the Engineer §4 surface's
key-grant registration request/response. The shape is NOT snapshotted
under `tests/invariants/` at B-3 open — Owner rules D4b in-flight after
inspecting the wire exposure documented below.

If D4b lands FREEZE → this file grows a `.contract_snapshot.json`
neighbour at `tests/invariants/engineer_key_grant.contract_snapshot.json`
and joins the mechanical parity map (26 → 27). If D4b lands
UNFROZEN → this file stays as a versioned service-layer Pydantic
record (Ruling 3 posture), extensible via v1/v2/... additions with no
snapshot bijection requirement.

Wire exposure (per Owner E4 D4b argument condition):
--------------------------------------------------------------------
Endpoint 1 — POST /api/engineer/key_grants
    Request body (EngineerKeyGrantRegistration):
        - grantee_email: EmailStr — the identity receiving the grant
        - key_class: Literal["internal", "external"] — §4.1 dichotomy
        - path: Literal["live_query", "governed_extract"] — §4.1 dichotomy
        - floor: DefensibilityFloor.minimum_class — least-restrictive class
        - scope: str — free-form estate identifier
        - justification: str (min_length=8) — audit trail requirement
        - lawful_basis_ref: str — points to a lawful-basis config entry
    Response body (EngineerKeyGrantRegistration + envelope-visible confirmation):
        - grant_id: deterministic identifier (SHA-256 short of the tuple)
        - registered_at: ISO timestamp
        - grantor_id: engineer who registered it
        - scope_check_preview: ScopeCheckResult against a synthetic sample
          (dry-run verification — proves grant can be enforced server-side)

Endpoint 2 — GET /api/engineer/key_grants/{grantee_id}
    Response body (List[EngineerKeyGrantRegistration]) with:
        - all currently-issued grants for the grantee
        - audit-trail fields (grantor_id, registered_at, justification)
    Used by Engineer §4 UI to render the grants panel per §4.1.

Endpoint 3 — POST /api/engineer/key_grants/{grant_id}/revoke
    Request body (EngineerKeyGrantRevocation):
        - reason: str (min_length=8) — audit trail requirement
    Response body (EngineerKeyGrantRegistration with revoked_at populated).
    Grant becomes ineligible for `check_scope(...)` matching immediately
    upon persistence.

Grant-verification surface (envelope-visible per Owner E1 posture):
--------------------------------------------------------------------
Every governed endpoint that runs `check_scope(...)` includes
`scope_check_outcome` in its response envelope where governance
policy allows (e.g., successful dispatches carry the matched
grant_id; scope-insufficient refusals carry the mismatch reason via
auth_refusal.emit("auth_scope_insufficient")). This module's
registration record is the source-of-truth for what a grant looks
like BEFORE it is verified.

D4b argument scaffolding (for Owner ruling, this is NOT a decision):
--------------------------------------------------------------------
FOR freezing (26 → 27):
  1. GOVERNANCE-LOAD-BEARING: a grant is a governed grant of access;
     its shape is the audit trail. If the shape drifts, prior audits
     become non-verifiable. Freezing the shape makes historical grant
     records replay-verifiable indefinitely — parity with
     NorthenaLedgerRow @v0/v1 which freezes the ledger's audit shape.
  2. FEDERATION-FORWARD: Owner E1 posture is "federation-forward" —
     when OAuth mints grants via a downstream adapter, those grants
     re-materialise into the same Pydantic shape. Freezing pins the
     inter-adapter contract; unfrozen means adapters may drift.
  3. WIRE EXPOSURE IS PUBLIC: the Engineer §4 UI + third-party
     integrations (D4b scope) both call this shape by name.
     Frozen-shape parity with `KeyGrant` (in `identity.py`, which is
     itself unfrozen but structurally minimal) — but E4-flavored
     grants carry more audit fields (grantee_email, justification,
     lawful_basis_ref) that are exactly the fields an audit chain
     needs to be replay-verifiable.

AGAINST freezing (stay 26):
  1. NOT-YET-LEARNED-RANGES: v3 §4 doesn't narrow the enum of
     lawful_basis_ref values or justification length or the audit-trail
     shape. Under Standing Disposition `Loose-as-frozen`, freezing a
     shape with unratified narrowings is fabrication. Freeze permissively
     now → in-place narrowing later is HAZARD-STOP (a).
  2. CONTROL SURFACE POSTURE (Ruling 3): key-grant PROVISIONING is a
     control-surface act (config bump), not a data-shape freeze. The
     `qualification_matrix` + `feasibility-config@vN` precedent applies:
     shape freezes ONLY where a mutation would break replay; provisioning
     surfaces version through append-only registries.
  3. GRANT LIFECYCLE FIELDS UNKNOWN: revocation, temporal validity
     (issued_at, expires_at, renewed_at), delegation (can-delegate flag,
     delegation_chain), grant-scoping (per-endpoint, per-artifact) —
     none of these are ratified at B-3 open. Freezing now locks in a
     shape without these lifecycle fields; adding them later requires
     v1 file addition. Cf. AsyncDeliveryAccepted@v0 → @v1 precedent.
  4. MECHANICAL PARITY BAR: adding one contract at B-3 has downstream
     invariant costs — snapshot bijection, byte-identity regression
     across all 26 prior contracts, mechanical parity 26 → 27, count
     invariant bumped, Rule 2 accounting revised for B-3 sub-stage.
     Owner has repeatedly ratified: freeze only where mutation is a
     replay-breaking hazard, never where extension will land later
     (Ruling 2 precedent).

Recommendation (agent, NOT a ruling):
--------------------------------------------------------------------
STAY UNFROZEN AT B-3 (parity 26 held). Reasoning:
  - Lifecycle fields (temporal validity, delegation, revocation
    semantics) are unratified. Freezing at B-3 is likely to invite a
    v1 file at B-4/B-5 anyway — v0 shape becomes byte-identical
    baggage. Ruling 2 (`Frozen-field-changes-as-new-versions`) makes
    this cheap but not free.
  - Owner's Loose-as-frozen ruling explicitly says: freeze permissively
    per v0-precedent-anchored default; narrowing lands as new versions.
    Freezing prematurely narrows the auth-audit shape without an
    audit-chain replay-hazard event to anchor the narrowing.
  - The AUDIT CHAIN itself lives in `NorthenaLedgerRow_v1` (contract
    19), which IS frozen. The grant record can be persisted as an
    additional structural field on a ledger row (or as a sidecar
    Mongo collection) without freezing the grant record shape — the
    ledger row's frozen shape carries the audit-replay invariant.

**Owner rules D4b before any Engineer §4 UI wire-up happens** — this
module is the pre-wire artifact for the argument.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Ordered least-restrictive → most-restrictive. Cf.
# services/auth/key_grants.py::_FLOOR_ORDER — this module re-cites the
# vocabulary from a single source (key_grants.py) at runtime; the
# Literal here mirrors the standard for the wire-shape gate. If D4b
# lands FREEZE, this Literal narrowing is exactly what Ruling 2 warns
# against — moving it to a versioned config would be the pre-freeze
# hardening.
FloorClass = Literal["utterance", "recorded_statement", "established_fact"]


class EngineerKeyGrantRegistration(BaseModel):
    """A grant of key-scope access, provisioned by an Engineer.

    Rendered on UI Spec §4.1 Grants panel. Verified server-side per
    call by `services.auth.key_grants.check_scope(...)`; on match,
    the `grant_id` surfaces in `ScopeCheckResult.matched_grant_id`
    (envelope-visible per Owner E1 condition).

    RUNTIME RECORD (UNFROZEN AT B-3). D4b ruling in flight.
    """

    model_config = ConfigDict(extra="forbid")

    # Identity + audit trail
    grant_id: str = Field(
        ...,
        description=(
            "Deterministic grant identifier — SHA-256 short of "
            "(grantee_id, key_class, path, floor, scope, issued_at)."
        ),
    )
    grantee_email: EmailStr = Field(
        ..., description="Lowercased email of the identity receiving the grant."
    )
    grantor_id: str = Field(
        ...,
        description=(
            "user_id of the Engineer who registered this grant. "
            "Required for audit-trail replay."
        ),
    )

    # Scope tuple (mirrors services.auth.identity.KeyGrant + adds audit fields)
    key_class: Literal["internal", "external"] = Field(
        ..., description="UI Spec §4.1 class dichotomy."
    )
    path: Literal["live_query", "governed_extract"] = Field(
        ..., description="UI Spec §4.1 path dichotomy."
    )
    floor: FloorClass = Field(
        ...,
        description=(
            "DefensibilityFloor.minimum_class — least-restrictive class "
            "satisfying the grant. Class comparison via `_floor_meets`."
        ),
    )
    scope: str = Field(
        ...,
        min_length=1,
        description="Free-form estate scope identifier; matched exact by check_scope.",
    )

    # Audit-required fields (net-new vs. `KeyGrant`)
    justification: str = Field(
        ...,
        min_length=8,
        description=(
            "Free-text audit justification for issuing this grant. "
            "Non-empty is a load-bearing gate — replay auditability."
        ),
    )
    lawful_basis_ref: str = Field(
        ...,
        min_length=1,
        description=(
            "Reference to a lawful-basis registry entry. "
            "Cf. Northena ledger `lawful_basis_ref` pattern (Phase 5b)."
        ),
    )

    # Lifecycle fields (UNFROZEN at B-3; ADDITIVE only if D4b lands UNFROZEN)
    issued_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="When the grant was minted.",
    )
    revoked_at: Optional[datetime] = Field(
        default=None,
        description="Populated when revoke endpoint fires; before then, None.",
    )
    revocation_reason: Optional[str] = Field(
        default=None,
        description="Free-text audit reason for revocation; required at revoke time.",
    )
    # Tenancy sidecar (additive · D4b lifecycle-tolerance permits · UI-1-E iter23
    # remediation 2026-08-02): older seeded fixtures and multi-instance test
    # runs wrote an `instance_id` sidecar onto grant docs. The load-bearing
    # wire-shape gate explicitly permits additive lifecycle fields (see
    # test_lifecycle_field_additions_do_not_break_the_gate). Rather than
    # rejecting the seeded corpus at load time, we admit the sidecar
    # explicitly so `extra='forbid'` still catches unknown fields.
    instance_id: Optional[str] = Field(
        default=None,
        description=(
            "Multi-tenant instance sidecar written by seed/test fixtures. "
            "Optional; not read by check_scope. Preserved on the wire for "
            "audit-trail replay."
        ),
    )


class EngineerKeyGrantRegistrationRequest(BaseModel):
    """POST /api/engineer/key_grants request body.

    Distinct from EngineerKeyGrantRegistration:
      - No grant_id (server mints deterministically).
      - No grantor_id (server reads from Authorization: Bearer).
      - No issued_at / revoked_at / revocation_reason (server-populated).
    """

    model_config = ConfigDict(extra="forbid")

    grantee_email: EmailStr
    key_class: Literal["internal", "external"]
    path: Literal["live_query", "governed_extract"]
    floor: FloorClass
    scope: str = Field(..., min_length=1)
    justification: str = Field(..., min_length=8)
    lawful_basis_ref: str = Field(..., min_length=1)


class EngineerKeyGrantRevocationRequest(BaseModel):
    """POST /api/engineer/key_grants/{grant_id}/revoke request body."""

    model_config = ConfigDict(extra="forbid")

    reason: str = Field(..., min_length=8, description="Audit trail requirement.")
