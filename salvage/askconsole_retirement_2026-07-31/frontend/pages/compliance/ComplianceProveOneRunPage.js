/**
 * v2.1 §4.2 — Prove one run.
 *
 * Banner: lawfulness banner (lawful-basis · commissioner · frozen and immutable).
 * Record rows (5 exact):
 *   1. Lawful basis  — "verified present at admission"
 *   2. Scope         — "nothing mined outside it"
 *   3. Refused       — "{n} items — below the required standard, recorded
 *                        not dropped" + See them
 *   4. Standard      — "enforced on every unit, server-side"
 *   5. Ledger        — "append-only; current retention state stated honestly"
 * BINDING COPY: "Read-only. This is the record itself, not a summary of it.
 *                Export for a regulator on request."
 *
 * B5a-G2 substrate: resolves ANY valid trace_id (wizard-frozen, async,
 * v2-dispatch — same envelope shape).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../apiClient';
import { useAuth } from '../../hooks/useAuth';
import { AuthDeniedNotice } from '../../components/ui_spec_v1';

const V2_1_PROVE_BINDING_COPY =
  'Read-only. This is the record itself, not a summary of it. Export for a regulator on request.';

function hasComplianceAuthority(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.includes('dpo') || roles.includes('admin');
}

export default function ComplianceProveOneRunPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const { traceId: routeTraceId } = useParams();
  const [inputValue, setInputValue] = useState(routeTraceId || '');
  const [envelope, setEnvelope] = useState(null);
  const [retention, setRetention] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const activeTrace = routeTraceId || null;

  const load = useCallback(async (traceId) => {
    if (!traceId) return;
    setLoading(true);
    setError(null);
    setEnvelope(null);
    const [rEnv, rRet] = await Promise.all([
      api.northenaTraceRead(traceId),
      api.complianceRetentionConfig(),
    ]);
    setLoading(false);
    if (rEnv.status === 200) {
      setEnvelope(rEnv.body);
    } else if (rEnv.status === 404) {
      setError({ kind: 'not_found', body: rEnv.body });
    } else if (rEnv.status === 400) {
      setError({ kind: 'malformed', body: rEnv.body });
    } else if (rEnv.status === 401 || rEnv.status === 403) {
      setError({ kind: 'auth', status: rEnv.status, body: rEnv.body });
    } else {
      setError({ kind: 'infra', status: rEnv.status, body: rEnv.body });
    }
    if (rRet.status === 200) setRetention(rRet.body);
  }, []);

  useEffect(() => {
    if (identity === null) return;
    if (identity === false) {
      navigate('/auth/login', { replace: true });
      return;
    }
    if (!hasComplianceAuthority(identity.roles)) return;
    if (activeTrace) load(activeTrace);
  }, [identity, navigate, activeTrace, load]);

  if (identity === null) {
    return (
      <div className="min-h-screen bg-rms-canvas text-rms-ink flex items-center justify-center">
        <div className="text-rms-mute">Loading\u2026</div>
      </div>
    );
  }

  if (!hasComplianceAuthority(identity.roles)) {
    return (
      <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="compliance-prove-run-page">
        <AuthDeniedNotice
          reason="auth_scope_insufficient"
          detail="Compliance Console requires the `dpo` role (or `admin`)."
        />
      </div>
    );
  }

  const refusedCount = envelope
    ? envelope.ledger_rows.filter((r) => r.decision === 'refused').length
    : 0;
  const commissionerId = envelope && envelope.ledger_rows.length > 0
    ? envelope.ledger_rows[0].run_id
    : '\u2014';
  const lawfulBasisRef = envelope && envelope.ledger_rows.length > 0
    ? envelope.ledger_rows[0].lawful_basis_ref
    : '\u2014';
  const retentionPosture = retention && retention.held_classes.length > 0
    ? retention.held_classes.find((c) => c.class_name === 'ledger_row')
    : null;

  return (
    <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="compliance-prove-run-page">
      <header className="border-b border-rms-line bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/compliance')}
              className="p-1 hover:bg-rms-highlight rounded"
              data-testid="compliance-prove-nav-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs text-rms-mute uppercase tracking-wide">RMS Intelligence · compliance</div>
              <h1 className="text-lg font-semibold">Prove one run</h1>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-rms-mute" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <section className="border border-rms-line rounded-md p-4" data-testid="compliance-prove-search">
          <label htmlFor="trace-search" className="block text-sm font-medium mb-2">
            Trace ID
          </label>
          <div className="flex gap-2">
            <input
              id="trace-search"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="trace_id"
              className="flex-1 px-3 py-2 border border-rms-line rounded text-sm"
              data-testid="compliance-prove-search-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/compliance/prove/${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (inputValue.trim()) {
                  navigate(`/compliance/prove/${encodeURIComponent(inputValue.trim())}`);
                }
              }}
              className="px-4 py-2 bg-rms-ink text-white text-sm rounded"
              data-testid="compliance-prove-search-submit"
            >
              Look up
            </button>
          </div>
        </section>

        {loading && (
          <p className="text-sm text-rms-mute" data-testid="compliance-prove-loading">Loading trace\u2026</p>
        )}

        {error && error.kind === 'not_found' && (
          <section className="border border-rms-line rounded-md p-4 bg-white" data-testid="compliance-prove-not-found">
            <p className="text-sm text-rms-ink">
              No record with trace_id {routeTraceId}. This is stated honestly, not as a refusal.
            </p>
          </section>
        )}

        {error && error.kind === 'malformed' && (
          <section className="border border-rms-line rounded-md p-4 bg-white" data-testid="compliance-prove-malformed">
            <p className="text-sm text-rms-ink">
              Malformed trace_id. Please provide a valid identifier.
            </p>
          </section>
        )}

        {error && error.kind === 'auth' && (
          <AuthDeniedNotice reason={error.body?.reason || 'auth_scope_insufficient'} detail={error.body?.detail} />
        )}

        {error && error.kind === 'infra' && (
          <section className="border border-rms-line rounded-md p-4 bg-white" data-testid="compliance-prove-infra-fault">
            <p className="text-sm text-rms-ink">
              A read failed. Status {error.status}. Infrastructure fault, not a refusal.
            </p>
          </section>
        )}

        {envelope && (
          <>
            {/* §4.2 Lawfulness banner */}
            <section
              className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded-md"
              data-testid="compliance-prove-lawfulness-banner"
            >
              <p className="text-sm text-emerald-900">
                Lawfulness banner: <strong>{lawfulBasisRef}</strong> · commissioner {commissionerId} · frozen and immutable
              </p>
            </section>

            {/* 5 record rows (v2.1 §4.2 verbatim) */}
            <section className="space-y-2" data-testid="compliance-prove-record-rows">
              <div className="border border-rms-line rounded-md p-3 bg-white" data-testid="compliance-record-row-lawful-basis">
                <div className="text-xs uppercase tracking-wide text-rms-mute">Lawful basis</div>
                <div className="text-sm">verified present at admission</div>
              </div>
              <div className="border border-rms-line rounded-md p-3 bg-white" data-testid="compliance-record-row-scope">
                <div className="text-xs uppercase tracking-wide text-rms-mute">Scope</div>
                <div className="text-sm">nothing mined outside it</div>
              </div>
              <div className="border border-rms-line rounded-md p-3 bg-white" data-testid="compliance-record-row-refused">
                <div className="text-xs uppercase tracking-wide text-rms-mute">Refused</div>
                <div className="text-sm" data-testid="compliance-record-refused-count-line">
                  {refusedCount} items \u2014 below the required standard, recorded not dropped
                </div>
                {refusedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate(`/compliance/prove?trace_id=${encodeURIComponent(routeTraceId)}&show=refused`)}
                    className="text-xs text-blue-700 underline mt-1"
                    data-testid="compliance-record-refused-see-them"
                  >
                    See them
                  </button>
                )}
              </div>
              <div className="border border-rms-line rounded-md p-3 bg-white" data-testid="compliance-record-row-standard">
                <div className="text-xs uppercase tracking-wide text-rms-mute">Standard</div>
                <div className="text-sm">enforced on every unit, server-side</div>
              </div>
              <div className="border border-rms-line rounded-md p-3 bg-white" data-testid="compliance-record-row-ledger">
                <div className="text-xs uppercase tracking-wide text-rms-mute">Ledger</div>
                <div className="text-sm" data-testid="compliance-record-ledger-honest-retention">
                  append-only; current retention state stated honestly
                  {retentionPosture && retentionPosture.posture === 'unset' && (
                    <span className="ml-2 text-amber-900">(no rule set)</span>
                  )}
                </div>
              </div>
            </section>

            <button
              type="button"
              className="text-sm text-blue-700 underline"
              data-testid="compliance-prove-export-button"
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(envelope, null, 2));
                const link = document.createElement('a');
                link.setAttribute('href', dataStr);
                link.setAttribute('download', `${routeTraceId}-record.json`);
                link.click();
              }}
            >
              Export for a regulator on request
            </button>
          </>
        )}

        <p className="text-xs text-rms-mute" data-testid="compliance-prove-binding-copy">
          {V2_1_PROVE_BINDING_COPY}
        </p>
      </main>
    </div>
  );
}
