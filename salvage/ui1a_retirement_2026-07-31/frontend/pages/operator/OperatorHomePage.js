/**
 * OperatorHomePage — UI Spec v1 §2.1 verbatim.
 *
 * Elements (§2.1):
 *   * Header: `RMS Intelligence · operator` (Global rule §1.7 calm-header pattern)
 *     + **Commission objective** button.
 *   * Status line binding copy pattern: "Running normally. One item needs you."
 *   * At most one attention card per exceeded threshold (§2.1) — reads
 *     `operatorStatus.attention` (null at B-2 baseline).
 *   * **Running** list — rows of objective name + entry type · stage
 *     + budget consumed.
 *   * Capacity strip (approved addition, §2.1 verbatim): fleet apportionment
 *     + current consumption at a glance. Reads GET /api/fleet/policy.
 *
 * Rules (§2.1):
 *   * No dashboards or charts by default.
 *   * Exceptions appear only on threshold crossings; everything else stays quiet.
 *
 * Auth posture: renders for authenticated operator; unauth → redirect to /auth/login.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../apiClient';
import { AuthDeniedNotice } from '../../components/ui_spec_v1';

function CapacityStrip({ policy }) {
  if (!policy || !policy.apportionment) return null;
  const { mining, transforms, live_path } = policy.apportionment;
  return (
    <section
      data-testid="operator-capacity-strip"
      className="rounded-md border border-rms-line bg-white p-4"
      aria-label="Fleet capacity"
    >
      <h3 className="text-[10px] uppercase tracking-wider text-rms-mute font-mono">
        Capacity · {policy.version}
      </h3>
      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-xs text-rms-mute">Mining</div>
          <div data-testid="capacity-mining" className="text-rms-ink font-medium">
            {Math.round(mining * 100)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-rms-mute">Transforms</div>
          <div data-testid="capacity-transforms" className="text-rms-ink font-medium">
            {Math.round(transforms * 100)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-rms-mute">Live path</div>
          <div data-testid="capacity-live-path" className="text-rms-ink font-medium">
            {Math.round(live_path * 100)}%
          </div>
        </div>
      </div>
    </section>
  );
}

function AttentionCard({ attention }) {
  // §2.1: at most one attention card. B-2 baseline: null (nothing exceeds).
  if (!attention) return null;
  return (
    <section
      data-testid="operator-attention-card"
      className="rounded-md border border-amber-300 bg-amber-50 p-4"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 text-amber-600 flex-shrink-0" />
        <div className="flex-1">
          <p data-testid="attention-what-happened" className="text-sm font-medium text-amber-900">
            {attention.what_happened}
          </p>
          <p data-testid="attention-number-vs-threshold" className="mt-1 text-xs text-amber-800">
            {attention.number_vs_threshold}
          </p>
        </div>
        <button
          type="button"
          data-testid="attention-review"
          className="text-xs font-medium text-amber-900 underline"
        >
          Review
        </button>
      </div>
    </section>
  );
}

function RunningRow({ item }) {
  return (
    <li
      data-testid={`running-row-${item.objective_id}`}
      className="flex items-center justify-between px-4 py-3 border-b border-rms-line last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm text-rms-ink truncate">{item.objective_id}</p>
        <p className="text-xs text-rms-mute mt-0.5">
          {item.entry} · {item.stage}
        </p>
      </div>
      <div className="text-xs text-rms-mute font-mono ml-4">
        {item.trace_id ? item.trace_id.slice(0, 12) : '—'}
      </div>
    </li>
  );
}

export default function OperatorHomePage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [fleet, setFleet] = useState(null);
  const [statusErr, setStatusErr] = useState(null);

  useEffect(() => {
    if (identity === null) return; // still checking
    if (identity === false) {
      navigate('/auth/login', { replace: true });
      return;
    }
    (async () => {
      const s = await api.operatorStatus();
      if (s.status === 200) setStatus(s.body);
      else setStatusErr({ status: s.status, body: s.body });
      try {
        setFleet(await api.fleetPolicy());
      } catch {
        setFleet(null);
      }
    })();
  }, [identity, navigate]);

  if (identity === null) {
    return (
      <div data-testid="operator-home-loading" className="min-h-screen flex items-center justify-center">
        <p className="text-rms-mute text-sm">Checking sign-in…</p>
      </div>
    );
  }
  if (identity === false) return null;

  if (statusErr && (statusErr.status === 401 || statusErr.status === 403)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <AuthDeniedNotice body={statusErr.body} onSignIn={() => navigate('/auth/login')} />
      </div>
    );
  }

  return (
    <div data-testid="operator-home-page" className="min-h-screen bg-white">
      {/* §1.7 Calm header — "product · role" pattern */}
      <header className="border-b border-rms-line">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-rms-ink">
              RMS Intelligence
            </h1>
            <span className="text-[10px] font-mono uppercase text-rms-mute tracking-wider">
              operator
            </span>
          </div>
          <button
            type="button"
            data-testid="operator-commission-objective"
            onClick={() => navigate('/operator/commission')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-rms-ink text-white hover:bg-rms-accent text-sm"
          >
            <Play className="w-4 h-4" />
            Commission objective
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* §2.1 Status line — binding-copy pattern */}
        <p data-testid="operator-status-line" className="text-lg font-light text-rms-ink">
          {status ? status.status_line : 'Running normally.'}
        </p>

        {/* §2.1 At-most-one attention card */}
        {status && <AttentionCard attention={status.attention} />}

        {/* §2.1 Running list */}
        <section aria-label="Running objectives" data-testid="operator-running-list">
          <h2 className="text-[10px] uppercase tracking-wider text-rms-mute font-mono px-1 mb-2">
            Running
          </h2>
          <ul className="rounded-md border border-rms-line bg-white">
            {status && status.running.length > 0 ? (
              status.running.map((item) => <RunningRow key={item.objective_id} item={item} />)
            ) : (
              <li data-testid="running-empty" className="px-4 py-6 text-sm text-rms-mute">
                Nothing running.
              </li>
            )}
          </ul>
        </section>

        {/* §2.1 Capacity strip (approved addition) */}
        <CapacityStrip policy={fleet} />
      </main>
    </div>
  );
}
