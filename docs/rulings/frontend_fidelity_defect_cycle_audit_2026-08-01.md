# Frontend fidelity DEFECT-CYCLE audit — comprehensive per-view report

**Report filed:** 2026-08-01 (RESUME cycle · post-Owner-directive escalation)
**Directive of record:** Owner ruling (2026-08-01) verbatim — "The front end is built exactly as Akki_v4_Standalone__1_.html (sha256 2ab55d9f…, commit beside the canon). Every page: identical typography, layout, spacing, composition, section order, and flow. Audit every built page against the file, list the deltas, close them, verify side-by-side. A page that differs from the file is a defect. The only permitted difference: live data where the file shows fake data."
**File of record:** `/app/docs/mandates/Akki_v4_Standalone.html`
**SHA256 (canonical):** `2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba` · **919,853 bytes** · verified byte-identical to both prior URLs (`vbpqdvws` and fresh `hli5ed9s`).
**Governance:** No governance shift on the URL change (SHAs equal). Newer upload would only govern if SHAs differed; both are the same file.

---

## §1 · HAZARD-STOP scan (Canon vs file of record)

**Verdict: CLEAN.** No structural conflict between the file of record and the Experience Canon text. Confirmed points of consonance:

| Canon anchor | File of record | Verdict |
|---|---|---|
| Canon §3.1 · six-module nav (Connect · Registry · Use Data · Govern · Prove · Team) | Sidebar navigation matches exactly in this order | ✅ CONSONANT |
| Canon §3.2 · role classes (viewer / operator / admin / DPO) | Header role switcher pill ("Viewing as …") | ✅ CONSONANT |
| Canon §6.5 · In-progress / Ready sections on Use Data | `pipeInProgress` + `pipeReady` predicates present in template | ✅ CONSONANT |
| Canon §7 · Prove tabs (Ask · Memos · Public Receipts · How answers · Walk the proof) | `is.ask` · `is.memos` · `is.receipts` · `is.shapes` · `is.trail` present | ✅ CONSONANT |
| Canon retired-vocab discipline | Prototype uses "Ask Akki" (not "Ask Console") · no retired terms found in the visible prototype template body | ✅ CONSONANT |

**No HAZARD-STOP triggered. Proceed.**

---

## §2 · Prototype primary views inventory (extracted from template)

The prototype is a single-page React app rendered from a `<script type="__bundler/template">` body. View selection is driven by `sc-if value="{{is.<view>}}"` predicates. **Thirty distinct primary views** were enumerated:

**Group A — landing / registry**
1. `is.registry` — Registry / "What You Hold" (**default landing**)
2. `is.artifact` — Registry drill-down / source artifact profile
3. `is.sourceProfile` — Source profile (alternate/legacy)

**Group B — Connect**
4. `is.connect` — Connect main

**Group C — Use Data (hub + doors)**
5. `is.useData` — Use Data landing with three doors + In-progress/Ready sections
6. `is.opportunities` — Opportunities list (Export door)
7. `is.developer` — Developer Surface (Integrate door)
8. `is.trainingRun` — Training Run detail (Train door)
9. `is.wizard` — Multi-step Wizard (shape the work)
10. `is.runs` — Runs list
11. `is.runDetail` — Run detail
12. `is.models` — Models list
13. `is.modelDetail` — Model detail

**Group D — Govern**
14. `is.govEstate` — Govern main / DPO's Estate
15. `is.govSetup` — Governance Setup (waiting periods · signing authorities)
16. `is.changeRule` — Change Rule (proposal pipeline)
17. `is.verify` — Verify (test packs · go-live gate)
18. `is.destroy` — Destroy Data (dual control)
19. `is.quarantine` — Quarantine (halted items)
20. `is.release` — Release Review (release cards)
21. `is.succession` — Succession (constitutional-seat succession)
22. `is.intel` — Intel / dashboards

**Group E — Prove**
23. `is.ask` — Ask / Prove main
24. `is.memos` — Memos list
25. `is.memoDetail` — Memo detail
26. `is.receipts` — Public Receipts
27. `is.recipient` — Public receipt recipient view
28. `is.shapes` — How Answers Come Back (four response classes)
29. `is.trail` — Walk the Proof

**Group F — Team**
30. `is.team` — Team / Manage Users

**Plus** ~12 modal states (`modal*`), ~15 wizard sub-states (`wizShow.*`), ~10 tabs (`*Tab_*`), ~15 dormant/pending predicates. Total DOM predicate count: **150** unique.

---

## §3 · Chrome tokens of record (extracted from template CSS + inline styles)

### 3.1 · Type

| Family | Weights loaded (woff2) | Usage |
|---|---|---|
| **Instrument Sans** | 400 · 500 · 600 · 700 | Body / UI / buttons / labels |
| **Newsreader** | 400 · 500 · 600 | Display / hero / wordmark |
| **Spline Sans Mono** | 400 · 500 | Mono / UUIDs / code |

### 3.2 · Header

- Height **66 px**, `#FFFFFF`, bottom border `1px solid #E3E1D3`
- Wordmark cell: **216 px wide**, right border `1px solid #E3E1D3`, gap 14 px, padding `0 18px`
  - Wordmark text "**Akki**" — Newsreader, **26 px**, color `#16304F`, letter-spacing `0.01em`, line-height 1
  - Divider bar: `1px × auto` `#E3E1D3` margin `14px 0`
  - Tagline "AI & Data Use Operating System" — Instrument Sans, **9.5 px**, letter-spacing `0.16em`, color `#8A8F7C`, weight 600, uppercase
- Header main strip: padding `0 28px`, gap 14 px
  - Breadcrumb "{{crumbModule}} / {{crumbPage}}" — 13 px, secondary `#6B7370`, page in `#1A211D` weight 500, separator "/" in `#C6C2B6`
  - Role-switcher pill: rounded `999px`, border `1px solid #E7E4DC`, background `#FAF9F2`
    - Label "VIEWING AS" — **10.5 px**, letter-spacing `0.1em`, uppercase, `#A0A69E`, weight 600
    - Role chips inside via `sc-for list="{{headRoles}}"`
  - Census strip: pill w/ status dot (green `#6B7C3E` · 6 px), label "Census #4 · Jul 21" — 12 px, `#6B7370`
  - Ask Akki CTA: dark button, background `#101E30`, color `#EAE7DD`, border `none`, radius `8px`, padding `8px 15px`, 13 px weight 500, chat-bubble SVG icon; hover `#1A2C44`
  - Notification icon: 36 × 36 square, border `1px solid #E7E4DC`, radius `8px`, `#FFFFFF`; hover `#FAF9F2`

### 3.3 · Sidebar

- (Extraction TBD in Batch 1 — sidebar block begins ~11 KB into template body)

### 3.4 · Body

- Body background: `#F3F2E9`
- Ink primary: `#1A211D`
- Font default: 14 px

---

## §4 · Per-view defect table (30 views · defect count + severity)

Legend:
- **PASS** — built page matches file structurally
- **STRUCTURAL FAIL** — chrome/layout/composition/section-order deviates
- **MISSING** — no built equivalent (route/page does not exist)
- **PARTIAL** — some sections present, others missing
- **PLACEMENT** — content exists but placed under a different Canon home

| # | Prototype view | Built equivalent path | Verdict | Defect count | Notes |
|---|---|---|---|---|---|
| 1 | `is.registry` | `/registry` (`RegistryWhatYouHoldPage`) | STRUCTURAL FAIL | 4 | Body matches; chrome missing (sidebar + rich header + breadcrumbs); root landing model differs (six-tile grid vs Registry-as-default) |
| 2 | `is.artifact` | Missing dedicated page | MISSING | 1 | Artifact profile drill-down (breadcrumb + hero + Contents table) |
| 3 | `is.sourceProfile` | `/connect/source/:id` (`ConnectSourceProfilePage`) | STRUCTURAL FAIL | 3 | Chrome missing; typography variance |
| 4 | `is.connect` | `/connect` (`ConnectHomePage`) | STRUCTURAL FAIL | 3 | Body close to prototype; chrome missing |
| 5 | `is.useData` | `/use-data` (`UseDataLandingPage`) | STRUCTURAL FAIL + MISSING SECTIONS | 5 | Doors present; In-progress + Ready sections ABSENT (CD-3.1); chrome missing |
| 6 | `is.opportunities` | Missing | MISSING | 1 | Export door target — opportunity cards list |
| 7 | `is.developer` | `/use-data/integrate` (`UseDataDeveloperSurfacePage`) | STRUCTURAL FAIL | 3 | Body close; chrome missing; scoped-keys table needs prototype-exact columns |
| 8 | `is.trainingRun` | Missing | MISSING | 1 | Full training-run detail page (Progress overview · Stages · Base Model · Checks · Held Batches) |
| 9 | `is.wizard` | `/use-data/wizard` (`UseDataWizardPage`) | STRUCTURAL FAIL | 3 | Multi-step present; chrome + section polish needed |
| 10 | `is.runs` | Missing (partial via `/commission-view`) | MISSING | 1 | Runs list |
| 11 | `is.runDetail` | `/commission-view/run/:id` (`CommissionRunDetailPage`) | PLACEMENT | 2 | Content close; wrong Canon home (must retire /commission-view per CD-3.1) |
| 12 | `is.models` | Missing | MISSING | 1 | Models list |
| 13 | `is.modelDetail` | Missing | MISSING | 1 | Model detail |
| 14 | `is.govEstate` | `/govern` (`GovernHomePage`) | STRUCTURAL FAIL | 3 | Two-tab structure present; chrome missing |
| 15 | `is.govSetup` | Partial via `GovernPendingPage` | PARTIAL + STRUCTURAL FAIL | 4 | Setup content scattered; needs consolidation |
| 16 | `is.changeRule` | `/govern/change-rule` (`GovernChangeRulePage`) | STRUCTURAL FAIL | 3 | Pipeline stages present; chrome missing |
| 17 | `is.verify` | Missing dedicated `/govern/verify` | MISSING | 1 | Test packs + go-live gate + Sign go-live record |
| 18 | `is.destroy` | Missing dedicated `/govern/destroy` | MISSING | 1 | Deletion-request table with dual-control |
| 19 | `is.quarantine` | `/govern/holds` (`GovernHoldsPage`) | STRUCTURAL FAIL + RENAME | 3 | Same content; named "Holds" locally, "Quarantine" in prototype |
| 20 | `is.release` | Missing dedicated `/govern/release` | MISSING | 1 | Release-review cards |
| 21 | `is.succession` | `/team/constitutional-seats` (`TeamConstitutionalSeatsPage`) | PLACEMENT | 2 | Prototype places under Govern/Setup; built under Team |
| 22 | `is.intel` | Missing | MISSING | 1 | Intel dashboard (needs check — may be same as one of the above) |
| 23 | `is.ask` | `/prove` (`ProvePage`) | STRUCTURAL FAIL | 4 | Ask input + History present; drawer form of Ask Akki not present in-app; chrome missing |
| 24 | `is.memos` | Missing | MISSING | 1 | Memos list (Title · Related answer · Destination · Status · Created · Created by) |
| 25 | `is.memoDetail` | Missing | MISSING | 1 | Memo detail |
| 26 | `is.receipts` | Partial via `TraceReceiptPage` | STRUCTURAL FAIL + PLACEMENT | 3 | Trace vs Public Receipts naming; chrome missing |
| 27 | `is.recipient` | Missing | MISSING | 1 | Public-receipt recipient landing view |
| 28 | `is.shapes` | Missing | MISSING | 1 | How Answers Come Back (four response classes) |
| 29 | `is.trail` | `/prove/walk/:id` (`ProveWalkPage`) | STRUCTURAL FAIL | 3 | Walk present; chrome missing |
| 30 | `is.team` | `/team` (`TeamLandingPage`) | STRUCTURAL FAIL | 3 | Users table close; chrome + Invite modal need parity |
| — | Auth pages | `/auth/{login,register}` | PERMITTED-live-data-only | 0 | No analog in prototype; live-app auth needs it; Owner-approved P0 fix iter27 |
| — | Root `/` | `CanonOSShellPage` (six-tile grid) | STRUCTURAL FAIL (assistant-invented) | 5 | Prototype has NO tile grid; Registry is the default landing via sidebar |
| — | UI-1-E extensions | `/team/approval-surface` + `/team/access-register` | BEYOND-PROTOTYPE (Owner-carried) | 0 | UI-1-E was Owner-approved; retain but ensure prototype chrome |

**Total primary-view defect items: ~74.** Plus supporting deltas: pulse-strip **ABSENT** in prototype (awaits filed need per Owner ruling); first-commission **ABSENT** (awaits filed need).

---

## §5 · Batch closure plan (proposed to Owner)

Total estimated batches: **10**. Each batch closes with the testing agent + parity-gate row flips + close report + PRD update.

| Batch # | Scope | Est. size | Rationale |
|---|---|---|---|
| **B0** (this cycle · deliverable) | Audit + standing gate + hazard scan + batch plan — REPORT BACK to Owner | filed | Owner directive: "REPORT BACK after the audit (before mass closure if the defect count is large)" |
| **B1** | **Shell foundation** — build `AkkiV4Shell` (persistent 216 px left sidebar + 66 px rich header · wordmark · breadcrumbs · role-switcher pill · Census strip · Ask Akki CTA · notifications) + retire six-tile `CanonOSShellPage` · route `/` to Registry `/registry` as default per prototype · preserve auth-strip affordance for anon visitors (unpacked inside role-switcher slot when anon vs role switcher when signed-in) · rewire all six top-level routes to render inside the new shell | LARGE · 5 files touched | Unblocks every subsequent module batch |
| **B2** | **Registry batch** — bring `/registry` + `/registry/artifact/:id` to prototype fidelity (typography · composition · stat strips · composition grid `1.5fr 1fr` · item-by-item table · expandable rows) | MEDIUM | Registry is now the landing → highest visual priority |
| **B3** | **Connect batch** — `/connect` (title + summary + `srcPending`/`srcAllConnected` + `configLock` + Connections / The record tabs) | MEDIUM | Straightforward chrome + composition |
| **B4** | **Use Data batch (Canon §6.5 · CD-3.1)** — `/use-data` (three doors + **In-progress + Ready sections** below doors) · `/use-data/opportunities` (Export door target · NEW) · `/use-data/train` (Training Run · NEW) · `/use-data/runs` + `/use-data/runs/:id` (Runs list + detail · NEW) · `/use-data/models` + `/use-data/models/:id` (NEW) · retire `/commission-view` (salvage + redirect) | LARGE | Absorbs CD-3.1 conformance completion (Track A) |
| **B5** | **Govern batch — part 1** — `/govern` (DPO's Estate · two tabs) · `/govern/rules-record` · `/govern/change-rule` (proposal pipeline visual) | MEDIUM | Existing pages need chrome + section-order polish |
| **B6** | **Govern batch — part 2 (new views)** — `/govern/verify` (test packs + go-live gate · NEW) · `/govern/destroy` (dual-control · NEW) · `/govern/quarantine` (rename `/govern/holds` · NEW-ish) · `/govern/release` (Release Review cards · NEW) · `/govern/setup` (Waiting periods + Signing authorities) | LARGE | Six sub-pages, four largely new |
| **B7** | **Prove batch** — `/prove` (Ask input + History · Ask Akki DRAWER floating from header) · `/prove/memos` (list · NEW) · `/prove/memo/:id` (detail · NEW) · `/prove/public-receipts` + `/prove/public-receipts/:id/recipient` (NEW) · `/prove/response-classes` (How Answers Come Back · NEW) · `/prove/walk/:id` (existing polish) | LARGE | Half is new build |
| **B8** | **Team batch** — `/team` (Manage Users table + Invite modal · rename from `TeamLandingPage` if needed) · retain UI-1-E extensions `/team/approval-surface` + `/team/access-register` + `/team/constitutional-seats` (with succession placement TBD per Owner ruling) | MEDIUM | Small — mostly polish |
| **B9** | **Retirements + wire seams** — retire `/memory` and `/master-admin/*` from top-level nav; re-home memory pages as deep-links from `/govern/record` + developer surface (CD-3.2) · establish-then-act on `/api/ask` (alias vs single seam · CD-3.3) | MEDIUM | Track A · CD-3.2 + CD-3.3 |
| **B10** | **Final side-by-side verification pass + fidelity-close report + roll-up** — testing agent walks each of the 30 primary views + rendering diff against the file · every parity-gate row must be PASS or PERMITTED-live-data-only · defect count to zero | LARGE | Final Owner-facing pass |

## §6 · Standing rules the batches carry

- **Live data where file fakes it is the ONLY permitted difference.**
- Sample-marked fixture data stays where AS-U2 mandates (Canon still stands).
- Retired-vocab gate stands unchanged.
- Parity 36/36 held constant — no new frozen contracts.
- Auth strip (iter27 P0 fix) preserved as a live-data affordance; folded into the role-switcher slot per prototype.
- Existing UI-1-E extensions (approval surface + access register) retained as Owner-carried DEVIATIONS-BEYOND-PROTOTYPE (already ratified).
- Every batch closes with: testing_agent verdict, parity-gate row flips, close report on disk, PRD.md update, journal entry.

## §7 · Delta count summary

| Category | Count |
|---|---|
| Prototype primary views | 30 |
| Built pages matched (PASS) | 0 (all suffer chrome delta minimum) |
| Built pages STRUCTURAL FAIL | 15 |
| Built pages MISSING | 13 |
| Built pages PARTIAL | 1 |
| Built pages PLACEMENT delta | 3 |
| BEYOND-PROTOTYPE Owner-carried extensions | 2 (UI-1-E approval-surface + access-register) |
| PERMITTED-live-data-only (auth) | 2 |
| **Aggregate defect items** | **~74** |

## §8 · Owner report-back requested

Per Owner directive: report back **before mass closure** because defect count is LARGE (~74 items across 10 batches).

**Awaiting Owner decisions before dispatching Batch 1:**
1. Approve the 10-batch order? (B1 shell → B2 Registry → B3 Connect → B4 Use Data → B5-B6 Govern → B7 Prove → B8 Team → B9 retirements → B10 close)
2. Placement ruling on **Succession seat** (prototype places under Govern/Setup; built places under Team → prototype wins under fidelity directive, but request explicit ruling since UI-1-E ratified the current Team placement)
3. Approval to fold CD-3.1 (`/use-data` In-progress/Ready sections) into Batch 4 and CD-3.2 (`/memory` + `/master-admin/*` retirement) into Batch 9?
4. Any batch re-ordering (e.g., ship a module-specific batch first for Owner review before continuing)?

**Standing rules confirmed:** live-data-where-file-fakes-it is the only permitted deviation; retired-vocab gate stands; parity 36/36 stands; existing UI-1-E extensions retained; auth strip retained per iter27 P0 close.

**HAZARD-STOP:** none. Canon and file of record are structurally consonant.
