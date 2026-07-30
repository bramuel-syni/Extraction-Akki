# Canon Register Amendment — CC-1 (BCR v1.5 promotion)

**Date:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §CC-1.
**Target:** `docs/mandates/akki_os_pack_v1/AkkiOS_Canon_Register_and_Correction_Record_v1.0.md` §Part IV (Outstanding-read register) and the constitutional-documents table (§1).
**Kind:** append-only amendment note (history is not rewritten; the original Canon Register remains byte-identical in the pack under its recorded SHA).

---

## What the Canon Register says at v1.0

Canon Register v1.0 §Part IV lists **Build Completion Requirements v1.5** among the documents categorised as *"Not read / not bearing on the product."* The register's stated posture there is: the requirements document is read only as much as it must be, and current versions on the Owner's side are not read as canon.

## What the dispatch establishes

BUILD DISPATCH v1.0 §CC-1 (2026-07-30, Owner-issued) rules that **BCR v1.5 DOES bear on the product** and MUST be treated as canon:

> *"Canon Register §15 mis-states Build Completion Requirements v1.5 as not bearing on the product. It carries the placement rule (§1.6), the production rule (HS3), the BM-V prohibition (BM-V2), the V1 wire shapes, and the housing map (§4). Amend the Canon Register: BCR v1.5 moves from 'Not read' to the canon table, and the builder MUST read it in full before Phase 2 Stage A."*

## Amendment

With this note, BCR v1.5 moves **out of** the Outstanding-read register (§Part IV) and **into** the canon table (§1). Its entry is:

| Document | Location | Where reflected |
| --- | --- | --- |
| **Build Completion Requirements v1.5** | `docs/mandates/RMS_Build_Completion_Requirements_v1_5.md` (359 lines) | Placement rule §1.6 (binding discipline); housing map §4; production rule HS3 (§1.5); never-rules HS2 [STAKED]; tenancy posture HS5; V1 extraction wire shapes §3.1 (PerceptionJob_v0, PerceptionResult_v0, worker endpoints, V1-G1..V1-G7); artifact-store §3.2 (AS-* and AS-U2 demo posture); benchmark split §3.3 (BM-V validation-in-phase, BM-V2 prohibition on deferral); production housing §3.4 (PH-R1/R2, env contract, healthchecks, LLM swap seam); authorized-deletion path §3.5; consequence-class checker §3.11; sampling primitive §3.12; opportunity briefs §3.15; commercial cut §12 (buyer-path preservation). Precedence clause: on any conflict → HAZARD-STOP, never self-resolve. |

## Consequence

1. **Builder read obligation:** BCR v1.5 MUST be read in full before Phase 2 Stage A is written. This obligation is satisfied by the 2026-07-30 dispatch session (read confirmed; the proposal in `docs/stage_a_proposals/p2_v1_extraction_real_material.md` cites §3.1 wire shapes, §3.4 packaging, §3.3 BM-V, §12 buyer-cut governance, §1.6 placement, and HS3 verbatim rather than re-authoring).
2. **Doc-vs-doc reconciliation:** Canon Register v1.0 §Part IV remains truthful for every other entry it lists; only the BCR v1.5 row is moved by this amendment. History is preserved (v1.0 is committed under its recorded SHA and not rewritten).
3. **CC-1 close condition (dispatch §CC-1) is met:** amendment recorded on disk, dated, citing the Owner ruling.

## Not amended by this note

- Canon Register Part II (three published-claim corrections — custody override, single-egress guard, de-id language coverage). These remain open and are addressed by the P1 Stage A proposal.
- Canon Register Part IV's other outstanding-read entries (Function-Promise Registry, Tiered Ruling Model remainder). FPR v0.2 has since landed at `docs/registry/function_promise_registry_v0.md` + supplements; a separate amendment note may be raised.

— End of amendment. —
