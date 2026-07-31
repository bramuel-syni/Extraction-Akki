import React from 'react';
import { RESPONSE_CLASS, AKKI_V4_TYPOGRAPHY, AKKI_V4_PALETTE } from './akkiv4_design_system';
import { REFUSAL_ACTION_TRIPLET, AUTH_DENIAL_COPY } from './ratified_copy';

/* ResponseClassPanel — the ONE renderer for all four response classes.
 *
 * Owner design law (2026-08-01 verbatim):
 *   "four response classes NEVER conflated (governed refusal / validation
 *    error / infrastructure fault / access-control denial — distinct
 *    visual treatments)"
 *
 * Every screen that needs to render a refusal/error/fault/denial MUST
 * use this component. It refuses to render a class with the visual of
 * another class.
 *
 * Additional invariant: refusal renders IN THE ANSWER POSITION — not as
 * a modal, not as a toast, not as a sidebar. The <ResponseClassPanel>
 * is placed where the answer would be placed.
 */
export function ResponseClassPanel({
  responseClass,   // one of RESPONSE_CLASS.*
  headline,        // required · claim + class marker
  detail,          // optional · plain-language explanation
  actions,         // optional · array of { label, onClick, testId }
  traceId,         // optional · one trace thread audit rail entry
  extra,           // optional · React children (below actions)
}) {
  if (!responseClass) {
    return (
      <div data-testid="response-class-panel-missing" style={{
        padding: '12px', border: `1px dashed ${AKKI_V4_PALETTE.oxblood}`,
        color: AKKI_V4_PALETTE.oxblood, fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}>
        design-law violation: ResponseClassPanel rendered without responseClass
      </div>
    );
  }
  return (
    <section
      data-testid={responseClass.testId}
      data-response-class={responseClass.id}
      role="alert"
      style={{
        background: responseClass.background,
        borderLeft: responseClass.borderStyle,
        padding: '16px 20px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        margin: '16px 0',
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color: responseClass.accentColor,
        fontWeight: 600,
      }} data-testid={`${responseClass.testId}-class-label`}>
        {responseClass.label}
      </div>
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
        fontSize: '1.15rem',
        color: AKKI_V4_PALETTE.ink,
        marginTop: '4px',
      }} data-testid={`${responseClass.testId}-headline`}>
        {headline}
      </div>
      {detail && (
        <div style={{
          color: AKKI_V4_PALETTE.navy,
          fontSize: '0.95rem',
          marginTop: '8px',
        }} data-testid={`${responseClass.testId}-detail`}>
          {detail}
        </div>
      )}
      {actions && actions.length > 0 && (
        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {actions.map((a, i) => (
            <button
              key={i}
              data-testid={a.testId || `${responseClass.testId}-action-${i}`}
              onClick={a.onClick}
              style={{
                background: 'transparent',
                border: `1px solid ${responseClass.accentColor}`,
                color: responseClass.accentColor,
                padding: '8px 14px',
                fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >{a.label}</button>
          ))}
        </div>
      )}
      {extra}
      {traceId && (
        <div style={{
          marginTop: '14px',
          borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
          paddingTop: '8px',
          fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
          fontSize: '0.75rem',
          color: AKKI_V4_PALETTE.sage,
        }} data-testid={`${responseClass.testId}-trace-id`}>
          trace_id · {traceId}
        </div>
      )}
    </section>
  );
}

/* GovernedRefusalCard — a specialization that renders the refusal-action
 * TRIPLET (VERBATIM per Ruling 4) when the caller does not pass custom
 * actions. Convenience over the raw ResponseClassPanel. */
export function GovernedRefusalCard({ reason, detail, traceId, onAccept, onNarrow, onLower }) {
  const actions = [
    { label: REFUSAL_ACTION_TRIPLET[0], onClick: onAccept, testId: 'refusal-action-accept' },
    { label: REFUSAL_ACTION_TRIPLET[1], onClick: onNarrow, testId: 'refusal-action-narrow' },
    { label: REFUSAL_ACTION_TRIPLET[2], onClick: onLower, testId: 'refusal-action-lower' },
  ];
  return (
    <ResponseClassPanel
      responseClass={RESPONSE_CLASS.GOVERNED_REFUSAL}
      headline={<span><span data-testid="refusal-class-with-claim">Refused · </span>{reason}</span>}
      detail={detail}
      actions={actions}
      traceId={traceId}
    />
  );
}

/* AccessControlDeniedPanel — auth-denial has NO `outcome` key per Owner E2. */
export function AccessControlDeniedPanel({ reason, detail, traceId }) {
  const copy = AUTH_DENIAL_COPY[reason] || detail;
  return (
    <ResponseClassPanel
      responseClass={RESPONSE_CLASS.ACCESS_CONTROL_DENIAL}
      headline={<span data-testid="acl-class-with-claim">Not authorised · {reason}</span>}
      detail={copy}
      traceId={traceId}
    />
  );
}

export function ValidationErrorPanel({ headline, detail, traceId, fields }) {
  return (
    <ResponseClassPanel
      responseClass={RESPONSE_CLASS.VALIDATION_ERROR}
      headline={<span data-testid="validation-class-with-claim">Form error · {headline}</span>}
      detail={detail}
      traceId={traceId}
      extra={fields && (
        <ul data-testid="validation-field-list" style={{ marginTop: '10px', paddingLeft: '20px' }}>
          {fields.map((f, i) => (
            <li key={i} data-testid={`validation-field-${i}`} style={{
              color: AKKI_V4_PALETTE.amber, fontSize: '0.85rem',
            }}>{f}</li>
          ))}
        </ul>
      )}
    />
  );
}

export function InfrastructureFaultPanel({ headline, detail, traceId }) {
  return (
    <ResponseClassPanel
      responseClass={RESPONSE_CLASS.INFRASTRUCTURE_FAULT}
      headline={<span data-testid="infra-class-with-claim">The system had trouble · {headline}</span>}
      detail={detail}
      traceId={traceId}
    />
  );
}
