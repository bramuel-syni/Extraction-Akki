# CC-6 — Audio Plane §16.2 Codec Build-Order Circularity · Open Decision

**Date filed:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-6.
**Class:** open decision, not blocking. Dispatch language: *"Not blocking — audio plane build is not in this dispatch's phases — but it MUST NOT be silently resolved by the builder when the plane is dispatched."*
**Resolution authority:** Owner. **Do NOT self-resolve** (dispatch §SR-3).

---

## The circularity

Dispatch §CC-6 (verbatim):

> *"Audio plane §16.2 build-order circularity (codec choice deferred to Sampling & Reflection, which is built four positions later) is filed as an open decision with the Owner. Not blocking — audio plane build is not in this dispatch's phases — but it MUST NOT be silently resolved by the builder when the plane is dispatched."*

## Current state

The Audio Intelligence Plane Specification v1.0 is **not present** in the repository (see `docs/mandates/akki_os_pack_v1/MANIFEST.md` — the ninth AC-4 document is MISSING). The circularity claim is recorded from the dispatch language alone; the specific §16.2 text of the source document cannot be examined until the Owner supplies it.

**Consequence for CC-6:** this open decision is recorded now (dispatch requires the surfacing), and the substantive analysis of the circularity is deferred until the Audio Plane Spec lands in the pack. When the document arrives, this file is updated with a substantive analysis section and re-surfaced to the Owner in the same pass — not silently resolved by the builder.

## What the circularity is (from dispatch language)

The codec choice for the audio plane is described in §16.2 of the Audio Plane Spec, but the section that "decides" the codec ("Sampling & Reflection") is built four positions later. Read literally, §16.2 is asking the reader to consume a decision that has not yet been made in build order.

## Two plausible dispositions (recorded, not chosen)

### Disposition A — the doc order is wrong; move the codec choice into §16.2

The "Sampling & Reflection" section's codec statement is authoritative, and §16.2 is where it should appear. In this reading, the fix is a docs edit — lift the codec choice text into §16.2 and leave "Sampling & Reflection" as a reference back.

### Disposition B — the build order is wrong; codec choice sequences before "Sampling & Reflection"

The codec choice is a build prerequisite for §16.2 (Restructuring), and "Sampling & Reflection" (built four positions later) inherited the codec statement by accident of author sequence. In this reading, the fix is to move the codec decision to build first (a phase-graph re-order), then let "Sampling & Reflection" cite it.

### Disposition C — the codec is a config, not a build decision

Under Quality Rule Book §10 constraint-architecture and BCR H4 (values change by config swap, versioned), the codec might legitimately be a `[SLOT]` — illustrative until the benchmark measures on real audio. If so, both §16.2 and "Sampling & Reflection" cite the same config key, and the circularity dissolves (the config key is the shared anchor, and neither section "decides" the codec — the config does).

## Not blocking

Dispatch §CC-6 explicitly rules this **not blocking** for P1 and P2. The audio plane is not dispatched in the current cycle. The purpose of filing this ruling request now is to prevent the circularity from being silently resolved by whoever picks up the audio plane later.

## Close condition

1. The Audio Intelligence Plane Specification v1.0 lands in `docs/mandates/akki_os_pack_v1/` (AC-4 close).
2. The Owner writes a dated ruling to `docs/rulings/` naming this file, choosing A / B / C (or a fourth), and stating what edits (docs, code, or config-key seat) land in the same close.
3. This file's Status line below is updated in that close pass.

**Status:** OPEN · not blocking · awaiting Owner ruling AND awaiting Audio Plane Spec supply. Two conditions, both required to close.

— End of ruling request. —
