import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';

/* Commission View home — FB-5 front page.
 *
 * Owner verbatim (FB-5):
 *   "Front page is the agreed milestone checklist: each milestone, its
 *    done-condition, its owner, status in plain terms — done · on track ·
 *    behind · missed shown as plainly as done — with spend against quote
 *    at the same plain level. Technical material (calibration results,
 *    coverage, checks) is drill-down evidence, never the front page."
 *
 * FB-18 gate_commission_view_reads_only_existing_artifacts: this surface
 * reads ONLY existing artifacts (wizard sessions + milestone sidecar).
 * No new backend compute — recorded as a load-bearing constraint here.
 *
 * At sub-cycle 1 landing we do not yet have the list-my-sessions endpoint;
 * this front page renders per-session via `/commission-view/:sessionId`
 * (drill-down) and provides a "load by session id" entry as the entry
 * seam. Later sub-cycles add a proper list surface.
 */
export default function CommissionViewHomePage() {
  const [sessionId, setSessionId] = useState('');
  const [note, setNote] = useState(null);

  return (
    <AkkiShell
      title="Commission View"
      subtitle="Milestone tracking · spend against quote · one trace thread"
    >
      <section style={{
        background: AKKI_V4_PALETTE.bone,
        padding: '16px 18px',
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        maxWidth: '640px',
        marginBottom: '20px',
      }} data-testid="commission-view-home-entry">
        <div style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.05rem',
          color: AKKI_V4_PALETTE.ink,
          marginBottom: '8px',
        }}>Open a Commission View</div>
        <div style={{
          fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginBottom: '12px',
        }}>
          Every commissioned work — extraction, training, export, integration
          alike — is tracked here. Milestone status leads; technical evidence
          lives one level down. Enter a wizard session id to open its view.
        </div>
        <input
          data-testid="commission-view-session-input"
          placeholder="e.g. session_xxxxxx"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          style={{
            width: '100%', padding: '8px', marginBottom: '10px',
            fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
            border: `1px solid ${AKKI_V4_PALETTE.navy}`,
            background: AKKI_V4_PALETTE.cream,
          }}
        />
        <Link
          data-testid="commission-view-open-btn"
          to={sessionId ? `/commission-view/${sessionId}` : '#'}
          onClick={(e) => {
            if (!sessionId) {
              e.preventDefault();
              setNote('Enter a session id first.');
            }
          }}
          style={{
            display: 'inline-block',
            background: AKKI_V4_PALETTE.navy,
            color: AKKI_V4_PALETTE.cream,
            padding: '10px 16px',
            textDecoration: 'none',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          }}
        >Open Commission View</Link>
        {note && (
          <div data-testid="commission-view-note" style={{
            marginTop: '10px', color: AKKI_V4_PALETTE.amber, fontSize: '0.85rem',
          }}>{note}</div>
        )}
      </section>

      <section style={{
        maxWidth: '640px', fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage,
      }}>
        <div>
          <strong style={{ color: AKKI_V4_PALETTE.ink }}>Front page discipline (FB-5):</strong>
        </div>
        <ul style={{ marginTop: '6px', paddingLeft: '20px' }}>
          <li>Milestones — description · done-condition · owner · status (done · on track · behind · <span style={{ color: AKKI_V4_PALETTE.oxblood }}><em>missed as plainly as done</em></span>).</li>
          <li>Spend against quote at the same plain level.</li>
          <li>Technical material (calibration, coverage, checks) is drill-down only — never on the front page.</li>
        </ul>
      </section>
    </AkkiShell>
  );
}
