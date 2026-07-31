/**
 * Phase 8 Seam 3 Sub-stage 1 — RefusalsCoverageMarker structural tests.
 *
 * Gates:
 *   - Empty state renders honest-empty-note (not silence, per R-3).
 *   - Populated state renders middle-dot (·, U+00B7) verbatim.
 *   - Per-family since-date list surfaces `unclassified` if present.
 *   - Load-error state uses middle-dot too.
 *
 * The Playwright glyph smoke is elsewhere; this Jest suite covers the
 * component's structural contract independent of routing.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import RefusalsCoverageMarker, {
  MIDDLE_DOT,
} from '../../pages/compliance/RefusalsCoverageMarker';

const U_00B7 = '\u00B7'; // Explicit assertion target for the glyph gate.

describe('RefusalsCoverageMarker — Sub-stage 1', () => {
  test('MIDDLE_DOT export IS the U+00B7 codepoint verbatim (not a hyphen)', () => {
    expect(MIDDLE_DOT).toBe(U_00B7);
    expect(MIDDLE_DOT.charCodeAt(0)).toBe(0x00b7);
    expect(MIDDLE_DOT).not.toBe('-');
  });

  test('loading state renders coverage-marker-loading with middle-dot', () => {
    render(<RefusalsCoverageMarker coverage={null} status={null} />);
    const el = screen.getByTestId('coverage-marker-loading');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain(U_00B7);
    expect(el.textContent).not.toContain(' - refusals card');
  });

  test('load-error state renders coverage-marker-load-error with middle-dot', () => {
    render(<RefusalsCoverageMarker coverage={null} status={500} />);
    const el = screen.getByTestId('coverage-marker-load-error');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain(U_00B7);
  });

  test('empty coverage renders honest empty-state note (not silence)', () => {
    render(
      <RefusalsCoverageMarker
        coverage={{
          families_since_system_start: [],
          families_since_seam_3: [],
          per_family_since_date: {},
          seam_3_earliest_date: null,
          honest_note_when_no_families_covered:
            'No families yet ' + U_00B7 + ' honest empty-state',
        }}
        status={200}
      />
    );
    const el = screen.getByTestId('coverage-marker-empty');
    expect(el.textContent).toContain(U_00B7);
    expect(el.textContent).toContain('honest empty-state');
  });

  test('populated seam-3 families render since-date with middle-dot', () => {
    render(
      <RefusalsCoverageMarker
        coverage={{
          families_since_system_start: [],
          families_since_seam_3: ['composition_below_floor'],
          per_family_since_date: {
            composition_below_floor: '2026-07-07',
          },
          seam_3_earliest_date: '2026-07-07',
          honest_note_when_no_families_covered: null,
        }}
        status={200}
      />
    );
    const seam3Line = screen.getByTestId('coverage-marker-since-seam-3');
    expect(seam3Line.textContent).toContain(U_00B7);
    expect(seam3Line.textContent).toContain('2026-07-07');
    // Per-family list line renders the family with a middle-dot separator.
    const perFamily = screen.getByTestId(
      'coverage-marker-family-composition_below_floor'
    );
    expect(perFamily.textContent).toContain(U_00B7);
    expect(perFamily.textContent).toContain('2026-07-07');
  });

  test('all 4 registry families (incl. R-3 unclassified) render if present', () => {
    render(
      <RefusalsCoverageMarker
        coverage={{
          families_since_system_start: [],
          families_since_seam_3: [
            'admission_refusals',
            'composition_below_floor',
            'outer_gate_refusals',
            'unclassified',
          ],
          per_family_since_date: {
            admission_refusals: '2026-07-07',
            composition_below_floor: '2026-07-07',
            outer_gate_refusals: '2026-07-08',
            unclassified: '2026-07-08',
          },
          seam_3_earliest_date: '2026-07-07',
          honest_note_when_no_families_covered: null,
        }}
        status={200}
      />
    );
    for (const family of [
      'admission_refusals',
      'composition_below_floor',
      'outer_gate_refusals',
      'unclassified',
    ]) {
      const line = screen.getByTestId(`coverage-marker-family-${family}`);
      expect(line).toBeTruthy();
      expect(line.textContent).toContain(U_00B7);
    }
  });
});
