# AKKI OS — FRONTEND UI/UX BRIEF v1
## Composed 2026-07-27 · Comprehensive brief for design and engineering

Purpose. This brief consolidates every UI/UX-binding instruction, mandate, and ruling filed to date so a design or engineering team can recreate or enhance the Akki front-end from a single artefact. Normative language: MUST / MUST NOT / MAY. Where canon disagrees, the amendment set in owner_change_order_2026-07-25.md (A1–A8) wins; where an amendment is silent, pre-amendment canon stands. Reference artifacts (Akki_v2_Standalone.html, the UI-v3 design brief) are NOT spec carriers — normative force lives only in filed canon.

Preamble under evidence discipline. This brief is composed from filed canon verbatim-read on 2026-07-27: akki_operating_model_product_spec_v2.0.md (SHA 20b4d305c26c1054c6c5cf49ae4d542a16e3579b2eddea1bdc04ec6450ceee4f), akki_role_register.md (SHA 471e1f4e578ec7aadf6edff11e898f44c459bfccdf7d63ddd3ee283fc0b65bd7), akki_analyze_codebase_acquisition_v1.0.md (SHA 76b2998e7b9075efd703fbd246d1dd048a4bfe6c5af7d1818973fe3e2a2ebd7d), owner_change_order_2026-07-25.md (A1–A8), owner_brief_blinded_assessment_2026-07-25.md (SHA c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17), and the file trees of /app/frontend/src/, /app/backend/services/, /app/backend/contracts/. Items not verbatim-read this session that would firm this brief up: RMS_UI_Specification_v2_2.md (34 261 B), RMS_UX_Architecture_v2.md (10 956 B), surface_journey_map_v1.md (10 017 B), docs/stage_a_proposals/ui_1_stage_a.md (100 032 B), and the twenty module_specs.



## PART A — FOUNDATIONAL CONTEXT (the operating model)

### A.1 The design decision that governs everything
Akki does the specialist work. People hold authority over it. The system performs the census, the extraction, the qualification, the masking, the measurement, and the record-keeping. What it requires from people is authority — someone to decide what the system is, someone to define the rules it enforces, someone to set it up, and someone to direct what intelligence it produces.

This distinguishes Akki from conventional enterprise software, which distributes labour across roles and gives each a queue. Akki does not distribute labour. Every UI/UX decision descends from that principle: no human is placed in the runtime path.

### A.2 The governance cycle — Define / Approve / Execute
Three steps; only the first two involve people.

Define. The DPO defines the governance rules — masking policy, retention obligations, rights ceilings, privacy floors, deletion requirements, and the approval criteria (thresholds of cost, sensitivity, and rights class above which work must escalate).
Approve. The Master Admin approves the defined rule set and criteria. A single consequential act, not a recurring one.
Execute. From that moment the system enforces the rules on every operation, automatically, with no person in the path. Permitted work runs. Work that would cross a criterion is refused at the boundary with its reason stated. Every operation writes a receipt.

Updating a rule re-runs Define + Approve — never the work. Work completed under the prior rule remains on the record with the rule version that governed it.

### A.3 The refusal grammar
Two shapes; the distinction is load-bearing.

Refused-escalatable. Work crossing a criterion the organisation set — cost, volume, sensitivity class. The refusal states the criterion, the value that crossed it, and routes to the approval surface. Someone CAN approve; the system says who.
Refused-absolutely. Work barred by a condition no seat can lift — an internal-only source feeding a commercial export, an output below the aggregation floor, material under retention hold facing deletion. The refusal states the bar and where it comes from: the source's licence class, the floor value, the hold instrument. It offers no approval route, because none exists.

MUST rule: an absolute refusal MUST render no approval affordance at all — not a disabled button, not a request-override link. An affordance implies approvability.

There is also a third shape — fault — which is not a refusal (see Part D, Prove).

### A.4 Separation of duties (three, enforced by the system)
Operator cannot approve the connection they built.
Analyst cannot approve their own over-threshold work.
DPO defines rules but does not approve them.

### A.5 Constitutional seats
Master Admin and DPO are constitutional seats. Succession requires:
An out-of-band instrument (board resolution / executive appointment / equivalent), recorded to the ledger.
Two parties in system: the instrument + a counter-signature from the other constitutional seat.
Neither seat may appoint or remove itself; neither may unilaterally appoint or remove the other without the instrument.
Vacancy is a declared state. A vacant constitutional seat appears on the Trust Center; approvals requiring it queue rather than falling through.

The system verifies the instrument exists, is recorded, and is attributable — NOT its authenticity. That is organisational governance.

### A.6 Three duties that attach rather than classes
Approve-to-run — where an organisation wants human confirmation before commissioned work executes.
Release outbound — where rules require a person on deliverables leaving the organisation.
Confirm structured mappings — attaches to the Operator by default.

Not standing classes because each varies in who holds it. Enabling Approve-to-run for routine work reintroduces the friction the operating model removes; canon recommends against it.

### A.7 Two products, one governance record
Akki OS. Installed inside the enterprise perimeter. Estate, engines, governance, extraction, production. Four classes work here (Master Admin, DPO, Operator, Analyst).
Akki for Executives. A separate application through which executive users consume governed intelligence — reasoning, document work, board artefacts, questions answered with proof. Integrates via the OS's memory-layer contract; holds a scoped key and memory plane. Every call it makes lands in the record the DPO reads.
Customer Portal. External self-service for parties that have purchased intelligence — export, integrate, view activity, manage billing. Reaches purchased deliverables + account records ONLY. No path to the estate.



## PART B — USER PROFILES (six classes)

A person MAY hold more than one class. Classes are authorities, not job titles. Separations of duty are enforced per-account regardless of who the human behind the account is.

### B.1 Master Admin
Organisational candidates: CIO · CTO · CDO · Head of Data · in smaller organisations, the executive sponsor.
Holds: Consequential approval.
Home surface: Approval surface · Registry Dashboard · Access register.
Approves: Estate connections; the rule set and approval criteria; new base models; application integrations; access grants and revocations; over-threshold work.
Never does: Individual pulls inside the envelope; individual queries; individual application calls; routine analytical work. If they find themselves approving the same class of item repeatedly, the criteria are too tight — redefine, don't grind.
Promise: Nothing consequential happens without them, and nothing trivial reaches them.

### B.2 Data Protection Officer (DPO)
Organisational candidates: DPO · CSO · Head of Compliance · Head of Risk · General Counsel (organisations without a dedicated DPO).
Holds: Rule definition and assurance.
Home surface: Trust Center · Rule definition · Ceremonies.
Defines: Governance seam values; rights and retention policy; approval criteria; masking and purpose policy.
Monitors: Trust Center (two halves — rule inventory + record).
Never does: Approve operations. Not in the path of a pull, an integration call, an extraction run, or a training job.
Promise: Rules that enforce themselves. Assurance is verified, not told.

### B.3 Operator
Organisational candidates: Data engineer · platform engineer · IT operations lead · systems administrator.
Holds: Execution setup.
Home surface: Connection console · Verification Runner · Integration console · Batch board.
Does: Connect estate sources; confirm structured mappings; run verification packs; integrate internal applications; pull sample data; monitor runs.
Never does: Approve their own connections or integrations (system refuses); define governance rules; commission production objectives.
Promise: The system works as configured, and they can prove it.

### B.4 Data Analyst / Scientist
Organisational candidates: Data analyst · data scientist · BI lead · research lead · external partner.
Holds: Intelligence production.
Home surface: Extraction wizard · Analyze workspace · Model shelf · Registry.
Does: Commission extraction (conversationally); pull and analyse; train adapters; deploy their own base models (approved); review acceptance and drift.
Never does: Build extraction pipelines, masking, citation machinery, audit logging, or evaluation harnesses; approve their own over-threshold runs; define governance rules.
Promise: Material they can trust and models they keep.

### B.5 Executive user
Organisational candidates: CEO · CFO · non-executive director · department head · risk officer · analyst without a data mandate · any employee whose work requires answers rather than access.
Holds: Nothing. This class holds no authority over the system and requires none.
Home surface: Akki for Executives (a separate application, NOT the OS).
Does: Ask questions of the estate; run reasoning sessions; work documents in a journal; produce artefacts (briefings / decks / board packs); work cycles (agendas / minutes).
Never sees: Estate configuration, governance rules, approval queues, extraction machinery, the model registry, or infrastructure. The absence is deliberate.
Promise: An answer they can defend, without understanding the machinery.

### B.6 Customer (external)
Who: An external party that has purchased intelligence products, subscribed to a standing data service, or licensed a model.
Holds: Their own account. Nothing inside the estate.
Home surface: Customer Portal.
Does: Export purchased intelligence in the format they need; integrate against scoped keys and webhooks; view account activity; manage billing.
Boundary: Portal reaches purchased deliverables and account records only. Query outside the customer's own account does not execute.
Every customer call writes to the seller's record. The DPO sees external consumption on the same surface as internal, with the same receipts.



## PART C — NAV & INFORMATION ARCHITECTURE

### C.1 Akki OS top-level nav (post-A1)
Left-hand nav in fixed order:

Connect · Registry · Use Data · Govern · Prove · Team

Plus Analyze as the analyst workspace (surface home; may be sibling or nested per implementation).

The module formerly named Extract is renamed Use Data (per A1.1).
There is no fourth Use Data door.
Vocabulary retired from general-user surface: My Objectives, Run Tracking, Extracted Intel.

### C.2 Non-OS applications
Akki for Executives — separate app, not in OS nav, consumed by executive users only.
Customer Portal — separate external surface, not in OS nav, consumed by external customers only.

### C.3 Role gating (top-level)


(R = read, W = write. Executives access via Akki for Executives; customers access via Portal.)

### C.4 Reference vocabulary renames (A1.7)
"Shape this objective" → "Put this to work" (Registry opportunity CTA).
"Queue this gap" retains its name (already user-language).
"Extend scope" retains its behaviour: re-opens the conversation on scope; additions always generate a new quote cycle.
Cancel: no reason required; references quote cancellation terms; completed work retained.



## PART D — SURFACE-BY-SURFACE SPECIFICATIONS

### D.1 Connect

What it is for. Making the estate real to the system, and proving it reads correctly before anything counts on it. Speaks infrastructure — state, protocol, endpoint, cadence, health.

Landing (one page. No tabs.) In order, top to bottom:

Headline — two states.
Pre-connection: "N sources declared · M connected · K awaiting."
Steady state: the health line ("All sources connected, last sync 3 min ago").
   Same slot; layout does not change.

Status banner — configuration locked, who signed it, when, deployment target, primary regulator. One link out to the locked configuration as a read-only record.

Three cards.
Connections healthy vs total.
Last sync.
Egress posture.

The record. Table: Source · Protocol · Cadence · State.
Protocol in familiar form (database endpoint, transfer host, object-store endpoint, network share).
Cadence in plain words.
State ∈ {connected, in progress, awaiting credentials, failed}.
Clicking a row opens that source's profile.

Footer. Where credentials are held · Who signed off the connections · One link out: "data use rules live in Govern."

MUST NOT. No governance content appears on this page. Rules, usage rights, protection registries, and role duties live in Govern. Connect links to them and never duplicates.

Role-conditional actions.
Master Admin adds a source; it enters as pending.
Operator connects, tests, retries.
Other classes read.

A5 amendment — seventh Connect rule. Step 3 gains a seventh Connect rule: Commission auto-run ceiling (numeric + currency, recommended default per org, ∞ permitted). Same control grammar as the other six.

A5 amendment — Class D registry declaration. Step 4 (or Step 4b) permits declaring Class D registries at setup: name, schema class (pseudonymize / redact / filter), initial upload optional. Deferred initial load permitted (registry exists empty, fail-closed until first load). Post-signoff home lists declared registries with version + last-updated chips.

The source profile (opens from a row).
Mapping leads with the answer, not the apparatus. Header: "N of M fields confirmed · K need attention."
Fields needing attention appear as plain-language questions with their resolution control attached ("Values in this column look like branch codes in some rows and teller identifiers in others. The system will not guess between them.").
Full field list is collapsed behind a link.
Why: A wrong mapping is consistently wrong at scale and produces no error signal anywhere downstream. Most-often-skipped step in conventional projects; prevents the most expensive silent failure available.
Who acts: Operator resolves. Other classes see the same summary read-only, with who confirmed it and when.

### D.2 Registry

What it is for. What the estate holds, in what condition, with what rights, and what has not yet been measured.

Canon coverage in the v2.0 spec is light — most Registry detail lives in the (unread this pass) RMS_UI_Specification_v2_2.md and module_spec 02_registry_module.md. What is captured from the operating model + role register:

Standing content.
Registry Dashboard — what the estate holds by ring, by source, by domain.
First domain-transfer measurement (which strata are workable today).
Opportunity briefs — pre-seeded intents that open the Use Data conversation with Reflection card partially filled.
Gap register — unanswered questions filed from Prove; enters the ranking that drives extraction candidates.

Analyst read. Their first-contact reading, before commissioning anything. Master Admin read. Between approvals; sees what the estate holds and what is producing.

GAP for enhancement work: Registry surface detail — the Dashboard's exact composition, opportunity brief card structure, gap register ordering — is under-specified in the canon read this pass and should be read from 02_registry_module.md before touching.

### D.3 Use Data (post-A1 rename from Extract) — the module of highest UX density

What it is for. Turning what the estate holds into something the organisation uses — an application running on governed intelligence, a dataset shipped under its rights, or a model the organisation owns.

One conversation shapes the work; one card commits it; one pipeline carries it.

#### D.3.1 The three doors (A1.1)

Intent router at the landing. Three doors:

Integrate an App — applications and agent workflows on governed intelligence.
Export / License Data — produce and ship datasets under the rights they carry.
Train a Model — train on the estate; use the result in an app or export it.

MUST rules.
Each door opens the same conversation, pre-seeded for that intent.
Rights surface early, not at checkout. On the Export door, the agent states the rights posture of the scope as soon as the scope is known ("this slice is internal-plus-partner and may ship to partners but not sold commercially"). Internal-only scope triggers that statement in conversation, NOT a failed commission later.
Training rights are inherited and said aloud. Training on internal-only material produces an internal-only model. The conversation states this when the scope is set.
There is no fourth door.

Registry-entered and Gap-entered pre-seeds. An opportunity in the Registry and a gap filed from an unanswered question both open this same conversation, with the Reflection card partially filled.

#### D.3.2 The wizard is a conversation (A1.2)

Split view once substance exists:
Conversation on the right (~60% width).
Live cards on the left (~40% width). Cards render and update live as the dialogue fills the schema.

Governance line (verbatim, binding):
Conversation shapes; the card commits.

Every governed value — evidence floor, rights posture, budget ceiling, price, acceptance — is confirmed on the structured Commission card. None is inferred from dialogue and silently committed. The objective contract is identical beneath both interaction shapes; the schema is the same schema.

Parameter testing is not a door. It folds into the conversation as the Test card.

#### D.3.3 The six cards


#### D.3.4 Commission verdicts (A2.2 — the admissibility gate)

The Approval Queue is deleted (A2.1). The Run/Commission Approver role is retired. "Awaiting approval" status is removed from the lifecycle. Every commission is machine-evaluated at the Commission card, fail-closed, verdict receipted:

The five checks:
Rights compatibility — requested delivery/output rights vs. source usage rights (internal-only cannot feed a licensable output; a trained model inherits its training-data rights).
Privacy floor — requested scope satisfies the configured group-size floor.
PII posture — masking/pseudonymisation rules (incl. Class D registries) resolvable over the scope.
Budget ceiling — present, positive, within org limit where configured.
Scope resolvability — every referenced source Connected and censused.

Three outcomes, each receipted:


A2.3 auto-run ceiling. Commissions at/under the ceiling auto-run when rule-clean. Above the ceiling → held for a single DPO countersign (the reserved "Pending policy check" state). Changeable only via Change-a-Rule.

Preserved gates (explicit non-scope of A2): Release Review (everything leaving the org) and Model Acceptance (human quality judgment over the six checks) are UNTOUCHED. "Remove approval" MUST NOT be read expansively.

#### D.3.5 Pipeline vocabulary (A1.4) — two sections beneath the doors

In progress.
Row: name · door it came through · plain status · cost against ceiling · any hold.
Holds render as "Held for a check" with reason in plain words (quarantine honesty preserved verbatim).
Opening a row shows work in the shape appropriate to its door: batch progress with the basis of the percentage for extraction; staged progress for a training run.
Problems are shown, never hidden. Held batches appear inline where the user is looking, with reason stated.
Extending scope always re-quotes. Re-opens the conversation on the scope field and generates a new quote for the addition. Never silently folds into the running work.
Cancelling requires no reason. References the cancellation terms already agreed at commission; halts queued work; retains what has completed; is logged.

Ready.
Every finished artefact carries two actions: Use in an app · Export.
Rights checked at the moment of click, not hidden upfront.
Where an export is permitted and licensable, the price is shown and the receipt logged.
Where blocked, the message states why AND that the attempt itself is receipted.
Train-a-Model output fork lives at the Ready artefact, NOT in the wizard. An accepted model appears in Ready like any other artefact, carrying its inherited rights, offering the same two actions. No fork inside the wizard, because one decision deserves one commitment point.

#### D.3.6 Developer Surface (A1.6)

Not a nav module. The post-commission management view of an Integrate-an-App item, reached from the item's row.

Content:
Scoped key.
Webhook.
Event type.
Status.
Usage strip.
Line: "every call lands in the record the DPO reads."

Doctrine preserved verbatim: "identical terms to internal use; no lighter-weight path for machines."

#### D.3.7 Role gating (A1.5)

Model Acceptance decisions — approver/DPO surfaces, ABSENT from general-user nav.
A2.2 hold-resolution surface — approver/DPO surfaces, ABSENT from general-user nav.
Govern remains DPO-scoped.
Public Receipt generation remains DPO-only.

### D.4 Govern

What it is for. Holding the rules, proving they fire, and carrying the acts that require human authority. The DPO's home, and the organisation's evidence that governance is enforced rather than described.

#### D.4.1 Trust Center — two halves

Rule inventory (left).
Every rule in force with its current setting.
Who set it, when.
Number of automated checks enforcing it.
Enforcement class column (per A4.1 / D.4.2).

Record (right).
Refusals by class with their reasons.
Holds with their resolution.
Masking activity and any recall breach.
Access events across people and applications.
Deletions with their certificates.
Rule changes with their ceremony stage.
Per-application memory activity.

Doctrine. Violations post as plainly as successes. A compliance surface that only shows green is a marketing surface. Every violation carries its disposition. The DPO's work is dispositioning violations — not discovering them, because the system surfaces them automatically.

#### D.4.2 Enforcement class (three, displayed per rule)


Class is derived from the rules taxonomy, never hand-set. No class is presented as superior. Surface does not editorialise; nothing urges converting one class into another.

#### D.4.3 Estate Rules Record — four rule classes (A3, A4.1)

All governance objects share one Rule Record schema (class field: S/O/E/D) with enforcement counts (30d) and violations:


UI names confirmed by A4.3: Rails · Rules · Engine settings · Registries.

E→O promotion (A3.2). Proposal-gated, one-way per event: engine owner files a promotion note (parameter · why runtime tunability · blast radius) → parameter enters Class O via spec amendment (type, bounds, recommended default) → leaves engine-pinned config at next engine version bump → thereafter changes only via Change-a-Rule. Until promotion completes, no runtime edit exists. Demotion O→E requires the same ceremony. No third path.

#### D.4.4 Registries submodule (A3.3, A4.2)

The Class D operating surface. Sequence:

Upload (Excel / CSV).
Schema validation — row-level errors, fail-closed on malformed input.
Diff view — added / removed / changed, side by side.
Confirm.
Versioned — receipted, effective-from stamped, rollback available.

Every run records the registry version in force. (Audit answers: "was this term protected on date X?")

Asymmetry (Owner-ruled):
Additions take effect immediately.
Removals AND edits require approval (counter-sign or configured waiting window).

Doctrine. The asymmetry is deliberate. Adding protection is safe by direction; removing or editing an entry is the only change that can weaken the shield, and it is the change a mistake or bad actor makes.

Must remain spreadsheet-simple. Weekly-operated surface (e.g., Synisense operator uploads).

#### D.4.5 Rule Change ceremony (A3.1, v2.0 §5.3)

A rule is never edited in place.

DPO proposes with a reason.
Master Admin counter-signs.
Waiting period runs with a visible countdown; can be cancelled during this window.
Applies, with a change certificate on the record.
Re-verification fires (rails re-verified against the changed rule; a changed rule should be demonstrated firing rather than assumed to fire).

Full ceremony history remains on the record permanently.

#### D.4.6 Holds surface

Anything the rails hold — a batch that tripped a threshold, a commission that flagged — appears here with:
The rail that fired.
The evidence.
The proof trail.

A single reviewer releases it or confirms the rejection. Both outcomes logged. Originating surface reflects the resolution.

### D.5 Prove

What it is for. Answering questions of the estate with evidence attached, and being honest in a specific way when an answer cannot be given.

#### D.5.1 Three response shapes (v2.0 §6.1 + eab_2_hazard_stop_a_ruling_2026_07_24)

MUST be visually distinct and never conflated.


MUST-rule DB-1 (deferred binding). The specific wire reason renders in the honesty strip on evidence-can't-support.

MUST-rule DB-2 (deferred binding). A companion-channel failure MUST NOT convert a refusal into a fault render. "A failed lookup MUST NOT convert a refusal into a fault." Refusal still renders without the supporting detail if the detail could not be retrieved.

#### D.5.2 Walk-a-proof view (v2.0 §6.2)

Any answer descends:
From the claim,
To the reasoning that produced it — candidates considered, contradiction and corroboration checks, how probability was weighed,
To the raw verified facts underneath, each linked back to its source.

Closing returns the reader to exactly where they were.

### D.6 Analyze

What it is for. A workspace for the people who do quantitative work — data scientists, ML engineers, analysts. They bring their own material, run analysis on it, and prepare the evidence behind decisions.

#### D.6.1 Ownership and collaboration (v2.0 §7.1)

A workspace has one owner. Ownership is personal and explicit — accountability rests somewhere specific.
The owner invites collaborators, who work in the workspace without owning it.
Material belongs to the workspace, not to whoever uploaded it.
Ownership transfers by act, not by absence. A departing owner's work neither vanishes nor becomes ownerless.

#### D.6.2 The locality rule (v2.0 §7.2) — MUST rule

Material brought into a workspace stays in it. Not censused, not extracted from, not visible to another workspace. Does not become estate material by presence.
Estate material MAY be drawn into a workspace. Nothing flows the other way by default.
Why: a vendor's paper, a licensed sample, a working spreadsheet from elsewhere — each carries someone else's licence. Material that acquired the estate's rights posture by sitting in the same system would be the platform manufacturing rights it does not hold.

#### D.6.3 What the workspace does (v2.0 §7.3 + akki_analyze_codebase_acquisition_v1.0)

Workbooks are parsed into sheets, columns, and typed cells. From there:

Signal extraction (signal_extractor, 165 LOC) — deterministic over parsed material.
Monte Carlo simulation (monte_carlo, 176 LOC) — on a numeric column.
Forecasting (forecaster, 285 LOC) — on a date-and-value pair, with a low-fit threshold that declines rather than guesses.
Anomaly detection (anomaly_detector, 107 LOC) — with a stated rationale per finding.
Cited report export (report_builder, 536 LOC) — across document, slide, and spreadsheet formats.

Three properties hold across all of it (MUST):

Every figure carries its class — measured or estimated. A simulated projection and a counted total are different kinds of number.
Every citation resolves against the parsed source, or the result does not persist. A fabricated reference has no path to disk (citation_resolver, 146 LOC).
Narration reports what was found without instructing the reader what to do (refuse_to_decide, 81 LOC). The decision stays with the person.

#### D.6.4 Prework and the approval path (v2.0 §7.4)

A workspace is where the evidence for a consequential approval is assembled — most often deploying a new base model, which requires Master Admin approval. The approval is granted on the evidence; the workspace is where the evidence was built and where it remains inspectable afterwards.

#### D.6.5 Promotion into the estate (v2.0 §7.5)

Where workspace material should become estate material — a cleaned corpus, a labelled set, material an organisation wants censused and drawn on — it is promoted by the same act that adds any estate source: Master Admin approval, with the rights posture declared at the moment of promotion.

There is no lighter path.

### D.7 Team (Master Admin approval surface + access register)

Canon coverage in the v2.0 spec is present but light. From the operating model:

The approval surface = the Master Admin's working queue.
Each item states: what is being asked · which criterion it crossed · what it will cost or touch · who requested it.
Approve or decline with a reason. Both are ledger events.
If the queue is consistently empty → criteria may be too loose. If consistently full → too tight. The criteria are the instrument; the queue is its reading.

Access register. Grants and revocations across all classes; ledger events.

GAP for enhancement work. Team surface exact composition (approval-queue card layout, ledger-event display) is under-specified in canon read this pass. Read 06_team_module.md before touching.

### D.8 Akki for Executives (separate application)

Not part of the OS nav. A separate integrated application, consuming governed intelligence via the OS's memory-layer contract.

Surfaces (v2.0 §7 for exec class · role register §7):

Ask. Questions of the estate. Answers carry: what supports each claim · the evidence behind it · the privacy floor confirmed · what the answer cannot say stated plainly.
Reasoning sessions. Decisions under structure — seeking clarity, developing strategy, simulating a hypothesis, drafting a perspective. The engine refuses to speculate where evidence will not carry it.
Journal / document work. Indexes, anchors, comments on material, with search and paragraph-level questioning.
Artefact production. Briefings, decks, reports, board packs. Each inherits the receipts of the material it draws on.
Work cycles. Agendas, contributions, minutes, follow-ups where the organisation runs a governance rhythm.

Never sees. Estate configuration, governance rules, approval surfaces, extraction machinery, the model registry, or infrastructure.

At a limit. Where an answer meets material that exists but has not been extracted, the refusal offers to file the work, which routes to the analyst's queue as a ranked candidate.

They never wait for an approval and never encounter a governance control, because everything they are permitted to do was settled when their application's objective was approved.

### D.9 Customer Portal (external)

Not part of the OS. Not part of Akki for Executives. A distinct external surface.

Surfaces (role register §8):
Export purchased intelligence in the format the customer needs, with the licence label, privacy attestation, and quality card that accompany every deliverable.
Integrate against scoped keys and webhooks for standing services — same answer envelope, including refusal shapes, as internal applications use.
View account activity — what they have consumed, when, under what terms.
Manage the account — billing, contacts, keys, settings.

The boundary. Portal reaches purchased deliverables and account records ONLY. Query outside the customer's own account does not execute. Enforced by scope at the persistence layer, not by interface design.

Every customer call writes to the seller's record.



## PART E — JOURNEYS (class-by-class + the loop)

### E.1 Master Admin
Founding. With the DPO, walks setup: organisational identity, contacts, deployment target, source list with rights held on each. Approves the rule set and the criteria the DPO has defined. Approves the first estate connections. The instance is live.
Ongoing. The approval surface is the working queue and should be short. Approve or decline with a reason. Between approvals, reads the Registry Dashboard.
Periodic. Reviews the criteria with the DPO. Queue consistently empty → criteria too loose; consistently full → too tight. The correct response is to redefine — not to work through the queue faster.

### E.2 Data Protection Officer
Founding. Defines the rule set and criteria in plain language (defaults presented). Runs Verification Runner — plain-language test packs demonstrating each rail firing, each showing its proof. Signs the commissioning record.
Ongoing. Watches Trust Center on their own cadence (daily in first weeks, weekly thereafter typical). Dispositions violations. Answers business + auditor questions by walking proofs rather than by investigation. Maintains protection registries (upload → diff → confirm; removals + edits gated).
On policy change. Redefines the affected rule and routes it through the ceremony (counter-sign, waiting period, apply, certificate, re-verify).
On regulatory contact. Exports the regulator pack — rules in force with enforcement class + counts, record for the period, ceremony histories, destruction attestations, proof trails for nominated operations — generated from the record.

### E.3 Operator
Setup phase. Source by source: connect, test, confirm mapping, label rights. Run verification packs with the DPO present. Then the census runs.
Integration phase. For each approved application: commission the objective, configure the plane, issue the key, register the webhook, make the test call, confirm it appears in the record. Hand credentials to the application's team.
Steady state. Monitor runs and holds. Connect new sources as they are approved. Re-run verification after any rule change.

### E.4 Data Analyst / Scientist
First contact. Reads what the estate holds, in what condition, with what rights, and what has not been measured. Reads the first domain-transfer quality numbers.
Working cycle. A question arrives from the business. If registry can answer it, they answer. If not, gap is filed. They commission against ranked gaps, analyse what returns, produce the work product. Where enough qualified material has accumulated, they train an adapter — acceptance runs automatically; accepted model appears in Ready with inherited rights.
Compounding. Each cycle produces cleaner material → trains better models → mines the next cycle more accurately. The role shifts over time from extraction toward analysis.

### E.5 Executive user
Every day. Works in Akki for Executives, not in the OS. Asks, reads, reasons, drafts, exports. Answers carry supporting evidence, floor confirmations, and what the answer cannot say.
At a limit. Gaps file back as ranked extraction candidates.
Never. Estate configuration, governance rules, approval surfaces, extraction machinery, model registry, or infrastructure.

### E.6 Customer (external)
Uses the Portal to export what they bought, integrate against scoped keys, view activity, manage account. The Portal never reaches beyond their own account.

### E.7 The loop that repeats

Questions arrive → most are answered → those that are not become ranked gaps → gaps become commissioned objectives → extraction changes what the next round can answer.

No class is required to be present for the loop to continue. The practice survives staff changes because the record carries context that would otherwise live in someone's head.



## PART F — DESIGN DOCTRINES (the load-bearing UX rules)

Conversation shapes; the card commits. No governed value is silently committed from dialogue.
Rights surface early, not at checkout. Statements happen in conversation, not at failed commission.
Problems are shown, never hidden. Held batches appear inline where the user is looking.
Refusals name the specific rule in plain words. The specific reason is surfaced, not collapsed. A lawful-basis problem and a floor problem render differently.
Absolute refusals render no approval affordance. Not a disabled button, not a request-override link.
A failed lookup MUST NOT convert a refusal into a fault. DB-2.
Fault surface never shares components with refusal surfaces. DB-2 reinforced.
Extending scope always re-quotes. Never silently folds.
Cancelling requires no reason. Terms were agreed at commission.
Every figure carries its class. Measured vs. estimated is not a footnote; it is on the number.
Every citation resolves, or the result does not persist. Fabricated references have no path to disk.
Narration informs; never instructs. The decision stays with the person reading.
Violations post as plainly as successes. A compliance surface that only shows green is a marketing surface.
Governance content lives only in Govern. Other surfaces link, never duplicate.
The DPO's home is the Trust Center. Everything they need is there.
The Analyst's home is the Extraction wizard + Analyze + Registry. Rules and criteria live elsewhere.
The Master Admin's home is the approval surface. It should be short.
The Operator's home is Connect + Verification Runner. Not governance authoring.
The Executive's home is Akki for Executives. They never see the OS.
The Customer's home is the Portal. They never see the estate.



## PART G — USER STORIES (from A7 delta)

### G.1 Struck (deleted from canon)
"As a Run/Commission Approver, I can approve or return a commissioned objective…"
Any story referencing the Approval Queue as a general gate.

### G.2 Amended
Analyst shaping stories → conversational-wizard phrasing: "by describing what I need in a conversation, watching the objective form as I speak."
Run tracking stories → In progress / Ready vocabulary.
Extracted-Intel browsing story → Ready.

### G.3 New (eight, per A7)

As any user, I can enter through Integrate an App / Export-License Data / Train a Model and reach the same governed conversation pre-set for my intent.
As any user, when my commission violates a rule, I am refused at the Commission card with the specific rule named, so I never wait on a queue to learn the answer.
As a DPO, I resolve held commissions from one surface, so exceptions get one reviewer instead of every run getting one.
As a DPO, commissions above the auto-run ceiling wait for my countersign, so scale of spend keeps a human in the loop by rule, not by queue.
As an operator (e.g., Synisense), I update a protection registry by uploading a sheet, reviewing the diff, and confirming — with removals and edits requiring approval — so protection stays current without ceremony and never weakens silently.
As a DPO, every run records the registry version in force, so I can prove what was protected on any date.
As an engineer, I change engine settings only through version bumps with evaluation verdicts, and promote a setting to a Rule when it genuinely needs runtime control.
As a model trainer, I watch training progress, held-out evaluation, and the six checks compute live, and my accepted model appears in Ready carrying its inherited rights, where I choose to integrate or export it.



## PART H — COMPONENT / UI VOCABULARY

### H.1 Cards
Reflection · Intel · Test · Plan preview · Sample results · Commission.

### H.2 Verdicts (Commission)
Runs now · Refused · Held for a check.

### H.3 Response shapes (Prove)
Not extracted yet (refusal) · Evidence cannot support it (refusal) · Something broke (fault).

### H.4 Rule classes (Estate Rules Record)
Rails · Rules · Engine settings · Registries.

### H.5 Enforcement classes
Enforced · Attested · Monitored.

### H.6 Ceremony stages (Change-a-Rule)
Propose · Counter-sign · Waiting period (with visible countdown) · Apply · Certificate · Re-verify.

### H.7 Registry lifecycle actions (Class D)
Upload · Validate · Diff · Confirm · Version · Rollback · Probe.

### H.8 Refusal grammar tokens
Specific rule named · Criterion that crossed · Value that crossed · Route to approval (escalatable only) · No affordance (absolute).

### H.9 Retired vocabulary (MUST NOT reintroduce to general-user surface)
My Objectives · Run Tracking · Extracted Intel · Approval Queue · Awaiting approval · Run/Commission Approver.

### H.10 Introduced vocabulary
Use Data · In progress · Ready · Held for a check · Use in an app · Export · Put this to work · Trust Center · Rails · Rules · Engine settings · Registries.



## PART I — CURRENT IMPLEMENTATION STATUS (evidence-verified this pass)

### I.1 Frontend page groups path-verified on disk
/app/frontend/src/pages/ contains: compliance/, engineer/, extraction/, master_admin/, operator/, opportunity_briefs/, trace/. Frontend authored in .jsx (not .tsx).

### I.2 Nav-vs-canon alignment


### I.3 Backend engines path-verified on disk (33 service dirs)
artifact_store, auth, census_dimensions, checker, compliance, critic_pass, data_source (+synthetic_assets/), economics, far_endpoint, g1_defensibility (+solva_depth/), generated_gates, health, layer_a (+handlers/), layer_b (+asr/, diarization/, vision/), layer_c, master_admin, mtafiti, multi_instance, northena, opportunity_briefs, outer_gate, partitions, perception (+connectors/, eab_1_pipeline/, gpu_execution/), registry, registry_context, retention, sequencing_harness, service_1, solva_depth (+reasoning/), synisense (+shield/), targeta, transform_forms, v1_harness, v2_gate, v3_harness, wizard.

workbook_analyzer/ (the Analyze acquisition) is NOT PRESENT.

### I.4 Frozen contracts
34 present at Parity 34. Two additions owed for UI-1 execution (per handover [MEMORY]): UseDataWizardSession@v0 (Parity 34→35), CommissionVerdict@v0 (Parity 35→36).

### I.5 Non-OS applications
Akki for Executives — not present as a separate frontend tree.
Customer Portal — not present as a separate frontend tree.

### I.6 Vocabulary transitions still owed
extraction/ → use_data/ (or equivalent) with the three-door router + wizard.
compliance/ → govern/ with the full Trust Center + Registries submodule + Holds surface.
New page groups needed: connect/, registry/, prove/, team/, analyze/.
Public Receipt surface (DPO-only) not identified this pass.

### I.7 UI-1 Execution Atomic (blocked-and-ready)
Stage A doc filed. Owner rulings on E1–E4 locked per handover [MEMORY]. Execution atomic pending Emission 2 (Conformance Matrix v0.2 filing) + Emission 1B completion (docs 4–5).



## PART J — CANON REFERENCES (paths + SHAs where verified this pass)

docs/mandates/akki_operating_model_product_spec_v2.0.md — SHA 20b4d305c26c1054c6c5cf49ae4d542a16e3579b2eddea1bdc04ec6450ceee4f
docs/mandates/akki_role_register.md — SHA 471e1f4e578ec7aadf6edff11e898f44c459bfccdf7d63ddd3ee283fc0b65bd7
docs/mandates/akki_analyze_codebase_acquisition_v1.0.md — SHA 76b2998e7b9075efd703fbd246d1dd048a4bfe6c5af7d1818973fe3e2a2ebd7d
docs/rulings/owner_change_order_2026-07-25.md — SHA [MEMORY] (Pass-3 SHA read did not land)
docs/rulings/owner_brief_blinded_assessment_2026-07-25.md — SHA c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17
docs/registers/artifact_manifest.md — 25 rows, disk-verified
docs/mandates/RMS_UI_Specification_v2_2.md — 34 261 B, NOT re-read this pass (would firm §D.2, §D.7)
docs/mandates/RMS_UX_Architecture_v2.md — 10 956 B, NOT re-read this pass
docs/mandates/surface_journey_map_v1.md — 10 017 B, NOT re-read this pass (would firm §E)
docs/stage_a_proposals/ui_1_stage_a.md — 100 032 B, NOT re-read this pass (would firm §D.3.1–D.3.7 execution detail)
docs/mandates/module_specs/*.md — 20 files, NOT re-read this pass



END OF BRIEF v1

Version 1 · composed 2026-07-27 · will be superseded by v2 once the four unread canon files above are read verbatim and their content is folded in. This v1 is fit for design + engineering handoff on the surfaces defined by operating-model v2.0 + change-order A1–A8.


| Nav | Master Admin | DPO | Operator | Analyst | Executive | Customer |
| Connect | R + Add | R | R + Connect/Test/Retry | R | — | — |
| Registry | R | R | R | R + interact | — | — |
| Use Data | R + Approve escalations | R + Resolve holds | R + Setup integrations | R + Commission | — | — |
| Govern | R (record) | R + W (all) | R (record) | R (record) | — | — |
| Prove | R + Ask | R + Ask + Audit | R + Ask | R + Ask | — | — |
| Team | R + Grants | R (record) | R (self) | R (self) | — | — |
| Analyze | R (their workspaces) | R (audit-only, no analyst data reads) | R (workspace lifecycle only) | R + W (own + invited) | — | — |


| Card | When it appears | What it carries |
| Reflection | First, and always visible | The objective as currently understood: need · scope · evidence floor · rights · output form. Each field marked set / open / assumed default. The user watches their words become the objective. |
| Intel | As scope is established | What the registry knows about the scope: holdings · condition · languages · reusable stock already produced · coverage the index projects · gaps stated plainly. |
| Test | At the natural moment (offer, not push) | Parameters tested against a sample, returning observed quality and cost per thousand. Every test run is receipted. A winning configuration promotes into the Reflection card in one action. |
| Plan preview | When the schema is complete enough to plan | Volume as a range · expected coverage · what cannot be covered · cost as a range · editable budget ceiling with the note "the run halts at the ceiling and nothing past it is billed." |
| Sample results | After a representative slice runs | Observed against planned — facts per document · verification pass rate · cost per thousand — before full commitment. |
| Commission | Last | The structured, ledgered act: evidence floor · rights · budget ceiling · price with validity and cancellation terms · acceptance. Each confirmed explicitly, then committed. |


| Verdict | User sees | What follows |
| Runs now | All checks passed with the receipt reference. | Work appears in In progress and begins. |
| Refused | The specific rule named in plain words, in the conversation. Escalatable refusals state the criterion and route to approval; absolute refusals state the bar and offer no route. Refusal MUST render no approval affordance where none exists. | Nothing is committed. |
| Held for a check | Checks passed but a declared flag condition tripped, or the work exceeds the A2.3 auto-run ceiling. Stated plainly with the reason. | A single reviewer resolves it from Govern. Both outcomes are logged. Originating surface reflects the resolution. |


| Class | Meaning | What the record shows |
| Enforced | A check runs, fails closed, and emits a receipt. | Live check result and its receipt. Enforcement and violation counts. |
| Attested | Held by a recorded human act — signature, instrument, counter-signature. | Attestation artefact, signatories, date. No enforcement count, because there is no check to count. |
| Monitored | Measured and reported, but does not block. | Observation log, with non-blocking status stated plainly. |


| Class | Name | Develop | Deploy | Operate | Verify |
| S | Rails | Authored as code + contract | Build-phase only; never runtime-editable | Read-only in Estate | Test suite; a rail without a hard-fail cell does not exist |
| O | Rules | Defined with type, bounds, recommended default | Set at Connect, locked at approval | Change-a-Rule only | Live test packs, per rule |
| E | Engine settings | Declared with success parameters | Pinned per engine version | Engineers, via versioned deployment | Version-bump evaluation verdict |
| D | Registries | Schema defined once; rules reference by version | Initial load at Connect or first upload | §D.4.4 lifecycle | Validation report + live probe pack |


| Shape | What appears | Content | Queue offered? |
| Not extracted yet (a refusal) | Refusal styling | States the gap plainly, the estimated effort to close it, and offers to queue the work. Queuing opens the Use Data conversation pre-seeded; the originating answer updates to show where the work went. | Yes |
| Evidence cannot support it (a refusal) | Same refusal styling | States the specific reason in plain language in the honesty strip: no lawful basis for this use; the defensibility floor not met; the group too small to report. | No — more extraction would not help. |
| Something broke (a fault, NOT a refusal) | Fault styling — own channel, colour, layout. Never shares components with the two refusals. | Never assigned a refusal reason. | N/A |


| Canon module (post-A1) | Current disk name | Vocabulary status | Estimated fit |
| Connect | not path-named at top | pre-A1 (likely inside operator/ / engineer/) | Present under legacy name; needs surfacing |
| Registry | not path-named at top | — | Not surfaced at top |
| Use Data | extraction/ | pre-A1 vocabulary ("extraction"), needs rename | Present under legacy name; three doors + wizard [MEMORY] unverified |
| Govern | compliance/ | pre-A1 vocabulary ("compliance"), needs rename | Present under legacy name; Trust Center + Registries + Holds unverified |
| Prove | not path-named | — | Not surfaced |
| Team | not path-named | (may be inside master_admin/) | Not surfaced explicitly |
| Analyze | not path-named | — | Not surfaced (acquisition not yet lifted) |
| Master Admin approval surface | master_admin/ | present | Surface present; card layout unverified |
| Engineer surfaces | engineer/ | present | Surface present |
| Trace / walk-a-proof | trace/ | present | Surface present; alignment to Prove D.5.2 walk-a-proof unverified |
| Opportunity briefs (Registry pre-seed) | opportunity_briefs/ | present | Feeds Use Data wizard per D.3.1 |
