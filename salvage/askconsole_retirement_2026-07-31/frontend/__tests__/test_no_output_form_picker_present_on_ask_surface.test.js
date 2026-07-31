/**
 * Phase 8a-lite invariant: NO output-form picker on the Ask surface.
 *
 * UI Spec v1 §3.1 verbatim: "output is preset and invisible (composed
 * conclusion · person · synthesized-whole · standing floor). **No output
 * picker exists anywhere on this surface.** Wanting data or a different
 * form is a new objective, made elsewhere."
 *
 * This gate mounts the AskConsolePage and asserts that no `<select>`,
 * `role="listbox"`/`combobox`/`radiogroup`, or picker-shaped element that
 * would expose an "output form" choice is rendered on the ask surface.
 * The four preset defaults (`composed_conclusion`, `person`,
 * `synthesized_whole`, `floor`) must NOT appear as user-selectable
 * options — the only visible defaults surface is the quiet defaults line
 * with a disabled "change" affordance (§3.1 pattern; enabled at Phase 8
 * full when the Buyer Wizard lands).
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AskConsolePage from '../../pages/AskConsolePage';

function renderAsk() {
  return render(
    <BrowserRouter>
      <AskConsolePage />
    </BrowserRouter>
  );
}

describe('Phase 8a-lite: no output-form picker on Ask surface', () => {
  test('AskConsolePage renders no <select> element', () => {
    const { container } = renderAsk();
    // Zero HTMLSelectElements — a raw <select> is a picker.
    expect(container.querySelectorAll('select').length).toBe(0);
  });

  test('AskConsolePage renders no ARIA role=combobox/listbox/radiogroup', () => {
    const { container } = renderAsk();
    expect(container.querySelectorAll('[role="combobox"]').length).toBe(0);
    expect(container.querySelectorAll('[role="listbox"]').length).toBe(0);
    expect(container.querySelectorAll('[role="radiogroup"]').length).toBe(0);
  });

  test('AskConsolePage renders no data-testid pattern matching an output picker', () => {
    const { container } = renderAsk();
    const els = container.querySelectorAll(
      '[data-testid*="output-form"], [data-testid*="output-picker"], [data-testid*="form-select"]'
    );
    expect(els.length).toBe(0);
  });

  test('AskConsolePage does not surface the preset form values as visible options', () => {
    const { container } = renderAsk();
    // The preset values from §3.1 defaults are `composed_conclusion`,
    // `synthesized_whole`, `person`, `floor`. None should appear as visible
    // <option>/<button role="option"> — they live in the payload only.
    const optEls = container.querySelectorAll(
      'option, [role="option"], [data-testid*="form-option"]'
    );
    expect(optEls.length).toBe(0);
  });

  test('Quiet defaults line is present and change affordance is present but disabled', () => {
    renderAsk();
    // §3.1 quiet defaults line — verbatim shape "Standard: … · Scope: … · change"
    expect(screen.getByTestId('ask-quiet-defaults')).toBeInTheDocument();
    const changeBtn = screen.getByTestId('ask-defaults-change');
    expect(changeBtn).toBeInTheDocument();
    // Change affordance MUST NOT act as a picker at 8a-lite — enabled at
    // Phase 8 full when Buyer Wizard lands. Disabled state proves absence
    // of a runtime picker even if the wireframe copy exists.
    expect(changeBtn).toBeDisabled();
  });

  test('Ask binding copy renders verbatim per §3.1', () => {
    renderAsk();
    expect(screen.getByTestId('ask-binding-copy')).toHaveTextContent(
      'What do you need to know?'
    );
  });
});
