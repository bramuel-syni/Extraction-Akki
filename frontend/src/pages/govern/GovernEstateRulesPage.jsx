/* UI-1-B · Estate Rules Record (Canon §7.3).
 *
 * Four classes S/O/E/D:
 *   S · Rails             — Owner ruling only · read-only
 *   O · Rules             — Change-a-Rule ceremony only (Canon §7.5)
 *   E · Engine settings   — dormant until backend seam · E→O promotion honest
 *   D · Registries        — Class-D governed writers · §7.4
 *
 * Each row: name · value · 30-day enforcement counts · 30-day violations ·
 * change authority · enforcement class.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel } from '../../design/ResponseClassPanel';

const CLASS_COPY = {
  S: {
    label: 'S · Rails',
    tagline: 'Rails are read-only. Owner ruling only.',
    color: 'navy',
  },
  O: {
    label: 'O · Rules',
    tagline: 'Rules change via Change-a-Rule (Canon §7.5).',
    color: 'amber',
  },
  E: {
    label: 'E · Engine settings',
    tagline: 'E→O promotion available when the seam is built.',
    color: 'sage',
  },
  D: {
    label: 'D · Registries',
    tagline: 'Class-D governed writers · additions immediate · removals+edits via Change-a-Rule.',
    color: 'oxblood',
  },
};

function RuleTable({ rows, classKey }) {
  const info = CLASS_COPY[classKey];
  return (
    <section
      data-testid={`estate-rules-class-${classKey}`}
      style={{
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '18px 22px',
        marginBottom: '18px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <h3
        data-testid={`estate-rules-class-${classKey}-heading`}
        style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.15rem', margin: '0 0 6px 0', color: AKKI_V4_PALETTE.ink }}
      >
        {info.label}
      </h3>
      <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, margin: '0 0 12px 0' }}>{info.tagline}</p>
      {(rows || []).length === 0 ? (
        <div data-testid={`estate-rules-class-${classKey}-empty`} style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}>
          — no rules of this class yet —
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: AKKI_V4_PALETTE.mist }}>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Value</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Enforcement</th>
              <th style={{ textAlign: 'right', padding: '6px 8px' }}>Checks 30d</th>
              <th style={{ textAlign: 'right', padding: '6px 8px' }}>Violations 30d</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Change authority</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} data-testid={`estate-rules-row-${r.slug}`} style={{ borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}` }}>
                <td style={{ padding: '6px 8px', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.8rem' }}>
                  {r.name}
                </td>
                <td style={{ padding: '6px 8px', color: AKKI_V4_PALETTE.sage }}>
                  {r.value ?? (r.seam_state ? `— ${r.seam_state}` : '—')}
                </td>
                <td style={{ padding: '6px 8px' }}>{r.enforcement_class}</td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>
                  {r.enforcement_count_30d ?? 0}
                </td>
                <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, color: r.violation_count_30d ? AKKI_V4_PALETTE.oxblood : AKKI_V4_PALETTE.sage }}>
                  {r.violation_count_30d ?? 0}
                </td>
                <td style={{ padding: '6px 8px', fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage }}>
                  {r.read_only ? (
                    <span data-testid={`estate-rules-row-readonly-${r.slug}`}>{r.change_authority}</span>
                  ) : classKey === 'E' && r.promotion_seam_state === 'dormant' ? (
                    <span data-testid={`estate-rules-row-e-dormant-${r.slug}`}>
                      {r.change_authority}
                    </span>
                  ) : (
                    r.change_authority
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default function GovernEstateRulesPage() {
  const [rules, setRules] = useState(null);
  const [deny, setDeny] = useState(null);
  useEffect(() => {
    (async () => {
      const r = await api.governEstateRulesRecord();
      if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
      if (r.status === 200) setRules(r.body);
    })();
  }, []);
  if (deny) return (
    <AkkiShell title="Estate Rules Record · Govern">
      <AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} />
    </AkkiShell>
  );
  return (
    <AkkiShell title="Estate Rules Record · Govern" subtitle="Canon §7.3 · four classes S · O · E · D.">
      <p style={{ marginBottom: '18px' }}>
        <Link to="/govern" data-testid="estate-rules-back-link" style={{ color: AKKI_V4_PALETTE.navy }}>
          ← Trust Center
        </Link>
      </p>
      <RuleTable rows={rules?.S_rails || []} classKey="S" />
      <RuleTable rows={rules?.O_rules || []} classKey="O" />
      <RuleTable rows={rules?.E_engine_settings || []} classKey="E" />
      <RuleTable rows={rules?.D_registries || []} classKey="D" />
    </AkkiShell>
  );
}
