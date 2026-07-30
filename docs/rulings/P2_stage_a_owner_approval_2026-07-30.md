# Owner Approval — P2 Stage A (Comparator Slice Confirmation)

**Date:** 2026-07-30.
**Authority:** Owner (dispatch cycle 2 response).
**Target:** `docs/stage_a_proposals/p2_v1_extraction_real_material.md` — APPROVED with confirmation below.

---

## The ruling, verbatim

**P2 Stage A APPROVED** with confirmation: *"the BM-V comparator slice is drawn from Hour A ITSELF (machine-vs-human on the same hour), uncurated per D-7. Update the P2 Stage A proposal to record this as an Owner-confirmed constraint."*

## Amendment applied to the Stage A design

`docs/stage_a_proposals/p2_v1_extraction_real_material.md` §P2-R3 verbatim update:

Where P2-R3 originally read:

> *"Input: one real broadcast hour [OWNER] + a 300-unit human-qualified slice uncurated, SR-2 (verdicts are never curated; the slice is drawn from measured composition per BCR)."*

Replace with:

> **Input (Owner-confirmed 2026-07-30):** one real broadcast hour [OWNER] Hour A. The 300-unit human-qualified slice is drawn **from Hour A itself** — machine-vs-human comparator on the same hour, uncurated per **D-7**. The slice sampler (`services/benchmark/slice_sampler.py`) draws proportional-stratified from the hour's unit distribution; no external corpus is admitted as reference for BM-V execution against Hour A.

All other P2 Stage A elements (V1-G1..G7 verbatim consumption, D4b freeze arguments, PH-R1/R2 dependency, BM-V2 close-report gate, V-gate opening ceremony) remain approved as-drafted.

## D-7 constraint restated (for the record)

**D-7:** benchmark comparator on real material must be drawn *from the same material*, uncurated. Cross-corpus comparators are prohibited for BM-V verdict claims; they are legal for BM-C anchoring only after the in-hour comparator has established the baseline.

## Blocking status unchanged

- Stage A: dispatchable immediately (already in this dispatch cycle).
- Stage B GPU half + BM-V execution: still blocked on OT-1 (topology + archive access + HS2 ratification) and OT-2 (Hour A supply + slice human-qualification).
- PH-R2 (data plane): still blocked on OT-3 admin facts.

**Status:** P2 Stage A APPROVED · Stage B awaits OT-1 / OT-2 / OT-3.

— End of approval. —
