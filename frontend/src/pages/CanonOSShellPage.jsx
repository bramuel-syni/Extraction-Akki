/* Canon OS root shell — Owner ruling R2 (2026-07-31 addendum).
 *
 * Canon §3.1 fixed nav order:
 *   Connect · Registry · Use Data · Govern · Prove · Team
 *
 * All six modules light after UI-1-E (Team). The nav strip renders in
 * Canon order (Connect first, Team last), retired vocabulary purged.
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
import { useAuth } from '../hooks/useAuth';

/* Owner P0 fix (2026-08-02) — "can't sign up".
 * Root cause: UI-1-A retirement rebuilt the root as the six-tile shell but
 * dropped the login/register entry points. Fresh visitors had zero path to
 * self-signup. Fix: render an auth strip in the AkkiShell header `right`
 * slot with three states (anon · signed-in · checking).
 *
 * Role display map — Canon-safe plain labels. Retired-vocab gate is
 * case-insensitive; `ask_console_user` renders as "Viewer" to avoid
 * reintroducing retired vocabulary and to speak Canon.
 */
const ROLE_DISPLAY = Object.freeze({
  master_admin: 'Master admin',
  admin: 'Admin',
  dpo: 'DPO',
  operator: 'Operator',
  engineer: 'Engineer',
  buyer: 'Buyer',
  ask_console_user: 'Viewer',
});

// Highest-priority role first (for identities with multiple roles).
const ROLE_PRIORITY = Object.freeze([
  'master_admin', 'admin', 'dpo', 'engineer', 'buyer', 'operator', 'ask_console_user',
]);

function pickDisplayRole(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return 'Viewer';
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return ROLE_DISPLAY[r] || 'Viewer';
  }
  // Fallback: first role, mapped or plain.
  const first = roles[0];
  return ROLE_DISPLAY[first] || 'Viewer';
}

function CanonAuthStrip() {
  const { identity, logout } = useAuth();
  // identity === null → checking; render placeholder to avoid layout flash.
  if (identity === null) {
    return <div data-testid="canon-os-auth-strip" data-testid-state="checking" style={{ minHeight: '32px' }} />;
  }
  if (identity === false) {
    // Anonymous — the P0 fix: both entry points are visible on the root.
    return (
      <div
        data-testid="canon-os-auth-strip"
        data-testid-state="anon"
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.85rem',
        }}
      >
        <Link
          to="/auth/login"
          data-testid="canon-os-auth-signin-link"
          style={{
            color: AKKI_V4_PALETTE.navy,
            textDecoration: 'none',
            padding: '6px 10px',
            border: `1px solid transparent`,
          }}
        >
          Sign in
        </Link>
        <Link
          to="/auth/register"
          data-testid="canon-os-auth-signup-link"
          style={{
            background: AKKI_V4_PALETTE.navy,
            color: AKKI_V4_PALETTE.cream,
            textDecoration: 'none',
            padding: '6px 12px',
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          Create account
        </Link>
      </div>
    );
  }
  // Signed-in — render email + Canon-safe role label + Sign out.
  const roleLabel = pickDisplayRole(identity?.roles);
  return (
    <div
      data-testid="canon-os-auth-strip"
      data-testid-state="signed-in"
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.85rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.25 }}>
        <span
          data-testid="canon-os-auth-signed-in-email"
          style={{ color: AKKI_V4_PALETTE.ink, fontWeight: 500 }}
        >
          {identity?.email}
        </span>
        <span
          data-testid="canon-os-auth-signed-in-role"
          style={{
            color: AKKI_V4_PALETTE.sage, fontSize: '0.72rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          {roleLabel}
        </span>
      </div>
      <button
        type="button"
        data-testid="canon-os-auth-signout-button"
        onClick={logout}
        style={{
          background: 'transparent',
          color: AKKI_V4_PALETTE.navy,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          padding: '6px 12px',
          cursor: 'pointer',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          fontSize: '0.8rem',
        }}
      >
        Sign out
      </button>
    </div>
  );
}

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
    state: 'lit',
    section: 'Canon §5 · UI-1-D',
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
    tagline: 'Approval surface · access register · constitutional seats.',
    path: '/team',
    state: 'lit',
    section: 'Canon §3.2 · UI-1-E',
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
      right={<CanonAuthStrip />}
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
        The root serves the new build only. All six modules are Canon-conformant
        and reachable (Connect · Registry · Use Data · Govern · Prove · Team).
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
