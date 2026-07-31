import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { GovernedRefusalCard } from '../../design/ResponseClassPanel';

/* CONNECT / new source — thin stub wizard.
 *
 * The "Connect" CTA is disabled by design (Owner Ruling 1) — the seam
 * refuses registration with connect_seam_dormant until OT-1a facts
 * arrive. The refusal is rendered honestly via GovernedRefusalCard.
 *
 * The stub is honestly marked; no "coming soon" copy, no build state.
 */
export default function ConnectNewSourcePage() {
  const [capabilities, setCapabilities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [label, setLabel] = useState('');
  const [refusal, setRefusal] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const r = await api.connectCapabilities();
      if (r.status === 200) setCapabilities(r.body.capabilities || []);
    })();
  }, []);

  const attemptRegister = async () => {
    setRefusal(null);
    const r = await api.connectRegisterSource({
      capability_id: selected || '(none)',
      label: label || '(unnamed)',
    });
    // 501 with governed refusal envelope expected.
    if (r.body && r.body.outcome === 'refused') {
      setRefusal(r.body);
    } else {
      setRefusal({
        outcome: 'refused',
        reason: 'unexpected_response',
        detail: 'Backend responded outside the governed-refusal envelope.',
      });
    }
  };

  return (
    <AkkiShell
      title="Connect · register a source"
      subtitle="Governed stub · awaiting Owner OT-1a facts"
      right={
        <Link
          to="/connect"
          data-testid="connect-new-back"
          style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none' }}
        >← back to Connect</Link>
      }
    >
      <section style={{
        background: AKKI_V4_PALETTE.bone,
        padding: '16px 18px',
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        maxWidth: '640px',
      }}>
        <div style={{ marginBottom: '12px', fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage }}>
          Registration is dormant. The form is present so you can inspect
          the shape; the Connect CTA will refuse with a governed envelope.
        </div>
        <label style={{
          display: 'block', marginBottom: '8px',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy,
        }}>
          Capability
          <select
            data-testid="connect-new-select-capability"
            value={selected || ''}
            onChange={(e) => setSelected(e.target.value)}
            style={{
              display: 'block', width: '100%', padding: '8px', marginTop: '4px',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              border: `1px solid ${AKKI_V4_PALETTE.navy}`,
              background: AKKI_V4_PALETTE.cream,
            }}
          >
            <option value="">— pick one —</option>
            {capabilities.map((c) => (
              <option key={c.capability_id} value={c.capability_id}>
                {c.label} · dormant
              </option>
            ))}
          </select>
        </label>
        <label style={{
          display: 'block', marginBottom: '12px',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy,
        }}>
          Label
          <input
            data-testid="connect-new-input-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Human-readable source name"
            style={{
              display: 'block', width: '100%', padding: '8px', marginTop: '4px',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              border: `1px solid ${AKKI_V4_PALETTE.navy}`,
              background: AKKI_V4_PALETTE.cream,
            }}
          />
        </label>
        <button
          data-testid="connect-new-submit"
          onClick={attemptRegister}
          style={{
            background: AKKI_V4_PALETTE.navy,
            color: AKKI_V4_PALETTE.cream,
            border: 'none', padding: '10px 16px',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            cursor: 'pointer',
          }}
        >Attempt registration (dormant — will refuse)</button>
      </section>

      {refusal && (
        <GovernedRefusalCard
          reason={refusal.reason}
          detail={refusal.detail}
          traceId={`connect-new-${Date.now()}`}
          onAccept={() => navigate('/connect')}
          onNarrow={() => setRefusal(null)}
          onLower={() => setRefusal(null)}
        />
      )}
    </AkkiShell>
  );
}
