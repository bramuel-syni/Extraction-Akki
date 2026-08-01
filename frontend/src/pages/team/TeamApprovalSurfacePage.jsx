/* UI-1-E · Team surface · A · Approval Surface (Master Admin working queue).
 * Canon §3.2 · Owner Message 604 dispatch text: each item states WHAT · WHICH
 * criterion · what will COST or touch · WHO requested. Approve/decline WITH
 * REASON — both are ledger events. Queue-length doctrine renders verbatim.
 * Link-across to /govern/holds (never copy).
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';


function StateBadge({ state }) {
  const colour =
    state === 'open' ? AKKI_V4_PALETTE.amber :
    state === 'dormant_honest' ? AKKI_V4_PALETTE.mist :
    state === 'decided' ? AKKI_V4_PALETTE.sage :
    AKKI_V4_PALETTE.ink;
  return (
    <span
      data-testid={`team-approval-state-${state}`}
      style={{
        display: 'inline-block', padding: '2px 8px',
        background: colour, color: AKKI_V4_PALETTE.cream,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}
    >
      {state.replace('_', ' ')}
    </span>
  );
}


function DecisionRow({ item, onDecide, decisionInFlight }) {
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const submit = async () => {
    if (!decision || !reason.trim()) return;
    await onDecide(item.item_id, decision, reason);
    setDecision(''); setReason('');
  };
  if (item.state !== 'open') return null;
  return (
    <div
      data-testid={`team-approval-decide-${item.item_id}`}
      style={{ marginTop: '10px', padding: '10px 12px', background: AKKI_V4_PALETTE.mist }}
    >
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '6px' }}>
        <button
          type="button"
          data-testid={`team-approve-btn-${item.item_id}`}
          onClick={() => setDecision('approve')}
          disabled={decisionInFlight}
          style={{
            padding: '5px 12px',
            background: decision === 'approve' ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.cream,
            color: decision === 'approve' ? AKKI_V4_PALETTE.cream : AKKI_V4_PALETTE.ink,
            border: `1px solid ${AKKI_V4_PALETTE.sage}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          Approve
        </button>
        <button
          type="button"
          data-testid={`team-decline-btn-${item.item_id}`}
          onClick={() => setDecision('decline')}
          disabled={decisionInFlight}
          style={{
            padding: '5px 12px',
            background: decision === 'decline' ? AKKI_V4_PALETTE.oxblood : AKKI_V4_PALETTE.cream,
            color: decision === 'decline' ? AKKI_V4_PALETTE.cream : AKKI_V4_PALETTE.ink,
            border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            cursor: 'pointer',
          }}
        >
          Decline
        </button>
      </div>
      <textarea
        data-testid={`team-decision-reason-${item.item_id}`}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (verbatim · required · stored on the ledger event)…"
        rows={2}
        style={{
          width: '100%', padding: '6px 10px',
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          fontFamily: AKKI_V4_TYPOGRAPHY.body, fontSize: '0.85rem',
          marginBottom: '6px',
        }}
      />
      <button
        type="button"
        data-testid={`team-decision-submit-${item.item_id}`}
        onClick={submit}
        disabled={!decision || !reason.trim() || decisionInFlight}
        style={{
          padding: '6px 14px', background: AKKI_V4_PALETTE.navy,
          color: AKKI_V4_PALETTE.cream, border: 'none',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          cursor: (!decision || !reason.trim() || decisionInFlight) ? 'not-allowed' : 'pointer',
        }}
      >
        Submit decision (ledger event)
      </button>
    </div>
  );
}


function ApprovalItem({ item, onDecide, decisionInFlight }) {
  return (
    <article
      data-testid={`team-approval-item-${item.item_id}`}
      data-item-class={item.class}
      data-state={item.state}
      style={{
        padding: '14px 18px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        borderLeft: `4px solid ${
          item.state === 'dormant_honest' ? AKKI_V4_PALETTE.mist : AKKI_V4_PALETTE.amber
        }`,
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
        <StateBadge state={item.state} />
        {item.is_sample && (
          <span
            data-testid={`team-approval-sample-badge-${item.item_id}`}
            data-sample-badge="true"
            style={{
              display: 'inline-block', padding: '2px 8px',
              background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            SAMPLE
          </span>
        )}
        <span style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
          color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          Class · {item.class}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '4px 12px', fontSize: '0.88rem', color: AKKI_V4_PALETTE.ink }}>
        <div style={{ fontWeight: 600 }}>What</div>
        <div data-testid={`team-approval-what-${item.item_id}`}>{item.what}</div>
        <div style={{ fontWeight: 600 }}>Which criterion</div>
        <div data-testid={`team-approval-criterion-${item.item_id}`}>{item.which_criterion}</div>
        <div style={{ fontWeight: 600 }}>Cost / touch</div>
        <div data-testid={`team-approval-cost-${item.item_id}`}>{item.cost_or_touch}</div>
        <div style={{ fontWeight: 600 }}>Requested by</div>
        <div data-testid={`team-approval-requester-${item.item_id}`}>{item.requested_by || '—'}</div>
      </div>
      {item.state === 'dormant_honest' && item.state_reason_plain && (
        <p data-testid={`team-approval-dormant-reason-${item.item_id}`} style={{
          margin: '10px 0 0 0', fontStyle: 'italic', fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage,
        }}>
          {item.state_reason_plain}
        </p>
      )}
      {item.linked_record_route && (
        <div style={{ marginTop: '8px', fontSize: '0.82rem' }}>
          Same underlying record on Govern:{' '}
          <Link
            to={item.linked_record_route}
            data-testid={`team-approval-linked-record-${item.item_id}`}
            style={{ color: AKKI_V4_PALETTE.navy }}
          >
            {item.linked_record_route} →
          </Link>
        </div>
      )}
      <DecisionRow item={item} onDecide={onDecide} decisionInFlight={decisionInFlight} />
    </article>
  );
}


export default function TeamApprovalSurfacePage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inFlight, setInFlight] = useState(false);
  const [lastDecision, setLastDecision] = useState(null);

  const load = async () => {
    setLoading(true);
    const r = await api.teamApprovalSurface();
    setLoading(false);
    if (r.status === 200) { setData(r.body); setError(null); }
    else {
      setData(null);
      setError({
        status: r.status,
        reason: (r.body && r.body.reason) || 'load_failed',
        detail: (r.body && r.body.detail) || 'The approval surface could not be loaded.',
      });
    }
  };
  useEffect(() => { load(); }, []);

  const onDecide = async (itemId, decision, reasonVerbatim) => {
    setInFlight(true);
    const r = await api.teamApprovalDecision(itemId, decision, reasonVerbatim);
    setInFlight(false);
    setLastDecision(r.status === 200 ? { ok: true, body: r.body } : { ok: false, status: r.status, body: r.body });
    if (r.status === 200) await load();
  };

  return (
    <AkkiShell title="Team · Approval Surface" subtitle="Canon §3.2 · the Master Admin's working queue">
      <div data-testid="team-approval-surface-page" data-canon-ref="Canon §3.2">
        {loading && (
          <div data-testid="team-approval-loading" style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage }}>
            Loading approval surface…
          </div>
        )}
        {error && (
          <div
            data-testid="team-approval-error-panel"
            data-status={String(error.status)}
            style={{
              padding: '14px 18px', background: AKKI_V4_PALETTE.bone,
              borderLeft: `4px solid ${AKKI_V4_PALETTE.amber}`,
            }}
          >
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
              color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: '4px',
            }}>
              Approval surface unavailable · {error.reason}
            </div>
            <p style={{ margin: 0, color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>{error.detail}</p>
          </div>
        )}
        {data && (
          <>
            <div
              data-testid="team-approval-queue-doctrine"
              data-queue-reading={data.queue_reading}
              style={{
                padding: '10px 14px', marginBottom: '16px',
                background: AKKI_V4_PALETTE.cream,
                borderLeft: `4px solid ${AKKI_V4_PALETTE.sage}`,
                fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, fontStyle: 'italic',
              }}
            >
              <div style={{
                fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.66rem',
                color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '4px', fontStyle: 'normal',
              }}>
                Queue reading · {data.queue_reading} ({data.counts.open} open · {data.counts.dormant_honest} dormant-honest)
              </div>
              {data.queue_doctrine_plain}
            </div>
            {lastDecision && lastDecision.ok && (
              <div data-testid="team-decision-confirmation" style={{
                marginBottom: '14px', padding: '10px 14px',
                background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
                fontSize: '0.85rem',
              }}>
                Decision recorded on the ledger (event_id={lastDecision.body.event.event_id}).{' '}
                Routed to <strong>{lastDecision.body.seam_ack.routed_to}</strong>.{' '}
                <Link to={lastDecision.body.linked_govern_record_route}
                      data-testid="team-decision-goto-govern"
                      style={{ color: AKKI_V4_PALETTE.navy }}>
                  Open the Govern record →
                </Link>
              </div>
            )}
            {lastDecision && !lastDecision.ok && (
              <div data-testid="team-decision-error" data-status={String(lastDecision.status)} style={{
                marginBottom: '14px', padding: '10px 14px', background: AKKI_V4_PALETTE.bone,
                borderLeft: `4px solid ${AKKI_V4_PALETTE.oxblood}`, fontSize: '0.85rem',
              }}>
                Decision failed · {lastDecision.body && lastDecision.body.reason} · {lastDecision.body && lastDecision.body.detail}
              </div>
            )}
            {data.items.map((it) => (
              <ApprovalItem
                key={it.item_id}
                item={it}
                onDecide={onDecide}
                decisionInFlight={inFlight}
              />
            ))}
          </>
        )}
      </div>
    </AkkiShell>
  );
}
