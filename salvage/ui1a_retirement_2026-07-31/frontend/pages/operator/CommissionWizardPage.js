/**
 * CommissionWizardPage — UI Spec v1 §2.2 verbatim.
 *
 * Layout (§2.2):
 *   * Chat pane (left) + Objective draft rail (right).
 *
 * Chat (§2.2):
 *   * Operator states intent; agent asks for operator-mandatory fields,
 *     never proposes on them.
 *   * Estate-check chip renders inline before a feasibility-dependent
 *     question (illustrative example from §2.2:
 *     "4,180 hours match · 62% recorded statement · 21% established fact").
 *
 * Draft rail (§2.2):
 *   * Three dimensions + envelope with three visual states —
 *     filled (check), open (muted "— open"), agent-assumed (amber chip).
 *   * Envelope line lists done-condition · budget · lawful basis until supplied.
 *
 * Rules (§2.2):
 *   * Mandatory fields (reach, output×4, done-condition, budget, lawful basis)
 *     are asked, never pre-filled.
 *   * Preference fields may carry agent recommendations.
 *   * Every turn is grounded in a real estate read — no fabricated availability.
 *
 * Wizard endpoint consumers (Phase 7 B-1/B-2/B-3):
 *   * POST /api/wizard/operator/session   — start
 *   * POST /api/wizard/operator/{sid}/turn — advance
 *   * POST /api/wizard/operator/{sid}/commit-review — pre-freeze
 *   * (Freeze is on §2.3 CommitReviewPage.)
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Loader2, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api, { formatApiErrorDetail } from '../../apiClient';
import { AuthDeniedNotice } from '../../components/ui_spec_v1';

const MANDATORY_FIELDS = [
  { key: 'reach', label: 'Reach' },
  { key: 'output.form', label: 'Output · form' },
  { key: 'output.consumer', label: 'Output · consumer' },
  { key: 'output.grain', label: 'Output · grain' },
  { key: 'output.standard', label: 'Output · standard' },
  { key: 'envelope.done_condition', label: 'Done condition' },
  { key: 'envelope.budget', label: 'Budget' },
  { key: 'envelope.lawful_basis', label: 'Lawful basis' },
];

function EstateCheckChip({ snapshotRef }) {
  if (!snapshotRef) return null;
  return (
    <span
      data-testid="estate-check-chip"
      className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"
    >
      <Check className="w-3 h-3" />
      estate-check · {String(snapshotRef).slice(0, 24)}
    </span>
  );
}

function DraftRailRow({ label, cv }) {
  // Three visual states per §2.2 draft rail:
  //   * filled (check)
  //   * open (muted "— open")
  //   * agent-assumed (amber chip)
  const isFilled = cv && cv.value !== undefined && cv.value !== null;
  const isAgentAssumed = isFilled && cv.source === 'agent_assumed';
  return (
    <li
      data-testid={`draft-rail-row-${label}`}
      className="flex items-center justify-between py-2 border-b border-rms-line last:border-b-0"
    >
      <span className="text-sm text-rms-ink">{label}</span>
      {!isFilled && (
        <span data-testid={`draft-open-${label}`} className="text-xs text-rms-mute italic">— open</span>
      )}
      {isFilled && !isAgentAssumed && (
        <span data-testid={`draft-filled-${label}`} className="inline-flex items-center gap-1 text-xs text-emerald-800">
          <Check className="w-3.5 h-3.5" />
          <span className="truncate max-w-[10rem]">{JSON.stringify(cv.value)}</span>
        </span>
      )}
      {isAgentAssumed && (
        <span
          data-testid={`draft-agent-assumed-${label}`}
          className="text-[10px] font-mono uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"
        >
          agent-assumed
        </span>
      )}
    </li>
  );
}

function ChatMessage({ turn }) {
  return (
    <div data-testid={`chat-turn-${turn.turn_ref}`} className="rounded-md border border-rms-line p-3 bg-white">
      {turn.feasibility_snapshot_ref && (
        <div className="mb-2">
          <EstateCheckChip snapshotRef={turn.feasibility_snapshot_ref} />
        </div>
      )}
      <p className="text-sm text-rms-ink whitespace-pre-wrap">{turn.agent_content}</p>
      <div className="mt-1 text-[10px] font-mono uppercase tracking-wider text-rms-mute">
        turn · {turn.turn_ref.slice(0, 10)}
      </div>
    </div>
  );
}

export default function CommissionWizardPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [sid, setSid] = useState(null);
  const [wizardState, setWizardState] = useState(null);
  const [turns, setTurns] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const refreshState = useCallback(async (sessionId) => {
    const r = await api.wizardOperatorGet(sessionId);
    if (r.status === 200) setWizardState(r.body);
    else setErr({ status: r.status, body: r.body });
  }, []);

  const startSession = useCallback(async () => {
    setBusy(true);
    const r = await api.wizardOperatorStart();
    setBusy(false);
    if (r.status !== 201) {
      setErr({ status: r.status, body: r.body });
      return;
    }
    setSid(r.body.session_id);
    // Kick off first agent turn (turn_ref-less advance).
    const t = await api.wizardOperatorTurn(r.body.session_id, {});
    if (t.status === 200) setTurns([t.body]);
    await refreshState(r.body.session_id);
  }, [refreshState]);

  useEffect(() => {
    if (identity === null) return;
    if (identity === false) {
      navigate('/auth/login', { replace: true });
      return;
    }
    if (!sid) startSession();
  }, [identity, sid, startSession, navigate]);

  const submitTurn = async (e) => {
    e.preventDefault();
    if (!sid || busy || !userInput.trim()) return;
    setBusy(true);
    const lastTurn = turns[turns.length - 1];
    const r = await api.wizardOperatorTurn(sid, {
      turn_ref: lastTurn ? lastTurn.turn_ref : undefined,
      user_content: userInput.trim(),
    });
    setBusy(false);
    if (r.status === 200) {
      setTurns((t) => [...t, r.body]);
      setUserInput('');
      await refreshState(sid);
    } else {
      setErr({ status: r.status, body: r.body });
    }
  };

  const goToCommitReview = () => navigate(`/operator/commit-review/${sid}`);

  const committed = (wizardState && wizardState.committed_values) || {};

  // Phase 3 sub-cycle 1 · FB-4 milestone capture state.
  const [milestoneList, setMilestoneList] = useState(null);
  const [milestoneDraft, setMilestoneDraft] = useState({ description: '', done_condition: '', owner: '' });
  const [milestoneErr, setMilestoneErr] = useState(null);

  const refreshMilestones = useCallback(async () => {
    if (!sid) return;
    const r = await api.wizardOperatorGetMilestones(sid);
    if (r.status === 200) setMilestoneList(r.body);
  }, [sid]);

  useEffect(() => { refreshMilestones(); }, [refreshMilestones]);

  const addMilestone = async () => {
    setMilestoneErr(null);
    if (!sid) return;
    const current = (milestoneList && milestoneList.milestones) || [];
    const desc = milestoneDraft.description.trim();
    const dc = milestoneDraft.done_condition.trim();
    const ow = milestoneDraft.owner.trim();
    if (!desc || !dc || !ow) {
      setMilestoneErr('milestone requires description, done-condition, and owner');
      return;
    }
    const next = [
      ...current.map((m) => ({
        milestone_id: m.milestone_id,
        description: m.description,
        done_condition: m.done_condition,
        owner: m.owner,
        order_index: m.order_index,
        status: m.status,
      })),
      { description: desc, done_condition: dc, owner: ow, order_index: current.length },
    ];
    const r = await api.wizardOperatorPostMilestones(sid, next);
    if (r.status === 200) {
      setMilestoneList(r.body);
      setMilestoneDraft({ description: '', done_condition: '', owner: '' });
    } else {
      setMilestoneErr((r.body && r.body.detail) || 'milestone propose failed');
    }
  };

  const agreeMilestones = async () => {
    setMilestoneErr(null);
    if (!sid) return;
    const r = await api.wizardOperatorAgreeMilestones(sid, identity?.email || 'operator');
    if (r.status === 200) setMilestoneList(r.body);
    else setMilestoneErr((r.body && r.body.detail) || 'milestone agreement refused');
  };

  const milestonesAgreed = !!(milestoneList && milestoneList.agreed);
  const lawfulBasisSupplied = !!(committed['envelope.lawful_basis']?.value);
  const commitCtaDisabled = !sid || !milestonesAgreed || !lawfulBasisSupplied;

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
    <div data-testid="commission-wizard-page" className="min-h-screen bg-white">
      <header className="border-b border-rms-line">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-rms-ink">RMS Intelligence</h1>
            <span className="text-[10px] font-mono uppercase text-rms-mute tracking-wider">operator · commission</span>
          </div>
          <button
            type="button"
            data-testid="commission-goto-commit-review"
            onClick={goToCommitReview}
            disabled={commitCtaDisabled}
            title={
              commitCtaDisabled
                ? `Commit disabled — ${!milestonesAgreed ? 'milestones not agreed' : ''}${!milestonesAgreed && !lawfulBasisSupplied ? '; ' : ''}${!lawfulBasisSupplied ? 'lawful basis missing' : ''}`
                : 'Review & freeze'
            }
            className="text-sm text-rms-ink underline disabled:text-rms-mute disabled:no-underline"
          >
            Review & freeze →
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* §2.2 Chat pane (left) */}
        <section aria-label="Chat" data-testid="commission-chat-pane" className="space-y-3">
          {turns.map((t) => <ChatMessage key={t.turn_ref} turn={t} />)}
          {err && (err.status !== 401 && err.status !== 403) && (
            <div data-testid="commission-chat-error" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
              {formatApiErrorDetail(err.body && (err.body.detail || err.body.reason))}
            </div>
          )}
          <form onSubmit={submitTurn} className="flex gap-2 items-end">
            <textarea
              data-testid="commission-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={busy || !sid}
              rows={2}
              placeholder="State intent or answer the agent…"
              className="flex-1 rounded-md border border-rms-line px-3 py-2 text-sm text-rms-ink resize-none"
            />
            <button
              type="submit"
              data-testid="commission-submit"
              disabled={busy || !sid || !userInput.trim()}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-rms-ink text-white text-sm disabled:bg-gray-300"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
          </form>
        </section>

        {/* §2.2 Objective draft rail (right) */}
        <aside data-testid="commission-draft-rail" aria-label="Objective draft" className="lg:sticky lg:top-6 self-start rounded-md border border-rms-line bg-white p-4 h-fit">
          <h2 className="text-[10px] uppercase tracking-wider text-rms-mute font-mono">Objective draft</h2>
          <ul className="mt-3">
            {MANDATORY_FIELDS.map(({ key, label }) => (
              <DraftRailRow key={key} label={label} cv={committed[key]} />
            ))}
          </ul>
          <div className="mt-4 pt-3 border-t border-rms-line text-xs text-rms-mute">
            <p data-testid="draft-envelope-line">
              done-condition: <span className="text-rms-ink">{committed['envelope.done_condition']?.value || '—'}</span>
              {' · '}budget: <span className="text-rms-ink">{committed['envelope.budget']?.value || '—'}</span>
              {' · '}lawful basis: <span data-testid="draft-lawful-basis" className={lawfulBasisSupplied ? "text-rms-ink" : "text-red-700 font-semibold"}>{committed['envelope.lawful_basis']?.value || 'REQUIRED · not yet supplied'}</span>
            </p>
            <p className="mt-2" data-testid="milestone-agreement-chip">
              milestone list · <span className={milestonesAgreed ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>{milestonesAgreed ? 'agreed' : 'NOT agreed'}</span>
            </p>
            <p className="mt-1 text-[10px]">
              Commit disabled until both are set (FB-18 gates gate_commit_requires_agreed_milestones + gate_commit_requires_lawful_basis).
            </p>
          </div>
        </aside>
      </main>

      {/* Phase 3 sub-cycle 1 · FB-4 milestone panel (below the chat pane;
          it changes the wizard's information architecture per FB-17). */}
      <section
        data-testid="milestone-capture-panel"
        aria-label="Milestone capture"
        className="max-w-6xl mx-auto px-6 pb-10"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-rms-ink border-b border-rms-line pb-2">
          Milestone list (FB-4)
        </h2>
        <p className="text-xs text-rms-mute mt-2 mb-3">
          Each milestone: what must be done, its done-condition, its owner. The commission does not open until this list is agreed.
        </p>
        <ol data-testid="milestone-panel-list" className="space-y-2">
          {(milestoneList && milestoneList.milestones || []).map((m, i) => (
            <li
              key={m.milestone_id}
              data-testid={`milestone-panel-row-${i}`}
              className="grid grid-cols-[2fr_3fr_2fr_1fr] gap-3 items-center p-3 border border-rms-line rounded-md bg-white text-sm"
            >
              <span className="text-rms-ink font-semibold" data-testid={`milestone-panel-description-${i}`}>{m.description}</span>
              <span className="text-rms-ink"><em>done when:</em> {m.done_condition}</span>
              <span className="text-rms-ink"><em>owner:</em> {m.owner}</span>
              <span className="text-xs uppercase tracking-wider text-rms-mute text-right">{m.status}</span>
            </li>
          ))}
          {(!milestoneList || milestoneList.milestones.length === 0) && (
            <li data-testid="milestone-panel-empty" className="text-xs text-rms-mute italic">
              No milestones yet. Propose the first one below.
            </li>
          )}
        </ol>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-[2fr_3fr_2fr_auto] gap-2 items-end">
          <input
            data-testid="milestone-input-description"
            placeholder="What must be done"
            value={milestoneDraft.description}
            onChange={(e) => setMilestoneDraft((d) => ({ ...d, description: e.target.value }))}
            className="rounded-md border border-rms-line px-3 py-2 text-sm"
          />
          <input
            data-testid="milestone-input-done-condition"
            placeholder="Done-condition (measurable)"
            value={milestoneDraft.done_condition}
            onChange={(e) => setMilestoneDraft((d) => ({ ...d, done_condition: e.target.value }))}
            className="rounded-md border border-rms-line px-3 py-2 text-sm"
          />
          <input
            data-testid="milestone-input-owner"
            placeholder="Owner"
            value={milestoneDraft.owner}
            onChange={(e) => setMilestoneDraft((d) => ({ ...d, owner: e.target.value }))}
            className="rounded-md border border-rms-line px-3 py-2 text-sm"
          />
          <button
            type="button"
            data-testid="milestone-add-btn"
            onClick={addMilestone}
            className="rounded-md bg-rms-ink text-white px-4 py-2 text-sm"
          >Add milestone</button>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-rms-mute" data-testid="milestone-panel-agree-status">
            {milestonesAgreed ? '✓ agreed · commit CTA enabled (also requires lawful basis)' : 'not yet agreed · commit CTA disabled'}
          </div>
          <button
            type="button"
            data-testid="milestone-agree-btn"
            onClick={agreeMilestones}
            disabled={!milestoneList || milestoneList.milestones.length === 0 || milestonesAgreed}
            className="rounded-md border border-rms-ink text-rms-ink px-4 py-2 text-sm disabled:text-rms-mute disabled:border-rms-line"
          >Agree milestone list</button>
        </div>
        {milestoneErr && (
          <div data-testid="milestone-panel-error" className="mt-2 rounded-md border border-red-300 bg-red-50 p-2 text-xs text-red-900">
            {milestoneErr}
          </div>
        )}
      </section>
    </div>
  );
}
