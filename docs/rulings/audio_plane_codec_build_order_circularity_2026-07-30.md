# CC-6 — Owner Branch Test Applied: DELEGATED-REVERSIBLE

**Date:** 2026-07-30 (cycle 3).
**Authority:** Owner (dispatch cycle 3 response) + builder's storage-math analysis.
**Closes:** `docs/rulings/audio_plane_codec_build_order_circularity_2026-07-30.md` for the codec-choice half; the substantive-analysis half retains its recorded three dispositions.

---

## Owner's branch test, verbatim

> **If originals can be retained at capture quality within storage constraints → the working codec is a reversible config `[SLOT]` delegated to the builder, re-derivable by Sampling & Reflection when built. Record that disposition in the CC-6 ruling file and close it as DELEGATED-REVERSIBLE.**
>
> **If storage cost forbids retaining originals → the trade is the Owner's; record BLOCKED-ON-OWNER and it waits.**

## Storage-math basis (on-disk)

### Broadcast estate reference workload

Audio Plane §3.1 anchors on **broadcast audio**. Reference workload:
- Sample rate: **44.1 kHz** (broadcast standard) or **48 kHz** (studio-broadcast). Take 48 kHz for headroom.
- Bit depth: **16-bit** per sample (broadcast standard).
- Channels: **2** (stereo).
- Bit rate at capture quality: `48000 samples/s × 16 bits × 2 channels = 1,536,000 bits/s = 1.536 Mbit/s = 192 KB/s`.
- **Per hour: 691.2 MB uncompressed PCM.**
- **Per day (24h continuous): 16.6 GB.**
- **Per year (24h continuous, single station): 6.06 TB.**

A typical broadcast station runs 18-24 hours/day. A large media estate might have 10-50 concurrent stations. Bounded reference: **10 stations, 20 hours/day, 5 years = ~1.5 PB uncompressed**. Under FLAC (lossless, standard broadcast archive format), that compresses to **~0.7-1.0 PB** — within the same order of magnitude.

### 2026-era object-storage economics

- **S3 Glacier Deep Archive** — ~$1/TB/month = **~$1,000/PB/month = ~$12,000/PB/year** in the archive tier.
- **S3 Standard-IA (infrequent access)** — ~$12.5/TB/month = ~$150,000/PB/year.
- **On-prem object storage (Ceph / MinIO)** with erasure coding — hardware amortisation at $2,000-$5,000/PB over 5 years = $400-$1,000/PB/year steady-state.

A governed-intelligence platform whose commissioned value per hour of extracted audio is measured in **thousands of dollars** (per Marketing §28's positioning of the priced-commission model) reasonably budgets **tens of thousands per year** for original-retention storage across the reference workload. **The math permits.**

### Non-audio modalities (headroom check)

- **Video** at 4K 60fps H.264 ≈ 25 Mbit/s = ~11 GB/hour → a station running 4K continuously is ~100 TB/year. Still within reach at the workload scales that carry governance value.
- **Transcript / text / structured data** — storage cost is orders of magnitude smaller than audio; not a constraint.
- **Image / photograph estates** — varies but archivable at standard object-storage rates.

**Conclusion:** for the broadcast estate the Audio Plane Spec targets, original-quality retention is economically viable at 2026 object-storage rates. This IS the branch the analysis lands on.

## The disposition

### **DELEGATED-REVERSIBLE** — codec is a reversible config `[SLOT]`

The working audio codec at `services/perception/audio_codec/` (Audio Plane §3.2 registers the seat) lands as a **config-key `[SLOT]`** named `audio_codec.chosen_version`. Initial value at ship: an open codec (specific version delegated to builder at Audio Plane build time). The `[SLOT]` is:

- **Reversible** — originals retained at capture quality (per Owner branch condition A); a codec swap can re-encode from originals without loss of information.
- **Delegated** to the builder for initial value selection at Audio Plane build time, per the config-`[SLOT]` doctrine (QRB §33A: illustrative until benchmark-measured).
- **Re-derivable** by Sampling & Reflection (§11.2) when built — the calibration stage measures the codec choice against real estate audio and updates the `[SLOT]` value with a benchmark-stamped ruling.
- **Provenance-carrying** — the current `codec_version` at time-of-extraction lands in every downstream artifact's provenance (per §3.2). Codec swaps are dated ledger events; existing artifacts retain their original `codec_version`.

## Related sub-finding still open

CC-6 sub-finding at §16.2 bullet 2 (*"N for the shared-attribute condition (§6.2.2): inherit the platform minimum-group-size seam value, or set a register-specific one"* — where §6.2 has no §6.2.2 sub-clause in the committed .md) remains an OPEN cross-reference item. **Not resolved by this ruling.** Awaits Owner clarification when Audio Plane is dispatched.

## Blocking status

Still **not blocking** any dispatched phase. Audio plane build is not in P1/P2/Memory. When audio plane is dispatched, the codec `[SLOT]` lands with an initial value + a Sampling & Reflection benchmark-update path; no separate Owner ruling required.

**Status:** codec-choice half — **DELEGATED-REVERSIBLE** (CLOSED). Cross-reference sub-finding — OPEN, awaits Owner at Audio Plane dispatch.

— End of ruling. —
