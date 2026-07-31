# Memory Service — Stage A Proposal

**Phase:** Memory (Owner ruling option (b), 2026-07-30 cycle 3 — `docs/rulings/memory_service_option_b_owner_ruling_2026-07-30_cycle3.md`).
**Stage:** A (design). Owner pre-approves proceeding directly to Stage B (code) once Stage A is on disk.
**Authority carrying the mechanics:** Integration Orchestration Brief Part IV (canonical at `docs/mandates/akki_os_pack_v1/AkkiOS_Integration_Orchestration_Brief_v1.0.md`). Consumed, not re-authored.
**Scope:** backend only. No surfaces. Surfaces enter Phase 3.
**Date drafted:** 2026-07-30 (cycle 3).

---

## §1 One sentence

Every integration key ships with exactly one PLANE (retrieval scope + contribution store + working set). Plane isolation is by construction (scoped-accessor pattern; cross-plane reads inexpressible). Two memories separated by provenance at WRITE time (estate memory = Registry, shared across keys; mind context = plane-local, never crosses keys). Contributions land in five-ring shape, class-capped at cited-source support, internal-only rights at birth, plane-local by default. Publication (plane-local → Registry-visible) is a SEPARATE governed act, never automatic. Revocation freezes immediately. Plane state is ledger-reconstructible.

## §2 Placement rule answered (BCR §1.6) — Owner condition (c1)

### Which vertical does it serve?

**V4 (INTEGRATE + LOOP).** Memory is the plane of running applications. It also serves V2 (ANSWER) at the read boundary (answers ride the retrieval scope) and V3 (SELL) at the publication boundary (Registry-visible artifacts become sellable). But its data gravity, its governance boundary, and its operational model live in V4.

### Which horizontals does it ride?

- **H1 (Governance).** Every seam call is a governed decision surface: admission at write, publication as ceremony, revocation as ledger event. Refusal taxonomy versioned (`memory_refusal_reasons.v0.json`) with the correct governed-refusal shape — never confused with auth denial.
- **H2 (Record).** Every write-back, every publication, every revocation writes an append-only ledger row. Plane state is reconstructible from the ledger.
- **H3 (Identity).** Integration key = plane's identity. Server-side scope enforcement on every call. Engineer-key machinery (already built) is the natural issuer.
- **H4 (Economics).** Working-set persistence is usage-proportional; storage cost is measured, not committed to in advance.
- **H5 (Contracts).** Two new frozen contracts: `memory_plane_v0` (plane envelope) and `memory_write_back_v0` (contribution shape). Both freeze under D4b prior (see §3).

### Where does its data gravity put it?

**Control plane** for the plane registry, scoped accessor, publication ledger, revocation state — the identity + governance surface. **Data plane** for the working set + contribution store (references, not copies; carrier is the artifact store from BCR §3.2). No perception / GPU exposure. Compatible with PH-R1 (already landed) + PH-R2 (awaiting OT-3).

## §3 Write-back contract — freeze-or-not on D4b (Owner condition (c2))

**D4b freeze prior:** FREEZE (per Owner ruling verbatim).

| Axis | `memory_write_back_v0` value | `memory_plane_v0` value |
| --- | --- | --- |
| **Crosses environment boundary?** | YES (application → platform seam — the write-back is the memory's inbound edge). | YES (integration key holder → platform — identity crosses process boundary). |
| **Cross-language consumer likely?** | YES (memory-writing applications are Python + potentially other languages). | YES (same). |
| **Additive path exists for changes?** | YES (per-sibling versioning, standard BCR pattern). | YES. |
| **Rate of expected change?** | LOW (write-back shape is the five-ring shape from `contracts/five_rings.py` + governance envelope; both are already stable). | LOW (plane envelope is minimal). |
| **Prior per D4b?** | **FREEZE** (environment-crossing + LOW rate + cross-language likely). | **FREEZE** (same). |

**Recommendation:** freeze both. Parity moves 32 → 34 via **two seal events** (one per sibling). Snapshots land at `backend/tests/invariants/memory_plane_v0.contract_snapshot.json` and `backend/tests/invariants/memory_write_back_v0.contract_snapshot.json`.

## §4 Plane-isolation gates — BREAK-IN style (Owner condition (c3))

Owner ruling verbatim: *"plane-isolation gates are BREAK-IN style — the scoped accessor ATTEMPTS the cross-plane read and must fail to reach it (asserting schema shape is insufficient, §33C)."*

### Break-in gate roster

| Gate | Test | Break-in shape |
| --- | --- | --- |
| **M-G1** | `test_scoped_accessor_cannot_read_across_planes_by_direct_call` | Plane A's accessor is instantiated with `plane_id=A`; the test calls `accessor.get(key)` where `key` was written into plane B. Must return None / raise; NEVER return B's content. |
| **M-G2** | `test_scoped_accessor_cannot_bypass_via_kwarg_override` | Break-in: attempt `accessor.get(key, plane_id_override='B')` or `accessor._plane_id = 'B'` before call. The API must not admit override; the private attribute must not be settable through the seam. |
| **M-G3** | `test_write_back_write_to_plane_A_isolated_from_plane_B_reads` | Sequence: write contribution X to plane A; open plane B's accessor; attempt to enumerate B's contribution store; X must not appear. |
| **M-G4** | `test_mind_context_never_crosses_keys` | Break-in: write to plane A's mind-context (plane-local); attempt to read from plane B's mind-context by any path (accessor, direct Mongo, publication). B must NOT see A's mind-context content. |
| **M-G5** | `test_estate_memory_shared_across_keys` (positive control) | Estate memory (Registry) is SHARED by design; write to Registry from plane A; plane B's accessor DOES see it. Positive-control test ensuring the isolation gates are not overapplied. |
| **M-G6** | `test_publication_is_separate_governed_act` | Contribution to plane A does NOT automatically appear in Registry; only after `publish()` (which passes quality + rights checks) does the artifact become Registry-visible. |
| **M-G7** | `test_revocation_freezes_plane_immediately` | Revoke plane A; subsequent reads from plane A raise `PlaneRevoked` (governed refusal); no in-flight write can land. |
| **M-G8** | `test_plane_state_ledger_reconstructible` | Write contributions, publish some, revoke. Delete the plane registry entry. Rebuild plane state from ledger records only; state matches. |
| **M-G9** | `test_memory_refusal_shape_governed_never_auth` | Any memory refusal (`plane_revoked`, `plane_not_found`, `contribution_over_class_cap`, `publication_gate_denied`) carries `{outcome: refused, reason, detail}` — NEVER the auth `{reason, detail}` shape. Owner E2 non-negotiable. |

**Total: 9 break-in-style gates.** Every gate ATTEMPTS the violation (per §33C); schema shape assertion is insufficient.

## §5 Constants as `[SLOT]`s (Owner condition on constants)

Eviction / persistence constants land as `[SLOT]`s in `backend/services/memory/constants.py`:

| Constant | `[SLOT]` value at ship | Meaning | Benchmark-stamp path |
| --- | --- | --- | --- |
| `WORKING_SET_MAX_REFS_PER_PLANE` | `[SLOT: 10_000]` | Cap on working-set reference count per plane before eviction of least-recently-touched | Sampling & Reflection at real usage |
| `WORKING_SET_EVICTION_HALFLIFE_DAYS` | `[SLOT: 30]` | Reference decay half-life (LRU-like, exponential) | Sampling & Reflection |
| `CONTRIBUTION_STORE_RETENTION_DEFAULT_DAYS` | `[SLOT: null]` | Retention default; `null` = indefinite append-only per Governance §28 | DPO ceremony |
| `PUBLICATION_MIN_CITED_SOURCES` | `[SLOT: 1]` | Minimum cited-source count for publication eligibility | Editorial calibration |
| `PUBLICATION_QUALITY_THRESHOLD` | `[SLOT: null]` | Quality gate score for publication; `null` = threshold unset (fails publication attempts loudly per SR-5) | Benchmark-stamped |

All `[SLOT]` values carry the `[SLOT: <default>]` marker in the constants module; no constant is presented as measured.

## §6 API surface (backend only)

Under `/api/memory/*` (OpenAPI visible; exercised by engineer-key credentials).

| Method + Path | Purpose | Refusal shapes |
| --- | --- | --- |
| `POST /api/memory/planes` | Issue new plane bound to an integration key | `plane_key_missing`, `plane_scope_invalid` (governed refusal) |
| `GET /api/memory/planes/{plane_id}` | Read plane state | `plane_not_found` (governed), `auth_scope_insufficient` (auth denial) |
| `POST /api/memory/planes/{plane_id}/contribute` | Write-back a contribution (five-ring shape) | `contribution_over_class_cap`, `contribution_rights_forbid`, `plane_revoked` |
| `POST /api/memory/planes/{plane_id}/publish` | Governed publication act (plane-local → Registry-visible) | `publication_gate_denied`, `publication_quality_threshold_unset` |
| `POST /api/memory/planes/{plane_id}/revoke` | Freeze plane immediately | `plane_already_revoked` |
| `GET /api/memory/planes/{plane_id}/working_set` | Read the plane's working set (references, not copies) | `plane_revoked` |
| `GET /api/memory/planes/{plane_id}/retrieval_scope` | Read the retrieval scope | `plane_revoked` |

**Auth model:** every route requires a valid engineer-key JWT scoped to the plane's integration key. Scope mismatch → `auth_scope_insufficient` (401/403; auth taxonomy, not governed refusal).

## §7 Two memories — estate vs mind context

Provenance-based split at WRITE time (per Integration Brief §22 verbatim):

- **Estate memory** (Registry): shared across keys; write requires publication act; carriers = Mtafiti registry records via existing infrastructure.
- **Mind context** (plane-local): never crosses keys; write is the write-back contribution; scoped-accessor prevents cross-key reads by construction.

Decision at WRITE time: the contribution carries `intended_scope: {registry_publication | mind_context_only}`. Plane-local is the DEFAULT; registry_publication triggers the separate publication ceremony (never automatic).

## §8 Ledger reconstructibility

Every plane state transition writes a ledger row via `northena.ledger.emit_ledger_row`:

- `plane_issued` — plane binding to integration key
- `contribution_landed` — write-back accepted
- `contribution_refused` — write-back rejected with reason
- `publication_attempted` / `publication_landed` / `publication_refused` — publication ceremony steps
- `plane_revoked` — revocation event

Reconstruction: given a plane's ledger records in order, replaying them produces the current plane state. Gate M-G8 exercises this.

## §9 Frozen contracts (D4b freeze applied)

- **`memory_plane_v0.py`** — 32-line minimal envelope: plane_id · issued_to_integration_key · retrieval_scope · contribution_store_ref · working_set_ref · state · issued_at · revoked_at (optional).
- **`memory_write_back_v0.py`** — write-back contribution envelope: contribution_id · plane_id · content_ref · five_ring_stamp · class_declared · cited_sources · rights_class · intended_scope · created_at.

Both land as new frozen seats. **Parity moves 32 → 34.**

## §10 FPR rows to register (AC-3)

Before each function lands (validator now requires `dependencies` presence per CC-2):

1. `memory.plane_registry.issue_plane`
2. `memory.plane_registry.get_plane`
3. `memory.scoped_accessor.for_plane`
4. `memory.write_back.write_contribution`
5. `memory.write_back.validate_five_ring_shape`
6. `memory.write_back.enforce_class_cap`
7. `memory.publication.attempt_publication`
8. `memory.publication.publication_quality_gate`
9. `memory.publication.publication_rights_gate`
10. `memory.revocation.revoke_plane`
11. `memory.revocation.freeze_check`
12. `memory.working_set.record_use`
13. `memory.working_set.evict_by_halflife`
14. `memory.ledger_reconstructor.rebuild_state`
15. `memory.refusal.build_refusal_response`

Staged in `docs/registry/memory_stage_a_fpr_delta.md` supplement; landed in machine YAML via regenerate after code lands.

## §11 Refusal taxonomy discipline (Owner E2)

New refusal reason codes land in `services/memory/memory_refusal_reasons.v0.json`:

- `plane_revoked` (governed refusal; `outcome=refused`)
- `plane_not_found` (governed refusal; `outcome=refused`)
- `contribution_over_class_cap` (governed refusal)
- `contribution_rights_forbid` (governed refusal)
- `publication_gate_denied` (governed refusal)
- `publication_quality_threshold_unset` (governed refusal; per SR-5 fail-loud)

Auth failures (missing key, wrong scope) use the existing auth-refusal taxonomy at `services/auth/auth_refusal_reasons.v0.json` (never carry `outcome`; Owner E2).

## §12 Close conditions

- All 9 M-G# gates green.
- Parity harness passes at 34 (two seal events; both new contracts snapshot-locked).
- Full existing suite green (no regressions).
- `/api/memory/*` endpoints exercisable via engineer-key credentials; OpenAPI visible.
- FPR rows landed in machine YAML.
- Close report at `docs/close_reports/memory_service_stage_a_and_build.md` with re-measured enforcement-cell count.

**Status: DRAFT · Owner pre-approved code follow-through per option (b) — Stage B begins immediately upon this document reaching disk.**

— End of Memory Service Stage A. —
