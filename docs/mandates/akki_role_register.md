AKKI · GOVERNED ARTIFACT · ROLE REGISTER
Role Register & User Journeys v1.0
The six user classes, the authority each holds, what the system does for them, and how each works with Akki · July 2026
Purpose. This register defines who uses Akki, what each class is accountable for, and the journey each walks. It is written for product, design, and engineering, and assumes no prior context. Normative language: MUST / MUST NOT / MAY. §1 states the operating model that governs every journey in this document; nothing in §§3–10 makes sense without it.
# §1 — The operating model
Akki does the specialist work. People hold authority over it. This is the design decision the whole register follows from, and it distinguishes Akki from conventional enterprise software, which distributes labor across roles and gives each a queue. Akki does not distribute labor. It performs the census, the extraction, the qualification, the masking, the measurement, and the record-keeping itself. What it requires from people is authority: someone to decide what the system is, someone to define the rules it enforces, someone to set it up, and someone to direct what intelligence it produces.
## 1.1 Define, approve, execute
The governance cycle has exactly three steps, and only the first two involve people.
Define. The Data Protection Officer defines the governance rules: masking policy, retention obligations, rights ceilings, privacy floors, deletion requirements, and the approval criteria — the thresholds of cost, sensitivity, and rights class above which work must escalate.
Approve. The Master Admin approves the defined rule set and criteria. This is a single consequential act, not a recurring one.
Execute. From that moment the system enforces the rules on every operation, automatically, with no person in the path. Permitted work runs. Work that would cross a criterion is refused at the boundary with its reason stated, and routed to the approval surface. Every operation writes a receipt.
No human is an operating gate. The DPO does not approve a data pull. The Master Admin does not sign off an integration call. An analyst running a query does not wait for anyone. Placing a person in the runtime path would create friction at exactly the moment the organization needs speed, and would make governance the thing people learn to route around. Instead, governance is settled in advance and executed by the machine.
Updating a rule re-runs the define-and-approve steps — never the work. When policy changes, the DPO redefines, the Master Admin approves through the change ceremony, and the new rule binds every subsequent operation. Work already completed under the prior rule remains on the record with the rule version that governed it.
## 1.2 What requires approval
The principle: anything that changes what the system is or does requires Master Admin approval. Anything that uses the system as configured does not.

The system classifies the action, not the person. Nobody needs to know in advance which side of the line their request falls on. A pull inside the envelope executes immediately. A pull that would cross a criterion is refused at the boundary, the refusal states why, and the request appears on the approval surface. This is the same refusal grammar the platform uses everywhere: a stated reason and a route forward, never a silent failure and never an unexplained wait.
## 1.3 Separation of duties
Three separations are enforced by the system rather than requested of the organization.
The Operator cannot approve the connection they built. Setup and authorization are different acts held by different classes.
The Analyst cannot approve their own over-threshold work. Escalation exists precisely for the case where the person doing the work should not be the person authorizing its cost or sensitivity.
The DPO defines rules but does not approve them. Definition and authorization are separated so that a governance change carries two signatures, and rule-change ceremonies additionally require a counter-signature and an enforced waiting period.
## 1.4 The two products
Akki OS is the operating system installed inside the enterprise perimeter: the estate, the engines, the governance, the extraction and production machinery. Four classes work here — Master Admin, DPO, Operator, and Data Analyst / Scientist.
Akki for Executives is the application through which everyone else consumes what the OS produces — reasoning sessions, document work, board artefacts, and questions answered with proof. It is an integrated application: it holds a scoped key and a memory plane, and every call it makes lands in the same record the DPO reads. Executive users have no estate access and no configuration authority, and they need none.
The customer portal is the external surface where a party who has purchased intelligence exports it, integrates against it, and manages their own account. It reaches purchased deliverables and account activity only — never the estate.
Why this separation matters. The highest-volume users of Akki never touch Akki OS. They work in an application built for their job, which consumes governed intelligence through the same integration surface any other application would use. This keeps the OS a governance and production system rather than a general-purpose workplace tool, and it means the consumption experience can evolve independently of the platform beneath it.

# §2 — The register at a glance

A person may hold more than one class. In a large bank the four OS classes are four different people. In a mid-sized broadcaster the Master Admin and the Operator may be the same person wearing two hats, and the system enforces the separations regardless — an Operator-held account cannot approve its own connection even when the same human also holds the Master Admin account. The classes are authorities, not job titles, and the organization maps its own titles onto them at onboarding.

# §3 — Master Admin
Organizational candidates. Chief Information Officer · Chief Technology Officer · Chief Data Officer · Head of Data · in smaller organizations, the executive sponsor of the AI programme.
Holds. Consequential approval. Every decision that changes what the system is, what it may reach, what it runs, and who may use it.
The promise. Nothing consequential happens without them — and nothing trivial reaches them. They approve the shape of the system once and it operates inside that shape without further demands on their time.
## 3.1 What they approve
Estate connections. Which sources Akki may read, with the rights posture recorded per source. This is the most consequential approval in the system: it defines the boundary of everything downstream.
The rule set and the approval criteria. Defined by the DPO, approved here. This single act is what allows every subsequent operation to execute without a human gate.
New base models. Any model added to the registry, including one an analyst brings. Approval covers the license, the intended rung, and the acquisition; measured acceptance is a separate, automatic gate.
Application integrations. Each integration is approved once as a triple: the standing objective, the memory plane, and the scoped key.
Access. Grants and revocations across all classes.
Over-threshold work. Anything the criteria escalate — a costly extraction campaign, a large training run, a pull touching a sensitivity class above the line.
## 3.2 What they never do
They do not approve individual pulls inside the envelope, individual queries, individual application calls, or routine analytical work. If a Master Admin finds themselves approving the same class of item repeatedly, the approval criteria are set too tight and the correct response is to redefine them with the DPO — not to work through the queue faster.
## 3.3 Journey
Founding
With the DPO, the Master Admin walks instance setup: organizational identity, the DPO contact, the governance seam values, and the source list with rights held on each. Every value written is marked as an initial setting on the permanent record. They then approve the first estate connections and the initial rule set, and the instance is live.
Ongoing
The approval surface is their working queue and it should be short. Each item states what is being asked, which criterion it crossed, what it will cost or touch, and who requested it. They approve or decline with a reason; both are ledger events. Between approvals they read the Registry Dashboard to see what the estate holds and what it is producing.
Periodic
They review the criteria themselves with the DPO. A queue that is consistently empty means criteria may be too loose; a queue that is consistently full means they are too tight. The criteria are the instrument; the queue is its reading.
# §4 — Data Protection Officer
Organizational candidates. Data Protection Officer · Chief Security Officer · Head of Compliance · Head of Risk · General Counsel in organizations without a dedicated DPO.
Holds. Rule definition and assurance. What the rules are, and the proof that they held.
The promise. Rules that enforce themselves. What they define is what executes, uniformly, on every operation, with a receipt for each one. Assurance is something they verify rather than something they are told, and a regulatory question becomes an afternoon's inspection rather than a project.
## 4.1 What they define
Governance seam values. The deletion ceremony requirement, the rule-tightening delay, the quarantine halt threshold, the aggregation floor for outputs, the default license class for new sources, and the masking discipline.
Rights and retention policy. Which classes of material may be exported, sold, or shared; what is under retention hold and cannot be deleted; how long processed material persists.
The approval criteria. The thresholds — cost, sensitivity class, rights class, volume — above which work escalates to the Master Admin. This is the DPO's most powerful instrument: it determines what the organization considers consequential.
Masking and purpose policy. Which entity classes are masked before any external model call, and which purposes are permitted at the custody seam.
## 4.2 What they monitor
The Trust Center is their home surface and it holds two halves. On one side, the rule inventory: every rule in force with its current setting, who set it, when, and the number of automated checks enforcing it. On the other, the record: refusals by class with their reasons, quarantines with their resolution, masking activity and any recall breach, access events across humans and applications, deletions with their certificates, rule changes with their ceremony stage, and per-application memory activity.
Violations post as plainly as successes. A compliance surface that only shows green is a marketing surface. Every violation carries its disposition, and the DPO's work is dispositioning them — not discovering them, because the system surfaces them automatically.
## 4.3 What they never do
They do not approve operations. They are not in the path of a pull, an integration call, an extraction run, or a training job. The rules they defined are executing on every one of those operations continuously; standing in the path as well would add friction without adding control.
## 4.4 Journey
Founding
The DPO defines the rule set and the criteria during setup, in plain language with recommended defaults presented for each. They then run the Verification Runner: plain-language test packs that demonstrate each rail firing — personal data masked before any model call, deletion requiring two approvers, an unanswerable question refused with a reason — each showing its proof. They sign the commissioning record. This is the moment the organization's own governance is demonstrated working rather than described.
Ongoing
They watch the Trust Center on their own cadence — daily in the first weeks, weekly thereafter is typical. They disposition violations. They answer questions from the business and from auditors by walking proofs rather than by investigation.
On policy change
They redefine the affected rule and route it through the change ceremony: the Master Admin counter-signs, an enforced waiting period runs with a visible countdown during which the change can be cancelled, then it applies. The change and its full ceremony history remain on the record permanently.
On regulatory contact
They export the regulator pack — rules in force with enforcement counts, the respect-and-violation record for the period, ceremony histories, destruction attestations, and proof trails for any nominated operations — generated from the record rather than assembled by hand.

# §5 — Operator
Organizational candidates. Data engineer · platform engineer · IT operations lead · systems administrator · in smaller organizations, the same person as the Master Admin, holding a separate account.
Holds. Execution setup. Making approved things actually work, and proving they work before anything scales.
The promise. The system works as configured, and they can prove it. They are not asked to build governance, write pipelines, or maintain infrastructure — they connect, test, verify, and hand over.
## 5.1 What they do
Connect estate sources. Once a connection is approved, the Operator configures it: type, credentials, connection test, and rights label confirmation.
Confirm structured mappings. For every database or tabular source, a fifty-row sample is presented and the Operator confirms field-to-ring mapping before the census counts on it. This is the step most often skipped in conventional projects and the one that prevents the most expensive silent failure available — a wrong mapping is consistently wrong at scale and produces no error signal anywhere downstream.
Run verification packs. Test that the organization's own parameters actually fire: masking, refusal, ceremony requirements, floors. Day-zero mining is verification, not value production.
Integrate internal applications. Once an integration is approved, the Operator commissions it: standing objective, memory plane settings, scoped key, webhook registration, and a test call verified against the Trust Center record.
Pull sample data. Bounded pulls to confirm that extraction parameters produce what was expected before a full objective is commissioned.
Monitor runs. The batch board shows processing, quarantined batches with their status, and reprocessing. Quarantine is contained by design; the Operator resolves causes rather than chasing failures.
## 5.2 What they never do
They do not approve their own connections or integrations — the system refuses. They do not define governance rules. They do not commission production objectives, which belongs to the Analyst or the business.
## 5.3 Journey
Setup phase
Source by source: connect, test, confirm mapping, label rights. Then run the verification packs with the DPO present. Then the census runs and the Registry Dashboard fills — the Operator's work is what makes that measurement possible.
Integration phase
For each approved application: commission the objective, configure the plane, issue the key, register the webhook, make the test call, confirm it appears in the record. Hand the credentials to the application's team.
Steady state
Monitor runs and quarantines. Connect new sources as they are approved. Re-run verification after any rule change, because a changed rule should be demonstrated firing rather than assumed to fire.
# §6 — Data Analyst / Scientist
Organizational candidates. Data analyst · data scientist · business intelligence lead · research lead · in organizations without a data function, an external partner working inside the instance.
Holds. Intelligence production. What gets extracted, what gets analysed, what models exist.
The promise. Material they can trust and models they keep. Every fact carries its source and evidence class; every model ships with measured numbers; nothing is accepted on reputation. Their work compounds into an organizational asset rather than a report that ages.
## 6.1 What they do
Commission extraction
Through the extraction wizard, conversationally: state the need, scope it against what the registry holds, set the evidence floor, choose the output form, review the plan — volume as a range, expected coverage, non-coverable scope, cost — sample a slice to prove parameters on real material, then commission. Work inside the approved envelope runs immediately; work crossing a criterion routes to approval with its reason.
Pull and analyse
Data pulls within their envelope require no approval. Analysis runs in Analyze: upload a workbook or draw from extracted material, run deterministic signal extraction, run Monte Carlo simulation on a numeric column, run forecasting on a date-and-value pair, detect anomalies, and export a cited report. Every figure in the output resolves to its source — the same grounding discipline that governs answers governs analysis.
Train models
Adapters train on qualified estate material within approved thresholds. Acceptance is automatic and non-negotiable: the model must beat its base on the target stratum, damage nothing else beyond bound, evaluate on held-out uncurated data, carry complete lineage with inherited rights, calibrate, and ship with an evaluation card. A model that fails acceptance does not enter the registry.
Deploy their own base models
An analyst may bring a base model into Akki. This is approval-gated because it adds a component the system will run: the Master Admin approves the license, the intended rung, and the acquisition. Once approved and registered, training and serving with it require no further approval — it is inside the envelope and subject to the same acceptance gates as any other model.
Review quality
Acceptance scorecards, evaluation cards, calibration versions, and drift findings are their standing reading. Drift alerts localize because every result cites the model version and calibration version that produced it.
## 6.2 What they never do
They do not build extraction pipelines, masking, citation machinery, audit logging, or evaluation harnesses — the platform performs that work. They do not approve their own over-threshold runs. They do not define governance rules.
## 6.3 Journey
First contact
They read the census: what the estate holds, in what condition, with what rights, and what has not been measured. They read the first domain-transfer measurement — the honest quality numbers on the organization's own material — which tells them which strata are workable today.
Working cycle
A question arrives from the business. If the registry can answer it, they answer. If it cannot, the gap is filed with its demand evidence and becomes an extraction candidate. They commission objectives against the ranked gaps, analyse what comes back, and produce the work product. Where enough labeled material has accumulated, they train an adapter and take it through acceptance.
Compounding
Each cycle produces cleaner material, which trains better models, which mine the next cycle more accurately. The analyst's role shifts over time from extraction toward analysis, because the material they need increasingly already exists.

# §7 — Executive user
Organizational candidates. Chief executive · chief financial officer · non-executive director · department head · risk officer · analyst without a data mandate · any employee whose work requires answers rather than access.
Holds. Nothing. This class holds no authority over the system and requires none.
The promise. An answer they can defend, without understanding the machinery. They ask in their own language and receive a finding with its evidence, its limits, and a proof trail anyone can walk.
## 7.1 Where they work
Akki for Executives, not Akki OS. This is the highest-volume user class in any deployment and it never touches the operating system. The application is an integrated consumer of governed intelligence: it holds a scoped key and a memory plane, and every call it makes lands in the record the DPO reads.
## 7.2 What they do
Ask questions of the estate and receive answers with each claim marked by what supports it, the evidence behind it named, the privacy floor confirmed, and what the answer cannot say stated plainly.
Run reasoning sessions for decisions under structure — seeking clarity, developing strategy, simulating a hypothesis, or drafting a perspective — with the engine refusing to speculate where evidence will not carry it.
Work documents in a journal that indexes, anchors, and comments on material, with search and paragraph-level questioning.
Produce artefacts — briefings, decks, reports, board packs — that inherit the receipts of the material they draw on.
Work cycles — agendas, contributions, minutes, follow-ups — where the organization runs a governance rhythm.
## 7.3 What they never see
Estate configuration, governance rules, approval queues, extraction machinery, the model registry, or infrastructure. The absence is deliberate: this class is served by an application built for their job, and the platform beneath it is not their concern.
## 7.4 Journey
They log in to the application, not the OS. They ask, read, reason, draft, and export. Where an answer meets a limit — material that exists but has not been extracted — the refusal offers to file the work, which routes to the analyst's queue as a ranked candidate. They never wait for an approval and never encounter a governance control, because everything they are permitted to do was settled before they logged in.
# §8 — Customer (external)
Who. An external party that has purchased intelligence products, subscribed to a standing data service, or licensed a model — a partner, a lender, an insurer, an advertiser, another enterprise.
Holds. Their own account. Nothing inside the estate.
The promise. Self-service on what they bought, with their own audit trail. They do not depend on the seller's team to retrieve, integrate, or account for what they paid for.
## 8.1 What they do
Export purchased intelligence in the format they need, with the license label, privacy attestation, and quality card that accompany every deliverable.
Integrate against scoped keys and webhooks for standing services, building against the same answer envelope — including its refusal shapes — that internal applications use.
View account activity — what they have consumed, when, and under what terms.
Manage the account — billing, contacts, keys, and settings.
## 8.2 The boundary
The portal reaches purchased deliverables and account records only. It has no path to the estate, the registry, the governance surfaces, or any material the customer has not bought. This is enforced by scope at the persistence layer rather than by interface design: a query outside the customer's own account does not execute.
Every customer call writes to the seller's record, so the selling organization's DPO sees external consumption on the same surface as internal activity, with the same receipts.
# §9 — Duties that attach rather than classes
Three duties exist in the system that are not classes. Each attaches to a class at onboarding, and the organization decides which.
Approve-to-run. Where an organization wants a human confirmation before commissioned work executes, this duty attaches — typically to the Master Admin, sometimes to a senior Analyst. Where the approval criteria are trusted to do the work, it is not enabled at all. Enabling it for routine work reintroduces the friction the operating model removes, and the register recommends against it.
Release outbound. Where rules require a person on deliverables leaving the organization, this duty attaches — typically to the DPO for rights-sensitive material or the Master Admin for commercial material. The criterion that triggers it is defined by the DPO like any other.
Confirm structured mappings. Attaches to the Operator by default; may attach to a data engineer working alongside them during onboarding.
Why these are duties rather than classes. Each is real work that some organizations require and others do not, and each varies in who holds it. Making them standing classes would force every deployment to staff seats it may not need — the over-engineering that a role register is supposed to prevent.
# §10 — Journey map
How the classes interlock across an instance's life.

The loop that repeats. Questions arrive; most are answered; those that are not become ranked gaps; gaps become commissioned objectives; extraction changes what the next round can answer. No class is required to be present for the loop to continue, which is what allows the practice to survive staff changes — the record carries context that would otherwise live in someone's head.
Syni.ai · Akki Role Register & User Journeys v1.0 · July 2026 · Private & confidential

| Requires approval — changes system function | No approval — uses the system as configured |
| A new estate source or connector | Pulls, queries, and analysis inside an existing envelope |
| A new base model deployed into Akki, including an analyst's own | Training runs on registered bases within approved thresholds |
| A new application integration — key, scope, memory plane | Calls from an already-integrated application |
| The rule set and the approval criteria themselves | Commissioning objectives of an established class within budget |
| A new objective class or output type the system has not produced before | Analyze sessions — signal extraction, simulation, forecasting, anomaly detection, report export |
| Access grants and revocations | Everything the Akki for Executives application does |
| Any single piece of work exceeding a cost, sensitivity, or rights criterion | Any work inside those criteria |


| Class | Holds | Principal acts | Home surface |
| Master Admin | Consequential approval | Approves connections, rule sets, criteria, models, integrations, access, and over-threshold work | Approval surface · Registry Dashboard · access register |
| Data Protection Officer | Rule definition and assurance | Defines rules and criteria; monitors enforcement; dispositions violations; runs ceremonies; proves operations | Trust Center · rule definition · ceremonies |
| Operator | Execution setup | Connects and tests sources; confirms mappings; runs verification; integrates internal applications; monitors runs | Connection console · Verification Runner · integration console · batch board |
| Data Analyst / Scientist | Intelligence production | Pulls and analyses; runs Analyze; trains models; deploys own bases (approved); reviews acceptance and drift | Extraction wizard · Analyze · model shelf · registry |
| Executive user | Consumption only | Asks and reads; reasoning sessions; document and board work | Akki for Executives application |
| Customer (external) | Their own account | Exports purchased intelligence; integrates; views activity; manages billing | Customer portal |


| Phase | What happens, and who acts |
| Founding | Master Admin and DPO run setup together: identity, seam values, source list. DPO defines the rule set and approval criteria; Master Admin approves them. Master Admin approves the first estate connections. |
| Connection | Operator connects each approved source, tests it, confirms structured mappings, and labels rights. Nothing counts until mapping is confirmed. |
| Verification | Operator runs the verification packs; DPO reviews each rail firing with its proof and signs the commissioning record. The organization's own governance is demonstrated, not described. |
| Measurement | The census runs. The Registry Dashboard fills. The estate map is the first deliverable and stands alone. Analyst reads composition and the first domain-transfer quality numbers. |
| Production | Analyst commissions objectives and analyses what returns. Work inside the envelope runs without approval; work crossing a criterion routes to the Master Admin with its reason. Operator monitors runs and quarantines. |
| Consumption | Executive users work in Akki for Executives — asking, reasoning, drafting, exporting. Gaps they encounter file back as ranked extraction candidates. |
| Integration | Master Admin approves each application; Operator commissions objective, plane, and key; the application's calls appear in the DPO's record from the first one. |
| Ownership | Analyst trains adapters on accumulated material; acceptance gates run automatically; accepted models enter the registry with lineage and inherited rights. |
| Commerce | Deliverables are produced with rights, attestations, and quality cards attached. External customers export and integrate through the portal against their own accounts. |
| Assurance | DPO watches the Trust Center continuously, dispositions violations, proves operations on request, and runs ceremonies when policy changes. Master Admin reviews criteria periodically against queue volume. |
