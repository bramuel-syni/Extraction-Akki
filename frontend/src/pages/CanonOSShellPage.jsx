/* Canon OS root shell — Owner ruling R2 (2026-07-31 addendum).
 *
 * Canon §3.1 fixed nav order:
 *   Connect · Registry · Use Data · Govern · Prove · Team
 *
 * Rules honoured here:
 *   §3.1  — six-tile nav, one row, cream ground.
 *   §3.2  — role-gating; entries for not-yet-rebuilt modules render as
 *           dormant/coming-soon tiles (visibly unlit / hatched) rather
 *           than legacy pages. The retired ask-first landing pattern is
 *           GONE from the root; the retired vocabulary is absent.
 *   R1    — no "RMS Intelligence" · no "Ask Console" · no ask-first
 *           landing pattern on root or in the wordmark.
 *   R3    — Akki v4 aesthetic + Canon vocabulary applied.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AkkiShell, DormantCapabilityChip } from '../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../design/akkiv4_design_system';

/* Canon §3.1 fixed nav (verbatim order · verbatim labels).
 * `state`:
 *   'lit'      → the module is Canon-conformant and reachable.
 *   'partial'  → the module is Canon-conformant but not yet at the
 *                prototype's target shape; honest disclosure lands on
 *                the tile (see e.g., Registry pre UI-1-D).
 *   'dormant'  → the module is scheduled but the surface is not built.
 *                Renders visibly unlit / hatched; no legacy page behind.
 */
export const CANON_NAV = Object.freeze([
  {
    id: 'connect',
    label: 'Connect',
    tagline: 'Bring the estate into a common register.',
    path: '/connect',
    state: 'lit',
    section: 'Canon §4',
  },
  {
    id: 'registry',
    label: 'Registry',
    tagline: 'What you hold. What it says. What it is worth.',
    path: '/registry',
    state: 'partial',
    section: 'Canon §8 · sub-cycle 2 landing · full prototype shape in UI-1-D',
  },
  {
    id: 'use-data',
    label: 'Use Data',
    tagline: 'Turn what the estate holds into use — through one conversation.',
    path: '/use-data',
    state: 'lit',
    section: 'Canon §6',
  },
  {
    id: 'govern',
    label: 'Govern',
    tagline: 'The DPO estate — retention, refusal health, change-a-rule.',
    path: '/govern',
    state: 'lit',
    section: 'Canon §7',
  },
  {
    id: 'prove',
    label: 'Prove',
    tagline: 'Answer with evidence. Honest when it cannot.',
    path: '/prove',
    state: 'lit',
    section: 'Canon §9',
  },
  {
    id: 'team',
    label: 'Team',
    tagline: 'Access register · key-grant admin · role scoping.',
    path: null,
    state: 'dormant',
    section: 'Canon §5 · UI-1-E fold',
  },
]);


function StateBadge({ state }) {
  if (state === 'lit') {
    return (
      <span
        data-testid="canon-nav-state-lit"
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          fontSize: '0.68rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          background: AKKI_V4_PALETTE.navy,
          color: AKKI_V4_PALETTE.cream,
        }}
      >
        Live
      </span>
    );
  }
  if (state === 'partial') {
    return (
      <span
        data-testid="canon-nav-state-partial"
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          fontSize: '0.68rem',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          background: AKKI_V4_PALETTE.amber,
          color: AKKI_V4_PALETTE.cream,
        }}
      >
        Partial
      </span>
    );
  }
  return (
    <span
      data-testid="canon-nav-state-dormant"
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '0.68rem',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        border: `1px dashed ${AKKI_V4_PALETTE.sage}`,
        color: AKKI_V4_PALETTE.sage,
      }}
    >
      Dormant
    </span>
  );
}


function NavTile({ tile }) {
  const isReachable = tile.state !== 'dormant' && tile.path;
  const inner = (
    <div
      data-testid={`canon-nav-tile-${tile.id}`}
      data-testid-state={tile.state}
      style={{
        background:
          tile.state === 'dormant'
            ? `repeating-linear-gradient(45deg, ${AKKI_V4_PALETTE.mist}, ${AKKI_V4_PALETTE.mist} 4px, ${AKKI_V4_PALETTE.bone} 4px, ${AKKI_V4_PALETTE.bone} 8px)`
            : AKKI_V4_PALETTE.bone,
        border:
          tile.state === 'lit'
            ? `1px solid ${AKKI_V4_PALETTE.navy}`
            : tile.state === 'partial'
            ? `1px solid ${AKKI_V4_PALETTE.amber}`
            : `1px dashed ${AKKI_V4_PALETTE.sage}`,
        padding: '20px 22px',
        cursor: isReachable ? 'pointer' : 'not-allowed',
        opacity: tile.state === 'dormant' ? 0.72 : 1,
        transition: 'transform 0.12s ease',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
          <h3
            data-testid={`canon-nav-label-${tile.id}`}
            style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
              fontSize: '1.35rem',
              margin: 0,
              color: AKKI_V4_PALETTE.ink,
            }}
          >
            {tile.label}
          </h3>
          <StateBadge state={tile.state} />
        </div>
        <p
          data-testid={`canon-nav-tagline-${tile.id}`}
          style={{ fontSize: '0.88rem', color: AKKI_V4_PALETTE.sage, margin: '10px 0 0 0', lineHeight: 1.45 }}
        >
          {tile.tagline}
        </p>
      </div>
      <div
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
          fontSize: '0.7rem',
          color: AKKI_V4_PALETTE.sage,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {tile.section}
      </div>
    </div>
  );
  if (isReachable) {
    return (
      <Link
        to={tile.path}
        data-testid={`canon-nav-link-${tile.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}
      >
        {inner}
      </Link>
    );
  }
  return (
    <div data-testid={`canon-nav-tile-nolink-${tile.id}`} style={{ height: '100%' }}>
      {inner}
    </div>
  );
}


/* Canon OS shell page — served at the root path.
 *
 * The wordmark, the six-tile nav (Canon §3.1), a plain-language "What
 * this preview serves" strip (Owner viewable-build addendum: state in
 * each close's WHAT-TO-LOOK-AT which app the root serves), and the
 * standing verbatim binding line (Canon §11.1 · rendered).
 */
export default function CanonOSShellPage() {
  return (
    <AkkiShell
      title="Canon OS"
      subtitle="Read the estate. Answer the question. Every claim receipted at every touch."
    >
      <p
        data-testid="canon-os-preview-what-this-serves"
        style={{
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          padding: '14px 18px',
          margin: '0 0 22px 0',
          fontSize: '0.9rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        <strong style={{ color: AKKI_V4_PALETTE.navy }}>What this preview serves</strong> —
        the Canon OS shell (Owner ruling 2026-07-31 preview-hygiene · standing).
        The root serves the new build only. Five modules are Canon-conformant
        and reachable (Connect · Registry · Use Data · Govern · Prove);
        Team renders dormant until UI-1-E lands.
        No legacy landing renders here.
      </p>

      <nav
        data-testid="canon-os-nav-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          margin: '0 0 28px 0',
        }}
      >
        {CANON_NAV.map((tile) => (
          <NavTile key={tile.id} tile={tile} />
        ))}
      </nav>

      <p
        data-testid="canon-os-canon-11-1-verbatim"
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: AKKI_V4_PALETTE.ink,
          margin: '18px 0 0 0',
        }}
      >
        Conversation shapes; the card commits.
      </p>
    </AkkiShell>
  );
}
