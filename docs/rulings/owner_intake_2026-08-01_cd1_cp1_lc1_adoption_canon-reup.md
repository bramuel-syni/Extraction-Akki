# Owner document intake — 2026-08-01 (RESUME cycle)

## Canon SHA check
- **Path:** `/app/docs/mandates/AKKI_OS_EXPERIENCE_CANON_v1.md`
- **Committed SHA256:** `6d9ed7d8bce5ce3fed180407a20d4550a3a95744ccb21735ac66351ffe3b3757`
- **Re-upload SHA256:** `6d9ed7d8bce5ce3fed180407a20d4550a3a95744ccb21735ac66351ffe3b3757`
- **Verdict:** BYTE-IDENTICAL · record-only, no supersession · no deltas.
- **Line count:** 594 (both).

## Four new documents committed to `/app/docs/mandates/`

| # | File | SHA256 | Lines |
|---|---|---|---|
| 1 | `AKKI_OS_CORRECTIVE_DIRECTIVE_CD1.md` | `086aef119490bdb64d5b4930ed26855630de1bb7409fad7a9959f61ad6afa7fd` | 241 |
| 2 | `AKKI_OS_COMMISSIONING_PACKAGE_CP1.md` | `1cdcced0a5b52b843286610a862ef5e263eb5ec2dd8f49dd2f8350c16678cc74` | 158 |
| 3 | `AKKI_OS_LLM_CONSUMPTION_LEVERS_v1.md` | `925c06901ff693e1530bfdefc2d17c33ef55bff9e395dee00808d9112997ae8d` | 167 |
| 4 | `akkios_external_pattern_adoption_spec_v1.0.md` | `91d71c852e98c5e79fb0a2a599e65eb097bb81d134281d1d58afe042d52709c4` | 218 |

## Per-document intake summaries

### 1. CD-1 — Corrective Directive (highest-authority intake)

CD-1 is a **doctrine-level corrective directive** naming ERRORS in the assistant's prior conduct and prescribing REVERSAL / PRESERVATION / ENHANCEMENT / NEW-BUILD per item. **Over-correction is itself a named failure mode** (§4 — preservation register). Key bindings:

- **§1 · GPU / Economics** — five items (CD-1.1..CD-1.6). Interim-rental construct is **REVERSED** (superseded by seam-only proving). "Economics is observability, never seam input." A new read-only economics-observability surface is scoped (CD-1.3) but its target is re-scoped by CP-1 to prove **tokens-per-answer falling** (see below).
- **§2 · Record and accounting corrections** — CD-2.1 (real-material test is TERMINAL not backlog · one file `definition_of_done_v1.md`), CD-2.2 (Akki-for-Executives + Customer Portal REMOVED from this build's accounting), CD-2.3 (assistant-originated values in canon must carry true provenance — the $1,000 auto-run ceiling is now `assistant-proposed, owner-carried`), CD-2.4 (journal integrity · future-dated stamps + stale claims filed as errata).
- **§3 · Canon-conformance completions (frontend)** — three items I must attend to on the CURRENT build:
  - **CD-3.1** — In progress / Ready sections on `/use-data` per Canon §6.5 (establish-then-act: report if unbuilt vs pre-Canon `/commission-view`, then either NEW-BUILD or REVERSAL + redirect).
  - **CD-3.2** — `/memory` and `/master-admin/*` are **non-Canon top-level routes** → REVERSAL of placement, PRESERVATION of pages. Memory pages become deep-links from Govern record + developer surface; `/master-admin/*` retires with redirects to Canon homes.
  - **CD-3.3** — legacy seam name `/api/ask` on the wire → establish-then-act (alias vs single seam).
- **§4 · Preservation Register (HAZARD-STOP guard)** — untouchable under CD-1: worker seam + credential machinery + denial registry; stub worker + V1 gates; custody enforcement; parity 36/36 + all frozen contracts; the Experience Canon and six-module frontend AS DELIVERED (my P0 auth-strip fix is on the delivered shell → verify no §4 conflict → NO CONFLICT: the strip is UX addition, no contract/seam/gate change); per-job telemetry; sample-marking; four-response-class discipline.
- **§5 · Sprint decontamination** — CD-5.2 hits UI copy: dormant reasons in the DOM asserting "scheduled for UI-2" are a §2.1-class leak of build state onto surfaces → must state only "awaits owner dispatch". Sweep-and-fix scope.
- **§6 · Standing rule** — "a proposal is not a ruling." Assistant-originated values entering canon must carry provenance. Violations = named defect class.

**HAZARD-STOP scan against current build:** none directly triggered by CD-1. But CD-3.2 (retire `/memory` + `/master-admin/*` as top-level routes) contradicts existing `App.js` route table AND UI-1-A dormant/team layout — this is a scheduled REVERSAL, not a HAZARD-STOP.

### 2. CP-1 — Commissioning Package (one dispatch, unifies CD-1 + Adoption Spec + LC v1.0)

CP-1 declares an **economic objective of record** and revises CD-1 + Adoption Spec in place:

> "The primary economic objective is REDUCTION OF LLM CONSUMPTION, measured as tokens-per-answer falling."

Key deltas:
- **CD-1.3 amended:** the economics-observability surface's job is now (a) prove tokens-per-answer falls per lever, (b) decompose cost-per-qualified-unit. **Baseline capture is required BEFORE any LC lever enables** (so attribution is possible).
- **CD-2.1 amended:** definition_of_done_v1.md must include the A-2 dual-judge protocol scoring the terminal test's human-qualified slice. This is **the one hard ordering constraint in the whole package** — protocol before test.
- **Preservation register EXTENDED:** token-preservation invariant, LC levers themselves, and the adoptions are all economizers/instruments and MAY NOT modify anything on the preservation register.
- **Adoption Spec v1.0 → v1.1 conformance:** stale anchors re-mapped (Commission View → drill-down behind In progress rows; Objective Wizard → Use Data conversation + Canon §6.2-6.4; FIX-2 → egress AST gate; FIX-4 → token-preservation invariant). Insurance telemetry is STRUCK ("serves no named owner goal"). Internal reduction-skill mandate is STRUCK (may exist opt-in, never enforcement).
- **A-3 SPLIT:** commission budget ceiling + halt is **already Canon (§6.3/6.4)** — DO NOT double-build. Only the warning flag + extend-or-stop decision + drill-down + calibration cost-per-stratum + waste-as-Monitored-rule are new adoptions.
- **Unified execution order (Part 3):** Tracks A/B/C/D running partly in parallel.
  - **Track A** — CD §2 record corrections → CD §3 conformance completions → CD-1.5/1.6 + CD-5.2 copy fix.
  - **Track B (priority)** — CD-1.3 baseline capture → LC-1 cache → LC-2 routing → LC-3 narrowing → A-1 compression at terminal-test approach.
  - **Track C** — Evidence register + A-2 protocol (MUST complete before terminal test) → A-3 adopted portions → A-4 harness dormant-ready.
  - **Track D** — GPU proving (worker onboarding pack; unchanged from CD-1.2).
- **12 Owner slots (O-1..O-12)** consolidated in Part 4 — unset slots don't block; assistant-proposed provisional values apply until Owner confirms.

**HAZARD-STOP scan:** none.

### 3. LC v1.0 — LLM Consumption Levers Specification

Three economizer levers, all classed as ECONOMIZERS not custody controls (**fail-transparent**, never fail-closed). Token-preservation invariant binds all three (de-identification tokens pass through verbatim; automated tests fail build on any mutation).

- **LC-1 · Shield Response Cache (largest lever)** — cache in the shield after de-identification, before invocation. Key is hashed over de-identified payload + model preference + composed-system-message version + masking-tier config version + rule-set version + census/holdings version + Class-D registry versions in scope. Any component bump = natural invalidation. Per-tenant, per-key-scope. TTL ceiling 24h [O-1].
- **LC-2 · Model Routing by Task Class** — cheapest-first ladder: No-LLM (mechanical) → Economy (reformatting/extraction/template) → Balanced (multi-source reasoning) → Frontier ONLY for declared frontier class list [O-3]. Undeclared default [O-2] Balanced. One-tier escalation retry on acceptance failure; chronic escalation >15% [O-4] flags the routing row.
- **LC-3 · Retrieval Narrowing** — per-task-class context budget [O-5]. Evidence rank order until budget; boilerplate stripped by template not model judgment. Quality guard: narrowed evidence-cannot-support → one full-context retry [O-6]; miss rate >5% [O-7] flags class.

Measurement: singular purpose of the Cost Ledger under this spec is to prove tokens-per-answer falls. Baseline captured BEFORE LC-1 enables; levers enabled separately for attribution.

**HAZARD-STOP scan:** none.

### 4. External Pattern Adoption Spec v1.0 (SUPERSEDED IN PLACE by CP-1 Part 2)

Original spec proposed four adoptions. CP-1 conformed:
- **A-1 (Headroom-inspired compression)** — adopted; sequenced FOURTH after LC-3, triggered by terminal-test approach; library-vs-internal decided by A-4 bake-off (Owner slot O-9).
- **A-2 (blind dual-judge)** — adopted verbatim protocol. Deployment order: (1) terminal-test BM-V slice (per amended CD-2.1), (2) per-language custody recall harness, (3) Model Acceptance human judgment, (4) refusal-correctness sampling on Govern record. Evidence register is landing store. Kappa floor 0.70 [O-8].
- **A-3 (spend guards)** — adopted SPLIT: already-Canon items (budget ceiling + halt) NOT rebuilt; new items = warning flag [O-10 at 85%], extend-or-stop decision, drill-down behind In-progress rows, calibration cost-per-stratum, waste-as-Monitored-rule (with LC-1 dedup-miss cross-check).
- **A-4 (control-arm benchmarking)** — adopted with clarifying sentence: "CLAIMS VALIDATION and may never be a build gate." Standing re-entry mechanism for closed improvement offers (CD-5.4). Real-material experiments run post-terminal-test.

**HAZARD-STOP scan:** none. The stale anchors in v1.0 (Commission View, Objective Wizard, TargetOutcome, test_set_ref, FIX-2/FIX-4, insurance telemetry, internal reduction-skill mandate) are ALL re-mapped or STRUCK by CP-1 Part 2 — I MUST NOT act on the stale anchors.

## Combined implication for the build queue

Reading CD-1 + CP-1 as one dispatch, the build queue that emerges from these documents is:

### Immediate (Track A · corrections)
1. **CD §2 record corrections** — file `definition_of_done_v1.md` with A-2 dual-judge for terminal-test BM-V slice included · remove Akki-for-Exec + Customer Portal from this build's registers · annotate provenance on assistant-originated values ($1,000 ceiling + UR-2 mappings) · file two journal errata + fix future-dated stamps.
2. **CD §3 conformance completions** — CD-3.1 (In-progress/Ready sections on /use-data · establish-then-act) · CD-3.2 (retire `/memory` + `/master-admin/*` from top-level routing; keep pages as deep-links) · CD-3.3 (establish-then-act on `/api/ask` wire).
3. **CD-1.5** tier-lock erratum + accumulation bound.
4. **CD-1.6** stub-figure marking sweep.
5. **CD-5.2** DOM sweep: replace "scheduled for UI-2" copy with "awaits owner dispatch" everywhere.

### Track B (priority · consumption reduction · runs in parallel with A2+)
6. **CD-1.3** baseline capture — record tokens-per-answer and per-tier distribution from existing metering rows before any LC enables.
7. **LC-1** shield response cache.
8. **LC-2** model routing by task class.
9. **LC-3** retrieval narrowing.
10. **A-1** compression (deferred to terminal-test approach).

### Track C (evidence machinery)
11. **A-2 protocol + evidence register** — HARD ORDERING: must complete before terminal test runs.
12. **A-3 adopted portions** — warning flag + breach-decision + drill-down + calibration cost-per-stratum + waste-as-Monitored-rule.
13. **A-4 harness** — land dormant-ready; experiments post-terminal-test.

### Track D (GPU proving · independent)
14. **CD-1.2** worker onboarding pack — credential issuance flow, seam-reachability instructions, external stub-parity run instructions (V1-G1) executable on AISCA-side hardware when Owner supplies access.

### Also outstanding from prior UI-1 close
- UI-1 ROLL-UP dispatch to Owner (already filed at `/app/docs/rulings/ui1_rollup_2026-08-02.md` per prior close, awaiting Owner carriage).
- The Owner said "on green I run my independent pass, then the UI-1 roll-up goes to the Owner" — the P0 auth strip is GREEN per iter27, so the UI-1 roll-up is ready to dispatch.

## No new build scope started
Per Owner instruction: intake filed on disk, summaries here, HAZARD-STOP scan clean. No new build scope has been initiated from any of the four documents. Awaiting Owner review of this intake report before dispatching any of the 14 items above.
