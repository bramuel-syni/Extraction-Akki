# Experience Canon v1.0 · Filed as sole experience authority · HAZARD-STOP closed

**Filed:** 2026-07-31 (on receipt of AKKI OS EXPERIENCE CANON v1.0).
**Filed path:** `docs/mandates/AKKI_OS_EXPERIENCE_CANON_v1.md` · SHA `6d9ed7d8bce5ce3fed180407a20d4550a3a95744ccb21735ac66351ffe3b3757` · 34 003 B · 594 lines.
**Authority basis:** Owner directive verbatim: *"AKKI OS EXPERIENCE CANON v1.0 supplied as the way forward … the single experience authority. It reconciles and supersedes AS EXPERIENCE AUTHORITY: FRONTEND UI/UX BRIEF v1, change order A1–A8 (fully absorbed), CONSOLIDATED DISPATCH v2 §3, and all prior frontend rulings."*
**Standing rule:** SR v3 — verbatim carrier.

---

## Ruling 1 — Experience Canon v1.0 is the sole experience authority

The Canon supersedes AS EXPERIENCE AUTHORITY (Owner verbatim):
- `docs/handoff/frontend_uiux_brief_v1_2026-07-27.md/.docx` (source remains on disk as provenance only).
- `docs/rulings/owner_change_order_2026-07-25.md` (A1–A8 fully absorbed into Canon).
- `docs/mandates/AKKI_OS_CONSOLIDATED_DISPATCH_v2.md` §3 (superseded; §§1/2/4/5/6/7 remain in force where Canon is silent).
- All prior frontend rulings.

**Canon changes enter only by filed ruling and version bump.** (Canon §13 standing rule.)

## Ruling 2 — HAZARD-STOP raised in Canon Intake Part 4 is CLOSED

**HAZARD-STOP disposition:** the missing-canon-sources HAZARD-STOP raised in `docs/tree_audit_dispatch_v2_2026-07-31.md` and `docs/canon_intake_delta_log_part2_2026-07-31.md` §15 is CLOSED per Canon §13 standing rules verbatim:

- **Canon §13:** *"a SLOT is a fold-in obligation, never a build blocker."* The 4 missing module_specs cited by `ui_1_stage_a.md` §9 (`use_data_module_v1_2026_07_25.md`, `approval_inversion_v1_2026_07_25.md`, `user_stories_delta_v1_2026_07_25.md`, `cross_cutting_record_v1_2026_07_25.md`) become fold-in obligations of the corresponding SLOTs (SLOT-2 for use_data execution detail; SLOT-1 for Registry detail; SLOT-3 for Team detail). They do NOT block the UI-1 Stage A execution.

- **Canon §13:** *"Disk is truth; this document describes the product, the manifest describes the tree, and the build gates on what runs. Provenance never gates builds."* The artifact-manifest references to files not present on this tree (`function_promise_registry_v1.md`, `phase_ledger_v1.md`, `owner_decisions_v1.md`, `akki_source_condition_spec.md/.docx`, `akki_condition_coverage_amendment_v1.0.md/.docx`, `mandate_spec.py`, `mandate_spec.contract_snapshot.json`) are PROVENANCE OF THE FOREIGN TREE — they do not gate builds.

- **Canon §13:** *"A foreign manifest is provenance. This tree's contract set under its green suite is the contract set of record; foreign contracts never import; new contracts enter by seal event."* The foreign G-13 seal that raised parity to 34 (cited as `mandate_spec.py` + `mandate_spec.contract_snapshot.json`) landed on THIS tree via its own contract-snapshot artifacts. Live parity: `readyz` returns `parity_count: 34 / expected_parity: 34`. **The contract set of record is what disk holds under the green suite (1444 pass / 2 skip / 0 fail).**

- **Canon §13:** *"One `docs/rulings/` directory in the canonical tree is the only ruling store; every session reads it at start; a ruling not filed there does not exist."* This ruling is filed at `docs/rulings/`.

**Disposition of the delivered `ui_1_stage_a.md`:** the file's §9 D-11 read-log citations to the 4 module_specs are HISTORICAL PROVENANCE of its 2026-07-27 authoring under the foreign tree. On this tree, the delivered Stage A text + the Experience Canon stand as the working authority; the module_spec detail folds forward as SLOTs when delivered.

## Ruling 3 — Brief v2 filing SUPERSEDED

Prior Dispatch v2 §1.4 directive to "file Brief v2" is superseded by the Canon: *"Changes to it enter only by filed ruling and version bump."* The 17-item forward-fold delta log accumulated across Canon Intake Parts 2-4 is REPURPOSED as **pending-fold delta-log candidates against the Experience Canon**. Each item is checked against the Canon; items already absorbed are struck; residual items enter a pending-fold register for future Canon version bumps by filed ruling.

## Ruling 4 — Retired-vocabulary audit standing gate

Canon §3.3 verbatim: *"Retired-vocabulary audit of the existing frontend: clean at 0 hits, 2026-07-31; the gate stays in the suite permanently."* A permanent Jest gate cell is required under sub-cycle 4 (or the next execution touch point) to enforce this at CI time.

═══════════════════════════════════════════════════════════════════

*End of ruling. Verbatim carrier · SR v3 compliant.*
