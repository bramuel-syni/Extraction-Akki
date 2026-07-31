"""Publication ceremony — the governed plane-local → Registry-visible transition.

Owner ruling (2026-07-30 cycle 3, option (b)) verbatim:
    "Publication (plane-local → Registry-visible) is a SEPARATE governed act,
    never automatic."

Ceremony steps:
  1. Attempt event recorded to the ledger (memory_publication_attempted).
  2. Quality gate: PUBLICATION_QUALITY_THRESHOLD [SLOT] must be set. If
     unset (default), the attempt is refused loudly per SR-5.
  3. Rights gate: cited-sources count ≥ PUBLICATION_MIN_CITED_SOURCES [SLOT].
  4. On pass: memory_publication_landed emitted; contribution's
     rights_class widens to registry_visible.
  5. On fail: memory_publication_refused emitted with reason.

No automatic publication. No implicit widening. Every registry-visible
event is a distinct governed step recorded in the ledger.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict

from core import db
from services.memory import constants
from services.memory import ledger as memory_ledger
from services.memory.refusal import MemoryGovernedRefusal
from services.memory.scoped_accessor import (
    MEMORY_CONTRIBUTIONS_COLLECTION,
    ScopedAccessor,
)


def publication_quality_gate(*, quality_score: float | None = None) -> None:
    """Owner condition (c3): threshold is a [SLOT]. Unset → fail loud (SR-5).

    Args:
        quality_score: Optional quality score computed by an external analyzer.
                       When threshold is None, the gate fails regardless.
    """
    if not constants.publication_quality_threshold_is_set():
        raise MemoryGovernedRefusal(
            "publication_quality_threshold_unset",
            detail=(
                "PUBLICATION_QUALITY_THRESHOLD [SLOT] is unset. Publication "
                "refused loud per SR-5. Set the threshold via Owner ceremony "
                "before attempting publication."
            ),
        )
    threshold = constants.PUBLICATION_QUALITY_THRESHOLD
    if quality_score is None or quality_score < threshold:
        raise MemoryGovernedRefusal(
            "publication_gate_denied",
            detail=(
                f"quality_score={quality_score!r} < threshold={threshold!r}. "
                f"Publication refused."
            ),
        )


def publication_rights_gate(*, cited_source_count: int) -> None:
    """Rights gate: minimum cited-source count for publication eligibility."""
    minimum = constants.PUBLICATION_MIN_CITED_SOURCES
    if cited_source_count < minimum:
        raise MemoryGovernedRefusal(
            "publication_gate_denied",
            detail=(
                f"cited_source_count={cited_source_count} < minimum={minimum}. "
                f"Publication refused."
            ),
        )


async def attempt_publication(
    *,
    accessor: ScopedAccessor,
    contribution_id: str,
    actor: str,
    trace_id: str,
    quality_score: float | None = None,
) -> Dict[str, Any]:
    """Run the publication ceremony for a contribution.

    Returns the updated contribution doc on pass. Raises MemoryGovernedRefusal
    on any gate failure — the router translates to the governed envelope.
    """
    # Fetch via the scoped accessor — plane-isolation enforced.
    contribution = await accessor.get_contribution(contribution_id)
    if contribution is None:
        raise MemoryGovernedRefusal(
            "publication_gate_denied",
            detail=f"contribution_id={contribution_id!r} not found in plane {accessor.plane_id!r}.",
        )

    # Step 1: record attempt.
    await memory_ledger.emit_publication_event(
        event_class="memory_publication_attempted",
        plane_id=accessor.plane_id,
        contribution_id=contribution_id,
        tenant_id=accessor.tenant_id,
        actor=actor,
        trace_id=trace_id,
        extra={"attempted_at": datetime.now(timezone.utc).isoformat()},
    )

    # Step 2 + 3: run gates.
    try:
        publication_quality_gate(quality_score=quality_score)
        publication_rights_gate(
            cited_source_count=len(contribution.get("cited_sources", [])),
        )
    except MemoryGovernedRefusal as exc:
        await memory_ledger.emit_publication_event(
            event_class="memory_publication_refused",
            plane_id=accessor.plane_id,
            contribution_id=contribution_id,
            tenant_id=accessor.tenant_id,
            actor=actor,
            trace_id=trace_id,
            extra={"refusal_reason": exc.reason, "detail": exc.detail},
        )
        raise

    # Step 4: widen rights_class + intended_scope on the persisted doc.
    now_iso = datetime.now(timezone.utc).isoformat()
    registry_ref = f"registry:memory:{accessor.plane_id}:{contribution_id}"
    await db[MEMORY_CONTRIBUTIONS_COLLECTION].update_one(
        {
            "plane_id": accessor.plane_id,
            "tenant_id": accessor.tenant_id,
            "contribution_id": contribution_id,
        },
        {
            "$set": {
                "rights_class": "registry_visible",
                "intended_scope": "registry_publication",
                "published_at": now_iso,
                "registry_ref": registry_ref,
            }
        },
    )
    # Landed event.
    await memory_ledger.emit_publication_event(
        event_class="memory_publication_landed",
        plane_id=accessor.plane_id,
        contribution_id=contribution_id,
        tenant_id=accessor.tenant_id,
        actor=actor,
        trace_id=trace_id,
        extra={"published_at": now_iso, "registry_ref": registry_ref},
    )
    updated = await accessor.get_contribution(contribution_id)
    assert updated is not None
    return updated
