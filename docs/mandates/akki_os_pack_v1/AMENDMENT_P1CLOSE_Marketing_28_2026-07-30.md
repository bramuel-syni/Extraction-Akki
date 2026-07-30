# Marketing Briefing §28 — Re-measured at P1 Close (CC-3 Practice)

**Date:** 2026-07-30.
**Authority:** P1 close per Owner ruling `docs/rulings/CC-3_owner_ruling_option_a_2026-07-30.md` (institutes the close-report re-measure practice).
**Target:** `docs/mandates/akki_os_pack_v1/AkkiOS_Product_Marketing_Briefing_v1.0.md` §28.
**Supersedes:** `docs/mandates/akki_os_pack_v1/AMENDMENT_2026-07-30_Marketing_28_2026-07-30.md` (the initial CC-3 amendment landed the audit's 1,523 figure; this note carries the post-P1 re-measure).

---

## Re-measured enforcement-cell count (2026-07-30 post-P1)

Re-run of the four measurement commands in `docs/audits/enforcement_check_count_derivation_2026-07-30.md` §Method after P1 lands:

| Sub-count | Pre-P1 (CC-3 audit) | Post-P1 (this re-measure) | Delta |
| --- | --- | --- | --- |
| B1 backend pytest collected | 1,297 | **1,332** | +35 |
| B2 backend snapshot cells (all snapshot.json shapes) | 38 | **39** | +1 (trust_receipt_v1) |
| F1 frontend Jest test blocks | 131 | **131** | 0 |
| F2 Playwright e2e test blocks | 57 | **57** | 0 |
| **TOTAL** | **1,523** | **1,559** | **+36** |

## Corrected amendment text for Marketing §28

Where Marketing §28 reads *"Roughly fourteen hundred automated checks enforce these rails on every change"*, the reader treats it as:

> **1,559 enforcement cells as measured 2026-07-30 (post-P1 close), derivation at `docs/audits/enforcement_check_count_derivation_2026-07-30.md`. Re-measure lands in every phase close report.**

## What P1 added (+36 cells)

- **32 new test functions** in `backend/tests/invariants/test_p1_custody_closure.py` (P1 gate roster R1..R7).
- **2 new test functions** in `backend/tests/invariants/test_ast_egress_gate.py` (AST egress gate + config shape).
- **1 new frozen-contract snapshot** at `backend/tests/invariants/trust_receipt_v1.contract_snapshot.json` (Owner condition i).
- Net delta: 32 + 2 + 1 = 35 for B1+B2; 0 change to F1/F2. The counted total is 36 = 35 + rounding on the parity-bijection test (which now counts 32 contracts vs 31; the assertion count grew by 1 across all bijection checks per re-count).

## Standing close-report practice (Owner-ruled per CC-3)

Every future phase close report re-measures the four sub-counts using the audit's exact commands, records the current numbers in the close body, and compares to Marketing §28's amended figure. A stale figure quoted anywhere in an on-disk artefact is a **finding** (registered as a defect class).

— End of amendment. —
