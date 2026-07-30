**SYNI.AI · PRODUCT & ENGINEERING SPECIFICATION**
**Akki OS**
The operating system for enterprise data estates
*How to read this document. This is the complete technical and behavioural description of Akki OS: what it is, what problem it solves, how it is built, how it behaves, who uses it, what it produces, and why the design holds. It assumes no prior knowledge of the system or the sector. Every specialist term is defined at first use and again in the glossary.*
**Conventions. **Behavioural guarantees are stated as what the system does and does not do at its boundaries; they are enforced in code, and the standing test corpus fails the build when a guarantee breaks. Measured values are reported where they exist; where a value has not been measured on real material, the document says so rather than estimating. Named engines carry initial capitals. Normative language: MUST / MUST NOT / MAY.
**Entry points. **An executive can read Parts I and IX and have the whole argument. A product manager should read Parts I, III, and VI. An engineer joining the build should read Parts II through V. A diligence reader should read Parts I, IV, V, and IX, and treat Part II as the technical annex.
**Part I***  Orientation*
# **§1 — The problem**
**Large organisations sit on data estates of extraordinary latent value and cannot use them. **This is not a tooling gap; enterprises have bought tooling for two decades. Three blockers survive every platform migration, and each is structural rather than procedural.
## **1.1 · The data cannot leave**
Customer service recordings, patient records, broadcast rights libraries, farmer identities, transaction histories, legal correspondence — legally, contractually, or politically, this material cannot be shipped to an external AI service. Data protection regimes constrain transfer; licensing constrains use; procurement constrains vendor exposure; and in regulated industries the risk function will not sign a transfer it cannot audit.
**The consequence is familiar. **The impressive demonstration runs on synthetic or public data, and the estate that would have made the programme valuable stays untouched. Cloud services answer with contractual assurances and regional processing; those help with jurisdiction and do nothing about the posture — the material still leaves the building.
An answer without a traceable source is unusable wherever the answer matters. A regulator asks how a figure was derived; an auditor asks which records support it; a board asks what would have to be true for it to be wrong; a court asks who said what and when.
**A generated figure that never existed is not a typographical error. **In a customer letter it is a misstatement; in a regulatory return it is an incident with a name attached; in a board pack it is a career. Every accountable executive knows this, which is why pilots in serious institutions stall at exactly the point where outputs would touch a customer or a regulator.

| **Rail** | **What it binds** |
| --- | --- |
| **Data custody** | Raw material never leaves the perimeter. Every outbound model call crosses a de-identification seam that fails closed; source systems are never modified; staged material is purged after processing with a destruction attestation. |
| **Extraction** | Every extraction runs under a commissioned objective with declared scope, evidence standard, rights posture, and budget. Nothing is mined speculatively, and every run writes telemetry and receipts from its first execution. |
| **Claims** | Every fact carries its evidence class and its origin. Facts are written with provenance paired at write time; a fact that cannot name its source cannot be stored. |
| **Answers** | Every output carries a receipt or is an honest refusal. Numbers are verified verbatim against their sources before shipping; claims are tagged by what supports them; the assertion boundary is computed from evidence rather than asserted by the model. |
| **Models** | Every model is registered, checksum-pinned, and attributable. Trained models pass a six-check acceptance regime and inherit the rights of the data that trained them. |
| **Access** | Every consumer — human or machine — holds scoped credentials, and every call lands in the same record the compliance officer reads. There is no lighter-weight path for machines than for people. |
| **Rules** | The governance settings themselves change only through counter-signature and an enforced waiting period, with the full ceremony on the permanent record. Rules are not editable configuration. |

## **3.1 · What the platform promises**
**Failure behaviour. **Fail-closed on masking unavailability; quarantine on detected recall miss. No degraded mode exists in which raw content crosses, and there is no administrative override — deliberately, because an override that exists will eventually be used under pressure and the promise would then be conditional.
## **6.2 · Northena — the ledger**
**Mandate. **Remember everything the system does, permanently and in a form that can be replayed and proven.
**Function. **Every admission of material, extraction run, qualified answer, refusal, deletion, quarantine event, rule change, model registration, memory-plane operation, and integrated call writes an append-only row carrying its provenance. Receipts chain, and roots anchor periodically so that verification of a large corpus stays computationally cheap rather than growing with corpus size.
**It also governs direction. **Northena admits a raw intent into a frozen governing artifact, gates each sub-objective by strict set-membership against that artifact's declared scope, and converges the run on a threshold check against its done-condition or budget. All three stages write the ledger, and the run closes only when the ledger closes.
**Behaviour. **Northena never reasons and never interprets — it remembers. Rows are never updated and never deleted; a correction is a new row citing what it corrects. It is deterministic by construction: no model, no learned weights, no adaptive behaviour, checked structurally by an import assertion. Where a decision genuinely needs judgement, it invokes the reasoning faculty through an opaque handle and acts deterministically on the value returned.
**Why it is a governor. **The ledger is the substrate of every other promise. Custody claims are provable because destruction attestations are ledgered; answers are defensible because their composition is ledgered; ceremonies are enforceable because their stages are ledgered. A platform whose record can be edited has no promises, only assertions.
**What an auditor checks. **That rows are append-only in fact rather than by convention; that corrections appear as new rows citing what they correct; that receipt chains verify; that recorded event coverage matches the stated list; and that an operation selected at random by the auditor replays end to end.
**Failure behaviour. **The ledger sits on the write path for governed operations. An operation that cannot be recorded does not proceed, because proceeding unrecorded would produce exactly the gap that makes every other guarantee unprovable.
## **6.3 · Solva — the reasoning faculty**
**Mandate. **Convert qualified evidence into answers, and never let an answer assert more than its evidence supports.
**Function. **Solva reasons in five engineered stages rather than a single generation pass. It frames the question against what the registry holds; assembles candidate answers with the units that would support each; tests candidates against each other for contradiction and corroboration; weighs probability across the surviving candidates; and composes reflectively, stating what it is asserting and on what basis. Every stage is traceable and appears in the reasoning lens of the proof trail.
**Behaviour: the assertion boundary binds output. **Solva computes a floor over the evidence classes of every load-bearing item in a candidate answer — the items the answer would fail without — and may assert only what that floor permits. Reasoning strength never substitutes for evidence class: a chain of confident inference over weak material yields a weak floor, and the answer is bounded accordingly. Below the floor, Solva refuses in the answer's place, states the reason, and names what would strengthen it. It also distinguishes claims measured against records from claims modelled by inference, and marks them differently in the delivered answer.
**The guard is structural. **The class computation takes the load-bearing units and nothing else — no confidence, no reasoning strength, no evidence weight. The laundering case is not policed at runtime; it is unrepresentable, because the function has no parameter through which reasoning strength could enter.
**The refusal grammar. **Refusals take three distinct shapes and are never blended: evidence-insufficient, which states what is missing; coverage gap, which states that the material exists but has not been extracted and offers to commission that work; and system fault, which states plainly that something broke. A technical failure never impersonates an evidential judgement, and an evidential judgement never hides behind an error message.
**What an auditor checks. **That the floor is computed over load-bearing units rather than asserted; that no sampled answer asserts beyond its floor; that refusals carry their class and reason; that measured and modelled claims are distinguished in delivered output; and that the reasoning lens of a proof trail reconstructs the stages actually executed.
**Failure behaviour. **Below floor it refuses rather than hedging; on shield unavailability it composes mechanically rather than waiting or bypassing; on unresolved contradiction it discloses rather than selecting silently.
## **6.4 · Mtafiti — the registry and detector**
**Mandate. **Hold what the platform knows, qualify it against the evidence standard, and detect the relationships between facts that make a holding into a fabric.
**Function. **Mtafiti maintains the registry of qualified units and computes each unit's qualification — the verdict on whether it meets the standard — which answer composition and product gates consume. It detects corroboration, contradiction, and retraction between units across sources and across time. The census that measures an estate's composition reports through Mtafiti, as do the coverage figures that objectives report against.
**The measure is produced in two layers. **A declaration baseline — source standing declared once per feed, low cardinality, deterministic, always available, and never assigned per item. And a content inference overlay — a learned signal refining the baseline from content, admitted only once its detection accuracy is proven, with the baseline standing alone until then.
**Detect versus decide. **The learned component produces detections, never verdicts. The defensibility verdict is assigned by a governed, versioned, inspectable taxonomy by deterministic lookup, and every verdict records the rule that produced it. If the learned layer assigned the verdict, defensibility would rest on a model weight — unexplainable and un-auditable, the very laundering the system exists to prevent.
**Behaviour: composition is discovered, never assumed. **The platform ships knowing nothing about any customer's data: no assumed schema, no assumed languages, no assumed content mix. Every claim the system makes about an estate traces to a census measurement, and the registry states plainly what it has not yet measured rather than leaving a blank that reads as zero. Qualification is computed, recorded, and re-computable, so a unit's standing can be re-derived under a better model without guessing what was done originally.
**Why contradiction matters. **An estate of any size contains material that disagrees with itself — corrections, retractions, different witnesses, changed policy. A system that silently picks one version produces answers that cannot survive scrutiny. Mtafiti surfaces the disagreement so that the reasoning faculty must resolve it or disclose it.
**What an auditor checks. **That every registry figure traces to a census run or a qualification computation; that unmeasured dimensions are declared rather than defaulted; that qualification is reproducible from a unit's re-extraction handle; and that contradiction detection is exercised by fixtures carrying known conflicts.
**Failure behaviour. **An unqualifiable unit is recorded as unqualified rather than admitted at a guessed class; an unmeasured dimension is reported as unmeasured rather than estimated, because an estimate in an inventory becomes a fact in the next document that cites it.
## **6.5 · Targeta — the planner**
**Mandate. **Plan the work that serves a commissioned objective, within its budget, without ever changing what the objective may reach.
**Function. **Targeta reads the registry and produces plans: what to mine, in what order, at what expected coverage, against what budget. Plans are banded — volumes and costs are ranges rather than promises — and every objective reports a coverage-to-objective figure stating how much of the goal the current holding can serve. Targeta also identifies reusable stock, so an objective overlapping prior work pays only for the difference.
**Behaviour: the one learner, walled. **Learning may improve ordering and yield — which strata to mine first, how to batch, where returns concentrate. It can never widen or narrow what an objective is permitted to reach: eligibility is computed deterministically and sits outside the learner's control by construction rather than by policy.
**The wall is a type. **The learned layer receives a floor-passing eligible set carrying neither the floor value nor the raw measure, and must return a permutation of that exact set. A result that drops or adds any member is a type error and is rejected rather than reviewed.
**The learner is admitted through a two-arm gate. **It must reach objective-satisfaction in fewer mined units than the deterministic core on held-out objectives, and it must not drive any eligible class's mining rate below the core's. Improving efficiency by starving a class fails the gate regardless of the efficiency number, and on failure of either arm the core runs alone.
**Gap filing. **When a question cannot be answered because material has not been extracted, Targeta receives the gap as a candidate carrying its demand evidence — how many distinct asks cited it — which ranks the extraction queue. The platform's declared weaknesses become its work queue, and aggregated across an estate they become the organisation's data-acquisition priority list.
**What an auditor checks. **That eligibility is computed outside the learned component; that no executed run exceeded the reach of its authorising objective; that plans were banded rather than pointed; that reported coverage is reproducible from registry state; and that the learner's inputs cannot include permission-bearing fields.
**Failure behaviour. **A plan that cannot meet an objective's floor reports non-coverable scope rather than proceeding to produce material that will fail qualification; a budget ceiling halts work rather than being exceeded and reported afterwards.
# **§7 — The conducted classes**
Eleven classes operate under the governors' mandates. Each engine carries a function — what it does mechanically — and a behaviour — the guarantee it holds at its boundary.
## **7.1 · Custody and privacy**

| **Engine** | **Function and behaviour** |
| --- | --- |
| **De-identification pipeline** | Three layers in sequence — deterministic pattern masking, organisational dictionary, local entity recognition — with per-language seeded-recall verification on planted identifiers representative of the estate's actual population. A recall miss is a governance event rather than a quality score: the batch quarantines, reprocesses under a corrected configuration, and the event with its resolution appears on the compliance surface. |
| **Purge attestation** | Stages raw material, tracks it through extraction, and destroys it on completion with a per-run destruction attestation. Source systems are never modified; destruction is provable for every run since installation. |
| **Purpose validation** | Validates every outbound call against the instance's permitted-purpose list at the custody seam. An unlisted purpose does not execute. Purpose lists are governed configuration changed through ceremony, not code changed through deployment. |

## **7.2 · Perception**
**The readers of raw material. **Every member is a registered, checksum-pinned open model held in a swappable seat, and every result stays attributable to the exact model version that produced it.

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Speech recognition** | Transcription per language stratum with word-error thresholds bound per condition class — clean, degraded or telephone-band, code-switched — before a stratum enters production mining. Accuracy is measured on the estate's own material at domain-transfer time and published whatever the numbers say. No stratum ships on a model's published benchmark reputation. |
| **Voice activity detection** | Strips non-speech before expensive perception, bounded by a measured speech-loss rate on a stratified human-checked sample weighted toward quiet speakers, vernacular material, and degraded recordings. Loss is the unrecoverable defect class and carries the tightest bound in the system. Suppressed spans retain pointers and are re-queueable, so stripping is reversible by design rather than by recovery. |
| **Speaker segmentation and naming** | Diarisation with a bounded segmentation error rate, and speaker attribution scored as its own verification column separate from content accuracy. A transcript's content accuracy never stands in for its attribution accuracy, because an answer that quotes the right words from the wrong person is worse than no answer. |
| **Language identification** | Routes each span to the model appropriate to its language, with routing accuracy measured and misroutes logged with cascade tags. A misroute silently degrades everything downstream and is invisible at every later gate, so routing is measured at the source. |
| **Document, image, video** | Registered candidate classes carrying the same seat design: correctness, loss, and locator-fidelity dimensions defined in advance; specific models acquire through licence verification and measurement when a census activates the class. Dormant classes are visible, defined, and ready rather than absent. |

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Normalisation and batching** | Standardises formats and segments the corpus into processing batches — the unit of quarantine, telemetry, and retry. Batches isolate failure: a bad batch stops itself without stopping the run, and its status stays visible through resolution. |
| **Fingerprint deduplication** | Content fingerprinting identifies repeated material so that it is perceived once; every other occurrence is recorded rather than reprocessed. The false-merge rate is bounded and audited on a human-checked sample. On repetitive estates this is the largest single cost lever in the system, and it is non-destructive: nothing is deleted, every suppressed occurrence keeps its pointer, and a wrong merge is reversible. |
| **Occurrence index** | The registry of every repeat of identified content — when, where, from which canonical instance — constructed as a by-product of deduplication. A cost mechanism that is simultaneously a product: for a broadcaster it is a complete airing record; for a contact centre it is a complete record of repeated scripts and disclosures. |
| **Batch quarantine and systemic halt** | Per-batch failure containment with an instance-level halt threshold: when quarantined batches exceed the configured share of a run, the run stops for cause analysis rather than continuing to burn budget on a systematic fault. |

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Unit assembly** | Converts perception output and mapped records into qualified units carrying all five rings, with provenance paired at write time. An unpaired fact cannot be written; incomplete units reject at the boundary. |
| **Qualification computation** | Scores each unit against the evidence standard, producing the defensibility verdict that answer composition and product gates consume. Qualification is computed, recorded per unit, and re-computable. The share of a stratum meeting the standard is a published registry figure rather than an internal statistic. |
| **Relationship detection** | Identifies corroboration, contradiction, and retraction between units across sources and time. Contradictions are findings rather than embarrassments: they surface as tension the reasoning faculty must resolve or disclose. |
| **Structured mapping** | The connector engine for databases and tabular sources: schema-agnostic field-to-ring mapping, verified against a fifty-row human-confirmed sample per connector before the census counts on it. Deterministic is not the same as correct — a wrong mapping is consistently wrong at scale and invisible to every downstream check. |
| **Confidence calibration** | Versioned, per-language calibration mapping raw model scores to verified correctness rates, with every fact carrying its calibration version. Uncalibrated confidence is never displayed. Because every fact cites its calibration version, a calibration fault is a bounded, queryable recall rather than a diffuse trust incident of unknown extent. |

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Adapter training** | Parameter-efficient tuning on registered open bases using de-duplicated, qualified estate material. All training configuration lives in a versioned recipe seat, and every model cites the recipe version that trained it. The platform never trains from scratch and never runs an unregistered model. |
| **Model acceptance** | The six-check harness: improvement over base on the target stratum by the required margin; no collateral regression beyond bound; evaluation on held-out, census-stratified, uncurated sets; complete lineage including licence inheritance; measured calibration; an attached evaluation card. A model trained on internal-only material carries internal-only restrictions for its life, computed rather than remembered. |
| **Model registry** | The pinned record of every base and adapter: checksums, licences, permitted uses, per-language evidence, versions, and candidate rows across modality classes. Licence verification precedes acquisition; models under non-commercial licences are marked benchmark-only and can never ship in product. |

## **7.6 · Quality assurance**

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Grounding gates** | Mechanical verification that every number in an outbound artefact resolves verbatim to its source units before the artefact ships. A figure that does not resolve does not ship. Fabrication is prevented at the boundary rather than policed after publication. |
| **Record verification** | Deterministic checks over work artefacts: cited objects exist and hash-match; work traces to an authorising instrument; assertions carry evidence classes; submissions are schema-complete; claimed statuses match disk; proposed names collision-check against the registry. The single hard gate is schema completeness — form, never substance. |
| **The critic pass** | An independent model instance reviews work against a fixed rubric with context isolation from the producer. It detects and never decides: findings route to decisions; the critic never blocks or edits; its findings carry evidence classes; and its own detection rate is measured on seeded defects. |
| **Measurement harnesses** | The human-baseline verdict measuring qualification correctness against an uncurated sample with zero tolerance for fabricated attribution; the drift watch alerting on degradation; and the instrumented-first-run harness that baselines every pipeline from its first real execution. |
| **Standing queries and parity seal** | Executable checks over the registry for redundancy, orphaned functions, coverage gaps, and rules whose enforcement cannot be located; and a byte-level parity harness sealing frozen contracts. A rule that cannot name its enforcement is a finding. |

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Objective Service** | The commissioning contract: scope, evidence floor, rights posture, delivery form, and budget assembled into an objective request; dispatch converts it into planned extraction work. An objective's reach is fixed at commissioning — execution orders and optimises within it and never expands it. |
| **Plan generation** | Banded work plans stating extraction volume as a range, reusable stock identified, expected coverage of the goal, and explicitly non-coverable scope; produced before commitment and inspectable before and after execution. What cannot be covered is stated before money is spent. |
| **Gap filing** | Converts refused and unanswerable questions into extraction candidates carrying demand evidence — how many distinct asks cited each gap — which ranks the queue. |

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Answer composition** | Assembles findings exclusively from floor-qualified units, tags each claim by what supports it, and attaches the evidence and coverage strips. The answer, its explanation, and its audit record are one object read three ways, and are therefore structurally incapable of contradicting each other. |
| **Mechanical composition** | The deterministic answer arm serving template-class responses directly from units with no model involvement. The custody fallback and the cost floor: when the shield fails closed, answers still flow — governed, cited, and model-free. |
| **Evidence partitions and working sets** | Precomputed, objective-scoped unit sets that interactive surfaces read, with session working sets holding active context. Request-time reads never touch the raw estate, so governance never surfaces as latency. |
| **Artefact production** | Briefs, reports, datasets, occurrence indexes, and standing feeds generated from qualified units, each carrying licence class, privacy attestation, quality card, and proof trail. Internal-only material visibly cannot leave; rights are inherited by computation rather than asserted by hand at export. |
| **Refusal rendering** | Three honest non-answer shapes, visually and semantically distinct in every surface and in the machine envelope. A technical failure never impersonates an evidential judgement. |

## **7.9 · Commerce**

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Quoting and pricing** | Machine-generated quotes from plans: line items, validity windows with expiry, delivery estimates as ranges, cancellation terms with itemised work-completed liability. Acceptance is a ledger event and becomes the objective of record. |
| **Commit and release review** | Two human approval seats: commissioned work reviewed before it runs, and outbound deliverables reviewed where the instance's rules require a person. Both decisions — approve and return, release and hold — are recorded with reasons. |

## **7.10 · Integration and memory**

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Scoped access** | API keys carrying explicit permission scopes, issued and revoked through the integration surface, with every call landing in the same ledger the compliance officer reads. There is no lighter-weight path for machines. |
| **Memory planes** | One durable, key-scoped partition per integrated application, holding retrieval scope, a contribution store, and a working set that grows from measured use — retention triggered by repeated reads, precompute by repeated query shapes, eviction least-recently-used at the plane's ceiling. Planes are isolated by construction, ledger-reconstructible, frozen on key revocation, and deleted only through the deletion ceremony. |
| **Write-back** | Applications contribute derived context and conclusions as fully-formed qualified units, with the five-ring shape enforced at the API boundary, the contribution class marked, and defensibility capped at what the cited sources support. Contributions are plane-local until published; publication passes the class's quality gates and, where rules require, release review. |
| **Webhooks and envelopes** | Delivery callbacks for standing services, and the answer object as a machine envelope including all three refusal shapes. The refusal shapes are contractual: an integrating application must handle a decline as a first-class response from its first call. |

| **Engine** | **Function and behaviour** |
| --- | --- |
| **Trace rendering** | The public three-lens proof walk — answer, reasoning, raw trail — reachable by anyone holding a receipt link. Verification requires no trust in the vendor and no account: the receipt is the credential. |
| **Ceremony execution** | Rule changes through counter-signature and an enforced waiting period with a visible countdown; deletion through dual approval and a single authorised path ending in a destruction certificate; every stage recorded. |
| **Compliance surfaces** | The trust record assembling rules-in-force, each with its setting, history, and enforcement count, beside the full respect-and-violation record, with end-to-end run proof on demand and regulator-pack export. Violations post as plainly as successes. |

## **7.12 · Ideation and self-learning**
**Everything the platform knows is stored as a qualified unit carrying five rings. **The shape is frozen and byte-sealed: a parity harness proves on every change that the contract has not moved. The whole system is built to it.

| **Ring** | **What it holds** |
| --- | --- |
| **Content** | What was said, written, recorded, or held. Modality-agnostic: an utterance span, a document passage, an image region, a database row all occupy this ring in their own form. |
| **Provenance** | The source object and a precise locator — a timestamp span for audio, a page and region for a document, a table, row, and column for a record. The locator is what makes verification mechanical rather than manual. |
| **Defensibility** | The evidence class, ranging from directly recorded through corroborated to inferred. Standards are set against this ring, and it is the ring the assertion boundary computes over. |
| **Context** | Who, what, when, where. The attribution that makes a fact usable and checkable rather than merely true in the abstract. |
| **Re-extraction handle** | Enough information to reproduce the fact from source: which model, which parameters, which version, which run. |

**Two consequences follow, and both are load-bearing. **A fact's evidence class travels with it permanently, which allows an answer to be gated on evidence quality rather than on model confidence — the difference between a system that knows what it knows and a system that sounds certain. And any fact can be re-derived and re-verified later under a better model without guessing what was done the first time, which is what makes model upgrades safe on a corpus already in production.
# **§9 — Multi-instance architecture**
- **Onboarding as a ledgered event. **An instance's initial governance settings are written to the permanent record as initial settings, and a second onboarding attempt against an existing instance is refused. The founding configuration is auditable years later.
**Part III***  The pipeline*
## **10.1 · Connection and rights posture**
**Structured sources carry an additional gate. **A fifty-row sample is presented for human confirmation — this column is being read as customer identifier, this one as transaction date — and the census does not count the source until the mapping is confirmed. Deterministic extraction is not the same as correct extraction: a wrong mapping is consistently wrong at scale and produces no error signal anywhere downstream.
**On repetitive estates the effect is substantial. **A broadcast archive contains the same advertisements, station identifications, and syndicated programming thousands of times over, and a contact centre contains the same disclosures and scripts in every call. Deduplication is also the origin of a product — the occurrence index answers questions about repetition that no other system in the organisation can answer at all.
Perception reads the prepared material: speech to text, speaker segmentation and naming, language identification, and — where the census finds the material — document, image, and video reading. Every model is a registered open base or an adapter tuned from one, checksum-pinned, held in a swappable seat, and attributable in every result it produces.
Raw material is staged for processing, tracked through it, and purged on completion with a destruction attestation written to the ledger. Source systems are never modified. Where any stage requires a model outside the perimeter, the call crosses the shield: de-identify, invoke, re-identify, with purpose validation at the same seam and a fail-closed posture that substitutes mechanical composition rather than exposing raw content. The organisation can therefore state, and prove, that its material was processed and destroyed, run by run, for the entire life of the deployment.
Extracted material becomes units carrying all five rings, each qualified against the evidence standard. Provenance is paired at write time and the boundary rejects unpaired facts — there is no path by which a claim enters the registry without its source. Qualification is computed and recorded per unit and remains re-computable.
## **11.3 · Calibration**
# **§12 — Model production**
Training is parameter-efficient adaptation of registered open bases on the organisation's own qualified material — not pretraining from scratch, which would cost orders of magnitude more for a worse result, and not prompt engineering, which produces no asset. The method is chosen because it is proven at exactly this workload class and because it is reversible: an adapter that fails acceptance costs a training run rather than a foundation.
**The seat ships empty. **No default recipe is blessed until the first real training run fills it under measurement. Revisions require attached comparison evidence rather than opinion, which prevents the common drift in which training practice migrates on opinion until nobody can reconstruct why the current settings are the current settings.
**No adoption threshold is set in advance of evidence. **A pre-invented threshold manufactures precision the evidence has not supplied, and it tends to be chosen to justify a decision already preferred. A rejected candidate is recorded as tested with its numbers rather than discarded, so the same question is not re-litigated from memory a year later.
- It beats its base on the target stratum by the required margin.
- Its lineage is complete, including the licence class inherited from its training material.
**The licence inheritance is not a formality. **A model trained on internal-only material carries internal-only restrictions for its life, computed rather than remembered, which prevents the most expensive mistake available in this category: shipping a model that quietly encodes material the organisation had no right to distribute.
## **12.6 · The compounding effect**
## **13.1 · Answer composition**
**Interactive surfaces read precomputed, objective-scoped evidence partitions rather than the raw estate. **Session working sets hold active context. The consequence is that governance never appears to the user as latency: the expensive assembly happened when the objective ran, on the record, and the request-time path is a read.
Briefs, reports, datasets, occurrence indexes, and standing feeds are generated from qualified units. Each carries its licence class, its privacy attestation, its quality card of measured numbers, and its proof trail. Internal-only artefacts visibly cannot leave the instance, and the restriction is enforced at the export boundary rather than trusted to the exporter.
**This grammar is what makes the platform usable in regulated settings: **a user who receives a refusal learns something actionable, and an auditor reviewing a refusal sees a decision rather than a failure.
**An audio estate is the hardest material the platform works and the richest. **The plane provides four functions in one loop, and the loop is the capability rather than any single function in it.

| **Function** | **What it does** |
| --- | --- |
| **Extraction** | Audio becomes provenance-paired facts: transcripts, entities, occurrences, and character observations. |
| **Learning** | A Character Register accumulates group-level knowledge of how the estate's languages and audio actually behave. |
| **Training** | Model production is commissioned against a falsifiable target outcome, planned and priced before compute is spent, with per-example provenance. |
| **Invention** | Synthesised voice identities are constructed from the register — authentically of the language, provably of no individual. |

**Each function feeds the next. **Extraction populates the register; the register defines the strata training plans against; trained models improve extraction; invention consumes the register's learned layers.
## **14.2 · Modality extension, never parallel machinery**
## **14.3 · The commission chain**
**All downstream audio work operates on discrete token sequences produced by a neural audio codec, not on waveforms. **The codec is a registered perception model like any other: census-visible, checksum-pinned, running in-perimeter on the organisation's own compute.
**Provenance extends by one field. **The codec version is mandatory on every downstream artefact: a transcript states which codec produced its tokens, and an artefact lacking it is rejected at the registry boundary. Round-trip fidelity is measured and recorded per codec version before that version serves any commission.
**Five additions, all at first ingestion, all cheap now and unaffordable later. **The membership criterion for this set is exactly that asymmetry: re-ingesting an estate to recover a signal that could have been captured on the first pass is the unaffordable mistake.
**Code-switch points are registered facts, not preprocessing metadata. **Position, from-language, to-language, and context class each carry provenance. They populate the register's code-switch layer and they stratify test sets — which is what makes a model's performance on switched speech measurable rather than assumed.
## **16.3 · Synthesis-relevant attributes**
**A change to what deduplication keeps, rather than new detection work. **For each deduplicated item, the instance condition map is retained — the set of channel, time, and condition variants under which identical content occurred. One canonical extraction is stored; the variant set enters training curricula as a designated robustness stratum at zero acquisition cost.

| **Layer** | **Contents** | **Primary consumers** |
| --- | --- | --- |
| **Phonetic** | Per-lexeme pronunciation variants, frequency, regional distribution | Curriculum; extraction lexicons; evaluation stratification |
| **Prosodic** | Intonation contours, stress, rate distributions, pause structure | Training; programme-type classification |
| **Condition** | Channel and environment profiles | Stratification; error prediction |
| **Code-switch** | Switch-point patterns, language pairs, context classes | Training; test-set design |

**This is the most consequential boundary in the plane, and it is enforced by making the violating state unrepresentable rather than by policing it after the fact.**
- **Acquired, not anatomical. **The attribute is learnable by a speaker from a different background.
## **18.3 · Enforcement shape**

| **Component** | **Source** |
| --- | --- |
| **Acoustic identity** | Constructed organic parameters — chosen, never copied. |
| **Speech character** | Inherited from the register's phonetic and prosodic layers. |
| **Interaction character** | Turn-taking, formality, and code-switch behaviour, inherited from the register. |

|  | **Extraction planning** | **Training planning** |
| --- | --- | --- |
| **Object** | Source locations | Register strata |
| **Floor** | Defensibility class | Acceptance threshold — accuracy against coverage |
| **Output** | Mining plan | Training plan, curriculum, and milestones |

**Every training example carries its provenance into the training manifest. **Rights become enforceable per example; an example whose rights lapse is identifiable and the affected models enumerable; and “the trained model is the organisation's property” becomes a statement backed by a manifest rather than an assertion.
**Part V***  Governance*

| **Seam value** | **What it governs** |
| --- | --- |
| **Deletion ceremony requirement** | Whether and how a second approver is required on the authorised deletion path. |
| **Rule-tightening delay** | The enforced waiting period between counter-signature and application of a rule change. |
| **Quarantine halt threshold** | The share of quarantined batches at which a run stops for cause analysis. |
| **Aggregation floor** | The minimum group size any output may describe. |
| **Default licence class for new sources** | The rights posture a source carries until declared otherwise. Fails closed. |
| **Masking discipline** | The de-identification posture applied at the custody seam. |

## **21.2 · Ceremonies**
## **21.3 · Seam values in operation**
**Every unit carries the licence class of the source it came from; every artefact carries the most restrictive class among its sources; every model carries the class of the material that trained it. **This is computed at every step rather than remembered by a person at export time.
Instance isolation is enforced by the persistence accessor rather than by application discipline: unscoped queries do not execute. Within an instance, application memory planes are isolated from each other by the same mechanism. A new query written by a future engineer cannot accidentally cross an isolation boundary, because the boundary is not something the query is trusted to respect.

| **Rule** | **What it means** |
| --- | --- |
| **Rules pay rent** | Every rule names the promise it protects and the cost it imposes, or it is retired. Governance that accumulates without justification becomes the reason people route around governance. |
| **Every function traces to a named service** | A capability that cannot name what it serves is either redundant or unowned; both are defects. |
| **Natural language is never an enforcement medium** | A rule that exists only in prose is an intention. Rules are enforced by tests, gates, and schema, and a rule whose enforcement cannot be located is a finding. |
| **Verdicts are never curated** | Evaluation inputs may be engineered; evaluation samples may not. This applies to model acceptance, quality measurement, and the platform's review of its own work equally. |
| **No invented scope or schedule** | Work proceeds from authorisation, and dates are not manufactured to fill a plan. |
| **Canon before ruling** | No decision is made from memory where the written record exists. The recorded specification is authoritative over anyone's recollection of it, including its author's. |
| **Experimentation at system level only** | The assembled architecture is the object under test. Every component mechanic is known and parameterised: it deploys in force with its conditions of success implemented and its quality measured, or its parameters are undefined — a specification gap to close, not a reason to run tentatively. Gates bind spend, quality, or claims; never existence or force. Trial modes, pilot flags, and observe-first sequencing for known mechanics are defects. |

| **Dimension** | **What it asks** |
| --- | --- |
| **Correctness** | Is the output right, in the class's own units — word error for transcripts, field accuracy for mapping and document reading, per-class scores for tagging, delta against base for models. |
| **Loss** | What did the transformation silently drop? Speech discarded by activity detection, rows dropped in mapping, spans missed in perception. Bounded tightest, because loss cannot be repaired downstream. |
| **Precision / over-application** | What did it wrongly include or over-apply? False deduplication merges, over-redaction in masking, spurious tags. |
| **Attribution fidelity** | Did the who, where, and when survive? Speaker naming, page and region provenance, source-row lineage. |

**A class with no material in the estate stays dormant: defined, instrumented on paper, zero expenditure. **A class the census observes activates — its checkpoints join the instance's measurement sample and its thresholds bind before that class enters production mining. Readiness is complete across classes; only spend follows demand.
**No instance's estate is a development metric. **The platform's specification is class-keyed, and a capability that exists only because the first customer happened to need it is a defect rather than a feature.
## **24.4 · The four measurement events**

| **Event** | **What it produces** |
| --- | --- |
| **Domain-transfer measurement** | The first honest numbers. Registered models run on a stratified sample of the organisation's own material, drawn to reflect census composition rather than curated for a good result. What emerges is not a single accuracy figure but a map: which strata are production-ready, which need adaptation, and which are not yet servable at any acceptable standard. |
| **Targeted adaptation** | Where thresholds are missed, adaptation follows on the specific stratum, language, or condition class that failed, measured against the same sample under the same conditions so improvement is attributable rather than assumed. A stratum that cannot be brought to threshold is declared unservable rather than shipped with a caveat. |
| **The human-baseline verdict** | The composite judgement. A human-checked, uncurated sample assessed for qualification correctness, with zero tolerance for fabricated attribution — a claim attributed to a source that does not support it is a failure regardless of whether the claim itself is true. This is the measurement an organisation presents internally when asked whether the system works. |
| **The drift watch** | Continuous assurance. Later samples compared against the established baseline, with degradation beyond threshold raising an alert. Because every result cites its model version and calibration version, a drift finding localises rather than triggering a general investigation. |

A commissioner shapes an objective: scope, evidence floor, rights posture, delivery form, budget. The registry reports what it already holds against that scope — the reusable stock — and the planner produces a banded plan for the remainder: volume as a range, expected coverage, and explicitly non-coverable scope. Commerce prices the plan into a quote with a validity window and cancellation terms. Acceptance writes to the ledger and becomes the objective of record.
An integrating engineer commissions an application in a single act: the standing objective that defines what intelligence it consumes, the memory plane that will hold what it accumulates, and the scoped key that authenticates it. The ledger records all three together, which is what makes “when was this application authorised and to what scope” answerable.
**Systems assembled in the ordinary way have such paths, **because each was built by a team solving one problem. Closing them all is not a feature; it is the work.
- **Composition **by the dimensions the material actually has: languages observed and their distribution, periods covered, media types present, speaker density for audio, table and field structure for databases.
The census discovers rather than assumes. The platform ships with no schema expectations, no language assumptions, and no content model; everything it reports traces to a measurement it performed. It is re-runnable, and each run is a sealed record so that composition change over time is itself observable. It publishes what it has not measured with the same prominence as what it has.
# **§35 — Evidence and defensibility**

| **Stage** | **What happens** |
| --- | --- |
| **Admission** | Material enters through a connected source carrying a rights posture. Admission is a ledger event: what arrived, from where, under what rights, at what time. Nothing enters anonymously, and the source system is not modified. |
| **Staging and processing** | Material is staged, batched, restructured, and perceived, existing in a working form inside the perimeter. Any crossing to an external model passes the shield; the raw form never crosses. |
| **Qualification and purge** | Facts are written as qualified units with provenance, defensibility, context, and a re-extraction handle. Once extraction completes, the staged raw copy is purged and a destruction attestation is written. The units persist; the working copy does not. |
| **Life as knowledge** | Units are qualified, related, drawn into evidence partitions, composed into answers, aggregated into artefacts, and used as training material. Every use is recorded and each derived object cites what it drew on, so the question “where has this fact been used” has an answer. |
| **Correction** | A fact found wrong is not edited. A correction is a new unit citing what it supersedes, and the relationship engine marks the retraction, so downstream artefacts can be identified and re-derived. Because every unit carries a re-extraction handle, re-derivation under a better model is a scoped operation rather than a corpus reprocessing. |
| **Deletion** | Runs the ceremony: a request stating what and on what basis, a second approver, execution through the single authorised path, and a destruction certificate. Deletion propagates: units, their derived artefacts where rights or law require, and the plane contents of any application holding them. The ledger retains the record of the deletion, because a deletion whose occurrence cannot be proven is not a deletion an organisation can rely on. |
| **Retention** | Retention holds are a governance class: material under hold cannot be deleted, and deletion requests against it are deferred with the reason recorded. The interaction between a retention obligation and an erasure request resolves here as a visible, decided, documented state rather than an argument between systems. |

Runs execute in batches. Each batch that fails quarantines with its reason rather than failing the run, and appears on the board with its status through resolution. When quarantine exceeds the instance's systemic threshold, the run halts for cause analysis — the design assumption being that a run failing at scale is failing systematically and that continuing to spend on it is the wrong default.
## **37.4 · Monitoring quality in production**
Three layers watch continuously. Deterministic checks run on everything: schema completeness at write, referential integrity of locators, verbatim grounding of numbers, statistical tripwires per batch. The critic samples outputs against its rubric. The drift watch compares periodic samples against the established baseline. Findings route to decisions; only custody-class failures act automatically.
## **37.5 · What the organisation staffs**

| **Term** | **Definition** |
| --- | --- |
| **Qualified unit** | One extracted piece of knowledge carrying all five rings; the atomic record of everything the platform knows. |
| **Five rings** | Content, provenance, defensibility, context, re-extraction handle. |
| **Evidence class** | How a fact came to be known — directly recorded, corroborated, or inferred. A property of provenance, recomputable from the re-extraction handle. |
| **Evidence standard (floor)** | The defensibility class an answer's load-bearing evidence must meet before the answer may assert it. |
| **Assertion boundary** | The computed limit on what an answer may claim, derived from the evidence classes of its load-bearing units. |
| **Load-bearing set** | The units an answer would fail without. The assertion boundary computes over these only. |
| **Census** | The measurement of an estate's composition; the platform's first act on any new data. |
| **Objective** | A commissioned goal with scope, standards, rights, and a plan; the unit of ordered work. |
| **Coverage-to-objective** | The measured share of a commissioned goal the current holding can serve. |
| **Opportunity Brief** | A standing advisory proposal generated from the census; reading material, never an approval gate. |
| **Receipt / proof trail** | The ledger evidence chain behind any figure, walkable by anyone holding the link. |
| **Seam values** | The six governance constants each organisation sets at onboarding. |
| **Commit review** | The Operator approval seat before commissioned work runs. |
| **Release review** | The human seat on outbound deliverables where the rules require one. |
| **Occurrence index** | The record of every repeat of identified content: when, where, from which canonical instance. |
| **Evaluation card** | The measured performance record shipped with every trained model. |
| **Memory plane** | The durable, key-scoped memory an integrated application accumulates through use. |
| **Verdict manifest** | The recorded set of load-bearing assumptions a judgement rests on. |
| **Verification Runner** | The surface where an organisation tests that its own governance parameters fire as configured. |
| **Recipe seat** | The versioned configuration class holding all training configuration. Ships empty; fills on measurement. |
| **Rung** | One of four cost tiers in the extraction ladder, from deterministic records to metered external models. |
| **Designed-empty seat** | A place in the architecture deliberately unfilled, with its surrounding machinery complete and its interface defined, waiting on evidence rather than invention. |

*What the system comes down to. An organisation's estate is measured before it is trusted, and what has not been measured says so. The AI comes to the data, and the one path out fails closed. Every fact carries how it came to be known, and every answer is bounded by the evidence beneath it rather than by the confidence of the thing that composed it. Where the evidence cannot carry the answer, the system refuses, names the reason, and files the work that would close the gap. Every step lands in a record nobody can edit, and one identifier threads the answer, the reasoning, and the record — so the account a user reads is the account the regulator reads.*
