import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import {
  AccessControlDeniedPanel,
  GovernedRefusalCard,
  InfrastructureFaultPanel,
} from '../../design/ResponseClassPanel';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';
import { FROZEN_IS_IMMUTABLE } from '../../design/ratified_copy';

/* Memory plane detail — five-ring-aware surface.
 *
 * Renders:
 *   • plane envelope + state chip (active vs frozen · revoked)
 *   • reconstructed_state (contribution ids + counts)
 *   • publication ceremony action — surfaced but SLOT unset by design;
 *     clicking it renders the fail-loud governed refusal
 *     `publication_quality_threshold_unset` (Owner directive: the SLOT
 *     being unset is a DESIGNED STATE, show it as such).
 *   • revocation action — dormant unless plane is active and admin OR
 *     the key-holder identity. Rendered per Ruling 4 "Frozen is immutable."
 */
export default function MemoryPlaneDetailPage() {
  const { planeId } = useParams();
  const [plane, setPlane] = useState(null);
  const [reconstructed, setReconstructed] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [pubRefusal, setPubRefusal] = useState(null);

  const load = async () => {
    setPubRefusal(null);
    const r = await api.memoryGetPlane(planeId);
    if (r.status === 200) setPlane(r.body);
    else if (r.status === 401 || r.status === 403) setDeny(r.body);
    else if (r.status === 422 && r.body?.outcome === 'refused' && r.body?.reason === 'plane_not_found') setNotFound(true);
    else if (r.status >= 500) setFault({ status: r.status, body: r.body });
    const rc = await api.memoryGetReconstructedState(planeId);
    if (rc.status === 200) setReconstructed(rc.body);
  };

  useEffect(() => { load(); }, [planeId]);  // eslint-disable-line react-hooks/exhaustive-deps

  const attemptPublish = async () => {
    // Owner directive: PUBLICATION_QUALITY_THRESHOLD [SLOT] is UNSET by
    // design. Attempting publication produces publication_quality_threshold_unset.
    // Rendering the fail-loud refusal IS the sub-cycle 2 design.
    const cid = reconstructed?.contribution_ids?.[0] || 'wb-none';
    const r = await api.memoryAttemptPublish(planeId, cid, 99.0);
    if (r.body && r.body.outcome === 'refused') setPubRefusal(r.body);
    else setPubRefusal({
      outcome: 'refused', reason: 'unexpected_response',
      detail: 'Backend responded outside the governed-refusal envelope.',
    });
  };

  if (deny) {
    return (
      <AkkiShell title="Memory Service · plane detail" subtitle={planeId}>
        <AccessControlDeniedPanel reason={deny.reason} detail={deny.detail} traceId={planeId} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Memory Service · plane detail" subtitle={planeId}>
        <InfrastructureFaultPanel headline={`status ${fault.status}`} detail="The backend returned an infrastructure fault." traceId={planeId} />
      </AkkiShell>
    );
  }
  if (notFound) {
    return (
      <AkkiShell title="Memory Service · plane detail" subtitle={planeId}>
        <GovernedRefusalCard
          reason="plane_not_found"
          detail={`No memory plane matches id ${planeId}.`}
          traceId={planeId}
          onAccept={() => {}}
          onNarrow={() => {}}
          onLower={() => {}}
        />
      </AkkiShell>
    );
  }
  if (!plane) {
    return (
      <AkkiShell title="Memory Service · plane detail" subtitle={planeId}>
        <div style={{ color: AKKI_V4_PALETTE.sage }}>Reading plane…</div>
      </AkkiShell>
    );
  }

  const revoked = plane.state === 'revoked';

  return (
    <AkkiShell
      title="Memory Service · plane detail"
      subtitle={`${planeId} · ${plane.state}`}
      traceId={planeId}
      right={<Link to="/memory" data-testid="plane-detail-back" style={{ color: AKKI_V4_PALETTE.navy }}>← plane list</Link>}
    >
      <section style={{
        background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px', marginBottom: '16px',
      }} data-testid="plane-envelope-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.2rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
            Envelope · <span data-testid="plane-class-with-claim">class · plane_v0</span>
          </h2>
          {revoked ? (
            <span data-testid="plane-frozen-chip" style={{
              background: AKKI_V4_PALETTE.oxblood, color: AKKI_V4_PALETTE.cream,
              padding: '5px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700,
            }}>frozen · {FROZEN_IS_IMMUTABLE}</span>
          ) : (
            <span style={{
              background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.navy}`,
              padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', color: AKKI_V4_PALETTE.navy,
            }} data-testid="plane-active-chip">active</span>
          )}
        </div>
        <div style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.navy, marginTop: '8px' }}>
          <div>issued_to_integration_key · <code data-testid="plane-key">{plane.issued_to_integration_key}</code></div>
          <div>tenant_id · <code>{plane.tenant_id}</code></div>
          <div>retrieval_scope · <code>{plane.retrieval_scope}</code></div>
          <div>contribution_store_ref · <code>{plane.contribution_store_ref}</code></div>
          <div>working_set_ref · <code>{plane.working_set_ref}</code></div>
          <div>issued_at · <code>{plane.issued_at}</code></div>
          {revoked && <div>revoked_at · <code>{plane.revoked_at || <MarkedOpenSlot slotName="revoked_at" />}</code></div>}
        </div>
      </section>

      <section data-testid="plane-contributions-section" style={{
        background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px', marginBottom: '16px',
      }}>
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
          Contribution history · five-ring aware
        </h2>
        <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginTop: '6px' }}>
          Class-with-claim discipline: each contribution row surfaces its
          <em> class_declared</em> together with the claim.
        </div>
        {reconstructed ? (
          <ul data-testid="contribution-id-list" style={{ paddingLeft: '18px', marginTop: '10px', fontSize: '0.85rem' }}>
            {(reconstructed.contribution_ids || []).length === 0 && (
              <li style={{ color: AKKI_V4_PALETTE.sage, fontStyle: 'italic' }}>
                No landed contributions yet.
              </li>
            )}
            {(reconstructed.contribution_ids || []).map((cid) => (
              <li key={cid} data-testid={`contribution-row-${cid}`}>
                <code>{cid}</code> · <em style={{ color: AKKI_V4_PALETTE.navy }}>class_declared</em>: <MarkedOpenSlot slotName={`class_declared_${cid.slice(-6)}`} note="Reads via reconstructed_state; full row detail via observability panel." />
              </li>
            ))}
          </ul>
        ) : (
          <div style={{ color: AKKI_V4_PALETTE.sage, marginTop: '10px' }}>Reading contribution history…</div>
        )}
        <div style={{ marginTop: '10px', display: 'flex', gap: '20px', fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy }}>
          <div data-testid="contribution-landed-count">landed · <strong>{reconstructed?.contributions_landed_count ?? '—'}</strong></div>
          <div data-testid="contribution-refused-count">refused · <strong>{reconstructed?.contributions_refused_count ?? '—'}</strong></div>
        </div>
      </section>

      <section data-testid="plane-publication-section" style={{
        background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '14px 18px', marginBottom: '16px',
      }}>
        <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.ink, margin: 0 }}>
          Publication ceremony
        </h2>
        <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginTop: '6px' }}>
          Publication is a SEPARATE governed act; never automatic.
          <br />
          <strong>Threshold</strong> · <MarkedOpenSlot slotName="publication_quality_threshold" note="PUBLICATION_QUALITY_THRESHOLD [SLOT] unset by design (SR-5 fail-loud)." />
        </div>
        <button
          type="button"
          data-testid="publication-attempt-btn"
          onClick={attemptPublish}
          disabled={revoked}
          style={{
            marginTop: '10px', padding: '8px 14px',
            background: revoked ? AKKI_V4_PALETTE.mist : AKKI_V4_PALETTE.navy,
            color: revoked ? AKKI_V4_PALETTE.sage : AKKI_V4_PALETTE.cream,
            border: 'none', fontFamily: AKKI_V4_TYPOGRAPHY.labels, cursor: revoked ? 'not-allowed' : 'pointer',
          }}
        >
          {revoked ? 'Frozen · publish not possible' : 'Attempt publication (SLOT unset — will refuse fail-loud)'}
        </button>
        {pubRefusal && (
          <GovernedRefusalCard
            reason={pubRefusal.reason}
            detail={pubRefusal.detail}
            traceId={planeId}
            onAccept={() => setPubRefusal(null)}
            onNarrow={() => setPubRefusal(null)}
            onLower={() => setPubRefusal(null)}
          />
        )}
      </section>

      {!revoked && (
        <section data-testid="plane-revocation-section" style={{
          background: AKKI_V4_PALETTE.bone, border: `1px solid ${AKKI_V4_PALETTE.oxblood}`,
          padding: '14px 18px',
        }}>
          <h2 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', color: AKKI_V4_PALETTE.oxblood, margin: 0 }}>
            Revocation · immediate freeze
          </h2>
          <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.navy, marginTop: '6px' }}>
            Revocation freezes the plane immediately: no further contributions can land, no working-set operations can run. Idempotent — re-revoke returns the current doc with <code>already_revoked=true</code>.
          </div>
          <button
            type="button"
            data-testid="plane-revoke-btn"
            onClick={async () => {
              if (!window.confirm('Revoke this plane? Immediate freeze; irreversible except by the audit ledger.')) return;
              await api.memoryRevokePlane(planeId, 'operator-initiated');
              await load();
            }}
            style={{
              marginTop: '10px', padding: '8px 14px',
              background: AKKI_V4_PALETTE.oxblood, color: AKKI_V4_PALETTE.cream,
              border: 'none', fontFamily: AKKI_V4_TYPOGRAPHY.labels, cursor: 'pointer',
            }}
          >
            Revoke plane (freezes immediately)
          </button>
        </section>
      )}
    </AkkiShell>
  );
}
