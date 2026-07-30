**SYNI.AI   ·   ENGINEERING SPECIFICATION**

**The Audio Intelligence Plane**

*Extraction · Learning · Training · Invention — end to end*

Including the Commission View surface adjustment across all extraction types · v1.0

*Status of this document: consolidated build specification. It supersedes the working drafts (Audio Capability Spec v1.0 and Addendum v1.1.2) and is the single reference for build. Behavioural clauses state what the system must and must not do, including on failure. Technical clauses state contracts and acceptance criteria. Items requiring verification against current code before build are marked [VERIFY] and collected in §16.*

**Contents**

# **1  ****Governing Doctrine**

Five principles govern every clause in this specification. Where a later clause appears to conflict with one of these, the principle wins and the clause is defective.

### **1.1  An audio file is a data estate, and the framing is recursive**

The archive is an estate; a programme is an estate; a single file is an estate. Segments are rows; the extractable layers — content, language, condition, prosody, occurrence, code-switch, music, group-level character — are columns; no schema exists until one is declared. Census, admission, registry, and record apply at every scale.

### **1.2  Modality extension, not parallel machinery**

The audio plane introduces no sibling services. Mtafiti gains an audio modality; Northena gains audio data classes; the wizard gains an objective variant; Targeta gains a training object. Anything in this document that reads as a parallel to an existing service is rule proliferation and must be collapsed into the existing service before build.

### **1.3  One record**

Mtafiti and Northena collaborate to produce a single record, written once. Working state — loss curves, intermediate metrics, partial coverage counts — is scratch, not truth; it becomes record only when finalized and stamped. No local ledger exists. If a measured throughput ceiling ever demands relief, the relief is batched stamping (one row certifying N events with a digest), which remains a single record. That change is made only when a measurement demands it.

### **1.4  Measure, do not assert**

No data-volume requirement, accuracy expectation, or cost figure is quoted without a measurement behind it. The calibration stage exists to convert assertions into measurements before commitment.

### **1.5  Unrepresentable, not policed**

Safety boundaries are enforced by making the violating state impossible to express in the contract — the pattern established by the assertion floor — not by review after the fact. The Character Register write path (§6) and the voice identity distance gate (§7) both follow this pattern.

# **2  ****Capability Statement and Plane Overview**

Given governed access to an audio estate, the plane provides four functions in one loop:

- **Extraction** — audio is converted into provenance-paired facts: transcripts, entities, occurrences, and character observations.

- **Learning** — a Character Register accumulates group-level knowledge of how the estate’s languages and audio behave.

- **Training** — model production is commissioned against a falsifiable Target Outcome, planned and priced before compute is spent, with per-example provenance.

- **Invention** — synthesized voice identities are constructed from the register: authentically of the language, provably of no individual.

Each function feeds the next: extraction populates the register; the register defines the strata training plans against; trained models improve extraction; invention consumes the register’s learned layers. The loop is the capability.

**Flow of a commission, end to end:**

Objective Wizard session → compile {TargetOutcome, Collection Schema}

→ Sampling & Reflection (calibration) → proposed Milestones + priced quote

→ Owner agrees milestones → Commission opens

→ Collection → Register update → Curriculum → Training runs → Certificates

→ Commission View reports against milestones throughout → Commission sealed

# **3  ****Tokenized Audio Representation**

## **3.1  ****Behaviour**

- All downstream audio work — extraction, character analysis, training — operates on discrete token sequences produced by a neural audio codec, not on waveforms.

- Tokenization exposes two separable streams per segment: the **content stream** (what was said — input to ASR/NER) and the **character stream** (how it was said — input to the Character Register). The character stream is retained and routed, never discarded as noise.

- Control markers (language, register, segment type) are splice-able tokens, enabling one model per estate rather than one per language, and native handling of code-switched speech.

- Failure behaviour: audio in an unsupported condition fails closed with a stated reason. The codec never silently degrades quality.

## **3.2  ****Technical contract**

| **Item** | **Specification** |
| --- | --- |
| **Service** | perception/audio_codec/ — registered like any other perception model; census-visible; runs in-perimeter on tenant compute. |
| **Input** | Audio segment (bounds per ingestion segmentation) + declared or detected condition profile. |
| **Output** | { content_tokens[], character_stream, codec_version } Target token rate 50–100 tokens/second of audio. |
| **Provenance** | codec_version is a mandatory field of every downstream artifact’s provenance. A transcript states which codec produced its tokens. |
| **Pretraining** | The codec pretrains unsupervised on unlabelled estate audio, under the standard commissioned-job contract. |
| **[VERIFY]** | Perception router contract: where model registration occurs, and whether the router carries a second output stream per segment or the character stream requires its own artifact type. |

## **3.3  ****Acceptance criteria**

- Round-trip fidelity is measured and recorded per codec version before that version serves any commission.

- A downstream artifact lacking codec_version in provenance is rejected at the registry boundary.

- An unsupported-condition input produces a refusal with a stated reason and no output artifact.

# **4  ****Extraction Layer**

## **4.1  ****Language identification**

Behaviour: every segment carries a real language signal. The current plumbing value (language_hint: None) is retired.

- A lightweight offline language identifier (CPU-viable, in-perimeter) runs at segment level during ingestion.

- Recorded per segment: languages[], confidences, and code-switch points where multiple languages occur in one utterance.

- The signal routes downstream model selection (ASR path, NER path, de-identification path) and is written into provenance.

**[VERIFY] **Segment boundaries in current ingestion — confirm the unit to which a language label attaches.

## **4.2  ****Code-switch points as facts**

Switch points (position, from-language, to-language, context class) are registered facts with provenance — not preprocessing metadata. They populate the register’s code-switch layer and stratify test sets.

## **4.3  ****Condition profiling**

Channel condition — studio / field / telephone band, transmission artefacts, background class — is derived per segment at first ingestion. It is cheap to compute, directly predictive of extraction error, and required for training stratification. It is captured at first ingestion because re-ingesting an estate to recover it is the unaffordable mistake.

## **4.4  ****Synthesis-relevant attribute capture**

During the same ingestion pass, group-level acoustic attributes required by any future synthesis capability (pitch statistics, energy contours, duration patterns) are captured, subject to the custody conditions of §6.4. This forecloses nothing and costs little; omitting it forecloses the invention function or forces re-ingestion.

## **4.5  ****Deduplication as augmentation**

The occurrence index already identifies repeated content. Its output contract is extended: for each deduplicated item, the instance condition map — the set of channel/time/condition variants under which identical content occurred — is retained. One canonical extraction is stored; the variant set enters training curricula as a designated robustness stratum at zero acquisition cost. No new detection work; this is a change to what dedup keeps.

## **4.6  ****Acceptance criteria**

- No segment leaves ingestion without languages[], condition profile, and (where applicable) switch points in provenance.

- A deduplicated item without its instance condition map fails the ingestion invariant test.

- Baseline-tier capture (§9.2) runs for all admitted material regardless of any active objective.

# **5  ****The Character Register — Learning**

## **5.1  ****Definition**

A registry-modality store of learned, group-level audio characteristics, built from the character stream. Same doctrine as the fact registry: every entry carries provenance to source material and an occurrence count. It is Mtafiti’s qualification-and-index doctrine applied to acoustic observations — an extension, not a sibling (§1.2).

## **5.2  ****Layers**

| **Layer** | **Contents** | **Primary consumers** |
| --- | --- | --- |
| **Phonetic** | Per-lexeme pronunciation variants, frequency, regional distribution. | Curriculum; extraction lexicons; evaluation stratification |
| **Prosodic** | Intonation contours, stress, rate distributions, pause structure. | Training; programme-type classification |
| **Condition** | Channel and environment profiles. | Stratification; error prediction |
| **Code-switch** | Switch-point patterns, language pairs, context classes. | Training; test-set design |

## **5.3  ****Build process**

Unsupervised clustering over the character stream yields candidate strata. A cluster asserts that a distinct variant exists — not what it is called. Naming and validation are human work applied to a sample, commissioned like any other qualified work with quoted cost.

# **6  ****Register Custody Boundary**

## **6.1  ****Governing distinction: organic versus learned**

Organic characteristics are anatomical — vocal tract length, formant structure, glottal source, fundamental frequency range. They cannot be acquired or shed; they are what speaker verification keys on; they are biometric. They are never registered.

Learned characteristics are acquired from a speech community — phonological inventory, pronunciation variants, prosody, code-switching habits. They are group properties by construction. Only learned characteristics may be registered.

## **6.2  ****The four conditions — all must hold**

- **Acquired, not anatomical. **The attribute is learnable by a speaker from a different background.

- **Shared. **Observed across at least N distinct speakers. N is a governed seam value; its default inherits the platform minimum-group-size parameter unless the tenant sets a register-specific value.

- **Non-reconstructive in combination. **Tested against attribute combinations, not attributes in isolation: language + region + age band + one distinctive feature can reach a single person even when each attribute is group-level.

- **Stored as description, not exemplar. **Centroids, distributions, frequencies. Never stored audio; never per-utterance speaker embeddings. Embeddings used during clustering are destroyed after cluster assignment. Provenance points to material, not to speaker identity.

## **6.3  ****Enforcement shape**

The register write path exposes no field through which an instance-level representation can be stored: the schema cannot represent a voiceprint. Unrepresentable, not policed (§1.5). An automated invariant test attempts each known leakage path (small stratum, idiolect marker, narrowing combination, exemplar storage) and must fail to store all of them on every change to the register code.

## **6.4  ****Idiolect rule**

Habitual fillers, characteristic phrasings, and idiosyncratically pronounced words are learned but individuating. They fail condition 2 or 3 and are excluded. “Learned” alone is never sufficient; the four conditions are conjunctive.

# **7  ****Synthesized Voice Identity — Invention**

## **7.1  ****Mechanism: inherit the learned, synthesize the organic**

- Learned characteristics are inherited from the register — this is what makes the voice sound like a speaker of the language rather than a foreigner reading it.

- Organic characteristics are constructed — vocal tract parameters, F0 range, formant structure, glottal parameters are chosen as a point in acoustic space that no real speaker occupies.

This is the inverse of a voice clone. A clone copies the organic and frequently gets the learned wrong; this gets the learned right and owns the organic outright.

## **7.2  ****The distance guarantee (mandatory, fail-closed)**

Every constructed identity is scored against every speaker representation derivable from the corpus using standard speaker-verification methods. A minimum distance from all of them is required. Below threshold, the identity is rejected and resampled. There is no override. The threshold value and the verification method are recorded with the identity.

## **7.3  ****The certificate**

A passing identity is issued a certificate stating that the voice is provably derived from no individual, naming the method, the threshold, and the corpus version scored against. The certificate is a first-class sellable artifact.

## **7.4  ****Identity composition and versioning**

| **Component** | **Source** |
| --- | --- |
| **Acoustic identity** | Constructed organic parameters (§7.1). |
| **Speech character** | Inherited from register — phonetic and prosodic layers. |
| **Interaction character** | Turn-taking, formality, code-switch behaviour — inherited from register. |

Each identity is a versioned artifact with a ledger entry. Changing one is a ceremony with the standard waiting period, because audience recognition accrues to the voice and recognition is the asset. Identities never drift.

## **7.5  ****Scope note**

Rendering requires a synthesis stack, which is a separate build from recognition. What this specification requires now is non-foreclosure: the identity specification (attribute schema, distance method, certificate format) is defined, and §4.4’s ingestion capture ensures the substrate exists when rendering is built.

# **8  ****The Objective Wizard — Schema Compiler**

## **8.1  ****Role**

No business user hand-writes a Target Outcome. The Objective Wizard — a new variant of the existing shaping wizard, reusing its agent interface, guards, session persistence, and ledger sidecar — elicits an objective in plain language and compiles two governed artifacts:

- **TargetOutcome** (§10) — handed to the Training Planner.

- **Collection Schema** (§9) — the data dictionary for this objective: which data points are extracted from the sound, at what granularity, at what quality bar.

## **8.2  ****Elicitation sequence**

- The question the model must answer — operational and falsifiable.

- The population — resolved against existing register strata; unresolved populations are flagged as unmeasured and generate census work.

- The acceptance bar — per stratum, two-dimensional (§10), with the gate-or-document decision recorded explicitly.

- The collection consequences — the wizard derives required columns, shows which are already collected (baseline tier), which exist but are uncollected, and the cost of collecting them. The owner sees the price of the schema before commissioning.

## **8.3  ****Dynamism within scope: propose, qualify, graduate**

- **Propose. **The agent side may propose novel data points no prior objective collected. This is where innovation enters.

- **Qualify. **A proposed column never enters collection directly. It is admitted as a candidate: collected on a sample only, its evidence of value measured against the objective — the same qualification path any fact travels.

- **Graduate. **Qualified candidates graduate into the objective tier for that commission. Graduation into the baseline tier is ceremony-governed (proposal, countersignature, waiting period), because a baseline column is paid on every hour ingested for the life of the estate.

The compile stage is deterministic throughout: the agent proposes; only qualified columns compile. Mechanical guards prove against a stub agent before any LLM is plugged in, per the existing standing disposition.

## **8.4  ****Compile-time rejections**

The wizard cannot emit an artifact the downstream contracts would refuse. Rejected at compile, not warned:

- An Outcome without an existing test_set_ref.

- An acceptance bar missing the per-stratum dimension.

- A Collection Schema requiring a column whose capture violates the custody conditions of §6.2.

## **8.5  ****Record and handoff**

Every session stamps to the ledger via the existing turn-ledger pattern under a distinct data class (objective_session), including options considered and rejected — which is what makes a later “why was the model built this way” answerable. Compiled artifacts hand off to Targeta through the existing admission-handoff pattern. Objective → schema → plan → run is one provenance chain.

**[VERIFY] **The B-2/B-3 landing state of the current wizard, before choosing between extending the existing state machine with an objective variant or standing up a sibling machine sharing the agent interface and ledger sidecar.

# **9  ****The Collection Schema**

## **9.1  ****Definition**

The declared data dictionary of a commission: what is extracted from the sound, for what purpose, at what quality bar. It is the admission standard of the audio estate, per objective (§1.1). It has two tiers.

## **9.2  ****Baseline tier**

Standing, objective-independent, collected at first ingestion for all admitted material. Membership criterion: cheap to collect now, unaffordable to collect later. Contents at v1.0: language identification, code-switch points, condition profile, dedup instance condition map, synthesis-relevant group-level acoustics (§4). Changes to the baseline are seam-governed — ceremony, countersignature, waiting period — because silently narrowing the baseline is how an estate quietly becomes unre-readable.

## **9.3  ****Objective tier**

Declared per commission by the Objective Wizard. Collected against material already in governed scope, priced before collection starts, recorded in the commission’s registry namespace. Candidate columns enter through propose–qualify–graduate (§8.3) only.

# **10  ****The Target Outcome**

## **10.1  ****Schema**

TargetOutcome {

  task          operational statement of what the model must do

  domain        context of use

  population    defined by reference to register strata, not labels

  acceptance    threshold per stratum; two-dimensional (accuracy, coverage)

  gate_policy   per Outcome: missed stratum gates release | ships documented

  test_set_ref  must exist before the Outcome is accepted

  constraints   latency, compute budget, deployment target

}

## **10.2  ****Binding rules**

- **Population is register-defined. **“Language L, accent clusters 1–4, telephone band and studio, adult” — never “speakers of L.” This is what makes coverage computable.

- **Acceptance is per stratum. **A single global threshold hides the failure that matters: 94% on the majority variant and 61% on the rest passes one test and fails the one that decides whether the work reaches the people it was built for.

- **The test set precedes the training. **An Outcome without an existing, stratified test set is rejected at definition time.

- **The gate decision is recorded on the Outcome **at definition — not decided ad hoc at ship time.

# **11  ****The Training Planner**

## **11.1  ****Architecture**

The existing planner pattern is reused unchanged: a deterministic core computes eligibility; a learned layer may only reorder an already-eligible set it receives stripped of the values that decided eligibility; a gate compares learned output against the deterministic baseline; every plan is reproducible from its recorded inputs.

|  | **Extraction planning (existing)** | **Training planning (new)** |
| --- | --- | --- |
| **Object** | Source locations | Register strata |
| **Floor** | Defensibility class | Acceptance threshold — accuracy × coverage |
| **Output** | Mining plan | Training plan + curriculum + milestones |

## **11.2  ****Sampling ****&**** Reflection (calibration) — mandatory first stage**

Data requirements for low-resource fine-tuning are empirical; no analytical answer exists. The first commissioned stage is therefore a calibration: train at three to four data volumes, evaluate per stratum against the test set, fit the scaling curve, extrapolate to the acceptance threshold. Only then is the full run quoted, with a stated confidence interval — never a point estimate. A plan without a calibration stage is rejected. The first job prices the real job.

## **11.3  ****Milestones — the accountability output**

Sampling & Reflection has two customers. It prices the real job, and it authors the accountability structure: its output to the objective owner is not a curve but a proposed milestone list — the checklist of what must be done, in what order, for the commission to succeed. Each milestone carries a done-condition and an owner. The objective owner reviews and agrees the list at commission; from that point, all reporting is against it. Accountability is set before spend, not discovered during.

## **11.4  ****Planner outputs**

- Coverage report — per target stratum: hours available, quality distribution, gaps, cost of closing each gap.

- Curriculum — ordering and weighting across strata derived from the register, not from the corpus’s natural distribution, which is always skewed toward whatever occurred most. The dedup instance condition map enters as a designated robustness stratum.

- Proposed milestone list (§11.3).

- Cost quote with a stated confidence interval.

## **11.5  ****Provenance through training**

Every training example carries its provenance into the training manifest. Consequences: rights are enforceable per example; an example whose rights lapse is identifiable and the affected models enumerable; and “the trained model is the customer’s property” is a statement backed by a manifest, not an assertion.

## **11.6  ****Run governance**

Training runs are commissioned jobs under the existing contract: quoted before start, metered during, certificated on completion. The completion certificate records compute consumed, data touched, manifest hash, and per-stratum results against the Outcome. Failed strata are reported as plainly as passed ones.

# **12  ****Record and Registry Integration**

## **12.1  ****Registry (Mtafiti audio modality)**

Per commission, a scoped namespace within the registry holds: the Collection Schema (versioned), collected data points mapped against it — with declared-but-not-yet-collected as first-class state — the strata referenced by the Outcome, and coverage state per stratum. Reads compose with the global registry; writes are namespace-scoped. On close, the namespace is sealed, not deleted: it is the record of what was collected and why, and the next objective’s wizard session queries prior schemas and coverage so the second project starts from the first project’s map.

## **12.2  ****Record (Northena data classes)**

Training-workflow operations stamp into the one ledger under training-specific data classes: collection events, calibration runs, curriculum decisions, milestone status changes, run certificates. The workflow’s view of “its” record is a scoped lens filterable by commission ID — a view, not a store. Working state (loss curves, intermediate metrics, partial counts) is scratch until finalized and stamped once (§1.3).

# **13  ****Surface Specification — the Commission View**

## **13.1  ****Scope**

This surface adjustment applies to all commissioned work on the platform — extraction, census, and training commissions alike, across every extraction type. No modality receives its own UI, and no surface is a rendering of backend internals: rendering internals quietly commits the backend to building displayable versions of its own machinery.

## **13.2  ****Behaviour**

**The surface is milestones. The artifacts are evidence behind them.**

- At Sampling & Reflection, the proposed milestone list is presented to the objective owner for agreement. Commission does not open until it is agreed.

- The Commission View reports against the agreed checklist: each milestone with its done-condition and owner; status in plain terms — done, on track, behind, missed. Missed is shown as plainly as done.

- Spend against quote is shown at the same plain level.

- Technical material — calibration results, strata coverage, Collection Schema state — is drill-down evidence for whoever asks why a milestone reads as it does. It is never the front page.

## **13.3  ****Modality leaf**

Modality appears at exactly one leaf: evidence inspection. Where provenance resolves to a recording, the source plays at its timestamp rather than rendering as a page region — the existing trust-receipt pattern (“a disputed number is answered by playing the tape”), unchanged.

## **13.4  ****Backend cost constraint**

Milestones are records with done-conditions; the platform already stamps events. No new machinery is built for display. Any surface element in this section found to require new backend computation beyond reading existing artifacts is out of specification and must be removed or re-specified.

# **14  ****Interface Summary**

| **Surface** | **Contract** |
| --- | --- |
| **audio_codec** | audio in → { content_tokens, character_stream, codec_version }; fail-closed on unsupported condition. |
| **Language ID** | segment → { languages[], confidences, switch_points }; written to provenance. |
| **Occurrence index (ext.)** | dedup item → + instance condition map. |
| **Character Register** | Write path: schema cannot represent instance-level identity (§6.3). Read path: strata queries for planner and evaluation. |
| **Objective Wizard** | session → { TargetOutcome, CollectionSchema }; deterministic compile; compile-time rejection of contract-violating artifacts; session stamped to ledger. |
| **TargetOutcome** | Rejected without existing test_set_ref; acceptance per stratum; gate_policy recorded at definition. |
| **Training Planner** | Outcome → { coverage report, curriculum, milestone list, quote ± interval }; reproducible plan_id; plan without calibration stage rejected. |
| **Training run** | Commissioned-job contract; completion certificate incl. manifest hash and per-stratum results. |
| **Voice identity** | register strata + constructed organic parameters → identity; distance gate mandatory, fail-closed; certificate issued on pass; versioned; change by ceremony. |
| **Commission View** | Reads milestones, statuses, spend, and existing artifacts only; introduces no new backend computation. |

# **15  ****Build Sequence**

Ordered by dependency and cost-of-deferral, not by size.

| **#** | **Item** | **Rationale for position** |
| --- | --- | --- |
| **1** | Ingestion capture: language ID, code-switch points, condition profile, synthesis attributes (§4.1–4.4) | Everything downstream consumes these; only cheap at first ingestion. Deferral cost is a full re-pass over the estate. |
| **2** | Dedup instance condition map (§4.5) | Contract change to existing machinery; near-zero new detection work. |
| **3** | Character Register schema + custody invariant harness (§6) | The boundary must exist before the first cluster is stored; retrofitting means rebuilding from source. |
| **4** | Codec service (§3) | Unsupervised pretraining starts on unlabelled audio while labelled work proceeds elsewhere. |
| **5** | Clustering + sampled human validation (§5.3) | Requires 1–4. |
| **6** | Objective Wizard variant + Collection Schema type + registry namespace (§8, §9, §12.1) | The planner must never accept a hand-authored Outcome once the wizard exists; building the planner first invites the malformed-input class the compile stage makes impossible. |
| **7** | TargetOutcome type + planner core (§10, §11.1, §11.4) | Requires register strata to plan against and the wizard to author Outcomes. |
| **8** | Sampling & Reflection machinery + milestone records (§11.2–11.3) | Requires 7 and a test set. |
| **9** | Commission View (§13) | Reads records created in 8; by §13.4 it cannot precede them. |
| **10** | Full training runs under the commissioned-job contract (§11.6) | Last by construction — the planner refuses to run earlier. |
| **P2** | Voice identity rendering; music register | Phase 2. Non-foreclosure is guaranteed by item 1 and §7.5. |

# **16  ****Verification Register and Open Decisions**

## **16.1  ****Items to verify against current code before build**

- Perception router contract — model registration point; whether a second output stream per segment is carried or the character stream needs its own artifact type (§3.2).

- Ingestion segment boundaries — the unit a language label attaches to (§4.1).

- Wizard B-2/B-3 landing state — extend the existing state machine with an objective variant, or stand a sibling machine on the shared agent interface and ledger sidecar (§8.5).

## **16.2  ****Open decisions (owner: product)**

- N for the shared-attribute condition (§6.2.2): inherit the platform minimum-group-size seam value, or set a register-specific one.

- Platform default for gate_policy (§10.1) where an Outcome does not set it: missed stratum gates release, or ships documented. This default silently decides how minority-variant quality is treated under schedule pressure.

- Cluster naming validation: commissioned internally or delegated to an external evaluation partner where one exists (§5.3).

- Codec choice: adopt an existing open codec versus training estate-specific — a trade the Sampling & Reflection machinery can itself answer once built (§3, §11.2).

- Baseline tier contents (§9.2): the v1.0 set is the proposal; every addition is paid on every hour ingested, every omission is paid at re-ingestion.

*End of specification. This document is the single build reference for the Audio Intelligence Plane; the working drafts it consolidates are retired.*

Akki OS · Audio Intelligence Plane · Specification v1.0   ·