/* UI-1-A · Verdict panel demonstration surface.
 *
 * Owner iter12 addendum verbatim:
 *   "ensure the three verdict states are demonstrable — either on the
 *    panel or by driving a real session to a verdict. The absolute-refusal
 *    no-affordance assertion must be verifiable in DOM."
 *
 * This page renders all three CommissionVerdict outcomes side-by-side
 * so the tester can inspect the DOM without driving a full session:
 *   1. RUNS_NOW
 *   2. HELD_FOR_CHECK (escalatable)
 *   3. REFUSED · escalatable   (route_to_approval present)
 *   4. REFUSED · absolute      (route_to_approval null · NO affordance)
 *
 * The absolute-refusal beacon is asserted structurally: the panel
 * must contain the `use-data-verdict-refusal-no-affordance-beacon`
 * testid AND MUST NOT contain any element with the
 * `use-data-verdict-refusal-route-affordance` testid. A Jest gate
 * asserts this at render time (see
 * __tests__/ui_1_a/verdict_absolute_no_affordance_gate.test.js).
 */
import React from 'react';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import UseDataVerdictPanel from './UseDataVerdictPanel';

// ---- Verdict envelope fixtures ----

const V_RUNS_NOW = {
  outcome: 'runs_now',
  refusal: null,
  checks: [
    { check: 'rights_compatibility', status: 'passed', plain_language_summary: 'Rights permit this use.', detail: null },
    { check: 'privacy_floor',        status: 'passed', plain_language_summary: 'Privacy floor met.',       detail: null },
    { check: 'pii_posture',          status: 'passed', plain_language_summary: 'PII posture cleared.',     detail: null },
    { check: 'budget_ceiling',       status: 'passed', plain_language_summary: 'Budget within ceiling.',   detail: null },
    { check: 'scope_resolvability',  status: 'passed', plain_language_summary: 'Scope is resolvable.',     detail: null },
  ],
  auto_run_ceiling: {
    ceiling_usd: 1000,
    proposed_spend_usd: 500,
    at_or_under: true,
    dpo_countersign_required: false,
  },
  trust_receipt_ref: 'trcv-demo-runs-now',
  verbatim_carrier: 'Every commission verdict lands in the record the DPO reads.',
};

const V_HELD_FOR_CHECK = {
  outcome: 'held_for_check',
  refusal: {
    kind: 'escalatable',
    reason_code: 'auto_run_ceiling_exceeded',
    criterion: 'Auto-run ceiling exceeded; single DPO countersign required.',
    value: 'proposed $2,500 · ceiling $1,000',
    bar_source: null,
    route_to_approval: 'Pending policy check · single DPO countersign.',
  },
  checks: [
    { check: 'rights_compatibility', status: 'passed', plain_language_summary: 'Rights permit this use.', detail: null },
    { check: 'privacy_floor',        status: 'passed', plain_language_summary: 'Privacy floor met.',       detail: null },
    { check: 'pii_posture',          status: 'passed', plain_language_summary: 'PII posture cleared.',     detail: null },
    { check: 'budget_ceiling',       status: 'held',   plain_language_summary: 'Proposed spend exceeds auto-run ceiling.', detail: 'proposed=$2,500 ceiling=$1,000' },
    { check: 'scope_resolvability',  status: 'passed', plain_language_summary: 'Scope is resolvable.',     detail: null },
  ],
  auto_run_ceiling: {
    ceiling_usd: 1000,
    proposed_spend_usd: 2500,
    at_or_under: false,
    dpo_countersign_required: true,
  },
  trust_receipt_ref: 'trcv-demo-held-for-check',
  verbatim_carrier: 'Every commission verdict lands in the record the DPO reads.',
};

const V_REFUSED_ESCALATABLE = {
  outcome: 'refused',
  refusal: {
    kind: 'escalatable',
    reason_code: 'privacy_floor_missing',
    criterion: 'Privacy floor not declared.',
    value: null,
    bar_source: null,
    route_to_approval: 'Declare a privacy floor or route via Change-a-Rule.',
  },
  checks: [
    { check: 'rights_compatibility', status: 'passed', plain_language_summary: 'Rights permit this use.', detail: null },
    { check: 'privacy_floor',        status: 'failed', plain_language_summary: 'No privacy floor declared.', detail: null },
    { check: 'pii_posture',          status: 'passed', plain_language_summary: 'PII posture cleared.',     detail: null },
    { check: 'budget_ceiling',       status: 'passed', plain_language_summary: 'Budget within ceiling.',   detail: null },
    { check: 'scope_resolvability',  status: 'passed', plain_language_summary: 'Scope is resolvable.',     detail: null },
  ],
  auto_run_ceiling: {
    ceiling_usd: 1000,
    proposed_spend_usd: 500,
    at_or_under: true,
    dpo_countersign_required: false,
  },
  trust_receipt_ref: 'trcv-demo-refused-escalatable',
  verbatim_carrier: 'Every commission verdict lands in the record the DPO reads.',
};

const V_REFUSED_ABSOLUTE = {
  outcome: 'refused',
  refusal: {
    kind: 'absolute',
    reason_code: 'rights_declaration_missing',
    criterion: 'Rights posture not declared. No route to approval exists (Canon §1.3).',
    value: null,
    bar_source: 'Canon §1.3 · Doctrine 5',
    route_to_approval: null,        // Doctrine 5: absolute refusals carry NO route.
  },
  checks: [
    { check: 'rights_compatibility', status: 'failed', plain_language_summary: 'Rights declaration is missing.', detail: null },
    { check: 'privacy_floor',        status: 'passed', plain_language_summary: 'Privacy floor met.',           detail: null },
    { check: 'pii_posture',          status: 'passed', plain_language_summary: 'PII posture cleared.',          detail: null },
    { check: 'budget_ceiling',       status: 'passed', plain_language_summary: 'Budget within ceiling.',        detail: null },
    { check: 'scope_resolvability',  status: 'passed', plain_language_summary: 'Scope is resolvable.',          detail: null },
  ],
  auto_run_ceiling: {
    ceiling_usd: 1000,
    proposed_spend_usd: 500,
    at_or_under: true,
    dpo_countersign_required: false,
  },
  trust_receipt_ref: 'trcv-demo-refused-absolute',
  verbatim_carrier: 'Every commission verdict lands in the record the DPO reads.',
};

function DemoSection({ id, title, verdict }) {
  return (
    <section
      data-testid={`verdict-demo-section-${id}`}
      style={{
        marginBottom: '30px',
        borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
        paddingTop: '18px',
      }}
    >
      <h3
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.15rem',
          color: AKKI_V4_PALETTE.ink,
          margin: '0 0 10px 0',
        }}
        data-testid={`verdict-demo-title-${id}`}
      >
        {title}
      </h3>
      <UseDataVerdictPanel verdict={verdict} />
    </section>
  );
}

export default function UseDataVerdictDemoPage() {
  return (
    <AkkiShell
      title="Use Data · Verdict demonstration"
      subtitle="All four verdict states rendered for inspection. No auth-gated data; no fetch; instant render."
    >
      <p
        data-testid="verdict-demo-purpose"
        style={{
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          padding: '12px 16px',
          margin: '0 0 24px 0',
          fontSize: '0.9rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        <strong style={{ color: AKKI_V4_PALETTE.navy }}>Purpose</strong> —
        this surface renders the four CommissionVerdict shapes side-by-side
        so the Doctrine 5 break-in ("absolute refusals render no approval affordance")
        is verifiable in the DOM. No network, no authentication — every
        panel is a pure component render from a local fixture.
      </p>
      <DemoSection id="runs-now" title="1 · RUNS_NOW — all five checks pass" verdict={V_RUNS_NOW} />
      <DemoSection id="held-for-check" title="2 · HELD_FOR_CHECK — over ceiling, single DPO countersign" verdict={V_HELD_FOR_CHECK} />
      <DemoSection id="refused-escalatable" title="3 · REFUSED · escalatable — criterion + route + criterion" verdict={V_REFUSED_ESCALATABLE} />
      <DemoSection id="refused-absolute" title="4 · REFUSED · absolute — Doctrine 5 · NO approval affordance" verdict={V_REFUSED_ABSOLUTE} />
    </AkkiShell>
  );
}
