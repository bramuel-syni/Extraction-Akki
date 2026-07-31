# Owner rulings record — Phase 3 sub-cycle 2 · Memory + Registry

**Filed:** 2026-08-02
**Cycle:** Phase 3 · sub-cycle 2
**Standing rule v3:** verbatim carrier; no paraphrase.

---

## Ruling 1 — Sub-cycle-2 dispatch (Memory + Registry)

Owner verbatim: *"Phase 3 sub-cycle 2 · Memory Service surface (plane list · plane detail · contribution history · governed-refusal publication ceremony) · Plane observability panel (read-only aggregates over the reconstructor) · Registry Estate Map (declaration-baseline-only state · measured vs unmeasured as first-class visual states · inference overlay dormant, never fake numbers)."*

**Applied:** four new frontend routes landed
(`/memory`, `/memory/planes/:planeId`, `/memory/planes/:planeId/observability`,
`/registry`) using the same design-system single-source `frontend/src/design/*`
delivered in sub-cycle 1. Every capability is either lit (measured) or dormant
(hatched) — no build state on any surface. Publication ceremony
`PUBLICATION_QUALITY_THRESHOLD [SLOT]` remains unset by design and renders
the fail-loud governed refusal as the sub-cycle-2 shape.

## Ruling 2 — Plane observability endpoint bounds (recap from sub-cycle 1)

Owner verbatim: *"APPROVED with slot-in for Phase 3. Rides the same
`/api/memory/*` surface; read-only aggregate over the reconstructor;
zero new frozen contracts unless the shape crosses an environment boundary
(then D4b FREEZE)."*

**Applied:** `GET /api/memory/planes/{plane_id}/observability` landed as a
sibling route on the existing router. Read-only. Scope enforcement identical
to `GET /api/memory/planes/{plane_id}` — admin full-scope; engineer-key
holder same-key only. Response shape is an untyped aggregate JSON body;
**parity remains 34/34 unchanged**.

## Ruling 3 — Governed-refusal vs access-control-denial (recap · design law)

Owner verbatim (cycle 3): *"four response classes NEVER conflated
(governed refusal / validation error / infrastructure fault / access-
control denial — distinct visual treatments)."*

**Applied:** Publication-slot-unset attempts render via `<GovernedRefusalCard>`
(oxblood accent · `outcome=refused` rendering · Ruling 4 verbatim action
triplet). Cross-key HTTP 403 renders via `<AccessControlDeniedPanel>` (navy
accent · never `outcome` key). The two treatments are distinct in accent
color, border, and test-id. Jest gate roster asserts the discipline (see
`test_memory_and_registry_ui_gates.test.js` M-U4 + M-U5).

## Ruling 4 — Nav discoverability (Surfaces v2 shell rule)

Owner verbatim (this dispatch): *"keep the module-scoped nav consistent
with the Surfaces v2 shell rule; new routes must be reachable from visible
navigation, not just deep links."*

**Applied:** `CONSOLE_NAV_ITEMS` in `AskConsolePage.js` extended with
`/memory` (`Memory Service`) and `/registry` (`Registry · Estate Map`).
Both entries `gate: 'auth'`. Nav menu discoverability preserved.

## Ruling 5 — Registry declaration-baseline discipline (day-zero)

Owner verbatim (this dispatch): *"declaration-baseline-only state rendered
honestly (inference overlay is a closed seam — show it dormant, never fake
numbers)."*

**Applied:** every figure on the Estate Map carries a `<MethodChip>` marking
`declaration_baseline`. The inference overlay column always renders
`<DormantCapabilityChip label="inference_overlay">` — never a numeric value.
Coverage gaps (dimensions without measured-census) pair with a `Propose
census →` action link routing to the operator wizard door.

## Ruling 6 — Everything else parked

Owner verbatim (this dispatch): *"All PARKED items stay parked."*

**Applied:** the following remain OUT OF SCOPE and untouched:
- Grants-revision JWT claim optimisation (PARKED · SR-5).
- B1 GPU spend ceiling figure (AWAITING OWNER FIGURE).
- Data Engineer role default (OPEN ITEM · defaults to Master Admin alias).
- Wizard draft persistence improvement (Owner: "not ruled in — do not build it").
- Publication ceremony live-writable action (SLOT unset by design; fail-loud
  refusal IS the sub-cycle-2 rendering).
- Govern module (sub-cycle 3).
- Prove + Team modules (sub-cycle 4).

═══════════════════════════════════════════════════════════════════

*End of rulings record. Verbatim carrier · SR v3 compliant.*
