/**
 * Phase 8 Stage B-5b — structural tests for Compliance rulebook-write UI,
 * B-4 read-only retrofit view, and CounterSignBanner button augmentations
 * (Owner Rulings B5b-E1..B5b-E5, Amendment H).
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');
// eslint-disable-next-line import/first
import axios from 'axios';

// eslint-disable-next-line import/first
import ComplianceRulebookWritePage from '../../pages/compliance/ComplianceRulebookWritePage';
// eslint-disable-next-line import/first
import AdminComplianceReadOnlyView, {
  OWNED_BY_COMPLIANCE_MARKER,
} from '../../pages/master_admin/AdminComplianceReadOnlyView';
// eslint-disable-next-line import/first
import { CounterSignBanner } from '../../components/ui_spec_v1';

describe('Phase 8 B-5b — Compliance Rulebook Write Page', () => {
  beforeEach(() => {
    axios.post.mockReset();
    axios.get.mockReset();
  });

  test('page renders 4 rule-class writers with testids', () => {
    render(
      <MemoryRouter>
        <ComplianceRulebookWritePage />
      </MemoryRouter>
    );
    expect(screen.getByTestId('compliance-rulebook-write-page')).toBeTruthy();
    expect(screen.getByTestId('retention-writer')).toBeTruthy();
    expect(screen.getByTestId('disclosure-writer')).toBeTruthy();
    expect(screen.getByTestId('lawful-basis-writer')).toBeTruthy();
    expect(screen.getByTestId('source-standing-writer')).toBeTruthy();
  });

  test('disclosure writer exposes constrained-str dropdown (B5b-E3 γ)', () => {
    render(
      <MemoryRouter>
        <ComplianceRulebookWritePage />
      </MemoryRouter>
    );
    const select = screen.getByTestId('disclosure-writer-type');
    expect(select).toBeTruthy();
    // Registry v0 sub-classes per disclosure_types.v0.json.
    expect(select.querySelector('option[value="k_anonymity"]')).toBeTruthy();
    expect(select.querySelector('option[value="l_diversity"]')).toBeTruthy();
    expect(select.querySelector('option[value="dp_budget"]')).toBeTruthy();
  });

  test('B5b-E2 α — no client-side rulebook validation before server call', async () => {
    axios.post.mockResolvedValueOnce({
      data: { state: 'pending_delay', consequence_class: 'tightening_unilateral', request_id: 'x' },
    });
    render(
      <MemoryRouter>
        <ComplianceRulebookWritePage />
      </MemoryRouter>
    );
    // Submit with clearly-invalid values (empty from). The frontend must
    // still send the request; server validates.
    fireEvent.change(screen.getByTestId('source-standing-writer-from'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByTestId('source-standing-writer-to'), {
      target: { value: 'anything' },
    });
    fireEvent.click(screen.getByTestId('source-standing-writer-submit'));
    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  test('server error renders verbatim (Ruling B5b-E2 α)', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { detail: 'server plain-language error text' } },
    });
    render(
      <MemoryRouter>
        <ComplianceRulebookWritePage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByTestId('lawful-basis-writer-from'), {
      target: { value: 'consent' },
    });
    fireEvent.change(screen.getByTestId('lawful-basis-writer-to'), {
      target: { value: 'legitimate_interest' },
    });
    fireEvent.click(screen.getByTestId('lawful-basis-writer-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('lawful-basis-writer-error')).toBeTruthy()
    );
    expect(screen.getByTestId('lawful-basis-writer-error').textContent).toBe(
      'server plain-language error text'
    );
  });
});

describe('Phase 8 B-5b — AdminComplianceReadOnlyView (RT-R1)', () => {
  test('renders read-only view with owned-by-Compliance marker verbatim', () => {
    render(<AdminComplianceReadOnlyView />);
    expect(screen.getByTestId('admin-compliance-read-only-view')).toBeTruthy();
    expect(OWNED_BY_COMPLIANCE_MARKER).toBe('owned by Compliance');
    // Verbatim marker present on all 4 compliance classes.
    for (const rc of [
      'retention_windows',
      'disclosure_thresholds',
      'lawful_basis_registry',
      'source_standing_table',
    ]) {
      expect(screen.getByTestId(`admin-compliance-marker-${rc}`).textContent).toBe(
        OWNED_BY_COMPLIANCE_MARKER
      );
    }
  });

  test('no write button present (RT-R2 in-miniature)', () => {
    const { container } = render(<AdminComplianceReadOnlyView />);
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(0);
  });
});

describe('Phase 8 B-5b — CounterSignBanner button augmentations (B5b-E1 α)', () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
  });

  test('countersign button renders per pending item', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        pending: [
          {
            request_id: 'rc-1',
            rule_class: 'retention_windows',
            initiator_role: 'compliance',
            state: 'pending_counter_sign',
            consequence_class: 'dual_control',
          },
        ],
        count: 1,
      },
    });
    render(<CounterSignBanner role="admin" token="t" />);
    await waitFor(() =>
      expect(screen.getByTestId('counter-sign-btn-rc-1')).toBeTruthy()
    );
  });

  test('test_suspend_button_absent_on_dual_control_rows (Ruling B5b-E1 named gate)', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        pending: [
          {
            request_id: 'rc-dual',
            rule_class: 'retention_windows',
            initiator_role: 'compliance',
            state: 'pending_counter_sign',
            consequence_class: 'dual_control',
          },
        ],
        count: 1,
      },
    });
    render(<CounterSignBanner role="admin" token="t" canSuspend={true} />);
    await waitFor(() =>
      expect(screen.getByTestId('counter-sign-banner-item-rc-dual')).toBeTruthy()
    );
    // Absence gate — Suspend button MUST NOT render on dual_control rows.
    expect(screen.queryByTestId('suspend-by-owner-btn-rc-dual')).toBeNull();
  });

  test('suspend button renders on tightening_unilateral rows for master_admin', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        pending: [
          {
            request_id: 'rc-tight',
            rule_class: 'source_standing_table',
            initiator_role: 'admin',
            state: 'pending_delay',
            consequence_class: 'tightening_unilateral',
          },
        ],
        count: 1,
      },
    });
    render(<CounterSignBanner role="admin" token="t" canSuspend={true} />);
    await waitFor(() =>
      expect(screen.getByTestId('suspend-by-owner-btn-rc-tight')).toBeTruthy()
    );
    // Label distinct per Ruling B5b-E1: "Suspend by Owner" vs "Countersign".
    expect(screen.getByTestId('suspend-by-owner-btn-rc-tight').textContent).toBe(
      'Suspend by Owner'
    );
  });

  test('suspend button absent when canSuspend=false even on tightening rows', async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        pending: [
          {
            request_id: 'rc-tight-2',
            rule_class: 'source_standing_table',
            initiator_role: 'admin',
            state: 'pending_delay',
            consequence_class: 'tightening_unilateral',
          },
        ],
        count: 1,
      },
    });
    render(<CounterSignBanner role="admin" token="t" canSuspend={false} />);
    await waitFor(() =>
      expect(screen.getByTestId('counter-sign-banner-item-rc-tight-2')).toBeTruthy()
    );
    expect(screen.queryByTestId('suspend-by-owner-btn-rc-tight-2')).toBeNull();
  });
});
