import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell, DormantCapabilityChip } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';

/* Registry Dashboard · day-zero surface (Estate Map view).
 *
 * Owner sub-cycle-2 directive verbatim:
 *   "the estate map view over Mtafiti census/registry data: measured vs
 *    unmeasured as first-class visual states (unmeasured hatched/drawn
 *    per the four designed states, never zero), figures carry their
 *    method, coverage gaps paired with action. Wire to existing
 *    /api/mtafiti/* + registry endpoints; declaration-baseline-only
 *    state rendered honestly (inference overlay is a closed seam —
 *    show it dormant, never fake numbers)."
 */
function MethodChip({ method }) {
  const map = {
    declaration_baseline: { bg: AKKI_V4_PALETTE.mist, fg: AKKI_V4_PALETTE.navy, border: `1px solid ${AKKI_V4_PALETTE.navy}` },
    measured_census:      { bg: '#e6f0e5', fg: '#2f6b3e', border: '1px solid #2f6b3e' },
    inference_overlay:    { bg: `repeating-linear-gradient(45deg, ${AKKI_V4_PALETTE.mist}, ${AKKI_V4_PALETTE.mist} 4px, ${AKKI_V4_PALETTE.cream} 4px, ${AKKI_V4_PALETTE.cream} 8px)`, fg: AKKI_V4_PALETTE.sage, border: `1px dashed ${AKKI_V4_PALETTE.sage}` },
  };
  const s = map[method] || map.declaration_baseline;
  return (
    <span data-testid={`method-chip-${method}`} style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '10px',
      fontSize: '0.7rem', fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      background: s.bg, color: s.fg, border: s.border, marginLeft: '6px',
    }}>method · {method.replace(/_/g, ' ')}</span>
  );
}

function DimensionRow({ item, kind }) {
  const measured = false; // day-zero: no measured-census yet.
  const gap = !measured;  // Coverage gap when declaration_baseline is the only method.
  return (
    <li
      data-testid={`registry-dimension-row-${kind}-${item.slug}`}
      style={{
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '12px 16px', marginBottom: '10px',
        display: 'grid',
        gridTemplateColumns: '3fr 2fr 2fr 2fr',
        gap: '10px', alignItems: 'center',
      }}
    >
      <div>
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink,
        }} data-testid={`registry-dim-label-${item.slug}`}>{item.label}</div>
        <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}>
          slug · {item.slug}
        </div>
      </div>
      <div data-testid={`registry-dim-figure-${item.slug}`}>
        {/* Figures render as measured or hatched, never zero. */}
        {measured ? (
          <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>—</span>
        ) : (
          <MarkedOpenSlot slotName={`figure_${item.slug}`} note="Unmeasured · declaration-baseline only. Coverage gap." />
        )}
        <MethodChip method="declaration_baseline" />
      </div>
      <div data-testid={`registry-dim-inference-${item.slug}`}>
        <DormantCapabilityChip label="inference_overlay" note="Inference overlay is a closed seam · never fake numbers." />
      </div>
      <div>
        {gap && (
          <Link
            data-testid={`registry-dim-action-${item.slug}`}
            to={`/operator/commission`}
            style={{
              display: 'inline-block',
              padding: '6px 10px',
              border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
              color: AKKI_V4_PALETTE.oxblood,
              fontSize: '0.8rem',
              textDecoration: 'none',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            }}
            title="Propose a census run for this dimension"
          >Propose census →</Link>
        )}
      </div>
    </li>
  );
}

export default function RegistryEstateMapPage() {
  const [surfaces, setSurfaces] = useState(null);
  const [genres, setGenres] = useState(null);
  const [note, setNote] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await api.registryReadDimension('content_surfaces');
      if (s.status === 200) setSurfaces(s.body);
      else if (s.status === 404) setNote('registry: content_surfaces vocabulary not yet declared');
      const g = await api.registryReadDimension('genres');
      if (g.status === 200) setGenres(g.body);
    })();
  }, []);

  return (
    <AkkiShell
      title="Registry · Estate Map"
      subtitle="Day-zero surface · declaration-baseline only · inference overlay dormant"
    >
      <section style={{
        background: AKKI_V4_PALETTE.mist,
        border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
        padding: '14px 18px', marginBottom: '20px',
      }} data-testid="registry-posture-banner">
        <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.05rem', color: AKKI_V4_PALETTE.ink }}>
          Posture · declaration-baseline
        </div>
        <div style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage, marginTop: '6px' }}>
          Dimensions rendered here reflect the DECLARATION baseline · what the estate
          asserts. Measured-census + inference overlay both dormant this cycle;
          each dimension pairs with a "Propose census →" action.
        </div>
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage }}>
          States rendered: <MethodChip method="declaration_baseline" /> <MethodChip method="measured_census" /> <MethodChip method="inference_overlay" />
        </div>
      </section>

      <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink, marginBottom: '10px' }}>
        Content surfaces
      </h2>
      <ul data-testid="registry-surfaces-list" style={{ padding: 0, listStyle: 'none' }}>
        {(surfaces?.items || []).map((s) => (
          <DimensionRow key={s.slug} item={s} kind="surfaces" />
        ))}
        {(!surfaces || (surfaces.items || []).length === 0) && (
          <li data-testid="registry-surfaces-empty" style={{ fontStyle: 'italic', color: AKKI_V4_PALETTE.sage, padding: '10px 16px' }}>
            No content_surfaces declared yet. Coverage gap · propose declaration via governor.
          </li>
        )}
      </ul>

      <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink, marginTop: '24px', marginBottom: '10px' }}>
        Genres
      </h2>
      <ul data-testid="registry-genres-list" style={{ padding: 0, listStyle: 'none' }}>
        {(genres?.items || []).map((g) => (
          <DimensionRow key={g.slug} item={g} kind="genres" />
        ))}
        {(!genres || (genres.items || []).length === 0) && (
          <li data-testid="registry-genres-empty" style={{ fontStyle: 'italic', color: AKKI_V4_PALETTE.sage, padding: '10px 16px' }}>
            No genres declared yet. Coverage gap · propose declaration via governor.
          </li>
        )}
      </ul>

      {note && (
        <div data-testid="registry-note" style={{
          marginTop: '20px', padding: '10px 14px',
          border: `1px dashed ${AKKI_V4_PALETTE.amber}`,
          color: AKKI_V4_PALETTE.amber, fontSize: '0.85rem',
        }}>{note}</div>
      )}
    </AkkiShell>
  );
}
