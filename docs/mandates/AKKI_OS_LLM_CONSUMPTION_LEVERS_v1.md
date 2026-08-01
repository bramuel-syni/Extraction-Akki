# AKKI OS — LLM CONSUMPTION LEVERS SPECIFICATION v1.0
### LC-1 Response Cache · LC-2 Model Routing · LC-3 Retrieval Narrowing
### Objective (Owner-stated): reduce LLM consumption. Every lever is measured by one number: tokens-per-answer, falling.

Class rule for all three: these are ECONOMIZERS, not custody controls.
Custody fails closed; economizers fail transparent — any lever failure
produces a normal uncached/unrouted/unnarrowed call, never a refusal and
never a silent quality change. Token-preservation invariant binds all
three: de-identification tokens pass through verbatim; automated
token-dense payload tests fail the build on any mutation.
Proposed values marked [O] are Owner slots, entering as O-class governed
rules (Change-a-Rule adjustable), not code constants.

---

## LC-1 · SHIELD RESPONSE CACHE (largest lever)

**What.** Identical governed questions are common; today every repeat
burns a full frontier call. A cache in front of the LLM invocation serves
repeats at zero tokens.

**Placement.** Inside the shield, after de-identification, before
invocation. Lookup key is computed over de-identified content only — raw
content never touches the cache.

**Cache key (correctness-critical).** Hash over:
de-identified payload · model preference · composed-system-message version
· masking-tier configuration version · rule-set version in force ·
census/holdings version · Class D registry versions in scope.
A governed answer is only reusable while everything that governed it is
unchanged. Any component bump makes prior entries unreachable (natural
invalidation — no deletion sweep needed).

**Invalidation events (explicit, in addition to key rotation):**
Change-a-Rule apply · census run completes · Class D registry version
bump · masking configuration change. Each event bumps its key component;
the ledger records the bump so cache behavior is auditable.

**Receipts.** Every operation writes a receipt (canon): a cache hit
writes its own receipt referencing the origin call's receipt (trace
identity preserved: served-from-cache, origin trace id, key-component
versions). The answer renders identically; provenance drill-down shows
the cache lineage.

**Scope.** Per-tenant, per-key-scope. An answer computed under one key
scope is never served to another scope, regardless of payload identity —
enforced in the key (scope id is a key component).

**TTL.** [O] proposed 24h ceiling even with no invalidation event, as a
freshness backstop.

**Failure mode.** Cache unavailable or key computation error → normal
uncached call + ledger note. Never blocks, never refuses.

**Success conditions.**
- Hit rate and tokens-saved-per-day reported from metering rows.
- Break-in gate: an entry written under rule-set v(N) is unreachable
  after Change-a-Rule applies v(N+1) — asserted by test, not policy.
- Break-in gate: cross-scope lookup with identical payload misses.
- Token-preservation test corpus passes through hit and miss paths.
- Zero cached responses lacking a receipt with origin lineage.

---

## LC-2 · MODEL ROUTING BY TASK CLASS (second lever)

**What.** The router already accepts a model preference; nothing assigns
it systematically. Route each call class to the cheapest model that meets
its floor; frontier is the exception, declared, never the default.

**Routing ladder (cheapest first):**
1. **No-LLM.** Mechanical/deterministic composition where the task is
   mechanical (the mechanical arm already exists for masking-failure
   paths). A call avoided is the cheapest call.
2. **Economy model** — default for: reformatting, extraction of stated
   fields, template-bound composition, summarization within one document.
3. **Balanced** — multi-source composition, reasoning over evidence rows.
4. **Frontier** — only for task classes on a declared frontier list [O]:
   cross-lingual reasoning, contested-evidence adjudication, long-form
   composed conclusions.

**Mechanism.** A routing table (task class → tier) as O-class seam
values. Callers declare task class; undeclared defaults to Balanced
[O: or Economy — Owner picks the default posture]. No caller may demand
Frontier for a class not on the frontier list; the demand routes to the
listed tier and the ledger records the downgrade.

**Escalation.** One retry at the next tier up when the lower tier's
output fails its existing acceptance check (citation resolution, shape
validation). Retry recorded with reason; two-tier jumps prohibited.
Chronic escalation for a class (>[O] proposed 15% of calls) flags the
routing table row for review — the table is corrected by rule change,
not by silent per-call drift.

**Custody note.** De-identification is not an LLM function and is
untouched. Routing never varies masking or custody behavior — only which
model receives the already-shielded payload.

**Success conditions.**
- Per-tier call and token distribution reported from metering; frontier
  share visible and falling toward the declared-class share.
- Escalation rate per class reported; chronic-escalation flag fires in
  test.
- Gate: a Frontier demand for an unlisted class is downgraded and
  ledgered.
- Existing acceptance/verification suites stay green at the routed tiers
  (quality floor is the existing checks, not a new metric).

---

## LC-3 · RETRIEVAL NARROWING (third lever)

**What.** Compression shrinks the payload chosen; narrowing chooses a
smaller payload. Send the evidence rows selected for the answer — not the
neighborhood around them — under a per-task-class context budget.

**Mechanism.**
- Context budget per task class [O: proposed tokens ceiling per class] as
  O-class seam values.
- Evidence selection ranks rows by retrieval relevance; rows enter the
  payload in rank order until the budget; the cut point is recorded
  (rows-offered vs rows-sent) in metering.
- Structural boilerplate (repeated headers, schema descriptions already
  encoded in the composed system message) is stripped by template, not by
  model judgment.

**Quality guard (the design risk, named).** Narrowing must not convert an
answerable question into a governed refusal. Proposed [O]: when a
narrowed call returns evidence-cannot-support, one retry at full context
before the refusal stands; both calls and the differing outcomes are
ledgered. If full context answers what narrowed context refused, that is
a narrowing miss — counted, reported, and the budget for that class
flagged at >[O: proposed 5%] miss rate.

**Interaction with citation discipline.** Every citation resolves against
the parsed source (existing rule) — unaffected, since resolution is
against stored sources, not the prompt. The miss-rate guard above is the
narrowing-specific protection.

**Success conditions.**
- Tokens-per-answer per task class falls after enablement, measured
  before/after from metering rows.
- Narrowing-miss rate reported per class; flag fires in test at
  threshold.
- Gate: the full-context retry path exists and ledgers the divergence.
- Token-preservation corpus passes narrowed paths.

---

## MEASUREMENT AND ORDER

The Cost Ledger's job under this spec is singular: prove tokens-per-answer
falls. Baseline captured before LC-1 enables; each lever enables
separately so its contribution is attributable (LC-1 → LC-2 → LC-3);
per-lever savings reported from metering rows only.

Build order and rationale: LC-1 first (biggest lever, no quality surface),
LC-2 second (distributional, guarded by existing acceptance checks),
LC-3 third (only lever with a quality risk, hence the miss-rate guard).
A-1 compression (external adoption spec) slots after LC-3 as the fourth
reducer, behind the same invariant, timed to real-material onset.

Owner slots in this spec: TTL ceiling · undeclared-class default tier ·
frontier class list · escalation threshold · per-class context budgets ·
narrowing retry policy · miss-rate threshold.

— END LC v1.0 —
