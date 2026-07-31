/* Prove · Canon §9 — DORMANT surface (UI-1-D fold).
 *
 * Owner ruling R2 (2026-07-31 addendum) verbatim:
 *   "nav entries for not-yet-rebuilt modules render as honest
 *    dormant/coming states rather than legacy pages"
 *
 * This page renders the visibly-unlit / hatched state per Owner design
 * law. NO legacy compliance content, NO ask-console redirect.
 */
import React from 'react';
import { AkkiShell, DormantCapabilityChip } from '../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../design/akkiv4_design_system';

export default function ProveDormantPage() {
  return (
    <AkkiShell title="Prove" subtitle="Canon §9 · Prove-one-run · Rulebook · the auditor\u2019s edge.">
      <div
        data-testid="prove-dormant-panel"
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
          data-testid="prove-dormant-heading"
        >
          Dormant · UI-1-D fold
        </h2>
        <p style={{ fontSize: '0.95rem', color: AKKI_V4_PALETTE.ink, margin: '0 0 12px 0' }}>
          This module lands with UI-1-D. It will carry:
        </p>
        <ul style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink, margin: '0 0 12px 20px', lineHeight: 1.65 }}>
          <li>Prove-one-run · the trust-receipt walkthrough for any run.</li>
          <li>Rulebook · write, read, promote / retire rules.</li>
          <li>Retention &amp; rights · the auditor&rsquo;s estate walk.</li>
        </ul>
        <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, margin: 0 }}>
          Backend endpoints for compliance surfaces remain reachable to authenticated
          Master Admin callers (see <code>/api/compliance/*</code>). The user-facing
          surface returns with UI-1-D.
        </p>
        <DormantCapabilityChip label="Prove UI" note="UI-1-D fold · scheduled next after UI-1-B and UI-1-C." />
      </div>
    </AkkiShell>
  );
}
