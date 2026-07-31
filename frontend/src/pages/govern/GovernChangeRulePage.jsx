import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, GovernedRefusalCard } from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';
import { FROZEN_IS_IMMUTABLE } from '../../design/ratified_copy';

/* Govern · Change Rule — the ceremony surface.
 * §3 "Rule change as visible cancelable pipeline (proposed → counter-signed →
 * waiting → applied, cancel-before-applies)" · FB-16 countdown · §A4-2 seam.
 *
 * Consumes POST /api/checker/initiate + countersign + object. NO new frozen
 * contract. Direction chip computed CLIENT-SIDE from numeric from/to deltas.
 */
function DirectionChip({ from, to }) {
  const fromN = Number(from);
  const toN = Number(to);
  let cls = 'neutral';
  let bg = AKKI_V4_PALETTE.navy;
  let fg = AKKI_V4_PALETTE.cream;
  if (Number.isFinite(fromN) && Number.isFinite(toN)) {
    if (toN > fromN) { cls = 'loosening'; bg = AKKI_V4_PALETTE.oxblood; fg = AKKI_V4_PALETTE.cream; }
    else if (toN < fromN) { cls = 'tightening'; bg = AKKI_V4_PALETTE.sage; fg = AKKI_V4_PALETTE.ink; }
  }
  return (
    <span
      data-testid={`govern-change-rule-direction-chip-${cls}`}
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '2px',
        background: bg,
        color: fg,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        fontSize: '0.68rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {cls}
    </span>
  );
}

function CeremonyStages({ current }) {
  // Stage 4 (Apply) carries the ratified behavioural rule as its caption per
  // FB v2 §A5-1 ("Frozen is immutable." — recommended for fast ratification
  // because it encodes a behavioural rule, not a tone choice). Rendered at
  // ceremony level so the rule is always visible, not only after a request
  // reaches `effective` state.
  const stages = [
    { key: 'proposed', label: 'Propose', caption: null },
    { key: 'countersigned', label: 'Counter-sign', caption: null },
    { key: 'waiting', label: 'Wait', caption: null },
    { key: 'applied', label: 'Apply', caption: FROZEN_IS_IMMUTABLE },
  ];
  return (
    <div data-testid="govern-change-rule-stages" style={{ display: 'flex', gap: '18px', marginBottom: '22px', flexWrap: 'wrap' }}>
      {stages.map((s) => (
        <div
          key={s.key}
          data-testid={`govern-change-rule-stage-block-${s.key}`}
          style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
        >
          <span
            data-testid={`govern-change-rule-stage-${s.key}`}
            style={{
              padding: '5px 12px',
              borderRadius: '2px',
              background: current === s.key ? AKKI_V4_PALETTE.navy : 'transparent',
              color: current === s.key ? AKKI_V4_PALETTE.cream : AKKI_V4_PALETTE.smoke,
              border: `1px solid ${AKKI_V4_PALETTE.navy}`,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              fontSize: '0.72rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {s.label}
          </span>
          {s.caption && (
            <span
              data-testid={`govern-change-rule-stage-caption-${s.key}`}
              style={{
                fontSize: '0.72rem',
                color: AKKI_V4_PALETTE.oxblood,
                fontStyle: 'italic',
                fontFamily: AKKI_V4_TYPOGRAPHY.body,
                paddingLeft: '4px',
                maxWidth: '120px',
              }}
            >
              {s.caption}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Countdown({ effectiveAtIso }) {
  const [now, setNow] = useState(Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remainingMs = new Date(effectiveAtIso).getTime() - now;
  if (Number.isNaN(remainingMs)) return <MarkedOpenSlot slotName="countdown" />;
  const seconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return (
    <span data-testid="govern-change-rule-countdown" style={{
      fontFamily: AKKI_V4_TYPOGRAPHY.mono || 'monospace',
      color: AKKI_V4_PALETTE.oxblood,
      fontWeight: 600,
    }}>
      {hh}:{mm}:{ss} until effective
    </span>
  );
}

export default function GovernChangeRulePage() {
  const [ruleClass, setRuleClass] = useState('retention_windows');
  const [fromRef, setFromRef] = useState('');
  const [toRef, setToRef] = useState('');
  const [request, setRequest] = useState(null);
  const [deny, setDeny] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelDeny, setCancelDeny] = useState(null);

  // Poll the checker request every 2s while a countdown window is live
  // so the ceremony countdown ticks against the authoritative backend
  // state (never a UI-only clock).
  React.useEffect(() => {
    if (!request || !request.request_id) return undefined;
    const inFlight = request.state === 'pending_delay' || request.state === 'pending_counter_sign';
    if (!inFlight) return undefined;
    const t = setInterval(async () => {
      const r = await api.checkerRequestRead(request.request_id);
      if (r.status === 200) setRequest(r.body);
    }, 2000);
    return () => clearInterval(t);
  }, [request?.request_id, request?.state]);

  const initiate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setDeny(null);
    setRefusal(null);
    setCancelDeny(null);
    const r = await api.checkerInitiate({
      rule_class: ruleClass,
      from_value_ref: fromRef,
      to_value_ref: toRef,
    });
    setBusy(false);
    if (r.status >= 200 && r.status < 300) {
      setRequest(r.body);
      return;
    }
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    setRefusal(r.body);
  };

  const cancelWindow = async () => {
    if (!request || !request.request_id) return;
    if (!cancelReason.trim()) return;
    setCancelBusy(true);
    setCancelDeny(null);
    const r = await api.checkerCancel(request.request_id, cancelReason.trim());
    setCancelBusy(false);
    if (r.status === 401 || r.status === 403) {
      setCancelDeny(r.body);
      return;
    }
    if (r.status >= 200 && r.status < 300) {
      // Read the updated request so state + suspend_reason land in the
      // history (canceled proposal is a RECORD, not a deletion).
      const r2 = await api.checkerRequestRead(request.request_id);
      if (r2.status === 200) setRequest(r2.body);
      setCancelReason('');
    }
  };

  const currentStage = !request
    ? 'proposed'
    : request.state === 'pending_counter_sign'
      ? 'proposed'
      : request.state === 'pending_delay'
        ? 'waiting'
        : request.state === 'effective'
          ? 'applied'
          : request.state === 'suspended'
            ? 'suspended'
            : 'proposed';

  const canCancel = request && (request.state === 'pending_counter_sign' || request.state === 'pending_delay');

  return (
    <AkkiShell
      title="Govern · Change a rule"
      subtitle="Propose → counter-sign → wait → apply"
      right={<Link to="/govern" style={{ color: AKKI_V4_PALETTE.oxblood, fontFamily: AKKI_V4_TYPOGRAPHY.labels }}>← Govern estate</Link>}
    >
      <CeremonyStages current={currentStage} />

      <section style={{ marginBottom: '24px' }}>
        <form onSubmit={initiate} style={{ display: 'grid', gap: '10px', maxWidth: '640px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Rule class
            <input
              data-testid="govern-change-rule-class"
              value={ruleClass}
              onChange={(e) => setRuleClass(e.target.value)}
              style={{ padding: '6px 10px' }}
              required
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            From value ref
            <input
              data-testid="govern-change-rule-from"
              value={fromRef}
              onChange={(e) => setFromRef(e.target.value)}
              style={{ padding: '6px 10px' }}
              required
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            To value ref
            <input
              data-testid="govern-change-rule-to"
              value={toRef}
              onChange={(e) => setToRef(e.target.value)}
              style={{ padding: '6px 10px' }}
              required
            />
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>Direction:</span>
            <DirectionChip from={fromRef} to={toRef} />
          </div>
          <button
            type="submit"
            data-testid="govern-change-rule-initiate-btn"
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
            Propose change
          </button>
        </form>
      </section>

      {deny && (
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} />
      )}

      {refusal && (
        <GovernedRefusalCard reason={refusal.reason} detail={refusal.detail} />
      )}

      {request && (
        <section data-testid="govern-change-rule-request-card" style={{
          marginTop: '20px',
          padding: '18px 22px',
          background: AKKI_V4_PALETTE.mist,
          border: `1px solid ${AKKI_V4_PALETTE.sage}`,
        }}>
          <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem', color: AKKI_V4_PALETTE.smoke, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            request · {request.request_id}
          </div>
          <div style={{ marginTop: '8px', fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.ink }}>
            {request.rule_class}: <strong>{fromRef}</strong> → <strong>{toRef}</strong>
          </div>
          <div style={{ marginTop: '6px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>State:</span>
            <span
              data-testid="govern-change-rule-request-state"
              style={{
                padding: '3px 10px',
                background: AKKI_V4_PALETTE.navy,
                color: AKKI_V4_PALETTE.cream,
                fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                fontSize: '0.68rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >{request.state}</span>
            <span style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>Consequence class:</span>
            <span
              data-testid="govern-change-rule-request-consequence"
              style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}
            >{request.consequence_class}</span>
          </div>
          {request.state === 'effective' && (
            <div data-testid="govern-change-rule-applied-frozen-chip" style={{
              marginTop: '10px',
              display: 'inline-block',
              padding: '4px 10px',
              background: AKKI_V4_PALETTE.navy,
              color: AKKI_V4_PALETTE.cream,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>{FROZEN_IS_IMMUTABLE}</div>
          )}
          {request.state === 'pending_delay' && (request.countdown_ends_at_iso || request.effective_at) && (
            <div style={{ marginTop: '10px' }}>
              <Countdown effectiveAtIso={request.countdown_ends_at_iso || request.effective_at} />
            </div>
          )}
          {request.state === 'pending_counter_sign' && (
            <div
              data-testid="govern-change-rule-awaiting-countersign"
              style={{
                marginTop: '10px',
                padding: '10px 14px',
                border: `1px solid ${AKKI_V4_PALETTE.amber}`,
                background: AKKI_V4_PALETTE.cream,
                fontSize: '0.85rem',
                color: AKKI_V4_PALETTE.ink,
              }}
            >
              <div style={{
                fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
                color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '4px',
              }}>
                Awaiting counter-sign
              </div>
              A dual-control rule change needs a second identity to countersign
              before it enters the delay window. No timer applies at this phase
              — the ceremony holds until countersigned or canceled.
            </div>
          )}
          {(request.state === 'pending_counter_sign' || request.state === 'pending_delay') && (
            <div style={{ marginTop: '14px' }}>
              <Link
                to="/govern/pending"
                data-testid="govern-change-rule-see-pending-link"
                style={{ color: AKKI_V4_PALETTE.oxblood }}
              >
                Continue in the pending queue →
              </Link>
            </div>
          )}
          {canCancel && (
            <div
              data-testid="govern-change-rule-cancel-block"
              style={{
                marginTop: '18px', padding: '14px 16px',
                border: `1px dashed ${AKKI_V4_PALETTE.oxblood}`,
                background: AKKI_V4_PALETTE.cream,
              }}
            >
              <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, marginBottom: '8px' }}>
                <strong>Cancel this window</strong> — a canceled proposal is a record, not a deletion.
                Cancel routes through the checker state machine (Canon §7.5 · master_admin only).
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  data-testid="govern-change-rule-cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Cancel reason (required)"
                  style={{
                    flex: 1, minWidth: '220px', padding: '6px 10px',
                    border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem',
                  }}
                />
                <button
                  type="button"
                  data-testid="govern-change-rule-cancel-btn"
                  onClick={cancelWindow}
                  disabled={cancelBusy || !cancelReason.trim()}
                  style={{
                    padding: '6px 14px', background: AKKI_V4_PALETTE.oxblood,
                    color: AKKI_V4_PALETTE.cream, border: 'none',
                    fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.75rem',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    cursor: (cancelBusy || !cancelReason.trim()) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {cancelBusy ? 'canceling…' : 'Cancel window'}
                </button>
              </div>
              {cancelDeny && (
                <div style={{ marginTop: '10px' }}>
                  <AccessControlDeniedPanel reason={cancelDeny.reason} detail={cancelDeny.detail} />
                </div>
              )}
            </div>
          )}
          {request.state === 'suspended' && (
            <div
              data-testid="govern-change-rule-suspended-record"
              style={{
                marginTop: '14px', padding: '12px 16px',
                border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
                background: AKKI_V4_PALETTE.mist,
              }}
            >
              <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.7rem', color: AKKI_V4_PALETTE.oxblood, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Canceled · record, not deletion
              </div>
              <div data-testid="govern-change-rule-suspend-reason" style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}>
                {request.suspend_reason || '(no reason recorded)'}
              </div>
              <div style={{ marginTop: '6px', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage }}>
                prior_state · {request.prior_state} · suspended_at · {request.suspended_at}
              </div>
            </div>
          )}
        </section>
      )}
    </AkkiShell>
  );
}
