# Stage A Proposal — Phase 3 Sub-Cycle 1 · Real-Material Readiness Slice

**Cycle:** Phase 3 · sub-cycle 1
**Authority:** Owner ruling 2026-08-01 (Phase 3 approved, re-sequenced) — docs/rulings/phase3_subcycle1_owner_rulings_2026-08-01.md
**Filed:** 2026-08-01 · design-only
**AC-1 posture:** proposal before build; screens + gates + FPR rows named before code lands
**HAZARD-STOP check:** no doc-vs-doc conflict surfaced — cleared to build

---

## §0. Placement rule answered (P3-R1)

**Which vertical:** the CONNECT → USE-DATA vertical.
**Which horizontals:** design system (color/typography/response-classes/ratified-copy) + response-class taxonomy (4 classes: governed-refusal / validation-error / infrastructure-fault / access-control-denial).
**Data gravity:** the real-material seam — a demo-ready evidence flow from source-connection (dormant capability, honestly stubbed per the four designed states) → milestone-agreed extraction commit → commit review with supplied-vs-assumed separation → runs/run-detail under a Commission View that reads only existing artifacts.

**Rationale for VERTICAL-first over module-first (Owner ruling 1):** the audit-defensible demo needs an END-TO-END trace thread — Connect / lawful-basis / milestone / spend-vs-quote / evidence — before ANY module is complete. A module-complete Connect surface with no downstream Commission-View reader would not audit; a slim vertical with all four load-bearing seams DOES audit.

## §1. Screen inventory (mapped to Surfaces v2 + Frontend Brief v2 + Akki v4 demo)

| # | Screen | Route | Frontend Brief anchor | Surfaces v2 anchor | Akki v4 demo mapping |
|---|---|---|---|---|---|
| 1 | Connect home | `/connect` | FB-1 (module inventory) | Surfaces v2 §A4-1 (Connect module) | v4 demo Connect tab dormant-capability listing |
| 2 | Connect new source | `/connect/new` | (Connect module — stub seam, honestly marked) | Surfaces v2 §A4-1 rights-at-connection | v4 demo Connect wizard (dormant/stubbed rendering) |
| 3 | Commission wizard — milestones step | `/operator/commission` (extended) | **FB-4** (milestones-before-commit, all three doors) | Surfaces v2 §A4-3 wizard | v4 demo commit-card + milestone panel |
| 4 | Commission wizard — lawful basis capture | `/operator/commission` (extended) | **FB-6** (lawful basis mandatory; refuses without it) | Surfaces v2 §A4-3 admission | v4 demo commit-card mandatory-field row |
| 5 | Commit review — supplied-vs-assumed | `/operator/commit-review/:sessionId` (extended) | **FB-8** (supplied vs assumed separation per value) | Surfaces v2 §A4-3 commit review | v4 demo assumed-tint chip |
| 6 | Commission View home (milestone front page + spend-vs-quote) | `/commission-view` | **FB-5** (drill-down evidence layer) | Surfaces v2 §A4-3 Commission View | v4 demo run-list front page |
| 7 | Commission Run Detail (evidence drill-down) | `/commission-view/:sessionId` | **FB-5** (technical material as drill-down) | Surfaces v2 §A4-3 run detail | v4 demo drill-down evidence panel |

**Six of seven screens are Owner-defined at the FB level. The seventh (Connect new source) is stub-seam-only per Ruling 1 (stub-marked; not-yet-measured).**

## §2. FB-18 gate cells enumerated for this slice

Owner-named FB-18 gates (must render + pass in this slice):

- `gate_commit_requires_agreed_milestones` — commit CTA disabled until milestone list carrying done-conditions + owners is agreed.
- `gate_commit_requires_lawful_basis` — freeze impossible with the lawful_basis field empty.
- `gate_commission_view_reads_only_existing_artifacts` — no new backend computation required by Commission View; reads existing wizard sessions + ledger rows only.
- `gate_missed_milestone_renders_plainly` — missed styled as visibly as done (same weight, distinct color).
- `gate_refusal_files_gap_with_demand_count` — coverage-gap refusal carries the filing action + demand evidence.
- `gate_late_refusal_never_error_styled` — the async terminal refusal renders as governed outcome, NOT infrastructure fault.

**Sub-cycle-1 additional gates (Owner design-law directives):**

- `gate_four_response_classes_visually_distinct` — governed_refusal / validation_error / infrastructure_fault / access_control_denial never conflated — distinct visual treatments verified via Jest snapshots.
- `gate_no_build_state_on_any_surface` — no "loading skeleton" / "coming soon" strings; every capability is either lit (measured) or dormant (visibly unlit/hatched).
- `gate_ratified_copy_verbatim` — refusal action triplet + "Frozen is immutable." + unset-retention banner render byte-identical to Ruling 4 verbatim strings.
- `gate_open_copy_slots_marked_never_filled` — all suspended Appendix A strings render with `<MarkedOpenSlot>` — never invented copy.
- `gate_class_with_claim_headline` — every headline in the answer position carries the class marker + the claim (never the claim alone).
- `gate_refusal_in_answer_position` — refusals render where the answer would render, not as a modal or toast alongside.
- `gate_agent_assumed_visibly_marked` — every agent-assumed field carries the amber chip + XOR-with-supplied source tag.
- `gate_one_trace_thread` — every screen renders `trace_id` in the audit rail (per Northena N-INV thread invariant).

## §3. FPR rows identified (AC-3)

New promise rows required (23 additive to Registry v0.7 supplement):

| function_id | governor | promise |
|---|---|---|
| akki.frontend.design_law_palette_locked | Named surfaces (frontend) | Akki v4 palette (cream #F3F2E9 · navy #16304F · oxblood #7E3038 · sage #8A8F7C · amber #B07C2A) + Georgia serif wordmark + Helvetica labels rendered exactly across all sub-cycle-1 screens. |
| akki.frontend.response_class_taxonomy_four_visual | Named surfaces (frontend) | Four response-class visual treatments distinct: governed_refusal (oxblood) · validation_error (amber) · infrastructure_fault (sage) · access_control_denial (navy). Jest snapshot gates. |
| akki.frontend.ratified_copy_verbatim | Named surfaces (frontend) | Refusal action triplet + "Frozen is immutable." + unset-retention banner render byte-identical to Ruling 4. Test asserts the strings verbatim. |
| akki.frontend.open_copy_slot_marker | Named surfaces (frontend) | Every suspended Appendix A copy slot renders `<MarkedOpenSlot>` with a dashed border + "— open —" marker. No invented copy. |
| akki.frontend.class_with_claim_headline | Named surfaces (frontend) | Every headline in answer position carries `<ClassBadge>` + claim; claim alone is prohibited. |
| akki.frontend.refusal_in_answer_position | Named surfaces (frontend) | Refusals render where the answer would render, not as modal or toast alongside. |
| akki.frontend.agent_assumed_amber_chip | Named surfaces (frontend) | Agent-assumed fields carry amber chip + XOR-with-supplied source tag. |
| akki.frontend.one_trace_thread_audit_rail | Named surfaces (Northena) | Every sub-cycle-1 screen renders `trace_id` in the audit rail. |
| akki.frontend.no_build_state_on_any_surface | Named surfaces (frontend) | No "coming soon" / loading skeleton. Every capability is either lit (measured) or dormant (visibly unlit/hatched). |
| akki.connect.module_home_lists_dormant_capabilities_honestly | Named surfaces (Connect) | `/connect` lists source-connection capabilities; each carries a "dormant · awaiting OT-1a facts" chip. No live-connected claim. |
| akki.connect.new_source_stub_seam_honestly_marked | Named surfaces (Connect) | `/connect/new` wizard renders as a stub; the "connect" CTA is disabled with tooltip "Awaiting Owner OT-1a facts (source connector registry)"; never presented as live. |
| akki.connect.backend_seam_governed_stub | Named surfaces (Connect) | `POST /api/connect/sources` accepts a source-registration request AND returns 501 `{outcome: "refused", reason: "connect_seam_dormant", detail: ...}` — an honest governed stub. |
| akki.wizard.milestone_capture_step_landed | Named surfaces (Wizard) | Commission wizard gains a milestone-capture step after sample stage, before commit card. Each milestone carries description + done-condition + owner. |
| akki.wizard.milestone_agreement_gates_commit_cta | Named surfaces (Wizard) | Commit CTA is DISABLED until milestone list is agreed. Attempting freeze via direct API returns governed refusal `milestones_not_agreed`. |
| akki.wizard.lawful_basis_mandatory_at_commit | Named surfaces (Wizard) | Lawful basis is a mandatory field; freeze refuses with `missing_lawful_basis` governed refusal envelope. Wizard surface asks for it (never assumed). |
| akki.wizard.commit_review_separates_supplied_from_assumed | Named surfaces (Wizard) | Commit review renders `you_supplied` vs `agent_assumed_items` per-value with confirm-or-change buttons before freeze. |
| akki.commission_view.milestone_front_page_landed | Named surfaces (Commission-View) | `/commission-view` renders milestone checklist + spend-vs-quote at the top level; technical material is drill-down only. |
| akki.commission_view.reads_only_existing_artifacts | Named surfaces (Commission-View) | No new backend compute; reads existing wizard sessions + Northena ledger rows only. Backend gate: no new hot-path SQL. |
| akki.commission_view.missed_milestone_renders_as_plainly_as_done | Named surfaces (Commission-View) | Missed styled with same visual weight as done. Never hidden. Never soft-toned. |
| akki.commission_view.drill_down_evidence_never_leads | Named surfaces (Commission-View) | Drill-down evidence lives on `/commission-view/:sessionId` (progressive disclosure). Never renders on the front page. |
| akki.backend.wizard_state_carries_milestones_and_lawful_basis | Named surfaces (Wizard) | WizardCommitState_v0 additive extension: `milestones_agreed: List[Milestone]` + `lawful_basis: str \| null` fields. D4b assessment: MEDIUM change rate (composition of Owner-supplied fields), does NOT cross env boundary → prior is LIVE, not FREEZE. Landed as v0 additive; snapshot updated in place per LIVE prior. |
| akki.backend.wizard_freeze_refuses_when_milestones_not_agreed | Named surfaces (Wizard) | Wizard freeze endpoint refuses if milestones not agreed → 422 `{outcome:"refused", reason:"milestones_not_agreed"}`. |
| akki.backend.wizard_freeze_refuses_when_lawful_basis_empty | Named surfaces (Wizard) | Wizard freeze endpoint refuses if lawful_basis field empty → 422 `{outcome:"refused", reason:"missing_lawful_basis"}`. |

**Registry version bump:** FPR supplement v0.7 (post-v1 pattern, per governance §14 additive extension). MRR gates still green at parity-count unchanged.

## §4. D4b assessment for backend contract changes

**WizardCommitState_v0** gains two optional additive fields:
- `milestones_agreed: List[Milestone] = []` (empty list default)
- `lawful_basis: Optional[str] = None`

**D4b prior:** LIVE (not FREEZE).
**Rationale:** (a) does NOT cross environment boundary — internal wizard state only, not integration-key/external-consumer wire; (b) MEDIUM change rate — Owner-supplied field shape may iterate as journey completions land (FB-9..FB-16 in later sub-cycles). Consistent with prior additive-live extensions of internal contracts.

**Snapshot:** `wizard_commit_state.contract_snapshot.json` refreshed in place (LIVE prior). Parity count UNCHANGED (34 remains 34; not a new frozen seat).

## §5. Response-class taxonomy (four classes, distinct visual treatments)

Per Owner Sub-Cycle-1 design-law directive:

| Class | Trigger | Visual treatment | Copy shape | Owner ruling anchor |
|---|---|---|---|---|
| `governed_refusal` | Business rule refused the outcome (evidence-insufficient / coverage-gap / system-fault sub-shapes) | Oxblood `#7E3038` left border + refusal action triplet CTAs (VERBATIM) | `{outcome:"refused", reason, detail}` | Ruling 4 |
| `validation_error` | Request payload failed schema/shape validation | Amber `#B07C2A` top banner + "form error" label + field-level highlights | 400 body `{reason:"malformed_payload", ...}` | design law |
| `infrastructure_fault` | System-side error (503/500/timeout) | Sage `#8A8F7C` background + "the system had trouble; try again" (open-slot copy) | 5xx bodies | design law |
| `access_control_denial` | Auth missing / expired / scope-insufficient | Navy `#16304F` icon + honest auth-denial copy (verbatim) + login CTA | 401/403 bodies with `{reason, detail}` no `outcome` | Owner E2 taxonomy |

**Never blended.** Each class has a distinct visual+semantic treatment. No fallback to a generic "error" style.

## §6. Design-law bindings (every screen)

- No build state on any surface (no "coming soon" / loading skeleton framed as capability).
- Class-with-claim in headline position (never claim alone).
- Refusal rendering in the answer position (not modal, not toast alongside).
- Four response classes never conflated.
- Agent-assumed marking (amber chip + XOR-with-supplied source tag).
- One trace thread (`trace_id` in audit rail on every screen).
- Plain language.
- Visual family: cream #F3F2E9 (bg) · navy #16304F (primary) · oxblood #7E3038 (refusal) · sage #8A8F7C (infra fault) · amber #B07C2A (validation error / agent-assumed) · Georgia serif wordmark · Helvetica labels.
- Ratified binding copy VERBATIM (Ruling 4).
- Suspended copy slots rendered marked-open (Ruling 4).

## §7. Build sequencing (this sub-cycle only)

1. Ruling docs + Stage A proposal (this file) landed. ✓ AC-1 + AC-2.
2. Design system utilities (palette, response-classes, ratified copy, marked-open slot).
3. Connect module (frontend + thin backend stub seam).
4. Wizard extension (milestones + lawful basis + supplied-vs-assumed).
5. Commit Review already exists — verify + wire supplied-vs-assumed.
6. Commission View (front page + drill-down).
7. Gate roster (FB-18 + P3S1-* gates).
8. FPR supplement v0.7 + machine YAML regeneration.
9. Backend + frontend tests green; testing agent (frontend + backend) verdict.
10. Close report + journal entry + PRD update.

## §8. Out-of-scope for this sub-cycle (per Owner ruling)

- Plane-observability panel (Ruling 2 — sub-cycle 2).
- FB-8..FB-16 journey completions except FB-8 supplied-vs-assumed which arrives with FB-4 by the wizard-state extension.
- Any Memory + Registry surface (sub-cycle 2).
- Any Govern surface (sub-cycle 3).
- Any Prove + Team surface (sub-cycle 4).
- GPU hardware rental (Ruling 6 — awaiting Owner OT-1a).
- Real archive/CMS source connectors (Connect module — stub only until OT-1a).

═══════════════════════════════════════════════════════════════════

*Stage A proposal — design-only. Ready to build. Cleared to proceed by Owner ruling 2026-08-01 (Phase 3 sub-cycle 1 approved).*
