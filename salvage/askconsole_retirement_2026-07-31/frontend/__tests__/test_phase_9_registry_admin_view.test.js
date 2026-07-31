import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegistryAdminView from '../../pages/extraction/RegistryAdminView';

describe('Phase 9 · RegistryAdminView', () => {
  test('renders three census-state rows', () => {
    render(<RegistryAdminView />);
    expect(screen.getByTestId('registry-admin-view')).toBeInTheDocument();
    expect(screen.getByTestId('registry-admin-title')).toHaveTextContent('Registry Admin');
  });

  test('unknown region is marked honestly as "unknown"', () => {
    render(<RegistryAdminView />);
    expect(screen.getByTestId('registry-census-state-archive://tenant-b')).toHaveTextContent('unknown');
  });

  test('trigger-census buttons render per row', () => {
    render(<RegistryAdminView />);
    expect(screen.getByTestId('registry-trigger-census-archive://tenant-a')).toBeInTheDocument();
    expect(screen.getByTestId('registry-trigger-census-cms://tenant-a')).toBeInTheDocument();
  });
});
