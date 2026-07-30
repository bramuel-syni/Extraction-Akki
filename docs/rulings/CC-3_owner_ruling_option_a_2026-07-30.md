# Owner Ruling — CC-3 Marketing §28 Amendment (Option a with derivation)

**Date:** 2026-07-30.
**Authority:** Owner (dispatch cycle 2 response).
**Closes:** the CC-3 derivation audit at `docs/audits/enforcement_check_count_derivation_2026-07-30.md` — the derivation stands; the amendment path is now ruled.

---

## The ruling, verbatim

**Option (a) with derivation.** Amend Marketing §28 in the committed pack markdown to: *"1,523 enforcement cells as measured [date], derivation at docs/audits/enforcement_check_count_derivation_2026-07-30.md"* (dated amendment note, append-style). Institute the close-report practice: every phase close re-measures the figure; a stale count is a finding. Add this re-measure to the P1 close checklist.

## Consequences

1. **Amend Marketing Briefing §28** — via a dated amendment note in the pack directory (append-style, not in-place edit; the committed .md remains byte-identical under its recorded SHA). Amendment note: `docs/mandates/akki_os_pack_v1/AMENDMENT_2026-07-30_Marketing_28_2026-07-30.md`.
2. **Close-report re-measure practice** instituted:
   - Every phase close report re-runs the four measurement commands (B1 pytest, B2 snapshots, F1 Jest, F2 Playwright).
   - The re-measured number lands in the close report body.
   - If the number is materially unchanged from the last measure, that is fine.
   - **A stale (older-than-current-phase) figure quoted anywhere in an on-disk artefact is a finding — registered as a defect class.**
3. **P1 close checklist** — add: *"re-measure the enforcement-cell figure per the CC-3 method, record in close body, compare to Marketing §28's amended figure."*

## Execution record (this session, 2026-07-30)

- Amendment note landed: `docs/mandates/akki_os_pack_v1/AMENDMENT_2026-07-30_Marketing_28_2026-07-30.md`.
- P1 close report includes the re-measured figure per this practice (see `docs/close_reports/p1_custody_closure_honest_startup.md`).

**Status:** CLOSED. Practice instituted.

— End of ruling. —
