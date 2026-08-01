# Akki OS — External Pattern Adoption Specification v1.0
## Four adoptions from the agent-economics layer

Source review: Headroom (reversible context compression), Graphify (blind
dual-judge benchmark methodology), CodeBurn (spend observability and budget
guards), Ponytail (control-arm agentic benchmarking).

Adoption doctrine, consistent with the platform: extend existing services
(no siblings), one record, unrepresentable-not-policed where a boundary is
involved, measure-don't-assert, and the Commission View surfaces milestones
only. Each adoption below states purpose, behaviour, contract, placement,
and acceptance criteria. [VERIFY] marks items needing a code walk before
build.

---

## A-1. Reversible compression at the custody seam
*(Headroom-inspired · cost reduction on frontier calls)*

### Purpose
Frontier calls through SyniSense carry real cost. Content-aware compression
of the outbound payload reduces it materially. Reversibility — originals
cached and retrievable — is what makes compression compatible with the
provenance doctrine.

### Placement
Inside the shield, strictly between de-identification and invocation:

```
deidentify → compress → invoke → decompress-as-needed → reidentify
```

Never outside the seam. A third-party compressor is admitted as a
**governed component**: version-pinned, licence recorded in NOTICE, running
in-perimeter with no network access of its own, and covered by the egress
AST gate (FIX-2) like any other module. Whether the implementation is the
external library or an internal equivalent is an engineering choice made
after evaluation; the contract below binds either.

### Behaviour
1. **Token preservation is inviolable.** The compressor MUST pass every
   `[[ENT_XXX_NNN]]` de-identification token through verbatim. This is the
   same invariant class as FIX-4 and gets the same treatment: an automated
   test feeds token-dense payloads through compression and fails the build
   on any mutation.
2. **Economizer, not custody control — therefore fail-transparent, not
   fail-closed.** If compression errors or times out, the call proceeds
   uncompressed. Custody controls fail closed; cost optimizations fail
   transparent. Conflating the two would let a compressor outage silently
   halt governed answering.
3. **Originals are provenance-addressable.** The pre-compression payload is
   retained via the existing artifact store under the call's receipt, so
   the trust receipt can always resolve to what was actually available to
   the model, not the compressed digest.
4. **Savings are metered.** Tokens-before / tokens-after per call land in
   the existing metering rows. This feeds the economics ledger and, later,
   the insurance telemetry — cost posture becomes measurable.

### Contract
`compress(payload, *, preserve_patterns) → {compressed, handle, ratio}` ·
`retrieve(handle) → original`. `preserve_patterns` is fixed by the shield,
not caller-supplied.

### Acceptance criteria
- Token-preservation invariant test in CI; any mutation fails the build.
- Compressor failure produces an uncompressed call and a ledger note, never
  a refused call and never a silent quality change.
- Receipt resolves to the original payload on demand.
- Measured savings reported per provider/model in metering.

[VERIFY] Artifact-store write path from inside the shield; confirm the
receipt schema can carry the retrieval handle.

---

## A-2. Blind dual-judge evaluation protocol
*(Graphify-inspired · makes published benchmarks defensible)*

### Purpose
Every measurement the platform publishes — de-identification recall,
per-stratum accuracy, register cluster naming — is only as strong as its
scoring. Single-judge scoring is challengeable; blind dual-judge scoring
with reported agreement is the research-grade standard.

### Protocol
1. Two judges (human, model, or mixed per task class) score independently,
   blind to each other and to system identity.
2. Inter-judge agreement is computed (Cohen's kappa) and **published with
   the result** — the agreement figure is part of the measurement, not
   internal bookkeeping.
3. A kappa floor is a governed seam value (proposed default 0.70). Below
   floor: the scoring rubric is defective; re-adjudicate the rubric, not
   the scores.
4. Judge identities/versions, rubric version, and kappa land on the ledger
   with the measurement — a scored result is reproducible from its record.

### Where it applies
- Test-set validation before a TargetOutcome accepts its `test_set_ref`.
- Register cluster naming validation (§5.3 of the Audio Plane spec).
- The external evaluation-criteria collaboration: the protocol is the
  concrete answer to "how will comprehension and trust be scored" — offer
  it as the joint methodology.
- Any number published to the evidence register.

### Acceptance criteria
- No measurement enters the evidence register without judge metadata and a
  kappa at or above floor.
- The Objective Wizard rejects a test_set_ref whose validation lacks the
  protocol record.

---

## A-3. Spend guards and cost drill-down
*(CodeBurn-inspired · budget enforcement on commissions)*

### Purpose
The planner quotes cost with an interval; nothing currently enforces the
quote during execution. A budget guard converts the quote from an estimate
into a boundary.

### Behaviour
1. **Budget ceiling per commission.** Set at commission from the quote's
   upper interval bound. Spend approaching the ceiling (threshold a seam
   value, proposed 85%) flags the relevant milestone as *behind* with
   reason `budget`; crossing it pauses further metered work pending the
   objective owner's decision — extend (ceremony-light, owner signature,
   on the record) or stop.
2. **Cost drill-down, not a new surface.** Per-stage and per-model spend
   readouts live behind the Commission View's milestones as drill-down
   evidence, per §13.4 — read from existing metering rows only; no new
   backend computation for display.
3. **Model cost comparison at calibration.** Sampling & Reflection already
   runs multiple configurations; record cost-per-stratum-point alongside
   accuracy so the curriculum can weigh cost, not just quality.
4. **Waste detection as a report, not an agent.** A periodic job over
   metering rows flags: repeated identical calls (dedup miss), calls with
   discarded outputs, and compression bypass rates (A-1). Findings post to
   the commission record.

### Acceptance criteria
- A commission cannot exceed its ceiling without a recorded owner decision.
- Ceiling breach produces a milestone flag, never a silent stop and never
  a silent continue.
- All displayed cost data traces to metering rows; the §13.4 self-policing
  clause applies.

[VERIFY] Metering row granularity in the economics service — confirm
per-call model attribution exists.

---

## A-4. Control-arm agentic benchmarking
*(Ponytail-inspired · isolates whether the mechanism does the work)*

### Purpose
The platform makes mechanism claims: the wizard produces better outcomes
than hand-authoring; the planner's curriculum beats the corpus's natural
distribution; calibration-first beats straight-to-training. Each is
testable with the same cheap design: baseline arm, naive-control arm, full
mechanism arm — scored on the artifacts produced, with safety tiered
separately.

### The harness
- **Arms:** (a) baseline — no mechanism; (b) naive control — the mechanism's
  *intent* as a bare instruction (this is what isolates structure from
  intent); (c) full mechanism.
- **Workload:** real commissions or faithful replicas, small n, repeated.
  Scoring on outputs (coverage achieved, per-stratum accuracy, spend, time)
  — the "score the git diff" principle applied to commissions.
- **Safety/quality tier scored separately** from efficiency, so a cheaper
  arm that degrades quality is visible as exactly that.
- Results scored under A-2's dual-judge protocol where judgement is
  involved; recorded to the ledger like any measurement.

### First three experiments
1. Wizard vs hand-authored TargetOutcomes (arm b: a checklist prompt with
   the wizard's questions but no compile gates).
2. Planner curriculum vs natural-distribution training at equal budget
   (arm b: proportional sampling).
3. Calibration-first vs direct full-run on a small commission (arm b: a
   rule-of-thumb data-volume guess).

### Internal adoption (cheap, optional, recommended)
A reduction-discipline skill for the platform's own development — the
ladder pattern (does it need to exist → reuse → stdlib → minimum) — as an
enforcement mechanism for the Quality Rule Book's "reduction is the
standing test." Benchmark it on the team's own tickets with the same
three-arm design before mandating it.

### Acceptance criteria
- No mechanism claim is published (internally or externally) without at
  least one three-arm run behind it.
- Every run's arms, n, scoring, and judges are on the record.

---

## Build order

| # | Item | Why here |
|---|---|---|
| 1 | A-2 protocol | Cheapest, unblocks external evaluation work, and A-4 depends on it. |
| 2 | A-3 budget ceiling + drill-down | Small delta on existing metering; immediately governs live commissions. |
| 3 | A-4 harness + experiment 3 (calibration) | Calibration is the nearest live claim to test. |
| 4 | A-1 compression | Largest integration surface; needs the FIX-2 egress gate and FIX-4 token invariant in place first. |

## Open decisions (owner: product)
1. A-1: external library as governed component vs internal implementation
   of the pattern — decide after a bake-off scored by the A-4 harness.
2. A-2: kappa floor default (proposed 0.70) and judge composition per task
   class.
3. A-3: ceiling-warning threshold default (proposed 85%).
4. A-4: whether the internal reduction skill becomes mandatory after its
   benchmark, or stays opt-in.

---
*v1.0 — four adoptions, one doctrine. Note the closed loop: A-4 benchmarks
the mechanisms, A-2 makes the benchmarks defensible, A-3 prices every run,
A-1 cuts the cost of running them.*
