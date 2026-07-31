/* Ratified binding copy — Owner ruling 2026-08-01 (Ruling 4).
 *
 * PARTIAL RATIFICATION discipline:
 *   • RATIFIED_COPY strings render VERBATIM (byte-identical to Owner text).
 *   • Every OTHER Appendix A slot renders via MarkedOpenSlot (see
 *     MarkedOpenSlot.jsx). NEVER filled with invented copy.
 *
 * Any change to a RATIFIED string requires an Owner ruling.
 * Any addition to RATIFIED_COPY requires an Owner ruling.
 */

/* Refusal action triplet — Ruling 4, three exact strings. */
export const REFUSAL_ACTION_TRIPLET = Object.freeze([
  'Accept as recorded statement',
  'Narrow the objective',
  'Lower the standard',
]);

/* Frozen-immutable one-liner — Ruling 4. */
export const FROZEN_IS_IMMUTABLE = 'Frozen is immutable.';

/* Unset-retention banner — Ruling 4, verbatim per FB-13. */
export const UNSET_RETENTION_BANNER =
  'the system holds everything indefinitely until you set a window ' +
  '— a decision only you can make';

/* Auth-denial rendering (Owner E2 non-negotiable) — envelope carries
 * reason + detail; NEVER outcome. The frontend renders per-reason
 * plain-language copy from a fixed table (not invented). */
export const AUTH_DENIAL_COPY = Object.freeze({
  auth_missing: 'Please sign in to continue.',
  auth_expired: 'Your session has expired. Please sign in again.',
  auth_scope_insufficient: 'Your account cannot reach this surface.',
  auth_identity_mismatch_for_wizard_session:
    'This session belongs to a different account.',
});

/* Suspended-slot marker (Ruling 4). Any copy slot NOT in RATIFIED
 * must render via <MarkedOpenSlot slotName={...}/>. */
export const OPEN_SLOT_MARKER_HINT = '— open —';
