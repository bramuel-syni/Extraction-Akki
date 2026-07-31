/**
 * Phase 8 Stage B-3 First Commit — B-2 §2.3 CommitReview "You said" vs
 * "Agent assumed" structural DOM separation gate.
 *
 * Owner phrasing: "anti-laundering seam made visible" — treat this as a
 * first-class governance gate. The §2.3 verbatim surface renders two
 * sections separately:
 *   * "You supplied"              — operator-sourced values
 *   * "Agent assumed — confirm or change" — agent-inferred values
 *
 * The anti-laundering invariant (Owner E3, Phase 7 B-1 CommittedValue_v0
 * source-tag XOR): a committed value is EITHER operator-supplied OR
 * agent-assumed, never both, and the surface MUST render them as
 * structurally-separate DOM subtrees with distinct semantic labels so a
 * reviewer visually sees which values carry which source.
 *
 * Gates:
 *   G1: Both sections mount as distinct DOM nodes.
 *   G2: You-supplied section's <ul> contains ONLY you-supplied testids
 *       (no agent-assumed row leaks in).
 *   G3: Agent-assumed section's <ul> contains ONLY agent-assumed testids
 *       (no you-supplied row leaks in).
 *   G4: Each agent-assumed row carries the amber "agent-assumed" chip
 *       and a "change" affordance — the two markers that distinguish
 *       agent-supplied provenance from operator-supplied.
 *   G5: The two sections' headings use verbatim UI Spec §2.3 language.
 *
 * Note: mocks use plain functions rather than jest.fn() because CRA's
 * default test runner enables `resetMocks: true`, which wipes jest.fn
 * implementations between tests. Plain functions are stable across resets.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
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
  }),
  AuthProvider: ({ children }) => children,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ sessionId: 'wiz-jest-sep-abc123' }),
}));

jest.mock('../../apiClient', () => {
  const mockedApi = {
    wizardOperatorCommitReview: () =>
      Promise.resolve({
        status: 200,
        body: {
          session_id: 'wiz-jest-sep-abc123',
          variant: 'operator',
          ready_to_freeze: true,
          you_supplied: [
            { field: 'reach', value: { region: 'KE', vertical: 'macro' } },
            { field: 'envelope.done_condition', value: 'delivered_by_2026-08-01' },
            { field: 'envelope.budget', value: 5000 },
            { field: 'envelope.lawful_basis', value: 'legitimate_interest' },
          ],
          agent_assumed_items: [
            { field: 'output.grain', value: 'synthesized_whole' },
            { field: 'output.standard', value: 'utterance' },
          ],
          violations: [],
          license_class_drift: null,
        },
      }),
    wizardOperatorFreeze: () =>
      Promise.resolve({
        status: 200,
        body: {
          session_id: 'wiz-jest-sep-abc123',
          status: 'frozen',
          trace_id: 'trace-jest-sep',
          ledger_run_id: 'run-jest-sep',
        },
      }),
  };
  return {
    __esModule: true,
    default: mockedApi,
    api: mockedApi,
    formatApiErrorDetail: (d) => (typeof d === 'string' ? d : JSON.stringify(d)),
  };
});

// eslint-disable-next-line import/first
import CommitReviewPage from '../../pages/operator/CommitReviewPage';

async function renderReview() {
  const r = render(
    <BrowserRouter>
      <CommitReviewPage />
    </BrowserRouter>
  );
  await screen.findByTestId('commit-review-page');
  await screen.findByTestId('you-supplied-section');
  await screen.findByTestId('agent-assumed-section');
  return r;
}

describe('Phase 8 B-3 coverage gate: §2.3 you-said vs agent-assumed structural DOM separation (anti-laundering seam visible)', () => {
  test('G1: Both "You supplied" and "Agent assumed" sections mount as distinct DOM subtrees', async () => {
    await renderReview();
    const ySup = screen.getByTestId('you-supplied-section');
    const aAss = screen.getByTestId('agent-assumed-section');
    expect(ySup).toBeInTheDocument();
    expect(aAss).toBeInTheDocument();
    expect(ySup.contains(aAss)).toBe(false);
    expect(aAss.contains(ySup)).toBe(false);
    expect(ySup.tagName.toLowerCase()).toBe('section');
    expect(aAss.tagName.toLowerCase()).toBe('section');
  });

  test('G2: You-supplied section contains ONLY you-supplied testids (no agent-assumed leak-in)', async () => {
    await renderReview();
    const ySup = screen.getByTestId('you-supplied-section');
    const ySupRows = within(ySup).getAllByTestId(/^you-supplied-/);
    // 4 fixture rows + the section root itself (also matches /^you-supplied-/).
    expect(ySupRows.length).toBeGreaterThanOrEqual(4);
    expect(within(ySup).queryAllByTestId(/^agent-assumed-/).length).toBe(0);
    expect(within(ySup).queryAllByTestId(/^agent-assumed-chip-/).length).toBe(0);
    expect(within(ySup).queryAllByTestId(/^agent-assumed-change-/).length).toBe(0);
  });

  test('G3: Agent-assumed section contains ONLY agent-assumed testids (no you-supplied leak-in)', async () => {
    await renderReview();
    const aAss = screen.getByTestId('agent-assumed-section');
    // Match agent-assumed row testids (agent-assumed-<field>) but NOT chip/change subvariants.
    const aAssRows = within(aAss).getAllByTestId(/^agent-assumed-(output|reach|envelope)/);
    expect(aAssRows.length).toBeGreaterThanOrEqual(2);
    expect(within(aAss).queryAllByTestId(/^you-supplied-/).length).toBe(0);
  });

  test('G4: Every agent-assumed row carries the amber chip AND the "change" affordance', async () => {
    await renderReview();
    const aAss = screen.getByTestId('agent-assumed-section');
    expect(within(aAss).getByTestId('agent-assumed-chip-output.grain')).toHaveTextContent('agent-assumed');
    expect(within(aAss).getByTestId('agent-assumed-change-output.grain')).toHaveTextContent('change');
    expect(within(aAss).getByTestId('agent-assumed-chip-output.standard')).toHaveTextContent('agent-assumed');
    expect(within(aAss).getByTestId('agent-assumed-change-output.standard')).toHaveTextContent('change');
    // The you-supplied rows must NOT carry either marker.
    const ySup = screen.getByTestId('you-supplied-section');
    expect(within(ySup).queryAllByText('agent-assumed').length).toBe(0);
    expect(within(ySup).queryAllByText('change').length).toBe(0);
  });

  test('G5: Each section carries a distinct, UI-Spec-§2.3-verbatim heading', async () => {
    await renderReview();
    const ySup = screen.getByTestId('you-supplied-section');
    const aAss = screen.getByTestId('agent-assumed-section');
    expect(within(ySup).getByText('You supplied')).toBeInTheDocument();
    expect(within(aAss).getByText('Agent assumed — confirm or change')).toBeInTheDocument();
    expect(within(aAss).queryByText('You supplied')).not.toBeInTheDocument();
    expect(within(ySup).queryByText('Agent assumed — confirm or change')).not.toBeInTheDocument();
  });
});
