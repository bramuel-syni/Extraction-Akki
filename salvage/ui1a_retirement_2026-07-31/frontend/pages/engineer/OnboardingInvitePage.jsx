// Phase 8-EXT — invited-approved onboarding page (P8E-E3 α; internal engineer only).
// UI Spec v2.1 §5.4 line 114 verbatim: "External-scope denials are 403 access-control
// class ({reason, detail}) — never outcome=refused, never the refusal card."
// (Em-dash "—" preserved verbatim per P8E-E6 α.)
import React, { useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';

export default function OnboardingInvitePage() {
  const [invitedEmail, setInvitedEmail] = useState('');
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    const token = localStorage.getItem('rms_access_token') || '';
    try {
      const r = await axios.post(
        `${API}/api/engineer/onboarding/invite`,
        { invited_email: invitedEmail },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setInvite(r.data);
    } catch (e) {
      setError(e?.response?.data?.detail || String(e));
    }
  };

  return (
    <div data-testid="onboarding-invite-page" className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-xl font-semibold" data-testid="onboarding-invite-title">
        Invite an external engineer
      </h1>
      <div className="text-sm text-slate-600" data-testid="onboarding-invite-spec-line">
        External-scope denials are 403 access-control class ({'{reason, detail}'}) — never outcome=refused, never the refusal card.
      </div>
      <input
        data-testid="onboarding-invite-email-input"
        type="email"
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
        placeholder="engineer@partner.example"
        value={invitedEmail}
        onChange={(e) => setInvitedEmail(e.target.value)}
      />
      <button
        data-testid="onboarding-invite-submit"
        onClick={submit}
        disabled={!invitedEmail}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        Issue invite
      </button>
      {invite && (
        <div data-testid="onboarding-invite-result" className="rounded border border-slate-200 p-3 text-sm">
          <div data-testid="onboarding-invite-id">Invite id: {invite.invite_id}</div>
          <div data-testid="onboarding-invite-state">State: {invite.state}</div>
          <div data-testid="onboarding-invite-expiry">Expires: {invite.expires_at}</div>
        </div>
      )}
      {error && (
        <div data-testid="onboarding-invite-error" className="rounded border border-red-300 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
