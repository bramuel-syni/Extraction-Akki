/* UI-1-D · Prove · Canon §9 · 3 visually-distinct response shapes.
 *
 * (1) ANSWERED — class-with-claim + walk link.
 * (2) NOT_EXTRACTED_YET — refusal styling · OFFERS TO QUEUE.
 * (3) EVIDENCE_CANNOT_SUPPORT_IT — same refusal styling · NO queue offer.
 * (4) SOMETHING_BROKE — own channel/colour/layout · NEVER shares refusal
 *      components. DB-2 BINDING: a companion-channel failure MUST NOT
 *      convert a refusal into a fault render.
 *
 * DB-1 BINDING: the specific wire reason renders verbatim in the
 * honesty strip. Refusal renders WITHOUT its supporting detail if the
 * detail cannot be retrieved — but never as a fault.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../apiClient';
import { AkkiShell } from '../../design/AkkiShell';
import { AKKI_V4_PALETTE, AKKI_V4_TYPOGRAPHY } from '../../design/akkiv4_design_system';


// ------------------ SHAPE 1 · ANSWERED ---------------------------------------


function AnswerCard({ envelope, origin, variant }) {
  const suffix = variant === 'sample' ? '-sample' : '';
  return (
    <article
      data-testid={`prove-shape-answered${suffix}`}
      data-shape="answered"
      data-variant={variant || 'live'}
      style={{
        padding: '18px 20px', marginTop: '18px',
        background: AKKI_V4_PALETTE.bone,
        border: `2px solid ${AKKI_V4_PALETTE.sage}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: AKKI_V4_PALETTE.sage, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        Answer · class {envelope.defensibility_class}
      </div>
      <h3 data-testid={`prove-answer-claim${suffix}`} style={{
        margin: '0 0 12px 0',
        fontFamily: AKKI_V4_TYPOGRAPHY.display, fontSize: '1.2rem',
        color: AKKI_V4_PALETTE.ink,
      }}>
        {envelope.claim}
      </h3>
      {envelope.is_sample && (
        <div
          data-testid={`prove-answer-sample-banner${suffix}`}
          data-sample-badge="true"
          style={{
            display: 'inline-block', padding: '3px 10px', marginBottom: '10px',
            background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          SAMPLE ANSWER
        </div>
      )}
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <Link
          to={{ pathname: `/prove/trace/${envelope.trace_id}` }}
          state={{ from: origin.pathname, scrollY: origin.scrollY, from_search: origin.search }}
          data-testid={`prove-walk-a-proof-link${suffix}`}
          style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.85rem' }}
        >
          Walk this proof · claim → reasoning → raw facts →
        </Link>
      </div>
    </article>
  );
}


// ------------------ SHAPE 2 · NOT_EXTRACTED_YET ------------------------------


function NotExtractedYetCard({ envelope, onQueue, origin, variant }) {
  const suffix = variant === 'sample' ? '-sample' : '';
  return (
    <article
      data-testid={`prove-shape-not-extracted-yet${suffix}`}
      data-shape="not_extracted_yet"
      data-variant={variant || 'live'}
      style={{
        padding: '18px 20px', marginTop: '18px',
        background: AKKI_V4_PALETTE.mist,
        border: `2px solid ${AKKI_V4_PALETTE.amber}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        Not extracted yet · refusal
      </div>
      {envelope.is_sample && (
        <div
          data-testid={`prove-not-extracted-sample-banner${suffix}`}
          data-sample-badge="true"
          style={{
            display: 'inline-block', padding: '2px 8px', marginBottom: '8px',
            background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          SAMPLE REFUSAL
        </div>
      )}
      <p data-testid={`prove-not-extracted-honesty-strip${suffix}`} style={{
        margin: '0 0 12px 0', color: AKKI_V4_PALETTE.ink, fontSize: '0.95rem',
      }}>
        {envelope.wire_reason_verbatim}
      </p>
      {envelope.estimated_effort_plain && (
        <p data-testid={`prove-not-extracted-estimated-effort${suffix}`} style={{
          margin: '0 0 12px 0', color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem', fontStyle: 'italic',
        }}>
          Estimated effort · {envelope.estimated_effort_plain}
        </p>
      )}
      <button
        type="button"
        data-testid={`prove-queue-this-gap-btn${suffix}`}
        onClick={() => onQueue(envelope.gap_id)}
        style={{
          padding: '6px 14px', background: AKKI_V4_PALETTE.navy,
          color: AKKI_V4_PALETTE.cream, border: 'none',
          fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.72rem',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          cursor: 'pointer',
        }}
      >
        Queue this gap
      </button>
      <Link
        to={{ pathname: `/prove/trace/${envelope.trace_id}` }}
        state={{ from: origin.pathname, scrollY: origin.scrollY }}
        data-testid={`prove-walk-refusal-link-not-extracted${suffix}`}
        style={{ marginLeft: '12px', color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.82rem' }}
      >
        Walk this refusal →
      </Link>
    </article>
  );
}


// ------------------ SHAPE 3 · EVIDENCE_CANNOT_SUPPORT_IT ---------------------


function EvidenceCannotSupportCard({ envelope, origin, variant }) {
  const suffix = variant === 'sample' ? '-sample' : '';
  return (
    <article
      data-testid={`prove-shape-evidence-cannot-support${suffix}`}
      data-shape="evidence_cannot_support_it"
      data-variant={variant || 'live'}
      style={{
        padding: '18px 20px', marginTop: '18px',
        background: AKKI_V4_PALETTE.mist,
        border: `2px solid ${AKKI_V4_PALETTE.amber}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        Evidence cannot support it · refusal · {envelope.reason_code}
      </div>
      {envelope.is_sample && (
        <div
          data-testid={`prove-evidence-cannot-support-sample-banner${suffix}`}
          data-sample-badge="true"
          style={{
            display: 'inline-block', padding: '2px 8px', marginBottom: '8px',
            background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          SAMPLE REFUSAL
        </div>
      )}
      <p data-testid={`prove-evidence-cannot-support-honesty-strip${suffix}`} style={{
        margin: '0 0 12px 0', color: AKKI_V4_PALETTE.ink, fontSize: '0.95rem',
      }}>
        {envelope.wire_reason_verbatim}
      </p>
      {envelope.what_would_raise_it_plain && (
        <p data-testid={`prove-what-would-raise-it${suffix}`} style={{
          margin: '0 0 12px 0', color: AKKI_V4_PALETTE.sage, fontSize: '0.85rem', fontStyle: 'italic',
        }}>
          What would raise it · {envelope.what_would_raise_it_plain}
        </p>
      )}
      {/* NO queue offer here — Canon §9 · never render a queue we cannot stand behind. */}
      <Link
        to={{ pathname: `/prove/trace/${envelope.trace_id}` }}
        state={{ from: origin.pathname, scrollY: origin.scrollY }}
        data-testid={`prove-walk-refusal-link-evidence${suffix}`}
        style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'none', fontSize: '0.82rem' }}
      >
        Walk this refusal →
      </Link>
    </article>
  );
}


// ------------------ SHAPE 4 · SOMETHING_BROKE (fault channel) ----------------


function SomethingBrokeCard({ envelope, variant }) {
  const suffix = variant === 'sample' ? '-sample' : '';
  // OWN channel · colour · layout. NEVER shares refusal components.
  return (
    <article
      data-testid={`prove-shape-something-broke${suffix}`}
      data-shape="something_broke"
      data-variant={variant || 'live'}
      style={{
        padding: '18px 20px', marginTop: '18px',
        background: AKKI_V4_PALETTE.navy,
        color: AKKI_V4_PALETTE.cream,
        borderRadius: '2px',  // distinct visual from refusal cards (sharp corners)
        // Diagonal notch as fault marker — distinct from the refusal border.
        borderLeft: `6px solid ${AKKI_V4_PALETTE.oxblood}`,
      }}
    >
      <div style={{
        fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
        color: AKKI_V4_PALETTE.cream, textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '8px',
      }}>
        Something broke · fault channel · {envelope.fault_channel_ref}
      </div>
      {envelope.is_sample && (
        <div
          data-testid={`prove-something-broke-sample-banner${suffix}`}
          data-sample-badge="true"
          style={{
            display: 'inline-block', padding: '2px 8px', marginBottom: '8px',
            background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink,
            fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.62rem',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          SAMPLE FAULT
        </div>
      )}
      <p data-testid={`prove-fault-plain-reason${suffix}`} style={{
        margin: 0, color: AKKI_V4_PALETTE.cream, fontSize: '0.95rem',
      }}>
        {envelope.fault_reason_plain}
      </p>
      <div style={{ marginTop: '8px', fontSize: '0.75rem', color: AKKI_V4_PALETTE.mist, fontStyle: 'italic' }}>
        (This is a fault, not a refusal. It is never assigned a refusal reason. DB-2 binding: a
        companion-channel failure never converts a refusal into this shape.)
      </div>
    </article>
  );
}


// ------------------ MAIN PROVE PAGE ------------------------------------------


export default function ProvePage() {
  const [question, setQuestion] = useState('');
  const [envelope, setEnvelope] = useState(null);
  const [busy, setBusy] = useState(false);
  const [samples, setSamples] = useState([]);
  const [samplesLoading, setSamplesLoading] = useState(true);
  const [samplesError, setSamplesError] = useState(null);
  const [askError, setAskError] = useState(null);
  const [origin] = useState({
    pathname: '/prove',
    scrollY: 0,
    search: '',
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch the 4 seeded shape samples on mount so the shape grammar is
  // VISIBLE by default (Owner UI-1-D re-verification 2026-08-02 · the
  // viewable-build standing requires that the seeded shapes render
  // without the user composing a query).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await api.proveSamples();
      if (cancelled) return;
      setSamplesLoading(false);
      if (r.status === 200) {
        setSamples(Array.isArray(r.body?.samples) ? r.body.samples : []);
        setSamplesError(null);
      } else {
        setSamples([]);
        // Honest error render — never silent.
        setSamplesError({
          status: r.status,
          reason: (r.body && r.body.reason) || 'samples_unavailable',
          detail: (r.body && r.body.detail) ||
            'The Prove sample shape reference could not be loaded.',
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const ask = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    setAskError(null);
    origin.scrollY = window.scrollY;
    origin.search = location.search;
    const r = await api.proveAsk(question);
    setBusy(false);
    if (r.status === 200) {
      setEnvelope(r.body);
    } else {
      // Owner UI-1-D re-verification 2026-08-02 · silent-swallow bug fix:
      // when the submission returns non-200, render an HONEST error state.
      setEnvelope(null);
      setAskError({
        status: r.status,
        reason: (r.body && r.body.reason) || 'ask_failed',
        detail: (r.body && r.body.detail) ||
          'The question could not be submitted. Sign in again or retry.',
      });
    }
  };

  const queueGap = async (gapId) => {
    if (!gapId) return;
    const r = await api.registryQueueGap(gapId);
    if (r.status === 200 && envelope) {
      setEnvelope({
        ...envelope,
        queue_confirmation_route: r.body.route,
        queued_at_iso: 'just now',
      });
    }
  };

  const renderShapeCard = (env, key, variant) => {
    if (!env || !env.shape) return null;
    if (env.shape === 'answered')  return <AnswerCard key={key} envelope={env} origin={origin} variant={variant} />;
    if (env.shape === 'not_extracted_yet') return <NotExtractedYetCard key={key} envelope={env} onQueue={queueGap} origin={origin} variant={variant} />;
    if (env.shape === 'evidence_cannot_support_it') return <EvidenceCannotSupportCard key={key} envelope={env} origin={origin} variant={variant} />;
    if (env.shape === 'something_broke') return <SomethingBrokeCard key={key} envelope={env} variant={variant} />;
    return null;
  };

  return (
    <AkkiShell
      title="Prove"
      subtitle="Canon §9 · answering with evidence · honest when it cannot"
    >
      <div data-testid="prove-page" data-canon-ref="Canon §9">
        <p style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage, marginBottom: '14px' }}>
          Ask any question. Three shapes are possible: an answer with a walkable proof, a refusal
          (with or without a queue offer), or a fault. The three never share components.
        </p>
        <form onSubmit={ask} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            data-testid="prove-question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your question in plain language…"
            style={{
              flex: 1, minWidth: '260px', padding: '8px 12px',
              border: `1px solid ${AKKI_V4_PALETTE.mist}`, fontSize: '0.95rem',
            }}
          />
          <button
            type="submit"
            data-testid="prove-ask-btn"
            disabled={busy || !question.trim()}
            style={{
              padding: '8px 16px', background: AKKI_V4_PALETTE.navy,
              color: AKKI_V4_PALETTE.cream, border: 'none',
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.75rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              cursor: busy || !question.trim() ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'thinking…' : 'Ask'}
          </button>
        </form>

        {/* -------- LIVE OUTCOME (post-submit) -------------------------- */}
        {askError && (
          <div
            data-testid="prove-ask-error-panel"
            data-status={String(askError.status)}
            style={{
              padding: '14px 18px', marginTop: '10px', marginBottom: '18px',
              background: AKKI_V4_PALETTE.bone,
              borderLeft: `4px solid ${AKKI_V4_PALETTE.amber}`,
            }}
          >
            <div style={{
              fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
              color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
              letterSpacing: '0.06em', marginBottom: '4px',
            }}>
              Question could not be submitted · {askError.reason}
            </div>
            <p style={{ margin: 0, color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>
              {askError.detail}
            </p>
          </div>
        )}
        {envelope && renderShapeCard(envelope, 'live-outcome', 'live')}
        {envelope && envelope.queue_confirmation_route && (
          <div
            data-testid="prove-queue-confirmation"
            style={{ marginTop: '14px', padding: '10px 14px', background: AKKI_V4_PALETTE.sage, color: AKKI_V4_PALETTE.ink, fontSize: '0.85rem' }}
          >
            Queued.{' '}
            <Link
              to={envelope.queue_confirmation_route}
              data-testid="prove-queue-open-session-link"
              style={{ color: AKKI_V4_PALETTE.navy, textDecoration: 'underline' }}
            >
              Open the Use Data session that will do the work →
            </Link>
          </div>
        )}

        {/* -------- SHAPE GRAMMAR REFERENCE (default render · always) --- */}
        <section
          data-testid="prove-sample-shape-reference"
          style={{
            marginTop: '32px', paddingTop: '18px',
            borderTop: `1px solid ${AKKI_V4_PALETTE.mist}`,
          }}
        >
          <h2 style={{
            margin: '0 0 6px 0',
            fontFamily: AKKI_V4_TYPOGRAPHY.display, fontSize: '1.05rem',
            color: AKKI_V4_PALETTE.ink,
          }}>
            Sample shape reference
          </h2>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '0.82rem', color: AKKI_V4_PALETTE.sage, fontStyle: 'italic',
          }}>
            The four response shapes that Prove can render — each one from a seeded
            fixture. Every card below carries a SAMPLE badge. Click{' '}
            <em>Walk this proof</em> or <em>Walk this refusal</em> on any card to
            descend into claim → reasoning → raw facts, then close to return here.
          </p>
          {samplesLoading && (
            <div data-testid="prove-samples-loading" style={{ fontSize: '0.85rem', color: AKKI_V4_PALETTE.sage }}>
              Loading sample shapes…
            </div>
          )}
          {samplesError && !samplesLoading && (
            <div
              data-testid="prove-samples-error-panel"
              data-status={String(samplesError.status)}
              style={{
                padding: '14px 18px',
                background: AKKI_V4_PALETTE.bone,
                borderLeft: `4px solid ${AKKI_V4_PALETTE.amber}`,
              }}
            >
              <div style={{
                fontFamily: AKKI_V4_TYPOGRAPHY.labels, fontSize: '0.68rem',
                color: AKKI_V4_PALETTE.amber, textTransform: 'uppercase',
                letterSpacing: '0.06em', marginBottom: '4px',
              }}>
                Shape reference unavailable · {samplesError.reason}
              </div>
              <p style={{ margin: 0, color: AKKI_V4_PALETTE.ink, fontSize: '0.9rem' }}>
                {samplesError.detail}
              </p>
            </div>
          )}
          {!samplesLoading && !samplesError && samples.length === 0 && (
            <div data-testid="prove-samples-empty" style={{ fontSize: '0.9rem', color: AKKI_V4_PALETTE.ink }}>
              No sample shapes are seeded on this instance.
            </div>
          )}
          {!samplesLoading && samples.map((s) => (
            <div key={s.shape} data-testid={`prove-sample-card-${s.shape}`}>
              <div style={{
                marginTop: '18px', marginBottom: '2px',
                fontSize: '0.72rem', letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: AKKI_V4_PALETTE.navy,
                fontFamily: AKKI_V4_TYPOGRAPHY.labels,
              }}>
                Shape · {s.shape} · asked verbatim: “{s.asked}”
              </div>
              {renderShapeCard(s, `sample-${s.shape}`, 'sample')}
            </div>
          ))}
        </section>
      </div>
    </AkkiShell>
  );
}
