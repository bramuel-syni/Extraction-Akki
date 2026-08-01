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
  'Approval Queue',
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

  test('Team renders as DORMANT tile (state=dormant, no href) · Prove is LIT after UI-1-D', () => {
    renderShell();
    const teamTile  = screen.getByTestId('canon-nav-tile-team');
    // Team dormant tile is NOT wrapped in a `Link` — its testid variant is
    // `canon-nav-tile-nolink-team`. The presence of that testid proves the
    // tile is not reachable as a link from the shell.
    expect(screen.getByTestId('canon-nav-tile-nolink-team')).toBeInTheDocument();
    // The state pill declares dormant.
    expect(teamTile.querySelector('[data-testid="canon-nav-state-dormant"]')).toBeTruthy();
    // Prove was DORMANT pre-UI-1-D · it is LIT after UI-1-D · Owner directive.
    const proveTile = screen.getByTestId('canon-nav-tile-prove');
    expect(proveTile.querySelector('[data-testid="canon-nav-state-lit"]')).toBeTruthy();
    expect(screen.queryByTestId('canon-nav-tile-nolink-prove')).toBeNull();
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
    expect(strip).toHaveTextContent(/Connect · Registry · Use Data · Govern · Prove/);
  });
});
