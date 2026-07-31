/* UI-1-A · SAMPLE badge rendered-location gate (AS-U2 discipline).
 *
 * Owner iter12 addendum verbatim:
 *   "An unmarked sample is a hidden mock — this is the exact defect
 *    class the Owner named. Add a Jest gate asserting the RENDERED
 *    badge on seeded rows (rendered-location discipline, not
 *    constant-existence)."
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../../apiClient';
import UseDataLandingPage from '../../pages/use_data/UseDataLandingPage';

const CEILING_RESPONSE = {
  status: 200,
  body: { ceiling_usd: 1000, currency: 'USD', change_path: 'change_a_rule_ceremony_only' },
};
const SESSIONS_RESPONSE = {
  status: 200,
  body: {
    in_progress: [
      {
        session_id: 's-sample-in-progress-abc123',
        door: 'integrate_an_app',
        opened_at_iso: '2026-07-31T10:00:00Z',
        committed_at_iso: null,
        verdict_ref: null,
        is_sample: true,
      },
    ],
    ready: [
      {
        session_id: 's-sample-ready-abc123',
        door: 'export_or_license',
        opened_at_iso: '2026-07-31T09:00:00Z',
        committed_at_iso: '2026-07-31T09:15:00Z',
        verdict_ref: 'trcv-sample',
        is_sample: true,
      },
    ],
  },
};

function renderLanding() {
  return render(
    <MemoryRouter>
      <UseDataLandingPage />
    </MemoryRouter>,
  );
}

describe('UI-1-A · SAMPLE badge rendered-location gate (AS-U2)', () => {
  let ceilingSpy;
  let listSpy;

  beforeEach(() => {
    ceilingSpy = jest.spyOn(api, 'useDataCeiling').mockResolvedValue(CEILING_RESPONSE);
    listSpy = jest.spyOn(api, 'useDataListSessions').mockResolvedValue(SESSIONS_RESPONSE);
  });

  afterEach(() => {
    ceilingSpy.mockRestore();
    listSpy.mockRestore();
  });

  test('every seeded sample row renders a SAMPLE badge INSIDE the row', async () => {
    renderLanding();
    const inProgRow = await waitFor(() =>
      screen.getByTestId('use-data-pipeline-in-progress-row-s-sample-in-progress-abc123'),
    );
    const readyRow = screen.getByTestId('use-data-pipeline-ready-row-s-sample-ready-abc123');
    const inProgBadge = within(inProgRow).getByTestId('use-data-sample-badge');
    expect(inProgBadge).toBeInTheDocument();
    expect(inProgBadge).toHaveTextContent(/^SAMPLE$/i);
    const readyBadge = within(readyRow).getByTestId('use-data-sample-badge');
    expect(readyBadge).toBeInTheDocument();
    expect(readyBadge).toHaveTextContent(/^SAMPLE$/i);
  });

  test('total number of SAMPLE badges equals the count of is_sample=true rows', async () => {
    renderLanding();
    await waitFor(() => screen.getByTestId('use-data-pipeline-in-progress-row-s-sample-in-progress-abc123'));
    const badges = screen.getAllByTestId('use-data-sample-badge');
    expect(badges).toHaveLength(2);
  });

  test('case-insensitive "sample" occurrences in the pipeline strip DOM are non-zero', async () => {
    renderLanding();
    await waitFor(() => screen.getByTestId('use-data-pipeline-in-progress-row-s-sample-in-progress-abc123'));
    const strip = screen.getByTestId('use-data-pipeline-strip');
    const bodyText = (strip.textContent || '').toLowerCase();
    const matches = bodyText.match(/sample/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  test('the ceiling note renders $1,000 USD Change-a-Rule', async () => {
    renderLanding();
    await waitFor(() =>
      expect(screen.getByTestId('use-data-pipeline-ceiling-note')).toHaveTextContent(/1,000/),
    );
    expect(screen.getByTestId('use-data-pipeline-ceiling-note')).toHaveTextContent(/Change-a-Rule/i);
  });
});
