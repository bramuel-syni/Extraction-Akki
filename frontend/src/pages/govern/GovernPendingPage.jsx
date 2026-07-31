import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';

/* Govern · Consequence-Class Checker Queue (§A4-2).
 * Reads GET /api/checker/pending?role={capacity}; role picker for admins/DPOs.
 * Countersign + Object actions inline per request.
 * Wrong-capacity countersign renders access-control-denial (navy · never governed refusal).
 */
export default function GovernPendingPage() {
  const [capacity, setCapacity] = useState('compliance');
  const [items, setItems] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);
  const [actionResults, setActionResults] = useState({}); // request_id -> {deny|ok|refusal}
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const r = await api.checkerPending(capacity);
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    if (r.status >= 500) { setFault({ status: r.status, body: r.body }); return; }
    setItems((r.body && r.body.pending) || []);
  };

  useEffect(() => { load(); }, [capacity]);

  const doCountersign = async (id) => {
    setBusyId(id);
    const r = await api.checkerCountersign(id, { checker_role: capacity });
    setBusyId(null);
    if (r.status === 401 || r.status === 403) {
      setActionResults((prev) => ({ ...prev, [id]: { kind: 'deny', body: r.body } }));
      return;
    }
    if (r.status >= 200 && r.status < 300) {
      setActionResults((prev) => ({ ...prev, [id]: { kind: 'ok', body: r.body } }));
      await load();
      return;
    }
    setActionResults((prev) => ({ ...prev, [id]: { kind: 'refusal', body: r.body } }));
  };

  const doObject = async (id, reason) => {
    setBusyId(id);
    const r = await api.checkerObject(id, { objector_role: capacity, objection_reason: reason });
    setBusyId(null);
    if (r.status === 401 || r.status === 403) {
      setActionResults((prev) => ({ ...prev, [id]: { kind: 'deny', body: r.body } }));
      return;
    }
    if (r.status >= 200 && r.status < 300) {
      setActionResults((prev) => ({ ...prev, [id]: { kind: 'ok', body: r.body } }));
      await load();
      return;
    }
    setActionResults((prev) => ({ ...prev, [id]: { kind: 'refusal', body: r.body } }));
  };

  if (deny) {
    return (
      <AkkiShell title="Govern · Pending" subtitle="Counter-signature queue">
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Govern · Pending" subtitle="Counter-signature queue">
        <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." />
      </AkkiShell>
    );
  }

  return (
    <AkkiShell
      title="Govern · Pending"
      subtitle="Counter-signature queue · role-aware"
      right={<Link to="/govern" style={{ color: AKKI_V4_PALETTE.oxblood, fontFamily: AKKI_V4_TYPOGRAPHY.labels }}>← Govern estate</Link>}
    >
      <section style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke, maxWidth: '260px' }}>
          Capacity (§A4-2 seam symmetry)
          <select
            data-testid="govern-pending-capacity-picker"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            style={{ padding: '6px 10px' }}
          >
            <option value="compliance">compliance (dpo)</option>
            <option value="admin">admin</option>
          </select>
        </label>
        <p style={{ fontSize: '0.82rem', color: AKKI_V4_PALETTE.smoke, marginTop: '8px' }}>
          Compliance capacity sees admin-initiated tightening (needs compliance sign-off).
          Admin capacity sees compliance-initiated loosening (needs admin sign-off).
        </p>
      </section>

      <section data-testid="govern-pending-list">
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>
          Pending requests · {items ? items.length : '—'}
        </h2>
        {items && items.length === 0 ? (
          <div data-testid="govern-pending-empty" style={{
            padding: '10px 14px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.smoke, fontSize: '0.85rem',
          }}>
            No pending requests for the {capacity} capacity.
          </div>
        ) : null}
        <div style={{ display: 'grid', gap: '12px' }}>
          {items && items.map((req) => {
            const res = actionResults[req.request_id];
            return (
              <article
                key={req.request_id}
                data-testid={`govern-pending-req-${req.request_id}`}
                style={{
                  padding: '14px 18px',
                  background: AKKI_V4_PALETTE.mist,
                  border: `1px solid ${AKKI_V4_PALETTE.sage}`,
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{
                    padding: '3px 10px',
                    background: AKKI_V4_PALETTE.navy,
                    color: AKKI_V4_PALETTE.cream,
                    fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}>{req.state}</span>
                  <span data-testid={`govern-pending-req-consequence-${req.request_id}`} style={{ fontSize: '0.82rem', color: AKKI_V4_PALETTE.ink }}>
                    consequence · {req.consequence_class}
                  </span>
                </div>
                <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.ink, fontWeight: 600 }}>
                  {req.rule_class}: <span style={{ fontWeight: 400 }}>{req.from_value_ref} → {req.to_value_ref}</span>
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.78rem', color: AKKI_V4_PALETTE.smoke }}>
                  initiated by {req.initiator_id} ({req.initiator_role}) · {req.initiated_at}
                </div>
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => doCountersign(req.request_id)}
                    disabled={busyId === req.request_id}
                    data-testid={`govern-pending-countersign-${req.request_id}`}
                    style={{
                      padding: '6px 14px',
                      background: AKKI_V4_PALETTE.sage,
                      color: AKKI_V4_PALETTE.ink,
                      border: 'none',
                      fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      cursor: busyId === req.request_id ? 'wait' : 'pointer',
                    }}
                  >
                    Countersign
                  </button>
                  <ObjectForm
                    requestId={req.request_id}
                    onSubmit={(reason) => doObject(req.request_id, reason)}
                    disabled={busyId === req.request_id}
                  />
                </div>
                {res && res.kind === 'deny' && (
                  <div style={{ marginTop: '10px' }}>
                    <AccessControlDeniedPanel reason={res.body.reason} detail={res.body.detail} />
                  </div>
                )}
                {res && res.kind === 'refusal' && (
                  <div data-testid={`govern-pending-refusal-${req.request_id}`} style={{
                    marginTop: '10px', padding: '10px 14px', border: `1px dashed ${AKKI_V4_PALETTE.oxblood}`,
                    color: AKKI_V4_PALETTE.oxblood, fontSize: '0.82rem', fontFamily: AKKI_V4_TYPOGRAPHY.body,
                  }}>
                    Refused · {res.body.reason} · {res.body.detail}
                  </div>
                )}
                {res && res.kind === 'ok' && (
                  <div data-testid={`govern-pending-ok-${req.request_id}`} style={{
                    marginTop: '10px', padding: '8px 12px', background: AKKI_V4_PALETTE.sage,
                    color: AKKI_V4_PALETTE.ink, fontSize: '0.82rem', fontFamily: AKKI_V4_TYPOGRAPHY.body,
                  }}>
                    Action recorded.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </AkkiShell>
  );
}

function ObjectForm({ requestId, onSubmit, disabled }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        data-testid={`govern-pending-object-open-${requestId}`}
        style={{
          padding: '6px 14px',
          background: 'transparent',
          color: AKKI_V4_PALETTE.oxblood,
          border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          cursor: disabled ? 'wait' : 'pointer',
        }}
      >
        Object
      </button>
    );
  }
  return (
    <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      <input
        data-testid={`govern-pending-object-reason-${requestId}`}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Objection reason"
        style={{ padding: '4px 8px', fontSize: '0.78rem', minWidth: '200px' }}
      />
      <button
        onClick={() => { onSubmit(reason); setOpen(false); setReason(''); }}
        disabled={disabled || !reason}
        data-testid={`govern-pending-object-submit-${requestId}`}
        style={{
          padding: '6px 12px',
          background: AKKI_V4_PALETTE.oxblood,
          color: AKKI_V4_PALETTE.cream,
          border: 'none',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          cursor: (disabled || !reason) ? 'not-allowed' : 'pointer',
        }}
      >
        Submit
      </button>
    </span>
  );
}
