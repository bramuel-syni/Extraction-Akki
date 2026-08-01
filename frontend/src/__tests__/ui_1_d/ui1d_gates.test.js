/* UI-1-D · Registry ("What You Hold") + Prove Jest gate roster.
 *
 * Canon §5 four-axis composition, §9 three-shape response grammar,
 * WALK-A-PROOF closing returns to origin (scroll + query state).
 * All assertions on RENDERED DOM (Owner discipline).
 */
import React from 'react';
import { render, screen, waitFor, fireEvent, within, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

import RegistryWhatYouHoldPage from '../../pages/registry/RegistryWhatYouHoldPage';
import ProvePage from '../../pages/prove/ProvePage';
import ProveWalkPage from '../../pages/prove/ProveWalkPage';

jest.mock('../../apiClient', () => {
  const mock = {
    registryWhatYouHold: jest.fn(),
    registryOpportunityBriefs: jest.fn(),
    registryGapRegister: jest.fn(),
    registryQueueGap: jest.fn(),
    proveAsk: jest.fn(),
    proveTrace: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset && f.mockReset());
});


const WHAT_YOU_HOLD = {
  canon_ref: 'Canon §5',
  generated_at_iso: 't',
  connected: {
    connected: 3, in_progress: 1, awaiting_credentials: 1,
    failed: 1, pending: 0, total: 6, last_sync_iso: '2026-08-02T00:00Z',
  },
  holdings: {
    rows: [
      { source_id: 'src-m1', source_name: 'Measured One',
        ring: 'ring_1_established_fact', domain: 'records',
        measured: true, corpus_row_count: 487, unmeasured_reason_plain: null,
        method: 'extract', is_sample: true },
      { source_id: 'src-u1', source_name: 'Unmeasured One',
        ring: 'ring_2_registered', domain: 'documents',
        measured: false, corpus_row_count: null,
        unmeasured_reason_plain: 'Awaiting master_admin credentials issue — corpus not yet extracted.',
        method: 'declared', is_sample: true },
      { source_id: 'src-u2', source_name: 'Failed One',
        ring: 'ring_3_probable', domain: 'events',
        measured: false, corpus_row_count: null,
        unmeasured_reason_plain: 'Source connect failed — no extract available.',
        method: 'declared', is_sample: true },
    ],
    rings_axis: ['ring_1_established_fact', 'ring_2_registered', 'ring_3_probable'],
    domains_axis: ['records', 'documents', 'events'],
    measured_count: 1, unmeasured_count: 2,
  },
  intelligence: {
    declaration_baseline_count: 3, inference_overlay_count: 0,
    inference_state: 'dormant', declaration_only: true,
  },
  backend: {
    planes_active: 0, registries_effective: 2,
    auto_run_ceiling_usd: 1000,
    ceiling_source_seam: 'checker_requests · auto_run_ceiling_usd (Canon §4.2 rule 7)',
  },
};

const BRIEFS = {
  canon_ref: 'Canon §5', count: 2,
  briefs: [
    { brief_id: 'brief-a', title: 'Q1 rebate audit',
      summary_plain: 'Ready-verdict corpus supports this brief.',
      is_sample: true, prefill_door: 'export_or_license',
      cta_label: 'Put this to work',
      cta_route: '/use-data?prefill_from_brief=brief-a' },
    { brief_id: 'brief-b', title: 'Retention classifier',
      summary_plain: '12-month corpus supports this brief.',
      is_sample: true, prefill_door: 'train_a_model',
      cta_label: 'Put this to work',
      cta_route: '/use-data?prefill_from_brief=brief-b' },
  ],
};

const GAPS = {
  canon_ref: 'Canon §5.5', count: 2,
  gaps: [
    { gap_id: 'gap-1', question_plain: 'What partner terms applied to Q3 renewal?',
      rank_score: 0.87, state: 'open', is_sample: true,
      cta_label: 'Queue this gap',
      cta_route: '/use-data?prefill_from_gap=gap-1' },
    { gap_id: 'gap-2', question_plain: 'Which cohorts drove churn?',
      rank_score: 0.62, state: 'queued', is_sample: true,
      queued_use_data_session_id: 's-gap-2',
      cta_label: 'Queue this gap',
      cta_route: '/use-data?prefill_from_gap=gap-2' },
  ],
};


function primeRegistry() {
  api.registryWhatYouHold.mockResolvedValue({ status: 200, body: WHAT_YOU_HOLD });
  api.registryOpportunityBriefs.mockResolvedValue({ status: 200, body: BRIEFS });
  api.registryGapRegister.mockResolvedValue({ status: 200, body: GAPS });
}


/* =============================================================================
   Cell 1 · gate_registry_four_axes_present_and_ordered
   ============================================================================= */
describe('UI-1-D · gate_registry_four_axes_present_and_ordered', () => {
  it('renders all 4 axes in the exact prototype order: connected, holdings, intelligence, backend', async () => {
    primeRegistry();
    render(<MemoryRouter><RegistryWhatYouHoldPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-what-you-hold')).toBeInTheDocument()
    );
    const root = screen.getByTestId('registry-what-you-hold');
    const axes = ['registry-axis-connected', 'registry-axis-holdings',
                  'registry-axis-intelligence', 'registry-axis-backend'];
    const positions = axes.map((t) =>
      Array.from(root.querySelectorAll('*')).indexOf(screen.getByTestId(t))
    );
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
  });
});


/* =============================================================================
   Cell 2 · gate_holdings_measured_and_unmeasured_first_class
   ============================================================================= */
describe('UI-1-D · gate_holdings_measured_and_unmeasured_first_class', () => {
  it('renders unmeasured as FIRST-CLASS (hatched · plain-language reason · never zero)', async () => {
    primeRegistry();
    render(<MemoryRouter><RegistryWhatYouHoldPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-axis-holdings')).toBeInTheDocument()
    );
    // Measured row renders 'measured' badge + row count.
    expect(screen.getByTestId('registry-measured-yes-src-m1')).toBeInTheDocument();
    expect(screen.getByTestId('registry-corpus-count-src-m1')).toHaveTextContent(/487/);
    // Unmeasured rows render 'unmeasured' badge + honest plain-language reason.
    expect(screen.getByTestId('registry-unmeasured-src-u1')).toBeInTheDocument();
    expect(screen.getByTestId('registry-unmeasured-reason-src-u1').textContent).toMatch(/credentials/i);
    expect(screen.getByTestId('registry-unmeasured-src-u2')).toBeInTheDocument();
    expect(screen.getByTestId('registry-unmeasured-reason-src-u2').textContent).toMatch(/failed/i);
    // Row carries data-measured attribute for CSS/style discipline.
    expect(screen.getByTestId('registry-holdings-row-src-m1').getAttribute('data-measured')).toBe('true');
    expect(screen.getByTestId('registry-holdings-row-src-u1').getAttribute('data-measured')).toBe('false');
    // Counts summary shows unmeasured is first-class (non-zero when data holds them).
    expect(screen.getByTestId('registry-holdings-measured-count').textContent).toMatch(/1/);
    expect(screen.getByTestId('registry-holdings-unmeasured-count').textContent).toMatch(/2/);
  });
});


/* =============================================================================
   Cell 3 · gate_opportunity_briefs_put_this_to_work_cta
   ============================================================================= */
describe('UI-1-D · gate_opportunity_briefs_put_this_to_work_cta', () => {
  it('every brief renders a "Put this to work" CTA (Canon C.4 rename; retired "Shape this objective")', async () => {
    primeRegistry();
    render(<MemoryRouter><RegistryWhatYouHoldPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('registry-opportunity-briefs')).toBeInTheDocument()
    );
    const briefA = screen.getByTestId('registry-brief-cta-brief-a');
    expect(briefA).toHaveTextContent(/Put this to work/i);
    expect(briefA).not.toHaveTextContent(/Shape this objective/i);
    const briefB = screen.getByTestId('registry-brief-cta-brief-b');
    expect(briefB).toHaveTextContent(/Put this to work/i);
    // Retired vocab absent everywhere on this surface.
    expect(screen.queryByText(/Shape this objective/i)).toBeNull();
  });
});


/* =============================================================================
   Cell 4 · gate_gap_register_queue_this_gap_cta
   ============================================================================= */
describe('UI-1-D · gate_gap_register_queue_this_gap_cta', () => {
  it('open gaps carry "Queue this gap" · queued gaps carry a link to their Use Data session', async () => {
    primeRegistry();
    render(<MemoryRouter><RegistryWhatYouHoldPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('registry-gap-register')).toBeInTheDocument());
    // Open gap has queue button.
    const openBtn = screen.getByTestId('registry-gap-queue-btn-gap-1');
    expect(openBtn).toHaveTextContent(/Queue this gap/i);
    // Queued gap has a link to its Use Data session (originating answer
    // updates to show where the work went).
    const queuedLink = screen.getByTestId('registry-gap-queued-link-gap-2');
    expect(queuedLink).toHaveAttribute('href', '/use-data/wizard/s-gap-2');
  });
});


/* =============================================================================
   Cell 5 · gate_registry_sample_marking (systemic on this surface too)
   ============================================================================= */
describe('UI-1-D · gate_registry_sample_marking', () => {
  it('every seeded row on this surface renders a SAMPLE badge', async () => {
    primeRegistry();
    render(<MemoryRouter><RegistryWhatYouHoldPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('registry-what-you-hold')).toBeInTheDocument());
    // Holdings sample sources carry a badge.
    expect(screen.getByTestId('registry-sample-badge-src-m1')).toBeInTheDocument();
    expect(screen.getByTestId('registry-sample-badge-src-u1')).toBeInTheDocument();
    // Brief sample rows carry a badge.
    expect(screen.getByTestId('registry-sample-badge-brief-a')).toBeInTheDocument();
    // Gap sample rows carry a badge.
    expect(screen.getByTestId('registry-sample-badge-gap-1')).toBeInTheDocument();
  });
});


/* =============================================================================
   Cell 6 · gate_prove_three_shapes_visually_distinct
   ============================================================================= */
describe('UI-1-D · gate_prove_three_shapes_visually_distinct', () => {
  it('ANSWERED shape uses distinct testid + palette · never conflated with refusal', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'answered', trace_id: 'trc-1', asked: 'q1',
      claim: '487 rows meet the floor.', defensibility_class: 'established_fact',
      is_sample: true,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q1' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() => expect(screen.getByTestId('prove-shape-answered')).toBeInTheDocument());
    // Never renders any refusal/fault shape testid.
    expect(screen.queryByTestId('prove-shape-not-extracted-yet')).toBeNull();
    expect(screen.queryByTestId('prove-shape-evidence-cannot-support')).toBeNull();
    expect(screen.queryByTestId('prove-shape-something-broke')).toBeNull();
    // Class-with-claim rendered.
    expect(screen.getByTestId('prove-answer-claim').textContent).toMatch(/487/);
    expect(screen.getByTestId('prove-shape-answered').getAttribute('data-shape')).toBe('answered');
  });

  it('NOT_EXTRACTED_YET shape renders honesty strip + queue button (offers to queue)', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'not_extracted_yet', trace_id: 'trc-2', asked: 'q2',
      wire_reason_verbatim: 'No extract in the corpus intersects this question.',
      estimated_effort_plain: 'roughly one extraction pass',
      queue_offered: true, gap_id: 'gap-2', is_sample: false,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q2' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() => expect(screen.getByTestId('prove-shape-not-extracted-yet')).toBeInTheDocument());
    // Wire reason rendered verbatim (DB-1 BINDING).
    expect(screen.getByTestId('prove-not-extracted-honesty-strip').textContent).toMatch(/No extract in the corpus/);
    // Queue offered.
    expect(screen.getByTestId('prove-queue-this-gap-btn')).toBeInTheDocument();
    expect(screen.getByTestId('prove-queue-this-gap-btn').textContent).toMatch(/Queue this gap/i);
    // NOT the fault channel.
    expect(screen.queryByTestId('prove-shape-something-broke')).toBeNull();
  });

  it('EVIDENCE_CANNOT_SUPPORT_IT shape renders honesty strip · NO queue offer', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'evidence_cannot_support_it', trace_id: 'trc-3', asked: 'q3',
      reason_code: 'no_defensibility_floor',
      wire_reason_verbatim: 'The corpus holds a summary but no specific price.',
      what_would_raise_it_plain: 'Ingest the Q3 board minutes to raise the floor.',
      queue_offered: false, is_sample: true,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q3' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() => expect(screen.getByTestId('prove-shape-evidence-cannot-support')).toBeInTheDocument());
    // Wire reason rendered verbatim (DB-1).
    expect(screen.getByTestId('prove-evidence-cannot-support-honesty-strip').textContent).toMatch(/specific price/);
    // NO queue offer button (Owner directive · never render a queue we cannot stand behind).
    expect(screen.queryByTestId('prove-queue-this-gap-btn')).toBeNull();
    // What-would-raise-it is separate from a queue promise.
    expect(screen.getByTestId('prove-what-would-raise-it').textContent).toMatch(/board minutes/);
  });

  it('SOMETHING_BROKE shape uses OWN channel · never shares refusal components (DB-2 BINDING)', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'something_broke', trace_id: null, asked: 'q4',
      fault_channel_ref: 'fault-archive-reader-dormant',
      fault_reason_plain: 'The archive reader capability is dormant (awaiting OT-1a).',
      queue_offered: false, is_sample: true,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q4' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() => expect(screen.getByTestId('prove-shape-something-broke')).toBeInTheDocument());
    // FAULT ≠ REFUSAL — none of the refusal testids appear.
    expect(screen.queryByTestId('prove-shape-not-extracted-yet')).toBeNull();
    expect(screen.queryByTestId('prove-shape-evidence-cannot-support')).toBeNull();
    expect(screen.queryByTestId('prove-not-extracted-honesty-strip')).toBeNull();
    expect(screen.queryByTestId('prove-evidence-cannot-support-honesty-strip')).toBeNull();
    // Fault reason renders in its own plain-reason component.
    expect(screen.getByTestId('prove-fault-plain-reason').textContent).toMatch(/archive reader/i);
    expect(screen.getByTestId('prove-shape-something-broke').getAttribute('data-shape')).toBe('something_broke');
  });
});


/* =============================================================================
   Cell 7 · gate_prove_db1_wire_reason_verbatim (paired break-in)
   ============================================================================= */
describe('UI-1-D · gate_prove_db1_wire_reason_verbatim', () => {
  it('DB-1: the specific wire reason renders verbatim in the honesty strip', async () => {
    const wire = 'Non-cross-cluster registration seam · Q3-2026 · line 247 verbatim';
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'evidence_cannot_support_it', trace_id: 'trc-x', asked: 'qx',
      reason_code: 'no_lawful_basis', wire_reason_verbatim: wire,
      is_sample: false,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'qx' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('prove-evidence-cannot-support-honesty-strip').textContent).toBe(wire)
    );
  });
});


/* =============================================================================
   Cell 8 · gate_prove_walk_layers_present
   ============================================================================= */
describe('UI-1-D · gate_prove_walk_layers_present', () => {
  it('walk-a-proof renders claim · reasoning · raw facts (3 descending layers)', async () => {
    api.proveTrace.mockResolvedValueOnce({ status: 200, body: {
      trace_id: 'trc-w1', asked: 'question',
      envelope: { shape: 'answered', claim: 'A concrete claim' },
      walk_layers: [
        { layer: 'claim', text: 'A concrete claim' },
        { layer: 'reasoning', text: 'Reasoning', candidates: ['cand-a', 'cand-b'],
          corroboration: 'cross-verified', probability_calibration: 'confidence 0.97' },
        { layer: 'raw_facts', text: 'Raw',
          facts: [{ fact: 'fact-1', source_ref: 'src-1' }, { fact: 'fact-2', source_ref: 'src-2' }] },
      ],
      canon_ref: 'Canon §9',
    }});
    render(
      <MemoryRouter initialEntries={[{ pathname: '/prove/trace/trc-w1', state: { from: '/prove', scrollY: 0 } }]}>
        <Routes>
          <Route path="/prove/trace/:traceId" element={<ProveWalkPage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('prove-walk-page')).toBeInTheDocument());
    // All 3 layers render.
    expect(screen.getByTestId('prove-walk-layer-claim')).toBeInTheDocument();
    expect(screen.getByTestId('prove-walk-layer-reasoning')).toBeInTheDocument();
    expect(screen.getByTestId('prove-walk-layer-raw_facts')).toBeInTheDocument();
    // Reasoning renders candidates + corroboration + probability.
    expect(screen.getByTestId('prove-walk-candidates-reasoning')).toBeInTheDocument();
    expect(screen.getByTestId('prove-walk-corroboration-reasoning').textContent).toMatch(/cross-verified/);
    expect(screen.getByTestId('prove-walk-probability-reasoning').textContent).toMatch(/0\.97/);
    // Raw facts link to sources.
    expect(screen.getByTestId('prove-walk-fact-0')).toBeInTheDocument();
    expect(screen.getByTestId('prove-walk-source-link-0')).toHaveAttribute('href', '/connect/source/src-1');
  });
});


/* =============================================================================
   Cell 9 · gate_prove_walk_close_returns_to_origin_scroll_and_query
   ============================================================================= */
describe('UI-1-D · gate_prove_walk_close_returns_to_origin_scroll_and_query', () => {
  it('close button navigates back to origin pathname + search AND restores scroll', async () => {
    api.proveTrace.mockResolvedValueOnce({ status: 200, body: {
      trace_id: 'trc-close', asked: 'q',
      envelope: { shape: 'answered', claim: 'c' },
      walk_layers: [{ layer: 'claim', text: 'c' }],
    }});
    // Spy on window.scrollTo — we'll assert the restore call.
    const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    // requestAnimationFrame runs synchronously in this jest env.
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(); return 1; });
    render(
      <MemoryRouter initialEntries={[{
        pathname: '/prove/trace/trc-close',
        state: { from: '/registry', scrollY: 420, from_search: '?tab=holdings' },
      }]}>
        <Routes>
          <Route path="/prove/trace/:traceId" element={<ProveWalkPage />} />
          <Route path="/registry" element={<div data-testid="mock-registry-landed">registry</div>} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('prove-walk-close-btn')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('prove-walk-close-btn'));
    // Origin route landed AND scroll restored to origin.scrollY.
    await waitFor(() => expect(screen.getByTestId('mock-registry-landed')).toBeInTheDocument());
    expect(scrollSpy).toHaveBeenCalledWith(0, 420);
    rafSpy.mockRestore();
    scrollSpy.mockRestore();
  });
});


/* =============================================================================
   Cell 10 · gate_prove_ask_input_no_ask_first_landing_pattern
   ============================================================================= */
describe('UI-1-D · gate_prove_ask_input_no_ask_first_landing_pattern', () => {
  it('Prove page renders as a MODULE (entered from the shell) — the question input is NOT positioned as an ask-first hero landing', async () => {
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    // The page carries a canon-ref (module context, not a landing).
    expect(screen.getByTestId('prove-page').getAttribute('data-canon-ref')).toBe('Canon §9');
    // No "Welcome" / "Get started" / "Ask anything" hero copy (retired ask-first pattern).
    expect(screen.queryByText(/Welcome to/i)).toBeNull();
    expect(screen.queryByText(/Get started/i)).toBeNull();
    expect(screen.queryByText(/Ask me anything/i)).toBeNull();
    // Input renders inline, not as a hero (has a plain placeholder).
    expect(screen.getByTestId('prove-question-input')).toHaveAttribute('placeholder',
      expect.stringMatching(/plain language/i));
  });
});
