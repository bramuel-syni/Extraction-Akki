# CC-6 — Audio Plane §16.2 Codec Build-Order Circularity · Substantive Analysis

**Date:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-6 + dispatch cycle 2 STEP 1.
**Status update:** substantive analysis written now that the Audio Plane Specification v1.0 is committed. Decision remains OPEN, awaiting Owner. **Not blocking.**

---

## The circularity, now readable in-source

Audio Plane §16.2 (Open decisions), bullet 3 (verbatim):

> *"Codec choice: adopt an existing open codec versus training estate-specific — a trade the Sampling & Reflection machinery can itself answer once built (§3, §11.2)."*

Cross-references walked:
- **§3** = Tokenized Audio Representation. §3.1 says *"All downstream audio work — extraction, character analysis, training — operates on discrete token sequences produced by a neural audio codec, not on waveforms."* §3.2 registers the codec as `perception/audio_codec/` with `codec_version` as a mandatory field of every downstream artifact's provenance.
- **§11.2** = Sampling & Reflection (calibration) — mandatory first stage. Owns milestone list production, priced quote authoring, and (per §16.2) *"can itself answer"* the codec-choice trade.

## Why this is a build-order circularity

§3's contract requires `codec_version` on every downstream artifact from day one — including the artifacts Sampling & Reflection itself produces at §11.2. Yet §16.2 says the codec choice is answered by §11.2. Read literally:

- **To build §3**, we need to know which codec (its version is a mandatory field of every downstream artifact).
- **To answer which codec**, we need to run §11.2 (Sampling & Reflection).
- **To run §11.2**, we need §3 to be built (Sampling & Reflection outputs are themselves downstream artifacts that need `codec_version` provenance).

The circularity is real. Three plausible dispositions:

### Disposition A — codec is a config `[SLOT]` (Quality Rule Book §33A pattern)

Build §3 with a *config-key seat* named `audio_codec.chosen_version` initialised as a `[SLOT]` per QRB §33A (*"a plan without a calibration stage is rejected; the first job prices the real job"*). Sampling & Reflection at §11.2 fills the slot at first commission over the estate's real material. §3's `codec_version` provenance field carries the slot's current value at time of extraction. The trust receipt records which slot value was in force when the artifact was produced.

**Consequence:** §3 lands with a config-driven codec (an existing open codec by default — whichever open codec is currently registered) and swaps by config after Sampling & Reflection rules. The circularity dissolves: both §3 and §11.2 read the same `[SLOT]`; §11.2 has authority to write.

**Cost:** every codec swap is a data-model event (existing artifacts carry the older `codec_version`; the manifest tracks which codec produced which artifact). This is by construction; QRB §33A explicitly names it.

### Disposition B — open codec first, estate-specific later (two-phase build)

Build §3 twice: first with an existing open codec (any registered high-quality open neural audio codec), landing all of §5 (Character Register), §6 (Custody boundary), §8 (Objective Wizard), §11 (Commission Envelope) on top; then — once §11.2 (Sampling & Reflection) has answered the trade against real estate audio — rebuild §3 with the estate-specific codec if the measurement justifies the retrain cost.

**Consequence:** §3 lands solidly; the estate-specific retrain is a separate later phase gated on real-hour measurement. Downstream artifacts from Phase 1 carry the open codec's `codec_version`; artifacts from Phase 2 carry the estate-specific `codec_version`; the manifest at §3.2 tracks both.

**Cost:** if the open codec's tokenisation is materially different from the estate-specific codec's, downstream models trained on Phase-1 artifacts may need re-training on Phase-2 tokens. QRB §26 ("no accuracy figure before measurement") applies.

### Disposition C — defer §3 entirely; skeleton contracts only

Build §3's *contracts* (§3.2 technical contract) as frozen shape but do not deploy any codec service until Sampling & Reflection rules the choice. Every dependent build (§5, §6, §7, §8, §11) waits.

**Consequence:** the audio plane build is single-phase but delayed. Sampling & Reflection cannot run without a codec, so §11.2 itself must be built with a *fixture codec* whose choice does not affect the trade being decided. This creates a sub-circularity.

**Cost:** high. Disposition C is recorded for completeness; not recommended.

## Reading §16.2 as the design's own resolution hint

Audio Plane §16.2 bullet 3 verbatim says the trade *"the Sampling & Reflection machinery can itself answer once built."* The construction *"once built"* implies **Disposition A or B**: the machinery exists and the trade is answerable by it. Disposition A (config `[SLOT]`) is more aligned with the design's other resolutions (§1.5 unrepresentable-not-policed, §13.1 measurement-driven quotes) because it makes the codec choice a measured switch rather than a build-time bet.

## Not self-resolved

Per dispatch §SR-3 and CC-6 verbatim (*"MUST NOT be silently resolved by the builder when the plane is dispatched"*), this analysis states the three dispositions with their consequences. The builder does NOT choose. The Owner rules when the audio plane is dispatched.

## Related CC-6 sub-finding (recorded for completeness)

Audio Plane §16.2 bullet 2 (verbatim): *"N for the shared-attribute condition (§6.2.2): inherit the platform minimum-group-size seam value, or set a register-specific one."* Cross-reference walked: §6.2 has four bullets numbered as top-level list items, not sub-sections; there is no §6.2.2 sub-clause in the committed .md. The four conditions are contained in §6.2 as a flat list. If Owner rules the ambiguity, options are: (a) Owner rules bullet 2 of §6.2 is the referent, (b) Owner adds §6.2.2 as a new sub-section, (c) Owner adopts platform default without further reference. **Recorded, not resolved.**

## Blocked-until-closed

Still not blocking any dispatched phase. Audio plane build is not in P1/P2. This ruling and its sub-finding remain closable at the Owner's convenience.

**Status:** OPEN · substantive analysis written this cycle · decision still awaits Owner.

— End of ruling. —
