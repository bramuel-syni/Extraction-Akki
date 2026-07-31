import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell, DormantCapabilityChip } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';

/* CONNECT home — Phase 3 sub-cycle 1 (FB-1 module, Owner ruling 2026-08-01).
 *
 * Every capability rendered here is DORMANT · not-yet-measured.
 * No live claim. No "coming soon" placeholder. Just an honest surface
 * showing the capability shape + the OT-1a fact-gate.
 */
export default function ConnectHomePage() {
  const [capabilities, setCapabilities] = useState([]);
  const [posture, setPosture] = useState('loading');
  const [sourcesPosture, setSourcesPosture] = useState('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await api.connectCapabilities();
      if (cancelled) return;
      if (c.status === 200) {
        setCapabilities(c.body.capabilities || []);
        setPosture(c.body.posture || 'unknown');
      }
      const s = await api.connectListSources();
      if (cancelled) return;
      if (s.status === 200) setSourcesPosture(s.body.posture || 'unknown');
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AkkiShell
      title="Connect"
      subtitle="Source connection · rights at connection"
      right={
        <Link
          to="/connect/new"
          data-testid="connect-nav-new-source"
          style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            color: AKKI_V4_PALETTE.navy,
            border: `1px solid ${AKKI_V4_PALETTE.navy}`,
            padding: '8px 14px',
            textDecoration: 'none',
          }}
        >Register a source</Link>
      }
    >
      <section data-testid="connect-posture-banner" style={{
        background: AKKI_V4_PALETTE.mist,
        border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
        padding: '14px 18px',
        marginBottom: '20px',
      }}>
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.05rem',
          color: AKKI_V4_PALETTE.ink,
        }} data-testid="connect-posture-headline">
          Posture · every capability is dormant
        </div>
        <div style={{
          fontSize: '0.9rem',
          color: AKKI_V4_PALETTE.sage,
          marginTop: '6px',
        }} data-testid="connect-posture-detail">
          Source-connector registry is not yet live. Registration will land
          when Owner OT-1a facts arrive. Each capability below is visible
          and honestly marked; none is presented as live.
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage }}>
          backend posture: <code data-testid="connect-backend-posture">{posture}</code> ·
          sources: <code data-testid="connect-sources-posture">{sourcesPosture}</code>
        </div>
      </section>

      <h2 style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
        fontSize: '1.1rem',
        color: AKKI_V4_PALETTE.ink,
        marginBottom: '10px',
      }}>Capabilities</h2>
      <div data-testid="connect-capabilities-list">
        {capabilities.map((cap) => (
          <div
            key={cap.capability_id}
            data-testid={`connect-capability-${cap.capability_id}`}
            style={{
              background: AKKI_V4_PALETTE.bone,
              border: `1px solid ${AKKI_V4_PALETTE.mist}`,
              padding: '14px 18px',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <span style={{
                  fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
                  fontSize: '1rem',
                  color: AKKI_V4_PALETTE.ink,
                }} data-testid={`connect-capability-label-${cap.capability_id}`}>{cap.label}</span>
                <DormantCapabilityChip label={cap.capability_id} note={`awaiting ${cap.awaiting}`} />
              </div>
              <span style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>
                awaiting · {cap.awaiting}
              </span>
            </div>
            <div style={{ marginTop: '6px', fontSize: '0.9rem', color: AKKI_V4_PALETTE.navy }}>
              {cap.note}
            </div>
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage }}>
              unmeasured dimensions:{' '}
              {(cap.unmeasured_dimensions || []).map((d) => (
                <MarkedOpenSlot key={d} slotName={d} note="not-yet-measured (per Ruling 1)" />
              ))}
            </div>
          </div>
        ))}
        {capabilities.length === 0 && (
          <div data-testid="connect-empty-note" style={{
            color: AKKI_V4_PALETTE.sage, fontSize: '0.9rem',
          }}>
            No capabilities returned by the backend. If the backend is up,
            this is a governed-empty state (not an error).
          </div>
        )}
      </div>
    </AkkiShell>
  );
}
