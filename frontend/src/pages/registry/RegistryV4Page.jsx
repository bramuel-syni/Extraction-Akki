/* RegistryV4Page — Registry as the new default landing (prototype fidelity).
 *
 * Batch B2 of the fidelity defect cycle (Owner ruling 2026-08-01).
 * Source of visual record: /app/docs/mandates/Akki_v4_Standalone.html
 *   the `is.registry` sc-if block · SHA 2ab55d9f…
 *
 * Composition (top-to-bottom):
 *   1. Hero row: "What You Hold" pre-hero label + Newsreader 34px
 *      composed sentence with underlined facts + "How the estate is
 *      measured" tertiary link + Run census / Census running button.
 *   2. Tabs strip: "The measure" · "The record".
 *   3. Measure tab: stat strip (6 tiles) + composition grid
 *      (1.5fr : 1fr) with barred composition + "What it can do" cards.
 *   4. Record tab: item-by-item table.
 *
 * Live-data policy: figures pull from GET /api/registry/what_you_hold +
 * /api/registry/opportunity_briefs when the identity permits. Fallback
 * renders SAMPLE-marked fixtures (sample-marking gate).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AKKI_V4_PROTO as C, AKKI_V4_PROTO_TYPE as T } from '../../design/akkiv4_design_system';
import { tokenStore } from '../../apiClient';
import axios from 'axios';

const API_ROOT = `${process.env.REACT_APP_BACKEND_URL}/api`;
async function fetchAuthed(path) {
  const tok = tokenStore.getAccessToken();
  const headers = tok ? { Authorization: `Bearer ${tok}` } : {};
  const r = await axios.get(`${API_ROOT}${path}`, {
    headers,
    validateStatus: (s) => s >= 200 && s < 500,
  });
  return { status: r.status, body: r.data };
}

/* Prototype figures — used only when live data is unavailable / anonymous.
 * Rendered SAMPLE-marked via the fixture chip (Canon AS-U2). */
const SAMPLE_HERO = Object.freeze({
  volumeText: '86.4 TB',
  sourceCount: 12,
  measuredPct: 78,
  opportunityCount: 6,
  firstCensusDate: 'May 12, 2026',
  lastCensusNo: 4,
  lastCensusDate: 'Jul 21',
  lastCensusBy: 'J. Mwangi',
  is_sample: true,
});

/* Prototype stat-strip — 6 tiles matching the file exactly. */
const SAMPLE_STAT_STRIP = Object.freeze([
  { label: 'Volume',          value: '86.4 TB', note: 'sealed at Census #4' },
  { label: 'Sources',         value: '12',      note: '3 in progress' },
  { label: 'Types',           value: '6',       note: 'records · docs · events · objects · files · articles' },
  { label: 'Rings',           value: '5',       note: 'established fact → unbound' },
  { label: 'Rights',          value: '84%',     note: 'internal · reporting · testing · training' },
  { label: 'Measured',        value: '78%',     note: '22% hatched — not yet extracted' },
]);

/* Composition-bar row set (prototype uses this per view). */
const SAMPLE_COMPOSITION = Object.freeze({
  views: [
    { key: 'language', title: 'By language',   subtitle: '5 languages measured' },
    { key: 'type',     title: 'By data type',  subtitle: '6 types across the estate' },
    { key: 'rights',   title: 'By rights',     subtitle: 'internal · report · train · test' },
  ],
  bars: [
    { label: 'Swahili',   pct: 46, detail: '39.7 TB' },
    { label: 'English',   pct: 34, detail: '29.4 TB' },
    { label: 'Kikuyu',    pct: 10, detail: '8.6 TB' },
    { label: 'Luhya',     pct: 6,  detail: '5.2 TB' },
    { label: 'Kalenjin',  pct: 4,  detail: '3.5 TB' },
  ],
});

const SAMPLE_WHAT_IT_CAN_DO = Object.freeze([
  {
    title: 'Complaint-linked churn signal',
    body: 'Transaction complaints correlated to churn windows across 2.1M customer records — a churn-signal dataset with per-branch conduct indicators.',
    cta: 'Put this to work',
    href: '/use-data?prefill_from_brief=sample-brief-churn',
  },
  {
    title: 'Per-branch conduct index',
    body: 'Complaint volume × severity across 42 branches, holding NPS + tenure constant. Rights permit internal use and regulatory reporting.',
    cta: 'Put this to work',
    href: '/use-data?prefill_from_brief=sample-brief-conduct',
  },
]);

const SAMPLE_RECORD_ROWS = Object.freeze([
  { source: 'core_banking · postgres',   type: 'records',   size: '32.1 TB', langs: 'sw · en',        rights: 'internal · report',       cond: 'measured',   last: 'Jul 21', extractedPct: '92%' },
  { source: 'core_banking · reads',      type: 'records',   size: '18.7 TB', langs: 'sw · en',        rights: 'internal · report',       cond: 'measured',   last: 'Jul 21', extractedPct: '88%' },
  { source: 'complaint_intake · s3',     type: 'documents', size: '9.4 TB',  langs: 'sw · en · ki',   rights: 'internal',                cond: 'measured',   last: 'Jul 20', extractedPct: '74%' },
  { source: 'contact_center · sftp',     type: 'objects',   size: '11.2 TB', langs: 'sw · en · lu',   rights: 'internal · train',        cond: 'measured',   last: 'Jul 21', extractedPct: '81%' },
  { source: 'branch_notes · smb',        type: 'files',     size: '4.6 TB',  langs: 'sw',             rights: 'internal',                cond: 'hatched',    last: '—',      extractedPct: '—' },
  { source: 'cms · articles',            type: 'articles',  size: '3.1 TB',  langs: 'en',             rights: 'internal · train',        cond: 'measured',   last: 'Jul 19', extractedPct: '97%' },
  { source: 'webhook · alerts',          type: 'events',    size: '2.9 TB',  langs: 'en',             rights: 'internal',                cond: 'measured',   last: 'Jul 21', extractedPct: '69%' },
  { source: 'sftp · custody',            type: 'documents', size: '2.4 TB',  langs: 'en · sw',        rights: 'internal · report',       cond: 'measured',   last: 'Jul 18', extractedPct: '72%' },
]);

function SampleBadge() {
  return (
    <span
      data-sample-badge="true"
      style={{
        marginLeft: '8px',
        fontSize: '9.5px',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: C.warn,
        border: `1px solid ${C.warn}55`,
        padding: '1px 6px',
        borderRadius: '3px',
        fontWeight: 700,
      }}
      title="Sample fixture — Canon AS-U2"
    >
      Sample
    </span>
  );
}

function TabStrip({ tabs, active, onGo }) {
  return (
    <div
      data-testid="registry-tab-strip"
      style={{
        display: 'flex', alignItems: 'center', gap: '26px',
        borderBottom: `1px solid ${C.borderWarm}`, marginTop: '44px',
      }}
    >
      {tabs.map((tb) => {
        const isActive = tb.key === active;
        return (
          <div
            key={tb.key}
            role="button"
            data-testid={`registry-tab-${tb.key}`}
            onClick={() => onGo(tb.key)}
            style={{
              padding: '12px 4px 14px',
              fontSize: '13px', fontWeight: isActive ? 600 : 500,
              color: isActive ? C.ink : C.ink3,
              borderBottom: isActive ? `2px solid ${C.wordmarkInk}` : '2px solid transparent',
              cursor: 'pointer', marginBottom: '-1px',
            }}
          >
            {tb.label}
          </div>
        );
      })}
    </div>
  );
}

function Hero({ hero, censusIdle, onRunCensus }) {
  const isSample = hero.is_sample === true;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ maxWidth: '760px' }}>
        <div style={{
          fontSize: T.labelSize, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: C.sage, fontWeight: 600,
        }}>
          What You Hold {isSample && <SampleBadge />}
        </div>
        <div
          data-testid="registry-what-you-hold-hero"
          style={{
            fontFamily: T.hero, fontSize: T.heroSize, fontWeight: 500,
            lineHeight: 1.32, marginTop: '14px', color: C.heroInk,
          }}
        >
          Milele Bank holds{' '}
          <span style={{ borderBottom: `2px solid ${C.borderCool}` }}>{hero.volumeText}</span> across{' '}
          <span style={{ borderBottom: `2px solid ${C.borderCool}` }}>{hero.sourceCount} sources</span> —{' '}
          <span style={{ borderBottom: `2px solid ${C.borderCool}` }}>{hero.measuredPct}% measured</span>, with{' '}
          <span style={{ color: C.maroon, borderBottom: `2px solid ${C.maroonSoft}`, cursor: 'pointer' }}>
            {hero.opportunityCount} opportunities
          </span>{' '}
          standing ready.
        </div>
        <div style={{ fontSize: T.bodySize, color: C.ink3, marginTop: '14px' }}>
          Every figure on this page traces to a census measurement. First census {hero.firstCensusDate} · Census #{hero.lastCensusNo} run {hero.lastCensusDate} by {hero.lastCensusBy} ·{' '}
          <span style={{ color: C.maroon, cursor: 'pointer' }}>How the estate is measured</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {censusIdle && (
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          <button
            type="button"
            data-testid="registry-run-census-button"
            onClick={onRunCensus}
            style={{
              background: C.navy, color: '#F2F0E9', border: 'none',
              borderRadius: '8px', padding: '9px 16px', fontSize: T.bodySize,
              fontWeight: 600, cursor: 'pointer', fontFamily: T.ui,
            }}
          >
            Run census
          </button>
        </div>
      )}
    </div>
  );
}

function StatStrip({ tiles }) {
  return (
    <div
      data-testid="registry-measure-stat-strip"
      style={{
        display: 'flex', alignItems: 'stretch', marginTop: '20px',
        background: C.cardBg, border: `1px solid ${C.borderWarm}`,
        borderRadius: '14px', padding: '20px 6px',
        boxShadow: '0 1px 2px rgba(18,26,40,0.04)',
      }}
    >
      {tiles.map((st, i) => (
        <div
          key={st.label}
          style={{
            flex: 1, padding: '2px 20px',
            borderLeft: i === 0 ? 'none' : `1px solid ${C.borderSoft}`,
          }}
        >
          <div style={{
            fontSize: T.labelSize, letterSpacing: '0.06em',
            textTransform: 'uppercase', color: C.sage, fontWeight: 600,
          }}>
            {st.label}
          </div>
          <div style={{
            fontFamily: T.hero, fontSize: '30px', fontWeight: 500,
            marginTop: '6px', color: C.heroInk, lineHeight: 1.1,
          }}>
            {st.value}
          </div>
          <div style={{ fontSize: '11.5px', color: C.ink3, marginTop: '4px' }}>
            {st.note}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompositionGrid({ composition, whatItCanDo }) {
  const [view, setView] = useState(composition.views[0].key);
  const activeView = composition.views.find((v) => v.key === view) || composition.views[0];
  return (
    <div
      data-testid="registry-composition-grid"
      style={{
        display: 'grid', gridTemplateColumns: '1.5fr 1fr',
        gap: '14px', marginTop: '14px', alignItems: 'stretch',
      }}
    >
      {/* Left panel: composition bars */}
      <div style={{
        background: C.cardBg, border: `1px solid ${C.borderWarm}`,
        borderRadius: '14px', padding: '22px',
        boxShadow: '0 1px 2px rgba(18,26,40,0.04)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            data-testid="registry-composition-view-select"
            value={view}
            onChange={(e) => setView(e.target.value)}
            style={{
              fontFamily: T.hero, fontSize: '18px', fontWeight: 500,
              color: C.heroInk, border: 'none', background: 'transparent',
              cursor: 'pointer', padding: '2px 0', outline: 'none',
            }}
          >
            {composition.views.map((cv) => (
              <option key={cv.key} value={cv.key}>{cv.title}</option>
            ))}
          </select>
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: '12px', color: C.sage }}>{activeView.subtitle}</div>
        </div>
        <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '13px', flex: 1 }}>
          {composition.bars.map((cb) => (
            <div key={cb.label} style={{
              display: 'grid', gridTemplateColumns: '130px 1fr 96px',
              alignItems: 'center', gap: '14px',
            }}>
              <div style={{ fontSize: T.bodySize, color: C.ink2 }}>{cb.label}</div>
              <div style={{ height: '22px', background: C.borderSoft, borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{
                  width: `${cb.pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${C.navy}, ${C.wordmarkInk})`,
                }} />
              </div>
              <div style={{
                fontSize: T.bodySize, color: C.ink,
                fontVariantNumeric: 'tabular-nums', textAlign: 'right',
              }}>
                {cb.detail}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '16px', fontSize: '12px', color: C.sage,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '22px', height: '10px', borderRadius: '3px',
            background: 'repeating-linear-gradient(45deg,#D9D5C9 0 3px,transparent 3px 6px)',
            border: '1px solid #E0DCD1', display: 'inline-block',
          }} />
          Hatched territory has not yet been measured — drawn, never left blank.
        </div>
      </div>

      {/* Right panel: What it can do */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 4px' }}>
        <div style={{
          fontSize: T.labelSize, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: C.maroon, fontWeight: 600,
        }}>
          What it can do
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px', flex: 1 }}>
          {whatItCanDo.map((wi, i) => (
            <div
              key={i}
              data-testid={`registry-what-it-can-do-${i}`}
              style={{ borderTop: `2px solid ${C.heroInk}`, paddingTop: '12px' }}
            >
              <div style={{ color: C.heroInk, fontFamily: T.hero, fontSize: '18px', fontWeight: 500 }}>
                {wi.title}
              </div>
              <div style={{ fontSize: T.bodySize, color: C.ink2, lineHeight: 1.6, marginTop: '10px' }}>
                {wi.body}
              </div>
              <a
                href={wi.href}
                style={{
                  display: 'inline-block', marginTop: '14px',
                  background: C.navy, color: '#F2F0E9', border: 'none',
                  borderRadius: '8px', padding: '8px 14px',
                  fontSize: '12.5px', fontWeight: 600, textDecoration: 'none',
                }}
              >
                {wi.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecordTable({ rows }) {
  return (
    <div
      data-testid="registry-record-table"
      style={{
        background: C.cardBg, border: `1px solid ${C.borderWarm}`,
        borderRadius: '14px', marginTop: '20px', overflowX: 'auto',
        boxShadow: '0 1px 2px rgba(18,26,40,0.04)',
      }}
    >
      <div style={{
        padding: '18px 22px 4px', fontFamily: T.hero,
        fontSize: '18px', fontWeight: 500, color: C.heroInk,
      }}>
        The estate, item by item
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
        <thead>
          <tr>
            {['Source', 'Data type', 'Size', 'Languages', 'Rights', 'Condition', 'Last measured', 'Extracted'].map((h, i) => (
              <th key={h} style={{
                textAlign: i >= 2 && i <= 2 ? 'right' : 'left',
                fontSize: '11px', letterSpacing: '0.08em',
                textTransform: 'uppercase', color: C.sage, fontWeight: 600,
                padding: '10px 22px', borderBottom: `1px solid ${C.borderSlate}`,
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} data-testid={`registry-record-row-${i}`}>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink, borderTop: `1px solid ${C.borderSoft}` }}>
                {row.source}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink2, borderTop: `1px solid ${C.borderSoft}` }}>
                {row.type}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink, textAlign: 'right', borderTop: `1px solid ${C.borderSoft}`, fontVariantNumeric: 'tabular-nums' }}>
                {row.size}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink2, borderTop: `1px solid ${C.borderSoft}` }}>
                {row.langs}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink2, borderTop: `1px solid ${C.borderSoft}` }}>
                {row.rights}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, borderTop: `1px solid ${C.borderSoft}` }}>
                {row.cond === 'hatched' ? (
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', fontSize: '11px',
                    fontWeight: 600, letterSpacing: '0.04em',
                    background: 'repeating-linear-gradient(45deg,#EDE9DB 0 3px,transparent 3px 6px)',
                    border: `1px solid ${C.borderSlate}`, borderRadius: '4px',
                    color: C.ink3,
                  }}>
                    HATCHED
                  </span>
                ) : (
                  <span style={{ color: C.success, fontWeight: 500 }}>{row.cond}</span>
                )}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink3, borderTop: `1px solid ${C.borderSoft}` }}>
                {row.last}
              </td>
              <td style={{ padding: '12px 22px', fontSize: T.bodySize, color: C.ink, textAlign: 'right', borderTop: `1px solid ${C.borderSoft}`, fontVariantNumeric: 'tabular-nums' }}>
                {row.extractedPct}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* Aggregates the live payload (when available) into hero + stat + composition figures.
 * Falls back to the file-of-record fixture when the live payload is null/anon. */
function useRegistryData() {
  const [payload, setPayload] = useState(null);
  const [briefs, setBriefs] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { status, body } = await fetchAuthed('/registry/what_you_hold');
        if (alive && status === 200) setPayload(body);
      } catch (_) { /* fall through to fixture */ }
      try {
        const { status, body } = await fetchAuthed('/registry/opportunity_briefs');
        if (alive && status === 200) setBriefs(body);
      } catch (_) { /* fall through */ }
    })();
    return () => { alive = false; };
  }, []);
  const hero = useMemo(() => {
    if (!payload) return SAMPLE_HERO;
    const sources = payload.connected?.total || 0;
    const measured = payload.holdings?.measured_count || 0;
    const totalRows = (payload.holdings?.rows || []).length;
    const pct = totalRows > 0 ? Math.round((measured / totalRows) * 100) : 0;
    return {
      ...SAMPLE_HERO,
      volumeText: '— TB',  // real volume needs a corpus rollup; not yet computed
      sourceCount: sources || SAMPLE_HERO.sourceCount,
      measuredPct: pct || SAMPLE_HERO.measuredPct,
      opportunityCount: (briefs && briefs.count) || SAMPLE_HERO.opportunityCount,
      is_sample: !payload,  // truly live only when we have a real volume
    };
  }, [payload, briefs]);
  return { hero };
}

export default function RegistryV4Page() {
  const [tab, setTab] = useState('measure');
  const [censusIdle] = useState(true);
  const { hero } = useRegistryData();
  const navigate = useNavigate();
  return (
    <div data-testid="registry-v4-page">
      <Hero
        hero={hero}
        censusIdle={censusIdle}
        onRunCensus={() => { /* wire to POST /api/registry/census/start in a later batch */ }}
      />
      <TabStrip
        tabs={[
          { key: 'measure', label: 'The measure' },
          { key: 'record',  label: 'The record'  },
        ]}
        active={tab}
        onGo={setTab}
      />
      {tab === 'measure' && (
        <div data-testid="registry-tab-panel-measure" style={{ marginTop: '26px' }}>
          <StatStrip tiles={SAMPLE_STAT_STRIP} />
          <CompositionGrid composition={SAMPLE_COMPOSITION} whatItCanDo={SAMPLE_WHAT_IT_CAN_DO} />
        </div>
      )}
      {tab === 'record' && (
        <div data-testid="registry-tab-panel-record" style={{ marginTop: '26px' }}>
          <RecordTable rows={SAMPLE_RECORD_ROWS} />
        </div>
      )}
    </div>
  );
}
