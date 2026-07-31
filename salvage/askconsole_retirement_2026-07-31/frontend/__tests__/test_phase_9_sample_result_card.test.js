import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SampleGroundingProvider, useSampleGrounding } from '../../pages/extraction/SampleGroundingContext';
import SampleResultCard from '../../pages/extraction/SampleResultCard';

// Test helper: seed the context with a completed sample without hitting the API.
function Seed({ sample }) {
  const ctx = useSampleGrounding();
  React.useEffect(() => {
    // Force context state directly for test.
  }, []);
  return null;
}

// Use a wrapper that lets us manually push state via the mocked provider.
function ProvidedResult({ result }) {
  const value = {
    sample: { sample_ref: 'sample-abc123', status: 'complete', sample_of: 'obj-x', gpu_budget_drawn_hours: 2.0, result },
    status: 'complete',
    error: null,
    runSample: async () => {},
  };
  // Emulate the provider by inlining the same context.
  const { SampleGroundingProvider: _P } = require('../../pages/extraction/SampleGroundingContext');
  // Fallback: render inside a real provider then manipulate via useEffect is fragile.
  // Simpler: mock the useSampleGrounding module-level export.
  return null;
}

// Mock the context module to inject state directly (React 18 friendly).
jest.mock('../../pages/extraction/SampleGroundingContext', () => {
  const actual = jest.requireActual('../../pages/extraction/SampleGroundingContext');
  let state = { sample: null, status: 'idle', error: null, runSample: async () => {} };
  return {
    ...actual,
    __setState: (s) => { state = { ...state, ...s }; },
    useSampleGrounding: () => state,
    SampleGroundingProvider: ({ children }) => children,
  };
});
const ctxMod = require('../../pages/extraction/SampleGroundingContext');

describe('Phase 9 · SampleResultCard', () => {
  test('renders volume found', () => {
    ctxMod.__setState({
      sample: { sample_ref: 'sample-a', status: 'complete', result: { volume_found_units: 4180, class_distribution: { recorded_statement: 0.62, established_fact: 0.21, opinion: 0.17 }, per_hour_cost_gpu_hours: 0.35 } },
      status: 'complete', error: null,
    });
    render(<SampleResultCard />);
    expect(screen.getByTestId('sample-result-volume')).toHaveTextContent('4180');
  });

  test('renders class distribution as percentages', () => {
    ctxMod.__setState({
      sample: { sample_ref: 'sample-a', status: 'complete', result: { volume_found_units: 4180, class_distribution: { recorded_statement: 0.62 }, per_hour_cost_gpu_hours: 0.35 } },
      status: 'complete', error: null,
    });
    render(<SampleResultCard />);
    expect(screen.getByTestId('sample-result-class-distribution')).toHaveTextContent('recorded_statement 62%');
  });

  test('renders per-hour cost', () => {
    ctxMod.__setState({
      sample: { sample_ref: 'sample-a', status: 'complete', result: { volume_found_units: 4180, class_distribution: {}, per_hour_cost_gpu_hours: 0.35 } },
      status: 'complete', error: null,
    });
    render(<SampleResultCard />);
    expect(screen.getByTestId('sample-result-per-hour-cost')).toHaveTextContent('0.35 GPU-hours');
  });
});
