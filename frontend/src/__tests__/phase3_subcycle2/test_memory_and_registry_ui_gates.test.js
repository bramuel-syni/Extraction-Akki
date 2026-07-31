/* Phase 3 sub-cycle 2 — Jest UI-gate roster (Owner ruling 2026-08-02).
 *
 * Twelve FB gate cells enumerated in the Stage A proposal, exercised as
 * component-level Jest tests. Backend HTTP scope enforcement is covered
 * in pytest (test_memory_observability_o_g1_to_o_g6.py); these tests
 * focus on the UI surface obligations:
 *
 *   Memory surface:
 *     M-U1 · plane list renders only what backend returns (scoped list)
 *     M-U2 · plane detail carries class-with-claim marker on each row
 *     M-U3 · revoked plane renders `frozen` chip + no publish/revoke CTA
 *     M-U4 · publication attempt on unset-slot renders GOVERNED refusal
 *            (oxblood accent · outcome=refused rendering · NOT the
 *            navy access-control-denial treatment)
 *     M-U5 · foreign-plane route (403 auth_scope_insufficient) renders
 *            the access-control-denial treatment (navy · never
 *            governed-refusal · never `outcome` key)
 *
 *   Observability panel:
 *     O-U1 · aggregate renders four bucketed sections (envelope + class
 *            counts + publication rate + revocation history)
 *     O-U2 · publication acceptance rate renders as MarkedOpenSlot
 *            when attempted == 0 (never `0/0` as `0%`)
 *     O-U3 · revocation history renders plainly (same weight; never
 *            hidden) when state == revoked
 *     O-U4 · contribution class buckets render as MarkedOpenSlot when
 *            total landed == 0 (unset-vs-empty discipline · FB-13)
 *
 *   Registry Estate Map:
 *     R-U1 · measured-vs-unmeasured dimensions are FIRST-CLASS visual
 *            states (unmeasured hatched via MarkedOpenSlot · NEVER
 *            zero for unmeasured)
 *     R-U2 · every figure on the map carries a method chip
 *     R-U3 · inference overlay renders as dormant-capability chip
 *            (never fake numbers)
 *     R-U4 · every coverage gap pairs with a `Propose census →` action
 */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

import { AKKI_V4_PALETTE, RESPONSE_CLASS } from '../../design/akkiv4_design_system';
import MemoryHomePage from '../../pages/memory/MemoryHomePage';
import MemoryPlaneDetailPage from '../../pages/memory/MemoryPlaneDetailPage';
import MemoryPlaneObservabilityPage from '../../pages/memory/MemoryPlaneObservabilityPage';
import RegistryEstateMapPage from '../../pages/registry/RegistryEstateMapPage';

/* =============================================================================
   apiClient stub — memory + registry surface calls under test.
   ============================================================================= */
jest.mock('../../apiClient', () => {
  const mock = {
    memoryListPlanes: jest.fn(),
    memoryGetPlane: jest.fn(),
    memoryGetReconstructedState: jest.fn(),
    memoryGetPlaneObservability: jest.fn(),
    memoryAttemptPublish: jest.fn(),
    memoryRevokePlane: jest.fn(),
    registryReadDimension: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset && fn.mockReset());
});

/* =============================================================================
   Fixtures.
   ============================================================================= */
const PLANE_A = {
  plane_id: 'plane-a-abc123',
  issued_to_integration_key: 'grant-eng-alpha-key',
  tenant_id: 'tenant-A',
  retrieval_scope: 'analytics',
  contribution_store_ref: 'memory_contributions',
  working_set_ref: 'memory_working_set',
  issued_at: '2026-08-02T10:00:00Z',
  state: 'active',
  revoked_at: null,
};
const PLANE_REVOKED = {
  ...PLANE_A,
  plane_id: 'plane-r-frozen',
  state: 'revoked',
  revoked_at: '2026-08-02T12:00:00Z',
};

/* =============================================================================
   M-U1 · plane list renders only what backend returns.
   ============================================================================= */
describe('Phase-3-SubC2 · M-U1 memory home renders scoped list', () => {
  it('lists only planes returned by /api/memory/planes (server-side scope)', async () => {
    api.memoryListPlanes.mockResolvedValueOnce({
      status: 200, body: { planes: [PLANE_A] },
    });
    render(<MemoryRouter><MemoryHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('memory-home-plane-list')).toBeInTheDocument());
    expect(screen.getByTestId(`memory-plane-row-${PLANE_A.plane_id}`)).toBeInTheDocument();
    // Scope note is rendered — the caller sees a first-class scope banner.
    expect(screen.getByTestId('memory-home-scope-note')).toBeInTheDocument();
    expect(screen.getByTestId('memory-home-scope-note'))
      .toHaveTextContent(/only planes bound to your own integration key/i);
  });

  it('renders a governed-empty note (not an error) when backend returns [] ', async () => {
    api.memoryListPlanes.mockResolvedValueOnce({ status: 200, body: { planes: [] } });
    render(<MemoryRouter><MemoryHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('memory-home-empty-note')).toBeInTheDocument());
    // Governed-empty state, not an error class.
    expect(screen.queryByTestId('response-governed-refusal')).toBeNull();
    expect(screen.queryByTestId('response-infrastructure-fault')).toBeNull();
  });
});

/* =============================================================================
   M-U5 · foreign-plane 403 renders as access-control-denial (NOT refusal).
   ============================================================================= */
describe('Phase-3-SubC2 · M-U5 cross-key ACL renders scope-denial treatment', () => {
  it('memory home 403 → access-control-denial panel (navy, not oxblood)', async () => {
    api.memoryListPlanes.mockResolvedValueOnce({
      status: 403,
      body: { reason: 'auth_scope_insufficient', detail: 'Memory scope denied.' },
    });
    render(<MemoryRouter><MemoryHomePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('response-access-control-denial')).toBeInTheDocument()
    );
    // MUST NOT render governed refusal (distinct class visual treatments).
    expect(screen.queryByTestId('response-governed-refusal')).toBeNull();
    // Class-with-claim marker is the auth-denial one, not the refusal one.
    expect(screen.getByTestId('acl-class-with-claim')).toBeInTheDocument();
  });

  it('foreign-plane detail route (403) renders access-control-denial', async () => {
    api.memoryGetPlane.mockResolvedValueOnce({
      status: 403,
      body: { reason: 'auth_scope_insufficient', detail: 'Foreign plane access denied.' },
    });
    api.memoryGetReconstructedState.mockResolvedValueOnce({ status: 403, body: {} });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_A.plane_id}`]}>
        <Routes>
          <Route path="/memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('response-access-control-denial')).toBeInTheDocument()
    );
    // The four-class discipline: access-control-denial is NOT governed refusal.
    expect(screen.queryByTestId('response-governed-refusal')).toBeNull();
    expect(RESPONSE_CLASS.ACCESS_CONTROL_DENIAL.accentColor).toBe(AKKI_V4_PALETTE.navy);
  });
});

/* =============================================================================
   M-U2 · plane detail carries class-with-claim discipline.
   M-U3 · revoked plane renders frozen chip + no revoke CTA.
   M-U4 · publication attempt on unset-slot → governed refusal (oxblood).
   ============================================================================= */
describe('Phase-3-SubC2 · M-U2/3/4 plane detail discipline', () => {
  it('M-U2 · class-with-claim marker rendered on the envelope', async () => {
    api.memoryGetPlane.mockResolvedValueOnce({ status: 200, body: PLANE_A });
    api.memoryGetReconstructedState.mockResolvedValueOnce({
      status: 200,
      body: { contribution_ids: ['wb-c1'], contributions_landed_count: 1, contributions_refused_count: 0 },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_A.plane_id}`]}>
        <Routes>
          <Route path="/memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('plane-envelope-section')).toBeInTheDocument()
    );
    // Class-with-claim: the class marker sits alongside the claim/headline.
    expect(screen.getByTestId('plane-class-with-claim'))
      .toHaveTextContent(/class · plane_v0/);
    // Active chip present, frozen chip absent.
    expect(screen.getByTestId('plane-active-chip')).toBeInTheDocument();
    expect(screen.queryByTestId('plane-frozen-chip')).toBeNull();
  });

  it('M-U3 · revoked plane renders frozen chip + no revoke section', async () => {
    api.memoryGetPlane.mockResolvedValueOnce({ status: 200, body: PLANE_REVOKED });
    api.memoryGetReconstructedState.mockResolvedValueOnce({
      status: 200,
      body: { contribution_ids: [], contributions_landed_count: 0, contributions_refused_count: 0 },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_REVOKED.plane_id}`]}>
        <Routes>
          <Route path="/memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('plane-frozen-chip')).toBeInTheDocument()
    );
    // Ratified copy: "Frozen is immutable." verbatim in the frozen chip.
    expect(screen.getByTestId('plane-frozen-chip')).toHaveTextContent(/Frozen is immutable\./);
    // Revoke section removed (not just disabled). No revoke button in DOM.
    expect(screen.queryByTestId('plane-revocation-section')).toBeNull();
    expect(screen.queryByTestId('plane-revoke-btn')).toBeNull();
    // Publish button visually disabled (frozen · publish not possible).
    expect(screen.getByTestId('publication-attempt-btn')).toBeDisabled();
  });

  it('M-U4 · publication attempt renders GOVERNED refusal (oxblood, outcome=refused)', async () => {
    api.memoryGetPlane.mockResolvedValueOnce({ status: 200, body: PLANE_A });
    api.memoryGetReconstructedState.mockResolvedValueOnce({
      status: 200,
      body: { contribution_ids: ['wb-c1'], contributions_landed_count: 1, contributions_refused_count: 0 },
    });
    api.memoryAttemptPublish.mockResolvedValueOnce({
      status: 422,
      body: {
        outcome: 'refused',
        reason: 'publication_quality_threshold_unset',
        detail: 'PUBLICATION_QUALITY_THRESHOLD [SLOT] unset; fail-loud per SR-5.',
      },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_A.plane_id}`]}>
        <Routes>
          <Route path="/memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('publication-attempt-btn')).toBeInTheDocument()
    );
    screen.getByTestId('publication-attempt-btn').click();
    await waitFor(() =>
      expect(screen.getByTestId('response-governed-refusal')).toBeInTheDocument()
    );
    // Governed refusal has oxblood accent (NEVER the navy access-control-denial).
    expect(RESPONSE_CLASS.GOVERNED_REFUSAL.accentColor).toBe(AKKI_V4_PALETTE.oxblood);
    // Access-control-denial panel MUST NOT be rendered.
    expect(screen.queryByTestId('response-access-control-denial')).toBeNull();
    // Verbatim refusal action triplet (Ruling 4).
    expect(screen.getByTestId('refusal-action-accept'))
      .toHaveTextContent('Accept as recorded statement');
    expect(screen.getByTestId('refusal-action-narrow'))
      .toHaveTextContent('Narrow the objective');
    expect(screen.getByTestId('refusal-action-lower'))
      .toHaveTextContent('Lower the standard');
  });
});

/* =============================================================================
   O-U1/O-U2/O-U3/O-U4 · Observability panel discipline.
   ============================================================================= */
describe('Phase-3-SubC2 · O-U observability panel discipline', () => {
  it('O-U1 · panel renders the four aggregate sections', async () => {
    api.memoryGetPlaneObservability.mockResolvedValueOnce({
      status: 200,
      body: {
        plane_id: PLANE_A.plane_id,
        state: 'active',
        issued_at: PLANE_A.issued_at,
        revoked_at: null,
        contribution_class_counts: { fact: 3, utterance: 1, non_factual: 0 },
        contribution_counts: { landed: 4, refused: 1 },
        publication_counts: { attempted: 2, landed: 1, refused: 1 },
        publication_acceptance_rate: 0.5,
        revocation_history: [],
      },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_A.plane_id}/observability`]}>
        <Routes>
          <Route path="/memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('obs-plane-envelope-section')).toBeInTheDocument()
    );
    expect(screen.getByTestId('obs-contribution-class-section')).toBeInTheDocument();
    expect(screen.getByTestId('obs-publication-section')).toBeInTheDocument();
    expect(screen.getByTestId('obs-revocation-section')).toBeInTheDocument();
    // Publication rate rendered honestly at 50.0% when attempted > 0.
    expect(screen.getByTestId('obs-publication-rate')).toHaveTextContent('50.0%');
  });

  it('O-U2 · publication rate renders MarkedOpenSlot when attempted == 0', async () => {
    api.memoryGetPlaneObservability.mockResolvedValueOnce({
      status: 200,
      body: {
        plane_id: PLANE_A.plane_id,
        state: 'active',
        issued_at: PLANE_A.issued_at,
        revoked_at: null,
        contribution_class_counts: { fact: 2, utterance: 0, non_factual: 0 },
        contribution_counts: { landed: 2, refused: 0 },
        publication_counts: { attempted: 0, landed: 0, refused: 0 },
        publication_acceptance_rate: null,
        revocation_history: [],
      },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_A.plane_id}/observability`]}>
        <Routes>
          <Route path="/memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('obs-publication-rate')).toBeInTheDocument()
    );
    // MarkedOpenSlot rendered — NEVER 0/0 as 0%.
    const rateEl = screen.getByTestId('obs-publication-rate');
    expect(rateEl).not.toHaveTextContent('0%');
    expect(rateEl).not.toHaveTextContent('0.0%');
    // Marker present via MarkedOpenSlot test-id `open-copy-slot-publication_rate`.
    expect(screen.getByTestId('open-copy-slot-publication_rate')).toBeInTheDocument();
  });

  it('O-U3 · revocation history renders plainly on revoked plane (never hidden)', async () => {
    api.memoryGetPlaneObservability.mockResolvedValueOnce({
      status: 200,
      body: {
        plane_id: PLANE_REVOKED.plane_id,
        state: 'revoked',
        issued_at: PLANE_A.issued_at,
        revoked_at: '2026-08-02T12:00:00Z',
        contribution_class_counts: { fact: 0, utterance: 1, non_factual: 0 },
        contribution_counts: { landed: 1, refused: 0 },
        publication_counts: { attempted: 0, landed: 0, refused: 0 },
        publication_acceptance_rate: null,
        revocation_history: [
          { revoked_by: 'admin-99', revoked_at: '2026-08-02T12:00:00Z', reason: 'owner_action' },
        ],
      },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_REVOKED.plane_id}/observability`]}>
        <Routes>
          <Route path="/memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('obs-revocation-section')).toBeInTheDocument()
    );
    // Revocation event rendered inline, not hidden.
    expect(screen.getByTestId('obs-revocation-event-0'))
      .toHaveTextContent(/owner_action/);
    expect(screen.getByTestId('obs-revocation-event-0'))
      .toHaveTextContent(/admin-99/);
    // Plane state marker present at same visual weight.
    expect(screen.getByTestId('obs-plane-current-state')).toHaveTextContent(/revoked/);
  });

  it('O-U4 · class buckets render MarkedOpenSlot when landed==0 (unset-vs-empty)', async () => {
    api.memoryGetPlaneObservability.mockResolvedValueOnce({
      status: 200,
      body: {
        plane_id: PLANE_A.plane_id,
        state: 'active',
        issued_at: PLANE_A.issued_at,
        revoked_at: null,
        contribution_class_counts: { fact: 0, utterance: 0, non_factual: 0 },
        contribution_counts: { landed: 0, refused: 0 },
        publication_counts: { attempted: 0, landed: 0, refused: 0 },
        publication_acceptance_rate: null,
        revocation_history: [],
      },
    });
    render(
      <MemoryRouter initialEntries={[`/memory/planes/${PLANE_A.plane_id}/observability`]}>
        <Routes>
          <Route path="/memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId('obs-contribution-class-section')).toBeInTheDocument()
    );
    // Each of three canonical class buckets renders MarkedOpenSlot when
    // the total landed count is 0 (unset ≠ empty per FB-13).
    for (const cls of ['fact', 'utterance', 'non_factual']) {
      const bucket = screen.getByTestId(`obs-class-value-${cls}`);
      // The slot marker sits inside the bucket, never a bare `0`.
      expect(within(bucket).getByTestId(`open-copy-slot-class_${cls}`)).toBeInTheDocument();
      expect(bucket).not.toHaveTextContent(/^0$/);
    }
  });
});

/* =============================================================================
   R-U1/R-U2/R-U3/R-U4 · Registry Estate Map discipline.
   ============================================================================= */
describe('Phase-3-SubC2 · R-U registry estate map discipline', () => {
  it('R-U1 · unmeasured dimensions render MarkedOpenSlot (never zero)', async () => {
    api.registryReadDimension.mockImplementation((kind) => {
      if (kind === 'content_surfaces') {
        return Promise.resolve({
          status: 200,
          body: {
            items: [
              { slug: 'video', label: 'Video' },
              { slug: 'audio', label: 'Audio' },
            ],
          },
        });
      }
      return Promise.resolve({ status: 200, body: { items: [{ slug: 'documentary', label: 'Documentary' }] } });
    });
    render(<MemoryRouter><RegistryEstateMapPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-dimension-row-surfaces-video')).toBeInTheDocument()
    );
    // Figure column of each row renders MarkedOpenSlot — never `0`.
    const videoFig = screen.getByTestId('registry-dim-figure-video');
    expect(within(videoFig).getByTestId('open-copy-slot-figure_video')).toBeInTheDocument();
    expect(videoFig).not.toHaveTextContent(/^0$/);
    const audioFig = screen.getByTestId('registry-dim-figure-audio');
    expect(within(audioFig).getByTestId('open-copy-slot-figure_audio')).toBeInTheDocument();
  });

  it('R-U2 · every figure carries a method chip', async () => {
    api.registryReadDimension.mockImplementation((kind) => {
      if (kind === 'content_surfaces') {
        return Promise.resolve({ status: 200, body: { items: [{ slug: 'video', label: 'Video' }] } });
      }
      return Promise.resolve({ status: 200, body: { items: [] } });
    });
    render(<MemoryRouter><RegistryEstateMapPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-dim-figure-video')).toBeInTheDocument()
    );
    const figCell = screen.getByTestId('registry-dim-figure-video');
    // The method chip test-id (declaration_baseline is the day-zero method).
    expect(within(figCell).getByTestId('method-chip-declaration_baseline')).toBeInTheDocument();
  });

  it('R-U3 · inference overlay renders as dormant-capability chip (never fake)', async () => {
    api.registryReadDimension.mockImplementation((kind) => {
      if (kind === 'content_surfaces') {
        return Promise.resolve({ status: 200, body: { items: [{ slug: 'video', label: 'Video' }] } });
      }
      return Promise.resolve({ status: 200, body: { items: [] } });
    });
    render(<MemoryRouter><RegistryEstateMapPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-dim-inference-video')).toBeInTheDocument()
    );
    const inferenceCell = screen.getByTestId('registry-dim-inference-video');
    expect(within(inferenceCell).getByTestId('dormant-capability-chip')).toBeInTheDocument();
    // No numeric leak — the chip carries the "dormant" prefix, no digits.
    expect(inferenceCell.textContent).not.toMatch(/\d/);
  });

  it('R-U4 · every coverage gap pairs with a Propose census → action', async () => {
    api.registryReadDimension.mockImplementation((kind) => {
      if (kind === 'content_surfaces') {
        return Promise.resolve({
          status: 200,
          body: { items: [{ slug: 'video', label: 'Video' }, { slug: 'audio', label: 'Audio' }] },
        });
      }
      return Promise.resolve({ status: 200, body: { items: [{ slug: 'documentary', label: 'Documentary' }] } });
    });
    render(<MemoryRouter><RegistryEstateMapPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-dim-action-video')).toBeInTheDocument()
    );
    // Every dimension row this cycle is unmeasured → every row has an action.
    for (const slug of ['video', 'audio', 'documentary']) {
      const action = screen.getByTestId(`registry-dim-action-${slug}`);
      expect(action).toHaveTextContent(/Propose census/i);
      // Action routes to the operator wizard door.
      expect(action.getAttribute('href')).toBe('/operator/commission');
    }
  });
});
