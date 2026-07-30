# Canon Register Part II — Three Corrections CLOSED

**Date:** 2026-07-30.
**Authority:** P1 close per Owner ruling `docs/rulings/P1_stage_a_owner_approval_2026-07-30.md`.
**Target:** `docs/mandates/akki_os_pack_v1/AkkiOS_Canon_Register_and_Correction_Record_v1.0.md` Part II (three corrections against SyniSense).
**Kind:** append-only amendment note. The Canon Register v1.0 remains byte-identical under its recorded SHA (`be6253a2…`).

---

## The three Part II corrections at Canon Register v1.0

The Register recorded three corrections where published claims described the specified system as though it were the built one:

- **Correction 1** (Canon Register §6) — Custody override / bypass parameter on production signature.
- **Correction 2** (Canon Register §7) — Single-egress guard was regex/pattern with 4 evasion classes passing.
- **Correction 3** (Canon Register §8) — Layer 2 tenant dictionary was a stub; Layer 3 spaCy was English-only. **Highest severity.**

## What P1 closes

All three corrections now hold at the strong-form (the specified guarantee is by-construction), not the honest-form (guarantee by convention at one point):

### Correction 1 — CLOSED

The design now truly admits no override. The bypass parameter is REMOVED from the production signature (P1-R3). The guarantee is enforced by SIGNATURE INSPECTION (a CI gate on every commit) plus AST walk of the shield module (`test_p1_g_r3a` / `_r3b`). Break-in style test attempts kwarg smuggle and observes `TypeError` (`test_p1_g_r3c`).

### Correction 2 — CLOSED

AST gate (`backend/tests/invariants/test_ast_egress_gate.py`) walks the backend Python tree and catches all four evasion classes: raw import / aliased import / `from X import` / dynamic import via `importlib.import_module()`. Provider-host HTTP calls (`httpx.post("https://api.openai.com/…")`) caught by string-taint on outbound HTTP call sites.

Runtime egress firewall at `backend/services/synisense/shield/egress_firewall.py` refuses outbound requests to forbidden provider hosts from non-Shield call stacks at the httpx transport layer.

Named-file exemption list at `docs/mandates/shield_egress_exemptions.v0.json` — positive list, no directory-wildcard exemptions.

### Correction 3 — CLOSED

Layer 2 (tenant dictionary): `backend/services/synisense/shield/tenant_entities.py` is REWRITTEN to read from `backend/services/synisense/shield/tenant_catalogue.v0.json`. Non-empty seed vocabulary ships with the phase; census-population path defined in P2 Stage A.

Layer 3 (multilingual): `backend/services/synisense/shield/language_dispatch.py` — script detection + proper-noun-density heuristic + fail-closed rule.

**Fail-closed rule:** if layer-2 catalogue is empty AND layer-3 language is unsupported AND proper-noun density is above threshold, `deidentify` raises `ServiceUnavailable` (`test_p1_g_r1a`). The call fails visibly rather than proceeding on regex-only.

**Test-only correction 1 caveat**: the recall harness per-language is a P2 concern (blocked on the Owner-supplied estate language set). P1 lands the fail-closed enforcement path with the initial supported language set of `{en}` — the Phase 2 supplement adds languages once Owner rules the set. This is a KNOWN NARROW SCOPE and not a hidden gap.

## Additional §9 findings from Canon Register (recorded state)

Canon Register Part II §9 recorded TWO further findings with no published claim yet affected:

- **Token-preservation clause replaced not extended.** CLOSED by P1-R6 (`test_p1_g_r6a..d`). The token-preservation clause NOW LEADS the composed system message; callers CANNOT strip it. Both live callers (`brief_synthesizer.py`, `fluency_synthesizer.py`) receive the clause even when they supply their own prompt.
- **Silent degradation on missing key / weaker perception variant.** CLOSED by P1-R5 (`test_p1_g_r5a..d`). Trust-receipt v1 carries `masking_tier` on every emission; dev-echo fallback tier is `llm_dev_echo_fallback`; perception fallback tier is `perception_asr_fallback_<variant>`. Production emission of dev-only tiers is refused at write time.

## Consequence for future readers

Where Canon Register Part II describes the pre-P1 state, this amendment closes the record: **all three corrections + both §9 findings resolve at 2026-07-30 P1 close**. Future readers of Marketing §28, Governance §14–15, or Engineering §6.1 who encounter the honest-form language treat this amendment as the operative closure.

— End of amendment. —
