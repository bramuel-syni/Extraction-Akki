**AKKI OS · GOVERNED ARTIFACT · SURFACE SPECIFICATION**
**Surfaces, Journeys, and Features**
User Interface & Experience Specification v1.0
*Every console, every screen, every state, and the promise each one keeps · July 2026*
*Purpose. This document specifies the surfaces of Akki OS in full: the design law that governs every screen, the four consoles and what can be done on each, the twenty screens with their elements and binding copy, the reference applications, the journeys the classes walk, and the feature inventory with the objective and promise behind each. It is sufficient to build the front end without further context. Normative language: MUST / MUST NOT / MAY.*
**Marking conventions. **Structure, elements, states, and rules are binding. Figures, names, and percentages inside screens are illustrative. Text marked BINDING COPY is implemented verbatim, without interpretation. Anything not specified here is not licensed by omission.
**Part I***  The design law*
**The system produces governed intelligence — claims honest about how defensibly they may be asserted. **The experience must make that intelligence usable by people who are not analysts, and make the governance felt as trust rather than operated as machinery.
# **§2 — The eight global rules**

| **Class** | **How it is signalled and rendered** |
| --- | --- |
| **Governed refusal** | An outcome discriminator in the body. Rendered in the answer position, warning treatment, with actionable paths forward. |
| **Validation error** | A malformed or incomplete request. Rendered as a form-level correction, never as a refusal. |
| **Infrastructure fault** | A server-class failure. Never dressed as a refusal, never carrying an outcome key. |
| **Access-control denial** | A permission failure carrying a reason and detail. Never carries an outcome key and never renders through the refusal card. |

## **2.6 · One trace thread**

| **Motion** | **Who, and when** | **Purpose** |
| --- | --- | --- |
| **Verification** | Administration and Compliance, at commissioning and periodically | Prove the instance's parameters work before anyone relies on them — seam values hold, de-identification fires, refusals behave, receipts walk end to end. |
| **Exploration** | Analysts and engineers, ongoing | Discover what the estate holds and what it would support, before committing to purchase or integration. Pre-purchase by design. |
| **Consumption** | Buyers and integrating engineers | Turn a shortlist into a governed fetch — acquire a dataset, stand up a standing service, or integrate an application. |

**Part II***  The surface taxonomy*

| **Console** | **What can be done on it** |
| --- | --- |
| **Extraction** | Shape and commission objectives; sample before committing; observe extraction quality live; administer the registry; manage capacity and budget burn; read opportunity briefs. |
| **Compliance** | Own and update the compliance rulebook; monitor enforcement; set retention; prove any run to its lawful record; export for a regulator. |
| **Integration** | The only door to the platform's outputs, internal and external alike: register applications, issue and scope keys, expose the contract, sample the pull shape, monitor usage and refusal health. |
| **Administration** | Reach everything; define roles and rights per console; own the operational rulebook — pricing, fleet, taxonomy; counter-sign consequential changes. |

# **§6 — The screen inventory**

| **Screen** | **Console** | **What it produces** |
| --- | --- | --- |
| **Instance setup** | Administration | The signed setup record |
| **Source connection** | Extraction | A connected source with its approval record and rights label |
| **Registry Dashboard** | Extraction | The exportable estate map |
| **Item profile** | Extraction | Source-level detail at item granularity |
| **Opportunity Briefs** | Extraction | Advisory propositions grounded in census facts |
| **Objective wizard** | Extraction | A commissioned objective with a plan identifier |
| **Commit review** | Extraction | The frozen objective, or a return with a reason |
| **Objective tracking** | Extraction | Coverage toward goal, run receipts, the batch board |
| **Deliverables shelf** | Extraction | Artefacts with contents, rights, attestation, quality card, proof trail |
| **Model shelf** | Extraction | Per-model lineage, scorecard, and version history |
| **Trust Center** | Compliance | The rule inventory beside the respect-and-violation record |
| **Prove one run** | Compliance | An operation replayed end to end from the record |
| **Retention and rights** | Compliance | Holdings by window state; a set retention rule |
| **Verification Runner** | Compliance | The signed commissioning record |
| **Rule-change ceremony** | Administration | The change with its full ceremony record |
| **Deletion ceremony** | Administration | A destruction certificate |
| **Release review** | Compliance | Release or hold, with a reason, recorded |
| **Register an application** | Integration | An issued, scoped key with its ledger row |
| **First call** | Integration | The live contract, including every refusal shape |
| **Administer** | Integration | Applications, keys, usage, refusal health, objective lifecycle |

**Plus one public surface: **the trust receipt, reachable by anyone holding a receipt link, without an account.
# **§7 — The two day-zero dashboards**
**Inventory management for the data estate, because that is what the platform is. **The estate manager's home screen.
- **Topline highlights **about the holding, each with a descriptive note and a link to how it was measured.

| **State** | **Treatment** |
| --- | --- |
| **Not yet measured** | Drawn — hatched territory with a plain caption. A blank reads as zero, and a blank in a data inventory is usually a gap. |
| **Coverage gap** | Always paired with the action that would close it, with its scope and cost implication beside it. |
| **Refused** | Shown with its reason, in the shape that fits, in the answer position. |
| **Dormant capability** | Visible and unlit rather than hidden, so the user understands the platform's shape rather than only its current use. |

| **Scope** | **Definition** |
| --- | --- |
| **Slice** | One census region supporting one opportunity. |
| **Combined** | Two or more census regions whose intersection or join supports an opportunity neither supports alone. The grounding line cites each contributing slice's facts separately, and the brief states in one sentence why the combination carries value beyond its parts. |
| **Estate** | The archive taken whole. The grounding line cites estate-level census totals. |

| **Row** | **What it states** |
| --- | --- |
| **Lawful basis** | Verified present at admission. |
| **Scope** | Nothing mined outside it. |
| **Refused** | A count of items below the required standard — recorded, not dropped — with a link to see them. |
| **Standard** | Enforced on every unit, server-side. |
| **Ledger** | Append-only, with the current retention state stated honestly. |

| **Change class** | **Mechanics** |
| --- | --- |
| **Protection-tightening** | Unilateral. Ledgered, effective after the configured delay, with a recorded-objection path that escalates. Objections are themselves ledgered. |
| **Loosening or destructive** | Anything triggering deletion, lengthening retention, or weakening a threshold enters pending counter-signature and takes effect only on the Administration Console's signature. Both identities are ledgered in one row. |

| **Path** | **The one-line grant** |
| --- | --- |
| **Live query** | Inner gate · per-call governance · answers in responses |
| **Governed extract** | Outer gate · rights-checked · datasets and skills out |

| **Capability** | **Internal engineer** | **External engineer** |
| --- | --- | --- |
| **Applications visible** | All | Own only |
| **Grants visible** | All | Own only |
| **Register application** | Yes | Own, via approval |
| **Issue and revoke keys** | Yes, ledgered | Own keys only, ledgered |
| **Usage and refusal view** | All applications | Own applications only |
| **Estate contents** | Never — not this console's job | Never |
| **Fleet and pricing** | No — Administration | No |

**The distinction that must never be conflated. **An external engineer is an integrating partner's engineer wiring a partner system to the governed boundary — a platform-operator action performed by an outside party, legitimately seeing a scoped console view. A buyer shaping a purchase is purely an end-user of the commercial application and sees no console at all.

| **Feature** | **Function** | **Objective** | **Promise** |
| --- | --- | --- | --- |
| **Objective tracking** | Coverage toward goal with the basis of the figure, completed runs with receipts, telemetry per run | Let the commissioner watch coverage rather than a progress bar | You can see how much of what you asked for you now have, and where the number came from |
| **Batch board** | Shows processed, quarantined with status, and reprocessed batches through resolution | Contain failure without hiding it | A batch that failed is visible with its reason until it is resolved |
| **Deliverables shelf** | Artefacts with contents, licence label, privacy attestation, quality card, proof trail, and issuance history | Make a finished product carry its own paperwork | What you can do with this artefact was computed, not asserted |
| **Model shelf** | Per model: base, training lineage and inherited rights, the acceptance scorecard with real numbers, version history | Make model ownership a gated claim rather than a marketing one | A model you own, with its measured numbers attached, whatever they say |

| **Term** | **Definition** |
| --- | --- |
| **Console** | A capability grouping, defined by what can be done on it rather than by a named person. There are four. |
| **Application** | Anything with an end-user in it, internal or external. Enters through the Integration Console and holds a scoped key. |
| **Motion** | One of three human movements the surfaces serve: verification, exploration, consumption. Every screen belongs to exactly one. |
| **Objective** | A commissioned goal with entry, reach, output, and an envelope. The unit of ordered work. |
| **Reach** | Breadth and depth — the estate slice and the extraction and reasoning depth. |
| **Envelope** | What a shaped objective must carry to freeze: lawful basis, done-condition, budget, scope ceiling, availability snapshot, floor feasibility, and attribution. |
| **Grounding marker** | The statement on a commit review of whether the objective was sample-grounded or estimate-grounded. |
| **Agent-assumed chip** | The amber marking on any value an agent supplied rather than the user. |
| **Class with claim** | The rule that a claim's defensibility class appears adjacent to it, in plain language, in the headline position. |
| **Answer object** | The signature artefact: finding, per-claim marking, evidence strip, honesty strip, action row. |
| **The three lenses** | Answer, reasoning, raw trail — progressive disclosure over one object. |
| **Trust receipt** | The public, read-only record resolving any delivered claim by trace identity, reachable without an account. |
| **Opportunity brief** | A standing advisory proposition generated from census facts. Never an approval gate. |
| **Consequence class** | The attribute on a rule class determining whether a change is unilateral-after-delay or requires counter-signature. |
| **Governed boundary** | The single contract every application calls to reach platform output, enforcing the gates, key scope, and the four response classes. |
| **The four designed states** | Not yet measured, coverage gap, refused, and dormant capability — each with a deliberate treatment rather than an empty space. |

*What the surfaces come down to. Four consoles defined by what can be done on them, and one door through which every application — first-party or third — reaches the platform on identical terms. No screen renders the build. Wherever a claim appears its class appears with it, and wherever a figure appears there is a path to where it came from. A refusal occupies the answer position, names its gap, and offers only what the reader can actually do. What has not been measured is drawn rather than left blank. And every consequential change is a sentence in plain language, counter-signed where it loosens something, recorded with both names.*
