/**
 * Phase 8 Stage B-3 First Commit — B-2 §2.2 draft rail three visual states.
 *
 * UI Spec v1 §2.2 verbatim:
 *   "Three dimensions + envelope with three visual states —
 *    filled (check), open (muted "— open"), agent-assumed (amber chip)."
 *
 * This gate mounts CommissionWizardPage against a mocked apiClient +
 * useAuth hook and asserts that a `committed_values` payload carrying
 * one field per visual state produces the correct DOM signature:
 *   * `draft-filled-<label>`   — operator-supplied filled row (check)
 *   * `draft-open-<label>`     — no committed value present (muted em-dash)
 *   * `draft-agent-assumed-<label>` — agent-assumed filled row (amber chip)
 *
 * Owner mandate: "three visual states" is verbatim UI Spec language;
 * missing any of the three is a §2.2 rendering-completeness defect.
 * This test is the first-class governance gate.
 *
 * Note: mocks use plain functions rather than jest.fn() because CRA's
 * default test runner enables `resetMocks: true`, which wipes jest.fn
 * implementations between tests. Plain functions are stable across
 * resets (they're not mocks).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock useAuth. IMPORTANT: return a STABLE object so the consuming
// component's useEffect dep-array (which contains `identity`) doesn't
// re-fire endlessly. Fresh object per call = infinite re-render loop.
jest.mock('../../hooks/useAuth', () => {
  const stable = {
    identity: {
      user_id: 'test-op-1',
      email: 'op@example.com',
      name: 'Op',
      roles: ['operator'],
      key_grants: [],
      created_at: '2026-07-05T00:00:00Z',
    },
    login: () => {},
    register: () => {},
    logout: () => {},
    checkSession: () => {},
  };
  return {
    useAuth: () => stable,
    AuthProvider: ({ children }) => children,
  };
});

// Mock apiClient with plain functions. Three visual states — one field per:
//   filled (operator-supplied) → 'reach'
//   agent-assumed              → 'output.grain'
//   open (no committed value)  → 'Budget' (absent from committed_values)
jest.mock('../../apiClient', () => {
  const mockedApi = {
    wizardOperatorStart: () =>
      Promise.resolve({
        status: 201,
        body: { session_id: 'wiz-jest-3vs-abc123', variant: 'operator', status: 'draft' },
      }),
    wizardOperatorTurn: () =>
      Promise.resolve({
        status: 200,
        body: {
          turn_ref: 'turn-jest-3vs-t01',
          agent_content: 'Which reach are you targeting?',
          // Deliberately omit feasibility_snapshot_ref — the draft-rail
          // three-state gate does not depend on the estate-check chip.
          ask_slots: ['reach'],
          at: '2026-07-05T00:00:01Z',
        },
      }),
    wizardOperatorGet: () =>
      Promise.resolve({
        status: 200,
        body: {
          session_id: 'wiz-jest-3vs-abc123',
          variant: 'operator',
          status: 'draft',
          committed_values: {
            reach: { value: { region: 'KE', vertical: 'macro' }, source: 'operator_supplied' },
            'output.grain': { value: 'synthesized_whole', source: 'agent_assumed' },
            // envelope.budget deliberately absent → open state
          },
          turns: [],
          agent_assumptions: [],
        },
      }),
    // Phase 3 sub-cycle 1 · milestone stub (empty non-agreed) — the
    // draft-rail three-state gate does NOT depend on milestone state.
    wizardOperatorGetMilestones: () =>
      Promise.resolve({
        status: 200,
        body: {
          session_id: 'wiz-jest-3vs-abc123',
          milestones: [],
          agreed: false,
          agreed_at: null,
          agreed_by: null,
          updated_at: '2026-08-01T00:00:00Z',
        },
      }),
    wizardOperatorPostMilestones: () =>
      Promise.resolve({ status: 200, body: { milestones: [], agreed: false } }),
    wizardOperatorAgreeMilestones: () =>
      Promise.resolve({ status: 200, body: { agreed: true } }),
  };
  return {
    __esModule: true,
    default: mockedApi,
    api: mockedApi,
    formatApiErrorDetail: (d) => (typeof d === 'string' ? d : JSON.stringify(d)),
  };
});

// eslint-disable-next-line import/first
import CommissionWizardPage from '../../pages/operator/CommissionWizardPage';

async function renderWizard() {
  const r = render(
    <BrowserRouter>
      <CommissionWizardPage />
    </BrowserRouter>
  );
  await screen.findByTestId('commission-wizard-page');
  await screen.findByTestId('commission-draft-rail');
  return r;
}

describe('Phase 8 B-3 coverage gate: §2.2 draft rail three visual states', () => {
  test('filled state — operator-supplied field renders draft-filled-<label> with check', async () => {
    await renderWizard();
    const filled = await screen.findByTestId('draft-filled-Reach');
    expect(filled).toBeInTheDocument();
    expect(screen.queryByTestId('draft-open-Reach')).not.toBeInTheDocument();
    expect(screen.queryByTestId('draft-agent-assumed-Reach')).not.toBeInTheDocument();
  });

  test('agent-assumed state — agent-assumed field renders draft-agent-assumed-<label> with amber chip', async () => {
    await renderWizard();
    const chip = await screen.findByTestId('draft-agent-assumed-Output · grain');
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent('agent-assumed');
    expect(screen.queryByTestId('draft-filled-Output · grain')).not.toBeInTheDocument();
    expect(screen.queryByTestId('draft-open-Output · grain')).not.toBeInTheDocument();
  });

  test('open state — field absent from committed_values renders draft-open-<label> em-dash', async () => {
    await renderWizard();
    const open = await screen.findByTestId('draft-open-Budget');
    expect(open).toBeInTheDocument();
    expect(open).toHaveTextContent('— open');
    expect(screen.queryByTestId('draft-filled-Budget')).not.toBeInTheDocument();
    expect(screen.queryByTestId('draft-agent-assumed-Budget')).not.toBeInTheDocument();
  });

  test('all three visual states coexist in the same draft rail render', async () => {
    await renderWizard();
    // §2.2-verbatim assertion — a live draft rail carries all three renderers
    // simultaneously, not one exclusive path.
    await screen.findByTestId('draft-filled-Reach');
    await screen.findByTestId('draft-agent-assumed-Output · grain');
    await screen.findByTestId('draft-open-Budget');
    expect(screen.getByTestId('draft-filled-Reach')).toBeInTheDocument();
    expect(screen.getByTestId('draft-agent-assumed-Output · grain')).toBeInTheDocument();
    expect(screen.getByTestId('draft-open-Budget')).toBeInTheDocument();
  });
});
