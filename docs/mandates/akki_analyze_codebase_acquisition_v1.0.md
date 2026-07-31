AKKI · GOVERNED ARTIFACT · CODEBASE ACQUISITION
Analyze: Codebase Acquisition v1.0
The analytical suite Akki takes into the operating system — what it is, what changes, and what governs it · July 2026
Purpose. This document defines what Akki takes into its operating system to serve Analyze, what changes on the way in, and what governs it afterwards. It is written for product and engineering, and assumes no prior familiarity with the source codebase. Normative language: MUST / MUST NOT / MAY. Statements about the source are drawn from direct reading of it.
# §1 — The disposition
Analyze is acquired, not written. The analytical suite the Role Register describes — deterministic signal extraction, Monte Carlo simulation on a numeric column, forecasting on a date-and-value pair, anomaly detection, and cited report export — exists as working code and is taken whole.
It becomes operating-system code. This is an acquisition, not an integration. The suite does not sit behind a seam, does not hold a key, and is not a consumer of the memory layer. It is Analyze, inside the operating system, carrying the same discipline as everything else there.
The source is one package. Ten modules, 2,116 lines, at backend/services/workbook_analyzer/ in an existing codebase. Nothing else from that codebase is taken; §5 states what is left and why.
# §2 — What is acquired

Two test files come with it, covering the analysis pipeline and the narration exports. They are acquired alongside the code, not rewritten.
# §3 — It extracts cleanly
Every import in the package is one of three things: a relative import within the package, the Python standard library, or a general-purpose numeric or document library. There is no import from the rest of its source codebase — no database handle, no shared service, no authentication dependency, no configuration singleton.
This is what makes it an acquisition rather than an entanglement. The package lifts without carrying its origin with it. Nothing about the system it came from has to be understood, replicated, or maintained in order to run it.
Its third-party surface is small and ordinary: a numeric library, a spreadsheet reader, a schema library, and document writers. §6 confirms these against what the operating system already carries, so that acquisition does not quietly widen the dependency surface.
# §4 — Why it is taken rather than written
The functions correspond to the Role Register's description of Analyze one for one, which is reason enough on its own. Two disciplines come with it that would otherwise have to be specified and built, and both are properties the operating system holds elsewhere.
## 4.1 · Citations that resolve, or fail
Every citation on an analytical output is resolved against the parsed source before the result is persisted. A citation naming a sheet that does not exist, or a range outside that sheet's bounds, fails — and the result does not reach disk. Fabricated references therefore cannot appear in output, because there is no path by which they survive.
## 4.2 · Analysis that informs rather than instructs
Every generated narration is checked for imperative-to-user phrasing and rejected if it tells the reader what to do. The analysis reports what it found; the decision stays with the person reading it.
Both were arrived at independently. They are the same doctrine the operating system holds — claims carry their evidence, and decisions stay with the person — implemented in a different codebase by a different route. Inheriting them costs a lift; specifying and building them costs a phase.
# §5 — What is not acquired
The source codebase carries a great deal more. None of it is taken, and each exclusion has a reason.
# §6 — What changes on the way in
## 6.1 · Evidence classification
The analysis schema carries a rationale field described as an evidence-grounded observational read. It does not classify figures as measured or estimated.
Every displayed figure carries its class, and analytical output is not exempt. A simulated projection and a counted total are different kinds of number, and a reader who cannot tell them apart has been given a false impression by omission. Classification is added to the schema and threaded to the surfaces.
The expensive half already holds. A citation that provably resolves is the hard property; adding a class field to material that already knows where it came from is additive work.
## 6.2 · Operating-system discipline
As operating-system code the suite carries what operating-system code carries: frozen shapes and additive versioning on anything crossing a service boundary, snapshot enforcement on those shapes, and the conformance obligations of the class of work it belongs to.
This is a change of instrument, not of habit. The source codebase already pins its public surfaces by snapshot and fails a build on a silent signature change. The discipline is resident; only its name and its enforcement point move.
## 6.3 · Dependency confirmation
The package's third-party libraries are confirmed against what the operating system already carries before the lift, and any addition is a deliberate decision rather than a side effect of acquisition.
# §7 — Settled before the lift
The two test files are run against this build's environment and their result recorded. A suite that has not been run is a suite whose state is unknown, and inheriting code on the strength of its file count rather than its test result is how an acquisition becomes a liability.
The read direction is specified. The acquired code reads an uploaded workbook, which is what a scientist does with their own material and is the path the workspace already needs. What is not yet specified is the other direction: what a workspace may draw from the estate, under what rights, and how the locality rule holds while it does so — material drawn in must not carry a path back out. That is where the suite meets the operating system proper, and it is specified before the lift rather than discovered after it.
# §8 — What happens next
Dependency order.
Run the acquired tests and record the result.
Confirm the third-party surface against what the operating system carries.
Specify the estate path — how the suite draws from extracted material rather than an uploaded file.
Lift the package under operating-system discipline, with its tests.
Add evidence classification to the schema and thread it to the surfaces.

What the acquisition is worth. The suite answers questions about material an organisation already holds, and it does so with citations that resolve to real cells and narration that informs rather than instructs. Those two properties are cheap to inherit and expensive to specify, and they are the reason this is a lift rather than a build.

| Module | Lines | What it does |
| parser | 292 | Reads a workbook into sheets, columns, and typed cells |
| signal_extractor | 165 | Deterministic signal extraction over parsed material |
| monte_carlo | 176 | Simulation on a numeric column |
| forecaster | 285 | Forecasting on a date-and-value pair, with a low-fit threshold that declines rather than guesses |
| anomaly_detector | 107 | Anomaly detection with a stated rationale per finding |
| citation_resolver | 146 | Resolves every citation against the parsed source; an unresolvable citation fails |
| refuse_to_decide | 81 | Rejects imperative-to-user phrasing in any generated narration |
| report_builder | 536 | Cited report construction across document, slide, and spreadsheet formats |
| schema | 256 | The analysis object: sheets, columns, signals, citations, forecasts, anomalies, narration |
| package surface | 72 | What the suite exposes to its caller |


| Not acquired | Why |
| The model boundary | Masking, purpose validation, and the audit of model calls are operating-system concerns, built operating-system-side under operating-system discipline. Adopting another system's boundary would import its assumptions about where the boundary sits. |
| Consumption surfaces | Asking, reasoning, document work, and artefact production belong to an application. The operating system does not build them and has no view on how they are built. |
| Commercial scaffolding | Trial counting, cohort applications, and billing surfaces belong to another product's route to market. They are not the customer portal, which the operating system builds for parties that have purchased intelligence. |
| Everything else in the tree | Two further products live in the same repository. Neither is in scope. Admission of either requires its own case; proximity is not one. |
