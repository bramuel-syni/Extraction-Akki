"""Memory service package.

Backend-only implementation of the Memory Service per Owner ruling
(2026-07-30 cycle 3, option (b) — Stage A + full mechanics in parallel).

Authority: Integration Orchestration Brief Part IV
(`docs/mandates/akki_os_pack_v1/AkkiOS_Integration_Orchestration_Brief_v1.0.md`).

Carriers:
    - contracts.memory_plane_v0.MemoryPlane_v0 (frozen; parity seat +1)
    - contracts.memory_write_back_v0.MemoryWriteBack_v0 (frozen; parity seat +1)

Modules:
    - constants — [SLOT] eviction/persistence constants.
    - plane_registry — Mongo-backed plane storage.
    - scoped_accessor — the plane-isolation-by-construction pattern.
    - write_back — write-back contract enforcement.
    - publication — governed publication act (never automatic).
    - working_set — usage-proportional persistence.
    - revocation — freezes the plane immediately.
    - refusal — governed refusal shape builder (Owner E2 taxonomy).
    - ledger_reconstructor — rebuild plane state from ledger records.
"""
