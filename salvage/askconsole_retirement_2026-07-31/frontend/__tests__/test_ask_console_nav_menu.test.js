// Ask Console · console nav menu (discoverability aid · Tier-3 hygiene).
// Attests:
//   * UI Spec v1 §3.1 preserved — Ask Console remains `/` ingress, nav is
//     augmentation not re-architecture.
//   * Menu closed by default; toggles open on click; overlay + close-on-item.
//   * All 8 sibling routes exposed as hyperlinks with correct `to=` paths.
//   * Auth-gated entries stay visible when unauth'd (Owner explicit —
//     no role-based hiding · discoverability > per-role concealment).
//   * Class-honesty: NO Opportunity Brief content leaks to the menu —
//     hyperlink label only ("Opportunity Briefs") with no brief text /
//     scope chip / advisory marker / stale indicator on this surface.
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AskConsolePage from '../../pages/AskConsolePage';

// Mock apiClient so AskConsolePage doesn't try live fetches during render.
jest.mock('../../apiClient', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn(), defaults: { baseURL: '' } },
}));

function renderAsk() {
  return render(
    <MemoryRouter>
      <AskConsolePage />
    </MemoryRouter>,
  );
}

describe('Ask Console · ConsoleNavMenu discoverability aid', () => {
  test('toggle button renders in header on `/` landing', () => {
    renderAsk();
    expect(screen.getByTestId('console-nav-toggle')).toBeInTheDocument();
    // Menu closed by default (aria-expanded=false).
    expect(screen.getByTestId('console-nav-toggle')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    // Menu items NOT rendered until toggled.
    expect(screen.queryByTestId('console-nav-menu')).not.toBeInTheDocument();
  });

  test('clicking toggle opens menu with all sibling routes', () => {
    renderAsk();
    fireEvent.click(screen.getByTestId('console-nav-toggle'));
    expect(screen.getByTestId('console-nav-menu')).toBeInTheDocument();
    expect(screen.getByTestId('console-nav-toggle')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    // UI-1-A (2026-07-31) — nav retirements: /operator, /engineer/register
    // are salvaged; /use-data is the Canon §6.1 three-door landing.
    const expectedRoutes = [
      { testid: 'console-nav-link-use-data', href: '/use-data' },
      { testid: 'console-nav-link-master-admin', href: '/master-admin' },
      { testid: 'console-nav-link-compliance', href: '/compliance' },
      { testid: 'console-nav-link-extraction-console', href: '/extraction/console' },
      {
        testid: 'console-nav-link-extraction-registry-admin',
        href: '/extraction/registry-admin',
      },
      { testid: 'console-nav-link-opportunity-briefs', href: '/opportunity-briefs' },
      { testid: 'console-nav-link-auth-login', href: '/auth/login' },
    ];
    for (const { testid, href } of expectedRoutes) {
      const link = screen.getByTestId(testid);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', href);
    }
  });

  test('menu closes when a nav link is clicked', () => {
    renderAsk();
    fireEvent.click(screen.getByTestId('console-nav-toggle'));
    expect(screen.getByTestId('console-nav-menu')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('console-nav-link-opportunity-briefs'));
    // Link click closes the menu.
    expect(screen.queryByTestId('console-nav-menu')).not.toBeInTheDocument();
  });

  test('overlay click closes the menu', () => {
    renderAsk();
    fireEvent.click(screen.getByTestId('console-nav-toggle'));
    fireEvent.click(screen.getByTestId('console-nav-overlay'));
    expect(screen.queryByTestId('console-nav-menu')).not.toBeInTheDocument();
  });

  test('auth-gated entries stay visible when unauth\'d (Owner explicit)', () => {
    renderAsk();
    fireEvent.click(screen.getByTestId('console-nav-toggle'));
    // Auth-gated surfaces are present in the menu regardless of auth state.
    // The AuthProvider bounces clicks to /auth/login when unauth'd (existing
    // behavior); the menu itself does NOT hide entries per role.
    expect(screen.getByTestId('console-nav-link-use-data')).toBeInTheDocument();
    expect(screen.getByTestId('console-nav-link-master-admin')).toBeInTheDocument();
    expect(screen.getByTestId('console-nav-link-compliance')).toBeInTheDocument();
  });

  test('class-honesty · no Opportunity Brief CONTENT leaks to the nav menu', () => {
    renderAsk();
    fireEvent.click(screen.getByTestId('console-nav-toggle'));
    // Menu shows a hyperlink label "Opportunity Briefs" ONLY — no brief
    // text, no scope chip, no advisory marker, no stale indicator on this
    // surface. OB content only renders inside `/opportunity-briefs` per
    // OB-R3 render-path advisory-marker discipline.
    const menu = screen.getByTestId('console-nav-menu');
    // No brief-render-only testids present on the Ask Console surface.
    expect(menu.querySelector('[data-testid^="opportunity-brief-card-"]')).toBeNull();
    expect(menu.querySelector('[data-testid="opportunity-brief-text"]')).toBeNull();
    expect(menu.querySelector('[data-testid="opportunity-brief-advisory-marker"]')).toBeNull();
    expect(
      menu.querySelector('[data-testid="opportunity-brief-stale-indicator"]'),
    ).toBeNull();
    expect(
      menu.querySelector('[data-testid^="opportunity-brief-scope-chip-"]'),
    ).toBeNull();
    // The nav link is just a hyperlink.
    const link = screen.getByTestId('console-nav-link-opportunity-briefs');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/opportunity-briefs');
  });
});
