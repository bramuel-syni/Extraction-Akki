# P2 Stage A — V1 Extraction to Real Material

**Phase:** P2 (dispatch §4). 
**Stage:** A (design-only, zero code writes). 
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §4; **consumes** BCR v1.5 §3.1 (wire shapes), §3.3 (BM-V), §3.4 (production packaging), §12 (buyer-cut governance), §1.5 HS3 (production rule), §1.6 (placement rule) rather than re-authoring them. 
**Placement rule (BCR §1.6):** 
 (1) *Which vertical does it serve?* — V1 (QUALIFY) directly; V2 (ANSWER) and V3 (SELL) via downstream consumption of qualified units. 
 (2) *Which horizontals does it ride?* — H1 (Governance — admission, gates, refusal taxonomy for job seam), H2 (Record — stamp_audit sidecar telemetry, ledger row per job), H3 (Identity — worker credential class), H4 (Economics — telemetry sidecar for BM-C tuning), H5 (Contracts — PerceptionJob_v0, PerceptionResult_v0 frozen). 
 (3) *Where does its data gravity put it?* — mixed: **worker/GPU zone** (perception execution + raw AV transient) and **control plane** (dispatcher, intake validator, ledger, telemetry). Data plane (database + artifact store) MUST be production-grade before this phase's Stage B executes (HS3). 
**Date drafted:** 2026-07-30. 
**Approval condition to move to Stage B (code work):** Owner sign-off AND — for Stage B's GPU half AND for BM-V — the OT-1 [OWNER] facts landing (topology fork + archive access path + Hour A + 300-unit human-qualified slice). Stage A (design + stub-first substrate) is dispatchable on this document alone (dispatch §4 P2-R1).

---

## §1 What this phase does, in one sentence

Extracts one real broadcast hour and one real CMS batch to qualified units under the frozen `PerceptionJob_v0` / `PerceptionResult_v0` wire shapes, runs BM-V (validation-in-phase) on a human-qualified 300-unit slice with class_distribution_delta and PASS/INVESTIGATE verdict, and opens the V1 V-gate off `PENDING_REAL_MATERIAL` on BM-V PASS — with production packaging (PH-R1/R2) landed **before** the first real hour is mined per HS3.

## §2 Requirements from the dispatch (verbatim, with Stage A design response per requirement)

### P2-R1 — Phase 9 Stage A dispatches on BCR §3.1; consume rather than re-author

**Dispatch statement:** *"Phase 9 Stage A (design-only, zero code writes) dispatches immediately on BCR §3.1 — it is dispatchable on that document alone. The builder MUST consume BCR §3.1's wire shapes (PerceptionJob_v0, PerceptionResult_v0), the two worker endpoints, and gates V1-G1..G7 rather than re-authoring them. Freeze-or-not for both contracts argued on the D4b axes at Stage A (they cross an environment boundary; the prior is freeze)."*

**Design response:**

1. **Wire shapes consumed verbatim from BCR §3.1** (see `docs/mandates/RMS_Build_Completion_Requirements_v1_5.md` lines 79–106):

   **PerceptionJob_v0** (control plane → worker):
   ```
   job_id: str                       required · server-minted, unique
   objective_ref: str                required
   trace_lineage: str                required · carried, never minted worker-side
   reextraction_handles: List[str]   required · min 1 · pointers into RMS estate
   modality: Literal[AUDIO, VIDEO]   required · TEXT never routes to GPU
   extraction_params_ref: str        required · frozen contract surface
   idempotency_key: str              required · same key → same job, never a second
   issued_at: str                    required · ISO-8601 UTC
   ```

   **PerceptionResult_v0** (worker → control plane):
   ```
   job_id: str                                   required
   units: List[NormalizedUnit]                   required · may be empty on failure · intake-validated
   telemetry: {gpu_hours: float, broadcast_hours: float,
               unit_yield: int, per_modality: {...}}     required
   checkpoint: {last_completed_offset_s: int,
                completed_unit_ids: List[str]}           required
   purge_attestation: {purged: bool, purged_at: str}     required
   status: Literal[complete, partial_failed]             required
   ```

2. **Worker endpoints (consumed verbatim from BCR §3.1):**
   - `POST /api/workers/jobs/claim {worker_id, capabilities}` → `200 PerceptionJob | 204 no work`
   - `POST /api/workers/jobs/{job_id}/result {PerceptionResult}` → `202` (idempotent on `(job_id, checkpoint)`)

   The two endpoints are already in the router surface (`/app/backend/routers/workers.py`, verified 2026-07-30 against `/api/openapi.json`) but with placeholder shapes. P2 replaces the placeholder shapes with the frozen `PerceptionJob_v0` and `PerceptionResult_v0` contracts.

3. **Gates V1-G1..V1-G7 consumed verbatim from BCR §3.1:**
   - **V1-G1** `test_stub_worker_e2e` — job → units → database, green before any GPU code merges.
   - **V1-G2** `test_job_kill_and_restart_resumes_without_duplicate_ledger_rows` — recovery pattern across the job seam.
   - **V1-G3** `test_raw_purge_attested_per_job`.
   - **V1-G4** `test_intake_rejects_invalid_units`.
   - **V1-G5** `test_worker_code_never_writes_ledger` (AST; [STAKED] under CC-4 until Owner ratifies HS2).
   - **V1-G6** `test_telemetry_fields_present_per_job`.
   - **V1-G7** byte-identity across all prior frozen contracts.

### Freeze-or-not argument (D4b axes)

D4b axes for freeze-or-not, applied to both contracts:

| Axis | PerceptionJob_v0 | PerceptionResult_v0 |
| --- | --- | --- |
| **Crosses environment boundary?** | YES (control plane → GPU/worker zone — BCR §4 housing map). | YES (GPU/worker → control plane). |
| **Cross-language consumer likely?** | YES (worker MAY be Python today; MAY be another language on GPU cloud). | YES (same reason). |
| **Additive path exists for changes?** | YES (BCR standard: additive version bump; parity slot preserved). | YES. |
| **Rate of expected change?** | LOW (wire shape is minimal; extractions params rides its own contract). | LOW–MEDIUM (units list is heavy but the ring shapes ride NormalizedUnit's own frozen contract). |
| **Prior per D4b?** | **FREEZE** (environment-crossing with LOW change rate; the dispatch explicitly names FREEZE as the prior). | **FREEZE** (same). |

**Recommendation to Owner:** freeze both, parity moves 31 → 33. Snapshots land at `backend/tests/invariants/perception_job_v1.contract_snapshot.json` and `backend/tests/invariants/perception_result_v1.contract_snapshot.json` (or `_v0` if the Owner prefers the seat name). The existing `perception_job_v0.contract_snapshot.json` and `perception_result_v0.contract_snapshot.json` (already on disk from earlier Phase 9 sub-stages 9.1/9.2a work) may become the frozen v0 seats if their content matches the BCR-specified shapes byte-identically; a diff pass at Stage B start decides. If they diverge, they either (a) become the frozen v0 with a bless, or (b) get a v1 bump per BCR H5 additive doctrine.

---

### P2-R2 — Production packaging as Phase 2 dependency (HS3)

**Dispatch statement:** *"Production packaging (BCR 3.4 PH-R1/PH-R2) is a Phase 2 dependency: HS3 binds — the data plane goes production-grade **before** the first real hour is mined. Destination-agnostic packaging is dispatchable now."*

**Design response:**

1. **PH-R1 (packaging, destination-agnostic).** Dispatchable now, in parallel with the P2 Stage B stub-first substrate. Deliverables per BCR §3.4:
   - Containerize from repository (the Dockerfile already lands the multi-stage pattern; verify parity with BCR §3.4 verbatim).
   - Externalize all secrets from `.env` to a vault-class store (env-contract table at BCR §3.4 line 168–175).
   - Healthchecks: `/api/healthz` (liveness, no auth, no DB touch) + `/api/readyz` (readiness, DB ping + frozen-contract parity count) — both already exist per `/api/openapi.json` verification.
   - Split frontend build from backend serve (already present per multi-stage Dockerfile).
   - Database address stays env-driven (already true per `services/core.py` reading `MONGO_URL` from env).
   - LLM swap seam contained in the single router module + documented (already present at `services/synisense/shield/llm_router.py`).
2. **PH-R2 (data plane).** Managed, replicated database with backup + append-only ledger archival; artifact store (3.2) provisioned beside it. Per HS3, PH-R2 MUST precede the first real mined hour. In practice: PH-R2 is an [OWNER]-supplied infrastructure decision (destination + provider), so this proposal specifies the **acceptance shape** but not the provider. Acceptance shape:
   - MongoDB replica set (min 3 nodes) with automated backup at documented cadence (SLA [SLOT]).
   - Append-only ledger collection with archival write to object store on rotation window (window [SLOT]).
   - Artifact store per BCR §3.2 (already built — verify parity).
   - `test_readyz_verifies_replica_set_status` — `/api/readyz` under `production` mode reports replica-set health.

**PH-R1 dispatchability:** now, alongside P2 Stage A. No [OWNER] facts required.

**PH-R2 dispatchability:** on OT-3 admin facts (production destination + object-store choice + domain + TLS).

---

### P2-R3 — Stage B (GPU half) and BM-V execute when [OWNER] facts land

**Dispatch statement:** *"Stage B (GPU half) and BM-V execute when the [OWNER] facts land (§5). BM-V runs **inside** Phase 2 on one real hour with its human-qualified sample; output is class_distribution_delta with PASS/INVESTIGATE at close. Deferring BM-V past this phase is prohibited (BM-V2)."*

**Design response:**

1. **[OWNER] gate items (dispatch §5 OT-1 and OT-2):**
   - **OT-1 Early (facts):** archive access path + GPU placement (Topology A vs B) + HS2 ratification (CC-4).
   - **OT-2 In-phase:** Hour A + 300-unit human-qualified slice — needed during GPU work, not before.
2. **BM-V execution shape (per BCR §3.3 BM-V1/BM-V2):**
   - Input: **one real broadcast hour** [OWNER] + a 300-unit human-qualified slice **uncurated, SR-2** (verdicts are never curated; the slice is drawn from measured composition per BCR).
   - Process: run the perception stack over the hour; qualified units land in the database.
   - Output artefact: `benchmark_results.v0.json` per BCR §3.3 line 154–158 shape, with:
     - `class_distribution_delta` = per-class |machine% - human%| over the reference slice; report max, mean.
     - `provisional: true` until cumulative measured hours reach [OWNER: threshold] (BM-C2 anchoring guard).
     - PASS / INVESTIGATE verdict at Phase 2 close.
   - **SR-2 enforcement:** the slice is drawn by a deterministic sampler (`services/benchmark/slice_sampler.py` — to be built) from the actual class distribution of the hour's units, not by human selection. The gate `test_bm_v_slice_uncurated` asserts the sampler's determinism and its class-proportional stratification.
3. **BM-V2 prohibition enforced:** the phase's close report cannot be written without BM-V's PASS/INVESTIGATE verdict recorded. A CI cell (`test_p2_close_requires_bm_v_verdict`) reads the close-report front-matter and fails the phase-close if the BM-V verdict is absent.

---

### P2-R4 — Stub-first (V1-B3, V1-G1); never-rules mechanical (V1-H2, V1-G5)

**Dispatch statement:** *"Stub-first holds: every guard gate proves against the deterministic stub worker before GPU code merges (V1-B3, V1-G1). Never-rules enforced mechanically (V1-H2, V1-G5), subject to CC-4's ratification."*

**Design response:**

1. **Stub-first sequencing.** Sub-stage 9.1 (stub substrate) already landed 2026-07-08 per BUILD_JOURNAL. Sub-stage 9.2a (real-perception ASR + VAD via faster-whisper + Silero) landed 2026-07-10. P2 Stage B extends what's there:
   - Verify V1-G1 (`test_stub_worker_e2e`) green against the current stub before any Stage B code merges.
   - Add V1-G2..V1-G7 to CI before Stage B code merges.
   - GPU-execution seam (`services/perception/gpu_execution/`) opens with `PERCEPTION_EXECUTION_MODE=gpu` env var; without it, stubs continue to serve.
2. **Never-rules mechanically enforced:**
   - V1-H2 (grep/AST gates: no ledger-write call sites and no transform-key access in worker code): the AST walker from P1-R2 is extended to include `services/perception/workers/` under its scan set. Any `import services.northena.ledger.write` (or aliases) or any access to `services.auth.identity` from within a worker module fails the gate.
   - V1-G5 (`test_worker_code_never_writes_ledger`, AST): [STAKED] per CC-4 until Owner ratifies HS2; annotation `stake_status: STAKED_HS2` carried on the FPR row per `docs/rulings/hs2_never_rules_staked_annotation_2026-07-30.md`.
3. **Sub-stage 9.3 (Extraction Console + SM-E extraction sample)** already landed 2026-07-08. P2 verifies the console renders BM-V outputs correctly (grounding marker: *"Grounded by sample {sample_ref}"*).

---

### P2-R5 — V-gate opening ceremony on BM-V PASS

**Dispatch statement:** *"On BM-V PASS, the V1 harness verdict moves off PENDING_REAL_MATERIAL through its own gate ceremony, recorded. Appendix A gains one sentence stating the pre-ceremony state plainly (present; exercised on synthetic fixture only; verdict pending by construction) — and its removal is the close artefact everyone is working toward."*

**Design response:**

1. **V-gate ceremony steps:**
   1. BM-V execution produces `benchmark_results.v0.json` with `class_distribution_delta` figures and human-verdict = PASS.
   2. `services/health/parity_counter.py` V1-G7 verifies frozen-contract byte-identity is unaffected.
   3. `/api/system/state` moves `v1_status` from `PENDING_REAL_MATERIAL` to `MATERIAL_ACCEPTED` (or a name Owner rules).
   4. Appendix A pre-ceremony sentence is **struck** (in the pack, via an amendment note per the pack's amendment pattern).
   5. Ceremony is recorded in a dated `docs/rulings/v1_gate_open_ceremony_<date>.md`.
2. **Pre-ceremony sentence (design proposal for Appendix A):** *"V1 is present, exercised on synthetic-plumbing-adversarial fixture only; its verdict is PENDING_REAL_MATERIAL by construction — removed when BM-V PASSes on one real broadcast hour with a human-qualified slice per BCR §3.3."* Owner rules the exact wording; the design provides a candidate.
3. **The removal of that sentence is the close artefact.** V-gate opening is Phase 2's terminal artefact; the docs delta is atomic with the state-machine transition and BM-V PASS.

---

## §3 Gate roster — consolidated

Inherited from BCR §3.1 (V1-G1..V1-G7 = 7 gates) plus P2-added gates:

| Gate ID | Test | Origin | Status |
| --- | --- | --- | --- |
| **V1-G1** | `test_stub_worker_e2e` | BCR §3.1 | Already green (sub-stage 9.1) |
| **V1-G2** | `test_job_kill_and_restart_resumes_without_duplicate_ledger_rows` | BCR §3.1 | New (P2) |
| **V1-G3** | `test_raw_purge_attested_per_job` | BCR §3.1 | New (P2) |
| **V1-G4** | `test_intake_rejects_invalid_units` | BCR §3.1 | Partial (intake validator exists; extend per new contract) |
| **V1-G5** | `test_worker_code_never_writes_ledger` | BCR §3.1 | [STAKED] per CC-4 |
| **V1-G6** | `test_telemetry_fields_present_per_job` | BCR §3.1 | New (P2) |
| **V1-G7** | `test_byte_identity_across_frozen_contracts` | BCR §3.1 | Already green (parity harness) |
| **P2-G-R2.a** | `test_readyz_verifies_replica_set_status` | This proposal (P2-R2) | New (Stage B post-PH-R2) |
| **P2-G-R2.b** | `test_ledger_archival_rotation_writes_object_store` | This proposal (P2-R2) | New (Stage B post-PH-R2) |
| **P2-G-R3.a** | `test_bm_v_slice_uncurated` | SR-2 enforcement (this proposal) | New (Stage B) |
| **P2-G-R3.b** | `test_bm_v_class_distribution_delta_computable` | BCR §3.3 (this proposal) | New (Stage B) |
| **P2-G-R3.c** | `test_bm_v_verdict_recorded_at_phase_close` | BM-V2 enforcement (this proposal) | New (Stage B) |
| **P2-G-R3.d** | `test_p2_close_requires_bm_v_verdict` | BM-V2 enforcement (this proposal) | New (Stage B) |
| **P2-G-R3.e** | `test_benchmark_provisional_true_until_threshold` | BM-C2 anchoring guard (this proposal) | New (Stage B) |
| **P2-G-R4.a** | `test_worker_code_no_transform_key_import` | V1-H2 mechanical (this proposal) | New (Stage B) |
| **P2-G-R4.b** | `test_gpu_execution_mode_gates_gpu_code_import` | Stub-first sequencing (this proposal) | New (Stage B) |
| **P2-G-R5.a** | `test_v1_gate_ceremony_transitions_status` | V-gate ceremony (this proposal) | New (Stage B) |
| **P2-G-R5.b** | `test_appendix_a_pre_ceremony_sentence_removed_at_close` | V-gate ceremony (this proposal) | New (Stage B) |

**Total P2 gates: 17** (7 from BCR §3.1 + 10 added by this proposal).

## §4 Function-Promise Registry rows to REGISTER BEFORE landing (AC-3)

Enumeration (13 rows staged; exact 11-field content held pending CC-2):

1. `perception.job_dispatcher.claim_job`
2. `perception.job_dispatcher.post_result`
3. `perception.intake_validator.validate_normalized_unit`
4. `perception.checkpoint_resumer.resume_from_last_offset`
5. `perception.raw_purge_attester.attest_and_record`
6. `perception.telemetry_sidecar.write_stamp_audit`
7. `benchmark.slice_sampler.stratified_deterministic`
8. `benchmark.class_distribution_delta_computer`
9. `benchmark.verdict_recorder.pass_or_investigate`
10. `benchmark.provisional_flag_guard`
11. `perception.gpu_execution_seam.mode_gate`
12. `v1_gate.ceremony_state_transition`
13. `v1_gate.appendix_a_sentence_strike_at_close`

Staged in a `p2_stage_a_fpr_delta.md` supplement, held from the machine-readable YAML until CC-2 closes.

## §5 Freeze-or-not roll-up

| Contract | v0/v1 | Parity slot delta | Snapshot location |
| --- | --- | --- | --- |
| PerceptionJob_v0 | v0 (or bump if drift from existing on-disk snapshot) | 0 (occupies existing seat) or +1 | `backend/tests/invariants/perception_job_v0.contract_snapshot.json` |
| PerceptionResult_v0 | v0 | 0 or +1 | `backend/tests/invariants/perception_result_v0.contract_snapshot.json` |
| Benchmark output shape | new frozen? | Recommended: **NOT frozen** (illustrative shape, driven by BM-C rate-of-change) — kept as a versioned config `benchmark_results.v{N}.json` per BCR §3.3. | n/a |

Net parity count movement: +0..+2 depending on drift check at Stage B start. Trust receipt bump from P1 (`+1`) is counted in P1, not double-counted here.

## §6 Sequencing and dependencies

**Dispatchable NOW (Stage A already):**
- This proposal.
- PH-R1 packaging (destination-agnostic).
- Stub-first substrate extensions (V1-G2..V1-G7 CI cells against stubs).

**Depends on OT-1 [OWNER] facts:**
- Stage B GPU half (topology + archive access + HS2 ratification).
- BM-V execution (Hour A + 300-unit human-qualified slice).

**Depends on OT-3 [OWNER] admin facts:**
- PH-R2 (production destination, object-store choice, domain, TLS).

**Blocks:**
- No consumer of qualified units (memory, further transform forms, further compliance surfaces) is built further against fixture-only substrate where avoidable (dispatch §4 preamble). Consumer work may proceed only where its plane mechanics depend on the unit *contract*, not on real-material content — dispatch §6 explicitly names Memory Service as legitimate parallel work.

## §7 Refusal taxonomy discipline (Owner E2 non-negotiable)

P2 introduces failure paths at the job seam:
- `partial_failed` PerceptionResult status → recorded in stamp_audit, ledger row emitted with `decision: partial_failed`. Not a governed refusal. Not access-control class.
- Worker credential missing / scope insufficient → access-control class (`{reason, detail}`, HTTP 403). Never `outcome=refused`.
- Intake validator rejects unit → access-control class at the endpoint boundary; the intake failure is a **build failure of the perception stack**, not a governed refusal.
- BM-V INVESTIGATE verdict → the phase does not close as PASS; the verdict is recorded as an evidence row; no refusal is emitted.

No new refusal reason codes are added to governed refusal taxonomies. P2 is entirely orthogonal to the refusal grammar.

## §8 The three questions restated for the record (BCR §1.6 placement rule)

1. **Which vertical does it serve?** V1 QUALIFY, primarily. V2/V3 secondarily (they consume V1's output).
2. **Which horizontals does it ride?** H1 (governance rail: admission at intake; refusal taxonomy separation; stamp_audit sidecar), H2 (record: ledger rows per job; append-only), H3 (identity: worker credential class; server-side scope enforcement), H4 (economics: telemetry sidecar; BM-C tuning inputs), H5 (contracts: PerceptionJob_v0, PerceptionResult_v0 frozen per D4b prior).
3. **Where does its data gravity put it?** Split: worker/GPU zone for perception execution (transient raw AV); control plane for dispatch, intake, ledger, telemetry, and BM-V verdict recording. HS3 binds: data plane goes production before first real hour.

— End of P2 Stage A proposal. **Status: DRAFT · awaiting Owner approval; Stage B GPU/BM-V portions additionally blocked on OT-1 + OT-2 [OWNER] items.** —
