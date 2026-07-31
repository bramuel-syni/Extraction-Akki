import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, GovernedRefusalCard, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';
import { UNSET_RETENTION_BANNER } from '../../design/ratified_copy';

/* Govern · Retention Posture — FB-13 verbatim banner + posture table +
 * write ceremony (loosening auto-routes through checker per Amendment G
 * Ruling 6) + authorized-deletion ceremony (dual-approver).
 * Reads/writes ONLY committed endpoints. Zero new frozen contract.
 */
const POSTURE_CHIP = Object.freeze({
  inheriting: { bg: AKKI_V4_PALETTE.navy, fg: AKKI_V4_PALETTE.cream, label: 'inheriting' },
  explicit: { bg: AKKI_V4_PALETTE.sage, fg: AKKI_V4_PALETTE.ink, label: 'explicit' },
  unset: { bg: 'transparent', fg: AKKI_V4_PALETTE.amber, border: `1px solid ${AKKI_V4_PALETTE.amber}`, label: 'unset' },
});

function PostureChip({ posture }) {
  const p = POSTURE_CHIP[posture] || POSTURE_CHIP.unset;
  return (
    <span
      data-testid={`govern-retention-posture-chip-${posture}`}
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '2px',
        background: p.bg,
        color: p.fg,
        border: p.border || 'none',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        fontSize: '0.68rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {p.label}
    </span>
  );
}

export default function GovernRetentionPage() {
  const [config, setConfig] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [pendingReq, setPendingReq] = useState(null);
  const [deletionResult, setDeletionResult] = useState(null);

  const [ceremonyClass, setCeremonyClass] = useState('ledger_row');
  const [ceremonyDays, setCeremonyDays] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await api.complianceRetentionConfig();
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    if (r.status >= 500) { setFault({ status: r.status, body: r.body }); return; }
    setConfig(r.body);
  };

  useEffect(() => { load(); }, []);

  const submitRetentionChange = async () => {
    setBusy(true);
    setRefusal(null);
    setPendingReq(null);
    const days = ceremonyDays === '' ? null : Number(ceremonyDays);
    const payload = { [ceremonyClass]: { window_days: days } };
    const r = await api.complianceRetentionWrite(payload);
    setBusy(false);
    if (r.status >= 200 && r.status < 300) {
      // Accepted (tightening or setting-from-unset) OR checker-routed loosening.
      const body = r.body || {};
      if (body.pending_checker_request_id || body.request_id) {
        setPendingReq(body);
      }
      await load();
      return;
    }
    if (r.status === 401 || r.status === 403) {
      setDeny(r.body);
      return;
    }
    // Governed refusal (validation, missing dual-approval, etc.)
    setRefusal(r.body);
  };

  const submitDeletion = async (e) => {
    e.preventDefault();
    setBusy(true);
    setRefusal(null);
    setDeletionResult(null);
    const form = new FormData(e.target);
    const payload = {
      held_class: form.get('held_class'),
      keys_pattern: form.get('keys_pattern') || null,
      approver_a_id: form.get('approver_a'),
      approver_b_id: form.get('approver_b'),
    };
    const r = await api.complianceAuthorizedDeletion(payload);
    setBusy(false);
    if (r.status >= 200 && r.status < 300) {
      setDeletionResult(r.body);
      return;
    }
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    setRefusal(r.body);
  };

  if (deny) {
    return (
      <AkkiShell title="Govern · Retention" subtitle="Posture · ceremonies">
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Govern · Retention" subtitle="Posture · ceremonies">
        <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." />
      </AkkiShell>
    );
  }
  if (!config) return <AkkiShell title="Govern · Retention" subtitle="Loading…"><div /></AkkiShell>;

  const globalDays = config.global_default && config.global_default.days;
  const heldClasses = config.held_classes || [];
  const anyUnset = globalDays === null || heldClasses.some((h) => h.posture === 'unset');

  return (
    <AkkiShell
      title="Govern · Retention"
      subtitle="Posture · loosening ceremony · authorized deletion"
      right={<Link to="/govern" style={{ color: AKKI_V4_PALETTE.oxblood, fontFamily: AKKI_V4_TYPOGRAPHY.labels }}>← Govern estate</Link>}
    >
      {/* Verbatim unset banner. */}
      {anyUnset && (
        <section
          data-testid="govern-retention-unset-banner"
          style={{
            background: AKKI_V4_PALETTE.mist,
            borderLeft: `4px solid ${AKKI_V4_PALETTE.amber}`,
            padding: '14px 20px',
            marginBottom: '20px',
            fontFamily: AKKI_V4_TYPOGRAPHY.body,
            color: AKKI_V4_PALETTE.ink,
          }}
        >
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: AKKI_V4_PALETTE.amber, fontWeight: 600, marginBottom: '6px',
          }}>Retention posture · unset</div>
          <div data-testid="govern-retention-unset-copy" style={{ fontSize: '0.95rem' }}>
            {UNSET_RETENTION_BANNER}
          </div>
        </section>
      )}

      {/* Held-class posture table. */}
      <section data-testid="govern-retention-table" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>
          Held-class posture
        </h2>
        <div style={{ display: 'grid', gap: '8px' }}>
          {heldClasses.map((h) => (
            <div
              key={h.class_name}
              data-testid={`govern-retention-row-${h.class_name}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr 140px',
                gap: '16px',
                alignItems: 'center',
                padding: '10px 14px',
                background: AKKI_V4_PALETTE.mist,
                border: `1px solid ${AKKI_V4_PALETTE.sage}`,
              }}
            >
              <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.ink, fontWeight: 600 }}>
                {h.class_name}
              </div>
              <div data-testid={`govern-retention-value-${h.class_name}`}>
                {h.days === null || h.days === undefined ? (
                  <MarkedOpenSlot slotName={`retention_window_${h.class_name}`} />
                ) : (
                  <span style={{ color: AKKI_V4_PALETTE.ink }}>{h.days} days</span>
                )}
              </div>
              <div><PostureChip posture={h.posture} /></div>
            </div>
          ))}
        </div>
      </section>

      {/* Retention change ceremony. */}
      <section data-testid="govern-retention-ceremony-section" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>
          Change retention window
        </h2>
        <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.smoke, margin: '4px 0 12px 0' }}>
          Loosening (increasing days OR unset→any) routes through the consequence-class checker (Amendment G Ruling 6).
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Held class
            <select
              data-testid="govern-retention-ceremony-class"
              value={ceremonyClass}
              onChange={(e) => setCeremonyClass(e.target.value)}
              style={{ padding: '6px 10px', fontFamily: AKKI_V4_TYPOGRAPHY.body }}
            >
              {heldClasses.map((h) => <option key={h.class_name} value={h.class_name}>{h.class_name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            New window (days · blank = unset)
            <input
              data-testid="govern-retention-ceremony-days"
              type="number" min="0" step="1"
              value={ceremonyDays}
              onChange={(e) => setCeremonyDays(e.target.value)}
              style={{ padding: '6px 10px', fontFamily: AKKI_V4_TYPOGRAPHY.body, width: '160px' }}
            />
          </label>
          <button
            data-testid="govern-retention-ceremony-submit"
            onClick={submitRetentionChange}
            disabled={busy}
            style={{
              padding: '8px 16px',
              background: AKKI_V4_PALETTE.oxblood,
              color: AKKI_V4_PALETTE.cream,
              border: 'none',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            Propose change
          </button>
        </div>
        {pendingReq && (
          <div data-testid="govern-retention-checker-routed" style={{
            marginTop: '12px', padding: '10px 14px', border: `1px dashed ${AKKI_V4_PALETTE.amber}`,
            background: AKKI_V4_PALETTE.mist, fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.ink, fontSize: '0.85rem',
          }}>
            Change routed through the consequence-class checker.
            {' '}<Link to="/govern/pending" style={{ color: AKKI_V4_PALETTE.oxblood }}>See pending queue →</Link>
          </div>
        )}
        {refusal && (
          <GovernedRefusalCard reason={refusal.reason} detail={refusal.detail} />
        )}
      </section>

      {/* Authorized deletion ceremony. */}
      <section data-testid="govern-retention-deletion-section" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>
          Authorized deletion ceremony
        </h2>
        <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.smoke, margin: '4px 0 12px 0' }}>
          Dual approver required. Destruction attestation lands on ledger.
        </p>
        <div style={{ marginBottom: '8px' }}>
          <MarkedOpenSlot slotName="destruction_attestation_microcopy" note="A5-1 pending Owner ruling" />
        </div>
        <form onSubmit={submitDeletion} style={{ display: 'grid', gap: '10px', maxWidth: '640px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Held class
            <select name="held_class" data-testid="govern-deletion-held-class" style={{ padding: '6px 10px' }}>
              {heldClasses.map((h) => <option key={h.class_name} value={h.class_name}>{h.class_name}</option>)}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Keys pattern (optional)
            <input name="keys_pattern" data-testid="govern-deletion-keys-pattern" style={{ padding: '6px 10px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Approver A (initiator)
            <input name="approver_a" data-testid="govern-deletion-approver-a" required style={{ padding: '6px 10px' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Approver B (counter-sign)
            <input name="approver_b" data-testid="govern-deletion-approver-b" required style={{ padding: '6px 10px' }} />
          </label>
          <button
            type="submit"
            data-testid="govern-deletion-submit"
            disabled={busy}
            style={{
              padding: '8px 16px',
              background: AKKI_V4_PALETTE.oxblood,
              color: AKKI_V4_PALETTE.cream,
              border: 'none',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              width: 'fit-content',
              cursor: busy ? 'wait' : 'pointer',
            }}
          >
            Attempt deletion (dual approver)
          </button>
        </form>
        {deletionResult && (
          <div data-testid="govern-deletion-attestation" style={{
            marginTop: '12px', padding: '10px 14px', border: `1px solid ${AKKI_V4_PALETTE.sage}`,
            background: AKKI_V4_PALETTE.mist, fontFamily: AKKI_V4_TYPOGRAPHY.body, fontSize: '0.85rem',
          }}>
            Deletion attested · keys removed: {deletionResult.keys_deleted ?? '—'}
          </div>
        )}
      </section>
    </AkkiShell>
  );
}
