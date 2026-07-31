import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell, DormantCapabilityChip } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';
import { REFUSAL_ACTION_TRIPLET } from '../../design/ratified_copy';

/* Govern · Refusal Health & Coverage — FB-10 gap filing flywheel.
 * Reads GET /api/compliance/refusals_coverage + GET /api/compliance/refusals.
 * Every refusal family carries an action link to /operator/commission
 * (the wizard door · FB-15 same routing rule as Estate Map coverage-gap).
 */
function currentMonthISO() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default function GovernRefusalHealthPage() {
  const [coverage, setCoverage] = useState(null);
  const [month, setMonth] = useState(currentMonthISO());
  const [refusals, setRefusals] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.complianceRefusalsCoverage();
      if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
      if (r.status >= 500) { setFault({ status: r.status, body: r.body }); return; }
      setCoverage(r.body);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const r = await api.complianceRefusalsByMonth(month);
      if (r.status >= 500) { setFault({ status: r.status, body: r.body }); return; }
      if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
      setRefusals(r.body);
    })();
  }, [month]);

  const perFamilySince = useMemo(
    () => (coverage && coverage.per_family_since_date) || {},
    [coverage],
  );
  const seam3Earliest = coverage && coverage.seam_3_earliest_date;
  const familiesSinceSystem = (coverage && coverage.families_since_system_start) || [];
  const familiesSinceSeam3 = (coverage && coverage.families_since_seam_3) || [];

  const familyCards = useMemo(() => {
    // Union all families that appear in coverage OR refusals-by-month.
    const set = new Set([
      ...familiesSinceSystem,
      ...familiesSinceSeam3,
      ...Object.keys((refusals && refusals.families) || {}),
    ]);
    return Array.from(set).sort();
  }, [familiesSinceSystem, familiesSinceSeam3, refusals]);

  if (deny) {
    return (
      <AkkiShell title="Govern · Refusal health" subtitle="Coverage · families · paths forward">
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Govern · Refusal health" subtitle="Coverage · families · paths forward">
        <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." />
      </AkkiShell>
    );
  }

  return (
    <AkkiShell
      title="Govern · Refusal health"
      subtitle="Coverage · families · paths forward"
      right={<Link to="/govern" style={{ color: AKKI_V4_PALETTE.oxblood, fontFamily: AKKI_V4_TYPOGRAPHY.labels }}>← Govern estate</Link>}
    >
      {/* Coverage marker */}
      <section
        data-testid="govern-refusal-coverage-section"
        style={{
          padding: '14px 18px',
          background: AKKI_V4_PALETTE.mist,
          border: `1px solid ${AKKI_V4_PALETTE.sage}`,
          marginBottom: '20px',
        }}
      >
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', color: AKKI_V4_PALETTE.smoke,
          textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>Coverage marker</div>
        <div style={{ marginTop: '6px', fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.ink }}>
          {familiesSinceSystem.length === 0 && familiesSinceSeam3.length === 0 ? (
            <span data-testid="govern-refusal-coverage-empty">
              {coverage && coverage.honest_note_when_no_families_covered
                ? coverage.honest_note_when_no_families_covered
                : 'No refusal families with a wire-up-pinned timestamp yet.'}
            </span>
          ) : (
            <>
              <span data-testid="govern-refusal-coverage-since-system">
                Counts {familiesSinceSystem.length} since system start
              </span>
              {' · '}
              <span data-testid="govern-refusal-coverage-since-seam3">
                {familiesSinceSeam3.length} since {seam3Earliest || '—'}
              </span>
            </>
          )}
        </div>
      </section>

      {/* Month picker + refusal totals */}
      <section data-testid="govern-refusal-month-section" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', color: AKKI_V4_PALETTE.smoke }}>
            Month
            <input
              data-testid="govern-refusal-month-picker"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{ padding: '6px 10px' }}
            />
          </label>
        </div>
        {refusals && refusals.families && Object.keys(refusals.families).length === 0 ? (
          <div data-testid="govern-refusal-month-empty" style={{
            padding: '10px 14px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.smoke, fontSize: '0.85rem',
          }}>
            No refusal rows in {month}.
          </div>
        ) : null}
      </section>

      {/* Family drill-down cards */}
      <section data-testid="govern-refusal-families-section">
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>
          Refusal families
        </h2>
        {familyCards.length === 0 ? (
          <div data-testid="govern-refusal-families-empty" style={{
            padding: '10px 14px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.smoke, fontSize: '0.85rem',
          }}>
            No refusal families surfaced yet — honest empty state.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {familyCards.map((family) => {
              const count = (refusals && refusals.families && refusals.families[family]) || 0;
              const since = perFamilySince[family];
              return (
                <article
                  key={family}
                  data-testid={`govern-refusal-family-${family}`}
                  style={{
                    padding: '14px 18px',
                    background: AKKI_V4_PALETTE.mist,
                    border: `1px solid ${AKKI_V4_PALETTE.sage}`,
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.body, color: AKKI_V4_PALETTE.ink, fontWeight: 600 }}>
                      {family}
                    </span>
                    <span data-testid={`govern-refusal-family-count-${family}`} style={{ fontSize: '0.82rem', color: AKKI_V4_PALETTE.smoke }}>
                      {count} refusal{count === 1 ? '' : 's'} · {month}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: AKKI_V4_PALETTE.smoke }}>
                      {since ? `since ${since}` : <MarkedOpenSlot slotName={`family_since_${family}`} />}
                    </span>
                  </div>
                  <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: AKKI_V4_PALETTE.smoke }}>
                    <MarkedOpenSlot slotName={`family_plain_language_${family}`} note="A5-1 copy pending" />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{
                      fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', textTransform: 'uppercase',
                      letterSpacing: '0.12em', color: AKKI_V4_PALETTE.smoke, marginBottom: '6px',
                    }}>Paths forward (ratified)</div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}>
                      {REFUSAL_ACTION_TRIPLET.map((action, i) => (
                        <li key={i} data-testid={`govern-refusal-family-${family}-path-${i}`}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    to="/operator/commission"
                    data-testid={`govern-refusal-family-${family}-file-gap`}
                    style={{ color: AKKI_V4_PALETTE.oxblood, textDecoration: 'none', fontSize: '0.85rem' }}
                  >
                    File as extraction candidate →
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Dormant closed seams (four designed states discipline) */}
      <section style={{ marginTop: '32px' }}>
        <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem', color: AKKI_V4_PALETTE.smoke, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Closed seams
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <DormantCapabilityChip label="cumulative_disclosure_thresholds" note="closed seam" />
          <DormantCapabilityChip label="v3_overlay" note="closed seam" />
        </div>
      </section>
    </AkkiShell>
  );
}
