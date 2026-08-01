/* UI-1-E · Team surface · B · Access Register.
 * Canon §3.2 role register · UI-1-A retirement documented honest gap closes here.
 * Master Admin R + Grants; DPO R (record); Operator/Analyst R (self).
 * All CRUD wires to the same engineer_key_grants seam (single source · EE-R4).
 */
import React, { useEffect, useState } from 'react';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';


function StateBadge({ state }) {
  const colour =
    state === 'active' ? AKKI_V4_PALETTE.sage :
    state === 'revoked' ? AKKI_V4_PALETTE.oxblood :
    state === 'pending_approval' ? AKKI_V4_PALETTE.amber :
    state === 'declined' ? AKKI_V4_PALETTE.ink :
    AKKI_V4_PALETTE.mist;
  return (
    <span
      data-testid={`team-grant-state-${state}`}
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


function GrantRow({ row, canRevoke, onRevoke }) {
  const [revoking, setRevoking] = useState(false);
  const [reason, setReason] = useState('');
  return (
    <tr data-testid={`team-grant-row-${row.grant_id}`} data-state={row.state}>
      <td style={{ padding: '8px', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}` }}>
        <StateBadge state={row.state} />
        {row.is_sample && (
          <span
            data-testid={`team-grant-sample-badge-${row.grant_id}`}
            data-sample-badge="true"
            style={{
              marginLeft: '6px',
              display: 'inline-block', padding: '2px 6px',
              background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.58rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            SAMPLE
          </span>
        )}
      </td>
      <td style={{ padding: '8px', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.78rem' }}>
        <div data-testid={`team-grant-who-${row.grant_id}`}>{row.who_grantee_email}</div>
        <div data-testid={`team-grant-what-${row.grant_id}`} style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>
          {row.what_scope}
        </div>
      </td>
      <td style={{ padding: '8px', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.78rem' }}>
        <div data-testid={`team-grant-when-${row.grant_id}`}>{(row.when_created_iso || '').slice(0, 19)}</div>
        {row.when_revoked_iso && (
          <div style={{ color: AKKI_V4_PALETTE.oxblood, fontSize: '0.72rem' }}>
            revoked · {row.when_revoked_iso.slice(0, 19)}
          </div>
        )}
      </td>
      <td style={{ padding: '8px', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.78rem' }}>
        <div data-testid={`team-grant-by-whom-${row.grant_id}`}>{row.by_whom_grantor_email || '—'}</div>
      </td>
      <td style={{ padding: '8px', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.78rem', fontStyle: 'italic', color: AKKI_V4_PALETTE.sage }}>
        <div data-testid={`team-grant-propagation-${row.grant_id}`}>
          {row.propagation_state_plain}
        </div>
      </td>
      <td style={{ padding: '8px', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}` }}>
        {canRevoke && row.state === 'active' && (
          <>
            {!revoking ? (
              <button
                type="button"
                data-testid={`team-grant-revoke-btn-${row.grant_id}`}
                onClick={() => setRevoking(true)}
                style={{
                  padding: '4px 10px', background: AKKI_V4_PALETTE.oxblood,
                  color: AKKI_V4_PALETTE.cream, border: 'none',
                  fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  cursor: 'pointer',
                }}
              >
                Revoke
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '4px', flexDirection: 'column' }}>
                <input
                  data-testid={`team-grant-revoke-reason-${row.grant_id}`}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason verbatim…"
                  style={{ padding: '4px 8px', fontSize: '0.75rem', border: `1px solid ${AKKI_V4_PALETTE.mist}` }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    data-testid={`team-grant-revoke-confirm-${row.grant_id}`}
                    onClick={() => reason.trim() && onRevoke(row.grant_id, reason)}
                    disabled={!reason.trim()}
                    style={{
                      padding: '3px 8px', background: AKKI_V4_PALETTE.oxblood,
                      color: AKKI_V4_PALETTE.cream, border: 'none', fontSize: '0.68rem',
                      cursor: reason.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Confirm revoke
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRevoking(false); setReason(''); }}
                    style={{ padding: '3px 8px', background: AKKI_V4_PALETTE.mist, color: AKKI_V4_PALETTE.ink, border: 'none', fontSize: '0.68rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </td>
    </tr>
  );
}


function GrantForm({ onGrant, canGrant }) {
  const [grantee, setGrantee] = useState('');
  const [scope, setScope] = useState('');
  const [reason, setReason] = useState('');
  const submit = () => {
    if (!grantee.trim() || !scope.trim()) return;
    onGrant({
      grantee_email: grantee.trim(),
      endpoint_scope: scope.trim(),
      reason_verbatim: reason,
    });
    setGrantee(''); setScope(''); setReason('');
  };
  if (!canGrant) {
    return (
      <div
        data-testid="team-access-grant-role-denial"
        style={{
          padding: '10px 14px', marginBottom: '14px',
          background: AKKI_V4_PALETTE.mist,
          borderLeft: `4px solid ${AKKI_V4_PALETTE.ink}`,
          fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink,
        }}
      >
        Your role reads the access register but cannot issue grants
        (Canon §3.2 · DPO reads · Master Admin grants).
      </div>
    );
  }
  return (
    <div
      data-testid="team-access-grant-form"
      style={{
        padding: '12px 16px', marginBottom: '18px',
        background: AKKI_V4_PALETTE.bone,
        borderLeft: `4px solid ${AKKI_V4_PALETTE.navy}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: AKKI_V4_PALETTE.navy, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        Issue a new key-grant · ledger event · takes effect at grantee's next login/refresh
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
        <input
          data-testid="team-access-grant-grantee-input"
          value={grantee}
          onChange={(e) => setGrantee(e.target.value)}
          placeholder="grantee@example.com"
          style={{ padding: '6px 10px', border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem' }}
        />
        <input
          data-testid="team-access-grant-scope-input"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder="endpoint scope · e.g., GET /api/registry/what_you_hold"
          style={{ padding: '6px 10px', border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem' }}
        />
      </div>
      <textarea
        data-testid="team-access-grant-reason-input"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason verbatim (optional but recorded)…"
        rows={2}
        style={{ width: '100%', padding: '6px 10px', border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem', marginBottom: '8px' }}
      />
      <button
        type="button"
        data-testid="team-access-grant-submit"
        onClick={submit}
        disabled={!grantee.trim() || !scope.trim()}
        style={{
          padding: '6px 14px', background: AKKI_V4_PALETTE.navy,
          color: AKKI_V4_PALETTE.cream, border: 'none',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          cursor: (grantee.trim() && scope.trim()) ? 'pointer' : 'not-allowed',
        }}
      >
        Issue grant
      </button>
    </div>
  );
}


export default function TeamAccessRegisterPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ack, setAck] = useState(null);

  const load = async () => {
    setLoading(true);
    const r = await api.teamAccessRegister();
    setLoading(false);
    if (r.status === 200) { setData(r.body); setError(null); }
    else {
      setData(null);
      setError({
        status: r.status,
        reason: (r.body && r.body.reason) || 'load_failed',
        detail: (r.body && r.body.detail) || 'The access register could not be loaded.',
      });
    }
  };
  useEffect(() => { load(); }, []);

  const onGrant = async (payload) => {
    const r = await api.teamAccessGrant(payload);
    setAck(r.status === 200
      ? { ok: true, verb: 'grant', body: r.body }
      : { ok: false, verb: 'grant', status: r.status, body: r.body });
    if (r.status === 200) await load();
  };
  const onRevoke = async (grantId, reasonVerbatim) => {
    const r = await api.teamAccessRevoke(grantId, reasonVerbatim);
    setAck(r.status === 200
      ? { ok: true, verb: 'revoke', body: r.body }
      : { ok: false, verb: 'revoke', status: r.status, body: r.body });
    if (r.status === 200) await load();
  };

  return (
    <AkkiShell title="Team · Access Register" subtitle="Canon §3.2 · grants and revocations across roles">
      <div data-testid="team-access-register-page" data-canon-ref="Canon §3.2">
        {loading && (
          <div data-testid="team-access-loading" style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage }}>
            Loading access register…
          </div>
        )}
        {error && (
          <div
            data-testid="team-access-error-panel"
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
              Access register unavailable · {error.reason}
            </div>
            <p style={{ margin: 0, color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>{error.detail}</p>
          </div>
        )}
        {data && (
          <>
            <div
              data-testid="team-access-role-doctrine"
              style={{
                padding: '10px 14px', marginBottom: '14px',
                background: AKKI_V4_PALETTE.cream,
                borderLeft: `4px solid ${AKKI_V4_PALETTE.sage}`,
                fontSize: '0.85rem', fontStyle: 'italic', color: AKKI_V4_PALETTE.ink,
              }}
            >
              <div style={{
                fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.66rem',
                color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '4px', fontStyle: 'normal',
              }}>
                Role gating · you may {data.capabilities.can_grant ? 'read + grant + revoke' : (data.capabilities.can_read_all ? 'read (record only)' : 'read your own grants')}
              </div>
              {data.role_gate_doctrine_plain}
            </div>
            <GrantForm onGrant={onGrant} canGrant={data.capabilities.can_grant} />
            {ack && ack.ok && (
              <div data-testid={`team-access-ack-${ack.verb}`} style={{
                marginBottom: '14px', padding: '10px 14px',
                background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
                fontSize: '0.85rem',
              }}>
                Grant {ack.verb}ed (grant_id={ack.body.grant.grant_id}).{' '}
                Propagation: <em>{ack.body.propagation_state_plain}</em>
              </div>
            )}
            {ack && !ack.ok && (
              <div data-testid="team-access-ack-error" data-status={String(ack.status)} style={{
                marginBottom: '14px', padding: '10px 14px', background: AKKI_V4_PALETTE.bone,
                borderLeft: `4px solid ${AKKI_V4_PALETTE.oxblood}`, fontSize: '0.85rem',
              }}>
                Action failed · {ack.body && ack.body.reason} · {ack.body && ack.body.detail}
              </div>
            )}
            <div data-testid="team-access-register-counts" style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem',
              color: AKKI_V4_PALETTE.sage, marginBottom: '8px',
            }}>
              {data.counts.total} rows · {data.counts.active} active ·{' '}
              {data.counts.revoked ?? 0} revoked ·{' '}
              {data.counts.pending_approval ?? 0} pending
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: AKKI_V4_PALETTE.mist }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>State</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Who · what scope</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>When</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>By whom</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Propagation</th>
                  <th style={{ padding: '8px', textAlign: 'left', fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 60).map((row) => (
                  <GrantRow key={row.grant_id} row={row} canRevoke={data.capabilities.can_revoke} onRevoke={onRevoke} />
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </AkkiShell>
  );
}
