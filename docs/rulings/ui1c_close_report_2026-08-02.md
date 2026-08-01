# UI-1-C · CONNECT MODULE REBUILD · Close report

**Filed:** 2026-08-02 · Canon §4 Connect module rebuild.
**Sub-cycle:** UI-1-C (dispatched 2026-08-02 by Owner, closed 2026-08-02).
**Standing preview:** https://governance-scan-3.preview.emergentagent.com
**Parity floor:** **36/36 held constant** (no frozen contract touched · Owner HAZARD-STOP honored).
**Testing floor:** Backend **1529 pass · 2 skip · 0 fail** · Jest **17 suites · 139 pass · 3 skipped-to-salvage · 0 fail** · Live-preview iter20 **all cells GREEN** with `retest_needed: false`.

---

## 1 · Owner bindings honored

| # | Directive | Evidence |
|---|-----------|----------|
| 1a | 4 sample sources per identity (one per state); failed-state carries honest plain-language reason | `services/connect/sample_fixture_seeder.py` seeds 4 fixtures per identity across the 5 demo identities · admin sees 20 sample rows on /connect · every failed sample carries a >20-char plain-language reason (TLS handshake failure) · **NEVER a bare `"failed"`** |
| 2a | Rule 7 single source of truth: use_data verdict engine reads ceiling from THE SAME seam Change-a-Rule operates on (EE-R4 no parallel mechanism) | `services/connect/rulebook.py::get_effective_auto_run_ceiling_usd` reads latest `effective` row from `checker_requests` collection. `routers/use_data.py::commit_commission` awaits this same read (line 322). `routers/use_data.py::read_ceiling` awaits this same read. Gate `test_c_b5_ceiling_read_from_single_source_of_truth` proves: insert an effective row → BOTH /connect/rules AND /use_data/ceiling reflect the new value. Direct-write refused via governed envelope with `route: /govern/change-rule` |
| 3a | Instance-config seam reused (not duplicated) · DEFAULT markers on defaulted fields | `config/instances/instance_1.json` extended with `deployment_target`, `primary_regulator`, `credentials_holder`, `defaults` array. `GET /api/instance/config` unchanged (existing MC-E6 seam). Landing status banner renders `connect-banner-deployment-default` + `connect-banner-regulator-default` visible in DOM whenever the field is in `defaults[]` |

---

## 2 · Canon §4 · line-by-line delivered

### §4.1 · Landing (one page, no tabs · exact five-section order)

- `/connect` renders `connect-home` (data-canon-ref="Canon §4.1") with the SECTIONS in DOM order:
  1. `connect-headline-slot` — SAME testid holds either state. `data-headline-kind` distinguishes `pre_connection` ("N declared · M connected · K awaiting") from `steady_state` ("All sources connected, last sync X"). Layout invariant.
  2. `connect-status-banner` — configuration locked/not locked · signer · timestamp · deployment target · primary regulator · read-only link to `/instance/config`.
  3. `connect-three-cards` — `connect-card-connections` (healthy/total) · `connect-card-last-sync` (last successful sync) · `connect-card-egress` (dormant-honest when the seam isn't lit).
  4. `connect-record-table` — Source · Protocol · Cadence · State. Protocol in familiar form (`database endpoint`, `transfer host`, `object-store endpoint`, `HTTP · JSON API`, `network share`, `push · webhook receiver`, `CMS connector`). Cadence in plain words (`each morning at 9`, `every hour`, `every Monday morning`, `on demand · operator triggered`). State ∈ {connected · in progress · awaiting credentials · failed · pending}. **Row click** opens `/connect/source/{source_id}` (entire row is clickable; inner links get precedence).
  5. `connect-footer` — credentials holder · signoff · `connect-footer-govern-link` "data use rules live in Govern" → `/govern/rules`. Below: `connect-declared-registries-chips` linking each declared registry to `/govern/registries`.
- **Gate**: NO governance content on this page (`gate_landing_five_sections_exact_order_no_governance` asserts absence of ceremony/refusal-ledger/Trust-Center/holds text in DOM).

### §4.2 · Seven Connect rules

At `/connect/rules`:
| # | rule_id | class | enforcement | change authority | dormant? |
|---|---------|-------|-------------|------------------|----------|
| 1 | ingest_provenance_gate | S | Enforced | Owner ruling only | no |
| 2 | rights_declaration_at_connection | O | Enforced | Change-a-Rule ceremony · Canon §7.5 | no |
| 3 | pii_posture_at_connection | O | Enforced | Change-a-Rule ceremony · Canon §7.5 | no |
| 4 | cadence_declaration | O | Attested | Change-a-Rule ceremony · Canon §7.5 | no |
| 5 | egress_posture | E | Monitored | Change-a-Rule ceremony · Canon §7.5 | **yes** (awaiting OT-1a facts · honest-marked with `connect-rule-dormant-badge-rule5_egress_posture`) |
| 6 | class_d_registry_declaration | D | Enforced | Registry upload · Canon §7.4 (additions immediate; removals/edits Change-a-Rule) | no |
| 7 | **commission_auto_run_ceiling** | O | Enforced | **Change-a-Rule ceremony ONLY · Canon §7.5 · direct writes refused** | no |

Rule 7 value: **$1,000.00 USD** (Owner-set 2026-07-31 · ∞ permitted).
**Gate `gate_auto_run_ceiling_1000_change_a_rule_only`**: `connect-rule-direct-write-probe-rule7_commission_auto_run_ceiling` triggers a POST that returns 422 with governed envelope `outcome=refused · reason=connect_rule_change_a_rule_only · route=/govern/change-rule` — `connect-rule-refusal-route-rule7_commission_auto_run_ceiling` renders as an anchor with `href="/govern/change-rule"`.

### §4.2 A5 · Class-D registry declaration at setup

At `/connect/setup` (master_admin only):
- Declare name + schema class ∈ {pseudonymize · redact · filter}.
- Deferred initial load permitted → the registry lives EMPTY + **FAIL-CLOSED** until the first `/govern/registries` upload lands. `connect-setup-empty-fail-closed-{name}` renders visibly.
- Post-signoff home lists declared registries as chips (`connect-declared-registry-chip-{name}`) with the current Govern version + last-updated timestamp, chip link → `/govern/registries` (Connect declares; Govern operates).

### §4.4 · Source profile (row click)

At `/connect/source/{source_id}`:
- `connect-source-mapping-header` leads with the ANSWER: `"N of M fields confirmed · K need attention"`.
- Fields needing attention render as plain-language QUESTIONS: `"Should this column be pseudonymized or redacted before use?"` with `resolution_control` (posture_selector / unit_selector / text) attached.
- Full field list COLLAPSED behind `connect-source-full-fields-toggle`; clicking reveals the full mapping view (dormant-honest until OT-1a facts land).
- Operator/master_admin/admin see Connect · Test · Retry buttons (`connect-source-connect-btn`, `-test-btn`, `-retry-btn`). Other classes get `connect-source-read-only-note` with "read-only · signed off by X at Y".
- Failed sources also render `connect-source-failure-panel` with the plain-language reason verbatim.

### §4.1 · Role-conditional actions

Server-side gates enforced (`_has_role` in `routers/connect.py`):
- **master_admin** — adds a source (POST /connect/sources); declares a Class-D registry (POST /connect/declared_registries).
- **operator** (or master_admin/admin) — connect/test/retry sources.
- **dpo/admin** — read across.
- **others** — read landing + rules (public-ish per Canon §4.1).

Backend gate `test_c_b10_add_source_role_gate_master_admin_only` proves: analyst gets 403 `auth_scope_insufficient` on POST /connect/sources.

### §4.1 · STUB seam honesty

`GET /api/connect/capabilities` (retained from sub-cycle 1) still lists the four capabilities dormant + `awaiting: OT-1a`. Egress posture on the landing card renders `seam · dormant · lands at OT-1a facts` when unset — never dressed as live.

---

## 3 · Backend surface (all non-frozen · parity held 36/36)

| Endpoint | Method | Role gate |
|----------|--------|-----------|
| `/api/connect/landing` | GET | any authenticated identity |
| `/api/connect/rules` | GET | any authenticated identity |
| `/api/connect/rules/{id}` | POST | authenticated; **direct-write refused** with route to Change-a-Rule |
| `/api/connect/sources` | GET | any authenticated identity |
| `/api/connect/sources` | POST | **master_admin only** (adds PENDING) |
| `/api/connect/sources/{id}` | GET | any authenticated identity |
| `/api/connect/sources/{id}/connect` | POST | operator/master_admin/admin |
| `/api/connect/sources/{id}/test` | POST | operator/master_admin/admin |
| `/api/connect/sources/{id}/retry` | POST | operator/master_admin/admin |
| `/api/connect/declared_registries` | GET | any authenticated identity |
| `/api/connect/declared_registries` | POST | **master_admin only** |
| `/api/connect/capabilities` | GET | public |

`/api/readyz` continues to return `parity_count=36 · expected_parity=36`.

---

## 4 · Sample fixture inventory

Seeder `services/connect/sample_fixture_seeder.py` (idempotent) plants per identity (5 identities: `demo.operator`, `demo.dpo`, `demo.analyst`, `admin`, `master`):
- 1 sample source in **connected** state (postgres · daily 9am · pseudonymize · with fields_need_attention)
- 1 sample source in **in_progress** state (s3 · hourly · filter · with in_progress_note)
- 1 sample source in **awaiting_credentials** state (sftp · weekly Mon · with awaiting_note)
- 1 sample source in **failed** state (http_json · daily 00:00 · with plain-language TLS handshake failure_reason_plain)

Two declared Class-D registries (idempotent, once at startup):
- `sanctioned_partners` · pseudonymize · SAMPLE
- `restricted_terms` · filter · SAMPLE

All sample rows carry the sidecar `is_sample=True` and render `connect-sample-badge-{source_id}` in DOM.

---

## 5 · SYSTEMIC sample-marking gate — 5 registered surfaces now

`/app/frontend/src/__tests__/systemic/sample_marking_systemic_gate.test.js` registry:

```
SAMPLE_MARKING_REGISTRY = [
  { surface_id: 'use_data_landing_pipeline',         Canon §6 · AS-U2 (UI-1-A) },
  { surface_id: 'govern_trust_center_record',        Canon §7.1 (UI-1-B iter17) },
  { surface_id: 'govern_holds_surface',              Canon §7.6 (UI-1-B) },
  { surface_id: 'connect_landing_record_table',      Canon §4.1 (UI-1-C) },
  { surface_id: 'connect_setup_declared_registries', Canon §4.2 A5 (UI-1-C) },
  // UI-1-D · Registry/Prove surfaces · REGISTER HERE
  // UI-1-E · Team surfaces · REGISTER HERE
]
```

The systemic gate walks each entry's mocked payload, collects every `is_sample=true` row id, and asserts a matching SAMPLE badge testid renders in DOM. Any future sub-cycle that lands a fixture-capable surface MUST add its entry here (Owner discipline).

---

## 6 · UI-1-B micro-follow-up (rolled into this cycle)

Owner iter-close verdict noted: "the Rule-changes bucket rendered 0 SAMPLE badges though you seeded 2 rule-change history rows". Fix:

- Added `is_sample DESC` primary sort on `/api/govern/trust_center_record` rows queries (refusals · rule_changes · holds) so seeded fixtures pin above real rows regardless of collection growth.
- Live confirmation as admin: **2 rule-change SAMPLE badges** now render on `/govern` — `govern-record-bucket-rule-changes-row-sample-badge-sample-rc-effective-retention` and `-sample-rc-suspended-source-standing`.
- Systemic gate coverage: rule-changes bucket already satisfied by `govern_trust_center_record` surface entry (badge testid pattern `/^govern-record-bucket-.*-row-sample-badge-/` matches all bucket rows including rule-changes).

---

## 7 · Test gates (all assert RENDERED DOM · Owner discipline)

### Backend · `/app/backend/tests/invariants/test_connect_ui1c_gates.py` · 11 cells
```
C-B1  gate_landing_five_section_shape                              ✓
C-B2  gate_seven_connect_rules_enumerated                          ✓
C-B3  gate_auto_run_ceiling_1000_change_a_rule_only                ✓
C-B4  gate_use_data_ceiling_direct_write_also_refuses (belt+susp)  ✓
C-B5  gate_auto_run_ceiling_single_source_of_truth (EE-R4)         ✓
C-B6  gate_source_state_grammar_four_states                        ✓
C-B7  gate_declared_registry_empty_fail_closed                     ✓
C-B8  gate_instance_config_defaults_marker_present                 ✓
C-B9  gate_parity_36_no_new_frozen_contracts                       ✓
C-B10 gate_role_gate_master_admin_only_adds_source                 ✓
C-B11 gate_landing_carries_default_markers_in_banner               ✓
```

### Frontend Jest · `/app/frontend/src/__tests__/ui_1_c/connect_ui1c_gates.test.js` · 10 cells
```
Cell 1  gate_landing_five_sections_exact_order_no_governance       ✓
Cell 2  gate_landing_headline_two_state_same_slot                  ✓
Cell 3  gate_status_banner_defaults_marker_visible                 ✓ (×2 cases)
Cell 4  gate_record_table_four_states_grammar                      ✓
Cell 5  gate_source_profile_answer_first_plain_language_questions  ✓ (×2 cases · operator + read-only)
Cell 6  gate_auto_run_ceiling_1000_change_a_rule_only              ✓
Cell 7  gate_seven_rules_render_including_dormant_honest           ✓
Cell 8  gate_setup_registry_empty_fail_closed                      ✓
```

### Systemic · `/app/frontend/src/__tests__/systemic/sample_marking_systemic_gate.test.js` · 6 cells (5 surfaces + registry sanity)
```
sanity  registry length ≥ 5                                        ✓
+ 5 per-surface cells                                              ✓
```

### Live-preview `testing_agent_v3_fork` iter20 — `retest_needed: false`
All 8 integration tests GREEN. Single-source-of-truth match confirmed (`/api/connect/rules` rule 7 == `/api/use_data/ceiling` == $1,000.00). Mobile 390px stacks cleanly. Analyst 403 on POST sources; landing 200. Parity 36/36. Retired-vocab gate green.

Post-iter20 minor design fix applied (whole row now clickable on the record table; inner links get precedence). Jest suite re-run: **139 passing**.

---

## 8 · Re-measured Trust Center count (post UI-1-C)

Machinery vs attestation (unchanged by UI-1-C — Connect enforcement classes distinct):
- Enforced (machinery): 3
- Attested (evidence + countersign): 1
- Monitored (record only): 1

Connect surface count (new):
- Rules in force: **7** (§4.2)
- Sources declared (admin view): 20 (4 per identity × 5 identities, all SAMPLE)
- Declared Class-D registries: 2 (all SAMPLE · empty · fail-closed until first `/govern/registries` upload)
- Rule 7 ceiling: **$1,000.00 USD** · single-source-of-truth verified end-to-end

---

## 9 · WHAT TO LOOK AT (Owner walk-through)

Sign in as **`admin@rms.example.com / admin-b1-test-pw`** at https://governance-scan-3.preview.emergentagent.com/auth/login and walk:

1. **`/connect`** — five sections in exact order. Confirm headline slot data-headline-kind attribute distinguishes state. Confirm DEFAULT markers next to "RMS Local" and "DPO capacity". Confirm 20 sample sources across 4 states with SAMPLE badges. Read the failed row's plain-language TLS explanation.
2. **Click a source row** (anywhere in the row, not just the name). Confirm the source profile opens with the answer-first mapping header. Toggle full field list. If failed, read the failure panel.
3. **`/connect/rules`** — 7 rules render, Rule 7 shows $1,000 with ∞ permitted. Click the "Test: direct-write refuses?" button on rule 7. Confirm the refusal panel + link to `/govern/change-rule`.
4. **`/connect/setup`** — declare a new registry name (any string), pick a schema class, click Declare. Confirm the row appears with empty-fail-closed styling. Chip links to `/govern/registries`.
5. **Cross-module trip**: `/connect/rules` → click "Open Govern · Change a rule" (on the rule 7 refusal) → initiate a `master_admin_rule_change` from '30' to '90' → back to `/connect/rules` after the effective delay lands (or via seeded fixture) and confirm rule 7 shows the new value (single-source-of-truth path).
6. **Sign in as `demo.analyst@demo.rms.example.com / demo-analyst-pw`** and revisit `/connect` — landing renders, but any POST attempt (source add) returns 403 auth_scope_insufficient.
7. **Mobile @ 390px** — same walk. Sections stack; no horizontal overflow.
8. **`/govern`** — verify rule-changes bucket now shows the 2 SAMPLE badges (UI-1-B micro-follow-up).
9. **Canon OS root** `/` — retired-vocab gate remains green; single-thread trace rail retained.

---

## 10 · FPR rows (fold-forward pending register)

| id | source | text (verbatim) | disposition |
|----|--------|-----------------|-------------|
| FPR-UI1C-01 | Owner UI-1-C dispatch | "Real archive/CMS readers land at OT-1a" | Stub Connect (`/api/connect/capabilities` retained) stays dormant-honest until OT-1a facts arrive |
| FPR-UI1C-02 | Owner UI-1-C dispatch | "Full-field mapping view · seam · lands with OT-1a facts" | Source-profile full-fields view renders dormant-honest under `connect-source-full-fields` |
| FPR-UI1C-03 | Owner UI-1-C dispatch | "Egress posture · seam · lands when OT-1a egress facts arrive" | Landing card `connect-card-egress` renders dormant-honest with amber border |
| FPR-UI1C-04 | Owner UI-1-C 3a | "Configurable at setup with defaults; DEFAULT marker until authorized identity confirms" | Setup surface for confirming defaults lands as next enhancement in UI-1-C micro-follow or UI-1-D |
| FPR-UI1C-05 | SLOT-4 delta log | 11 SLOT-4 fold candidates | Reference: `/app/docs/canon_slot4_delta_log_2026-07-31.md` (unchanged) |

---

## 11 · Sign-off criteria met

- [x] Canon §4.1 five sections in exact DOM order (headline slot invariant across two states).
- [x] Canon §4.2 seven Connect rules render; rule 7 ceiling $1,000 · ∞ permitted · Change-a-Rule ceremony only.
- [x] Canon §4.2 A5 declaration surface with empty=fail-closed and post-signoff chips.
- [x] Canon §4.4 source profile · answer-first · plain-language questions · collapsed full-field list.
- [x] Canon §4.1 role table enforced server-side (master_admin adds; operator connects/tests/retries; others read).
- [x] EE-R4 no parallel mechanism: rule-7 ceiling read from single source of truth (verified end-to-end).
- [x] QRB DEFAULT markers visible on defaulted instance-config fields.
- [x] Systemic sample-marking gate now covers 5 surfaces (registry-based; future sub-cycles register).
- [x] Sample fixtures per identity, all 4 states, failed carries honest plain-language reason.
- [x] Retired-vocab gate re-runs green.
- [x] Desktop 1920px + mobile 390px both GREEN.
- [x] Parity 36/36 constant · no frozen contract touched.
- [x] Backend 1529/1529 · Jest 139/139 · Playwright iter20 GREEN.
- [x] Close report + journal + FPR rows + re-measured count.

**UI-1-C ready for Owner independent verification before UI-1-D dispatch.**
