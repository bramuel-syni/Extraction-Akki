"""ComposedConclusion@v0 contract-frozen snapshot invariant — Phase 4b.

18th frozen contract. Snapshot bijection enforced by
`test_frozen_contract_snapshot_parity.py`.

Gate 12 in the Phase 4b close roster.
"""
from __future__ import annotations

import json
from pathlib import Path

from contracts.composed_conclusion import ComposedConclusion_v0


SNAPSHOT_PATH = (
    Path(__file__).parent / "composed_conclusion.contract_snapshot.json"
)


def test_composed_conclusion_v0_contract_frozen():
    """Live schema matches the on-disk canonical snapshot byte-for-byte."""
    live = ComposedConclusion_v0.model_json_schema()
    stored = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    assert live == stored, (
        f"ComposedConclusion@v0 schema drift detected.\n"
        f"Regenerate snapshot ONLY under an explicit owner ruling that "
        f"acknowledges a governed field-shape change.\n"
        f"Live schema keys: {sorted(live.get('properties', {}).keys())}\n"
        f"Stored keys:      {sorted(stored.get('properties', {}).keys())}"
    )


def test_composed_conclusion_snapshot_parity_at_18():
    """Snapshot inventory bumped 17 → 18 at Phase 4b landing.

    Gate 19 of the Phase 4b roster. Complements the three parity tests
    in `test_frozen_contract_snapshot_parity.py` by asserting the
    absolute count invariant at Phase 4b close.

    Phase 5 Stage B (2026-07-04): parity count bumped 18 → 20 (added
    NorthenaLedgerRow_v1 + AsyncDeliveryAccepted_v0). This test's
    assertion updated to 20 to remain compatible; the underlying
    Phase-4b-composed_conclusion snapshot is still present.

    Phase 7 Stage B-1 (2026-07-04): parity count bumped 22 → 26 (added
    4 wizard contracts: WizardCommitState_v0 + OperatorTurn_v0 +
    AgentAssumption_v0 + CommittedValue_v0). Same additive pattern.

    Phase 9 Sub-stage 9.1 (2026-07-08): parity count bumped 26 → 28
    (added PerceptionJob_v0 + PerceptionResult_v0 per Owner P9-E1 α +
    P9-E4 α). Environment-boundary crossing → FREEZE prior. V1-G7
    byte-identity assertion set expands additively; the 26 pre-existing
    remain byte-identical.

    Artifact Store (2026-07-08): parity count bumped 28 → 29 (added
    OuterGateReceipt_v1 per Owner AS-E1 α). v0 remains byte-identical.
    """
    invariants_dir = Path(__file__).parent
    snapshots = list(invariants_dir.glob("*.contract_snapshot.json"))
    assert len(snapshots) == 32, (
        f"Post-Artifact-Store snapshot count must be exactly 29 "
        f"(28 pre-existing + OuterGateReceipt_v1 additive per AS-E1 α). "
        f"Actual: {len(snapshots)}.\nSnapshots: {sorted(p.name for p in snapshots)}"
    )
