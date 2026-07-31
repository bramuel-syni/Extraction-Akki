import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SampleGroundingProvider } from '../../pages/extraction/SampleGroundingContext';
import WizardSampleAction from '../../pages/extraction/WizardSampleAction';

function wrap(children) {
  return (
    <SampleGroundingProvider token="test-token" objectiveRef="obj-x">
      {children}
    </SampleGroundingProvider>
  );
}

describe('Phase 9 · WizardSampleAction', () => {
  test('button hidden when reach not drafted', () => {
    render(wrap(<WizardSampleAction reachDrafted={false} />));
    expect(screen.queryByTestId('wizard-sample-action-button')).not.toBeInTheDocument();
  });

  test('button visible when reach drafted', () => {
    render(wrap(<WizardSampleAction reachDrafted={true} />));
    expect(screen.getByTestId('wizard-sample-action-button')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-sample-action-button')).toHaveTextContent('Run a sample');
  });

  test('button carries data-testid at exact stable name', () => {
    render(wrap(<WizardSampleAction reachDrafted={true} />));
    expect(screen.getByTestId('wizard-sample-action-button')).toBeInTheDocument();
  });

  test('button not disabled when status is idle', () => {
    render(wrap(<WizardSampleAction reachDrafted={true} />));
    expect(screen.getByTestId('wizard-sample-action-button')).not.toBeDisabled();
  });
});
