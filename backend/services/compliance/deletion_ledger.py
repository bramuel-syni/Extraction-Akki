"""Phase 8 Seam 3 Sub-stage 2 — deletion-event ledger emitter.

Canonical single-source writer for `data_class`-classified ledger rows
(non-refusal governance events). Mirror of Sub-stage 1's
`services/compliance/refusal_ledger.py::emit_refusal_ledger_row`.

Owner ruling (Amendment F rulings §10 + Stage A §7.2 Amendment C/D):
    E1.γ registry-backed constrained-str pattern extends to data-class
    classification. Deletion-event rows carry
    `stamp_audit["data_class"]` (pinned key) + membership in
    `data_class_registry.v0.json::valid_data_classes`.

Ledger row shape (per Stage A §5.1 line 62 + §7.3.C line 392):
    - stage = "converge"
    - decision = "continue"  (neutral placeholder for non-refusal events)
    - reason = f"authorized_deletion:{held_class}"
    - stamp_audit = {
        data_class: "authorized_deletion",
        held_class: str,
        keys_deleted: int,
        retention_rule_ref: "retention.vN",
        actor: str,
      }

LB gate (mirror of Sub-stage 1 R-1 pattern):
    test_deletion_terminal_row_carries_registry_valid_data_class_in_stamp_audit
    — data-shape invariant over every ledger row where
    reason.startswith("authorized_deletion:") — asserts presence + registry
    validity of `stamp_audit["data_class"]`.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Set

from contracts.northena_ledger import (
    LedgerArtifactRef,
    LedgerRow,
    NORTHENA_LEDGER_COLLECTION,
)
from core import db

_REGISTRY_PATH = Path(__file__).parent / "data_class_registry.v4.json"
_registry_cache: Optional[dict] = None


class UnknownDataClassError(ValueError):
    """Raised when a caller passes a data_class value not in the registry."""


def load_data_class_registry() -> dict:
    """Load the versioned data-class registry (cached)."""
    global _registry_cache
    if _registry_cache is None:
        with _REGISTRY_PATH.open("r", encoding="utf-8") as f:
            _registry_cache = json.load(f)
    return _registry_cache


def valid_data_classes() -> Set[str]:
    """Return the set of registered data_class strings."""
    reg = load_data_class_registry()
    return {entry["data_class"] for entry in reg["valid_data_classes"]}


VALID_DATA_CLASSES: Set[str] = valid_data_classes()


async def emit_deletion_ledger_row(
    *,
    run_id: str,
    trace_id: str,
    data_class: str,
    held_class: str,
    keys_deleted: int,
    retention_rule_ref: str,
    actor: str,
    artifact_ref: LedgerArtifactRef,
    lawful_basis_ref: str,
    extra_stamp_audit: Optional[dict] = None,
) -> LedgerRow:
    """Emit a deletion-event ledger row with pinned data_class sidecar.

    stage="converge" + decision="continue" — neutral placeholder per
    Stage A §7.3.C (Amendment C). reason=f"{data_class}:{held_class}"
    encodes semantics in the reason string. stamp_audit sidecar carries
    the pinned key `data_class` + all Owner-anchored fields.

    Args:
        data_class: MUST be in `VALID_DATA_CLASSES`. Registry validation
            raises `UnknownDataClassError` on unknown values.
        held_class: one of `HELD_CLASSES` (ledger_row / wizard_transcript /
            delivered_artifact). Not validated here (caller responsibility).
        keys_deleted: honest non-negative count.
        retention_rule_ref: canonical string like "retention.v1".
        actor: identity (user_id/email) of the caller.
        artifact_ref: canonical `LedgerArtifactRef` for the deletion event's
            associated artifact envelope (usually the config version being
            deleted or the run/trace context).
        lawful_basis_ref: canonical string identifier for lawful basis.
        extra_stamp_audit: caller-supplied extra pinned keys (optional).
            Pinned `data_class` + core keys ALWAYS take precedence.

    Returns:
        The persisted `LedgerRow` (Owner-value; caller may inspect).
    """
    if data_class not in VALID_DATA_CLASSES:
        raise UnknownDataClassError(
            f"data_class={data_class!r} not in registry "
            f"{sorted(VALID_DATA_CLASSES)}"
        )

    stamp = dict(extra_stamp_audit or {})
    # Pinned keys ALWAYS overwrite caller-supplied values (LB discipline).
    stamp["data_class"] = data_class
    stamp["held_class"] = held_class
    stamp["keys_deleted"] = int(keys_deleted)
    stamp["retention_rule_ref"] = retention_rule_ref
    stamp["actor"] = actor

    row = LedgerRow(
        run_id=run_id,
        trace_id=trace_id,
        stage="converge",
        decision="continue",  # neutral placeholder per Amendment C
        reason=f"{data_class}:{held_class}",
        artifact_ref=artifact_ref,
        lawful_basis_ref=lawful_basis_ref,
        stamp_audit=stamp,
        at=datetime.now(timezone.utc),
    )
    await db[NORTHENA_LEDGER_COLLECTION].insert_one(row.model_dump(mode="python"))
    return row
