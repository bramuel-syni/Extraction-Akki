/* UI-1-C · Connect Setup · Canon §4.2 A5 amendment.
 *
 * Declare a Class-D registry: name · schema class (pseudonymize/redact/filter).
 * Post-signoff, declared registries render on Connect home as chips
 * linking into /govern/registries (Govern operates; Connect declares).
 *
 * Empty registries render FAIL-CLOSED (per Canon: 'registry exists
 * EMPTY, FAIL-CLOSED until first load').
 *
 * master_admin only.
 */
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel } from '../../design/ResponseClassPanel';


export default function ConnectSetupPage() {
  const [name, setName] = useState('');
  const [schemaClass, setSchemaClass] = useState('pseudonymize');
  const [declared, setDeclared] = useState([]);
  const [deny, setDeny] = useState(null);
  const [result, setResult] = useState(null);

  const load = async () => {
    const r = await api.connectDeclaredRegistries();
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    if (r.status === 200) setDeclared(r.body.declared || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setResult(null);
    const r = await api.connectDeclareRegistry({ registry_name: name, schema_class: schemaClass });
    setResult(r.body);
    if (r.status === 201) {
      setName('');
      load();
    }
  };

  if (deny) return (
    <AkkiShell title="Setup · Connect"><AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} /></AkkiShell>
  );

  return (
    <AkkiShell
      title="Setup · Connect"
      subtitle="Canon §4.2 A5 · declare Class-D registries · chips link to /govern/registries."
    >
      <p style={{ marginBottom: '18px' }}>
        <Link to="/connect" data-testid="connect-setup-back" style={{ color: AKKI_V4_PALETTE.navy }}>← Connect</Link>
      </p>
      <section
        data-testid="connect-setup-declare-form"
        style={{
          padding: '14px 18px', marginBottom: '18px',
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        }}
      >
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
          color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '10px',
        }}>
          Declare a Class-D registry
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'baseline' }}>
          <input
            data-testid="connect-setup-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Registry name (e.g. sanctioned_partners)"
            style={{ flex: 1, minWidth: '220px', padding: '6px 10px', border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem' }}
          />
          <select
            data-testid="connect-setup-schema-select"
            value={schemaClass}
            onChange={(e) => setSchemaClass(e.target.value)}
            style={{ padding: '6px 10px', border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.85rem' }}
          >
            <option value="pseudonymize">pseudonymize</option>
            <option value="redact">redact</option>
            <option value="filter">filter</option>
          </select>
          <button
            type="submit"
            data-testid="connect-setup-declare-btn"
            disabled={!name.trim()}
            style={{
              padding: '6px 14px', background: AKKI_V4_PALETTE.navy,
              color: AKKI_V4_PALETTE.cream, border: 'none',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.75rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Declare
          </button>
        </form>
        {result && (
          <div
            data-testid="connect-setup-declare-result"
            style={{
              marginTop: '10px', padding: '6px 10px',
              border: `1px solid ${result.declared ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.oxblood}`,
              fontSize: '0.78rem',
              color: result.declared ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.oxblood,
            }}
          >
            {result.declared ? 'declared' : (result.reason || 'refused')}
          </div>
        )}
      </section>
      <section
        data-testid="connect-setup-declared-list"
        style={{
          padding: '14px 18px', marginBottom: '18px',
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        }}
      >
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
          color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
          letterSpacing: '0.06em', marginBottom: '10px',
        }}>
          Declared registries · {declared.length}
        </div>
        {declared.length === 0 && (
          <div data-testid="connect-setup-empty" style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem' }}>
            No registries declared yet.
          </div>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {declared.map((r) => (
            <li
              key={r.registry_name}
              data-testid={`connect-setup-registry-row-${r.registry_name}`}
              data-row-sample={r.is_sample ? 'true' : 'false'}
              style={{
                padding: '10px 12px', marginBottom: '6px',
                background: AKKI_V4_PALETTE.cream,
                border: `1px solid ${r.is_empty ? AKKI_V4_PALETTE.amber : AKKI_V4_PALETTE.sage}`,
                display: 'flex', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap',
              }}
            >
              <span style={{ fontWeight: 600 }}>{r.registry_name}</span>
              <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage }}>
                · schema {r.schema_class}
              </span>
              {r.is_empty ? (
                <span
                  data-testid={`connect-setup-empty-fail-closed-${r.registry_name}`}
                  style={{ color: AKKI_V4_PALETTE.amber, fontStyle: 'italic', fontSize: '0.78rem' }}
                >
                  · empty · fail-closed until first load
                </span>
              ) : (
                <span style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.78rem' }}>
                  · v{r.version} · last updated {r.last_updated_at_iso}
                </span>
              )}
              {r.is_sample && (
                <span
                  data-testid={`connect-setup-sample-badge-${r.registry_name}`}
                  data-sample-badge="true"
                  style={{
                    display: 'inline-block', padding: '2px 8px',
                    background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
                    fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}
                >
                  SAMPLE
                </span>
              )}
              <Link
                to="/govern/registries"
                data-testid={`connect-setup-govern-link-${r.registry_name}`}
                style={{ marginLeft: 'auto', color: AKKI_V4_PALETTE.navy, fontSize: '0.78rem', textDecoration: 'none' }}
              >
                Operate in Govern →
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AkkiShell>
  );
}
