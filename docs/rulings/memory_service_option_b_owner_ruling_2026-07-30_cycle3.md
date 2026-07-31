# Owner Ruling — Memory Service: Stage A + Full Mechanics in Parallel (Option b)

**Date:** 2026-07-30 (cycle 3).
**Authority:** Owner (dispatch cycle 3 response).
**Ruled option:** **(b) — Memory Stage A + full mechanics in parallel, backend only, no surfaces.**

---

## The ruling, verbatim

> **Dispatch item 2 RULED (b): Memory Stage A + full mechanics in parallel, backend only, no surfaces.**
>
> **Three binding conditions:**
> - **(c1) Placement rule** (BCR §1.6) answered at Stage A.
> - **(c2) Write-back contract freeze-or-not argued on D4b — prior is FREEZE.**
> - **(c3) Plane-isolation gates are BREAK-IN style** — the scoped accessor ATTEMPTS the cross-plane read and must fail to reach it (asserting schema shape is insufficient, §33C).
>
> Eviction / persistence constants land as `[SLOT]`s (config-swappable, benchmark-stamped per SR-5 — no hand-picked constants presented as measured).

## Consequences applied

### On Stage A

`docs/stage_a_proposals/memory_service_stage_a.md` must:
1. Answer the BCR §1.6 placement rule (three questions: vertical served / horizontals ridden / data-gravity home).
2. Argue freeze-or-not on the D4b axes for the write-back contract; prior FREEZE means: unless the axes flip against it, freeze.
3. Roster break-in-style plane-isolation gates that ATTEMPT the cross-plane read (schema-shape assertions insufficient per §33C).
4. Declare eviction / persistence constants as `[SLOT]`s ready for benchmark-stamping.

### On the build (proceeds directly from Stage A per option (b))

Owner pre-approves proceeding to code once Stage A is on disk. HAZARD-STOP if Stage A work surfaces any doc-vs-doc or doc-vs-code conflict.

### On surfaces

**Backend only.** No frontend / no UI. Frontend surfaces enter Phase 3 (blocked pending Frontend Brief v2 supply — which arrives this cycle).

## Sources of truth for the build

- Integration Orchestration Brief Part IV (committed pack markdown) — canon, consume don't re-author. The plane isolation contract, three stores (retrieval scope + contribution store + working set), the two memories separated by provenance (estate memory vs mind context), the write-back contract's five-ring shape, publication as separate act, usage-proportional persistence, revocation-freezes-immediately, and ledger-reconstructibility are ALL enumerated there.

## Close condition (this cycle)

- Memory Stage A on disk with the three conditions answered.
- Memory build lands: frozen contract(s) + snapshots + parity seal event(s); scoped-accessor with break-in-tested plane isolation; publication as separate governed act; revocation freezes plane immediately; ledger-reconstructibility demonstrated.
- API endpoints under `/api/*` with OpenAPI visible; exercisable with engineer-key issuer.
- All new gates green + full suite green; parity harness passes at its new count.

**Status:** APPROVED · executes this cycle.

— End of ruling. —
