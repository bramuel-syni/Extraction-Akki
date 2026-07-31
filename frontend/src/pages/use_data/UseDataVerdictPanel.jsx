/* UI-1-A · Commission verdict panel · Canon §6.4 · §1.3.
 *
 * Renders three outcomes:
 *   1. runs_now       — green, receipt reference.
 *   2. refused        — oxblood, refusal grammar. Two sub-shapes:
 *                       · escalatable → criterion + value + route + affordance.
 *                       · absolute    → bar + source · NO approval affordance
 *                                        of any kind (Canon §1.3 · Doctrine 5).
 *   3. held_for_check — amber, single DPO countersign route.
 *
 * Break-in gate rendered here: an absolute refusal renders NEITHER a
 * disabled button NOR a request-override link. Doctrine 5 verbatim:
 *   "Absolute refusals render no approval affordance."
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';

const VERBATIM_CARRIER = 'Every commission verdict lands in the record the DPO reads.';

/* Owner iter14 grammar ruling (2026-07-31 · addendum):
 *   REFUSED-escalatable's "route to approval" must be an INTERACTIVE
 *   element (link/button to the approval surface), not plain text.
 *   Canon §1.3: the refusal "routes to the approval surface. Someone
 *   can approve; the system says who."
 *
 * The route target is a real Canon-live surface. Until Team (UI-1-E)
 * lands the access-register grammar, the route points to Govern
 * (pending queue = the DPO's approval surface today). This IS an
 * approval surface today; when UI-1-E ships, the route will migrate
 * to the Team access-register.
 */
const APPROVAL_ROUTE_DESTINATIONS = Object.freeze({
  // Route text patterns → destination path. Matched by substring test
  // against `refusal.route_to_approval` (case-insensitive).
  countersign:      { path: '/govern/pending',    label: 'Open Govern · Pending' },
  'policy check':   { path: '/govern/pending',    label: 'Open Govern · Pending' },
  'change-a-rule':  { path: '/govern/change-rule', label: 'Open Govern · Change a rule' },
  'change a rule':  { path: '/govern/change-rule', label: 'Open Govern · Change a rule' },
  retention:        { path: '/govern/retention',   label: 'Open Govern · Retention' },
  team:             { path: '/team',               label: 'Open Team (dormant)' },
});

function resolveApprovalDestination(routeText) {
  /* Return { path, label } for the interactive route, defaulting to
   * the Govern pending queue (the DPO's approval surface).
   */
  if (!routeText) return { path: '/govern/pending', label: 'Open Govern · Pending' };
  const lc = routeText.toLowerCase();
  for (const [k, v] of Object.entries(APPROVAL_ROUTE_DESTINATIONS)) {
    if (lc.includes(k)) return v;
  }
  return { path: '/govern/pending', label: 'Open Govern · Pending' };
}

function CheckList({ checks }) {
  if (!checks || checks.length === 0) return null;
  return (
    <ul
      data-testid="use-data-verdict-check-list"
      style={{
        listStyle: 'none',
        padding: 0,
        margin: '12px 0 0 0',
        fontSize: '0.85rem',
        color: AKKI_V4_PALETTE.ink,
      }}
    >
      {checks.map((c) => {
        const color =
          c.status === 'passed'
            ? AKKI_V4_PALETTE.sage
            : c.status === 'held'
            ? AKKI_V4_PALETTE.amber
            : AKKI_V4_PALETTE.oxblood;
        return (
          <li
            key={c.check}
            data-testid={`use-data-verdict-check-${c.check}`}
            style={{ padding: '6px 0', borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}` }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
              <span
                data-testid={`use-data-verdict-check-status-${c.check}`}
                style={{
                  padding: '2px 8px',
                  background: color,
                  color: AKKI_V4_PALETTE.cream,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {c.status}
              </span>
              <span style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, color: AKKI_V4_PALETTE.sage }}>
                {c.check}
              </span>
            </div>
            <div style={{ marginTop: '2px' }}>{c.plain_language_summary}</div>
            {c.detail && (
              <div style={{ fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage, marginTop: '2px' }}>
                {c.detail}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function RunsNowPanel({ verdict }) {
  return (
    <section
      data-testid="use-data-verdict-runs-now"
      style={{
        marginTop: '14px',
        padding: '20px 22px',
        background: AKKI_V4_PALETTE.bone,
        border: `4px solid ${AKKI_V4_PALETTE.navy}`,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <div
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.2rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        Runs now
      </div>
      <div style={{ marginTop: '8px', color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>
        All five checks passed. This commission begins immediately.
      </div>
      <CheckList checks={verdict.checks} />
      <div
        data-testid="use-data-verdict-trust-receipt"
        style={{
          marginTop: '12px',
          fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
          fontSize: '0.8rem',
          color: AKKI_V4_PALETTE.sage,
        }}
      >
        trust-receipt · {verdict.trust_receipt_ref}
      </div>
      <div
        data-testid="use-data-verdict-verbatim-carrier"
        style={{ marginTop: '8px', fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage, fontStyle: 'italic' }}
      >
        {VERBATIM_CARRIER}
      </div>
    </section>
  );
}

function RefusedPanel({ verdict }) {
  const r = verdict.refusal;
  const isAbsolute = r?.kind === 'absolute';
  return (
    <section
      /* Response-class treatment must match `response-governed-refusal`
       * (oxblood 4px border, cream background) per the frontend design law.
       */
      data-testid={
        isAbsolute
          ? 'use-data-verdict-refused-absolute'
          : 'use-data-verdict-refused-escalatable'
      }
      style={{
        marginTop: '14px',
        padding: '20px 22px',
        background: AKKI_V4_PALETTE.cream,
        border: `4px solid ${AKKI_V4_PALETTE.oxblood}`,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <div
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.2rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        Refused · {isAbsolute ? 'absolute' : 'escalatable'}
      </div>
      <div style={{ marginTop: '8px', color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>
        <div data-testid="use-data-verdict-refusal-criterion">
          <strong>Rule:</strong> {r?.criterion}
        </div>
        {r?.value && (
          <div data-testid="use-data-verdict-refusal-value" style={{ marginTop: '4px' }}>
            <strong>Value:</strong> {r.value}
          </div>
        )}
        {r?.bar_source && (
          <div data-testid="use-data-verdict-refusal-bar-source" style={{ marginTop: '4px' }}>
            <strong>Source:</strong> {r.bar_source}
          </div>
        )}
      </div>
      <CheckList checks={verdict.checks} />
      {isAbsolute ? (
        /* Canon §1.3 · Doctrine 5:
         * "Absolute refusals render no approval affordance of any kind —
         *  not a disabled button, not a request-override link."
         * The tag below is a break-in beacon; testing agent asserts NO
         * button, NO link, NO 'escalate' text renders here.
         */
        <div
          data-testid="use-data-verdict-refusal-no-affordance-beacon"
          style={{
            marginTop: '10px',
            fontSize: '0.78rem',
            color: AKKI_V4_PALETTE.sage,
            fontStyle: 'italic',
          }}
        >
          No approval route exists.
        </div>
      ) : (
        (() => {
          const dest = resolveApprovalDestination(r?.route_to_approval);
          return (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                data-testid="use-data-verdict-refusal-route-label"
                style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.oxblood }}
              >
                Route to approval · {r?.route_to_approval}
              </div>
              {/* Owner iter14 grammar ruling: the route MUST be an
                * interactive element (link/button), not prose. This
                * Link element is the load-bearing asymmetry versus
                * Doctrine 5 absolute refusals which render ZERO
                * interactive elements. */}
              <Link
                to={dest.path}
                data-testid="use-data-verdict-refusal-route-affordance"
                style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  background: AKKI_V4_PALETTE.oxblood,
                  color: AKKI_V4_PALETTE.cream,
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                  letterSpacing: '0.02em',
                  alignSelf: 'flex-start',
                }}
              >
                {dest.label} →
              </Link>
            </div>
          );
        })()
      )}
      <div
        data-testid="use-data-verdict-verbatim-carrier"
        style={{ marginTop: '8px', fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage, fontStyle: 'italic' }}
      >
        {VERBATIM_CARRIER}
      </div>
    </section>
  );
}

function HeldForCheckPanel({ verdict }) {
  const r = verdict.refusal;
  return (
    <section
      data-testid="use-data-verdict-held-for-check"
      style={{
        marginTop: '14px',
        padding: '20px 22px',
        background: AKKI_V4_PALETTE.cream,
        border: `4px dashed ${AKKI_V4_PALETTE.amber}`,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <div
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.2rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        Held for a check
      </div>
      <div style={{ marginTop: '8px', color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>
        <div data-testid="use-data-verdict-held-reason">{r?.criterion}</div>
        <div data-testid="use-data-verdict-held-route" style={{ marginTop: '4px' }}>
          <strong>Pending policy check</strong> · {r?.route_to_approval}
        </div>
        {(() => {
          const dest = resolveApprovalDestination(r?.route_to_approval);
          return (
            <Link
              to={dest.path}
              data-testid="use-data-verdict-held-route-affordance"
              style={{
                display: 'inline-block',
                marginTop: '8px',
                padding: '6px 12px',
                background: AKKI_V4_PALETTE.amber,
                color: AKKI_V4_PALETTE.cream,
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontFamily: AKKI_V4_TYPOGRAPHY.labels,
                letterSpacing: '0.02em',
              }}
            >
              {dest.label} →
            </Link>
          );
        })()}
      </div>
      <div
        data-testid="use-data-verdict-held-ceiling"
        style={{
          marginTop: '10px',
          fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
          fontSize: '0.8rem',
          color: AKKI_V4_PALETTE.sage,
        }}
      >
        auto-run ceiling · ${verdict.auto_run_ceiling.ceiling_usd.toLocaleString()} USD ·
        proposed · ${verdict.auto_run_ceiling.proposed_spend_usd.toLocaleString()} USD
      </div>
      <CheckList checks={verdict.checks} />
      <div
        data-testid="use-data-verdict-verbatim-carrier"
        style={{ marginTop: '8px', fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage, fontStyle: 'italic' }}
      >
        {VERBATIM_CARRIER}
      </div>
    </section>
  );
}

export default function UseDataVerdictPanel({ verdict }) {
  if (!verdict) return null;
  const outcome = verdict.outcome;
  return (
    <div data-testid="use-data-verdict-panel">
      {outcome === 'runs_now' && <RunsNowPanel verdict={verdict} />}
      {outcome === 'refused' && <RefusedPanel verdict={verdict} />}
      {outcome === 'held_for_check' && <HeldForCheckPanel verdict={verdict} />}
    </div>
  );
}
