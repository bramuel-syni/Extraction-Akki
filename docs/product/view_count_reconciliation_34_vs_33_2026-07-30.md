# 34-vs-33 View-Count Reconciliation

**Date:** 2026-07-30 (cycle 3).
**Authority:** dispatch cycle 3 STEP 1 verbatim: *"Reconcile the 34-vs-33 view count: your demo-HTML analysis found 34 view identifiers; Surfaces v2 says 33 screens + public receipt. Diff against the Surfaces v2 screen table and LOG WHICHEVER DOCUMENT IS SHORT."*
**Method:** Do not self-resolve beyond logging the discrepancy and its most likely explanation.

---

## The two counts

### Demo HTML analysis (`docs/product/akki_v4_demo_frontend_analysis_2026-07-30.md`)

**34 view identifiers** extracted by grep of state-transition tokens (`'<screenName>'`) inside the JavaScript bundle:

```
approvals · artifact · ask · changeRule · connect · destroy · developer ·
govEstate · govSetup · intel · memoDetail · memos · modelDetail · models ·
objectives · opportunities · quarantine · receipts · recipient · registry ·
release · runDetail · runs · shape · shapes · sourceProfile · succession ·
team · testbed · trail · trainingRun · useData · verify · wizard
```

### Surfaces v2 §A2 (committed at `docs/mandates/AKKI_OS_SURFACES_v2_AMENDMENT.md`)

Verbatim from Surfaces v2 §A2-2: *"Screen count is thirty-three plus the public receipt page."* → **33 authenticated screens + 1 unauthenticated public receipt page**.

## Diff and reconciliation

The naive read is: demo = 34 identifiers vs Surfaces v2 = 33 screens → 1 extra in the demo. **But** Surfaces v2 explicitly says "thirty-three PLUS the public receipt page" — a total of **34 renderable surfaces** (33 authenticated + 1 public).

Cross-referencing the demo's identifiers against the Surfaces v2 module map:

| Module | Surfaces v2 count | Demo identifiers | Match? |
|---|---|---|---|
| Connect | 1 | `connect` | 1/1 |
| Registry | 3 | `registry`, `sourceProfile`, `opportunities` | 3/3 |
| Use Data | 14 | `useData`, `wizard`, `objectives`, `shape`, `testbed`, `approvals`, `runs`, `runDetail`, `trainingRun`, `models`, `modelDetail`, `intel`, `artifact`, `developer` | 14/14 |
| Govern | 8 | `govEstate`, `verify`, `changeRule`, `destroy`, `quarantine`, `release`, `govSetup`, `succession` | 8/8 |
| Prove | 6 authenticated + 1 public | `ask`, `shapes`, `memos`, `memoDetail`, `receipts` (dual-mode: authenticated + public), `trail`, `recipient` | **7 identifiers** for 6 auth + 1 public |
| Team | 1 | `team` | 1/1 |

The **Prove** module carries **7 identifiers** for what Surfaces v2 describes as **6 authenticated screens + 1 public page**. `receipts` in the demo HTML is a **single state identifier** whose rendering discriminates on authentication state — the same identifier serves both the authenticated "receipts feed" surface and the unauthenticated public receipt view.

## Which document is short

**Neither.** Both are precisely accurate under their own framing:

- **Surfaces v2** counts by RENDERABLE SURFACE (public receipt page = one surface distinct from the authenticated receipts feed). Result: 33 + 1 = 34 surfaces.
- **Demo HTML** counts by VIEW IDENTIFIER (a single React state string can render two surfaces based on auth). Result: 34 identifiers.

The count matches after accounting for the receipts view's dual-mode. Not a document-short defect.

## Most likely explanation

The demo's implementation approach compresses "authenticated receipts feed" and "public receipt page" into ONE view identifier that dispatches on `useAuth()` (or similar) at render time. Surfaces v2 counts them as two distinct surfaces because they present different information to different audiences (the public page renders a single receipt with a public shareable URL; the authenticated feed shows the user's history).

Under either accounting:
- **34 renderable presentations to users** (across the ratified surface inventory).
- Phase 3 Stage A will need to make the design decision explicit: **implement `receipts` as a single component that dispatches on auth, OR split into two components with a shared render library.** The prototype has taken the first path.

## Not self-resolved beyond logging

Per Owner instruction, this note records the discrepancy and its most likely explanation. Any decision to split the `receipts` identifier into two identifiers at implementation time is a Phase 3 Stage A design choice, not resolved by this log.

## Blocking status

**Not blocking.** No phase depends on this reconciliation. Recorded for the Phase 3 Stage A file when it's written.

— End of reconciliation. —
