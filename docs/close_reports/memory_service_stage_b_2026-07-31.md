# Memory Service Stage B — Close Report (AC-1 full contents)

**Cycle:** 3
**Landed:** 2026-07-31
**Authority:** Owner ruling `docs/rulings/memory_service_option_b_owner_ruling_2026-07-30_cycle3.md` + follow-up decisions `1a/2a/3a` (`docs/rulings/memory_service_followups_1a_2a_3a_owner_2026-07-31_cycle3.md`)
**Governor:** Solva (contribution class-cap) + Northena (ledger reuse) + reflexive Deviation-audit (isolation + registry version bump)

═══════════════════════════════════════════════════════════════════

## §1. Mandate and outcome

Owner requested: adopt Stage A option (b) (freeze `MemoryPlane_v0` + `MemoryWriteBack_v0`; scoped-accessor pattern; class-cap + rights-at-birth at write; governed publication ceremony; [SLOT]'d eviction constants; ledger-reconstructible; governed-refusal envelope). Backend only this cycle; no frontend.

Outcome: **delivered**. Parity 32 → 34. 8 endpoints under `/api/memory/*`. 24 M-G* break-in gates + 25 P2 buildable-now guard cells green. Full suite (1382 tests + 1 skipped) green. Registry FPR rows registered in machine YAML BEFORE each function landed. Data-class registry v3 → v4 governed additive bump with Owner authority captured.

## §2. Frozen contracts (two seal events per D4b FREEZE)

| Contract | File | Snapshot |
|---|---|---|
| `MemoryPlane_v0` | `backend/contracts/memory_plane_v0.py` | `backend/tests/invariants/memory_plane_v0.contract_snapshot.json` |
| `MemoryWriteBack_v0` | `backend/contracts/memory_write_back_v0.py` | `backend/tests/invariants/memory_write_back_v0.contract_snapshot.json` |

**Parity live:** `/api/readyz` + `/api/system/build_info` return `parity_count = 34 = expected_parity`.

## §3. Business logic

| Module | Purpose |
|---|---|
| `services/memory/plane_registry.py` | Issue / lookup / state-transition; server-minted plane IDs; Mongo-persisted |
| `services/memory/scoped_accessor.py` | Plane-isolation by construction; `__slots__` + `__setattr__`-immutable + `_assert_scope` cross-check; no override kwarg; `for_plane(...)` factory refuses cross-key mint |
| `services/memory/write_back.py` | five-ring shape + class-cap + rights-at-birth enforcement; MemoryGovernedRefusal raise → router 4xx |
| `services/memory/publication.py` | Governed 3-step ceremony (attempted → gate → landed); fail-loud on unset [SLOT] threshold; never automatic |
| `services/memory/revocation.py` | Immediate freeze; idempotent re-revoke |
| `services/memory/working_set.py` | Usage-proportional persistence; halflife-decay LRU eviction under `[SLOT: 10_000]` cap; whitelisted in deletion-path gate as cache-refresh |
| `services/memory/ledger_reconstructor.py` | Read-only rebuild of plane state from Northena ledger rows filtered by `stamp_audit.plane_id` |
| `services/memory/ledger.py` | Thin event-emitter wrapper over shared Northena ledger |
| `services/memory/refusal.py` | Governed-refusal exception + envelope builder; 8-code closed reason set |
| `services/memory/constants.py` | `[SLOT: ...]`-marked constants (4 total) |
| `services/memory/memory_refusal_reasons.v0.json` | Versioned reason-set registry (never mutated in place) |
| `routers/memory.py` | 8 endpoints; engineer-key scoped; server-side `_authorize_plane_access` on every call |
| `services/compliance/data_class_registry.v4.json` | Governed additive bump v3 → v4 (7 memory_* classes); `authority` block cites Owner + timestamp + ruling ref |

## §4. Endpoint roster (`/api/memory/*`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/planes` | Issue plane; server-minted plane_id |
| GET | `/planes` | List planes bound to caller's integration key |
| GET | `/planes/{plane_id}` | Get plane envelope (governed refusal on not-found; auth denial on cross-key) |
| POST | `/planes/{plane_id}/contribute` | Write-back with class-cap + rights-at-birth enforcement |
| POST | `/planes/{plane_id}/publish` | Governed publication ceremony |
| POST | `/planes/{plane_id}/revoke` | Immediate freeze; idempotent |
| GET | `/planes/{plane_id}/working_set` | Enumerate plane-local working set |
| GET | `/planes/{plane_id}/retrieval_scope` | Read plane retrieval scope |
| GET | `/planes/{plane_id}/reconstructed_state` | Ledger-reconstructible plane state (audit surface) |

Server-side scope enforcement: every endpoint (except issue) fetches the plane doc and checks `caller_integration_key == plane.issued_to_integration_key` OR caller carries admin/master_admin role. Cross-key → 403 `auth_scope_insufficient` (no `outcome` key).

## §5. M-G1..M-G9 break-in gate roster + additional cells

| Gate | Test | Status |
|---|---|---|
| M-G1 direct cross-plane read | `test_m_g1_scoped_accessor_cannot_read_across_planes_by_direct_call` | ✓ |
| M-G2 kwarg/setattr bypass | `test_m_g2_scoped_accessor_cannot_bypass_via_kwarg_or_setattr_override` | ✓ (4 break-in vectors) |
| M-G3 write-plane-A / read-plane-B isolation | `test_m_g3_write_back_write_to_plane_A_isolated_from_plane_B_reads` | ✓ |
| M-G4 mind-context never crosses keys | `test_m_g4_mind_context_never_crosses_keys` | ✓ |
| M-G5 estate memory via publication ceremony only | `test_m_g5_estate_memory_shared_across_keys` | ✓ |
| M-G6 publication is separate governed act | `test_m_g6_publication_is_separate_governed_act` | ✓ |
| M-G7 revocation freezes immediately | `test_m_g7_revocation_freezes_plane_immediately` | ✓ (+ idempotent) |
| M-G8 plane state ledger-reconstructible | `test_m_g8_plane_state_ledger_reconstructible` | ✓ (after registry-doc delete) |
| M-G9 refusal shape governed ≠ auth | `test_m_g9` × 3 cells | ✓ |
| **M-G-Registry** | `test_m_g_registry_v4_landed_additive_from_v3_with_authority` | ✓ |
| **M-G-Parity** | `test_m_g_parity_34_at_memory_service_stage_b_close` | ✓ |
| **M-G-Frozen-Snapshots** | `test_m_g_two_frozen_snapshots_present_and_byte_identical` | ✓ |
| **M-G-Constants-Slots** | `test_m_g_constants_all_carry_slot_markers` | ✓ |
| **M-G-Threshold-Unset-Default** | `test_m_g_publication_threshold_unset_by_default` | ✓ |
| **M-G-Class-Cap** (3 cells) | `test_m_g_class_cap_*` | ✓ |
| **M-G-Rights-At-Birth** (2 cells) | `test_m_g_rights_at_birth_*` | ✓ |
| **M-G-Router-Engineer-Key-Flow** | `test_m_g_router_engineer_key_holder_can_issue_and_contribute` | ✓ |
| **M-G-Router-Cross-Key-Denied** | `test_m_g_router_cross_key_plane_read_denied` | ✓ |
| **M-G-Refusal-Reason-Set-Closed** | `test_m_g_refusal_reason_set_closed` | ✓ |

**24 cells total in `backend/tests/invariants/test_memory_service_m_g1_to_m_g9.py`.**

## §6. P2 buildable-now guard tightening (per dispatch §4 P2-R1/P2-R4)

| Gate | Test | Status |
|---|---|---|
| V1-G2 tightened kill-and-restart merge (2 cells) | `test_v1_g2_tightened_*` | ✓ |
| V1-G2 HTTP idempotent replay | `test_v1_g2_tightened_http_idempotent_replay_on_same_result` | ✓ |
| V1-G3 tightened purge_attestation ISO shape (2 cells) | `test_v1_g3_tightened_*` | ✓ |
| V1-G4 extension real-intake-validator (2 cells) | `test_v1_g4_extension_intake_validator_rejects_*` | ✓ |
| V1-G6 tightened telemetry four-field + per_modality dict | `test_v1_g6_tightened_telemetry_carries_four_fields_and_per_modality_is_dict` | ✓ |
| P2-G-R4.a AST-walker: workers never import ledger writers (parametrized × 7 files) | `test_p2_g_r4a_worker_module_never_imports_ledger_writers` | ✓ |
| P2-G-R4.a AST-walker: workers never import identity stack (parametrized × 7 files) | `test_p2_g_r4a_worker_module_never_imports_identity_stack` | ✓ |
| P2-G-R4.b gpu-import gate: cuda_runtime refuses on unset env | `test_p2_g_r4b_gpu_execution_import_refuses_when_env_var_unset` | ✓ |
| P2-G-R4.b gpu-import gate: invalid mode string refuses | `test_p2_g_r4b_gpu_execution_import_refuses_invalid_mode_string` | ✓ |
| P2-G-R4.b stub-first: stub worker serves without GPU env | `test_p2_g_r4b_stub_worker_serves_without_gpu_env` | ✓ |

**25 cells total in `backend/tests/invariants/test_p2_buildable_now.py`.**

## §7. Registry version bump (governed additive change)

- **From:** `services/compliance/data_class_registry.v3.json` (byte-identical, never mutated)
- **To:** `services/compliance/data_class_registry.v4.json` (additive; +7 classes)
- **Authority block** (verbatim in v4): `{who: "Owner", when: "2026-07-30 (dispatch cycle 3, follow-up decision 2a)", ruling_ref: "docs/rulings/memory_service_option_b_owner_ruling_2026-07-30_cycle3.md + docs/rulings/memory_service_ledger_reuse_2a_owner_ruling_2026-07-31.md"}`
- **New classes:** `memory_plane_issued`, `memory_contribution_landed`, `memory_contribution_refused`, `memory_publication_attempted`, `memory_publication_landed`, `memory_publication_refused`, `memory_plane_revoked`
- **Loader:** `services/compliance/deletion_ledger.py::_REGISTRY_PATH` re-pointed
- **Attest:** `test_8_ext.py::test_data_class_registry_v3_landed_additive_from_v2` extended to verify v4 additive from v3 + authority + 7 memory_* classes

## §8. Ledger reuse — one append-only record

Per Owner (2a): every memory event emits a `NorthenaLedgerRow_v1` via the shared `emit_deletion_ledger_row` seam. `services/memory/ledger.py` is the thin event-emitter wrapper. `services/memory/ledger_reconstructor.py` reads from `northena_ledger` collection filtered by `stamp_audit.plane_id`. No second ledger. One trace thread per plane.

## §9. FPR registration (AC-3)

FPR rows registered in machine YAML **BEFORE** each function landed:
- `docs/registry/function_promise_registry_v0.6_supplement_memory_stage_a.md` — 23 rows across 8 sections
- `docs/registry/machine/registry.yaml` regenerated (`tools/registry/regenerate.py`) — includes 23 memory rows
- MRR-G-Parity gate updated to 34/34 in `services/registry/validator.py`
- Parser extended to re-parse post-v1 supplements as additive material (governance §14 extension)

## §10. Enforcement-cell count (re-measured)

`24 (memory M-G) + 25 (P2 buildable-now) = 49 new enforcement cells`. Full suite: **1382 passing tests + 1 skipped**. Zero regressions.

## §11. Full pytest sweep

- Command: `cd /app/backend && python -m pytest tests/ -q --no-header`
- Result: `1382 passed, 1 skipped, 1 warning in 42.73s`
- Duration: <45s
- Regressions: 0

## §12. Doc trail landed this cycle

| File | Purpose |
|---|---|
| `docs/rulings/memory_service_followups_1a_2a_3a_owner_2026-07-31_cycle3.md` | Owner rulings 1a/2a/3a recorded on disk |
| `docs/rulings/CC-6_branch_determination_path_alpha_2026-07-31.md` | CC-6 branch resolved to Path α (single-ledger reuse); DELEGATED-REVERSIBLE posture preserved |
| `docs/rulings/cycle3_dispatch_erratum_parity_34_2026-07-31.md` | §6 dispatch erratum (34 ≠ 33) |
| `docs/rulings/frontend_brief_v2_intake_summary_2026-07-31.md` | Frontend Brief v2 intake logged; deferred to Phase 3 |
| `docs/close_reports/memory_service_stage_b_2026-07-31.md` | This file (AC-1 full contents) |
| `docs/registry/function_promise_registry_v0.6_supplement_memory_stage_a.md` | 23 FPR rows for memory-service Stage B |
| `services/compliance/data_class_registry.v4.json` | Governed additive registry bump |

## §13. Journal entry

To be appended to `BUILD_JOURNAL.md` on final commit.

## §14. Demo login still works

Demo login (`admin@rms.example.com` / `admin-b1-test-pw`) exercised live via curl post-commit; token grants access to `/api/memory/*` under admin role (full scope).

## §15. Audio Intelligence pack integrity

Re-upload verification confirmed byte-identical to committed source (SHA `b6ad57b3…`). Manifest row 9 preserved; no amendment note required.

═══════════════════════════════════════════════════════════════════

*Close report generated 2026-07-31. Awaiting backend testing-agent report as the operative close signal per Owner condition.*
