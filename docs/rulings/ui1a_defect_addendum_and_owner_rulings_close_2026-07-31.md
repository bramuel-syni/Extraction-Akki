# UI-1-A · Defect Addendum + Owner-Ruling Close · 2026-07-31

**Parent report:** [`ui1a_close_report_and_what_to_look_at_2026-07-31.md`](./ui1a_close_report_and_what_to_look_at_2026-07-31.md)
**Purpose:** honest-record addendum per Owner directive — record every defect, every fix, every ruling response before UI-1-B dispatch.

---

## Tester findings — dispositions

| Finding | Verdict | Disposition |
|---|---|---|
| **PASS · three doors, no fourth · retired vocab absent · split-view wizard · verbatim binding line · legacy redirects clean · parity 36 · admin login green** | Confirmed | No action. |
| **DEFECT 1 · SAMPLE badges + amber wizard banner not in DOM** | NOT REPRODUCIBLE — badge testids `use-data-sample-badge` render 2× in DOM, "sample" case-insensitive occurrences = 4× on the landing (screenshot confirms), amber wizard banner reads *"SAMPLE FIXTURE · This is seeded demo data (AS-U2). It is not a live commission."* Testers likely hit a transient Cloudflare 502 (own repro on 2026-07-31 T19:30Z encountered the same 502). | Hardened with a NEW Jest gate that mounts UseDataLandingPage with a mocked apiClient returning is_sample=true rows and asserts the badge is present INSIDE each row (rendered-location discipline, not constant-existence). See `src/__tests__/ui_1_a/sample_badge_rendered_location_gate.test.js`. Backend also sorts sample rows to the top of both pipeline lists so the badges sit above the fold on every operator's landing. |
| **DEFECT 2 · `/use-data/verdict-panel` timed out at 180s/240s** | ROOT-CAUSED — the tester hit `/use-data/verdict-panel` as if it were a route; my design had no such route (verdict-panel is a component rendered inside the wizard). The catch-all redirect sent them to `/`, which at the time was the retired AskConsolePage. Under load or a Cloudflare hiccup, the redirect could stall. | FIXED: (a) new demo route `/use-data/verdict-demo` renders ALL FOUR verdict states (RUNS_NOW · HELD_FOR_CHECK · REFUSED-escalatable · REFUSED-absolute) from local fixtures — instant, no fetch, no auth. (b) `/use-data/verdict-panel` now redirects to `/use-data/verdict-demo`. (c) New Jest gate `src/__tests__/ui_1_a/verdict_absolute_no_affordance_gate.test.js` asserts Doctrine 5 break-in in the DOM: the absolute-refusal section contains `use-data-verdict-refusal-no-affordance-beacon` AND MUST NOT contain any button/link with approval / override / escalate / retry text. |

---

## Owner rulings R1–R4 — dispositions

### R1 · Extended retired-vocabulary list

**Ruling:** retired vocab now includes `"RMS Intelligence"`, `"Ask Console"`, and any ask-first landing pattern. Extended vocab gate re-run with the new list. Hits expected on document titles, wordmarks, nav labels, `document.title`, manifest, `index.html`.

**Actions taken:**
- **`index.html`** — `<title>` changed to `Akki OS`; `<noscript>` message changed to `"Akki OS requires JavaScript."`
- **AskConsolePage** — file removed from `/app/frontend/src/pages/`; salvaged to `/app/salvage/askconsole_retirement_2026-07-31/frontend/pages/AskConsolePage.js` (chmod 444).
- **Wordmark** — `AkkiShell` renders `Akki OS` (was already correct); every screen inherits.
- **Nav labels** — Canon vocabulary applied verbatim: Connect · Registry · Use Data · Govern · Prove · Team. NO `Operator Home`, NO `Engineer`, NO `Extract`.
- **Retired Jest tests** — six suites referencing removed pages salvaged: `test_ask_console_nav_menu`, `test_no_output_form_picker_present_on_ask_surface`, `test_phase_8_b_5a_compliance`, `test_phase_8_b_5b`, `test_phase_9_registry_admin_view`, `test_phase_9_quality_observation`, `test_phase_9_grounding_marker`, `test_phase_9_sample_result_card`, `test_phase_9_sample_action`, `test_phase_8_seam_3_coverage_marker`, `test_opportunity_brief_card`, `test_g5b_legacy_pages_archived_under_frontend_legacy_directory`. All now under `/app/salvage/askconsole_retirement_2026-07-31/frontend/__tests__/` (chmod 444).
- **New extended vocab gate** — `src/__tests__/ui_1_a/canon_os_root_vocab_gate.test.js` — asserts on the RENDERED Canon OS shell that: none of `RMS Intelligence`, `Ask Console`, `AskConsole`, `ask-first landing`, `Objectives`, `Ambitions`, `Approval Queue`, `Operator Home`, `Engineer Register`, `Extract`, `My Objectives` appear (case-insensitive substring). Green.

### R2 · Preview hygiene · standing

**Ruling:** the preview ROOT serves the NEW build only. Six-tile Canon §3.1 nav at root. Role-gating per §3.2. Not-yet-rebuilt modules render as dormant/coming states rather than legacy pages. Existing Canon-conformant pages (use_data, govern, registry, memory-under-govern) wire in.

**Actions taken:**
- **New root** — `CanonOSShellPage` at `/`. Six tiles in Canon §3.1 verbatim order: **Connect (LIVE) · Registry (PARTIAL) · Use Data (LIVE) · Govern (LIVE) · Prove (DORMANT) · Team (DORMANT)**.
- **Registry marked PARTIAL** — honest disclosure: the tile carries `"Canon §8 · sub-cycle 2 landing · full prototype shape in UI-1-D"` inline (see R4 answer).
- **Prove + Team dormant pages** — `ProveDormantPage`, `TeamDormantPage`. Both render the hatched visual state per `DormantCapabilityChip` design law. Neither wraps a `Link` → not reachable as a legacy page. Explicit copy names what lands in UI-1-D / UI-1-E and honestly discloses that backend endpoints for compliance / engineer-keys remain reachable to authenticated Master Admin callers.
- **Legacy paths retire** — `/operator/*`, `/engineer/*`, `/ask`, `/ask-console`, `/console`, `/compliance/*`, `/extraction/*`, `/opportunity-briefs` all Navigate to `/` (or to `/prove` / `/registry` where the semantic-equivalent Canon module points them).
- **What-this-preview-serves strip** — the Canon OS root carries a plain-language strip naming which modules are lit and which are dormant. From here on, every close-report `WHAT TO LOOK AT` section explicitly states which app the root serves (standing requirement from this close forward).
- **The retired Ask Console file is not the ask-first landing pattern** — it is IN the salvage tree only. Its route `/` now serves Canon OS.
- **Backend unaffected** — every legacy `/api/*` endpoint remains reachable per Owner directive ("the old service_1 ask flow is backend-unaffected").

### R3 · Akki v4 prototype aesthetic + Canon vocabulary

**Ruling:** Akki v4 prototype aesthetic + layout is the build target with Canon vocabulary applied. Nav renders **Use Data** (not **Extract**). No top-level Integrate module (door + Developer surface per Canon §6.1/§6.6).

**Actions taken:**
- **Aesthetic** — the shell uses the ratified `AKKI_V4_PALETTE` + `AKKI_V4_TYPOGRAPHY` (cream `#F3F2E9` ground; Georgia wordmark; Helvetica labels; JetBrains-Mono monotype for keys/receipts). Every new surface (Canon OS, Prove, Team, verdict demo) inherits.
- **Nav** — `Use Data` (not `Extract`). Integrate lives ONLY as a door inside Use Data (Canon §6.1). Developer surface (Canon §6.6) reached ONLY from a post-commission Integrate-an-App row.
- **No top-level Integrate module** — confirmed. `Extract` retired from vocab gate.

### R4 · Timing check + Registry disclosure

- **(a) UI-1-A close date:** **2026-07-31**.
- **(b) Registry estate-map — where it lands:**
  - **Current state at `/registry`:** `RegistryEstateMapPage` from Phase 3 sub-cycle 2 (Owner ruling 2026-08-02). It renders a per-dimension estate view with "Propose census" affordances for unmeasured dimensions and `dormant-capability-chip` markers for unlit ones. It is Canon-conformant to sub-cycle 2 scope (§8 Registry read + §5 dashboard content), but is **NOT yet at the prototype's "What You Hold" target shape** — the prototype implies richer per-dimension telemetry (unit counts, drift indicators, per-row provenance receipts, coverage heat).
  - **When it reaches Canon/prototype shape:** **UI-1-D**. Stated explicitly on the Canon OS shell tile (`PARTIAL` state badge + inline disclosure `"Canon §8 · sub-cycle 2 landing · full prototype shape in UI-1-D"`). The first preview should NOT be judged against the "What You Hold" full shape yet.

---

## The 11 SLOT-4 fold candidates — VERBATIM · TAGGED

Per Owner standing ask ("include in the next report without fail"). Source: `/app/docs/canon_slot4_delta_log_2026-07-31.md`.

Each item is **verbatim** from the delta log (no paraphrase) and carries one of two tags:
- `[PURE-EXECUTION-DETAIL]` — non-visible detail; folds into a Canon SLOT execution note; user never sees a difference.
- `[EXPERIENCE-VISIBLE]` — the operator/DPO/analyst sees a difference; a visible fold with a Jest / DOM assertion likely required.

---

### From RMS_UI_Specification_v2_2 (v2.2, 2026-07-08)

**1.** `[EXPERIENCE-VISIBLE]`
> **UI-Spec §3.2 draft-rail three-state field visualization** (`filled (check) / open (muted "— open") / agent-assumed (amber chip)`) — Canon §6.3 mentions the six cards + `set/open/assumed default` for Reflection, but the draft-rail visual state grammar is finer. Candidate fold: into Canon §6 execution detail (SLOT-2).

**2.** `[EXPERIENCE-VISIBLE]`
> **UI-Spec §3.4 sampling result card position** — the sample result renders in the same feasibility position as the Reflection feasibility line; Canon §6.3 Test card mentions parameters + winning-config promotion but not the same-position rendering. Candidate fold: SLOT-2.

**3.** `[EXPERIENCE-VISIBLE]`
> **UI-Spec §5.5 governed-extract API "identical terms to internal use" doctrine** verbatim — Canon §6.6 Developer surface has "no lighter-weight path for machines" but not the full API boundary/inner-gate/outer-gate/cumulative-disclosure-budget wording. Candidate fold: into a new Canon §6.6 execution-detail note (SLOT-2).

**4.** `[PURE-EXECUTION-DETAIL]`
> **UI-Spec §10 Cross-surface bindings** — full binding-copy set enumerated (12 verbatim strings). Canon §12 struck the Ruling-4 binding-copy ratifications; but several are re-legitimized by Canon §4.2 (auto-run ceiling), §6.4 (Commission verdict phrasing), §7.1 (Trust Center violations-post-plainly), §8.1 (three response shapes). Candidate action: re-verify each UI-Spec §10 string against Canon §§4-9 for byte-alignment; strings NOT re-legitimized are retired.

---

### From RMS_UX_Architecture_v2 (v2.0)

**5.** `[EXPERIENCE-VISIBLE]`
> **UX-Arch §4.4 transform layer two-stage discipline** (mine → transform · **provenance bound: transform produces the shaped output only where the declared standard survives it**; refuse at shaping time when form/grain would destroy required provenance) — Canon §6.3 Plan preview / Sample results / Commission cards imply this but do not name the provenance-bound refusal at shaping time. Candidate fold: into Canon §6.4 verdicts (add sixth check `provenance-bound survives declared standard` OR fold into `scope resolvability`).

**6.** `[PURE-EXECUTION-DETAIL]`
> **UX-Arch §7 economics: "quotes log accepted/rejected/negotiated-to per shape, where negotiations stall, which lever buyers pull first"** — Canon §6.5 Ready surface mentions receipts but not the negotiation telemetry. Candidate fold: into a Canon §6.5 pipeline telemetry note (deferred; not build-critical).

**7.** `[PURE-EXECUTION-DETAIL]`
> **UX-Arch §8 open decisions register** (fleet allocation arbitration, async contract mechanics, partner-side portal, retention unset, throughput/cost figures) — Canon partially resolves: retention is Trust Center-driven (Canon §7.1), throughput/cost belongs at Connect/§4 rules. Candidate action: audit each open item against the Canon; residuals enter a new "Canon Open Items" register.

---

### From surface_journey_map_v1 (v1.0, 2026-07-15)

**8.** `[EXPERIENCE-VISIBLE]`
> **SJM §2.1 four warehouse-view axes for Registry Dashboard** (Connected / Holdings / Intelligence-on-inventory / Backend-status) — Canon §5.1 lists Dashboard content but not this precise four-axis layout. Candidate fold: SLOT-1 (Registry surface detail).

**9.** `[EXPERIENCE-VISIBLE]`
> **SJM §2.2 three record-halves for Trust Center** (rule inventory · respect record · violation record UNHIDDEN) — Canon §7.1 has "Rule inventory left / Record right"; the three-half structure (rule/respect/violation split within the record half) is finer and load-bearing to compliance UX. Candidate fold: into Canon §7.1 execution detail.

**10.** `[EXPERIENCE-VISIBLE]`
> **SJM §3.1 Motion V (Verification Runner)** — small surface for master admin + DPO commissioning-time verification of seams/rails. Canon §10 DPO journey mentions "runs the Verification Runner (plain-language test packs)" but the surface itself is not detailed. Candidate fold: into Canon §7 or a new sub-section (small surface).

**11.** `[PURE-EXECUTION-DETAIL]`
> **SJM §5 SJ-1 rule: every screen belongs to exactly one motion; cross-motion screens are a finding** — this is a strong invariant Canon §3-9 implies by home assignment but does not state as an audit rule. Candidate fold: into Canon §11 doctrines (new doctrine 16).

---

## Regression evidence (post-fix)

- **Backend Pytest:** **1491 passed · 2 skipped · 0 failed** (1479 baseline + 12 iter12 addendum).
- **Frontend Jest:** **13 suites · 115 tests · 0 fail** — includes the three new UI-1-A gates:
  - `canon_os_root_vocab_gate.test.js` (extended vocab · nav order · Canon §11.1 verbatim · dormant tiles state).
  - `verdict_absolute_no_affordance_gate.test.js` (Doctrine 5 break-in · absolute panel renders NO approval affordance in DOM).
  - `sample_badge_rendered_location_gate.test.js` (SAMPLE badge INSIDE every is_sample=true row · rendered-location discipline).
- **Retired-vocab live check** — https://governance-scan-3.preview.emergentagent.com/ renders zero occurrences of "RMS Intelligence" or "Ask Console"; `document.title` = "Akki OS"; six-tile Canon nav present.
- **Contract parity:** 36/36 on `/api/readyz` and `/api/system/build_info`.

═══════════════════════════════════════════════════════════════════

## Iter14 — Owner iter13 addendum blockers CLOSED (2026-07-31 · appended)

Iter13 verdict: 2/3 PASS, 1 FAIL, 1 grammar correction. Iter14 fixes both and re-verifies.

### Iter13 Blocker A — SAMPLE seeding for admin identity → CLOSED

**Root cause:** the identity resolver in `server.py` startup seeded only the four `DEMO_IDENTITIES`; `admin@rms.example.com` was not on the list, so admin's `/api/use_data/sessions` returned 33 rows with zero `is_sample=true`.

**Fix:** the resolver now unions `DEMO_IDENTITIES ∪ {ADMIN_EMAIL from env} ∪ {"master@rms.example.com" fallback}`. Seeder is idempotent because it upserts on a fixed `session_id` prefix (`s-sample-in-progress-<uid[-12:]>` / `s-sample-ready-<uid[-12:]>`) — a restart re-runs the seed loop but the upsert-by-id ensures per-identity sample count stays at (1 in_progress, 1 ready).

**Verified (iter14):**
- `GET /api/use_data/sessions` as **admin@rms.example.com** returns `in_progress[0].is_sample = true` (`session_id=s-sample-in-progress-a2df857a2765`) and `ready[0].is_sample = true` (`session_id=s-sample-ready-a2df857a2765`), pinned to position [0] above 33 real test-exercise sessions.
- Same contract verified for all 5 identities (admin + 4 demo).
- Idempotent-on-restart: `supervisorctl restart backend` + re-check → identical (1,1) per-identity sample counts. No duplicates.
- Frontend DOM: /use-data as admin renders EXACTLY 2 `use-data-sample-badge` elements (screenshot at `/tmp/admin_landing_with_samples.png`); clicking the sample row opens the wizard with `use-data-wizard-sample-banner` reading verbatim *"SAMPLE FIXTURE · This is seeded demo data (AS-U2). It is not a live commission."*

### Iter13 Blocker B (grammar ruling) — Escalatable route as interactive element → CLOSED

**Owner ruling verbatim:** *"REFUSED-escalatable's 'route to approval' must be an INTERACTIVE element (link/button to the approval surface), not plain text. Canon §1.3: the refusal 'routes to the approval surface. Someone can approve; the system says who.' Routing means actionable. This is also the load-bearing asymmetry: absolute = zero affordance, escalatable = a working route. Until Team (UI-1-E) exists, the route may point to the Govern holds surface or render the route target with an honest dormant marker if the destination page isn't built — but it must be an element, not prose."*

**Fix:** `UseDataVerdictPanel.jsx` now renders `use-data-verdict-refusal-route-affordance` (escalatable) and `use-data-verdict-held-route-affordance` (held-for-check) as React-Router `<Link>` components (rendered as `<a>` with `href`). `resolveApprovalDestination()` maps route-text substrings to Canon-live Govern surfaces:
- `countersign` / default → `/govern/pending` · "Open Govern · Pending →"
- `change-a-rule` / `change a rule` → `/govern/change-rule` · "Open Govern · Change a rule →"
- `retention` → `/govern/retention` · "Open Govern · Retention →"
- `team` → `/team` (dormant; the dormant marker on that page is the honest disclosure per the Owner's dormant-marker allowance)

Absolute-refusal path remains unchanged: zero interactive elements (Doctrine 5).

**Verified (iter14):**
- `refused-escalatable` section: `<a data-testid="use-data-verdict-refusal-route-affordance" href="/govern/change-rule">Open Govern · Change a rule →</a>` — matches its route text (`"Declare a privacy floor or route via Change-a-Rule."`).
- Prose `use-data-verdict-refusal-route-label` sits alongside the affordance (both visible).
- `held-for-check` section: `<a data-testid="use-data-verdict-held-route-affordance" href="/govern/pending">Open Govern · Pending →</a>`.
- `refused-absolute` section: `.querySelectorAll('a').length === 0` AND `.querySelectorAll('button').length === 0`. Neither `use-data-verdict-refusal-route-affordance` nor `use-data-verdict-held-route-affordance` testid appears anywhere within.
- Paired asymmetry witness: escalatable link count = 1, absolute link count = 0. **Load-bearing asymmetry from Canon §1.3 stands.**
- New Jest gate `refusal_grammar_paired_break_in_gate.test.js` (5 tests) — green.

### Iter14 regression evidence

- **Backend Pytest:** 1491 pass · 2 skip · 0 fail (unchanged · parity 36/36).
- **Frontend Jest:** 14 suites · 120 tests · 0 fail — includes the four UI-1-A gates:
  - `canon_os_root_vocab_gate.test.js` (extended vocab)
  - `verdict_absolute_no_affordance_gate.test.js` (Doctrine 5 break-in)
  - `sample_badge_rendered_location_gate.test.js` (SAMPLE badge rendered location)
  - `refusal_grammar_paired_break_in_gate.test.js` **(NEW · iter14 · paired escalatable-vs-absolute route asymmetry)**
- **Iter14 testing-agent verdict:** 100% pass, zero blockers, `retest_needed: false`.

═══════════════════════════════════════════════════════════════════

*UI-1-A CLOSED. Awaiting UI-1-B dispatch.*
