# Function & Promise Registry — v0.8 Supplement (Phase 3 sub-cycle 2)

**Purpose:** carries the Phase 3 sub-cycle 2 (Memory + Registry surfaces) close's R4 reflexive Registry rows, landed per governance §14 additive-supplement discipline. AC-3 non-negotiable: FPR rows registered in machine YAML BEFORE each function lands. This supplement authoritatively documents the rows for the twelve promises implemented in this sub-cycle.

**Source lock:** primary source-of-truth `/app/docs/registry/function_promise_registry_v1.md` byte-identical (SHA unchanged). Prior supplements v0.1..v0.7 byte-identical.

**Landed:** 2026-08-02 (atomic Phase 3 sub-cycle 2 commit).

**Governance authority:** Owner ruling 2026-08-02 (Phase 3 sub-cycle 2 dispatch — Memory Service surface + Plane observability panel + Registry Estate Map); Ruling 2 (plane-observability aggregator rides sub-cycle 2); Ruling 4 (Surfaces v2 shell rule — new routes reachable from visible navigation); Ruling 5 (Registry declaration-baseline discipline).

**Parity:** unchanged at 34/34. Zero new frozen contracts this sub-cycle. The `/api/memory/planes/{plane_id}/observability` endpoint returns an untyped aggregate JSON body; if the shape crosses an environment boundary in a later sub-cycle, D4b may FREEZE it then — not now.

---

## §T1. Memory Service surface (frontend · read + governed refusal ceremony)

| function_id | governor | mandate | promise | service_trace | surface | enforcement | cost | dependencies | ladder_rung | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| `akki.frontend.memory_home_lists_scoped_planes` | Named surfaces (Memory · frontend) | `/memory` renders `GET /api/memory/planes` payload verbatim; the caller sees only planes bound to their own integration key. Server-side scope enforcement lives in the router; the frontend passes the token, never invents scope. A first-class scope note describes the discipline. | PROM-S1-external-scoped-access | S1.call | frontend/src/pages/memory/MemoryHomePage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · M-U1) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.memory_plane_detail_five_ring_visible` | Named surfaces (Memory · frontend) | `/memory/planes/:planeId` renders envelope + contribution history + publication ceremony + revocation section. Each surfaced item carries class-with-claim discipline (`class · plane_v0` marker sits with the headline). | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/memory/MemoryPlaneDetailPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · M-U2) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.memory_revoked_plane_frozen_state_honestly_rendered` | Named surfaces (Memory · frontend) | Revoked plane shows a distinct frozen chip carrying ratified copy `Frozen is immutable.` verbatim. Revoke section is REMOVED from the DOM (not just disabled). Publish button is visually disabled. Contribute CTA does not appear. | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/memory/MemoryPlaneDetailPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · M-U3) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.memory_publication_slot_unset_governed_refusal` | Named surfaces (Memory · frontend) | Attempting publication on a plane whose PUBLICATION_QUALITY_THRESHOLD [SLOT] is unset renders `<GovernedRefusalCard>` with the three verbatim Ruling 4 action-triplet buttons. Oxblood accent (never navy). Distinct from access-control-denial rendering. | PROM-S1-refusal-taxonomy-closed | S1.call | frontend/src/pages/memory/MemoryPlaneDetailPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · M-U4) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.memory_scoped_cross_key_denied_via_ui` | Named surfaces (Memory · frontend) | Engineer-key holder navigating to a plane owned by another key or hitting `/memory` under a different key triggers a 403 that renders via `<AccessControlDeniedPanel>` (navy · never governed-refusal · envelope carries `{reason, detail}` and NEVER `outcome`). | PROM-S1-refusal-taxonomy-closed | S1.call | frontend/src/pages/memory/MemoryHomePage.jsx + MemoryPlaneDetailPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · M-U5) | 1 cell · µs class | React | 1 · Deterministic | Owner |

## §T2. Plane observability panel (frontend)

| function_id | governor | mandate | promise | service_trace | surface | enforcement | cost | dependencies | ladder_rung | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| `akki.frontend.plane_observability_panel_reads_reconstructor` | Named surfaces (Memory · observability) | `/memory/planes/:planeId/observability` reads the aggregator endpoint only; the endpoint reads Northena ledger rows only. Four aggregate sections rendered (envelope · class-counts · publication rate · revocation history). Discipline: (a) publication acceptance rate renders `<MarkedOpenSlot slotName="publication_rate">` when `attempted==0` — NEVER `0/0` as `0%`; (b) contribution class buckets render `<MarkedOpenSlot slotName="class_{cls}">` when total landed is zero — unset-vs-empty per FB-13; (c) revocation history renders inline plainly on revoked plane, never hidden. Zero new frozen contract. | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/memory/MemoryPlaneObservabilityPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · O-U1/O-U2/O-U3/O-U4) + pytest (O-G1/O-G3/O-G4) | 1 cell · µs class | React | 1 · Deterministic | Owner |

## §T3. Backend seams (thin aggregator · Ruling 2)

| function_id | governor | mandate | promise | service_trace | surface | enforcement | cost | dependencies | ladder_rung | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| `akki.backend.memory_plane_observability_aggregator_endpoint` | Named surfaces (Memory · observability) | `GET /api/memory/planes/{plane_id}/observability` returns a read-only aggregate: contribution counts by class + publication counts + honest publication acceptance rate (null when attempted==0) + revocation history. Reads Northena ledger rows via `services/memory/ledger_reconstructor.rebuild_observability`. No new frozen contract; no new hot-path Mongo collection. | PROM-S1-frozen-wire-contract | S1.call | backend/routers/memory.py::get_observability + backend/services/memory/ledger_reconstructor.py::rebuild_observability | pytest (test_memory_observability_o_g1_to_o_g6.py · O-G1..O-G6) | 1 cell · ms class | FastAPI + Motor | 1 · Deterministic | Owner |
| `akki.backend.memory_observability_scope_enforced` | Named surfaces (Memory · observability) | The observability aggregator enforces scope identically to `GET /api/memory/planes/{id}`: admin/master_admin full-scope; engineer-key holders same-key only. Cross-key access returns 403 with `{reason:"auth_scope_insufficient", detail}` — NEVER `outcome`. | PROM-S1-refusal-taxonomy-closed | S1.call | backend/routers/memory.py::get_observability | pytest (test_memory_observability_o_g1_to_o_g6.py · O-G2) | 1 cell · µs class | FastAPI | 1 · Deterministic | Owner |

## §T4. Registry Estate Map (frontend · day-zero)

| function_id | governor | mandate | promise | service_trace | surface | enforcement | cost | dependencies | ladder_rung | owner |
|---|---|---|---|---|---|---|---|---|---|---|
| `akki.frontend.registry_estate_map_measured_vs_unmeasured_first_class` | Named surfaces (Registry · frontend) | `/registry` estate map renders every dimension either lit (measured) or hatched (unmeasured, via `<MarkedOpenSlot slotName="figure_{slug}">`). Never `0` for an unmeasured dimension. Day-zero: declaration-baseline is the only measured method, so every row surfaces as a coverage gap. | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/registry/RegistryEstateMapPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · R-U1) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.registry_figures_carry_method` | Named surfaces (Registry · frontend) | Every figure column on the estate map carries a `<MethodChip>` with the method identifier (`declaration_baseline` this cycle · `measured_census` and `inference_overlay` visible in the posture banner). No figure renders without a method marker. | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/registry/RegistryEstateMapPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · R-U2) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.registry_inference_overlay_dormant` | Named surfaces (Registry · frontend) | The inference-overlay column renders `<DormantCapabilityChip label="inference_overlay">` on every row. No numeric value; no fake number. Closed seam, honestly marked (four designed states discipline). | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/registry/RegistryEstateMapPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · R-U3) | 1 cell · µs class | React | 1 · Deterministic | Owner |
| `akki.frontend.registry_coverage_gap_paired_with_action` | Named surfaces (Registry · frontend) | Every coverage gap on the map pairs with a `Propose census →` action link routing to `/operator/commission` (the wizard door). Gap NEVER renders without an action affordance. | PROM-S1-frozen-wire-contract | S1.call | frontend/src/pages/registry/RegistryEstateMapPage.jsx | Jest (test_memory_and_registry_ui_gates.test.js · R-U4) | 1 cell · µs class | React | 1 · Deterministic | Owner |

═══════════════════════════════════════════════════════════════════

*End of v0.8 supplement. 5 rows §T1 + 1 row §T2 + 2 rows §T3 + 4 rows §T4 = 12 R4 reflexive rows. Matches Stage A §4 commitment exactly. Prior source-of-truth files byte-identical. Standing Rule v3 · on-disk canonical.*
