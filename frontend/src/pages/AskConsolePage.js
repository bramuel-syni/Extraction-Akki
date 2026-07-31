/**
 * Ask Console — Phase 8a-lite (RMS UI Specification v1 §3 verbatim).
 *
 * §3.1 Ask
 *   Elements: centered prompt — binding copy: "What do you need to know?";
 *   single input; quiet defaults line ("Standard: … · Scope: … · change");
 *   **Recent** list.
 *   Rules: output is preset and invisible (composed conclusion · person ·
 *   synthesized-whole · standing floor). **No output picker exists anywhere
 *   on this surface.** Wanting data or a different form is a new objective,
 *   made elsewhere.
 *
 * §3.2 Answer
 *   Elements: question echoed in header; class badge + meta line
 *   ("{n} sources examined · answered in {t}"); headline finding (one
 *   sentence, plain); support paragraph; up to three metric cards;
 *   actions — **Why this answer**, **Export report**, **Trust receipt** link.
 *
 * §3.3 Refusal
 *   Warning card in the answer position. Binding copy: title "Not to the
 *   standard you asked for."; body names the gap in the actor-appropriate
 *   form. Actions (binding labels): **Accept as recorded statement** ·
 *   **Narrow the objective** · **Lower the standard**.
 *   Footer: "A refusal is the system keeping its promise…" +
 *   **Why this was refused** link.
 *
 * Consumes `POST /api/service_1/v2/dispatch` (frozen ObjectiveRequest_v2 in;
 * ComposedConclusion_v0 @200 on answer; AdmissionRefusal_v0 or
 * Service1Refusal_v0 @422 on refusal). No output-form picker (§3.1 rule).
 * Backend contracts untouched at Phase 8a-lite.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, Search, Menu, X } from 'lucide-react';
import api from '../apiClient';
import ClassBadge from '../components/ClassBadge';
import RefusalCard from '../components/RefusalCard';

// Quiet defaults per §3.1: standard preset (output stays invisible to buyer;
// wanting data or a different form is a new objective, made elsewhere). The
// wire-shape values below are the frozen enum values on ObjectiveRequest_v2:
//   output.form           = 'composed_conclusion'    (OutputForm enum)
//   output.consumer       = 'person'                 (OutputConsumer enum)
//   output.grain          = 'synthesized_whole'      (OutputGrain enum)
//   output.standard.class = 'utterance'              (DefensibilityFloor default)
// The surface presents them as a single quiet-defaults line labelled
// "Standard: floor · Scope: estate · change" per §3.1 verbatim copy.
const QUIET_DEFAULTS = {
  standard_label: 'floor', // §3.1 verbatim: "standing floor"; wire minimum_class = "utterance"
  scope_label: 'estate', // synthetic estate v1 (G2b real hour still Owner-blocked)
};

// Build a minimal ObjectiveRequest_v2 payload from an ask string.
// The contract is loose-as-frozen per Owner Substrate-Drop v2 ruling; we
// send only the fields §3.1 promises: the ask (via reach.scope_refs) and
// the standing floor (envelope.done_condition + output.standard). Everything
// else follows the frozen-shape defaults. Output form is fixed at
// `composed_conclusion` per §3.1 ("output is preset and invisible") — the
// surface never surfaces it as a picker.
function buildObjectiveRequestV2(askText) {
  return {
    entry: 'external_request',
    reach: {
      scope_refs: [askText],
      exclusions: [],
      depth: 'default',
    },
    output: {
      form: 'composed_conclusion',
      consumer: 'person',
      grain: 'synthesized_whole',
      // DefensibilityFloor object shape — minimum_class + minimum_scores
      // per frozen contract. Standing floor = utterance (§3.1 quiet default).
      standard: {
        minimum_class: 'utterance',
        minimum_scores: {},
      },
    },
    envelope: {
      lawful_basis: 'legitimate_interest',
      done_condition: 'standing_floor',
      budget: 'default',
      scope_ceiling: 'estate',
      availability_snapshot: {},
      floor_feasibility: {},
      commissioner: 'ask_console_v1',
      committed_at: new Date().toISOString(),
    },
    shaping: null,
    commercial: null,
    idempotency_key: `ask-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };
}

function isRefusal(body) {
  // A2 doctrine: refusal is distinguished by `body.outcome === "refused"`,
  // NOT by status code. Both AdmissionRefusal_v0 (governance) and
  // Service1Refusal_v0 (composition_below_floor) carry `outcome: refused`.
  return body && body.outcome === 'refused';
}

function AskInput({ value, onChange, onSubmit, busy }) {
  return (
    <form
      data-testid="ask-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy && value.trim()) onSubmit();
      }}
      className="w-full max-w-2xl"
    >
      <h2
        data-testid="ask-binding-copy"
        className="text-center text-3xl sm:text-4xl font-light tracking-tight text-rms-ink mb-8"
      >
        What do you need to know?
      </h2>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rms-mute pointer-events-none" />
        <input
          data-testid="ask-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={busy}
          placeholder="Enter your question…"
          className="w-full pl-10 pr-16 py-3 text-base bg-white border border-rms-line rounded-lg focus:outline-none focus:ring-2 focus:ring-rms-accent focus:border-rms-accent disabled:bg-gray-50 disabled:text-rms-mute"
          autoFocus
        />
        <button
          data-testid="ask-submit"
          type="submit"
          disabled={busy || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-rms-ink text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-rms-accent transition-colors"
          aria-label="Submit question"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      <p
        data-testid="ask-quiet-defaults"
        className="mt-4 text-center text-xs text-rms-mute font-mono"
      >
        Standard: {QUIET_DEFAULTS.standard_label} · Scope: {QUIET_DEFAULTS.scope_label} ·
        <button
          type="button"
          data-testid="ask-defaults-change"
          className="ml-1 underline hover:text-rms-ink"
          disabled
          title="Changing defaults lands with the Buyer Wizard surface (Phase 8 full)."
        >
          change
        </button>
      </p>
    </form>
  );
}

// Console navigation menu — discoverability aid on the Ask Console header.
// UI Spec v1 §3.1 preserved: Ask Console remains the `/` ingress; this is
// a discoverability augmentation only. Auth-gated entries stay visible
// when unauth'd (clicking bounces to `/auth/login` per AuthProvider).
// Class-honesty: no Opportunity Brief content leaks here — this is a
// hyperlink list only; brief content only renders inside `/opportunity-briefs`.
const CONSOLE_NAV_ITEMS = [
  { path: '/operator', label: 'Operator Home', gate: 'auth' },
  { path: '/engineer/register', label: 'Engineer', gate: 'auth' },
  { path: '/master-admin', label: 'Master Admin', gate: 'auth' },
  { path: '/compliance', label: 'Compliance', gate: 'auth' },
  { path: '/extraction/console', label: 'Extraction Console', gate: 'auth' },
  { path: '/extraction/registry-admin', label: 'Registry Admin', gate: 'auth' },
  { path: '/opportunity-briefs', label: 'Opportunity Briefs', gate: 'public' },
  // Phase 3 sub-cycle 2 — Memory Service + Registry Estate Map surfaces
  // (Owner ruling 2026-08-02 · Surfaces v2 shell rule: new routes must be
  // reachable from visible navigation, not deep-linked only).
  { path: '/memory', label: 'Memory Service', gate: 'auth' },
  { path: '/registry', label: 'Registry · Estate Map', gate: 'auth' },
  { path: '/auth/login', label: 'Sign in', gate: 'public' },
];

function ConsoleNavMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        data-testid="console-nav-toggle"
        aria-label="Open consoles menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-md text-rms-ink hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rms-accent"
      >
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
      {open && (
        <>
          {/* Click-outside overlay */}
          <div
            data-testid="console-nav-overlay"
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            data-testid="console-nav-menu"
            role="menu"
            className="absolute right-0 mt-2 w-64 bg-white border border-rms-line rounded-md shadow-lg z-20"
          >
            <div className="px-3 py-2 border-b border-rms-line">
              <p className="text-[10px] font-mono uppercase tracking-wider text-rms-mute">
                Consoles
              </p>
            </div>
            <ul className="py-1">
              {CONSOLE_NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    data-testid={`console-nav-link-${item.path.replace(/[/]/g, '-').replace(/^-/, '')}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm text-rms-ink hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    role="menuitem"
                  >
                    <span>{item.label}</span>
                    <span
                      className={
                        item.gate === 'public'
                          ? 'text-[10px] font-mono uppercase text-rms-mute'
                          : 'text-[10px] font-mono uppercase text-rms-mute'
                      }
                    >
                      {item.gate}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

function RecentList({ items, onSelect }) {
  if (!items || items.length === 0) return null;
  return (
    <section
      data-testid="ask-recent-list"
      className="mt-10 w-full max-w-2xl"
      aria-label="Recent"
    >
      <h3 className="text-xs font-medium text-rms-mute uppercase tracking-wide mb-3">
        Recent
      </h3>
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx}>
            <button
              type="button"
              data-testid={`recent-item-${idx}`}
              onClick={() => onSelect(item.ask)}
              className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rms-accent"
            >
              <span className="text-rms-ink">{item.ask}</span>
              {item.outcome && (
                <span className="ml-2 text-xs font-mono text-rms-mute">
                  · {item.outcome}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AnswerView({ ask, conclusion, elapsedMs, onExport, onWhy, onTrustReceipt, onReset }) {
  // §3.2 layout: question echoed in header; class badge + meta;
  // headline finding; support paragraph; actions row.
  const nSources = Array.isArray(conclusion?.load_bearing_unit_ids)
    ? conclusion.load_bearing_unit_ids.length
    : 0;
  const t = elapsedMs != null ? `${Math.round(elapsedMs)} ms` : '—';
  return (
    <article
      data-testid="answer-view"
      className="w-full max-w-3xl mx-auto"
      aria-label="Answer"
    >
      <header className="border-b border-rms-line pb-4 mb-6">
        <p data-testid="answer-ask-echo" className="text-sm text-rms-mute mb-1">
          Asked
        </p>
        <h1 className="text-xl font-medium text-rms-ink">{ask}</h1>
        <div
          data-testid="answer-meta"
          className="mt-3 flex items-center gap-3 text-xs text-rms-mute"
        >
          <ClassBadge defensibilityClass={conclusion?.conclusion_class} />
          <span data-testid="answer-meta-line">
            {nSources} source{nSources === 1 ? '' : 's'} examined · answered in {t}
          </span>
        </div>
      </header>
      <section className="space-y-4">
        <p
          data-testid="answer-headline"
          className="text-lg leading-relaxed text-rms-ink"
        >
          {conclusion?.answer_text || '—'}
        </p>
      </section>
      <footer className="mt-8 pt-4 border-t border-rms-line flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          data-testid="answer-why"
          onClick={onWhy}
          className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50"
        >
          Why this answer
        </button>
        <button
          type="button"
          data-testid="answer-export"
          onClick={onExport}
          className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50"
        >
          Export report
        </button>
        <a
          data-testid="answer-trust-receipt"
          href={conclusion?.trace_id ? `/trace/${conclusion.trace_id}` : '#'}
          onClick={onTrustReceipt}
          className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50 text-rms-ink no-underline"
        >
          Trust receipt
        </a>
        <button
          type="button"
          data-testid="answer-new-ask"
          onClick={onReset}
          className="ml-auto px-3 py-1.5 rounded-md text-rms-mute hover:text-rms-ink"
        >
          Ask another
        </button>
      </footer>
    </article>
  );
}

function RefusalView({ ask, refusal, onAcceptAsRecorded, onNarrow, onLowerStandard, onWhyRefused, onReset }) {
  // §3.3 layout: title "Not to the standard you asked for."; body via
  // shared RefusalCard component (Owner Condition-2 reuse — no reimpl);
  // actions row with binding labels; footer with promise-keeping copy.
  return (
    <article
      data-testid="refusal-view"
      className="w-full max-w-3xl mx-auto"
      aria-label="Refusal"
    >
      <header className="mb-4">
        <p className="text-sm text-rms-mute mb-1">Asked</p>
        <h1 className="text-xl font-medium text-rms-ink">{ask}</h1>
      </header>
      <h2
        data-testid="refusal-binding-title"
        className="text-lg font-semibold text-amber-900 mb-3"
      >
        Not to the standard you asked for.
      </h2>
      <RefusalCard refusal={{ ...refusal, asked: refusal?.asked || ask }} />
      <section
        data-testid="refusal-actions"
        className="mt-6 flex flex-wrap gap-3 text-sm"
      >
        <button
          type="button"
          data-testid="refusal-accept-recorded"
          onClick={onAcceptAsRecorded}
          className="px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900"
        >
          Accept as recorded statement
        </button>
        <button
          type="button"
          data-testid="refusal-narrow"
          onClick={onNarrow}
          className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50"
        >
          Narrow the objective
        </button>
        <button
          type="button"
          data-testid="refusal-lower-standard"
          onClick={onLowerStandard}
          className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50"
        >
          Lower the standard
        </button>
        <button
          type="button"
          data-testid="refusal-new-ask"
          onClick={onReset}
          className="ml-auto px-3 py-1.5 rounded-md text-rms-mute hover:text-rms-ink"
        >
          Ask another
        </button>
      </section>
      <footer
        data-testid="refusal-footer"
        className="mt-8 pt-4 border-t border-rms-line text-xs text-rms-mute"
      >
        A refusal is the system keeping its promise —{' '}
        <button
          type="button"
          data-testid="refusal-why-link"
          onClick={onWhyRefused}
          className="underline hover:text-rms-ink"
        >
          Why this was refused
        </button>
        .
      </footer>
    </article>
  );
}

function AcceptedView({ ask, accepted, elapsedMs, onReset }) {
  // Phase 5b §7 async admission landing. When the ask is warm-and-qualified
  // (Phase 4b §6.2), the endpoint returns 200 with a ComposedConclusion —
  // the AnswerView above renders that. When the ask is fresh, the endpoint
  // returns 202 with AsyncDeliveryAccepted_v1: the ask is admitted into the
  // work queue and delivery is asynchronous. Phase 8a-lite scope is
  // Ask/Answer/Refusal per §3; 202 is a legitimate governance state that
  // must be rendered honestly (not laundered as infra fault, not as answer).
  const t = elapsedMs != null ? `${Math.round(elapsedMs)} ms` : '—';
  const traceId = accepted?.trace_id;
  return (
    <article
      data-testid="accepted-view"
      className="w-full max-w-3xl mx-auto"
      aria-label="Accepted"
    >
      <header className="border-b border-rms-line pb-4 mb-6">
        <p className="text-sm text-rms-mute mb-1">Asked</p>
        <h1 className="text-xl font-medium text-rms-ink">{ask}</h1>
        <p data-testid="accepted-meta" className="mt-3 text-xs text-rms-mute font-mono">
          accepted in {t}
        </p>
      </header>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
        <h2
          data-testid="accepted-headline"
          className="text-sm font-semibold text-blue-900"
        >
          Accepted — being composed.
        </h2>
        <p data-testid="accepted-body" className="mt-2 text-sm text-blue-900">
          This ask has been admitted into the delivery queue. The composed
          answer will be delivered when ready.
        </p>
        <dl className="mt-4 text-xs font-mono text-blue-900 space-y-1">
          <div className="flex gap-2">
            <dt className="text-blue-700">objective_id:</dt>
            <dd data-testid="accepted-objective-id">{accepted?.objective_id || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-blue-700">delivery_estimate:</dt>
            <dd data-testid="accepted-delivery-estimate">
              {accepted?.delivery_estimate || '—'}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-blue-700">trace_id:</dt>
            <dd data-testid="accepted-trace-id">{traceId || '—'}</dd>
          </div>
        </dl>
      </div>
      <footer className="mt-6 flex flex-wrap gap-3 text-sm">
        {traceId && (
          <a
            data-testid="accepted-trust-receipt"
            href={`/trace/${traceId}`}
            className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50 text-rms-ink no-underline"
          >
            Trust receipt
          </a>
        )}
        <button
          type="button"
          data-testid="accepted-new-ask"
          onClick={onReset}
          className="ml-auto px-3 py-1.5 rounded-md text-rms-mute hover:text-rms-ink"
        >
          Ask another
        </button>
      </footer>
    </article>
  );
}

function InfraFaultView({ ask, error, onReset }) {
  // Infra-not-refusal (Standing Disposition #2): 5xx and network errors are
  // rendered as infra faults, NEVER as governed refusals. The distinction is
  // the doctrine keeping the promise that "infrastructure faults return 500
  // and are never rendered as refusals" (UI Spec §4.2 verbatim).
  return (
    <article
      data-testid="infra-fault-view"
      className="w-full max-w-3xl mx-auto"
      aria-label="Infrastructure fault"
    >
      <header className="mb-4">
        <p className="text-sm text-rms-mute mb-1">Asked</p>
        <h1 className="text-xl font-medium text-rms-ink">{ask}</h1>
      </header>
      <div className="rounded-lg border-2 border-red-300 bg-red-50 p-5">
        <h2
          data-testid="infra-fault-title"
          className="text-sm font-semibold text-red-900"
        >
          System temporarily unavailable.
        </h2>
        <p
          data-testid="infra-fault-body"
          className="mt-2 text-sm text-red-900"
        >
          The service could not complete your ask. This is an infrastructure
          fault, not a governance decision. Try again in a moment.
        </p>
        <p className="mt-3 text-xs font-mono text-red-700" data-testid="infra-fault-detail">
          {error?.status ? `HTTP ${error.status}` : 'network'}
          {error?.message ? ` · ${error.message}` : ''}
        </p>
      </div>
      <div className="mt-6 flex">
        <button
          type="button"
          data-testid="infra-fault-retry"
          onClick={onReset}
          className="px-3 py-1.5 rounded-md border border-rms-line hover:bg-gray-50 text-sm"
        >
          Try again
        </button>
      </div>
    </article>
  );
}

export default function AskConsolePage() {
  const [askText, setAskText] = useState('');
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState('ask'); // 'ask' | 'answer' | 'refusal' | 'accepted' | 'infra_fault'
  const [conclusion, setConclusion] = useState(null);
  const [refusal, setRefusal] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState(null);
  const [elapsedMs, setElapsedMs] = useState(null);
  const [submittedAsk, setSubmittedAsk] = useState('');
  const [recent, setRecent] = useState([]);

  const submit = async () => {
    const ask = askText.trim();
    if (!ask) return;
    setBusy(true);
    setSubmittedAsk(ask);
    setError(null);
    setConclusion(null);
    setRefusal(null);
    setAccepted(null);
    const t0 = performance.now();
    try {
      const { status, body } = await api.dispatchV2(buildObjectiveRequestV2(ask));
      const elapsed = performance.now() - t0;
      setElapsedMs(elapsed);
      if (isRefusal(body)) {
        setRefusal(body);
        setPhase('refusal');
        setRecent((r) => [{ ask, outcome: `refused:${body.reason}` }, ...r].slice(0, 5));
      } else if (status === 200 && body && body.conclusion_class) {
        setConclusion(body);
        setPhase('answer');
        setRecent((r) => [{ ask, outcome: `answered:${body.conclusion_class}` }, ...r].slice(0, 5));
      } else if (status === 202 && body && body.status === 'accepted') {
        // Phase 5b §7 async admission — legitimate governance state.
        // Rendered honestly per infra-not-refusal doctrine (not laundered
        // as an answer or a refusal).
        setAccepted(body);
        setPhase('accepted');
        setRecent((r) => [{ ask, outcome: 'accepted:async' }, ...r].slice(0, 5));
      } else {
        // Any other body shape (e.g., 501 placeholder, qualified_data
        // payload out of §3 scope, or validation-422 with `detail`) is
        // rendered as infra fault so we don't fabricate a governance
        // shape.
        setError({ status, message: 'Unsupported response shape at Ask Console (out of §3 scope).' });
        setPhase('infra_fault');
      }
    } catch (e) {
      // Network / 5xx — infra-not-refusal doctrine.
      setError({ status: e.response?.status || null, message: e.message });
      setPhase('infra_fault');
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setPhase('ask');
    setConclusion(null);
    setRefusal(null);
    setAccepted(null);
    setError(null);
    setAskText('');
    setSubmittedAsk('');
    setElapsedMs(null);
  };

  return (
    <div
      data-testid="ask-console-page"
      className="min-h-screen flex flex-col bg-white"
    >
      <header className="border-b border-rms-line">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-base font-semibold tracking-tight text-rms-ink">
              RMS Intelligence
            </h1>
            <span
              data-testid="header-surface-marker"
              className="text-[10px] font-mono uppercase text-rms-mute tracking-wider"
            >
              Ask Console
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span
              data-testid="header-gate-badge"
              className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded bg-rms-ink text-white"
            >
              8a-lite
            </span>
            <ConsoleNavMenu />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {phase === 'ask' && (
          <>
            <AskInput
              value={askText}
              onChange={setAskText}
              onSubmit={submit}
              busy={busy}
            />
            <RecentList items={recent} onSelect={(a) => setAskText(a)} />
          </>
        )}
        {phase === 'answer' && (
          <AnswerView
            ask={submittedAsk}
            conclusion={conclusion}
            elapsedMs={elapsedMs}
            onExport={() => {}}
            onWhy={() => {}}
            onTrustReceipt={(e) => {
              if (!conclusion?.trace_id) e.preventDefault();
            }}
            onReset={reset}
          />
        )}
        {phase === 'refusal' && (
          <RefusalView
            ask={submittedAsk}
            refusal={refusal}
            onAcceptAsRecorded={() => {}}
            onNarrow={reset}
            onLowerStandard={reset}
            onWhyRefused={() => {}}
            onReset={reset}
          />
        )}
        {phase === 'accepted' && (
          <AcceptedView
            ask={submittedAsk}
            accepted={accepted}
            elapsedMs={elapsedMs}
            onReset={reset}
          />
        )}
        {phase === 'infra_fault' && (
          <InfraFaultView ask={submittedAsk} error={error} onReset={reset} />
        )}
      </main>
    </div>
  );
}
