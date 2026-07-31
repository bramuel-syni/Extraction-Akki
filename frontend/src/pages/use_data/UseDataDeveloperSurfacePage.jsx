/* UI-1-A · Developer surface · Canon §6.6.
 *
 * Not a nav module: the post-commission management view of an
 * Integrate-an-App item, reached from its row.
 *
 * Content (Canon §6.6 verbatim):
 *   scoped key · webhook · event type · status · usage strip · the line
 *   "every call lands in the record the DPO reads."
 *
 * Doctrine (Canon §6.6 verbatim):
 *   "identical terms to internal use; no lighter-weight path for machines."
 *
 * UI-1-A honest gap: the read of the scoped key + usage strip depends on
 * an integration-app read endpoint that lands in UI-1-B (pipeline
 * durability). Until then, this surface renders the row header + a
 * MarkedOpenSlot for the yet-unmeasured strips, with the doctrine line
 * and the verbatim carrier both rendered as canon-binding text.
 */
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';

const CANON_S6_6_DOCTRINE_VERBATIM =
  'identical terms to internal use; no lighter-weight path for machines.';
const CANON_S6_6_RECORD_LINE_VERBATIM =
  'every call lands in the record the DPO reads.';

export default function UseDataDeveloperSurfacePage() {
  const { sessionId } = useParams();
  return (
    <AkkiShell
      title="Developer surface"
      subtitle="Post-commission · Integrate-an-App"
    >
      <p
        data-testid="use-data-developer-back-link"
        style={{ marginBottom: '18px' }}
      >
        <Link to="/use-data" style={{ color: AKKI_V4_PALETTE.navy }}>
          ← Use Data
        </Link>
      </p>
      <div
        data-testid="use-data-developer-row-header"
        style={{
          padding: '18px 20px',
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        }}
      >
        <div
          style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
            fontSize: '1.2rem',
            color: AKKI_V4_PALETTE.ink,
          }}
        >
          Integrate-an-App session · {sessionId}
        </div>
        <div
          style={{
            marginTop: '14px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            fontSize: '0.85rem',
          }}
        >
          <div>
            <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              scoped key
            </div>
            <div data-testid="use-data-developer-scoped-key">
              <MarkedOpenSlot slotName="scoped-key" note="Reads land with the pipeline sidecar (UI-1-B)." />
            </div>
          </div>
          <div>
            <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              webhook
            </div>
            <div data-testid="use-data-developer-webhook">
              <MarkedOpenSlot slotName="webhook" note="Configured after commit; reads land with UI-1-B." />
            </div>
          </div>
          <div>
            <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              event type
            </div>
            <div data-testid="use-data-developer-event-type">
              <MarkedOpenSlot slotName="event-type" />
            </div>
          </div>
          <div>
            <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              status
            </div>
            <div data-testid="use-data-developer-status">
              <MarkedOpenSlot slotName="status" />
            </div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              usage strip
            </div>
            <div data-testid="use-data-developer-usage-strip">
              <MarkedOpenSlot slotName="usage-strip" note="30-day call counts land with pipeline durability (UI-1-B)." />
            </div>
          </div>
        </div>
        <p
          data-testid="use-data-developer-record-line-verbatim"
          style={{
            marginTop: '18px',
            fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
            fontSize: '0.9rem',
            color: AKKI_V4_PALETTE.ink,
            fontStyle: 'italic',
          }}
        >
          {CANON_S6_6_RECORD_LINE_VERBATIM}
        </p>
        <p
          data-testid="use-data-developer-doctrine-verbatim"
          style={{
            marginTop: '4px',
            fontSize: '0.8rem',
            color: AKKI_V4_PALETTE.oxblood,
            fontStyle: 'italic',
          }}
        >
          {CANON_S6_6_DOCTRINE_VERBATIM}
        </p>
      </div>
    </AkkiShell>
  );
}
