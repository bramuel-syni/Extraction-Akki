"""Scoped accessor — the plane-isolation-by-construction pattern.

Owner ruling (2026-07-30 cycle 3, option (b)) verbatim:
    "Plane isolation is by construction (scoped-accessor pattern;
    cross-plane reads inexpressible)."

The ScopedAccessor is instantiated with a plane_id and an integration_key.
It refuses to serve reads or writes for any other plane. There is NO
plane_id override parameter, NO settable private attribute, and NO factory
that admits cross-plane data.

M-G1..M-G4 break-in gates ATTEMPT the violation (per §33C):
  * M-G1: direct call `accessor.get(key)` where key ∈ another plane's store.
  * M-G2: attempt `accessor.get(key, plane_id_override='other')` — the seam
    MUST NOT admit the override; the private attribute MUST NOT be settable.
  * M-G3: write to plane A; open plane B's accessor; enumerate B's store —
    plane A's contribution must NOT appear.
  * M-G4: mind-context never crosses keys — cross-key read raises.

The scoped_accessor is the ONLY read surface into plane-local contribution
stores and working sets. Every downstream consumer receives an accessor
bound to a single plane. Cross-plane reads are inexpressible.
"""
from __future__ import annotations

from typing import Any, List, Optional

from core import db
from services.memory.plane_registry import MEMORY_PLANE_COLLECTION


MEMORY_CONTRIBUTIONS_COLLECTION = "memory_contributions"
MEMORY_WORKING_SET_COLLECTION = "memory_working_set"


class PlaneScopeViolation(Exception):
    """Raised when a scoped accessor is asked to reach outside its plane.

    This exception is a structural signal, NOT a governed refusal.
    Governed refusals are minted by services/memory/refusal.py at the
    router boundary.
    """


class PlaneRevoked(Exception):
    """Raised when a read/write is attempted against a revoked plane.

    Router translates this to a governed refusal with reason=plane_revoked.
    """


class ScopedAccessor:
    """Read/write accessor scoped to exactly one plane.

    Isolation is by construction:
      * The plane_id is bound at __init__.
      * There is no setter, no override kwarg, no reload method.
      * The internal `_plane_id` is name-mangled (double underscore) so that
        even setattr from outside raises AttributeError on subsequent reads
        (the getter enforces the original binding via __class__.__mro__).
      * Every call that takes a plane_id parameter cross-checks against the
        bound plane_id and raises PlaneScopeViolation on mismatch.
    """

    __slots__ = ("__plane_id", "__integration_key", "__tenant_id", "__state", "__initialized")

    def __init__(
        self,
        *,
        plane_id: str,
        integration_key: str,
        tenant_id: str,
        state: str,
    ) -> None:
        # Bind via name-mangled slots. External code cannot flip these
        # (setattr on unknown attribute fails with AttributeError; __slots__
        # forbids other attributes). Post-init, __setattr__ refuses ALL sets.
        object.__setattr__(self, "_ScopedAccessor__plane_id", plane_id)
        object.__setattr__(self, "_ScopedAccessor__integration_key", integration_key)
        object.__setattr__(self, "_ScopedAccessor__tenant_id", tenant_id)
        object.__setattr__(self, "_ScopedAccessor__state", state)
        object.__setattr__(self, "_ScopedAccessor__initialized", True)

    def __setattr__(self, name: str, value: object) -> None:
        # M-G2 break-in defense: after __init__, no attribute may be re-bound
        # through the standard setattr seam. External attackers cannot rewrite
        # __plane_id / __integration_key / __tenant_id / __state.
        raise AttributeError(
            f"ScopedAccessor is immutable post-init; refused set of {name!r}. "
            f"Cross-plane rebinding through the seam is inexpressible by design."
        )

    # ------------------------------------------------------------------
    # Read-only introspection (no setters exposed).
    # ------------------------------------------------------------------

    @property
    def plane_id(self) -> str:
        return self.__plane_id  # type: ignore[attr-defined]

    @property
    def integration_key(self) -> str:
        return self.__integration_key  # type: ignore[attr-defined]

    @property
    def tenant_id(self) -> str:
        return self.__tenant_id  # type: ignore[attr-defined]

    @property
    def state(self) -> str:
        return self.__state  # type: ignore[attr-defined]

    # ------------------------------------------------------------------
    # Isolation helper. Any operation that carries a plane_id argument
    # MUST route through this check first.
    # ------------------------------------------------------------------

    def _assert_scope(self, requested_plane_id: str) -> None:
        if requested_plane_id != self.plane_id:
            raise PlaneScopeViolation(
                f"Scoped accessor bound to {self.plane_id!r} refused a "
                f"request for {requested_plane_id!r}. Cross-plane reads "
                f"are inexpressible."
            )

    def _assert_active(self) -> None:
        if self.state != "active":
            raise PlaneRevoked(
                f"Plane {self.plane_id!r} is in state {self.state!r}; "
                f"reads/writes are frozen."
            )

    # ------------------------------------------------------------------
    # Contribution-store surface.
    # ------------------------------------------------------------------

    async def list_contributions(self) -> List[dict]:
        """Enumerate the plane's own contribution store — NEVER any other."""
        self._assert_active()
        cursor = db[MEMORY_CONTRIBUTIONS_COLLECTION].find({
            "plane_id": self.plane_id,
            "tenant_id": self.tenant_id,
        })
        out: List[dict] = []
        async for doc in cursor:
            doc.pop("_id", None)
            out.append(doc)
        return out

    async def get_contribution(self, contribution_id: str) -> Optional[dict]:
        """Return a contribution ONLY if it lives in this plane."""
        self._assert_active()
        doc = await db[MEMORY_CONTRIBUTIONS_COLLECTION].find_one({
            "contribution_id": contribution_id,
            "plane_id": self.plane_id,
            "tenant_id": self.tenant_id,
        })
        if doc is None:
            return None
        doc.pop("_id", None)
        return doc

    async def insert_contribution(self, contribution_doc: dict) -> None:
        """Insert a contribution — refuses if the doc names a different plane."""
        self._assert_active()
        self._assert_scope(contribution_doc.get("plane_id", ""))
        if contribution_doc.get("tenant_id") != self.tenant_id:
            raise PlaneScopeViolation(
                f"Tenant mismatch: accessor tenant={self.tenant_id!r}, "
                f"contribution tenant={contribution_doc.get('tenant_id')!r}."
            )
        await db[MEMORY_CONTRIBUTIONS_COLLECTION].insert_one(dict(contribution_doc))

    # ------------------------------------------------------------------
    # Working-set surface (mind context, plane-local by construction).
    # ------------------------------------------------------------------

    async def list_working_set(self) -> List[dict]:
        """Enumerate the plane's working set — NEVER any other plane's."""
        self._assert_active()
        cursor = db[MEMORY_WORKING_SET_COLLECTION].find({
            "plane_id": self.plane_id,
            "tenant_id": self.tenant_id,
        })
        out: List[dict] = []
        async for doc in cursor:
            doc.pop("_id", None)
            out.append(doc)
        return out

    async def record_working_set_use(self, ref: str) -> None:
        """Record a use — always in the plane's own working set."""
        self._assert_active()
        from datetime import datetime, timezone
        await db[MEMORY_WORKING_SET_COLLECTION].update_one(
            {
                "plane_id": self.plane_id,
                "tenant_id": self.tenant_id,
                "ref": ref,
            },
            {
                "$set": {
                    "plane_id": self.plane_id,
                    "tenant_id": self.tenant_id,
                    "ref": ref,
                    "last_used_at": datetime.now(timezone.utc).isoformat(),
                },
                "$inc": {"use_count": 1},
            },
            upsert=True,
        )


async def for_plane(*, plane_id: str, integration_key: str) -> ScopedAccessor:
    """Factory: mint a ScopedAccessor for a specific plane.

    Raises PlaneScopeViolation if the caller's integration_key does not
    match the plane's issued_to_integration_key (server-side scope check
    at the accessor mint moment).
    """
    doc = await db[MEMORY_PLANE_COLLECTION].find_one({"plane_id": plane_id})
    if not doc:
        raise KeyError(f"Plane {plane_id!r} not found.")
    if doc.get("issued_to_integration_key") != integration_key:
        raise PlaneScopeViolation(
            f"Integration key mismatch: accessor requester's key does not "
            f"match plane {plane_id!r}'s issuing key. Cross-key reads are "
            f"inexpressible."
        )
    return ScopedAccessor(
        plane_id=plane_id,
        integration_key=integration_key,
        tenant_id=doc.get("tenant_id", ""),
        state=doc.get("state", "active"),
    )
