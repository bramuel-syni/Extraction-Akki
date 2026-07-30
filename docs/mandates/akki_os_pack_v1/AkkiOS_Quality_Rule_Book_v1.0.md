**AKKI OS · GOVERNED ARTIFACT · QUALITY ASSURANCE**
**The Quality Rule Book**
Design, development, and testing discipline · Version 1.0
*Purpose. This rule book states the discipline under which Akki OS is designed, built, and tested. It is written for engineering, product, and governance readers, and assumes no prior context. Part I states the premise the whole discipline rests on. Parts II to V are the doctrine and the cost architecture. Parts VI and VII are the two quality-assurance domains — what workers produce and what the pipeline produces. Part VIII is evidence discipline; Part IX is the build loop; Part X is the test corpus. Normative language: MUST / SHOULD / MAY.*
# **§1 — What is under test**

| **Failure mode** | **What happens** |
| --- | --- |
| **Rule proliferation** | Gates are cheap to create and immortal by default. Unmanaged, the gate population grows superlinearly with estates and rule evolution; execution cost, maintenance burden, and false-positive load grow with it; and the signal value of any one gate failing decays toward noise. |
| **Natural-language dependency** | Where correct behaviour depends on a human or a model interpreting prose in the right sequence, cost and error scale with volume. Natural language is the correct interface for humans; it is an unacceptable enforcement medium. |

**Reduction is the standing test. **Every artefact this discipline creates must shrink something — the gate population, the judgement surface, the cost per decision — or it is retired under its own rules.
- **A function justifies itself by the promise it protects.**

| **Service** | **The sentence** | **Journey** |
| --- | --- | --- |
| **S1** | To the integrating application: a governed intelligence surface my app can build on — answers, skills, and artefacts that arrive with class, receipt, and refusal semantics intact, so my app inherits provability instead of building it. | Register → scoped key → call → pass receipts through |
| **S2** | To the operating organisation: my estate onboarded, mapped, and turned into qualified intelligence I can commit with confidence. | Onboard context → integrate sources → census fills → commission → sample → commit |
| **S3** | To the compliance officer: proof of any operation on demand, and governed control of the rules over data. | Pick a run → prove end to end; see retention → change rules with ceremony |
| **S4** | To the data buyer: intelligence products I can verify independently before I rely on them — never raw data. | Receive → verify receipt → licence |
| **S5** | To the infrastructure consumer: the platform's extraction and governance capacity as a substrate my venture builds on. | Registered so nothing optimises against it prematurely; explicitly not built |

# **§5 — The Function and Promise Registry**
## **5.1 · The schema — one row per function, all fields mandatory**

| **Field** | **Definition and discipline** |
| --- | --- |
| **Function identifier** | Stable, namespaced under its governor or surface. Never reused. |
| **Governor** | The owning authority. No new top-level categories without an Owner ruling. |
| **Mandate** | Built to — one sentence, active voice, testable. What the function does, not how. |
| **Promise** | Why this matters — the promise protected, phrased so its breach is observable. Promises are the small set: many functions may cite one promise; no function may cite zero. |
| **Service trace** | The service sentence and journey step this promise secures. An empty or invalid trace is an orphan. |
| **Surface** | Where it acts: module path, route, contract, console element. |
| **Enforcement** | Mechanism class: byte-identity lock, structural walk, negative scan, runtime check, end-to-end cell, type-level wall, or constraint architecture. Prose-only is not a legal value. |
| **Cost** | Execution time class, maintenance burden, false-positive rate where known. Unknown is a legal initial value and must be replaced by measurement when the function is first exercised. |
| **Dependencies** | Functions or data required ordered-before. Input to sequencing. |
| **Ladder rung** | The implementing rung. Written justification required for any rung above the cheapest plausible. |
| **Owner** | Change authority. Inherits the tiered ruling model unchanged. |

| **Rule** | **Requirement** |
| --- | --- |
| **R1** | No gate without a promise. A function whose promise field cannot be honestly filled is not refactored into legitimacy; it is retired. |
| **R2** | No promise without a service trace. A promise serving no journey step of any service sentence is either mis-stated or evidence of product drift; escalate, never paper over. |
| **R3** | No journey step without enforcement. Every step of every journey resolves to at least one registered function protecting it. An unprotected step is an exposed liability and is reported, not assumed safe. |
| **R4** | New functions register before they land. Any proposal introducing a gate or worker obligation includes its registry row, and the row is part of the ruling surface. |

| **Query** | **What it finds** |
| --- | --- |
| **Q1 · Redundancy** | Two or more functions, same promise, same surface — merge or retire candidates, ranked by cost. |
| **Q2 · Orphans** | A function with an empty or invalid promise or service trace — a retirement candidate on sight. |
| **Q3 · Gaps** | A promise or journey step with no enforcing function — an exposed-liability report, found before an incident finds it. |

## **5.5 · The registry pays its own rent**
# **§6 — The twelve rules**

| **Rule** | **Statement** |
| --- | --- |
| **D-1** | Reasoning order. Service → journey → promise → function, in every scoping, escalation, and ruling. Escalations name the promise protected and its service trace. |
| **D-2** | Rules pay rent. Every gate carries its promise and its cost. A gate that protects no live promise is retired, not preserved out of caution. Caution that costs forever must justify itself forever. |
| **D-3** | The conflation test. Before any function is proposed: which service sentence does this serve? No sentence, no build. This is the structural prevention of doing the wrong job well. |
| **D-4** | Cheapest-sufficient rung. Every task lands on the lowest ladder rung that meets its promise. Rung inflation requires written justification at proposal. |
| **D-5** | Natural language is interface, never enforcement. Every natural-language rule pairs with a machine-enforced twin. Prose-only enforcement is a defect, reportable on sight. |
| **D-6** | Constraint architecture first. Prefer designs where correct behaviour is the path of least resistance; gates are the backstop, not the mechanism. Every promise the architecture absorbs is a gate never written. |
| **D-7** | Verdicts are never curated. Inputs, models, corpora, and discovery paths may be engineered without limit; validation verdicts are drawn from measured composition, uncurated, and published internally whatever they say. |
| **D-8** | Reduction applies to its own output. Specifications, trackers, and meta-artefacts are retired when they stop earning. The dead-tracker sweep is a standing pattern, not an event. |
| **D-9** | The platform serves applications. No platform decision optimises end-user experience directly; end-user experience is application territory. |
| **D-10** | Builder conduct standard. Meticulousness is enforced by structure, not assumed: every proposal self-audits against the defect classes before submission, and a proposal arriving with a defect the self-audit would have caught is itself a reportable finding. |
| **D-11** | Canon before ruling. No ruling, audit, or characterisation of an engine or specification surface proceeds from memory or summary. The on-disk documents are canon; unread canon is read before ruling; recalled content is never presented as fact. Binding on the ruling authority and the builder alike. |
| **D-12** | Experimentation exists at system level only. Per §1. |

# **§7 — The defect classes**

| **Defect** | **Definition** |
| --- | --- |
| **D1** | Orphan gate — a function with no honest promise or no service trace. |
| **D2** | Prose-only enforcement — a rule whose only enforcement is prose interpretation. |
| **D3** | Curated verdict — any selection of validation material by favourability rather than measured composition. |
| **D4** | Rung inflation — ladder placement above cheapest-sufficient without written justification. |
| **D5** | Meta-spiral — a second governance layer above the registry; governance artefacts that stop paying rent. |
| **D6** | Service conflation — a platform function optimised for an end-user persona rather than a service sentence; the wrong job done well. |
| **D7** | Invented schedule or scope — sequencing, deferral, or workstreams introduced without instruction. Binding on the ruling authority and the builder alike. |

**Part IV***  Cost architecture*
**Four rungs, ordered by cost. The selection rule is the lowest rung that meets the promise. **The registry's rung field makes every placement inspectable.

| **Rung** | **What belongs here** | **Cost behaviour** |
| --- | --- | --- |
| **1 · Deterministic code** | Byte checks, regular expressions, structural walks, contract locks, counting, routing. All grounding verification lives here by ruling. | Near-zero marginal; fully auditable; never drifts. |
| **2 · Classical language processing** | Tokenisation, entity recognition, sentence segmentation, language identification, rule-based tagging — anywhere linguistic structure is needed without open reasoning. | Processor-cheap, deterministic enough, offline-capable. |
| **3 · Small owned models** | Estate-tuned perception and domain models from the transformation layer; registry-pinned. | Owned intellectual property, near-free inference in-perimeter. |
| **4 · Frontier model** | Open synthesis only: fluent composition, brief narrative — always behind the shield, always with a lower-rung fallback arm. | Highest unit cost; every use answers why not rung three at proposal. |

**The expensive rung is architecturally optional everywhere it appears. **Grounding gates are byte-mechanical checks, explicitly rejecting semantic scoring, and both frontier consumers carry mechanical fallback arms.
## **8.1 · The deflation law**
*The flywheel that improves quality is the same flywheel that deflates unit cost — by design, not by hope.*
**Orderings are optimised over the registry's cost and dependency fields: **cheap gates before expensive, deterministic rungs before model rungs, independent functions in parallel, fail-fast paths surfaced.
**Part V***  The culture layer*
**Three examples already in force. **The pull seam makes raw egress unnatural rather than merely forbidden. Write-once storage makes mutation unnatural rather than merely tested. The two-faculty seam makes claim-laundering type-impossible rather than reviewed-for.

| **Check** | **Definition** | **What it mechanises** |
| --- | --- | --- |
| **Citation existence** | Every hash, file path, ruling identifier, registry row, and contract name cited resolves to an existing on-disk object; cited hashes match the object's actual hash. | Ruling from memory: the document says X at hash Y becomes checkable. |
| **Scope trace** | Every work item traces to an authorising instrument: a dispatch, a register row, a ruling, or its own phase rows. Untraceable items are invented-scope candidates. | Pre-work authored against a fence is flagged at submission rather than discovered later. |
| **Evidence-class presence** | Assertions in classed sections carry their class, and classed values match their class's form: a fact cites, a default names its revision path. | Unclassed assertion becomes a schema check. |
| **Schema completeness** | Proposals carry band and derivation, pre-tiered escalations, registry rows, and a self-audit table. Closes carry a gate roster with results, artefact hashes, registry and negative attestation, and a self-audit table. | Submission discipline. The self-audit table's presence stops being voluntary. |
| **Status truth** | Every status claim about an on-disk artefact is cross-checked against repository state at submission time. A claim contradicted by disk is a finding with the contradicting path cited. | False status: a register claiming a close was never returned while it sits on disk. |
| **Novelty collision** | Proposed identifiers, module names, and concept labels are matched — exact and normalised-token — against the registry and mandate documents; collisions flag as re-derivation candidates for semantic confirmation. | Re-derivation, first line of defence: a cheap lexical tripwire before the expensive semantic check. |

**The residual, conceded. **Tier one verifies form and existence, not pertinence — an artefact written to the letter of the schema can cite real hashes for irrelevant objects. Pertinence is exactly the second tier's rubric, and the two tiers are designed as a pair. Adopting tier one alone buys the cheap half and advertises the whole.
## **14.1 · The rubric**

| **Item** | **What it asks** |
| --- | --- |
| **Anti-re-derivation** | Does anything proposed here already exist in the record under any name? The critic receives the registry and the mandate documents' section inventory as context, and answers semantically. |
| **Anti-fabrication** | Is any assertion stronger than its evidence class permits? Are recalled claims dressed as facts? Are values stated without a basis where one is owed? |
| **Conflation test** | Does every proposed function trace to a named service sentence — and is the trace real rather than decorative? |
| **Scope semantics** | Beyond the mechanical trace: does the work's substance stay inside the dispatch's intent? Is sequencing invented under cover of execution, or scope smuggled as riders? |
| **Enforcement honesty** | Is any rule proposed whose only enforcement is prose? Is any gate claimed that no cell proves? |
| **Self-audit audit** | Does the artefact's self-audit table reason, or is it reflexive stamping? |

**The critic never shares the worker's conversation. **Its context is exactly the artefact under review, the canon set, the authorising dispatch, and the rubric — not the worker's reasoning, drafts, or self-justification. A critic reading the author's rationale inherits the author's frame, which is the blind-spot-sharing failure this design exists to avoid.
**No worker critics its own output. **Where both instances share a base model, independence is by context isolation, and seeded audits measure whether that isolation suffices.
**Findings carry the honesty grammar. **A finding states what it checked, what it found, at what confidence class, with citations. An unclassed finding is itself a finding.
## **14.3 · Three failure modes, answered structurally**
- **Noise. **A critic rewarded for finding things drowns rulings in trivia. Answered by the false-alarm ledger: a critic whose findings are repeatedly ruled non-findings gets its rubric tightened or its scope shrunk, by ruling.
- **Infinite regress. **Who reviews the reviewer? Stopped by construction: the critic's findings are subject to deterministic checks and human sampling only. There is no critic of the critic, and proposing one is a meta-spiral finding.
**The reviewing role compresses; it does not disappear. **Three lightweight instruments, all producing versioned numbers.

| **Instrument** | **How it works** |
| --- | --- |
| **Verdict sampling** | A fraction of critic findings and critic all-clears is human-reviewed — twenty per cent of findings and ten per cent of all-clears as a starting default, decaying as measured reliability accumulates. Each sample scores the critic: true catch, false alarm, or miss in sample. |
| **Seeded-defect audits** | On a standing cadence, a known defect of a documented class is deliberately planted in a review copy — never in a landing artefact — and the critic's catch or miss is recorded. This is the only honest measure of a reviewer that mostly reports clean. The seeded set is drawn across defect classes, never curated toward the critic's strengths. |
| **The calibration ledger** | Catch rate and false-alarm rate per worker class and per rubric item, versioned like model calibration. The critic's trustworthiness is thereafter a measured, citable number — and the sampling rate is a function of it, so human attention shrinks exactly as fast as the evidence says it may. |

**Sampling fatigue is mitigated mechanically. **The calibration ledger carries a staleness field, and a critic whose calibration is stale past its window has its findings marked uncalibrated at render — the same honesty rule the platform applies to model confidence. A stale quality layer visibly says so.
# **§16 — The behavioural rules**

| **Rule** | **Statement** |
| --- | --- |
| **QA-1** | Detect, never decide. No finding blocks execution, edits an artefact, or gates a phase — every consequence is a ruling. One scoped exception follows. |
| **QA-2** | The format gate. Schema completeness is the single hard gate: a proposal or close missing its required sections is returned for completion before it enters the loop. Form, never substance. |
| **QA-3** | No self-review. No worker critics its own output; independence is by context isolation and is itself measured by seeded audits. |
| **QA-4** | Findings carry the honesty grammar. Every finding is evidence-classed and cited. |
| **QA-5** | The layer pays rent. The catch and false-alarm ledger is standing; a layer that stops catching shrinks by ruling; a second quality layer above this one is a meta-spiral defect on sight. |
| **QA-6** | Frame authority is untouchable. No check, rubric item, or finding may dispute a ruling, a service sentence, or a frame decision. The layer verifies divergence from canon; it has no standing on changes to canon. |
| **QA-7** | The custody boundary. Quality of protection escalates as governance; quality of product routes as findings. |

# **§17 — The layer's own dashboard**

| **Metric** | **Source** | **Target** |
| --- | --- | --- |
| **Owner-catch count per phase** | Close-report correction record | Stays at zero as phase size grows — with the reader reading less, not more |
| **Worker self-catch count** | Self-audit tables and disclosed findings | Reported; rising self-catch with falling owner-catch is the healthy signature |
| **Critic catch rate on seeded defects** | Seeded-defect audits | At least eighty per cent across defect classes · DEFAULT, revised on evidence |
| **Critic false-alarm rate** | Ruling outcomes on findings | No more than twenty per cent of findings ruled non-findings · DEFAULT; a breach triggers rubric review |
| **Catch latency** | Finding timestamp against artefact landing | Caught at the submission boundary, not post-landing |
| **Cost per review** | Critic telemetry | Reported from the first run; input to the owned-critic succession decision |
| **Calibration staleness** | Calibration ledger | Within window, or findings render uncalibrated |

- **Not a governor. **It holds no mandate, asserts nothing about the estate, and gates nothing but form. Proposing veto authority for it is rejected in advance.
- **Not a replacement for the human seat. **Frame changes are constitutionally outside a canon-verifying layer. The build's largest course corrections were frame changes; this layer would have caught none of them, by design.
- **Not a new meta-artefact class. **It reuses the standing machinery — query patterns, registry rows, calibration-ledger form.
- **Not a zero-residual claim. **The layer halves the residual, measurably and repeatedly. Its own dashboard is built to show its misses.
# **§19 — The quality matrix**

| **Dimension** | **Definition** |
| --- | --- |
| **Correctness** | Is the output right — measured per class in its native unit: word error for transcripts, field accuracy for mapping and document reading, per-class scores for tags, delta against base for models. |
| **Loss** | What the transformation silently dropped — the unrecoverable defect class. Speech discarded by activity detection, rows dropped in mapping, spans missed in perception. Bounded tightest, because loss cannot be repaired downstream. |
| **Precision / over-application** | What it wrongly included or over-applied: false deduplication merges, over-redaction in masking, spurious tags. |
| **Attribution fidelity** | Is the who, where, and when preserved through the transformation: speaker naming, page and region provenance, source-row lineage. |

## **19.1 · Class coverage**

| **Class** | **Instrumentation** |
| --- | --- |
| **Speech perception** | Word-error thresholds per condition class — clean, degraded and telephone-band, code-switched — and a diarisation error bound for multi-speaker material. Activity-detection speech loss bounded on a stratified sample deliberately weighted to quiet speakers, vernacular, and degraded strata, measured before full-corpus rollout. Deduplication false-positive bound. Speaker-naming correctness as its own scored column. Language-routing accuracy with misroutes logged with cascade tags. De-identification recall on a seeded sample per language, including local name, identifier, and telephone formats. |
| **Document, image, video perception** | Correctness as character or field accuracy per stratum; loss as page or region drop rate; attribution as locator fidelity. Instruments defined now; thresholds set at activation from that class's own evidence rather than invented in advance. |
| **Structured mapping** | Per connector, a human-verified mapping sample at onboarding proving field-to-ring mapping before the census publishes: correctness as field accuracy, loss as row and field drop, attribution as primary-key and source-table lineage intact. |
| **Analytic outputs** | Absolute per-class baselines on the per-language evaluation sets, reported at first measurement; gates bind per class only when a product claim depends on that class. Summarisation additionally carries a faithfulness check that no claim in a summary is absent from its sources. |
| **Derived artefacts** | Grounding gates bind numbers verbatim. The matrix adds completeness sampling — does the artefact contain what the corpus supports, a measured miss rate rather than only no-fabrication. Datasets re-verify the aggregation floor per release; licence inheritance is attested per artefact. |
| **Retrieval and index outputs** | Recall against a sampled query set per language. Row registered now; values and build at the phase that creates the surface. |

**Threshold honesty, stated deliberately. **Several values are default-class placements rather than derivations. Inventing precise thresholds for unmeasured classes would be fabrication; the evidence-class system exists exactly so a default can ship, bind behaviour, and be revised from the first measured sample without reopening the specification.
# **§20 — Model output acceptance**
**A model the platform trains is accepted into the registry, deployed into extraction, or delivered to a customer only when all six criteria hold.**

| **Criterion** | **Requirement** |
| --- | --- |
| **Improvement** | Beats its base model on the target stratum by the required relative margin. |
| **No collateral regression** | No degradation beyond the absolute bound on non-target strata — the tuning did not buy one language by breaking another. |
| **Uncurated evaluation** | Held-out, census-stratified sets. The uncurated-verdict rule applies to model verdicts exactly as to the composite endpoint. |
| **Complete lineage** | Training-data unit set recorded; licence inheritance binding — a model trained on internal-only data carries internal-only restrictions; base checksum and adapter version pinned in the registry. |
| **Calibration** | Confidence calibration measured and versioned before the model's scores feed any downstream gate. |
| **The evaluation card** | Customer-deliverable models ship with their measured numbers, whatever they are. |

**Acceptance is a checklist over files that already exist. **All six criteria are artefacts of the training run itself — evaluation outputs, lineage records, registry fields — executed as cells. A training run that cannot produce them was not a governed training run.
# **§21 — Production quality machinery**
**The same three-tier architecture, applied to what the pipeline produces rather than what workers produce. **One quality design, two production domains, one calibration discipline.

| **Tier** | **In the production domain** |
| --- | --- |
| **One — deterministic, always on** | Schema completeness, so incomplete units reject at write; referential integrity, so every locator resolves to its source object; verbatim grounding of numbers; and statistical tripwires per batch — empty-output rates, distribution shifts against the census baseline, confidence-profile anomalies. Zero serving-path cost; runs where the pipeline runs. |
| **Two — the production critic** | A critic model reviews a sample of outputs per active class, continuously: transcript spot-agreement, tag and summary faithfulness against sources, mapping spot-checks, de-identification residue scan. Sampling rates are default-class per class. Findings carry routing leads — which stratum, which model, which lever. Never blocks. |
| **Three — human calibration** | The matrix's stratified human samples double as the critic's calibration: catch rate and false-alarm rate per output class, versioned and staleness-marked. Seeded-defect audits plant known-defective outputs in review samples, drawn across defect classes, never curated toward the critic's strengths. |

**One calibration mechanism, three consumers. **Fact-confidence calibration, the build critic's ledger, and the production critic's per-class ledger are the same versioned, staleness-marked form. A parallel calibration machine is a meta-spiral defect on sight.
**The sampled critic misses systematic defects between samples — answered by division of labour. **Tier one's statistical tripwires are exhaustive and cheap, catching distribution-level anomalies on every batch; tier two's sampling catches instance-level quality; the drift watch catches slow degradation. A defect class that evades all three — systematic, distribution-neutral, drift-free — is by construction the class only human samples find, which is why tier three never fully decays.
# **§22 — The custody boundary**
*Quality of protection escalates as governance; quality of product routes as findings.*
**A de-identification recall breach, detected by any tier, is a governance failure. **The affected batch quarantines fail-closed. Utility-class findings — word error, tagging scores, mapping fidelity — never block, and detect-never-decide holds everywhere else.
# **§23 — Three-stage coverage**

| **Stage** | **Quality question** | **Instruments** |
| --- | --- | --- |
| **Extraction** | Did we read the raw material right, and lose nothing we cannot recover? | Per-input-class weak surfaces and first-measurement checkpoints; activity-detection loss bound; connector mapping samples; deduplication audit. |
| **Transformation** | Is what we produced correct, complete, attributed — and are the models we trained acceptable? | The class matrix per output class; the six acceptance criteria for trained models; tier-one in-pipeline checks and the tier-two sampled critic. |
| **Production** | Do deliverables carry only what the corpus supports, with rights and floors intact? | Grounding gates and completeness sampling; the aggregation floor re-verified per release; licence inheritance attested; evaluation cards on deliverable models; the uncurated composite verdict as endpoint. |

**The matrix explains failures per stage and gates per-class claims; the composite verdict remains the single uncurated endpoint. **Neither substitutes for the other. Endpoint-only measurement means a failed unit starts a manual archaeology: the composite sees the result and cannot say which of six upstream transformations broke.
# **§24 — The transformation rules**

| **Rule** | **Statement** |
| --- | --- |
| **TQ-1** | Depth on activation. Dormant classes carry row definitions and instruments only; full weak-surface depth builds when a census activates the class. Speculative depth for dormant formats is a rent defect. |
| **TQ-2** | New class, new row, at proposal. Any phase introducing a new transformation output class includes its matrix row — dimensions, instrument, thresholds or an explicit at-activation deferral. |
| **TQ-3** | Measurement reuses events. Matrix checkpoints ride the standing measurement events as added columns. Proposing a new measurement era is a finding. |
| **TQ-4** | Speech is never diluted; peers are upgraded. The ruled speech thresholds stand verbatim, and parity across formats is achieved upward. |
| **TQ-5** | No instance is a development metric. Platform quality specification is class-keyed; instance estates instantiate rows. An instance-derived assumption entering platform canon is a reportable finding. |
| **TQ-6** | Verdicts uncurated, always. Every sample draws from measured census composition; engineering the inputs is legitimate; touching a verdict sample is a defect. |

**Part VIII***  Evidence and claims*
# **§25 — Evidence classes**

| **Class** | **What it permits** |
| --- | --- |
| **FACT** | Verifiable against the record. A fact cites. |
| **NORM** | Anchored to convention or literature, placed within a defensible range. A norm names its anchor. |
| **DEFAULT** | An operating constant, revisable through the dual-control configuration path. A default names its revision path. |
| **fact / recalled / inferred** | The assertion classes. A recalled claim is never dressed as a fact; an inferred claim states its provisionality where it ships. |

| **Weak surface** | **Lever** | **Pre-verdict checkpoint** |
| --- | --- | --- |
| **Under-served languages** | Registry-pinned base models per language; language-routed model selection at job level | Per-language word error on a small real sample, measured in week one rather than month three |
| **Code-switching** | Census-curated code-switch corpus, then in-perimeter tuning; the improved model re-enters through a registry version bump | Code-switched-segment error against a monolingual baseline, same speakers |
| **Accented speech** | Tuning or an adapter on an accented checkpoint, with pinned provenance either way | Accent-stratified error on real archive segments |
| **Degraded and narrowband audio** | Augmentation in the training loop; era- and quality-stratified census slices target hard bands | Error by decade and quality band — the census provides the strata for free |
| **Speaker overlap** | Diarisation model swap through the registry; activity detection and diariser independently upgradable | Diarisation error on a multi-speaker sample |

| **Rule** | **Requirement** |
| --- | --- |
| **Deployment order** | Where seeded audits show single-critic catch rate below the standing bar on any defect class across two consecutive audits, rubric and context repair executes first. An ensemble may deploy only if the repaired critic still misses on a subsequent audit. |
| **Independence** | Members must differ genuinely — a different base model, or a materially different context shape. Same-base, same-context replicas are prohibited: correlated reviewers share failure modes and add cost without detection gain. |
| **Findings only** | All ensemble output is findings. Voting, override, and critic-of-critic structures are prohibited. |
| **Disagreement** | Disagreement between critics is itself a finding class, routed to rulings like every other. |
| **Bounds** | No more than three members without a ruling. Cost-per-review telemetry is emitted per member. |
| **Rent** | The ensemble retires if its catch-rate gain over the single repaired critic is under the stated margin after one full calibration cycle. |

- **Trigger. **Cascade work may begin only when run telemetry with cost columns active shows spend on a named seam exceeding a threshold set at that time. No threshold is defined in advance of metered evidence.
- **Pre-work is fenced. **Before the trigger, no cascade scaffolding, draft-model acquisition, or routing machinery may be built. A measured shortfall makes the build mandatory; absent one, it never builds.

| **Parameter** | **Requirement** |
| --- | --- |
| **Manifest coverage** | Every shipped judgement and every selection carries its assumption manifest. An unmanifested judgement is a defect. |
| **Archive completeness** | Every evaluated idea lands in a state the same cycle. Nothing exits silently. |
| **Escalation latency** | A frame signature escalates in the cycle it is observed, never noted and deferred. |
| **Metabolisation execution** | An adopted frame triggers its sweep within one cycle, and the sweep completes before new judgements issue on the affected class. |
| **Rent collection** | Archive review dates are honoured; expired entries re-qualify or are superseded rather than accumulating. |

| **Parameter** | **Definition** | **Breach response** |
| --- | --- | --- |
| **Promise metric** | Owner-confirmed repeat-class corrections decline across cycles | Flat or rising for two consecutive cycles triggers a review of the faculty itself |
| **Manifest hit-rate** | When a judgement flips, the struck assumption was in the manifest above the stated bar | Below bar, the elicitation protocol is fixed — not the number |
| **Provisional honesty** | Zero instances of inferred-footing content shipped in the register of fact | One instance is a recorded finding |
| **Metabolisation closure** | The absorption signature for a corrected class goes quiet within the stated window | Noisy signature rules metabolisation incomplete; the sweep re-runs |
| **Overhead ceiling** | The practice consumes no more than an owner-set share of cycle budget | Breach shrinks the faculty; product work is never the variable |
| **False-escalation rate** | Frame candidates ruled non-events stay under the stated ceiling | Above it, detection thresholds tighten — owner attention is the protected resource |

| **Family** | **What fails the build** |
| --- | --- |
| **Contract snapshots** | Any frozen contract diverging from its snapshot without an explicit blessing. |
| **Parity assertion** | Contract count not equal to snapshot count. |
| **Rail cells** | Any rail without a hard-fail check. A rail without a check does not exist, whatever the inventory says. |
| **Dependency assertions** | A learned import in the deterministic governor; a class computation acquiring a confidence parameter; the learned ranker receiving the floor or the raw measure; a model call originating outside the chokepoint. |
| **Isolation** | Any data access path reaching across an instance boundary or a memory plane it is not scoped to. |
| **Regeneration diffs** | Any divergence between a generated artefact and fresh emitter output. |
| **No silent skips** | A skipped test, or a test that asserts nothing — a test that passes for the wrong reason. |
| **Secrets hygiene** | Any credential, key, or connection secret in a landed artefact; any fixture using live values. |
| **Verification-chain parity** | A continuous-integration target that resolves to a non-existent path, or a chain that has drifted from the full sweep without attested parity. |

| **Reference** | **Rule** |
| --- | --- |
| **D-1 … D-12** | Behavioural doctrine — §6. |
| **D1 … D7** | Defect classes — §7. |
| **R1 … R4** | Registry derivation rules — §5.2. |
| **Q1 … Q3** | Standing queries — §5.3. |
| **S1 … S5** | Service sentences — §4.1. |
| **QA-1 … QA-7** | Quality-layer behavioural rules — §16. |
| **TQ-1 … TQ-6** | Transformation quality rules — §24. |
| **Rungs 1 … 4** | The model ladder — §8. |
| **FACT / NORM / DEFAULT** | Value evidence classes — §25. |
| **fact / recalled / inferred** | Assertion evidence classes — §25. |

*What the discipline comes down to. One thing is under test: the assembled system delivering the promise. Everything beneath it is a known mechanic that deploys in force with its conditions of success implemented, or has a specification gap to close. Every function names the promise it protects and the service that promise serves, or it is retired. Every rule pairs with a machine that enforces it, because a rule in prose is an intention. Every reviewing mechanism detects and routes rather than deciding, and every one of them is itself measured on known positives. And no number is claimed before it is measured on the organisation's own material — whatever it turns out to say.*
