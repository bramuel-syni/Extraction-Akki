# Owner Approval — P1 Stage A (Two Binding Conditions)

**Date:** 2026-07-30.
**Authority:** Owner (dispatch cycle 2 response).
**Target:** `docs/stage_a_proposals/p1_custody_closure_honest_startup.md` — APPROVED subject to conditions below.

---

## The ruling, verbatim

**P1 Stage A APPROVED** with two binding conditions:

**Condition (i):** *"masking_tier lands as a NEW trust-receipt contract version BESIDE the frozen predecessor (trust_receipt v1 as a sibling contract module + its own snapshot) — NEVER a field added to the existing frozen shape. Parity 31→32 via seal event."*

**Condition (ii):** *"masking_tier is added to the trust-receipt allowlist registry as a GOVERNED change (positive list — nothing appears by default)."*

Both conditions must be explicitly confirmed in the close report.

**Scoping clarification:** *"hard-fail startup (P1-R4) is PRODUCTION-SCOPED — sandbox/dev echo mode stays functional; runtime masking failure still falls to the mechanical arm (never a hard crash of a live call)."*

## Consequences applied to the Stage A design

The following amendments to `docs/stage_a_proposals/p1_custody_closure_honest_startup.md` §P1-R5 and §P1-R4 apply:

### Condition (i) applied — masking_tier as sibling contract

P1-R5 point 4 of the Stage A originally read:

> *"Trust-receipt schema addition. `services/synisense/shield/trust_receipt.py` gains a `masking_tier: str` field … additive version bump per BCR H5."*

Replace with:

> **Trust-receipt v1 lands as a sibling contract module** — `backend/contracts/trust_receipt_v1.py` — preserving `backend/services/synisense/shield/trust_receipt.py` (the v0 module and its production instances) byte-identical. The v1 module carries the full v0 schema PLUS the `masking_tier: str` field. Callers migrate to v1 on emission; existing v0 receipts remain readable. **Parity 31 → 32 via seal event**: `backend/tests/invariants/trust_receipt_v1.contract_snapshot.json` lands as a new byte-locked snapshot; the parity counter's `contract count` and `snapshot count` both step to 32.

### Condition (ii) applied — allowlist registry positive list

P1-R5 point 4 gains a new bullet:

> **masking_tier allowlist as governed positive list.** `docs/mandates/masking_tier_allowlist.v0.json` (positive list — nothing appears by default) enumerates every legal masking tier. A trust-receipt v1 emission with a `masking_tier` value NOT in the allowlist is refused at write time. Adding a new tier is a GOVERNED CHANGE per BCR §3.11 CK-B (Owner + effective delay + objection path). Ships with initial entries: `full_deid`, `llm_dev_echo_fallback`, `perception_asr_fallback_<variant>`, `regex_only_language_unsupported`, `dev_fallback`.

### Scoping clarification applied — P1-R4 production-scoped only

P1-R4 point 1 already discriminates on `AKKI_ENV`; the Owner scoping is re-stated explicitly in the section preamble:

> **Scoping (Owner-explicit):** hard-fail startup is PRODUCTION-SCOPED. Under `AKKI_ENV=production`, missing secrets / missing admin seed / mock LLM mode refuse to boot. Under `AKKI_ENV=development` (or unset), the app boots with structured warnings; dev-echo mode remains functional. Runtime masking failure NEVER hard-crashes a live call — it falls to the mechanical arm (Shield's deterministic-echo fallback under dev mode, or the perception mechanical fallback per the allowlist under production).

## Close conditions per Owner

1. All 32 P1 gates green + full existing suite green (no regressions; parity harness passes at **32**).
2. Four amendment notes propagating corrected custody claims to (a) Engineering Spec §6.1/Appendix A, (b) Governance Brief §14–15, (c) Marketing §28, (d) Canon Register Part II — on disk in the pack.
3. Re-measured enforcement-cell count in the close report (CC-3 practice).
4. Close report in `docs/close_reports/` with gate roster + results, artefact hashes, registry attestation, conformance table, self-audit table (AC-1), and **explicit confirmation of Owner conditions (i) and (ii)**.
5. BUILD_JOURNAL.md entries as work lands (AC-5/AC-6 discipline).
6. Working `.env` setup so the app is demoable: `backend/.env` (MONGO_URL, DB_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, SYNISENSE_MASTER_SECRET, LLM key via Emergent integrations) and `frontend/.env` (REACT_APP_BACKEND_URL). Update `/app/memory/test_credentials.md`. Restart services; verify `/api/health` and an authenticated login end-to-end.

**Status:** P1 Stage A APPROVED · Stage B EXECUTES this cycle.

— End of approval. —
