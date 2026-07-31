# AKKI OS — CONSOLIDATED DISPATCH v2.0
### Owner ruling + execution order · 2026-07-31 · Supersedes UR-1, BUILD DISPATCH v1 frontend scope, SURFACES v2 AMENDMENT, FRONTEND_BRIEF v2
### Reads with: AKKI OS FRONTEND UI/UX BRIEF v1 (attached; "the Canon")

Normative language: MUST / MUST NOT / MAY. On any conflict between documents or
with code: HAZARD-STOP to Owner. Never self-resolve.

---

## §1 CANON

- **1.1** The Canon for all frontend, governance-surface, role, vocabulary, and
  journey work is the attached FRONTEND UI/UX BRIEF v1 and its cited source
  files: `akki_operating_model_product_spec_v2.0.md`,
  `akki_role_register.md`, `akki_analyze_codebase_acquisition_v1.0.md`,
  `owner_change_order_2026-07-25.md` (A1–A8),
  `owner_brief_blinded_assessment_2026-07-25.md`.
- **1.2** RETIRED to `/salvage/`, read-only, never cited as authority:
  SURFACES_v2_AMENDMENT, FRONTEND_BRIEF_v2, the binding-copy ratifications
  (refusal triplet, retention banner, DPO attribution chip), sub-cycle scope
  rulings, and BUILD DISPATCH v1 §§ referencing them.
- **1.3** REMAINS IN FORCE (backend + process, untouched by the Canon):
  BUILD DISPATCH v1 §§1–5 and §7 (AC-1..AC-6, CC series as closed, P1, P2,
  OT track, SR-1..SR-5), the B1/B2 split ruling, CC-6 closure
  (DELEGATED-REVERSIBLE), all frozen contracts and parity chain, all backend
  close reports.
- **1.4** Canon self-completion: the Canon names four files not verbatim-read
  (`RMS_UI_Specification_v2_2.md`, `RMS_UX_Architecture_v2.md`,
  `surface_journey_map_v1.md`, `ui_1_stage_a.md`) and 20 module_spec files.
  Builder MUST verbatim-read all before UI-1 execution and file Brief v2 per
  the Canon's own versioning note. Deltas fold forward into the Canon only;
  nothing folds in from retired artifacts.
- **1.5** `owner_change_order_2026-07-25.md` SHA is re-read from disk and
  recorded in the manifest. A `[MEMORY]` SHA is unverified canon.

## §2 TREE DESIGNATION

- **2.1** The tree carrying the Canon files at their recorded SHAs is
  **canonical**. The other tree is archived read-only on execution of this
  dispatch.
- **2.2** Diff before archive: `contracts/` (both trees claim Parity 34 —
  any divergence in contract set or snapshot bytes: HAZARD-STOP),
  `backend/services/`, `docs/rulings/`, artifact manifests.
- **2.3** Backend code, contracts, and close reports present only in the
  archived tree are carried into the canonical tree and re-attested (diff +
  suite green in destination). Frontend code carries over only where it
  conforms to the Canon (§3.1).
- **2.4** Permanent: one `docs/rulings/` in the canonical tree is the only
  ruling store. Every session reads it at start. A ruling not filed there
  does not exist. This dispatch files there on receipt.

## §3 FRONTEND EXECUTION (UI-1)

- **3.1** All frontend code — from either tree — conforms to Canon Part C
  (nav), Part D (surfaces), Part F (doctrines), Part H (vocabulary) or is
  rebuilt. No refits, remappings, or preserved fields. Where the Canon has
  no field, there is no field. Vocabulary per H.9/H.10 binds: retired terms
  MUST NOT render anywhere on general-user surface.
- **3.2** Page-group transitions owed (Canon Part I.6): `extraction/` →
  `use_data/` with three-door router + conversational wizard (D.3.1–D.3.3);
  `compliance/` → `govern/` with Trust Center two halves (D.4.1),
  enforcement classes (D.4.2), Estate Rules Record S/O/E/D (D.4.3),
  Registries submodule with upload→validate→diff→confirm→version lifecycle
  and the addition/removal asymmetry (D.4.4), Rule Change ceremony with
  visible countdown (D.4.5), Holds surface (D.4.6). New groups: `connect/`
  (D.1 landing, one page, no tabs, seven Connect rules incl. commission
  auto-run ceiling, Class D declaration, source profile with
  plain-language mapping questions), `registry/` (D.2), `prove/` (D.5:
  three response shapes visually distinct, DB-1, DB-2, walk-a-proof),
  `team/` (D.7), `analyze/` (D.6, pending §5.3).
- **3.3** Approval Queue is DELETED (A2.1). "Awaiting approval" leaves the
  lifecycle. Run/Commission Approver role retired. Preserved gates,
  explicit: Release Review and Model Acceptance are untouched.
- **3.4** Commission verdict engine (backend + card): five checks (rights
  compatibility incl. training-rights inheritance · privacy floor · PII
  posture incl. Class D resolvability · budget ceiling · scope
  resolvability), three receipted outcomes (Runs now · Refused · Held for a
  check), auto-run ceiling with single DPO countersign above it, changeable
  only via Change-a-Rule (A2.2/A2.3, D.3.4). Escalatable refusals state
  criterion + value + route; absolute refusals render no approval
  affordance of any kind.
- **3.5** Contracts owed: `UseDataWizardSession@v0` (Parity 34→35),
  `CommissionVerdict@v0` (35→36). Frozen with sibling snapshots per W5;
  seal events; freeze argued on D4b at Stage A.
- **3.6** Role gating per Canon C.3 exactly. Six classes (Master Admin ·
  DPO · Operator · Analyst · Executive · Customer). Executive and Customer
  surfaces are separate applications (D.8, D.9), not OS nav; OS build does
  not scaffold them ahead of §5.4.
- **3.7** Gate roster, non-exhaustive, filed with UI-1 Stage A:
  `gate_absolute_refusal_no_affordance` · `gate_fault_shares_no_refusal_
  components` · `gate_failed_lookup_never_converts_refusal_to_fault` ·
  `gate_card_commits_no_silent_dialogue_values` · `gate_retired_vocabulary_
  absent` · `gate_registry_version_recorded_per_run` · `gate_removals_and_
  edits_gated_additions_immediate` · `gate_extend_scope_requotes` ·
  `gate_every_figure_carries_class` · `gate_ceremony_countdown_visible_and_
  cancelable`. Break-in style where the gate guards a boundary (SR-4).
- **3.8** Wire-level contradictions surfaced during conformance (backend
  behavior vs Canon surface behavior) are HAZARD-STOPs to Owner. Builder
  does not accommodate by design.

## §4 BACKEND CONTINUITY (unchanged, runs in parallel)

- **4.1** Verified state of record: Parity 34; backend suite 1,444 pass /
  0 fail; Jest 194 / 0 fail. Memory Service live at /api/memory/* (8
  endpoints; five-ring write-back; governed publication failing loud on the
  unset [SLOT] threshold; revocation; ledger reconstruction). P1 closed
  32/32. P2 buildable-now closed (V1-G2/G3/G6 tightened, V1-G4 real intake,
  GPU-import AST gate). Engineer-key grant derivation single-sourced
  (EE-R4). CC-2 executed (dependencies presence-mandatory, rows backfilled,
  validator tightened). CC-6 closed Path α: originals retained; codec is a
  reversible builder [SLOT].
- **4.2** B1 (GPU workers on synthetic fixture, interim hardware) remains
  authorized: fixture-only; no B1 figure quoted beyond the build record;
  starts on §6.1.
- **4.3** B2 (real material, selected topology, BM-V in-phase with
  mechanically-blocked close absent a verdict) remains gated on §6.2–§6.4.
- **4.4** Grants-revision JWT claim: parked; rules in only on a measured
  latency/load figure.
- **4.5** Plane-observability panel: rides the `govern/`+memory surface
  work under Canon vocabulary; read-only aggregates over the existing
  reconstructor; zero new contracts.

## §5 EXECUTION ORDER

1. §2 tree designation + diff + carry-over (HAZARD-STOP on parity
   divergence).
2. §1.4 canon self-completion read; Brief v2 filed.
3. UI-1 Stage A against Canon Part D + this dispatch; gate roster §3.7;
   contracts §3.5.
4. UI-1 execution in module sub-cycles, each independently verified with
   on-disk close reports (AC-1): use_data → govern → connect →
   registry/prove → team.
5. **5.3** `analyze/` builds only after `workbook_analyzer/` acquisition
   lands per `akki_analyze_codebase_acquisition_v1.0.md` (Canon I.3 records
   it NOT PRESENT).
6. **5.4** Akki for Executives and Customer Portal are separate
   applications commissioned by separate Owner dispatch; not in UI-1 scope.

## §6 OWNER ITEMS (gate only what they name)

- **6.1** B1 interim GPU spend ceiling: $______ (blocks B1 hardware rental
  only).
- **6.2** OT-1a archive facts (RMS-side): digitized state · storage system ·
  network path · formats · CMS location · access mechanism.
- **6.3** OT-1b grant-provider: GPU parameters → Topology A/B selection +
  HS2 ratify/strike (closes CC-4).
- **6.4** OT-2: Hour A + 300-unit human-qualified slice drawn from Hour A,
  uncurated. OT-3: LLM account · domain+TLS · object store · data-plane
  destination.
- **6.5** Commission auto-run ceiling value (numeric + currency; ∞
  permitted) — Connect rule seven; needed at `connect/` build, not before.

— End of dispatch. —
