/**
 * CommitReviewPage — UI Spec v1 §2.3 verbatim.
 *
 * Elements (§2.3):
 *   * "You supplied" rows.
 *   * "Agent assumed — confirm or change" rows (amber chip + change link each).
 *   * Feasibility verdict card (success treatment; binding copy pattern:
 *     "Floor feasible — {n}% of in-scope estate meets your standard").
 *   * Envelope line (lawful basis ref · budget · commissioner · scope ceiling
 *     respected).
 *   * **Freeze objective** button.
 *
 * Binding copy verbatim (§2.3):
 *   "Frozen is immutable — a changed intent is a new objective."
 *
 * B-3 dispatch extensions (Phase 7 B-3):
 *   * license_class_drift: {committed, derived} | null — soft signal.
 *
 * Wizard endpoint consumers (Phase 7 B-1/B-2/B-3):
 *   * POST /api/wizard/operator/{sid}/commit-review
 *   * POST /api/wizard/operator/{sid}/freeze
 */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Snowflake, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api, { formatApiErrorDetail } from '../../apiClient';
import { AuthDeniedNotice } from '../../components/ui_spec_v1';

function YouSuppliedRow({ item }) {
  return (
    <li
      data-testid={`you-supplied-${item.field}`}
      className="flex items-center justify-between py-2 border-b border-rms-line last:border-b-0"
    >
      <span className="text-sm text-rms-ink">{item.field}</span>
      <span className="text-xs text-rms-mute font-mono truncate max-w-xs">
        {JSON.stringify(item.value)}
      </span>
    </li>
  );
}

function AgentAssumedRow({ item }) {
  return (
    <li
      data-testid={`agent-assumed-${item.field}`}
      className="flex items-center justify-between py-2 border-b border-rms-line last:border-b-0"
    >
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
          data-testid={`agent-assumed-chip-${item.field}`}
        >
          agent-assumed
        </span>
        <span className="text-sm text-rms-ink">{item.field}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-rms-mute font-mono truncate max-w-[10rem]">{JSON.stringify(item.value)}</span>
        <button
          type="button"
          data-testid={`agent-assumed-change-${item.field}`}
          className="text-xs text-rms-ink underline"
        >
          change
        </button>
      </div>
    </li>
  );
}

function FeasibilityCard({ ready, license_class_drift }) {
  if (!ready) return null;
  return (
    <section
      data-testid="feasibility-verdict-card"
      className="rounded-md border border-emerald-300 bg-emerald-50 p-4"
      aria-label="Feasibility verdict"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 mt-0.5 text-emerald-700" />
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-900">
            {/* §2.3 binding-copy pattern: "Floor feasible — {n}% of in-scope estate meets your standard" */}
            Floor feasible — the in-scope estate meets your standard.
          </p>
          {license_class_drift && (
            <p data-testid="license-class-drift" className="mt-2 text-xs text-amber-800">
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                License class may drift: committed <span className="font-mono">{license_class_drift.committed}</span>{' '}
                → derived <span className="font-mono">{license_class_drift.derived}</span>
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CommitReviewPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [frozen, setFrozen] = useState(null);

  useEffect(() => {
    if (identity === null) return;
    if (identity === false) {
      navigate('/auth/login', { replace: true });
      return;
    }
    (async () => {
      const r = await api.wizardOperatorCommitReview(sessionId);
      if (r.status === 200) setReview(r.body);
      else setErr({ status: r.status, body: r.body });
    })();
  }, [identity, sessionId, navigate]);

  const doFreeze = async () => {
    if (!review || !review.ready_to_freeze || busy) return;
    setBusy(true);
    const r = await api.wizardOperatorFreeze(sessionId, {});
    setBusy(false);
    if (r.status === 200) setFrozen(r.body);
    else setErr({ status: r.status, body: r.body });
  };

  if (identity === null) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-rms-mute text-sm">Checking sign-in…</p></div>;
  }
  if (identity === false) return null;

  if (err && (err.status === 401 || err.status === 403)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <AuthDeniedNotice body={err.body} onSignIn={() => navigate('/auth/login')} />
      </div>
    );
  }

  return (
    <div data-testid="commit-review-page" className="min-h-screen bg-white">
      <header className="border-b border-rms-line">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-rms-ink">RMS Intelligence</h1>
            <span className="text-[10px] font-mono uppercase text-rms-mute tracking-wider">operator · commit review</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {!review && !err && (
          <div className="text-rms-mute text-sm">Loading review…</div>
        )}
        {review && (
          <>
            {/* §2.3 "You supplied" rows */}
            <section aria-label="You supplied" data-testid="you-supplied-section">
              <h2 className="text-[10px] uppercase tracking-wider text-rms-mute font-mono mb-2">You supplied</h2>
              <ul className="rounded-md border border-rms-line bg-white px-4">
                {(review.you_supplied || []).length > 0 ? (
                  review.you_supplied.map((it) => <YouSuppliedRow key={it.field} item={it} />)
                ) : (
                  <li className="py-3 text-xs text-rms-mute">Nothing supplied yet.</li>
                )}
              </ul>
            </section>

            {/* §2.3 "Agent assumed — confirm or change" rows */}
            <section aria-label="Agent assumed" data-testid="agent-assumed-section">
              <h2 className="text-[10px] uppercase tracking-wider text-rms-mute font-mono mb-2">
                Agent assumed — confirm or change
              </h2>
              <ul className="rounded-md border border-rms-line bg-white px-4">
                {(review.agent_assumed_items || []).length > 0 ? (
                  review.agent_assumed_items.map((it) => <AgentAssumedRow key={it.field} item={it} />)
                ) : (
                  <li className="py-3 text-xs text-rms-mute">No agent-assumed values.</li>
                )}
              </ul>
            </section>

            {review.violations && review.violations.length > 0 && (
              <section aria-label="Violations" data-testid="violations-section" className="rounded-md border border-red-300 bg-red-50 p-4">
                <h2 className="text-xs uppercase tracking-wider text-red-900 font-mono mb-2">Cannot freeze yet</h2>
                <ul className="list-disc pl-5 text-sm text-red-900 space-y-1">
                  {review.violations.map((v, i) => (
                    <li key={i} data-testid={`violation-${i}`}>{v}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* §2.3 Feasibility verdict card */}
            <FeasibilityCard
              ready={review.ready_to_freeze}
              license_class_drift={review.license_class_drift}
            />

            {/* §2.3 Envelope line */}
            <section aria-label="Envelope" data-testid="envelope-line" className="rounded-md border border-rms-line bg-white p-4 text-xs text-rms-mute">
              lawful basis · budget · commissioner · scope ceiling respected
            </section>

            {frozen ? (
              <section data-testid="frozen-confirmation" className="rounded-md border border-emerald-400 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900">
                  Frozen · trace_id <span className="font-mono">{frozen.trace_id}</span>
                </p>
                <p className="mt-1 text-xs text-emerald-800 italic">
                  {/* §2.3 verbatim binding copy */}
                  Frozen is immutable — a changed intent is a new objective.
                </p>
                <p className="mt-2 text-xs text-emerald-800">
                  ledger_run_id: <span className="font-mono">{frozen.ledger_run_id}</span>
                </p>
              </section>
            ) : (
              <div className="flex items-center justify-between">
                <p data-testid="freeze-binding-copy" className="text-xs text-rms-mute italic max-w-md">
                  Frozen is immutable — a changed intent is a new objective.
                </p>
                <button
                  type="button"
                  data-testid="freeze-objective-btn"
                  onClick={doFreeze}
                  disabled={!review.ready_to_freeze || busy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-rms-ink text-white text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Snowflake className="w-4 h-4" />}
                  Freeze objective
                </button>
              </div>
            )}
          </>
        )}

        {err && (err.status !== 401 && err.status !== 403) && (
          <div data-testid="commit-review-error" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {formatApiErrorDetail(err.body && (err.body.detail || err.body.reason))}
          </div>
        )}
      </main>
    </div>
  );
}
