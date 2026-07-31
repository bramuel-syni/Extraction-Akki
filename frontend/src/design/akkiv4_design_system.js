/* Akki v4 Design System — Phase 3 sub-cycle 1
 *
 * Owner ruling 2026-08-01 verbatim design law:
 *   "visual family per the Akki v4 demo (cream #F3F2E9 / navy #16304F /
 *    oxblood #7E3038 / sage #8A8F7C / amber #B07C2A; Georgia serif
 *    wordmark, Helvetica labels)."
 *
 * These tokens are the SINGLE source of truth for palette + typography
 * across every sub-cycle-1 screen. No screen may hardcode a color or
 * font — import from here.
 */
export const AKKI_V4_PALETTE = Object.freeze({
  cream:   '#F3F2E9',  // primary background
  navy:    '#16304F',  // primary text + access-control-denial visual
  oxblood: '#7E3038',  // governed-refusal visual (refusal border + CTA accent)
  sage:    '#8A8F7C',  // infrastructure-fault visual
  amber:   '#B07C2A',  // validation-error visual + agent-assumed chip
  ink:     '#111111',  // deepest text (Georgia headlines)
  mist:    '#E6E4D9',  // subtle divider / hatch background for dormant
  bone:    '#FBFAF4',  // panel background lift
});

export const AKKI_V4_TYPOGRAPHY = Object.freeze({
  wordmark:  '"Georgia", "Times New Roman", serif',
  labels:    '"Helvetica Neue", "Helvetica", Arial, sans-serif',
  monoLine:  '"SFMono-Regular", ui-monospace, Menlo, monospace',
});

/* Response-class taxonomy — four classes, distinct visual treatments,
 * NEVER conflated (Owner cycle-3 message verbatim).
 * Each class has a stable id + visual token bundle + copy hint.
 */
export const RESPONSE_CLASS = Object.freeze({
  GOVERNED_REFUSAL: {
    id: 'governed_refusal',
    label: 'Governed refusal',
    accentColor: AKKI_V4_PALETTE.oxblood,
    borderStyle: `4px solid ${AKKI_V4_PALETTE.oxblood}`,
    background:  AKKI_V4_PALETTE.cream,
    icon: 'shield-halt',
    testId: 'response-governed-refusal',
    /* Owner E2 taxonomy: envelope carries outcome=refused + reason + detail. */
  },
  VALIDATION_ERROR: {
    id: 'validation_error',
    label: 'Form error',
    accentColor: AKKI_V4_PALETTE.amber,
    borderStyle: `2px dashed ${AKKI_V4_PALETTE.amber}`,
    background:  AKKI_V4_PALETTE.cream,
    icon: 'edit-warn',
    testId: 'response-validation-error',
    /* 400 malformed_payload — a shape problem the user can correct. */
  },
  INFRASTRUCTURE_FAULT: {
    id: 'infrastructure_fault',
    label: 'The system had trouble',
    accentColor: AKKI_V4_PALETTE.sage,
    borderStyle: `2px solid ${AKKI_V4_PALETTE.sage}`,
    background:  AKKI_V4_PALETTE.bone,
    icon: 'cog-fault',
    testId: 'response-infrastructure-fault',
    /* 5xx bodies. NEVER used for a refusal-shape response. */
  },
  ACCESS_CONTROL_DENIAL: {
    id: 'access_control_denial',
    label: 'Not authorised',
    accentColor: AKKI_V4_PALETTE.navy,
    borderStyle: `2px solid ${AKKI_V4_PALETTE.navy}`,
    background:  AKKI_V4_PALETTE.mist,
    icon: 'key-block',
    testId: 'response-access-control-denial',
    /* 401/403 bodies carry {reason, detail} — NEVER carry `outcome`. */
  },
});

/* Helper: pick the class from an HTTP response body + status. */
export function classifyResponse(status, body) {
  if (status === 401 || status === 403) {
    return RESPONSE_CLASS.ACCESS_CONTROL_DENIAL;
  }
  if (status === 400 && body && (body.reason === 'malformed_payload' || body.detail?.field)) {
    return RESPONSE_CLASS.VALIDATION_ERROR;
  }
  if (status >= 500 && status < 600) {
    return RESPONSE_CLASS.INFRASTRUCTURE_FAULT;
  }
  if (body && body.outcome === 'refused') {
    return RESPONSE_CLASS.GOVERNED_REFUSAL;
  }
  return null;
}
