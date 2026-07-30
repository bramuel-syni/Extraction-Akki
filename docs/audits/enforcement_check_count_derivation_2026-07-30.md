# CC-3 — Enforcement Check Count: Derivation and Reconciliation

**Date:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-3.
**Purpose:** Reconcile the three check-counts on record and derive **one countable number with a reproducible method**, per dispatch §CC-3 and Quality Rule Book §26 (*"illustrative figures migrate into expectations"*). This audit does **not** amend the Marketing Briefing §28 claim — that amendment is flagged to the Owner for sign-off in the report-back attached to this dispatch cycle.

---

## Numbers on record before this audit

| Source | Figure | Meaning as stated |
| --- | --- | --- |
| Builder — pytest collection, 2026-07-30 session | 1,231 | "backend tests passed" (as most recently reported in `memory/PRD.md`). |
| Marketing Briefing §28 (in the pack) | ~1,400 | "roughly fourteen hundred automated checks enforce these rails on every change." |
| BUILD_JOURNAL.md 2026-07-02 close | 367/367 | "full backend green (`cd /app && make ci`)." |

None of these three figures is wrong for what it was measuring. They measure **different things**. This audit derives one countable number that carries its scope explicitly.

## Method (reproducible)

A "check" is defined for this derivation as **any named, distinct, single-purpose enforcement assertion that runs in CI and can fail independently**, across:

- **B1** — backend pytest test cases (each `test_*` function counts once; parametrised expansions counted at collection time so parametrised cases DO expand).
- **B2** — backend contract/schema/content snapshot files under `backend/tests/invariants/` (each `.snapshot.json` is a byte-lock cell that fails independently on drift).
- **F1** — frontend Jest test cases (each `test(…)` / `it(…)` block counts once).
- **F2** — frontend Playwright e2e tests (each `test(…)` block in a `.spec.ts` counts once).

Excluded from the count (recorded for transparency, not counted):

- Sub-assertions inside a test function (multiple `assert`/`expect` inside one test).
- Standing-query CI cells (Q1/Q2/Q3) if they run inside a pytest that's already counted in B1 — no double-count.
- CI infrastructure gates (lint, format) — not enforcement of product behaviour.

Commands (all runnable from `/app`, byte-for-byte reproducible; append these commands with the recorded 2026-07-30 outputs to reproduce):

```bash
# B1 — backend pytest collection count
cd /app/backend && python3 -m pytest --collect-only -q 2>&1 | tail -1

# B2 — snapshot files count
find /app/backend/tests/invariants -maxdepth 1 -name "*.snapshot.json" | wc -l

# F1 — frontend Jest test-block count
find /app/frontend/src/__tests__ -name "*.test.js" -o -name "*.test.jsx" | \
  xargs grep -hE "^\s*(test|it)\(" | wc -l

# F2 — Playwright e2e test-block count
find /app/frontend/e2e -name "*.spec.ts" -exec grep -c "^\s*test(" {} + | \
  awk -F: '{s+=$2} END {print s}'
```

## Results (2026-07-30, 18:00 UTC session)

| Sub-count | Command output | Notes |
| --- | --- | --- |
| B1 backend pytest collected | **1,297** | Collection includes 2 pytest.mark.asyncio warnings; those cases still collect. |
| B2 backend snapshot cells | **38** | `.snapshot.json` files at `backend/tests/invariants/` (includes `.contract_snapshot.json`, `.schema_snapshot.json`, `.content_snapshot.json`, and Northena/Trace-Lens snapshots). |
| F1 frontend Jest blocks | **131** | `src/__tests__/` tree, `test(…)` and `it(…)` counted. |
| F2 Playwright e2e blocks | **57** | 24 `.spec.ts` files summed across `frontend/e2e/`. |
| **TOTAL** | **1,523** | The single countable number under this definition. |

## Reconciliation with the three prior figures

### Why 1,231 (PRD.md) < 1,297 (current)

1,231 was the *green-passing* count at the moment PRD.md was last stamped; 1,297 is the *collected* count at 2026-07-30. Delta = 66 = new tests landed in the 07-08 → 07-30 window (Phase 9 sub-stages 9.1/9.2a/9.3, Phase 8 Seam 3 sub-stages 1/2/3, Artifact Store, 8-EXT, Census Dimensions, Transform Forms, Machine-Readable Registry, EAB Tier-1 pipeline, Standing Queries CI cells, Verification Runner canon admission, Owner promotions G-10/G-7 — see BUILD_JOURNAL 2026-07-30 reconciliation entry). PRD figure was truthful for its moment; it's now stale.

### Why 367/367 (2026-07-02) ≪ 1,297 (current)

367 was the backend pytest count on 2026-07-02, before the Phase 9 sub-stages, artifact store, transform forms, and EAB Tier-1 landed. Almost 1,000 backend tests landed in the intervening 28-day window. The 367 figure is truthful for its moment and should not be cited as a current count.

### Why ~1,400 (Marketing §28) ≠ 1,523 (current)

Marketing §28's "~1,400 automated checks" is the illustrative-figure form that Quality Rule Book §26 warns migrates into expectations. Under this audit's definition, the current number is 1,523 (backend pytest + snapshot cells + frontend Jest + Playwright). Under a narrower definition (backend pytest only) the number is 1,297. Under a broader definition (adding standing-query CI cells as independent counts, adding Ruff/ESLint lint-rule invocations, or adding CI-level workflow steps as "checks"), the number climbs. The claim's honest form MUST carry its scope.

## Amendment flagged to Marketing §28 (for Owner sign-off; NOT applied by this audit)

The Marketing Briefing §28 sentence *"Roughly fourteen hundred automated checks enforce these rails on every change"* is flagged for one of the following amendments, per Owner ruling:

- **Option (a) — update the number, keep the scope loose:** *"Roughly one thousand five hundred automated checks enforce these rails on every change"* (rounded, scope-honest given the figure includes backend + frontend).
- **Option (b) — restrict scope, keep the exact number:** *"Backend enforcement runs approximately one thousand three hundred automated checks on every change; frontend adds a further two hundred"* (scope-explicit, backed by B1 + B2 + F1 + F2 sub-counts).
- **Option (c) — remove the specific number entirely:** *"A comprehensive automated check suite enforces these rails on every change; the exact figure carries its measurement date in the audit trail."* (Removes the illustrative-figure risk per QRB §26; loses the marketable specificity.)

The builder has no preference and does not apply an amendment. **Owner rules.** This file's "Status: OPEN" line closes when the Owner writes a dated `docs/rulings/` entry naming this audit and choosing (a/b/c/other).

## Not counted here (recorded for future audits)

- Backend Ruff/lint rule invocations (varies per file; not enforcement of product behaviour).
- Frontend ESLint rule invocations.
- Contract PARITY invariant (`test_contracts_parity`) counts as **1** test in B1 despite asserting bijection across 31 modules × 31 snapshot files (62 comparisons internally). This audit preserves "1 test = 1 count" for auditability.
- The 727 `tier_lock.vN.json` versioned files (rule-change history, not enforcement checks).

**Status:** OPEN · awaiting Owner ruling on which Marketing §28 amendment to apply. This derivation itself is closed at the number 1,523 with the four-part sub-count above.

— End of audit. —
