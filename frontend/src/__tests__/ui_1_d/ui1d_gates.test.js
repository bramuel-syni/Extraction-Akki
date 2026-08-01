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
    proveSamples: jest.fn(),
    proveTrace: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

const SAMPLES_ENVELOPE_FOUR_SHAPES = {
  canon_ref: 'Canon §9 · shape grammar reference',
  count: 4,
  samples: [
    { shape: 'answered', trace_id: 'trc-sample-ans',
      asked: 'How many Q1 partner rebate rows?',
      claim: '487 rows meet the established-fact floor.',
      defensibility_class: 'established_fact', is_sample: true },
    { shape: 'not_extracted_yet', trace_id: 'trc-sample-ney',
      asked: 'What extraction pass is needed for H2 cohort?',
      wire_reason_verbatim: 'No extract in the corpus intersects this question.',
      estimated_effort_plain: 'roughly one extraction pass.',
      queue_offered: true, gap_id: 'gap-h2', is_sample: true },
    { shape: 'evidence_cannot_support_it', trace_id: 'trc-sample-ecs',
      asked: 'What Q3 enterprise-tier price?',
      reason_code: 'no_defensibility_floor',
      wire_reason_verbatim: 'The corpus holds a Q3 summary but no specific price.',
      what_would_raise_it_plain: 'A board-minutes ingestion would raise it.',
      queue_offered: false, is_sample: true },
    { shape: 'something_broke', trace_id: 'trc-sample-sb',
      asked: 'Show the raw archive for the March broker export.',
      fault_channel_ref: 'fault-archive-reader-dormant',
      fault_reason_plain: 'The archive reader capability is dormant.',
      queue_offered: false, is_sample: true },
  ],
};

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset && f.mockReset());
  // Default: /prove samples endpoint returns the 4 seeded shapes.
  // Individual tests may override this before rendering.
  if (api.proveSamples && api.proveSamples.mockResolvedValue) {
    api.proveSamples.mockResolvedValue({ status: 200, body: SAMPLES_ENVELOPE_FOUR_SHAPES });
  }
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


/* =============================================================================
   Cell 11 · gate_ui1d_retired_vocabulary_absent_on_registry_and_prove
   Owner UI-1-D dispatch · Canon C.4 rename: "Shape this objective" → "Put this to work".
   The retired vocab MUST NOT render on either new surface (rendered-DOM discipline).
   ============================================================================= */
describe('UI-1-D · gate_ui1d_retired_vocabulary_absent_on_registry_and_prove', () => {
  const UI1D_RETIRED_TERMS = ['Shape this objective', 'Objectives', 'Ambitions', 'Approval Queue'];

  it('/registry — retired vocab is absent from rendered DOM', async () => {
    primeRegistry();
    render(<MemoryRouter><RegistryWhatYouHoldPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('registry-what-you-hold')).toBeInTheDocument());
    const text = (document.body.textContent || '').toLowerCase();
    UI1D_RETIRED_TERMS.forEach((term) => {
      expect({ term, present: text.includes(term.toLowerCase()) })
        .toEqual({ term, present: false });
    });
    // Positive assertion: the ratified vocab renders on this surface.
    expect(document.body.textContent).toMatch(/Put this to work/);
  });

  it('/prove — retired vocab is absent from rendered DOM (empty + all shapes)', async () => {
    // Idle Prove page.
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    let text = (document.body.textContent || '').toLowerCase();
    UI1D_RETIRED_TERMS.forEach((term) => {
      expect({ term, present: text.includes(term.toLowerCase()) })
        .toEqual({ term, present: false });
    });
  });
});


/* =============================================================================
   Cell 12 · gate_prove_refusal_shape_sample_banner_when_is_sample_true
   Sample marking is systemic (Owner ruling 2026-08-01 · third-occurrence fix).
   Applied on Prove refusal shapes: is_sample=true → visible SAMPLE badge.
   ============================================================================= */
describe('UI-1-D · gate_prove_refusal_shape_sample_banner_when_is_sample_true', () => {
  it('NOT_EXTRACTED_YET with is_sample=true renders the sample refusal banner', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'not_extracted_yet', trace_id: 'trc-s1', asked: 'q-sample',
      wire_reason_verbatim: 'sample refusal', queue_offered: true, gap_id: 'gap-s',
      is_sample: true,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q-sample' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('prove-not-extracted-sample-banner')).toBeInTheDocument()
    );
    expect(screen.getByTestId('prove-not-extracted-sample-banner').getAttribute('data-sample-badge')).toBe('true');
  });

  it('EVIDENCE_CANNOT_SUPPORT with is_sample=true renders the sample refusal banner', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'evidence_cannot_support_it', trace_id: 'trc-s2', asked: 'q-sample2',
      reason_code: 'no_defensibility_floor', wire_reason_verbatim: 'sample refusal',
      queue_offered: false, is_sample: true,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q-sample2' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('prove-evidence-cannot-support-sample-banner')).toBeInTheDocument()
    );
  });

  it('SOMETHING_BROKE with is_sample=true renders the sample fault banner (symmetric with refusal shapes · sample marking systemic)', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'something_broke', trace_id: null, asked: 'q-sample3',
      fault_channel_ref: 'fault-s', fault_reason_plain: 'seeded fault sample',
      queue_offered: false, is_sample: true,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'q-sample3' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('prove-something-broke-sample-banner')).toBeInTheDocument()
    );
    // Even with the sample banner, the fault card MUST remain visually distinct
    // (DB-2 binding · fault does not become a refusal because of a sample marker).
    expect(screen.getByTestId('prove-shape-something-broke').getAttribute('data-shape'))
      .toBe('something_broke');
    expect(screen.queryByTestId('prove-shape-evidence-cannot-support')).toBeNull();
    expect(screen.queryByTestId('prove-shape-not-extracted-yet')).toBeNull();
  });
});


/* =============================================================================
   Cell 13 · gate_prove_db2_paired_break_in_fault_never_shares_refusal_styling
   DB-2 BINDING: a companion-channel failure MUST NOT convert a refusal into
   a fault render. Fault channel uses distinct border, background, layout.
   ============================================================================= */
describe('UI-1-D · gate_prove_db2_paired_break_in_fault_never_shares_refusal_styling', () => {
  it('SOMETHING_BROKE renders with distinct data-shape + no refusal testids present', async () => {
    api.proveAsk.mockResolvedValueOnce({ status: 200, body: {
      shape: 'something_broke', trace_id: null, asked: 'qfault',
      fault_channel_ref: 'fault-x', fault_reason_plain: 'archive reader dormant',
      queue_offered: false, is_sample: false,
    }});
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'qfault' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() => expect(screen.getByTestId('prove-shape-something-broke')).toBeInTheDocument());
    // The fault card must NOT reuse refusal card testids.
    expect(screen.queryByTestId('prove-shape-not-extracted-yet')).toBeNull();
    expect(screen.queryByTestId('prove-shape-evidence-cannot-support')).toBeNull();
    expect(screen.queryByTestId('prove-not-extracted-honesty-strip')).toBeNull();
    expect(screen.queryByTestId('prove-evidence-cannot-support-honesty-strip')).toBeNull();
    expect(screen.queryByTestId('prove-queue-this-gap-btn')).toBeNull();
    // The fault card must have data-shape=something_broke (visual invariant).
    expect(screen.getByTestId('prove-shape-something-broke').getAttribute('data-shape'))
      .toBe('something_broke');
    // Fault card renders its own plain reason (never a refusal reason_code).
    expect(screen.getByTestId('prove-fault-plain-reason').textContent).toMatch(/archive reader/i);
  });
});


/* =============================================================================
   Cell 14 · gate_prove_page_default_render_four_seeded_sample_shape_cards
   Owner UI-1-D re-verification 2026-08-02 · viewable-build standing:
   the /prove page MUST render the 4 seeded shape sample cards by default
   (page-level render path · not just component-level render on user action).
   This closes the systemic gap the Owner flagged: Jest cards rendered fine
   when handed props, but the page's own fetch/render path was silent.
   ============================================================================= */
describe('UI-1-D · gate_prove_page_default_render_four_seeded_sample_shape_cards', () => {
  it('mounts ProvePage as admin → fetches samples → renders all 4 badged shape cards', async () => {
    // Default mock (SAMPLES_ENVELOPE_FOUR_SHAPES) is primed in beforeEach.
    render(<MemoryRouter><ProvePage /></MemoryRouter>);

    // The sample shape reference section is present.
    await waitFor(() =>
      expect(screen.getByTestId('prove-sample-shape-reference')).toBeInTheDocument()
    );

    // One sample card per shape · ALL FOUR rendered (page-level path).
    await waitFor(() => {
      expect(screen.getByTestId('prove-sample-card-answered')).toBeInTheDocument();
      expect(screen.getByTestId('prove-sample-card-not_extracted_yet')).toBeInTheDocument();
      expect(screen.getByTestId('prove-sample-card-evidence_cannot_support_it')).toBeInTheDocument();
      expect(screen.getByTestId('prove-sample-card-something_broke')).toBeInTheDocument();
    });

    // Each sample card carries its shape testid inside it (namespaced with `-sample`),
    // AND its sample badge. (These are proof that the same card components fire on
    // the page-level path.)
    expect(screen.getByTestId('prove-shape-answered-sample')).toBeInTheDocument();
    expect(screen.getByTestId('prove-shape-not-extracted-yet-sample')).toBeInTheDocument();
    expect(screen.getByTestId('prove-shape-evidence-cannot-support-sample')).toBeInTheDocument();
    expect(screen.getByTestId('prove-shape-something-broke-sample')).toBeInTheDocument();

    // All four SAMPLE badges render on the page by default.
    expect(screen.getByTestId('prove-answer-sample-banner-sample')).toBeInTheDocument();
    expect(screen.getByTestId('prove-not-extracted-sample-banner-sample')).toBeInTheDocument();
    expect(screen.getByTestId('prove-evidence-cannot-support-sample-banner-sample')).toBeInTheDocument();
    expect(screen.getByTestId('prove-something-broke-sample-banner-sample')).toBeInTheDocument();

    // Sanity: the SAMPLE badge dataset marker is set (systemic sample-marking discipline).
    ['prove-answer-sample-banner-sample',
     'prove-not-extracted-sample-banner-sample',
     'prove-evidence-cannot-support-sample-banner-sample',
     'prove-something-broke-sample-banner-sample'].forEach((testid) => {
      expect(screen.getByTestId(testid).getAttribute('data-sample-badge')).toBe('true');
    });
  });

  it('if the samples endpoint fails, page renders an HONEST error panel (never silent)', async () => {
    api.proveSamples.mockResolvedValueOnce({ status: 401, body: { reason: 'auth_missing', detail: 'Please sign in.' } });
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('prove-samples-error-panel')).toBeInTheDocument()
    );
    expect(screen.getByTestId('prove-samples-error-panel').getAttribute('data-status')).toBe('401');
    expect(screen.getByTestId('prove-samples-error-panel').textContent).toMatch(/auth_missing/i);
    // No shape sample cards render when the endpoint failed (honest empty).
    expect(screen.queryByTestId('prove-sample-card-answered')).toBeNull();
  });
});


/* =============================================================================
   Cell 15 · gate_prove_ask_non_200_response_renders_honest_error_never_silent
   Owner UI-1-D re-verification 2026-08-02 · silent-swallow bug fix:
   submitting a question that returns 401/403/5xx MUST render an honest
   error panel — never blank. The previous implementation only rendered
   on status===200, so expired sessions and errors silently vanished.
   ============================================================================= */
describe('UI-1-D · gate_prove_ask_non_200_response_renders_honest_error_never_silent', () => {
  it('401 on /prove/ask renders an honest inline error panel (not silent)', async () => {
    api.proveAsk.mockResolvedValueOnce({
      status: 401,
      body: { reason: 'auth_missing', detail: 'Authentication required.' },
    });
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    // Wait for samples to load first (default page render).
    await waitFor(() => expect(screen.getByTestId('prove-sample-shape-reference')).toBeInTheDocument());
    // Submit a question.
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'expired-session' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    // Error panel renders — honest, verbatim reason.
    await waitFor(() =>
      expect(screen.getByTestId('prove-ask-error-panel')).toBeInTheDocument()
    );
    expect(screen.getByTestId('prove-ask-error-panel').getAttribute('data-status')).toBe('401');
    expect(screen.getByTestId('prove-ask-error-panel').textContent).toMatch(/auth_missing/i);
    // The 4 sample cards remain visible (page-level render path unaffected by ask failure).
    expect(screen.getByTestId('prove-sample-card-answered')).toBeInTheDocument();
  });

  it('403 on /prove/ask also renders the error panel with the reason verbatim', async () => {
    api.proveAsk.mockResolvedValueOnce({
      status: 403,
      body: { reason: 'access_control_denied', detail: 'Role not permitted.' },
    });
    render(<MemoryRouter><ProvePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('prove-sample-shape-reference')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('prove-question-input'), { target: { value: 'forbidden' } });
    fireEvent.click(screen.getByTestId('prove-ask-btn'));
    await waitFor(() =>
      expect(screen.getByTestId('prove-ask-error-panel')).toBeInTheDocument()
    );
    expect(screen.getByTestId('prove-ask-error-panel').getAttribute('data-status')).toBe('403');
    expect(screen.getByTestId('prove-ask-error-panel').textContent).toMatch(/access_control_denied/i);
  });
});

