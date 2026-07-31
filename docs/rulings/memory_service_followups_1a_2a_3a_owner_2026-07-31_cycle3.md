# Memory Service — Follow-up Rulings 1a/2a/3a (Owner · 2026-07-31 cycle 3)

**Status:** RECORDED · disk-canonical
**Authority:** Owner (message 391)
**Landing:** 2026-07-31 · Memory Service Stage B in-flight

---

## 1a — Freeze BOTH memory contracts; parity 32 → 34 via two seal events

**Ruling verbatim:** "Freeze BOTH memory contracts, parity 32→34 via two seal events. Both cross a trust boundary (integration keys / external consumers), so the D4b prior (FREEZE) holds for both — this matches the Owner's condition (c2) and Stage A §3. Fix the immediate blocker first: land both `.contract_snapshot.json` files, bump `EXPECTED_PARITY` and the `CONTRACT_TO_SNAPSHOT` map, update the V1-G7 assertion, get the invariants suite green before any business logic lands."

**Consequence:**
- `contracts/memory_plane_v0.py` + `contracts/memory_write_back_v0.py` sealed
- `tests/invariants/memory_plane_v0.contract_snapshot.json` + `memory_write_back_v0.contract_snapshot.json` landed byte-identical to live schema
- `services/health/parity_counter.py::EXPECTED_PARITY = 34`
- `CONTRACT_TO_SNAPSHOT` map extended (+2 entries)
- `test_v1_g7_byte_identity_all_prior_frozen_contracts` assertion bumped 32 → 34
- ~9 parity-attest tests across invariants + registry suites bumped in one atomic sweep
- MRR-G-Parity gate updated to 34/34 in `services/registry/validator.py`
- Backend restarted; `/api/system/build_info` + `/api/readyz` report parity 34/34 live

## 2a — Reuse NorthenaLedgerRow_v1 with memory_* data_class values

**Ruling verbatim:** "Reuse NorthenaLedgerRow_v1 with memory_* data_class values. Rationale: Northena owns the one ledger; memory must be ledger-reconstructible through the same append-only record, one trace thread, no second ledger. CONDITION: adding memory_* values to the data-class registry is a GOVERNED registry change (registries are a governed-value class with their own change authority) — record it as a dated registry version bump with authority noted, not a silent edit."

**Consequence:**
- `services/compliance/data_class_registry.v4.json` landed as ADDITIVE-only bump from v3
- v3 file preserved byte-identical (never mutated)
- v4 carries top-level `authority` block: `{who: Owner, when: 2026-07-30, ruling_ref: ...}`
- 7 memory_* data_class values registered: `memory_plane_issued`, `memory_contribution_landed`, `memory_contribution_refused`, `memory_publication_attempted`, `memory_publication_landed`, `memory_publication_refused`, `memory_plane_revoked`
- `services/compliance/deletion_ledger.py::_REGISTRY_PATH` re-pointed to v4
- Zero code path opens a second ledger; every memory event emits via `emit_deletion_ledger_row` with the memory_* data_class
- `services/memory/ledger.py` is a thin wrapper (event emitters) — the ledger row shape is `NorthenaLedgerRow_v1`
- `services/memory/ledger_reconstructor.py` rebuilds plane state from the shared ledger; M-G8 gate attests reconstruction

## 3a — Wire /api/memory/* now; engineer-key scoped; server-side enforcement

**Ruling verbatim:** "Wire /api/memory/* now. Backend surface in OpenAPI, exercised via engineer-key credentials, server-side scope enforcement on every call. This is backend work per ruling (b) and the tester needs it exercisable. NO frontend edits."

**Consequence:**
- `routers/memory.py` mounted at `/api/memory/*` with 8 endpoints
- Every endpoint enforces `_authorize_plane_access` server-side (caller integration key must match plane's `issued_to_integration_key`, unless admin/master_admin)
- Cross-key HTTP break-in refused with 403 `{reason: "auth_scope_insufficient"}` (no `outcome` key)
- Governed refusals carry `{outcome: "refused", reason, detail}` — Owner E2 taxonomy separation preserved
- Zero frontend edits
- Backend testing agent will exercise the surface via engineer-key credentials

## Binding condition-check summary

| Condition | Status |
|---|---|
| Plane isolation by construction (scoped-accessor pattern) | ✓ M-G1..M-G4 break-in gates green |
| Contribution five-ring shape + class-cap + rights-at-birth | ✓ M-G-class-cap + M-G-rights + M-G3 green |
| Publication is separate governed act; fail-loud on unset [SLOT] | ✓ M-G6 green; SR-5 enforced |
| Revocation freezes immediately | ✓ M-G7 green |
| Working-set constants are [SLOT]s | ✓ M-G-constants + M-G-publication-threshold-unset-by-default green |
| Governed-refusal envelope separate from auth taxonomy | ✓ M-G9 × 3 cells green |
| FPR rows registered in machine YAML BEFORE each function | ✓ 23 memory rows in `docs/registry/machine/registry.yaml` (regenerated) |
| Northena as single ledger; ledger-reconstructible plane state | ✓ M-G8 green after registry-doc deletion |
| Parity 34/34 live on `/api/system/build_info` | ✓ curl-confirmed |

═══════════════════════════════════════════════════════════════════
