/* Team · Canon §5 — DORMANT surface (UI-1-E fold).
 *
 * Owner ruling R2 (2026-07-31 addendum) verbatim:
 *   "nav entries for not-yet-rebuilt modules render as honest
 *    dormant/coming states rather than legacy pages"
 *
 * The engineer key-grant admin surface returns here. Backend endpoints
 * (/api/engineer/keys/*) remain reachable to Master Admin callers.
 */
import React from 'react';
import { AkkiShell, DormantCapabilityChip } from '../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../design/akkiv4_design_system';

export default function TeamDormantPage() {
  return (
    <AkkiShell title="Team" subtitle="Canon §5 · access register · key-grant admin · role scoping.">
      <div
        data-testid="team-dormant-panel"
        style={{
          background: `repeating-linear-gradient(45deg, ${AKKI_V4_PALETTE.mist}, ${AKKI_V4_PALETTE.mist} 4px, ${AKKI_V4_PALETTE.bone} 4px, ${AKKI_V4_PALETTE.bone} 8px)`,
          border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
          padding: '28px',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        }}
      >
        <h2
          style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
            fontSize: '1.4rem',
            color: AKKI_V4_PALETTE.ink,
            margin: '0 0 12px 0',
          }}
          data-testid="team-dormant-heading"
        >
          Dormant · UI-1-E fold
        </h2>
        <p style={{ fontSize: '0.95rem', color: AKKI_V4_PALETTE.ink, margin: '0 0 12px 0' }}>
          This module lands with UI-1-E. It will carry:
        </p>
        <ul style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink, margin: '0 0 12px 20px', lineHeight: 1.65 }}>
          <li>Access register · every identity + role · every scoped key grant.</li>
          <li>Key-grant issuance &amp; revocation (currently backend-only).</li>
          <li>Role scoping · Canon §5 six-role register applied to seats.</li>
        </ul>
        <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, margin: 0 }}>
          Master Admin callers may still mint or revoke engineer key grants via
          <code style={{ margin: '0 4px' }}>POST /api/engineer/keys/grant</code> and the revoke endpoints.
          The user-facing surface returns here with UI-1-E.
        </p>
        <DormantCapabilityChip label="Team UI" note="UI-1-E fold · Canon §5 access register." />
      </div>
    </AkkiShell>
  );
}
