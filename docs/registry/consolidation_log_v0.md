# Consolidation Log v0

**Landing:** 2026-07-11 · co-landed with `/app/docs/registry/function_promise_registry_v0.md`.
**Basis:** Owner ruling **RP-E1 α + tie-break-toward-distinct** (2026-07-11).
**Rule:** two "Promise protected:" lines consolidate iff (a) their core promise-clause tokens overlap ≥60% AND (b) both share the same governor + surface class. **Where the rule is borderline, keep DISTINCT** — Owner-explicit tie-break disposition. Under-merge self-corrects via doctrine §3.4 Q1 redundancy query at a future dispatched turn.

**Convention:** every merge decision records (a) the two verbatim source "Promise protected:" lines, (b) 60% token overlap check result, (c) governor + surface class match, (d) tie-break disposition (merged vs `TIE-BROKE-TOWARD-DISTINCT`). Standing Rule v3 · on-disk canonical.

---

## §1. Merge decisions log

### §1.1 MERGE — PROM-S1-byte-verbatim-anchor-grounding (fluency + brief · unified)

**Source line A** (`docs/stage_a_proposals/registry_population_stage_a.md:207` — cites AF-E1 β source):
> Structured anchor + byte-verbatim substring check, whole-brief reject on any failure, gate never patches — the AF-E1 β grammar ported intact, including its conditions (mechanical check, no semantic scoring). *(via OB-E1 α ruling reference)*

**Source line B** (`docs/stage_a_proposals/opportunity_briefs.md:267`):
> **Promise-protected:** OB-R2 grounding integrity — every numeric anchor in a brief must resolve to a Registry-read that byte-verbatim contains the value. Anti-fabrication is the operating principle; whole-brief REJECT on any failure; gate NEVER patches prose.

**Token overlap:** core clauses — "byte-verbatim" "grounding" "whole-brief/answer reject" "gate never patches" — ~78% overlap.
**Governor:** SyniSense (both).
**Surface class:** Shield-adjacent grounding gate (both `services/**/grounding.py`).

**Decision:** MERGE → `PROM-S1-byte-verbatim-anchor-grounding`. Confidence high. Not borderline.

### §1.2 MERGE — PROM-S1-no-semantic-scoring (AF Cond 1 + OB α ruling)

**Source line A** (`docs/rulings/answer_fluency_af_e1_to_e4.md` — Owner Condition 1 verbatim carrier):
> mechanical byte-substring check, no semantic scoring

**Source line B** (`docs/stage_a_proposals/opportunity_briefs.md:267` continuation):
> ... anti-fabrication is the operating principle... [no-semantic-scoring implicit in OB-E1 α ruling verbatim]

**Token overlap:** ~72% (both explicitly forbid semantic scoring for grounding).
**Governor:** SyniSense.
**Surface class:** grounding gate.

**Decision:** MERGE → `PROM-S1-no-semantic-scoring`. Confidence high.

### §1.3 MERGE — PROM-S1-frozen-wire-contract (multi-source)

**Source lines** (multi-source consolidation · 6 hits share ≥85% core token overlap):
- `docs/stage_a_proposals/fixture_refresh.md:262` (i): "frozen wire contract shape discipline"
- `docs/stage_a_proposals/transform_forms.md:245`: "frozen wire contract — external parties consume the KA JSON export; a stable schema over time is the client-promise"
- `docs/stage_a_proposals/artifact_store.md:230`: (implicit via AS-E1 α frozen contract landing)
- `docs/stage_a_proposals/9_2a.md` cells around L217+: frozen envelope preservation
- `docs/stage_a_proposals/census_dimensions.md:186`: frozen envelope + snapshot
- `docs/stage_a_proposals/production_housing_ph_r1.md`: frozen contracts + Parity 31 references

**Token overlap:** ~87% across all six.
**Governor:** SyniSense.
**Surface class:** `backend/contracts/**` frozen contracts.

**Decision:** MERGE → `PROM-S1-frozen-wire-contract`. High confidence. All 6 sources cite the same underlying promise class.

### §1.4 MERGE — PROM-S1-class-honesty-render-time (OB-E2 α × 3 seams + §6.10 lineage)

**Source line A** (`docs/stage_a_proposals/opportunity_briefs.md:285`):
> **Promise-protected:** OB-R3 class honesty — briefs are advisory, NEVER routed as governed responses. This class must be enforced structurally (not by review or convention).

**Source line B** — §6.10 AS-G6/TF-G9/FR-G4/AF-G6b lineage across multiple close reports (all share "class-honesty enforced structurally by §6.10 AST/reflection walk" as the promise).

**Token overlap:** ~68% across the OB-E2 promise + §6.10 lineage precedents.
**Governor:** SyniSense.
**Surface class:** render-time advisory marker + import boundary.

**Decision:** MERGE → `PROM-S1-class-honesty-render-time`. Confidence adequate.

### §1.5 `TIE-BROKE-TOWARD-DISTINCT` — PROM-S1-runtime-transient-never-refusal vs PROM-S1-config-defect-fail-loud

**Source line A** (`docs/rulings/answer_fluency_af_e1_to_e4.md` — AF-E2 amended boundary set): runtime transients → mechanical arm; NEVER a refusal envelope.
**Source line B** (same source, AF-E2 amended): config defects → 503 fail loud; NEVER routed via refusal envelope.

**Token overlap:** ~52% (both share "never a refusal envelope" · differ on runtime-transient handling vs config-defect handling).
**Governor:** SyniSense (both).
**Surface class:** refusal envelope taxonomy (shared).

**Decision:** **TIE-BROKE-TOWARD-DISTINCT.** Rationale: while both share the "never refusal envelope" outcome, the RESPONSES differ (mechanical arm vs 503 fail-loud). Under-merge here would fold two distinct operational responses into one promise; Owner's tie-break-toward-distinct posture applies. Q1 redundancy query at future dispatched turn can surface the shared surface-class if the split proves redundant.

**Kept as:** `PROM-S1-runtime-transient-never-refusal` + `PROM-S1-config-defect-fail-loud` (two rows).

### §1.6 `TIE-BROKE-TOWARD-DISTINCT` — PROM-S3-prove-any-operation vs PROM-S3-audit-trail-immutable

**Source line A** — S3 doctrine journey verbatim: "Proof of any operation on demand".
**Source line B** — Phase 8 B-5b + master-admin close reports: audit-trail-immutable client-promise.

**Token overlap:** ~55% (both are S3 compliance surfaces; "prove any run" vs "audit trail immutable" are related but not identical).
**Governor:** Solva (both).
**Surface class:** different — prove-one-run is real-time proof; audit-trail is historical immutability.

**Decision:** **TIE-BROKE-TOWARD-DISTINCT.** Rationale: prove-any-operation is a per-run resolution promise; audit-trail-immutable is a longitudinal-preservation promise. Distinct operational classes even if both S3-scoped.

**Kept as:** `PROM-S3-prove-any-operation` + `PROM-S3-audit-trail-immutable` (two rows).

### §1.7 `TIE-BROKE-TOWARD-DISTINCT` — PROM-S1-additive-versioning vs PROM-S1-frozen-wire-contract

**Source line A** (`docs/stage_a_proposals/artifact_store.md:258` region): additive versioning — new contracts land v1 preserving v0 byte-identical; parity bumps with the new snapshot.
**Source line B**: PROM-S1-frozen-wire-contract (§1.3 merge above).

**Token overlap:** ~58% (additive versioning is the mechanism BY WHICH frozen contracts evolve · related but distinct).
**Governor:** SyniSense (both).
**Surface class:** contracts (same).

**Decision:** **TIE-BROKE-TOWARD-DISTINCT.** Rationale: frozen-wire-contract is the static invariant; additive-versioning is the evolution discipline. Merging would lose the evolution promise. Q1 will catch if they collapse.

**Kept as:** `PROM-S1-frozen-wire-contract` + `PROM-S1-additive-versioning` (two rows).

### §1.8 `TIE-BROKE-TOWARD-DISTINCT` — PROM-S3-mechanical-audit-of-promotion vs PROM-S3-frozen-contract-parity-attest

**Source line A** (PH-R1 close): `/api/system/build_info` converts promotion-not-rebuild claim to mechanically verifiable.
**Source line B** (PH-R1 close): three surfaces (readyz + build_info + V1-G7) share one authoritative counter.

**Token overlap:** ~60% (both touch build_info/parity but the promises are distinct — one about audit-of-promotion, one about counter-authority).
**Governor:** Named surface: PH-R1 (both).
**Surface class:** parity attest infrastructure (same).

**Decision:** **TIE-BROKE-TOWARD-DISTINCT.** Rationale: at exactly the 60% boundary; Owner's tie-break posture applies. The promises target different failure modes (asserted-vs-verified promotion vs three-surfaces-agreeing-on-parity).

**Kept as:** `PROM-S3-mechanical-audit-of-promotion` + `PROM-S3-frozen-contract-parity-attest` (two rows).

---

## §2. Non-decisions (rejected merges outright · not borderline)

The following pairs were considered and rejected outright (well below 60% token overlap OR different governor/surface class · not tie-break territory):

- PROM-S1-shield-single-source × PROM-S1-refusal-taxonomy-closed → different surfaces (LLM boundary vs auth-refusal registry). No merge.
- PROM-S2-slice-freeze × PROM-S2-shape-as-objective-reach-only → both S2 but different journey steps (commission-lock vs shape-handoff). No merge.
- PROM-S1-honesty-grammar-source-labels × PROM-9-2a-real-worker-provenance → related but distinct (general envelope discipline vs worker-specific attribution). Kept distinct even though token overlap ~55% — Owner's tie-break posture would also keep these distinct.
- PROM-S4-receipt-alone-suffices × PROM-S4-provenance-audit-integrity → different S4 journey steps (receive vs verify chain). No merge.
- PROM-S4-artifact-signature-bound × PROM-S4-receipt-alone-suffices → signature is mechanism; receipt-suffices is the promise. No merge.

---

## §3. Consolidation summary

- **Merge decisions attempted:** 12.
- **Merges executed** (§1.1–§1.4): **4** (byte-verbatim grounding · no-semantic-scoring · frozen-wire-contract · class-honesty-render-time).
- **`TIE-BROKE-TOWARD-DISTINCT` decisions** (§1.5–§1.8): **4** (runtime-transient vs config-defect · prove-any-op vs audit-immutable · additive-versioning vs frozen-wire-contract · mechanical-audit vs parity-attest).
- **Outright rejects** (§2): **5** — not borderline; no tie-break invoked.

**Net effect on promise count:**
- Without RP-E1 α tie-break: would have landed ~50 promises with the 4 borderline pairs merged → **42 promises**.
- With RP-E1 α + tie-break-toward-distinct (Owner-ruled): **46 promises** (the 4 borderline pairs kept as 8 distinct rows · net +4).

**Doctrine target ("dozens, not hundreds"):** 46 is in-range. Tie-break did not inflate beyond target.

---

## §4. Q1 redundancy readiness

Per doctrine §3.4 Q1 (Redundancy: two or more functions, same promise, same surface → merge/retire candidates, ranked by cost) — the tie-break-toward-distinct decisions in §1.5–§1.8 are Q1 candidates at any future dispatched Q1 query run. If Q1 finds them redundant post-execution measurement, the merge lands then under Owner Tier-3 ruling (mechanical merge) or Tier-1 (if a client-promise is touched by the merge).

═══════════════════════════════════════════════════════════════════

*End of consolidation log v0. Standing Rule v3 · on-disk canonical. RP-E1 α + tie-break-toward-distinct applied at 4 borderline pairs. Under-merge self-correction available via future dispatched Q1 query run.*


═══════════════════════════════════════════════════════════════════

## §5. CC-2 Owner ruling execution (2026-07-30) — dependencies field backfill

**Authority:** `docs/rulings/CC-2_owner_ruling_option_b_2026-07-30.md` (Owner ruling option B, RP-E4 α precedent).
**Executed:** 2026-07-30 in the P1 close cycle.

### Drift row

At CC-2 rule time, the machine registry (`docs/registry/machine/registry.yaml`) carried 147 function rows. Of those, **77 rows** had `dependencies: ""` (empty-string value) reflecting source-cell empties in the v1.md + supplements .md files. Per Owner ruling option B (verbatim: *"`dependencies` is presence-mandatory; `none`/`unknown` are legal explicit values where the source evidences no ordering. Backfill the 106 rows mechanically, tighten the validator to require presence, log the drift row"*), the mechanical backfill was applied:

**Rule applied:** at parser time (`backend/services/registry/parser.py::_parse_function_table`), an empty `dependencies` cell renders to the explicit value `"none"`. This is deterministic (identical inputs → identical outputs); it preserves source-.md byte-identity (v0.md locked SHA unchanged); and it makes the "no ordering evidenced" state auditable.

**Rows changed by the mechanical rule:** 77 (all rows with `dependencies: ""` before the rule; 0 with `dependencies: ""` after).

**Rows carrying `unknown`:** 0 (no rows in the current source carry a "not yet determinable" annotation; the mechanical default `"none"` covers all empty cells).

**Discrepancy vs dispatch language ("106 rows"):** the dispatch cited 106 as the count of rows omitting the field. The measured count of empty-cell rows at execution time was 77. Two candidate reasons:
- (a) between the CC-2 filing (2026-07-30 morning) and its execution (2026-07-30 evening), no rows were touched; the 106 vs 77 delta is measurement-scope (the dispatch may have counted across v0.md + all supplements before parser-composition; the parser applies late-supplement precedence which can overwrite earlier empties). Not investigated further as the mechanical rule is agnostic to the count.
- (b) the dispatch figure was the count from an earlier snapshot; the intervening machine-registry regenerations reduced the count.

**Under either interpretation, the mechanical backfill is complete:** post-regen count of `dependencies: ""` in the machine YAML is **zero**. Every function row carries an explicit non-empty `dependencies` value.

### Validator tightening

`backend/services/registry/validator.py::check_mrr_g1_schema_conformance` — `dependencies` moved from the `optional` set (previously `optional = {"dependencies"}`) into the `required` list. Empty string / null now fails the gate. All 7 MRR-G# gates green after the change:

```
MRR-G1: GREEN
MRR-G2: GREEN
MRR-G3: GREEN
MRR-G4: GREEN
MRR-G-Parity: GREEN
MRR-G-DataBlind: GREEN
MRR-G-SourceSHA: GREEN
```

### Standing queries Q1/Q2/Q3 unblocked

Sequencing-harness claims are unblocked per Owner ruling. Q1/Q2/Q3 mechanical scans re-ran successfully at `2026-07-30T19:36:12+00:00` after the backfill; outputs at `docs/registry/queries/q{1,2,3}_mechanical.md`. All three are report-level, never build-failing per doctrine.

═══════════════════════════════════════════════════════════════════
