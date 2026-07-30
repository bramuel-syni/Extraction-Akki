# CC-5 — Audio Plane Cross-Reference Fix (Audio half)

**Date:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-5.
**Target:** `docs/mandates/akki_os_pack_v1/Audio_Intelligence_Plane_Specification_v1.0.md` §4.4.
**Kind:** append-only correction note. The pack document is not edited in place; this note is the reader's binding reference.

---

## The defect

Audio Plane §4.4 (line 118 of committed .md) reads:

> *"During the same ingestion pass, group-level acoustic attributes required by any future synthesis capability (pitch statistics, energy contours, duration patterns) are captured, subject to the custody conditions of **§6.4**."*

§6.4 is titled **"Idiolect rule"** and defines EXCLUSION rules (habitual fillers, characteristic phrasings, idiosyncratically pronounced words fail conditions 2 or 3 and are excluded). §6.4 is NOT the four-conjunctive-conditions custody boundary that §4.4 is intended to invoke.

§6.2 is titled **"The four conditions — all must hold"** and lists the four conjunctive conditions (Acquired-not-anatomical / Group-level / Learned-from-signal / Reversible-if-mistaken) governing group-level attribute capture. This is the target clause.

## Correction

Where §4.4 reads "custody conditions of **§6.4**", the reader treats it as "custody conditions of **§6.2**" (four conjunctive conditions). The source document remains byte-identical under its recorded SHA (`c8ee75a…`); this amendment is the binding reference until the document's next-version bump, at which point Owner may fold this correction into §4.4 in place.

## Confirmation from cross-references in the document itself

Audio Plane §8 (Objective Wizard) at line 247 reads: *"A Collection Schema requiring a column whose capture violates the custody conditions of **§6.2**."* This confirms §6.2 is the correct citation target for the phrase *"custody conditions of…"* elsewhere in the document; §4.4's §6.4 is a typographical error.

## CC-5 status

- Engineering Spec §16.3 half — recorded in `AMENDMENT_2026-07-30_CrossReferenceFix_CC-5.md`.
- Audio Plane §4.4 half — recorded in this note.

**CC-5 CLOSED** on both halves as of this note.

— End of amendment. —
