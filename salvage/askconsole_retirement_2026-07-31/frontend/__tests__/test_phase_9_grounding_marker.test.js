// P9-E6 α (Owner 2026-07-08): em-dash "—" preserved verbatim; test asserts the exact string.
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommitReviewGroundingMarker, {
  NO_SAMPLE_VERBATIM,
  GROUNDED_TEMPLATE,
} from '../../pages/extraction/CommitReviewGroundingMarker';

jest.mock('../../pages/extraction/SampleGroundingContext', () => {
  let state = { sample: null, status: 'idle', error: null, runSample: async () => {} };
  return {
    __setState: (s) => { state = { ...state, ...s }; },
    useSampleGrounding: () => state,
    SampleGroundingProvider: ({ children }) => children,
  };
});
const ctxMod = require('../../pages/extraction/SampleGroundingContext');

describe('Phase 9 · CommitReviewGroundingMarker (P9-E6 α em-dash verbatim)', () => {
  test('no-sample variant renders UI Spec §3.3 line 50 verbatim including em-dash', () => {
    ctxMod.__setState({ sample: null, status: 'idle', error: null });
    render(<CommitReviewGroundingMarker />);
    const el = screen.getByTestId('commit-review-grounding-marker');
    expect(el).toHaveTextContent('No sample run — estimates only.');
    expect(NO_SAMPLE_VERBATIM).toBe('No sample run \u2014 estimates only.');
    expect(el.textContent).toContain('\u2014');
  });

  test('grounded-by-sample variant renders with sample_ref substituted verbatim', () => {
    ctxMod.__setState({
      sample: { sample_ref: 'sample-abc123', status: 'complete' },
      status: 'complete', error: null,
    });
    render(<CommitReviewGroundingMarker />);
    const el = screen.getByTestId('commit-review-grounding-marker');
    expect(el).toHaveTextContent('Grounded by sample sample-abc123');
    expect(GROUNDED_TEMPLATE('sample-abc123')).toBe('Grounded by sample sample-abc123');
  });

  test('em-dash character is precisely U+2014, not a hyphen-minus or en-dash', () => {
    // Anti-slop-gate: prevents em-dash from getting silently substituted.
    expect(NO_SAMPLE_VERBATIM.charCodeAt('No sample run '.length)).toBe(0x2014);
    expect(NO_SAMPLE_VERBATIM.charCodeAt('No sample run '.length)).not.toBe(0x002D); // -
    expect(NO_SAMPLE_VERBATIM.charCodeAt('No sample run '.length)).not.toBe(0x2013); // –
  });
});
