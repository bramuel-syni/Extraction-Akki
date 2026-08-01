/* UI-1-D · Registry ("What You Hold") · Canon §5.
 *
 * Owner UI-1-D dispatch (2026-08-02): build target is the Akki v4 prototype's
 * What-You-Hold page (ratified via Owner R3). Canon vocabulary applied.
 * SLOT-4 #8's formal Canon fold is still pending Owner ruling —
 * building to the ratified prototype is the authority meanwhile.
 *
 * Four axes (prototype layout):
 *   1. Connected — sources connected + state grammar
 *   2. Holdings — corpus rings × sources × domains (measured vs
 *      unmeasured as FIRST-CLASS states, hatched for unmeasured)
 *   3. Intelligence — declaration-baseline vs inference-overlay
 *   4. Backend — planes + registries + ceiling seam
 *
 * Opportunity briefs render with "Put this to work" CTA (Canon C.4 rename;
 * retired "Shape this objective").
 * Gap register renders with "Queue this gap" CTA.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';


function SampleBadge({ rowId }) {
  return (
    <span
      data-testid={`registry-sample-badge-${rowId}`}
      data-sample-badge="true"
      style={{
        display: 'inline-block', padding: '2px 8px', marginLeft: '6px',
        background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        verticalAlign: 'middle',
      }}
    >
      SAMPLE
    </span>
  );
}


// ---------- AXIS 1 · CONNECTED -----------------------------------------------


function ConnectedAxis({ data }) {
  return (
    <section
      data-testid="registry-axis-connected"
      style={{
        padding: '16px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        1 · Connected
      </div>
      <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))' }}>
        {[
          ['connected', data.connected],
          ['in progress', data.in_progress],
          ['awaiting credentials', data.awaiting_credentials],
          ['failed', data.failed],
        ].map(([label, val]) => (
          <div key={label} style={{ padding: '6px 10px' }}>
            <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {label}
            </div>
            <div style={{ fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>{val}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


// ---------- AXIS 2 · HOLDINGS (warehouse view) -------------------------------


function HoldingsAxis({ data }) {
  return (
    <section
      data-testid="registry-axis-holdings"
      style={{
        padding: '16px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '10px',
      }}>
        2 · Holdings · warehouse view · rings × sources × domains
      </div>
      <div style={{ fontSize: '0.78rem', color: AKKI_V4_PALETTE.ink, marginBottom: '10px' }}>
        <span data-testid="registry-holdings-measured-count">Measured: <strong>{data.measured_count}</strong></span>
        {' · '}
        <span data-testid="registry-holdings-unmeasured-count">Unmeasured: <strong>{data.unmeasured_count}</strong> (first-class state, hatched)</span>
      </div>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', minWidth: 0 }}>
        <thead>
          <tr>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Ring</th>
            <th style={thStyle}>Domain</th>
            <th style={thStyle}>Measured?</th>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>Row count / reason</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r) => (
            <tr
              key={r.source_id}
              data-testid={`registry-holdings-row-${r.source_id}`}
              data-measured={r.measured ? 'true' : 'false'}
              style={{
                borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
                background: r.measured ? 'transparent' : `repeating-linear-gradient(45deg, ${AKKI_V4_PALETTE.mist}, ${AKKI_V4_PALETTE.mist} 3px, ${AKKI_V4_PALETTE.cream} 3px, ${AKKI_V4_PALETTE.cream} 6px)`,
              }}
            >
              <td style={tdStyle}>
                {r.source_name}
                {r.is_sample && <SampleBadge rowId={r.source_id} />}
              </td>
              <td style={tdStyle}><span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.72rem' }}>{r.ring}</span></td>
              <td style={tdStyle}>{r.domain}</td>
              <td style={tdStyle}>
                {r.measured ? (
                  <span data-testid={`registry-measured-yes-${r.source_id}`} style={{ color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem', textTransform: 'uppercase' }}>measured</span>
                ) : (
                  <span data-testid={`registry-unmeasured-${r.source_id}`} style={{ color: AKKI_V4_PALETTE.amber, fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem', textTransform: 'uppercase' }}>unmeasured</span>
                )}
              </td>
              <td style={tdStyle}>
                <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.72rem' }}>{r.method}</span>
              </td>
              <td style={tdStyle}>
                {r.measured ? (
                  <span data-testid={`registry-corpus-count-${r.source_id}`}>{(r.corpus_row_count || 0).toLocaleString()}</span>
                ) : (
                  <em data-testid={`registry-unmeasured-reason-${r.source_id}`} style={{ color: AKKI_V4_PALETTE.oxblood, fontSize: '0.75rem' }}>
                    {r.unmeasured_reason_plain}
                  </em>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}


// ---------- AXIS 3 · INTELLIGENCE --------------------------------------------


function IntelligenceAxis({ data }) {
  return (
    <section
      data-testid="registry-axis-intelligence"
      style={{
        padding: '16px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        3 · Intelligence-on-inventory · declaration vs inference
      </div>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Declaration baseline
          </div>
          <div data-testid="registry-intelligence-declaration-count" style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>
            {data.declaration_baseline_count}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Inference overlay
          </div>
          <div data-testid="registry-intelligence-overlay-count" style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>
            {data.inference_overlay_count}
            {data.inference_state === 'dormant' && (
              <span
                data-testid="registry-intelligence-dormant"
                style={{ marginLeft: '8px', padding: '2px 8px', background: AKKI_V4_PALETTE.amber, color: AKKI_V4_PALETTE.cream, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}
              >
                Dormant — awaiting OT-1a
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


// ---------- AXIS 4 · BACKEND -------------------------------------------------


function BackendAxis({ data }) {
  return (
    <section
      data-testid="registry-axis-backend"
      style={{
        padding: '16px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        4 · Backend status · planes · registries · ceiling seam
      </div>
      <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Planes active</div>
          <div data-testid="registry-backend-planes-active" style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>{data.planes_active}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registries effective</div>
          <div data-testid="registry-backend-registries-effective" style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>{data.registries_effective}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Auto-run ceiling · seam</div>
          <div data-testid="registry-backend-ceiling" style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>
            ${data.auto_run_ceiling_usd.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.68rem', color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>
            {data.ceiling_source_seam}
          </div>
        </div>
      </div>
    </section>
  );
}


// ---------- OPPORTUNITY BRIEFS ----------------------------------------------


function OpportunityBriefs({ briefs }) {
  const navigate = useNavigate();
  return (
    <section
      data-testid="registry-opportunity-briefs"
      style={{
        padding: '16px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '10px',
      }}>
        Opportunity briefs · {briefs.length}
      </div>
      {briefs.length === 0 && (
        <div data-testid="registry-briefs-empty" style={{ padding: '8px 12px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`, color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem' }}>
          No opportunity briefs yet.
        </div>
      )}
      {briefs.map((b) => (
        <article
          key={b.brief_id}
          data-testid={`registry-brief-${b.brief_id}`}
          style={{
            padding: '12px 14px', marginBottom: '10px',
            background: AKKI_V4_PALETTE.cream,
            border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <strong>{b.title}</strong>
            {b.is_sample && <SampleBadge rowId={b.brief_id} />}
            <span style={{ marginLeft: 'auto' }}>
              <button
                type="button"
                data-testid={`registry-brief-cta-${b.brief_id}`}
                onClick={() => navigate(b.cta_route, { state: { from: '/registry', brief_id: b.brief_id } })}
                style={{
                  padding: '6px 14px', background: AKKI_V4_PALETTE.navy,
                  color: AKKI_V4_PALETTE.cream, border: 'none',
                  fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                {b.cta_label}
              </button>
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}>
            {b.summary_plain}
          </p>
        </article>
      ))}
    </section>
  );
}


// ---------- GAP REGISTER -----------------------------------------------------


function GapRegister({ gaps, onQueue }) {
  return (
    <section
      data-testid="registry-gap-register"
      style={{
        padding: '16px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '10px',
      }}>
        Gap register · {gaps.length} · ranked by extraction priority
      </div>
      {gaps.length === 0 && (
        <div data-testid="registry-gaps-empty" style={{ padding: '8px 12px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`, color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem' }}>
          No open gaps.
        </div>
      )}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {gaps.map((g) => (
          <li
            key={g.gap_id}
            data-testid={`registry-gap-${g.gap_id}`}
            data-gap-state={g.state}
            style={{
              padding: '10px 12px', marginBottom: '6px',
              background: AKKI_V4_PALETTE.cream,
              border: `1px solid ${g.state === 'queued' ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.mist}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, color: AKKI_V4_PALETTE.sage }}>
                rank {g.rank_score.toFixed(2)}
              </span>
              <span style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, flex: 1 }}>
                {g.question_plain}
              </span>
              {g.is_sample && <SampleBadge rowId={g.gap_id} />}
              {g.state === 'queued' ? (
                <Link
                  to={`/use-data/wizard/${g.queued_use_data_session_id}`}
                  data-testid={`registry-gap-queued-link-${g.gap_id}`}
                  style={{ color: AKKI_V4_PALETTE.navy, fontSize: '0.75rem', textDecoration: 'none' }}
                >
                  Queued → Use Data session
                </Link>
              ) : (
                <button
                  type="button"
                  data-testid={`registry-gap-queue-btn-${g.gap_id}`}
                  onClick={() => onQueue(g.gap_id)}
                  style={{
                    padding: '5px 12px', background: AKKI_V4_PALETTE.navy,
                    color: AKKI_V4_PALETTE.cream, border: 'none',
                    fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    cursor: 'pointer',
                  }}
                >
                  {g.cta_label}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}


const thStyle = {
  padding: '6px 10px', textAlign: 'left',
  fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.6rem',
  color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
  letterSpacing: '0.06em', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
};
const tdStyle = { padding: '8px 10px', verticalAlign: 'top', color: AKKI_V4_PALETTE.ink };


export default function RegistryWhatYouHoldPage() {
  const [data, setData] = useState(null);
  const [briefs, setBriefs] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  const loadAll = async () => {
    const [rW, rB, rG] = await Promise.all([
      api.registryWhatYouHold(),
      api.registryOpportunityBriefs(),
      api.registryGapRegister(),
    ]);
    if (rW.status === 401 || rW.status === 403) { setDeny(rW.body); return; }
    if (rW.status >= 500) { setFault(rW.body); return; }
    if (rW.status === 200) setData(rW.body);
    if (rB.status === 200) setBriefs(rB.body.briefs || []);
    if (rG.status === 200) setGaps(rG.body.gaps || []);
  };

  useEffect(() => { loadAll(); }, []);

  const queueGap = async (gapId) => {
    const r = await api.registryQueueGap(gapId);
    if (r.status === 200) loadAll();
  };

  if (deny) return (
    <AkkiShell title="Registry · What You Hold">
      <AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} />
    </AkkiShell>
  );
  if (fault) return (
    <AkkiShell title="Registry · What You Hold">
      <InfrastructureFaultPanel headline="registry read failed" detail={fault?.detail} />
    </AkkiShell>
  );
  if (!data) return (
    <AkkiShell title="Registry · What You Hold"><div data-testid="registry-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div></AkkiShell>
  );

  return (
    <AkkiShell
      title="What You Hold"
      subtitle="Canon §5 · four axes · warehouse view with measured vs unmeasured · opportunity briefs · gap register."
    >
      <div data-testid="registry-what-you-hold" data-canon-ref="Canon §5">
        <ConnectedAxis data={data.connected} />
        <HoldingsAxis data={data.holdings} />
        <IntelligenceAxis data={data.intelligence} />
        <BackendAxis data={data.backend} />
        <OpportunityBriefs briefs={briefs} />
        <GapRegister gaps={gaps} onQueue={queueGap} />
      </div>
    </AkkiShell>
  );
}
