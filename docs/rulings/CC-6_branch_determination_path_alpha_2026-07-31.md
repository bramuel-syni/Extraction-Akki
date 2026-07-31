# CC-6 Branch Determination — Owner's storage test (2026-07-30 cycle 3)

**Status:** DELEGATED-REVERSIBLE (owner-clock unchanged)
**Authority:** Owner ruling `CC-4_HS2_acknowledgement_stays_on_owner_clock_2026-07-30.md` + P2 cycle 3 dispatch
**Landed:** 2026-07-30 (branch logged); recorded again 2026-07-31 during Memory Service Stage B close-out

---

## Branch condition (Owner's storage test)

The CC-6 question ("what counts as a Ledger row's storage boundary at the memory-service seam?") is bifurcated on Owner's storage test:

- **Path α (single-ledger reuse):** Every memory event rides `NorthenaLedgerRow_v1` in the shared `northena_ledger` collection with `stamp_audit.data_class ∈ {memory_*}`. Ledger is the SAME storage, SAME row shape, SAME append-only invariant.
- **Path β (separate memory-ledger):** Memory events land in a distinct collection (`memory_ledger`) with a distinct row shape.

## Determination

Owner's follow-up decision **(2a) 2026-07-31**:

> "Reuse NorthenaLedgerRow_v1 with memory_* data_class values. Northena owns the one ledger; memory must be ledger-reconstructible through the same append-only record, one trace thread, no second ledger."

**→ CC-6 resolved to PATH α.**

## Consequence trail

- `services/memory/ledger.py` is a thin event-emitter wrapper over `services/compliance/deletion_ledger.py::emit_deletion_ledger_row`
- Ledger events emit with `run_id = "memory-{plane_id}"`, `trace_id` per event, and `stamp_audit.data_class ∈ {memory_plane_issued, memory_contribution_landed, memory_contribution_refused, memory_publication_attempted, memory_publication_landed, memory_publication_refused, memory_plane_revoked}`
- Governed-registry change (v3 → v4) records Owner authority in the payload's `authority` block
- `services/memory/ledger_reconstructor.py` reads from `NORTHENA_LEDGER_COLLECTION` — the single source of truth for plane state
- M-G8 gate proves ledger-reconstructibility: deletes the plane doc, rebuilds state from ledger rows alone

## Delegated-reversibility posture

Owner's ruling `CC-4` records that the CC-6 branch stays on Owner's clock as DELEGATED-REVERSIBLE. The reuse pattern is reversible: if a future audit ruling requires a distinct memory-ledger collection, the emitter wrapper (single point) is where the swap lands. No downstream consumer reads from a memory-specific collection — every consumer reads from `northena_ledger` filtered by `stamp_audit.plane_id`.

═══════════════════════════════════════════════════════════════════
