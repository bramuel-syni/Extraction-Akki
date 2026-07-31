# OWNER CHANGE ORDER — Canonical Amendment Package · 2026-07-25

**Class:** Owner-verbatim ruling set · eight amendments (A1–A8) · sibling pattern throughout.
**Filing procedure (applies to every amendment):** each lands as a **sibling file** under `docs/mandates/module_specs/` (or `docs/governance/` where marked), predecessor byte-identical; SHA into `docs/mandates/MANIFEST.md`; `phase_source_requirements.yaml` extended; corresponding Substrate-Drop v3 CONFLICT rows annotated **RESOLVED by this order** with the amendment ID. This order itself files at `docs/rulings/owner_change_order_2026-07-25.md` and is not builder-modifiable.
**Sequencing:** A1–A8 land **before UI-1 Stage A** and before any Lane 2b module phase is banded. The Lane 2b re-band consumes this order's post-amendment canon, not the pre-amendment specs. Nothing here alters the EAB sequence, Parity discipline, or Lane 1 (still zero builder motion; OD-4 · 9.2-OWN-2 · PH-R2/R4 remain Owner-side).
**Interpretation rule:** where an amendment conflicts with pre-amendment canon, the amendment wins. Where an amendment is silent, pre-amendment canon stands. The UI prototype and the design brief are **reference artifacts, not spec carriers** — normative force lives only in filed canon.

---

## A1 · Use Data Module Specification (supersedes the filed Extract module spec's surface layer)

### A1.1 Nav restructure
The module formerly named **Extract** is renamed **Use Data**. Nav order: Connect · Registry · **Use Data** · Govern · Prove · Team. The Use Data landing is an **intent router** with exactly three doors:
1. **Integrate an App** — applications and agent workflows on governed intelligence.
2. **Export / License Data** — produce and ship datasets under the rights they carry.
3. **Train a Model** — train on the estate; use the result in an app or export it.
There is no fourth door. Below the doors, the landing shows the shared pipeline in user language per A1.4.

### A1.2 Conversational wizard (ruled 2026-07-25; supersedes the staged-flow text "single full page, progressive disclosure")
All three doors open the **same conversational wizard**, schema pre-seeded per door.
- One dialogue surface; the former stages are the **schema behind the conversation, not screens**. The agent asks only for what the dialogue hasn't established, in conversational order.
- Split view once substance exists: conversation right (~60%), live cards left (~40%): **Reflection card** (need · scope · evidence floor · rights · output form; each field `set` / `open` / `assumed default`) · **Intel cards** (holdings, condition, languages, reusable stock, projected coverage, gaps stated plainly) · **Plan preview card** (volume range · expected coverage · non-coverable scope · cost range · editable budget ceiling with "the run halts at the ceiling; nothing past it is billed") · **Sample results card** (observed vs planned) · **Commission card**.
- **Governance line (verbatim, binding): conversation shapes; the card commits.** Every governed value — evidence floor, rights posture, budget ceiling, price/acceptance — is confirmed on the structured Commission card; none is inferred from dialogue and silently committed. The Objective Service contract is identical beneath both interaction shapes; the schema is the same schema.
- **Entries unchanged:** Registry opportunity and Prove gap-queue entries open the same conversation pre-seeded, Reflection card partial.

### A1.3 Test Bench
The Test Bench is **not a door and not a screen**. Its capability lands as a **conversation branch**: the agent offers parameter testing on a sample; accepting opens a Test card (parameters → observed quality and cost per 1,000); every test run receipted; a winning configuration promotes into the Reflection card in one action.

### A1.4 User-facing pipeline vocabulary
General users see two sections: **In progress** (commissioned work: plain status, cost against ceiling, holds rendered as **"Held for a check"** with plain-language reason — quarantine honesty preserved verbatim) and **Ready** (finished artifacts, each carrying **Use in an app / Export**, rights-checked at the point of click; blocked attempts state "this attempt is receipted"). The **Train-a-Model output fork lives at the Ready artifact**, not in the wizard. Internal vocabulary (My Objectives, Run Tracking, Extracted Intel) is retired from the general-user surface; the underlying objects and their detail views persist beneath the new vocabulary.

### A1.5 Role gating
Model Acceptance decisions (and the A2 hold-resolution surface) are approver/DPO-role surfaces, absent from the general-user nav. Govern remains DPO-scoped; Public Receipt generation remains DPO-only.

### A1.6 Developer Surface
The Developer Surface is the **post-commission management view of an Integrate-an-App item** (scoped key · webhook · event type · status · usage strip · "every call lands in the record the DPO reads"), reached from the item's row — not a nav module. The "identical terms to internal use; no lighter-weight path for machines" doctrine is preserved verbatim.

### A1.7 Reference renames
"Shape this objective" → **"Put this to work"** (Registry opportunity CTA). "Queue this gap" retains its name (already user-language). "Extend scope" retains its behavior: re-opens the conversation on scope; additions always generate a new quote cycle. Cancel: no reason required; references quote cancellation terms; completed work retained.

### A1.8 UI-2 grammar binding (carried forward)
The split-view conversational grammar and the shapes/commits line extend to any commissioning dialogue in the Integration Console at UI-2; key issuance, webhook, and event configuration remain structured surfaces. Specifics ruled at UI-2 Stage A.

---

## A2 · Approval Inversion (supersedes Extract Journey 2)

### A2.1 Deletion
The standing **Approval Queue** (pre-run human approval of every commissioned objective) is deleted. The **Run/Commission Approver** role is retired. The status **"Awaiting approval"** is removed from the lifecycle. The Approval Queue notification category is dropped.

### A2.2 Admissibility gate (replacement)
Every commission is evaluated at the **Commission card**, machine-checked, fail-closed, verdict receipted:
1. **Rights compatibility** — requested delivery/output rights vs. source usage rights (Internal-Only scope cannot feed a licensable output; a trained model inherits its training-data rights).
2. **Privacy floor** — requested scope satisfies the configured group-size floor.
3. **PII posture** — masking/pseudonymization rules (incl. Class D registries per A3) resolvable over the scope.
4. **Budget ceiling** — present, positive, within org limit where configured.
5. **Scope resolvability** — every referenced source Connected and censused.
**Outcomes:** all-pass → runs immediately ("In progress"). Any fail → **refused at the card, in dialogue, specific rule named** (a refusal, not a queue). Pass-with-flag (declared flag conditions only) → **"Held for a check,"** resolved by the single-person pattern (Quarantine's), by the DPO or delegate. Anything unclassifiable → holds. Every verdict (pass/refuse/hold) is receipted and feeds the DPO Estate's enforcement counts.

### A2.3 Seventh governance rule — Commission auto-run ceiling (Class O)
Added to Connect Step 3: numeric + currency, recommended default per org, **∞ permitted**. Commissions at/under the ceiling auto-run when rule-clean; above it, the commission holds for a **single DPO countersign** (the reserved "Pending policy check" state). Changeable only via Change-a-Rule (two approvals + waiting period + certificate + Verify-the-Rules).

### A2.4 Preserved gates (explicit non-scope)
**Release Review** (everything leaving the org) and **Model Acceptance** (human quality judgment over the six checks) are untouched by this amendment. "Remove approval" must not be read expansively.

### A2.5 User-story delta (summary; full delta in A7)
Struck: Approver approve/return stories. Amended: run-tracking stories to the In-progress vocabulary. New: admissibility-refusal story; held-for-check story; ceiling-countersign story.

---

## A3 · Rules Taxonomy (new governance specification · files under `docs/governance/rules_taxonomy_v1.md`)

### A3.1 Four classes, one shape
All governance objects share one **Rule Record** schema (`class` field: S/O/E/D) and appear in the DPO Estate with enforcement counts. Lifecycle differs per class along **change authority × change velocity × verification method**:

| Class | Name (UI) | Develop | Deploy | Operate | Verify |
|---|---|---|---|---|---|
| **S** | **Rails** | Authored as code + contract; promise-registered | Build phase only: Parity seal, AST cells, CI green; never runtime-editable | Not operable — observable only (Estate, read-only, enforcement counts) | The test suite; a rail without a hard-fail cell does not exist |
| **O** | **Rules** | Defined in spec: type, bounds, recommended default | Set at Connect, locked at sign-off | Change-a-Rule only: propose → counter-sign → waiting period → applied → certificate → Verify-the-Rules fires | Live test packs, per rule, DPO-signable |
| **E** | **Engine settings** | Declared in engine spec **with success parameters** (in force with known conditions of success, or it is a spec gap — never tentative) | Pinned per engine version; changes ride version bumps with evaluation verdicts | Engineers, via versioned deployment; Estate shows per-engine per-version, read-only | Version-bump evaluation verdict (BM-class) |
| **D** | **Registries** | Schema defined once; a Class S or E rule references the registry **by version** | Initial load at Connect or first upload | §A3.3 lifecycle | Validation report + sample probe pack (live redaction confirmation on drawn entries) |

### A3.2 E→O promotion (the only path to runtime tunability)
Proposal-gated and one-way per event: engine owner files a promotion note (parameter · why runtime tunability · blast radius) → parameter enters Class O via spec amendment (type, bounds, recommended default) → leaves engine-pinned config at the **next engine version bump** → thereafter changes only via Change-a-Rule. Until promotion completes, no runtime edit exists. Demotion O→E requires the same ceremony. No third path; "it's just an engine setting" is not a route around Class O.

### A3.3 Class D lifecycle (governed reference data — e.g., the shield-against registry)
Upload (Excel/CSV) → schema validation (row-level errors, **fail-closed on malformed**) → **diff view: added / removed / changed** → confirm → versioned, receipted, effective-from stamped, rollback available. Every run records the registry **version in force** (audit answers "was this term protected on date X"). **Asymmetry (Owner-ruled): additions take effect immediately; removals AND edits require approval** (counter-sign or configured waiting window) — the only edits that can weaken protection are the ones that gate.

### A3.4 Classification of existing objects (initial register)
Rails (S): masking-before-AI-call · fault-never-refusal · single-ingress · fail-closed license default · five_rings zero-mutation · admissibility evaluator machinery (A2.2). Rules (O): the six Connect rules · both waiting periods · the A2.3 ceiling · admissibility thresholds. Engine settings (E): dedupe fingerprint distance · VAD threshold · batch windows · sample-rate/window constants · EAB-3 §5.5 defaults (partition-shape enum · refresh cadence · eviction policy · latency-telemetry storage · AC-A5.b latency budget). Registries (D): shield-against/pseudonymization registry · protected-terms lists · DPO extraction filter lists.

---

## A4 · Govern Module Amendments

1. **Estate:** the Rules Record surface shows all four classes in force (class column), each with enforcement counts (30d) and violations; Rails and Engine settings read-only; Rules link to Change-a-Rule; Registries link to A4.2. Admissibility verdicts (A2.2) feed the enforcement/violation counts.
2. **New submodule — Registries:** the Class D operating surface (upload → validate → diff → confirm → version history → rollback → probe-pack results). Additions immediate; removal/edit approvals surface here using the existing single-approval pattern. This is the routine-operator surface (e.g., Synisense) and must remain spreadsheet-simple.
3. **UI names confirmed:** Rails · Rules · Engine settings · Registries.
4. Quarantine's single-person resolution pattern is reused verbatim for A2.2 holds; resolution states reflect back onto the In-progress item.

---

## A5 · Connect Module Amendments

1. Step 3 gains the **seventh rule** (A2.3), same control grammar (numeric + unit, recommended default helper text, permanence note).
2. Step 4 (or a new Step 4b) permits **declaring Class D registries** at setup: name, schema class (pseudonymize/redact/filter), initial upload optional; deferred initial load permitted (registry exists empty, fail-closed until first load).
3. Post-signoff home lists declared registries with version + last-updated chips.

---

## A6 · Prove Module (cross-reference only — already landed)
The Step-4 "Response Shapes" sibling amendment (fault-never-refusal) and deferred bindings **DB-1** (specific wire reason renders in the honesty strip on evidence-can't-support) and **DB-2** (companion-channel failure never converts a refusal into a fault render) stand as filed under `eab_2_hazard_stop_a_ruling_2026_07_24`. This order adds nothing and reissues nothing; Lane 2b's Prove phase executes DB-1/DB-2 as gate cells.

---

## A7 · User Stories Delta (sibling to the filed User Stories artifact)

**Struck:** "As a Run/Commission Approver, I can approve or return a commissioned objective…" and any story referencing the Approval Queue as a general gate.
**Amended:** Analyst shaping stories → conversational-wizard phrasing ("by describing what I need in a conversation, watching the objective form as I speak"); tracking stories → In progress / Ready vocabulary; Extracted-Intel browsing story → Ready.
**New:** (1) As any user, I can enter through Integrate an App / Export-License Data / Train a Model and reach the same governed conversation pre-set for my intent. (2) As any user, when my commission violates a rule, I am refused at the Commission card with the specific rule named, so I never wait on a queue to learn the answer. (3) As a DPO, I resolve held commissions from one surface, so exceptions get one reviewer instead of every run getting one. (4) As a DPO, commissions above the auto-run ceiling wait for my countersign, so scale of spend keeps a human in the loop by rule, not by queue. (5) As an operator (e.g., Synisense), I update a protection registry by uploading a sheet, reviewing the diff, and confirming — with removals and edits requiring approval — so protection stays current without ceremony and never weakens silently. (6) As a DPO, every run records the registry version in force, so I can prove what was protected on any date. (7) As an engineer, I change engine settings only through version bumps with evaluation verdicts, and promote a setting to a Rule when it genuinely needs runtime control. (8) As a model trainer, I watch training progress, held-out evaluation, and the six checks compute live, and my accepted model appears in Ready carrying its inherited rights, where I choose to integrate or export it.

---

## A8 · Cross-Cutting Record

1. **Prototype/design-brief status:** `Akki_v2_Standalone.html` and the UI-v3 design brief are reference artifacts; normative force lives in filed canon only.
2. **Deferred binding carried:** the "Pending policy check" chip's flow = A2.3 countersign; UI builds the state per A2.3; no other semantics attach.
3. **Open Owner-side items carried visibly, undischarged by this order:** OD-4 (9.2b proceed) · 9.2-OWN-2 (archive access) · PH-R2/R4 (managed DB/store · production destination) · OD-8 (mail provider) · OD-9 (public-receipt exposure posture) · OD-10 (scheduler primitive — Registry census + Connect scope; EAB-3 partition refresh explicitly excluded per its Tier-3 record).
4. **EAB-3 cross-reference:** `PartitionSchema@v0` sealed per Owner ruling (a1), Parity 32→33; its §5.5 defaults register as Class E under A3.4 with content unchanged.
5. **Estimation discipline:** any banding generated from this order carries the provisional-anchor label verbatim; Lane 2b re-band generates from post-amendment canon + the Substrate-Drop v3 rows as annotated by this order.

---

## Execution instruction to builder

One doc-only atomic: file A1–A5, A7, A8 as siblings (A3 under `docs/governance/`), annotate CONFLICT rows, extend MANIFEST + `phase_source_requirements.yaml`, land a close report with the D-1..D-11 self-audit table, echo all SHAs. Zero product code in this atomic. On close, D-9 resumes the ratified sequence; Lane 2b banding may then generate from post-amendment canon.

**END OF CHANGE ORDER**
