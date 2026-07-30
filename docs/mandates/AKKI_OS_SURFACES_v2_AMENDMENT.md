# AKKI OS — SURFACES, JOURNEYS & FEATURES v2.0 · AMENDMENT RECORD
### Amends Surfaces v1.0 by supersession of named sections · Owner ruling · July 2026

Lands in `docs/mandates/akki_os_pack_v1/` beside Surfaces v1.0 (which is preserved
immutable per the standing supersession pattern). SHA manifest updated on commit.
Canon Register §3 row for the UI Specification updates to cite this record.
Reference artifact: `Akki_v4_Standalone.html` (design prototype; aesthetic and flow
reference; not a specification — where this record is silent, v1.0 §-text stands).

---

## §A1 — Ruling record

Owner ruling, July 2026: the prototype's structure, surface count, naming, UX
architecture, and UI flow are ratified as the build target. Surfaces v1.0's four-console
taxonomy (v1.0 §5), its screen-to-console inventory (v1.0 §6), and its five-role set
(Engineering Spec §28 framing) are superseded where they conflict with §A2–§A3 below.
Everything not named as superseded carries forward at v1.0 authority.

## §A2 — The ratified taxonomy: six modules

Extracted mechanically from the prototype's module map. Population of screens is the
prototype's; the *capability sentence* per module is carried from v1.0's console
definitions, re-homed.

| Module | Screens | Capability carried from v1.0 |
| --- | --- | --- |
| **Connect** | connect (Sources & Setup) | Source connection with rights recorded at connection; mapping confirmation for structured sources. |
| **Registry** | registry (What You Hold) · sourceProfile · opportunities (What You Can Do With It) | The estate map; item profiles; opportunity briefs — advisory, never approval gates. |
| **Use Data** | useData (Use Your Data) · wizard (three doors: Export/License · Train a Model · Integrate an App) · objectives · shape · testbed · approvals (commit review) · runs · runDetail · trainingRun · models · modelDetail · intel · artifact · developer | Shape and commission; sample before committing; observe extraction and training live; model shelf; deliverables; the developer surface and key issuance. |
| **Govern** | govEstate (The DPO's Estate) · verify (Verify the Rules) · changeRule · destroy · quarantine · release · govSetup · succession | The rule inventory and respect/violation record; verification packs; ceremonies (rule change, deletion, succession); quarantine and release review; setup. |
| **Prove** | ask (Ask a Question) · shapes (How Answers Come Back) · memos · memoDetail · receipts (Public Receipts) · trail · recipient | The proof walk (three lenses); memos inheriting receipts; public receipt resolution. |
| **Team** | team (Manage Users) | Roles and rights, plain-language and ledgered. |

**A2-1** The public trust receipt remains reachable by anyone holding a receipt link,
without an account (v1.0 §6 "plus one public surface" — unchanged). The Prove module's
receipts/trail screens are the authenticated rendering of the same record; the public
page is the unauthenticated one; both resolve identically by trace identity.

**A2-2** Screen count is thirty-three plus the public receipt page. v1.0's twenty-screen
inventory is superseded as a count; each v1.0 screen's *content specification*
(elements, states, rules) maps to its successor screen and continues to govern that
screen's build unless this record or FRONTEND BRIEF v2.0 amends it.

## §A3 — The ratified role set: six roles

| Role | Landing | v1.0 lineage |
| --- | --- | --- |
| Master Admin | registry | Master Admin (unchanged) |
| Data Protection Officer | govEstate | DPO (unchanged) |
| Analyst | ask | Business user, renamed |
| **Data Engineer** | connect | **New — no v1.0 lineage. See §A5-2.** |
| Operator | approvals | Operator (unchanged) |
| Integrating Engineer | developer | Integrating engineer (unchanged) |

Role-based landings are ratified. Canon Register §11's reconciliation is amended to
match: the module taxonomy governs the build; roles are landings and motions.

## §A4 — Reconciliations (both positions hold; here is how)

**A4-1 Ask placement versus the application boundary.** The Owner's standing directive —
the ask surface is not the front end — and the ratified structure — ask is a Prove tab
and the Analyst's landing — are reconciled as *placement versus privilege*. Placement is
a navigation fact and is ratified: ask renders inside the shell, and the Analyst lands
there. Privilege is a call-path fact and is unchanged: the ask surface consumes the
platform through a scoped key across the governed boundary, identical to any integrated
application, with no privileged path to composition (v1.0 §3, §26 — still in force).
The nav position changed; the architecture did not. Day-zero success remains defined on
the two dashboards (registry + govEstate), not on ask.

**A4-2 The checker seam inside one Govern module.** v1.0 §33's dual control assumed two
consoles counter-signing each other. Under the ratified taxonomy, both rule classes live
in Govern. The *seam* survives as a flow property rather than a console split: loosening
changes enter pending counter-signature by the second identity, both identities and
timestamps land in one ledger row, and the counter-signing party sees the plain-language
consequence statement before signing. Direction symmetry binds on identity, not on
module. The honesty note carries forward verbatim: while one person holds both roles,
dual control is ceremony; the seam is built now because it is cheap now and expensive to
retrofit.

**A4-3 The Commission View.** v1.0 §15A lands inside Use Data: the milestone-first
tracking surface for every commissioned work, with trainingRun/runDetail as its
drill-down evidence layer. Specified in FRONTEND BRIEF v2.0 FB-4/FB-5; this record
re-homes it, the brief specifies it.

## §A5 — Open items, put to the Owner explicitly

**A5-1 Binding copy (v1.0 Appendix A).** Zero of the verbatim strings appear in the
prototype. Disposition required per string: ratify into v2 (implemented verbatim),
revise (new wording ruled), or retire. Until ruled, Appendix A strings are *suspended,
not lapsed* — the builder implements none of them and invents no substitutes; screens
carrying refusal, freeze, retention, or counter-signature copy ship with the copy slot
marked open. Recommended for fast ratification unchanged, because each encodes a
behavioural rule, not a tone choice: the refusal action triplet (accept as recorded
statement · narrow · lower the standard — the only three actions the system can honour),
"Frozen is immutable," and the unset-retention banner.

**A5-2 The Data Engineer role.** Enters the canon by this record *conditionally*: its
capability boundary against Master Admin (who owned source connection in v1.0) and
Operator is undefined. Owner supplies the one-sentence mandate; the role then gets its
registry row (R4) and its landing stands. Absent that sentence within the frontend
Stage A window, Data Engineer renders as a landing alias of Master Admin.

## §A6 — What carries forward at full v1.0 authority (named, so nothing lapses silently)

The design law (§1: no surface mirrors internals; professional register; progressive
disclosure). The global rules §2.1–§2.8 — including class-with-claim, refusal in the
answer position, the four response classes never conflated, agent-assumed marking, one
trace thread, and the visual-family rule — with §2.7's plain-language rule now scoped to
exclude the developer screens (contract views remain the one exception, as in v1.0).
The three motions (§4). The four designed states (§8). The shell rule (§9): no figure
anywhere without a path to where it came from. The feature inventory (Part X) as the
feature-capture checklist, read with FRONTEND BRIEF v2.0 §3. The journeys (Part IX) as
completion targets, read with FB-9..FB-16.

— End of amendment record. On commit, this document and Surfaces v1.0 are both canon;
this one governs where they touch. —
