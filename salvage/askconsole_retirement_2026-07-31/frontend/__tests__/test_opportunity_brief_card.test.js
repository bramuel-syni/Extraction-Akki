// UI Spec v2.2 §3.7 — OpportunityBriefCard render cells (Jest).
// Attests:
//  * OB-R3 Seam-1 α (render-time) — advisory marker mandatory-visible on
//    every render path; render surface reads marker from sidecar payload;
//    no render-time strip.
//  * OB-R6 — scope chip renders for each of {slice, combined, estate}.
//  * OB-R5 — stale indicator renders iff brief.stale === true.
//  * OB-R4 — shape-as-objective button click surfaces the callback with
//    the brief payload.
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import OpportunityBriefCard from '../../pages/opportunity_briefs/OpportunityBriefCard';

const ADVISORY_MARKER = 'Advisory: opportunity brief — not a governed response.';

function makeBrief(overrides = {}) {
  return {
    brief_id: 'brief_test_1',
    scope: 'slice',
    contributing_slices: ['dim_x:s1'],
    brief_text: 'Slice-a contains 47 units at 12.5% share.',
    quantitative_anchors: [
      { value: '47', registry_read_ref: 'reg-a-count' },
      { value: '12.5%', registry_read_ref: 'reg-a-share' },
    ],
    generated_at: '2026-07-10T00:00:00Z',
    census_ref: 'census-v1',
    stale: false,
    _advisory_marker: ADVISORY_MARKER,
    ...overrides,
  };
}

describe('OpportunityBriefCard · OB-R3 Seam-1 α (render-time advisory marker)', () => {
  test('advisory_marker renders verbatim from the sidecar on every card', () => {
    const brief = makeBrief();
    render(<OpportunityBriefCard brief={brief} />);
    const marker = screen.getByTestId('opportunity-brief-advisory-marker');
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveTextContent(ADVISORY_MARKER);
  });

  test('brief_text is rendered verbatim (grounding integrity render surface)', () => {
    const brief = makeBrief();
    render(<OpportunityBriefCard brief={brief} />);
    expect(screen.getByTestId('opportunity-brief-text')).toHaveTextContent(
      brief.brief_text,
    );
  });
});

describe('OpportunityBriefCard · OB-R6 scope chip · three scopes', () => {
  test.each([
    ['slice', 'Slice'],
    ['combined', 'Combined'],
    ['estate', 'Estate'],
  ])('scope=%s renders chip labelled %s', (scope, label) => {
    const brief = makeBrief({ brief_id: `brief_test_${scope}`, scope });
    render(<OpportunityBriefCard brief={brief} />);
    const chip = screen.getByTestId(`opportunity-brief-scope-chip-${scope}`);
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveTextContent(label);
  });
});

describe('OpportunityBriefCard · OB-R5 stale indicator', () => {
  test('stale=true surfaces the stale indicator', () => {
    const brief = makeBrief({ stale: true });
    render(<OpportunityBriefCard brief={brief} />);
    expect(
      screen.getByTestId('opportunity-brief-stale-indicator'),
    ).toBeInTheDocument();
  });

  test('stale=false does NOT surface the stale indicator', () => {
    const brief = makeBrief({ stale: false });
    render(<OpportunityBriefCard brief={brief} />);
    expect(
      screen.queryByTestId('opportunity-brief-stale-indicator'),
    ).not.toBeInTheDocument();
  });
});

describe('OpportunityBriefCard · OB-R4 shape-as-objective handoff', () => {
  test('button click invokes callback with brief payload', () => {
    const brief = makeBrief();
    const onShapeAsObjective = jest.fn();
    render(
      <OpportunityBriefCard
        brief={brief}
        onShapeAsObjective={onShapeAsObjective}
      />,
    );
    const btn = screen.getByTestId('opportunity-brief-shape-as-objective-button');
    fireEvent.click(btn);
    expect(onShapeAsObjective).toHaveBeenCalledTimes(1);
    expect(onShapeAsObjective).toHaveBeenCalledWith(brief);
  });
});
