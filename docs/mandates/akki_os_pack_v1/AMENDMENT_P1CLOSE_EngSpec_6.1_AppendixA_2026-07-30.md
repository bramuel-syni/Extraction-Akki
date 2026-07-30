# Engineering Spec §6.1 / Appendix A — Custody Corrections CLOSED

**Date:** 2026-07-30.
**Authority:** P1 close per Owner ruling `docs/rulings/P1_stage_a_owner_approval_2026-07-30.md`.
**Target:** `docs/mandates/akki_os_pack_v1/AkkiOS_Product_Engineering_Specification_v1.0.md` §6.1 (SyniSense operating regime) + Appendix A (audit trail on custody enforcement gaps).
**Kind:** append-only amendment note. The pack document remains byte-identical under its recorded SHA (`555bf001…`); this note is the reader's binding reference.

---

## What Appendix A originally recorded

> *"Enforcement gaps documented in Canon Register Part II: the test-only bypass parameter still on the production invocation signature; the single-egress guard is a pattern scan, not an AST gate, and does not cover raw outbound HTTP or a runtime egress allowlist; the tenant dictionary is a stub, non-English NER absent — custody-grade recall is established for English material and unmeasured elsewhere."*

## What is closed by P1

All three enforcement gaps are closed as of 2026-07-30:

### 1. Bypass parameter removed (Correction #1)
- `backend/services/synisense/shield/llm_router.py::invoke_with_metering` — `_shielded: bool = True` parameter **removed** from the signature.
- Test that formerly passed the bypass: monkeypatch `deidentifier.deidentify` at the module boundary instead (per P1-R3).
- **Signature-inspection gate** `test_p1_g_r3a_llm_router_signature_no_bypass_parameter` runs on every CI: pattern `(?i)bypass|skip.deid|passthrough|test_only|no_deid|_shielded|shielded_off` fails the build on any hit.
- **AST walk gate** `test_p1_g_r3b_llm_router_no_bypass_by_ast_walk` catches any function-signature default that could reintroduce bypass.
- **Break-in gate** `test_p1_g_r3c_deid_bypass_via_call_arg_impossible` — attempts `_shielded=False` as a kwarg; Python raises `TypeError` (unknown kwarg).

### 2. Single-egress guard promoted to AST + runtime allowlist (Correction #2)
- **Static AST gate** at `backend/tests/invariants/test_ast_egress_gate.py` replaces the regex/pattern scan. Walks the entire backend Python tree (excluding named-file exemptions) with an `ast.NodeVisitor` that catches ALL four evasion classes named in the correction:
  1. Raw import (`import openai`)
  2. Aliased import (`import openai as _o`)
  3. `from openai import X`
  4. Dynamic import (`importlib.import_module("openai")`)
  5. Provider-host HTTP calls (`httpx.post("https://api.openai.com/…")`).
- **Runtime egress firewall** at `backend/services/synisense/shield/egress_firewall.py` — httpx transport wrapper that inspects the call stack of every outbound HTTP request; requests to forbidden provider hosts from non-Shield call paths raise `EgressFirewallDenied` at the transport layer.
- **Named-file exemption list** at `docs/mandates/shield_egress_exemptions.v0.json` — positive list replacing the directory-scope exemption. Every entry cites the reason. Any addition requires a dated Owner ruling.
- Six gates covering the six R2 labels: `test_p1_g_r2a` through `test_p1_g_r2f` at `backend/tests/invariants/test_p1_custody_closure.py` + the two aggregate walkers at `test_ast_egress_gate.py`.

### 3. Tenant catalogue populated + language dispatch fail-closed (Correction #3 — the highest-severity item)
- **Tenant catalogue** at `backend/services/synisense/shield/tenant_catalogue.v0.json` (Owner-governed seed) with the P2 populate-at-census path defined in the P2 Stage A proposal.
- `backend/services/synisense/shield/tenant_entities.py` **rewritten** to read from the catalogue file (was the empty-list stub named in Canon Correction #3).
- **Language dispatch** at `backend/services/synisense/shield/language_dispatch.py` — script detection + proper-noun-density heuristic + fail-closed rule.
- **Fail-closed rule:** `deidentifier.deidentify` (via `language_dispatch.fail_closed_language_guard`) raises `ServiceUnavailable` when: layer-2 catalogue is empty AND layer-3 sees an unsupported-NER language AND proper-noun density is above threshold.
- Five gates: `test_p1_g_r1a` (fail-closed) · `_r1b` (catalogue non-empty) · `_r1c` (tenant isolation break-in) · `_r1d` (module shipped) · `_r1e` (below-threshold proceeds).

## Consequence for future readers

Where Engineering Spec §6.1 or Appendix A describe the pre-P1 custody state (bypass on signature / regex-scan guard / empty tenant dictionary), the reader treats this note as authoritative: those gaps are **CLOSED at 2026-07-30 P1 close**. The next-version bump of the Engineering Spec may fold this closure into the document body; until then, this amendment binds.

— End of amendment. —
