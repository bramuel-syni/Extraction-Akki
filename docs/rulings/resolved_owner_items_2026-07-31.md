# Resolved Owner items · 2026-07-31

**Authority:** Owner directive verbatim on receipt of Experience Canon v1.0.
**Standing rule:** SR v3 — verbatim carrier.

---

## Ruling 1 — §6.5 Commission auto-run ceiling RESOLVED

Owner verbatim + Canon §4.2 verbatim: *"Commission auto-run ceiling (numeric + currency; ∞ permitted). ◆ Initial value: **$1,000** (owner-set 2026-07-31; thereafter changeable only via Change-a-Rule)."*

**Applied:**
- Initial ceiling value: **$1,000 USD** (owner-set 2026-07-31).
- Change path: **Change-a-Rule ceremony ONLY** (Canon §7.5) — DPO proposes → Master Admin counter-signs → waiting-period countdown (cancelable) → applies with change certificate → re-verification fires.
- Direct-write not permitted after initial set.
- Ceiling is class-O (Rules) per Canon §7.3 taxonomy.
- Enforcement at Commission card admissibility gate: at/under ceiling AND rule-clean → auto-run; above ceiling → "Pending policy check" single DPO countersign (Canon §6.4).

**Gate cell required:** `gate_auto_run_ceiling_1000_change_a_rule_only` per Dispatch v2 §3.7 (retained-in-force gate roster). Lands with UI-1 Stage A execution at `connect/` sub-cycle (sequence position 3).

## Ruling 2 — DB-1 and DB-2 PROMOTED to BINDING

Owner verbatim + Canon §8.1 ◆ verbatim: *"Bindings DB-1 and DB-2, promoted from deferred to binding: the specific wire reason renders in the honesty strip on evidence-cannot-support (DB-1); a companion-channel failure MUST NOT convert a refusal into a fault render — the refusal renders without the supporting detail if the detail could not be retrieved (DB-2)."*

**Applied:**
- **DB-1 (Prove · evidence-cannot-support wire-reason render):** on the Prove surface, when a governed refusal is served with `reason: evidence_cannot_support`, the specific wire reason ('no lawful basis for this use' · 'defensibility floor not met' · 'group too small to report') MUST render verbatim in the honesty strip. Copy is bound to the wire reason, not free-form.
- **DB-2 (Prove · companion-channel-failure MUST NOT convert refusal→fault):** where a supporting/companion channel (e.g. auxiliary provenance fetch) fails while the primary refusal is served, the refusal MUST STILL RENDER via its refusal styling (Canon §8.1 shape) — the fault styling MUST NOT displace the refusal. The refusal simply renders without the supporting detail. Testing binding: mock the companion channel to 500/timeout and verify the refusal card renders unchanged.

**Gate cells required:** `gate_db1_wire_reason_verbatim_honesty_strip` + `gate_db2_companion_fault_does_not_convert_refusal` under UI-1 Stage A gate roster (join Dispatch v2 §3.7 in-force set).

## Ruling 3 — §6.1 B1 GPU spend ceiling STILL BLANK (flag carried)

Owner verbatim: *"§6.1 B1 GPU ceiling: STILL BLANK (blocks B1 hardware rental only — carry the flag)."*

**Applied:** the flag stays in the PRD next-tasks section and any B1 hardware-rental sub-cycle. Blocks B1 hardware rental ONLY. Does NOT block UI-1 Stage A or any of the five UI execution sub-cycles (use_data → govern → connect → registry/prove → team).

═══════════════════════════════════════════════════════════════════

*End of resolved-items ruling. SR v3 · verbatim carrier.*
