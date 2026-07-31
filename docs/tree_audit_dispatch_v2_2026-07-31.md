# TREE DESIGNATION AUDIT · Dispatch v2 §2

**Filed:** 2026-07-31 (on receipt of AKKI OS CONSOLIDATED DISPATCH v2.0)
**Authority:** Dispatch v2 §2.1 — "The tree carrying the Canon files at their recorded SHAs is canonical."

---

## §2.1 Canon-cited files check on THIS tree

| Canon file (Brief v1 Part J) | Recorded SHA (Canon) | Status on this tree |
|---|---|---|
| `docs/mandates/akki_operating_model_product_spec_v2.0.md` | `20b4d305c26c1054c6c5cf49ae4d542a16e3579b2eddea1bdc04ec6450ceee4f` | **MISSING** |
| `docs/mandates/akki_role_register.md` | `471e1f4e578ec7aadf6edff11e898f44c459bfccdf7d63ddd3ee283fc0b65bd7` | **MISSING** |
| `docs/mandates/akki_analyze_codebase_acquisition_v1.0.md` | `76b2998e7b9075efd703fbd246d1dd048a4bfe6c5af7d1818973fe3e2a2ebd7d` | **MISSING** |
| `docs/rulings/owner_change_order_2026-07-25.md` | `[MEMORY]` (unverified per Brief v1 Part J) | **MISSING** |
| `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` | `c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17` | **MISSING** |
| `docs/registers/artifact_manifest.md` | (disk-verified in Brief v1) | **MISSING** |
| `docs/mandates/RMS_UI_Specification_v2_2.md` | (Brief v1 lists byte-count 34 261 B, NOT SHA) | **PRESENT** · disk SHA `d681c6cd399dd569…` |
| `docs/mandates/RMS_UX_Architecture_v2.md` | (Brief v1 lists byte-count 10 956 B, NOT SHA) | **PRESENT** · disk SHA `e072fd307e00b207…` |
| `docs/mandates/surface_journey_map_v1.md` | (Brief v1 lists byte-count 10 017 B, NOT SHA) | **PRESENT** · disk SHA `3b18aef81b606f29…` |
| `docs/stage_a_proposals/ui_1_stage_a.md` | (Brief v1 lists byte-count 100 032 B, NOT SHA) | **MISSING** |
| `docs/mandates/module_specs/*.md` (20 files) | (Brief v1 lists count only) | **MISSING · directory not present** |

**Summary:** 8 of 11 named Canon sources are ABSENT from this tree (6 core + `ui_1_stage_a.md` + 20 module_specs).

## §2.1 Second-tree reachability

- `git remote -v` → single remote: `origin` (RMS-IQ-Core-2 on GitHub).
- `git branch -a` → single branch: `main` (+ `remotes/origin/HEAD`, `remotes/origin/main`). NO other branches, worktrees, or reachable trees.
- Conclusion: **no second tree is reachable from this pod.**

## §2.2 Diff discipline · what is verifiable now

- **`contracts/` parity:** on-disk `*.contract_snapshot.json` count in `backend/tests/invariants/` = **34**. `EXPECTED_PARITY = 34` in `backend/services/health/parity_counter.py`. **Parity chain intact — no divergence.** GET `/api/readyz` returns `parity_count: 34 / expected_parity: 34`.
- **`backend/services/`:** 33 service directories present (matches Brief v1 §I.3 count). `workbook_analyzer/` NOT PRESENT (matches Brief v1 §I.3 statement).
- **`docs/rulings/`:** ruling store present at `/app/docs/rulings/`. Dispatch v2 filed on receipt per §2.4. Retired sub-cycle rulings moved to `/salvage/` per §1.2.
- **Artifact manifest:** `docs/registers/artifact_manifest.md` MISSING — cannot cross-reference.

## §1.5 — `owner_change_order_2026-07-25.md` SHA re-read from disk

Not possible on this tree — file MISSING. Per Dispatch v2 §1.5 the Canon [MEMORY] SHA remains **unverified canon** until the file is delivered.

═══════════════════════════════════════════════════════════════════

## HAZARD-STOP · MISSING CANON SOURCES

Per Dispatch v2 §1.4 ("Builder MUST verbatim-read all before UI-1 execution") and §2.1 (tree designation), this tree cannot be designated canonical without the Canon-cited sources. No second tree is reachable. HAZARD-STOP raised.

### Files requested from Owner (verbatim + SHA re-verification on delivery)

**Core Canon sources (Brief v1 §1.1):**
1. `docs/mandates/akki_operating_model_product_spec_v2.0.md` — SHA `20b4d305…`.
2. `docs/mandates/akki_role_register.md` — SHA `471e1f4e…`.
3. `docs/mandates/akki_analyze_codebase_acquisition_v1.0.md` — SHA `76b2998e…`.
4. `docs/rulings/owner_change_order_2026-07-25.md` — SHA re-read per §1.5.
5. `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` — SHA `c5026ff4…`.

**Registry:**
6. `docs/registers/artifact_manifest.md` — 25 rows per Brief v1 §J.

**Named-but-not-yet-verbatim-read (Brief v1 §1.4 self-completion):**
7. `docs/stage_a_proposals/ui_1_stage_a.md` — 100 032 B per Brief v1.
8. `docs/mandates/module_specs/*.md` (20 files) — count per Brief v1.

## Consequence for UI-1 Stage A

**UI-1 Stage A is BLOCKED pending Owner delivery of the 8 items above.**

Per Owner directive verbatim: *"Do NOT proceed to UI-1 Stage A without the canon sources (§1.4 mandates verbatim-reads first)."*

═══════════════════════════════════════════════════════════════════

## What CAN proceed without further Owner delivery

- Dispatch v2 filed at `docs/mandates/AKKI_OS_CONSOLIDATED_DISPATCH_v2.md` + `docs/rulings/AKKI_OS_CONSOLIDATED_DISPATCH_v2_2026-07-31.md`.
- Brief v1 filed at `docs/handoff/frontend_uiux_brief_v1_2026-07-27.docx` (canonical) + `.md` mirror.
- §1.2 retirement to `/salvage/` executed (6 items moved read-only + retirement note).
- Owner reconciliation ruling (three sub-rulings) filed verbatim at `docs/rulings/owner_reconciliation_dispatch_v2_2026-07-31.md`.
- §1.3 backend + process continuity confirmed: Parity 34 unchanged, all suites GREEN, all backend engines carry.

═══════════════════════════════════════════════════════════════════

## §6 Owner items still gating (Dispatch v2 §6)

- **§6.1** B1 interim GPU spend ceiling: `$______` (blocks B1 hardware rental only). STILL BLANK.
- **§6.2** OT-1a archive facts (RMS-side): digitized state · storage system · network path · formats · CMS location · access mechanism. OPEN.
- **§6.3** OT-1b grant-provider: GPU parameters → Topology A/B selection + HS2 ratify/strike (closes CC-4). OPEN.
- **§6.4** OT-2: Hour A + 300-unit human-qualified slice. OT-3: LLM account · domain+TLS · object store · data-plane destination. OPEN.
- **§6.5** Commission auto-run ceiling value (numeric + currency; ∞ permitted) — needed at `connect/` build, not before. FLAGGED for `connect/` sub-cycle.

═══════════════════════════════════════════════════════════════════

*End of tree audit + HAZARD-STOP report. Standing Rule v3 · verbatim carrier · never self-resolve.*
