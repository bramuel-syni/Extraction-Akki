"""Shared parity counter (PH-E3 α · one authoritative source).

PH-R1 landing (2026-07-10) · Owner ruling PH-E3 α:
    "FS enumeration sharing V1-G7's authoritative counter — readiness
    and the parity gate must never disagree about what parity is, and
    one counting mechanism guarantees that."

BCR v1.5 §3.4 annex verbatim:
    GET /readyz  readiness · DB ping + frozen-contract parity count

Also consumed by /api/system/build_info per Owner enhancement promotion:
    "parity_count (same counter as PH-E3)"

Contract:
    * `count_frozen_contract_snapshots()` returns int.
    * Enumeration source: `backend/tests/invariants/*.contract_snapshot.json`.
    * Deterministic · file-system only · no imports of contract modules.
    * O(31) at request time · production-runtime-safe.
"""
from __future__ import annotations

from pathlib import Path

# The authoritative parity source: byte-identical snapshot files on disk.
# V1-G7 uses this same enumeration; readiness and system/build_info share
# the same helper so all three surfaces (V1-G7 gate + /readyz + /build_info)
# can never disagree about what parity is.
_INVARIANTS_DIR = Path(__file__).resolve().parents[2] / "tests" / "invariants"

EXPECTED_PARITY: int = 36
"""Bumped 32 -> 34 at Memory Service Stage B (2026-07-31) — Owner ruling
condition (c2) 2026-07-30 cycle 3: two seal events landed as new frozen
seats via D4b prior FREEZE — memory_plane_v0 (plane envelope) and
memory_write_back_v0 (contribution shape). Both cross an environment
boundary (integration-key holder → platform) with LOW change rate; prior
per D4b is FREEZE.

Prior: bumped 31 -> 32 at P1 close (2026-07-30) — Owner ruling condition
(i): trust_receipt_v1 sibling contract landed as new frozen seat.
See docs/rulings/P1_stage_a_owner_approval_2026-07-30.md §Condition (i)."""


def snapshot_directory() -> Path:
    """Return the canonical invariants directory (test surfaces re-point here)."""
    return _INVARIANTS_DIR


def count_frozen_contract_snapshots() -> int:
    """Return the count of `*.contract_snapshot.json` files on disk.

    O(31) glob at request time · no module imports · production-safe.
    """
    return len(list(_INVARIANTS_DIR.glob("*.contract_snapshot.json")))


def parity_ok() -> bool:
    """Return True iff on-disk parity equals `EXPECTED_PARITY` (=36)."""
    return count_frozen_contract_snapshots() == EXPECTED_PARITY
