# Artifact manifest addendum · Dispatch v2 receipt

**Filed:** 2026-07-31.
**Parent manifest:** `docs/registers/artifact_manifest.md` — REQUESTED FROM OWNER (missing on this tree · Brief v1 §J cites 25 rows).

## Artifacts filed on receipt of Dispatch v2 (per §2.4)

| Path | On-disk SHA-256 | Kind | Authority |
|---|---|---|---|
| `docs/mandates/AKKI_OS_CONSOLIDATED_DISPATCH_v2.md` | `ad177c62723944dc07125c0c10f15080ceddf6823f850c730d4b080f48f8ef0d` | mandate | Dispatch v2 · Owner ruling 2026-07-31 |
| `docs/rulings/AKKI_OS_CONSOLIDATED_DISPATCH_v2_2026-07-31.md` | (same as above) | ruling | Dispatch v2 · Owner ruling 2026-07-31 |
| `docs/handoff/frontend_uiux_brief_v1_2026-07-27.docx` | `2242631548ae5f6edc9401d8470ab61567aa88ba3c9d4ca11f01b5f1e7a11b08` | canon (attached) | Brief v1 · UI/UX Brief · CANON |
| `docs/handoff/frontend_uiux_brief_v1_2026-07-27.md` | `c0c5ea1c0a6ca5a6ab71ede842cefacbfbed14009ab7f0af4204469d2abb2cf7` | canon (derived .md mirror) | Brief v1 · UI/UX Brief · CANON |
| `docs/rulings/owner_reconciliation_dispatch_v2_2026-07-31.md` | (this file lands) | ruling · verbatim | Owner reconciliation ruling 2026-07-31 |
| `docs/tree_audit_dispatch_v2_2026-07-31.md` | (this file lands) | audit | Dispatch v2 §2 tree designation audit |
| `salvage/dispatch_v2_retirement_2026-07-31/` | (dir · 6 files + note) | retirement (§1.2) | Dispatch v2 §1.2 |
| `salvage/dispatch_v2_retirement_2026-07-31/RETIREMENT_NOTE.md` | (retirement manifest) | note | §1.2 retirement note |

## SHA note (§1.5)

- `owner_change_order_2026-07-25.md` — Brief v1 records SHA as `[MEMORY]` (Pass-3 SHA read did not land). This tree does NOT contain the file; SHA remains **unverified canon**. Owner delivery requested.

## Parity chain (§2.2)

- `backend/services/health/parity_counter.py`: `EXPECTED_PARITY = 34`.
- On-disk `*.contract_snapshot.json` count in `backend/tests/invariants/`: **34**.
- GET `/api/readyz`: `parity_count: 34 / expected_parity: 34`.
- Divergence: NONE.

═══════════════════════════════════════════════════════════════════

*Manifest addendum. To be folded into the primary `artifact_manifest.md` on Owner delivery of that file.*

## Canon intake · Part 2 (4 of 8 files landed 2026-07-31)

| Path | Recorded-Canon SHA | Supplied SHA | Derived-md SHA | Bytes |
|---|---|---|---|---|
| `docs/mandates/akki_operating_model_product_spec_v2.0.md` | `20b4d305…` | `4c930164…` (docx) | `5087be0f02ce50adfaa1dd793c18540de39e7b7a7887f8f1596079e6a7326f62` | 41 935 |
| `docs/mandates/akki_role_register.md` | `471e1f4e…` | `837f04ff…` (docx) | `45bad42df495120891b0f1e39d54abe9914e5124d79cd8e2837f13b535ed2c60` | 29 083 |
| `docs/mandates/akki_analyze_codebase_acquisition_v1.0.md` | `76b2998e…` | `9e33f832…` (docx) | `a8b81475b5f6d3a6fccfa5732c2b277326f24e7f5b08398821aa75ccf1df50dc` | 8 647 |
| `docs/rulings/owner_change_order_2026-07-25.md` | `[MEMORY]` unverified | `33b16441…` (md direct) | (same as supplied) | 17 141 |

**SHA discipline (Owner directive verbatim):** items 1-3 supplied as `.docx`; derived-md SHAs do NOT byte-match the Canon-recorded `.md` SHAs (different conversion path). Recorded-canon SHAs are noted **superseded-by-Owner-delivery**. Content is treated as canon per Owner delivery. Item 4 supplied direct as `.md`; its on-disk SHA `33b16441…` is now the §1.5 resolved SHA (replaces the prior `[MEMORY]` annotation).

Originals: `docs/handoff/canon_originals/*.docx` (3 files).
Delta log: `docs/canon_intake_delta_log_part2_2026-07-31.md`.

## Canon intake · Part 3 (2 more files landed 2026-07-31)

| Path | Recorded-Canon SHA | Supplied/on-disk SHA | Match | Bytes |
|---|---|---|---|---|
| `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` | `c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17` | `c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17` | ✓ MATCH byte-identical | 10 671 |
| `docs/rulings/owner_brief_enforcement_class_on_estate.md` | (new · not in original 8) | `7c6d0192220927ab160988ff1effd48144f738bdfc0a7fe7b4f73d643205c088` | ✓ new source | 7 202 |

Also written duplicate: `docs/rulings/owner_brief_blinded_assessment_and_coverage_layer.md` (artifact-trail companion to item 5, byte-identical to canonical path).

## Canon intake · Part 4 (2026-07-31 final batch)

| Path | Supplied SHA | On-disk SHA | Notes | Bytes |
|---|---|---|---|---|
| `docs/handoff/frontend_uiux_brief_v1_2026-07-27.docx` re-upload | `22426315…` | `22426315…` (already committed) | ✓ BYTE-IDENTICAL to committed | 60 723 |
| `docs/registers/artifact_manifest.md` | (PDF-derived) | `969bc76e1333d9e095c35475dfe4c75f6a02faeffdc29f5b821549cde965bbda` | Extracted from `final_batch_2026-07-31.pdf` · content canonical per Owner delivery | 11 290 |
| `docs/stage_a_proposals/ui_1_stage_a.md` | (PDF-derived) | `57c86c1a7596e6a6160ecb624600dabd6391a5ac6d8237017d26b3974a60a5b4` | Extracted from PDF · 34 sections · content canonical | 102 854 |
| `docs/handoff/canon_originals/final_batch_2026-07-31.pdf` | `76a38499…` | `76a38499a388d13a94cff1e1daecb06cb42e450a1d689d65c53faa84a28af18b` | Source PDF preserved (39 pages) | 552 490 |

Delta log part 4: `docs/canon_intake_delta_log_part2_2026-07-31.md` §§11-15.
