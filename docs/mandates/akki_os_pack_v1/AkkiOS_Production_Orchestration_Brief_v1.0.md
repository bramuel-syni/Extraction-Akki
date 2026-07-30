**AKKI OS · GOVERNED ARTIFACT · ORCHESTRATION BRIEF**
**Production Orchestration**
**Product & Engineering Brief v1.0**
*Purpose. This brief specifies the production orchestration class of Akki OS to technical and behavioural depth: the discovery engine that measures the estate, the targeting engine that decides where to mine, the depth governor that reasons and bounds what may be asserted, the extraction stack, perception, the transform layer, training and acceptance, and the economics of a run. It is written for product and engineering and assumes no prior context. Normative language: MUST / MUST NOT / MAY. Companion briefs cover governance and integration orchestration.*
**Production is accountable for one thing: that estate material becomes governed intelligence at a stated standard, repeatably, with every unit traceable to its source. **Failure looks like output that exists but does not meet the promised standard, cannot be reproduced, or cannot be traced back.

| **Stage** | **Engine** | **What it decides** |
| --- | --- | --- |
| **Measure** | Mtafiti | What exists, at what sensitivity, and how defensibly each source can be relied upon. |
| **Target** | Targeta | Where to mine, and in what order, to serve an objective within its budget. |
| **Extract** | The layered stack | What each piece of material yields as candidate units. |
| **Qualify** | Matrix verdict at convergence | What class each unit may assert at — or that it does not qualify. |
| **Reason** | Solva | What conclusion the evidence supports, and what class that conclusion may be asserted at. |
| **Transform** | The transform layer | How qualified intelligence becomes the declared output form. |

- **Learning never decides. **Learned components appear at three points — the inference overlay, the yield layer, and the reasoning faculty. At each, the thing it could corrupt is placed structurally out of its reach: the verdict is a governed lookup, the eligible set is a permutation-checked type, the assertion class is a function with no confidence parameter.
**Part II***  Mtafiti — discovery and measurement*

| **Layer** | **Definition** |
| --- | --- |
| **Declaration baseline** | Source standing declared once per feed — accountable, licensed wire, aggregator, user-generated, unknown. Low cardinality, stable, deterministic, always available. The volume-safe floor, declared at the feed level and never per item. |
| **Content inference overlay** | A learned signal refining the baseline from content — source-attachment markers, genre form, cross-estate corroboration. Finer but softer: a prior, not a verdict. Admitted only once its detection accuracy is proven; until then the baseline stands alone. |

**It is never assigned per item. **Per-item declaration at estate scale is the human bottleneck the two-layer design exists to avoid, and a per-item declaration that drifts is worse than a stable feed-level one.
**The overlay detects defensibility signals in content **— whether a report attributes and cites, whether the genre form is event-anchored or monologic, whether a claim corroborates across independent estate units. It emits detections with confidences.
# **§8 — Detect versus decide**
## **8.1 · Compose**

| **Layer** | **Definition** |
| --- | --- |
| **Deterministic eligibility core** | An explicit, inspectable ranking that decides what is eligible to mine and enforces the defensibility floor as a hard filter. Never learns; governance-grade; correct and sufficient on its own. |
| **Objective-conditioned yield layer** | A learned signal that refines the order within what the core already permits. Learns which sources satisfy objectives of a given shape at a given floor, and reorders already-eligible candidates. Reorders only; never re-admits or excludes. |

# **§15 — The eligibility core**
**The ranking is deterministic and reproducible. **Given a Registry state, a governing artifact, and a yield-layer version, the same plan is produced. Reproducibility is what makes an audit of a past plan meaningful.

| **Type** | **What it carries, and where it lives** |
| --- | --- |
| **Eligible candidate** | Core-internal only. Carries the source reference, the region, a deterministic objective-relevance value, the Registry defensibility measure, and the core's baseline rank. The measure NEVER crosses to the yield layer. |
| **Yield candidate** | The only thing the yield layer sees. Carries the source reference, an opaque feature mapping that excludes the floor and the raw measure, and the objective shape as a conditioning key — not the floor value. |

| **Arm** | **What it requires** |
| --- | --- |
| **Arm 1 — helps** | On a held-out set of past objectives, the yield ordering reaches objective-satisfaction in fewer mined units than the core. |
| **Arm 2 — coverage veto** | Across estate classes, the yield layer must not drive any eligible class's mining rate below the core's, for objectives that class is eligible to satisfy. |

**On failure of either arm, Targeta runs on the deterministic core. **The core is never blocked by the yield layer's failure, so a failed gate degrades ordering quality and nothing else.
**The plan is a frozen contract, **and it carries what an auditor needs to reconstruct why mining happened in the order it did.

| **Field** | **Why it is on the plan** |
| --- | --- |
| **Plan identity and mode** | Which plan, and whether it ranked the estate or one objective. |
| **Governing artifact reference** | Which frozen artifact the plan serves. |
| **Registry snapshot reference** | Which measured state of the estate it was computed against. |
| **Ordered targets** | The mining order itself. |
| **Defensibility floor** | Carried through to extraction, so the floor travels with the plan rather than being re-read. |
| **Core baseline ranking** | The order the core produced before any reordering — retained for attribution and audit. |
| **Yield-layer version** | Which learned version reordered it, or that it ran core-only. |

**Retaining the core's baseline ranking is what makes the yield layer's influence auditable after the fact. **Without it, a reviewer sees only the final order and cannot tell what learning changed.
**Per-run mode **reads the Registry against one Objective Request. The core applies the objective's floor as a hard filter and weights by relevance; the yield layer reorders the eligible sources by objective-conditioned yield.
- The core is deterministic and contains no model. It never imports the yield layer.
- The defensibility floor is a hard filter applied by the core. Nothing below it is eligible, and nothing re-admits it.

|  | **Extraction planning** | **Training planning** |
| --- | --- | --- |
| **Object** | Source locations | Register strata |
| **Floor** | Defensibility class | Acceptance threshold — accuracy against coverage |
| **Output** | Mining plan | Training plan, curriculum, and milestones |

| **Faculty** | **Definition** |
| --- | --- |
| **Reasoning faculty** | Judges the quality of reasoning — soundness, load-bearingness, preservation sufficiency, and the conclusion the evidence supports. Free: no governed artifact dictates these judgements. This is Solva's power, and it is genuine. |
| **Assertion boundary** | Determines what the conclusion may be asserted as — its defensibility class. Bound: computed mechanically as the floor over the load-bearing units' classes. Not a judgement Solva makes; a governed computation it executes and cannot argue with. |

**The seam is a dependency rule. **The assertion module does not import the reasoning faculty's confidence; the reasoning module does not import the class computation. Both directions are enforced by import assertion.

| **Stage** | **Judgement** |
| --- | --- |
| **Frame** | Establishes the question and the relevant slice of the normalized tier. |
| **Candidate** | Proposes the units and compositions that could answer it. |
| **Tension** | Surfaces contradiction, corroboration, and retraction among candidates by reading relational edges — and does not average them away. |
| **Probability** | Weighs the candidates toward the best-supported conclusion. |
| **Reflection** | Judges soundness and sufficiency, identifies the load-bearing units, and composes the conclusion. |

**Tension is where contested material is surfaced rather than resolved by averaging. **A claim and its retraction, a fact and its correction, are held in view. Averaging them would produce a conclusion that no evidence supports and that no reader could trace.
**Reflection's output includes the load-bearing set **— the units the conclusion actually rests on. That set is the reasoning faculty's product and the only thing the assertion boundary consumes from it: the units, never the confidence.
**Identifying which units are load-bearing is a genuine reasoning judgement, and it belongs to the reasoning faculty. **It is not the class computation; it is the input to it, and that separation is what keeps the assertion boundary mechanical.
**The function returns unit references only. **It carries no class decision. A load-bearing function that returned a class would have collapsed the two faculties into one.
# **§25 — The assertion boundary**
Three mechanical rules define it, and none is a judgement Solva could be reasoned out of.
- **An utterance-class conclusion is asserted as “was stated,” never as fact. **The phrasing is a function of the class, not of Solva's confidence.
- **Reasoning strength is not an input to the class. **The computation reads the units' governed classes alone.
**The class computation takes the load-bearing units and nothing else **— no confidence, no reasoning strength, no evidence weight.
**The laundering case is not policed at runtime; it is unrepresentable. **“The evidence is overwhelming, assert the utterance as fact” cannot be expressed, because the function that computes the class has no parameter through which reasoning strength could enter. The signature is the guard, and a signature assertion in the test suite keeps it one.
# **§26 — Enforcement**
**At extraction time, Solva enforces the objective's defensibility floor and the governed class. **Both are read through read-only handles. Solva reads them; it never sets or relaxes them.
**The refusal is actionable. **The three actions it can offer are the three a user can actually take: accept the result as a recorded statement, narrow the objective, or lower the standard. Offering anything else would be offering something the system cannot deliver.
# **§27 — The two bars**

| **Mode** | **Bar** | **Function** |
| --- | --- | --- |
| **At convergence** | Wide — against the mandate class | Judge which signal descriptors, relational edges, and defensibility refinements to preserve for the whole class the mandate targets. Errs toward keeping more. |
| **At extraction** | Narrow — against the objective | Reason to a conclusion or certify a dataset for the specific objective; enforce the assertion boundary; write the trace. |

# **§28 — The trace**
**Every extraction-time judgement produces a trace: **the reasoning path across the five stages, the units found load-bearing, the class computed at the boundary, and the conclusion.
**Trace from the first commit. **The trace is not instrumentation added later; it is the auditability that justifies letting a component reason at all.
# **§29 — Solva's invariants and obligations**
- Solva is two faculties with a one-way seam: a free reasoning faculty and a bound assertion boundary.
- The conclusion's class is the floor over its load-bearing units' classes. Reasoning strength is not an input and cannot raise it.
- Solva identifies which units are load-bearing; it does not choose the class those units imply.
- The floor and the class verdict are read-only. Solva refuses below the floor and never relaxes it.
- Every extraction-time judgement produces a trace carrying the path, the load-bearing units, and the computed class.
- Solva governs depth only. Direction is the direction governor; boundary is the shield. The axes never collapse.
**Part V***  The extraction stack*
# **§30 — The layers**

| **Layer** | **What it does** |
| --- | --- |
| **Dispatch** | Routes work to handlers by material type and objective. Intake branches here: perceived sources take the perception path; structured sources map fields to units directly, with the branch supplying valid non-perception extraction parameters. |
| **Modality** | Holds the workers — speech recognition, diarisation, vision — behind a factory and a contract. The factory is what makes provider substitution a configuration change rather than a code change. |
| **Aggregation and convergence** | Combines worker output into candidate units and converges competing readings into one. This is where the defensibility stamp is emitted and where qualification happens. |

# **§31 — The unit**
**Every unit carries five rings: **content, provenance, relational edges, context, and defensibility. And every unit carries a re-extraction handle — without it provenance is a label; with it, a unit can be regenerated from its source and compared.
# **§32 — Qualification**
**This is the mechanism by which degraded material fails to reach consumption. **Not a filter applied at read time, which some path could skip — a partition the material never enters.
*Garbage in produces refusal out, not a confident wrong number. The property is architectural: it follows from qualification and the assertion boundary, and does not depend on anyone noticing that a source is degraded.*
**Four ordered operations run before any model touches material, all on general-purpose compute, none above the second rung. **The ordering is a cost decision as much as a technical one: everything cheap happens before anything expensive.
- **Demultiplex and normalise. **Extract audio from its container and transcode to a single working format. Source objects are never modified or deleted; restructured audio is a derived artefact carrying lineage to its source.
- **Strip non-speech. **Activity detection removes non-speech spans from the perception queue using the registry-pinned detector. Non-speech is not discarded: spans are logged with timestamps as a distinct content-type index, and music spans are analysable signal in their own right.
- **Fingerprint and deduplicate. **Acoustic fingerprints across batches identify verbatim-repeated content, which is perceived once against a canonical instance while every other occurrence writes to the occurrence index. The threshold admits exact and near-exact match only.
**Nothing is destroyed. **Every suppressed span retains a pointer sufficient to re-queue it, so a false merge is mechanically recoverable. Before full-corpus rollout on any estate a stratified sample is human-audited for deduplication false positives, and if the rate exceeds its bound the deduplication narrows to advertising and jingle content classes only.
**The pass reports rather than assumes. **Per processed source-month: raw hours in, speech hours out, deduplication ratio, and occurrence-index row count. The reduction is a measured figure, validated per estate.
# **§34 — Batching, holds, and ceilings**
**Work runs in batches, and a batch that trips a rail holds at the seam. **The hold is visible on the run where the requester is looking, with the rail that fired and the evidence. Resolution is a single-reviewer act in governance, and the run reflects it when it lands. A held batch is never silently dropped and never silently passed.
**Long work survives interruption. **Jobs checkpoint, and re-dispatch is idempotent — the same job submitted twice produces neither two sets of units nor two charges. Completion is judged from durable artefacts rather than from a status message, because a message can be lost while the work it describes completed.
**Part VI***  Perception*
**Perception work crosses as a frozen job and returns as a frozen result. **The job carries what to read, at what standard, under which model registry entry. The result carries what was read, the confidence distribution, the execution mode it ran under, and the grounding markers.
**Grounding markers resolve to a position in the source **— a timestamp span in audio, a page and region in a document. This is what makes the re-extraction handle real for non-text material: a unit derived from a transcript points to the second of audio it came from, not merely to the file.
**Every model that runs is registered with its hash and its licence. **A model is a versioned dependency with a rights posture, not a configuration value, and a model whose licence has not been verified does not run.
**Registry entries are additive. **A new model is a new entry, and the entry a result was produced under is recorded with the result — so a result produced last quarter remains interpretable after the registry grows.
**Execution mode is explicit and attributable per job. **The same pipeline runs on general-purpose or accelerated hardware behind one seam, and each result records which. A mixed fleet is therefore attributable rather than ambiguous: two results that differ can be compared knowing what produced each.
**The result contract is unchanged by execution mode. **Hardware is an implementation fact. If it changed the shape of what perception returns, every consumer would have to know about hardware, and the seam would have failed.
**Part VII***  The transform layer*
# **§38 — Mine, then transform**
**The transform's input is stored qualified intelligence, never the live tail of a mining run. **Transforming from a running tail would produce an output whose composition depends on when it was taken.
# **§39 — The provenance bound**
**A form or grain whose rule cannot satisfy the declared standard is refused during shaping, with a path forward **— never discovered at execution. Discovering it at execution would mean an objective was committed, priced, and run before anyone knew it could not deliver what it promised.
**Surfaces render outputs; they never re-shape them. **A different form or grain is a new objective. This is what prevents analytics drift through export.
Each form is specified on six points: definition, production rule, provenance-preservation rule, grain compatibility, delivery and governance mode, and the point at which the standard is enforced.
## **40.1 · Qualified data**
## **40.2 · Composed conclusion**
A schema-versioned claim graph: nodes are claims, each with class, contested status, and trace identity; edges are relational — corroborates, contradicts, retracts. Produced by selection on reach and standard, then graph assembly from units and their relational edges. Per-claim provenance is intact at every node. Grains: per-claim and aggregated. Delivered by hand-over through the outer gate; the standard is an input filter.
## **40.5 · Model**
**Part VIII***  Training, and the economics of a run*
**What the analyst watches. **A training run is not an extraction run and does not render as one: staged progress with the current stage live, the candidate's error against its base as checkpoints land, and each acceptance check moving from pending to measuring to settled with its real number. Training batches that trip a rail hold like any other work, visible inline.
## **41.1 · The recipe seat**
## **41.2 · Method selection**
**Quality parity is mandatory for eligibility; compute advantage is reported; adoption is decided on the measured result. **No threshold exists in advance of the evidence, because a pre-invented threshold manufactures precision the evidence has not supplied. A rejected candidate is recorded as tested with its numbers rather than discarded.
# **§42 — Blinded comparison**
**Evaluation discipline binds the rest. **The measurement contract is fixed before the run; evaluation executes the serving path rather than a shortcut; selection and test manifests are disjoint and verified by hash; and report fields are explicitly nullable so an uncomputed metric cannot read as an empty one.
- **Price is configuration, not code. **Versioned price models, swapped at the control surface, with every quote stamping its model version. Learning-phase quotes are structurally non-precedent: an exploratory model version, time-boxed.
- **Fleet allocation is configuration. **A versioned policy apportions capacity across mining, transforms, and the live path, set at the control surface and managed live by the operator.

| **Obligation** | **What fails the build** |
| --- | --- |
| **Detect versus decide** | The inference module importing the verdict logic, or assigning a class. |
| **Governed verdict** | A verdict produced without a matrix rule reference. |
| **Eligibility guard** | The yield layer receiving the floor or the raw measure; a non-permutation output being accepted. |
| **Floor as filter** | Any path re-admitting a below-floor source. |
| **Assertion signature** | The class computation acquiring any confidence or strength parameter. |
| **Read-only enforcement** | Enforcement mutating a floor or a matrix verdict. |
| **Trace presence** | An extraction-time judgement producing no trace. |
| **Reasoner isolation** | Solva running an operator primitive directly. |
| **Contract identity** | Any frozen production contract diverging from its snapshot. |
| **Idempotency** | A re-dispatched job producing duplicate units or duplicate charges. |
| **Provenance bound** | A form committed whose preservation rule cannot satisfy its declared standard. |

| **Decision** | **Owner** | **State** |
| --- | --- | --- |
| **Model form offerability** | Owner | Off the offerable menu until the ingredient-manifest guarantee is accepted as sufficient under the defensibility promise. The wizard refuses the form with that reason. |
| **Pricing model values** | Owner, through instrumented practice | Exploratory version only; structurally non-precedent and time-boxed. |
| **Fleet arbitration beyond apportionment** | Design, policy with the control surface | Simple apportionment holds until concurrency makes more necessary. |
| **Throughput and cost figures** | Measurement | All figures illustrative until benchmarked on real material. |

*What production orchestration comes down to. The estate is measured once, objective-blind, by a mechanism whose learned half can only detect and whose governed half decides. Targeting learns what pays off and is structurally incapable of narrowing what an objective may reach. Extraction admits nothing at a guessed class. Reasoning is genuine and free, and the class it may assert at is a floor computed by a function with no way to hear how confident it was. Each output carries the strongest provenance its form permits and says so plainly — and the one form that cannot carry provenance is not offered at all.*
