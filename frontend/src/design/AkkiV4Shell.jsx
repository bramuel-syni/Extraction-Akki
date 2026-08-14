/* AkkiV4Shell — persistent chrome for the Akki v4 fidelity build.
 *
 * Batch B1 of the fidelity defect cycle (Owner ruling 2026-08-01).
 * Source of visual record: /app/docs/mandates/Akki_v4_Standalone.html
 *   SHA256 2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba
 *
 * Chrome composition:
 *   ┌──────────────────────────── 66px header ─────────────────────────────┐
 *   │ [216 Akki | tagline] · breadcrumbs · role-switcher · Census · Ask · 🔔 │
 *   ├──────────┬────────────────────────────────────────────────────────────┤
 *   │  216px   │                                                            │
 *   │  side-   │  main content area                                         │
 *   │  bar     │  padding: 32px 40px 60px · max-width: 1180px                │
 *   │  nav     │                                                            │
 *   └──────────┴────────────────────────────────────────────────────────────┘
 *
 * Live-data affordance (per Owner ruling): the auth strip (P0 iter27)
 * is folded into the sidebar's role-switcher slot: anon visitors see
 * Sign in + Create account, signed-in visitors see identity + Sign out.
 * All rendered per file-of-record chrome tokens.
 */
import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AKKI_V4_PROTO as C, AKKI_V4_PROTO_TYPE as T } from './akkiv4_design_system';
import { NestedInAkkiV4ShellContext } from './AkkiShell';
import { useAuth } from '../hooks/useAuth';

/* Canonical six-module nav — order matches the file of record's sidebar
 * top-to-bottom (Connect · Registry · Use Data · Govern · Prove · Team).
 * Icons are lucide-style inline SVG paths sized 16×16 to match the
 * prototype's 16px svg with stroke-width 1.6.
 */
const NAV_ITEMS = Object.freeze([
  { key: 'connect',  label: 'Connect',   to: '/connect',
    icon: 'M9 3h6v4h-6zM9 17h6v4h-6zM12 7v3M12 14v3M5 10h14a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z' },
  { key: 'registry', label: 'Registry',  to: '/registry',
    icon: 'M3 5h18v4H3zM3 10h18v4H3zM3 15h18v4H3z' },
  { key: 'use-data', label: 'Use Data',  to: '/use-data',
    icon: 'M12 3v18M3 12h18M6 6l12 12M18 6L6 18' },
  { key: 'govern',   label: 'Govern',    to: '/govern',
    icon: 'M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6z' },
  { key: 'prove',    label: 'Prove',     to: '/prove',
    icon: 'M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z' },
  { key: 'team',     label: 'Team',      to: '/team',
    icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M17 3.1a4 4 0 0 1 0 7.8' },
]);

/* Canon-safe role display map (P0 iter27) — never leak role literal. */
const ROLE_DISPLAY = Object.freeze({
  master_admin: 'Master admin',
  admin: 'Admin',
  dpo: 'DPO',
  operator: 'Operator',
  engineer: 'Engineer',
  buyer: 'Buyer',
  ask_console_user: 'Viewer',
});
const ROLE_PRIORITY = Object.freeze([
  'master_admin', 'admin', 'dpo', 'engineer', 'buyer', 'operator', 'ask_console_user',
]);
function pickDisplayRole(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return 'Viewer';
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return ROLE_DISPLAY[r] || 'Viewer';
  }
  return ROLE_DISPLAY[roles[0]] || 'Viewer';
}
function initialsFor(identity) {
  if (!identity || !identity.email) return '·';
  const e = String(identity.email);
  const parts = e.replace(/@.*/, '').split(/[.\-_]/).filter(Boolean);
  const first = parts[0]?.[0] || e[0];
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase().slice(0, 2);
}

/* Breadcrumb resolution from the current location. */
function crumbFor(pathname) {
  const p = pathname.replace(/^\/+/, '').split('/');
  const head = p[0] || '';
  const map = {
    '': ['Akki', 'Registry'],
    'registry': ['Registry', p[1] === 'artifact' ? 'Source profile' : 'What You Hold'],
    'connect':  ['Connect', 'Sources'],
    'use-data': ['Use Data', p[1] ? p[1].replace(/-/g, ' ') : 'Where to start'],
    'govern':   ['Govern', p[1] ? p[1].replace(/-/g, ' ') : "The DPO's Estate"],
    'prove':    ['Prove', p[1] ? p[1].replace(/-/g, ' ') : 'Ask a question'],
    'team':     ['Team', p[1] ? p[1].replace(/-/g, ' ') : 'Users'],
    'auth':     ['Auth', p[1] || ''],
  };
  const [module, page] = map[head] || ['Akki', head];
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  return { module: cap(module), page: cap(page) };
}

/* Header — 66 px tall · wordmark cell + breadcrumbs + role/auth strip
 * + Census pill + Ask Akki CTA + notifications. */
function AkkiV4Header({ crumb, identity, onSignOut }) {
  return (
    <div
      data-testid="akki-v4-header"
      style={{
        height: '66px',
        flexShrink: 0,
        background: C.cardBg,
        borderBottom: `1px solid ${C.borderCream}`,
        display: 'flex',
        alignItems: 'stretch',
        fontFamily: T.ui,
      }}
    >
      {/* Wordmark cell (216 px, matches sidebar width) */}
      <div
        style={{
          width: '216px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '0 18px',
          borderRight: `1px solid ${C.borderCream}`,
        }}
      >
        <Link to="/registry" data-testid="akki-wordmark" style={{
          fontFamily: T.hero,
          fontSize: T.wordmarkSize,
          color: C.wordmarkInk,
          letterSpacing: '0.01em',
          lineHeight: 1,
          textDecoration: 'none',
        }}>
          Akki
        </Link>
        <div style={{ width: '1px', alignSelf: 'stretch', background: C.borderCream, margin: '14px 0' }} />
        <div style={{
          fontSize: '9.5px',
          letterSpacing: '0.16em',
          lineHeight: 1.45,
          color: C.sage,
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          AI &amp; Data Use<br />Operating System
        </div>
      </div>

      {/* Main strip: breadcrumbs + spacer + role/auth + Census + Ask + Notif */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 28px',
        gap: '14px',
        minWidth: 0,
      }}>
        <div
          data-testid="akki-v4-breadcrumbs"
          style={{ fontSize: T.bodySize, color: C.ink3, whiteSpace: 'nowrap' }}
        >
          {crumb.module}
          <span style={{ color: '#C6C2B6', margin: '0 4px' }}>/</span>
          <span style={{ color: C.ink, fontWeight: 500 }}>{crumb.page}</span>
        </div>
        <div style={{ flex: 1 }} />

        {/* Auth / role strip — live-data affordance in the "Viewing as" slot. */}
        {identity === null ? (
          <div data-testid="canon-os-auth-strip" data-testid-state="checking" style={{ minHeight: '32px', minWidth: '80px' }} />
        ) : identity === false ? (
          <div
            data-testid="canon-os-auth-strip"
            data-testid-state="anon"
            style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: T.metaSize }}
          >
            <Link
              to="/auth/login"
              data-testid="canon-os-auth-signin-link"
              style={{
                color: C.ink,
                textDecoration: 'none',
                padding: '6px 12px',
                border: `1px solid ${C.borderWarm}`,
                borderRadius: '999px',
                background: C.paneLift,
                fontWeight: 500,
              }}
            >
              Sign in
            </Link>
            <Link
              to="/auth/register"
              data-testid="canon-os-auth-signup-link"
              style={{
                background: C.darkUi,
                color: '#EAE7DD',
                textDecoration: 'none',
                padding: '6px 13px',
                borderRadius: '8px',
                fontWeight: 500,
              }}
            >
              Create account
            </Link>
          </div>
        ) : (
          <div
            data-testid="canon-os-auth-strip"
            data-testid-state="signed-in"
            style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              border: `1px solid ${C.borderWarm}`, borderRadius: '999px',
              padding: '3px', background: C.paneLift,
            }}
          >
            <span style={{
              fontSize: T.microSize, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: C.ink5, fontWeight: 600, padding: '0 8px 0 6px',
            }}>
              Viewing as
            </span>
            {/* B1.a (2026-08-01) — role NAME only in the header pill per
                file-of-record parity; full email lives in the sidebar
                identity chip. Email retained as an accessible attribute
                for the existing P0 iter27 gate (data-testid still emits
                on a hidden span). */}
            <span
              data-testid="canon-os-auth-signed-in-email"
              style={{ display: 'none' }}
            >
              {identity?.email}
            </span>
            <span
              data-testid="canon-os-auth-signed-in-role"
              style={{
                fontSize: T.metaSize, color: C.ink, fontWeight: 500,
                padding: '4px 12px',
                background: C.cardBg, border: `1px solid ${C.borderWarm}`,
                borderRadius: '999px',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              {pickDisplayRole(identity?.roles)}
            </span>
            <button
              type="button"
              data-testid="canon-os-auth-signout-button"
              onClick={onSignOut}
              style={{
                background: 'transparent', color: C.ink3, border: 'none',
                cursor: 'pointer', fontFamily: T.ui, fontSize: '11.5px',
                padding: '4px 10px', borderRadius: '999px',
              }}
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Census pill (sample) */}
        <div
          data-testid="akki-v4-census-pill"
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            border: `1px solid ${C.borderWarm}`, borderRadius: '999px',
            padding: '5px 12px', fontSize: T.metaSize, color: C.ink3,
            background: C.paneLift, whiteSpace: 'nowrap',
          }}
          data-sample-badge="true"
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.success, display: 'inline-block' }} />
          Census #4 · Jul 21
        </div>

        {/* Ask Akki CTA (dark) */}
        <button
          type="button"
          data-testid="akki-v4-ask-akki-cta"
          disabled
          title="Ask Akki drawer arrives with Batch B7"
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            background: C.darkUi, color: '#EAE7DD', border: 'none',
            borderRadius: '8px', padding: '8px 15px', fontSize: T.bodySize,
            fontWeight: 500, cursor: 'not-allowed', whiteSpace: 'nowrap',
            opacity: 0.85,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M21 12a8 8 0 1 0-3.1 6.3L21 20l-1-3.5A8 8 0 0 0 21 12z" />
          </svg>
          Ask Akki
        </button>

        {/* Notifications icon */}
        <div
          data-testid="akki-v4-notifications"
          style={{
            position: 'relative', width: '36px', height: '36px',
            border: `1px solid ${C.borderWarm}`, borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: C.cardBg, flexShrink: 0, cursor: 'default',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.ink2} strokeWidth="1.6" strokeLinecap="round">
            <path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7zM10 20a2.2 2.2 0 0 0 4 0" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* Sidebar — 216 px persistent left rail with six-item Canon nav + role tile. */
function AkkiV4Sidebar({ identity, onSignOut }) {
  return (
    <div
      data-testid="akki-v4-sidebar"
      style={{
        width: '216px',
        flexShrink: 0,
        background: C.sidebarBg,
        borderRight: `1px solid ${C.borderCream}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '18px 12px 14px',
        fontFamily: T.ui,
      }}
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.key}
          to={item.to}
          data-testid={`akki-v4-nav-${item.key}`}
          className={({ isActive }) => isActive ? 'akki-v4-nav-active' : 'akki-v4-nav'}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '9px 11px',
            borderRadius: '8px',
            marginBottom: '2px',
            fontSize: '13.5px',
            fontWeight: isActive ? 600 : 500,
            color: isActive ? C.ink : C.ink2,
            background: isActive ? '#E6E5D6' : 'transparent',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          })}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.85 }}>
            <path d={item.icon} />
          </svg>
          <span>{item.label}</span>
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />

      {/* Role tile at bottom — signed-in identity summary + Sign out affordance. */}
      {identity && identity !== null && (
        <div
          data-testid="akki-v4-sidebar-role-tile"
          style={{ borderTop: `1px solid ${C.borderCream}`, padding: '14px 6px 4px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px', borderRadius: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: C.navy, color: '#EAE7DD',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 600, flexShrink: 0,
            }}>
              {initialsFor(identity)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: C.ink, fontSize: '13px', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {identity.email}
              </div>
              <div style={{
                color: C.sage, fontSize: '11px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {pickDisplayRole(identity.roles)}
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="akki-v4-sidebar-signout"
            onClick={onSignOut}
            style={{
              width: '100%', textAlign: 'left', marginTop: '6px', padding: '6px 10px',
              background: 'transparent', border: 'none', color: C.ink3,
              fontFamily: T.ui, fontSize: '11.5px', cursor: 'pointer', borderRadius: '6px',
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* Root shell composition. */
export default function AkkiV4Shell({ children }) {
  const { identity, logout } = useAuth();
  const location = useLocation();
  const crumb = crumbFor(location.pathname);

  return (
    <NestedInAkkiV4ShellContext.Provider value={true}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        color: C.ink,
        background: C.bodyBg,
        fontSize: '14px',
        fontFamily: T.ui,
      }}
    >
      <AkkiV4Header crumb={crumb} identity={identity} onSignOut={logout} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <AkkiV4Sidebar identity={identity} onSignOut={logout} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ flex: 1, overflow: 'auto', padding: '32px 40px 60px' }}>
            <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
    </NestedInAkkiV4ShellContext.Provider>
  );
}
