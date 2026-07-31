// UI Spec v2.1 §3.1 verbatim: "Running normally. One item needs you."
// Home — land. Attention cards surface here; SM-E-triggered thresholds render.
import React, { useEffect, useState } from 'react';
import { SampleGroundingProvider } from './SampleGroundingContext';
import WizardSampleAction from './WizardSampleAction';
import SampleResultCard from './SampleResultCard';
import CommitReviewGroundingMarker from './CommitReviewGroundingMarker';
import QualityObservationInline from './QualityObservationInline';

export default function ExtractionConsoleHomePage() {
  const [token, setToken] = useState(null);
  const [objectiveRef, setObjectiveRef] = useState('demo-objective');
  useEffect(() => {
    setToken(localStorage.getItem('rms_access_token') || '');
  }, []);
  return (
    <SampleGroundingProvider token={token} objectiveRef={objectiveRef}>
      <div data-testid="extraction-console-home" className="mx-auto max-w-4xl space-y-6 p-6">
        <h1 className="text-2xl font-semibold" data-testid="extraction-console-home-title">Extraction Console</h1>
        <div data-testid="running-status-line" className="text-sm text-slate-600">
          Running normally. One item needs you.
        </div>
        <input
          data-testid="extraction-console-objective-input"
          type="text"
          className="rounded border border-slate-300 px-3 py-1 text-sm"
          value={objectiveRef}
          onChange={(e) => setObjectiveRef(e.target.value)}
        />
        <WizardSampleAction reachDrafted={true} sampleBoundHours={2.0} />
        <SampleResultCard />
        <CommitReviewGroundingMarker />
        <QualityObservationInline objectiveRef={objectiveRef} />
      </div>
    </SampleGroundingProvider>
  );
}
