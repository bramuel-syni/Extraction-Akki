// UI Spec v2.1 §3.6: mining-stage visibility inside running status; per-objective
// yield and class distribution as extraction proceeds.
import React from 'react';

export default function QualityObservationInline({ objectiveRef }) {
  return (
    <div data-testid="quality-observation-inline" className="rounded border border-slate-200 p-3 text-sm">
      <div data-testid="quality-observation-header">Mining status · {objectiveRef}</div>
      <div data-testid="quality-observation-yield">Yield so far: 0 units (waiting on first result)</div>
      <div data-testid="quality-observation-class-distribution">
        Class distribution: not yet observed
      </div>
    </div>
  );
}
