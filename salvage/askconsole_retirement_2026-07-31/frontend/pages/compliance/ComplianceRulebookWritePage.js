/**
 * Phase 8 Stage B-5b — Compliance Rulebook-Write Page.
 *
 * UI Spec v2.1 §4.4-4.5 wiring: 4 rule-class writers routing through the
 * §8 consequence-class checker (POST /api/checker/initiate via the
 * compliance rulebook endpoints). Reuses §6.2 plain-language rule pattern.
 *
 * Owner Ruling B5b-E2 (α, Amendment H): server-side validation ONLY;
 * client renders the server's plain-language error verbatim. No shadow
 * rulebook.
 *
 * Owner Ruling B5b-E3 (γ, Amendment H): disclosure_type as constrained-
 * str backed by disclosure_types.v0.json registry.
 */
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

const MIDDLE_DOT = '\u00B7';

const RULE_CLASSES = [
  {
    key: 'retention_windows',
    label: 'Retention windows',
    endpoint: '/compliance/retention_config',
    description:
      "How long each held class is kept. Lengthening a window requires an Administration counter-sign. Shortening applies unilaterally with a delay.",
    schema: 'ledger_row',
    testid: 'retention-writer',
  },
  {
    key: 'disclosure_thresholds',
    label: 'Disclosure thresholds',
    endpoint: '/compliance/disclosure_thresholds',
    description:
      'Anonymity floors (k-anonymity, l-diversity, DP budget). Loosening a floor requires an Administration counter-sign.',
    schema: 'disclosure',
    testid: 'disclosure-writer',
  },
  {
    key: 'lawful_basis_registry',
    label: 'Lawful-basis registry',
    endpoint: '/compliance/lawful_basis_registry',
    description:
      'Which lawful basis governs each processing activity. Changing a basis requires an Administration counter-sign.',
    schema: 'basis',
    testid: 'lawful-basis-writer',
  },
  {
    key: 'source_standing_table',
    label: 'Source-standing table',
    endpoint: '/compliance/source_standing_table',
    description:
      'Which sources have standing to appear in extractions. Change applies unilaterally with a delay.',
    schema: 'standing',
    testid: 'source-standing-writer',
  },
];

function RuleClassWriter({ rc, token }) {
  const [busy, setBusy] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');
  const [disclosureType, setDisclosureType] = useState('k_anonymity');

  const submit = async () => {
    setBusy(true);
    setResponse(null);
    setError(null);
    try {
      let body;
      if (rc.schema === 'disclosure') {
        body = {
          disclosure_type: disclosureType,
          from_value: fromValue,
          to_value: toValue,
        };
      } else if (rc.schema === 'ledger_row') {
        body = { ledger_row: { window_days: Number(toValue) || null } };
      } else {
        body = { from_value_ref: fromValue, to_value_ref: toValue };
      }
      const res = await axios.post(`${API}${rc.endpoint}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResponse(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || 'Request failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      data-testid={rc.testid}
      className="rounded-lg border border-slate-200 bg-white p-6 space-y-4"
    >
      <header>
        <h2 data-testid={`${rc.testid}-label`} className="text-lg font-medium">
          {rc.label}
        </h2>
        <p data-testid={`${rc.testid}-description`} className="text-sm text-slate-600 mt-2">
          {rc.description}
        </p>
      </header>
      {rc.schema === 'disclosure' && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`${rc.testid}-type`}>
            Disclosure type
          </label>
          <select
            id={`${rc.testid}-type`}
            data-testid={`${rc.testid}-type`}
            value={disclosureType}
            onChange={(e) => setDisclosureType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded"
          >
            <option value="k_anonymity">k-anonymity</option>
            <option value="l_diversity">l-diversity</option>
            <option value="dp_budget">Differential-privacy budget</option>
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`${rc.testid}-from`}>
            {rc.schema === 'ledger_row' ? 'Current window (days)' : 'From value'}
          </label>
          <input
            id={`${rc.testid}-from`}
            data-testid={`${rc.testid}-from`}
            value={fromValue}
            onChange={(e) => setFromValue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor={`${rc.testid}-to`}>
            {rc.schema === 'ledger_row' ? 'Proposed window (days)' : 'To value'}
          </label>
          <input
            id={`${rc.testid}-to`}
            data-testid={`${rc.testid}-to`}
            value={toValue}
            onChange={(e) => setToValue(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded"
          />
        </div>
      </div>
      <button
        data-testid={`${rc.testid}-submit`}
        disabled={busy}
        onClick={submit}
        className="px-4 py-2 rounded bg-slate-900 text-white text-sm disabled:opacity-50"
      >
        {busy ? 'Submitting…' : 'Propose change'}
      </button>
      {response && (
        <div
          data-testid={`${rc.testid}-response`}
          className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm"
        >
          <div data-testid={`${rc.testid}-response-state`}>
            State: {response.state} {MIDDLE_DOT} class {response.consequence_class}
          </div>
          <div data-testid={`${rc.testid}-response-request-id`} className="text-xs text-slate-600 mt-1">
            Request: {response.request_id}
          </div>
        </div>
      )}
      {error && (
        <div
          data-testid={`${rc.testid}-error`}
          className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </div>
      )}
    </section>
  );
}

export default function ComplianceRulebookWritePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('rms_auth_token') || '';
  return (
    <div className="min-h-screen bg-slate-50" data-testid="compliance-rulebook-write-page">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <button
            data-testid="rulebook-back"
            onClick={() => navigate('/compliance')}
            className="text-sm text-slate-600 flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-lg font-semibold">Compliance rulebook</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <p data-testid="rulebook-intro" className="text-sm text-slate-700">
          Compliance owns these rule classes {MIDDLE_DOT} changes are recorded with today's date {MIDDLE_DOT} loosenings require Administration counter-sign.
        </p>
        {RULE_CLASSES.map((rc) => (
          <RuleClassWriter key={rc.key} rc={rc} token={token} />
        ))}
      </main>
    </div>
  );
}
