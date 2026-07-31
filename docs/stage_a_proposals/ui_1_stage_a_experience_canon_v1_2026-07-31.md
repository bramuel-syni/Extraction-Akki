# UI-1 Stage A · Filed against Experience Canon v1.0 + Dispatch v2 §3 (in-force portions)

**Cycle:** UI-1 (frontend rebuild against the Experience Canon v1.0).
**Filed:** 2026-07-31.
**Authority:** Experience Canon v1.0 (`docs/mandates/AKKI_OS_EXPERIENCE_CANON_v1.md` · SHA `6d9ed7d8…`); Dispatch v2 §§1/2/4/5/6/7 in-force where Canon silent; §3 superseded by Canon but its gate roster §3.7 + contract §3.5 remain in force (Owner directive verbatim: *"filed against Experience Canon §§3-9 + 11 + Dispatch v2 §3 (which remains in force where the Canon doesn't supersede — gate roster §3.7, contracts §3.5)"*).
**Standing rule:** SR v3 — verbatim carrier · disk is truth · provenance never gates builds.

---

## §1 · Purpose + scope

The UI-1 cycle brings the frontend into conformance with the Canon. Backend is untouched except for **two new frozen contracts** at Canon §6.4 ◆: `UseDataWizardSession@v0` (parity 34→35) and `CommissionVerdict@v0` (parity 35→36). No other frozen contracts change; no service is refactored; no endpoint moves.

**Execution order (Owner-fixed):** use_data → govern → connect → registry/prove → team. Analyze waits on `workbook_analyzer` acquisition (Canon §9.1 ◆). Executives + Customer Portal NOT scaffolded (Canon §1.7 ◆).

## §2 · Conformance audit · existing frontend vs Canon §§3-9 + 11

Legend: **CARRY** = surface conforms, keep as-is (may need minor testid additions); **CARRY+RENAME** = same content, new home per Canon §3; **REBUILD** = surface diverges from Canon or is missing; **RETIRE** = surface no longer has a home in Canon; **NEW** = Canon requires it, does not yet exist.

### §2.1 By existing page group

| Existing group | Files | Canon home | Verdict | Notes |
|---|---|---|---|---|
| `pages/AskConsolePage.js` | 1 | Non-nav internal reference app (Canon §1.7 excludes; not in `Connect·Registry·Use Data·Govern·Prove·Team`) | **RETIRE from nav** · KEEP as sample internal application | Canon §3.1 confirms Ask is not OS nav. The console-nav is retained as a launcher but not itself a Canon surface. |
| `pages/AuthLoginPage.js / AuthRegisterPage.js` | 2 | Cross-cutting (not a Canon surface) | **CARRY** | Foundation. |
| `pages/operator/` | 3 (OperatorHomePage, CommissionWizardPage, CommitReviewPage) | Canon §6 Use Data · specifically §6.2 wizard + §6.4 verdict | **REBUILD → `pages/use_data/`** | CommissionWizardPage becomes Use Data wizard shell hosting the six cards (§6.3). CommitReviewPage becomes Commission card (§6.4). Verdict page becomes Held-for-check / Ready surface. |
| `pages/engineer/` | 4 (Register, FirstCall, Administer, OnboardingInvite) | Canon §6.6 Developer surface (a post-commission management view of an Integrate-an-App item, reached from its row · NOT nav) | **REBUILD → subordinate to `pages/use_data/`** | Canon explicitly makes the Developer surface **not-a-nav-module**. Move into Use Data pipeline row expansion. Onboarding invite: leave under auth (Operator-scoped action per Canon §4.3). |
| `pages/master_admin/` | 3 (Home, ChangeARule, AuditTrail) | Canon §7 Govern (rule change ceremony) + Canon §9.2 Team (Master Admin approval surface + access register) | **CARRY+RENAME split** | ChangeARulePage folds into `pages/govern/GovernChangeRulePage.jsx` (already exists · verify Canon §7.5 conformance). MasterAdminHomePage folds into `pages/team/TeamHomePage.jsx` (NEW). AuditTrailPage folds into `pages/govern/GovernRecordPage.jsx` per Canon §7.1 record half. |
| `pages/compliance/` | 4 (Home, ProveOneRun, RetentionRights, RulebookWrite) | Canon §7 Govern + Canon §8 Prove | **CARRY+RENAME split** | ProveOneRun → `pages/prove/ProveRunPage.jsx` per Canon §8.2 walk-a-proof. Home → `pages/govern/GovernHomePage.jsx` (already exists · verify Canon §7.1 Trust Center two-halves). RetentionRights + RulebookWrite → `pages/govern/GovernRetentionPage.jsx` (already exists · verify Canon §7.3 held-classes + §7.5 ceremony). |
| `pages/extraction/` | 2 (ExtractionConsoleHome, RegistryAdminView) | Canon §4-5 (Connect + Registry) | **REBUILD split** | ExtractionConsoleHome → hard-retired per Canon (no such nav). Its Opportunity Briefs card content already exists at `pages/opportunity_briefs/` (Canon §5.1). RegistryAdminView → `pages/registry/RegistryDashboardPage.jsx` (NEW · per SLOT-1 detail). |
| `pages/opportunity_briefs/OpportunityBriefsPage.js` | 1 | Canon §5.1 Registry standing content | **CARRY → `pages/registry/OpportunityBriefsPage.jsx`** | Canon §5.1 confirms verbatim. Move under registry group. |
| `pages/connect/` | 2 (ConnectHomePage, ConnectNewSourcePage) | Canon §4 | **REBUILD** | Canon §4.1 landing has strict five-section layout (headline · status banner · three cards · record table · footer). Canon §4.2 adds seven Connect rules incl. auto-run ceiling (Rule 7 · $1,000). Canon §4.4 source profile mapping-leads-with-the-answer. Existing pages are Sub-cycle-1 shape; must rebuild against Canon §4 exact layout. |
| `pages/commission_view/` | 2 (CommissionViewHomePage, CommissionRunDetailPage) | Canon §6.5 pipeline (In progress + Ready) | **CARRY+RENAME → `pages/use_data/pipeline/`** | Existing "commission view" content is Canon's "In progress" section. Rename + rehome; verify Canon §6.5 shape. |
| `pages/memory/` | 3 (MemoryHomePage, PlaneDetail, Observability) | Not a Canon nav surface (memory is an OS boundary described in §1.7 Executives contract but not an OS nav) | **CARRY, non-nav** | The memory-service surfaces are an engineering diagnostic view for the DPO. Keep as an internal audit view; not in Canon §3.1 top nav; reachable from Govern record for DPO. Convert to a sub-route of Govern or park as `pages/govern/memory/`. |
| `pages/registry/RegistryEstateMapPage.jsx` | 1 | Canon §5 Registry Dashboard | **CARRY, extend** | Existing sub-cycle-2 dashboard is the shell of Canon §5.1 four-axis dashboard. Extend to add the other three axes (Connected · Intelligence-on-inventory · Backend-status). |
| `pages/govern/` | 5 (Home, Retention, ChangeRule, RefusalHealth, Pending) | Canon §7 Govern | **CARRY, verify + extend** | Existing sub-cycle-3 shell is close to Canon §7. Verify Canon §7.1 Trust Center two-halves layout (left rule inventory + right record) — current split is inventory+refusal+retention+pending, needs rearrangement to two halves. Canon §7.2 enforcement classes already implemented. Canon §7.5 ceremony already implemented (FROZEN_IS_IMMUTABLE at Apply-stage caption). Canon §7.4 Registries submodule = NEW. |
| `pages/trace/TraceReceiptPage.js` | 1 | Public trace receipt (cross-surface) | **CARRY** | Canon §8.2 walk-a-proof pattern already established here per SJM v1 §4. |

### §2.2 By Canon nav module

| Canon nav | Existing home | Verdict | Files to create/rebuild |
|---|---|---|---|
| **Connect** | `pages/connect/` (partial) | **REBUILD** | `pages/connect/ConnectHomePage.jsx` (rebuild per §4.1 five-section layout) · `pages/connect/ConnectSourceProfilePage.jsx` (per §4.4 mapping) · `pages/connect/ConnectSetupPage.jsx` (seven rules incl. Rule 7 auto-run ceiling $1000 per §4.2). |
| **Registry** | `pages/registry/` + `pages/opportunity_briefs/` (partial) | **CARRY + EXTEND** | `pages/registry/RegistryDashboardPage.jsx` (NEW · four axes) · move `OpportunityBriefsPage` under registry · `pages/registry/GapRegisterPage.jsx` (NEW · SLOT-1). |
| **Use Data** | `pages/operator/` (needs rebuild) + engineer/ (subordinate) + commission_view/ (rehome) | **REBUILD** | `pages/use_data/UseDataHomePage.jsx` (three doors per §6.1) · `pages/use_data/UseDataWizardPage.jsx` (six cards per §6.3) · `pages/use_data/UseDataPipelinePage.jsx` (In progress + Ready per §6.5) · `pages/use_data/DeveloperSurfacePage.jsx` (post-commission per §6.6). |
| **Govern** | `pages/govern/` (needs Canon §7.1 two-halves layout) | **CARRY + EXTEND** | Rebuild `GovernHomePage.jsx` to two-halves Trust Center · add `pages/govern/GovernRegistriesPage.jsx` (Class D lifecycle per §7.4) · add `pages/govern/GovernHoldsPage.jsx` (per §7.6). |
| **Prove** | Existing `ComplianceProveOneRunPage` | **CARRY+RENAME + REBUILD** | `pages/prove/ProveHomePage.jsx` (three response shapes per §8.1) · `pages/prove/ProveRunPage.jsx` (walk-a-proof per §8.2). |
| **Team** | Existing `MasterAdminHomePage` | **CARRY+RENAME** | `pages/team/TeamHomePage.jsx` (approval-surface working queue per §9.2) · access register submodule. |

## §3 · Registry v1 + contract citations (Dispatch v2 §3.5 · in force)

**Frozen contracts landing this cycle:**
- `UseDataWizardSession@v0` — schema seals the wizard-session envelope (six-card state, agent-said/user-said segregation, feasibility grounding, sample-run reference). **Parity 34 → 35 · seal event · D4b freeze arguments filed with the contract snapshot.**
- `CommissionVerdict@v0` — schema seals the five-check verdict envelope (rights compatibility · privacy floor · PII posture · budget ceiling · scope resolvability · verdict ∈ {runs_now, refused, held_for_check} · escalation route where applicable). **Parity 35 → 36 · seal event · D4b freeze arguments filed with the contract snapshot.**

Sibling snapshots: `use_data_wizard_session.contract_snapshot.json` + `commission_verdict.contract_snapshot.json` in `backend/tests/invariants/`. `EXPECTED_PARITY` in `backend/services/health/parity_counter.py` bumps 34→36 in a single seal window at UI-1 landing.

**No other contract touches.** Foreign-tree manifest references to `mandate_spec.py` + `function_promise_registry_v1.md` + `phase_ledger_v1.md` + `owner_decisions_v1.md` remain **provenance only** per Canon §13 standing rule. This tree's 34 contract snapshots under the green suite (1444 pass / 2 skip / 0 fail) are the contract set of record; the +2 seal takes it to 36.

## §4 · Retired-vocabulary audit (Canon §3.3 permanent gate)

Full-tree grep over `frontend/src/**/*.{js,jsx,tsx}` on 2026-07-31:
- `My Objectives` → **0 hits**
- `Run Tracking` → **0 hits**
- `Extracted Intel` → **0 hits**
- `Approval Queue` → **0 hits**
- `Awaiting approval` → **0 hits**
- `Run/Commission Approver` → **0 hits**
- `Data Engineer` → **0 hits**

**Retired-vocabulary audit CLEAN.** A permanent Jest gate cell (`gate_retired_vocabulary_absent`) will enforce this at CI time (added to UI-1 gate roster below).

## §5 · Gate roster (Dispatch v2 §3.7 in-force + Canon-derived additions)

**Break-in style: `gate_*_break_in` where a boundary-guard needs positive-and-negative assertion per SR-4.**

### §5.1 · Ten from Dispatch v2 §3.7 (verbatim in force)

| # | Gate | Guards |
|---:|---|---|
| 1 | `gate_absolute_refusal_no_affordance` | Canon §1.3 + §11.5 — an absolute refusal renders no approval affordance (not a disabled button, not a request-override link). Break-in style. |
| 2 | `gate_fault_shares_no_refusal_components` | Canon §8.1 + §11.7 — fault surface shares no components with refusal surfaces (own channel, colour, layout). |
| 3 | `gate_failed_lookup_never_converts_refusal_to_fault` | Canon §8.1 DB-2 + §11.6 — companion-channel failure MUST NOT convert refusal into fault. |
| 4 | `gate_card_commits_no_silent_dialogue_values` | Canon §6.2 governance line + §11.1 — every governed value confirmed on the Commission card; none inferred from dialogue and silently committed. |
| 5 | `gate_retired_vocabulary_absent` | Canon §3.3 — no retired term renders on any general-user surface. Permanent gate. |
| 6 | `gate_registry_version_recorded_per_run` | Canon §7.4 — every run records the registry version in force. |
| 7 | `gate_removals_and_edits_gated_additions_immediate` | Canon §7.4 — Registries Class D asymmetry (additions immediate; removals + edits gated). |
| 8 | `gate_extend_scope_requotes` | Canon §6.5 + §11.8 — extending scope re-quotes; never silent fold-in. |
| 9 | `gate_every_figure_carries_class` | Canon §9.1 + §11.10 — every figure carries its class (measured vs estimated · on the number, not a footnote). |
| 10 | `gate_ceremony_countdown_visible_and_cancelable` | Canon §7.5 — waiting-period countdown visible and cancelable during the window; cancel-before-applies. |

### §5.2 · Canon-derived additions (from Owner rulings 2026-07-31)

| # | Gate | Guards |
|---:|---|---|
| 11 | `gate_db1_wire_reason_verbatim_honesty_strip` | Canon §8.1 DB-1 (Resolved-Items Ruling 2) — evidence-cannot-support renders the specific wire reason verbatim in the honesty strip. |
| 12 | `gate_db2_companion_fault_does_not_convert_refusal` | Canon §8.1 DB-2 (Resolved-Items Ruling 2) — companion-channel failure MUST NOT convert refusal into fault; refusal renders without the detail. Break-in style. |
| 13 | `gate_auto_run_ceiling_1000_change_a_rule_only` | Canon §4.2 + §6.4 + §7.5 (Resolved-Items Ruling 1) — initial $1,000 ceiling; direct-write refused; Change-a-Rule ceremony only. Break-in style. |

### §5.3 · Additional Canon boundary-guard gates (execution binding)

| # | Gate | Guards |
|---:|---|---|
| 14 | `gate_governance_content_only_in_govern` | Canon §11.14 — governance content lives only in Govern; other surfaces link, never duplicate (Connect §4.1 MUST NOT). |
| 15 | `gate_rights_surface_early_not_at_checkout` | Canon §6.1 + §11.2 — Export door states rights posture as soon as scope is known; internal-only training rights inherited. |
| 16 | `gate_absolute_refusal_no_approval_route` | Canon §1.3 — refused-absolutely names the bar and its source; offers no approval route. Complement to gate 1. |
| 17 | `gate_developer_surface_not_in_nav` | Canon §6.6 — Developer surface is post-commission row-expansion, NOT a nav module. |
| 18 | `gate_master_admin_and_dpo_never_in_runtime_path` | Canon §2 never-does boundaries — Master Admin never performs individual pulls; DPO never approves operations. Server-side enforcement gate. |

**Total gate roster: 18 cells for UI-1 landing.**

## §6 · CONFLICT rows (surface-level)

None. Zero doc-vs-Canon conflicts detected during audit. Retired-vocabulary CLEAN. Retired artifacts already in `/salvage/` per §1.2 executed 2026-07-31.

## §7 · Sub-cycle execution plan (Canon nav order)

Per Owner directive: use_data → govern → connect → registry/prove → team.

| Sub-cycle | Landing surfaces | Backing contracts | Approx. cell delta | Gates from roster |
|---|---|---|---|---|
| **UI-1-A · Use Data** | `pages/use_data/{Home,Wizard,Pipeline,DeveloperSurface}Page.jsx` | `UseDataWizardSession@v0` (34→35) · `CommissionVerdict@v0` (35→36) — dual seal | +~35 gate cells | 4, 8, 11, 12, 15, 17 |
| **UI-1-B · Govern** | `pages/govern/*` (verify Trust Center two-halves; add Registries submodule + Holds) | none (only existing contracts) | +~25 gate cells | 5, 6, 7, 10, 13, 14 |
| **UI-1-C · Connect** | `pages/connect/{Home,SourceProfile,Setup}Page.jsx` | none (existing contracts) | +~20 gate cells | 13, 14, 15 |
| **UI-1-D · Registry + Prove** | `pages/registry/{Dashboard,OpportunityBriefs,GapRegister}Page.jsx` + `pages/prove/{Home,Run}Page.jsx` | none | +~25 gate cells | 1, 2, 3, 9, 11, 12, 16 |
| **UI-1-E · Team** | `pages/team/TeamHomePage.jsx` (approval queue Master-Admin surface + access register) | none | +~10 gate cells | 18 |

**Analyze:** NOT SCAFFOLDED — awaits `workbook_analyzer` acquisition per Canon §9.1 ◆ + Dispatch v2 §5.3.
**Executives + Customer Portal:** NOT SCAFFOLDED — Canon §1.7 ◆ + Dispatch v2 §5.4 (separate applications).

## §8 · R4 sidecar (proposed)

For each landed UI-1 page, an R4 sidecar row lands in the FPR v1.0 supplement (v1.0-A for UI-1-A, etc.), following the pattern established through v0.1..v0.9. Rows include: function_id · governor · mandate · promise · service_trace · surface · enforcement · cost · dependencies · ladder_rung · owner. No parity change beyond the two seal events at §3.

## §9 · Canon-before-attest read log (D-11 discipline)

Verbatim reads completed on 2026-07-31 prior to filing this Stage A:
- `docs/mandates/AKKI_OS_EXPERIENCE_CANON_v1.md` (SHA `6d9ed7d8…`)
- `docs/mandates/akki_operating_model_product_spec_v2.0.md` (Part 2 intake)
- `docs/mandates/akki_role_register.md` (Part 2 intake)
- `docs/mandates/akki_analyze_codebase_acquisition_v1.0.md` (Part 2 intake)
- `docs/mandates/RMS_UI_Specification_v2_2.md` (SLOT-4)
- `docs/mandates/RMS_UX_Architecture_v2.md` (SLOT-4)
- `docs/mandates/surface_journey_map_v1.md` (SLOT-4)
- `docs/rulings/owner_change_order_2026-07-25.md` (Part 2 intake)
- `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` (Part 3 intake)
- `docs/rulings/owner_brief_enforcement_class_on_estate.md` (Part 3 intake)
- `docs/registers/artifact_manifest.md` (Part 4 intake)
- `docs/stage_a_proposals/ui_1_stage_a.md` (Part 4 intake · foreign-tree Stage A · treated as historical provenance per Canon §13)
- `docs/mandates/AKKI_OS_CONSOLIDATED_DISPATCH_v2.md`

## §10 · Self-audit + QA attest

- **D-7 fence:** every claim in §2 conformance verdict maps to a Canon paragraph. Verified.
- **D-10 self-audit:** no invented Canon interpretation; every REBUILD verdict cites a Canon section requiring the rebuild.
- **QA-1..QA-7 attest:**
  - QA-1 (nav order): §2 verdicts land surfaces into Canon §3.1 fixed nav order.
  - QA-2 (never-does boundaries): §5.3 gate 18 enforces separation of duties per Canon §2.
  - QA-3 (retired-vocab): §4 audit clean; §5.1 gate 5 keeps it clean.
  - QA-4 (refusal grammar): §5.1 gates 1, 2, 3, 16 lock the two refusal shapes and the fault taxonomy.
  - QA-5 (contract seals): §3 stages two seal events, D4b arguments filed.
  - QA-6 (SLOTs are not build blockers): §7 execution proceeds without waiting on SLOTs 1-4; each SLOT folds into its cycle per Canon §13.
  - QA-7 (governance content only in Govern): §5.3 gate 14 enforces Canon §11.14 across Connect / Registry / Use Data / Prove.

## §11 · Phase Ledger update

At UI-1 execution start, `docs/registers/phase_ledger_v1.md` (missing on this tree · provenance only) records UI-1 landing atomically. Since the file is not on disk, the ledger obligation lands as a Canon-native journal entry in `BUILD_JOURNAL.md` under §UI-1.

═══════════════════════════════════════════════════════════════════

## Owner items flagged in this Stage A

- **§6.5 Commission auto-run ceiling: $1,000** (owner-set 2026-07-31 · resolved-items ruling 1). Applies at UI-1-C `connect/` sub-cycle. NOT immediately blocking (UI-1-A `use_data` starts first).
- **§6.1 B1 GPU spend ceiling: STILL BLANK.** Does NOT block any of UI-1-A..E. Blocks B1 hardware rental only.

═══════════════════════════════════════════════════════════════════

*End of UI-1 Stage A. Canon §13 SR compliant · SR v3 verbatim carrier · disk-truth · provenance-never-gates.*
