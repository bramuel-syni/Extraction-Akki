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
 *
 * FIDELITY UPDATE 2026-08-01 (Owner ruling · defect cycle):
 *   AKKI_V4_PROTO tokens below are the EXACT tokens extracted from the
 *   Akki v4 Standalone HTML of record (SHA 2ab55d9f…). These are the
 *   authoritative visual tokens for the new AkkiV4Shell + all v4-parity
 *   pages built during batches B1–B10. Legacy AKKI_V4_PALETTE +
 *   AKKI_V4_TYPOGRAPHY remain for pages not yet migrated.
 */
export const AKKI_V4_PROTO = Object.freeze({
  // Backgrounds
  bodyBg:       '#F3F2E9',   // main body
  cardBg:       '#FFFFFF',   // white cards / modals
  sidebarBg:    '#EFEEE2',   // left rail
  darkUi:       '#101E30',   // top-nav / CTAs (Ask Akki)
  darkUiHover:  '#1A2C44',
  paneLift:     '#FAF9F2',   // subtle lift under pills
  // Ink
  ink:          '#1A211D',   // primary text
  ink2:         '#3E4642',   // secondary text
  ink3:         '#6B7370',   // tertiary text
  ink4:         '#8A918C',   // muted text / labels
  ink5:         '#A0A69E',   // dormant caption
  // Accents
  wordmarkInk:  '#16304F',   // Akki wordmark color
  heroInk:      '#131F30',   // hero display headings
  navy:         '#1E3A5F',   // primary CTAs / active accents
  navyHover:    '#16304F',
  maroon:       '#7E3038',   // secondary CTAs / active link ink
  maroonSoft:   '#E3CDC7',   // maroon underline
  sage:         '#8A8F7C',   // labels + secondary
  // Borders
  borderCream:  '#E3E1D3',   // primary divider
  borderWarm:   '#E7E4DC',   // card border
  borderCool:   '#C9D2DF',   // hero underline
  borderSoft:   '#F1EFE8',   // subtle inner divider
  borderSlate:  '#ECE9E1',   // table row divider
  // Semantic
  success:      '#6B7C3E',
  warn:         '#B07C2A',
  refuse:       '#8C3A34',
  dormant:      '#A0A69E',
});

export const AKKI_V4_PROTO_TYPE = Object.freeze({
  // Font families (imported via Google Fonts stylesheet in index.html)
  ui:     `'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif`,
  hero:   `'Newsreader', 'Iowan Old Style', Georgia, 'Times New Roman', serif`,
  mono:   `'Spline Sans Mono', ui-monospace, SFMono-Regular, Menlo, monospace`,
  // Semantic sizes (px)
  wordmarkSize: '26px',
  heroSize:     '34px',
  bodySize:     '13px',
  labelSize:    '11px',
  microSize:    '10.5px',
  metaSize:     '12px',
});

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
