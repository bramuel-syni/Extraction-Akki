/* UI-1-A · Use Data conversational wizard (Canon §6.2 · §6.3).
 *
 * Split view: conversation right (~60%), live cards left (~40%).
 * The six cards:
 *   1. Reflection   — always visible; the objective as it stands.
 *   2. Intel        — as scope is established.
 *   3. Test         — offer, not push (folded parameter testing).
 *   4. Plan preview — when the schema is complete enough.
 *   5. Sample results — after a representative slice runs.
 *   6. Commission   — last; explicit confirmations → verdict envelope.
 *
 * Governance law (verbatim, rendered):
 *   "Conversation shapes; the card commits." — Canon §11.1 (rendered as
 *   the wizard's active caption per the sub-cycle-3 lesson: assert the
 *   RENDERED position, not just the constant's existence).
 *
 * Every governed value confirmed EXPLICITLY on the Commission card;
 * none silently inferred from dialogue (gate_card_commits_no_silent_dialogue_values).
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell, AgentAssumedChip } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';
import { AccessControlDeniedPanel, InfrastructureFaultPanel } from '../../design/ResponseClassPanel';
import UseDataVerdictPanel from './UseDataVerdictPanel';

const CANON_S11_1_VERBATIM = 'Conversation shapes; the card commits.';

/* Canon §6.3 Reflection card copy — verbatim seed for a fresh session.
 * Field state defaults to `open`; the operator's dialogue turns them to
 * `set` at Commission time.
 */
const SEED_FIELDS = Object.freeze([
  { name: 'need', label: 'Need' },
  { name: 'scope', label: 'Scope' },
  { name: 'evidence_floor', label: 'Evidence floor' },
  { name: 'rights', label: 'Rights posture' },
  { name: 'output_form', label: 'Output form' },
]);

/* Canon §6.3 Plan preview verbatim halt-note (frozen contract Literal).
 * Rendered here for the operator's confirmation before commit.
 */
const PLAN_HALT_NOTE_VERBATIM =
  'Halts at ceiling. A halted run resumes only after you raise it or narrow the objective.';

function Card({ title, testId, children, badge }) {
  return (
    <div
      data-testid={testId}
      style={{
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        padding: '18px 20px',
        marginBottom: '14px',
        fontFamily: AKKI_V4_TYPOGRAPHY.labels,
        color: AKKI_V4_PALETTE.ink,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '10px' }}>
        <h3
          style={{
            margin: 0,
            fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
            fontSize: '1.05rem',
            color: AKKI_V4_PALETTE.ink,
          }}
        >
          {title}
        </h3>
        {badge}
      </div>
      {children}
    </div>
  );
}

function FieldStatePill({ state, testId }) {
  const palette = {
    set:     { bg: AKKI_V4_PALETTE.navy,  fg: AKKI_V4_PALETTE.cream, label: 'set' },
    open:    { bg: 'transparent',         fg: AKKI_V4_PALETTE.sage,  label: '— open', border: `1px dashed ${AKKI_V4_PALETTE.sage}` },
    assumed: { bg: AKKI_V4_PALETTE.amber, fg: AKKI_V4_PALETTE.cream, label: 'assumed' },
  }[state] || { bg: AKKI_V4_PALETTE.mist, fg: AKKI_V4_PALETTE.sage, label: state };
  return (
    <span
      data-testid={testId}
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        fontSize: '0.7rem',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: palette.bg,
        color: palette.fg,
        border: palette.border || 'none',
      }}
    >
      {palette.label}
    </span>
  );
}

function ReflectionCard({ fields, onEdit }) {
  return (
    <Card title="Reflection" testId="use-data-card-reflection">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {fields.map((f) => (
          <li
            key={f.name}
            data-testid={`use-data-reflection-field-${f.name}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.ink }}>{f.label}</div>
              <div style={{ fontSize: '0.8rem', color: AKKI_V4_PALETTE.sage, marginTop: '2px' }}>
                {f.value || (f.state === 'open' ? '— open' : '—')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FieldStatePill state={f.state} testId={`use-data-reflection-field-state-${f.name}`} />
              <button
                type="button"
                data-testid={`use-data-reflection-field-edit-${f.name}`}
                onClick={() => onEdit(f)}
                style={{
                  fontSize: '0.75rem',
                  background: 'transparent',
                  border: `1px solid ${AKKI_V4_PALETTE.navy}`,
                  color: AKKI_V4_PALETTE.navy,
                  padding: '3px 8px',
                  cursor: 'pointer',
                }}
              >
                edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function IntelCard({ intel }) {
  const unset = intel?.unset ?? true;
  return (
    <Card title="Intel" testId="use-data-card-intel">
      {unset ? (
        <div
          data-testid="use-data-intel-unset"
          style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}
        >
          No grounded claim served yet — the registry answers as scope narrows.
        </div>
      ) : (
        <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
          {(intel.grounded_claims || []).map((c, i) => (
            <li
              key={i}
              data-testid={`use-data-intel-claim-${i}`}
              style={{ fontSize: '0.85rem', padding: '3px 0' }}
            >
              · {c}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TestCard({ test }) {
  const offered = test?.offered ?? false;
  return (
    <Card
      title="Test"
      testId="use-data-card-test"
      badge={
        offered ? (
          <span style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, letterSpacing: '0.04em' }}>
            offered · not pushed
          </span>
        ) : null
      }
    >
      <div
        data-testid="use-data-test-status"
        style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}
      >
        {offered
          ? 'Run a sample against a small slice — cost per thousand and observed quality land in Sample results.'
          : 'Test folds in when the schema is complete enough. Offer, not push.'}
      </div>
    </Card>
  );
}

function PlanPreviewCard({ plan, onChange }) {
  return (
    <Card title="Plan preview" testId="use-data-card-plan-preview">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>coverage low %</div>
          <input
            type="number"
            data-testid="use-data-plan-coverage-low"
            value={plan.coverage_range_low_pct ?? ''}
            onChange={(e) => onChange({ coverage_range_low_pct: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle}
          />
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>coverage high %</div>
          <input
            type="number"
            data-testid="use-data-plan-coverage-high"
            value={plan.coverage_range_high_pct ?? ''}
            onChange={(e) => onChange({ coverage_range_high_pct: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle}
          />
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>cost low USD</div>
          <input
            type="number"
            data-testid="use-data-plan-cost-low"
            value={plan.cost_low_usd ?? ''}
            onChange={(e) => onChange({ cost_low_usd: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle}
          />
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>cost high USD</div>
          <input
            type="number"
            data-testid="use-data-plan-cost-high"
            value={plan.cost_high_usd ?? ''}
            onChange={(e) => onChange({ cost_high_usd: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle}
          />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>ceiling USD (editable · halts at ceiling)</div>
          <input
            type="number"
            data-testid="use-data-plan-ceiling"
            value={plan.ceiling_usd ?? ''}
            onChange={(e) => onChange({ ceiling_usd: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle}
          />
        </label>
      </div>
      <p
        data-testid="use-data-plan-halt-note-verbatim"
        style={{
          marginTop: '10px',
          fontSize: '0.78rem',
          color: AKKI_V4_PALETTE.oxblood,
          fontStyle: 'italic',
        }}
      >
        {PLAN_HALT_NOTE_VERBATIM}
      </p>
    </Card>
  );
}

function SampleResultsCard({ sample }) {
  const grounded = sample?.grounded_by_receipt_ref;
  return (
    <Card title="Sample results" testId="use-data-card-sample-results">
      {grounded ? (
        <div style={{ fontSize: '0.85rem' }}>
          <div data-testid="use-data-sample-units">units: {sample.units_found}</div>
          <div data-testid="use-data-sample-cost">$/hour: {sample.per_hour_cost_usd}</div>
          <div
            data-testid="use-data-sample-receipt-ref"
            style={{ marginTop: '6px', fontFamily: AKKI_V4_TYPOGRAPHY.monoLine, color: AKKI_V4_PALETTE.sage }}
          >
            trust-receipt · {grounded}
          </div>
        </div>
      ) : (
        <div data-testid="use-data-sample-unset" style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}>
          No representative slice run yet. Observed against planned lands here after Test executes.
        </div>
      )}
    </Card>
  );
}

function CommissionCard({ session, form, onFormChange, onCommit, committing, verdict }) {
  const allConfirmed = form.values_confirmed?.length >= 5;
  return (
    <Card
      title="Commission"
      testId="use-data-card-commission"
      badge={
        verdict ? (
          <span style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, letterSpacing: '0.04em' }}>
            committed · {verdict.outcome}
          </span>
        ) : null
      }
    >
      <p
        style={{
          fontSize: '0.85rem',
          color: AKKI_V4_PALETTE.ink,
          margin: '0 0 10px 0',
        }}
        data-testid="use-data-commission-instruction"
      >
        Confirm every governed value explicitly. Dialogue shapes; the card commits.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>rights posture</div>
          <select
            data-testid="use-data-commission-rights"
            value={form.rights_declared || ''}
            onChange={(e) => onFormChange({ rights_declared: e.target.value || null })}
            style={inputStyle}
          >
            <option value="">—</option>
            <option value="internal_only">internal_only</option>
            <option value="internal_plus_partner">internal_plus_partner</option>
            <option value="commercial">commercial</option>
            <option value="training">training</option>
          </select>
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>training rights inheritable</div>
          <select
            data-testid="use-data-commission-inherit"
            value={form.training_rights_inheritable ? 'yes' : 'no'}
            onChange={(e) => onFormChange({ training_rights_inheritable: e.target.value === 'yes' })}
            style={inputStyle}
          >
            <option value="no">no</option>
            <option value="yes">yes</option>
          </select>
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>privacy floor</div>
          <input
            type="text"
            data-testid="use-data-commission-privacy-floor"
            value={form.privacy_floor_declared || ''}
            onChange={(e) => onFormChange({ privacy_floor_declared: e.target.value || null })}
            placeholder="e.g. k>=10"
            style={inputStyle}
          />
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>PII posture</div>
          <select
            data-testid="use-data-commission-pii"
            value={form.pii_posture_declared || ''}
            onChange={(e) => onFormChange({ pii_posture_declared: e.target.value || null })}
            style={inputStyle}
          >
            <option value="">—</option>
            <option value="raw">raw (Owner-authorised)</option>
            <option value="pseudonymized">pseudonymized</option>
            <option value="redacted">redacted</option>
            <option value="masked">masked</option>
          </select>
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>class D resolvable</div>
          <select
            data-testid="use-data-commission-class-d"
            value={form.class_d_resolvable ? 'yes' : 'no'}
            onChange={(e) => onFormChange({ class_d_resolvable: e.target.value === 'yes' })}
            style={inputStyle}
          >
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>
        </label>
        <label>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>proposed budget USD</div>
          <input
            type="number"
            data-testid="use-data-commission-budget"
            value={form.proposed_budget_usd ?? ''}
            onChange={(e) => onFormChange({ proposed_budget_usd: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle}
          />
        </label>
        <label style={{ gridColumn: '1 / -1' }}>
          <div style={{ color: AKKI_V4_PALETTE.sage, fontSize: '0.75rem' }}>
            values confirmed on this card (check to confirm each explicitly)
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
            {['rights', 'privacy_floor', 'pii_posture', 'budget', 'scope'].map((k) => {
              const checked = form.values_confirmed?.includes(k);
              return (
                <label
                  key={k}
                  data-testid={`use-data-commission-confirm-${k}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                >
                  <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={() => {
                      const cur = new Set(form.values_confirmed || []);
                      if (cur.has(k)) cur.delete(k);
                      else cur.add(k);
                      onFormChange({ values_confirmed: Array.from(cur) });
                    }}
                  />
                  {k}
                </label>
              );
            })}
          </div>
        </label>
      </div>
      <button
        type="button"
        data-testid="use-data-commission-commit-btn"
        disabled={committing || !allConfirmed || !!verdict}
        onClick={onCommit}
        style={{
          marginTop: '14px',
          background: allConfirmed && !verdict ? AKKI_V4_PALETTE.navy : AKKI_V4_PALETTE.mist,
          color: allConfirmed && !verdict ? AKKI_V4_PALETTE.cream : AKKI_V4_PALETTE.sage,
          border: 'none',
          padding: '10px 18px',
          fontSize: '0.9rem',
          cursor: allConfirmed && !verdict && !committing ? 'pointer' : 'not-allowed',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          letterSpacing: '0.02em',
        }}
      >
        {verdict ? 'committed' : committing ? 'committing …' : 'Commit'}
      </button>
    </Card>
  );
}

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  border: `1px solid ${AKKI_V4_PALETTE.mist}`,
  background: '#fff',
  fontSize: '0.85rem',
  color: AKKI_V4_PALETTE.ink,
  fontFamily: AKKI_V4_TYPOGRAPHY.labels,
  boxSizing: 'border-box',
};

function DialoguePane({ session, onSend, sending }) {
  const [draft, setDraft] = useState('');
  const dialogue = session?.dialogue || [];
  async function send() {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    await onSend(t);
  }
  return (
    <section
      data-testid="use-data-dialogue"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: AKKI_V4_PALETTE.bone,
        border: `1px solid ${AKKI_V4_PALETTE.mist}`,
        minHeight: '540px',
      }}
    >
      <header
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${AKKI_V4_PALETTE.mist}`,
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontSize: '1rem',
        }}
      >
        Conversation
      </header>
      <div
        data-testid="use-data-dialogue-list"
        style={{
          flex: 1,
          padding: '12px 16px',
          overflow: 'auto',
          fontSize: '0.9rem',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        {dialogue.length === 0 && (
          <div data-testid="use-data-dialogue-empty" style={{ color: AKKI_V4_PALETTE.sage }}>
            Say what you need. As you talk, the cards on the left fill.
          </div>
        )}
        {dialogue.map((t) => (
          <div
            key={t.turn_id}
            data-testid={`use-data-dialogue-turn-${t.role}`}
            style={{
              marginBottom: '10px',
              padding: '8px 12px',
              background: t.role === 'user' ? AKKI_V4_PALETTE.mist : 'transparent',
              borderLeft: t.role === 'agent' ? `2px solid ${AKKI_V4_PALETTE.navy}` : 'none',
            }}
          >
            <div style={{ fontSize: '0.7rem', color: AKKI_V4_PALETTE.sage, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {t.role}
            </div>
            <div>{t.text}</div>
          </div>
        ))}
      </div>
      <footer style={{ padding: '10px 16px', borderTop: `1px solid ${AKKI_V4_PALETTE.mist}` }}>
        <textarea
          data-testid="use-data-dialogue-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Describe what you need. Watch the cards fill."
          rows={2}
          style={{
            width: '100%',
            padding: '8px',
            border: `1px solid ${AKKI_V4_PALETTE.mist}`,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
            fontSize: '0.9rem',
            boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          data-testid="use-data-dialogue-send-btn"
          disabled={sending}
          onClick={send}
          style={{
            marginTop: '6px',
            background: AKKI_V4_PALETTE.navy,
            color: AKKI_V4_PALETTE.cream,
            border: 'none',
            padding: '6px 14px',
            fontSize: '0.85rem',
            cursor: sending ? 'not-allowed' : 'pointer',
            fontFamily: AKKI_V4_TYPOGRAPHY.labels,
          }}
        >
          Send
        </button>
      </footer>
    </section>
  );
}

function useMergeFields(session) {
  return useMemo(() => {
    const existing = session?.reflection?.fields || [];
    const byName = new Map(existing.map((f) => [f.name, f]));
    return SEED_FIELDS.map((seed) => byName.get(seed.name) || {
      name: seed.name,
      label: seed.label,
      state: 'open',
      value: null,
    });
  }, [session]);
}

export default function UseDataWizardPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [deny, setDeny] = useState(null);
  const [fault, setFault] = useState(null);
  const [sending, setSending] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [commitForm, setCommitForm] = useState({
    rights_declared: null,
    training_rights_inheritable: false,
    privacy_floor_declared: null,
    pii_posture_declared: null,
    class_d_resolvable: true,
    proposed_budget_usd: null,
    org_budget_ceiling_usd: null,
    scope_source_ids: [],
    connected_source_ids: [],
    censused_source_ids: [],
    values_confirmed: [],
  });

  useEffect(() => {
    (async () => {
      const r = await api.useDataReadSession(sessionId);
      if (r.status === 401 || r.status === 403) {
        setDeny(r.body);
        return;
      }
      if (r.status >= 500) {
        setFault(r.body);
        return;
      }
      if (r.status === 404) {
        navigate('/use-data');
        return;
      }
      setSession(r.body);
    })();
  }, [sessionId, navigate]);

  const fields = useMergeFields(session);

  async function sendTurn(text) {
    setSending(true);
    const rUser = await api.useDataAppendTurn(sessionId, 'user', text);
    if (rUser.status === 200) setSession(rUser.body);
    // UI-1-A wizard is a deterministic scaffold: an agent echo lands on the
    // conversation to prove the two-role dialogue channel; grounded Intel
    // synthesis lands via the SyniSense Shield in UI-1-B (Canon §6.2 seed).
    const rAgent = await api.useDataAppendTurn(
      sessionId,
      'agent',
      'I hear you. As you narrow scope, the Reflection card on the left updates. Confirm each governed value on the Commission card at commit time.'
    );
    if (rAgent.status === 200) setSession(rAgent.body);
    setSending(false);
  }

  async function editField(field) {
    const value = window.prompt(`Set the value for "${field.label}" (blank to leave open):`, field.value || '');
    if (value === null) return;
    const state = value.trim() === '' ? 'open' : 'set';
    const r = await api.useDataUpsertReflection(sessionId, {
      name: field.name,
      label: field.label,
      state,
      value: state === 'set' ? value.trim() : null,
    });
    if (r.status === 200) setSession(r.body);
  }

  function updatePlan(patch) {
    const p = { ...(session?.plan_preview || {}), ...patch };
    setSession((s) => (s ? { ...s, plan_preview: p } : s));
    api.useDataSetPlan(sessionId, {
      coverage_range_low_pct: p.coverage_range_low_pct ?? null,
      coverage_range_high_pct: p.coverage_range_high_pct ?? null,
      cost_low_usd: p.cost_low_usd ?? null,
      cost_high_usd: p.cost_high_usd ?? null,
      ceiling_usd: p.ceiling_usd ?? null,
    });
  }

  function updateCommitForm(patch) {
    setCommitForm((f) => ({ ...f, ...patch }));
  }

  async function commit() {
    setCommitting(true);
    const r = await api.useDataCommit(sessionId, commitForm);
    setCommitting(false);
    if (r.status === 200 && r.body?.verdict) {
      setSession(r.body.session);
      setVerdict(r.body.verdict);
      return;
    }
    if (r.status === 401 || r.status === 403) setDeny(r.body);
    else if (r.status >= 500) setFault(r.body);
    else if (r.status === 422 && r.body?.outcome === 'refused') {
      setVerdict({
        outcome: 'refused',
        refusal: {
          kind: 'escalatable',
          reason_code: r.body.reason,
          criterion: r.body.detail,
          route_to_approval: r.body.route_to_approval,
        },
        checks: [],
        auto_run_ceiling: { ceiling_usd: 0, proposed_spend_usd: 0, at_or_under: true, dpo_countersign_required: false },
        verbatim_carrier: 'Every commission verdict lands in the record the DPO reads.',
      });
    }
  }

  if (deny) {
    return (
      <AkkiShell title="Use Data · Wizard">
        <AccessControlDeniedPanel reason={deny?.reason} detail={deny?.detail} />
      </AkkiShell>
    );
  }
  if (fault) {
    return (
      <AkkiShell title="Use Data · Wizard">
        <InfrastructureFaultPanel headline="wizard read failed" detail={fault?.detail} />
      </AkkiShell>
    );
  }
  if (!session) {
    return (
      <AkkiShell title="Use Data · Wizard">
        <div style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.sage }}>opening the conversation …</div>
      </AkkiShell>
    );
  }

  return (
    <AkkiShell
      title={`Use Data · ${session.door.replaceAll('_', ' ')}`}
      subtitle="One conversation. Six cards. One committed act."
    >
      <p
        data-testid="use-data-wizard-canon-11-1-verbatim"
        style={{
          fontFamily: AKKI_V4_TYPOGRAPHY.wordmark,
          fontStyle: 'italic',
          margin: '0 0 18px 0',
          color: AKKI_V4_PALETTE.ink,
        }}
      >
        {CANON_S11_1_VERBATIM}
      </p>
      <div
        data-testid="use-data-wizard-split"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 40%) 1fr',
          gap: '22px',
          alignItems: 'start',
        }}
      >
        {/* CARDS · left ~40% */}
        <div data-testid="use-data-cards-column">
          <ReflectionCard fields={fields} onEdit={editField} />
          <IntelCard intel={session.intel} />
          <TestCard test={session.test} />
          <PlanPreviewCard plan={session.plan_preview || {}} onChange={updatePlan} />
          <SampleResultsCard sample={session.sample_results} />
          <CommissionCard
            session={session}
            form={commitForm}
            onFormChange={updateCommitForm}
            onCommit={commit}
            committing={committing}
            verdict={verdict}
          />
          {verdict && <UseDataVerdictPanel verdict={verdict} />}
        </div>
        {/* DIALOGUE · right ~60% */}
        <DialoguePane session={session} onSend={sendTurn} sending={sending} />
      </div>
    </AkkiShell>
  );
}
