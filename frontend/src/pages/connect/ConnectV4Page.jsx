/* ConnectV4Page — Connect module (prototype fidelity · Batch B3 · 2026-08-01).
 *
 * Owner ruling: build target = EXACT parity with the file of record's
 * `is.connect` sc-if block. Composition, top-to-bottom:
 *   1. Hero row: pre-hero "CONNECT" label + Newsreader 34px composed
 *      sentence with two states (srcPending vs srcAllConnected) + demo
 *      state toggle + Add source button (visible when canAddSource).
 *   2. Config lock strip (dark navy `#101E30`) — shield SVG icon +
 *      Newsreader title + signature line + View / Hide configuration toggle.
 *   3. Deploy facts panel (togglable) — 2-column deployment facts grid.
 *   4. 3-tile stat strip — Connections · Last sync · Egress.
 *   5. "The record" section — 4-column table (Source · Protocol ·
 *      Cadence · State) with state chip + optional action link.
 *   6. Footer line — Credentials custody line + "Data use rules live in
 *      Govern →" cross-link.
 *
 * Live-data policy: fetches /api/connect/sources when a token is present;
 * anon visitors see the SAMPLE-marked fixture per Canon AS-U2.
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

/* File-of-record fixture. Marked SAMPLE at the top-of-hero badge. */
const SAMPLE_HERO = Object.freeze({
  sources_declared: 14,
  sources_connected: 12,
  sources_awaiting: 2,
  is_sample: true,
});

const SAMPLE_CONFIG_LOCK = Object.freeze({
  title: 'Configuration locked. Awaiting source connections.',
  signature_line: 'Signed by A. Okonkwo (DPO) · Feb 12, 2026 · Deployment: private cloud tenancy · Primary regulator: Central Bank of Kenya',
  facts: [
    { k: 'Deployment', v: 'private cloud tenancy' },
    { k: 'Primary regulator', v: 'Central Bank of Kenya' },
    { k: 'Signed by', v: 'A. Okonkwo (DPO)' },
    { k: 'Signed at', v: 'Feb 12, 2026' },
    { k: 'Data residency', v: 'Kenya' },
    { k: 'Encryption at rest', v: 'AES-256 · vault-managed keys' },
    { k: 'Encryption in transit', v: 'TLS 1.3 · mutual auth' },
    { k: 'Custody', v: 'Milele vault · no export' },
  ],
});

const SAMPLE_STATS = Object.freeze({
  connections_healthy: 12,
  last_sync: '14 min ago',
  egress_state: 'None',
});

const SAMPLE_CONN_ROWS = Object.freeze([
  { name: 'core_banking · postgres',   protocol: 'jdbc/postgres · read-only',   cadence: 'streaming · CDC',         state: 'connected', state_class: 'ok' },
  { name: 'core_banking · reads',      protocol: 'jdbc/postgres · replica',      cadence: 'polling · 5 min',         state: 'connected', state_class: 'ok' },
  { name: 'complaint_intake · s3',     protocol: 's3 · signed URL',              cadence: 'polling · 15 min',        state: 'connected', state_class: 'ok' },
  { name: 'contact_center · sftp',     protocol: 'sftp · key-based',             cadence: 'polling · 1 hr',          state: 'connected', state_class: 'ok' },
  { name: 'branch_notes · smb',        protocol: 'smb 3.1 · service account',    cadence: 'polling · 30 min',        state: 'connecting', state_class: 'wait', action: 'Verify credentials' },
  { name: 'cms · articles',            protocol: 'https · webhook',              cadence: 'push · signed events',    state: 'connected', state_class: 'ok' },
  { name: 'webhook · alerts',          protocol: 'https · webhook',              cadence: 'push · signed events',    state: 'connected', state_class: 'ok' },
  { name: 'sftp · custody',            protocol: 'sftp · key-based',             cadence: 'polling · 1 hr',          state: 'awaiting', state_class: 'warn', action: 'Provide vault access' },
]);

function stateChipStyle(cls) {
  if (cls === 'ok') return { background: '#E9EDDC', color: '#5A6B2F' };
  if (cls === 'wait') return { background: '#F1E8D2', color: '#8A6A38' };
  if (cls === 'warn') return { background: '#F4E1DF', color: '#8C3A34' };
  return { background: '#EDEBE0', color: C.ink3 };
}

function SampleBadge() {
  return (
    <span
      data-sample-badge="true"
      style={{
        marginLeft: '8px', fontSize: '9.5px', letterSpacing: '0.14em',
        textTransform: 'uppercase', color: C.warn,
        border: `1px solid ${C.warn}55`, padding: '1px 6px',
        borderRadius: '3px', fontWeight: 700,
      }}
      title="Sample fixture — Canon AS-U2"
    >
      Sample
    </span>
  );
}

function Hero({ hero, onToggleState }) {
  const allConnected = hero.sources_awaiting === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ maxWidth: '760px' }}>
        <div style={{
          fontSize: T.labelSize, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: C.sage, fontWeight: 600,
        }}>
          Connect {hero.is_sample && <SampleBadge />}
        </div>
        {!allConnected ? (
          <div
            data-testid="connect-hero-src-pending"
            style={{
              fontFamily: T.hero, fontSize: T.heroSize, fontWeight: 500,
              lineHeight: 1.32, marginTop: '14px', color: C.heroInk,
            }}
          >
            <span style={{ borderBottom: `2px solid ${C.borderCool}` }}>{hero.sources_declared} sources</span> declared —{' '}
            <span style={{ borderBottom: `2px solid ${C.borderCool}` }}>{hero.sources_connected} connected</span> and verified,{' '}
            <span style={{ color: '#8A6A38', borderBottom: '2px solid #EADDC8' }}>{hero.sources_awaiting} awaiting</span> connection.
          </div>
        ) : (
          <div
            data-testid="connect-hero-src-all-connected"
            style={{
              fontFamily: T.hero, fontSize: T.heroSize, fontWeight: 500,
              lineHeight: 1.32, marginTop: '14px', color: C.heroInk,
            }}
          >
            All <span style={{ borderBottom: `2px solid ${C.borderCool}` }}>{hero.sources_declared} sources</span> connected and healthy.
          </div>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginTop: '6px' }}>
        <div
          data-testid="connect-hero-demo-toggle"
          onClick={onToggleState}
          style={{ fontSize: '11.5px', color: C.ink5, cursor: 'pointer', whiteSpace: 'nowrap' }}
          title="Toggle SAMPLE state for demo"
        >
          Demo: toggle state
        </div>
      </div>
    </div>
  );
}

function ConfigLockStrip({ lock, open, onToggle }) {
  return (
    <>
      <div style={{
        background: C.darkUi, borderRadius: '14px', padding: '24px 28px',
        display: 'flex', alignItems: 'center', gap: '20px', marginTop: '32px',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#CBB88C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9.5 12l2 2 3.5-4" />
        </svg>
        <div>
          <div style={{ color: '#F2F0E9', fontFamily: T.hero, fontSize: '21px', fontWeight: 500 }}>
            {lock.title}
          </div>
          <div style={{ color: '#96A5BC', fontSize: T.bodySize, marginTop: '4px' }}>
            {lock.signature_line}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div
          data-testid="connect-config-lock-toggle"
          onClick={onToggle}
          style={{ color: '#CBB88C', fontSize: T.bodySize, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          {open ? 'Hide locked configuration' : 'View locked configuration'}
        </div>
      </div>
      {open && (
        <div
          data-testid="connect-config-lock-facts"
          style={{
            background: C.cardBg, border: `1px solid ${C.borderWarm}`,
            borderRadius: '12px', padding: '20px 24px', marginTop: '14px',
            boxShadow: '0 1px 2px rgba(18,26,40,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              fontSize: T.labelSize, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: C.sage, fontWeight: 600,
            }}>
              Locked at deployment · Feb 12, 2026
            </div>
            <div style={{ flex: 1 }} />
            <div onClick={onToggle} style={{ fontSize: '11.5px', color: C.ink5, cursor: 'pointer' }}>Hide</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginTop: '6px' }}>
            {lock.facts.map((df, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 0', borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ fontSize: T.bodySize, color: C.sage, flex: 1 }}>{df.k}</div>
                <div style={{ fontSize: T.bodySize, color: C.ink }}>{df.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StatTile3({ label, value, note, noteColor }) {
  return (
    <div style={{
      background: C.cardBg, border: `1px solid ${C.borderWarm}`,
      borderRadius: '12px', padding: '20px 22px',
      boxShadow: '0 1px 2px rgba(18,26,40,0.04)',
    }}>
      <div style={{
        fontSize: T.labelSize, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: C.sage, fontWeight: 600,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: T.hero, fontSize: '30px', fontWeight: 500,
        color: C.heroInk, marginTop: '8px', lineHeight: 1.1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: noteColor || C.ink3, marginTop: '5px', fontWeight: noteColor === '#4E5C2E' ? 600 : 400 }}>
        {note}
      </div>
    </div>
  );
}

function TheRecord({ rows, onGovern }) {
  return (
    <div style={{ marginTop: '44px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{
          fontSize: T.labelSize, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: C.sage, fontWeight: 600, whiteSpace: 'nowrap',
        }}>
          The record
        </div>
        <div style={{ flex: 1, height: '1px', background: C.borderWarm }} />
      </div>
      <div
        data-testid="connect-record-table"
        style={{
          background: C.cardBg, border: `1px solid ${C.borderWarm}`,
          borderRadius: '12px', boxShadow: '0 1px 2px rgba(18,26,40,0.04)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Source', 'Protocol', 'Cadence', 'State'].map((h, i) => (
                <th key={h} style={{
                  textAlign: 'left', fontSize: '11px', letterSpacing: '0.08em',
                  textTransform: 'uppercase', color: C.sage, fontWeight: 600,
                  padding: i === 0 || i === 3 ? '12px 22px' : '12px',
                  borderBottom: `1px solid ${C.borderSlate}`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cs, i) => (
              <tr key={i} data-testid={`connect-record-row-${i}`}>
                <td style={{ padding: '14px 22px', fontSize: '13.5px', fontWeight: 500, borderBottom: `1px solid ${C.borderSoft}`, color: C.ink }}>
                  {cs.name}
                </td>
                <td style={{ padding: '14px 12px', fontFamily: T.mono, fontSize: '12px', color: C.ink2, borderBottom: `1px solid ${C.borderSoft}` }}>
                  {cs.protocol}
                </td>
                <td style={{ padding: '14px 12px', fontSize: T.bodySize, color: C.ink2, borderBottom: `1px solid ${C.borderSoft}` }}>
                  {cs.cadence}
                </td>
                <td style={{ padding: '14px 22px', borderBottom: `1px solid ${C.borderSoft}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      ...stateChipStyle(cs.state_class),
                      fontSize: '11.5px', fontWeight: 600,
                      padding: '3px 10px', borderRadius: '999px',
                    }}>
                      {cs.state}
                    </span>
                    {cs.action && (
                      <span style={{ fontSize: '12.5px', color: C.navy, fontWeight: 600, cursor: 'pointer' }}>
                        {cs.action}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
        <div style={{ fontSize: '12px', color: C.sage }}>
          Credentials held in Milele's vault · connections signed off by D. Kimani
        </div>
        <div style={{ flex: 1 }} />
        <div
          data-testid="connect-record-cross-link-govern"
          onClick={onGovern}
          style={{ fontSize: '12.5px', color: C.maroon, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Data use rules live in Govern →
        </div>
      </div>
    </div>
  );
}

/* Live-data fetcher — falls through to fixture on 401/anon/missing. */
function useConnectData() {
  const [live, setLive] = useState(null);
  useEffect(() => {
    if (!tokenStore.getAccessToken()) return () => {};
    let alive = true;
    (async () => {
      try {
        const { status, body } = await fetchAuthed('/connect/sources');
        if (alive && status === 200) setLive(body);
      } catch (_) { /* fall through */ }
    })();
    return () => { alive = false; };
  }, []);
  const hero = useMemo(() => {
    if (!live || !Array.isArray(live.rows)) return SAMPLE_HERO;
    const declared = live.rows.length;
    const connected = live.rows.filter((r) => (r.state === 'connected' || r.state === 'ok')).length;
    const awaiting = declared - connected;
    return { ...SAMPLE_HERO, sources_declared: declared, sources_connected: connected, sources_awaiting: awaiting, is_sample: false };
  }, [live]);
  const rows = useMemo(() => {
    if (!live || !Array.isArray(live.rows)) return SAMPLE_CONN_ROWS;
    return live.rows;
  }, [live]);
  return { hero, rows };
}

export default function ConnectV4Page() {
  const navigate = useNavigate();
  const { hero: liveHero, rows: liveRows } = useConnectData();
  const [demoAllConnected, setDemoAllConnected] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const hero = demoAllConnected
    ? { ...liveHero, sources_connected: liveHero.sources_declared, sources_awaiting: 0 }
    : liveHero;
  const rows = liveRows;
  return (
    <div data-testid="connect-v4-page">
      <Hero hero={hero} onToggleState={() => setDemoAllConnected((v) => !v)} />
      <ConfigLockStrip
        lock={SAMPLE_CONFIG_LOCK}
        open={configOpen}
        onToggle={() => setConfigOpen((v) => !v)}
      />
      <div
        data-testid="connect-stat-strip"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginTop: '14px' }}
      >
        <StatTile3 label="Connections" value={SAMPLE_STATS.connections_healthy} note="healthy" noteColor="#4E5C2E" />
        <StatTile3 label="Last sync" value={SAMPLE_STATS.last_sync} note="across all polling sources" />
        <StatTile3 label="Egress" value={SAMPLE_STATS.egress_state} note="compute-to-data" />
      </div>
      <TheRecord rows={rows} onGovern={() => navigate('/govern')} />
    </div>
  );
}
