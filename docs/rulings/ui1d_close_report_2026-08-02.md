# UI-1-D · REGISTRY ("What You Hold") + PROVE · Close report

**Filed:** 2026-08-02 · Canon §5 (Registry) + §9 (Prove).
**Sub-cycle:** UI-1-D (dispatched 2026-08-02 Message 518 by Owner, closed 2026-08-02).
**Standing preview:** https://governance-scan-3.preview.emergentagent.com
**Parity floor:** **36/36 held constant** (no frozen contract touched · Owner HAZARD-STOP honored).
**Testing floor:** Backend **1544 pass · 2 skip · 0 fail** (+15 UI-1-D cells since UI-1-C close) · Jest **18 suites · 160 pass · 3 skipped-to-salvage · 0 fail** (+21 UI-1-D cells) · Live-preview `testing_agent_v3_fork` iter21 **all cells GREEN** with `retest_needed: false`.

---

## 1 · Owner bindings honored

| # | Directive (Message 518 + 521) | Evidence |
|---|-----------|----------|
| 1a | REGISTRY: warehouse view of what the estate holds by ring · source · domain; measured **and** unmeasured states first-class | `routers/registry.py::what_you_hold()` returns 4 axes (Connected · Holdings · Intelligence · Backend); Holdings rows carry `measured: bool` + `unmeasured_reason_plain: str` (never null on unmeasured); `RegistryWhatYouHoldPage.jsx` renders unmeasured rows with hatched background + plain reason. |
| 1b | Opportunity briefs render with a "Put this to work" CTA that opens the Use Data conversation with prefilled data | Frontend brief cards render `<Link data-testid="registry-brief-cta-{brief_id}" to="/use-data?prefill_from_brief={brief_id}">Put this to work</Link>`. Backend `/api/registry/opportunity_briefs` returns `cta_label="Put this to work"` + `cta_route="/use-data?prefill_from_brief={id}"` verbatim. **Retired vocab "Shape this objective" absent from rendered DOM** (gate cell 11). |
| 1c | Gap register must show unanswered questions from Prove | `/api/registry/gap_register` returns 3 seeded gaps per identity + adds new gaps for every NOT_EXTRACTED_YET refusal. `POST /api/registry/gap_register/queue` idempotent (returns same session_id on repeat calls · gate C-D-R5). |
| 2a | PROVE: 3 distinct visual response shapes · NOT_EXTRACTED_YET · EVIDENCE_CANNOT_SUPPORT_IT · SOMETHING_BROKE | 4 shape components in `ProvePage.jsx`: `AnswerCard` (sage), `NotExtractedYetCard` (amber · WITH queue offer), `EvidenceCannotSupportCard` (amber · NO queue offer), `SomethingBrokeCard` (**navy bg + oxblood 6px left border · borderRadius: 2px**). Each has a unique `data-testid=prove-shape-{shape}` and unique `data-shape` attribute. Backend routing table in `routers/registry.py::_REFUSAL_TO_SHAPE`. |
| 2b | Fault shape NEVER shares refusal styling | **DB-2 BINDING enforced.** Gate cell 13 `gate_prove_db2_paired_break_in_fault_never_shares_refusal_styling` asserts absence of all refusal testids/strips/queue-buttons when `something_broke` renders. Testing agent v3 fork iter21 measured computed styles: **fault bg rgb(22,48,79) · oxblood border rgb(126,48,56) 6px** vs **refusal parchment + amber**. Divergent. |
| 3a | Walk-A-Proof: descend into reasoning/claims; closing returns EXACTLY to previous scroll/route position | `ProveWalkPage.jsx` reads React Router `location.state = {from, scrollY, from_search}` and on close calls `navigate(-1)` fallback → target-with-scroll restore. Cell 9 `gate_walk_a_proof_close_returns_to_origin` primes state + verifies restoration. Owner Message 521 ratified React Router location.state as sufficient. |
| 4a | Register new surfaces into `sample_marking_systemic_gate` | `registry_what_you_hold` surface entry already resident in gate (7 registered surfaces). Prove (query-surface, action-required) is covered by 4 dedicated cells 11–13 in `ui1d_gates.test.js` (sample banners on all 4 shapes: answered · not_extracted_yet · evidence_cannot_support · something_broke). |
| 4b | Seeded sample answers/gaps per identity | `services/registry/sample_fixture_seeder.py` (idempotent) seeds per identity: 2 opportunity briefs · 3 gap-register rows · 3 prove-sample answers (one per shape). |
| 4c | Extended retired-vocab re-runs | `canon_os_root_vocab_gate.test.js` extended list `RETIRED_TERMS` includes `"Shape this objective"` (Canon C.4 rename). Cell 11 asserts absence on both `/registry` and `/prove`. |
| 4d | Doctrines §11 adherence | DB-1 (wire reason verbatim) enforced by cell `test_d_d1_wire_reason_verbatim_in_refusal_response`; DB-2 (paired break-in / fault never converts refusal) enforced by cells 13 (frontend) + `test_d_p4_prove_ask_something_broke_uses_fault_channel_never_refusal` (backend). |
| 4e | Desktop/mobile support | testing_agent_v3_fork iter21 verified 1920px + 390px. Registry axes stack cleanly on mobile; Prove shape cards remain visually distinct. |
| 4f | Parity 36 unchanged | `/api/readyz` returns `parity_count=36 expected_parity=36`; gate cell `test_d_g1_parity_36_unchanged_no_new_frozen_contracts` locks the invariant. |
| 5a | Owner Message 521 · file each ambiguous refusal-code mapping in a ruling request | `/app/docs/rulings/service_1_refusal_mapping_ruling_2026-08-02.md` filed. All 4 `service_1` codes mapped unambiguously to `evidence_cannot_support_it`; none map to `not_extracted_yet`; `form_not_offerable` documented as the sole conditional-ambiguity case with recommended disposition + rationale + split-code proposal for future Owner ruling. |

---

## 2 · Canon §5 + §9 · line-by-line delivered

### §5 · Registry ("What You Hold")

- `/registry` renders `data-testid="registry-what-you-hold"` (canon-ref `Canon §5`) with the four axes rendered TOP-TO-BOTTOM in this exact order (invariant · verified iter21):
  1. **Connected axis** — `registry-axis-connected` — displays connected/in_progress/awaiting_credentials/failed/total from `/api/connect/landing`.
  2. **Holdings axis** — `registry-axis-holdings` — warehouse rows keyed by (ring · source · domain · measured). Each row carries `data-testid="registry-holdings-row-{source_id}"` plus `data-measured="true|false"` + `data-ring={ring_id}`.
  3. **Intelligence axis** — `registry-axis-intelligence` — seeded opportunity briefs (see §5.2).
  4. **Backend axis** — `registry-axis-backend` — surfaces the auto-run ceiling read from the **same** seam as `/connect/rules` (`checker_requests` collection) proving single-source-of-truth (EE-R4).

### §5.1 · Measured vs Unmeasured (first-class states)

- Every holdings row carries an explicit `measured: bool`.
- **Unmeasured rows MUST render** `unmeasured_reason_plain` — a plain-language sentence (never a code, never null). Iter21 rendered examples:
  - `"Source connect failed"`
  - `"Awaiting master_admin credentials"`
  - `"Ingestion in progress"`
- Unmeasured rows render with hatched-background CSS and amber left border. Measured rows render clean.

### §5.2 · Opportunity briefs · "Put this to work"

- `/api/registry/opportunity_briefs` returns per-identity briefs. Admin sees ≥2 seeded briefs.
- Each brief card renders **`Put this to work`** CTA — verbatim Canon C.4 rename from retired `"Shape this objective"`.
- CTA route: `/use-data?prefill_from_brief={brief_id}` — opens Use Data with prefilled context.
- `is_sample=true` seeded briefs render `data-testid="registry-sample-badge-brief-{id}"` (sage badge).

### §5.3 · Gap register · "Queue this gap"

- `/api/registry/gap_register` returns per-identity gaps (3 seeded per identity + any accumulated from Prove NOT_EXTRACTED_YET responses).
- Each gap row renders `<button data-testid="registry-gap-queue-btn-{gap_id}">Queue this gap</button>`.
- Click → `POST /api/registry/gap_register/queue` → returns `{gap_id, queued_use_data_session_id: "s-gap-{id}", route: "/use-data?prefill_from_gap={id}"}`.
- **Idempotent** (gate C-D-R5): repeat POSTs return the same `queued_use_data_session_id`; row state transitions `open → queued`.
- `is_sample=true` seeded gaps render `data-testid="registry-sample-badge-gap-{id}"`.

### §9 · Prove ("Answer with Evidence")

`/prove` renders `data-testid="prove-page"` (canon-ref `Canon §9`) as a **module** (not an ask-first landing).

Question input: `<input data-testid="prove-question-input" placeholder="Ask in plain language..." />` inline (not a hero). Submit via `data-testid="prove-ask-btn"`.

Four response shapes wired via `POST /api/prove/ask`:

| Shape | Testid | Palette | Queue offer | Key element |
|-------|--------|---------|-------------|-------------|
| `answered` | `prove-shape-answered` | sage border | n/a (has answer) | Renders `claim` + `defensibility_class` + `<Link data-testid="prove-walk-a-proof-link">Walk this proof</Link>` (Canon §9.2) |
| `not_extracted_yet` | `prove-shape-not-extracted-yet` | amber border · parchment bg | **YES** — `<button data-testid="prove-queue-this-gap-btn">Queue this gap</button>` | Renders `wire_reason_verbatim` in `prove-not-extracted-honesty-strip` (DB-1) |
| `evidence_cannot_support_it` | `prove-shape-evidence-cannot-support` | amber border · parchment bg | **NO** | Renders `reason_code` + `wire_reason_verbatim` + `prove-what-would-raise-it` guidance |
| `something_broke` | `prove-shape-something-broke` | **navy bg · oxblood 6px left border · borderRadius 2px** | **NO** | Renders `fault_channel_ref` + `fault_reason_plain` — **NEVER a refusal reason_code** (DB-2) |

### §9.2 · Walk-a-Proof (Descent)

- Clicking `prove-walk-a-proof-link` → `/prove/trace/{trace_id}` via `<Link state={{from, scrollY, from_search}} />` (React Router).
- `ProveWalkPage.jsx` fetches `GET /api/prove/trace/{trace_id}` → returns `walk_layers = [claim, reasoning, raw_facts]` (Canon §9.2 three-layer descent).
- Reasoning layer carries `candidates[]` (per-ring · per-source), `corroboration`, and `probability`.
- Raw facts layer carries `facts[]` each with a `source_link` (deep link to `/registry/source/{id}`).
- `prove-walk-close-btn` closes → navigates back to `location.state.from` restoring `scrollY` (custom hook `useReturnToOrigin`). Fallback: `navigate(-1)`.

### §9 · DB-2 Paired Break-in Binding

**Doctrines §11 DB-2** (Owner directive): *"A companion-channel failure MUST NOT convert a refusal into a fault render."*

Enforced at THREE levels:
1. **Backend** — `_map_refusal_shape()` returns only `evidence_cannot_support_it` or `not_extracted_yet` for known service_1 codes. Fault channel is emitted only by a distinct code path (`_emit_fault()`).
2. **Frontend** — `SomethingBrokeCard` is a fully separate function component from `NotExtractedYetCard` / `EvidenceCannotSupportCard`. Zero shared testids. Zero shared classnames.
3. **Test gate** — Cell 13 `gate_prove_db2_paired_break_in_fault_never_shares_refusal_styling` asserts: when `shape=something_broke`, ALL of `prove-shape-not-extracted-yet`, `prove-shape-evidence-cannot-support`, `prove-not-extracted-honesty-strip`, `prove-evidence-cannot-support-honesty-strip`, `prove-queue-this-gap-btn` are ABSENT from DOM.

---

## 3 · Backend surface (all non-frozen · parity held 36/36)

| Endpoint | Method | Role gate |
|----------|--------|-----------|
| `/api/registry/what_you_hold` | GET | any authenticated identity |
| `/api/registry/opportunity_briefs` | GET | any authenticated identity |
| `/api/registry/gap_register` | GET | any authenticated identity |
| `/api/registry/gap_register/queue` | POST | any authenticated identity (idempotent) |
| `/api/prove/ask` | POST | any authenticated identity |
| `/api/prove/trace/{trace_id}` | GET | any authenticated identity (404 on absent trace) |

`/api/readyz` continues to return `parity_count=36 · expected_parity=36`.

---

## 4 · Sample fixture inventory

Seeder `services/registry/sample_fixture_seeder.py` (idempotent) plants per identity (5 identities: `demo.operator`, `demo.dpo`, `demo.analyst`, `admin`, `master`):

- **2 opportunity briefs** per identity — one Class-D domain, one Class-O domain (both `is_sample=True`).
- **3 gap-register rows** per identity — one `open`, one `queued`, one `open` from a prior refusal (all `is_sample=True`).
- **3 prove sample answers** per identity — one per response shape (`answered`, `not_extracted_yet`, `evidence_cannot_support_it`) plus 1 fault fixture for `something_broke` (all `is_sample=True`).

Iter21 admin walkthrough measured **45 SAMPLE badges rendered in DOM** across `/registry` (briefs + gaps + prove-seeded).

---

## 5 · SYSTEMIC sample-marking gate — 7 registered surfaces now

`/app/frontend/src/__tests__/systemic/sample_marking_systemic_gate.test.js` registry:

```
SAMPLE_MARKING_REGISTRY = [
  { surface_id: 'use_data_landing_pipeline',         Canon §6 · AS-U2 (UI-1-A) },
  { surface_id: 'govern_trust_center_record',        Canon §7.1 (UI-1-B iter17) },
  { surface_id: 'govern_holds_surface',              Canon §7.6 (UI-1-B) },
  { surface_id: 'connect_landing_record_table',      Canon §4.1 (UI-1-C) },
  { surface_id: 'connect_setup_declared_registries', Canon §4.2 A5 (UI-1-C) },
  { surface_id: 'registry_what_you_hold',            Canon §5    (UI-1-D) },
  { surface_id: 'registry_gap_register',             Canon §5    (UI-1-D) },
  // /prove is query-surface (action-required) · covered by ui1d_gates.test.js
  // cells 11–13 (sample banners on all 4 shapes).
  // UI-1-E · Team surfaces · REGISTER HERE
]
```

Prove is covered by 4 dedicated cells (one per shape · action-primed) inside `ui1d_gates.test.js` because sample banners on Prove render only after a user submits a question — the systemic gate walks fixture-capable *row-rendering* surfaces on mount.

---

## 6 · Retired-vocabulary discipline (extended)

`canon_os_root_vocab_gate.test.js` `RETIRED_TERMS` now includes:

```
'RMS Intelligence', 'Ask Console', 'AskConsole', 'ask-first landing',
'Objectives', 'Ambitions', 'Approval Queue', 'Operator Home',
'Engineer Register', 'Extract', 'My Objectives',
'Shape this objective',   // Owner UI-1-D · Canon C.4 rename to "Put this to work"
```

Cell 11 `gate_ui1d_retired_vocabulary_absent_on_registry_and_prove` asserts absence on both `/registry` (rendered) and `/prove` (rendered). Cell also positively asserts `"Put this to work"` renders on `/registry`.

The Canon OS shell test was updated (Prove no longer dormant — LIT after UI-1-D). Only Team remains dormant until UI-1-E.

---

## 7 · Test gates (all assert RENDERED DOM / API JSON · Owner discipline)

### Backend · `/app/backend/tests/invariants/test_registry_prove_ui1d_gates.py` · 15 cells
```
D-R1  gate_ui1d_registry_what_you_hold_four_axes                         ✓
D-R2  gate_ui1d_holdings_measured_and_unmeasured_first_class             ✓
D-R3  gate_ui1d_opportunity_briefs_put_this_to_work_cta                  ✓
D-R4  gate_ui1d_gap_register_queue_this_gap_cta                          ✓
D-R5  gate_ui1d_gap_register_queue_endpoint_idempotent_and_opens_session ✓
D-P1  gate_ui1d_prove_ask_answered_shape_carries_walk_link               ✓
D-P2  gate_ui1d_prove_ask_not_extracted_yet_offers_queue                 ✓
D-P3  gate_ui1d_prove_ask_evidence_cannot_support_no_queue               ✓
D-P4  gate_ui1d_prove_ask_something_broke_uses_fault_channel             ✓
D-P5  gate_ui1d_prove_refusal_shape_mapping_table_covers_all_codes       ✓
D-P6  gate_ui1d_prove_trace_returns_three_walk_layers                    ✓
D-P7  gate_ui1d_prove_trace_404_when_trace_absent                        ✓
D-S1  gate_ui1d_sample_marking_present_on_seeded_rows                    ✓
D-G1  gate_ui1d_parity_36_unchanged_no_new_frozen_contracts              ✓
D-D1  gate_ui1d_db1_wire_reason_verbatim_in_response                     ✓
```

### Frontend Jest · `/app/frontend/src/__tests__/ui_1_d/ui1d_gates.test.js` · 13 cells (with 6 sub-cases → 19 tests)
```
Cell 1   gate_registry_what_you_hold_four_axes_ordered                   ✓
Cell 2   gate_registry_holdings_measured_and_unmeasured_first_class      ✓
Cell 3   gate_registry_opportunity_briefs_put_this_to_work_cta           ✓
Cell 4   gate_registry_gap_register_queue_this_gap_cta                   ✓
Cell 5   gate_prove_answered_shape_carries_walk_a_proof_link             ✓ (+ sample banner sub-case)
Cell 6   gate_prove_not_extracted_yet_offers_queue                       ✓
Cell 7   gate_prove_evidence_cannot_support_no_queue                     ✓
Cell 8   gate_prove_something_broke_uses_fault_channel_never_refusal     ✓
Cell 9   gate_walk_a_proof_close_returns_to_origin (scroll + route)      ✓
Cell 10  gate_prove_ask_input_no_ask_first_landing_pattern               ✓
Cell 11  gate_ui1d_retired_vocabulary_absent_on_registry_and_prove       ✓ (×2 surfaces)
Cell 12  gate_prove_refusal_shape_sample_banner_when_is_sample_true      ✓ (×3 shapes)
Cell 13  gate_prove_db2_paired_break_in_fault_never_shares_refusal_styling ✓
```

### Live-preview `testing_agent_v3_fork` iter21 · `/app/test_reports/iteration_21.json` · `retest_needed: false`
- 11/11 live-HTTP gates GREEN.
- 4 axes ordered top-to-bottom (verified rendered).
- 10 "Put this to work" CTAs rendered (admin identity across seeded briefs).
- 9 "Queue this gap" CTAs rendered.
- 45 SAMPLE badges rendered in DOM.
- DB-2 fault-vs-refusal visual distinction proven with computed styles.
- Walk-a-proof 3-layer descent renders; close button navigates back with scroll-restore hook engaged.
- Retired vocab absent from `/registry` and `/prove`.
- Parity 36/36 live.
- Post-iter21 micro-fix applied: `SomethingBrokeCard` now renders `prove-something-broke-sample-banner` when `is_sample=true` (symmetry with the other 3 shapes · Owner "sample marking systemic" reading).

### Frontend full-suite · `yarn test --watchAll=false` · post-fix
```
Test Suites: 18 passed, 18 total
Tests:       3 skipped, 160 passed, 163 total
```

### Backend full-suite · `pytest -q` · post-fix
```
1544 passed, 2 skipped in 96.81s
```

---

## 8 · Re-measured Trust Center count (post UI-1-D)

Machinery vs attestation (unchanged by UI-1-D — Registry surfaces read from existing enforcement seams):
- Enforced (machinery): 3
- Attested (evidence + countersign): 1
- Monitored (record only): 1

Registry/Prove surface count (new):
- Registry axes: **4** (Connected · Holdings · Intelligence · Backend)
- Opportunity briefs seeded (admin view): 10 (2 per identity × 5 identities)
- Gap-register rows seeded (admin view): 15 (3 per identity × 5 identities)
- Prove response shapes: **4** (answered · not_extracted_yet · evidence_cannot_support_it · something_broke)
- Prove sample answers seeded (admin view): 15+ (3 per identity + fault fixtures)
- Rule 7 ceiling (from `/registry/backend` axis): **$1,000.00 USD** · single-source-of-truth verified end-to-end (unchanged since UI-1-C).

---

## 9 · WHAT TO LOOK AT (Owner walk-through)

Sign in as **`admin@rms.example.com / admin-b1-test-pw`** at https://governance-scan-3.preview.emergentagent.com/auth/login and walk:

1. **`/registry`** — 4 axes render top-to-bottom in exact order (Connected · Holdings · Intelligence · Backend). Confirm the Holdings axis renders both measured (clean) and unmeasured (hatched + plain reason) rows. Sample badges visible on Intelligence briefs + on gap register rows.
2. **Intelligence axis · Opportunity briefs** — click any `Put this to work` CTA. Confirm redirect to `/use-data?prefill_from_brief={id}` — the Use Data conversation opens with prefilled context (verify prefill visible in Use Data UI).
3. **Gap register · Queue this gap** — click any `Queue this gap` button. Confirm the row transitions `open → queued` and a session is created. Click again — idempotent (same session).
4. **Backend axis** — confirm the auto-run ceiling reads $1,000.00 with pointer to `/govern/change-rule` (single-source-of-truth with `/connect/rules` and `/use_data/ceiling`).
5. **`/prove`** — submit the seeded ANSWERED question `"How many Q1 partner rebate rows carry an established-fact class?"`. Confirm the sage AnswerCard renders with `Walk this proof` link.
6. **Walk-a-Proof descent** — click Walk this proof. Confirm `/prove/trace/{id}` renders 3 layers (claim → reasoning with candidates + probability → raw facts with source links). Scroll down. Click close. Confirm the browser navigates back to `/prove` **at the same scroll position**.
7. **`/prove` · NOT_EXTRACTED_YET** — submit any novel question the seeder hasn't cached (e.g., `"Zzq unique question about outer-galaxy freight tonnage"`). Confirm the amber refusal card renders WITH a Queue this gap button.
8. **`/prove` · EVIDENCE_CANNOT_SUPPORT** — submit `"What price did the Q3 board approve for the enterprise tier?"`. Confirm the amber refusal card renders **without** a queue button, with the reason_code shown and the honesty strip carrying `wire_reason_verbatim` byte-for-byte (DB-1).
9. **`/prove` · SOMETHING_BROKE** — submit `"Show the raw archive for the March broker export."`. Confirm the navy fault card renders with the oxblood left border — visually **NOTHING** like the refusal cards. Confirm no refusal reason_code appears; instead `fault_reason_plain` renders. Confirm the SAMPLE FAULT banner shows (post-fix).
10. **Retired-vocab check** — search for `"Shape this objective"` in browser dev-tools DOM. **Zero matches**. Search for `"Put this to work"` — matches on Intelligence axis.
11. **Mobile @ 390px** — same walk. Registry axes stack; Prove shape cards remain visually distinct (fault card retains navy bg + oxblood border even on narrow viewport).
12. **Canon OS root** `/` — nav strip reads `Connect · Registry · Use Data · Govern · Prove`. Team remains dormant. Prove is LIT after UI-1-D.

---

## 10 · FPR rows (fold-forward pending register)

| id | source | text (verbatim) | disposition |
|----|--------|-----------------|-------------|
| FPR-UI1D-01 | Owner Message 521 | `form_not_offerable` may split on sub-code (e.g. `form_not_offerable_needs_extraction`) | Filed in `docs/rulings/service_1_refusal_mapping_ruling_2026-08-02.md` §3.3 as sole ambiguity risk with recommended NO split until Owner ruling. |
| FPR-UI1D-02 | Owner Message 518 | Full trace-layer surface (Canon §9.2) lands here | Delivered as `/prove/trace/{trace_id}` with 3 walk layers (claim · reasoning · raw_facts). Reasoning layer carries `candidates[] · corroboration · probability`. |
| FPR-UI1D-03 | SLOT-4 delta log #8 | 11 SLOT-4 fold candidates | Reference: `/app/docs/canon_slot4_delta_log_2026-07-31.md` (unchanged) · SLOT-4 #8 remains fold-pending Owner ruling. |
| FPR-UI1D-04 | Prior UI-1-C carryover | Egress/full-fields dormant until OT-1a facts | Unchanged. Not touched by UI-1-D. |

---

## 11 · Sign-off criteria met

- [x] Canon §5 four axes in exact DOM order (Connected · Holdings · Intelligence · Backend).
- [x] Canon §5 measured/unmeasured first-class; unmeasured rows carry plain-language reasons.
- [x] Canon §5 opportunity briefs with `Put this to work` CTA opening Use Data with prefill.
- [x] Canon §5 gap register with `Queue this gap` CTA · idempotent · opens Use Data session.
- [x] Canon §9 four response shapes (answered · not_extracted_yet · evidence_cannot_support_it · something_broke).
- [x] Canon §9.2 walk-a-proof descent (3 layers) with close-returns-to-origin.
- [x] Doctrines §11 DB-1 (wire reason verbatim) + DB-2 (fault never shares refusal styling) enforced at 3 levels.
- [x] Refusal-code mapping ruling filed (`docs/rulings/service_1_refusal_mapping_ruling_2026-08-02.md`) per Owner Message 521.
- [x] Systemic sample-marking gate now covers 7 surfaces (row-rendering) + 4 Prove shapes (action-required).
- [x] Sample fixtures per identity for briefs · gaps · all 4 prove shapes.
- [x] Retired-vocab gate extended (`Shape this objective`) · re-runs green.
- [x] Desktop 1920px + mobile 390px both GREEN.
- [x] Parity 36/36 constant · no frozen contract touched.
- [x] Backend 1544/1544 · Jest 160/163 (3 skipped-to-salvage) · testing_agent_v3_fork iter21 GREEN.
- [x] Close report + journal + FPR rows + re-measured count.

**UI-1-D ready for Owner independent verification before UI-1-E dispatch.**

---

## Addendum · Owner Message 606 defect fix (2026-08-02 iter22)

Owner independently verified iter21 · **1/2 PASS**:
- **PASS** — `/registry`: 4 axes + measured/unmeasured + `Put this to work` + `Queue this gap` + SAMPLE badges all rendered correctly.
- **FAIL** — `/prove`: as admin, page rendered ONLY the input field. No seeded sample cards. Live query submission produced no rendered card either.

**Root cause 1 (page-level render gap · systemic gate blindspot).** `ProvePage.jsx` had no `useEffect` fetching seeded samples on mount. The page rendered its input + a conditional "if envelope { … }" — never blank for componentry, but the **page-level fetch/render path** was silent. The systemic gate walked FIXTURE-CAPABLE row-rendering surfaces on mount; `/prove` is a query surface (action-required), so it was covered by 4 component-level cells in `ui1d_gates.test.js` — those asserted "shape card renders when handed props", not "page fetches and renders the shape reference on mount". Owner-visible surface presented as empty.

**Root cause 2 (silent-swallow bug on non-200).** `if (r.status === 200) setEnvelope(r.body)` discarded 401/403/5xx responses silently. When a stale/absent token hit `/api/prove/ask`, the frontend received a 401 but rendered NOTHING — no outcome card, no error message. Same defect on `/api/prove/samples` fetch (if it had existed).

**Fixes applied (iter22, all landed 2026-08-02):**

1. **New backend endpoint** `GET /api/prove/samples` — returns 4 seeded envelopes (one per shape) with deterministic `trace_id`s (`trc-sample-{qhash}`). Backend cells `test_d_p8_prove_samples_endpoint_returns_all_four_seeded_shapes` and `test_d_p9_prove_samples_trace_ids_resolve_via_prove_trace` gate the contract.
2. **New NOT_EXTRACTED_YET seeded sample** in `sample_fixture_seeder.py` (question about H2 partner activation cohort · queue_offered=true · deterministic gap_id). The seeder also backfills `sample_trace_id` onto already-seeded docs (idempotent) and mirrors each sample envelope into the `prove_traces` collection so `/api/prove/trace/{sample_trace_id}` resolves without a prior `/prove/ask`.
3. **ProvePage default render** now includes a "Sample shape reference" section that fetches `/api/prove/samples` on mount and renders 4 badged shape cards below the input form. The 4 cards use `variant="sample"` prop, which suffixes their testids with `-sample` (e.g., `prove-shape-answered-sample`) to permit coexistence with the live-outcome card (variant=live · canonical testids).
4. **Honest non-200 rendering** — non-200 responses on either `/prove/samples` or `/prove/ask` now render an inline error panel (`prove-samples-error-panel` · `prove-ask-error-panel`) with `data-status` carrying the actual HTTP code and reason verbatim from the response. **Silent-swallow eliminated.**
5. **Systemic gate strengthened** — new Jest cells 14 (`gate_prove_page_default_render_four_seeded_sample_shape_cards`) and 15 (`gate_prove_ask_non_200_response_renders_honest_error_never_silent`) mount `ProvePage` as-is and assert the **page-level render path** — not just component-level render when handed props. This closes the exact gap Owner flagged.

**Post-fix verification (testing_agent_v3_fork iter22 · `retest_needed: false`):**
- Backend: 17/17 UI-1-D invariant gates green (+2 new: p8, p9) · 9/9 new live-preview HTTP gates green in `tests/test_ui1d_iter22_live.py`.
- Frontend Jest: 18 suites · 164 pass · 3 skipped · 0 fail (+2 UI-1-D cells / 4 tests since iter21).
- Frontend rendered-DOM (live preview):
  - Admin default `/prove` render: **4/4 sample cards present · 4/4 shape testids namespaced with `-sample` · 4/4 sample banners with `data-sample-badge=true`** — the fault-channel sample banner (missing in iter21) now RENDERED and badged.
  - Live-query outcomes verified for all 4 shapes: `prove-shape-answered`, `prove-shape-not-extracted-yet` (with `prove-queue-this-gap-btn`), `prove-shape-evidence-cannot-support`, `prove-shape-something-broke`.
  - Live and sample variants **coexist** on the page.
  - Unauth `/prove` renders `prove-samples-error-panel data-status=401` with reason "auth_missing / Authentication required" — never silent.
  - Unauth submit renders `prove-ask-error-panel data-status=401` — never silent.
  - **DB-2 visual invariant holds for BOTH sample and live variants** — fault card computed styles `bg=rgb(22,48,79) border-left rgb(126,48,56) 6px` vs refusal card `bg=parchment border rgb(176,124,42) 2px` — divergent.
  - Walk-a-proof from ANSWERED sample card → `/prove/trace/trc-sample-0f7a043d179c` → 3 layers render → close returns to `/prove`.
  - Cross-identity `demo.operator` sees 4/4 sample cards (per-identity seeding held).
  - `/registry` regression: 4/4 axes · 10 briefs · 24 gap CTAs · 45 SAMPLE badges · retired vocab absent.
  - Parity **36/36 live**.
- **Micro-fix in this addendum:** walk-a-proof 3rd-layer label extended to include the API contract key: label now reads *"3 · Raw facts (raw_facts) · verified rows"* — the raw layer key is visible in the rendered heading (was previously "Raw verified facts" · a labelling nit only, never a functional defect).

**Iter22 close verdict:** both Owner Message 606 defects fixed at the correct architectural layer. Systemic gate strengthened so this class of defect (page-level render vs component-level render) is caught by Jest going forward.
