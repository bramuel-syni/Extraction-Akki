# CC-4 — HS2 Never-Rules Annotated [STAKED] · Ruling Request

**Date filed:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-4.
**Class:** open designer-position (dispatch marks HS2 [STAKED] — *"binding as written until the owner strikes it,"* per BCR marking conventions).
**Resolution authority:** Owner. **Do NOT self-resolve** (dispatch §SR-3).

---

## The rules under stake

BCR v1.5 §1.5 HS2 (Never-rules, hold in every topology) and dispatch §5 OT-1 both mark HS2 as [STAKED]:

> **HS2 Never-rules (hold in every topology).** Raw AV NEVER reaches the consumer edge. The transform key NEVER enters the GPU zone. Workers NEVER write the Ledger. [STAKED — asserted from the design's own logic; strike if wrong]

The green gates that mechanically enforce these rules (per BCR §3.1 V1-H2 and V1-G5) include:

- `test_worker_code_never_writes_ledger` — AST gate at `backend/tests/invariants/` (or nearest equivalent path).
- `test_intake_rejects_invalid_units` — V1-G4, intake validator boundary.
- `test_raw_purge_attested_per_job` — V1-G3, raw-purge attestation invariant.
- Any AST/grep gate at the worker-side asserting no transform-key access.

## Annotation applied by this file

Until the topology-fork ruling closes (dispatch §5 OT-1), the registry rows for these gates are annotated in the Function-Promise Registry as **[STAKED]** — they enforce a staked designer position, not a ratified Owner rule.

The machine-readable registry (`docs/registry/machine/registry.yaml`) receives a `stake_status: STAKED_HS2` marker on the affected rows. The human-readable registry (`docs/registry/function_promise_registry_v0.md`) carries a footnote pointing to this file.

Annotation format (illustrative; the exact YAML/markdown mechanics land in a docs-only follow-up when the registry validator ruling (CC-2) closes and we know whether to add a new field or fold it into `notes`):

```yaml
# example row shape carried by registry.yaml after this annotation
- name: test_worker_code_never_writes_ledger
  …
  stake_status: STAKED_HS2
  stake_ruling_pending: docs/rulings/hs2_never_rules_staked_annotation_2026-07-30.md
  notes: |
    Enforces HS2 (BCR v1.5 §1.5). Owner ratifies or strikes at
    topology-fork ruling (dispatch §5 OT-1). Until then, green gate
    enforces a staked position.
```

## What ratification would look like

The Owner rules HS2 in the same session that closes the topology-fork ruling (OT-1). Three outcomes are possible:

1. **RATIFY** — HS2 becomes canon; the [STAKED] annotation is stripped from the registry rows in a docs-only follow-up; the gates continue enforcing.
2. **AMEND** — the Owner narrows or widens HS2 (example: "Workers NEVER write the Ledger" holds, but "transform key NEVER enters GPU zone" is narrowed under Topology A). The affected gates are re-scoped in the same close.
3. **STRIKE** — HS2 is dropped; the gates that enforced it are marked deprecated with a dated notice and the [STAKED] annotation flips to `deprecated: <ruling-ref>`. If any gate now enforces nothing (its rule struck), the gate MAY be removed in a follow-up commit — but never silently, and never inside this file.

## What is NOT changed by this file

- **The gates themselves stay green.** Annotation is a docs-level marker; it does not change enforcement behaviour. 
- **Enforcement is not weakened while the Owner deliberates.** HS2 gates continue to bind on every CI run.
- **No frozen contract is mutated.** Function-Promise Registry is a build-discipline surface, not a frozen contract; adding `stake_status` is a schema tightening subject to the CC-2 ruling (if CC-2 rules dependencies is mandatory-eleven-fields, the registry schema is already being amended, and this `stake_status` field piggybacks on that amendment).

## Blocked-until-closed

No phase is blocked by this ruling on its own. **P1** is not blocked (custody closure is separate from HS2 topology). **P2** references HS2 in its gate roster (V1-G5 test_worker_code_never_writes_ledger); P2 Stage A explicitly notes those gates are [STAKED] until this ruling lands so P2's V-gate opening ceremony does not accidentally cite a struck rule.

## Evidence for the Owner

- BCR v1.5 §1.5 HS2: `/app/docs/mandates/RMS_Build_Completion_Requirements_v1_5.md`.
- Machine-readable registry: `/app/docs/registry/machine/registry.yaml`.
- Human-readable registry: `/app/docs/registry/function_promise_registry_v0.md`.
- Related open ruling: `/app/docs/rulings/registry_dependencies_mandatory_optional_2026-07-30.md` (CC-2 governs the exact mechanics of adding fields).

**Status:** OPEN · awaiting Owner ruling. Expected to close in the same session as OT-1.

— End of ruling request. —
