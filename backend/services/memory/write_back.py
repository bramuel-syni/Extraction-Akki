"""Write-back — the plane's inbound edge.

Owner ruling (2026-07-30 cycle 3, option (b)) verbatim:
    "Contributions land in five-ring shape, class-capped at cited-source
    support, internal-only rights at birth, plane-local by default."

Every write is validated at admission:
  1. five-ring shape validated by MemoryWriteBack_v0 (Pydantic).
  2. class_declared ≤ max(cited_source classes) — enforced here.
  3. rights_class default = internal_only (widening requires publication).
  4. intended_scope default = mind_context_only (registry_publication is a
     separate governed ceremony).

Refusals raise MemoryGovernedRefusal with the appropriate reason code.
The router translates the exception into a governed refusal envelope
(services/memory/refusal.py::build_refusal_response). Auth denials are
handled separately by the auth taxonomy (Owner E2 non-negotiable).
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Dict, List

from contracts.memory_write_back_v0 import MemoryWriteBack_v0
from services.memory import ledger as memory_ledger
from services.memory.refusal import MemoryGovernedRefusal
from services.memory.scoped_accessor import ScopedAccessor


# --------------------------------------------------------------------------
# Class-cap enforcement. Solva class taxonomy is ordered fact > utterance >
# non_factual. A contribution's declared class MUST NOT exceed the highest
# class in its cited sources.
# --------------------------------------------------------------------------

_CLASS_RANK: Dict[str, int] = {
    "non_factual": 0,
    "utterance": 1,
    "fact": 2,
}


def _rank(cls: str) -> int:
    if cls not in _CLASS_RANK:
        raise MemoryGovernedRefusal(
            "contribution_shape_invalid",
            detail=f"Unknown class {cls!r}; legal: {sorted(_CLASS_RANK)}",
        )
    return _CLASS_RANK[cls]


def enforce_class_cap(*, class_declared: str, cited_source_classes: List[str]) -> None:
    """Raise MemoryGovernedRefusal if class_declared > max(cited_source classes)."""
    if not cited_source_classes:
        raise MemoryGovernedRefusal(
            "contribution_over_class_cap",
            detail="cited_source_classes empty — cannot support any declared class.",
        )
    max_cited_rank = max(_rank(c) for c in cited_source_classes)
    if _rank(class_declared) > max_cited_rank:
        raise MemoryGovernedRefusal(
            "contribution_over_class_cap",
            detail=(
                f"class_declared={class_declared!r} exceeds max(cited_source classes) "
                f"= {sorted(cited_source_classes)}. Contribution refused."
            ),
        )


# --------------------------------------------------------------------------
# Rights-at-birth enforcement. Widening beyond internal_only requires a
# separate publication ceremony (services/memory/publication.py).
# --------------------------------------------------------------------------

def enforce_rights_at_birth(
    *, rights_class: str, intended_scope: str,
) -> None:
    """Owner condition: internal-only rights at birth. Any wider rights
    class must be requested via the publication ceremony, never at write."""
    if rights_class != "internal_only":
        raise MemoryGovernedRefusal(
            "contribution_rights_forbid",
            detail=(
                f"rights_class={rights_class!r} exceeds internal_only at birth. "
                f"Widening requires the separate publication ceremony."
            ),
        )
    # Structural: intended_scope defaults to mind_context_only; registry_publication
    # is a separate act, not a write-time expansion. Reject the shortcut.
    if intended_scope != "mind_context_only":
        raise MemoryGovernedRefusal(
            "contribution_rights_forbid",
            detail=(
                f"intended_scope={intended_scope!r} at write time exceeds "
                f"plane-local default. Publication is a separate governed act."
            ),
        )


# --------------------------------------------------------------------------
# Five-ring shape validation. The five-rings shape is the frozen contract
# at contracts.five_rings; we validate structural presence here.
# --------------------------------------------------------------------------

_REQUIRED_FIVE_RINGS_KEYS = {
    "content", "provenance", "defensibility", "context", "re_extraction_handle",
}


def validate_five_ring_shape(five_ring_stamp: Dict) -> None:
    """Structural validation of the five-rings shape.

    Full contract validation happens at MemoryWriteBack_v0 admission; this
    is the class-cap-adjacent check that the five_ring_stamp actually
    carries the required rings.
    """
    if not isinstance(five_ring_stamp, dict):
        raise MemoryGovernedRefusal(
            "contribution_shape_invalid",
            detail="five_ring_stamp must be a dict of ring name -> ring body.",
        )
    missing = _REQUIRED_FIVE_RINGS_KEYS - set(five_ring_stamp.keys())
    if missing:
        raise MemoryGovernedRefusal(
            "contribution_shape_invalid",
            detail=f"five_ring_stamp missing rings: {sorted(missing)}",
        )


# --------------------------------------------------------------------------
# Write path. Composed of the three enforcement steps + insert via the
# scoped accessor (isolation by construction).
# --------------------------------------------------------------------------

async def write_contribution(
    *,
    accessor: ScopedAccessor,
    content_ref: str,
    five_ring_stamp: Dict,
    class_declared: str,
    cited_sources: List[str],
    cited_source_classes: List[str],
    rights_class: str = "internal_only",
    intended_scope: str = "mind_context_only",
    actor: str,
    trace_id: str,
) -> MemoryWriteBack_v0:
    """Write-back path with class-cap + rights-at-birth + shape enforcement.

    Uses the scoped accessor for insertion (plane_id is bound; cross-plane
    inserts are inexpressible).
    """
    # 1. Structural five-ring shape check.
    validate_five_ring_shape(five_ring_stamp)

    # 2. Class-cap enforcement.
    try:
        enforce_class_cap(
            class_declared=class_declared,
            cited_source_classes=cited_source_classes,
        )
    except MemoryGovernedRefusal as exc:
        await memory_ledger.emit_contribution_refused(
            plane_id=accessor.plane_id,
            refusal_reason=exc.reason,
            detail=exc.detail,
            tenant_id=accessor.tenant_id,
            actor=actor,
            trace_id=trace_id,
        )
        raise

    # 3. Rights-at-birth enforcement.
    try:
        enforce_rights_at_birth(
            rights_class=rights_class,
            intended_scope=intended_scope,
        )
    except MemoryGovernedRefusal as exc:
        await memory_ledger.emit_contribution_refused(
            plane_id=accessor.plane_id,
            refusal_reason=exc.reason,
            detail=exc.detail,
            tenant_id=accessor.tenant_id,
            actor=actor,
            trace_id=trace_id,
        )
        raise

    # 4. Build the frozen contribution envelope.
    contribution = MemoryWriteBack_v0(
        contribution_id=f"wb-{uuid.uuid4().hex[:12]}",
        plane_id=accessor.plane_id,
        content_ref=content_ref,
        five_ring_stamp=five_ring_stamp,
        class_declared=class_declared,
        cited_sources=cited_sources,
        rights_class=rights_class,
        intended_scope=intended_scope,
        created_at=datetime.now(timezone.utc).isoformat(),
    )

    # 5. Insert via the scoped accessor (plane_id cross-check enforced).
    doc = contribution.model_dump(mode="json")
    doc["tenant_id"] = accessor.tenant_id  # sidecar for accessor-level isolation.
    await accessor.insert_contribution(doc)

    # 6. Ledger row (memory_contribution_landed data_class).
    await memory_ledger.emit_contribution_landed(
        plane_id=accessor.plane_id,
        contribution_id=contribution.contribution_id,
        class_declared=class_declared,
        cited_source_count=len(cited_sources),
        rights_class=rights_class,
        intended_scope=intended_scope,
        tenant_id=accessor.tenant_id,
        actor=actor,
        trace_id=trace_id,
    )
    return contribution
