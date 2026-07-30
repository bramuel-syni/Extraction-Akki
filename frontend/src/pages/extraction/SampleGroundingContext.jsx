// Phase 9 Sub-stage 9.3 — shared context for sample-flow surfaces.
// Amortisation base (Amendment I §1.3): 3 sample surfaces
// (WizardSampleAction + SampleResultCard + CommitReviewGroundingMarker)
// share this context → amortised rate applied per §3.2.
import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || '';
const SampleGroundingContext = createContext(null);

export function SampleGroundingProvider({ token, objectiveRef, children }) {
  const [sample, setSample] = useState(null); // { sample_ref, status, result, sample_of, gpu_budget_drawn_hours }
  const [status, setStatus] = useState('idle'); // idle | pending | complete | failed
  const [error, setError] = useState(null);

  const runSample = useCallback(async (sampleBoundHours) => {
    setStatus('pending');
    setError(null);
    try {
      const res = await axios.post(
        `${API}/api/extraction/sample/run`,
        { objective_ref: objectiveRef, sample_bound_hours: sampleBoundHours, idempotency_key: `ui-${Date.now()}` },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSample(res.data);
      setStatus(res.data?.status === 'complete' ? 'complete' : 'pending');
    } catch (e) {
      setStatus('failed');
      setError(e?.response?.data?.detail || String(e));
    }
  }, [objectiveRef, token]);

  const value = { sample, status, error, runSample };
  return <SampleGroundingContext.Provider value={value}>{children}</SampleGroundingContext.Provider>;
}

export function useSampleGrounding() {
  const ctx = useContext(SampleGroundingContext);
  if (!ctx) throw new Error('useSampleGrounding must be inside SampleGroundingProvider');
  return ctx;
}
