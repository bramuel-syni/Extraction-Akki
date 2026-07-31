import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell, DormantCapabilityChip } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';

/* Memory Service home — plane list.
 *
 * Server-side scope enforcement (already delivered Cycle 3 · Owner E2):
 *   • engineer-key holder sees ONLY planes bound to their own integration key
 *   • admin/master_admin sees all planes
 *
 * The frontend passes the token verbatim; scope decision lives on the server.
 * The list surface renders "your planes" honestly — the caller sees only
 * what the server returns.
 */
export default function MemoryHomePage() {
  const [planes, setPlanes] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.memoryListPlanes();
      if (r.status === 200) setPlanes(r.body.planes || []);
      else if (r.status === 401 || r.status === 403) setDeny(r.body);
      else if (r.status >= 500) setFault({ status: r.status, body: r.body });
      else setPlanes([]);
    })();
  }, []);

  if (deny) {
    return (
      <AkkiShell title="Memory Service" subtitle="Plane list">
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Memory Service" subtitle="Plane list">
        <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." />
      </AkkiShell>
    );
  }

  return (
    <AkkiShell
      title="Memory Service"
      subtitle="Plane list · scoped to your integration key"
    >
      <section style={{
        background: AKKI_V4_PALETTE.mist,
        border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
        padding: '12px 16px',
        marginBottom: '20px',
      }} data-testid="memory-home-scope-note">
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink,
        }}>Scope discipline</div>
        <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginTop: '6px' }}>
          You see only planes bound to your own integration key. Cross-key planes
          are refused at the server (auth_scope_insufficient). Admin identity has
          full scope — this is a governed decision, not an accident.
        </div>
      </section>

      {planes === null ? null : planes.length === 0 ? (
        <div data-testid="memory-home-empty-note" style={{
          padding: '12px 16px',
          fontStyle: 'italic', color: AKKI_V4_PALETTE.sage,
        }}>
          No planes visible under your scope. This is a governed-empty state
          (not an error): either no planes exist, or none are bound to your
          integration key. Create one via <code>POST /api/memory/planes</code>.
        </div>
      ) : (
        <ul data-testid="memory-home-plane-list" style={{ padding: 0, listStyle: 'none' }}>
          {planes.map((p) => (
            <li
              key={p.plane_id}
              data-testid={`memory-plane-row-${p.plane_id}`}
              style={{
                background: AKKI_V4_PALETTE.bone,
                border: `1px solid ${AKKI_V4_PALETTE.mist}`,
                padding: '14px 16px',
                marginBottom: '10px',
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 1fr auto',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{
                  fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink,
                }} data-testid={`plane-id-${p.plane_id}`}>{p.plane_id}</div>
                <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>
                  key · {p.issued_to_integration_key.slice(0, 24)}{p.issued_to_integration_key.length > 24 ? '…' : ''}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy }} data-testid={`plane-scope-${p.plane_id}`}>
                {p.retrieval_scope}
              </div>
              <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy }}>
                tenant · {p.tenant_id}
              </div>
              <div data-testid={`plane-state-${p.plane_id}`}>
                {p.state === 'active' ? (
                  <span style={{
                    background: AKKI_V4_PALETTE.bone,
                    border: `1px solid ${AKKI_V4_PALETTE.navy}`,
                    padding: '3px 10px', borderRadius: '10px',
                    fontSize: '0.75rem', color: AKKI_V4_PALETTE.navy,
                  }}>active</span>
                ) : (
                  <span style={{
                    background: AKKI_V4_PALETTE.oxblood, color: AKKI_V4_PALETTE.cream,
                    padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem',
                  }} data-testid={`plane-frozen-chip-${p.plane_id}`}>frozen · revoked</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Link
                  data-testid={`plane-detail-link-${p.plane_id}`}
                  to={`/memory/planes/${p.plane_id}`}
                  style={{ color: AKKI_V4_PALETTE.navy, fontSize: '0.85rem' }}
                >open →</Link>
                <Link
                  data-testid={`plane-observability-link-${p.plane_id}`}
                  to={`/memory/planes/${p.plane_id}/observability`}
                  style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.8rem' }}
                >observe →</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AkkiShell>
  );
}
