import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';

/* Status → visual weight map. Owner FB-18 gate_missed_milestone_renders_plainly:
 * missed is styled as visibly as done. Same weight, distinct color. */
const STATUS_STYLE = {
  done:      { color: '#2f6b3e', weight: 700, label: 'done' },
  on_track:  { color: '#16304F', weight: 700, label: 'on track' },
  pending:   { color: '#7f7f7f', weight: 500, label: 'pending' },
  behind:    { color: '#B07C2A', weight: 700, label: 'behind' },
  missed:    { color: '#7E3038', weight: 700, label: 'missed' },
};

export default function CommissionRunDetailPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [fault, setFault] = useState(null);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await api.wizardOperatorGet(sessionId);
        if (cancelled) return;
        if (s.status === 401 || s.status === 403) {
          setRefusal(s.body);
          return;
        }
        if (s.status >= 500) {
          setFault({ status: s.status, body: s.body });
          return;
        }
        if (s.status === 200) setSession(s.body);
        const m = await api.wizardOperatorGetMilestones(sessionId);
        if (cancelled) return;
        if (m.status === 200) setMilestones(m.body);
      } catch (err) {
        if (!cancelled) setFault({ status: 0, body: { message: String(err) } });
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (refusal) {
    return (
      <AkkiShell title="Commission View" subtitle={`session · ${sessionId}`}>
        <AccessControlDeniedPanel
          reason={refusal.reason}
          detail={refusal.detail}
          traceId={sessionId}
        />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Commission View" subtitle={`session · ${sessionId}`}>
        <InfrastructureFaultPanel
          headline={`status ${fault.status}`}
          detail="The backend returned an infrastructure fault. Try again shortly."
          traceId={sessionId}
        />
      </AkkiShell>
    );
  }
  if (!session) {
    // No build state per Owner design law — but a governed empty is fine.
    return (
      <AkkiShell title="Commission View" subtitle={`session · ${sessionId}`}>
        <div data-testid="commission-detail-empty" style={{ color: AKKI_V4_PALETTE.sage }}>
          No session found for this id, or read is in-flight.
          <div style={{ marginTop: '10px' }}>
            <Link to="/commission-view" data-testid="commission-detail-back">← back</Link>
          </div>
        </div>
      </AkkiShell>
    );
  }

  const trace = session.trace_id || sessionId;
  const committed = session.committed_at ? 'frozen' : 'in-flight';

  return (
    <AkkiShell
      title="Commission View · run detail"
      subtitle={`session · ${sessionId} · ${committed}`}
      traceId={trace}
      right={<Link to="/commission-view" data-testid="commission-detail-back-link" style={{ color: AKKI_V4_PALETTE.navy }}>← back</Link>}
    >
      <MilestoneFrontPage
        milestones={milestones && milestones.milestones}
        agreed={milestones && milestones.agreed}
        session={session}
      />

      <details
        data-testid="commission-detail-evidence-toggle"
        open={showEvidence}
        onToggle={(e) => setShowEvidence(e.currentTarget.open)}
        style={{ marginTop: '24px' }}
      >
        <summary style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          color: AKKI_V4_PALETTE.sage,
          cursor: 'pointer',
          padding: '8px 0',
        }}>Show technical evidence · drill-down only</summary>
        <div data-testid="commission-detail-evidence-panel" style={{
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          background: AKKI_V4_PALETTE.bone,
          padding: '16px 18px',
          marginTop: '10px',
          maxWidth: '900px',
        }}>
          <div style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage, marginBottom: '10px' }}>
            The FB-5 front page (above) governs what leads. This panel is
            drill-down evidence — kept as a distinct layer so it never
            leads the surface.
          </div>
          <SessionEvidence session={session} />
        </div>
      </details>
    </AkkiShell>
  );
}

function MilestoneFrontPage({ milestones, agreed, session }) {
  const list = milestones || [];
  return (
    <section data-testid="commission-milestone-front-page">
      <h2 style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
        fontSize: '1.2rem',
        color: AKKI_V4_PALETTE.ink,
        marginBottom: '4px',
      }} data-testid="milestone-headline">Milestones</h2>
      <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginBottom: '14px' }}>
        agreement · <span data-testid="milestone-agreed-flag">
          {agreed ? 'agreed' : 'not yet agreed'}
        </span>
      </div>
      {list.length === 0 && (
        <div data-testid="milestone-empty-note" style={{
          fontStyle: 'italic', color: AKKI_V4_PALETTE.sage,
        }}>
          No milestones proposed yet. Every commission needs a milestone list
          before commit — see FB-4.
        </div>
      )}
      <ol style={{ paddingLeft: 0, listStyle: 'none' }} data-testid="milestone-list">
        {list.map((m, i) => {
          const s = STATUS_STYLE[m.status] || STATUS_STYLE.pending;
          return (
            <li
              key={m.milestone_id}
              data-testid={`milestone-row-${i}`}
              style={{
                background: AKKI_V4_PALETTE.bone,
                border: `1px solid ${AKKI_V4_PALETTE.mist}`,
                padding: '12px 16px',
                marginBottom: '8px',
                display: 'grid',
                gridTemplateColumns: '2fr 3fr 2fr 1fr',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}
                data-testid={`milestone-description-${i}`}>
                {m.description}
              </div>
              <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy }} data-testid={`milestone-done-condition-${i}`}>
                done when: <em>{m.done_condition}</em>
              </div>
              <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy }} data-testid={`milestone-owner-${i}`}>
                owner: <strong>{m.owner}</strong>
              </div>
              <div
                data-testid={`milestone-status-${i}`}
                style={{
                  color: s.color, fontWeight: s.weight,
                  fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                  fontSize: '0.9rem', textAlign: 'right',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >{s.label}</div>
            </li>
          );
        })}
      </ol>
      <div style={{
        marginTop: '20px',
        display: 'flex', gap: '30px',
        borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
        paddingTop: '12px',
      }} data-testid="spend-vs-quote-row">
        <div>
          <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Spend</div>
          <div data-testid="spend-value" style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink,
          }}><MarkedOpenSlot slotName="spend_value" note="Reads existing pricing artifact; empty until wizard freeze." /></div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quote (hard ceiling)</div>
          <div data-testid="quote-ceiling-value" style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink,
          }}>
            {session?.committed_values?.['envelope.budget']?.value ||
              <MarkedOpenSlot slotName="quote_ceiling" note="Budget from envelope.budget on freeze." />}
          </div>
        </div>
      </div>
    </section>
  );
}

function SessionEvidence({ session }) {
  const cv = session.committed_values || {};
  return (
    <div data-testid="session-evidence-list" style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy }}>
      <div>session_id: <code>{session.session_id}</code></div>
      <div>trace_id: <code>{session.trace_id}</code></div>
      <div>variant: <code>{session.variant}</code></div>
      <div>committed_at: <code>{session.committed_at || '— not yet frozen —'}</code></div>
      <div>turn count: <code>{(session.turns || []).length}</code></div>
      <div style={{ marginTop: '10px', fontWeight: 600 }}>committed values (source-tagged):</div>
      <ul style={{ paddingLeft: '18px' }}>
        {Object.entries(cv).map(([k, v]) => (
          <li key={k} data-testid={`evidence-cv-${k}`}>
            {k}: <code>{v.value}</code> · <em style={{ color: v.source === 'agent_assumed' ? AKKI_V4_PALETTE.amber : AKKI_V4_PALETTE.navy }}>{v.source}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
