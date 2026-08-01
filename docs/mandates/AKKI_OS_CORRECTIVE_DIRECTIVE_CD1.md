# AKKI OS — CORRECTIVE DIRECTIVE CD-1
### Fix · originating error · action class · success conditions · 2026-08-01
### Files in docs/rulings/ · Action classes: REVERSAL / PRESERVATION / ENHANCEMENT / NEW-BUILD

Scope rule for this directive: every item names the error that created it. Where
the build is sound, the action is PRESERVATION and the builder changes nothing —
over-correction is itself a failure mode this directive guards against (§4).

---

## §1 · GPU AND ECONOMICS (the corrected standard)

**Standard of record (Owner, verbatim intent):** capability is pulled through the
two-endpoint seam; compute is the AISCA-granted GPUs connecting outbound;
economics is OBSERVABILITY — telemetry captured so extraction can be costed
after testing, before market. Economics is never seam input and never gates
capability.

**CD-1.1 — Retire the interim-rental construct.**
- ERROR: assistant-manufactured ruling chain (rented instance → spend ceiling →
  bounded task → pod-side needs-list) conflating pull-seam architecture with
  pod-side execution. Five cycles of owner attention consumed on a decision
  that did not exist.
- ACTION: REVERSAL. The B1-as-rental ruling and its needs-list are superseded;
  file the supersession referencing `owner_ruling_b1_bounded_task_2026-07-31.md`.
  No pod-side GPU, cloud-credential, or billing requirement may appear in any
  requirement, ruling, or status document again.
- SUCCESS: grep of docs/ and PRD for pod-side GPU/rental/ceiling requirements
  returns only salvaged/superseded documents; the GPU-proving path is defined
  solely per CD-1.2.

**CD-1.2 — GPU proving redefined as seam exposure + worker onboarding.**
- ERROR: same conflation as CD-1.1 — the proving work was pointed at the
  builder's environment instead of at the seam.
- ACTION: NEW-BUILD (small). A worker onboarding pack: credential issuance flow
  (existing worker_credential machinery), seam-reachability instructions for an
  external worker connecting outbound, and the stub-parity run instructions
  (V1-G1) executable on AISCA-side hardware when the owner supplies access.
  PRESERVATION: the seam itself, the closed 4-code denial registry, the stub
  worker, and gates V1-G1..G7 are correct as built — untouched.
- SUCCESS: onboarding pack on disk; a worker holding only the two-operation
  credential can claim and post against the live seam from outside the pod
  (proven with the stub worker run externally or via documented dry-run);
  zero economics references in the seam (already true — regression gate added
  to keep it true).

**CD-1.3 — Economics observability surface (the missing half).**
- ERROR: assistant carried `grant_usd_per_gpu_hour` and cost formulas as seam
  economics; the owner's actual requirement — aggregation of captured telemetry
  into costing data — was never scheduled, so per-job telemetry is captured
  and unread.
- ACTION: NEW-BUILD. Read-only aggregation over recorded PerceptionResult
  telemetry: gpu_hours and broadcast_hours totals, gpu_hours_per_broadcast_hour,
  and per-unit consumption inputs, rendered as an observability view (placement:
  Govern record or a read-only report — builder proposes placement at Stage A,
  owner confirms). It computes only from recorded telemetry; it gates nothing;
  currency conversion enters only when the owner supplies real rate facts.
- SUCCESS: with zero jobs recorded, every figure renders MarkedOpenSlot; after
  stub jobs run, figures compute from ledger/result records and carry class
  `measured (fixture)`; a break-in-style gate proves the surface has no write
  path and no gating consumer.

**CD-1.4 — Pricing machinery classification pass.**
- ERROR: pre-cut Phase-6 pricing apparatus (quote_service, price_model,
  pricing_tiers, quote instrumentation) survives with market-first emphasis;
  the owner's sequencing is observability now, market pricing after testing.
- ACTION: ENHANCEMENT (classification, not deletion). Each economics module is
  classified CANON-SERVING (cited to the Experience Canon — e.g. the Commission
  card's price/validity/cancellation, budget ceiling) or MARKET-RESIDUE
  (no canon citation). Residue is isolated: no live route reaches it; it is not
  deleted. NOTHING canon-serving is removed — the Commission card's pricing
  behavior is canon and stays.
- SUCCESS: classification table on disk with per-module canon citations;
  every live route into economics traces to a CANON-SERVING module; residue
  modules unreachable from routers (asserted by test); zero canon-serving
  functionality regressed (existing suites stay green).

**CD-1.5 — Tier-lock accumulation: false close corrected, then fixed.**
- ERROR (two-part): (a) unbounded version-file minting — 1,387 files, doubled
  since P1; (b) P1-R7's close claimed an archival policy that does not exist on
  disk — a claim-vs-disk contradiction in a closed item.
- ACTION: ENHANCEMENT + honest-record erratum. First the erratum on the P1
  close (the claim was not delivered — record it plainly). Then bound the
  accumulation: retention/compaction mechanism of the builder's design, no
  ledger-integrity loss, no in-place mutation of sealed content.
- SUCCESS: erratum filed; file count bounded with the bound stated; a
  regression gate fails if the count exceeds the bound; quote/tier reads
  still resolve historical versions they legitimately need.

**CD-1.6 — Fabricated cost figures in stub paths.**
- ERROR: `per_hour_cost_gpu_hours: 0.35` (sample_lifecycle stub) and mock
  Plan-preview cost ranges render as figures without measurement or marking —
  the exact figure class the observability standard says must come from
  telemetry.
- ACTION: ENHANCEMENT. Stub/mock figures render with sample/fixture marking
  and figure-class `stub fixture` wherever they appear (SampleResultCard,
  Plan preview); the constants themselves may remain as stub values.
- SUCCESS: gate cells assert marking renders wherever these figures render;
  no bare unmarked cost figure anywhere in the frontend (sweep + gate).

---

## §2 · RECORD AND ACCOUNTING CORRECTIONS

**CD-2.1 — The test is terminal, not backlog.**
- ERROR: assistant repeatedly re-listed real-material testing as a standing
  gap, re-arguing a sequencing the owner had ruled (build mechanics → then
  test).
- ACTION: REVERSAL in accounting + NEW-BUILD (one page). Remove from all gap/
  backlog registers. Write `docs/mandates/definition_of_done_v1.md`: the
  mechanics-complete checklist and the terminal test's conditions (real
  material, topology selected, BM-V in-phase) in one place.
- SUCCESS: the test appears in exactly one document; no status report or
  register lists it as a gap; BM-V machinery preserved untouched as part of
  the definition.

**CD-2.2 — Out-of-scope products removed from this build's accounting.**
- ERROR: assistant carried Akki for Executives and Customer Portal into this
  build's gap accounting; they are separate products, correctly unscaffolded.
- ACTION: REVERSAL (accounting only). Absent from this build's registers;
  they remain on the shared governance record as separate products.
- SUCCESS: no register, rollup, or status document of this build lists them.

**CD-2.3 — Provenance corrections on assistant-originated values in canon.**
- ERROR: assistant proposals entered the record labeled as owner acts: the
  $1,000 auto-run ceiling ("owner-set"), and UR-2's two interpretive mappings
  (lawful-basis as estate-level; done-condition → acceptance).
- ACTION: PRESERVATION of the values (they are live, gated, and unobjected) +
  ENHANCEMENT of the record: each annotated with true provenance
  ("assistant-proposed, owner-carried [date]"). The ceiling remains
  Change-a-Rule adjustable; the mappings remain in force unless the owner
  strikes them.
- SUCCESS: canon and ruling files carry corrected provenance; no value
  labeled owner-set without an owner act behind it.

**CD-2.4 — Journal integrity.**
- ERROR: future-dated stamps; two stale lines asserting superseded facts
  ("reachable from AskConsolePage nav"; "B1 AWAITING OWNER FIGURE").
- ACTION: ENHANCEMENT. Dating pinned to commit-time UTC; two errata filed.
- SUCCESS: no document stamp postdates its commit; errata on disk; a journal
  entry that contradicts a filed ruling is a named defect class going forward.

---

## §3 · CANON-CONFORMANCE COMPLETIONS (frontend)

**CD-3.1 — In progress / Ready (Canon §6.5).**
- ERROR: the pipeline half of Use Data is unaccounted — either unbuilt, or
  served by pre-Canon `/commission-view` under retired structure.
- ACTION: establish-then-act. Builder reports which. If unbuilt: NEW-BUILD of
  the two sections on the Use Data landing per §6.5 (holds inline, extend
  re-quotes, cancel without reason, Ready's two actions with rights checked
  at click). Then REVERSAL of `/commission-view` (salvage + redirects).
- SUCCESS: `/use-data` renders both sections to §6.5's rules with gate cells;
  `/commission-view` route absent, redirect live, salvage note filed.

**CD-3.2 — Non-Canon top-level routes.**
- ERROR: `/memory` and `/master-admin/*` survive from pre-Canon structure;
  the Canon homes their functions in Govern (§7.1 record, per-application
  memory activity), the developer surface, Team, and `/govern/change-rule`.
- ACTION: REVERSAL of placement, PRESERVATION of pages. `/master-admin/*`
  retires with redirects to its Canon homes. `/memory` pages become
  deep-links from the Govern record and developer surface; no nav or
  top-level presence; one-line Canon v1.1 placement note.
- SUCCESS: no route outside Canon §3.1's structure reachable from any nav;
  redirects live; memory pages reachable from their two Canon entry points.

**CD-3.3 — Legacy seam name on the wire.**
- ERROR: `/api/ask` answers under retired vocabulary; UI retirement did not
  cover the wire, and whether it is the single Prove seam or an alias is
  unestablished.
- ACTION: establish-then-act. If alias: REVERSAL (remove alias, one endpoint
  carries the flow). If single seam: ENHANCEMENT (honest rename with
  deprecation redirect window stated).
- SUCCESS: one endpoint name carries the Prove flow; retired names absent
  from live routes (wire-level vocab gate extended to route names).

---

## §4 · PRESERVATION REGISTER (explicitly untouched — over-correction guard)

The following are sound and MUST NOT be modified under this directive:
worker seam + credential machinery + denial registry; stub worker + V1 gates;
custody enforcement as verified (fail-closed language guard, egress firewall +
AST gate, token-preservation composition, production boot refusal); parity
36/36 and all frozen contracts; the Experience Canon and the six-module
frontend as delivered; per-job telemetry contract (V1-B4/G6); sample-marking
and four-response-class disciplines; the honest-record/close-report loop.
A change to any of these under a CD-1..3 item is out of scope and HAZARD-STOPs.

---

## §5 · SPRINT DECONTAMINATION (inherited assumptions in upcoming work)

**CD-5.1 — GPU proving sprint (was "Phase 2 Stage B prep").**
- INHERITED ERROR: framed around builder-environment execution.
- CORRECTION: reframed per CD-1.2 — seam exposure + onboarding pack + external
  stub-parity run. Real material remains terminal per CD-2.1; nothing in this
  sprint touches it.

**CD-5.2 — "Scheduled for UI-2" assertions in shipped copy.**
- INHERITED ERROR: dormant-honest reasons in the DOM assert a UI-2 schedule
  (retention-window-extension: "dispatch pipeline is scheduled for UI-2";
  succession's contract framing) that no owner dispatch created — an
  assumption rendered as fact to users.
- ACTION: ENHANCEMENT. Dormant copy states "awaits owner dispatch"; no shipped
  surface asserts schedule, phase, or sprint names (also a §2.1-class leak of
  build state onto surfaces).
- SUCCESS: DOM sweep finds no schedule assertions; dormant reasons state only
  what is true (registered in canon; not yet dispatched).

**CD-5.3 — Economics observability sprint.**
- STATUS: newly scoped by CD-1.3/CD-1.4; runs as its own small sprint after
  the §2–§3 corrections; no pricing enhancement of any kind until the owner
  opens the market phase.

**CD-5.4 — Improvement offers.**
- INHERITED ERROR: parked offers accumulate as shadow backlog.
- ACTION: all current parked offers (Prove history tab, wizard draft
  persistence, census-attempt chip, propose-attempt chip, legacy-doc warn
  log) are closed NOT-RULED-IN; each re-enters only via a filed need naming
  the journey it serves.
- SUCCESS: held-items lists empty of improvement offers; the re-entry rule
  filed as standing.

---

## §6 · EXECUTION ORDER AND STANDING RULE

Order: §2 record corrections → §3 conformance completions (one cycle) →
CD-1.5/1.6 → CD-1.2 onboarding pack + CD-1.3 observability build → CD-1.4
classification. Each lands with its success conditions as gate cells where
testable and a close report; establish-then-act items report the finding
before acting.

Standing rule (root cause of most of the above): a proposal is not a ruling.
Anything entering canon, copy, or record as an owner act must trace to an
owner message; assistant- or builder-originated values carry their true
provenance. Violations are a named defect class.

— END CD-1 —
