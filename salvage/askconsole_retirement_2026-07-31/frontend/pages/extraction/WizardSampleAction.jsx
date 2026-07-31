// UI Spec v2.1 §3.2 line 44 verbatim: "Run a sample — available once reach is drafted."
// Reach-draft-gated (button hidden until reach is drafted).
import React from 'react';
import { useSampleGrounding } from './SampleGroundingContext';

export default function WizardSampleAction({ reachDrafted, sampleBoundHours = 2.0 }) {
  const { runSample, status } = useSampleGrounding();
  if (!reachDrafted) return null;
  const disabled = status === 'pending';
  return (
    <button
      type="button"
      data-testid="wizard-sample-action-button"
      disabled={disabled}
      onClick={() => runSample(sampleBoundHours)}
      className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50"
    >
      {status === 'pending' ? 'Running sample …' : 'Run a sample'}
    </button>
  );
}
