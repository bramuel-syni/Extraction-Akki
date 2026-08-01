/* UI-1-E · Team surface · C · Constitutional Seats.
 * Canon operating model A.5 · dormant-honest succession (no backend seam;
 * adding one would require a new frozen contract → HAZARD-STOP).
 */
import React, { useEffect, useState } from 'react';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';


function SeatCard({ seat }) {
  const vacancy = seat.vacancy_declared;
  return (
    <article
      data-testid={`team-seat-${seat.seat_id}`}
      data-vacancy={String(vacancy)}
      style={{
        padding: '18px 20px', marginBottom: '14px',
        background: AKKI_V4_PALETTE.bone,
        borderLeft: `4px solid ${vacancy ? AKKI_V4_PALETTE.oxblood : AKKI_V4_PALETTE.navy}`,
      }}
    >
      <h3 style={{
        margin: '0 0 4px 0',
        fontFamily: AKKI_V4_TYPOGRAPHY.display, fontSize: '1.1rem',
        color: AKKI_V4_PALETTE.ink,
      }}>
        {seat.label}
      </h3>
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: vacancy ? AKKI_V4_PALETTE.oxblood : AKKI_V4_PALETTE.sage,
        textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px',
      }}>
        {vacancy ? 'Vacant · declared state' : 'Held'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '4px 12px', fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink }}>
        <div style={{ fontWeight: 600 }}>Holder</div>
        <div data-testid={`team-seat-holder-${seat.seat_id}`}>{seat.holder_email || '— (vacant)'}</div>
        {seat.vacancy_reason_plain && (
          <>
            <div style={{ fontWeight: 600 }}>Vacancy reason</div>
            <div data-testid={`team-seat-vacancy-reason-${seat.seat_id}`} style={{ fontStyle: 'italic' }}>
              {seat.vacancy_reason_plain}
            </div>
          </>
        )}
        <div style={{ fontWeight: 600 }}>Succession path</div>
        <div data-testid={`team-seat-succession-path-${seat.seat_id}`} style={{ fontStyle: 'italic', color: AKKI_V4_PALETTE.sage }}>
          {seat.succession_path_plain}
        </div>
      </div>
      <div style={{ marginTop: '12px' }}>
        <button
          type="button"
          data-testid={`team-seat-initiate-succession-btn-${seat.seat_id}`}
          disabled
          style={{
            padding: '6px 14px', background: AKKI_V4_PALETTE.mist,
            color: AKKI_V4_PALETTE.ink, border: 'none',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            cursor: 'not-allowed', opacity: 0.7,
          }}
          title="Dormant — see the reason below."
        >
          Initiate succession · dormant
        </button>
        <div data-testid={`team-seat-action-dormant-reason-${seat.seat_id}`} style={{
          marginTop: '6px', fontSize: '0.78rem', fontStyle: 'italic', color: AKKI_V4_PALETTE.sage,
        }}>
          {seat.action_dormant_reason_plain}
        </div>
      </div>
    </article>
  );
}


export default function TeamConstitutionalSeatsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await api.teamConstitutionalSeats();
      if (cancelled) return;
      setLoading(false);
      if (r.status === 200) { setData(r.body); setError(null); }
      else {
        setError({
          status: r.status,
          reason: (r.body && r.body.reason) || 'load_failed',
          detail: (r.body && r.body.detail) || 'Constitutional seats could not be loaded.',
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AkkiShell title="Team · Constitutional Seats" subtitle="Canon operating model A.5 · Master Admin + DPO">
      <div data-testid="team-constitutional-seats-page" data-canon-ref="Canon operating model A.5">
        <div data-testid="team-seats-action-state-banner" data-action-state={data ? data.action_state : 'loading'} style={{
          padding: '10px 14px', marginBottom: '16px',
          background: AKKI_V4_PALETTE.cream,
          borderLeft: `4px solid ${AKKI_V4_PALETTE.mist}`,
          fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink, fontStyle: 'italic',
        }}>
          <div style={{
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.66rem',
            color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
            letterSpacing: '0.06em', marginBottom: '4px', fontStyle: 'normal',
          }}>
            Action state · {data ? data.action_state : 'loading'} · read-only record
          </div>
          The constitutional seats are rendered as a read-only record until a
          backend succession seam is admitted. Adding one would require a new
          frozen contract (HAZARD-STOP). This is the Canon's four-designed-states
          discipline — the seats are visible; the action is dormant-honest.
        </div>
        {loading && (
          <div data-testid="team-seats-loading" style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage }}>
            Loading seats…
          </div>
        )}
        {error && (
          <div
            data-testid="team-seats-error-panel"
            data-status={String(error.status)}
            style={{
              padding: '14px 18px', background: AKKI_V4_PALETTE.bone,
              borderLeft: `4px solid ${AKKI_V4_PALETTE.amber}`,
            }}
          >
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
              color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: '4px',
            }}>
              Seats unavailable · {error.reason}
            </div>
            <p style={{ margin: 0, color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>{error.detail}</p>
          </div>
        )}
        {data && data.seats.map((seat) => (
          <SeatCard key={seat.seat_id} seat={seat} />
        ))}
      </div>
    </AkkiShell>
  );
}
