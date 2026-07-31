/**
 * v2.1 §4.1 — Compliance Console Home.
 *
 * Three cards (v2.1 §4.1 verbatim binding):
 *   1. Runs with lawful basis
 *   2. Refusals this month + "See what was refused" link → §4.2
 *   3. Retention windows past due → §4.3
 *
 * Adversarial-to-comfort — no all-green summaries.
 * BINDING COPY: "This is the same record every user's audit view reaches
 *                — read-only, nothing reconstructed for display."
 * Auth: dpo | admin required (auth-context guard). 403 → AuthDeniedNotice.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../apiClient';
import { useAuth } from '../../hooks/useAuth';
import { AuthDeniedNotice, CounterSignBanner } from '../../components/ui_spec_v1';
import RefusalsCoverageMarker from './RefusalsCoverageMarker';

const V2_1_HOME_BINDING_COPY =
  "This is the same record every user's audit view reaches \u2014 read-only, nothing reconstructed for display.";

function _currentMonth() {
  const d = new Date();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${d.getUTCFullYear()}-${m}`;
}

function hasComplianceAuthority(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.includes('dpo') || roles.includes('admin');
}

export default function ComplianceHomePage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [refusalsMonth, setRefusalsMonth] = useState(null);
  const [retention, setRetention] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [coverageStatus, setCoverageStatus] = useState(null);
  const [error, setError] = useState(null);

  const monthParam = useMemo(_currentMonth, []);

  const load = useCallback(async () => {
    const [r1, r2, r3] = await Promise.all([
      api.complianceRefusalsByMonth(monthParam),
      api.complianceRetentionConfig(),
      api.complianceRefusalsCoverage(),
    ]);
    if (r1.status === 200) setRefusalsMonth(r1.body);
    else setError({ what: 'refusals', status: r1.status, body: r1.body });
    if (r2.status === 200) setRetention(r2.body);
    else if (r1.status === 200) {
      setError({ what: 'retention', status: r2.status, body: r2.body });
    }
    setCoverageStatus(r3.status);
    if (r3.status === 200) setCoverage(r3.body);
  }, [monthParam]);

  useEffect(() => {
    if (identity === null) return;
    if (identity === false) {
      navigate('/auth/login', { replace: true });
      return;
    }
    if (!hasComplianceAuthority(identity.roles)) return;
    load();
  }, [identity, navigate, load]);

  if (identity === null) {
    return (
      <div className="min-h-screen bg-rms-canvas text-rms-ink flex items-center justify-center">
        <div className="text-rms-mute">Loading\u2026</div>
      </div>
    );
  }

  if (!hasComplianceAuthority(identity.roles)) {
    return (
      <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="compliance-home-page">
        <AuthDeniedNotice
          reason="auth_scope_insufficient"
          detail="Compliance Console requires the `dpo` role (or `admin`)."
        />
      </div>
    );
  }

  const pastDueCount = retention
    ? retention.held_classes.filter((c) => c.posture === 'unset').length
    : 0;
  const refusalsTotal = refusalsMonth ? refusalsMonth.totals.total : 0;
  const anyAttention = pastDueCount > 0 || refusalsTotal > 0;

  return (
    <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="compliance-home-page">
      <header className="border-b border-rms-line bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1 hover:bg-rms-highlight rounded"
              data-testid="compliance-home-nav-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs text-rms-mute uppercase tracking-wide">RMS Intelligence · compliance</div>
              <h1 className="text-lg font-semibold">Home</h1>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-rms-mute" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Phase 8 Seam 3 Sub-stage 3 — CounterSignBanner (Owner Ruling 2,
            Amendment G, 2026-07-07: capacity-role render). */}
        <CounterSignBanner
          role="compliance"
          token={identity?.token || localStorage.getItem('rms_auth_token') || ''}
        />
        {/* §4.1 Attention — at most ONE (adversarial to comfort). */}
        {anyAttention && (
          <section
            className="border border-amber-200 bg-amber-50 rounded-md p-4"
            data-testid="compliance-home-attention"
          >
            <p className="text-sm text-amber-900">
              {pastDueCount > 0 && (
                <span>
                  {pastDueCount === 1
                    ? '1 held-class has no retention rule set.'
                    : `${pastDueCount} held-classes have no retention rule set.`}
                </span>
              )}
              {pastDueCount === 0 && refusalsTotal > 0 && (
                <span>Refusals recorded this month.</span>
              )}
            </p>
          </section>
        )}

        {/* §4.1 Lookup */}
        <section className="border border-rms-line rounded-md p-4" data-testid="compliance-home-lookup">
          <label htmlFor="trace-lookup" className="block text-sm font-medium text-rms-ink mb-2">
            Look up any run, claim, or acquisition by trace
          </label>
          <div className="flex gap-2">
            <input
              id="trace-lookup"
              type="text"
              placeholder="trace_id"
              className="flex-1 px-3 py-2 border border-rms-line rounded text-sm"
              data-testid="compliance-home-lookup-input"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/compliance/prove/${encodeURIComponent(e.target.value.trim())}`);
                }
              }}
            />
          </div>
        </section>

        {/* §4.1 Three cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="compliance-home-cards">
          <div className="border border-rms-line rounded-md p-4 bg-white" data-testid="card-runs-with-lawful-basis">
            <h2 className="text-sm font-medium text-rms-ink mb-2">Runs with lawful basis</h2>
            <p className="text-xs text-rms-mute">Each run carries a verified lawful-basis reference.</p>
          </div>
          <div className="border border-rms-line rounded-md p-4 bg-white" data-testid="card-refusals-this-month">
            <h2 className="text-sm font-medium text-rms-ink mb-2">Refusals this month</h2>
            <p className="text-xl font-semibold text-rms-ink" data-testid="card-refusals-count">
              {refusalsTotal}
            </p>
            <button
              type="button"
              onClick={() => navigate(`/compliance/prove?month=${monthParam}`)}
              className="text-xs text-blue-700 underline mt-2"
              data-testid="card-refusals-see-what"
            >
              See what was refused
            </button>
            <RefusalsCoverageMarker coverage={coverage} status={coverageStatus} />
          </div>
          <div className="border border-rms-line rounded-md p-4 bg-white" data-testid="card-retention-past-due">
            <h2 className="text-sm font-medium text-rms-ink mb-2">Retention windows past due</h2>
            <p className="text-xl font-semibold text-rms-ink" data-testid="card-retention-past-due-count">
              {pastDueCount}
            </p>
            <button
              type="button"
              onClick={() => navigate('/compliance/retention')}
              className="text-xs text-blue-700 underline mt-2"
              data-testid="card-retention-decide"
            >
              Decide
            </button>
          </div>
        </section>

        <p className="text-xs text-rms-mute" data-testid="compliance-home-binding-copy">
          {V2_1_HOME_BINDING_COPY}
        </p>

        {error && (
          <section
            className="border border-rms-line rounded-md p-4 bg-white"
            data-testid="compliance-home-infra-fault"
          >
            <p className="text-xs text-rms-mute">
              A read failed while loading this surface. {error.what} status {error.status}.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
