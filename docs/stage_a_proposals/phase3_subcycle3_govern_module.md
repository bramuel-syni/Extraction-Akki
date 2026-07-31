# Stage A proposal — Phase 3 sub-cycle 3 · Govern module surfaces

**Cycle scope:** Phase 3 · sub-cycle 3 (Govern module surfaces per Frontend Brief v2 §A2/§A4-2 + Surfaces v2 amendment §A4-2).
**Owner ruling authority:** Sub-cycle 3 dispatch 2026-08-02 (pre-approved in Owner ruling 1 of the sub-cycle-2 close batch). Brief FB-IDs cited per screen per FB-19.
**Filed:** 2026-08-02.
**Parity target:** 34/34 unchanged. HAZARD-STOP if any surface requires a new frozen contract.

Reads with: `docs/mandates/AKKI_OS_FRONTEND_BRIEF_v2.md`, `docs/mandates/AKKI_OS_SURFACES_v2_AMENDMENT.md`, `docs/rulings/phase3_subcycle2_memory_and_registry_2026-08-02.md`, `docs/registry/function_promise_registry_v0.8_supplement_phase3_subcycle2.md`.

---

## §1 — Placement rule (why these surfaces land in this cycle)

Surfaces v2 §A2 places these six screen-classes inside the **Govern module**: `govEstate` · `verify` · `changeRule` · `destroy` · `quarantine` · `release` · `govSetup` · `succession`. The DPO's landing is `govEstate` (§A3). Sub-cycle 3 lands the DPO-facing surfaces that consume EXISTING committed backend endpoints (§A4-2 checker seam inside Govern; Amendment F Ruling 6 checker-mediated tightening/loosening). Sub-cycle 3 does NOT touch `succession` (deferred to sub-cycle 4 · Prove + Team) and does NOT touch `quarantine`/`release`/`verify` (verifier surfaces defer to a later slice — the extraction-console already covers verifier plumbing for wizard runs). This proposal lands the five surfaces the brief lists as governance-critical for a regulator demo:

| Screen | Backing brief clauses | Backing endpoints (all EXISTING) |
|---|---|---|
| `/govern` (Rule Inventory / Govern Estate) | FB-13 retention posture; §A2 rule inventory sentence | `GET /api/compliance/retention_config`; `GET /api/checker/pending` |
| `/govern/change-rule` (Rule Change Ceremony) | Journey-audit-captured (§3 "Rule change as visible cancelable pipeline"); FB-16 waiting-period countdown; §A4-2 checker seam | `POST /api/checker/initiate`; `POST /api/checker/countersign/{id}`; `POST /api/checker/object/{id}`; `GET /api/checker/pending`; `POST /api/compliance/retention_config` (loosening auto-routes through checker per Amendment G Ruling 6) |
| `/govern/retention` (Retention Posture) | FB-13 verbatim unset-retention banner; §3 "deletion under dual control with waiting period and destruction attestation" | `GET /api/compliance/retention_config`; `POST /api/compliance/retention_config`; `POST /api/compliance/authorized_deletion` |
| `/govern/refusal-health` (Refusal Health & Coverage) | FB-10 gap filing with demand evidence; §3 "coverage-gap refusals do not file work"; four response classes | `GET /api/compliance/refusals_coverage`; `GET /api/compliance/refusals` (with month param) |
| `/govern/pending` (Consequence-Class Checker Queue) | §A4-2 seam property "loosening enters pending counter-signature"; FB-16 countdown | `GET /api/checker/pending`; `POST /api/checker/countersign/{id}`; `POST /api/checker/object/{id}` |

**Every backing endpoint is already committed.** No new endpoint, no new frozen contract. Thin read-only aggregators are permitted per Owner ruling 2 recap; anything requiring a new frozen shape triggers HAZARD-STOP.

---

## §2 — Ratified copy discipline (A5-1 + Ruling 4)

Three ratified strings apply to Govern surfaces this cycle — implemented VERBATIM:

- `UNSET_RETENTION_BANNER` (Ruling 4 · FB-13) — the retention posture surface renders this banner unchanged whenever `global_default.retention_window_days === null` OR any held-class posture is `unset`. Byte-identical to `frontend/src/design/ratified_copy.js`.
- `REFUSAL_ACTION_TRIPLET` (Ruling 4) — every governed refusal in Govern renders the three verbatim actions. Applies to: rule-change refusals (loosening without counter-sign), deletion refusals (missing dual-approval), retention-config validation refusals.
- `FROZEN_IS_IMMUTABLE` (Ruling 4) — applies to any Govern surface displaying an applied rule change (state = `applied`); the rule row shows the frozen chip.

Every OTHER Govern-module copy slot renders via `<MarkedOpenSlot slotName={...}/>` — NEVER invented copy. Specifically the following Appendix A slots are marked-open this cycle:
- Change-rule ceremony narrative headline (per-stage descriptors).
- Deletion ceremony destruction-attestation microcopy.
- Objection reason placeholder copy.
- Refusal-family plain-language descriptors (the API returns family codes; the copy per family is A5-1 pending — marked open until Owner ruling).

Cumulative disclosure thresholds and V3 overlay remain dormant (four designed states discipline): rendered via `<DormantCapabilityChip />` on any surface that would surface them.

---

## §3 — Screen inventory (mapped to Frontend Brief v2 + Surfaces v2 + Akki v4 demo aesthetic)

### §3.1 · `/govern` — Rule Inventory / Govern Estate (DPO landing)

**Brief anchors:** FB-13 retention posture · §A2 rule-inventory sentence · §A3 DPO landing.

**Sections (top → bottom, cream #F3F2E9 background · left-aligned · Georgia wordmark):**

1. **Header** — `Akki OS` wordmark + `Govern · The DPO's Estate` subtitle + posture-line "Rule inventory · counter-signature ceremonies · refusal health".
2. **Posture banner** — the unset-retention banner (VERBATIM `UNSET_RETENTION_BANNER`) rendered as a first-class banner when retention is unset; sage-outlined "posture set" banner when explicit.
3. **Rule inventory table** — one row per governed value. Columns:
   - **Value class** chip (`rails` navy · `rules` sage · `engine-settings` amber · `registries` oxblood-outline).
   - **Rule name** (e.g. `retention.default_window_days`).
   - **Current value** OR `<MarkedOpenSlot slotName="rule_value_{slug}"/>` when unset.
   - **Enforcement class** chip (`Enforced` filled · `Attested` outlined · `Monitored` dashed).
   - **Change authority** (plain-language identity: "Compliance countersignature required" or "Admin sign-off"). §A4-2 seam property.
4. **Pending changes card** — count of `GET /api/checker/pending` results with link to `/govern/pending`.
5. **Deep-link footer** — links to Retention, Refusal Health, Pending Queue, Change Rule.

### §3.2 · `/govern/change-rule` — Rule Change Ceremony

**Brief anchors:** §3 "Rule change as visible cancelable pipeline (proposed → counter-signed → waiting → applied, cancel-before-applies)" · FB-16 countdown · §A4-2 dual-control seam.

**Sections:**

1. **Ceremony wizard** (four stages, progressive):
   - `Propose` — form with `rule_class`, `from_value_ref`, `to_value_ref` fields; direction chip (`loosening` oxblood · `tightening` sage · `neutral` navy) computed client-side from the deltas.
   - `Counter-sign` — awaits the OTHER capacity (compliance if admin proposed; admin if compliance proposed). §A4-2 symmetry: loosening requires Compliance sign-off; tightening requires Admin sign-off. Consequence-class delay visible ("Waiting period: {N} days" from `stamp_audit.consequence_class`).
   - `Wait` — FB-16 countdown timer (client-side interval; server-side `applies_after_iso` truth). `Cancel-before-applies` action visible.
   - `Apply` — final chip; state → `applied`; row acquires `FROZEN_IS_IMMUTABLE` chip.
2. **Object flow** — inline objection form on the counter-sign stage (POST `/api/checker/object/{id}` with `reason`).
3. **Refusal treatment** — when POST returns 403 `auth_scope_insufficient` (wrong capacity), renders as `<AccessControlDeniedPanel>` (navy). When state-machine refuses (e.g. loosening without checker path), renders `<GovernedRefusalCard>` with the ratified triplet.

### §3.3 · `/govern/retention` — Retention Posture

**Brief anchors:** FB-13 retention posture verbatim · §3 "deletion under dual control with waiting period and destruction attestation".

**Sections:**

1. **Global default banner** — VERBATIM `UNSET_RETENTION_BANNER` when unset; explicit-value chip when set.
2. **Held-class posture table** — three rows (typically `raw_source`, `derived`, `output`). Each row: class name · current `window_days` (or `<MarkedOpenSlot slotName="retention_window_{class}"/>` when unset) · posture chip (`inheriting` navy · `explicit` sage · `unset` amber-outline).
3. **Loosening ceremony inline** — POST `/api/compliance/retention_config` with loosening auto-routes through checker (Amendment G Ruling 6); UI renders the resulting pending-checker request as a governed pipeline row (state: `pending_countersign`).
4. **Authorized deletion ceremony** — form with `held_class`, `keys_pattern` (or slot-open when unset), dual-approver fields (proposer + counter-signer capacity). POST `/api/compliance/authorized_deletion`. Renders destruction-attestation copy slot (marked open). Refusal on missing dual-approval renders governed refusal with ratified triplet.
5. **Retention history** — from `retention.v{N}.json` versions (existing artifact store); read via `GET /api/compliance/retention_config` history field OR marked-open if not surfaced.

### §3.4 · `/govern/refusal-health` — Refusal Health & Coverage

**Brief anchors:** FB-10 gap filing with demand evidence · §3 four response classes · §2.7 refusal-in-the-answer-position.

**Sections:**

1. **Coverage marker** — from `GET /api/compliance/refusals_coverage`. Per-family since-date; earliest-across-families summary line.
2. **Refusals-this-month aggregate** — from `GET /api/compliance/refusals?month=YYYY-MM` (month picker; defaults to current month). Family totals with plain-language descriptors (marked-open pending A5-1 copy).
3. **Family drill-down cards** — per family: refusal count · coverage marker · **paths forward** section (renders the ratified `REFUSAL_ACTION_TRIPLET` inline; each action carries a marked-open placeholder for the family-specific verbatim wording pending Owner ruling). FB-10 gap-filing action `File as extraction candidate →` (routes to `/operator/commission` per FB-15 flywheel — same routing rule as Registry Estate Map coverage-gap actions).
4. **Governed-empty state** — when the ledger has no refusal rows for the month, renders the honest empty note (never a "no data" error).

### §3.5 · `/govern/pending` — Consequence-Class Checker Queue

**Brief anchors:** §A4-2 checker seam · FB-16 countdown.

**Sections:**

1. **Header** — `Pending counter-signatures` + count from `GET /api/checker/pending?role={capacity}`.
2. **Per-request card**:
   - `rule_class` + direction chip + `consequence_class` + waiting-period countdown.
   - `from_value_ref` → `to_value_ref` rendered plainly.
   - `initiator_id` + `initiator_role` visible (Ruling 2 capacity).
   - Actions: `Countersign` (POST `/api/checker/countersign/{id}`) · `Object` (POST `/api/checker/object/{id}` with reason field).
3. **Role-aware filtering** — the compliance capacity sees admin-initiated tightening (needs compliance sign-off); admin capacity sees compliance-initiated loosening (needs admin sign-off). §A4-2 symmetry client-visible.

---

## §4 — FB gate cells (Quality Rule Book §37 pattern)

Twelve enforcement cells land with this sub-cycle, per FB-18 pattern. Split: 4 UI-Jest + 8 backend-pytest.

### §4.1 UI Jest cells (frontend/src/__tests__/phase3_subcycle3/)

- `gate_govern_home_renders_rule_inventory_with_class_chip` — every row has value-class chip + enforcement-class chip.
- `gate_retention_unset_banner_verbatim` — `UNSET_RETENTION_BANNER` renders byte-identical when `global_default === null` OR any class posture is `unset`.
- `gate_change_rule_ceremony_direction_symmetry` — loosening chip on `from>to` numeric deltas; tightening on `from<to`; wrong-capacity counter-sign attempt renders access-control-denial (navy) NOT governed refusal.
- `gate_refusal_health_gap_files_via_wizard_door` — every refusal-family card's `File as extraction candidate →` action routes to `/operator/commission`.

### §4.2 Backend pytest cells (backend/tests/invariants/test_govern_g_g1_to_g_g8.py)

- `test_g_g1_parity_unchanged` — EXPECTED_PARITY == 34 unchanged.
- `test_g_g2_retention_read_returns_shape` — `GET /api/compliance/retention_config` returns `{global_default, per_class_posture, ...}`.
- `test_g_g3_checker_pending_scoped_by_capacity` — `GET /api/checker/pending?role=compliance` returns only rows requiring compliance sign-off.
- `test_g_g4_loosening_requires_checker_path` — direct `POST /api/compliance/retention_config` with a loosening delta routes through the checker (per Amendment G Ruling 6); the response carries a pending-checker `request_id`.
- `test_g_g5_wrong_capacity_countersign_refused_as_auth` — admin trying to countersign a compliance-required change returns 403 `auth_scope_insufficient` — NOT governed refusal.
- `test_g_g6_refusals_coverage_returns_family_since_dates` — coverage marker shape asserted.
- `test_g_g7_refusals_by_month_honest_empty` — malformed month returns 400 with `reason: malformed_month`; empty month returns `{families: {}, month: ..., ...}` (governed empty, never error).
- `test_g_g8_govern_reads_only_existing_endpoints` — AST/import gate over `pages/govern/*.jsx`: only `apiClient.checker*`, `apiClient.compliance*`, and observability helpers are imported; NO new fetch paths.

---

## §5 — FPR rows (AC-3 non-negotiable · v0.9 supplement)

**Landed BEFORE code (AC-3 discipline):** `docs/registry/function_promise_registry_v0.9_supplement_phase3_subcycle3.md` — 10 R4 reflexive rows:

1. `akki.frontend.govern_home_lists_rule_inventory_with_class_chips`
2. `akki.frontend.govern_retention_unset_banner_verbatim` (uses `UNSET_RETENTION_BANNER` byte-identical)
3. `akki.frontend.govern_retention_posture_read_only_v2_1_shape`
4. `akki.frontend.govern_change_rule_ceremony_symmetric_direction`
5. `akki.frontend.govern_change_rule_ceremony_countdown_visible`
6. `akki.frontend.govern_refusal_health_coverage_marker_rendered`
7. `akki.frontend.govern_refusal_health_gap_files_via_wizard_door`
8. `akki.frontend.govern_pending_queue_role_aware_filter`
9. `akki.frontend.govern_wrong_capacity_countersign_renders_access_control_denial`
10. `akki.backend.govern_surfaces_read_only_no_new_frozen_contract`

Prior supplements (v0.1..v0.8) remain byte-identical. Machine YAML regenerated post-supplement.

---

## §6 — Backend constraints (thin read-only aggregators only)

- **No new endpoint** unless the brief explicitly mandates it. All surfaces bind to endpoints listed in §1.
- **No new frozen contract.** Parity remains 34/34. HAZARD-STOP if a shape crosses an environment boundary and needs a D4b FREEZE — report to Owner before landing.
- **Read-only aggregate seam permitted** (per Ruling 2 recap): a Govern-surface thin aggregator over the Northena ledger for refusal-health-by-family may land IF the existing `/api/compliance/refusals` shape is insufficient. Initial assessment: existing shape covers §3.4 needs; NO new aggregator planned this cycle.

---

## §7 — Order and gates

- **Build order within sub-cycle 3:**
  1. Land Stage A (this document) + FPR v0.9 + regenerate machine YAML. HAZARD-STOP if any doc conflicts detected.
  2. Wire apiClient extensions (checker.pending / countersign / object; compliance.authorized_deletion) — 4 new client functions over EXISTING endpoints.
  3. Build 5 pages in `frontend/src/pages/govern/`: `GovernHomePage.jsx`, `GovernRetentionPage.jsx`, `GovernChangeRulePage.jsx`, `GovernRefusalHealthPage.jsx`, `GovernPendingPage.jsx`.
  4. Wire routes into `App.js` + extend `CONSOLE_NAV_ITEMS` with visible Govern nav entry (Surfaces v2 shell rule per sub-cycle 2 Ruling 4).
  5. Land 12 gate cells (4 Jest + 8 pytest).
  6. Testing agent (backend + frontend). Preview-URL browser check.
  7. Close report + journal + PRD update.

- **CLOSE-CONDITIONS:** all 12 gate cells green; full suites green (target: backend 1421+8=1429 pass / 0 fail; Jest 26+? suites / 182+? pass / 0 fail); parity 34/34 unchanged (report if a seal event is genuinely required); preview URL renders `/govern` cleanly; nav reachable; demo login unaffected; testing agent verdict as operative close signal.

---

## §8 — Parked items (unchanged; do not build)

- Grants-revision JWT claim (PARKED · SR-5).
- B1 GPU spend ceiling figure (AWAITING OWNER FIGURE).
- Data Engineer role default (OPEN ITEM · Master Admin alias per §A5-2).
- Wizard draft persistence improvement (Owner: "not ruled in — do not build it").
- Publication ceremony live-writable action (SLOT unset by design; fail-loud refusal IS the rendering).
- Propose-attempt count chip on Estate Map (offered post sub-cycle 2 close; Owner: "HOLD · new scope · going to next decision batch").
- Cumulative disclosure thresholds (closed seam · render dormant only).
- V3 overlay (closed seam · render dormant only).
- Succession · Verify · Quarantine · Release surfaces (deferred to sub-cycle 4 or later).

═══════════════════════════════════════════════════════════════════

*End of Stage A proposal. AC-3 discipline: FPR v0.9 supplement lands BEFORE code. Owner Ruling authority: sub-cycle 3 dispatch 2026-08-02. No frozen contracts, no new endpoints. On HAZARD-STOP: report to Owner before proceeding.*
