// UI Spec v2.1 §3.4 line 57 verbatim: "Renders in the same feasibility position:
// volume found, class distribution observed, per-hour cost observed."
import React from 'react';
import { useSampleGrounding } from './SampleGroundingContext';

export default function SampleResultCard() {
  const { sample, status, error } = useSampleGrounding();
  if (status === 'idle') return null;
  if (status === 'pending') return <div data-testid="sample-result-card-pending">Sample running …</div>;
  if (status === 'failed') return (
    <div data-testid="sample-result-card-failed" className="text-red-700">
      {error || 'Sample failed.'}
    </div>
  );
  if (!sample?.result) return null;
  const { volume_found_units, class_distribution, per_hour_cost_gpu_hours } = sample.result;
  return (
    <div data-testid="sample-result-card" className="rounded-md border border-slate-300 p-4">
      <div data-testid="sample-result-volume">Volume found: {volume_found_units} units</div>
      <div data-testid="sample-result-class-distribution">
        Class distribution: {Object.entries(class_distribution).map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`).join(' · ')}
      </div>
      <div data-testid="sample-result-per-hour-cost">Per-hour cost: {per_hour_cost_gpu_hours} GPU-hours</div>
    </div>
  );
}
