# Canon Intake · Delta Log · Part 2 (4 of 8 files)

**Filed:** 2026-07-31 (partial Canon delivery per Owner).
**Authority:** AKKI OS CONSOLIDATED DISPATCH v2.0 §1.4 (Canon self-completion) + §5 execution order.
**Purpose:** verbatim-read record of the four Owner-delivered Canon sources · content-alignment check against Brief v1 + Dispatch v2 · delta preview for Brief v2 filing (§1.4: "Deltas fold forward into the Canon only; nothing folds in from retired artifacts").

---

## §1 · Files intook (4 of 8)

| # | Canonical path | Supplied form | Recorded-Canon SHA | Supplied SHA | Derived-md SHA | Bytes |
|---|---|---|---|---|---|---|
| 1 | `docs/mandates/akki_operating_model_product_spec_v2.0.md` | .docx | `20b4d305c26c1054c6c5cf49ae4d542a16e3579b2eddea1bdc04ec6450ceee4f` | `4c9301643bd8f37d3c62e998cf2f4531a4125a0da686f4a258827b7ec118b38e` | `5087be0f02ce50adfaa1dd793c18540de39e7b7a7887f8f1596079e6a7326f62` | 41 935 |
| 2 | `docs/mandates/akki_role_register.md` | .docx | `471e1f4e578ec7aadf6edff11e898f44c459bfccdf7d63ddd3ee283fc0b65bd7` | `837f04ffa965d3a4d678660331bd14710cbc0e7d2c17823dc4a9541dc781d634` | `45bad42df495120891b0f1e39d54abe9914e5124d79cd8e2837f13b535ed2c60` | 29 083 |
| 3 | `docs/mandates/akki_analyze_codebase_acquisition_v1.0.md` | .docx | `76b2998e7b9075efd703fbd246d1dd048a4bfe6c5af7d1818973fe3e2a2ebd7d` | `9e33f832679daaf32eeb288b0943de56e32e501225c1447ae4e9b66b8f3e508e` | `a8b81475b5f6d3a6fccfa5732c2b277326f24e7f5b08398821aa75ccf1df50dc` | 8 647 |
| 4 | `docs/rulings/owner_change_order_2026-07-25.md` | .md (direct) | `[MEMORY]` (unverified per Brief v1 §J) | `33b16441025ac0bc757fd92f770252d30f0e63de4e4609c635be3ce9252fa568` | (same as supplied) | 17 141 |

**SHA discipline honestly recorded per Owner directive:** items 1-3 supplied as .docx; derived-md SHAs do NOT match the Canon-recorded SHAs — this is expected (different conversion path). Content is treated as canon per Owner delivery; recorded-canon SHAs are noted as **superseded-by-Owner-delivery**. Item 4 supplied directly as .md; its SHA is `33b16441…` (this is now the §1.5 disk-verified SHA — the [MEMORY] annotation is resolved).

Originals preserved at `docs/handoff/canon_originals/*.docx`.

---

## §2 · Content-alignment check vs Brief v1 + Dispatch v2

**Zero contradictions found.** All four intook files are internally consistent with Brief v1 (`docs/handoff/frontend_uiux_brief_v1_2026-07-27.md`) and Dispatch v2 (`docs/mandates/AKKI_OS_CONSOLIDATED_DISPATCH_v2.md`). Specifically:

| Element | Intake source | Brief v1 anchor | Dispatch v2 anchor | Aligned |
|---|---|---|---|---|
| Six user classes (Master Admin · DPO · Operator · Data Analyst/Scientist · Executive · Customer) | Role Register §2 + Operating Model §1 table | Part B (B.1-B.6) | §3.6 | ✓ |
| Nav order (Connect · Registry · Use Data · Govern · Prove · Team) | Change Order A1.1 | Part C.1 | §3.2 | ✓ |
| Three doors (Integrate app / Export or License / Train a Model) | Change Order A1.1 + Operating Model §3.1 | Part D.3.1 | §3.2 | ✓ |
| Same conversational wizard behind all doors | Change Order A1.2 + Operating Model §3.2 | Part D.3.2 | §3.2 | ✓ |
| Approval Queue deleted; Run/Commission Approver retired | Change Order A2.1 | Part G.1 struck stories | §3.3 (A2.1) | ✓ |
| Commission verdict five checks (rights compat · privacy floor · PII posture · budget ceiling · scope resolvability) | Change Order A2.2 + Operating Model §3.3 | Part D.3.4 + Part H.2 | §3.4 | ✓ |
| Three verdict outcomes (Runs now · Refused · Held for a check) | Change Order A2.2 + Operating Model §3.3 verdict table | Part H.2 | §3.4 | ✓ |
| Commission auto-run ceiling (Class O, seventh Connect rule) | Change Order A2.3 | Part D.1 | §3.4 + §6.5 | ✓ |
| Rules Taxonomy S/O/E/D + Rails/Rules/Engine settings/Registries UI names | Change Order A3.1 + Operating Model §8 | Part D.4.3 + Part H.4 | §3.2 (D.4.2/D.4.3) | ✓ |
| E→O promotion is the sole runtime-tunability path | Change Order A3.2 + Operating Model §8 | Part D.4.3 | §3.2 (D.4.3) | ✓ |
| Class D lifecycle (upload → validate → diff → confirm → version + rollback) | Change Order A3.3 + Operating Model §5.4 | Part D.4.4 | §3.2 (D.4.4) | ✓ |
| Class D asymmetry: additions immediate; removals+edits require approval | Change Order A3.3 + Operating Model §5.4 | Part D.4.4 | §3.2 (D.4.4) | ✓ |
| Rule Change ceremony (propose → counter-sign → wait → apply + certificate + re-verify) | Operating Model §5.3 + Role Register §4.4 | Part D.4.5 | §3.2 (D.4.5) | ✓ |
| Prove three response shapes VISUALLY DISTINCT (Not extracted yet / Evidence cannot support / Something broke as fault) | Operating Model §6.1 | Part D.5.1 | §3.7 (`gate_fault_shares_no_refusal_components`) | ✓ |
| Failed lookup MUST NOT convert refusal into fault | Operating Model §6.1 | Part D.5.1 | §3.7 (`gate_failed_lookup_never_converts_refusal_to_fault`) | ✓ |
| Absolute refusal MUST render NO approval affordance | Operating Model §1.3 | Part A.3 + Part H.8 | §3.7 (`gate_absolute_refusal_no_affordance`) + §3.4 | ✓ |
| Analyze workspace locality (uploads stay; estate flows in only) | Operating Model §7.2 | Part D.6.2 | §3.2 (D.6) + §5.3 | ✓ |
| Analyze acquisition: `backend/services/workbook_analyzer/` (10 modules · 2 116 lines) NOT PRESENT | Analyze Acquisition §1 + §3 + module table | Part I.3 | §5.3 blocks Analyze until acquired | ✓ |
| Constitutional seats (Master Admin + DPO) succession via out-of-band instrument | Operating Model §1.5 + Role Register §3-4 | Part A.5 | (§1.3 backend continuity) | ✓ |
| Three duties attach, not classes (Approve-to-run · Release outbound · Confirm structured mappings) | Operating Model §1.6 + Role Register §9 | Part A.6 | (§1.3 continuity) | ✓ |
| DPO scope: Trust Center; violations posted as plainly as successes | Operating Model §5.1 + Role Register §4.2 | Part D.4.1 | §3.2 (D.4.1) | ✓ |
| Extend scope re-quotes (never silent fold-in) | Change Order A1.7 + Operating Model §3.4 | Part D.3.5 | §3.7 (`gate_extend_scope_requotes`) | ✓ |

## §3 · Delta preview for Brief v2 filing

Per Dispatch v2 §1.4: *"Deltas fold FORWARD into Canon only; nothing folds in from retired artifacts."*

Content deltas that Brief v2 should carry forward from the four Owner-delivered files (all ADDITIVE — no reversals or overrides against Brief v1):

1. **Operating Model §5.3 firms Change-a-Rule ceremony wording** — "an enforced waiting period runs with a visible countdown during which the change can be cancelled; then it applies, with a change certificate on the record. Completion triggers re-verification". Brief v1 §D.4.5 already anchors this; Brief v2 folds the "change certificate + re-verification triggered on completion" language forward as normative.

2. **Operating Model §6.1 firms Prove response-shape wording** for Brief v2 §D.5.1 — three shapes MUST be *visually distinct and never conflated*; where a supporting detail cannot be retrieved, the refusal still renders without it (belt-and-suspenders to Dispatch §3.7 `gate_failed_lookup_never_converts_refusal_to_fault`).

3. **Operating Model §7.1-7.5 firms Analyze specifics** — ownership is personal and explicit; transfer by act, not absence; material belongs to workspace, not uploader. Brief v1 §D.6.1 anchors; Brief v2 folds forward the "workspace outlives owner's employment · transfer recorded like any other change of authority" language.

4. **Operating Model §7.3 firms Analyze workspace's three properties** — every figure carries class (measured/estimated); every citation resolves against parsed source or result does not persist; narration reports without instructing. Brief v1 §D.6.3 anchors; Brief v2 folds the "class · resolution · non-imperative" trio forward as three MUST rules per Dispatch §3.7 `gate_every_figure_carries_class`.

5. **Role Register §1.4 firms product boundary** — Akki OS (four classes: MA, DPO, Op, Analyst) vs Akki for Executives (integrated app) vs Customer Portal (external). Brief v1 §D.8/D.9 anchors; Brief v2 folds forward that Executives + Customer are **separate applications with scoped keys landing in the same record the DPO reads**. Reinforces Dispatch v2 §5.4 (not in UI-1 scope).

6. **Change Order A2.3 supplies exact Connect Rule 7 grammar** — "numeric + currency, recommended default per org, **∞ permitted**. Commissions at/under the ceiling auto-run when rule-clean; above it, the commission holds for a **single DPO countersign** (the reserved 'Pending policy check' state)." Brief v2 §D.1 must render this rule with a numeric input, currency selector, ∞ toggle, and helper text. **Owner value still needed per §6.5.**

7. **Change Order A2.2 supplies exact refusal grammar for Commission card** — "specific rule named · Criterion that crossed · Value that crossed · Route to approval (escalatable only) · No affordance (absolute)". This is Brief v1 §H.8 verbatim; Brief v2 anchors it to the Commission card discipline.

8. **Change Order A3.4 supplies initial rule classification register** — Rails (masking-before-AI · fault-never-refusal · single-ingress · fail-closed license default · five_rings zero-mutation · admissibility machinery); Rules (six Connect rules · both waiting periods · A2.3 ceiling · admissibility thresholds); Engine settings (dedupe fingerprint · VAD threshold · batch windows · sample-rate constants · EAB-3 §5.5 defaults); Registries (shield-against · protected-terms · DPO filter lists). Brief v2 §D.4.3 must render this classification as day-zero seed data (READ-ONLY except Rules).

9. **Analyze Acquisition §5 supplies EXCLUDED components** — model boundary, consumption surfaces, commercial scaffolding, everything-else-in-tree ARE NOT acquired. Brief v2 §D.6 must not assume any of these are inherited from the workbook_analyzer/ acquisition.

10. **Analyze Acquisition §6.1 supplies the schema delta** — the source rationale field does not classify measured-vs-estimated; **classification is added to the schema and threaded to surfaces** on acquisition. Brief v2 §D.6.3 must render the class field on every figure.

## §4 · What is STILL AWAITED (4 of 8)

Per Owner "uploading the rest":
- `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` — SHA `c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17`.
- `docs/registers/artifact_manifest.md` — 25 rows per Brief v1 §J.
- `docs/stage_a_proposals/ui_1_stage_a.md` — ~100 032 B per Brief v1 §J.
- `docs/mandates/module_specs/*.md` — 20 files per Brief v1 §J.

Plus Owner-item values:
- §6.1 B1 GPU spend ceiling · numeric + currency.
- §6.5 Commission auto-run ceiling value · numeric + currency (∞ permitted) · needed at `connect/` build.

**Stage A remains BLOCKED** per Owner directive: *"Stage A stays blocked until all 8 land."*

## §5 · HAZARD-STOPs raised

**None.** Zero content contradictions between the four intook files and Brief v1 / Dispatch v2. All alignments checked; SHA-derivation mismatches on items 1-3 handled honestly per Owner directive (record both SHAs, treat content as canon).

═══════════════════════════════════════════════════════════════════

*End of Canon intake · Part 2 delta log. Standing Rule v3 · verbatim carrier · never self-resolve.*

═══════════════════════════════════════════════════════════════════

## Canon Intake · Part 3 (2 more files landed 2026-07-31)

### §6 · Files intook in this batch (6 of 8+ now landed)

| # | Canonical path | Supplied form | Recorded-Canon SHA | Supplied SHA (also on-disk) | Bytes |
|---|---|---|---|---|---|
| 5 | `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` | .md (direct) | `c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17` | `c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17` | 10 671 |
| 6 | `docs/rulings/owner_brief_enforcement_class_on_estate.md` | .md (direct) | (new · not in original 8) | `7c6d0192220927ab160988ff1effd48144f738bdfc0a7fe7b4f73d643205c088` | 7 202 |

**Item 5 · SHA MATCH byte-identical** to Canon-recorded SHA `c5026ff4…`. The "and_coverage_layer" suffix in the supplied filename is an artifact-source label; the delivered file IS `owner_brief_blinded_assessment_2026-07-25.md` (its own header confirms the filing path). Committed to canonical path; a duplicate carries the extended filename for the artifact trail.

**Item 6 · NEW canon-cited source** (not in the original 8-item missing list). Owner-added; underpins Canon D.4.2 (enforcement classes) and Change Order A4.1. Filed at `docs/rulings/owner_brief_enforcement_class_on_estate.md`.

### §7 · Content-alignment check vs Brief v1 + Dispatch v2 + prior intake

**Item 5 · Blinded Assessment + Coverage Layer**

| Element | This brief anchor | Prior-intake / Canon anchor | Aligned |
|---|---|---|---|
| T-2 blinding text · "arm identity concealed at scoring · outputs in randomized order · normalized to remove arm-identifying form artifacts · unsealed only after scores fixed · leakage check precedes unsealing" | §3 ruled text (verbatim block) | Operating Model §9.2 verbatim: *"blind: arm identity concealed at scoring, outputs presented in randomised order and normalised to remove arm-identifying form artefacts, identity unsealed only after scores are fixed, and a leakage check before unsealing"* | ✓ byte-verbatim carry-forward already in Operating Model |
| 8-function coverage layer (precise feedback · **blinded assessment** · lineage certification · adversarial judgment · deployment-authentic evaluation · indexed retrieval · frozen core / edge adaptation · verified succession) | §4.3 table | Operating Model §9.3 verbatim list ✓ | ✓ |
| Coverage re-fires at every training-engine version bump (never one-shot) | §4.1 | Operating Model §9.3: *"It re-fires at every training-engine version bump."* | ✓ |
| Admission question on new training mechanics: which function does it serve? | §4.2 | Operating Model §9.3: *"Any proposed new training mechanic declares which function it serves — one line."* | ✓ |
| Blinding surfaces on Model Acceptance evaluation card (user-visible) | §5 | Operating Model §9 (acceptance is automatic + evaluation card) | ✓ |
| Proportionality guard: leakage check is one lightweight probe, NEVER a subsystem/harness | §3 proportionality guard | (novel constraint; no conflict) | ✓ new |
| Taxonomy = standing layer, NEVER organizing structure of T&O spec | §4 preamble | (novel constraint; no conflict) | ✓ new |
| Adversarial judgment (critics) remains detection-only, N≤3, BOUNDED | §4.3 table + §6 explicit non-adoption | (aligns with prior critic_pass service posture) | ✓ |

**Item 6 · Enforcement Class on Estate**

| Element | This brief anchor | Prior-intake / Canon anchor | Aligned |
|---|---|---|---|
| Three enforcement classes: Enforced / Attested / Monitored | §2.1 | Operating Model §5.2 + Change Order A4.1 + Brief v1 §D.4.2 + Brief v1 §H.5 | ✓ |
| Enforced: check runs, fails closed, emits receipt · carries enforcement + violation counts | §2.1 | Operating Model §5.2 verbatim | ✓ |
| Attested: recorded human act · carries who/when/artifact · NO enforcement count | §2.1 | Operating Model §5.2 verbatim | ✓ |
| Monitored: measured + reported, does NOT block · carries observation count + non-blocking language | §2.1 | Operating Model §5.2 verbatim | ✓ |
| Headline stat splits: "how much is machinery · how much is human attestation" | §2.2 | (novel · firms Brief v1 §D.4.1 Trust Center headline) | ✓ new |
| No class presented as superior | §2.3 | Operating Model §5.2 verbatim | ✓ |
| Class is derived from Rules Taxonomy, never hand-set | §2.4 | Operating Model §5.2 verbatim + Change Order A3.1 | ✓ |
| "See the record" behaves per class (Enforced→check receipt · Attested→artifact · Monitored→observation log) | §2.5 | (novel · firms Brief v1 §D.4.1 record half) | ✓ new |
| Attested is NOT a deficiency to remediate; no remediation pressure on surface | §2.3 + §4 | Operating Model §5.2 ("does not editorialise") | ✓ |
| §5 open check: two-class (measured/estimated) vs three-class (fact/recalled/inferred) on Answer Cards | §5 | Brief v1 §D.5.1 (Prove) · NOT ruled here, deferred to Prove's next spec pass | ✓ non-blocking |

### §8 · Additional delta preview for Brief v2 (folds forward from items 5 + 6)

**From Item 5 (Blinded Assessment):**

11. **Coverage-layer table becomes canonical §9.3 rider** on the Training & Optimization specification. Brief v2 §D.6 (Analyze) does NOT own this table; it belongs with the training engine (Use Data / Train a Model door + Model Acceptance + evaluation card). Brief v2 folds the 8-function coverage layer as the Model Acceptance card's evidence bar.
12. **Proportionality guard** on leakage check: ONE lightweight probe (classifier or reviewer pass), NEVER an evaluation harness. Brief v2 folds this into the acceptance-card visual so a reader can see whether the leakage check was passed without exposing a harness.
13. **Adversarial-judgment bound** (critics detection-only, N≤3, BOUNDED) carries forward as an explicit gate ceiling on any critic_pass surfaces.

**From Item 6 (Enforcement Class on Estate):**

14. **Headline stat splits on Trust Center landing** — the D.4.1 headline formerly "Rules in force · Checks enforcing them" MUST split into (i) rules-in-force-machinery vs (ii) rules-in-force-attestation, with one plain-language line between them. Brief v2 §D.4.1 anchors this shape.
15. **"See the record" per-class routing** on every Rules Record row — enforced→receipt · attested→artifact · monitored→observation log. Brief v2 §D.4.3 anchors this as a MUST rule.
16. **No remediation-pressure copy anywhere** on Estate surfaces — the surface reports class, does not editorialise, does not urge conversion of Attested→Enforced. Brief v2 folds this as a design-doctrine cell for the Trust Center.
17. **Open check for Prove next-spec-pass** — whether measured/estimated is sufficient on Answer Cards or an inferred figure needs its own class. Recorded as an OPEN QUESTION, not a Brief v2 ruling.

### §9 · HAZARD-STOPs raised in this batch

**None.** Zero content contradictions in items 5 or 6 vs Brief v1, Dispatch v2, Operating Model, Role Register, Analyze Acquisition, or Change Order. Item 5 is byte-verbatim on Canon-recorded SHA (rare and clean). Item 6 firms two already-canonical elements (headline stat + per-class record routing) with normative amendment text.

### §10 · Standing block against UI-1 Stage A

**Stage A remains BLOCKED** — 3 Canon items still awaited:
- `docs/registers/artifact_manifest.md` (25 rows per Brief v1 §J).
- `docs/stage_a_proposals/ui_1_stage_a.md` (~100 032 B per Brief v1 §J).
- `docs/mandates/module_specs/*.md` (20 files per Brief v1 §J).

Plus Owner-item values (§6 Dispatch v2):
- §6.1 B1 GPU spend ceiling · numeric + currency · STILL BLANK.
- §6.5 Commission auto-run ceiling value · numeric + currency (∞ permitted) · needed at `connect/` build.

═══════════════════════════════════════════════════════════════════

*End of Canon intake · Part 3 delta log addendum. SR v3 · verbatim carrier · never self-resolve.*
