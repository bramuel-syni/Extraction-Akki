# Frontend Brief v2 — Intake Summary (Owner · cycle 3, 2026-07-30)

**Status:** INTAKE LOGGED · frontend surfaces OUT-OF-SCOPE this cycle
**Landed:** 2026-07-30 (initial intake) · summary recorded 2026-07-31

---

## Scope (per Owner ruling)

Frontend Brief v2 is a design specification for the Memory Service + Connect/Registry surfaces. Cycle 3 dispatch is explicit: **backend only; no frontend coding**. The FB v2 intake is filed for the NEXT cycle (Phase 3 Surfaces) which will implement the frontend surface for the memory-service + registry planes on top of the fully-tested backend surface delivered this cycle.

## Prerequisites now satisfied (backend surface delivered)

| Prerequisite | Status |
|---|---|
| `/api/memory/*` OpenAPI-listed | ✓ 8 endpoints |
| Engineer-key credential flow works end-to-end | ✓ curl-exercised |
| Governed-refusal envelope shape stable | ✓ 8-code closed reason set |
| Auth-denial envelope shape stable (no `outcome` key) | ✓ M-G9 gate |
| Plane isolation server-side (never client-trust) | ✓ scoped-accessor pattern |
| Parity 34/34 live | ✓ `/api/readyz` |
| Registry FPR rows machine-YAML-registered for all memory functions | ✓ 23 rows in `docs/registry/machine/registry.yaml` |

## Parity reconciliation

FB v2 references parity 33 as the assumed post-cycle count. Owner ruling (1a) 2026-07-31 established the correct count as **34** (two seal events instead of one). See `docs/rulings/cycle3_dispatch_erratum_parity_34_2026-07-31.md`.

## Deferred to Phase 3 (NEXT cycle)

- Memory Service surface (issue plane, list contributions, publish ceremony, revoke button)
- Connect/Registry module (integration-key issuance + plane visibility panel)
- Refusal-envelope surfacing for the governed 8-code taxonomy
- Auth-denial rendering (must NOT be confused with governed refusal in UI)

**No frontend code was touched this cycle.**

═══════════════════════════════════════════════════════════════════
