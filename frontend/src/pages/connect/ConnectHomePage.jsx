/* UI-1-C · Connect Home · Canon §4.1 five-section landing.
 *
 * ONE PAGE, NO TABS. Section order (unchangeable):
 *   1. Two-state HEADLINE (same slot, layout invariant)
 *   2. STATUS BANNER (config locked · signer · timestamp · deployment ·
 *      regulator · one link to config as read-only record)
 *   3. THREE CARDS (healthy / total · last sync · egress posture)
 *   4. RECORD TABLE (Source · Protocol · Cadence · State — plain forms;
 *      row click opens the source profile)
 *   5. FOOTER (credentials holder · signoff · link "data use rules live in Govern")
 *
 * Gate: NO governance content on this page. Connect LINKS, never duplicates.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';


function SampleBadge({ rowId }) {
  return (
    <span
      data-testid={`connect-sample-badge-${rowId}`}
      data-sample-badge="true"
      style={{
        display: 'inline-block', padding: '2px 8px', marginLeft: '6px',
        background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        verticalAlign: 'middle',
      }}
    >
      SAMPLE
    </span>
  );
}


function DefaultMarker({ testId }) {
  return (
    <span
      data-testid={testId}
      data-default-marker="true"
      style={{
        display: 'inline-block', padding: '2px 6px', marginLeft: '6px',
        border: `1px dashed ${AKKI_V4_PALETTE.amber}`,
        color: AKKI_V4_PALETTE.amber,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.6rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}
    >
      default — not yet confirmed
    </span>
  );
}


// ---------- §4.1 · SECTION 1 — Two-state headline (same slot) ---------------


function Headline({ headline }) {
  return (
    <section
      data-testid="connect-headline-slot"
      data-headline-kind={headline.kind}
      style={{
        padding: '18px 22px', marginBottom: '18px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
          color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '6px',
        }}
      >
        Connect · {headline.kind === 'steady_state' ? 'steady state' : 'pre-connection'}
      </div>
      <h2
        data-testid="connect-headline-text"
        style={{
          margin: 0, fontFamily: AKKI_V4_TYPOGRAPHY.display,
          fontSize: '1.4rem', color: AKKI_V4_PALETTE.ink,
        }}
      >
        {headline.text}
      </h2>
    </section>
  );
}


// ---------- §4.1 · SECTION 2 — Status banner ---------------------------------


function StatusBanner({ banner }) {
  return (
    <section
      data-testid="connect-status-banner"
      style={{
        padding: '14px 18px', marginBottom: '18px',
        background: AKKI_V4_PALETTE.cream,
        border: `1px solid ${banner.configuration_locked ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.amber}`,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'baseline' }}>
        <div>
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Configuration
          </div>
          <div
            data-testid="connect-banner-locked"
            style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink }}
          >
            {banner.configuration_locked ? 'Locked' : 'Not yet locked'}
            {banner.signed_by && (
              <span style={{ color: AKKI_V4_PALETTE.sage, marginLeft: '6px' }}>
                · signed by {banner.signed_by}
                {banner.signed_at_iso && ` at ${banner.signed_at_iso}`}
              </span>
            )}
          </div>
        </div>
        <div>
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Deployment target
          </div>
          <div data-testid="connect-banner-deployment" style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink }}>
            {banner.deployment_target}
            {banner.field_is_default?.deployment_target && (
              <DefaultMarker testId="connect-banner-deployment-default" />
            )}
          </div>
        </div>
        <div>
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Primary regulator
          </div>
          <div data-testid="connect-banner-regulator" style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink }}>
            {banner.primary_regulator}
            {banner.field_is_default?.primary_regulator && (
              <DefaultMarker testId="connect-banner-regulator-default" />
            )}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Link
            to={banner.config_read_only_route}
            data-testid="connect-banner-config-link"
            style={{ color: AKKI_V4_PALETTE.navy, fontSize: '0.82rem', textDecoration: 'none' }}
          >
            Open locked configuration (read-only) →
          </Link>
        </div>
      </div>
    </section>
  );
}


// ---------- §4.1 · SECTION 3 — Three cards ------------------------------------


function ThreeCards({ cards }) {
  return (
    <section
      data-testid="connect-three-cards"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '14px',
        marginBottom: '18px',
      }}
    >
      <Card
        testId="connect-card-connections"
        label="Connections"
        value={`${cards.connections_healthy} of ${cards.connections_total}`}
        sub="healthy"
      />
      <Card
        testId="connect-card-last-sync"
        label="Last sync"
        value={cards.last_sync_iso ? cards.last_sync_iso.slice(11, 19) + 'Z' : 'not yet'}
        sub={cards.last_sync_iso ? cards.last_sync_iso.slice(0, 10) : ''}
      />
      <Card
        testId="connect-card-egress"
        label="Egress posture"
        value={cards.egress_is_dormant ? 'seam · dormant' : (cards.egress_posture || '')}
        sub={cards.egress_is_dormant ? 'lands at OT-1a facts' : ''}
        dormant={cards.egress_is_dormant}
      />
    </section>
  );
}


function Card({ testId, label, value, sub, dormant }) {
  return (
    <div
      data-testid={testId}
      style={{
        padding: '14px 16px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${dormant ? AKKI_V4_PALETTE.amber : AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '4px',
      }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink }}>{value}</div>
      {sub && <div style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.sage, marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}


// ---------- §4.1 · SECTION 4 — Record table ---------------------------------


function StateBadge({ state }) {
  const color = {
    connected: AKKI_V4_PALETTE.sage,
    in_progress: AKKI_V4_PALETTE.navy,
    awaiting_credentials: AKKI_V4_PALETTE.amber,
    failed: AKKI_V4_PALETTE.oxblood,
    pending: AKKI_V4_PALETTE.mist,
  }[state] || AKKI_V4_PALETTE.mist;
  const label = {
    connected: 'connected',
    in_progress: 'in progress',
    awaiting_credentials: 'awaiting credentials',
    failed: 'failed',
    pending: 'pending',
  }[state] || state;
  return (
    <span
      data-testid={`connect-source-state-badge-${state}`}
      style={{
        display: 'inline-block', padding: '2px 8px',
        background: color, color: AKKI_V4_PALETTE.cream,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}
    >
      {label}
    </span>
  );
}


function RecordTable({ rows }) {
  const navigate = useNavigate();
  return (
    <section
      data-testid="connect-record-table"
      style={{
        marginBottom: '18px',
        padding: '16px 18px',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '10px',
      }}>
        Record · sources
      </div>
      {rows.length === 0 && (
        <div data-testid="connect-record-empty" style={{
          padding: '8px 12px', border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
          color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem',
        }}>
          No sources declared. Add one to begin.
        </div>
      )}
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 0 }}>
        <thead>
          <tr>
            <th style={thStyle}>Source</th>
            <th style={thStyle}>Protocol</th>
            <th style={thStyle}>Cadence</th>
            <th style={thStyle}>State</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.source_id}
              data-testid={`connect-source-row-${r.source_id}`}
              data-row-state={r.state}
              data-row-sample={r.is_sample ? 'true' : 'false'}
              onClick={(ev) => {
                // Canon §4.1 · 'row click opens the source profile'.
                // Ignore clicks that originate inside an inner <a> — that
                // link handles its own navigation.
                if (ev.target.closest && ev.target.closest('a')) return;
                navigate(`/connect/source/${r.source_id}`);
              }}
              style={{ borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`, cursor: 'pointer' }}
            >
              <td style={tdStyle}>
                <Link
                  to={`/connect/source/${r.source_id}`}
                  data-testid={`connect-source-link-${r.source_id}`}
                  style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none' }}
                >
                  {r.name}
                </Link>
                {r.is_sample && <SampleBadge rowId={r.source_id} />}
                {r.failure_reason_plain && (
                  <div
                    data-testid={`connect-source-failure-reason-${r.source_id}`}
                    style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.oxblood, fontStyle: 'italic', marginTop: '4px' }}
                  >
                    {r.failure_reason_plain}
                  </div>
                )}
                {r.awaiting_note && (
                  <div
                    data-testid={`connect-source-awaiting-note-${r.source_id}`}
                    style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.amber, marginTop: '4px' }}
                  >
                    {r.awaiting_note}
                  </div>
                )}
                {r.in_progress_note && (
                  <div
                    data-testid={`connect-source-progress-note-${r.source_id}`}
                    style={{ fontSize: '0.75rem', color: AKKI_V4_PALETTE.navy, marginTop: '4px' }}
                  >
                    {r.in_progress_note}
                  </div>
                )}
              </td>
              <td style={tdStyle}>{r.protocol_familiar}</td>
              <td style={tdStyle}>{r.cadence_plain}</td>
              <td style={tdStyle}><StateBadge state={r.state} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}


// ---------- §4.1 · SECTION 5 — Footer ---------------------------------------


function Footer({ footer, declaredRegistries }) {
  return (
    <section
      data-testid="connect-footer"
      style={{
        padding: '14px 18px', marginBottom: '18px',
        borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
        fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink,
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'baseline' }}>
        <div>Credentials held: <span style={{ color: AKKI_V4_PALETTE.sage }}>{footer.credentials_holder}</span></div>
        <div>Signed off by: <span style={{ color: AKKI_V4_PALETTE.sage }}>{footer.signed_off_by}</span></div>
        <div style={{ marginLeft: 'auto' }}>
          <Link
            to={footer.govern_link_route}
            data-testid="connect-footer-govern-link"
            style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none' }}
          >
            {footer.govern_link_text} →
          </Link>
        </div>
      </div>
      {declaredRegistries && declaredRegistries.length > 0 && (
        <div
          data-testid="connect-declared-registries-chips"
          style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}
        >
          <span style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Declared registries:
          </span>
          {declaredRegistries.map((r) => (
            <Link
              key={r.registry_name}
              to="/govern/registries"
              data-testid={`connect-declared-registry-chip-${r.registry_name}`}
              data-row-sample={r.is_sample ? 'true' : 'false'}
              style={{
                display: 'inline-block', padding: '4px 10px',
                background: AKKI_V4_PALETTE.mist, color: AKKI_V4_PALETTE.ink,
                textDecoration: 'none', fontSize: '0.75rem',
                border: `1px solid ${r.is_empty ? AKKI_V4_PALETTE.amber : AKKI_V4_PALETTE.sage}`,
              }}
            >
              {r.registry_name} · {r.schema_class}
              {' · '}
              {r.is_empty
                ? <em style={{ color: AKKI_V4_PALETTE.amber }}>empty · fail-closed</em>
                : <em>v{r.version}</em>
              }
              {r.is_sample && <SampleBadge rowId={`registry-${r.registry_name}`} />}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}


const thStyle = {
  padding: '8px 10px',
  textAlign: 'left',
  fontFamily: AKKI_V4_TYPOGRAPHY.labels,
  fontSize: '0.62rem',
  color: AKKI_V4_PALETTE.sage,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
};
const tdStyle = { padding: '10px', verticalAlign: 'top', color: AKKI_V4_PALETTE.ink };


export default function ConnectHomePage() {
  const [landing, setLanding] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api.connectLanding();
      if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
      if (r.status >= 500) { setFault(r.body); return; }
      if (r.status === 200) setLanding(r.body);
    })();
  }, []);

  if (deny) return (
    <AkkiShell title="Connect"><AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} /></AkkiShell>
  );
  if (fault) return (
    <AkkiShell title="Connect"><InfrastructureFaultPanel headline="connect landing read failed" detail={fault?.detail} /></AkkiShell>
  );
  if (!landing) return (
    <AkkiShell title="Connect"><div data-testid="connect-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div></AkkiShell>
  );

  return (
    <AkkiShell
      title="Connect"
      subtitle="Canon §4 · sources · protocols · cadence · state. Rules live in Govern."
    >
      <div data-testid="connect-home" data-canon-ref="Canon §4.1">
        <Headline headline={landing.headline} />
        <StatusBanner banner={landing.status_banner} />
        <ThreeCards cards={landing.cards} />
        <RecordTable rows={landing.record_rows} />
        <Footer footer={landing.footer} declaredRegistries={landing.declared_registries} />
        <div style={{ marginTop: '12px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            to="/connect/rules"
            data-testid="connect-see-rules"
            style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.85rem' }}
          >
            Open seven Connect rules · Canon §4.2 →
          </Link>
          <Link
            to="/connect/setup"
            data-testid="connect-see-setup"
            style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.85rem' }}
          >
            Setup: declare a registry / confirm defaults →
          </Link>
        </div>
      </div>
    </AkkiShell>
  );
}
