# Akki OS Document Pack v1 — Manifest

**Dispatch authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §AC-4.
**Commit date:** 2026-07-30 (UTC).
**Canonical form:** markdown. `.docx` originals are generated presentation only (AkkiOS_Canon_Register §Preamble; RMS docs-pass 2026-07-02 Item 8 authoring-direction inversion).

AC-4 names NINE Akki OS documents. This pack commits **EIGHT**. The ninth — **Audio Intelligence Plane Specification v1.0** — was **NOT PRESENT** in the uploaded ZIP and **NOT FOUND** anywhere in the repository (grep-negative across `/app/docs`, `/app/salvage`, `/app/memory` for `audio intelligence plane`, `audio_intelligence_plane`, `audio plane spec`). It is recorded here as MISSING. The Owner has been asked to supply it. Until it lands, dispatch §CC-5 audio-half + §CC-6 audio codec-order ruling remain pending.

## Documents in this pack (canonical .md; source .docx SHA also recorded)

| # | Filename (canonical .md) | SHA-256 (.md) | Source .docx SHA-256 |
| --- | --- | --- | --- |
| 1 | AkkiOS_Product_Engineering_Specification_v1.0.md | 555bf0018b94f87371b2d68492cf9a1bb4cde09f8aadb7e3dde5134bae663564 | e886872bec3da0f0676a62841890762d8a74300861dfdfe7ecd9b3c381dc46fb |
| 2 | AkkiOS_Product_Marketing_Briefing_v1.0.md | 2dad00deea6b475125782b1b31126f43c193df8797c7bfeb7d1fdf47659bacb0 | fe35ca6eef4cf95707953981d9b88cbe01b7ee073d37c66c7157ec553b0719c5 |
| 3 | AkkiOS_Governance_Orchestration_Brief_v1.0.md | 7c178ee3d37ecd8350c6840649989616ea98cad95ecc957969dbfe0bcbec03a7 | 41f38430bacd0f150f31cbe227c452012e030959fdf0ae0182299ad4bb4a437d |
| 4 | AkkiOS_Production_Orchestration_Brief_v1.0.md | 018ec6d2edb4fdd67fcf5152837a399c960eb4124386c890e70b7b0f8ac20c0c | 94290a5871cd08671bd74f1356d8230a391be9ab92fc980349bca649dd31ca62 |
| 5 | AkkiOS_Integration_Orchestration_Brief_v1.0.md | 7681f9b008c67d0e51abd97cc65dac47bbdb2876e1fde7d89a0baee4c8458ce7 | 7d631e9acf69812b1009d1ce5476e96824178451bb8f6bbcc133b9e39cc6428c |
| 6 | AkkiOS_Surfaces_Journeys_Features_v1.0.md | bdfd4f80e15d0c78c5ed4b3c797e6063ae7b8166d811207d289d25092c94f5e0 | 490289e4a460e35bfee4f8be7930c1e51c30e0c09b35c2d84040897402951781 |
| 7 | AkkiOS_Quality_Rule_Book_v1.0.md | b1e59fdba4dcddc3fa284452cbb947f034918ef686cdb920e70fcfe44a0e6806 | 2b7623b6c0cd25de673b48f740f38bce2bd521c4964df06fc1ae6273bc251533 |
| 8 | AkkiOS_Canon_Register_and_Correction_Record_v1.0.md | be6253a28996fc480dbf220bdbc789b68de1c329206d069799a658b1ef97ce42 | 30bd6b4134f5334090068772d75bb32113d97d5e2e3b795d60305106d4a6b4fe |
| 9 | Audio_Intelligence_Plane_Specification_v1.0.md | **MISSING — pending Owner supply** | **MISSING** |

## Dispatch document (committed alongside the pack)

| Filename | Location | SHA-256 |
| --- | --- | --- |
| AKKI_OS_BUILD_DISPATCH_v1.md | `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` | 201e16c30b0e04b6d191b387e9021bd4545eaa86cb6d74b3847e6a5cc329abbb |

## Conversion methodology (auditability)

1. Zip fetched from `https://customer-assets-m6fa6gv7.emergentagent.net/job_038a2356-2cd3-4b0e-a1a2-30da25b19967/artifacts/g7bazsyv_files%20%284%29.zip` and extracted to `/tmp/akki_docs/extracted/`.
2. Converter: `/tmp/akki_docs/docx_to_md.py` (python-docx 1.2.0 + lxml 6.1.1). It walks the OOXML body in document order, emitting: `Heading N` → `# … ######` (H6 cap), `Title` → `#`, list-detected paragraphs (numPr in XML or `bullet`/`list` styles) → `-` / `1.`, runs with bold/italic → `**…**` / `*…*` / `***…***`, tables → GFM pipe tables with `<br>` for multi-line cells and `\|` for literal pipes. Paragraph and table order preserved; empty paragraphs collapsed to single blank lines.
3. Fidelity claim (bounded): every paragraph and every table row of the source .docx lands. Not preserved: run-level colour, font, footnotes, comments, revision marks, images (none present in this pack).
4. SHA-256 computed over the exact bytes committed to the repo (`sha256sum <file>` from GNU coreutils).

## Doctrinal notes carried by this manifest

- **AC-4 close condition:** the nine-document pack lands with SHA manifest before Phase 1 code work begins. This manifest closes **eight** of nine; the ninth blocks pack-closure. Owner must supply the Audio Intelligence Plane Specification v1.0 for AC-4 to close in full.
- **Authoring-direction inversion (docs-pass 2026-07-02 Item 8, restated by dispatch §AC-4):** markdown is canonical; `.docx` is generated presentation. When they diverge, the `.md` wins.
- **Read-order (dispatch §AC-4):** the eight documents are read in this order — Product & Engineering Specification (master), Marketing Briefing (position), Governance Brief (direction + boundary + record), Production Brief (discovery + planner + depth + extraction), Integration Brief (answering + memory + seam), Surfaces (UX), Quality Rule Book (build discipline), Canon Register (audit-back-to-source + corrections). The Audio Plane Spec, when it lands, reads after the Production Brief per Canon Register §1.
- **Cross-reference defects noted at commit (dispatch §CC-5):** the Engineering Specification §16.3 half is recorded in `AMENDMENT_2026-07-30_CrossReferenceFix_CC-5.md` in this pack. The Audio Plane §4.4 half is pending the missing document.

— End of manifest. This file is regenerated only when a document in the pack is bumped to a new version; every regeneration lands as a dated amendment note in this directory (never in-place). —
