# AKKI OS — COMMISSIONING PACKAGE CP-1
### One dispatch · 2026-08-01
### Commissions together: CORRECTIVE DIRECTIVE CD-1 (as revised in Part 1) ·
### External Pattern Adoption Spec v1.0 (as conformed in Part 2) ·
### LLM CONSUMPTION LEVERS LC v1.0 (unamended) · unified order in Part 3 ·
### Owner slots consolidated in Part 4.

Objective statement of record, governing priority across this package
(Owner-stated): the primary economic objective is REDUCTION OF LLM
CONSUMPTION, measured as tokens-per-answer falling. Measurement and
defensibility work serves this and the terminal test; it does not outrank it.

---

## PART 1 · CD-1 REVISION A (deltas only — everything not listed stands)

**CD-1.3 (economics observability) — amended.** The surface's job is
re-scoped per the consumption objective: (a) prove tokens-per-answer falls,
per lever, from metering rows; (b) decompose cost-per-qualified-unit
(GPU share · LLM share · per-language · per-condition-stratum) for
post-test pricing. Added requirement: **baseline capture** — tokens-per-answer
and per-tier distribution recorded from existing metering BEFORE LC-1
enables, so every lever's contribution is attributable. No other change.

**CD-2.1 (definition of done) — amended.** `definition_of_done_v1.md` gains
one requirement from the adoption work: the terminal test's human-qualified
slice is scored under the A-2 dual-judge protocol with judge metadata and
kappa on the record. Rationale: the protocol must exist before the test runs
or its verdict is single-judge permanently. This is the package's one hard
ordering constraint.

**§6 (execution order) — superseded by Part 3 of this package.**

**Unchanged and reaffirmed:** CD-1.1/1.2 (rental reversal, seam-side GPU
proving), CD-1.4/1.5/1.6, §2 record corrections, §3 conformance completions,
§4 preservation register (extended: the LC levers and adoptions are
economizers/instruments and may not modify anything on the preservation
register; token-preservation invariant now explicitly listed there), §5
sprint decontamination, §6 standing rule (a proposal is not a ruling).

---

## PART 2 · ADOPTION SPEC v1.0 → v1.1 CONFORMANCE DELTAS
### (the uploaded spec is commissioned AS AMENDED HERE; its patterns are
### adopted, its stale anchors are not)

**D2.1 Lineage re-map (applies document-wide):**
| Spec anchor (stale) | Anchor of record |
|---|---|
| Commission View / §13.4 milestones | Drill-down behind In progress rows (Canon §6.5); milestone structures remain struck |
| Objective Wizard / TargetOutcome / test_set_ref | Use Data conversation + commission admissibility (Canon §6.2–6.4); test-set validation records enter the evidence register |
| FIX-2 | Egress AST gate (as built, P1) |
| FIX-4 | Token-preservation invariant (as built, P1; binds LC-1..3 and A-1 identically) |
| "insurance telemetry" | STRUCK — serves no named owner goal |
| Internal reduction-skill mandate (A-4 tail) | STRUCK as mandate; MAY exist opt-in; never enforcement machinery |

**D2.2 A-1 (compression) — adopted with sequencing correction.** All four
behaviors and the contract stand (fail-transparent economizer; originals
provenance-addressable via artifact store; savings metered). Sequenced as the
FOURTH consumption reducer, after LC-3; build trigger is terminal-test
approach (frontier volume onset), not calendar. Library-vs-internal decided
by bake-off scored under A-4 (Owner slot O-9).

**D2.3 A-2 (blind dual-judge) — adopted with deployment re-target.** Protocol
stands verbatim (independent blind scoring; kappa computed and published with
the result; below-floor means the rubric is defective, not the scores; judge
metadata + rubric version + kappa on the ledger). First deployments, in
order: (1) the terminal test's BM-V slice (per CD-2.1 amendment); (2) the
per-language custody recall harness; (3) Model Acceptance's human judgment;
(4) refusal-correctness sampling on the Govern record. The evidence register
(one schema: figure · method · judges/versions · rubric version · kappa ·
date · source rows) is the landing store; no figure quoted externally
without resolving to a register row. Kappa floor enters as an O-class rule.

**D2.4 A-3 (spend guards) — adopted SPLIT.**
- ALREADY CANON, not adopted (no double-build): the commission budget
  ceiling and halt-at-ceiling (Canon §6.3/6.4, verdict check 4).
- ADOPTED: the ceiling-warning flag at threshold [O]; the extend-or-stop
  owner decision at breach, on the record; cost drill-down behind In
  progress rows reading existing metering only; **calibration
  cost-per-stratum-point recorded alongside accuracy** (feeds differential
  pricing post-test).
- ADOPTED RE-HOMED: waste detection lands as a MONITORED-class rule in the
  Estate Rules Record (measured, reported, non-blocking), with one addition
  beyond the spec: dedup-miss findings feed LC-1 verification (a found
  dedup miss is a cache-hit opportunity counted, and after LC-1, a cache
  defect if it persists).
- [VERIFY] carried: per-call model attribution granularity in metering rows
  is confirmed at Stage A before drill-down builds.

**D2.5 A-4 (control-arm benchmarking) — adopted with the scoping sentence.**
A-4 is CLAIMS VALIDATION and may never be a build gate: no benchmark is an
approval condition for building known mechanics. No mechanism claim is
published without a three-arm run; arms/n/scoring/judges on the record;
quality tier scored separately from efficiency; judged runs use A-2. It is
the standing re-entry mechanism for closed improvement offers (CD-5.4): a
killed item returns only with a filed need AND a three-arm result. Its
real-material experiments run post-terminal-test.

---

## PART 3 · UNIFIED EXECUTION ORDER (supersedes CD-1 §6 order)

Track A — Corrections (first, one cycle each where cyclable):
1. CD §2 record corrections (test-terminal accounting · out-of-scope
   removal · provenance annotations · journal integrity).
2. CD §3 conformance completions (In progress/Ready establish-then-act ·
   non-Canon routes · /api/ask seam).
3. CD-1.5 tier-lock erratum + bound · CD-1.6 stub-figure marking ·
   CD-5.2 schedule-assertion copy fix.

Track B — Consumption levers (the priority track; starts in parallel with
Track A step 2, since it touches only the shield/router layer):
4. CD-1.3 baseline capture (BEFORE any lever enables).
5. LC-1 cache → LC-2 routing → LC-3 narrowing, each enabled separately,
   savings attributed per lever from metering.
6. A-1 compression: at terminal-test approach (Owner slot O-9 decides
   implementation via A-4 bake-off).

Track C — Evidence machinery (small, mostly protocol + register):
7. Evidence register + A-2 protocol (deployment order per D2.3) —
   MUST complete before the terminal test runs (the package's one hard
   ordering constraint).
8. A-3 adopted portions (warning flag · breach decision · drill-down ·
   calibration cost-per-stratum · waste-as-Monitored-rule).
9. A-4 harness lands dormant-ready; experiments run post-terminal-test.

Track D — GPU proving (unchanged from CD-1.2): onboarding pack; external
stub-parity when Owner supplies AISCA access. Independent of A–C.

Every item lands with its success conditions as gate cells where testable
and an on-disk close report; establish-then-act items report before acting.

---

## PART 4 · CONSOLIDATED OWNER SLOTS (set once, here, or defer per slot)

| # | Slot | Proposed | Source |
|---|---|---|---|
| O-1 | Cache TTL ceiling | 24h | LC-1 |
| O-2 | Undeclared-task-class default tier | Balanced | LC-2 |
| O-3 | Frontier class list | cross-lingual reasoning · contested-evidence adjudication · long-form composed conclusions | LC-2 |
| O-4 | Chronic-escalation threshold | 15% of calls per class | LC-2 |
| O-5 | Per-class context budgets | builder proposes at Stage A from measured payload sizes | LC-3 |
| O-6 | Narrowing retry policy on evidence-cannot-support | one full-context retry, divergence ledgered | LC-3 |
| O-7 | Narrowing miss-rate flag threshold | 5% | LC-3 |
| O-8 | Kappa floor | 0.70 | A-2 |
| O-9 | A-1 implementation (library vs internal) | decide by A-4 bake-off at trigger | A-1 |
| O-10 | Ceiling-warning threshold | 85% | A-3 |
| O-11 | Judge composition per task class | builder proposes per class at Stage A | A-2 |
| O-12 | CD-1.3 surface placement | builder proposes at Stage A | CD-1.3 |

Unset slots do not block commissioning: proposals stand as provisional
values marked assistant-proposed in the record (CD §6 provenance rule) and
convert to Owner-set on your confirmation or replacement, per slot, any
time before the consuming item's close.

— END CP-1 —
