# Governance Brief §14–15 — Shield Promises Table Fulfilled

**Date:** 2026-07-30.
**Authority:** P1 close per Owner ruling `docs/rulings/P1_stage_a_owner_approval_2026-07-30.md`.
**Target:** `docs/mandates/akki_os_pack_v1/AkkiOS_Governance_Orchestration_Brief_v1.0.md` §14–15 (SyniSense chokepoint + ten promises + purpose-enforcement mechanics).
**Kind:** append-only amendment note. The pack document remains byte-identical under its recorded SHA (`7c178ee3…`).

---

## What Governance Brief §14–15 said in v1.0

The Shield's ten promises (Table 6, §15) were carried WITH the honest-form language reflecting the enforcement gaps of Canon Correction #6 (custody override) and Correction #7 (single-egress guard):

- Promise "no configuration override" — carried the corrected form: *"the design admits no override; a test-only bypass parameter remains on the production signature; the guarantee is enforced by convention at that one point rather than by construction."*
- Promise "one chokepoint, no side paths" — carried the corrected form: *"the guard is a pattern scan; four evasion classes pass it."*

## What P1 closes

Both promises now hold at the strong form — the honest form is no longer needed:

### Promise "no configuration override" — CLOSED at STRONG FORM
- Bypass parameter **removed** from production signature (`invoke_with_metering` in `services/synisense/shield/llm_router.py`).
- Signature-inspection gate on every CI (`test_p1_g_r3a`).
- AST walk over shield/ catches any reintroduction (`test_p1_g_r3b`).
- Break-in test attempts smuggle-via-kwarg and observes `TypeError` (`test_p1_g_r3c`).

### Promise "one chokepoint, no side paths" — CLOSED at STRONG FORM
- Static AST gate resolves aliases, dynamic imports, provider-host HTTP calls.
- Runtime egress firewall as httpx transport wrapper refuses at network layer.
- Named-file exemption list at `docs/mandates/shield_egress_exemptions.v0.json` (positive list); no directory-wildcard exemptions.
- All four evasion classes named in Correction #7 are attempted break-in style (`test_p1_g_r2a..d`) and caught.
- Provider-host HTTP is caught by both static AST (`test_p1_g_r2` outbound-HTTP check) and runtime firewall (`test_p1_g_r2e`).

### De-id language coverage (Promise "purpose-informing de-id") — CLOSED at STRONG FORM
- Tenant catalogue is populated (P1-R1); layer-2 lookup is catalogue-backed (was the empty stub of Correction #8).
- Language dispatch with fail-closed rule at `services/synisense/shield/language_dispatch.py`.
- Under unsupported language + empty catalogue + high proper-noun density: `ServiceUnavailable` is raised (fail-closed). The call fails visibly rather than proceeding on regex-only.

### Trust-receipt masking-tier honesty (Correction #9 tier-1 finding)
- Trust receipts now emit `masking_tier` (positive-allowlist-validated) on every call (P1-R5 Owner condition ii).
- Trust-receipt v1 sibling contract at `backend/contracts/trust_receipt_v1.py`; snapshot byte-locked at `backend/tests/invariants/trust_receipt_v1.contract_snapshot.json`; parity 31 → 32 (Owner condition i).
- Dev-echo fallback under `AKKI_ENV=development` is tier-tagged as `llm_dev_echo_fallback`; NOT admissible under `production` per the allowlist.

## Consequence for future readers

Governance Brief §14–15 as-written continues to be truthful for the historical record. Where a reader looks up "the design admits no override" or "one chokepoint no side paths" or "three-layer de-identification", the strong form NOW holds by construction — confirmed by the gate roster at `docs/close_reports/p1_custody_closure_honest_startup.md` §Gate Roster.

— End of amendment. —
