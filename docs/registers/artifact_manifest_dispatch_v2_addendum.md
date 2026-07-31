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
