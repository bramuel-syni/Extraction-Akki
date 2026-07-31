/* UI-1-B · Registries submodule (Canon §7.4 · Class-D).
 *
 * Flow: paste rows → upload (schema validate) → diff (added/removed/
 * changed) → confirm.
 *
 * Owner-ruled ASYMMETRY (server-enforced):
 *   additions → immediate (commit succeeds, receipted, versioned).
 *   removals + edits → REFUSED · caller must route through Change-a-Rule
 *   ceremony (Canon §7.5 · EE-R4 no parallel approval).
 *
 * Every commit lands: version + effective-from + receipt + rollback
 * available through versions list.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel } from '../../design/ResponseClassPanel';

const SAMPLE_ROWS = [
  { id: 'partner-alpha', name: 'Alpha Ltd', status: 'active', region: 'EU' },
  { id: 'partner-beta', name: 'Beta Inc', status: 'active', region: 'US' },
];

function DiffRow({ label, rows, testId, tone }) {
  return (
    <div
      data-testid={testId}
      style={{
        padding: '10px 12px',
        marginBottom: '10px',
        borderLeft: `4px solid ${tone}`,
        background: AKKI_V4_PALETTE.bone,
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
      }}
    >
      <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '0.95rem', color: AKKI_V4_PALETTE.ink, marginBottom: '6px' }}>
        {label} · {rows.length}
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage }}>— none —</div>
      ) : (
        <ul style={{ margin: 0, padding: '0 0 0 18px', fontSize: '0.8rem', color: AKKI_V4_PALETTE.ink }}>
          {rows.map((r, i) => (
            <li key={i} style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, marginBottom: '2px' }}>
              {JSON.stringify(r)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GovernRegistriesPage() {
  const [registryName, setRegistryName] = useState('partner_registry');
  const [rowsText, setRowsText] = useState(JSON.stringify(SAMPLE_ROWS, null, 2));
  const [uploadId, setUploadId] = useState(null);
  const [diff, setDiff] = useState(null);
  const [commit, setCommit] = useState(null);
  const [error, setError] = useState(null);
  const [deny, setDeny] = useState(null);
  const [step, setStep] = useState('upload'); // upload | diff | commit

  async function submitUpload() {
    setError(null); setDiff(null); setCommit(null);
    let rows;
    try {
      rows = JSON.parse(rowsText);
      if (!Array.isArray(rows)) throw new Error('rows must be a JSON array');
    } catch (e) {
      setError({ reason: 'client_parse_error', detail: String(e) });
      return;
    }
    const r = await api.governRegistryUpload(registryName, rows);
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    if (r.status !== 200) { setError(r.body); return; }
    setUploadId(r.body.upload_id);
    setStep('diff');
    const rDiff = await api.governRegistryDiff(r.body.upload_id);
    if (rDiff.status === 200) setDiff(rDiff.body);
    else setError(rDiff.body);
  }

  async function submitCommit() {
    if (!uploadId) return;
    setError(null); setCommit(null);
    const r = await api.governRegistryCommit(uploadId);
    if (r.status === 401 || r.status === 403) { setDeny(r.body); return; }
    if (r.status === 200) {
      setCommit(r.body);
      setStep('commit');
    } else {
      setError(r.body);
    }
  }

  if (deny) return (
    <AkkiShell title="Registries · Govern"><AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} /></AkkiShell>
  );

  return (
    <AkkiShell title="Registries · Govern" subtitle="Canon §7.4 · Class-D · additions immediate · removals+edits via Change-a-Rule.">
      <p style={{ marginBottom: '18px' }}>
        <Link to="/govern" data-testid="registries-back-link" style={{ color: AKKI_V4_PALETTE.navy }}>
          ← Trust Center
        </Link>
      </p>

      {/* ---- ASYMMETRY DOCTRINE (rendered verbatim) ---- */}
      <div
        data-testid="registries-asymmetry-doctrine"
        style={{
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          padding: '14px 18px',
          marginBottom: '18px',
          fontSize: '0.88rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        <strong style={{ color: AKKI_V4_PALETTE.navy }}>Canon §7.4 asymmetry</strong> — additions
        take effect <strong>immediately</strong>; removals + edits <strong>require approval</strong> via
        the Change-a-Rule ceremony (Canon §7.5). The server enforces this rule — a commit
        containing removals or edits will be refused with the approval route.
      </div>

      {/* ---- STEP 1: Upload ---- */}
      <section
        data-testid="registries-step-upload"
        style={{
          background: AKKI_V4_PALETTE.bone,
          border: `1px solid ${AKKI_V4_PALETTE.mist}`,
          padding: '20px 22px',
          marginBottom: '18px',
        }}
      >
        <h3 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', margin: '0 0 12px 0' }}>1 · Upload</h3>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage }}>Registry name</div>
          <input
            data-testid="registries-registry-name"
            type="text"
            value={registryName}
            onChange={(e) => setRegistryName(e.target.value)}
            style={{
              width: '100%', padding: '6px 8px', border: `1px solid ${AKKI_V4_PALETTE.mist}`,
              fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.85rem',
            }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.78rem', color: AKKI_V4_PALETTE.sage }}>Rows (JSON array · every row MUST carry `id`)</div>
          <textarea
            data-testid="registries-rows-text"
            value={rowsText}
            onChange={(e) => setRowsText(e.target.value)}
            rows={8}
            style={{
              width: '100%', padding: '8px', border: `1px solid ${AKKI_V4_PALETTE.mist}`,
              fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.8rem', boxSizing: 'border-box',
            }}
          />
        </label>
        <button
          type="button"
          data-testid="registries-upload-btn"
          onClick={submitUpload}
          style={{
            background: AKKI_V4_PALETTE.navy, color: AKKI_V4_PALETTE.cream,
            border: 'none', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          }}
        >
          Upload &amp; diff
        </button>
      </section>

      {/* ---- STEP 2: Diff ---- */}
      {diff && (
        <section
          data-testid="registries-step-diff"
          style={{
            background: AKKI_V4_PALETTE.bone,
            border: `1px solid ${AKKI_V4_PALETTE.mist}`,
            padding: '20px 22px',
            marginBottom: '18px',
          }}
        >
          <h3 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', margin: '0 0 12px 0' }}>
            2 · Diff · {diff.registry_name}
          </h3>
          <DiffRow label="Added" rows={diff.added} testId="registries-diff-added" tone={AKKI_V4_PALETTE.navy} />
          <DiffRow label="Removed" rows={diff.removed} testId="registries-diff-removed" tone={AKKI_V4_PALETTE.oxblood} />
          <DiffRow label="Changed" rows={diff.changed} testId="registries-diff-changed" tone={AKKI_V4_PALETTE.amber} />
          {diff.approval_required ? (
            <div
              data-testid="registries-diff-approval-required"
              style={{ marginTop: '12px', color: AKKI_V4_PALETTE.oxblood, fontSize: '0.9rem' }}
            >
              This upload contains removals or edits. Commit is refused server-side. Route the
              change via the Change-a-Rule ceremony.
              <Link
                to="/govern/change-rule"
                data-testid="registries-diff-change-a-rule-affordance"
                style={{
                  display: 'inline-block', marginLeft: '10px',
                  background: AKKI_V4_PALETTE.oxblood, color: AKKI_V4_PALETTE.cream,
                  padding: '4px 10px', textDecoration: 'none', fontSize: '0.8rem',
                }}
              >
                Open Change-a-Rule →
              </Link>
            </div>
          ) : (
            <button
              type="button"
              data-testid="registries-commit-btn"
              onClick={submitCommit}
              style={{
                marginTop: '12px',
                background: AKKI_V4_PALETTE.navy, color: AKKI_V4_PALETTE.cream,
                border: 'none', padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              }}
            >
              Commit additions
            </button>
          )}
        </section>
      )}

      {/* ---- STEP 3: Commit receipt ---- */}
      {commit && (
        <section
          data-testid="registries-step-commit"
          style={{
            background: AKKI_V4_PALETTE.bone,
            border: `4px solid ${AKKI_V4_PALETTE.navy}`,
            padding: '20px 22px',
            marginBottom: '18px',
          }}
        >
          <h3 style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1.1rem', margin: '0 0 12px 0' }}>
            3 · Committed · version {commit.version}
          </h3>
          <div data-testid="registries-commit-receipt" style={{ fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}>
            registry · {commit.registry_name}<br />
            version · {commit.version}<br />
            effective_from · {commit.effective_from_iso}<br />
            receipt · {commit.receipt_ref}<br />
            row_count · {commit.row_count}
          </div>
        </section>
      )}

      {/* ---- Error rendering (governed grammar) ---- */}
      {error && (
        <section
          data-testid="registries-error"
          style={{
            background: AKKI_V4_PALETTE.cream,
            border: `4px solid ${AKKI_V4_PALETTE.oxblood}`,
            padding: '16px 18px',
            marginBottom: '18px',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          }}
        >
          <div style={{ fontFamily: AKKI_V4_TYPOGRAPHY.wordmark, fontSize: '1rem', color: AKKI_V4_PALETTE.ink }}>
            Refused · {error.reason}
          </div>
          <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>{error.detail}</div>
          {error.route_to_approval && (
            <Link
              to="/govern/change-rule"
              data-testid="registries-error-route-affordance"
              style={{
                display: 'inline-block', marginTop: '10px',
                background: AKKI_V4_PALETTE.oxblood, color: AKKI_V4_PALETTE.cream,
                padding: '6px 12px', textDecoration: 'none', fontSize: '0.85rem',
              }}
            >
              Open Change-a-Rule →
            </Link>
          )}
          {error.errors && (
            <ul style={{ margin: '10px 0 0 20px', fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage }}>
              {error.errors.map((e, i) => (
                <li key={i}>row {e.row_index} — {e.error}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </AkkiShell>
  );
}
