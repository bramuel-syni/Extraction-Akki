/* UI-1-E · Team landing · subnav across the three Team sections.
 * The Team module lands here (`/team`) and offers navigation into
 * A · Approval Surface  · B · Access Register  · C · Constitutional Seats.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';


const TEAM_SECTIONS = [
  {
    id: 'approval-surface',
    label: 'A · Approval Surface',
    path: '/team/approval-surface',
    tagline: 'The Master Admin\'s working queue · what · which criterion · cost · who.',
    canon: 'Canon §3.2',
  },
  {
    id: 'access-register',
    label: 'B · Access Register',
    path: '/team/access-register',
    tagline: 'Grants and revocations across roles · single-source with the engineer key-grant seam.',
    canon: 'Canon §3.2',
  },
  {
    id: 'constitutional-seats',
    label: 'C · Constitutional Seats',
    path: '/team/constitutional-seats',
    tagline: 'Master Admin + DPO · read-only record · succession dormant-honest.',
    canon: 'Canon operating model A.5',
  },
];


export default function TeamLandingPage() {
  return (
    <AkkiShell title="Team" subtitle="Canon §3.2 · roles · access · constitutional seats">
      <div data-testid="team-landing-page" data-canon-ref="Canon §3.2 + operating model A.5">
        <p style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage, marginBottom: '20px', fontStyle: 'italic' }}>
          Team is the surface for role-scoped operations · the Master Admin's
          approval queue · the estate's access register · the constitutional
          seats. Every action recorded here is a ledger event.
        </p>
        <div style={{ display: 'grid', gap: '14px' }}>
          {TEAM_SECTIONS.map((s) => (
            <Link
              key={s.id}
              to={s.path}
              data-testid={`team-section-tile-${s.id}`}
              style={{
                display: 'block',
                padding: '18px 22px',
                background: AKKI_V4_PALETTE.bone,
                borderLeft: `4px solid ${AKKI_V4_PALETTE.navy}`,
                textDecoration: 'none',
                color: AKKI_V4_PALETTE.ink,
              }}
            >
              <div style={{
                fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.66rem',
                color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '4px',
              }}>
                {s.canon}
              </div>
              <h3 style={{
                margin: '0 0 6px 0', fontFamily: AKKI_V4_TYPOGRAPHY.display,
                fontSize: '1.05rem', color: AKKI_V4_PALETTE.ink,
              }}>
                {s.label} →
              </h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: AKKI_V4_PALETTE.ink }}>
                {s.tagline}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AkkiShell>
  );
}
