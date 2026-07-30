# HAZARD-STOP Ruling Request — CC-2

**Date filed:** 2026-07-30.
**Filed by:** builder (dispatch §CC-2 execution).
**Authority binding request:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-2 and §SR-3.
**Class:** doc-vs-code conflict (HAZARD-STOP per BCR v1.5 precedence clause).
**Resolution authority:** Owner. **Do NOT self-resolve** (dispatch §SR-3 verbatim).

---

## Subject

Mandatory-vs-optional status of the `dependencies` field on Function-Promise Registry rows.

## The conflict, both positions stated

### Position A — the code says OPTIONAL

`backend/services/registry/validator.py` treats `dependencies` as an optional field on a Function-Promise Registry row. The validator does not fail a row that omits `dependencies`.

### Position B — the doctrine says MANDATORY (all eleven fields)

Quality Rule Book §5.1 (`docs/mandates/akki_os_pack_v1/AkkiOS_Quality_Rule_Book_v1.0.md`) declares the Function & Promise Registry schema with an **eleven-field mandatory schema per row**. `dependencies` is among the eleven. "Mandatory" is unqualified in the schema statement.

### The observable

**106 registry rows** in the current on-disk Function-Promise Registry (`docs/registry/function_promise_registry_v0.md` + supplements + `docs/registry/machine/registry.yaml`) **omit** the `dependencies` field. The validator accepts them; the doctrine, read literally, does not.

## Why this is a HAZARD-STOP class conflict

Per BCR v1.5 precedence clause and dispatch §SR-3: *"On any conflict among documents or with existing code: HAZARD-STOP and surface it — never self-resolve."* The builder cannot choose between amending code or backfilling rows without ruling from the Owner because the two paths carry materially different scope and different downstream consequences (see below). CC-2 in the dispatch is offered as *the standing example* of the failure this rule prevents.

## Consequence of each ruling

### If Owner rules A (code wins — dependencies is OPTIONAL by schema)

1. Amend Quality Rule Book §5.1 in the pack (via amendment note; §5.1 remains byte-identical in the committed .md and the correction lands as an amendment in this directory pattern): the eleven-field schema becomes ten-field mandatory + one field (`dependencies`) marked optional. 
2. The 106 rows omitting `dependencies` stay green; no backfill.
3. The validator stays as-is; no code change.
4. The standing-queries CI (`services/registry/queries.py` Q3-Gaps) keeps its current definition of "gap" (Q3 does not count missing `dependencies` as a gap).
5. Consequence-class: **loosening** of Quality Rule Book §5.1 by amendment. Per BCR §3.11 CK-B3 symmetry, if the Rule Book is treated as a compliance-adjacent surface this loosening would require countersign; if the Rule Book is treated as build-discipline canon then Owner ruling suffices. Owner clarifies.

### If Owner rules B (doctrine wins — dependencies is MANDATORY, eleven fields)

1. **Backfill 106 rows** with populated `dependencies` fields. Backfill is archaeology (Quality Rule Book §5.4: *"population is archaeology, not authorship"*): each row's dependencies are read from the shipped module's actual imports and internal references — not invented. 
2. Amend `backend/services/registry/validator.py` to require `dependencies` at row-load time (fail-closed on absent field). 
3. Bump validator to a new version snapshot; the parity-count harness stays at 31 (this is a schema surface, not a frozen contract seat).
4. Add a CI cell (`test_dependencies_field_present_on_every_row`) enforcing the new invariant across the machine-readable registry (`docs/registry/machine/registry.yaml`).
5. Consequence-class: **tightening** of the machine-readable registry schema. Per BCR §3.11 CK-B2, tightening is unilateral with recorded effective delay + objection path; the delay window is stated in `services/checker/effective_delay.py` config.

### If Owner rules C (a third path)

Example: mandatory for new rows, grandfather the 106 as `dependencies: ["pre-schema"]` with a dated attestation. This is a hybrid; state the attestation shape if chosen.

## Blocked-until-closed

Dispatch §CC-2 states: *"The sequencing harness (§9) is blocked from any claim until this closes, because its dependency input is absent from most of its corpus."*

Concretely: any close report or claim that reads "sequencing harness measured cost" or cites `dependencies` as input for a Q3-gap-family assertion is on hold until this ruling lands. The **P1** work does not require sequencing-harness output (custody closure is claims-critical, not sequencing-cost claims), so P1 is not blocked by this ruling. **P2 BM-V verdict claims** may be affected if they cite dependency data; P2 Stage A avoids that dependency at the design level (see `docs/stage_a_proposals/p2_v1_extraction_real_material.md` §Freeze-or-not argument).

## Evidence for the Owner

- Validator source: `/app/backend/services/registry/validator.py`.
- Quality Rule Book §5.1 in the pack: `/app/docs/mandates/akki_os_pack_v1/AkkiOS_Quality_Rule_Book_v1.0.md`.
- Machine-readable registry (contains the 106 rows): `/app/docs/registry/machine/registry.yaml` (1,863 lines).
- Human-readable registry: `/app/docs/registry/function_promise_registry_v0.md` (301 lines) + `v0.1_supplement.md` + `v0.2_supplement.md`.
- Standing-queries implementation: `/app/backend/services/registry/queries.py`; CLI: `/app/tools/registry/run_queries.py`.

## Deliberately unstated

This request states positions and consequences. It does **not** propose a preferred outcome or make a recommendation. Per dispatch §SR-3, the ruling is the Owner's; a builder-preferred outcome recorded here would itself become the D-11 violation the rule exists to prevent.

## Close condition

Owner writes a dated ruling to `docs/rulings/` naming this file, choosing A/B/C, and (if B or C) stating the effective-delay window for the tightening change. This file's "Status" line below is updated in the ruling's close pass — not before.

**Status:** OPEN · awaiting Owner ruling.

— End of ruling request. —
