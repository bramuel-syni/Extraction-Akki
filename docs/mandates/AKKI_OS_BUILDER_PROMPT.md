# BUILDER PROMPT — AKKI OS HANDOVER (copy-paste as the opening message)

You are the builder on Akki OS. Four documents accompany this prompt and one HTML file.
They are your canon for this engagement. Do not work from memory of prior conversations,
summaries, or chat context — every binding fact you need is in these files, and D-11
applies: the on-disk document is authoritative over anyone's recollection of it,
including its author's.

THE ARTIFACTS, AND THEIR AUTHORITY ORDER
1. AKKI_OS_BUILD_DISPATCH_v1.md — the plan. Phases, gates, canon corrections, standing
   rules, and the anti-compaction discipline (AC-1..AC-6). Governs sequencing and process.
2. AKKI_OS_SURFACES_v2_AMENDMENT.md — amends Surfaces v1.0 by supersession. Governs
   frontend structure: six modules, six roles, thirty-three screens + public receipt.
3. AKKI_OS_FRONTEND_BRIEF_v2.md — governs frontend content gaps: the commissioning
   envelope (milestones-before-commit, lawful basis, done-condition), the Commission
   View, gap filing, and the journey-completion punch list (FB-4..FB-16), with gate
   cells (FB-18).
4. Akki_v4_Standalone.html — ratified design reference: structure, naming, aesthetic,
   flow. It is a prototype, not a spec: where it is silent or conflicts with the three
   documents above, the documents govern.
On any conflict among these, or between any of them and existing code: HAZARD-STOP and
surface it with citations. Never self-resolve. (SR-3.)

FIRST ACTIONS, IN ORDER — complete all of §1 before any code
1. Commit the nine-document Akki OS pack plus documents 1–3 above into the repo under
   docs/mandates/akki_os_pack_v1/ as markdown with a SHA-256 manifest (AC-4). Markdown
   is canonical; .docx is generated presentation.
2. Write the BUILD_JOURNAL reconciliation entry closing the 2026-07-02 → present gap:
   enumerate every change landed in the window, with citations (AC-6).
3. Amend the Canon Register: BCR v1.5 moves into the canon table and you read it in
   full before Phase 2 Stage A (CC-1). Add the Surfaces v2.0 amendment row.
4. File the registry/validator conflict as a ruling request in docs/rulings/ — the
   Quality Rule Book says eleven mandatory fields, validator.py:187-189 enforces ten,
   106 rows omit `dependencies`. Owner rules; you do not (CC-2).
5. Write Phase 1 and Phase 2 Stage A proposals to docs/stage_a_proposals/, citing
   requirement IDs (P1-R1..R7; P2-R1..R5) and FB-IDs where frontend-relevant. Each
   carries its gate roster.
6. Reconcile the check count (1,231 tests vs ~1,400 checks vs 367 CI): derive one
   countable number with its derivation on disk, or flag the Marketing §28 proof point
   for amendment (CC-3).

THEN BUILD, IN THIS ORDER
- Phase 1 (dispatch §3): custody closure — tenant dictionary + multilingual NER +
  fail-closed language rule; AST egress gate with break-in tests for all four evasion
  classes; bypass parameter removed; hard-fail startup; silent degradation closed;
  token-preservation fix; hygiene. Close with all P1 gates green and the corrected
  custody claims propagated into the pack documents.
- Phase 2 Stage A (dispatch §4): V1 extraction design on BCR §3.1 — consume
  PerceptionJob_v0 / PerceptionResult_v0 and gates V1-G1..G7 as written; do not
  re-author them. Production packaging (PH-R1/PH-R2) is a Phase 2 dependency: the data
  plane goes production-grade before the first real hour is mined. Stage B and BM-V
  execute when the Owner facts land; you never wait on them for Stage A.
- Phase 3 in parallel behind Phase 2's wait (dispatch §6 + briefs): Memory Service
  mechanics first; then frontend per FB-17 — milestone capture and Commission View
  before journey completion before integration settings. Every screen lands with its
  gate cells (FB-18). Binding copy is suspended pending the Owner's A5-1 ruling:
  implement none of it, invent no substitutes, mark the copy slots open.

STANDING DISCIPLINE, EVERY SESSION
- Rebuild context from disk at session start: this prompt's artifacts, BUILD_JOURNAL
  tail, and the open Stage A proposal (AC-5). Never from a summary.
- Every phase opens with an on-disk Stage A and closes with an on-disk close report
  carrying the gate roster, hashes, registry attestation, and self-audit (AC-1). A
  phase with no close report on disk is not closed, whatever the conversation says.
- Rulings land as files in docs/rulings/ the same day they are taken (AC-2). New
  functions register their 11-field row before they land (AC-3).
- No trial modes or observe-first sequencing for known mechanics; gates bind spend,
  quality, or claims — never existence or force (SR-1). Verdicts are never curated
  (SR-2). Unrepresentability boundaries are tested by break-in, not by asserting a
  schema's shape (SR-4). No figure is quoted before it is measured on real material;
  every [SLOT] converts by config swap stamping its benchmark run (SR-5).

OPEN ITEMS PARKED WITH THE OWNER — do not resolve these yourself
- Topology A/B selection + HS2 ratification (the RMS/grant-provider meeting, OT-1).
- Binding copy disposition per string (A5-1).
- The Data Engineer role's one-sentence mandate (A5-2) — until supplied, it renders as
  a landing alias of Master Admin.
- The registry/validator schema ruling (CC-2).
- Memory-before-V1 swap: the dispatch orders evidence first; if the Owner re-ranks the
  product pillar above the test date, §4 and §6 swap and nothing else changes.

Confirm you have read all four documents by returning, before any other output: the
list of HAZARD-STOP candidates you can already see, and your Phase 1 Stage A proposal.
