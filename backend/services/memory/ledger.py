"""Memory-service ledger emitter — thin wrapper over Northena append-only ledger.

Owner ruling (2a, 2026-07-31):
    "Reuse NorthenaLedgerRow_v1 with memory_* data_class values. Northena
    owns the one ledger; memory must be ledger-reconstructible through the
    same append-only record, one trace thread, no second ledger. Adding
    memory_* values to the data-class registry is a GOVERNED registry
    change — recorded as a dated registry version bump with authority
    noted."

Governed-registry authority: data_class_registry.v4.json (Owner ruling
2026-07-30 cycle 3 + follow-up 2a, 2026-07-31). Never in-place edit.

Every memory event lands as a Northena ledger row via `emit_deletion_ledger_row`:
  * stage="converge" + decision="continue" (neutral placeholder per §7.3.C).
  * stamp_audit.data_class carries the event class (memory_*).
  * artifact_ref uses the vestigial-by-ruling pattern
    (artifact_type="objective_request") — the event class is at stamp_audit.

This is deliberately parallel to the checker ledger emitters — one append-only
ledger, one row shape, plurality of event classes via the governed registry.
"""
from __future__ import annotations

from typing import Any, Dict, Optional

from contracts.northena_ledger import LedgerArtifactRef
from services.compliance.deletion_ledger import emit_deletion_ledger_row


def _vestigial_artifact_ref(event: str, ref_id: str) -> LedgerArtifactRef:
    """Per Ruling 1(i) precedent (Amendment G): governance-event rows reuse
    Sub-stage 2's artifact_type="objective_request" pragmatic-choice pattern.
    The honest event class lives at stamp_audit["data_class"]."""
    return LedgerArtifactRef(
        artifact_type="objective_request",
        artifact_id=f"memory-{event}-{ref_id}",
        version=ref_id,
    )


async def emit_plane_issued(
    *,
    plane_id: str,
    integration_key: str,
    tenant_id: str,
    retrieval_scope: str,
    issued_at: str,
    actor: str,
    trace_id: str,
    lawful_basis_ref: str = "memory:plane_issue",
) -> None:
    await emit_deletion_ledger_row(
        run_id=f"memory-{plane_id}",
        trace_id=trace_id,
        data_class="memory_plane_issued",
        held_class="memory_plane",
        keys_deleted=0,  # honest zero — not a deletion.
        retention_rule_ref="memory:plane_lifecycle",
        actor=actor,
        artifact_ref=_vestigial_artifact_ref("plane_issued", plane_id),
        lawful_basis_ref=lawful_basis_ref,
        extra_stamp_audit={
            "plane_id": plane_id,
            "integration_key": integration_key,
            "tenant_id": tenant_id,
            "retrieval_scope": retrieval_scope,
            "issued_at": issued_at,
        },
    )


async def emit_contribution_landed(
    *,
    plane_id: str,
    contribution_id: str,
    class_declared: str,
    cited_source_count: int,
    rights_class: str,
    intended_scope: str,
    tenant_id: str,
    actor: str,
    trace_id: str,
    lawful_basis_ref: str = "memory:contribution_landed",
) -> None:
    await emit_deletion_ledger_row(
        run_id=f"memory-{plane_id}",
        trace_id=trace_id,
        data_class="memory_contribution_landed",
        held_class="memory_contribution",
        keys_deleted=0,
        retention_rule_ref="memory:contribution_lifecycle",
        actor=actor,
        artifact_ref=_vestigial_artifact_ref("contribution", contribution_id),
        lawful_basis_ref=lawful_basis_ref,
        extra_stamp_audit={
            "plane_id": plane_id,
            "contribution_id": contribution_id,
            "class_declared": class_declared,
            "cited_source_count": cited_source_count,
            "rights_class": rights_class,
            "intended_scope": intended_scope,
            "tenant_id": tenant_id,
        },
    )


async def emit_contribution_refused(
    *,
    plane_id: str,
    refusal_reason: str,
    detail: str,
    tenant_id: str,
    actor: str,
    trace_id: str,
    lawful_basis_ref: str = "memory:contribution_refused",
) -> None:
    await emit_deletion_ledger_row(
        run_id=f"memory-{plane_id}",
        trace_id=trace_id,
        data_class="memory_contribution_refused",
        held_class="memory_contribution",
        keys_deleted=0,
        retention_rule_ref="memory:contribution_lifecycle",
        actor=actor,
        artifact_ref=_vestigial_artifact_ref("refused", plane_id),
        lawful_basis_ref=lawful_basis_ref,
        extra_stamp_audit={
            "plane_id": plane_id,
            "refusal_reason": refusal_reason,
            "detail": detail,
            "tenant_id": tenant_id,
        },
    )


async def emit_publication_event(
    *,
    event_class: str,  # memory_publication_{attempted,landed,refused}
    plane_id: str,
    contribution_id: str,
    tenant_id: str,
    actor: str,
    trace_id: str,
    extra: Optional[Dict[str, Any]] = None,
    lawful_basis_ref: str = "memory:publication",
) -> None:
    assert event_class in {
        "memory_publication_attempted",
        "memory_publication_landed",
        "memory_publication_refused",
    }, event_class
    stamp = {
        "plane_id": plane_id,
        "contribution_id": contribution_id,
        "tenant_id": tenant_id,
    }
    if extra:
        stamp.update(extra)
    await emit_deletion_ledger_row(
        run_id=f"memory-{plane_id}",
        trace_id=trace_id,
        data_class=event_class,
        held_class="memory_publication",
        keys_deleted=0,
        retention_rule_ref="memory:publication_lifecycle",
        actor=actor,
        artifact_ref=_vestigial_artifact_ref("publication", contribution_id),
        lawful_basis_ref=lawful_basis_ref,
        extra_stamp_audit=stamp,
    )


async def emit_plane_revoked(
    *,
    plane_id: str,
    tenant_id: str,
    revoked_by: str,
    revoked_at: str,
    reason: str,
    trace_id: str,
    lawful_basis_ref: str = "memory:plane_revoke",
) -> None:
    await emit_deletion_ledger_row(
        run_id=f"memory-{plane_id}",
        trace_id=trace_id,
        data_class="memory_plane_revoked",
        held_class="memory_plane",
        keys_deleted=0,
        retention_rule_ref="memory:plane_lifecycle",
        actor=revoked_by,
        artifact_ref=_vestigial_artifact_ref("revoked", plane_id),
        lawful_basis_ref=lawful_basis_ref,
        extra_stamp_audit={
            "plane_id": plane_id,
            "tenant_id": tenant_id,
            "revoked_by": revoked_by,
            "revoked_at": revoked_at,
            "reason": reason,
        },
    )
