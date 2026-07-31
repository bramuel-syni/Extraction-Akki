# Close Report — Phase 3 sub-cycle 2 · Memory + Registry

**Cycle scope:** Phase 3 · sub-cycle 2 (Memory Service surface + Plane Observability panel + Registry Estate Map)
**Landed:** 2026-08-02
**Testing agent verdict:** `iteration_8.json` — backend 100% · frontend 100% · zero issues · retest_needed=false.
**Parity:** 34/34 unchanged (zero new frozen contracts landed this cycle · Ruling 2 respected).

---

## AC-1 · What landed (verbatim inventory)

### AC-1.1 · Frontend surfaces (four new routes, module-scoped nav-visible)

- `/memory` — `MemoryHomePage.jsx`. Plane list scoped to caller's integration key (server-side scope). First-class scope banner rendered. Access-control-denial panel (navy) on HTTP 403 auth_scope_insufficient; ratified governed-empty note when list is `[]`.
- `/memory/planes/:planeId` — `MemoryPlaneDetailPage.jsx`. Plane envelope + class-with-claim marker + contribution history (from reconstructor) + publication ceremony (fail-loud governed refusal on unset `PUBLICATION_QUALITY_THRESHOLD [SLOT]`) + revocation section (removed from DOM when state=revoked). Frozen chip carries ratified verbatim string `Frozen is immutable.`.
- `/memory/planes/:planeId/observability` — `MemoryPlaneObservabilityPage.jsx`. Four aggregate sections: envelope · class-counts · publication rate · revocation history. `MarkedOpenSlot` when `attempted==0` (publication rate) or `landed==0` (class buckets). Unset-vs-empty discipline observed per FB-13.
- `/registry` — `RegistryEstateMapPage.jsx`. Posture banner with three method chips (declaration_baseline · measured_census · inference_overlay dormant). Every figure carries a method chip. Every unmeasured dimension row renders `MarkedOpenSlot` (never `0`). Every coverage gap pairs with a `Propose census →` action link routing to `/operator/commission`.

### AC-1.2 · Frontend nav (Surfaces v2 shell rule · Owner Ruling 4)

- `CONSOLE_NAV_ITEMS` in `AskConsolePage.js` extended with `/memory` (`Memory Service`) and `/registry` (`Registry · Estate Map`) — both `gate: 'auth'`. Nav menu discoverability preserved · new routes reachable from the visible console nav, not deep-link only.

### AC-1.3 · Backend seams (thin aggregator · Ruling 2)

- `backend/routers/memory.py::get_observability` — new endpoint `GET /api/memory/planes/{plane_id}/observability`. Read-only aggregate. Scope enforcement identical to `GET /api/memory/planes/{plane_id}` (admin/master_admin full-scope; engineer-key holder same-key only).
- `backend/services/memory/ledger_reconstructor.py::rebuild_observability` — reads Northena ledger rows exclusively (no read of the memory_planes / memory_contributions collections; AST gate O-G-Aggregate-Reads-Ledger-Only asserts the purity).
- Zero new frozen contract; response shape is an untyped aggregate JSON body. If the shape crosses an environment boundary in a later sub-cycle, D4b may FREEZE it then — not now.

### AC-1.4 · Enforcement cell count (re-measured this cycle)

- Backend: **+8 cells** (O-G1..O-G6 + O-G-Parity + O-G-Aggregate-Reads-Ledger-Only). Suite total: **1421 passed / 1 skipped / 0 failed** (up from 1413).
- Jest: **+15 cells** (M-U1 · M-U1-empty · M-U5 · M-U5-detail · M-U2 · M-U3 · M-U4 · O-U1 · O-U2 · O-U3 · O-U4 · R-U1 · R-U2 · R-U3 · R-U4). Suite total: **26 suites / 182 passed / 0 failed** (up from 25/167).
- **Sub-cycle 2 total: 23 new enforcement cells.**

### AC-1.5 · FPR (AC-3 non-negotiable)

- Supplement v0.8 landed at `docs/registry/function_promise_registry_v0.8_supplement_phase3_subcycle2.md` — **12 R4 reflexive rows** (5 memory-surface + 1 observability panel + 2 backend seams + 4 registry). Matches Stage A §4 commitment exactly.
- Machine YAML regenerated: `docs/registry/machine/registry.yaml`.
- Parser at `backend/services/registry/parser.py` extended to include v0.8 supplement in `SUPPLEMENT_PATHS`.

### AC-1.6 · Owner rulings recorded (SR v3 verbatim carrier)

- `docs/rulings/phase3_subcycle2_memory_and_registry_2026-08-02.md` — six rulings verbatim.

---

## AC-2 · What discipline held (twelve gate-cell demonstrations)

| Gate cell | Discipline demonstrated | Where enforced |
|---|---|---|
| M-U1 | scoped-list is a server obligation; frontend renders what backend returns verbatim | `test_memory_and_registry_ui_gates.test.js` |
| M-U2 | class-with-claim marker on the envelope (no orphan class labels) | `test_memory_and_registry_ui_gates.test.js` |
| M-U3 | revoked plane frozen-chip verbatim + revoke section removed (immutability structural, not prop-toggled) | `test_memory_and_registry_ui_gates.test.js` |
| M-U4 | publication attempt with unset `PUBLICATION_QUALITY_THRESHOLD [SLOT]` renders GOVERNED refusal (oxblood · outcome=refused); NEVER auth-denial | `test_memory_and_registry_ui_gates.test.js` |
| M-U5 | cross-key ACL renders ACCESS-CONTROL-DENIAL (navy · `{reason,detail}` · NO `outcome` key); distinct from governed refusal | `test_memory_and_registry_ui_gates.test.js` |
| O-U1 | four aggregate sections rendered; publication rate honest at 50.0% when 1/2 | `test_memory_and_registry_ui_gates.test.js` + `test_memory_observability_o_g1_to_o_g6.py::O-G1` |
| O-U2 | `MarkedOpenSlot` for publication rate when `attempted==0` (never `0/0` as `0%`) | `test_memory_and_registry_ui_gates.test.js` + `test_memory_observability_o_g1_to_o_g6.py::O-G3` |
| O-U3 | revocation history rendered inline plainly on revoked plane (never hidden) | `test_memory_and_registry_ui_gates.test.js` + `O-G5` |
| O-U4 | `MarkedOpenSlot` for class buckets when `landed==0` per FB-13 (unset ≠ empty) | `test_memory_and_registry_ui_gates.test.js` |
| R-U1 | measured-vs-unmeasured are first-class visual states (unmeasured hatched; never `0`) | `test_memory_and_registry_ui_gates.test.js` |
| R-U2 | every figure carries a method chip | `test_memory_and_registry_ui_gates.test.js` |
| R-U3 | inference overlay renders as dormant-capability chip; NEVER fake numbers | `test_memory_and_registry_ui_gates.test.js` |
| R-U4 | every coverage gap pairs with a `Propose census →` action routing to the wizard door | `test_memory_and_registry_ui_gates.test.js` |

Backend addenda: O-G2 (cross-key 403 auth taxonomy), O-G4 (class bucketing from `class_declared` stamp_audit), O-G6 (nonexistent plane → governed refusal envelope), O-G-Parity (34/34), O-G-Aggregate-Reads-Ledger-Only (AST purity gate).

---

## AC-3 · What was NOT touched (parked items, still parked)

- Grants-revision JWT claim (PARKED · SR-5).
- B1 GPU spend ceiling figure (AWAITING OWNER FIGURE).
- Data Engineer role default (OPEN ITEM · defaults to Master Admin alias).
- Wizard draft persistence improvement (Owner: "not ruled in — do not build it").
- Publication ceremony live-writable action (SLOT unset by design; fail-loud refusal IS the sub-cycle-2 rendering).
- Govern module (sub-cycle 3 · NEXT).
- Prove + Team modules (sub-cycle 4).

---

## AC-4 · Testing agent verdict summary (iteration_8.json)

- **`retest_needed: false`**
- **`success_rate`: backend 100% · frontend 100%.**
- **`backend_issues.critical: [], .minor: []`**
- **`frontend_issues.ui_bugs: [], .integration_issues: [], .design_issues: []`**
- **`action_items: []`**
- Testing agent additive artifact: `backend/tests/live_preview/test_phase3_sc2_live.py` (6 live-preview API cells — readyz/login/plane-list/observability-shape/nonexistent-refusal/unauth-no-outcome). Kept as a regression backstop.

---

## AC-5 · Sub-cycle 2 CLOSED (Owner sign-off pending)

*End of close report. Verbatim carrier · SR v3 compliant.*
