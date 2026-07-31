# Close Report — Phase 3 sub-cycle 3 · Govern module

**Cycle scope:** Phase 3 · sub-cycle 3 (Govern module surfaces per Frontend Brief v2 §A2/§A4-2 + Surfaces v2 amendment §A4-2).
**Landed:** 2026-08-02.
**Testing agent verdict:** `iteration_9.json` — backend 100% · frontend 100% · zero issues · retest_needed=false.
**Parity:** 34/34 unchanged (zero new frozen contracts landed this cycle).

---

## AC-1 · What landed (verbatim inventory)

### AC-1.1 · Frontend surfaces (five new routes, module-scoped nav-visible)

- `/govern` — `GovernHomePage.jsx`. DPO landing. Ratified `UNSET_RETENTION_BANNER` verbatim when unset. Rule inventory table with value-class chips (`rails` / `rules` / `engine-settings` / `registries`) and enforcement chips (`Enforced` / `Attested` / `Monitored`). Change-authority label per row (Compliance countersignature vs Admin sign-off · §A4-2 symmetry). `MarkedOpenSlot` for every unset value. `DormantCapabilityChip` for cumulative_disclosure_thresholds (closed seam).
- `/govern/retention` — `GovernRetentionPage.jsx`. Ratified banner + three-class held-class table + retention-change ceremony + authorized-deletion ceremony with dual-approver fields. Loosening auto-routes through the checker per Amendment G Ruling 6. Marked-open destruction-attestation microcopy (A5-1 pending).
- `/govern/change-rule` — `GovernChangeRulePage.jsx`. Four-stage ceremony wizard (Propose → Counter-sign → Wait → Apply). Direction chip client-computed from numeric deltas (loosening=oxblood, tightening=sage, neutral=navy). FB-16 countdown for `pending_delay` state. Ratified `FROZEN_IS_IMMUTABLE` chip on effective rows.
- `/govern/refusal-health` — `GovernRefusalHealthPage.jsx`. Coverage marker (families-since-system-start · families-since-seam-3 · per-family since dates · earliest-across-families). Month picker for refusals-by-month. Per-family cards with the ratified `REFUSAL_ACTION_TRIPLET` verbatim + `File as extraction candidate →` action routing to `/operator/commission` (FB-10 flywheel). Honest empty-state notes at every level.
- `/govern/pending` — `GovernPendingPage.jsx`. Role-aware queue with capacity picker (compliance/admin). Countersign + Object actions inline per request. Wrong-capacity attempt (403 auth_scope_insufficient) renders `<AccessControlDeniedPanel>` (navy) — NEVER governed refusal (oxblood).

### AC-1.2 · Frontend nav (Surfaces v2 shell rule respected)

- `CONSOLE_NAV_ITEMS` in `AskConsolePage.js` extended with `/govern` (`Govern · DPO Estate`, `gate: 'auth'`). Nav menu discoverability preserved.

### AC-1.3 · apiClient extensions (six new client helpers · zero new backend paths)

- `checkerPending(role)` · `checkerInitiate(payload)` · `checkerCountersign(id, payload)` · `checkerObject(id, payload)` · `complianceRetentionWrite(payload)` · `complianceAuthorizedDeletion(payload)`. All wrap EXISTING committed endpoints (no new fetch paths per G-G8 AST gate).

### AC-1.4 · Backend seams — NO CHANGES

- Zero new endpoints. Zero new frozen contracts. All routers/services touched by these surfaces (`compliance.py`, `checker.py`, `retention_config.py`, `state_machine.py`) UNCHANGED this cycle.

### AC-1.5 · Enforcement cell count (re-measured this cycle)

- Backend: **+8 cells** (G-G1..G-G8 · parity_unchanged / retention_read_shape / checker_pending_scoped_by_capacity / loosening_routes_checker / analyst_cannot_access / refusals_coverage_shape / refusals_by_month_honest_empty_and_malformed / govern_surfaces_ast_import_gate). Suite total: **1444 pass / 2 skip / 0 fail** (up from 1421 · testing agent added 10 live-preview cells on top of my 8 = +18 total this cycle).
- Jest: **+11 cells** (4 primary FB gate cells + 5 supporting variants + 2 auxiliary discipline cells). Suite total: **27 suites / 193 pass / 0 fail** (up from 26/182).
- **Sub-cycle 3 total: 29 new enforcement cells.**

### AC-1.6 · FPR (AC-3 non-negotiable · rows-before-code)

- Supplement v0.9 landed at `docs/registry/function_promise_registry_v0.9_supplement_phase3_subcycle3.md` — **10 R4 reflexive rows** (9 frontend + 1 backend verification-only row). Matches Stage A §5 commitment exactly.
- Machine YAML regenerated: `docs/registry/machine/registry.yaml`.
- Parser at `backend/services/registry/parser.py` extended to include v0.9.

### AC-1.7 · Stage A landed (AC-1)

- `docs/stage_a_proposals/phase3_subcycle3_govern_module.md` — placement rule + screen inventory (5 screens) mapped to Frontend Brief v2 anchors + 12 FB gate cells + 10 FPR rows + parked items.

---

## AC-2 · What discipline held (twelve gate-cell demonstrations)

| Gate cell | Discipline demonstrated | Where enforced |
|---|---|---|
| gate_govern_home_renders_rule_inventory_with_class_chip | every rule row has value-class chip AND enforcement chip | `test_govern_ui_gates.test.js` |
| gate_retention_unset_banner_verbatim (×3 variants) | `UNSET_RETENTION_BANNER` byte-identical when unset; NOT rendered when set | `test_govern_ui_gates.test.js` |
| gate_change_rule_ceremony_direction_symmetry (loosening) | numeric from<to → oxblood loosening chip | `test_govern_ui_gates.test.js` |
| gate_change_rule_ceremony_direction_symmetry (tightening) | numeric from>to → sage tightening chip | `test_govern_ui_gates.test.js` |
| gate_change_rule_ceremony_direction_symmetry (wrong capacity) | 403 → access-control-denial (navy) NEVER governed refusal (oxblood) | `test_govern_ui_gates.test.js` |
| gate_refusal_health_gap_files_via_wizard_door | every family card carries File as extraction candidate → /operator/commission | `test_govern_ui_gates.test.js` |
| gate_refusal_health_honest_empty | no families surfaced → honest empty note, never error | `test_govern_ui_gates.test.js` |
| G-G1 parity_unchanged | EXPECTED_PARITY == 34; snapshot count matches | `test_govern_g_g1_to_g_g8.py` |
| G-G2 retention_read_shape | GET returns v2.1 §4.3 shape (global_default + 3 held-classes) | `test_govern_g_g1_to_g_g8.py` |
| G-G3 checker_pending_scoped | role-filter is strict subset of unfiltered | `test_govern_g_g1_to_g_g8.py` |
| G-G4 loosening_routes_checker | 202 with pending_counter_sign outcome (Amendment G Ruling 6) | `test_govern_g_g1_to_g_g8.py` |
| G-G5 analyst_cannot_access | 403 auth_scope_insufficient · NO `outcome` key | `test_govern_g_g1_to_g_g8.py` |
| G-G6 refusals_coverage_shape | families_since_seam_3 + per_family_since_date shape asserted | `test_govern_g_g1_to_g_g8.py` |
| G-G7 refusals_by_month | malformed → 400 malformed_month; empty → 200 with month key | `test_govern_g_g1_to_g_g8.py` |
| G-G8 govern_surfaces_ast_import_gate | pages/govern/*.jsx import ONLY apiClient + design; no fetch/axios | `test_govern_g_g1_to_g_g8.py` |

**Four response classes NEVER conflated · byte-clean discipline end-to-end (testing agent verified):**
- Rule-change validation refusal → `response-governed-refusal` (oxblood · `outcome=refused` / `outcome=pending_counter_sign`).
- Wrong-capacity countersign → `response-access-control-denial` (navy · `{reason, detail}` · NO `outcome` key).
- Infrastructure fault → `response-infrastructure-fault` (dark accent · never conflated with the above).

**Ratified strings verbatim in DOM:**
- `UNSET_RETENTION_BANNER` on `/govern` header + `/govern/retention` banner.
- `REFUSAL_ACTION_TRIPLET` inline on every refusal-family card.
- `FROZEN_IS_IMMUTABLE` on every effective rule-change card.

---

## AC-3 · What was NOT touched (parked items, still parked)

- Grants-revision JWT claim (PARKED · SR-5).
- B1 GPU spend ceiling figure (AWAITING OWNER FIGURE).
- Data Engineer role default (OPEN ITEM · Master Admin alias per §A5-2).
- Wizard draft persistence improvement (Owner: "not ruled in — do not build it").
- Publication ceremony live-writable action (SLOT unset by design; fail-loud refusal IS the rendering).
- Propose-attempt count chip on Estate Map (Owner: "HOLD · new scope · going to next decision batch").
- Succession · Verify · Quarantine · Release surfaces (deferred to sub-cycle 4 or later).
- Cumulative disclosure thresholds + V3 overlay (closed seams · rendered dormant only).

---

## AC-4 · Testing agent verdict summary (iteration_9.json)

- **`retest_needed: false`**
- **`success_rate`: backend 100% · frontend 100%.**
- **`backend_issues.critical: [], .minor: []`**
- **`frontend_issues.ui_bugs: [], .integration_issues: [], .design_issues: []`**
- **`action_items: []`**
- **`test_credentials`: file present and complete.**
- Testing agent additive artifact: `backend/tests/live_preview/test_phase3_sc3_govern_live.py` (10 live-preview cells — parity, admin login, retention read shape, checker pending role-scoped, loosening 202 pending_counter_sign, wrong-role auth taxonomy, refusals_coverage shape, refusals malformed-month, refusals empty-month, deletion dual-approver). Kept as regression backstop.

---

## AC-5 · Sub-cycle 3 CLOSED (Owner sign-off pending)

*End of close report. Verbatim carrier · SR v3 compliant.*
