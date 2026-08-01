/* Owner P0 fix (2026-08-02) — "can't sign up" bug.
 *
 * Root cause: UI-1-A retirement rebuilt the root as the six-tile shell
 * but dropped the login/register entry points. Fresh visitors had zero
 * path to self-signup.
 *
 * This gate asserts the auth strip on the Canon OS root shell:
 *   - Anonymous visitor sees BOTH Sign in and Create account links.
 *   - The Create account link points to /auth/register (P0 reachability).
 *   - The Sign in link points to /auth/login.
 *   - Signed-in visitor sees email + Canon-safe role label + Sign out.
 *   - Canon-safe role label: `ask_console_user` renders as "Viewer" (never
 *     the raw role literal). Retired-vocab gate must not trip.
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CanonOSShellPage from '../../pages/CanonOSShellPage';
import { AuthProvider } from '../../hooks/useAuth';

// Mock apiClient so we can control token presence + /api/auth/me response.
jest.mock('../../apiClient', () => {
  return {
    __esModule: true,
    tokenStore: {
      getAccessToken: jest.fn(),
      getRefreshToken: jest.fn(),
      setTokens: jest.fn(),
      clear: jest.fn(),
    },
    formatApiErrorDetail: (d) => (typeof d === 'string' ? d : JSON.stringify(d)),
    default: {
      authMe: jest.fn(),
      authRefresh: jest.fn(),
    },
  };
});

// Bring the mocked module into scope.
const apiMock = require('../../apiClient');

function renderShell() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <CanonOSShellPage />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Canon OS root · P0 auth-strip reachability gate', () => {
  beforeEach(() => {
    apiMock.tokenStore.getAccessToken.mockReset();
    apiMock.tokenStore.getRefreshToken.mockReset();
    apiMock.default.authMe.mockReset();
  });

  // ANON path — the exact Owner-reported scenario.
  describe('anonymous visitor (P0 · "can\'t sign up" scenario)', () => {
    beforeEach(() => {
      // No token present → checkSession() shortcircuits to setIdentity(false).
      apiMock.tokenStore.getAccessToken.mockReturnValue(null);
      apiMock.tokenStore.getRefreshToken.mockReturnValue(null);
    });

    test('renders a Create account link with href="/auth/register" (P0 fix)', async () => {
      renderShell();
      const link = await screen.findByTestId('canon-os-auth-signup-link');
      expect(link).toHaveAttribute('href', '/auth/register');
      expect(link).toHaveTextContent(/Create account/i);
    });

    test('renders a Sign in link with href="/auth/login"', async () => {
      renderShell();
      const link = await screen.findByTestId('canon-os-auth-signin-link');
      expect(link).toHaveAttribute('href', '/auth/login');
      expect(link).toHaveTextContent(/Sign in/i);
    });

    test('auth strip is in "anon" state (no signed-in email rendered)', async () => {
      renderShell();
      await screen.findByTestId('canon-os-auth-signup-link');
      const strip = screen.getByTestId('canon-os-auth-strip');
      expect(strip.getAttribute('data-testid-state')).toBe('anon');
      expect(screen.queryByTestId('canon-os-auth-signed-in-email')).toBeNull();
      expect(screen.queryByTestId('canon-os-auth-signout-button')).toBeNull();
    });

    test('does NOT reintroduce retired vocabulary in the auth strip', async () => {
      renderShell();
      const strip = await screen.findByTestId('canon-os-auth-strip');
      const text = (strip.textContent || '').toLowerCase();
      ['ask console', 'rms intelligence', 'ambitions', 'approval queue', 'extract', 'my objectives'].forEach((t) => {
        expect(text.includes(t)).toBe(false);
      });
    });
  });

  // SIGNED-IN path — verifies role display uses Canon-safe label.
  describe('signed-in visitor (fresh self-signup · ask_console_user)', () => {
    beforeEach(() => {
      apiMock.tokenStore.getAccessToken.mockReturnValue('fake-access-token');
      apiMock.tokenStore.getRefreshToken.mockReturnValue('fake-refresh-token');
      apiMock.default.authMe.mockResolvedValue({
        status: 200,
        body: {
          user_id: 'test-uid-1',
          email: 'new.viewer@example.com',
          roles: ['ask_console_user'],
          key_grants: [],
        },
      });
    });

    test('renders email + Canon-safe role label "Viewer" + Sign out button', async () => {
      renderShell();
      const email = await screen.findByTestId('canon-os-auth-signed-in-email');
      expect(email).toHaveTextContent('new.viewer@example.com');
      const strip = screen.getByTestId('canon-os-auth-strip');
      expect(strip.getAttribute('data-testid-state')).toBe('signed-in');
      // Canon-safe role label for `ask_console_user` — must be "Viewer",
      // NEVER the raw role literal "ask_console_user".
      const roleEl = screen.getByTestId('canon-os-auth-signed-in-role');
      expect(roleEl).toHaveTextContent(/^Viewer$/);
      expect(roleEl.textContent).not.toMatch(/ask_console_user/);
      expect(screen.getByTestId('canon-os-auth-signout-button')).toBeInTheDocument();
    });

    test('signed-in strip does NOT render sign-in / sign-up links', async () => {
      renderShell();
      await screen.findByTestId('canon-os-auth-signed-in-email');
      expect(screen.queryByTestId('canon-os-auth-signin-link')).toBeNull();
      expect(screen.queryByTestId('canon-os-auth-signup-link')).toBeNull();
    });
  });

  // ROLE DISPLAY MAP — verifies the Canon-safe label mapping for every role.
  describe('role display mapping (Canon-safe plain labels)', () => {
    const cases = [
      { roles: ['master_admin', 'admin', 'operator'], expected: 'Master admin' },
      { roles: ['admin'], expected: 'Admin' },
      { roles: ['dpo', 'operator'], expected: 'DPO' },
      { roles: ['operator'], expected: 'Operator' },
      { roles: ['engineer'], expected: 'Engineer' },
      { roles: ['buyer'], expected: 'Buyer' },
      { roles: ['ask_console_user'], expected: 'Viewer' },
    ];
    test.each(cases)('roles=%o → displays as $expected', async ({ roles, expected }) => {
      apiMock.tokenStore.getAccessToken.mockReturnValue('fake-access-token');
      apiMock.tokenStore.getRefreshToken.mockReturnValue('fake-refresh-token');
      apiMock.default.authMe.mockResolvedValue({
        status: 200,
        body: { user_id: 'x', email: 'x@x', roles, key_grants: [] },
      });
      renderShell();
      const roleEl = await screen.findByTestId('canon-os-auth-signed-in-role');
      expect(roleEl).toHaveTextContent(new RegExp(`^${expected}$`));
    });
  });
});
