/* Phase 3 sub-cycle 3 — Govern module UI gate roster.
 *
 * Owner ruling 2026-08-02 (sub-cycle 3 dispatch).
 * Twelve FB gate cells per Stage A §4:
 *   4 UI-Jest (this file) + 8 backend-pytest (test_govern_g_g1_to_g_g8.py)
 *
 * UI cells:
 *   1. gate_govern_home_renders_rule_inventory_with_class_chip
 *      — every rule row has BOTH a value-class chip AND an enforcement chip.
 *   2. gate_retention_unset_banner_verbatim
 *      — UNSET_RETENTION_BANNER renders byte-identical when applicable.
 *   3. gate_change_rule_ceremony_direction_symmetry
 *      — direction chip computed from numeric deltas; wrong-capacity
 *        countersign renders access-control-denial (navy · NOT governed).
 *   4. gate_refusal_health_gap_files_via_wizard_door
 *      — every family card carries a `File as extraction candidate →`
 *        action routing to /use-data (UI-1-A cutover · 2026-07-31).
 */
import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

import { AKKI_V4_PALETTE, RESPONSE_CLASS } from '../../design/akkiv4_design_system';
import { UNSET_RETENTION_BANNER, REFUSAL_ACTION_TRIPLET, FROZEN_IS_IMMUTABLE } from '../../design/ratified_copy';

import GovernHomePage from '../../pages/govern/GovernHomePage';
import GovernRetentionPage from '../../pages/govern/GovernRetentionPage';
import GovernChangeRulePage from '../../pages/govern/GovernChangeRulePage';
import GovernRefusalHealthPage from '../../pages/govern/GovernRefusalHealthPage';
import GovernPendingPage from '../../pages/govern/GovernPendingPage';

jest.mock('../../apiClient', () => {
  const mock = {
    complianceRetentionConfig: jest.fn(),
    complianceRetentionWrite: jest.fn(),
    complianceRefusalsCoverage: jest.fn(),
    complianceRefusalsByMonth: jest.fn(),
    complianceAuthorizedDeletion: jest.fn(),
    checkerPending: jest.fn(),
    checkerInitiate: jest.fn(),
    checkerCountersign: jest.fn(),
    checkerObject: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset && fn.mockReset());
});

const UNSET_CONFIG = {
  global_default: { days: null, set_at: null, set_by: null },
  held_classes: [
    { class_name: 'ledger_row', posture: 'unset', days: null, set_at: null, set_by: null },
    { class_name: 'wizard_transcript', posture: 'unset', days: null, set_at: null, set_by: null },
    { class_name: 'delivered_artifact', posture: 'unset', days: null, set_at: null, set_by: null },
  ],
  resolved_at: '2026-08-02T12:00:00Z',
};

const SET_CONFIG = {
  global_default: { days: 90, set_at: '2026-08-01T00:00:00Z', set_by: 'admin' },
  held_classes: [
    { class_name: 'ledger_row', posture: 'inheriting', days: 90, set_at: null, set_by: null },
    { class_name: 'wizard_transcript', posture: 'explicit', days: 30, set_at: '2026-08-01T00:00:00Z', set_by: 'dpo' },
    { class_name: 'delivered_artifact', posture: 'inheriting', days: 90, set_at: null, set_by: null },
  ],
  resolved_at: '2026-08-02T12:00:00Z',
};

/* =============================================================================
   CELL 1 · govern home renders rule inventory with class chips.
   ============================================================================= */
describe('Phase-3-SubC3 · gate_govern_home_renders_rule_inventory_with_class_chip', () => {
  it('every rule row carries BOTH a value-class chip AND an enforcement chip', async () => {
    api.complianceRetentionConfig.mockResolvedValueOnce({ status: 200, body: SET_CONFIG });
    api.checkerPending.mockResolvedValueOnce({ status: 200, body: { pending: [], count: 0 } });
    render(<MemoryRouter><GovernHomePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-home-rule-inventory')).toBeInTheDocument()
    );
    // Iterate over each rendered rule row and assert both chips exist.
    const rows = document.querySelectorAll('[data-testid^="govern-rule-row-"]');
    expect(rows.length).toBeGreaterThanOrEqual(3);
    rows.forEach((row) => {
      const slug = row.getAttribute('data-testid').replace('govern-rule-row-', '');
      expect(within(row).getByTestId(`govern-rule-value-class-${slug}`)).toBeInTheDocument();
      expect(within(row).getByTestId(`govern-rule-enforcement-${slug}`)).toBeInTheDocument();
    });
    // Pending link is reachable from the home surface (Surfaces v2 shell rule).
    expect(screen.getByTestId('govern-home-pending-link')).toHaveAttribute('href', '/govern/pending');
  });
});

/* =============================================================================
   CELL 2 · UNSET_RETENTION_BANNER renders byte-identical.
   ============================================================================= */
describe('Phase-3-SubC3 · gate_retention_unset_banner_verbatim', () => {
  it('home renders the ratified unset-retention banner byte-identical when global default is null', async () => {
    api.complianceRetentionConfig.mockResolvedValueOnce({ status: 200, body: UNSET_CONFIG });
    api.checkerPending.mockResolvedValueOnce({ status: 200, body: { pending: [], count: 0 } });
    render(<MemoryRouter><GovernHomePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-home-unset-retention-copy')).toBeInTheDocument()
    );
    // Byte-identical string check.
    expect(screen.getByTestId('govern-home-unset-retention-copy').textContent).toBe(UNSET_RETENTION_BANNER);
  });

  it('retention page also renders the same ratified banner byte-identical', async () => {
    api.complianceRetentionConfig.mockResolvedValueOnce({ status: 200, body: UNSET_CONFIG });
    render(<MemoryRouter><GovernRetentionPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-retention-unset-copy')).toBeInTheDocument()
    );
    expect(screen.getByTestId('govern-retention-unset-copy').textContent).toBe(UNSET_RETENTION_BANNER);
    // Per-class MarkedOpenSlot markers for unset rows.
    for (const cls of ['ledger_row', 'wizard_transcript', 'delivered_artifact']) {
      const row = screen.getByTestId(`govern-retention-value-${cls}`);
      expect(within(row).getByTestId(`open-copy-slot-retention_window_${cls}`)).toBeInTheDocument();
    }
  });

  it('home does NOT render the unset banner when all classes are set (posture-set banner instead)', async () => {
    api.complianceRetentionConfig.mockResolvedValueOnce({ status: 200, body: SET_CONFIG });
    api.checkerPending.mockResolvedValueOnce({ status: 200, body: { pending: [], count: 0 } });
    render(<MemoryRouter><GovernHomePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-home-posture-set-banner')).toBeInTheDocument()
    );
    expect(screen.queryByTestId('govern-home-unset-retention-banner')).toBeNull();
  });
});

/* =============================================================================
   CELL 3 · change-rule ceremony direction symmetry + auth-denial discipline.
   ============================================================================= */
describe('Phase-3-SubC3 · gate_change_rule_ceremony_direction_symmetry', () => {
  it('numeric loosening (from<to) renders the loosening (oxblood) direction chip', async () => {
    render(<MemoryRouter><GovernChangeRulePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('govern-change-rule-from'), { target: { value: '30' } });
    fireEvent.change(screen.getByTestId('govern-change-rule-to'), { target: { value: '90' } });
    expect(screen.getByTestId('govern-change-rule-direction-chip-loosening')).toBeInTheDocument();
    // Assert oxblood accent chosen for loosening (design law).
    expect(RESPONSE_CLASS.GOVERNED_REFUSAL.accentColor).toBe(AKKI_V4_PALETTE.oxblood);
  });

  it('numeric tightening (from>to) renders the tightening (sage) direction chip', async () => {
    render(<MemoryRouter><GovernChangeRulePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('govern-change-rule-from'), { target: { value: '90' } });
    fireEvent.change(screen.getByTestId('govern-change-rule-to'), { target: { value: '30' } });
    expect(screen.getByTestId('govern-change-rule-direction-chip-tightening')).toBeInTheDocument();
  });

  it('wrong-capacity countersign renders ACCESS-CONTROL-DENIAL (navy) — NOT governed refusal', async () => {
    api.checkerPending.mockResolvedValueOnce({
      status: 200,
      body: {
        pending: [{
          request_id: 'req-x',
          rule_class: 'retention_windows',
          from_value_ref: 'null',
          to_value_ref: '90',
          consequence_class: 'dual_control',
          state: 'pending_counter_sign',
          initiator_id: 'someone@example',
          initiator_role: 'admin',
          initiated_at: '2026-08-02T10:00:00Z',
        }],
        count: 1,
      },
    });
    api.checkerCountersign.mockResolvedValueOnce({
      status: 403,
      body: {
        reason: 'auth_scope_insufficient',
        detail: 'wrong capacity for this rule change',
      },
    });
    render(<MemoryRouter><GovernPendingPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-pending-req-req-x')).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId('govern-pending-countersign-req-x'));
    await waitFor(() =>
      expect(screen.getByTestId('response-access-control-denial')).toBeInTheDocument()
    );
    // Distinct from governed refusal (four response classes NEVER conflated).
    expect(screen.queryByTestId('response-governed-refusal')).toBeNull();
    expect(RESPONSE_CLASS.ACCESS_CONTROL_DENIAL.accentColor).toBe(AKKI_V4_PALETTE.navy);
  });
});

/* =============================================================================
   CELL 4 · every refusal-family card carries a "File as extraction candidate →"
   action routing to /use-data (UI-1-A cutover · 2026-07-31 · replaces prior
   /operator/commission route).
   ============================================================================= */
describe('Phase-3-SubC3 · gate_refusal_health_gap_files_via_wizard_door', () => {
  it('every refusal family card carries the wizard-door filing action', async () => {
    api.complianceRefusalsCoverage.mockResolvedValueOnce({
      status: 200,
      body: {
        families_since_system_start: [],
        families_since_seam_3: ['objective_missing_lawful_basis', 'coverage_gap'],
        per_family_since_date: {
          objective_missing_lawful_basis: '2026-07-06',
          coverage_gap: '2026-07-07',
        },
        seam_3_earliest_date: '2026-07-06',
        honest_note_when_no_families_covered: null,
      },
    });
    api.complianceRefusalsByMonth.mockResolvedValue({
      status: 200,
      body: { month: '2026-08', families: { objective_missing_lawful_basis: 3, coverage_gap: 5 } },
    });
    render(<MemoryRouter><GovernRefusalHealthPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-refusal-family-objective_missing_lawful_basis')).toBeInTheDocument()
    );
    for (const family of ['objective_missing_lawful_basis', 'coverage_gap']) {
      const card = screen.getByTestId(`govern-refusal-family-${family}`);
      const action = within(card).getByTestId(`govern-refusal-family-${family}-file-gap`);
      expect(action).toHaveTextContent(/File as extraction candidate/);
      expect(action).toHaveAttribute('href', '/use-data');
      // Ratified refusal action triplet rendered verbatim.
      REFUSAL_ACTION_TRIPLET.forEach((line, i) => {
        expect(within(card).getByTestId(`govern-refusal-family-${family}-path-${i}`)).toHaveTextContent(line);
      });
    }
  });

  it('honest empty state renders when NO families are surfaced (never a "no data" error)', async () => {
    api.complianceRefusalsCoverage.mockResolvedValueOnce({
      status: 200,
      body: {
        families_since_system_start: [],
        families_since_seam_3: [],
        per_family_since_date: {},
        seam_3_earliest_date: null,
        honest_note_when_no_families_covered: 'No refusal-terminal row carries a registered family key yet.',
      },
    });
    api.complianceRefusalsByMonth.mockResolvedValue({ status: 200, body: { month: '2026-08', families: {} } });
    render(<MemoryRouter><GovernRefusalHealthPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-refusal-coverage-empty')).toBeInTheDocument()
    );
    expect(screen.getByTestId('govern-refusal-families-empty')).toBeInTheDocument();
    // No error rendered.
    expect(screen.queryByTestId('response-infrastructure-fault')).toBeNull();
    expect(screen.queryByTestId('response-governed-refusal')).toBeNull();
  });
});

/* =============================================================================
   Auxiliary discipline cells (round out coverage — do NOT count against 4 cells).
   ============================================================================= */
describe('Phase-3-SubC3 · aux · applied change acquires FROZEN_IS_IMMUTABLE chip', () => {
  it('the ratified string is RENDERED at the Apply stage caption on initial page load (FB v2 §A5-1 behavioural rule)', async () => {
    render(<MemoryRouter><GovernChangeRulePage /></MemoryRouter>);
    // Ratified string MUST be visible at the ceremony level BEFORE any
    // request is created — the rule is a stage caption, not conditional on
    // effective state. Assertion binds on RENDERED location, not on the
    // constant's existence in a module.
    const applyCaption = screen.getByTestId('govern-change-rule-stage-caption-applied');
    expect(applyCaption).toBeInTheDocument();
    expect(applyCaption).toHaveTextContent(FROZEN_IS_IMMUTABLE);
    // And the rendered text is BYTE-IDENTICAL to the ratified constant.
    expect(applyCaption.textContent).toBe(FROZEN_IS_IMMUTABLE);
  });

  it('effective state also renders the ratified frozen chip on the request card (verbatim)', async () => {
    render(<MemoryRouter><GovernChangeRulePage /></MemoryRouter>);
    api.checkerInitiate.mockResolvedValueOnce({
      status: 200,
      body: {
        request_id: 'req-y',
        state: 'effective',
        consequence_class: 'tightening_unilateral',
        rule_class: 'retention_windows',
      },
    });
    fireEvent.change(screen.getByTestId('govern-change-rule-class'), { target: { value: 'retention_windows' } });
    fireEvent.change(screen.getByTestId('govern-change-rule-from'), { target: { value: '90' } });
    fireEvent.change(screen.getByTestId('govern-change-rule-to'), { target: { value: '30' } });
    fireEvent.click(screen.getByTestId('govern-change-rule-initiate-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('govern-change-rule-applied-frozen-chip')).toBeInTheDocument()
    );
    expect(screen.getByTestId('govern-change-rule-applied-frozen-chip'))
      .toHaveTextContent(FROZEN_IS_IMMUTABLE);
  });
});

describe('Phase-3-SubC3 · aux · pending queue role-aware filter', () => {
  it('capacity picker triggers a role-scoped pending fetch', async () => {
    api.checkerPending.mockImplementation((role) => {
      if (role === 'compliance') return Promise.resolve({
        status: 200,
        body: {
          pending: [{
            request_id: 'req-c1',
            rule_class: 'retention_windows',
            from_value_ref: '30', to_value_ref: '90',
            consequence_class: 'dual_control',
            state: 'pending_counter_sign',
            initiator_id: 'admin@example',
            initiator_role: 'admin',
            initiated_at: '2026-08-02T10:00:00Z',
          }],
          count: 1,
        },
      });
      return Promise.resolve({ status: 200, body: { pending: [], count: 0 } });
    });
    render(<MemoryRouter><GovernPendingPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('govern-pending-req-req-c1')).toBeInTheDocument()
    );
    // Switch capacity to admin — different scope; pending becomes empty.
    fireEvent.change(screen.getByTestId('govern-pending-capacity-picker'), { target: { value: 'admin' } });
    await waitFor(() =>
      expect(screen.getByTestId('govern-pending-empty')).toBeInTheDocument()
    );
    expect(api.checkerPending).toHaveBeenCalledWith('compliance');
    expect(api.checkerPending).toHaveBeenCalledWith('admin');
  });
});
