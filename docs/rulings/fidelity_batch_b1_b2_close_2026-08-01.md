# Batch B1 (shell foundation) + B2 (Registry landing) — CLOSE REPORT

**Cycle:** Frontend fidelity defect cycle (Owner ruling 2026-08-01)
**Batches closed:** B1 (shell foundation) + B2 (Registry as default landing)
**File of record:** `/app/docs/mandates/Akki_v4_Standalone.html` · SHA `2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba`
**Testing agent report:** `/app/test_reports/iteration_28.json` · **12/12 PASS · 90 assertions · zero bugs · retest_needed=false**
**Frontend:** 21 suites · 204 passed · 3 skipped · 0 failed
**Backend:** 1208 passed · 1 skipped · 0 failed · **parity 36/36 held constant** (no new frozen contracts)

---

## Owner directive verbatim carried

> "The front end is built exactly as Akki_v4_Standalone__1_.html (sha256 2ab55d9f…, commit beside the canon). Every page: identical typography, layout, spacing, composition, section order, and flow."
>
> "Ship B1 (shell foundation) + B2 (Registry, the prototype's default landing) first, then HOLD for Owner review at the preview before B3-B10 proceed."

## What landed in B1 · shell foundation

- **New file `AkkiV4Shell.jsx`** — persistent 216 px left sidebar + 66 px rich header, per prototype tokens extracted from the file of record:
  - Wordmark cell 216 px wide, wordmark 'Akki' in Newsreader 26 px `#16304F`, tagline 'AI & Data Use / Operating System' in Instrument Sans 9.5 px letter-spacing 0.16em uppercase `#8A8F7C`.
  - Breadcrumb strip (`{module} / {page}` computed from `useLocation`), Instrument Sans 13 px.
  - Auth strip folded into the "Viewing as" pill slot — anon renders Sign in + Create account (Owner-decided fidelity live-data affordance for iter27 P0 auth); signed-in renders `Viewing as {email} {role-label} Sign out` inside the prototype's pill shape.
  - Census pill `Census #4 · Jul 21` (SAMPLE-marked fixture).
  - Ask Akki dark CTA (`#101E30` / `#EAE7DD`, radius 8 px) — disabled with a title tooltip pointing to Batch B7 when the drawer lands.
  - Notifications icon (36 × 36 white square, border `#E7E4DC`).
  - 216 px sidebar `#EFEEE2` with six-item Canon nav in prototype order (Connect · Registry · Use Data · Govern · Prove · Team), active state background `#E6E5D6`, weight 600 on active, 500 on inactive.
  - Sidebar bottom role tile (32 × 32 avatar `#1E3A5F` with initials, email, Canon-safe role label, Sign out button).
- **New file `AkkiV4ShellLayout.jsx`** — React Router layout route that wraps children in `AkkiV4Shell`.
- **Extended `akkiv4_design_system.js`** with `AKKI_V4_PROTO` + `AKKI_V4_PROTO_TYPE` tokens (bg `#F3F2E9`, card `#FFFFFF`, sidebar `#EFEEE2`, dark UI `#101E30`, wordmarkInk `#16304F`, heroInk `#131F30`, navy `#1E3A5F`, maroon `#7E3038`, sage `#8A8F7C`, borders `#E3E1D3`/`#E7E4DC`/`#C9D2DF`, semantic success/warn/refuse). Fonts: Instrument Sans (UI) · Newsreader (hero) · Spline Sans Mono (mono).
- **Updated `AkkiShell.jsx`** with `NestedInAkkiV4ShellContext` — the legacy inner shell now suppresses its own header + wordmark when rendered inside `AkkiV4Shell`, eliminating the transitional double-chrome. Every existing module page (Connect, Govern, Prove, etc.) renders cleanly inside the new outer shell without needing per-page rework.
- **Rewrote `App.js`** — all in-app routes now live under `<Route element={<AkkiV4ShellLayout />}>`. Root `/` redirects to `/registry` (the prototype's default landing). Auth routes (`/auth/*`) and public trace lens (`/trace`) remain unshelled with their light chrome. Every legacy route redirect unchanged.
- **Updated `public/index.html`** — Google Fonts swapped from Inter/JetBrains Mono to Instrument Sans + Newsreader + Spline Sans Mono per file of record.
- **CanonOSShellPage six-tile grid RETIRED** from the live tree (file kept as salvage-only until batch B10 final).

## What landed in B2 · Registry V4 (prototype fidelity)

- **New file `RegistryV4Page.jsx`** — replaces `RegistryWhatYouHoldPage` as the `/registry` route (old page kept at `/registry/legacy` as salvage).
- Prototype fidelity composition, top-to-bottom:
  1. **Hero row** — pre-hero label 'WHAT YOU HOLD' (SAMPLE-marked); Newsreader 34 px composed sentence 'Milele Bank holds `86.4 TB` across `12 sources` — `78% measured`, with `6 opportunities` standing ready.' with underlined facts (`#C9D2DF`) and maroon opportunities link (`#7E3038` / underline `#E3CDC7`); helper line 'Every figure on this page traces to a census measurement. First census May 12, 2026 · Census #4 run Jul 21 by J. Mwangi · How the estate is measured'; navy 'Run census' button on the right.
  2. **Tab strip** — 'The measure' (default active with 2 px bottom underline) · 'The record'; both matching prototype spacing.
  3. **Measure tab** — 6-tile stat strip (Volume · Sources · Types · Rings · Rights · Measured) with Newsreader 30 px values and secondary notes; composition grid at the exact prototype ratio `1.5fr : 1fr` with LEFT: view select ('By language' / 'By data type' / 'By rights') + 5 composition bars + hatched-territory legend; RIGHT: 'WHAT IT CAN DO' pre-label + at least two dark-navy 'Put this to work' CTAs.
  4. **Record tab** — 'The estate, item by item' 8-column table (Source · Data type · Size · Languages · Rights · Condition · Last measured · Extracted) with SAMPLE rows including one 'hatched' condition rendered with the diagonal-pattern chip (never zero).
- Live-data policy: `useRegistryData` hook fetches `/api/registry/what_you_hold` + `/api/registry/opportunity_briefs` **only when a token is present** (anon visitors see the SAMPLE fixture per Canon AS-U2; no console-noise 401s).

## Testing agent verdict (12/12 PASS)

| # | Item | Verdict |
|---|---|---|
| 1 | B1 · CHROME · Anon visitor lands at /registry with full header + sidebar | PASS |
| 2 | B1 · SIGN-IN INTEGRITY · Admin round-trip works; signed-in strip renders MASTER ADMIN | PASS |
| 3 | B1 · FRESH REGISTRATION · Viewer role, no role literal leak | PASS |
| 4 | B1 · SIDEBAR NAVIGATION · All 6 modules route correctly, no double-chrome | PASS |
| 5 | B2 · REGISTRY V4 LANDING · Hero + census helper + Run census button | PASS |
| 6 | B2 · REGISTRY V4 TABS · Measure/Record active-state + hatched chip | PASS |
| 7 | B2 · REGISTRY V4 MEASURE PANEL · Stat strip + 1.5fr:1fr composition grid + What-it-can-do | PASS |
| 8 | REGRESSION · Retired-vocab gate clean on all 8 routes | PASS |
| 9 | REGRESSION · Existing routes render inside new shell without double-chrome | PASS |
| 10 | REGRESSION · Backend health parity 36/36 | PASS |
| 11 | REGRESSION · UI-1-E revoked SAMPLE row visible | PASS |
| 12 | REGRESSION · Registry tile in new sidebar clickable | PASS |

**Investigation notes** (four initial test-script artifacts, none app defects):
- `AI & Data Use` renders correctly (HTML entity-encoded in source, decodes at render).
- Anon module visits (/connect, /use-data, /govern) render honest 'NOT AUTHORISED · auth_missing' inside the shell (227/273/305 chars) — correct role-gating, not a white screen.

## Parity gate row flips

Standing gate at `/app/frontend/src/__tests__/fidelity/per_page_parity_checklist_gate.test.js`:
- **Root · Landing composition** → `PASS` (was FAIL)
- **Root · Chrome** → `PASS` (was FAIL)
- **Root · Auth strip** → `DEVIATION_LIVE_DATA_ONLY` (unchanged; explicitly Owner-approved iter27)
- **Registry · Hero** → `PASS`
- **Registry · Census idle/running** → `DEVIATION_LIVE_DATA_ONLY` (fixture rendered as SAMPLE; live census-start seam lands in a future sub-batch)
- **Registry · Tabs** → `PASS`
- **Registry · Measure stat strips** → `PASS`
- **Registry · Composition grid 1.5fr:1fr** → `PASS`
- **Registry · Item-by-item table** → `PASS`
- **Registry · Artifact detail** → still `FAIL` · deferred to a Registry sub-batch (B2.b) after Owner sign-off on B1+B2

## Owner-facing preview

- Anon: https://governance-scan-3.preview.emergentagent.com/ → auto-redirect to `/registry` shows the file-of-record chrome + Registry V4 landing.
- Signed-in as admin: same URL with the pill flipped to `Viewing as admin@rms.example.com MASTER ADMIN Sign out`.
- Sidebar navigation walks all six modules through the new shell.

**Owner hold:** B3–B10 do NOT proceed until the Owner has verified B1+B2 at the preview. Awaiting steer.

## What's still open (scheduled, not started)

- **B2.b** · Registry `/registry/artifact/:id` prototype-fidelity page (breadcrumb + hero + Contents table) — scheduled to land alongside Batch B3 or as a small standalone if the Owner requests it.
- **B3** · Connect batch.
- **B4** · Use Data batch (absorbs CD-3.1 In-progress/Ready + commissions view retirement + baseline capture per Track B).
- **B5-B6** · Govern batches.
- **B7** · Prove batch (includes Ask Akki drawer wired from the header).
- **B8** · Team batch.
- **B9** · `/memory` + `/master-admin/*` retirement (CD-3.2) + `/api/ask` wire (CD-3.3).
- **B10** · Final side-by-side + roll-up.
- Tracks C/D/E backend-parallel — not touched in this cycle.

## Standing rules carried forward

- Parity 36/36 held constant (frontend-only cycle).
- Retired-vocab gate + sample-marking gate + auth-strip P0 gate all held green.
- No new frozen contracts introduced.
- Every visual token traces to `AKKI_V4_PROTO` + `AKKI_V4_PROTO_TYPE` in `akkiv4_design_system.js` — no hard-coded hex or font-family in the new shell/Registry files.
