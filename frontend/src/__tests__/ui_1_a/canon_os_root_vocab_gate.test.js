/* Owner ruling R1 (2026-07-31 addendum · extended vocab gate).
 *
 * Retired vocabulary MUST NOT render on any general-user surface:
 *   - "RMS Intelligence"                (system rename to Akki OS)
 *   - "Ask Console"                     (retired console name)
 *   - Ask-first landing pattern         (retired UX pattern)
 *   - "Objectives" · "Ambitions"        (retired sub-cycle 2 vocab)
 *   - "Approval Queue"                  (retired sub-cycle 3 vocab)
 *   - "Operator Home" · "Engineer"      (nav-label retirement)
 *   - "Extract" as a top-level module   (Owner R3: nav renders "Use Data")
 *
 * This gate loads the Canon OS root shell and asserts the retired vocab
 * is absent from the RENDERED DOM. It is intentionally RENDERED-LOCATION
 * discipline (not a source-file grep) — matches the sub-cycle-3 lesson.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CanonOSShellPage from '../../pages/CanonOSShellPage';
import { AuthProvider } from '../../hooks/useAuth';

function renderShell() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CanonOSShellPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

const RETIRED_TERMS = Object.freeze([
  'RMS Intelligence',
  'Ask Console',
  'AskConsole',
  'ask-first landing',
  'Objectives',
  'Ambitions',
  'Approval Queue',    // Owner UI-1-E: Canon vocab is "approval surface" / "Team"; "Approval Queue" as a NAME must not render.
  'Operator Home',
  'Engineer Register',
  'Extract',   // Owner R3: nav renders Use Data, not Extract.
  'My Objectives',
  'Shape this objective',   // Owner UI-1-D: Canon C.4 rename to "Put this to work".
]);

describe('Canon OS root · extended retired-vocabulary gate (R1)', () => {
  test.each(RETIRED_TERMS)(
    'retired term %j MUST NOT render on the Canon OS shell root',
    (term) => {
      renderShell();
      const bodyText = document.body.textContent || '';
      // Case-insensitive: retired vocabulary is retired in any casing.
      const found = bodyText.toLowerCase().includes(term.toLowerCase());
      expect({ term, found, bodyText: bodyText.slice(0, 500) }).toEqual(
        expect.objectContaining({ term, found: false }),
      );
    },
  );

  test('the wordmark reads "Akki OS" (not RMS Intelligence)', () => {
    renderShell();
    const wordmark = screen.getByTestId('akki-wordmark');
    expect(wordmark).toHaveTextContent(/Akki OS/i);
  });

  test('the six-tile nav renders Canon §3.1 verbatim order and labels', () => {
    renderShell();
    const expectedOrder = ['connect', 'registry', 'use-data', 'govern', 'prove', 'team'];
    for (const id of expectedOrder) {
      expect(screen.getByTestId(`canon-nav-tile-${id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`canon-nav-label-${id}`)).toBeInTheDocument();
    }
    // Label text must match Canon vocabulary verbatim (no legacy fallback).
    expect(screen.getByTestId('canon-nav-label-use-data')).toHaveTextContent(/^Use Data$/);
    expect(screen.getByTestId('canon-nav-label-connect')).toHaveTextContent(/^Connect$/);
    expect(screen.getByTestId('canon-nav-label-registry')).toHaveTextContent(/^Registry$/);
    expect(screen.getByTestId('canon-nav-label-govern')).toHaveTextContent(/^Govern$/);
    expect(screen.getByTestId('canon-nav-label-prove')).toHaveTextContent(/^Prove$/);
    expect(screen.getByTestId('canon-nav-label-team')).toHaveTextContent(/^Team$/);
  });

  test('All six modules are REACHABLE after UI-1-E (no dormant tiles remain)', () => {
    renderShell();
    // All six module tiles are reachable Links (no nolink variants).
    // Registry remains `partial` (Canon §8 sub-cycle 2) — reachable but not full.
    // The other five are `lit`.
    ['connect', 'registry', 'use-data', 'govern', 'prove', 'team'].forEach((id) => {
      const tile = screen.getByTestId(`canon-nav-tile-${id}`);
      expect(tile).toBeInTheDocument();
      // Reachable: not a dormant nolink variant.
      expect(screen.queryByTestId(`canon-nav-tile-nolink-${id}`)).toBeNull();
      expect(tile.querySelector('[data-testid="canon-nav-state-dormant"]')).toBeNull();
      // Either lit or partial (both are reachable states).
      const isLitOrPartial =
        tile.querySelector('[data-testid="canon-nav-state-lit"]') !== null ||
        tile.querySelector('[data-testid="canon-nav-state-partial"]') !== null;
      expect(isLitOrPartial).toBe(true);
    });
    // Only registry may be partial — the other five must be lit.
    ['connect', 'use-data', 'govern', 'prove', 'team'].forEach((id) => {
      const tile = screen.getByTestId(`canon-nav-tile-${id}`);
      expect(tile.querySelector('[data-testid="canon-nav-state-lit"]')).toBeTruthy();
    });
  });

  test('the Canon §11.1 verbatim binding line renders on the root', () => {
    renderShell();
    const verbatim = screen.getByTestId('canon-os-canon-11-1-verbatim');
    expect(verbatim).toHaveTextContent('Conversation shapes; the card commits.');
  });

  test('the "what this preview serves" strip is present (Owner viewable-build addendum)', () => {
    renderShell();
    const strip = screen.getByTestId('canon-os-preview-what-this-serves');
    expect(strip).toBeInTheDocument();
    // Explicitly names Canon OS + lists the four lit modules.
    expect(strip).toHaveTextContent(/Canon OS shell/);
    expect(strip).toHaveTextContent(/Connect · Registry · Use Data · Govern · Prove · Team/);
  });
});
