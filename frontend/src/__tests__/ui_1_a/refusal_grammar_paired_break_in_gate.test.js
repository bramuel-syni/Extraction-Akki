/* UI-1-A · Iter14 · PAIRED break-in gate for the refusal grammar.
 *
 * Owner iter14 grammar ruling (2026-07-31 addendum) verbatim:
 *   "REFUSED-escalatable's 'route to approval' must be an INTERACTIVE
 *    element (link/button to the approval surface), not plain text.
 *    Canon §1.3: the refusal 'routes to the approval surface. Someone
 *    can approve; the system says who.' Routing means actionable.
 *    This is also the load-bearing asymmetry: absolute = zero
 *    affordance, escalatable = a working route. Until Team (UI-1-E)
 *    exists, the route may point to the Govern holds surface or render
 *    the route target with an honest dormant marker if the destination
 *    page isn't built — but it must be an element, not prose. Add the
 *    Jest cell asserting the interactive route in the escalatable
 *    section AND its absence in the absolute section (paired break-in)."
 *
 * This gate is the paired assertion:
 *   - escalatable section: an <a> element with href AND
 *     data-testid='use-data-verdict-refusal-route-affordance' is present.
 *   - absolute section:  NO <a>, NO <button>, NO interactive element
 *     of any kind; no data-testid='use-data-verdict-refusal-route-affordance'.
 *   - held-for-check section: also has an interactive route affordance
 *     (data-testid='use-data-verdict-held-route-affordance') per the
 *     same grammar (single DPO countersign is actionable).
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

describe('UI-1-A · Iter14 refusal-grammar paired break-in', () => {
  test('REFUSED · escalatable renders an INTERACTIVE route affordance (a link)', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-refused-escalatable');
    const affordance = within(section).getByTestId('use-data-verdict-refusal-route-affordance');
    // Load-bearing check: this is a Link component, which renders as
    // an <a> element with an href attribute (interactive · keyboard-
    // reachable · role="link" implicit).
    expect(affordance.tagName.toLowerCase()).toBe('a');
    expect(affordance).toHaveAttribute('href');
    // href points to a real Canon-live surface (Govern is Canon-conformant
    // today; per the grammar ruling the route may later migrate to Team
    // access-register when UI-1-E lands).
    const href = affordance.getAttribute('href') || '';
    expect(href).toMatch(/\/govern|\/team|\/master-admin/);
    // The affordance text carries the destination label so the user
    // knows where they land BEFORE clicking.
    expect(affordance.textContent || '').toMatch(/Open|→/);
  });

  test('REFUSED · escalatable ALSO renders the route-label (plain text) alongside', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-refused-escalatable');
    // The plain-text label sits beside the interactive affordance so
    // the criterion & the actionable destination are both visible.
    const label = within(section).getByTestId('use-data-verdict-refusal-route-label');
    expect(label).toBeInTheDocument();
    expect(label.tagName.toLowerCase()).not.toBe('a'); // label is prose · affordance is the link.
  });

  test('REFUSED · absolute renders ZERO interactive elements (Doctrine 5 · paired)', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-refused-absolute');
    // The route-affordance testid MUST NOT appear.
    expect(within(section).queryByTestId('use-data-verdict-refusal-route-affordance')).toBeNull();
    expect(within(section).queryByTestId('use-data-verdict-held-route-affordance')).toBeNull();
    // No <a> elements ANYWHERE in the section.
    const links = section.querySelectorAll('a');
    expect(links.length).toBe(0);
    // No <button> elements either.
    const buttons = section.querySelectorAll('button');
    expect(buttons.length).toBe(0);
    // Aria-role assertions catch any custom interactive elements too.
    expect(within(section).queryAllByRole('link').length).toBe(0);
    expect(within(section).queryAllByRole('button').length).toBe(0);
  });

  test('HELD_FOR_CHECK · single DPO countersign route is interactive', () => {
    renderDemo();
    const section = screen.getByTestId('verdict-demo-section-held-for-check');
    const affordance = within(section).getByTestId('use-data-verdict-held-route-affordance');
    expect(affordance.tagName.toLowerCase()).toBe('a');
    expect(affordance).toHaveAttribute('href');
    expect(affordance.getAttribute('href') || '').toMatch(/\/govern/);
  });

  test('PAIRED ASYMMETRY: escalatable link.count === 1 · absolute link.count === 0', () => {
    renderDemo();
    const esc = screen.getByTestId('verdict-demo-section-refused-escalatable');
    const abs = screen.getByTestId('verdict-demo-section-refused-absolute');
    expect(within(esc).queryAllByRole('link').length).toBeGreaterThanOrEqual(1);
    expect(within(abs).queryAllByRole('link').length).toBe(0);
  });
});
