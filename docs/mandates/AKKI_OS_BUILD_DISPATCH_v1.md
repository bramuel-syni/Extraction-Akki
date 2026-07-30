# AKKI OS — BUILD DISPATCH v1.0

Owner dispatch · binding · supersedes the builder's five-phase proposal where they conflict.
Normative language: MUST / MUST NOT / MAY. Every requirement carries an ID; acceptance gates are named tests.

---

## §0 — Directive

We build with known mechanics, clear success conditions, and proven pathways, with clear
hand-offs. Nothing below system level is experimental (Quality Rule Book §1, D-12). The one
experiment is the assembled architecture delivering the promise on real material. **The end
goal of this build process is to reach that test.** Every phase is judged by whether it
shortens the path to the first real broadcast hour flowing to qualified units — or hardens
what that hour will exercise.

---

## §1 — Anti-compaction rule: the record lives on disk, not in context

Context windows compact and summaries erode. Therefore, binding from this dispatch forward:

- **AC-1** Every phase opens with a Stage A proposal written to
  `docs/stage_a_proposals/` and closes with a close report in `docs/close_reports/`
  carrying: the gate roster with results, artefact hashes, registry attestation, the
  conformance table, and a self-audit table (Quality Rule Book §34). A phase with no
  on-disk close report is not closed, whatever the conversation says.
- **AC-2** Every ruling taken in conversation lands the same day as a file in
  `docs/rulings/` citing what it rules on. D-11 binds: no decision proceeds from memory
  or summary where the written record exists; recalled content is never presented as fact.
- **AC-3** Every new function registers its row (11-field schema) in the
  Function-Promise Registry **before it lands** (R4). The registry row is part of the
  ruling surface.
- **AC-4** The nine published Akki OS documents (Product & Engineering Specification,
  the three Orchestration Briefs, Quality Rule Book, Surfaces, Marketing Briefing,
  Canon Register, Audio Intelligence Plane Specification) MUST be committed into the
  repo under `docs/mandates/akki_os_pack_v1/` as markdown, with SHA-256 manifest,
  **before Phase 1 code work begins**. Markdown is canonical; .docx is generated
  presentation (per the standing authoring-direction inversion). The builder's canon is
  what is on disk in the working repo — never an upload, never a chat transcript.
- **AC-5** At the start of every working session, the builder re-reads:
  this dispatch, `BUILD_JOURNAL.md` tail, and the open Stage A proposal for the phase
  in flight. Session context is rebuilt from disk, not carried in summaries.
- **AC-6** BUILD_JOURNAL.md resumes with this dispatch. The journal gap
  (2026-07-02 → present) is closed by a single reconciliation entry enumerating every
  change landed in the window, with citations. Undocumented windows are a D-11 violation.

---

## §2 — Canon corrections (write these before building anything)

- **CC-1** Canon Register §15 mis-states Build Completion Requirements v1.5 as not
  bearing on the product. It carries the placement rule (§1.6), the production rule
  (HS3), the BM-V prohibition (BM-V2), the V1 wire shapes, and the housing map (§4).
  Amend the Canon Register: BCR v1.5 moves from "Not read" to the canon table, and the
  builder MUST read it in full before Phase 2 Stage A.
- **CC-2** The registry/validator conflict is surfaced, not self-resolved:
  `backend/services/registry/validator.py` treats `dependencies` as optional; Quality
  Rule Book §5.1 declares all eleven fields mandatory; 106 registry rows omit the field.
  This is a doc-vs-code conflict — HAZARD-STOP class per BCR precedence. File it as a
  ruling request in `docs/rulings/`; the Owner rules mandatory-vs-optional; the losing
  document or code is corrected, and rows are backfilled or the schema amended. The
  sequencing harness (§9) is blocked from any claim until this closes, because its
  dependency input is absent from most of its corpus.
- **CC-3** The check-count is reconciled: 1,231 backend tests (builder), ~1,400
  automated checks (Marketing Briefing §28), 367/367 (journal). Derive one countable
  number with its derivation on disk, or amend the §28 proof point. No externally
  quoted figure without a measured basis (§26 rule: illustrative figures migrate into
  expectations).
- **CC-4** HS2 never-rules carry [STAKED]. The Owner ratifies or strikes them in the
  same ruling that closes the topology fork (see §5). Until ruled, the green gates
  enforcing them (`test_worker_code_never_writes_ledger` etc.) are annotated in the
  registry as enforcing a staked position.
- **CC-5** Audio plane cross-reference defect: Audio Plane Spec §4.4 cites "§6.4"
  where it means §6.2; Engineering Specification §16.3 cites "§18". Reconcile so both
  documents cite the same clause. One-line docs fix, ruled trivially.
- **CC-6** Audio plane §16.2 build-order circularity (codec choice deferred to
  Sampling & Reflection, which is built four positions later) is filed as an open
  decision with the Owner. Not blocking — audio plane build is not in this dispatch's
  phases — but it MUST NOT be silently resolved by the builder when the plane is
  dispatched.

---

## §3 — Phase 1: Custody closure and honest startup (dispatch now)

Everything here is claims-critical or blocks the test. Small surface, highest leverage.

**Custody (Canon Corrections #1–3):**
- **P1-R1** De-identification layer 2: tenant dictionary populated at census
  (harvestable vocabulary — presenter names, station names, programme titles,
  advertiser brands — catalogued from the estate). Layer 3: multilingual recognition
  path lands. Fail-closed rule: unsupported language + empty catalogue → raise, never
  proceed on structured patterns alone. This is not only a claims bound — the target
  estate is multilingual and code-switched by definition, so this item **blocks the
  test**. Gates: `test_deid_fail_closed_on_unsupported_language`,
  `test_tenant_catalogue_nonempty_after_census`, seeded-recall harness per language
  in use.
- **P1-R2** Single-egress guard promoted from regex to AST gate resolving aliases and
  indirection; provider-host patterns over outbound HTTP; named-file exemption list
  replacing the directory exemption; runtime egress allowlist at the process boundary.
  Gates: the four known evasion classes (raw HTTP, dynamic import, attribute
  indirection, aliased import) each attempted and each caught — break-in style
  (§33C: attempt the violation, never assert its absence).
- **P1-R3** Test-only bypass parameter removed from the production router signature;
  tests move to monkeypatching the de-identifier; a signature-inspection test asserts
  no parameter can skip the branch.

**Honest operation:**
- **P1-R4** Hard-fail startup: production mode refuses to start with unset
  SYNISENSE_MASTER_SECRET, absent admin seed, or mock LLM mode. Warn-and-continue is
  removed. Gate: `test_production_refuses_mock_mode`.
- **P1-R5** Silent degradation closed: absent LLM key refuses rather than echoing;
  perception fallback to weaker variants is either refused or recorded in the trust
  receipt as masking/perception tier (model actually loaded, language, catalogue
  size). The receipt proves what standard protected the call, not only what model
  answered.
- **P1-R6** Token-preservation fix: the Shield's opaque-token clause is composed
  ahead of any caller-supplied prompt so no caller can remove it. Gate: a caller
  supplying a full replacement prompt still produces token-aware output.
- **P1-R7** Hygiene: .env/admin-seed repair (demoable immediately, per AS-U2 demo
  rules — samples marked and fixture-schema-gated; an unmarked sample is a hidden
  mock and is prohibited); mobile supervisor FATAL resolved or documented; tier_lock
  version-file accumulation gets an archival policy.

**Close condition:** all P1 gates green; corrected custody claims propagated to the
pack documents (Engineering Spec §6.1/Appendix A, Governance Brief §14–15, Marketing
§28 proof points) in the same close — the corrections in Canon Register Part II were
written against the pre-fix state and must be re-stated as closed, on disk.

---

## §4 — Phase 2: V1 extraction to real material (Stage A dispatch now)

The evidence gap outranks the promise gap. Consumers of qualified units (memory,
surfaces, commissioning) are not built further against fixture-only substrate where
avoidable.

- **P2-R1** Phase 9 Stage A (design-only, zero code writes) dispatches immediately on
  BCR §3.1 — it is dispatchable on that document alone. The builder MUST consume BCR
  §3.1's wire shapes (`PerceptionJob_v0`, `PerceptionResult_v0`), the two worker
  endpoints, and gates V1-G1..G7 rather than re-authoring them. Freeze-or-not for
  both contracts argued on the D4b axes at Stage A (they cross an environment
  boundary; the prior is freeze).
- **P2-R2** Production packaging (BCR 3.4 PH-R1/PH-R2) is a Phase 2 dependency: HS3
  binds — the data plane goes production-grade **before** the first real hour is
  mined. Destination-agnostic packaging is dispatchable now.
- **P2-R3** Stage B (GPU half) and BM-V execute when the [OWNER] facts land (§5).
  BM-V runs **inside** Phase 2 on one real hour with its human-qualified sample;
  output is class_distribution_delta with PASS/INVESTIGATE at close. Deferring BM-V
  past this phase is prohibited (BM-V2).
- **P2-R4** Stub-first holds: every guard gate proves against the deterministic stub
  worker before GPU code merges (V1-B3, V1-G1). Never-rules enforced mechanically
  (V1-H2, V1-G5), subject to CC-4's ratification.
- **P2-R5** V-gate opening: on BM-V PASS, the V1 harness verdict moves off
  PENDING_REAL_MATERIAL through its own gate ceremony, recorded. Appendix A gains one
  sentence stating the pre-ceremony state plainly (present; exercised on synthetic
  fixture only; verdict pending by construction) — and its removal is the close
  artefact everyone is working toward.

---

## §5 — Owner track (parallel, two clocks — BCR §5.2)

The builder never waits on owner items except where marked [OWNER]; owner items never
wait on the builder.

- **OT-1 Early (facts, not data):** archive access path + GPU placement. One
  RMS/grant-provider conversation yields: grant physical parameters (provider, access
  mechanism, quantity, where deployable), archive physical reality (digitised?
  storage? network path? formats?), and the Topology A/B selection. The same ruling
  ratifies or strikes HS2 (CC-4). If Topology B is selected, the transit, purge, and
  rights rulings are drafted **before** Stage B dispatch — they do not exist today.
- **OT-2 In-phase (small):** Hour A + its 300-unit human-qualified slice, needed
  during Phase 2 GPU work, not before.
- **OT-3 Administrative:** LLM account, domain + TLS, object-store choice, data-plane
  destination — gate only the packaging phase.
- **OT-4** The Cassava/Liquid C2 substrate row (control-plane placement — what the
  partner actually provides) was in Infrastructure Architecture v1 §9 and did not
  survive the fold into BCR §4's five slots. Restore it to the housing map as a sixth
  [OWNER] binding, on disk.

---

## §6 — Phase 3+: consumers, behind evidence (Stage A only until Phase 2 Stage B is unblocked)

Order: Memory Service → day-zero surfaces (Trust Center, Registry Dashboard,
Verification Runner) → commissioning path completion. Rationale for Memory first
among the consumers: plane mechanics (scoped-accessor isolation, three stores,
write-back five-ring shape, publication gate, revocation) depend on the unit
*contract*, not on real-material content, so Memory MAY proceed in parallel while
Stage B waits on OT-1 — it is the correct use of the waiting time. Surfaces and
commissioning render census and pricing output and gain the most from real shapes;
they follow.

- **P3-R1** Every Phase 3+ item passes the placement rule (BCR §1.6) at Stage A:
  which vertical, which horizontals, where its data gravity puts it. A proposal
  answering none of the three is not built.
- **P3-R2** Buyer path stays cut. BCR §12 governs: the extractor has no commercial
  attributes; preservation is verifiable in `/salvage/`. If the buyer returns, it
  returns as a separate commercial application holding a scoped external key through
  the outer gate (Surfaces §26 — no price, quote, offer, catalogue, order, or
  buyer-account concept on any platform console). "Restore from salvage into the
  platform" is a reversal of an Owner ruling and requires an Owner ruling.
- **P3-R3** Critic Seam tiers 2–3 (independent-model critic, calibration ledger,
  seeded-defect audits) land as automation during Phase 3, per Quality Rule Book
  §§14–15 — the review load of Phases 2–3 is what they exist for.

---

## §7 — Standing rules for every phase

- **SR-1** No trial modes, pilot flags, or observe-first sequencing for known
  mechanics (D-12). Gates bind spend, quality, or claims — never existence or force.
- **SR-2** Verdicts are never curated (D-7). BM-V's human-qualified slice is drawn
  from measured composition, uncurated, and its result publishes internally whatever
  it says.
- **SR-3** On any conflict among documents or with existing code: HAZARD-STOP and
  surface it — never self-resolve (BCR precedence clause). CC-2 is the standing
  example of the failure this prevents.
- **SR-4** Unrepresentability boundaries are tested by break-in (§33C): the test
  attempts the forbidden state and must fail to reach it. Asserting a schema's shape
  is insufficient.
- **SR-5** No accuracy figure, throughput figure, or cost figure is quoted before it
  is measured on real material. Every [SLOT] converts by config swap stamping its
  benchmark run; hand-edits prohibited.

---

## §8 — Immediate actions, in order

1. AC-4: commit the nine-document pack into the repo with SHA manifest.
2. AC-6: journal reconciliation entry closing the 07-02 → present gap.
3. CC-1: Canon Register amendment; builder reads BCR v1.5 in full.
4. CC-2: registry/validator HAZARD-STOP filed for Owner ruling.
5. P1 Stage A proposal written to disk; P2 Stage A proposal written to disk.
6. OT-1 meeting scheduled (Owner side).
7. Phase 1 code work begins on P1 Stage A approval.

— End of dispatch. This document lands in `docs/mandates/` and is canon on commit. —
