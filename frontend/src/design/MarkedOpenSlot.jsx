import React from 'react';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from './akkiv4_design_system';
import { OPEN_SLOT_MARKER_HINT } from './ratified_copy';

/* MarkedOpenSlot — the visual placeholder for every SUSPENDED Appendix A
 * copy slot (Owner Ruling 4).
 *
 * Never fill with invented copy. This component renders as a dashed
 * border + "— open —" glyph so the auditor can see every slot that is
 * pending Owner ratification.
 */
export function MarkedOpenSlot({ slotName, note }) {
  return (
    <span
      data-testid={`open-copy-slot-${slotName}`}
      role="note"
      aria-label={`Open copy slot: ${slotName}`}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
        color: AKKI_V4_PALETTE.sage,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        fontSize: '0.85rem',
        letterSpacing: '0.02em',
        background: AKKI_V4_PALETTE.mist,
      }}
      title={
        note ||
        `Suspended copy slot pending Owner ratification (Ruling 4, 2026-08-01)`
      }
    >
      {OPEN_SLOT_MARKER_HINT} {slotName}
    </span>
  );
}
