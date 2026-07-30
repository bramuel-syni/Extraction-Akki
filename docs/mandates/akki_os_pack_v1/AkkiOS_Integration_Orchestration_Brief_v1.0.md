**AKKI OS · GOVERNED ARTIFACT · ORCHESTRATION BRIEF**
**Integration Orchestration**
**Product & Engineering Brief v1.0**
*Purpose. This brief specifies the integration orchestration class of Akki OS to technical and behavioural depth: the answering service and its refusal machinery, the async delivery contract, the memory layer and its provenance separation, the seam contract every consumer meets, opportunity briefs, the developer surface, and the buyer path. It is written for product and engineering and assumes no prior context. Normative language: MUST / MUST NOT / MAY. Companion briefs cover governance and production orchestration.*
**Integration is accountable for one thing: that intelligence reaches its consumers under the rights and masking in force, and that consumption returns value the organisation can account for. **Failure looks like capability that exists but nothing consumes, consumption that escapes the rights envelope, or value that leaves unmetered.

| **Stage** | **What it decides** |
| --- | --- |
| **Admission** | Whether a request is complete and admissible, and whether it can be served warm or requires fresh extraction. |
| **Composition** | How qualified intelligence becomes the declared output form, at the declared grain, under the declared standard. |
| **Delivery** | Synchronously, or under the async contract; through the inner gate for live queries or the outer gate for hand-over. |
| **Memory** | What a key may reach, what it may retain, and what may never cross between keys. |

- **A refusal is a governed outcome, not an error. **It is distinguished by a discriminator in the body, never by a status code, and an infrastructure fault is never rendered as a refusal.

| **Element** | **Why it is present** |
| --- | --- |
| **The discriminator** | Marks the response as a governed refusal rather than a validation failure or a fault. It lives in the body, never in the status code. |
| **The named reason** | Resolves to the versioned reason set, so the refusal means the same thing to every consumer. |
| **What was asked** | So the reader can see the refusal is about their request and not a generic state. |
| **What is supported** | The class or capability the system can actually offer against that ask. |
| **The path forward** | Actor-appropriate: only actions this actor can actually take. |

| **Rule surface** | **Enforced at** |
| --- | --- |
| **Grain–form compatibility** | Admission, for a request that arrives complete; and shaping, inside the conversation, for a work order being built. |
| **Provenance preservation** | Both wizard variants — the operator's shaping-time refusal and the buyer's offerability check. |
| **Licence-class selection** | Selection at admission; the source-standing declaration table; and the generalisation the outer gate applies at export. |

| **State** | **Meaning** |
| --- | --- |
| **accepted** | The request was admitted and work is queued. The acknowledgement carries the objective identity and the delivery estimate. |
| **running** | Work is in progress. Sub-stages such as mining and transforming are detail on status reads, not states an application must handle. |
| **delivered** | The result is available for governed fetch over the application's authenticated key. |
| **refused** | A governed refusal, carrying the same envelope as a synchronous refusal. |

**Sub-stages are deliberately not states. **Exposing mining and transforming as states would make every application's state machine depend on the platform's internal pipeline, and a pipeline change would then be a breaking change for every consumer.
*Pushing claims to application-configured URLs would be an egress path the gates do not control. The webhook is thin for that reason and no other.*
**An idempotency key is required on external submission. **A retried request must not double-commission or double-charge. The same key resolves to the same objective, and a duplicate submission returns the existing state rather than creating a second one.
**Cancellation requires no reason. **It references the terms already agreed at commission, halts queued work, and retains what has completed.
**Envelopes are frozen and additive. **A field is added; a shape is never mutated. A breaking change is a new path version, so an application built against the current contract keeps working.
# **§20 — The promise**
**To the estate holder: **every application's memory is visible, receipted, rights-bound, and revocable. Integration deepens without governance thinning.
**Every integration key is issued with exactly one memory plane: **a durable, instance-scoped, key-scoped partition, created at commissioning and existing for the key's lifetime.

| **Store** | **What it holds** |
| --- | --- |
| **Retrieval scope** | Which registry strata and evidence partitions the application may read. References, not copies — the Registry remains the source of record. |
| **Contribution store** | Units the application has written back, under the write-back contract. |
| **Working set** | What usage-proportional persistence retains hot and precomputes for this application, derived from observed use. |

## **21.2 · Isolation**
**Sharing happens only through the Registry, by rights-bound publication. **There is no direct path from one plane to another, and no aggregate view across planes that an application can reach.
## **21.3 · Ledger-reconstructible**
## **21.4 · Revocation and deletion**
**Key revocation freezes the plane: **no reads, no writes. Freezing is immediate and does not require the deletion ceremony, because it removes access without destroying evidence.
**A revoked application's contributed units survive in the Registry if and only if they were published. **Unpublished contributions delete with the plane, because they were never the estate's material — they were the application's working material held under the estate's governance.
# **§22 — Two memories, separated by provenance**

| **Memory** | **What it holds** | **Who benefits** |
| --- | --- | --- |
| **Estate memory** | Anything derived from the estate itself — qualified units, verified intelligence, indexes. Held in the Registry. | Shared substrate. Every key benefits, and work provoked by one enriches the estate for all. |
| **Mind context** | Anything derived from the interaction — what was asked, how it was framed, the reasoning trail, what the flow retained. Held in the plane's contribution store and working set. | The customer's thinking, and their property. Bound to the key's plane at the moment it is written. It never crosses. |

**The consequence in practice. **One key never learns that another asked, what it asked, or the shape of its inquiry — even where its own answers improve because extraction the other's questions provoked has enriched the estate.
# **§23 — The write-back contract**
**An application may contribute derived context, corrections, and conclusions back to its plane. **This is what turns a query surface into a memory service: the application's own work accumulates rather than evaporating between calls.
## **23.1 · Shape**
**Every contribution lands as a qualified unit in the five-ring shape. No free-form blobs. **Content, provenance — the application, its key, and the calls it derived from — defensibility class, context, and a re-derivation handle are all required at write.
**An incomplete contribution rejects at the API boundary. **Not stored and flagged; rejected. A store that accepts malformed units accumulates material that cannot later be reasoned over, and the cost of that surfaces long after the write.
## **23.2 · Class and rights at birth**
**Contributed units carry a distinct class and inherit internal-only rights at birth. **Rights default closed: a contribution is not exportable until something explicitly makes it so.
**Defensibility is capped at what the cited sources support. **An application citing inferred material cannot mint corroborated facts. This is the assertion boundary's principle applied at the write boundary: reasoning done outside the platform cannot raise a class any more than reasoning done inside it can.
## **23.3 · Visibility and setting**
**Contributions are plane-local by default: **visible to the contributing application only, and invisible to the ask console, to briefs, and to every other consumer.
**Write-back is a commissioning choice: **on with a per-cycle volume ceiling, or off. The setting is visible to the Data Protection Officer either way — as is the volume written, whichever setting applies.
# **§24 — Publication**
**Promoting a contributed unit from plane-local to Registry-visible is a separate act, and it is never automatic. **Publication passes the quality gates of its output class, carries its rights, and where the instance's governance values require, passes release review.
**This is the boundary between an application's working material and the organisation's estate. **An automatic promotion would mean anything an application inferred became estate material by being written, which would let an integration author the estate's record from outside it.
# **§25 — Usage-proportional persistence**
**The working set grows from observed use, never from anticipation. **Units and partitions the application reads repeatedly are retained hot; query shapes it repeats gain precomputed results; strata it never touches are never replicated into its plane.
## **25.1 · Mechanical, parameterised, visible**

| **Decision** | **Trigger** | **Why it is a number rather than a judgement** |
| --- | --- | --- |
| **Retain hot** | Reads within a window — default three reads in thirty days | A retention rule nobody can state is a rule nobody can audit or tune. |
| **Precompute** | Repeats of a query shape — default five | Precomputation by judgement produces a working set nobody can predict the cost of. |
| **Evict** | Least-recently-used at the plane's storage ceiling | A ceiling with no eviction policy eventually refuses writes instead of making room. |

## **25.2 · References, not copies**
**The working set holds references and derived read-structures — never copies that would escape rights binding. **Evicting an entry loses nothing, because the Registry remains the source of record. A copy in a plane would be material whose rights posture could drift from its source's.
## **25.3 · Reporting**
**Memory growth reports per plane per cycle **— units retained, precomputes held, storage consumed — to the application on its own dashboard line, and to the compliance record.
# **§26 — The integration wizard**
**Integrating an application is commissioning a standing objective with a memory plane attached: one flow, one ledgered act. **It runs the platform's standard objective-shaping steps with three memory-specific additions.

| **Step** | **What is settled** |
| --- | --- |
| **Define** | The application's standing need in plain words — what intelligence it consumes, for what function. |
| **Scope** | Retrieval scope selected from what the Registry holds — strata, periods, evidence floor — with coverage shown against the stated need before commitment. |
| **Standards and rights** | Evidence floor for served answers; the plane's rights ceiling, bounded by source licence class; aggregation floors applied per the instance's governance values. |
| **Memory plane settings** | Write-back on or off with its volume ceiling; the storage ceiling; retention and precompute parameters, defaults shown and adjustable; webhook registration. |
| **Commission** | One ledgered act creates the key, the plane, and the standing objective together. The confirmation states what is permanent. |

**The first call lands in the compliance record like every call after it. **There is no warm-up period in which an integration is unobserved.
**Re-scoping is asymmetric. **Widening retrieval scope or raising a ceiling re-enters the wizard at the scope step and re-commissions; tightening applies without ceremony. Scope changes are ledger events either way — the asymmetry is in the ceremony, never in the record.
# **§27 — Governance visibility**
**The compliance record gains a per-application view, **in the same table shape as the estate's governance classes: each plane's scope, rights ceiling, write-back setting and volumes, storage growth, call activity, and every scope change with its ledger receipt.
**Contributed-unit volumes and publication events are line items, **and a publication that passed release review cites its review record. Plane freeze and deletion appear as ceremony records. Nothing about an application's memory is invisible to the estate holder.
**Contributed units are a transformation output class and carry their own quality row.**

| **Dimension** | **Measure** |
| --- | --- |
| **Correctness** | Spot-agreement of contributed conclusions against their cited sources, sampled. |
| **Loss** | Not applicable — contributions are additive rather than transformative. |
| **Precision** | Unsupported-claim rate in contributions, sampled. |
| **Attribution** | Citation-resolution rate: every cited call resolves. Mechanical, and required in full. |

**Publication is where the row binds. **Plane-local contributions are the application's own working material and are sampled rather than gated; nothing enters the Registry without passing the row.
# **§29 — The plane's operating parameters**

| **Parameter** | **Definition** | **Class and default** |
| --- | --- | --- |
| **Plane isolation** | Zero cross-plane reads; the accessor refuses unscoped operations | Invariant; enforced by cell |
| **Write-back ceiling** | Contributed units per plane per cycle | Default ten thousand; set at commissioning |
| **Retention trigger** | Reads within a window before a unit is retained hot | Default three reads in thirty days |
| **Precompute trigger** | Query-shape repeats before precomputation | Default five |
| **Storage ceiling** | Per-plane cap, with least-recently-used eviction | Set at commissioning; no default floor |
| **Citation resolution** | Contributed units' cited calls resolve | Required in full; reject at write below it |
| **Unsupported-claim rate** | Sampled precision of contributions | Reported; the publication gate binds it |
| **Ledger coverage** | Plane operations writing ledger rows | Complete; a plane is ledger-reconstructible |

**Enforcement uses the standing vehicles only. **Scoped-accessor refusal holds isolation; schema rejection at the API boundary holds write-back shape; cells on the carrying phase hold plane lifecycle, ledger coverage, and publication gating; standing queries surface ceiling breaches and stale planes; the compliance record holds visibility. No new enforcement machinery is introduced.
# **§30 — The seam contract**
**One surface, identical for every consumer, settling three things.**
- **Latency classes per operation, with bounds. **One promise across operations of different shape guarantees a broken promise.
- **Identity enforcement at the seam itself, not downstream of it. **Aggregate promises are void if identifying material crosses alongside them.
**Scope is enforced server-side on every call. **A key's reach is a property of the key as the platform holds it, never a parameter the caller supplies. A client-supplied scope is a client-controlled boundary.
**Part V***  Opportunity briefs*
**Standing information memos about what the estate would support. **They are advisory, refreshed with the census, and they appear on the Registry Dashboard as intelligence about the inventory.
**They are never approval gates. **Nothing waits on a brief and nothing is blocked by one. A brief that gated anything would become a queue, and the surface exists to surface opportunity rather than to arbitrate it.
# **§32 — How they are produced**
**They carry advisory markers at write time and at render time. **A marker applied only at write can be dropped by a renderer that never knew it was load-bearing, so both ends are enforced and both are tested.

| **Term** | **Definition** |
| --- | --- |
| **Memory plane** | The durable, key-scoped partition issued with every integration key. Holds retrieval scope, contribution store, and working set. |
| **Retrieval scope** | Which registry strata and evidence partitions a key may read. References, not copies. |
| **Contribution store** | Units an application has written back under the write-back contract. Plane-local by default. |
| **Working set** | What usage-proportional persistence retains hot and precomputes for one application, derived from observed use. |
| **Evidence partition** | A precomputed, objective-scoped unit set that interactive reads serve from. Request-time reads never touch the raw estate. |
| **Contributed unit** | A unit written back by an application, carrying its own class, internal-only rights at birth, and a defensibility cap set by its cited sources. |
| **Publication** | The governed act of promoting a contributed unit from plane-local to Registry-visible. Never automatic. |
| **Warm / fresh** | Whether an ask is servable from qualified intelligence or requires fresh extraction. Determined once, at admission. |
| **Late refusal** | A governed refusal issued after acceptance. A normal terminal state, not a failure. |
| **Thin webhook** | A delivery notification carrying event, objective identity, trace identity, and status — never claim content. |
| **Governed fetch** | Retrieval of a delivered result over the application's authenticated key, with scope enforced server-side. |
| **Offerability** | The bound within which the buyer-variant agent may shape: owned estate, licence class, disclosure limits. |
| **Shared derivation** | The pattern by which a rule enforced at two points is owned by one module that both callers import. |
| **Refusal health** | The administer-surface view of refusal rate per key, read as a signal about an integration's objective. |

*What integration orchestration comes down to. A request is admitted complete or refused with a named reason, and the same rule that refuses it in conversation refuses it at the interface, because both import one module. What the estate already holds returns immediately; what it does not returns a contract with four states, in which a late refusal is a governed outcome rather than a failure. Every key reaches exactly one objective's worth of context and grows a memory that is visible, receipted, and revocable. What one customer's thinking produced never reaches another's, and the only path from an application's working material into the estate is a governed publication. Nothing leaves without passing the perimeter and minting a receipt that resolves, publicly, to the same record the regulator reads.*
