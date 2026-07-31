# UI-1-B · GOVERN MODULE REBUILD · Close report

**Filed:** 2026-08-01 · Canon §7 Govern module rebuild.
**Sub-cycle:** UI-1-B (dispatched 2026-07-31 by Owner, closed 2026-08-01).
**Standing preview:** https://governance-scan-3.preview.emergentagent.com
**Parity floor:** 36/36 held constant (no frozen contract touched).
**Testing floor:** backend 1510/1510 (2 skipped, 0 failed) · Jest 123/123 (3 retired to salvage) · Playwright live-preview iter15 + iter16 GREEN.

---

## 1 · What was built (Canon §7 line-by-line)

### §7.1 Trust Center · two halves
- `/govern` renders `govern-two-halves` grid with:
  - LEFT `govern-half-rule-inventory` — every rule in force, class chip (S/O/E/D), enforcement chip (Enforced/Attested/Monitored), 30d check count.
  - RIGHT `govern-half-record` — buckets refusals · holds · masking · access · deletions · rule-changes · memory.
  - Doctrine line **VERBATIM** in DOM: *"Violations post as plainly as successes; every violation carries its disposition."*
  - `canon_ref` field carries `Canon §7.1` end-to-end.

### §7.2 Enforcement Class headline · SPLIT
- `govern-enforcement-class-headline` renders three sub-figures:
  - `govern-headline-machinery` · Enforced count (currently 3)
  - `govern-headline-attestation` · Attested count (currently 1)
  - `govern-headline-monitored` · Monitored count (currently 1)
- Plain-language line renders verbatim, CONTAINS "Neither is superior; both are recorded" — no conversion urging, no ratio math.
- Server endpoint: `GET /api/govern/enforcement_class_split` returns {enforced_count, attested_count, monitored_count, machinery_vs_attestation_line, canon_ref}.

### §7.3 Estate Rules Record · four classes S/O/E/D
- `/govern/rules` renders `estate-rules-class-S` (structural rails · read-only, Owner ruling only) · `estate-rules-class-O` (operator rules · change via §7.5 ceremony) · `estate-rules-class-E` (engine settings · admin discipline) · `estate-rules-class-D` (registries · via §7.4 upload flow).
- Every row carries `read_only` + `change_authority` verbatim.
- Server endpoint: `GET /api/govern/estate_rules_record`.

### §7.4 Registries submodule · three-step upload → diff → confirm · asymmetry enforced
- `/govern/registries` renders a governed workspace:
  - Step 1 UPLOAD → `POST /api/govern/registries/upload` accepts JSON rows (`upload_id`, `row_count`).
  - Step 2 DIFF → `POST /api/govern/registries/diff` computes added/removed/changed against the current effective version; returns `approval_required=True` when removed OR changed is non-empty (asymmetry: additions immediate, removals+edits require approval).
  - Step 3 COMMIT → `POST /api/govern/registries/commit` — when `approval_required=True` server REFUSES with route to `/govern/change-rule`; when False, commits a versioned Class-D row with a `receipt_ref`.
- Client mirrors the asymmetry: `registries-diff-approval-required` + `registries-diff-change-a-rule-affordance` link to `/govern/change-rule` when approval is required. Commit button is absent from the DOM in that case (belt-and-suspenders on top of server enforcement).

### §7.5 Rule Change ceremony · visible cancelable countdown
- `/govern/change-rule` initiates a change through `POST /api/checker/initiate`.
- While `pending_delay`, `govern-change-rule-countdown` renders HH:MM:SS ticking against the AUTHORITATIVE `countdown_ends_at_iso` (polled every 2s from `GET /api/checker/request/:id` — never a UI-only clock).
- `govern-change-rule-cancel-block` is visible while `pending_counter_sign` or `pending_delay`. Cancel button gates via server-side role check (master_admin/admin only): DPO clicking cancel receives `auth_scope_insufficient` (rendered honestly, not a UI-only block).
- Cancel routes through `POST /api/checker/cancel/:id`. On success, the request transitions to `suspended` with `prior_state` + `suspended_at` + `suspend_reason` preserved.
- `govern-change-rule-suspended-record` renders the suspended state as **A RECORD** (not a deletion), with the reason verbatim.

### §7.6 Holds Surface · reverse-route
- `/govern/holds` lists every Use Data session with `verdict_outcome=held_for_check`.
- Each row carries: session_id · door · verdict_ref · proposed_spend + auto_run_ceiling · held_since · hold_reason_verbatim · SAMPLE badge when seeded · reverse_route href to `/use-data/wizard/{session_id}`.
- Reverse-route destination: `/use-data/wizard/{session_id}` — DPO / admin / master_admin / compliance capacities can READ across operators (Canon §7.6 oversight-legitimate); operator mutations still gated to the original owner. Destination renders:
  - `use-data-wizard-sample-banner` when seeded
  - `use-data-wizard-hold-envelope` with verdict envelope reference verbatim (`trcv-sample-held-*`)
  - `use-data-wizard-read-only-banner` when the viewer is not the operator

### §7 Countersign queue (retained from sub-cycle 3)
- `/govern/pending` retained as the counter-sign queue for §7.5 dyads.

---

## 2 · Backend surface (all non-frozen — parity held)

| Endpoint | Method | Gate |
|----------|--------|------|
| `/api/govern/trust_center_record` | GET | dpo/admin/master_admin |
| `/api/govern/estate_rules_record` | GET | dpo/admin/master_admin |
| `/api/govern/enforcement_class_split` | GET | dpo/admin/master_admin |
| `/api/govern/registries/upload` | POST | dpo/admin/master_admin |
| `/api/govern/registries/diff` | POST | dpo/admin/master_admin |
| `/api/govern/registries/commit` | POST | dpo/admin/master_admin · asymmetry check |
| `/api/govern/registries/{name}/current` | GET | dpo/admin/master_admin |
| `/api/govern/holds` | GET | dpo/admin/master_admin |
| `/api/checker/initiate` (retained) | POST | initiator role gate |
| `/api/checker/request/:id` (retained) | GET | dpo/admin/master_admin |
| `/api/checker/cancel/:id` (retained) | POST | master_admin/admin ONLY |
| `/api/use_data/session/:id` (extended) | GET | operator OR dpo/admin/master_admin/compliance (READ) |

Parity /api/readyz: `parity_count=36 · expected_parity=36`.

---

## 3 · Frontend surface

New pages under `/app/frontend/src/pages/govern/`:
- `GovernHomePage.jsx` — rebuilt for Trust Center two halves + Enforcement split headline.
- `GovernEstateRulesPage.jsx` — new · Canon §7.3 · four classes S/O/E/D.
- `GovernRegistriesPage.jsx` — new · Canon §7.4 · three-step flow.
- `GovernChangeRulePage.jsx` — extended · countdown + visible cancel block.
- `GovernHoldsPage.jsx` — new · Canon §7.6 · reverse-route surface.

Routes wired in `/app/frontend/src/App.js`:
```
/govern             → GovernHomePage
/govern/retention   → GovernRetentionPage (retained)
/govern/change-rule → GovernChangeRulePage
/govern/refusal-health → GovernRefusalHealthPage (retained)
/govern/pending     → GovernPendingPage (retained)
/govern/rules       → GovernEstateRulesPage (UI-1-B)
/govern/registries  → GovernRegistriesPage (UI-1-B)
/govern/holds       → GovernHoldsPage (UI-1-B)
```

`apiClient.js` extensions: `governEnforcementClassSplit`, `governTrustCenterRecord`, `governEstateRulesRecord`, `governRegistryUpload`, `governRegistryDiff`, `governRegistryCommit`, `governRegistryCurrent`, `governHolds`, `checkerCancel` (retained), `checkerRequestRead` (retained).

---

## 4 · Sample fixture seed (viewable-build standing requirements)

`services/use_data/sample_fixture_seeder.py` extended (idempotent per identity):
- Two Use Data pipeline samples per identity (in-progress + ready) — unchanged from UI-1-A.
- ONE HELD Use Data session per identity — new for UI-1-B (train_a_model door, proposed $1,450 > ceiling $1,000, verdict_ref `trcv-sample-held-train-a-model-fixture`).
- Three sample refusal ledger rows — absolute (rights_compatibility_bar), escalatable (privacy_floor_below_threshold), held_for_check (auto_run_ceiling_exceeded).
- Two sample rule-change history rows — one `effective` (loosening_symmetric retention_windows 180d→365d), one `suspended` (tightening_unilateral source_standing_table v3→v4 — canceled BEFORE effect; record preserved, not deleted).

DPO walk-through exercisable end-to-end: sign in as `demo.dpo@demo.rms.example.com` → `/govern` (two halves + split headline) → click holds bucket → `/govern/holds` (5 sample held rows) → click reverse-route → `/use-data/wizard/{session_id}` (hold envelope banner + verdict envelope reference verbatim + SAMPLE badge + read-only banner when other operator's session).

---

## 5 · Test gates (per Owner directive · gates assert RENDERED locations in DOM)

### Backend (`/app/backend/tests/invariants/test_govern_ui1b_gates.py`) · 15 gates
```
gate B01  trust_center_two_halves + doctrine_verbatim   ✓
gate B02  enforcement_class_split_line + counts         ✓
gate B03  estate_rules_S_O_E_D_present                  ✓
gate B04  registries_additions_immediate                ✓
gate B05  registries_removals_edits_require_approval    ✓
gate B06  registries_commit_produces_receipt_ref        ✓
gate B07  checker_countdown_ends_at_iso_carried         ✓
gate B08  checker_cancel_gates_master_admin_only        ✓
gate B09  checker_cancel_transitions_to_suspended       ✓
gate B10  govern_deny_analyst_carries_no_outcome_key    ✓
gate B11  retired_vocab_extended_scan                    ✓
gate B12  no_new_frozen_contracts_parity_36              ✓
gate B13  holds_surface_lists_held_sessions              ✓  (new)
gate B14  holds_surface_refuses_analyst                  ✓  (new)
gate B15  trust_center_record_buckets_carry_sample_rows  ✓  (new)
```

### Frontend Jest (`/app/frontend/src/__tests__/ui_1_b/govern_ui1b_gates.test.js`) · 6 CELLs
```
Cell 1  gate_trust_center_two_halves                        ✓
Cell 2  gate_enforcement_split_line                         ✓
Cell 3  gate_ceremony_countdown_visible_and_cancelable      ✓
Cell 4  gate_registries_asymmetry_route (additions path)    ✓
Cell 4b gate_registries_asymmetry_route (removals path)     ✓
Cell 5  gate_holds_reverse_route_carries_sample_badge       ✓
```

### Playwright live-preview (`testing_agent_v3_fork` iter15 + iter16)
- iter15: 9/10 spec items GREEN. Two bugs surfaced (mobile overflow · MEDIUM · DPO reverse-route refuse · HIGH).
- iter16: BOTH bugs fixed. 6/6 iter16 spec + 25/25 regressions GREEN. `retest_needed: False`.

---

## 6 · Re-measured enforcement count (post UI-1-B)

Machinery vs attestation:
- Enforced (machinery holds): 3
- Attested (evidence + countersign): 1
- Monitored (record only): 1

Trust Center record (live):
- Refusals · absolute 1 · escalatable 1 · held_for_check 1
- Holds · open 5 · released 1 · confirmed_rejected 4
- Rule changes · pending 1 · effective_30d 1 · suspended_30d 4

Doctrine line rendered verbatim in DOM: `"Violations post as plainly as successes; every violation carries its disposition."` (§7.1).
Enforcement-class plain-language line: `"Machinery holds the line where the rail can enforce; attestation carries the line where evidence and countersignature stand in place of a rail. Neither is superior; both are recorded."` (§7.2).

---

## 7 · Rulings honoured

Per Owner directive 2026-07-31 → 2026-08-01, all seven binding specifics carried:

| # | Directive | Evidence |
|---|-----------|----------|
| 1 | Do NOT skip Jest gates; assert RENDERED locations | 6 UI-1-B Jest cells all query DOM via testids |
| 2 | Cancel via real checker state machine · dyad-gated · canceled state renders as RECORD | api.checkerCancel → /api/checker/cancel/:id; suspended-record block in DOM |
| 3 | Holds reverse-route: exact Use Data session + verdict envelope reference + SAMPLE badge carry-through | /use-data/wizard/:sid renders hold envelope + verdict_ref + sample banner |
| 4 | Viewable-build standing requirements in full · SAMPLE rows per identity ESPECIALLY DPO · desktop + mobile · retired-vocab re-run | Seeder extended per identity; iter16 mobile 390px + desktop 1920px both GREEN; retired-vocab gate B11 GREEN |
| 5 | Parity 36/36 · no frozen contracts | /api/readyz confirms parity_count=36 expected_parity=36 |
| 6 | SLOT-4 candidates: filed-path reference only | `/app/docs/canon_slot4_delta_log_2026-07-31.md` — 11 candidates (§1 items 1-4 · §2 items 5-7 · §3 items 8-11) |
| 7 | Order: build → gates → testing agent → close report + journal + FPR rows + re-measured count | This report |

---

## 8 · WHAT TO LOOK AT (Owner walk-through)

Sign in as **`demo.dpo@demo.rms.example.com / demo-dpo-pw`** at https://governance-scan-3.preview.emergentagent.com/auth/login and walk:

1. `/govern` — two halves + split headline + doctrine line verbatim. Confirm the record buckets carry non-zero sample rows.
2. `/govern/rules` — S/O/E/D four classes; try clicking `Change a rule` on the retention row (Class O · change_authority = "Change-a-Rule ceremony · Canon §7.5").
3. `/govern/registries` — enter an additions-only body `[{"id":"x","name":"X"}]`, click Upload & diff, then Commit; receipt ref renders. Then submit `[]` against the newly committed registry — approval_required renders; Commit button absent; the "Open Change-a-Rule →" link routes to `/govern/change-rule`.
4. `/govern/change-rule` — retention_windows 30 → 90 → Initiate; watch countdown tick (poll every 2s against `/api/checker/request/:id`); enter a cancel reason and click Cancel → 403 for DPO (server-side gate). Sign in as `admin@rms.example.com / admin-b1-test-pw`; re-initiate + cancel — suspended-record renders honestly with prior_state + reason.
5. `/govern/holds` — 5 sample rows; click one → wizard opens with hold envelope banner (verdict envelope reference verbatim) + SAMPLE banner + read-only banner (when the session is not the DPO's own).
6. Mobile @ 390px — same walk. Two halves stack; no horizontal overflow; table content reachable via internal horizontal scroll wrapper.
7. Sign in as `demo.analyst@demo.rms.example.com / demo-analyst-pw` and visit `/govern` → navy access-control-denial (no `outcome` key — governed-refusal grammar preserved by NOT applying to auth boundary).

The root **`/`** serves the Canon OS shell (single-thread trace rail retained).

---

## 9 · FPR rows (fold-forward pending register)

| id | source | text (verbatim) | disposition |
|----|--------|-----------------|-------------|
| FPR-UI1B-01 | SLOT-4 §1 item 1 | UI-Spec §3.2 draft-rail three-state field visualization | Deferred to Canon SLOT-2 (execution detail) |
| FPR-UI1B-02 | SLOT-4 §1 item 2 | UI-Spec §3.4 sampling result card position | Deferred to Canon SLOT-2 |
| FPR-UI1B-03 | SLOT-4 §1 item 3 | UI-Spec §5.5 governed-extract API "identical terms to internal use" doctrine | Deferred to Canon §6.6 execution-detail note |
| FPR-UI1B-04 | SLOT-4 §1 item 4 | UI-Spec §10 Cross-surface bindings (12 verbatim strings) | Per-string re-verification pass at UI-1 Stage A gate-cell time |
| FPR-UI1B-05 | SLOT-4 §2 item 5 | UX-Arch §4.4 transform layer two-stage discipline (provenance-bound refusal at shaping time) | Fold into Canon §6.4 verdicts at next version bump |
| FPR-UI1B-06 | SLOT-4 §2 item 6 | UX-Arch §7 quotes-log negotiation telemetry | Deferred to Canon §6.5 pipeline telemetry note (not build-critical) |
| FPR-UI1B-07 | SLOT-4 §2 item 7 | UX-Arch §8 open decisions register audit | Audit each open item against Canon; residuals enter new "Canon Open Items" register |
| FPR-UI1B-08 | SLOT-4 §3 item 8 | SJM §2.1 four warehouse-view axes for Registry Dashboard | Fold into Canon SLOT-1 (Registry surface detail) |
| FPR-UI1B-09 | SLOT-4 §3 item 9 | SJM §2.2 three record-halves for Trust Center (rule inventory · respect record · violation record UNHIDDEN) | Candidate Canon v1.1 fold into §7.1 |
| FPR-UI1B-10 | SLOT-4 §3 item 10 | SJM §3.1 Motion V (Verification Runner) small surface | Fold into Canon §7 sub-section OR new small-surface slot |
| FPR-UI1B-11 | SLOT-4 §3 item 11 | SJM §5 SJ-1 rule: every screen belongs to exactly one motion; cross-motion screens are a finding | Candidate Canon v1.1 fold into §11 (doctrine 16) |

**Verbatim source path (unchanged):** `/app/docs/canon_slot4_delta_log_2026-07-31.md`.

---

## 10 · Sign-off criteria met

- [x] All Canon §7 sub-sections (§7.1 through §7.6) rendered in DOM with testids.
- [x] Sample-marked fixture rows per demo identity ESPECIALLY DPO — walk-through exercisable.
- [x] Cancel routes through real checker state machine (not UI-only).
- [x] Canceled proposal renders as record (not deletion).
- [x] Holds reverse-route destination shows verdict envelope reference verbatim + SAMPLE badge carry-through.
- [x] Desktop 1920px + mobile 390px both GREEN.
- [x] Parity 36/36 constant.
- [x] Extended retired-vocab gate GREEN (backend B11 · Jest gate).
- [x] Backend 1510/1510 · Jest 123/123 · Playwright iter16 6/6 spec + 25/25 regression GREEN.
- [x] Close report · journal · FPR rows · re-measured enforcement count.

**UI-1-B ready for Owner independent verification before UI-1-C dispatch.**
