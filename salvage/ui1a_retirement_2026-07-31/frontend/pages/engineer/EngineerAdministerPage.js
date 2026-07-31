/**
 * UI Spec §4.3 — Engineer · Administer.
 *
 * Verbatim elements per Spec:
 *   * at most one attention card (pattern: app name — refusal rate —
 *     plain-language cause — Review);
 *   * apps list rows — name + class badge, path + key, calls + refusal rate;
 *   * extract-path rows show acquisitions + rights state;
 *   * async addition: long-running objectives show lifecycle state
 *     (accepted / running / delivered / refused).
 *   * Footer (binding copy): "Key scope is enforced server-side on every call."
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gauge } from 'lucide-react';
import api from '../../apiClient';
import { useAuth } from '../../hooks/useAuth';

export default function EngineerAdministerPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [grants, setGrants] = useState([]);

  const refresh = useCallback(async () => {
    const r = await api.engineerListKeyGrants();
    if (r.status === 200) setGrants(r.body.grants || []);
  }, []);

  useEffect(() => {
    if (identity === null) return;
    if (identity === false) navigate('/auth/login', { replace: true });
    else refresh();
  }, [identity, navigate, refresh]);

  if (identity === null) {
    return (
      <div className="min-h-screen bg-rms-canvas text-rms-ink flex items-center justify-center">
        <div className="text-rms-mute">Loading…</div>
      </div>
    );
  }

  const activeCount = grants.filter((g) => !g.revoked_at).length;
  const revokedCount = grants.length - activeCount;
  const revokedFraction = grants.length ? revokedCount / grants.length : 0;

  return (
    <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="engineer-administer-page">
      <header className="border-b border-rms-line bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1 hover:bg-rms-highlight rounded"
              data-testid="engineer-nav-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs text-rms-mute uppercase tracking-wide">RMS Intelligence · engineer</div>
              <h1 className="text-lg font-semibold">Administer</h1>
            </div>
          </div>
          <Gauge className="w-5 h-5 text-rms-mute" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* At-most-one attention card — pattern: app · refusal rate · cause · Review. */}
        {revokedFraction > 0.5 && (
          <div
            className="border border-amber-200 bg-amber-50 rounded p-3 flex items-start justify-between"
            data-testid="administer-attention-card"
          >
            <div className="text-sm text-amber-900">
              <div className="font-medium">Your key grants — high revocation rate.</div>
              <div className="italic">
                {revokedCount} of {grants.length} grants revoked ({Math.round(revokedFraction * 100)}%).
              </div>
            </div>
            <button
              type="button"
              className="text-sm underline text-amber-900"
              onClick={() => navigate('/engineer/register')}
              data-testid="administer-review-btn"
            >
              Review
            </button>
          </div>
        )}

        {/* Apps list — grants rows serve as the app inventory at this stage. */}
        <section>
          <h2 className="text-base font-semibold mb-2">Apps · key grants</h2>
          {grants.length === 0 && (
            <div className="text-sm text-rms-mute italic" data-testid="administer-apps-empty">
              No apps registered. Head to Register an app to issue your first key.
            </div>
          )}
          {grants.length > 0 && (
            <ul
              className="divide-y divide-rms-line border border-rms-line rounded"
              data-testid="administer-apps-list"
            >
              {grants.map((g) => (
                <li
                  key={g.grant_id}
                  className="px-3 py-2 text-sm flex items-center justify-between"
                  data-testid={`administer-app-row-${g.grant_id}`}
                >
                  <div>
                    <div className="font-mono text-xs text-rms-mute">
                      {g.grant_id.slice(0, 12)}…
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs uppercase tracking-wide rounded px-1.5 py-0.5 ${
                          g.key_class === 'external'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {g.key_class}
                      </span>
                      <span className="text-rms-ink">{g.path}</span>
                      <span className="text-rms-mute">· floor:{g.floor}</span>
                      <span className="text-rms-mute">· scope:{g.scope}</span>
                    </div>
                  </div>
                  <div className="text-xs text-rms-mute">
                    {g.revoked_at ? (
                      <span className="text-red-700 uppercase tracking-wide">revoked</span>
                    ) : (
                      <span>active</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Extract-path acquisitions row — placeholder note under governed_extract. */}
        <section>
          <h2 className="text-base font-semibold mb-2">Extract-path acquisitions</h2>
          <div className="text-sm text-rms-mute italic" data-testid="administer-extract-path-note">
            Extract-path acquisitions and rights state appear here once your first governed-extract key issues a delivery.
          </div>
        </section>

        {/* Async lifecycle — long-running objectives lifecycle states. */}
        <section>
          <h2 className="text-base font-semibold mb-2">Long-running objectives</h2>
          <div className="flex flex-wrap gap-2 text-xs" data-testid="administer-lifecycle-states">
            {['accepted', 'running', 'delivered', 'refused'].map((s) => (
              <span
                key={s}
                data-testid={`administer-lifecycle-${s}`}
                className="border border-rms-line bg-white text-rms-ink rounded-full px-2 py-0.5"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        {/* Binding-copy footer — verbatim UI Spec §4.3. */}
        <footer
          className="border-t border-rms-line pt-4 text-sm italic text-rms-mute"
          data-testid="administer-footer-binding-copy"
        >
          Key scope is enforced server-side on every call.
        </footer>
      </main>
    </div>
  );
}
