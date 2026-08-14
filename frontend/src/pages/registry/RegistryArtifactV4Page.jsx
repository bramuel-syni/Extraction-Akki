/* RegistryArtifactV4Page — Registry artifact detail (B2.b · 2026-08-01).
 *
 * Prototype fidelity for the `is.artifact` sc-if block of the file of
 * record. Rendered at /registry/artifact/:artifactId (breadcrumb-nav
 * from RegistryV4Page's item-by-item table in later polish).
 *
 * Composition (top-to-bottom):
 *   1. Back link "← Everything delivered"
 *   2. Title row: Newsreader 28px title + LIVE chip + subtitle line +
 *      Export + Integrate buttons on the right
 *   3. 6-tile stat strip (Records · Size · Fields mapped · Quality ·
 *      Rights · Times reused)
 *   4. 2-column grid: Lineage card + Quality card
 *
 * Live-data policy: no live API for artifact detail exists yet; SAMPLE
 * fixture rendered with data-sample-badge="true" (Canon AS-U2). When the
 * mtafiti/registry seam exposes artifact detail, this page swaps in.
 */
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AKKI_V4_PROTO as C, AKKI_V4_PROTO_TYPE as T } from '../../design/akkiv4_design_system';

const SAMPLE_ARTIFACT = Object.freeze({
  artifact_id: 'ART-0209',
  title: 'Q2 Complaints Dataset',
  state_label: 'Live',
  origin_ref: 'OBJ-038',
  origin_label: 'OBJ-038 · Conduct-risk indicators',
  created_iso: '2026-07-02',
  reused_count: 3,
  stats: [
    { label: 'Records',       value: '186,240' },
    { label: 'Size',          value: '2.8 GB'  },
    { label: 'Fields mapped', value: '38'      },
    { label: 'Quality',       value: '98.1%'   },
    { label: 'Rights',        value: 'Internal' },
    { label: 'Times reused',  value: '3'       },
  ],
  lineage: [
    { k: 'From objective',      v: 'OBJ-038 · Conduct-risk indicators →', link: true },
    { k: 'Method',              v: 'Commissioned extraction, verified against source' },
    { k: 'Evidence standard',   v: 'Every fact verified · corroborated floor' },
    { k: 'Privacy attestation', v: 'All groups ≥ 20 ✓ · re-verified per release' },
    { k: 'Ledger',              v: 'ART-0209 · replayable end to end', mono: true },
  ],
  quality: [
    { k: 'Correctness (field accuracy)',   v: '98.1%' },
    { k: 'Loss (rows dropped)',            v: '0.2%'  },
    { k: 'Precision (over-application)',   v: '0.9%'  },
    { k: 'Reproducibility (seed replay)',  v: '100%'  },
    { k: 'Corroboration (multi-source)',   v: '76%'   },
  ],
  is_sample: true,
});

function StatTile({ label, value }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.borderWarm}`,
      borderRadius: '12px', padding: '15px',
    }}>
      <div style={{
        fontSize: T.labelSize, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: C.sage, fontWeight: 600,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: T.hero, fontSize: '23px', marginTop: '6px', color: C.heroInk,
      }}>
        {value}
      </div>
    </div>
  );
}

function KVCard({ title, rows, leftCol = '130px' }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.borderWarm}`,
      borderRadius: '12px', padding: '22px',
    }}>
      <div style={{ fontFamily: T.hero, fontSize: '18px', fontWeight: 500, color: C.heroInk }}>
        {title}
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: `${leftCol} 1fr`,
        gap: '8px 14px', marginTop: '12px', fontSize: T.bodySize,
      }}>
        {rows.map((r, i) => (
          <React.Fragment key={i}>
            <span style={{ color: C.sage }}>{r.k}</span>
            <span style={{
              color: r.mono ? C.maroon : C.ink2,
              fontFamily: r.mono ? T.mono : T.ui,
              fontSize: r.mono ? '11.5px' : T.bodySize,
              fontWeight: r.link ? 500 : 400,
              textAlign: r.k?.includes('%') ? 'right' : 'left',
            }}>
              {r.v}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default function RegistryArtifactV4Page() {
  const { artifactId } = useParams();
  const navigate = useNavigate();
  const artifact = SAMPLE_ARTIFACT; // TODO: fetch by artifactId when the seam exposes detail

  return (
    <div data-testid="registry-artifact-v4-page">
      <div
        data-testid="registry-artifact-back"
        onClick={() => navigate('/registry')}
        style={{ fontSize: T.bodySize, color: C.ink3, cursor: 'pointer', marginBottom: '12px' }}
      >
        ← Everything delivered
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              data-testid="registry-artifact-title"
              style={{ fontFamily: T.hero, fontSize: '28px', fontWeight: 500, color: C.heroInk }}
            >
              {artifact.title}
            </span>
            <span style={{
              fontSize: '11.5px', fontWeight: 600,
              background: '#E9EDDC', color: '#5A6B2F',
              borderRadius: '999px', padding: '3px 10px',
            }}>
              {artifact.state_label}
            </span>
            {artifact.is_sample && (
              <span
                data-sample-badge="true"
                style={{
                  fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: C.warn, border: `1px solid ${C.warn}55`,
                  padding: '1px 6px', borderRadius: '3px', fontWeight: 700,
                }}
              >
                Sample
              </span>
            )}
          </div>
          <div style={{ fontSize: T.bodySize, color: C.ink3, marginTop: '5px' }}>
            Dataset · from <span style={{ fontFamily: T.mono, fontSize: '12px', color: C.maroon }}>{artifact.origin_ref}</span>{' '}
            · created {artifact.created_iso} · reused {artifact.reused_count} times
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          disabled
          title="Export drawer arrives with B7 Prove batch"
          style={{
            background: C.cardBg, color: C.navy, border: `1px solid ${C.borderCool}`,
            borderRadius: '8px', padding: '9px 16px', fontSize: T.bodySize,
            fontWeight: 600, cursor: 'not-allowed', marginRight: '9px', opacity: 0.85,
            fontFamily: T.ui,
          }}
        >
          Export
        </button>
        <button
          type="button"
          disabled
          title="Integrate drawer arrives with B4 Use Data batch"
          style={{
            background: C.navy, color: '#F2F0E9', border: 'none',
            borderRadius: '8px', padding: '9px 16px', fontSize: T.bodySize,
            fontWeight: 600, cursor: 'not-allowed', opacity: 0.85,
            fontFamily: T.ui,
          }}
        >
          Integrate
        </button>
      </div>

      <div
        data-testid="registry-artifact-stat-strip"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', marginTop: '20px' }}
      >
        {artifact.stats.map((st) => <StatTile key={st.label} label={st.label} value={st.value} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
        <KVCard title="Lineage" rows={artifact.lineage} />
        <KVCard title="Quality card" rows={artifact.quality} />
      </div>
    </div>
  );
}
