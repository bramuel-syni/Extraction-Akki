/**
 * v2.1 §4.3 — Retention & rights.
 *
 * When unset — verbatim banner (B5a-G3 substrate).
 * Held-classes render SEPARATELY ADDRESSABLE (Owner E5 seam):
 *   - ledger_row
 *   - wizard_transcript
 *   - delivered_artifact
 * Each renders as a structurally-separate DOM region with distinct
 * semantic label + posture badge (inheriting/explicit/unset).
 *
 * READ-ONLY at B-5a. §4.4/§4.5 rulebook writes are B-5b scope.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../../apiClient';
import { useAuth } from '../../hooks/useAuth';
import { AuthDeniedNotice, RetentionPostureBadge } from '../../components/ui_spec_v1';

// v2.1 §4.3 line 76 VERBATIM — B5a-G3 substrate.
const V2_1_RETENTION_UNSET_BANNER =
  "No deletion rule is set. The system holds everything indefinitely and append-only until you set a retention window. This is a decision only you can make \u2014 the system won't guess a duration.";

// v2.1 §4.3 governed-rule bottom binding copy.
const V2_1_RETENTION_GOVERNED_RULE_COPY =
  'Setting a retention window here becomes a governed rule \u2014 versioned, dated, and recorded like every control change.';

const CLASS_LABELS = {
  ledger_row: 'Ledger rows',
  wizard_transcript: 'Wizard transcripts',
  delivered_artifact: 'Delivered acquisitions',
};

const CLASS_HELP = {
  ledger_row: 'Every governance decision — admissions, refusals, gate outcomes.',
  wizard_transcript: 'Operator wizard sessions and their committed values.',
  delivered_artifact: 'Irreversibly transformed \u00b7 licensed \u00b7 receipts on file.',
};

function hasComplianceAuthority(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.includes('dpo') || roles.includes('admin');
}

export default function ComplianceRetentionRightsPage() {
  const { identity } = useAuth();
  const navigate = useNavigate();
  const [retention, setRetention] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const r = await api.complianceRetentionConfig();
    if (r.status === 200) setRetention(r.body);
    else setError({ status: r.status, body: r.body });
  }, []);

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
      <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="compliance-retention-page">
        <AuthDeniedNotice
          reason="auth_scope_insufficient"
          detail="Compliance Console requires the `dpo` role (or `admin`)."
        />
      </div>
    );
  }

  const allUnset = retention && retention.held_classes.every((c) => c.posture === 'unset');

  return (
    <div className="min-h-screen bg-rms-canvas text-rms-ink" data-testid="compliance-retention-page">
      <header className="border-b border-rms-line bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/compliance')}
              className="p-1 hover:bg-rms-highlight rounded"
              data-testid="compliance-retention-nav-back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="text-xs text-rms-mute uppercase tracking-wide">RMS Intelligence · compliance</div>
              <h1 className="text-lg font-semibold">Retention &amp; rights</h1>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-rms-mute" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* B5a-G3 substrate — verbatim honest banner when all-unset. */}
        {allUnset && (
          <section
            className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-md"
            data-testid="compliance-retention-unset-banner"
          >
            <p className="text-sm text-amber-900" data-testid="compliance-retention-unset-copy">
              {V2_1_RETENTION_UNSET_BANNER}
            </p>
          </section>
        )}

        {error && (
          <section className="border border-rms-line rounded-md p-4 bg-white" data-testid="compliance-retention-infra-fault">
            <p className="text-sm text-rms-ink">
              A read failed. Status {error.status}. Infrastructure fault, not a refusal.
            </p>
          </section>
        )}

        {retention && (
          <>
            {retention.global_default.days !== null && (
              <section className="border border-rms-line rounded-md p-4 bg-white" data-testid="compliance-retention-global-default">
                <div className="text-xs uppercase tracking-wide text-rms-mute">System default</div>
                <div className="text-sm">
                  {retention.global_default.days} days
                </div>
              </section>
            )}

            {/* Three separately-addressable held-class regions.
                Each is a structurally-independent <section> with distinct
                data-testid namespace `retention-region-{class_name}`. */}
            {retention.held_classes.map((row) => (
              <section
                key={row.class_name}
                className="border border-rms-line rounded-md p-4 bg-white"
                data-testid={`retention-region-${row.class_name}`}
                aria-label={CLASS_LABELS[row.class_name]}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-sm font-semibold" data-testid={`retention-region-heading-${row.class_name}`}>
                      {CLASS_LABELS[row.class_name]}
                    </h2>
                    <p className="text-xs text-rms-mute">{CLASS_HELP[row.class_name]}</p>
                  </div>
                  <RetentionPostureBadge posture={row.posture} />
                </div>
                <div className="text-sm">
                  {row.posture === 'unset' && (
                    <span className="text-amber-900" data-testid={`retention-days-unset-${row.class_name}`}>
                      no rule set
                    </span>
                  )}
                  {row.posture === 'inheriting' && (
                    <span data-testid={`retention-days-inheriting-${row.class_name}`}>
                      inherits system default \u2014 {row.days} days
                    </span>
                  )}
                  {row.posture === 'explicit' && (
                    <span data-testid={`retention-days-explicit-${row.class_name}`}>
                      {row.days} days (class-specific window)
                    </span>
                  )}
                </div>
              </section>
            ))}

            {/* Holdings summary rows — §4.3 Holdings. Read-only at B-5a. */}
            <section className="border border-rms-line rounded-md p-4 bg-white" data-testid="compliance-retention-holdings">
              <h2 className="text-sm font-semibold mb-2">Holdings</h2>
              <ul className="space-y-1 text-sm">
                <li data-testid="retention-holdings-within-window">Within window</li>
                <li data-testid="retention-holdings-past-due">
                  Past due
                  <span
                    className="ml-2 text-xs text-rms-mute"
                    data-testid="retention-holdings-decide-placeholder"
                  >
                    (Record a decision \u2014 coming in rulebook writes)
                  </span>
                </li>
                <li data-testid="retention-holdings-delivered">
                  Delivered acquisitions \u2014 irreversibly transformed \u00b7 licensed \u00b7 receipts on file
                </li>
              </ul>
            </section>
          </>
        )}

        <p className="text-xs text-rms-mute" data-testid="compliance-retention-governed-rule-copy">
          {V2_1_RETENTION_GOVERNED_RULE_COPY}
        </p>
      </main>
    </div>
  );
}
