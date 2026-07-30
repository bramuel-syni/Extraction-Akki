**AKKI OS · GOVERNED ARTIFACT · ORCHESTRATION BRIEF**
**Governance Orchestration**
**Product & Engineering Brief v1.0**
*Direction, boundary, and the record — the mechanisms that make every run answerable · July 2026*
*Purpose. This brief specifies the governance orchestration class of Akki OS to technical and behavioural depth: the direction governor and the boundary governor, the ledger that records them, the two perimeters, the governed-value taxonomy and its change ceremony, retention and deletion, instance isolation, and the surface on which all of it is proved. It is written for product and engineering and assumes no prior context. Normative language: MUST / MUST NOT / MAY. Companion briefs cover production and integration orchestration.*
**Part I***  What governance orchestration owns*
# **§1 — Three axes, and the two on this one**

| **Axis** | **Governor** | **The question it answers** |
| --- | --- | --- |
| **Direction** | Northena | Is this still in scope, and is this run done? Every run, run after run, recorded. |
| **Boundary** | SyniSense | May this data cross this access point? Every outbound model call, every egress. |
| **Depth** | Solva | Is the reasoning sound, and does the output assert within its defensibility? Specified in the production brief. |

# **§2 — The accountability standard**

| **Stage** | **Does** | **Decision is** |
| --- | --- | --- |
| **Admit** | Compiles a raw intent into a frozen governing artifact, validates it deterministically, and freezes it atomically | Validity check — presence, completeness, membership |
| **Gate** | Checks whether a sub-objective falls within the frozen artifact's declared scope, and routes on the result | Strict set-membership |
| **Converge** | Decides whether the run is done | Threshold check against the done-condition or the budget |
| **Ledger** | Writes the durable, audit-grade record of the run | None — it records, deterministically |

# **§6 — Admit**

| **Check** | **Refusal reason on failure** |
| --- | --- |
| **A lawful basis is present** | missing_lawful_basis |
| **The artifact is complete against its required fields** | incomplete_artifact |
| **The declared scope resolves against the Registry** | scope_unresolved |
| **The defensibility floor is well-formed** | floor_malformed |

## **6.2 · The freeze**

| **Routing** | **When, and what is recorded** |
| --- | --- |
| **Refuse** | Not in scope. A governed refusal, logged with the reason out_of_scope. Recorded, never silently dropped. |
| **Warm serve** | In scope and already converged — servable from qualified intelligence. Answered synchronously. |
| **Fresh extract** | In scope and unconverged — requires extraction. Returns the async contract. |

**The warm/fresh determination is the same fork the objective's execution branches on. **It is made once, at the boundary, by a membership test against a frozen set and a convergence check — not re-derived downstream.
- **Done-condition met **→ terminate, success.
**Northena owns the halt. **The depth governor may report that it cannot reason further soundly; that report is an input Converge acts on, but the stop decision and its record are Northena's alone. A component that could stop a run without Northena recording why would put a termination outside the audit surface.
**The Ledger is Northena's memory and the system's primary audit surface for direction. **Because the Data Protection Officer and the operator audit lens read it, its row shape is a contract rather than an internal log: frozen, versioned, append-only, and closed on every run.
## **9.2 · The row**

| **Field** | **What it carries** |
| --- | --- |
| **run_id** | One run has one closed ledger. |
| **trace_id** | Joins the row to the units and to the trace lenses. |
| **stage** | admit · gate · converge |
| **decision** | admitted · refused · warm · fresh · terminate_success · terminate_budget · continue |
| **reason** | A deterministic reason string — the same inputs produce the same string. |
| **artifact_ref** | The governing artifact: type, identity, version. |
| **lawful_basis_ref** | The basis under which the run was admitted. |
| **stamp_audit** | An optional absorbed side-channel entry, joined by unit and trace. |
| **at** | Timestamp. |

| **Test** | **Asserts** |
| --- | --- |
| **No run without lawful basis** | An intent with no lawful basis is refused at Admit; no downstream stage runs. |
| **Frozen artifact immutable** | A frozen artifact cannot be mutated for the run; a changed intent produces a new admission. |
| **Gate is set-membership** | Gate routes purely on scope membership; no inferential path exists. |
| **Converge owns the halt** | Termination occurs only on the done-condition or the budget from the frozen artifact. |
| **No run without closed ledger** | A run cannot close without a closed ledger row set. |
| **Ledger append-only** | The writer exposes no update or delete within the retention window. |
| **Ledger row frozen** | The row conforms to its snapshot. |
| **No learned import** | No module imports a machine-learning library. |
| **Reasoner is opaque** | The state machine reaches the depth governor only through the handle. |

| **Promise** | **What it means, and how it is held** |
| --- | --- |
| **Single outbound surface** | No model call may originate outside the chokepoint. Enforced today by a pattern scan over the codebase, being promoted to a syntax-tree gate that resolves aliases and indirection, extended to outbound requests against provider hosts, and backed by a runtime egress allowlist. |
| **Custody chain reachable** | The de-identifier and re-identifier are connected at the chokepoint itself, not at an orchestrator a new call path could bypass. |
| **Grounding proven, not asserted** | Grounding gates run on composed answers and on briefs, each protected by its own cell suite. An ungrounded claim is a refusal. |
| **Data-blind prompts** | Prompt templates carry no data, enforced by negative scan over the template files. A prompt that cannot contain data cannot leak it. |
| **Advisory markers at write and render** | Advisory-class outputs are stamped when written and enforced visible when rendered. A marker applied only at write can be dropped by a renderer. |
| **Refusal taxonomy closed** | Refusal modules span the layered governance surface; no ad-hoc refusal path exists. |
| **Telemetry sidecar per invocation** | Every model invocation emits a sidecar record. |
| **Mechanical fallback arm** | Any composition reaching for a model carries a deterministic fallback beneath it, preserved byte-identical. |
| **Class-honesty boundary** | A structural scan bounds the governed-response surface so a class cannot be misstated at composition. |
| **Namespace boundary** | Generated identifiers are minted inside their owning registry, so identity cannot be forged from outside it. |

**The enforcement is being strengthened, and the gap is stated rather than glossed. **The current check is a pattern scan over named provider libraries. Four evasion classes pass it — raw outbound requests to a provider host, dynamic import, attribute indirection, and aliased import. The fix is a syntax-tree gate resolving aliases and indirection, provider-host patterns over outbound request libraries, a named-file exemption list in place of a directory exemption, and a network egress allowlist at the process boundary. The last of those is what converts the guarantee from continuous-integration-true to architecturally true.
**A test-only bypass parameter remains on the production invocation signature. **No non-test caller passes it, and it is scheduled for removal with tests moved to substituting the de-identifier directly. Until then the no-override property holds by convention at that one point rather than by construction.
## **15.1 · The sequence**
- **Provider selection. **Resolved from configuration. Where no credential is present, a deterministic echo provider serves instead — the system degrades to a knowable behaviour rather than failing open.
- **De-identify. **The inbound payload transits the de-identifier, which strips identifiers to placeholder tokens and records the mapping in a per-request custody envelope.
- **Invoke with metering. **The call is made and per-call metering is emitted to the telemetry sidecar.
- **Re-identify. **Output transits the re-identifier against the same custody envelope. An unmatched token raises rather than passing through — a placeholder that cannot be resolved is an error, never a value.
- **Grounding gate. **A per-sentence anchor map is enforced on composed output.
- **Class-honesty check. **A structural scan bounds the governed-response boundary.
- **Trust receipt. **Every invocation writes one.
## **15.2 · Why chokepoint, not orchestrator**
**Custody enforced at an orchestrator is custody a new call path can miss. **Custody enforced at the invocation itself cannot be missed, because there is no other invocation. The chokepoint pattern places the guarantee at the narrowest point in the system rather than at the most convenient one.
# **§16 — The custody chain**
**De-identify → invoke → re-identify, per request, with the mapping held in a per-request envelope. **The de-identifier strips identifiers to placeholder tokens; the re-identifier re-attaches them against that same envelope.
**Tenant-scoped entity resolution **supplies the entities that must be recognised for a given instance, so de-identification is not limited to what a general recogniser detects.
**The envelope is per request and does not outlive it. **A mapping that persisted beyond the call would be a standing re-identification key, which is precisely the artefact the chain exists to avoid creating.
# **§17 — Purpose enforcement**
**Purpose enforcement is a property of the chokepoint, distributed across four mechanisms rather than concentrated in one validator module. **This is the as-built posture and it is recorded here as such.
- **The data-blind prompt boundary. **Templates by construction cannot leak purpose-scoped data, because they contain none.
- **The grounding gate as proof of purpose alignment. **A claim that is ungrounded is refused; an output that cannot be anchored to material within scope does not compose.
- **The closed refusal taxonomy. **The refusal modules exhaustively enumerate the governed-purpose refusal paths, so a purpose violation resolves to a named refusal rather than an ad-hoc one.
- **Advisory-marker discipline. **Non-fact classes carry markers at write time and at render time, so an advisory output cannot be consumed as a governed one.
# **§18 — Key custody and receipts**
**A trust receipt is emitted per invocation. **It is the key-custody envelope: evidence that the call happened, under which custody, without exposing the credential.
**The credential is never logged. **Its presence surfaces as a boolean probe at module load; its absence selects the deterministic fallback provider. Nothing downstream branches on the credential's value.
**Two custody pathways exist: **the synthesis path through the chokepoint, and the perception path through the perception router. Both emit receipts; neither bypasses the other.
# **§19 — Grounding and the model ladder**
**Grounding is proven, not asserted. **Composed output carries a per-sentence anchor map, and the gate enforces it. A sentence that cannot be anchored to material is not a weaker sentence — it is a refusal.
**Every model-reaching composition carries a lower-rung fallback. **The mechanical composer is preserved byte-identical as that fallback. A system whose highest rung has no floor beneath it has a single point at which output quality becomes unbounded.
**Advisory outputs are marked twice. **At write time by the producing service, and at render time by the surface — because a marker enforced only at write can be dropped by a renderer that never knew it was load-bearing.
# **§20 — SyniSense's invariants**
- The chokepoint function is the only module invoking the model client in the entire codebase. This is a design invariant; its enforcement is currently a pattern scan and is being promoted to a syntax-tree gate with a runtime egress allowlist beneath it.
- The contracts anchoring the boundary are frozen; changes to them are seal events requiring an owner ruling.
- Every model invocation transits de-identify → invoke → re-identify. No orchestrator path is authorised.
- The refusal taxonomy is closed. No ad-hoc refusal path exists.
- Any composition reaching the highest rung is paired with a lower-rung fallback, preserved byte-identical.
- Prompt template files are negative-scanned against tenant data.
**Part IV***  The two perimeters*
# **§21 — Inner and outer**
**Delivery has two perimeters, and they enforce differently because they carry different risk. **The inner gate governs the live path, where governance is enforced per call. The outer gate governs extract, where material leaves as a hand-over and cannot be recalled.

| **Perimeter** | **Governs** | **Enforcement mode** |
| --- | --- | --- |
| **Inner gate** | The live path: queries against a standing service, per-response answers | Per call. Key scope enforced server-side. Class carried inline on every response. |
| **Outer gate** | Extract: datasets, artefacts, anything handed over | Once at export. Rights check, irreversibility check, cumulative-disclosure check, licence issue, receipt minting. |

# **§22 — The outer gate**
**Five checks run before anything leaves, **and each is a distinct failure mode rather than a stage of one check.
- **Rights. **Does the licence class of the material permit this delivery to this recipient for this purpose?
- **Irreversibility. **Can what is leaving be reversed into material the organisation may not release? This is why raw media is out of scope: irreversibility cannot be honoured on it.
- **Cumulative disclosure. **Would this export, combined with what has already left, reconstruct what neither export alone would?
- **Licence issue. **The terms under which the recipient may use what they receive, attached to the deliverable.
- **Receipt. **The fact and the fingerprint of the transform — never anything that could aid reversal.
**Nothing partial egresses, including on cancellation. **A cancelled run is still ledgered, and the partial output does not leave. Partial egress would make the perimeter probabilistic.
# **§23 — Cumulative disclosure**
**Single-packet refusal is live; the cumulative arm across sessions is a closed seam awaiting its thresholds. **This is a deliberate, recorded state rather than an omission.
**The arm evaluates three thresholds across repeated exports: **a minimum group size, a minimum distinct-value count within a group, and a cumulative privacy budget. Individually clean egresses that recombine to reconstruct identities are refused when any threshold is crossed or the budget is exhausted.
**It is closed by construction, not by configuration accident. **The admission function returns false whenever any of the three values is unset or unparseable, so the arm cannot half-open. Opening it is a DPO decision: the thresholds are set, the arm begins admitting, and a new refusal reason path becomes reachable.
**When it opens, the system begins persisting egress fingerprints across sessions. **That is a material change in what the platform retains, and it is why the decision belongs to the DPO rather than to configuration management.
**Part V***  Governed values*
# **§24 — The rules taxonomy**
**Four classes of governed value share one record shape and one surface. **They differ in change authority, change velocity, and verification method — which is what makes them different objects rather than one object with four labels. Treating them alike is how a weekly operational update ends up waiting on a seventy-two-hour ceremony, and how a platform invariant ends up editable at runtime.

| **Class** | **Develop** | **Deploy** | **Operate** | **Verify** |
| --- | --- | --- | --- | --- |
| **Rails** | Authored as code and contract | Only through a build; never runtime-editable | Not operable — observable only | A hard-fail check; a rail without one does not exist |
| **Rules** | Defined with type, bounds, recommended default | Set at setup, locked at approval | Propose, counter-sign, wait, apply, certificate | Live test packs, per rule |
| **Engine settings** | Declared with their conditions of success | Pinned per engine version | Engineers, through versioned deployment | The version's evaluation verdict |
| **Registries** | Schema defined once; rules reference by version | Initial load at setup or first upload | Upload, validate, difference, confirm, version | Validation report and a live probe on drawn entries |

**Runtime tunability has exactly one path. **An engine setting that genuinely needs operational control is promoted to a rule: the owner files what the parameter is, why it needs runtime control, and its blast radius; it enters the rule registry with type, bounds, and a recommended default; it leaves engine-pinned configuration at the next version bump; and thereafter it changes only through the change ceremony. Until promotion completes, no runtime edit exists. Demotion requires the same ceremony.
**There is no third path, **because “it is only an engine setting” is otherwise the route around every rule in the system.
# **§25 — Changing a rule**
**A rule is never edited in place. **The change moves through a visible pipeline, and the pipeline is the governance.
- **Propose. **The DPO proposes the new value with a reason. The rule, its current value, and the proposed value are all on the record.
- **Counter-sign. **The Master Admin counter-signs, or returns it with a reason. The counter-signature lands in its own ledger.
- **Wait. **An enforced waiting period runs with a visible countdown, during which the change can be cancelled. The duration is computed from the change's consequence class rather than fixed — tightening a floor and widening a ceiling do not carry the same delay.
- **Apply. **The value updates and a change certificate is written.
- **Re-verify. **The affected verification packs re-run. A changed rule should be demonstrated firing rather than assumed to fire.
**Work completed under the prior rule keeps the rule version that governed it. **The record does not retroactively re-govern anything, because a record that changed its own history would not be a record.
**The lifecycle: **upload, validate with row-level errors and fail closed on malformed input, review the difference as added, removed, and changed, confirm, then version with an effective-from stamp and a rollback path.
# **§27 — The classification substrate**

| **Registry** | **What it classifies** |
| --- | --- |
| **Data class** | The sensitivity and handling class of material, which determines which rules apply to it. |
| **Consequence class** | The severity of a proposed rule change, which determines the waiting period it carries. |
| **Refusal families** | The named families a refusal resolves into, which is what keeps the taxonomy closed. |
| **Held class** | What is currently held and why, and under which resolution path. |
| **Disclosure types** | The kinds of disclosure a delivery constitutes, consumed by the outer gate. |
| **Trust-receipt allowlist** | What may appear on a receipt — which is a positive list, so nothing appears by default. |

**Part VI***  Retention, deletion, isolation*
**Where an estate is audio, a second custody boundary exists alongside the model seam, **and it governs what may be learned rather than what may leave. It is enforced by the same pattern: the violating state is unrepresentable rather than policed.
**The governing distinction. **Anatomical characteristics — vocal tract length, formant structure, glottal source, fundamental frequency range — cannot be acquired or shed, are what speaker verification keys on, are biometric, and are never registered. Characteristics acquired from a speech community are group properties by construction and may be.
**The write path cannot express a voiceprint. **An automated invariant attempts each known leakage path on every change to the register code and must fail to store all of them. A test asserting the schema’s shape would pass a schema that had quietly grown a field.
**The synthesis gate is fail-closed and has no override. **Every constructed voice identity is scored against every speaker representation derivable from the corpus and must clear a minimum distance from all of them; below threshold it is rejected and resampled. The threshold and the verification method are recorded with the identity, and a passing identity issues a certificate naming both alongside the corpus version scored against.
# **§27B — Audio data classes on the record**
**The record gains data classes rather than a second ledger. **Collection events, calibration runs, curriculum decisions, milestone status changes, run certificates, objective-shaping sessions, and register write events all stamp into the one ledger under audio and training data classes.
**The default is indefinite, append-only retention, and it is stated as a default rather than presented as a policy. **No deletion code path exists in the direction governor's services, and its absence is guarded by a test that scans for deletion, purge, and expiry tokens and asserts none are present.

| **Class** | **What it means** | **What the record shows** |
| --- | --- | --- |
| **Enforced** | A check runs, fails closed, and emits a receipt | The live check result and its receipt; enforcement and violation counts |
| **Attested** | Held by a recorded human act — a signature, an instrument, a counter-signature | The attestation artefact, its signatories, its date. No enforcement count, because there is no check to count. |
| **Monitored** | Measured and reported, but does not block | The observation log, with its non-blocking status stated plainly |

| **Obligation** | **What fails the build** |
| --- | --- |
| **Determinism** | Any learned import in the direction governor's modules. |
| **Opacity** | Any access to the reasoner's internals from the orchestration. |
| **Append-only** | Any update or delete path on the ledger writer. |
| **Closed ledger** | A run closing without a closed row set. |
| **Lawful basis** | Any downstream stage running after an admission with no lawful basis. |
| **Set-membership** | Any inferential path in the routing decision. |
| **Chokepoint** | Any model client import outside the boundary governor. |
| **Custody** | Any invocation path bypassing de-identify or re-identify. |
| **Data-blind prompts** | Any tenant data appearing in a prompt template file. |
| **Contract identity** | Any frozen governance contract diverging from its snapshot. |
| **Isolation** | Any data access path reaching across the instance boundary. |
| **No deletion path** | Any deletion, purge, or expiry token in the direction governor's services while the retention seam is closed. |

| **Decision** | **Owner** | **State** |
| --- | --- | --- |
| **Ledger retention window and end-of-window rule** | DPO | Default is append-only immutability with indefinite retention. Must be closed before any data-subject-rights or retention obligation is exercised in production. |
| **Cumulative-disclosure thresholds** | DPO | The arm is built and closed. Group size, distinct-value count, and privacy budget are unset; the arm cannot half-open. |
| **Deletion audit posture** | DPO | Recommended: deletion events recorded through the absorbed side-channel, so deletion is an entry rather than a mutation. |

*What governance orchestration comes down to. A run is admitted against a frozen artifact carrying a lawful basis, or it does not start. It is routed by membership against a declared set, never by inference. It stops on a condition fixed before it began. Every model call it makes transits one chokepoint, de-identified going out and re-identified coming back. Everything that leaves passes five checks and mints a receipt. And every decision along the way lands in an append-only record that closes with the run — because a run nobody can account for afterwards is a run the platform should not have performed.*
