/**
 * UI Spec §4.1 — Engineer · Register an app.
 *
 * Verbatim elements per Spec:
 *   * app name; class choice Internal / External; path choice with one-line grants
 *     ("Live query — inner gate · per-call governance · answers in responses" /
 *      "Governed extract — outer gate · rights-checked · datasets and skills out");
 *   * key grants panel stating in plain terms what the key permits
 *     ("External class · live query only · floor: … · scope: … · enforced
 *      server-side on every call");
 *   * **Issue key** button.
 *   * async additions: optional **webhook URL** field (note: "receives event +
 *     status only — never content"); **sandbox** toggle.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeySquare, ArrowLeft, Check } from 'lucide-react';
import api, { formatApiErrorDetail } from '../../apiClient';
import { useAuth } from '../../hooks/useAuth';

const FLOOR_OPTIONS = ['utterance', 'recorded_statement', 'established_fact'];

const PATH_COPY = {
  live_query: 'Live query — inner gate · per-call governance · answers in responses',
  governed_extract: 'Governed extract — outer gate · rights-checked · datasets and skills out',
};

export default function EngineerRegisterAppPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();

  const [appName, setAppName] = useState('');
  const [keyClass, setKeyClass] = useState('external');
  const [path, setPath] = useState('live_query');
  const [floor, setFloor] = useState('utterance');
  const [scope, setScope] = useState('estate');
  const [justification, setJustification] = useState('');
  const [lawfulBasisRef, setLawfulBasisRef] = useState('engineer-key-grant-lawful-basis-v0');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [sandbox, setSandbox] = useState(false);
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState(null);
  const [err, setErr] = useState(null);
  const [grants, setGrants] = useState([]);

  const refreshGrants = useCallback(async () => {
    const r = await api.engineerListKeyGrants();
    if (r.status === 200) setGrants(r.body.grants || []);
  }, []);

  useEffect(() => {
    if (identity === null) return;
    if (identity === false) navigate('/auth/login', { replace: true });
    else refreshGrants();
  }, [identity, navigate, refreshGrants]);

  const grantsPanel = useMemo(() => {
    if (!issued) return null;
    return (
      <div
        data-testid="key-grants-panel"
        className="border border-emerald-200 bg-emerald-50 rounded-md p-3 text-sm"
      >
        <div className="font-medium text-emerald-900 mb-1">Key issued.</div>
        <div className="text-emerald-800" data-testid="grants-panel-plain-terms">
          <span className="capitalize">{issued.key_class}</span> class ·{' '}
          {issued.path === 'live_query' ? 'live query only' : 'governed extract only'} · floor:{' '}
          {issued.floor} · scope: {issued.scope} · enforced server-side on every call.
        </div>
        <div className="text-xs font-mono text-emerald-700 mt-2" data-testid="issued-grant-id">
          grant_id={issued.grant_id}
        </div>
      </div>
    );
  }, [issued]);

  const onIssue = async () => {
    setErr(null);
    setBusy(true);
    const grantee_email = identity && identity.email ? identity.email : 'self@rms.local';
    const body = {
      grantee_email,
      key_class: keyClass,
      path,
      floor,
      scope,
      justification: justification || `Grant for app: ${appName || 'unnamed'}.`,
      lawful_basis_ref: lawfulBasisRef,
    };
    const r = await api.engineerRegisterKeyGrant(body);
    setBusy(false);
    if (r.status === 201) {
      setIssued(r.body);
      refreshGrants();
    } else {
      setErr(formatApiErrorDetail(r.body && r.body.detail ? r.body.detail : r.body));
    }
  };

  if (identity === null) {
    return (
      <div className="min-h-screen bg-rms-canvas text-rms-ink flex items-center justify-center">
        <div className="text-rms-mute">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="engineer-register-app-page">
      <header className="border-b border-rms-line bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="p-1 hover:bg-rms-highlight rounded"
              data-testid="engineer-nav-back"
              title="Back to Ask Console"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs text-rms-mute uppercase tracking-wide">RMS Intelligence · engineer</div>
              <h1 className="text-lg font-semibold">Register an app</h1>
            </div>
          </div>
          <KeySquare className="w-5 h-5 text-rms-mute" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <section className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">App name</label>
            <input
              type="text"
              className="w-full border border-rms-line rounded px-2 py-1"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="my-integration-app"
              data-testid="engineer-app-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <div className="flex gap-2" data-testid="engineer-class-choice">
              {['internal', 'external'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setKeyClass(c)}
                  className={`px-3 py-1 rounded border ${
                    keyClass === c
                      ? 'bg-rms-ink text-white border-rms-ink'
                      : 'bg-white text-rms-ink border-rms-line'
                  }`}
                  data-testid={`engineer-class-${c}`}
                >
                  {c === 'internal' ? 'Internal' : 'External'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Path</label>
            <div className="space-y-2" data-testid="engineer-path-choice">
              {Object.keys(PATH_COPY).map((p) => (
                <label key={p} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="engineer-path"
                    value={p}
                    checked={path === p}
                    onChange={() => setPath(p)}
                    className="mt-1"
                    data-testid={`engineer-path-${p}`}
                  />
                  <span className="text-sm text-rms-ink" data-testid={`engineer-path-copy-${p}`}>
                    {PATH_COPY[p]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Floor</label>
              <select
                className="w-full border border-rms-line rounded px-2 py-1"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                data-testid="engineer-floor"
              >
                {FLOOR_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scope</label>
              <input
                type="text"
                className="w-full border border-rms-line rounded px-2 py-1"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                data-testid="engineer-scope"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Justification (audit)</label>
            <textarea
              rows={2}
              className="w-full border border-rms-line rounded px-2 py-1"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Why this grant is being issued (min 8 chars)."
              data-testid="engineer-justification"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Lawful basis ref</label>
            <input
              type="text"
              className="w-full border border-rms-line rounded px-2 py-1"
              value={lawfulBasisRef}
              onChange={(e) => setLawfulBasisRef(e.target.value)}
              data-testid="engineer-lawful-basis-ref"
            />
          </div>

          {/* Async additions per Spec: webhook URL + sandbox toggle. */}
          <div className="border-t border-rms-line pt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL (optional)</label>
              <input
                type="text"
                className="w-full border border-rms-line rounded px-2 py-1"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://..."
                data-testid="engineer-webhook-url"
              />
              <div
                className="text-xs text-rms-mute mt-1 italic"
                data-testid="engineer-webhook-note"
              >
                receives event + status only — never content
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sandbox}
                onChange={(e) => setSandbox(e.target.checked)}
                data-testid="engineer-sandbox-toggle"
              />
              <span className="text-sm">
                Sandbox mode — key served from fixture estate.
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={onIssue}
            disabled={busy}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded bg-rms-ink text-white text-sm font-medium disabled:opacity-40"
            data-testid="engineer-issue-key-btn"
          >
            <Check className="w-4 h-4" />
            {busy ? 'Issuing…' : 'Issue key'}
          </button>

          {err && (
            <div className="text-sm text-red-700 border border-red-200 bg-red-50 rounded p-2" data-testid="engineer-issue-error">
              {err}
            </div>
          )}
          {grantsPanel}
        </section>

        {/* Section: existing grants list (self-lookup). */}
        <section className="border-t border-rms-line pt-4">
          <h2 className="text-base font-semibold mb-2">Your key grants</h2>
          {grants.length === 0 && (
            <div className="text-sm text-rms-mute italic" data-testid="engineer-grants-empty">
              No grants issued yet.
            </div>
          )}
          {grants.length > 0 && (
            <ul className="divide-y divide-rms-line border border-rms-line rounded" data-testid="engineer-grants-list">
              {grants.map((g) => (
                <li
                  key={g.grant_id}
                  className="px-3 py-2 flex items-center justify-between text-sm"
                  data-testid={`grant-row-${g.grant_id}`}
                >
                  <div className="font-mono">
                    <span className="text-rms-mute">{g.grant_id.slice(0, 12)}…</span>{' '}
                    <span className="capitalize">{g.key_class}</span> · {g.path} · {g.floor} · {g.scope}
                    {g.revoked_at && (
                      <span
                        className="ml-2 text-xs uppercase tracking-wide text-red-700 bg-red-50 border border-red-200 rounded px-1 py-0.5"
                        data-testid={`grant-row-revoked-${g.grant_id}`}
                      >
                        revoked
                      </span>
                    )}
                  </div>
                  {!g.revoked_at && (
                    <button
                      type="button"
                      onClick={async () => {
                        const reason = window.prompt('Reason for revocation (min 8 chars):');
                        if (!reason || reason.length < 8) return;
                        const rev = await api.engineerRevokeKeyGrant(g.grant_id, reason);
                        if (rev.status === 200) refreshGrants();
                      }}
                      className="text-xs underline text-rms-mute hover:text-rms-ink"
                      data-testid={`grant-revoke-${g.grant_id}`}
                    >
                      revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
