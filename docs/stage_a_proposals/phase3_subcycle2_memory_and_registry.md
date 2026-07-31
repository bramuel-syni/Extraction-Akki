# Stage A Proposal — Phase 3 Sub-Cycle 2 · Memory + Registry

**Cycle:** Phase 3 · sub-cycle 2
**Authority:** Owner ruling 2026-08-01 (Phase 3 approved, re-sequenced) + Owner sub-cycle-2 dispatch 2026-08-02
**Filed:** 2026-08-02 · design-only
**AC-1 posture:** proposal before build; screens + gates + FPR rows named before code lands
**HAZARD-STOP check:** no doc-vs-doc conflict surfaced — cleared to build

---

## §0. Routing intent confirmation (from sub-cycle 1 tester note)

The `/operator/commission` route (extraction wizard door) and the `/extraction/console` route (extraction operator console) are DIFFERENT surfaces by design and this split matches Frontend Brief v2 + Surfaces v2 module mapping:

- **`/operator/commission`** — the objective-request wizard door (FB-4 milestone-capture + FB-6 lawful-basis mandatory); creates a commission → freezes → hands to the executor.
- **`/extraction/console`** — the extraction operator console once a commission has been frozen and hardware time is provisioned (Phase 8 · B-3 landing).

**No re-homing of the module shell is planned in sub-cycle 2.** The Memory + Registry surfaces added in this sub-cycle sit at NEW top-level routes (`/memory`, `/registry`), independent of the Commission or Extraction module shells. Sub-cycle 3 (Govern) may propose a consolidated nav shell across all modules — that is a Sub-Cycle-3 design decision, not sub-cycle 2.

## §1. Placement rule answered (P3-R1)

**Which vertical:** the MEMORY + REGISTRY read surface — the audit + observability lane.
**Which horizontals:** four-response-class taxonomy (already delivered in sub-cycle 1) · ratified Ruling 4 copy (already delivered) · Akki v4 palette (already delivered).
**Data gravity:** read-only against existing Northena ledger + memory-plane docs + census dimensions + Mtafiti feasibility endpoint. Zero new frozen contracts. One thin aggregator endpoint permitted for the observability panel (per Owner directive).

## §2. Screen inventory

| # | Screen | Route | FB / Surfaces anchor | Data source |
|---|---|---|---|---|
| 1 | Memory home (plane list) | `/memory` | FB Memory-module home · Surfaces v2 §Memory | `GET /api/memory/planes` |
| 2 | Memory plane detail | `/memory/planes/:planeId` | FB Memory detail · scoped-accessor pattern surfaced | `GET /api/memory/planes/{id}` + reconstructed_state |
| 3 | Plane observability panel | `/memory/planes/:planeId/observability` | Ruling 2 (approved-with-phase-3) · rides sub-cycle 2 | NEW aggregator endpoint (see §5) |
| 4 | Registry Estate Map | `/registry` | FB Registry Dashboard day-zero · Surfaces v2 §Registry (estate map view) | `GET /api/census/dimensions/registry/*` + `POST /api/mtafiti/feasibility` |

**Explicitly OUT OF SCOPE this sub-cycle:** publication ceremony action wired live (the frontend surfaces the publication ceremony's `publication_quality_threshold_unset` refusal per Owner directive · but no operator-driven publish CTA — [SLOT] is intentionally unset and Owner has not ruled the threshold in; showing the fail-loud refusal IS the design).

## §3. FB gate cells enumerated for this slice

**Memory Service surface:**
- `gate_memory_home_lists_only_owned_planes_for_engineer` — engineer-key holder sees ONLY planes bound to their own integration_key; admin sees ALL. Verified over HTTP with distinct identities.
- `gate_memory_plane_detail_renders_five_ring_class_with_claim` — each contribution row surfaces `class_declared` with class-with-claim discipline (never claim alone).
- `gate_memory_revoked_plane_renders_frozen_honestly` — a revoked plane renders with a clear frozen chip + no "you may still write" affordances.
- `gate_memory_publication_slot_unset_renders_as_governed_refusal` — the `publication_quality_threshold_unset` refusal renders via `<GovernedRefusalCard>` with the three verbatim action-triplet buttons.
- `gate_memory_scoped_cross_key_denied_via_ui` — an engineer-key holder attempting to view another plane via URL navigation is refused with `<AccessControlDeniedPanel>` (no `outcome` key).

**Plane observability panel (Ruling 2):**
- `gate_observability_aggregates_over_reconstructor_only` — the panel reads solely from Northena ledger rows via the aggregator; no new frozen contract; no new hot-path SQL.
- `gate_observability_publication_rate_computed_honestly` — acceptance rate = landed / max(attempted, 1); when attempts == 0 the rate is rendered as `<MarkedOpenSlot slotName="publication_rate">` (not `0%` — the metric is undefined when there are no attempts).
- `gate_observability_revocation_history_rendered_plainly` — if the plane is revoked, `revoked_at` + `reason` + `revoked_by` render with the same visual weight as an active plane; never hidden.
- `gate_observability_contribution_class_counts_bucketed` — contributions broken down by `class_declared` (fact / utterance / non_factual); classes with zero contributions render as `<MarkedOpenSlot>` — not `0` (per FB-13 unset-vs-empty discipline).

**Registry module (Estate Map):**
- `gate_registry_measured_vs_unmeasured_first_class` — measured dimensions render lit; unmeasured render hatched-sage via `<DormantCapabilityChip>` or `<MarkedOpenSlot>`; **never zero** for an unmeasured dimension (Owner Ruling · declaration-baseline-only state).
- `gate_registry_figures_carry_method` — every figure carries a method chip ("declaration-baseline" · "measured-census" · "inference-overlay-DORMANT"). No figure renders without a method marker.
- `gate_registry_inference_overlay_dormant` — the inference overlay surface renders as a distinct dormant capability marker (never fake numbers, never presented as live).
- `gate_registry_coverage_gap_paired_with_action` — every coverage gap on the map is paired with an action affordance ("propose census" — routes to the appropriate operator wizard door).

## §4. FPR rows identified (AC-3)

Twelve new promise rows required (post-v1 supplement v0.8):

| function_id | governor | promise |
|---|---|---|
| akki.frontend.memory_home_lists_scoped_planes | Named surfaces (Memory · frontend) | Renders the plane list for the caller's key-scope; server-side scope enforcement already lives in /api/memory/planes. Frontend passes tokens; never invents scope. |
| akki.frontend.memory_plane_detail_five_ring_visible | Named surfaces (Memory · frontend) | Each contribution row surfaces class_declared + rights_class + intended_scope + cited_source_count with class-with-claim discipline. |
| akki.frontend.memory_publication_slot_unset_governed_refusal | Named surfaces (Memory · frontend) | Attempting publication on a plane whose PUBLICATION_QUALITY_THRESHOLD [SLOT] is unset renders the fail-loud governed refusal (Ruling 4 verbatim action triplet). |
| akki.frontend.memory_revoked_plane_frozen_state_honestly_rendered | Named surfaces (Memory · frontend) | Revoked plane shows a distinct frozen chip; contribute/publish CTAs are removed (not just disabled). Ruling 4 "Frozen is immutable." rendered. |
| akki.frontend.memory_scoped_cross_key_denied_via_ui | Named surfaces (Memory · frontend) | An engineer-key holder navigating to a plane owned by another key triggers a 403 that renders via AccessControlDeniedPanel (never governed-refusal). |
| akki.frontend.plane_observability_panel_reads_reconstructor | Named surfaces (Memory · observability) | Panel reads the new aggregator endpoint only; the endpoint reads Northena ledger rows only. No new frozen contract. |
| akki.backend.memory_plane_observability_aggregator_endpoint | Named surfaces (Memory · observability) | GET /api/memory/planes/{plane_id}/observability — read-only aggregator: contribution counts by class + publication rate + revocation history. Uses the same scope check as the plane_detail endpoint (auth_scope_insufficient for cross-key). |
| akki.frontend.registry_estate_map_measured_vs_unmeasured_first_class | Named surfaces (Registry · frontend) | Estate map renders every dimension either lit (measured) or hatched (unmeasured). Never zero for unmeasured. |
| akki.frontend.registry_figures_carry_method | Named surfaces (Registry · frontend) | Every figure on the estate map carries a method chip. Declaration-baseline vs measured-census vs inference-overlay-DORMANT — all rendered per Ruling 1 four designed states discipline. |
| akki.frontend.registry_inference_overlay_dormant | Named surfaces (Registry · frontend) | Inference overlay surface renders as a dormant capability with the sage hatched treatment; never fake numbers. |
| akki.frontend.registry_coverage_gap_paired_with_action | Named surfaces (Registry · frontend) | Every gap on the map is paired with an action affordance (propose census → operator wizard door). Gap never renders without an action. |
| akki.backend.memory_observability_scope_enforced | Named surfaces (Memory · observability) | The aggregator endpoint enforces scope with the same discipline as GET /api/memory/planes/{id}: engineer-key holders can only observe their own; admin full-scope. Governed refusal on cross-key attempt. |

## §5. Backend permitted addition (thin aggregator · Owner directive)

**Endpoint:** `GET /api/memory/planes/{plane_id}/observability`

**Purpose:** returns the read-only aggregate for the observability panel.

**Response shape (NOT a frozen contract — untyped aggregate JSON):**
```json
{
  "plane_id": "...",
  "state": "active" | "revoked",
  "issued_at": "...",
  "revoked_at": null | "...",
  "revoked_by": null | "...",
  "revocation_reason": null | "...",
  "contribution_class_counts": {
    "fact": 0 | int,
    "utterance": 0 | int,
    "non_factual": 0 | int
  },
  "contribution_counts": {"landed": int, "refused": int},
  "publication_counts": {"attempted": int, "landed": int, "refused": int},
  "publication_acceptance_rate": null | float,  // null when attempts == 0
  "revocation_history": [{"revoked_by": ..., "revoked_at": ..., "reason": ...}]
}
```

**Implementation:** extends `services/memory/ledger_reconstructor.py` OR adds a sibling `services/memory/observability.py` — reads Northena ledger rows filtered by `stamp_audit.plane_id`; buckets contribution rows by `stamp_audit.class_declared`.

**Scope enforcement:** identical to `GET /api/memory/planes/{plane_id}` — admin full-scope; engineer-key holder same-key only. 403 `auth_scope_insufficient` on cross-key (no outcome key).

**No new frozen contract.** If the shape crosses an environment boundary in a later sub-cycle (e.g., a external observability dashboard consumer), D4b may FREEZE it then — not now.

## §6. Design-law bindings (unchanged — bind every screen)

- No build state on any surface.
- Class-with-claim in headline position.
- Refusal rendering in the answer position.
- Four response classes never conflated.
- Agent-assumed marking.
- One trace thread (`trace_id` in audit rail per Northena N-INV).
- Plain language.
- Akki v4 palette + Georgia serif wordmark + Helvetica labels.
- Ratified binding copy VERBATIM (Ruling 4).
- Suspended copy slots rendered marked-open (Ruling 4).

## §7. Build sequencing (this sub-cycle only)

1. Rulings + Stage A landed. ✓ AC-1 + AC-2.
2. Backend: thin observability aggregator endpoint.
3. Frontend: 4 new screens.
4. Backend gate cells for observability endpoint + scope.
5. Frontend Jest gate cells for design-law compliance + measured-vs-unmeasured discipline.
6. FPR supplement v0.8 + regenerate machine YAML.
7. Full backend + frontend suites green; testing agent (frontend + backend) verdict.
8. Close report + journal + PRD update.

## §8. Out-of-scope for this sub-cycle (per Owner rulings still binding)

- Grants-revision JWT claim optimization (Ruling 3 · PARKED).
- Data Engineer role mandate (Ruling 5 · defaults to Master Admin alias).
- B1 GPU spend ceiling (Ruling 6 · awaiting Owner figure).
- Wizard draft-persistence improvement (Owner: "not ruled in — do not build it").
- Publication ceremony live-writable action (SLOT is unset by design; fail-loud refusal IS the sub-cycle 2 rendering).
- Govern module (sub-cycle 3).
- Prove + Team module (sub-cycle 4).

═══════════════════════════════════════════════════════════════════

*Stage A proposal — design-only. Ready to build. Cleared to proceed by Owner sub-cycle-2 dispatch 2026-08-02.*
