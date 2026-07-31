// UI Spec v2.1 §3.3 line 50 binding copy verbatim (Owner P9-E6 α, 2026-07-08):
//   "Grounded by sample {sample_ref}"
//   "No sample run — estimates only."   (em-dash "—" preserved verbatim)
import React from 'react';
import { useSampleGrounding } from './SampleGroundingContext';

export const NO_SAMPLE_VERBATIM = 'No sample run — estimates only.';
export const GROUNDED_TEMPLATE = (sampleRef) => `Grounded by sample ${sampleRef}`;

export default function CommitReviewGroundingMarker() {
  const { sample, status } = useSampleGrounding();
  const grounded = status === 'complete' && sample?.sample_ref;
  const text = grounded ? GROUNDED_TEMPLATE(sample.sample_ref) : NO_SAMPLE_VERBATIM;
  return (
    <div data-testid="commit-review-grounding-marker" className="text-sm text-slate-700">
      {text}
    </div>
  );
}
