# Ruling Request · service_1 Refusal Reason-Code → Canon §9 Prove Shape Mapping

**Date:** 2026-08-02
**Sub-cycle:** UI-1-D (Registry "What You Hold" + Prove per Canon §5 + §9)
**Owner directive of record:** Message 521 (2026-08-02, combined decision 2b+2c) —
  *"file each ambiguous code in a ruling request (docs/rulings/, listing the code,
  both candidate shapes, and your recommended disposition) and note it in the
  close report"*.

**Standing:** This ruling request is required pre-close of UI-1-D. It is filed
whether the audit found ambiguous codes or not (Owner instruction:
under-offering the queue is safe but still an Owner call).

---

## 1 · Canon §9 · Three Prove Response Shapes

Canon §9 admits exactly three response shapes on the Prove surface when
the estate cannot yield an answered claim:

| Shape id                          | Palette / component                | Queue offer? | Meaning                                              |
| :-------------------------------- | :--------------------------------- | :----------- | :--------------------------------------------------- |
| `not_extracted_yet`               | amber-refusal card                 | YES          | The corpus doesn't yet hold measured evidence on this axis. Queue an extraction pass. |
| `evidence_cannot_support_it`      | amber-refusal card                 | NO           | The corpus holds evidence but it can't rise to the required floor at scope. |
| `something_broke`                 | navy fault-channel · oxblood notch | NO           | A fault occurred — never assigned a refusal reason. DB-2 BINDING: never shares refusal styling. |

The `answered` shape (sage) is the fourth response but is not a refusal
and is out of scope for this mapping ruling.

---

## 2 · service_1 Refusal Reason Codes (Current Taxonomy)

The following four reason codes are emitted by `services/service_1/*`
composition-time and admission-time refusals (as of 2026-08-02):

| Reason code                | Emitter                                          | What the corpus told us                                                        |
| :------------------------- | :----------------------------------------------- | :----------------------------------------------------------------------------- |
| `no_defensibility_floor`   | `service_1/answer_composition.py` composition   | No ring rows meet the required defensibility floor at scope.                   |
| `no_lawful_basis`          | `service_1/lawful_basis_gate.py`                | Rows exist but the requested use is not admitted by any lawful-basis clause.   |
| `composition_below_floor`  | `service_1/composition_gate.py`                 | Composition attempt produced a conclusion below the required class floor.      |
| `form_not_offerable`       | `service_1/form_admission.py` admission-time    | The requested output form cannot be admitted at the given scope/floor.         |

---

## 3 · Recommended Disposition (Unambiguous · Combined 2b+2c)

**All four codes map to `evidence_cannot_support_it`. None map to `not_extracted_yet`.**

| Code                       | Candidate A                      | Candidate B                | Recommended        | Confidence | Rationale                                                                                                                                              |
| :------------------------- | :------------------------------- | :------------------------- | :----------------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `no_defensibility_floor`   | `evidence_cannot_support_it`     | `not_extracted_yet`        | `evidence_cannot_support_it` | **HIGH**   | The refusal fires only after dispatch found *candidate rows*. Rows exist; they simply do not rise. This is not an extraction gap. |
| `no_lawful_basis`          | `evidence_cannot_support_it`     | (fault channel — rejected) | `evidence_cannot_support_it` | **HIGH**   | Rows exist; the requested *use* is refused. Queueing more extraction would not change the lawful-basis verdict — the refusal is about the request, not the corpus. |
| `composition_below_floor`  | `evidence_cannot_support_it`     | `not_extracted_yet`        | `evidence_cannot_support_it` | **HIGH**   | Composition failed on candidates that were successfully found. Fresh extraction would not raise the floor — the answer requires a different evidence class, not more of the same. |
| `form_not_offerable`       | `evidence_cannot_support_it`     | `not_extracted_yet`        | `evidence_cannot_support_it` | **MEDIUM** | Refusal is admission-time, about the form (e.g. probability distribution requested but only point estimates admitted). Queueing extraction likely does not change form availability without a rule change. |

### 3.1 · Why *none* map to NOT_EXTRACTED_YET

`not_extracted_yet` is emitted by the presentation layer *only* when the
dispatch returns a null result (no candidate rows from any ring at
scope). None of the four service_1 codes fire in that condition — each
fires *after* candidates were surfaced. Under-offering the queue is
strictly Canon-safe (never render a queue we cannot stand behind).

### 3.2 · What would raise this mapping

* A new service_1 reason code that fires *when dispatch returns null*
  candidates → that new code would map to `not_extracted_yet`.
* An Owner ruling that widens `form_not_offerable` to encompass "form
  needs extraction-side ingestion first" → then `form_not_offerable`
  could route to `not_extracted_yet` for that specific sub-condition.

### 3.3 · Ambiguity risk

`form_not_offerable` is the only code where a reasonable argument could
be made for `not_extracted_yet` — specifically when the missing form
would materialise if new extraction rings landed. The presentation-time
routing keeps `form_not_offerable` on `evidence_cannot_support_it`
because the frontend cannot know, from the code alone, whether new
extraction would help. If the Owner rules that `form_not_offerable`
splits on a sub-code (e.g. `form_not_offerable_needs_extraction`), we
will re-file.

---

## 4 · Where This Ruling Lives in Code

Implementation source of truth: `backend/routers/registry.py` ·
`_REFUSAL_TO_SHAPE` mapping table + `_map_refusal_shape()` helper.

```python
_REFUSAL_TO_SHAPE = {
    "no_defensibility_floor":  "evidence_cannot_support_it",
    "no_lawful_basis":         "evidence_cannot_support_it",
    "composition_below_floor": "evidence_cannot_support_it",
    "form_not_offerable":      "evidence_cannot_support_it",
}

def _map_refusal_shape(reason_code: str) -> str:
    # Unknown codes route safely to EVIDENCE_CANNOT_SUPPORT
    # (never render a queue we cannot stand behind).
    return _REFUSAL_TO_SHAPE.get(reason_code, "evidence_cannot_support_it")
```

Backend gate cell `test_d_p5_refusal_shape_mapping_table_covers_all_service_1_codes`
in `tests/invariants/test_registry_prove_ui1d_gates.py` asserts:
1. All four service_1 reason codes have entries.
2. All four route to `evidence_cannot_support_it`.
3. No code auto-maps to `not_extracted_yet` from the presentation layer.
4. Unknown codes route safely to `evidence_cannot_support_it`.

---

## 5 · Owner Decisions Requested

**5.1** Confirm the recommended disposition in §3, OR redirect one or more
codes to `not_extracted_yet`. In particular:

* Should `form_not_offerable` route to `not_extracted_yet` under any
  sub-condition? (recommended: NO)
* Should `no_defensibility_floor` route to `not_extracted_yet` when
  dispatch found *zero* candidates *and* the reason is emitted post-hoc?
  (recommended: NO — that condition is already caught by the presentation
  layer NOT_EXTRACTED_YET emitter before service_1 sees it)

**5.2** Confirm that the current 4-code taxonomy is complete for UI-1-D.
Any future service_1 code lands via an additive ruling here; the
`_REFUSAL_TO_SHAPE` table default route (unknown → `evidence_cannot_support_it`)
holds the safe fallback until Owner ruling.

---

## 6 · Standing Guarantees (Kept Regardless of Ruling)

* `something_broke` (fault channel) NEVER shares component, palette, or
  layout with either refusal card. DB-2 BINDING enforced by cell
  `gate_prove_db2_paired_break_in_fault_never_shares_refusal_styling`.
* `wire_reason_verbatim` renders in the honesty strip byte-for-byte
  identical to what the service returned. DB-1 BINDING enforced by cell
  `gate_prove_db1_wire_reason_verbatim`.
* Under-offering the queue is Canon-safe. Never rendering a queue we
  cannot stand behind is preferred over over-rendering one.

---

**Filer:** UI-1-D build agent · 2026-08-02
**Awaiting:** Owner disposition (may ratify, redirect, or split codes).
**Blocking scope:** None. UI-1-D closes on the current mapping; a
subsequent additive ruling folds any redirects.
