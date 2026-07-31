# HAZARD-STOP — AKKI_OS_FRONTEND_BRIEF_v2.md Missing

**Date filed:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §SR-3 (any doc-vs-code or doc-vs-doc conflict → HAZARD-STOP, never self-resolve).
**Filed by:** builder (dispatch cycle 2, STEP 2 execution).
**Class:** document-supply gap surfaced by cross-referencing (SR-3 category).
**Resolution authority:** Owner. **Do NOT self-resolve.**

---

## The gap

`docs/mandates/AKKI_OS_BUILDER_PROMPT.md` names four canon documents in authority order (§“THE ARTIFACTS, AND THEIR AUTHORITY ORDER”):

1. AKKI_OS_BUILD_DISPATCH_v1.md — present ✓
2. AKKI_OS_SURFACES_v2_AMENDMENT.md — present ✓
3. **AKKI_OS_FRONTEND_BRIEF_v2.md** — **MISSING**
4. Akki_v4_Standalone.html — present ✓

**Independent citation from Surfaces v2 §A4-3:** *"The Commission View. v1.0 §15A lands inside Use Data: the milestone-first tracking surface for every commissioned work, with trainingRun/runDetail as its drill-down evidence layer. Specified in **FRONTEND BRIEF v2.0 FB-4/FB-5**; this record re-homes it, the brief specifies it."*

**Independent citation from Surfaces v2 §A6:** *"The feature inventory (Part X) as the feature-capture checklist, read with **FRONTEND BRIEF v2.0 §3**. The journeys (Part IX) as completion targets, read with **FB-9..FB-16**."*

**Independent citation from Builder Prompt §“THEN BUILD”:** *"then frontend per **FB-17** — milestone capture and Commission View before journey completion before integration settings. Every screen lands with its **gate cells (FB-18)**."*

The Frontend Brief v2 is referenced by identifier (FB-4, FB-5, FB-9..FB-16, FB-17, FB-18, §3) in the on-disk canon. The document itself is not on disk.

## Consequence of the gap

Dispatch build order (Builder Prompt §“THEN BUILD”): Phase 3 = *Memory Service mechanics first, then frontend per FB-17*.

- **Phase 1 (custody closure):** UNAFFECTED. Custody + startup + hygiene; no frontend module reshape; no FB-* dependency.
- **Phase 2 Stage A (V1 extraction design):** UNAFFECTED. V1 wire shapes + BM-V + PH-R1/R2; no FB-* dependency.
- **Phase 2 Stage B (V1 extraction code):** UNAFFECTED at the wire-shape and worker-endpoint level; the SM-E extraction sample surface already exists at `frontend/src/pages/extraction/` and the Extraction Console changes are subordinate to `RegistryAdminView` — no FB-* dependency until the *milestone capture* copy lands.
- **Phase 3 Stage A:** **BLOCKED** — the phase cannot be written to on-disk quality without Frontend Brief v2 in hand. FB-4 (Commission View), FB-5 (drill-down evidence layer), FB-9..FB-16 (journey completion punch list), FB-17 (sequencing), FB-18 (gate cells) are all referenced but not defined on disk.

## Not self-resolved

Per dispatch SR-3, this file states the gap and its consequences and STOPS. The builder does not:
- Invent FB-4..FB-18 content from the document that names them.
- Read the prototype HTML as if it were the brief.
- Proceed to Phase 3 code work without the brief.

## Close condition

1. Owner supplies `AKKI_OS_FRONTEND_BRIEF_v2.md`.
2. Document is committed to `docs/mandates/akki_os_pack_v1/` (following the Surfaces v2 pattern) with SHA-256 in the pack manifest.
3. This file's Status line is updated in the same close pass.

**Status:** CLOSED · resolved-by-supply on 2026-07-30 (cycle 3). Owner supplied `AKKI_OS_FRONTEND_BRIEF_v2.md` at SHA-256 `d6111202203c77af0cf08ad39d26d1573429d74fdc99e19fcf35e07e2b0ba82b`; committed to `docs/mandates/AKKI_OS_FRONTEND_BRIEF_v2.md`; pack manifest updated. Phase 3 Stage A UNBLOCKED (still not started this cycle per Owner's backend-only ruling on Memory).

— End of HAZARD-STOP (resolved-by-supply on 2026-07-30). —
