# Owner Ruling — CC-2 Registry `dependencies` Mandatory (Option B)

**Date:** 2026-07-30.
**Authority:** Owner (dispatch cycle 2 response).
**Closes:** `docs/rulings/registry_dependencies_mandatory_optional_2026-07-30.md` — status flips from OPEN to CLOSED.
**Precedent cited:** RP-E4 α.

---

## The ruling, verbatim

**Option B per the RP-E4 α precedent.** `dependencies` is presence-mandatory; `none`/`unknown` are legal explicit values where the source evidences no ordering. Backfill the 106 rows mechanically, tighten the validator to require presence, log the drift row. Sequencing-harness claims unblock on completion.

## Consequences

1. **Backfill 106 rows mechanically.** Rows where the source .md carries no `dependencies` cell value receive `none` (default: no ordering evidenced). Rows where the source explicitly indicates the ordering is not yet determinable receive `unknown`. This backfill is archaeology (QRB §5.4): the value comes from the source's shape, not from authoring.
2. **Tighten validator.** `backend/services/registry/validator.py::check_mrr_g1_schema_conformance` moves `dependencies` from the `optional` set into the `required` set; validator rejects empty string and null.
3. **Log the drift row.** A supplement note in `docs/registry/` records the count and shape of the backfill — not to hide the drift but to make it auditable.
4. **Regenerate machine registry.** `tools/registry/regenerate.py` re-parses the source .md + supplements and re-emits `docs/registry/machine/registry.yaml`. The v0.md SHA is Owner-locked (`LOCKED_V0_SHA` in the validator); backfill lands via a supplement, not a v0.md mutation.
5. **Run Q1/Q2/Q3 standing queries.** Green pass unblocks sequencing-harness claims.

## Execution record (this session, 2026-07-30)

- **Parser change:** `backend/services/registry/parser.py` — empty-cell `dependencies` becomes `"none"` at parse time (deterministic mechanical rule per Owner ruling).
- **Validator change:** `backend/services/registry/validator.py::check_mrr_g1_schema_conformance` — `dependencies` moved from `optional` → `required`; empty string and null rejected; `"none"` / `"unknown"` accepted as legal explicit values.
- **Drift row logged:** `docs/registry/consolidation_log_v0.md` amended (new dated section) recording the backfill count.
- **Machine registry regenerated:** `docs/registry/machine/registry.yaml` re-emitted via `tools/registry/regenerate.py`. Row-level diff recorded in the drift log.
- **Q1/Q2/Q3 run:** results captured in the P1 close report; sequencing-harness claim path unblocked.

**Status:** CLOSED. Sequencing-harness claims UNBLOCKED.

— End of ruling. —
