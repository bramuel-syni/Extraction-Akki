AKKI · GOVERNED ARTIFACT · PRODUCT SPECIFICATION
Operating Model & Product Specification v2.0
How governance is settled and enforced, what each surface does, and the journey each class walks · July 2026
Purpose. This specification defines Akki's operating model and the surfaces that carry it: how governance is defined, approved, and executed; what each module does; how work is refused; and the journey each class of user walks. It stands alongside the Role Register, which defines the classes themselves. It is written for product, design, and engineering, and assumes no prior context. Normative language: MUST / MUST NOT / MAY. §1 governs everything that follows; nothing in §§3–10 makes sense without it.
# §1 — The operating model
Akki does the specialist work. People hold authority over it. The system performs the census, the extraction, the qualification, the masking, the measurement, and the record-keeping. What it requires from people is authority: someone to define the rules it enforces, someone to approve them, someone to set it up, and someone to direct what intelligence it produces.
## 1.1 · Define, approve, execute
The governance cycle has exactly three steps, and only the first two involve people.
Define. The Data Protection Officer defines the governance rules: masking policy, retention obligations, rights ceilings, privacy floors, deletion requirements, and the approval criteria — the thresholds of cost, sensitivity, and rights class above which work must escalate.
Approve. The Master Admin approves the defined rule set and criteria. This is a single consequential act, not a recurring one.
Execute. From that moment the system enforces the rules on every operation, automatically, with no person in the path. Permitted work runs. Work that would cross a criterion is refused at the boundary with its reason stated. Every operation writes a receipt.
No human is an operating gate. The DPO does not approve a data pull. The Master Admin does not sign off an integration call. An analyst running a query does not wait for anyone. Placing a person in the runtime path would create friction at exactly the moment the organisation needs speed, and would make governance the thing people learn to route around.
Updating a rule re-runs the define-and-approve steps — never the work. When policy changes, the DPO redefines, the Master Admin approves through the change ceremony, and the new rule binds every subsequent operation. Work already completed under the prior rule remains on the record with the rule version that governed it.
## 1.2 · What requires approval
Anything that changes what the system is or does requires Master Admin approval. Anything that uses the system as configured does not.

The system classifies the action, not the person. Nobody needs to know in advance which side of the line their request falls on. A pull inside the envelope executes immediately. A pull that would cross a criterion is refused at the boundary, and the refusal states why.
## 1.3 · How work is refused
Refusal has two shapes, and the distinction is load-bearing. Treating them as one implies that anything can be approved past.
### Refused-escalatable
Work crossing a criterion the organisation set — cost, volume, sensitivity class. The refusal states the criterion, the value that crossed it, and routes to the approval surface. Someone can approve; the system says who.
### Refused-absolutely
Work barred by a condition no seat can lift — an internal-only source feeding a commercial export, an output below the aggregation floor, material under retention hold facing deletion. The refusal states the bar and where it comes from: the source's licence class, the floor value, the hold instrument. It offers no approval route, because none exists.
An absolute refusal MUST render no approval affordance at all — not a disabled button, not a request-override link. An affordance implies approvability. The only path forward is changing the underlying condition out of band — renegotiating the licence, establishing a different legal basis — which is a legal act, not an approval, and re-enters the system as a new rights posture on the source.
The Master Admin's approval authority is bounded. They approve against criteria the organisation set. They cannot approve against rights the organisation does not hold.
## 1.4 · Separation of duties
Three separations are enforced by the system rather than requested of the organisation.
The Operator cannot approve the connection they built. Setup and authorisation are different acts held by different classes.
The Analyst cannot approve their own over-threshold work. Escalation exists precisely for the case where the person doing the work should not be the person authorising its cost or sensitivity.
The DPO defines rules but does not approve them. Definition and authorisation are separated so that a governance change carries two signatures, and a rule change additionally requires a counter-signature and an enforced waiting period.
## 1.5 · The constitutional seats
Master Admin and DPO are constitutional seats. Because the Master Admin approves access generally, their own succession cannot run through ordinary access management. Succession for both seats is a distinct act.
An out-of-band instrument is required — a signed appointment from a named organisational authority: a board resolution, an executive appointment, or the organisation's equivalent. It is recorded to the ledger as the founding authority for that seat, in the same class as the initial setup record.
Two parties in system. The instrument plus a counter-signature from the other constitutional seat. The DPO plus the instrument seats a new Master Admin; the Master Admin plus the instrument seats a new DPO.
Neither seat may appoint or remove itself, and neither may unilaterally appoint or remove the other without the instrument.
Vacancy is a declared state. A vacant constitutional seat appears on the Trust Center, and approvals requiring it queue rather than falling through to another authority.
The honest boundary. The system can require that an instrument exists, is recorded, and is attributable. It cannot validate that instrument's authenticity. That is where organisational governance takes over, and the system's contribution is making the act permanent, visible, and attributable after the fact.
## 1.6 · Three duties that attach rather than classes
Each attaches to a class at onboarding, and the organisation decides which.
Approve-to-run. Where an organisation wants a human confirmation before commissioned work executes, this duty attaches — typically to the Master Admin. Where the approval criteria are trusted to do the work, it is not enabled. Enabling it for routine work reintroduces the friction the operating model removes, and this specification recommends against it.
Release outbound. Where rules require a person on deliverables leaving the organisation, this duty attaches — typically to the DPO for rights-sensitive material or the Master Admin for commercial material. The criterion that triggers it is defined by the DPO like any other.
Confirm structured mappings. Attaches to the Operator by default; may attach to a data engineer working alongside them during onboarding.
Why these are duties rather than classes. Each is real work that some organisations require and others do not. Making them standing classes would force every deployment to staff seats it may not need.
# §2 — What changed
For readers who know the earlier model, six positions are different.
# §3 — Use Data
What it is for. Turning what the estate holds into something the organisation uses — an application running on governed intelligence, a dataset shipped under its rights, or a model the organisation owns. One conversation shapes the work; one card commits it; one pipeline carries it.
## 3.1 · Three doors
The landing is an intent router with three doors. Each opens the same conversation, pre-seeded for that intent.

Rights surface early, not at checkout. On the Export door, the agent states the rights posture of the scope as soon as the scope is known — that a slice is internal-plus-partner and may ship to partners but not be sold commercially, for instance. An internal-only scope triggers that statement in conversation, not a failed commission later.
Training rights are inherited and said aloud. Training on internal-only material produces an internal-only model. The conversation states this when the scope is set, because it determines what can be done with the result.
## 3.2 · The wizard is a conversation
The user shapes the objective by talking to an agent familiar with the estate. The wizard's steps are the schema behind the conversation, not screens: the agent asks only for what the dialogue has not yet established, in whatever order the conversation naturally takes.
Once substance exists, the surface splits — conversation on one side, cards on the other. Cards render and update live as the dialogue fills the schema.

Conversation shapes; the card commits. Every governed value — evidence floor, rights posture, budget ceiling, price, acceptance — is confirmed on the structured commission card. None is inferred from dialogue and silently committed. The objective contract is identical beneath both interaction shapes; the schema is the same schema.
Parameter testing is not a door. It folds into the conversation as the Test card. There is no separate test surface in navigation.
Pre-seeded entries. An opportunity in the Registry and a gap filed from an unanswered question both open this same conversation, with the Reflection card already partially filled.
## 3.3 · What happens at commit
The commission card evaluates the work against the rules and returns one of three verdicts, each receipted.

The checks are five, machine-evaluated, and fail closed: rights compatibility between the requested output and the source's usage rights; the privacy floor over the requested scope; the masking and pseudonymisation posture, resolvable over that scope; a budget ceiling present and within any organisational limit; and scope resolvable to sources that are connected and censused. Anything the rules cannot classify holds rather than runs.
## 3.4 · In progress, and Ready
Beneath the doors, the pipeline appears as two sections.
### In progress
Each row carries the name, the door it came through, plain status, cost against ceiling, and any hold rendered as held for a check with its reason in plain words. Opening a row shows the work in the shape appropriate to its door: batch progress with the basis of the percentage for extraction; staged progress for a training run.
Problems are shown, never hidden. Held batches appear inline where the user is looking, with the reason stated. Resolution happens in Govern; the status returns here when it resolves.
Extending scope always re-quotes. Extending re-opens the conversation on the scope field and generates a new quote for the addition. It never silently folds into the running work.
Cancelling requires no reason. It references the cancellation terms already agreed at commission, halts queued work, retains what has completed, and is logged.
### Ready
Every finished artefact carries two actions — use it in an app, or export it — with rights checked at the moment of click rather than hidden upfront. Where an export is permitted and licensable, the price is shown and the receipt logged. Where it is blocked, the message states why and that the attempt itself is receipted.
The training output choice lives here, at the artefact. An accepted model appears in Ready like any other artefact, carrying its inherited rights, offering the same two actions. There is no fork inside the wizard, because one decision deserves one commitment point.
# §4 — Connect
What it is for. Making the estate real to the system, and proving it reads correctly before anything counts on it. Connect speaks infrastructure — state, protocol, endpoint, cadence, health — in the vocabulary a technology owner already uses.
## 4.1 · The standing surface
One page. No tabs. In order:
The headline, in two states. While sources remain unconnected: how many are declared, connected, and awaiting. Once all are connected: the steady-state health line. Same slot, no layout change.
The status banner. Configuration locked, who signed it and when, the deployment target, and the primary regulator — with one link to the locked configuration as a read-only record.
Three cards. Connections healthy against total; last sync; egress posture.
The record. Source, protocol, cadence, state. Protocol in the familiar form — a database endpoint, a transfer host, an object-store endpoint, a network share. Cadence in plain words. State as one of connected, in progress, awaiting credentials, or failed. Clicking a row opens that source's profile.
The footer. Where credentials are held, who signed off the connections, and one link out: data use rules live in Govern.
No governance content appears on this page. Rules, usage rights, protection registries, and role duties live in Govern. Connect links to them and never duplicates them. A second copy of a governance surface is a second source of truth, and one of them will be wrong.
Role-conditional actions. The Master Admin adds a source, which enters as pending. The Operator connects, tests, and retries. Other classes read.
## 4.2 · The source profile
Everything about a source's mechanism lives on its own profile, reached by clicking it — never on the landing.
Mapping leads with the answer, not the apparatus. The profile states how many fields are confirmed and how many need a human. Those needing attention appear as plain-language questions with their resolution control attached — that values look like branch codes in some rows and like teller identifiers in the rest, for instance, and that the system will not guess between them. The full field list sits collapsed behind a link.
Why this step exists. A wrong mapping is consistently wrong at scale and produces no error signal anywhere downstream. It is the step most often skipped in conventional projects and the one that prevents the most expensive silent failure available.
Who acts. The Operator resolves. Every other class sees the same summary read-only, with who confirmed it and when.
# §5 — Govern
What it is for. Holding the rules, proving they fire, and carrying the acts that require human authority. Govern is the DPO's home and the organisation's evidence that governance is enforced rather than described.
## 5.1 · The Trust Center
Two halves. On one side, the rule inventory: every rule in force with its current setting, who set it, when, and the checks enforcing it. On the other, the record: refusals by class with their reasons, holds with their resolution, masking activity and any recall breach, access events across people and applications, deletions with their certificates, rule changes with their ceremony stage, and per-application memory activity.
Violations post as plainly as successes. A compliance surface that only shows green is a marketing surface. Every violation carries its disposition, and the DPO's work is dispositioning them — not discovering them, because the system surfaces them automatically.
## 5.2 · Enforcement class
Every rule in force carries an enforcement class, displayed. A surface that conflates a running check with a human promise invites the DPO to defend a number they cannot decompose.

Class is derived from the rules taxonomy, never hand-set. A field someone types would make the honesty claim itself unverifiable.
No class is presented as superior. An appointment instrument cannot be a running check and should not pretend to be. The surface reports the class; it does not editorialise, and nothing in it urges converting one class into another.
## 5.3 · Changing a rule
A rule is never edited in place. The DPO proposes with a reason; the Master Admin counter-signs; an enforced waiting period runs with a visible countdown during which the change can be cancelled; then it applies, with a change certificate on the record. Completion triggers re-verification, because a changed rule should be demonstrated firing rather than assumed to fire.
## 5.4 · Registries
Governed reference data — protected-term lists and their equivalents — has its own surface, and it remains as ordinary as uploading a spreadsheet, because it is operated weekly rather than annually.
The lifecycle: upload, validate with row-level errors and fail closed on malformed input, review the difference as added, removed, and changed, confirm, then version with an effective-from stamp and a rollback path. Every run records which registry version was in force.
The asymmetry is deliberate. Additions take effect immediately. Removals and edits require approval. Adding protection is safe by direction; removing or editing an entry is the only change that can weaken the shield, and it is the change a mistake or a bad actor makes.
Why versioning matters more than it appears to. Without it, the question "was this term protected on the third of March" has no answer, and that is the question an audit asks.
## 5.5 · Holds
Anything the rails hold — a batch that tripped a threshold, a commission that flagged — appears here with the rail that fired, the evidence, and the proof trail. A single reviewer releases it or confirms the rejection. Both outcomes are logged, and the originating surface reflects the resolution.
# §6 — Prove
What it is for. Answering questions of the estate with evidence attached, and being honest in a specific way when an answer cannot be given.
## 6.1 · Three response shapes
Where an answer cannot be given, one of three shapes appears. They MUST be visually distinct and never conflated.
Not extracted yet — a refusal. States the gap plainly, the estimated effort to close it, and offers to queue the work. Queuing opens the Use Data conversation pre-seeded, and the originating answer updates to show where the work went.
Evidence cannot support it — a refusal. States the specific reason in plain language in the honesty strip: no lawful basis for this use, the defensibility floor not met, the group too small to report. No queue option, because more extraction would not help.
Something broke — not a refusal. A fault surface, carried on the fault channel, in its own styling. It never shares components, colour, or layout with the two refusals, and it is never assigned a refusal reason.
The specific reason is surfaced, not collapsed. A lawful-basis problem is a governance fact; a floor problem is a data-sufficiency fact. Rendering both as one message loses what the reader needs. Where a supporting detail cannot be retrieved, the refusal still renders without it — a failed lookup MUST NOT convert a refusal into a fault.
## 6.2 · Walking a proof
Any answer descends from the claim, to the reasoning that produced it — candidates considered, contradiction and corroboration checks, how probability was weighed — to the raw verified facts underneath, each linked back to its source. Closing returns the reader to exactly where they were.
# §7 — Analyze
What it is for. A workspace for the people who do quantitative work — data scientists, machine-learning engineers, analysts. They bring their own material, run analysis on it, and prepare the evidence behind decisions the organisation is going to make.
## 7.1 · Ownership and collaboration
A workspace has one owner. Ownership is personal and explicit, because accountability for what is in a workspace has to rest somewhere specific.
The owner invites collaborators, who work in the workspace without owning it. Co-working is normal; ownership is not shared by working alongside.
Material belongs to the workspace, not to whoever uploaded it. The alternative produces a tangle of who may see what inside a space people were deliberately invited into.
Ownership transfers by act, not by absence. A workspace outlives its owner's employment: a departing owner's work neither vanishes nor becomes ownerless, and the transfer is recorded like any other change of authority.
## 7.2 · The locality rule
Material brought into a workspace stays in it. It is not censused, not extracted from, not visible to another workspace, and it does not become estate material by virtue of being present in the system.
Estate material may be drawn into a workspace. Nothing flows the other way by default. The direction is deliberate and it is the whole of the rule.
Why it holds. A vendor's paper, a licensed sample, a working spreadsheet from elsewhere — each carries someone else's licence. Material that acquired the estate's rights posture by sitting in the same system would be the platform manufacturing rights it does not hold, which is the one thing an operating system built on provenance cannot do.
## 7.3 · What the workspace does
Workbooks are parsed into sheets, columns, and typed cells. From there: deterministic signal extraction, simulation on a numeric column, forecasting on a date-and-value pair with a threshold below which it declines rather than guesses, anomaly detection with a stated rationale, and cited report export.
Three properties hold across all of it. Every figure carries its class — measured or estimated — because a simulated projection and a counted total are different kinds of number. Every citation resolves against the parsed source, or the result does not persist, so a fabricated reference has no path to disk. And narration reports what was found without instructing the reader what to do, because the decision stays with the person.
## 7.4 · Prework and the approval path
A workspace is where the evidence for a consequential approval is assembled — most often the case for deploying a new base model, which requires Master Admin approval before it enters the system. The approval is granted on the evidence; the workspace is where that evidence was built and where it remains inspectable afterwards.
## 7.5 · Promotion into the estate
Where workspace material should become estate material — a cleaned corpus, a labelled set, material an organisation wants censused and drawn on — it is promoted by the same act that adds any estate source: Master Admin approval, with the rights posture declared at the moment of promotion.
There is no lighter path, because promotion is precisely the act of granting material the estate's standing, and that is a change to what the system is rather than a use of it as configured.
# §8 — The rules taxonomy
Four classes share one record shape and one surface. They differ in who may change them, how fast they change, and how a change is verified — which is what makes them different objects rather than one object with different labels.

Runtime tunability has exactly one path. An engine setting that genuinely needs operational control is promoted to a rule: the engine owner files what the parameter is, why it needs runtime control, and its blast radius; it enters the rule registry with type, bounds, and a recommended default; it leaves engine-pinned configuration at the next version bump; and thereafter it changes only through the rule-change ceremony. Until promotion completes, no runtime edit exists. Demotion requires the same ceremony. There is no third path, because "it is only an engine setting" is otherwise the route around every rule.
# §9 — Training and acceptance
Acceptance is automatic and non-negotiable. A model must beat its base on the target stratum, damage nothing else beyond bound, evaluate on held-out uncurated material, carry complete lineage with inherited rights, calibrate, and ship with an evaluation card. A model that fails does not enter the registry. No person is in the path.
## 9.1 · What the analyst watches
A training run is not an extraction run and does not render as one. Its detail shows staged progress — data preparation, training, held-out evaluation, check computation — with the current stage live; the candidate's error rate against its base as checkpoints land; and each of the acceptance checks moving from pending to measuring to settled, with its real number. Training batches that trip a rail are held for a check like any other work, visible inline.
Lineage is visible, including what failed. A rejected version stays on the shelf permanently with its reason. Resubmission creates the next version in the same lineage and re-runs the checks. Surfacing failure rather than hiding it is what makes the accepted version's numbers mean anything.
## 9.2 · Blinded comparison
Where two candidates are compared to decide which is adopted, the comparison is scored blind: arm identity concealed at scoring, outputs presented in randomised order and normalised to remove arm-identifying form artefacts, identity unsealed only after scores are fixed, and a leakage check before unsealing.
Concealing the label alone is insufficient. Identity leaks through form, ordering, and length as readily as through a name. A protocol that hides the name and leaves the fingerprint satisfies its own wording and defeats its own purpose. The leakage check is one probe: can the arm be identified above chance from the blinded outputs?
## 9.3 · Standing coverage
The training specification carries a coverage section listing the functions a training system must hold — precise feedback, blinded assessment, lineage certification, adversarial judgment, deployment-authentic evaluation, indexed retrieval, frozen core with edge adaptation, and verified succession — each mapped to the mechanism in force and the check that binds it.
It re-fires at every training-engine version bump. Coverage erodes silently across versions: a refactor that drops deployment-authentic evaluation or breaks lineage continuity is exactly what this catches, and a single check at landing catches it never. Any proposed new training mechanic declares which function it serves — one line, which filters both redundancy and additions that serve no function at all.
# §10 — The memory layer
What the operating system is to an application that integrates with it: a memory layer. The application holds an objective. The operating system holds context. The application pulls what its objective requires and consumes it. The operating system knows the objective; it does not know the application, what it renders, or what it does with what it receives.
## 10.1 · Keys and objectives
A key is an independent entity, bound to one clearly defined objective servicing a defined flow.
The objective is the unit of change. Adding to what the flow does, removing from it, or reordering it is a new objective. Nothing is edited in place.
The key persists across objective versions where its holder wants continuity of identity. What it is bound to is versioned beneath it.
A thousand integrations are a thousand independent entities. Each resolves to an objective version, a memory plane, and a rights envelope. None can see another.
## 10.2 · Two memories, separated by provenance
What may be reused across keys and what may not is decided by where the material came from, and it is decided when the material is written rather than when it is read.

Where provenance is mixed or unclear, the material stays in the plane. A derivation shaped partly by estate material and partly by a customer's framing is not split by judgement: the estate may take the fact stripped of the framing, and the framing never travels. Failing closed toward the customer's thinking is the only defensible default while the law around it is unsettled.
The consequence in practice. Key B never learns that key A asked, what it asked, or the shape of its inquiry — even where B's answers improve because extraction that A's questions provoked has enriched the estate.
## 10.3 · What an objective change does
A changed objective is a new objective, and it re-passes the checks. Prior mind context does not carry forward automatically; carrying it is an explicit choice made at commissioning and re-evaluated against the new objective's rights and scope.
Why it is not automatic. Automatic carry-forward would let a narrow objective inherit context accumulated under a broad one, which is scope creep arriving through memory rather than through permission.
## 10.4 · What crosses
The operating system answers a context request under the masking and rights in force, or refuses. A retrieval refusal states what could not be given and why, completely and honestly.
What an application does with a refusal is the application's business. The operating system imposes no rendering behaviour on its consumers. With a thousand integrations it could not enforce one, and a rule it cannot enforce is a rule it should not claim. Its obligation is to answer honestly and completely, and that obligation it keeps.
Every call lands in the record the DPO reads, whichever key made it and whatever it was for.
## 10.5 · The seam contract
One surface, identical for every consumer, settling three things: every field that crosses, named and typed and classed; latency classes per operation with bounds, because one promise across operations of different shape guarantees a broken promise; and identity enforcement at the seam itself rather than downstream of it.
# §11 — Journeys
How the classes work the surfaces, and how the surfaces interlock.
## 11.1 · Master Admin
Founding. With the DPO, walks setup: organisational identity, contacts, the deployment target, the source list with rights held on each. Approves the rule set and the criteria the DPO has defined, and approves the first estate connections. The instance is live.
Ongoing. The approval surface is the working queue and it should be short. Each item states what is being asked, which criterion it crossed, what it will cost or touch, and who requested it. Approve or decline with a reason; both are ledger events.
Periodic. Review the criteria with the DPO. A queue consistently empty means the criteria may be too loose; a queue consistently full means they are too tight. The criteria are the instrument; the queue is its reading. If the same class of item arrives repeatedly, the correct response is to redefine the criteria — not to work through the queue faster.
## 11.2 · Data Protection Officer
Founding. Defines the rule set and the criteria in plain language, with recommended defaults presented for each. Runs the verification packs — plain-language demonstrations of each rail firing, each showing its proof — and signs the commissioning record. This is the moment the organisation's own governance is demonstrated working rather than described.
Ongoing. Watches the Trust Center on their own cadence. Dispositions violations. Answers questions from the business and from auditors by walking proofs rather than by investigation. Maintains protection registries: upload, review the difference, confirm — with removals and edits gated.
On policy change. Redefines the affected rule and routes it through the ceremony: counter-signature, waiting period with a visible countdown, then application. The change and its full history remain on the record permanently, and the rails are re-verified after it applies.
On regulatory contact. Exports the regulator pack — rules in force with their enforcement class and counts, the record for the period, ceremony histories, destruction attestations, and proof trails for nominated operations — generated from the record rather than assembled by hand.
## 11.3 · Operator
Setup. Source by source: connect, test, confirm the mapping on the source's profile, label rights. Then run the verification packs with the DPO present. Then the census runs and the estate becomes measured — the Operator's work is what makes that measurement possible.
Integration. For each approved application: commission the objective, configure the memory plane, issue the scoped key, register the webhook, make the test call, and confirm it appears in the record. Hand the credentials to the application's team.
Steady state. Monitor runs and holds. Connect new sources as they are approved. Re-run verification after any rule change, because a changed rule should be demonstrated firing rather than assumed to fire.
## 11.4 · Data Analyst / Scientist
First contact. Read what the estate holds, in what condition, with what rights, and what has not been measured. Read the first quality measurement on the organisation's own material, which says which strata are workable today.
Commissioning. Pick the door that matches the intent, and talk. Watch the Reflection card fill as the objective takes shape and the Intel cards say what the estate holds against that scope. Test parameters on a sample if the conversation warrants it. Review the plan, run a sample, then confirm the commission card — where the evidence floor, the rights, the ceiling, and the price are all explicit. Work inside the envelope runs immediately.
Working cycle. A question arrives from the business. If the registry can answer it, answer. If it cannot, the gap is filed with its evidence and becomes an extraction candidate. Commission against the ranked gaps, analyse what returns, produce the work product. Where enough qualified material has accumulated, train an adapter; acceptance runs automatically and the accepted model appears in Ready with its inherited rights.
Compounding. Each cycle produces cleaner material, which trains better models, which mine the next cycle more accurately. The role shifts over time from extraction toward analysis, because the material increasingly already exists.
## 11.5 · Executive user
Every day. They work in an application, not the operating system. They ask, read, reason, draft, and export, and the answers carry what supports each claim, the evidence behind it, the privacy floor held, and what the answer cannot say.
At a limit. Where material exists but has not been extracted, the gap files back and becomes a ranked extraction candidate. Where evidence cannot support the claim, the answer says so and offers nothing, because more extraction would not help.
Never. Estate configuration, governance rules, approval surfaces, extraction machinery, the model registry, or infrastructure. This class holds no authority over the system and requires none. They never wait for an approval, because everything their application is permitted to do was settled when its objective was approved.
## 11.6 · The loop that repeats
Questions arrive; most are answered; those that are not become ranked gaps; gaps become commissioned objectives; extraction changes what the next round can answer. No class is required to be present for the loop to continue, which is what allows the practice to survive staff changes — the record carries context that would otherwise live in someone's head.

What the model comes down to. Governance is settled in advance and enforced by the machine, so no person stands in the runtime path. Where the machine must refuse, it says which kind of refusal it is and whether anyone can lift it. Where a human act is genuinely required — appointing an authority, changing a rule, releasing something outbound — the act is deliberate, attributable, and permanent. Everything else runs.

| Requires approval — changes system function | No approval — uses the system as configured |
| A new estate source or connector | Pulls, queries, and analysis inside an existing envelope |
| A new base model deployed into Akki, including an analyst's own | Training runs on registered bases within approved thresholds |
| A new application integration — key, scope, memory plane | Calls from an already-integrated application |
| The rule set and the approval criteria themselves | Commissioning objectives of an established class within budget |
| A new objective class or output type the system has not produced before | Analyse sessions — signal extraction, simulation, forecasting, anomaly detection, report export |
| Access grants and revocations | Everything an integrated application does inside its objective |
| Any single piece of work exceeding a cost, sensitivity, or rights criterion | Any work inside those criteria |


| Subject | Previously | Now |
| Governance Co-Signer and Sponsor | Two standing seats with two-party and three-party attestation over governance authority | Collapsed. Rule-change counter-signature is held by the Master Admin. Constitutional succession is §1.5. |
| Setup sign-off | The DPO signs and locks the configuration | The DPO defines; the Master Admin approves. Definition and authorisation are separated. |
| Model acceptance | A person accepts or rejects a trained model | Automatic and non-negotiable. A model failing acceptance does not enter the registry. |
| Release review | A mandatory gate on everything outbound | An attachable duty per §1.6. |
| Work approval | Commissioned work passes an approval queue before running | Define, approve, execute. Criteria are enforced by the machine at the boundary. |
| Vocabulary | Data Engineer · the DPO's Estate · Extract · My Objectives · Run Tracking · Extracted Intel | Operator · Trust Center · Use Data · In progress · Ready |


| Door | What the conversation covers | What the commission card confirms |
| Integrate an App | Which application or agent workflow; what scope of intelligence it reads; what it may remember; access level | Scope · access level · masking enforced · memory-plane terms · price and terms where applicable |
| Export / License Data | What is wanted and from where; the rights posture of that scope, stated as soon as scope is known; format and delivery | Scope · format · rights posture · price where licensable · delivery terms |
| Train a Model | Base model and its licence class; training-data scope with inherited rights; evidence floor; target capability in plain words; the held-out slice the model never sees | Base and licence · data scope and inherited rights · evidence floor · budget ceiling · acceptance terms |


| Card | What it carries, and when it appears |
| Reflection | First, and always visible. The objective as currently understood: need, scope, evidence floor, rights, output form — each field marked set, open, or assumed default. The user watches their words become the objective. |
| Intel | As scope is established. What the registry knows about the scope under discussion: holdings, condition, languages, reusable stock already produced, coverage the index projects, and gaps stated plainly. |
| Test | On offer at the natural moment. Parameters tested against a sample, returning observed quality and cost per thousand. Every test run is receipted. A winning configuration promotes into the Reflection card in one action. |
| Plan preview | When the schema is complete enough to plan. Volume as a range, expected coverage, what cannot be covered, cost as a range, and an editable budget ceiling carrying the note that the run halts at the ceiling and nothing past it is billed. |
| Sample results | After a representative slice runs. Observed against planned — facts per document, verification pass rate, cost per thousand — before full commitment. |
| Commission | Last. The structured, ledgered act: evidence floor, rights, budget ceiling, price with validity and cancellation terms, and acceptance — each confirmed explicitly, then committed. |


| Verdict | What the user sees, and what follows |
| Runs now | All checks passed, with the receipt reference. The work appears in In progress and begins. |
| Refused | The specific rule named in plain words, in the conversation. Escalatable refusals state the criterion and route to approval; absolute refusals state the bar and offer no route. Nothing is committed. |
| Held for a check | Checks passed but a declared flag condition tripped, or the work exceeds the auto-run ceiling. Stated plainly with the reason. A single reviewer resolves it from Govern. |


| Class | What it means | What the record shows |
| Enforced | A check runs, fails closed, and emits a receipt | The live check result and its receipt. Enforcement and violation counts. |
| Attested | Held by a recorded human act — a signature, an instrument, a counter-signature | The attestation artefact, its signatories, and its date. No enforcement count, because there is no check to count. |
| Monitored | Measured and reported, but does not block | The observation log, with its non-blocking status stated plainly. |


| Class | Develop | Deploy | Operate | Verify |
| Rails | Authored as code and contract | Only through a build; never runtime-editable | Not operable — observable only | A hard-fail check; a rail without one does not exist |
| Rules | Defined with type, bounds, recommended default | Set at setup, locked at approval | Propose, counter-sign, wait, apply, certificate | Live test packs, per rule |
| Engine settings | Declared with their conditions of success | Pinned per engine version | Engineers, through versioned deployment | The version's evaluation verdict |
| Registries | Schema defined once; rules reference by version | Initial load at setup or first upload | Upload, validate, difference, confirm, version | Validation report and a live probe on drawn entries |


| Memory | What it holds | Who benefits |
| Estate memory | Anything derived from the estate itself — extracted facts, verified intelligence, indexes | Shared substrate. Every key benefits, and work provoked by one enriches the estate for all. |
| Mind context | Anything derived from the interaction — what was asked, how it was framed, the reasoning trail, what the flow retained | The customer's thinking, and their property. Bound to the key's plane at the moment it is written. It never crosses. |
