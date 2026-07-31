// UI Spec v2.2 §3.7 — Opportunity Brief render card.
// OB-R3 Seam-1 α: advisory marker mandatory-visible (write-time attached
// by services/opportunity_briefs/advisory_marker.py; read from sidecar).
// OB-R6: scope chip renders one of {slice, combined, estate}.
// OB-R5: stale indicator renders when brief.stale === true.
// OB-R4: Shape-as-objective button pre-fills wizard reach only.
//
// Fixture-census demo permitted per AS-U2 (marked as illustration).
import React from 'react';

const SCOPE_LABELS = {
  slice: 'Slice',
  combined: 'Combined',
  estate: 'Estate',
};

export default function OpportunityBriefCard({ brief, onShapeAsObjective }) {
  const scopeLabel = SCOPE_LABELS[brief.scope] || brief.scope;
  const marker = brief._advisory_marker;
  const isStale = brief.stale === true;

  return (
    <div
      data-testid={`opportunity-brief-card-${brief.brief_id}`}
      className="rounded border border-slate-300 bg-white p-4 space-y-2"
    >
      <div className="flex items-center gap-2">
        <span
          data-testid={`opportunity-brief-scope-chip-${brief.scope}`}
          className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
        >
          {scopeLabel}
        </span>
        {isStale && (
          <span
            data-testid="opportunity-brief-stale-indicator"
            className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
          >
            Stale
          </span>
        )}
      </div>
      <p
        data-testid="opportunity-brief-text"
        className="text-sm text-slate-800"
      >
        {brief.brief_text}
      </p>
      {brief.contributing_slices && brief.contributing_slices.length > 0 && (
        <div
          data-testid="opportunity-brief-contributing-slices"
          className="text-xs text-slate-500"
        >
          Slices: {brief.contributing_slices.join(', ')}
        </div>
      )}
      <div
        data-testid="opportunity-brief-advisory-marker"
        className="text-xs italic text-slate-500"
      >
        {marker}
      </div>
      <button
        data-testid="opportunity-brief-shape-as-objective-button"
        type="button"
        onClick={() => onShapeAsObjective && onShapeAsObjective(brief)}
        className="rounded border border-slate-400 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
      >
        Shape as objective
      </button>
    </div>
  );
}
