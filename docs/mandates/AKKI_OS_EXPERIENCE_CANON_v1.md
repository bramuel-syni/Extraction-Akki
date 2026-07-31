# AKKI OS — EXPERIENCE CANON v1.0
### The single point of reference for product experience · 2026-07-31

This document is the authority for what Akki is to the people who use it: the
operating model, the user classes, the navigation, every surface, every journey,
the design doctrines, and the vocabulary. It reconciles and supersedes as
experience authority: FRONTEND UI/UX BRIEF v1, owner change order A1–A8 (fully
absorbed), CONSOLIDATED DISPATCH v2 §3, and all prior frontend rulings. Source
documents remain on disk as provenance; none is cited as authority over this one.
Changes enter only by filed ruling and version bump. Normative language:
MUST / MUST NOT / MAY.

Reconciliation notes are marked ◆. Content owed from builder-held files is
marked SLOT-n and registered in §13 — a SLOT is a fold-in obligation, never a
build blocker.

---

## 1 · THE OPERATING MODEL

**1.1 The governing decision.** Akki does the specialist work; people hold
authority over it. The system performs the census, extraction, qualification,
masking, measurement, and record-keeping. People supply authority: someone
decides what the system is, someone defines the rules it enforces, someone sets
it up, someone directs what intelligence it produces. Akki does not distribute
labour into queues. No human is placed in the runtime path. Every experience
decision descends from this.

**1.2 The governance cycle — Define / Approve / Execute.**
- **Define.** The DPO defines the governance rules: masking policy, retention,
  rights ceilings, privacy floors, deletion requirements, and the approval
  criteria (thresholds of cost, sensitivity, rights class above which work
  escalates).
- **Approve.** The Master Admin approves the defined rule set and criteria —
  a single consequential act, not a recurring one.
- **Execute.** The system enforces the rules on every operation automatically.
  Permitted work runs. Work crossing a criterion is refused at the boundary
  with its reason stated. Every operation writes a receipt.

Updating a rule re-runs Define + Approve — never the work. Work completed under
a prior rule remains on the record with the rule version that governed it.

**1.3 The refusal grammar.** Two refusal shapes; the distinction is load-bearing.
- **Refused-escalatable.** Work crossing a criterion the organisation set. The
  refusal states the criterion, the value that crossed it, and routes to the
  approval surface. Someone can approve; the system says who.
- **Refused-absolutely.** Work barred by a condition no seat can lift
  (internal-only source feeding a commercial export; output below the
  aggregation floor; material under retention hold facing deletion). The
  refusal states the bar and its source: the licence class, the floor value,
  the hold instrument. It offers no approval route because none exists.
- **MUST:** an absolute refusal renders no approval affordance of any kind —
  not a disabled button, not a request-override link. An affordance implies
  approvability.
- A third shape — **fault** — is not a refusal (§8.1).

**1.4 Separation of duties (system-enforced).** The Operator cannot approve the
connection they built. The Analyst cannot approve their own over-threshold
work. The DPO defines rules but does not approve them. Enforced per-account
regardless of who the human behind the accounts is.

**1.5 Constitutional seats.** Master Admin and DPO. Succession requires an
out-of-band instrument (board resolution or equivalent) recorded to the ledger,
plus a counter-signature from the other constitutional seat. Neither seat may
appoint or remove itself, nor unilaterally the other. Vacancy is a declared
state: it appears on the Trust Center, and approvals requiring the vacant seat
queue rather than falling through. The system verifies the instrument exists,
is recorded, and is attributable — not its authenticity.

**1.6 Three duties that attach rather than classes.** Approve-to-run (human
confirmation before commissioned work executes — canon recommends against
enabling it for routine work); Release outbound (a person on deliverables
leaving the organisation); Confirm structured mappings (attaches to the
Operator by default).

**1.7 Three products, one governance record.**
- **Akki OS** — installed inside the enterprise perimeter: estate, engines,
  governance, extraction, production. Four classes work here.
- **Akki for Executives** — a separate application through which executives
  consume governed intelligence. Integrates via the OS memory-layer contract;
  holds a scoped key and memory plane. Every call lands in the record the DPO
  reads.
- **Customer Portal** — external self-service for parties that purchased
  intelligence. Reaches purchased deliverables and account records only.
◆ Both non-OS applications are commissioned by separate Owner dispatch; the OS
build does not scaffold them (Dispatch v2 §5.4).

---

## 2 · USER CLASSES (six)

A person MAY hold more than one class. Classes are authorities, not job titles.

| Class | Candidates | Holds | Home | Promise |
|---|---|---|---|---|
| **Master Admin** | CIO · CTO · CDO · Head of Data · executive sponsor | Consequential approval | Approval surface · Registry Dashboard · Access register | Nothing consequential happens without them; nothing trivial reaches them |
| **DPO** | DPO · CSO · Head of Compliance · Head of Risk · General Counsel | Rule definition + assurance | Trust Center · Rule definition · Ceremonies | Rules that enforce themselves; assurance verified, not told |
| **Operator** | Data engineer · platform engineer · IT ops lead · sysadmin | Execution setup | Connection console · Verification Runner · Integration console · Batch board | The system works as configured, and they can prove it |
| **Analyst / Scientist** | Analyst · data scientist · BI lead · research lead · external partner | Intelligence production | Extraction wizard · Analyze workspace · Model shelf · Registry | Material they can trust and models they keep |
| **Executive user** | CEO · CFO · NED · department head · anyone needing answers, not access | Nothing — no authority, none required | Akki for Executives (separate app) | An answer they can defend, without understanding the machinery |
| **Customer** (external) | A party that purchased intelligence, subscribed, or licensed a model | Their own account only | Customer Portal | — |

Never-does boundaries (binding):
- **Master Admin** never performs individual pulls, queries, application calls,
  or routine analysis. Repeatedly approving the same class of item means the
  criteria are too tight: redefine, don't grind.
- **DPO** never approves operations; not in the path of a pull, call, run, or
  training job.
- **Operator** never approves own connections/integrations (system refuses),
  never defines rules, never commissions production objectives.
- **Analyst** never builds extraction pipelines, masking, citation machinery,
  audit logging, or evaluation harnesses; never approves own over-threshold
  runs; never defines rules.
- **Executive** never sees estate configuration, governance rules, approval
  surfaces, extraction machinery, the model registry, or infrastructure. The
  absence is deliberate. They never wait for an approval and never encounter a
  governance control — everything they may do was settled when their
  application's objective was approved.
- **Customer** — query outside the customer's own account does not execute;
  enforced by scope at the persistence layer, not interface design. Every
  customer call writes to the seller's record: the DPO sees external
  consumption on the same surface as internal, with the same receipts.

---

## 3 · NAVIGATION & INFORMATION ARCHITECTURE

**3.1 Akki OS top-level nav, fixed order:**
**Connect · Registry · Use Data · Govern · Prove · Team**, plus **Analyze** as
the analyst workspace (sibling or nested per implementation). There is no
fourth Use Data door. Akki for Executives and the Customer Portal are not in
OS nav.

**3.2 Role gating.**

| Nav | Master Admin | DPO | Operator | Analyst |
|---|---|---|---|---|
| Connect | R + Add | R | R + Connect/Test/Retry | R |
| Registry | R | R | R | R + interact |
| Use Data | R + Approve escalations | R + Resolve holds | R + Setup integrations | R + Commission |
| Govern | R (record) | R + W (all) | R (record) | R (record) |
| Prove | R + Ask | R + Ask + Audit | R + Ask | R + Ask |
| Team | R + Grants | R (record) | R (self) | R (self) |
| Analyze | R (their workspaces) | R (audit-only; no analyst data reads) | R (workspace lifecycle only) | R + W (own + invited) |

Executives and Customers reach nothing in this table; their applications are
§1.7.

**3.3 Vocabulary.** Canonical: Use Data · In progress · Ready · Held for a
check · Use in an app · Export · Put this to work · Trust Center · Rails ·
Rules · Engine settings · Registries. Retired — MUST NOT render on any
general-user surface: My Objectives · Run Tracking · Extracted Intel ·
Approval Queue · Awaiting approval · Run/Commission Approver.
◆ Retired-vocabulary audit of the existing frontend: clean at 0 hits,
2026-07-31; the gate stays in the suite permanently.

---

## 4 · CONNECT

**Purpose.** Making the estate real to the system and proving it reads
correctly before anything counts on it. Speaks infrastructure: state,
protocol, endpoint, cadence, health.

**4.1 Landing — one page, no tabs.** Top to bottom:
1. **Headline**, two states in the same slot (layout never changes):
   pre-connection "N sources declared · M connected · K awaiting"; steady
   state, the health line ("All sources connected, last sync 3 min ago").
2. **Status banner** — configuration locked, who signed, when, deployment
   target, primary regulator; one link to the locked configuration as a
   read-only record.
3. **Three cards** — connections healthy vs total · last sync · egress
   posture.
4. **The record** — table: Source · Protocol (familiar form: database
   endpoint, transfer host, object-store endpoint, network share) · Cadence
   (plain words) · State ∈ {connected, in progress, awaiting credentials,
   failed}. Row click opens the source profile.
5. **Footer** — where credentials are held · who signed off · one link out:
   "data use rules live in Govern."

**MUST NOT:** no governance content on this page. Rules, usage rights,
protection registries, role duties live in Govern; Connect links, never
duplicates.

**4.2 Setup rules.** Step 3 carries seven Connect rules under one control
grammar, including rule seven: **Commission auto-run ceiling** (numeric +
currency; ∞ permitted). ◆ Initial value: **$1,000** (owner-set 2026-07-31;
thereafter changeable only via Change-a-Rule). Step 4 permits declaring
**Class D registries** at setup: name, schema class (pseudonymize / redact /
filter), initial upload optional; deferred initial load permitted — the
registry exists empty and fails closed until first load. Post-signoff, the
home lists declared registries with version + last-updated chips.

**4.3 Role-conditional actions.** Master Admin adds a source (enters as
pending). Operator connects, tests, retries. Other classes read.

**4.4 The source profile.** Mapping leads with the answer, not the apparatus:
header "N of M fields confirmed · K need attention." Fields needing attention
render as plain-language questions with the resolution control attached
("Values in this column look like branch codes in some rows and teller
identifiers in others. The system will not guess between them."). The full
field list is collapsed behind a link. The Operator resolves; all other
classes see the same summary read-only with who confirmed and when.
Rationale, binding on any redesign: a wrong mapping is consistently wrong at
scale and produces no error signal downstream; this step prevents the most
expensive silent failure available.

---

## 5 · REGISTRY

**Purpose.** What the estate holds, in what condition, with what rights, and
what has not yet been measured.

**5.1 Standing content.** Registry Dashboard (holdings by ring, source,
domain) · first domain-transfer measurement (which strata are workable today)
· opportunity briefs (pre-seeded intents; CTA **"Put this to work"** opens the
Use Data conversation with the Reflection card partially filled) · gap
register (unanswered questions filed from Prove; enters the ranking that
drives extraction candidates).

**5.2 Reads.** The Analyst's first-contact reading before commissioning.
The Master Admin's between-approvals reading.

**SLOT-1:** Dashboard exact composition, opportunity-brief card structure,
gap-register ordering — fold from registry module content and
`RMS_UI_Specification_v2_2` when delivered; until folded, the builder's
Stage A detail governs layout within §5.1's content set.

---

## 6 · USE DATA (highest experience density)

**Purpose.** Turning what the estate holds into something the organisation
uses: an application on governed intelligence, a dataset shipped under its
rights, or a model the organisation owns. One conversation shapes the work;
one card commits it; one pipeline carries it.

**6.1 Three doors.** Integrate an App · Export / License Data · Train a
Model. Each opens the same conversation, pre-seeded for the intent. Registry
opportunities and filed gaps open the same conversation with the Reflection
card partially filled. There is no fourth door. Parameter testing is not a
door; it folds in as the Test card.

**Rights surface early, not at checkout (MUST).** On the Export door the
agent states the rights posture as soon as scope is known ("this slice is
internal-plus-partner and may ship to partners but not sold commercially").
Internal-only scope triggers that statement in conversation — never a failed
commission later. Training rights are inherited and said aloud: training on
internal-only material produces an internal-only model, stated when scope is
set.

**6.2 The wizard is a conversation.** Split view once substance exists:
conversation right (~60%), live cards left (~40%), cards rendering and
updating as dialogue fills the schema. Governance line, verbatim, binding:

> **Conversation shapes; the card commits.**

Every governed value — evidence floor, rights posture, budget ceiling, price,
acceptance — is confirmed on the structured Commission card. None is inferred
from dialogue and silently committed. The objective contract is identical
beneath both interaction shapes.

**6.3 The six cards.**

| Card | Appears | Carries |
|---|---|---|
| **Reflection** | First; always visible | The objective as currently understood: need · scope · evidence floor · rights · output form; each field marked `set` / `open` / `assumed default`. The user watches their words become the objective. |
| **Intel** | As scope is established | What the registry knows: holdings · condition · languages · reusable stock · projected coverage · gaps stated plainly. |
| **Test** | At the natural moment (offer, not push) | Parameters tested against a sample: observed quality and cost per thousand; every test run receipted; a winning configuration promotes into Reflection in one action. |
| **Plan preview** | When the schema is complete enough | Volume as a range · expected coverage · what cannot be covered · cost as a range · editable budget ceiling with the note "the run halts at the ceiling and nothing past it is billed." |
| **Sample results** | After a representative slice runs | Observed against planned — facts per document · verification pass rate · cost per thousand — before full commitment. |
| **Commission** | Last | The structured, ledgered act: evidence floor · rights · budget ceiling · price with validity and cancellation terms · acceptance. Each confirmed explicitly, then committed. |

**6.4 Commission verdicts — the admissibility gate.** The Approval Queue is
deleted; no general commission waits on a queue. Every commission is
machine-evaluated at the Commission card, fail-closed, verdict receipted.

Five checks: rights compatibility (requested delivery/output rights vs source
usage rights; a trained model inherits its training-data rights) · privacy
floor (scope satisfies the configured group-size floor) · PII posture
(masking/pseudonymisation rules, including Class D registries, resolvable
over the scope) · budget ceiling (present, positive, within org limit where
configured) · scope resolvability (every referenced source Connected and
censused).

| Verdict | User sees | Follows |
|---|---|---|
| **Runs now** | All checks passed, receipt reference | Appears in In progress and begins |
| **Refused** | The specific rule named in plain words, in the conversation; escalatable states criterion + value + route; absolute states the bar, no affordance | Nothing committed |
| **Held for a check** | A declared flag condition tripped, or work exceeds the auto-run ceiling; stated plainly with reason | A single reviewer resolves from Govern; both outcomes logged; originating surface reflects the resolution |

Commissions at/under the auto-run ceiling auto-run when rule-clean; above it,
a single DPO countersign ("Pending policy check"). The ceiling changes only
via Change-a-Rule. Preserved gates, explicit non-scope of queue deletion:
**Release Review** (everything leaving the organisation) and **Model
Acceptance** (human quality judgment over the six checks) are untouched.
◆ Wire shapes: `UseDataWizardSession@v0` and `CommissionVerdict@v0` enter as
new frozen contracts (Parity 34→35→36), seal events, freeze argued at Stage A.

**6.5 Pipeline — two sections beneath the doors.**
**In progress.** Row: name · door · plain status · cost against ceiling · any
hold. Holds render as "Held for a check" with the reason in plain words.
Opening a row shows work in its door's shape: batch progress with the basis
of the percentage (extraction); staged progress (training). Problems are
shown, never hidden — held batches appear inline where the user is looking.
Extending scope always re-quotes: it re-opens the conversation on the scope
field and generates a new quote for the addition, never silently folding into
running work. Cancelling requires no reason: it references the cancellation
terms agreed at commission, halts queued work, retains completed work, and is
logged.
**Ready.** Every finished artefact carries two actions: **Use in an app ·
Export**. Rights are checked at the moment of click. Where export is
permitted and licensable, the price is shown and the receipt logged; where
blocked, the message states why and that the attempt itself is receipted.
The Train-a-Model output fork lives at the Ready artefact, not in the wizard:
an accepted model appears in Ready like any artefact, carrying inherited
rights, offering the same two actions. One decision, one commitment point.

**6.6 Developer surface.** Not a nav module: the post-commission management
view of an Integrate-an-App item, reached from its row. Content: scoped key ·
webhook · event type · status · usage strip · the line "every call lands in
the record the DPO reads." Doctrine, verbatim: "identical terms to internal
use; no lighter-weight path for machines."

**6.7 Gating.** Model Acceptance and hold-resolution surfaces are
approver/DPO surfaces, absent from general-user nav. Govern is DPO-scoped.
Public Receipt generation is DPO-only.

**SLOT-2:** conversational-wizard execution detail (state machine, card
transitions, seed formats) — fold from use_data module content and
`ui_1_stage_a` §-detail as the builder's Stage A executes; layout authority
within §6's content set is the Stage A.

---

## 7 · GOVERN

**Purpose.** Holding the rules, proving they fire, and carrying the acts that
require human authority. The DPO's home; the organisation's evidence that
governance is enforced rather than described.

**7.1 Trust Center — two halves.**
**Rule inventory (left):** every rule in force with current setting · who set
it, when · number of automated checks enforcing it · enforcement class.
**Record (right):** refusals by class with reasons · holds with resolution ·
masking activity and any recall breach · access events across people and
applications · deletions with certificates · rule changes with ceremony
stage · per-application memory activity.
Doctrine: violations post as plainly as successes — a compliance surface that
only shows green is a marketing surface. Every violation carries its
disposition. The DPO's work is dispositioning violations, not discovering
them.

**7.2 Enforcement classes** (derived from the rules taxonomy, never hand-set;
no class presented as superior; nothing urges converting one into another).

| Class | Meaning | Record shows |
|---|---|---|
| **Enforced** | A check runs, fails closed, emits a receipt | Live check result + receipt; enforcement and violation counts |
| **Attested** | Held by a recorded human act | Attestation artefact, signatories, date; no enforcement count — there is no check to count |
| **Monitored** | Measured and reported; does not block | Observation log, non-blocking status stated plainly |

**7.3 Estate Rules Record — four rule classes, one Rule Record schema
(`class` ∈ S/O/E/D) with 30-day enforcement counts and violations.**

| Class | Name | Operate | Verify |
|---|---|---|---|
| S | **Rails** | Read-only in Estate; authored as code + contract, build-phase only | Test suite; a rail without a hard-fail cell does not exist |
| O | **Rules** | Change-a-Rule only; set at Connect, locked at approval | Live test packs per rule |
| E | **Engine settings** | Engineers, via versioned deployment; pinned per engine version | Version-bump evaluation verdict |
| D | **Registries** | §7.4 lifecycle | Validation report + live probe pack |

**E→O promotion** is proposal-gated, one-way per event: promotion note
(parameter · why runtime tunability · blast radius) → enters Class O via spec
amendment → leaves engine-pinned config at the next version bump → thereafter
Change-a-Rule only. Demotion requires the same ceremony. No third path; until
promotion completes, no runtime edit exists.

**7.4 Registries submodule (Class D operating surface).** Sequence: Upload
(Excel/CSV) → Schema validation (row-level errors, fail-closed on malformed
input) → Diff view (added/removed/changed, side by side) → Confirm →
Versioned (receipted, effective-from stamped, rollback available). Every run
records the registry version in force — audit answers "was this term
protected on date X?". Asymmetry, owner-ruled and deliberate: **additions
take effect immediately; removals and edits require approval**
(counter-sign or configured waiting window) — adding protection is safe by
direction; removing or editing is the only change that can weaken the shield
and the change a mistake or bad actor makes. The surface stays
spreadsheet-simple: weekly-operated.

**7.5 Rule Change ceremony.** A rule is never edited in place. DPO proposes
with a reason → Master Admin counter-signs → waiting period with visible
countdown, cancelable during the window → applies with a change certificate →
re-verification fires (a changed rule is demonstrated firing, not assumed).
Full ceremony history stays on the record permanently.

**7.6 Holds surface.** Anything the rails hold appears with the rail that
fired, the evidence, and the proof trail. A single reviewer releases or
confirms rejection; both outcomes logged; the originating surface reflects
the resolution.

---

## 8 · PROVE

**Purpose.** Answering questions of the estate with evidence attached, and
being honest in a specific way when an answer cannot be given.

**8.1 Three response shapes — visually distinct, never conflated (MUST).**

| Shape | Styling | Content | Queue offered |
|---|---|---|---|
| **Not extracted yet** (refusal) | Refusal styling | The gap stated plainly · estimated effort to close it · offer to queue the work; queuing opens the Use Data conversation pre-seeded, and the originating answer updates to show where the work went | Yes |
| **Evidence cannot support it** (refusal) | Same refusal styling | The specific reason in plain language in the honesty strip: no lawful basis for this use · defensibility floor not met · group too small to report | No — more extraction would not help |
| **Something broke** (fault — not a refusal) | Fault styling: own channel, colour, layout; shares no components with the refusals | Never assigned a refusal reason | n/a |

◆ Bindings DB-1 and DB-2, promoted from deferred to binding: the specific
wire reason renders in the honesty strip on evidence-cannot-support (DB-1);
a companion-channel failure MUST NOT convert a refusal into a fault render —
the refusal renders without the supporting detail if the detail could not be
retrieved (DB-2).

**8.2 Walk-a-proof.** Any answer descends: claim → the reasoning that
produced it (candidates considered, contradiction and corroboration checks,
how probability was weighed) → the raw verified facts underneath, each linked
to its source. Closing returns the reader to exactly where they were.

---

## 9 · ANALYZE · TEAM · NON-OS APPLICATIONS

**9.1 Analyze.** A workspace for quantitative work; people bring their own
material and prepare the evidence behind decisions.
- One owner per workspace; ownership personal, explicit, transferred by act,
  not absence. Collaborators invited; material belongs to the workspace, not
  the uploader.
- **Locality rule (MUST):** material brought in stays in — not censused, not
  extracted from, not visible to another workspace; it does not become estate
  material by presence. Estate material MAY be drawn in; nothing flows the
  other way by default. Promotion into the estate is the same act that adds
  any source: Master Admin approval with rights posture declared at the
  moment of promotion. No lighter path.
- Capabilities over parsed workbooks: signal extraction · Monte Carlo ·
  forecasting with a low-fit threshold that declines rather than guesses ·
  anomaly detection with a stated rationale per finding · cited report
  export across document, slide, spreadsheet.
- Three properties across all of it (MUST): every figure carries its class
  (measured or estimated — on the number, not a footnote); every citation
  resolves against the parsed source or the result does not persist; the
  narration reports what was found without instructing the reader what to do.
- ◆ Builds only after the `workbook_analyzer` acquisition lands (Dispatch v2
  §5.3).

**9.2 Team.** The Master Admin's approval surface — the working queue, which
should be short. Each item: what is asked · which criterion it crossed · what
it costs or touches · who requested. Approve or decline with a reason; both
are ledger events. Queue consistently empty → criteria too loose;
consistently full → too tight; the correct response is redefinition, not
faster grinding. Plus the access register: grants and revocations across all
classes, as ledger events.
**SLOT-3:** approval-card layout and ledger-event display — fold from team
module content when delivered.

**9.3 Akki for Executives (separate application).** Surfaces: Ask (answers
carry what supports each claim, the evidence, the privacy floor confirmed,
and what the answer cannot say, stated plainly) · reasoning sessions (the
engine refuses to speculate where evidence will not carry it) · journal and
document work · artefact production (briefings, decks, board packs — each
inherits the receipts of the material it draws on) · work cycles. At a
limit, the refusal offers to file the work, routing to the analyst's queue
as a ranked candidate.

**9.4 Customer Portal (external).** Export purchased intelligence with the
licence label, privacy attestation, and quality card that accompany every
deliverable · integrate against scoped keys and webhooks (same answer
envelope, including refusal shapes, as internal applications) · view account
activity · manage the account.

---

## 10 · JOURNEYS AND THE LOOP

**Master Admin.** Founding: with the DPO, walks setup — identity, contacts,
deployment target, source list with rights held on each; approves the rule
set, criteria, first connections. Ongoing: the approval surface, short.
Periodic: reviews criteria with the DPO and redefines rather than grinding.

**DPO.** Founding: defines rules and criteria in plain language against
presented defaults; runs the Verification Runner (plain-language test packs
demonstrating each rail firing, each showing its proof); signs the
commissioning record. Ongoing: Trust Center on their own cadence; dispositions
violations; answers auditors by walking proofs; maintains protection
registries. On policy change: ceremony. On regulatory contact: exports the
regulator pack — rules in force with class + counts, the record for the
period, ceremony histories, destruction attestations, proof trails for
nominated operations — generated from the record.

**Operator.** Setup: source by source — connect, test, confirm mapping, label
rights; verification packs with the DPO present; then the census runs.
Integration: per approved application — commission the objective, configure
the plane, issue the key, register the webhook, make the test call, confirm
it appears in the record, hand credentials over. Steady state: monitor runs
and holds; connect approved sources; re-run verification after any rule
change.

**Analyst.** First contact: reads what the estate holds, condition, rights,
what is unmeasured, and the first domain-transfer numbers. Working cycle: a
question arrives → registry answers it, or a gap is filed → commissions
against ranked gaps → analyses returns → produces the work product → trains
an adapter where qualified material has accumulated; acceptance runs
automatically; the accepted model appears in Ready with inherited rights.
Compounding: each cycle produces cleaner material, better models, more
accurate mining; the role shifts from extraction toward analysis.

**Executive.** Works in Akki for Executives daily; at a limit, gaps file back
as ranked candidates. **Customer.** The Portal, never beyond their account.

**The loop.** Questions arrive → most are answered → those that are not
become ranked gaps → gaps become commissioned objectives → extraction changes
what the next round can answer. No class must be present for the loop to
continue; the record carries the context that would otherwise live in
someone's head.

---

## 11 · DESIGN DOCTRINES (binding on every surface)

1. Conversation shapes; the card commits.
2. Rights surface early, not at checkout.
3. Problems are shown, never hidden.
4. Refusals name the specific rule in plain words; a lawful-basis problem and
   a floor problem render differently.
5. Absolute refusals render no approval affordance.
6. A failed lookup never converts a refusal into a fault.
7. The fault surface shares no components with refusal surfaces.
8. Extending scope always re-quotes.
9. Cancelling requires no reason.
10. Every figure carries its class — measured vs estimated, on the number.
11. Every citation resolves, or the result does not persist.
12. Narration informs; never instructs.
13. Violations post as plainly as successes.
14. Governance content lives only in Govern; other surfaces link, never
    duplicate.
15. Homes: DPO → Trust Center · Analyst → wizard + Analyze + Registry ·
    Master Admin → approval surface · Operator → Connect + Verification
    Runner · Executive → Akki for Executives · Customer → Portal.

---

## 12 · USER STORIES (delta-controlled)

**Struck:** any story referencing the Run/Commission Approver or the Approval
Queue as a general gate.
**Amended:** analyst shaping → conversational phrasing ("by describing what I
need in a conversation, watching the objective form as I speak"); run
tracking → In progress / Ready vocabulary; extracted-intel browsing → Ready.
**Standing (eight):** the three-door entry to one governed conversation ·
refusal at the Commission card with the specific rule named, never a queue ·
DPO resolves held commissions from one surface · above-ceiling commissions
wait for DPO countersign — a human in the loop by rule, not by queue ·
registry upload → diff → confirm with removals/edits gated, so protection
never weakens silently · every run records the registry version in force ·
engine settings change only through version bumps, promoted to Rules only
when runtime control is genuinely needed · the model trainer watches
progress, held-out evaluation, and the six checks compute live, and the
accepted model appears in Ready carrying inherited rights.

---

## 13 · SLOT REGISTER AND STANDING RULES

**Slots (fold-in obligations; never build blockers; each folds by delta log
with a version bump of this canon):**
- SLOT-1 Registry surface detail (§5).
- SLOT-2 Use Data wizard execution detail (§6).
- SLOT-3 Team surface detail (§9.2).
- SLOT-4 Canon self-completion: verbatim-read of `RMS_UI_Specification_v2_2`,
  `RMS_UX_Architecture_v2`, `surface_journey_map_v1`; deltas fold forward
  into this document only.

**Standing rules:**
- Disk is truth; this document describes the product, the manifest describes
  the tree, and the build gates on what runs. Provenance never gates builds.
- A foreign manifest is provenance. This tree's contract set under its green
  suite is the contract set of record; foreign contracts never import; new
  contracts enter by seal event.
- One `docs/rulings/` directory in the canonical tree is the only ruling
  store; every session reads it at start; a ruling not filed there does not
  exist.
- This canon changes only by filed ruling and version bump. Retired artifacts
  live in `/salvage/`, read-only, cited never.

— END · EXPERIENCE CANON v1.0 —
