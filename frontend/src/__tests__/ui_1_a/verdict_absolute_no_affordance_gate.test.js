/* UI-1-A · Canon §1.3 · Doctrine 5 break-in gate.
 *
 * Owner iter12 addendum verbatim:
 *   "the three verdict states are demonstrable — either on the panel or
 *    by driving a real session to a verdict. The absolute-refusal
 *    no-affordance assertion must be verifiable in DOM."
 *
 * Doctrine 5 verbatim (Canon §1.3):
 *   "Absolute refusals render no approval affordance of any kind —
 *    not a disabled button, not a request-override link."
 *
 * This gate loads the verdict demo page (all four verdict states
 * side-by-side) and asserts, at the RENDERED-LOCATION level:
 *   1. All four sections mount.
 *   2. The absolute-refusal section renders NEITHER a
 *      `use-data-verdict-refusal-route-affordance` element NOR any
 *      button whose text hints at approval / override / escalate.
 *   3. The absolute-refusal section carries the no-affordance beacon.
 *   4. The escalatable-refusal section DOES carry the route affordance.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UseDataVerdictDemoPage from '../../pages/use_data/UseDataVerdictDemoPage';

function renderDemo() {
  return render(
    <MemoryRouter>
      <UseDataVerdictDemoPage />
    </MemoryRouter>,
  );
}

describe('UI-1-A · Verdict demo · Doctrine 5 break-in', () => {
  test('all four verdict sections mount instantly (no network)', () => {
    renderDemo();
    expect(screen.getByTestId('verdict-demo-section-runs-now')).toBeInTheDocument();
    expect(screen.getByTestId('verdict-demo-section-held-for-check')).toBeInTheDocument();
    expect(screen.getByTestId('verdict-demo-section-refused-escalatable')).toBeInTheDocument();
    expect(screen.getByTestId('verdict-demo-section-refused-absolute')).toBeInTheDocument();
  });

  test('runs_now section renders the trust-receipt reference (verbatim carrier)', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-runs-now');
    const beacon = within(section).getByTestId('use-data-verdict-trust-receipt');
    expect(beacon).toHaveTextContent(/trcv-demo-runs-now/);
  });

  test('held_for_check section names route + ceiling + proposed spend', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-held-for-check');
    expect(within(section).getByTestId('use-data-verdict-held-route')).toHaveTextContent(
      /Pending policy check/i,
    );
    expect(within(section).getByTestId('use-data-verdict-held-ceiling')).toHaveTextContent(
      /1,000/,
    );
    expect(within(section).getByTestId('use-data-verdict-held-ceiling')).toHaveTextContent(
      /2,500/,
    );
  });

  test('REFUSED · escalatable renders route affordance + criterion', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-refused-escalatable');
    expect(within(section).getByTestId('use-data-verdict-refused-escalatable')).toBeInTheDocument();
    expect(within(section).getByTestId('use-data-verdict-refusal-route-affordance')).toBeInTheDocument();
    expect(within(section).getByTestId('use-data-verdict-refusal-criterion')).toHaveTextContent(
      /Privacy floor/i,
    );
  });

  test('REFUSED · absolute — Doctrine 5 · MUST render NO approval affordance', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-refused-absolute');
    // The absolute panel is present.
    expect(within(section).getByTestId('use-data-verdict-refused-absolute')).toBeInTheDocument();
    // The no-affordance beacon IS present.
    expect(within(section).getByTestId('use-data-verdict-refusal-no-affordance-beacon')).toBeInTheDocument();
    // The route-affordance testid MUST NOT appear anywhere in this section.
    expect(within(section).queryByTestId('use-data-verdict-refusal-route-affordance')).toBeNull();
    // No approval / override / escalate BUTTON element renders inside this section.
    const buttons = within(section).queryAllByRole('button');
    for (const b of buttons) {
      expect((b.textContent || '').toLowerCase()).not.toMatch(
        /approve|approval|override|request|escalate|resubmit|retry/,
      );
    }
    // No link with approval-suggesting text either.
    const links = within(section).queryAllByRole('link');
    for (const l of links) {
      expect((l.textContent || '').toLowerCase()).not.toMatch(
        /approve|approval|override|request|escalate|resubmit|retry/,
      );
    }
    // Bar source is stated (auditor-facing evidence).
    expect(within(section).getByTestId('use-data-verdict-refusal-bar-source')).toHaveTextContent(
      /Canon §1\.3/,
    );
    // Absolute-refusal criterion mentions Doctrine 5 (auditor-facing).
    expect(within(section).getByTestId('use-data-verdict-refusal-criterion')).toHaveTextContent(
      /Canon §1\.3/,
    );
  });

  test('every verdict panel carries the verbatim carrier footer', () => {
    renderDemo();
    for (const id of [
      'verdict-demo-section-runs-now',
      'verdict-demo-section-held-for-check',
      'verdict-demo-section-refused-escalatable',
      'verdict-demo-section-refused-absolute',
    ]) {
      const section = screen.getByTestId(id);
      const carrier = within(section).getByTestId('use-data-verdict-verbatim-carrier');
      expect(carrier).toHaveTextContent(
        'Every commission verdict lands in the record the DPO reads.',
      );
    }
  });
});
