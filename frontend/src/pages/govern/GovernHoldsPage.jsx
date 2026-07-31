/* UI-1-B · Holds Surface (Canon §7.6).
 *
 * Reverse-route: every held Use Data commission is listed here with a
 * direct link back to the originating /use-data/wizard/:sessionId,
 * plus the verdict envelope reference and hold reason verbatim.
 *
 * SAMPLE-marked rows (seeded fixtures) carry the badge through.
 *
 * Role gating: DPO (compliance) + admin (server-side). Anyone else
 * gets a navy access-control-denial (never a governed refusal).
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';

function HoldRow({ hold }) {
  return (
    <article
      data-testid={`govern-hold-row-${hold.session_id}`}
      style={{
        padding: '16px 20px',
        marginBottom: '12px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span
          data-testid={`govern-hold-state-badge-${hold.session_id}`}
          style={{
            padding: '3px 10px',
            background: AKKI_V4_PALETTE.amber,
            color: AKKI_V4_PALETTE.cream,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          HELD FOR CHECK
        </span>
        {hold.is_sample && (
          <span
            data-testid={`govern-hold-sample-badge-${hold.session_id}`}
            style={{
              padding: '3px 10px',
              background: AKKI_V4_PALETTE.sage,
              color: AKKI_V4_PALETTE.ink,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            SAMPLE
          </span>
        )}
        <span style={{ fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage }}>
          door · {hold.door}
        </span>
      </div>
      <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, marginBottom: '6px' }}>
        Session <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>{hold.session_id}</span>
      </div>
      <div
        data-testid={`govern-hold-verdict-ref-${hold.session_id}`}
        style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage, marginBottom: '6px' }}
      >
        verdict envelope · {hold.verdict_ref}
      </div>
      <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, marginBottom: '6px' }}>
        Proposed spend · ${Number(hold.proposed_spend_usd || 0).toLocaleString()} ·
        ceiling · ${Number(hold.auto_run_ceiling_usd || 0).toLocaleString()}
      </div>
      <p
        data-testid={`govern-hold-reason-${hold.session_id}`}
        style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.oxblood, fontStyle: 'italic', margin: '6px 0' }}
      >
        {hold.hold_reason_verbatim}
      </p>
      <div style={{ marginTop: '12px' }}>
        <Link
          to={hold.reverse_route}
          data-testid={`govern-hold-reverse-route-${hold.session_id}`}
          style={{
            display: 'inline-block',
            background: AKKI_V4_PALETTE.navy,
            color: AKKI_V4_PALETTE.cream,
            padding: '6px 14px',
            textDecoration: 'none',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
          }}
        >
          Open Use Data session →
        </Link>
      </div>
    </article>
  );
}

export default function GovernHoldsPage() {
  const [holds, setHolds] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.governHolds();
      if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
      if (r.status >= 500) { setFault(r.body); return; }
      if (r.status === 200) setHolds(r.body.holds || []);
    })();
  }, []);

  if (deny) return (
    <AkkiShell title="Holds · Govern"><AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} /></AkkiShell>
  );
  if (fault) return (
    <AkkiShell title="Holds · Govern"><InfrastructureFaultPanel headline="govern holds read failed" detail={fault?.detail} /></AkkiShell>
  );

  return (
    <AkkiShell
      title="Holds · Govern"
      subtitle="Canon §7.6 · Held for check · reverse-route to Use Data session."
    >
      <p style={{ marginBottom: '18px' }}>
        <Link to="/govern" data-testid="govern-holds-back-link" style={{ color: AKKI_V4_PALETTE.navy }}>
          ← Trust Center
        </Link>
      </p>
      <div
        data-testid="govern-holds-doctrine-line"
        style={{
          padding: '10px 14px', marginBottom: '18px', background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink,
        }}
      >
        Every hold links back to the exact Use Data session that produced it. The verdict
        envelope reference is preserved. The countersign action lives in the pending queue.
      </div>
      {holds === null && (
        <div data-testid="govern-holds-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div>
      )}
      {holds && holds.length === 0 && (
        <div
          data-testid="govern-holds-empty"
          style={{ padding: '10px 14px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`, color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem' }}
        >
          No open holds.
        </div>
      )}
      {holds && holds.length > 0 && (
        <div data-testid="govern-holds-list">
          {holds.map((h) => <HoldRow key={h.session_id} hold={h} />)}
        </div>
      )}
    </AkkiShell>
  );
}
