import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import QualityObservationInline from '../../pages/extraction/QualityObservationInline';

describe('Phase 9 · QualityObservationInline (UI Spec §3.6)', () => {
  test('renders mining-stage visible inside running status', () => {
    render(<QualityObservationInline objectiveRef="obj-quality" />);
    expect(screen.getByTestId('quality-observation-inline')).toBeInTheDocument();
    expect(screen.getByTestId('quality-observation-header')).toHaveTextContent('obj-quality');
  });

  test('yield and class distribution slots are rendered before first result', () => {
    render(<QualityObservationInline objectiveRef="obj-x" />);
    expect(screen.getByTestId('quality-observation-yield')).toBeInTheDocument();
    expect(screen.getByTestId('quality-observation-class-distribution')).toBeInTheDocument();
  });
});
