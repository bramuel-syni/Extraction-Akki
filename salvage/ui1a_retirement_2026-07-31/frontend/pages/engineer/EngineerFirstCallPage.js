/**
 * UI Spec §4.2 — Engineer · First call — the contract.
 *
 * Verbatim elements per Spec:
 *   * request block (POST /v1/objectives with ask / standard / scope);
 *   * two response panels side by side — Answered and Refused — same
 *     envelope, body discriminator;
 *   * async addition: fresh-extraction asks return 202 with the
 *     AsyncDeliveryAccepted_v1 shape; status transitions appear in
 *     Administer.
 *   * Binding copy: "There is no response shape in which the claim is
 *     separable from its class. Infrastructure faults return 500 and
 *     are never rendered as refusals."
 *
 * Phase 8 Stage B-4 amendment (Owner-ratified fixture-schema gate,
 * 2026-07-05): the three illustrative fixtures are now shaped VERBATIM
 * against their frozen backend contracts and are exported so the Jest
 * gate `test_engineer_first_call_fixture_matches_frozen_contracts.test.js`
 * validates fixture keys as a subset of the contract snapshot property
 * names. "Marked as illustration" moves from assertion to invariant.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCode2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const REQUEST_ILLUSTRATIVE = `POST /v1/objectives
{
  "ask": "What lifespan does this cohort exhibit?",
  "standard": "established_fact",
  "scope": "estate"
}`;

// Answered response — shape matches ComposedConclusion_v0 (frozen contract 18)
// verbatim. Fields: answer_text, conclusion_class, trace_id,
// load_bearing_unit_ids, objective_ref, computed_at.
export const ANSWERED_ILLUSTRATIVE = Object.freeze({
  answer_text: 'Cohort A shows median lifespan 41 months.',
  conclusion_class: 'fact',
  trace_id: 'trc-a1b2c3',
  load_bearing_unit_ids: ['unit-solva-9f42', 'unit-solva-3a10'],
  objective_ref: 'obj-e2f3g4',
  computed_at: '2026-07-05T14:00:00Z',
});

// Refused response — shape matches Service1Refusal_v0 (frozen contract 14)
// verbatim. Fields: outcome, reason, run_id, trace_id, asked,
// supported_class (nullable), what_would_raise_it.
export const REFUSED_ILLUSTRATIVE = Object.freeze({
  outcome: 'refused',
  reason: 'composition_below_floor',
  run_id: 'run-a1b2c3',
  trace_id: 'trc-a1b2c3',
  asked: 'established_fact — median cohort lifespan',
  supported_class: 'utterance',
  what_would_raise_it: 'Cross-source corroboration required.',
});

// Async-accepted response — shape matches AsyncDeliveryAccepted_v1
// (frozen contract 22) verbatim. Required: objective_id,
// delivery_estimate, trace_id, accepted_at. Optional: status, quote.
export const ASYNC_ACCEPTED_ILLUSTRATIVE = Object.freeze({
  objective_id: 'obj-e2f3g4',
  delivery_estimate: 'PT5M',
  trace_id: 'trc-a1b2c3',
  accepted_at: '2026-07-05T14:00:00Z',
  status: 'accepted',
});

// Explicit fixture→contract mapping consumed by the fixture-schema gate.
export const FIXTURE_CONTRACT_MAP = Object.freeze({
  ANSWERED_ILLUSTRATIVE: 'composed_conclusion.contract_snapshot.json',
  REFUSED_ILLUSTRATIVE: 'service_1_refusal.contract_snapshot.json',
  ASYNC_ACCEPTED_ILLUSTRATIVE: 'async_delivery_accepted_v1.contract_snapshot.json',
});

function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

export default function EngineerFirstCallPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();

  if (identity === false) {
    navigate('/auth/login', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="engineer-first-call-page">
      <header className="border-b border-rms-line bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
              <h1 className="text-lg font-semibold">First call — the contract</h1>
            </div>
          </div>
          <FileCode2 className="w-5 h-5 text-rms-mute" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Request block */}
        <section data-testid="first-call-request-block">
          <h2 className="text-base font-semibold mb-2">Request</h2>
          <pre className="border border-rms-line bg-white rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">
{REQUEST_ILLUSTRATIVE}
          </pre>
        </section>

        {/* Two response panels side by side. */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="first-call-response-panels">
          <div data-testid="first-call-answered-panel">
            <h2 className="text-base font-semibold mb-2">Answered</h2>
            <pre className="border border-emerald-200 bg-emerald-50 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">
{pretty(ANSWERED_ILLUSTRATIVE)}
            </pre>
          </div>
          <div data-testid="first-call-refused-panel">
            <h2 className="text-base font-semibold mb-2">
              Refused — <span className="italic font-normal">same envelope, body discriminator</span>
            </h2>
            <pre className="border border-amber-200 bg-amber-50 rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">
{pretty(REFUSED_ILLUSTRATIVE)}
            </pre>
          </div>
        </section>

        {/* Async addition: third variant noted beneath. */}
        <section data-testid="first-call-async-variant">
          <div className="text-sm text-rms-mute mb-2">
            Fresh-extraction asks return <code className="font-mono">202 AsyncDeliveryAccepted_v1</code>;
            status transitions appear in Administer.
          </div>
          <pre className="border border-rms-line bg-white rounded p-3 text-xs font-mono overflow-x-auto whitespace-pre">
{pretty(ASYNC_ACCEPTED_ILLUSTRATIVE)}
          </pre>
        </section>

        {/* Binding copy — verbatim from UI Spec §4.2. */}
        <section
          className="border-t border-rms-line pt-4 text-sm"
          data-testid="first-call-binding-copy"
        >
          <p className="italic text-rms-ink">
            There is no response shape in which the claim is separable from its class. Infrastructure faults return 500 and are never rendered as refusals.
          </p>
        </section>
      </main>
    </div>
  );
}
