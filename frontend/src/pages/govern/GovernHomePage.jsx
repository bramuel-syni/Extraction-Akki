import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell, DormantCapabilityChip } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';
import { UNSET_RETENTION_BANNER } from '../../design/ratified_copy';

/* Govern · Home — Rule inventory / Govern Estate (DPO landing).
 *
 * FB-13 retention posture + §A2 rule-inventory sentence + §A3 DPO landing.
 * Reads GET /api/compliance/retention_config and GET /api/checker/pending.
 * NEW backend obligations: NONE. Zero new frozen contracts.
 */
const VALUE_CLASS_CHIP = Object.freeze({
  rails: { bg: AKKI_V4_PALETTE.navy, fg: AKKI_V4_PALETTE.cream },
  rules: { bg: AKKI_V4_PALETTE.sage, fg: AKKI_V4_PALETTE.ink },
  engine_settings: { bg: AKKI_V4_PALETTE.amber, fg: AKKI_V4_PALETTE.ink },
  registries: { bg: 'transparent', fg: AKKI_V4_PALETTE.oxblood, border: `1px solid ${AKKI_V4_PALETTE.oxblood}` },
});

const ENFORCEMENT_CHIP = Object.freeze({
  Enforced: { bg: AKKI_V4_PALETTE.navy, fg: AKKI_V4_PALETTE.cream },
  Attested: { bg: 'transparent', fg: AKKI_V4_PALETTE.navy, border: `1px solid ${AKKI_V4_PALETTE.navy}` },
  Monitored: { bg: 'transparent', fg: AKKI_V4_PALETTE.sage, border: `1px dashed ${AKKI_V4_PALETTE.sage}` },
});

function Chip({ palette, testId, children }) {
  return (
    <span
      data-testid={testId}
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: '2px',
        background: palette.bg,
        color: palette.fg,
        border: palette.border || 'none',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        fontSize: '0.68rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}

export default function GovernHomePage() {
  const [retention, setRetention] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const [rRet, rPen] = await Promise.all([
        api.complianceRetentionConfig(),
        api.checkerPending(),
      ]);
      if (rRet.status === 401 || rRet.status === 403) {
        setDeny(rRet.body);
        return;
      }
      if (rRet.status >= 500) {
        setFault({ status: rRet.status, body: rRet.body });
        return;
      }
      setRetention(rRet.body);
      if (rPen.status === 200) {
        setPendingCount((rPen.body && rPen.body.count) || 0);
      } else {
        setPendingCount(null);
      }
    })();
  }, []);

  if (deny) {
    return (
      <AkkiShell title="Govern" subtitle="The DPO's Estate">
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Govern" subtitle="The DPO's Estate">
        <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." />
      </AkkiShell>
    );
  }

  const globalDefaultDays = retention && retention.global_default && retention.global_default.days;
  const heldClasses = (retention && retention.held_classes) || [];
  const anyUnset = globalDefaultDays === null || heldClasses.some((h) => h.posture === 'unset');

  // Rule inventory rows synthesized from the retention config (day-zero
  // rule inventory scope · Amendment G Ruling 6 · consequence-class checker
  // mediates loosening). This is a READ over existing endpoints — the rows
  // are derived, not stored.
  const inventoryRows = [
    {
      slug: 'retention_default',
      name: 'retention.default_window_days',
      valueClass: 'rules',
      enforcement: 'Enforced',
      changeAuthority: 'Compliance countersignature required (loosening) · Admin sign-off (tightening)',
      currentValue: globalDefaultDays,
    },
    ...heldClasses.map((h) => ({
      slug: `retention_${h.class_name}`,
      name: `retention.${h.class_name}.window_days`,
      valueClass: 'rules',
      enforcement: 'Enforced',
      changeAuthority: 'Compliance countersignature required (loosening) · Admin sign-off (tightening)',
      currentValue: h.days,
      posture: h.posture,
    })),
    {
      slug: 'refusal_taxonomy',
      name: 'response_class.taxonomy',
      valueClass: 'rails',
      enforcement: 'Enforced',
      changeAuthority: 'Owner ruling only',
      currentValue: 'four-class · never conflated',
    },
    {
      slug: 'refusal_families',
      name: 'refusal.family_registry',
      valueClass: 'registries',
      enforcement: 'Attested',
      changeAuthority: 'Compliance registry addendum',
      currentValue: null, // marked open · registry snapshot
    },
    {
      slug: 'disclosure_thresholds',
      name: 'engine.cumulative_disclosure_thresholds',
      valueClass: 'engine_settings',
      enforcement: 'Monitored',
      changeAuthority: 'Dormant · closed seam',
      currentValue: null,
      dormant: true,
    },
  ];

  return (
    <AkkiShell
      title="Govern"
      subtitle="The DPO's Estate · Rule inventory · Ceremonies · Refusal health"
      right={<Link to="/govern/pending" data-testid="govern-home-pending-link" style={{
        color: AKKI_V4_PALETTE.oxblood, textDecoration: 'none', fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}>Pending queue ({pendingCount === null ? '—' : pendingCount}) →</Link>}
    >
      {/* Posture banner — VERBATIM UNSET_RETENTION_BANNER when applicable. */}
      {anyUnset ? (
        <section
          data-testid="govern-home-unset-retention-banner"
          style={{
            background: AKKI_V4_PALETTE.mist,
            borderLeft: `4px solid ${AKKI_V4_PALETTE.amber}`,
            padding: '14px 20px',
            marginBottom: '24px',
            fontFamily: AKKI_V4_TYPOGRAPHY.body,
            color: AKKI_V4_PALETTE.ink,
          }}
        >
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase',
            letterSpacing: '0.12em', color: AKKI_V4_PALETTE.amber, fontWeight: 600, marginBottom: '6px',
          }}>Retention posture · unset</div>
          <div data-testid="govern-home-unset-retention-copy" style={{ fontSize: '0.95rem' }}>
            {UNSET_RETENTION_BANNER}
          </div>
        </section>
      ) : (
        <section
          data-testid="govern-home-posture-set-banner"
          style={{
            background: 'transparent',
            border: `1px solid ${AKKI_V4_PALETTE.sage}`,
            padding: '10px 16px',
            marginBottom: '24px',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            color: AKKI_V4_PALETTE.ink,
            fontSize: '0.82rem',
          }}
        >
          Retention posture · set · global default {globalDefaultDays} days
        </section>
      )}

      {/* Rule inventory table. */}
      <section data-testid="govern-home-rule-inventory">
        <h2 style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink,
          margin: '0 0 12px 0',
        }}>Rule inventory</h2>
        <div style={{ display: 'grid', gap: '10px' }}>
          {inventoryRows.map((row) => (
            <article
              key={row.slug}
              data-testid={`govern-rule-row-${row.slug}`}
              style={{
                background: AKKI_V4_PALETTE.mist,
                padding: '14px 18px',
                border: `1px solid ${AKKI_V4_PALETTE.sage}`,
                display: 'grid',
                gridTemplateColumns: '160px 1fr 160px 140px',
                gap: '16px',
                alignItems: 'center',
                opacity: row.dormant ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Chip
                  palette={VALUE_CLASS_CHIP[row.valueClass]}
                  testId={`govern-rule-value-class-${row.slug}`}
                >
                  {row.valueClass.replace('_', ' ')}
                </Chip>
              </div>
              <div>
                <div style={{
                  fontFamily: AKKI_V4_TYPOGRAPHY.body, fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink,
                  fontWeight: 600,
                }}>
                  {row.name}
                </div>
                <div
                  data-testid={`govern-rule-value-${row.slug}`}
                  style={{ marginTop: '4px', fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}
                >
                  {row.dormant ? (
                    <DormantCapabilityChip label={row.name} note="closed seam" />
                  ) : row.currentValue === null || row.currentValue === undefined ? (
                    <MarkedOpenSlot slotName={`rule_value_${row.slug}`} />
                  ) : (
                    <span>{typeof row.currentValue === 'number' ? `${row.currentValue} days` : String(row.currentValue)}</span>
                  )}
                </div>
                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
                  {row.changeAuthority}
                </div>
              </div>
              <div>
                <Chip
                  palette={ENFORCEMENT_CHIP[row.enforcement]}
                  testId={`govern-rule-enforcement-${row.slug}`}
                >
                  {row.enforcement}
                </Chip>
              </div>
              <div>
                {row.slug.startsWith('retention_') && (
                  <Link
                    to="/govern/retention"
                    data-testid={`govern-rule-action-${row.slug}`}
                    style={{ color: AKKI_V4_PALETTE.oxblood, textDecoration: 'none', fontSize: '0.82rem' }}
                  >
                    Retention →
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Deep-link footer. */}
      <section style={{
        marginTop: '32px',
        display: 'flex',
        gap: '24px',
        borderTop: `1px solid ${AKKI_V4_PALETTE.sage}`,
        paddingTop: '16px',
      }}>
        <Link to="/govern/retention" data-testid="govern-home-link-retention" style={{ color: AKKI_V4_PALETTE.oxblood }}>Retention posture →</Link>
        <Link to="/govern/refusal-health" data-testid="govern-home-link-refusals" style={{ color: AKKI_V4_PALETTE.oxblood }}>Refusal health →</Link>
        <Link to="/govern/pending" data-testid="govern-home-link-pending" style={{ color: AKKI_V4_PALETTE.oxblood }}>Pending queue →</Link>
        <Link to="/govern/change-rule" data-testid="govern-home-link-change-rule" style={{ color: AKKI_V4_PALETTE.oxblood }}>Change a rule →</Link>
      </section>
    </AkkiShell>
  );
}
