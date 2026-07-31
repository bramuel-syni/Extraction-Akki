/**
 * Phase 8 Seam 3 Sub-stage 1 — Refusals-card coverage marker rider.
 *
 * Renders per-family coverage-since dates on the Compliance Console §4.1
 * Refusals card. E7 middle-dot glyph (`\u00B7`) is used verbatim (NOT
 * hyphen); the Playwright chromium smoke
 * `test_coverage_marker_renders_middle_dot_glyph_verbatim` asserts the
 * glyph specifically.
 *
 * E3.β canonical mechanism (per Amendment E + R-1 data-shape invariant):
 * the coverage-marker `{date}` is a server-computed ISO date
 * (`YYYY-MM-DD` UTC), the earliest `NorthenaLedgerRow_v1` timestamp
 * whose `stamp_audit["refusal_family"]` matches per family. Rendered
 * verbatim — no client-locale composition (E3 ruling).
 *
 * R-3: `unclassified` is a registered, renderable family. If it
 * surfaces with a non-empty since_date, this rider surfaces it
 * honestly (never silence).
 */
import React from 'react';

const MIDDLE_DOT = '\u00B7'; // U+00B7 middle dot; E7 strictness.

function _fmtFamilyList(families) {
  if (!Array.isArray(families) || families.length === 0) return '';
  return families.join(`, `);
}

/**
 * @param {object} props
 * @param {object|null} props.coverage - RefusalsCoverageResponse shape or null while loading.
 * @param {number} props.status - HTTP status of the last coverage-marker load call.
 */
export default function RefusalsCoverageMarker({ coverage, status }) {
  if (coverage == null && status == null) {
    return (
      <p
        className="text-xs text-rms-mute mt-2"
        data-testid="coverage-marker-loading"
      >
        Loading coverage {MIDDLE_DOT} refusals card
      </p>
    );
  }
  if (status !== 200 || coverage == null) {
    return (
      <p
        className="text-xs text-rms-mute mt-2"
        data-testid="coverage-marker-load-error"
      >
        Coverage marker read failed {MIDDLE_DOT} status {status}
      </p>
    );
  }

  const {
    families_since_system_start: sinceSystem = [],
    families_since_seam_3: sinceSeam3 = [],
    per_family_since_date: perFamily = {},
    seam_3_earliest_date: seam3Date = null,
    honest_note_when_no_families_covered: honestNote = null,
  } = coverage;

  const hasAnyFamily = sinceSystem.length > 0 || sinceSeam3.length > 0;

  if (!hasAnyFamily) {
    return (
      <p
        className="text-xs text-rms-mute mt-2"
        data-testid="coverage-marker-empty"
      >
        {honestNote ||
          `No refusal-family coverage yet ${MIDDLE_DOT} this card will populate as families fire.`}
      </p>
    );
  }

  return (
    <div
      className="text-xs text-rms-mute mt-2 space-y-1"
      data-testid="coverage-marker-rider"
    >
      {sinceSystem.length > 0 && (
        <p data-testid="coverage-marker-since-system">
          <span>Counts {_fmtFamilyList(sinceSystem)} since system start</span>
          <span aria-hidden="true"> {MIDDLE_DOT} </span>
          <span>earlier events not affected.</span>
        </p>
      )}
      {sinceSeam3.length > 0 && (
        <p data-testid="coverage-marker-since-seam-3">
          <span>Counts {_fmtFamilyList(sinceSeam3)} since {seam3Date}</span>
          <span aria-hidden="true"> {MIDDLE_DOT} </span>
          <span>earlier events in those families were not recorded.</span>
        </p>
      )}
      <ul
        className="text-rms-mute list-none"
        data-testid="coverage-marker-per-family"
      >
        {Object.keys(perFamily)
          .sort()
          .map((family) => (
            <li
              key={family}
              data-testid={`coverage-marker-family-${family}`}
            >
              <span>{family}</span>
              <span aria-hidden="true"> {MIDDLE_DOT} </span>
              <span>since {perFamily[family]}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

// Named export for testability (glyph constant explicit).
export { MIDDLE_DOT };
