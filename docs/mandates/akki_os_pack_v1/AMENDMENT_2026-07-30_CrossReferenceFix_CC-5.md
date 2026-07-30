# Cross-Reference Fix — CC-5 (Engineering Spec §16.3)

**Date:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-5.
**Target:** `docs/mandates/akki_os_pack_v1/AkkiOS_Product_Engineering_Specification_v1.0.md` §16.3.
**Kind:** append-only correction note. The pack document is not edited in place; this note records the correction and is the reader's binding reference.

---

## The defect

Dispatch §CC-5 records two cross-reference defects:

> *"Audio Plane Spec §4.4 cites '§6.4' where it means §6.2; Engineering Specification §16.3 cites '§18'. Reconcile so both documents cite the same clause. One-line docs fix, ruled trivially."*

## Audio Plane half

**PENDING.** The Audio Intelligence Plane Specification v1.0 is **not present** in this pack (see `MANIFEST.md`; grep-negative across `/app/docs`, `/app/salvage`, `/app/memory`). Until the Owner supplies the document, the §4.4 cross-reference fix cannot be applied. This half of CC-5 is **carried open** in `docs/rulings/audio_plane_codec_build_order_circularity_2026-07-30.md` alongside CC-6.

## Engineering Specification §16.3 half — reconciliation

The committed Engineering Specification pack file (`AkkiOS_Product_Engineering_Specification_v1.0.md`) §16.3 currently cites *§18*. Dispatch language directs *"reconcile so both documents cite the same clause."* Since the Audio Plane Spec's §6.2 is the target clause of the Audio half (per the dispatch), and Engineering §18 in the Akki OS Product & Engineering Specification v1.0 covers **the audio custody boundary** (registration/synthesis limits), the cross-reference from Engineering §16.3 (which is the perception → normalization discussion of audio material) is intended to reach that clause.

**Reconciled reading:** where Engineering Spec §16.3 references *"§18"*, the reader treats that as a reference to the same audio custody-boundary clause referenced by Audio Plane Spec §4.4 (proposed target: Audio Plane §6.2). Both citations converge on the same normative statement — the custody boundary that constrains what audio-plane products may register vs synthesize.

**Applied fix scope:** this note is the reader's binding reference until the Audio Plane Spec lands. When the Audio Plane Spec is committed to this pack, this amendment will be closed and either (a) the Engineering Spec §16.3 line replaced with an explicit cross-reference to Audio Plane §6.2, or (b) both citations retained if the Owner rules that Engineering §18 and Audio §6.2 remain distinct clauses.

## Not self-resolved

Per dispatch SR-3 and CC-5 language, this note does not silently rewrite either published document. Both the Engineering Spec .md (committed under its recorded SHA) and the Audio Plane Spec (pending) remain in their as-authored forms. This amendment is the reconciliation instrument; the underlying documents will be updated only in their own next-version bumps, at Owner instruction.

— End of amendment. —
