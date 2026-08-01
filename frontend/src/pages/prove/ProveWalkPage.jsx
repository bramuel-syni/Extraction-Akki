/* UI-1-D · Prove Walk-a-Proof · Canon §9 · claim → reasoning → raw facts.
 *
 * CLOSING gate: 'CLOSING RETURNS THE READER EXACTLY WHERE THEY WERE'
 * (Owner directive 1a). Implementation: React Router location.state
 * carries { from, scrollY, from_search } from the origin. On close, we
 * navigate back to `from` and, after the browser paint, restore scrollY.
 */
import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';


export default function ProveWalkPage() {
  const { traceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [walk, setWalk] = useState(null);
  const [err, setErr] = useState(null);
  const originRef = useRef(location.state || { from: '/prove', scrollY: 0, from_search: '' });

  useEffect(() => {
    (async () => {
      const r = await api.proveTrace(traceId);
      if (r.status === 200) setWalk(r.body);
      else setErr(r.body);
    })();
     
  }, [traceId]);

  const close = () => {
    const origin = originRef.current;
    // Navigate back to the ORIGIN pathname (+ optional search).
    const target = origin.from + (origin.from_search || '');
    navigate(target, { replace: false });
    // Restore scroll position after the browser paints the origin.
    requestAnimationFrame(() => {
      window.scrollTo(0, origin.scrollY || 0);
    });
  };

  if (err) return (
    <AkkiShell title="Walk · Prove">
      <div data-testid="prove-walk-error" style={{ padding: '10px 14px', color: AKKI_V4_PALETTE.oxblood }}>
        {err?.reason || 'trace not available'}
      </div>
    </AkkiShell>
  );
  if (!walk) return (
    <AkkiShell title="Walk · Prove">
      <div data-testid="prove-walk-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div>
    </AkkiShell>
  );

  const env = walk.envelope || {};

  return (
    <AkkiShell
      title="Walk a proof"
      subtitle={`Canon §9 · ${walk.asked}`}
    >
      <div data-testid="prove-walk-page" data-trace-id={traceId} data-canon-ref="Canon §9">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
          <button
            type="button"
            data-testid="prove-walk-close-btn"
            onClick={close}
            style={{
              padding: '6px 12px', background: 'transparent', color: AKKI_V4_PALETTE.navy,
              border: `1px solid ${AKKI_V4_PALETTE.mist}`,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            ← Close · return to origin
          </button>
        </div>
        <div style={{ marginBottom: '8px', fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>
          asked · {walk.asked}
        </div>
        {(walk.walk_layers || []).map((layer, i) => (
          <section
            key={layer.layer}
            data-testid={`prove-walk-layer-${layer.layer}`}
            style={{
              padding: '14px 16px', marginBottom: '12px',
              background: i === 0 ? AKKI_V4_PALETTE.bone : AKKI_V4_PALETTE.cream,
              border: `1px solid ${AKKI_V4_PALETTE.mist}`,
              borderLeft: `4px solid ${i === 0 ? AKKI_V4_PALETTE.sage : i === 1 ? AKKI_V4_PALETTE.navy : AKKI_V4_PALETTE.amber}`,
            }}
          >
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
              color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: '6px',
            }}>
              {i + 1} · {layer.layer === 'claim' ? 'Claim' : layer.layer === 'reasoning' ? 'Reasoning' : 'Raw facts (raw_facts) · verified rows'}
            </div>
            <div style={{ fontSize: '0.95rem', color: AKKI_V4_PALETTE.ink, marginBottom: '8px' }}>
              {layer.text}
            </div>
            {layer.candidates && layer.candidates.length > 0 && (
              <div data-testid={`prove-walk-candidates-${layer.layer}`} style={{ marginTop: '6px' }}>
                <div style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Candidates considered:
                </div>
                <ul style={{ margin: '4px 0', padding: 0, listStyle: 'none' }}>
                  {layer.candidates.map((c, idx) => (
                    <li key={idx} style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.78rem', color: AKKI_V4_PALETTE.ink, padding: '2px 0' }}>
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {layer.corroboration && (
              <div data-testid={`prove-walk-corroboration-${layer.layer}`} style={{ marginTop: '6px', fontSize: '0.82rem', color: AKKI_V4_PALETTE.sage }}>
                Corroboration · {layer.corroboration}
              </div>
            )}
            {layer.probability_calibration && (
              <div data-testid={`prove-walk-probability-${layer.layer}`} style={{ marginTop: '4px', fontSize: '0.82rem', color: AKKI_V4_PALETTE.sage }}>
                Probability · {layer.probability_calibration}
              </div>
            )}
            {layer.facts && layer.facts.length > 0 && (
              <ul data-testid={`prove-walk-facts-${layer.layer}`} style={{ marginTop: '8px', padding: 0, listStyle: 'none' }}>
                {layer.facts.map((f, idx) => (
                  <li
                    key={idx}
                    data-testid={`prove-walk-fact-${idx}`}
                    style={{
                      padding: '8px 10px', marginBottom: '4px',
                      background: AKKI_V4_PALETTE.bone,
                      border: `1px solid ${AKKI_V4_PALETTE.mist}`,
                      fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.78rem',
                      color: AKKI_V4_PALETTE.ink,
                    }}
                  >
                    {f.fact}
                    {f.source_ref && (
                      <Link
                        to={`/connect/source/${f.source_ref}`}
                        data-testid={`prove-walk-source-link-${idx}`}
                        style={{ marginLeft: '10px', color: AKKI_V4_PALETTE.navy }}
                      >
                        source →
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </AkkiShell>
  );
}
