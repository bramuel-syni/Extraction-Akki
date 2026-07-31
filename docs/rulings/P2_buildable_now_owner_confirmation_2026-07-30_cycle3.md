# Owner Ruling — P2 Buildable-Now Portion Confirmed

**Date:** 2026-07-30 (cycle 3).
**Authority:** Owner (dispatch cycle 3 response).
**Refers:** `docs/rulings/P2_stage_a_owner_approval_2026-07-30.md` (P2 Stage A approval from cycle 2).

---

## The ruling, verbatim

> **Dispatch item 1 confirmed: P2 buildable-now portion proceeds.**

## Scope of "buildable-now" (per P2 Stage A + BCR §3.1 + §3.4)

- **PH-R1** — destination-agnostic production packaging per BCR §3.4 (consume, don't re-author).
- **Stub-first guard gates** proven against the deterministic stub worker BEFORE any GPU code (P2-R4 / V1-B3):
  - **V1-G2** `test_job_kill_and_restart_resumes_without_duplicate_ledger_rows`
  - **V1-G3** `test_raw_purge_attested_per_job`
  - **V1-G4** `test_intake_rejects_invalid_units` (extension to cover the frozen NormalizedUnit shape more thoroughly)
  - **V1-G6** `test_telemetry_fields_present_per_job`
- **V1-G5** `test_worker_code_never_writes_ledger` — remains **[STAKED]-annotated** per CC-4 until HS2 topology-fork ratification at OT-1.
- **FPR rows** registered before each function lands (AC-3); machine YAML validator now requires `dependencies` presence per CC-2.

## Explicitly OUT of scope for this cycle

- **No GPU code.** GPU-execution seam stays behind `PERCEPTION_EXECUTION_MODE=cpu`.
- **No BM-V execution.** Awaits OT-2 (Hour A + 300-unit slice from same hour per D-7 confirmation).
- **No PH-R2 (production data plane).** Awaits OT-3 admin facts.
- **No V-gate opening.** V1 status remains `PENDING_REAL_MATERIAL`.

## Close condition (this cycle)

V1-G2/G3/G4/G6 green against the stub worker; PH-R1 packaging discipline verified against current Dockerfile + healthz/readyz + env-contract; V1-G5 [STAKED] annotation carried in the machine-readable registry row.

**Status:** APPROVED · executes this cycle.

— End of ruling. —
