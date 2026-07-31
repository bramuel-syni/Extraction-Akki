# Cycle 3 Dispatch §6 Erratum — Parity Reconciliation (34 ≠ 33)

**Status:** RECORDED
**Landed:** 2026-07-31 · during Memory Service Stage B close-out

---

## Erratum

Cycle 3 dispatch §6 initially named parity **33** as the post-cycle target (32 pre-cycle + 1 for a single new memory contract). Owner's follow-up decision **(1a) 2026-07-31** verbatim:

> "Freeze BOTH memory contracts, parity 32→34 via two seal events. Both cross a trust boundary (integration keys / external consumers), so the D4b prior (FREEZE) holds for both."

**→ Correct post-cycle parity is 34, not 33.** Both `MemoryPlane_v0` (plane envelope) and `MemoryWriteBack_v0` (contribution shape) cross the same environment boundary (integration-key holder ↔ platform) and both satisfy the D4b FREEZE prior. Freezing only one would leave a governed-value class un-sealed at the same trust boundary — an inconsistency Owner ruling (1a) resolves.

## Frontend Brief v2 reconciliation

The Frontend Brief v2 intake (docs/rulings/frontend_brief_v2_missing_2026-07-30.md) references parity 33 as the assumed post-cycle count. The FB v2 target should be read as **34** post-cycle-3, matching this dispatch erratum. Frontend surfaces are OUT OF SCOPE for this cycle; the parity reconciliation is documentary only.

## Consequence

- Two seal events landed atomically instead of one: `memory_plane_v0` + `memory_write_back_v0`
- `EXPECTED_PARITY = 34` in `services/health/parity_counter.py`
- All parity-attest cells across invariants + registry suites bumped in one commit
- MRR-G-Parity gate at `services/registry/validator.py::check_mrr_g_parity` updated to 34/34
- `/api/readyz` + `/api/system/build_info` report `parity_count = 34 = expected_parity` live

═══════════════════════════════════════════════════════════════════
