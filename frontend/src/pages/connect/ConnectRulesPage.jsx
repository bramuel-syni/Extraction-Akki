/* UI-1-C · Connect Rules · Canon §4.2 seven Connect rules.
 *
 * Rule 7 (commission auto-run ceiling) reads its value from the single
 * source of truth (`GET /api/connect/rules` → server-side reads through
 * `services.connect.rulebook.get_effective_auto_run_ceiling_usd`).
 *
 * Direct-write attempts refuse via a governed refusal envelope with a
 * route to /govern/change-rule. Gate: gate_auto_run_ceiling_1000_change_a_rule_only.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel } from '../../design/ResponseClassPanel';


function ClassChip({ classType }) {
  const bg = {
    S: AKKI_V4_PALETTE.navy,
    O: AKKI_V4_PALETTE.sage,
    E: AKKI_V4_PALETTE.amber,
    D: AKKI_V4_PALETTE.oxblood,
  }[classType] || AKKI_V4_PALETTE.mist;
  return (
    <span
      data-testid={`connect-rule-class-chip-${classType}`}
      style={{
        display: 'inline-block', padding: '2px 8px',
        background: bg, color: AKKI_V4_PALETTE.cream,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginRight: '6px',
      }}
    >
      Class {classType}
    </span>
  );
}


function DirectWriteProbe({ ruleId }) {
  const [attempt, setAttempt] = useState(null);

  const tryDirect = async () => {
    const r = await api.connectRuleDirectWrite(ruleId, 9999);
    setAttempt(r.body);
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <button
        type="button"
        data-testid={`connect-rule-direct-write-probe-${ruleId}`}
        onClick={tryDirect}
        style={{
          padding: '4px 10px', background: AKKI_V4_PALETTE.mist,
          color: AKKI_V4_PALETTE.ink, border: 'none',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          cursor: 'pointer',
        }}
      >
        Test: direct-write refuses?
      </button>
      {attempt && (
        <div
          data-testid={`connect-rule-direct-write-refusal-${ruleId}`}
          style={{
            marginTop: '6px', padding: '6px 10px',
            border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
            fontSize: '0.75rem', color: AKKI_V4_PALETTE.oxblood,
          }}
        >
          <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.labels, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Refused ·{' '}
          </span>
          {attempt.reason || attempt.detail || 'refused'}
          {attempt.route && (
            <Link
              to={attempt.route}
              data-testid={`connect-rule-refusal-route-${ruleId}`}
              style={{ marginLeft: '8px', color: AKKI_V4_PALETTE.navy }}
            >
              Open Govern · Change a rule →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}


function RuleCard({ rule }) {
  return (
    <article
      data-testid={`connect-rule-card-${rule.rule_id}`}
      data-rule-dormant={rule.is_dormant ? 'true' : 'false'}
      style={{
        padding: '16px 18px', marginBottom: '12px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${rule.is_dormant ? AKKI_V4_PALETTE.amber : AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <ClassChip classType={rule.class_type} />
        <span
          data-testid={`connect-rule-enforcement-${rule.rule_id}`}
          style={{
            display: 'inline-block', padding: '2px 8px',
            background: AKKI_V4_PALETTE.mist, color: AKKI_V4_PALETTE.ink,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {rule.enforcement_class}
        </span>
        {rule.is_dormant && (
          <span
            data-testid={`connect-rule-dormant-badge-${rule.rule_id}`}
            style={{
              display: 'inline-block', padding: '2px 8px',
              background: AKKI_V4_PALETTE.amber, color: AKKI_V4_PALETTE.cream,
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            Dormant
          </span>
        )}
      </div>
      <div style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink, marginBottom: '4px' }}>
        {rule.label}
      </div>
      <div
        data-testid={`connect-rule-value-${rule.rule_id}`}
        style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginBottom: '4px' }}
      >
        Value: {rule.value_display}
        {rule.unit && ` ${rule.unit}`}
        {rule.infinity_permitted && (
          <span style={{ color: AKKI_V4_PALETTE.amber, marginLeft: '6px' }}> · ∞ permitted</span>
        )}
      </div>
      <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage }}>
        Change authority: {rule.change_authority}
      </div>
      {rule.dormant_reason && (
        <div style={{ marginTop: '4px', fontSize: '0.72rem', color: AKKI_V4_PALETTE.amber, fontStyle: 'italic' }}>
          {rule.dormant_reason}
        </div>
      )}
      <DirectWriteProbe ruleId={rule.rule_id} />
    </article>
  );
}


export default function ConnectRulesPage() {
  const [rules, setRules] = useState(null);
  const [deny, setDeny] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.connectRules();
      if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
      if (r.status === 200) setRules(r.body.rules);
    })();
  }, []);

  if (deny) return (
    <AkkiShell title="Rules · Connect">
      <AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} />
    </AkkiShell>
  );

  return (
    <AkkiShell
      title="Rules · Connect"
      subtitle="Canon §4.2 · seven Connect rules · changes route through Change-a-Rule."
    >
      <p style={{ marginBottom: '18px' }}>
        <Link to="/connect" data-testid="connect-rules-back" style={{ color: AKKI_V4_PALETTE.navy }}>
          ← Connect
        </Link>
      </p>
      {rules === null && (
        <div data-testid="connect-rules-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div>
      )}
      {rules && (
        <div data-testid="connect-rules-list">
          {rules.map((r) => <RuleCard key={r.rule_id} rule={r} />)}
        </div>
      )}
    </AkkiShell>
  );
}
