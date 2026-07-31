/* UI-1-A · Use Data landing (Canon §6.1 · three doors).
 *
 * Canon law implemented:
 *   §6.1 — "There is no fourth door. Parameter testing is not a door;
 *           it folds in as the Test card."
 *   §3.3 — retired vocabulary MUST NOT render (My Objectives · Approval
 *           Queue · etc.).
 *   §6.5 — pipeline strip: In progress · Ready, beneath the doors.
 *   §11.1 — "Conversation shapes; the card commits." (rendered verbatim
 *           as the design law under the doors).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';

/* Canon §6.1 · three doors — same conversation behind each.
 * Door ids MUST match backend Door enum verbatim (integrate_an_app /
 * export_or_license / train_a_model).
 */
const DOORS = Object.freeze([
  {
    id: 'integrate_an_app',
    label: 'Integrate an App',
    subtitle: 'Turn what the estate holds into an application on governed intelligence.',
    testId: 'use-data-door-integrate-app',
  },
  {
    id: 'export_or_license',
    label: 'Export / License Data',
    subtitle: 'Ship a dataset under its rights, receipted at every touch.',
    testId: 'use-data-door-export-license',
  },
  {
    id: 'train_a_model',
    label: 'Train a Model',
    subtitle: 'A model the organisation owns · training rights inherited.',
    testId: 'use-data-door-train-model',
  },
]);

/* Canon §11.1 verbatim binding copy — rendered as the design law.
 * The Jest gate asserts the RENDERED location, per sub-cycle 3 lesson.
 */
const CANON_S11_1_VERBATIM = 'Conversation shapes; the card commits.';

function DoorCard({ door, onEnter }) {
  return (
    <button
      type="button"
      data-testid={door.testId}
      onClick={() => onEnter(door.id)}
      style={{
        textAlign: 'left',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '28px 26px',
        cursor: 'pointer',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        color: AKKI_V4_PALETTE.ink,
        transition: 'border-color 0.12s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = AKKI_V4_PALETTE.navy)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = AKKI_V4_PALETTE.mist)}
    >
      <div
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.35rem',
          color: AKKI_V4_PALETTE.ink,
          marginBottom: '8px',
        }}
      >
        {door.label}
      </div>
      <div
        style={{
          fontSize: '0.9rem',
          color: AKKI_V4_PALETTE.sage,
          lineHeight: '1.45',
        }}
      >
        {door.subtitle}
      </div>
    </button>
  );
}

function SampleBadge() {
  /* AS-U2 — Owner viewable-build addendum verbatim:
   *   "seeded with fixture data VISIBLY MARKED as sample (AS-U2 — an
   *    unmarked sample is a hidden mock and prohibited)"
   * The badge renders on every row and detail whose `is_sample=true`.
   */
  return (
    <span
      data-testid="use-data-sample-badge"
      style={{
        display: 'inline-block',
        marginLeft: '8px',
        padding: '2px 6px',
        background: AKKI_V4_PALETTE.amber,
        color: AKKI_V4_PALETTE.cream,
        fontSize: '0.65rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
      }}
    >
      SAMPLE
    </span>
  );
}

function PipelineRow({ row, testIdPrefix, onOpen }) {
  return (
    <div
      data-testid={`${testIdPrefix}-${row.session_id}`}
      onClick={() => onOpen(row.session_id)}
      style={{
        padding: '8px 10px',
        borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
        cursor: 'pointer',
        fontSize: '0.85rem',
        color: AKKI_V4_PALETTE.ink,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = AKKI_V4_PALETTE.mist)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.78rem' }}>
          {row.door.replaceAll('_', ' ')}
        </strong>
        {row.is_sample && <SampleBadge />}
      </div>
      <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem', marginTop: '2px' }}>
        {row.session_id}
      </div>
    </div>
  );
}

function PipelineStrip({ ceilingUsd, pipeline, onOpen }) {
  /* Canon §6.5 · two sections beneath the doors: In progress · Ready. */
  const inProgress = pipeline?.in_progress || [];
  const ready = pipeline?.ready || [];
  return (
    <section
      data-testid="use-data-pipeline-strip"
      style={{
        marginTop: '36px',
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        background: AKKI_V4_PALETTE.bone,
        padding: '20px 24px',
      }}
    >
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h3
            style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
              fontSize: '1rem',
              margin: '0 0 8px 0',
              color: AKKI_V4_PALETTE.ink,
            }}
            data-testid="use-data-pipeline-in-progress-heading"
          >
            In progress
          </h3>
          {inProgress.length === 0 ? (
            <div
              style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}
              data-testid="use-data-pipeline-in-progress-empty"
            >
              No commissions in progress.
            </div>
          ) : (
            <div data-testid="use-data-pipeline-in-progress-list">
              {inProgress.map((row) => (
                <PipelineRow
                  key={row.session_id}
                  row={row}
                  testIdPrefix="use-data-pipeline-in-progress-row"
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h3
            style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
              fontSize: '1rem',
              margin: '0 0 8px 0',
              color: AKKI_V4_PALETTE.ink,
            }}
            data-testid="use-data-pipeline-ready-heading"
          >
            Ready
          </h3>
          {ready.length === 0 ? (
            <div
              style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}
              data-testid="use-data-pipeline-ready-empty"
            >
              No ready artefacts yet.
            </div>
          ) : (
            <div data-testid="use-data-pipeline-ready-list">
              {ready.map((row) => (
                <PipelineRow
                  key={row.session_id}
                  row={row}
                  testIdPrefix="use-data-pipeline-ready-row"
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        style={{
          marginTop: '18px',
          fontFamily: AKKI_V4_TYPOGRAPHY.monoLine,
          fontSize: '0.75rem',
          color: AKKI_V4_PALETTE.sage,
        }}
        data-testid="use-data-pipeline-ceiling-note"
      >
        auto-run ceiling · ${(ceilingUsd ?? 0).toLocaleString()} USD · change path: Change-a-Rule
      </div>
    </section>
  );
}

export default function UseDataLandingPage() {
  const [ceilingUsd, setCeilingUsd] = useState(null);
  const [pipeline, setPipeline] = useState({ in_progress: [], ready: [] });
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);
  const [opening, setOpening] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const rCeiling = await api.useDataCeiling();
      if (rCeiling.status >= 500) {
        setFault(rCeiling.body);
        return;
      }
      if (rCeiling.status === 401 || rCeiling.status === 403) {
        setDeny(rCeiling.body);
        return;
      }
      setCeilingUsd(rCeiling.body?.ceiling_usd);
      const rList = await api.useDataListSessions();
      if (rList.status === 200 && rList.body) {
        setPipeline(rList.body);
      }
    })();
  }, []);

  async function enterDoor(doorId) {
    setOpening(doorId);
    const r = await api.useDataOpenSession(doorId);
    setOpening(null);
    if (r.status === 401 || r.status === 403) {
      setDeny(r.body);
      return;
    }
    if (r.status >= 500) {
      setFault(r.body);
      return;
    }
    if (r.status === 200 && r.body?.session_id) {
      navigate(`/use-data/wizard/${encodeURIComponent(r.body.session_id)}`);
    }
  }

  function openSession(sessionId) {
    navigate(`/use-data/wizard/${encodeURIComponent(sessionId)}`);
  }

  if (deny) {
    return (
      <AkkiShell title="Use Data" subtitle="Turn what the estate holds into use.">
        <AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Use Data" subtitle="Turn what the estate holds into use.">
        <InfrastructureFaultPanel headline="use-data ceiling read failed" detail={fault?.detail} />
      </AkkiShell>
    );
  }

  return (
    <AkkiShell title="Use Data" subtitle="Turn what the estate holds into use.">
      <p
        data-testid="use-data-canon-11-1-verbatim"
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1.1rem',
          color: AKKI_V4_PALETTE.ink,
          margin: '0 0 28px 0',
          fontStyle: 'italic',
        }}
      >
        {CANON_S11_1_VERBATIM}
      </p>
      <section
        data-testid="use-data-doors"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
        }}
      >
        {DOORS.map((d) => (
          <DoorCard
            key={d.id}
            door={d}
            onEnter={enterDoor}
          />
        ))}
      </section>
      {opening && (
        <div
          data-testid="use-data-opening-status"
          style={{ marginTop: '18px', color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem' }}
        >
          opening conversation …
        </div>
      )}
      <PipelineStrip
        ceilingUsd={ceilingUsd}
        pipeline={pipeline}
        onOpen={openSession}
      />
    </AkkiShell>
  );
}
