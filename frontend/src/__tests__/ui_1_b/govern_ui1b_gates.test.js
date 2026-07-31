/* UI-1-B Jest gate roster (Owner ruling 2026-08-01 · Canon §7 Govern rebuild).
 *
 * Owner directive: gates MUST assert RENDERED locations in DOM, not
 * source constants. Sub-cycle 3 + UI-1-A lessons stand.
 *
 * Cell 1 · gate_trust_center_two_halves
 *   — /govern renders Trust Center with two side-by-side halves:
 *     Rule inventory LEFT · Record RIGHT (Canon §7.1).
 *
 * Cell 2 · gate_enforcement_split_line
 *   — the Enforcement Class headline renders THREE counts
 *     (Enforced · Attested · Monitored) with the plain-language line
 *     "Neither is superior" verbatim (Canon §7.2).
 *
 * Cell 3 · gate_ceremony_countdown_visible_and_cancelable
 *   — GovernChangeRulePage renders a visible countdown while pending_delay
 *     AND a cancel affordance that routes through the checker (not a
 *     UI-only clock, not a UI-only cancel). A canceled state renders in
 *     the request card as a RECORD (not deleted).
 *
 * Cell 4 · gate_registries_asymmetry_route
 *   — a diff with removals/edits refuses at commit time with a route to
 *     Change-a-Rule; an additions-only diff commits with a receipt.
 */
import React from 'react';
import { render, screen, waitFor, within, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import GovernHomePage from '../../pages/govern/GovernHomePage';
import GovernChangeRulePage from '../../pages/govern/GovernChangeRulePage';
import GovernRegistriesPage from '../../pages/govern/GovernRegistriesPage';
import GovernHoldsPage from '../../pages/govern/GovernHoldsPage';

jest.mock('../../apiClient', () => {
  const mock = {
    governEnforcementClassSplit: jest.fn(),
    governTrustCenterRecord: jest.fn(),
    governEstateRulesRecord: jest.fn(),
    governRegistryUpload: jest.fn(),
    governRegistryDiff: jest.fn(),
    governRegistryCommit: jest.fn(),
    governHolds: jest.fn(),
    checkerInitiate: jest.fn(),
    checkerRequestRead: jest.fn(),
    checkerCancel: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset && fn.mockReset());
});

const SAMPLE_SPLIT = {
  enforced_count: 3,
  attested_count: 1,
  monitored_count: 1,
  machinery_vs_attestation_line: (
    'Machinery holds the line where the rail can enforce; attestation ' +
    'carries the line where evidence and countersignature stand in place ' +
    'of a rail. Neither is superior; both are recorded.'
  ),
  canon_ref: 'Canon §7.2',
};

const SAMPLE_RECORD = {
  refusals: { absolute: 1, escalatable: 1, held_for_check: 1 },
  holds: { open: 1, released: 1, confirmed_rejected: 1 },
  masking: { events_30d: 0, recall_breaches_30d: 0, seam_state: 'dormant' },
  access_events: { people_30d: 0, applications_30d: 0, seam_state: 'dormant' },
  deletions: { authorized_30d: 0, seam_state: 'dormant' },
  rule_changes: { pending: 1, effective_30d: 1, suspended_30d: 1 },
  memory_activity: { planes_active: 0, seam_state: 'dormant' },
  doctrine_line_verbatim: (
    'Violations post as plainly as successes; every violation carries its disposition.'
  ),
  canon_ref: 'Canon §7.1',
};

const SAMPLE_RULES = {
  S_rails: [
    { slug: 'response_class_taxonomy', name: 'response_class.taxonomy',
      value: 'four-class', class_type: 'S', enforcement_class: 'Enforced',
      change_authority: 'Owner ruling only', read_only: true,
      enforcement_count_30d: 0, violation_count_30d: 0 },
  ],
  O_rules: [
    { slug: 'retention_default_window', name: 'retention.default_window_days',
      value: null, class_type: 'O', enforcement_class: 'Enforced',
      change_authority: 'Change-a-Rule ceremony · Canon §7.5', read_only: false,
      enforcement_count_30d: 0, violation_count_30d: 0 },
  ],
  E_engine_settings: [],
  D_registries: [],
  canon_ref: 'Canon §7.3',
};


/* =============================================================================
   CELL 1 · gate_trust_center_two_halves
   ============================================================================= */
describe('UI-1-B · gate_trust_center_two_halves', () => {
  it('renders Rule inventory + Record halves side-by-side (Canon §7.1)', async () => {
    api.governEnforcementClassSplit.mockResolvedValueOnce({ status: 200, body: SAMPLE_SPLIT });
    api.governTrustCenterRecord.mockResolvedValueOnce({ status: 200, body: SAMPLE_RECORD });
    api.governEstateRulesRecord.mockResolvedValueOnce({ status: 200, body: SAMPLE_RULES });
    render(<MemoryRouter><GovernHomePage /></MemoryRouter>);
    // Wait until BOTH halves have populated state (all three API calls resolved).
    await waitFor(() => expect(screen.getByTestId('govern-half-rule-inventory')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId('govern-half-record')).toBeInTheDocument());
    // Two-halves grid container is present.
    expect(screen.getByTestId('govern-two-halves')).toBeInTheDocument();
    // Canon §7.1 doctrine line VERBATIM in DOM.
    const doctrine = screen.getByTestId('govern-record-doctrine-verbatim');
    expect(doctrine.textContent).toBe(SAMPLE_RECORD.doctrine_line_verbatim);
    // Every §7.1 record bucket lands as a discrete element.
    for (const b of [
      'refusals', 'holds', 'masking', 'access', 'deletions', 'rule-changes', 'memory',
    ]) {
      expect(screen.getByTestId(`govern-record-bucket-${b}`)).toBeInTheDocument();
    }
    // Reverse-route: holds bucket links to /govern/holds (§7.6).
    expect(
      screen.getByTestId('govern-record-bucket-holds-route')
    ).toHaveAttribute('href', '/govern/holds');
  });
});


/* =============================================================================
   CELL 2 · gate_enforcement_split_line
   ============================================================================= */
describe('UI-1-B · gate_enforcement_split_line', () => {
  it('renders enforced+attested+monitored split with the "neither is superior" plain line', async () => {
    api.governEnforcementClassSplit.mockResolvedValueOnce({ status: 200, body: SAMPLE_SPLIT });
    api.governTrustCenterRecord.mockResolvedValueOnce({ status: 200, body: SAMPLE_RECORD });
    api.governEstateRulesRecord.mockResolvedValueOnce({ status: 200, body: SAMPLE_RULES });
    render(<MemoryRouter><GovernHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('govern-enforcement-class-headline')).toBeInTheDocument());
    // THREE distinct sub-figures for the split (never merged into a single ratio).
    expect(screen.getByTestId('govern-headline-machinery')).toHaveTextContent('3');
    expect(screen.getByTestId('govern-headline-attestation')).toHaveTextContent('1');
    expect(screen.getByTestId('govern-headline-monitored')).toHaveTextContent('1');
    // Plain-language line renders VERBATIM in DOM and does not urge conversion.
    const line = screen.getByTestId('govern-headline-plain-line');
    expect(line.textContent).toContain('Neither is superior');
    expect(line.textContent).not.toMatch(/convert|promote|prefer/i);
  });
});


/* =============================================================================
   CELL 3 · gate_ceremony_countdown_visible_and_cancelable
   ============================================================================= */
describe('UI-1-B · gate_ceremony_countdown_visible_and_cancelable', () => {
  it('renders a live countdown while pending_delay AND a cancel affordance that routes through the checker; canceled proposal renders as a record, not deleted', async () => {
    const RID = 'rc-ui1b-test';
    const now = Date.now();
    const endsAt = new Date(now + 90 * 1000).toISOString();
    // Initial initiate → pending_delay.
    api.checkerInitiate.mockResolvedValueOnce({
      status: 200,
      body: {
        request_id: RID,
        state: 'pending_delay',
        rule_class: 'retention_windows',
        from_value_ref: '30',
        to_value_ref: '90',
        consequence_class: 'loosening_symmetric',
        initiated_at: new Date(now).toISOString(),
        effective_at: endsAt,
        effective_delay_seconds: 90,
      },
    });
    // Polling reads (any number of subsequent reads).
    api.checkerRequestRead.mockResolvedValue({
      status: 200,
      body: {
        request_id: RID,
        state: 'pending_delay',
        rule_class: 'retention_windows',
        from_value_ref: '30',
        to_value_ref: '90',
        consequence_class: 'loosening_symmetric',
        initiated_at: new Date(now).toISOString(),
        effective_at: endsAt,
        countdown_ends_at_iso: endsAt,
      },
    });

    render(<MemoryRouter><GovernChangeRulePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('govern-change-rule-from'), { target: { value: '30' } });
    fireEvent.change(screen.getByTestId('govern-change-rule-to'), { target: { value: '90' } });
    fireEvent.submit(screen.getByTestId('govern-change-rule-initiate-btn').closest('form'));
    // Countdown becomes visible in DOM (rendered location).
    await waitFor(() => expect(screen.getByTestId('govern-change-rule-countdown')).toBeInTheDocument());
    expect(screen.getByTestId('govern-change-rule-countdown').textContent).toMatch(/\d{2}:\d{2}:\d{2}/);
    // Cancel block + reason input + button are rendered.
    expect(screen.getByTestId('govern-change-rule-cancel-block')).toBeInTheDocument();
    const btn = screen.getByTestId('govern-change-rule-cancel-btn');
    expect(btn).toBeDisabled();  // no reason yet.
    fireEvent.change(screen.getByTestId('govern-change-rule-cancel-reason'), { target: { value: 'testing cancel' } });
    expect(btn).not.toBeDisabled();

    // Cancel through the real checker state machine (mocked).
    api.checkerCancel.mockResolvedValueOnce({
      status: 200,
      body: { state: 'suspended', prior_state: 'pending_delay', suspend_reason: 'testing cancel', suspended_at: new Date().toISOString() },
    });
    // After cancel, the polling read returns suspended state (record preserved).
    api.checkerRequestRead.mockResolvedValueOnce({
      status: 200,
      body: {
        request_id: RID,
        state: 'suspended',
        prior_state: 'pending_delay',
        rule_class: 'retention_windows',
        from_value_ref: '30',
        to_value_ref: '90',
        consequence_class: 'loosening_symmetric',
        suspended_at: new Date().toISOString(),
        suspend_reason: 'testing cancel',
      },
    });
    fireEvent.click(btn);
    // The cancel routed through api.checkerCancel (not a UI-only cancel).
    await waitFor(() => expect(api.checkerCancel).toHaveBeenCalledWith(RID, 'testing cancel'));
    // Suspended state renders as a RECORD in DOM (not removed).
    await waitFor(() => expect(screen.getByTestId('govern-change-rule-suspended-record')).toBeInTheDocument());
    expect(
      screen.getByTestId('govern-change-rule-suspend-reason').textContent
    ).toBe('testing cancel');
  });
});


/* =============================================================================
   CELL 4 · gate_registries_asymmetry_route
   ============================================================================= */
describe('UI-1-B · gate_registries_asymmetry_route', () => {
  it('additions-only diff commits with a receipt; a diff with removals/edits refuses at commit with route to Change-a-Rule', async () => {
    // ---- (a) additions-only path ----
    api.governRegistryUpload.mockResolvedValueOnce({ status: 200, body: { upload_id: 'up-1', row_count: 2 } });
    api.governRegistryDiff.mockResolvedValueOnce({
      status: 200,
      body: { added: [{ id: 'a' }, { id: 'b' }], removed: [], changed: [], approval_required: false, registry_name: 'r' },
    });
    api.governRegistryCommit.mockResolvedValueOnce({
      status: 200,
      body: { version: 1, registry_name: 'r', effective_from_iso: 't', receipt_ref: 'trcv-reg-x', row_count: 2 },
    });

    render(<MemoryRouter><GovernRegistriesPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('registries-upload-btn'));
    await waitFor(() => expect(screen.getByTestId('registries-diff-added')).toBeInTheDocument());
    // No approval_required affordance visible for additions-only path.
    expect(screen.queryByTestId('registries-diff-approval-required')).toBeNull();
    // The Commit affordance is present.
    const commitBtn = screen.getByTestId('registries-commit-btn');
    fireEvent.click(commitBtn);
    await waitFor(() => expect(screen.getByTestId('registries-step-commit')).toBeInTheDocument());
    expect(screen.getByTestId('registries-commit-receipt').textContent).toContain('trcv-reg-x');
  });

  it('removals-or-edits diff refuses at commit AND surfaces a route to Change-a-Rule', async () => {
    // ---- (b) removals/edits path ----
    api.governRegistryUpload.mockResolvedValueOnce({ status: 200, body: { upload_id: 'up-2', row_count: 1 } });
    api.governRegistryDiff.mockResolvedValueOnce({
      status: 200,
      body: {
        added: [],
        removed: [{ id: 'x' }],
        changed: [],
        approval_required: true,
        registry_name: 'r',
        asymmetry_note: 'additions take effect immediately; removals + edits require approval',
      },
    });

    render(<MemoryRouter><GovernRegistriesPage /></MemoryRouter>);
    fireEvent.click(screen.getByTestId('registries-upload-btn'));
    await waitFor(() => expect(screen.getByTestId('registries-diff-approval-required')).toBeInTheDocument());
    // Commit button is NOT rendered when approval_required is true — the
    // asymmetry is visible in DOM at the diff step (server-side enforcement
    // still runs as a belt-and-suspenders).
    expect(screen.queryByTestId('registries-commit-btn')).toBeNull();
    // Change-a-Rule route affordance is rendered as a link to /govern/change-rule.
    const route = screen.getByTestId('registries-diff-change-a-rule-affordance');
    expect(route).toHaveAttribute('href', '/govern/change-rule');
  });
});


/* =============================================================================
   CELL 5 · gate_holds_reverse_route_carries_sample_badge
   ============================================================================= */
describe('UI-1-B · gate_holds_reverse_route_carries_sample_badge', () => {
  it('every hold links back to the originating /use-data/wizard/:sessionId AND carries the SAMPLE badge when the seeded fixture is present', async () => {
    api.governHolds.mockResolvedValueOnce({
      status: 200,
      body: {
        count: 1,
        holds: [{
          session_id: 's-sample-held-abc123',
          operator_id: 'op-xyz',
          door: 'train_a_model',
          verdict_ref: 'trcv-sample-held-train-a-model-fixture',
          proposed_spend_usd: 1450,
          auto_run_ceiling_usd: 1000,
          held_since_iso: 't',
          hold_reason_verbatim: 'Proposed spend $1,450.00 exceeds auto-run ceiling $1,000.00.',
          is_sample: true,
          reverse_route: '/use-data/wizard/s-sample-held-abc123',
        }],
        canon_ref: 'Canon §7.6',
      },
    });
    render(<MemoryRouter><GovernHoldsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('govern-hold-row-s-sample-held-abc123')).toBeInTheDocument());
    // Reverse-route href renders to the exact /use-data/wizard/:sessionId.
    const route = screen.getByTestId('govern-hold-reverse-route-s-sample-held-abc123');
    expect(route).toHaveAttribute('href', '/use-data/wizard/s-sample-held-abc123');
    // SAMPLE badge renders (Owner viewable-build addendum).
    expect(screen.getByTestId('govern-hold-sample-badge-s-sample-held-abc123')).toBeInTheDocument();
    // Verdict envelope reference is rendered verbatim.
    expect(
      screen.getByTestId('govern-hold-verdict-ref-s-sample-held-abc123').textContent
    ).toContain('trcv-sample-held-train-a-model-fixture');
  });
});
