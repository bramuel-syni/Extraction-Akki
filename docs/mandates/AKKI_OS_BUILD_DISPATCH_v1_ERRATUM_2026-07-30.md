# Dispatch Erratum — AKKI_OS_BUILD_DISPATCH_v1 §6 Heading Scoping

**Date:** 2026-07-30 (cycle 3).
**Authority:** Owner (dispatch cycle 3 response).
**Target:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §6 (Memory Service).
**Kind:** append-only amendment note. The dispatch document remains byte-identical on disk under its recorded SHA (`201e16c3…`). This note is the reader's binding reference.

---

## What §6 heading says at v1.0

Dispatch §6 (Memory Service) header carries "Stage A only" scoping language.

## What the Owner rules (this erratum)

> **DISPATCH ERRATUM: correct the §6 heading of `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` on disk — body governs: "Stage A only" binds surfaces and commissioning, NOT Memory. Log as a dated dispatch erratum (append-style amendment note, do not silently rewrite; note the manifest SHA change if the file is hashed).**

## Interpretation

- The Memory Service RULING (b) in this cycle explicitly authorises full mechanics in parallel with Stage A (backend-only). Any reading of §6 that would gate Memory behind "Stage A only" is superseded by the body ruling.
- "Stage A only" scoping continues to bind:
  - **Surfaces** (Frontend Brief v2 arriving this cycle; Phase 3 Stage A gates on that supply).
  - **Commissioning** (P2 Stage A already approved; Stage B GPU + BM-V remain gated on OT-1 / OT-2 / OT-3).

## Manifest impact

The committed dispatch file's SHA (`201e16c30b0e04b6d191b387e9021bd4545eaa86cb6d74b3847e6a5cc329abbb` recorded in `docs/mandates/akki_os_pack_v1/MANIFEST.md`) is **UNCHANGED** by this erratum (no in-place edit). The pack manifest's dispatch row is not modified. This erratum note is the operative reference; future readers of §6 apply the amendment.

If Owner later chooses to re-issue AKKI_OS_BUILD_DISPATCH_v1 with the corrected heading, the new file lands as a versioned successor (never as an in-place rewrite of v1), and the manifest bumps to record both.

**Status:** applied. Body governs. Memory build proceeds under option (b).

— End of erratum. —
