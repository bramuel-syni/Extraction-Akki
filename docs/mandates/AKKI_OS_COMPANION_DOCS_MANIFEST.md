# Companion Docs Manifest — Builder Prompt / Surfaces v2 Amendment / Design Prototype

**Date:** 2026-07-30.
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` (dispatch cycle 2) STEP 2.
**Purpose:** SHA-256 and content summaries for three companion artefacts committed alongside the pack.

---

## Files committed

| # | Filename | Location | SHA-256 | Content class |
| --- | --- | --- | --- | --- |
| 1 | AKKI_OS_BUILDER_PROMPT.md | `docs/mandates/AKKI_OS_BUILDER_PROMPT.md` | cfc90afca1016a6dfeb48beebfdcab2a2d518ed7098d5bc3fa0c26e31946219e | Builder handover prompt (canonical for session opening) |
| 2 | AKKI_OS_SURFACES_v2_AMENDMENT.md | `docs/mandates/AKKI_OS_SURFACES_v2_AMENDMENT.md` | 8db9e62c4aa2c2a4ead1788267286c79383f7296147b646461c739ebe08f1bdd | Surfaces v1.0 supersession (partial); UX ratification |
| 3 | Akki_v4_Standalone.html | `docs/product/Akki_v4_Standalone.html` | 7d6e442b40ceaea206ba935e5809d2a3cc5205408bc2136308f20d902bfe353b | Design prototype (ratified aesthetic/flow reference) |

**Note (Owner clarification 2026-07-30):** the demo HTML was relocated from `docs/mandates/` to `docs/product/` per Owner instruction. Owner re-uploaded the file at a new URL (`.../artifacts/quizxega_...`); diff against the first URL (`.../artifacts/ar17z2zy_...`) shows **byte-identical content** (SHA `7d6e442b…` unchanged). No supersession — the two URLs resolve to the same bytes. Because zero verbatim strings from Surfaces v1 Appendix A appear in the prototype (Surfaces v2 §A5-1), it carries no binding copy and lives under `docs/product/` rather than `docs/mandates/`. Detailed content analysis (34 view IDs mapping to Surfaces v2 §A2 six-module taxonomy at 100% coverage; palette + typography + design-law compliance; delta vs current React frontend) at `docs/product/akki_v4_demo_frontend_analysis_2026-07-30.md`.

## Content summaries and implications

### 1. AKKI_OS_BUILDER_PROMPT.md (83 lines · 3.6 KB)

**Purpose:** the builder's session-opening prompt. Names four canon documents in authority order and lists the FIRST ACTIONS every session must complete.

**Authority order stated (verbatim §“THE ARTIFACTS, AND THEIR AUTHORITY ORDER”):**

1. AKKI_OS_BUILD_DISPATCH_v1.md — the plan (phases, gates, canon corrections, standing rules, AC-1..AC-6).
2. AKKI_OS_SURFACES_v2_AMENDMENT.md — amends Surfaces v1.0 by supersession. Governs frontend structure.
3. **AKKI_OS_FRONTEND_BRIEF_v2.md** — governs frontend content gaps (commissioning envelope, Commission View, gap filing, journey-completion punch list FB-4..FB-16, gate cells FB-18). **THIS DOCUMENT WAS NOT SUPPLIED IN THIS DISPATCH.** See HAZARD-STOP below.
4. Akki_v4_Standalone.html — ratified design prototype (structure, naming, aesthetic, flow). Prototype not spec.

**Conflict-handling rule reiterated:** *"On any conflict among these, or between any of them and existing code: HAZARD-STOP and surface it with citations. Never self-resolve. (SR-3.)"*

**FIRST ACTIONS (§ verbatim):** commit the nine-document pack + docs 1–3 above under `docs/mandates/akki_os_pack_v1/` with SHA-256 manifest (AC-4); write BUILD_JOURNAL reconciliation entry (AC-6); amend Canon Register (CC-1); file the registry/validator conflict as a ruling request (CC-2); write P1 and P2 Stage A proposals; reconcile the check count (CC-3).

**BUILD ORDER (§ verbatim):** Phase 1 custody closure → Phase 2 Stage A V1 extraction on BCR §3.1 → Phase 3 in parallel behind Phase 2's wait (Memory Service mechanics first, then frontend per FB-17).

**STANDING DISCIPLINE:** rebuild context from disk at session start (AC-5); every phase opens with on-disk Stage A + closes with on-disk close report (AC-1); rulings land as files same-day (AC-2); new functions register 11-field row before landing (AC-3); no trial modes / observe-first for known mechanics; verdicts never curated (SR-2); unrepresentability tested by break-in (SR-4); no figure quoted before measured on real material (SR-5).

**OPEN ITEMS PARKED WITH OWNER (§ verbatim):** Topology A/B + HS2 ratification (OT-1); binding copy disposition per string (A5-1); Data Engineer role one-sentence mandate (A5-2); registry/validator schema ruling (CC-2 — **now RULED**, see `docs/rulings/registry_dependencies_mandatory_optional_2026-07-30.md`); Memory-before-V1 swap (dispatch orders evidence first).

**Implications for the current dispatch cycle:**

- Confirms every action already executed in the 2026-07-30 dispatch cycle. No conflicts with prior work.
- **Does NOT change Phase 1 scope.** Phase 1 remains: custody closure per dispatch §3.
- **Introduces Phase 3 scope framing** via the FB-17 milestone-capture-then-Commission-View-then-journey-completion order.
- **Reinforces D-11 discipline** at session start: rebuild context from disk, never from summary.

### 2. AKKI_OS_SURFACES_v2_AMENDMENT.md (118 lines · 5.9 KB)

**Purpose:** Owner ruling (July 2026) supersedes named sections of Surfaces v1.0. **Amends Phase 3 scope.** Not blocking for Phase 1.

**Superseded from v1.0:**
- Four-console taxonomy (v1.0 §5) → **six modules** (Connect, Registry, Use Data, Govern, Prove, Team).
- Twenty-screen inventory (v1.0 §6) → **thirty-three screens + one public receipt page**.
- Five-role set (Engineering Spec §28) → **six roles**, adding Data Engineer (landing = `connect`).
- Screen-to-console mapping → module map (§A2 table).

**Preserved from v1.0 at full authority (§A6):** design law (§1), global rules §2.1–§2.8 (with §2.7 plain-language rule scope-narrowed to exclude developer screens), three motions (§4), four designed states (§8), shell rule (§9), feature inventory (Part X) as capture checklist, journeys (Part IX) as completion targets.

**Reconciliations recorded (§A4):**
- **A4-1** Ask surface placement (Prove tab, Analyst landing) vs application-boundary privilege (no privileged path) — both hold; placement changed, architecture did not. Day-zero success remains defined on the two dashboards (registry + govEstate), not on ask.
- **A4-2** Checker seam inside one Govern module — dual control survives as a flow property (loosening changes enter pending counter-signature by the second identity; direction symmetry binds on identity, not on module).
- **A4-3** Commission View lands inside Use Data. Specified in FRONTEND BRIEF v2.0 FB-4/FB-5. **This document is not on disk** (see HAZARD-STOP).

**Open items put to Owner (§A5) verbatim:**
- **A5-1 Binding copy** — zero of Surfaces v1.0 Appendix A's verbatim strings appear in the prototype. Disposition required per string (ratify verbatim / revise / retire). **Suspended, not lapsed** — the builder implements none and invents no substitutes; screens carrying refusal / freeze / retention / counter-signature copy ship with the copy slot marked open.
- **A5-2 Data Engineer role** — enters canon *conditionally*. Its capability boundary against Master Admin (who owned source connection in v1.0) and Operator is undefined. Owner supplies the one-sentence mandate; the role then gets its registry row (R4) and its landing stands. Absent that sentence within the frontend Stage A window, Data Engineer renders as a landing alias of Master Admin.

**Implications for the current dispatch cycle:**

- **Phase 1 UNAFFECTED.** Phase 1 is custody + startup, no frontend module reshape.
- **Phase 3 scope AMENDED.** When Phase 3 lands, it targets the six-module taxonomy + 33-screen inventory + six-role set, with the Data Engineer landing = Master Admin alias until A5-2 is ruled, and copy slots open until A5-1 is ruled per string.
- **Canon Register §11 (role reconciliation) requires amendment** to reflect module taxonomy governs the build; roles are landings.
- **P2 Stage A UNAFFECTED.** P2 is the V1 extraction backend/perception build; no frontend module reshape.

### 3. Akki_v4_Standalone.html (391 lines · 15+ KB embedded design)

**Purpose:** ratified design prototype. Owner has ratified its structure, naming, aesthetic, and flow (Surfaces v2 §A1).

**Class:** design reference; **not a specification.** Where it is silent or conflicts with the three governing documents (dispatch + Surfaces v2 amendment + FRONTEND BRIEF v2), the documents govern.

**Content shape (verified by reading the HTML source):**
- Bundled single-file page (HTML + inline CSS + embedded SVG splash + JavaScript module bundle).
- Splash screen shows the wordmark "Akki" + accent bar + "V4" letter-spaced (colours: cream `#F3F2E9` background, deep navy `#16304F` wordmark, oxblood `#7E3038` accent bar, sage `#8A8F7C` label). Georgia serif for wordmark; Helvetica sans for labels.
- Fonts: `-apple-system, BlinkMacSystemFont, sans-serif` for the shell body; Georgia / Helvetica as noted above.
- Loading indicator ("Unpacking...") and no-JS notice both present.
- The full interactive prototype loads via a JavaScript bundler (module JavaScript in the tail of the file).

**Implications for the current dispatch cycle:**

- **Phase 1 UNAFFECTED.**
- **Phase 3 target aesthetic ratified:** cream / navy / oxblood / sage palette; Georgia for wordmark, Helvetica for labels, system-sans for body. The colour tokens are recorded here for the eventual frontend Stage A: `bg-primary: #F3F2E9`, `text-primary: #16304F`, `accent: #7E3038`, `muted: #8A8F7C`.
- **Referenced by Surfaces v2 §A1 as the ratification input** for the 33-screen taxonomy.

## HAZARD-STOP — AKKI_OS_FRONTEND_BRIEF_v2.md missing

Builder Prompt line 14 names **`AKKI_OS_FRONTEND_BRIEF_v2.md`** as document #3 in the authority order. Surfaces v2 §A4-3 relies on it explicitly (*"Specified in FRONTEND BRIEF v2.0 FB-4/FB-5"*).

**This document was NOT supplied in the 2026-07-30 dispatch STEP 2 fetch bundle.** The three URLs supplied were:

- BUILDER_PROMPT.md — supplied ✓
- SURFACES_v2_AMENDMENT.md — supplied ✓
- Akki_v4_Standalone.html — supplied ✓
- (FRONTEND_BRIEF_v2.md — **not in the fetch bundle**)

Per dispatch SR-3 and Builder Prompt §“THE ARTIFACTS” verbatim rule, this is filed as a HAZARD-STOP class item at `docs/rulings/frontend_brief_v2_missing_2026-07-30.md`. **NOT self-resolved.**

**Blocks:** Phase 3 Stage A. Does NOT block Phase 1 or Phase 2 Stage A (both are backend-scope).

— End of companion docs manifest. —
