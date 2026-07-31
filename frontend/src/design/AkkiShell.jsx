import React from 'react';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from './akkiv4_design_system';

/* AkkiShell — wraps every Phase-3 sub-cycle-1 screen with the ratified
 * visual family (cream #F3F2E9 + Georgia wordmark + Helvetica labels).
 *
 * NO build state per Owner design law. Every capability rendered on a
 * shell page is EITHER lit (measured — pass live data) OR dormant
 * (visibly unlit/hatched — see DormantCapabilityChip in this file).
 *
 * Owner directive verbatim: "no build state on any surface; class-with-claim
 * in headline position; refusal rendering in the answer position".
 */
export function AkkiShell({ traceId, title, subtitle, children, right }) {
  return (
    <div
      data-testid="akki-shell"
      style={{
        background: AKKI_V4_PALETTE.cream,
        minHeight: '100vh',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        color: AKKI_V4_PALETTE.navy,
      }}
    >
      <header
        data-testid="akki-shell-header"
        style={{
          padding: '18px 24px',
          borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <div>
          <div
            data-testid="akki-wordmark"
            style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
              fontSize: '1.6rem',
              fontWeight: 400,
              color: AKKI_V4_PALETTE.ink,
              letterSpacing: '-0.01em',
            }}
          >Akki OS</div>
          {title && (
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
              fontSize: '1.2rem',
              color: AKKI_V4_PALETTE.ink,
              marginTop: '4px',
            }} data-testid="akki-shell-title">{title}</div>
          )}
          {subtitle && (
            <div style={{
              fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginTop: '2px',
            }} data-testid="akki-shell-subtitle">{subtitle}</div>
          )}
        </div>
        <div>{right}</div>
      </header>
      <main style={{ padding: '24px' }}>
        {children}
      </main>
      {traceId && (
        <footer
          data-testid="akki-shell-trace-rail"
          style={{
            padding: '10px 24px',
            borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
            fontSize: '0.75rem',
            color: AKKI_V4_PALETTE.sage,
          }}
        >
          trace_id · {traceId}  ·  one trace thread (N-INV)
        </footer>
      )}
    </div>
  );
}

/* DormantCapabilityChip — the honest "not yet measured / not yet live"
 * marker per Owner cycle-3 directive: "the stub must be honestly marked
 * per the four designed states (dormant capability visible + unlit;
 * not-yet-measured hatched), never presented as live."
 */
export function DormantCapabilityChip({ label, note }) {
  return (
    <span
      data-testid="dormant-capability-chip"
      role="note"
      aria-label={`dormant · ${label}`}
      style={{
        display: 'inline-block',
        padding: '4px 10px',
        border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
        color: AKKI_V4_PALETTE.sage,
        background: `repeating-linear-gradient(45deg, ${AKKI_V4_PALETTE.mist}, ${AKKI_V4_PALETTE.mist} 4px, ${AKKI_V4_PALETTE.cream} 4px, ${AKKI_V4_PALETTE.cream} 8px)`,
        fontSize: '0.8rem',
        letterSpacing: '0.02em',
        marginLeft: '8px',
      }}
      title={note || 'Dormant · not-yet-measured · awaiting Owner OT-1a facts.'}
    >
      dormant · {label}
    </span>
  );
}

/* AgentAssumedChip — amber marker (Owner design law); XOR-with-supplied. */
export function AgentAssumedChip({ label }) {
  return (
    <span
      data-testid={`agent-assumed-chip-${label || 'field'}`}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '10px',
        background: AKKI_V4_PALETTE.amber,
        color: AKKI_V4_PALETTE.cream,
        fontSize: '0.75rem',
        letterSpacing: '0.02em',
        marginLeft: '6px',
        fontWeight: 600,
      }}
      title="Agent-assumed value — confirm or change at commit review."
    >agent-assumed</span>
  );
}
