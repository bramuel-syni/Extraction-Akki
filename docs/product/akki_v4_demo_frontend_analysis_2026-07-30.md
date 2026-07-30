# Akki v4 Standalone Demo Front End — Analysis

**Date:** 2026-07-30.
**Authority:** Owner clarification (dispatch cycle 2, targeted follow-up).
**Artefact:** `docs/product/Akki_v4_Standalone.html` (SHA-256 `7d6e442b40ceaea206ba935e5809d2a3cc5205408bc2136308f20d902bfe353b`, 919,853 bytes, 391 lines including the JavaScript bundle).
**Class:** design/visual reference implementation. **Not a specification.** Where it is silent or conflicts with Surfaces v1.0 + v2.0 amendment + FRONTEND BRIEF v2.0, the documents govern (Owner ruling; Surfaces v2 §A1).
**Owner instruction 2026-07-30:** *"Do NOT restyle or modify the React frontend now — Phase 1 is custody/startup only. Surface work is Phase 3+; this reference will be consumed at that Stage A."*

---

## §1 Provenance and supersession status

Owner supplied at two URLs across the two dispatch cycles:

| # | URL | SHA-256 | Status |
| --- | --- | --- | --- |
| 1 | `.../artifacts/ar17z2zy_Akki%20v4%20Standalone.html` (cycle 2 STEP 2) | 7d6e442b40ceaea206ba935e5809d2a3cc5205408bc2136308f20d902bfe353b | Same bytes |
| 2 | `.../artifacts/quizxega_Akki%20v4%20Standalone.html` (cycle 2 follow-up) | 7d6e442b40ceaea206ba935e5809d2a3cc5205408bc2136308f20d902bfe353b | **Same bytes** — re-upload of identical file |

Both URLs resolve to byte-identical content. **No supersession event.** The re-upload confirms the current copy is authoritative.

## §2 Structural shape

- Single-file bundled page (HTML + inline CSS + embedded SVG splash + JavaScript module bundle).
- Splash screen (visible before the JavaScript bundler unpacks the interactive layer): wordmark **Akki** in Georgia serif on cream, an oxblood accent bar, and **V4** letter-spaced in sage. Loading indicator "Unpacking..." at bottom-right; no-JS notice fallback at bottom-left.
- Interactive layer: React-style single-page application delivered via inline module JavaScript. State-driven `activeView` navigation between views.

## §3 Screen inventory — 34 view identifiers extracted

Extracted by grep of state-transition tokens (`'<screenName>'`) inside the JavaScript bundle. Sorted alphabetically:

```
approvals · artifact · ask · changeRule · connect · destroy · developer ·
govEstate · govSetup · intel · memoDetail · memos · modelDetail · models ·
objectives · opportunities · quarantine · receipts · recipient · registry ·
release · runDetail · runs · shape · shapes · sourceProfile · succession ·
team · testbed · trail · trainingRun · useData · verify · wizard
```

**Count: 34** — matches Surfaces v2 §A2-2 statement *"Screen count is thirty-three plus the public receipt page"* exactly (33 authenticated screens + `receipts` doubling as both authenticated Prove tab and unauthenticated public trust receipt).

## §4 Mapping to the six modules of Surfaces v2 §A2

| Module | Surfaces v2 count | Screens in demo | Cover ratio |
| --- | --- | --- | --- |
| **Connect** | 1 | `connect` | 1/1 · 100% |
| **Registry** | 3 | `registry`, `sourceProfile`, `opportunities` | 3/3 · 100% |
| **Use Data** | 14 | `useData`, `wizard`, `objectives`, `shape`, `testbed`, `approvals`, `runs`, `runDetail`, `trainingRun`, `models`, `modelDetail`, `intel`, `artifact`, `developer` | 14/14 · 100% |
| **Govern** | 8 | `govEstate`, `verify`, `changeRule`, `destroy`, `quarantine`, `release`, `govSetup`, `succession` | 8/8 · 100% |
| **Prove** | 6+1 | `ask`, `shapes`, `memos`, `memoDetail`, `receipts` (auth + public forms), `trail`, `recipient` | 7/7 · 100% |
| **Team** | 1 | `team` | 1/1 · 100% |
| **TOTAL** | **33 + public** | **34** | **100%** — full coverage of Surfaces v2 taxonomy |

**Conclusion:** the demo IS the visual/UX realisation of the Surfaces v2.0 amendment. The 33-screen + public-receipt inventory landed in this prototype is what the Owner ratified at Surfaces v2 §A1.

## §5 Visual language

### §5.1 Palette (extracted from inline CSS)

**Base (cream backgrounds):** `#F3F2E9` (primary), plus 15 near-cream tints for cards, panels, and section fills (`#D5D2C6`, `#E3E1D3`, `#E7E4DC`, `#E9EDDC`, `#ECE9E1`, `#EEF1EF`, `#EFEEE2`, `#EFF3E6`, `#F0EEE7`, `#F1EFE8`, `#F2F0E9`).

**Navy family (headings, wordmark, primary text):** `#101E30` (deepest), `#16304F` (wordmark), `#1A2C44`, `#1E3A5F`, `#22344B`, `#3A4F6B` (mid-tones). Also `#8FA8C4` (light navy tint for illustrations).

**Blue tints (informational cards, secondary panels):** `#DEE4EC`, `#EDF0F4`, `#EDF1F6`, `#F2F5F8`, `#F3F6FA`.

**Oxblood family (accents, refusal states, warnings):** `#8C3A34` (primary accent), `#2a1215` (deepest, for muted warning text). Splash uses `#7E3038`.

**Sage/olive family (muted labels, secondary buttons, agricultural sector cues):** `#8A8F7C` (splash), `#6B7C3E` (deeper sage — potentially for positive/measured states).

**Amber/gold (attention, pending, calibration):** `#B07C2A` (single instance in extracted CSS; likely used for pending / not-yet-measured states).

### §5.2 Typography

- **Wordmark:** Georgia serif at 210px in the splash SVG. This is the brand mark.
- **Section headings inferred:** Georgia serif family or a similar transitional serif (based on splash consistency).
- **Body / UI labels:** system sans-serif stack `-apple-system, BlinkMacSystemFont, sans-serif` — matches the design law's professional register per Surfaces v1.0 §1.
- **Loading indicator / diagnostics:** system sans at 13px, muted grey (`#666`, `#999`).

### §5.3 Layout patterns (from extracted string content)

Extracted heading strings suggest the following recurring card patterns:

- **Action rows:** "Actions" · "Add source" · "Cancel" · "Cancel before it applies" · "Cancel run" · "Cancel this succession" · "Close" · "Break it down" — decisive verbs, one action per row (matches Surfaces v1.0 §2.1 answer position rule and the refusal action-triplet pattern).
- **Status labels:** "Active" · "Approved by" · "Available" · "Commissioned" · "Commissioned as" · "Completed runs" · "Composite" — measured, past-tense, class-with-claim discipline visible.
- **Evidence labels:** "Aggregation floor" · "Answer reference" · "Artifact" · "Attribution fidelity" · "Base" · "Batches" · "Branch Interaction Logs" · "Branch code" · "Candidates considered" · "Certificate" · "Change history" · "Checks" · "Checks performed" — quality-matrix vocabulary (Attribution fidelity ∈ Quality Rule Book §19) visible; Change history + Checks performed match the ledger/trust-receipt rendering.
- **Domain labels:** "Complaints intelligence product" — a product-shaped label rather than a screen-shaped label, suggesting the demo carries at least one product-instance narrative.

### §5.4 Design law compliance (spot check)

- **Design law §1** (no surface mirrors internals): the extracted labels are all business-language (Aggregation floor, Approved by, Cancel this succession). No engineering internals (no "callback", "handler", "controller") visible. **Consistent.**
- **§2.1** (class with claim; refusal in the answer position): the "Break it down" / "Cancel" / action-triplet vocabulary is present. **Consistent.**
- **§2.6** (agent-assumed marking): would require running the demo interactively to verify agent-supplied values carry their marker; not attempted per Owner's do-not-modify instruction. **Not observed at grep level.**
- **§2.7** (plain language): all extracted labels pass the plain-language test. **Consistent.**

## §6 Deltas vs currently-built React frontend

Current React frontend routes (from `/app/frontend/src/App.js`):

| Route | Maps to demo view | Status |
| --- | --- | --- |
| `/` (AskConsolePage) | `ask` | Built ✓ |
| `/auth/login`, `/auth/register` | (auth is outside module taxonomy) | Built ✓ |
| `/trace`, `/trace/:traceId` | `receipts` (public form) | Built ✓ |
| `/operator`, `/operator/commission`, `/operator/commit-review/:sessionId` | `wizard` + `approvals` (partial mapping) | Built ✓ (subset of `wizard` + `approvals`) |
| `/engineer/register`, `/engineer/first-call`, `/engineer/administer`, `/engineer/onboarding` | `developer` | Built ✓ (partial — 4 sub-pages vs demo's single `developer`) |
| `/master-admin`, `/master-admin/change-a-rule/:ruleId`, `/master-admin/audit-trail` | `govSetup` + `changeRule` (partial) | Built ✓ (subset) |
| `/compliance`, `/compliance/prove`, `/compliance/prove/:traceId`, `/compliance/retention`, `/compliance/rulebook` | `govEstate` + `verify` + `trail` (partial) | Built ✓ (subset of Govern module) |
| `/extraction/console`, `/extraction/registry-admin` | `registry` + `runs` (partial) | Built ✓ (subset) |
| `/opportunity-briefs` | `opportunities` | Built ✓ |

**Currently-built React frontend covers ~9 of 34 demo screens** (with subset coverage on several). The demo's:

- `connect` (Connect module) — **not built** in React
- `sourceProfile` (Registry) — **not built**
- `useData` (Use Data module home) — **not built as a module home** (Extraction Console + Registry Admin are subset)
- `wizard` full three-door (Export/License · Train a Model · Integrate an App) — **only Export/License door built** via CommissionWizardPage
- `objectives`, `shape`, `testbed` (Use Data) — **not built**
- `runs`, `runDetail`, `trainingRun` (Use Data) — **not built**
- `models`, `modelDetail`, `intel`, `artifact` (Use Data model shelf + intelligence + deliverables) — **not built**
- `verify`, `destroy`, `quarantine`, `release`, `succession` (Govern) — **not built** (partial: retention rulebook writer exists)
- `shapes`, `memos`, `memoDetail`, `recipient` (Prove — how answers come back, memo shelf) — **not built**
- `team` (Team module) — **not built**

Additionally, the current React frontend uses a **role-flavoured route structure** (`/operator/*`, `/engineer/*`, `/master-admin/*`, `/compliance/*`, `/extraction/*`) whereas the demo uses a **module-flavoured single-shell structure** with role-based *landings* (per Surfaces v2 §A3 six-role landing table). This is a shell-architecture delta:

- **Current React frontend:** each role has its own sub-tree (path-namespaced).
- **Demo (Surfaces v2 ratified):** one shell, one navigation, role determines landing but any role can navigate to any module they have scope on.

## §7 Implications for future Phase 3 Stage A

**Do not act on any of this in Phase 1.** Recording for the Phase 3 Stage A file when it's written:

1. **Shell rebuild.** Phase 3 rebuilds the shell to the module-flavoured Surfaces v2 taxonomy. Current role-flavoured routes migrate to module routes; role-based landings redirect on first login.
2. **Screen build order (per FB-17 from Builder Prompt):** milestone capture + Commission View first → journey completion (FB-9..FB-16) → integration settings. Full ordering awaits `AKKI_OS_FRONTEND_BRIEF_v2.md` (currently MISSING — see `docs/rulings/frontend_brief_v2_missing_2026-07-30.md`).
3. **Palette adoption.** The cream + navy + oxblood + sage + amber palette is the ratified target. Current React frontend uses default Tailwind hues; a token layer (Tailwind theme extension) lands in Phase 3 Stage A.
4. **Typography adoption.** Georgia (or transitional serif) for headings + wordmark; system-sans for body. Current frontend uses system-sans throughout; the shift is a Phase 3 concern.
5. **Binding copy (Surfaces v2 §A5-1).** Zero of Surfaces v1.0 Appendix A's verbatim strings appear in this demo. Per Owner ruling, they are **suspended**, not lapsed. Phase 3 screens carrying refusal / freeze / retention / counter-signature copy ship with the copy slot marked open until Owner rules per string.
6. **Data Engineer role (Surfaces v2 §A5-2).** Demo lands `connect` as the ratified Connect module home; Surfaces v2 says Data Engineer's landing is `connect` — but Data Engineer role's capability boundary is undefined pending Owner. Phase 3 lands Data Engineer as an alias of Master Admin until A5-2 rules.

## §8 What this file does NOT do

- Does not modify the running React frontend.
- Does not amend Surfaces v1.0 or v2.0.
- Does not invent binding copy from the demo (per Owner's Phase 1 scoping).
- Does not fill FB-* content (per HAZARD-STOP at `docs/rulings/frontend_brief_v2_missing_2026-07-30.md`).
- Does not commit the demo HTML to `docs/mandates/` (no binding copy detected → Owner-instruction path is `docs/product/`; this file lives beside the HTML there).

## §9 File location on disk

Following Owner instruction (*"treat it as a design/visual reference for the product surfaces: store under docs/product/ (or docs/mandates/ if it carries binding copy)"* and *"zero of the verbatim strings appear in the prototype"* per Surfaces v2 §A5-1), the demo lands at:

`/app/docs/product/Akki_v4_Standalone.html`

This analysis note lives at:

`/app/docs/product/akki_v4_demo_frontend_analysis_2026-07-30.md`

The Companion Docs manifest (`docs/mandates/AKKI_OS_COMPANION_DOCS_MANIFEST.md`) is updated with the new path in the same session.

— End of analysis. —
