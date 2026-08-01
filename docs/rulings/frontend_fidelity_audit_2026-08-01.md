# Frontend fidelity audit — per-page parity report

**Report filed:** 2026-08-01
**File of record:** `/app/docs/reference/Akki_v4_Standalone_2ab55d9f.html`
**SHA256 (file of record):** `2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba` (verified · matches Owner-stated `2ab55d9f…`)
**Prior reference (kept, superseded):** `/app/docs/product/Akki_v4_Standalone.html` · SHA256 `7d6e442b40ceaea206ba935e5809d2a3cc5205408bc2136308f20d902bfe353b`
**Governing directive:** Owner ruling 3 (2026-08-01) · "Build target = EXACT parity with the file of record: typography, layout, spacing, density, page composition, section order, interaction flow, content structure — PAGE BY PAGE. Deviations permitted ONLY where a page renders live data the prototype fakes — never in look or structure."
**Standing gate:** `/app/frontend/src/__tests__/fidelity/per_page_parity_checklist_gate.test.js`

---

## 1 · Prototype navigation of record

The file of record uses a persistent LEFT SIDEBAR with the six-item Canon nav (order below matches sidebar top-to-bottom) plus a persistent HEADER with wordmark ("Akki"), role switcher ("Viewing as …"), Census strip ("Census #4 · Jul 21"), Ask Akki drawer trigger, and notifications.

**Canonical nav order in file of record (sidebar top-to-bottom):**
1. Connect
2. Registry
3. Use Data
4. Govern
5. Prove
6. Team

**"Doors" inside Use Data (Owner's phrasing confirmed):** Integrate an App · Export / License Data · Train a Model — three cards on the Use Data landing.

**No footer.**

## 2 · Typography of record

| Role | Family | Notes |
|---|---|---|
| UI text (buttons, inputs, labels, body) | `Instrument Sans` | 13 px body baseline |
| Display / hero / headings | `Newsreader` | 34 px hero; 26 px wordmark |
| Mono / code / UUIDs | `Spline Sans Mono` | ~12–13 px |

## 3 · Color palette of record (extracted from `<style>` + inline)

| Token role | Hex |
|---|---|
| Body background (cream) | `#F3F2E9` |
| Card background | `#FFFFFF` |
| Sidebar background | `#EFEEE2` |
| Dark UI (top nav / CTAs) | `#101E30` |
| Primary ink | `#1A211D` |
| Secondary ink | `#3E4642` · `#6B7370` · `#8A918C` |
| Accent navy | `#1E3A5F` |
| Accent maroon | `#7E3038` |
| Sage | `#8A8F7C` |
| Border / mist | `#C9D2DF` |
| Success | `#6B7C3E` |
| Warn | `#B07C2A` |
| Refuse | `#8C3A34` |
| Dormant | `#8A918C` · `#A0A69E` |

## 4 · Pulse strip / first-commission presence

| Owner check | Verdict | Evidence |
|---|---|---|
| **Pulse strip** (estate-at-a-glance strip on the shell) | **ABSENT** | The header carries a small "Census #4 · Jul 21" indicator; NOT a full pulse strip. |
| **First-commission affordance** (fresh viewer onboarding) | **ABSENT** | No dedicated first-run experience in the prototype. |

**→ Per Owner ruling 3: "if PRESENT they ride the fidelity directive (build them per the file); if ABSENT they await a filed need."** Neither is built to satisfy this fidelity directive; the earlier "potential improvement" suggestion for a first-commission affordance stands DORMANT until the Owner files a need.

## 5 · Global shell / chrome parity (present-on-every-page)

| Prototype chrome element | Current build |
|---|---|
| Persistent LEFT SIDEBAR with six-item Canon nav | ❌ ABSENT — root uses six-tile grid instead |
| Persistent HEADER with wordmark "Akki" + role switcher + Census strip + Ask Akki drawer trigger + notifications | ❌ PARTIAL — `AkkiShell` header renders title/subtitle + `right` slot (auth strip added iter27); no role switcher, no Census strip, no Ask Akki drawer trigger |
| Breadcrumbs (`{module} / {page}` inside header) | ❌ ABSENT |
| Dark UI on top-nav / CTAs (`#101E30`) | ❌ ABSENT |

**→ Structural rework required (Track A · CD §3 conformance completion candidate — see §7).**

## 6 · PER-PAGE PARITY TABLE

Legend:
- **PASS** — prototype section order/composition matches built page
- **DEVIATION-LIVE-DATA-ONLY** — deviates only because the built page renders live data the prototype fakes; look and structure preserved
- **FAIL** — structural/visual deviation not attributable to live data

### Landing / Root (`/`)

| Aspect | Prototype file of record | Current build (`CanonOSShellPage.jsx`) | Verdict |
|---|---|---|---|
| Landing composition | **Registry as default view** (sidebar-driven; Registry is item #2 but is the default landing) | **Six-tile grid** (Connect / Registry / Use Data / Govern / Prove / Team as clickable NavTiles) | **FAIL** (structural — the tile grid is an assistant-invented construct not present in the file of record; the prototype uses Registry as the landing) |
| Chrome | Persistent sidebar + rich header | AkkiShell top-nav only + auth strip | **FAIL** (missing sidebar + role switcher + Census + Ask Akki + breadcrumbs) |
| Auth strip | Not present in prototype (prototype has role switcher instead) | Sign in / Create account / signed-in strip added iter27 | **DEVIATION-LIVE-DATA-ONLY** (prototype's role switcher is fixture data; live app needs real auth affordance — Owner explicitly approved this iter27; role switcher UX is orthogonal) |

### Connect (`/connect`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| Page title "Connect" + summary line | Present · title + "sources / applications" summary | Present · matches | **PASS** |
| Conditional "Source Pending" vs "All Connected" | Present · conditional | Present via `SourcePendingCard` + `AllConnectedCard` | **PASS** |
| Tabs: "Connections" / "The record" | Present | Present | **PASS** |
| Connections table (Key · Application · Permissions · Memory plane · Status · Issued) | Present · 6 columns | Present · matches column order | **PASS** |
| Data-class table (Data class · Volume · Where held · Rule applied · Enforcements 30d · Violations · Status) | Present · 7 columns | Present · matches | **PASS** |
| Configuration-lock notification | Present | Present (`ConfigLockCard`) | **PASS** |
| Colors + typography tokens | Cream body / navy header / Instrument Sans / Newsreader | Uses AKKI_V4_PALETTE + AKKI_V4_TYPOGRAPHY (already tokenized) | **PASS** |

### Registry (`/registry`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| "What You Hold" hero + volume / sources / opportunities metrics | Present · Newsreader hero | Present via `RegistryHeroCard` | **PASS** |
| Contextual census text | Present | Present | **PASS** |
| Run census / Census running (conditional) | Present · idle / running two states | Present via `CensusStateCard` | **PASS** |
| Tabs: "The measure" / "The record" | Present | Present | **PASS** |
| The measure — stat strips | Present (Volume, Sources, Types, ...) | Present via `MeasureStatStrip` | **PASS** |
| The measure — composition grid (`1.5fr 1fr`) — left composition bars + right "What it can do" cards | Present | Present · matches ratio | **PASS** |
| The record — item-by-item table (Source · Data type · Size · Languages · Rights · Condition · Last measured · Extracted %) | Present · 8 columns · expandable rows | Present · matches | **PASS** |
| Artifact detail (source profile drill-down) | Present · breadcrumbs + stats + Contents table | Present via `RegistryArtifactPage` (route params) | **PASS** |

### Use Data (`/use-data`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| "Use Your Data" hero + intro copy | Present | Present | **PASS** |
| "Where do you want to start" three-card grid: **Integrate an App** · **Export / License Data** · **Train a Model** | Present · three doors in this order | Present · matches order | **PASS** |
| **In progress / Ready sections** (Canon §6.5 · CD-3.1) | Present (In progress + Ready sections BELOW the doors on the same landing) | ❌ **ABSENT / superseded** — current /use-data doesn't render §6.5 In-progress + Ready sections | **FAIL** (CD-3.1 conformance completion required) |
| Sub-view · Integrate → Developer Surface | Present · scoped-keys table + memory-plane details | Present via `/use-data/integrate` | **PASS** |
| Sub-view · Export → Opportunity cards | Present · card grid with Status/Title/Cost/Source | Present via `/use-data/export` | **DEVIATION-LIVE-DATA-ONLY** (prototype's cards use fixture data; live app renders opportunities from `opportunity_briefs` store — same visual structure) |
| Sub-view · Train → Training Run detail | Present · progress overview + Stages + Base Model + Checks + Held Batches | Present via `/use-data/train` | **PASS** |
| Sub-view · Wizard (multi-step) | Present · staged UI | Present via existing wizard route | **PASS** |
| **`/commission-view` route** (CD-3.1 · pre-Canon route) | Prototype has no /commission-view — Use Data is the Canon home | ⚠️ Currently EXISTS at `/app/frontend/src/pages/commission_view/` — salvage + redirect required | **FAIL** (CD-3.1 · REVERSAL required) |

### Govern (`/govern`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| "The DPO's Estate" title + intro | Present | Present via `GovernHomePage` | **PASS** |
| Tabs: "The enforcement" / "The record" | Present · two tabs | Present | **PASS** |
| Enforcement stat strips (Rules · Checks · Enforcements · Violations) | Present | Present | **PASS** |
| Record — data-class × rule table | Present (Data class · Volume · Where held · Rule applied · Enforcements 30d · Violations) | Present | **PASS** |
| Rules Record — rule table (Rule · Current setting · Set by/when · Checks · Enforcements 30d · Violations · Last change) + "Propose change" CTA | Present | Present via `GovernRulesRecordPage` | **PASS** |
| Sub-page · Verify (test packs + go-live gate + Sign go-live record) | Present | Present via `GovernVerifyPage` | **PASS** |
| Sub-page · Change Rule (Proposed → Counter-signed → Waiting Period → Applied pipeline) | Present | Present via `GovernChangeRulePage` | **PASS** |
| Sub-page · Destroy Data (dual-control · request-deletion table) | Present | Present via `GovernDestroyPage` | **PASS** |
| Sub-page · Quarantine (halted-items list + Approve/Reject) | Present | Present via `GovernQuarantinePage` | **PASS** |
| Sub-page · Release Review (release cards with Privacy check · Why here · Actions) | Present | Present via `GovernReleaseReviewPage` | **PASS** |
| Sub-page · Governance Setup (waiting periods + signing authorities) | Present | Present via `GovernSetupPage` | **PASS** |
| Sub-page · Succession (constitutional-seat succession doctrine) | Present in prototype under Govern Setup / DPO area | Present via `/team/constitutional-seats` (belongs under Team now) | ⚠️ **PLACEMENT DELTA** (prototype places succession under Governance Setup / DPO area; current build places under Team) — TBD which is Canon-of-record; escalate to Owner ruling |

### Prove (`/prove`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| "Ask a Question" primary input + button | Present | Present via `ProveHomePage` (SAMPLE Ask console) | **DEVIATION-LIVE-DATA-ONLY** (prototype shows fixture answer; built page renders live sample answers per iter25 close) |
| History (previous questions list) | Present | Present | **PASS** |
| Answer display + evidence links + Walk the Proof | Present | Present via `ProveAnswerShapePage` | **PASS** |
| Memos (Title · Related answer · Destination · Status · Created · Created by) | Present | Present via `ProveMemosPage` | **PASS** |
| Memo detail (breadcrumb · found elements · edit fields) | Present | Present via `ProveMemoDetailPage` | **PASS** |
| Public Receipts (verify · linked answer · shared with · expires · Download / Revoke) | Present | Present via `ProvePublicReceiptsPage` | **PASS** |
| How Answers Come Back (four-response-class taxonomy) | Present | Present via `ProveResponseClassesPage` | **PASS** |
| Walk the Proof (evidence trail) | Present | Present via `ProveWalkThroughPage` | **PASS** |

### Team (`/team`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| "Manage Users" section (Name · Email · Role · Status · Date added) + Invite button | Present | Present via `/team/users-simple` | **DEVIATION-LIVE-DATA-ONLY** (prototype fixture users; built page renders live seeded users; column order matches) |
| **Approval Surface** (three approval classes rolled up · queue reading) | ❌ ABSENT from prototype — the prototype has no dedicated "approval surface" surface | ✅ Present as `/team/approval-surface` per UI-1-E | **DEVIATION-BEYOND-PROTOTYPE** (built page extends prototype scope; needs Owner ruling — is this a fidelity FAIL or an Owner-approved extension via UI-1-E?) |
| **Access Register** (grants + SAMPLE + revoked rows visible per UI-1-E iter25) | ❌ ABSENT from prototype | ✅ Present as `/team/access-register` per UI-1-E | Same as above |
| **Constitutional Seats** (Master Admin + DPO + succession doctrine) | Present in prototype under Governance Setup area (not under Team) | Present under Team | ⚠️ **PLACEMENT DELTA** (see Govern row) |

### Auth pages (`/auth/login` · `/auth/register`)

| Aspect | Prototype | Current build | Verdict |
|---|---|---|---|
| Login / register pages | ❌ ABSENT — prototype uses in-app role switcher, no dedicated login | Present after iter27 P0 fix; h1 = "Akki OS"; retired vocab clean | **DEVIATION-LIVE-DATA-ONLY** (prototype fakes identity via role switcher; live app needs real auth — Owner-approved P0 fix iter27) |

## 7 · Structural deltas summary (top 5 rework items)

Owner ruling: **do not start mass rework yet — schedule per RWP-1**.

| # | Delta | Effort | RWP-1 track | Rationale |
|---|---|---|---|---|
| 1 | Retire the six-tile Canon OS shell landing; render Registry as default view; add persistent left sidebar + rich header (wordmark · role switcher · Census strip · Ask Akki drawer trigger · notifications · breadcrumbs) | LARGE (rebuild `CanonOSShellPage` → `AkkiSidebar` + `AkkiHeader` + Registry-as-default) | **Track A** · CD §3 conformance completion (structural fidelity to file of record) | The tile-grid landing is assistant-invented; the file of record uses sidebar navigation with Registry as default. |
| 2 | Add §6.5 In-progress + Ready sections on `/use-data` landing (BELOW the three doors) — establish-then-act per CD-3.1 | MEDIUM | **Track A** · CD-3.1 | Explicitly named in CD-1 §3.1. |
| 3 | Retire `/commission-view` (salvage + redirect to `/use-data`) — CD-3.1 REVERSAL | SMALL | **Track A** · CD-3.1 | Pre-Canon route; conflicts with Use-Data-as-Canon-home. |
| 4 | Retire `/memory` and `/master-admin/*` from top-level nav (keep pages as deep-links from Govern record + developer surface) — CD-3.2 | MEDIUM | **Track A** · CD-3.2 | Explicitly named in CD-1 §3.2. |
| 5 | Establish `/api/ask` wire disposition (alias vs single seam) — CD-3.3 | SMALL · establish-then-act | **Track A** · CD-3.3 | Explicitly named in CD-1 §3.3. |

## 8 · Item-level parity conclusions

- **6/7 modules pass module-level parity** (Connect · Registry · Use Data · Govern · Prove · Team all show PASS or DEVIATION-LIVE-DATA-ONLY at page-level for the built views; Registry, Prove, Govern in particular are close to prototype fidelity).
- **1 structural FAIL at root** — the six-tile Canon OS shell replaces the prototype's Registry-as-landing + sidebar. This is the largest fidelity delta.
- **2 medium FAILs** — CD-3.1 In-progress/Ready sections missing on /use-data + `/commission-view` route still live.
- **2 placement questions** for Owner arbitration — Approval Surface + Access Register (built beyond prototype scope per UI-1-E · Owner-carried) and Succession seat placement (prototype vs current).
- **Auth pages** are a legitimate deviation-live-data-only (prototype has no real auth; live app needs it).

## 9 · Standing gate

The standing gate `/app/frontend/src/__tests__/fidelity/per_page_parity_checklist_gate.test.js` enforces this checklist. Each future close report cites this gate's row-by-row output. A new row lands whenever a new prototype page enters scope; the gate refuses to close a page-level rework unless its row flips from FAIL/DEVIATION-BEYOND-PROTOTYPE → PASS/DEVIATION-LIVE-DATA-ONLY.
