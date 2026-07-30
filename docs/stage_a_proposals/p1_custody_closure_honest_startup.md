# P1 Stage A — Custody Closure and Honest Startup

**Phase:** P1 (dispatch §3). 
**Stage:** A (design-only, zero code writes). 
**Authority:** `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §3 and §2 (Canon Corrections 1–3). 
**Placement rule (BCR §1.6):** 
 (1) *Which vertical does it serve?* — all four (V1/V2/V3/V4), because custody is a horizontal rail that every vertical rides. 
 (2) *Which horizontals does it ride?* — H1 (Governance rail: refusal taxonomy and shield chokepoint), H3 (Identity & custody: admin seed + worker credential surface), H5 (Contract discipline: signature-inspection tests preserve frozen behaviour under refactor). 
 (3) *Where does its data gravity put it?* — control plane (Shield boundary + custody map + secrets + startup gates all live in the control plane per BCR §4 housing map). 
**Date drafted:** 2026-07-30. 
**Approval condition to move to Stage B (code work):** Owner sign-off.

---

## §1 What this phase does, in one sentence

Closes the three Canon Corrections against SyniSense (custody override, single-egress guard, de-id language coverage), closes silent-degradation and token-preservation, promotes the startup path from warn-and-continue to hard-fail-in-production, and repairs the .env / admin-seed / mobile / tier_lock hygiene items — all with named acceptance gates and with the corrected custody claims propagated to the pack documents in the same close.

## §2 Requirements from the dispatch (verbatim, with Stage A design response per requirement)

### P1-R1 — De-identification layer 2 populated, layer 3 multilingual, fail-closed on unsupported language

**Dispatch statement:** *"Layer 2: tenant dictionary populated at census (harvestable vocabulary — presenter names, station names, programme titles, advertiser brands — catalogued from the estate). Layer 3: multilingual recognition path lands. Fail-closed rule: unsupported language + empty catalogue → raise, never proceed on structured patterns alone. This is not only a claims bound — the target estate is multilingual and code-switched by definition, so this item blocks the test."*

**Design response:**

1. **Tenant dictionary population at census.** The Mtafiti census pass (`services/mtafiti/census.py`) is extended to emit a **CensusEntityCatalogue** side-artefact per source. Catalogue rows are tuples of (`entity_type: {presenter|station|programme|advertiser|other}`, `surface_form: str`, `variant_forms: List[str]`, `source_ref: str`, `census_ref: str`). Vocabulary comes from the estate itself (call-sign titles, EDL logs, CMS records, programme-guide XML) — not authored.
2. **SyniSense Shield reads the catalogue.** `services/synisense/shield/tenant_entities.py::lookup_in_text` reads the census catalogue instead of returning `[]`. The read is scoped by `tenant_id` per its existing signature; multi-instance isolation is enforced via `services/multi_instance/scoped_accessor.py` (already exists).
3. **Multilingual recognition path.** Layer 3 (`services/synisense/shield/deidentifier.py::_spacy_pass`) adds a language dispatch: `en_core_web_trf` (existing) for English, plus a language identifier (`langid` or `fasttext-langid` — decision at dispatch, argued on the dependency-size axis) and per-language spaCy models for the languages present in the estate. **Language set is [OWNER]-supplied** — the RMS estate's languages must be listed at dispatch; the design does not invent a set. Fallback: for a detected language with no available NER model, layer 3 records the fact in the trust receipt (masking tier: `regex_only_language_unsupported`) and either raises or defers to fail-closed depending on layer 2's catalogue content (see next point).
4. **Fail-closed rule.** `services/synisense/shield/deidentifier.py::deidentify` is amended so the composition of (layer 1 regex hits) ∪ (layer 2 catalogue hits) ∪ (layer 3 NER hits) is evaluated against a **coverage-empty guard**: if layer 2 catalogue is empty AND layer 3's language is unsupported (no spaCy model AND no fallback module) AND the input carries evidence of proper-noun content (heuristic: token classes distributed like a Latin-script name distribution above a `[SLOT]` density threshold), the function **raises** `ServiceUnavailable` with reason `deid_coverage_insufficient_for_language`. The Shield route surfaces this as `503 SERVICE_UNAVAILABLE` per its existing contract — not as a governed refusal (auth taxonomy separation, Owner E2 non-negotiable).
5. **Recall harness per language.** A seeded-recall dataset (per language present in the estate) is populated with hand-labelled entity spans. The harness measures recall at each layer per language and lands the numbers in the CI dashboard. This is `BM-V-parallel` for custody: the numbers **do not gate merge** until the estate's languages are set, but the dataset seat ships with the phase per Quality Rule Book §33A (calibration before commitment).

**Named gates:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R1.a** | `test_deid_fail_closed_on_unsupported_language` | The `deidentify` call raises `ServiceUnavailable` when layer 2 is empty AND layer 3 sees an unsupported language AND the input carries proper-noun evidence above threshold. |
| **P1-G-R1.b** | `test_tenant_catalogue_nonempty_after_census` | After a census pass over any of three seeded-fixture sources (an EDL log, a CMS record slice, a programme-guide snippet), the catalogue read from Mtafiti has non-zero row count for every entity_type. |
| **P1-G-R1.c** | `test_tenant_catalogue_isolation_per_tenant` | Break-in style (SR-4): attempt to read tenant B's catalogue from a call bound to tenant A. Must fail. |
| **P1-G-R1.d** | `test_seeded_recall_per_language_harness_runs` | For every language in the seeded set, the recall harness executes and emits a `recall_report.v0.json`. (Value gates are [OWNER]-thresholded and land in a separate CI cell.) |
| **P1-G-R1.e** | `test_shield_route_503_on_deid_service_unavailable` | End-to-end: Shield route receives an input that triggers the fail-closed path; response is HTTP 503 with body `{reason, detail}` — NEVER `outcome=refused`. |

**New function — Function-Promise Registry rows to register BEFORE landing** (AC-3): `census.emit_tenant_entity_catalogue`, `deidentify.fail_closed_language_guard`, `shield.language_dispatch_router`.

---

### P1-R2 — Single-egress guard promoted from regex to AST + provider-host HTTP + runtime allowlist + named-file exemption

**Design response:**

1. **AST gate.** Replace the regex/pattern scan currently in `tests/invariants/test_no_direct_llm_calls_outside_shield.py` with an **AST-walker** that resolves aliases and indirection. The walker: (a) collects the set of import names bound to `openai`, `anthropic`, `google.generativeai`, `litellm`, `emergentintegrations`, plus any `from X import Y as Z` aliases; (b) walks every `.py` under `/app/backend` (excluding `services/synisense/shield/`) building the call graph; (c) fails on any `Call` whose resolved receiver reaches any provider module through any alias chain; (d) fails on any `Attribute` access chain reaching those modules.
2. **Provider-host HTTP patterns.** The AST walker additionally fails on any outbound HTTP call whose target host resolves to a provider host (`api.openai.com`, `api.anthropic.com`, `generativelanguage.googleapis.com`, plus `litellm`-recognised endpoints). Host detection is a taint-analysis pass over `httpx.Client` / `requests.get` / `aiohttp.ClientSession` call sites: any literal, f-string, or env-var name matching the taint set fails the gate.
3. **Named-file exemption list** (replaces directory exemption). A single `docs/mandates/shield_egress_exemptions.v0.json` file names the exact `.py` files exempted from the gate. Every entry cites the reason. The current directory exemption of `services/synisense/shield/` is replaced by the specific list of files that legitimately call providers: `llm_router.py`, `brief_synthesizer.py`, `fluency_synthesizer.py`, `perception_router.py`. Any file added to this list requires an Owner ruling in `docs/rulings/`.
4. **Runtime egress allowlist.** At process boundary, an **egress-firewall middleware** loads the same allowlist (`shield_egress_exemptions.v0.json` → provider hosts extracted per file) and rejects any outbound HTTP that (a) originates from a call stack lacking `services/synisense/shield/` in its frames OR (b) targets a host outside the allowlist. Implementation seam: `services/synisense/shield/egress_firewall.py` — the Shield owns its own guard by construction.
5. **Break-in tests** (SR-4: attempt the violation).

**Named gates:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R2.a** | `test_ast_egress_gate_catches_raw_http` | A test module attempts `httpx.post("https://api.openai.com/v1/chat/completions", ...)` from `services/experiment/leak.py`. AST gate fails the build. Break-in style. |
| **P1-G-R2.b** | `test_ast_egress_gate_catches_dynamic_import` | Attempt `importlib.import_module("openai")` outside Shield. Gate fails. |
| **P1-G-R2.c** | `test_ast_egress_gate_catches_attribute_indirection` | Attempt `provider = openai; provider.ChatCompletion.create(...)` outside Shield. Gate fails. |
| **P1-G-R2.d** | `test_ast_egress_gate_catches_aliased_import` | Attempt `import openai as _o; _o.ChatCompletion.create(...)`. Gate fails. |
| **P1-G-R2.e** | `test_runtime_egress_firewall_blocks_non_shield_call` | Runtime: raise an outbound HTTP from `services/experiment/leak.py`. Firewall middleware returns 500 with `reason=egress_firewall_deny`; nothing reaches the network. |
| **P1-G-R2.f** | `test_named_file_exemption_list_matches_registry` | Every file in `shield_egress_exemptions.v0.json` exists on disk under `services/synisense/shield/`; the file count matches the FPR row count for Shield outbound-caller functions. |

**New FPR rows:** `egress_firewall.middleware_check`, `ast_egress_gate.walk_and_detect`, `ast_egress_gate.alias_resolver`, `ast_egress_gate.taint_host_detector`.

---

### P1-R3 — Test-only bypass parameter removed from production router signature

**Design response:**

1. **Remove parameter.** The current LLM router invocation signature carries a test-only bypass parameter (identified in Canon Register Part II Correction §6). It is removed from `services/synisense/shield/llm_router.py::invoke` and every call site in `services/synisense/shield/`.
2. **Tests move to monkeypatching.** Tests that previously passed the bypass parameter now `monkeypatch` `deidentifier.deidentify` to the identity function in the test's own fixture setup. This is a per-test isolated pattern with no production surface.
3. **Signature-inspection test.** A CI cell inspects `inspect.signature(llm_router.invoke)` and any wrapper it delegates to, asserting no parameter name matches the pattern `.*bypass.*|.*skip.*|.*passthrough.*|.*test_only.*|.*no_deid.*`. Break-in style (SR-4): the test attempts to smuggle any of the forbidden parameter names and must fail if any is present.

**Named gates:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R3.a** | `test_llm_router_signature_no_bypass_parameter` | `inspect.signature(invoke).parameters` names do not match the bypass-name pattern. |
| **P1-G-R3.b** | `test_llm_router_no_bypass_by_ast_walk` | AST walk of `services/synisense/shield/` finds no function whose default-value scan reveals a bypass-flag default. |
| **P1-G-R3.c** | `test_deid_bypass_via_call_arg_impossible` | Break-in: attempt to call `invoke(…, deid_bypass=True)`. Must raise `TypeError` (unknown kwarg) — never proceed. |

**No new FPR rows** (removal, not addition).

---

### P1-R4 — Hard-fail startup: production refuses to start on missing secret, admin seed, or mock LLM

**Design response:**

1. **Environment mode discriminator.** `services/synisense/config.py` gains an `AKKI_ENV: {development|production}` env var (default `development` when unset). Under `production`:
   - Absent `SYNISENSE_MASTER_SECRET` → **exit at ASGI startup** with a fatal log line, non-zero exit code, and no partial-boot state.
   - Absent `ADMIN_EMAIL` / `ADMIN_PASSWORD` (admin seed) → same treatment.
   - Absent `EMERGENT_LLM_KEY` / provider key AND absent per-provider account config → the LLM router refuses to start (import-time check pattern per BCR §3.4 LLM-swap-seam).
2. **Under `development`,** existing warn-and-continue behaviour remains, but every dev-fallback logs a **structured warning** carrying the missing secret name and the class of degradation (per BCR §3.4 finding-not-carry-over convention).
3. **Health endpoints reflect posture.** `/api/healthz` (liveness — no DB) always returns 200 in either mode. `/api/readyz` under `production` fails with 503 when startup guards fail (never reached if the process refuses to boot). Under `development`, `/api/readyz` still passes but the response payload records `masking_tier: dev_fallback` (see P1-R5).

**Named gates:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R4.a** | `test_production_refuses_mock_mode` | Spawn the ASGI app with `AKKI_ENV=production` and no `SYNISENSE_MASTER_SECRET`. Process exits non-zero within N seconds. |
| **P1-G-R4.b** | `test_production_refuses_absent_admin_seed` | Spawn with `AKKI_ENV=production` and no `ADMIN_EMAIL`. Process exits non-zero. |
| **P1-G-R4.c** | `test_production_refuses_absent_llm_key` | Spawn with `AKKI_ENV=production` and no `EMERGENT_LLM_KEY`. Process exits non-zero at import-time (LLM router import raises). |
| **P1-G-R4.d** | `test_development_boots_with_dev_fallback` | `AKKI_ENV=development` (or unset) and no secrets. Process boots; `/api/readyz` includes `masking_tier: dev_fallback` and structured warnings appear in stderr. |

**New FPR rows:** `config.production_startup_guard`, `config.env_mode_discriminator`, `readyz.masking_tier_reporter`.

---

### P1-R5 — Silent degradation closed: absent-key refuses; perception fallback recorded in trust receipt

**Design response:**

1. **Absent LLM key under `development`.** The router falls back to the deterministic echo path (current) BUT the response payload carries `masking_tier: llm_dev_echo_fallback` and every trust receipt written in that call records the tier in its `masking_tier` field.
2. **Absent LLM key under `production`.** Refuses per P1-R4 (process does not boot).
3. **Perception fallback under either mode.** When `faster-whisper` (or the primary ASR) is unavailable and the pipeline falls back to a weaker variant, the perception worker's `PerceptionResult_v0` carries a `masking_tier: perception_asr_fallback_<variant>` field. Under `production`, this is a soft-fallback (recorded but not refused) IF the weaker variant is on the allowlist (BCR §3.1 model registry); otherwise the perception worker refuses. The allowlist is `docs/mandates/perception_fallback_allowlist.v0.json`, Owner-owned.
4. **Trust-receipt schema addition.** `services/synisense/shield/trust_receipt.py` gains a `masking_tier: str` field (default `full_deid`; other values enumerated). This is a **new frozen field** on the trust-receipt contract — additive version bump per BCR H5.

**Named gates:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R5.a** | `test_trust_receipt_carries_masking_tier` | Every trust receipt written by the Shield route in tests carries a non-null `masking_tier`. |
| **P1-G-R5.b** | `test_dev_echo_fallback_marks_masking_tier` | Under `development` with no LLM key, the Shield route response carries `masking_tier: llm_dev_echo_fallback` and the persisted receipt records it. |
| **P1-G-R5.c** | `test_perception_fallback_variant_in_allowlist_or_refuse` | Perception worker with a fallback variant not on the allowlist refuses the job (`status: partial_failed`, reason recorded). |
| **P1-G-R5.d** | `test_trust_receipt_masking_tier_frozen_snapshot` | The new trust-receipt schema is snapshot-locked. Parity count for the trust-receipt contract is bumped to a new version (additive). |

**New FPR rows:** `trust_receipt.masking_tier_field`, `perception.fallback_allowlist_gate`, `router.dev_echo_masking_tier_stamp`.

---

### P1-R6 — Token-preservation fix (Shield opaque-token clause composed ahead of caller prompt)

**Design response:**

1. **Compose ahead, not append.** `services/synisense/shield/llm_router.py::_build_system_message` currently composes the system message by concatenating (system_preamble || caller_preamble). Change to: **the opaque-token instruction ALWAYS leads**; the caller-supplied prompt follows AFTER a delimiter that carries a load-bearing statement ("The following is the caller's context. Opaque tokens above MUST be preserved verbatim in your output.").
2. **Callers cannot remove.** The Shield's `_build_system_message` builder is the ONLY producer of system messages sent to `LlmChat`. Break-in test attempts to construct a system message that omits the token clause and must fail.
3. **Round-trip test.** The two current live callers (`brief_synthesizer.py`, `fluency_synthesizer.py`) each receive a caller-prompt-replacement input in test; the composed prompt still carries the token clause; the LLM response is verified to preserve tokens; `reidentifier.reidentify` succeeds.

**Named gates:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R6.a** | `test_system_message_token_clause_leads` | For every caller-prompt variant seeded in tests, the composed system message's first ~200 characters contain the opaque-token clause. |
| **P1-G-R6.b** | `test_caller_prompt_cannot_remove_token_clause` | Break-in: caller passes a full replacement prompt. The composed message still leads with the token clause. |
| **P1-G-R6.c** | `test_fluency_synthesizer_round_trip_preserves_tokens` | End-to-end: fluency synthesis over a de-identified input; every token in the output maps back via `reidentify`. |
| **P1-G-R6.d** | `test_brief_synthesizer_round_trip_preserves_tokens` | Same, for brief synthesis. |

**New FPR rows:** `shield.system_message_composer_leads_with_token_clause`.

---

### P1-R7 — Hygiene

**Design response, per sub-item:**

**.env / admin-seed repair.**
1. Ship `backend/.env.sample` and `frontend/.env.sample` marked as samples (per BCR AS-U2: samples MUST be marked; unmarked samples are hidden mocks and prohibited).
2. Samples include every required variable (`MONGO_URL`, `DB_NAME`, `SYNISENSE_MASTER_SECRET`, `EMERGENT_LLM_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `REACT_APP_BACKEND_URL`) with sample values that are visibly non-production ("CHANGEME_…").
3. **Fixture-schema-gated** per AS-U2: a CI cell parses `.env.sample` and asserts every variable named in the sample matches a variable read by production code (grep of `os.environ.get` or Pydantic Settings model fields). Missing production reads for sample entries → gate fails. Missing sample entries for production reads → gate fails. This is the AS-U2 pattern applied to the sample-env surface.
4. Admin-seed idempotency: on first boot with `ADMIN_EMAIL` set, `services/auth/user_store.seed_admin_idempotent(email, password)` creates the admin user if absent; if present but password mismatched, refuses (does not silently update).

**Mobile FATAL resolution or documentation.**
Mobile supervisor is FATAL because `/tmp/.frontend_deps_ready` sentinel never appears. Two paths:
- **Path A — resolve.** Restore the background extract job that creates the sentinel (per `/etc/supervisor/conf.d/*.conf` line 30 script). Requires understanding the extract job; touch nothing that risks web product.
- **Path B — document.** File `docs/rulings/mobile_supervisor_scope_2026-07-30.md` recording that the mobile program is not in scope for the current web-product build, is expected to remain FATAL under the current supervisor config, and requires a separate Owner ruling to bring in scope.

**Recommendation-for-Owner (recorded, not chosen):** Path B is default because mobile is not in the current dispatch's scope; Path A becomes appropriate when a mobile phase is dispatched.

**tier_lock archival policy.**
1. Current state: 727 versioned files at `backend/services/economics/tier_lock.v{0..726}.json`. This is the rule-change history (per BCR §3.11 CK-B: every rule bump = new version).
2. Archival policy: **retain last N in the live tree** (proposed N = 30, argued at dispatch); older versions move to `backend/services/economics/archive/tier_lock/` and remain byte-identical (SHA preserved). The **manifest** at `backend/services/economics/tier_lock_manifest.v0.json` lists every version with its SHA and its `moved_to_archive: bool` flag. Rule-history readers walk the manifest, not the directory.
3. Break-in gate: attempt to mutate an archived file — filesystem permissions + a git-hook assertion + a CI cell verifying each archived file's SHA matches the manifest.

**Named gates for R7:**

| Gate ID | Test | What it enforces |
| --- | --- | --- |
| **P1-G-R7.a** | `test_env_sample_matches_production_reads` | Every var in `.env.sample` is read by production code; every var read by production is in the sample. |
| **P1-G-R7.b** | `test_env_sample_values_are_marked_placeholder` | Every value in the sample matches the `CHANGEME_.*` pattern or an explicit dev-safe default. |
| **P1-G-R7.c** | `test_admin_seed_idempotent` | Boot twice with the same admin credentials; only one admin user exists; second boot logs the idempotency and does not update. |
| **P1-G-R7.d** | `test_admin_seed_refuses_password_mismatch` | Boot with `ADMIN_PASSWORD` different from stored hash; process logs the refusal and does not update the record. |
| **P1-G-R7.e** | `test_tier_lock_manifest_matches_disk` | Manifest SHAs match live + archived files; no orphan files. |
| **P1-G-R7.f** | `test_tier_lock_archive_shas_immutable` | Break-in: mutate an archived file; CI cell detects mismatch and fails. |

**New FPR rows:** `config.env_sample_schema_gate`, `auth.admin_seed_idempotent`, `economics.tier_lock_archival_manager`, `economics.tier_lock_manifest_reader`.

---

## §3 Close condition

Per dispatch §3 verbatim: *"All P1 gates green; corrected custody claims propagated to the pack documents (Engineering Spec §6.1/Appendix A, Governance Brief §14–15, Marketing §28 proof points) in the same close — the corrections in Canon Register Part II were written against the pre-fix state and must be re-stated as closed, on disk."*

**Docs propagation targets (all in `docs/mandates/akki_os_pack_v1/`) via amendment notes, not in-place edits:**

1. **`AMENDMENT_P1CLOSE_EngSpec_6.1_AppendixA_2026-<date>.md`** — restates the custody enforcement section as **closed**: bypass parameter removed (P1-R3), AST egress gate live (P1-R2), de-id fail-closed on unsupported language (P1-R1), tenant catalogue populated at census (P1-R1). Points readers to the Function-Promise Registry rows for each new function.
2. **`AMENDMENT_P1CLOSE_GovBrief_14_15_2026-<date>.md`** — restates the Shield promises table as fulfilled per Correction §6 (custody override closed) and Correction §7 (single-egress guard closed). Each promise cross-references its enforcing test in the FPR.
3. **`AMENDMENT_P1CLOSE_Marketing_28_2026-<date>.md`** — updates the ~1,400-check line per whichever amendment Owner chose (a/b/c per `docs/audits/enforcement_check_count_derivation_2026-07-30.md`). Reflects the P1 gate additions.
4. **`AMENDMENT_P1CLOSE_CanonRegisterPartII_2026-<date>.md`** — the Canon Register's three published-claim corrections are re-stated **as closed**. Original wording preserved (v1.0 committed under recorded SHA and not rewritten); the amendment records the closure alongside.

## §4 Freeze-or-not (D4b axes)

P1 introduces **one new frozen field**: `masking_tier: str` on the trust-receipt contract (P1-R5). Freeze argument on D4b: this field crosses the trust-boundary axis (Shield internal state → externally-verifiable receipt), so the prior is FREEZE. Additive version bump: `trust_receipt.v1` (from `v0`), parity count moves 31 → 32. Snapshot lands: `backend/tests/invariants/trust_receipt_v1.contract_snapshot.json`.

No other frozen contracts are mutated. The AST egress gate, the fail-closed language guard, the environment mode discriminator, and the tier_lock archival manager are all **behavioural gates and services**, not contracts.

## §5 Dependencies and non-dependencies

**Depends on:**
- Owner-supplied estate language set (P1-R1 language dispatch).
- Owner supply of Audio Plane Spec is **not** a dependency (P1 does not touch the audio plane).
- CC-2 ruling is **not** a dependency for P1 execution, but the P1 FPR rows are held from landing in the machine-readable registry until CC-2 rules the schema question. FPR rows may land in the human-readable registry (`docs/registry/function_promise_registry_v0.md`) with `[STAKED-PENDING-CC-2]` markers.

**Does NOT depend on:**
- BM-V execution (P2).
- Real material acquisition (OT-1 / OT-2).
- Any external procurement (LLM account, domain, TLS — P1 works with the current preview URL and Emergent LLM key).

## §6 Gate roster — consolidated

Count: **28 named gates** across P1-R1..R7 (5 + 6 + 3 + 4 + 4 + 4 + 6). Every gate is a break-in-style test where a violation is attempted (SR-4), or a signature/schema inspection.

| Requirement | Gate count | Break-in count |
| --- | --- | --- |
| P1-R1 De-id | 5 | 1 (catalogue-isolation) |
| P1-R2 Egress | 6 | 5 (four evasions + runtime firewall + exemption-list) |
| P1-R3 Bypass removal | 3 | 1 (call-arg smuggle) |
| P1-R4 Startup guards | 4 | 3 (missing secret × 3 in production) |
| P1-R5 Masking tier | 4 | 0 |
| P1-R6 Token preservation | 4 | 2 (caller replacement × 2) |
| P1-R7 Hygiene | 6 | 1 (tier_lock immutability) |
| **Total** | **32** | **13** |

(Count corrected on second pass: 5+6+3+4+4+4+6 = 32; not 28 as first estimated. The gate roster is the authoritative count.)

## §7 Function-Promise Registry rows to REGISTER BEFORE landing (AC-3)

Count: **19** new rows enumerated across the requirements. Each row will carry the 11-field schema per QRB §5.1 (subject to CC-2 ruling on the `dependencies` field). Rows staged in a `p1_stage_a_fpr_delta.md` supplement, held from the machine-readable YAML until CC-2 closes.

## §8 Sizing and staging

Size estimate: medium-large. Breakdown (illustrative, not a schedule):

- **Stage A — this document + Owner review** (design; docs-only; done). 
- **Stage B — code lands atomically** (per BCR execution discipline; single close report `docs/close_reports/p1_custody_closure_honest_startup.md`).

Sequencing rationale: R1 (de-id) and R2 (egress) are the largest and most claims-critical items and land in the same commit as their close-condition doc amendments. R3–R6 ride on the R1/R2 landings. R7 lands with either R1..R6 or a small follow-up as convenient — no separate phase.

## §9 Refusal taxonomy discipline (Owner E2 non-negotiable)

Every new failure path in P1 either raises `ServiceUnavailable` (503, `{reason, detail}` — access-control class, NEVER `outcome=refused`) or refuses per BCR §3.4 startup contract (process exits non-zero at import-time, no partial-boot state). No new refusal reason codes are added to the governed refusal taxonomies (`admission_refusal_reasons.v*.json`, `service_1_refusal_reasons.v0.json`, `auth_refusal_reasons.v0.json`). All P1 failure paths are **infrastructure** or **access-control** class, never governed-refusal class.

— End of P1 Stage A proposal. **Status: DRAFT · awaiting Owner approval to move to Stage B.** —
