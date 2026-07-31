import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import {
  AccessControlDeniedPanel,
  GovernedRefusalCard,
  InfrastructureFaultPanel,
} from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';

/* Plane observability panel — read-only aggregates.
 *
 * Owner Ruling 2 (2026-08-01): "APPROVED-WITH-PHASE-3, rides sub-cycle 2".
 * Reads only the aggregator endpoint (which itself reads only Northena
 * ledger rows). Zero new frozen contracts.
 *
 * Rendering discipline:
 *   • publication acceptance rate: null when attempts == 0 →
 *     <MarkedOpenSlot> (never 0/0 as "0%").
 *   • contribution counts by class: fact / utterance / non_factual;
 *     buckets with zero count render as <MarkedOpenSlot> when the total
 *     is also zero (unset-vs-empty discipline per FB-13).
 *   • revocation history: rendered plainly, same weight as active-state
 *     panels; never hidden.
 */
export default function MemoryPlaneObservabilityPage() {
  const { planeId } = useParams();
  const [obs, setObs] = useState(null);
  const [deny, setDeny] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.memoryGetPlaneObservability(planeId);
      if (r.status === 200) setObs(r.body);
      else if (r.status === 401 || r.status === 403) setDeny(r.body);
      else if (r.status === 422 && r.body?.outcome === 'refused') setRefusal(r.body);
      else if (r.status >= 500) setFault({ status: r.status, body: r.body });
    })();
  }, [planeId]);

  if (deny) return (
    <AkkiShell title="Plane observability" subtitle={planeId}>
      <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} traceId={planeId} />
    </AkkiShell>
  );
  if (refusal) return (
    <AkkiShell title="Plane observability" subtitle={planeId}>
      <GovernedRefusalCard reason={refusal.reason} detail={refusal.detail} traceId={planeId} onAccept={() => {}} onNarrow={() => {}} onLower={() => {}} />
    </AkkiShell>
  );
  if (fault) return (
    <AkkiShell title="Plane observability" subtitle={planeId}>
      <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." traceId={planeId} />
    </AkkiShell>
  );
  if (!obs) return (
    <AkkiShell title="Plane observability" subtitle={planeId}>
      <div style={{ color: AKKI_V4_PALETTE.sage }}>Reading ledger…</div>
    </AkkiShell>
  );

  const attempted = obs.publication_counts.attempted;
  const rate = obs.publication_acceptance_rate;
  const totalLanded = obs.contribution_counts.landed;

  return (
    <AkkiShell
      title="Plane observability"
      subtitle={`${planeId} · ${obs.state}`}
      traceId={planeId}
      right={<Link to={`/memory/planes/${planeId}`} data-testid="obs-back-to-detail" style={{ color: AKKI_V4_PALETTE.navy }}>← plane detail</Link>}
    >
      <section style={{
        background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px', marginBottom: '16px',
      }} data-testid="obs-plane-envelope-section">
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.15rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
          Aggregate · class · observability_v0
        </h2>
        <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginTop: '6px' }}>
          Read-only aggregate over Northena ledger rows filtered by
          <code> stamp_audit.plane_id</code>. Zero new frozen contracts.
        </div>
      </section>

      <section data-testid="obs-contribution-class-section" style={{
        background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px', marginBottom: '16px',
      }}>
        <h3 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
          Contribution counts · by class
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '10px' }}>
          {['fact', 'utterance', 'non_factual'].map((cls) => {
            const n = obs.contribution_class_counts[cls] ?? 0;
            return (
              <div key={cls}
                data-testid={`obs-class-count-${cls}`}
                style={{
                  border: `1px solid ${AKKI_V4_PALETTE.mist}`,
                  padding: '10px 14px', background: AKKI_V4_PALETTE.cream,
                }}
              >
                <div style={{
                  fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: AKKI_V4_PALETTE.sage,
                }}>{cls}</div>
                <div style={{
                  fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.4rem',
                  color: AKKI_V4_PALETTE.ink, marginTop: '2px',
                }} data-testid={`obs-class-value-${cls}`}>
                  {totalLanded === 0 ? (
                    <MarkedOpenSlot slotName={`class_${cls}`} note="No contributions landed yet — bucket unset, not empty." />
                  ) : n}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, marginTop: '10px' }}>
          landed total · <strong style={{ color: AKKI_V4_PALETTE.ink }}>{totalLanded}</strong> ·
          refused · <strong style={{ color: AKKI_V4_PALETTE.ink }}>{obs.contribution_counts.refused}</strong>
        </div>
      </section>

      <section data-testid="obs-publication-section" style={{
        background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px', marginBottom: '16px',
      }}>
        <h3 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
          Publication acceptance rate
        </h3>
        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '12px', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rate</div>
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.5rem', color: AKKI_V4_PALETTE.ink,
            }} data-testid="obs-publication-rate">
              {attempted === 0 || rate === null || rate === undefined ? (
                <MarkedOpenSlot slotName="publication_rate" note="No publication attempts yet — rate is undefined (never 0/0 as 0%)." />
              ) : (
                `${(rate * 100).toFixed(1)}%`
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Attempted</div>
            <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.2rem', color: AKKI_V4_PALETTE.ink }} data-testid="obs-pub-attempted">{obs.publication_counts.attempted}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Landed</div>
            <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.2rem', color: AKKI_V4_PALETTE.ink }} data-testid="obs-pub-landed">{obs.publication_counts.landed}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Refused</div>
            <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.2rem', color: AKKI_V4_PALETTE.ink }} data-testid="obs-pub-refused">{obs.publication_counts.refused}</div>
          </div>
        </div>
      </section>

      <section data-testid="obs-revocation-section" style={{
        background: obs.state === 'revoked' ? AKKI_V4_PALETTE.mist : AKKI_V4_PALETTE.bone,
        border: `1px solid ${obs.state === 'revoked' ? AKKI_V4_PALETTE.oxblood : AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px',
      }}>
        <h3 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
          Revocation history · <span data-testid="obs-plane-current-state" style={{
            color: obs.state === 'revoked' ? AKKI_V4_PALETTE.oxblood : AKKI_V4_PALETTE.navy,
            fontWeight: 700,
          }}>{obs.state}</span>
        </h3>
        {obs.revocation_history.length === 0 ? (
          <div data-testid="obs-revocation-empty" style={{ marginTop: '8px', fontSize: '0.9rem', color: AKKI_V4_PALETTE.navy }}>
            No revocation events on the ledger.
          </div>
        ) : (
          <ol data-testid="obs-revocation-events" style={{ marginTop: '10px', paddingLeft: '18px', fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink }}>
            {obs.revocation_history.map((ev, i) => (
              <li key={i} data-testid={`obs-revocation-event-${i}`}>
                <strong>{ev.revoked_at}</strong> · by <code>{ev.revoked_by}</code> · reason: <em>{ev.reason}</em>
              </li>
            ))}
          </ol>
        )}
      </section>
    </AkkiShell>
  );
}
