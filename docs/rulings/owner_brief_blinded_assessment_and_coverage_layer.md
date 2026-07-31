# OWNER BRIEF — Blinded Assessment Amendment + Eight-Function Coverage Layer

**Class:** Owner ruling-class. Supersedes the proposal-class input `Akki_Inherited_Mechanics_Taxonomy_Brief.md` (2026-07-23) on every item it addresses; the source brief survives as evidence and reference.
**Ruled:** 2026-07-25.
**Filing:** this brief files now at `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md`. Its **binding amendment (§3) attaches to the Training & Optimization specification at that specification's landing**, via the standard sibling-amendment procedure. Nothing in this brief dispatches builder motion before then.
**Evidence-class convention (house rule 11) retained throughout:** [fact] · [recalled] · [inferred].

---

## 1 · Scope ruling — product, not build discipline

This brief applies **entirely to the product**: the training engine that sits behind Akki's *Train a Model* door. Every item below is a runtime mechanic of how a model is produced and judged, a section of a product specification, or a surface a Milele Bank user reads.

**Explicitly out of scope:** the platform's own build discipline. The source brief's §4.2 observation — that the record's succession machinery (memory docs, attestation boundaries, D-11) is the living form of "an archive is not continuity; a successor is" — is [inferred] and **correct as description, adopted as nothing**. No historical-completeness lens attaches to the governance stack. Adding one would be ceremony without a user, which the standing over-engineering check rejects.

This scope line is stated because the two registers are easy to blur: the source brief's vocabulary (coverage, admission, gates) is the vocabulary the build discipline also uses. Same words, different object. The object here is the product.

---

## 2 · What the source brief established, and its evidentiary weight

Seven of eight historical functions map to mechanics already held in Akki's training canon; one — blinded assessment — is absent. That mapping is [inferred]; the underlying ML mechanics' existence and testedness is [fact, established practice]; the canon placements are [recalled] against session record and **not yet disk-verified**.

**The pedigree carries zero evidence weight**, per the source brief's own caveat and this ruling. A practice surviving four millennia proves it served human institutions; adoption in Akki still requires that the mechanic it maps to (i) exists, (ii) is tested, (iii) has known success conditions. The taxonomy's value is completeness, not proof.

**Fence:** the four-millennia framing is licensed for positioning material only. It must not appear as justification in any Stage A, ruling, or specification. Inside the engineering record it is exactly the evidence-weight the source brief disclaims.

---

## 3 · RULED — T-2 blinding amendment (binding at T&O spec landing)

The source brief proposed a one-sentence amendment: *"Comparison arms are scored blind; arm identity is unsealed after scoring."* **That form is rejected as insufficient** — it implements name-concealment (*huming*) without recopying (*tenglu*), and therefore fails its own stated success condition, which the source brief records correctly: *"identity leakage through formatting or ordering artifacts defeats it."* Under the proposed sentence, arm identity leaks through output form, systematic ordering, length distribution, or tokenization artifacts while the protocol reads as satisfied — and the defect class it targets (evaluator exposure contaminating checkpoint selection, [fact, documented in the ASR study on the page) walks through intact.

**Ruled text, to append to the T-2 two-arm comparison protocol:**

> *"Comparison arms are scored blind: arm identity is concealed at scoring, outputs are presented in randomized order and normalized to remove arm-identifying form artifacts, and arm identity is unsealed only after scores are fixed. A blinding-leakage check precedes unsealing."*

**Proportionality guard (binding, to prevent this becoming a subsystem):** the leakage check is one lightweight probe — can arm identity be guessed above chance from the blinded outputs? A classifier probe or a reviewer pass both satisfy it. It is one check, not an evaluation harness.

**Gate-cell status:** at the Training & Optimization carrying phase, the leakage check is a **gate-cell candidate** under §0-CAL's roster requirement. Whether it lands as a gate cell or as a protocol step is resolved at that phase's Stage A, not here.

**Verification owed at landing:** the claim that blinding is absent from T-2 is [fact against session record] and **unverified on disk**. The builder disk-verifies it as step one of the amendment's filing. If blinding is already present in filed T-2 canon in any form, this amendment reconciles against it rather than duplicating — a CONFLICT row, ruled per-conflict.

---

## 4 · RULED — three standing attachments to existing canon

The taxonomy is adopted as a **standing layer on the canon, never as its organizing structure**. Reorganizing the Training & Optimization specification around eight historical functions would put two taxonomies on one body of doctrine and force every future amendment to reconcile against both — a drift vector, and forbidden by the source brief's own terms ("not a source of new mechanics, not license to widen any standing ruling").

**4.1 · Standing coverage section (recurring, not one-shot).**
The Training & Optimization specification carries, as its final section, an eight-row coverage table: **function → mechanism in force → its gate cell or bounding ruling**. Each row is either instrumented, bounded by ruling, or its absence explained.

It re-fires at **every training-engine version bump**, not once at landing. Grounds: coverage erodes silently across versions. A refactor that drops deployment-authentic evaluation, or breaks lineage continuity, is precisely the failure this catches — and a one-shot check at landing catches it never. This supersedes the source brief's proposed one-time completeness scan.

**4.2 · Admission question on new training mechanics.**
Any proposed new training mechanic declares, in its Stage A, **which function(s) it serves**. One line of cost. It filters two things: redundancy (*we already hold this function — what does the addition buy?*) and function-less additions (*serves none* is a flag that something is being built for its own sake). This is the taxonomy working as an admission filter rather than as decoration.

**4.3 · Function names as specification vocabulary, history stripped.**
The eight functions enter spec vocabulary under plain-language names describing what each mechanism is *for*:

| Function name (canon vocabulary) | Mechanism in force | Canon status per source brief |
|---|---|---|
| Precise feedback | SFT against gold references; drop-don't-guess corpus rule | HELD [recalled] |
| **Blinded assessment** | **Blind-scored two-arm comparison + leakage check** | **GAP → ruled §3** |
| Lineage certification | Checkpoint lineage, artifact manifests, SHA chains, five-rings/R4 | HELD [recalled] |
| Adversarial judgment | Ensemble critics — detection-only, N≤3 | HELD, BOUNDED [recalled] |
| Deployment-authentic evaluation | Measure through the consumption seam | HELD [recalled] |
| Indexed retrieval | Retrieval over the indexed estate (extractor + S1 memory plane) | HELD [recalled] |
| Frozen core / edge adaptation | Frozen base + LoRA; multi-instance doctrine | HELD ×2 [recalled] |
| Verified succession | Capability transfer; verified in the successor, not assumed | HELD ×2 [recalled] |

The Egyptian scribes, the Song examiners, the Jesuits and the rest stay in positioning material. The register is the same as elsewhere in the product: plain language naming what a thing is for.

---

## 5 · User-visible consequence

Blinding is not only a lab protocol. Model Acceptance shows a Milele user six automated checks with measured numbers, and **whether arm comparison was blinded is part of what makes those numbers trustworthy to the person accepting the model**. The evaluation card therefore states the blinding posture and the leakage-check result.

Whether that surfaces as a line on the evaluation card or as an additional named check is a **design question resolved when the Training & Optimization specification lands**, not guessed here. That it surfaces at all is ruled. This is the test that settles §1's scope question: it ends on a screen a user reads.

---

## 6 · NOT adopted (explicit)

- **No widening of T-3.** Critics remain detection-only, N≤3. The coverage mapping notes coverage; it grants nothing.
- **No new training mechanics.** The taxonomy adds none and is not a source of any.
- **No resequencing** of the sanctioned anchor or the §9 dispositions.
- **No reorganization** of the Training & Optimization canon around the eight functions (§4 preamble).
- **No build-discipline component** (§1).
- **The source brief's §4 subsidiary observations** remain Owner-side positioning and doctrine-epigraphy material, with no build attached and the §2 fence applying.

---

## 7 · Filing and trigger conditions

1. **Now:** this brief files as an Owner ruling at the path in the header, SHA'd into `MANIFEST.md`. No builder motion follows from filing alone.
2. **At Training & Optimization specification landing:** (a) disk-verify the T-2 blinding-absence claim (§3); (b) attach the §3 ruled text as a sibling amendment with a CONFLICT row if reconciliation is needed; (c) land the §4.1 coverage section as the specification's final section with its re-fire trigger stated; (d) record the §4.2 admission question in that specification's Stage A requirements; (e) adopt §4.3 vocabulary; (f) resolve the §5 surface question at Stage A.
3. **At every subsequent training-engine version bump:** re-fire the §4.1 coverage table. Each row instrumented, bounded, or explained.
4. **Estimation discipline:** any banding generated against this work carries "Provisional planning anchor — not a commitment. Relative weight only." verbatim.

---

## 8 · Open, not ruled here

- Whether the leakage check lands as a gate cell or a protocol step (§3) — Stage A of the carrying phase.
- Whether blinding posture surfaces as an evaluation-card line or a named check (§5) — same Stage A.
- Disk-verification of the seven HELD placements (§2) — discharged by the first §4.1 coverage re-fire, which runs the table against filed canon rather than session record. Nothing extra is owed; the coverage section is the verification vehicle.

**END OF BRIEF**
