/* UI-1-B · Trust Center (Canon §7.1 + §7.2).
 *
 * Two halves layout:
 *   LEFT — Rule inventory · every rule in force, with who set it, when,
 *          number of automated checks enforcing it, enforcement class.
 *   RIGHT — The Record · refusals by class · holds · masking · access
 *          events · deletions · rule changes · per-application memory.
 *
 * Enforcement class HEADLINE at top: machinery-vs-attestation SPLIT
 * with one plain-language line between (Canon §7.2 · Owner ruling).
 *
 * Doctrine rendered verbatim: "Violations post as plainly as successes;
 * every violation carries its disposition." (Canon §7.1 · §11).
 *
 * Role gating (Canon §3.2): DPO R+W (via Change-a-Rule); others R.
 *
 * Sub-page routes:
 *   /govern/rules       → Estate Rules Record (§7.3 · S/O/E/D)
 *   /govern/registries  → Class-D registries seam (§7.4)
 *   /govern/change-rule → Change-a-Rule ceremony (§7.5)
 *   /govern/pending     → Holds surface + reverse-route (§7.6)
 *   /govern/retention   → Retention rulebook (§7.1 record)
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';

function EnforcementClassHeadline({ split }) {
  /* Canon §7.2: SPLIT stat machinery-vs-attestation with plain-language
   * line between. No class superior; nothing urges conversion.
   */
  if (!split) return null;
  const enforced = split.enforced_count ?? 0;
  const attested = split.attested_count ?? 0;
  const monitored = split.monitored_count ?? 0;
  return (
    <section
      data-testid="govern-enforcement-class-headline"
      style={{
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '22px 28px',
        marginBottom: '24px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '18px',
          alignItems: 'end',
        }}
      >
        <div data-testid="govern-headline-machinery">
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Machinery · Enforced
          </div>
          <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '2.6rem', color: AKKI_V4_PALETTE.navy, lineHeight: 1.1 }}>
            {enforced}
          </div>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>rails · rules with rails</div>
        </div>
        <div data-testid="govern-headline-attestation">
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Attestation · Attested
          </div>
          <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '2.6rem', color: AKKI_V4_PALETTE.amber, lineHeight: 1.1 }}>
            {attested}
          </div>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>evidence · countersignature</div>
        </div>
        <div data-testid="govern-headline-monitored">
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Monitored
          </div>
          <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '2.6rem', color: AKKI_V4_PALETTE.sage, lineHeight: 1.1 }}>
            {monitored}
          </div>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>observation log · non-blocking</div>
        </div>
      </div>
      <p
        data-testid="govern-headline-plain-line"
        style={{
          margin: '18px 0 0 0',
          fontSize: '0.88rem',
          color: AKKI_V4_PALETTE.ink,
          fontStyle: 'italic',
          lineHeight: 1.55,
        }}
      >
        {split.machinery_vs_attestation_line}
      </p>
    </section>
  );
}

function RuleInventoryHalf({ rules }) {
  if (!rules) return <div data-testid="govern-rule-inventory-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div>;
  const all = [
    ...(rules.S_rails || []),
    ...(rules.O_rules || []),
    ...(rules.E_engine_settings || []),
    ...(rules.D_registries || []),
  ];
  return (
    <section
      data-testid="govern-half-rule-inventory"
      style={{
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '20px 22px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <h3
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.15rem',
          margin: '0 0 12px 0',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        Rule inventory
      </h3>
      <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, margin: '0 0 14px 0' }}>
        Every rule in force · who set it · number of checks enforcing it · class.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: AKKI_V4_PALETTE.mist }}>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500, letterSpacing: '0.02em' }}>Rule</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>Class</th>
            <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 500 }}>Enforcement</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 500 }}>Checks 30d</th>
          </tr>
        </thead>
        <tbody>
          {all.map((r) => (
            <tr key={r.slug} data-testid={`govern-rule-row-${r.slug}`} style={{ borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}` }}>
              <td style={{ padding: '6px 8px' }}>
                <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.8rem', color: AKKI_V4_PALETTE.ink }}>
                  {r.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.sage, marginTop: '2px' }}>
                  {r.value ?? (r.seam_state ? `— ${r.seam_state}` : '— not set')}
                </div>
              </td>
              <td style={{ padding: '6px 8px' }}>
                <span
                  data-testid={`govern-rule-row-class-${r.slug}`}
                  style={{
                    padding: '2px 6px',
                    fontSize: '0.7rem',
                    background: r.class_type === 'S' ? AKKI_V4_PALETTE.navy : r.class_type === 'O' ? AKKI_V4_PALETTE.amber : r.class_type === 'E' ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.oxblood,
                    color: AKKI_V4_PALETTE.cream,
                    letterSpacing: '0.04em',
                  }}
                >
                  {r.class_type}
                </span>
              </td>
              <td style={{ padding: '6px 8px' }}>
                <span
                  data-testid={`govern-rule-row-enforcement-${r.slug}`}
                  style={{ fontSize: '0.78rem', color: AKKI_V4_PALETTE.ink }}
                >
                  {r.enforcement_class}
                </span>
              </td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, color: AKKI_V4_PALETTE.sage }}>
                {r.enforcement_count_30d ?? 0}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '12px' }}>
        <Link
          to="/govern/rules"
          data-testid="govern-see-estate-rules-record"
          style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.85rem' }}
        >
          Open Estate Rules Record · Canon §7.3 →
        </Link>
      </div>
    </section>
  );
}

function RecordBucket({ testId, label, valueLine, secondLine, seamState, routeLabel, routeTo }) {
  return (
    <div
      data-testid={testId}
      style={{
        borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '10px 0',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}>{label}</div>
        <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage, marginTop: '2px' }}>
          {valueLine}
        </div>
        {secondLine && (
          <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage }}>
            {secondLine}
          </div>
        )}
        {seamState && (
          <div style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.amber, marginTop: '2px' }}>
            seam · {seamState}
          </div>
        )}
      </div>
      {routeTo && (
        <Link
          to={routeTo}
          data-testid={`${testId}-route`}
          style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
        >
          {routeLabel} →
        </Link>
      )}
    </div>
  );
}

function RecordHalf({ record }) {
  if (!record) return <div data-testid="govern-record-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div>;
  return (
    <section
      data-testid="govern-half-record"
      style={{
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '20px 22px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <h3
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.15rem',
          margin: '0 0 12px 0',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        The Record
      </h3>
      <p
        data-testid="govern-record-doctrine-verbatim"
        style={{
          fontSize: '0.82rem',
          color: AKKI_V4_PALETTE.oxblood,
          fontStyle: 'italic',
          margin: '0 0 12px 0',
        }}
      >
        {record.doctrine_line_verbatim}
      </p>
      <RecordBucket
        testId="govern-record-bucket-refusals"
        label="Refusals by class"
        valueLine={`absolute ${record.refusals?.absolute ?? 0} · escalatable ${record.refusals?.escalatable ?? 0} · held-for-check ${record.refusals?.held_for_check ?? 0}`}
        secondLine="Every refusal carries its disposition (Canon §1.3)."
        routeLabel="Open refusal health"
        routeTo="/govern/refusal-health"
      />
      <RecordBucket
        testId="govern-record-bucket-holds"
        label="Holds"
        valueLine={`open ${record.holds?.open ?? 0} · released ${record.holds?.released ?? 0} · confirmed rejected ${record.holds?.confirmed_rejected ?? 0}`}
        routeLabel="Open holds"
        routeTo="/govern/pending"
      />
      <RecordBucket
        testId="govern-record-bucket-masking"
        label="Masking activity"
        valueLine={`events 30d · ${record.masking?.events_30d ?? 0} · recall breaches 30d · ${record.masking?.recall_breaches_30d ?? 0}`}
        seamState={record.masking?.seam_state}
      />
      <RecordBucket
        testId="govern-record-bucket-access"
        label="Access events"
        valueLine={`people 30d · ${record.access_events?.people_30d ?? 0} · applications 30d · ${record.access_events?.applications_30d ?? 0}`}
        seamState={record.access_events?.seam_state}
      />
      <RecordBucket
        testId="govern-record-bucket-deletions"
        label="Deletions"
        valueLine={`authorized 30d · ${record.deletions?.authorized_30d ?? 0}`}
        seamState={record.deletions?.seam_state}
      />
      <RecordBucket
        testId="govern-record-bucket-rule-changes"
        label="Rule changes"
        valueLine={`pending ${record.rule_changes?.pending ?? 0} · effective 30d ${record.rule_changes?.effective_30d ?? 0} · suspended 30d ${record.rule_changes?.suspended_30d ?? 0}`}
        routeLabel="Open Change-a-Rule"
        routeTo="/govern/change-rule"
      />
      <RecordBucket
        testId="govern-record-bucket-memory"
        label="Per-application memory activity"
        valueLine={`planes active · ${record.memory_activity?.planes_active ?? 0}`}
        seamState={record.memory_activity?.seam_state}
        routeLabel="Open Memory Service"
        routeTo="/memory"
      />
    </section>
  );
}

export default function GovernHomePage() {
  const [split, setSplit] = useState(null);
  const [record, setRecord] = useState(null);
  const [rules, setRules] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const rSplit = await api.governEnforcementClassSplit();
      if (rSplit.status === 401 || rSplit.status === 403) { setDeny(rSplit.body); return; }
      if (rSplit.status >= 500) { setFault(rSplit.body); return; }
      setSplit(rSplit.body);
      const rRecord = await api.governTrustCenterRecord();
      if (rRecord.status === 200) setRecord(rRecord.body);
      const rRules = await api.governEstateRulesRecord();
      if (rRules.status === 200) setRules(rRules.body);
    })();
  }, []);

  if (deny) return (
    <AkkiShell title="Trust Center · Govern" subtitle="Canon §7.1 · The rule inventory left. The record right.">
      <AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} />
    </AkkiShell>
  );
  if (fault) return (
    <AkkiShell title="Trust Center · Govern"><InfrastructureFaultPanel headline="govern read failed" detail={fault?.detail} /></AkkiShell>
  );

  return (
    <AkkiShell
      title="Trust Center · Govern"
      subtitle="Canon §7.1 · The rule inventory left. The record right."
    >
      <EnforcementClassHeadline split={split} />
      <div
        data-testid="govern-two-halves"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        <RuleInventoryHalf rules={rules} />
        <RecordHalf record={record} />
      </div>
    </AkkiShell>
  );
}
