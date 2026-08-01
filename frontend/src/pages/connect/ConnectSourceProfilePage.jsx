/* UI-1-C · Connect Source Profile · Canon §4.4.
 *
 * Row click from /connect opens this page for the clicked source_id.
 * Mapping leads with the ANSWER: header "N of M fields confirmed · K need attention".
 * Fields needing attention render as plain-language QUESTIONS with a
 * resolution control attached. The full field list is COLLAPSED behind
 * a link.
 * Operator can resolve; other classes read-only with who-confirmed + when.
 */
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel } from '../../design/ResponseClassPanel';


function StateBadge({ state }) {
  const color = {
    connected: AKKI_V4_PALETTE.sage,
    in_progress: AKKI_V4_PALETTE.navy,
    awaiting_credentials: AKKI_V4_PALETTE.amber,
    failed: AKKI_V4_PALETTE.oxblood,
    pending: AKKI_V4_PALETTE.mist,
  }[state] || AKKI_V4_PALETTE.mist;
  return (
    <span
      data-testid={`connect-source-profile-state-${state}`}
      style={{
        display: 'inline-block', padding: '3px 10px',
        background: color, color: AKKI_V4_PALETTE.cream,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}
    >
      {state.replace(/_/g, ' ')}
    </span>
  );
}


function AttentionField({ f }) {
  return (
    <li
      data-testid={`connect-source-profile-attention-${f.field_id}`}
      style={{
        padding: '10px 12px', marginBottom: '8px',
        background: AKKI_V4_PALETTE.cream,
        border: `1px solid ${AKKI_V4_PALETTE.amber}`,
      }}
    >
      <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, marginBottom: '6px' }}>
        {f.question_plain}
      </div>
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}>
        Field: {f.field_id} · resolution: {f.resolution_control}
      </div>
      {f.options && (
        <div style={{ marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {f.options.map((opt) => (
            <span
              key={opt}
              data-testid={`connect-source-profile-option-${f.field_id}-${opt}`}
              style={{
                padding: '3px 8px', background: AKKI_V4_PALETTE.mist,
                fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.72rem',
                color: AKKI_V4_PALETTE.ink,
              }}
            >
              {opt}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}


export default function ConnectSourceProfilePage() {
  const { sourceId } = useParams();
  const [source, setSource] = useState(null);
  const [deny, setDeny] = useState(null);
  const [showFullFields, setShowFullFields] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  const reload = async () => {
    const r = await api.connectSourceProfile(sourceId);
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    if (r.status === 200) setSource(r.body);
  };

  useEffect(() => {
    reload();
     
  }, [sourceId]);

  const doConnect = async () => {
    const r = await api.connectSourceConnect(sourceId);
    setActionResult(r.body);
    if (r.status === 200) reload();
  };
  const doTest = async () => {
    const r = await api.connectSourceTest(sourceId);
    setActionResult(r.body);
  };
  const doRetry = async () => {
    const r = await api.connectSourceRetry(sourceId);
    setActionResult(r.body);
    if (r.status === 200) reload();
  };

  if (deny) return (
    <AkkiShell title="Source · Connect"><AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} /></AkkiShell>
  );
  if (!source) return (
    <AkkiShell title="Source · Connect"><div data-testid="connect-source-loading" style={{ color: AKKI_V4_PALETTE.sage }}>loading…</div></AkkiShell>
  );

  return (
    <AkkiShell
      title={source.name || 'Source'}
      subtitle={`Canon §4.4 · ${source.protocol_familiar} · ${source.cadence_plain}`}
    >
      <div data-testid="connect-source-profile" data-source-id={sourceId} data-canon-ref="Canon §4.4">
        <p style={{ marginBottom: '16px' }}>
          <Link to="/connect" data-testid="connect-source-back" style={{ color: AKKI_V4_PALETTE.navy }}>
            ← Connect
          </Link>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <StateBadge state={source.state} />
          {source.is_sample && (
            <span
              data-testid={`connect-source-profile-sample-badge-${sourceId}`}
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
        </div>
        {/* Answer-first mapping header (Canon §4.4) */}
        <section
          data-testid="connect-source-mapping-header"
          style={{
            padding: '14px 18px', marginBottom: '18px',
            background: AKKI_V4_PALETTE.bone,
            border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          }}
        >
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: '4px',
          }}>
            Mapping — lead with the ANSWER
          </div>
          <div style={{ fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>
            {source.mapping_header}
          </div>
        </section>
        {source.failure_reason_plain && (
          <div
            data-testid="connect-source-failure-panel"
            style={{
              padding: '10px 14px', marginBottom: '18px',
              border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
              background: AKKI_V4_PALETTE.cream,
            }}
          >
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
              color: AKKI_V4_PALETTE.oxblood, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: '4px',
            }}>
              Failure — plain language
            </div>
            <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, fontStyle: 'italic' }}>
              {source.failure_reason_plain}
            </div>
          </div>
        )}
        {/* Fields needing attention rendered as plain-language questions */}
        {source.fields_need_attention && source.fields_need_attention.length > 0 && (
          <section data-testid="connect-source-attention-list" style={{ marginBottom: '18px' }}>
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
              color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: '8px',
            }}>
              Need attention · plain-language questions
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {source.fields_need_attention.map((f) => (
                <AttentionField key={f.field_id} f={f} />
              ))}
            </ul>
          </section>
        )}
        {/* Full field list collapsed behind a link */}
        <section style={{ marginBottom: '18px' }}>
          <button
            type="button"
            data-testid="connect-source-full-fields-toggle"
            onClick={() => setShowFullFields(!showFullFields)}
            style={{
              background: 'transparent',
              color: AKKI_V4_PALETTE.navy,
              fontSize: '0.85rem',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {showFullFields ? 'Hide' : 'Show'} full field list ({source.fields_total || 0} fields)
          </button>
          {showFullFields && (
            <div
              data-testid="connect-source-full-fields"
              style={{
                marginTop: '10px', padding: '10px 14px',
                background: AKKI_V4_PALETTE.cream,
                border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
                fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage,
              }}
            >
              Full-field mapping view · seam · lands with OT-1a facts.
              For now, {source.fields_confirmed || 0} of {source.fields_total || 0} fields
              are confirmed (see above for the {source.fields_need_attention?.length || 0} needing attention).
            </div>
          )}
        </section>
        {/* Operator actions (read-only for other classes) */}
        <section
          data-testid="connect-source-actions"
          data-can-resolve={source.operator_can_resolve ? 'true' : 'false'}
          style={{ marginBottom: '18px' }}
        >
          {source.operator_can_resolve ? (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {(source.state === 'pending' || source.state === 'awaiting_credentials' || source.state === 'failed') && (
                <button
                  data-testid="connect-source-connect-btn"
                  onClick={doConnect}
                  style={btnStyle(AKKI_V4_PALETTE.navy)}
                >
                  Connect
                </button>
              )}
              <button
                data-testid="connect-source-test-btn"
                onClick={doTest}
                style={btnStyle(AKKI_V4_PALETTE.sage)}
              >
                Test
              </button>
              {source.state === 'failed' && (
                <button
                  data-testid="connect-source-retry-btn"
                  onClick={doRetry}
                  style={btnStyle(AKKI_V4_PALETTE.oxblood)}
                >
                  Retry
                </button>
              )}
            </div>
          ) : (
            <div
              data-testid="connect-source-read-only-note"
              style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, fontStyle: 'italic' }}
            >
              Read-only · signed off by {source.signed_off_by || '(not yet signed)'}
              {source.signed_off_at_iso && ` at ${source.signed_off_at_iso}`}
            </div>
          )}
          {actionResult && (
            <div
              data-testid="connect-source-action-result"
              style={{ marginTop: '10px', fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage, fontFamily: AKKI_V4_TYPOGRAPHY.monoLine }}
            >
              action result: {JSON.stringify(actionResult).slice(0, 200)}
            </div>
          )}
        </section>
      </div>
    </AkkiShell>
  );
}


function btnStyle(bg) {
  return {
    padding: '6px 14px', background: bg,
    color: AKKI_V4_PALETTE.cream, border: 'none',
    fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    cursor: 'pointer',
  };
}
