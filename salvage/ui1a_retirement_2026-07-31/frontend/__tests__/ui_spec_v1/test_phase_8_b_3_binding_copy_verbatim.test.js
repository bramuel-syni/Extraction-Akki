/**
 * Phase 8 Stage B-3 Block 3 — §4 verbatim binding-copy gates
 * (post-commercial-cut 2026-07-06, BCR v1.4 §12).
 *
 * Commercial-cut posture: §5 (Buyer surface) was cut whole; the two
 * §5.2 binding-copy tests originally landed here relocated verbatim
 * to salvage at
 * `/app/salvage/commercial_cut_2026_07_06/frontend/__tests__/pre_cut_test_phase_8_b_3_binding_copy_verbatim.test.js`.
 * The §4 binding-copy gates (§4.2 + §4.3) STAY — engineer surface is
 * untouched by the cut.
 *
 * Owner Condition 3 verbatim (attached to D4b Block 3, 2026-07-04):
 *   "§4 + §5 verbatim including §4's binding copy ('There is no response
 *    shape in which the claim is separable from its class') and §5's
 *    dual-delta visibility on the buyer rail — {price_delta, class_delta}
 *    rendered as the pair, per the E6 visibility ruling; backend
 *    enforcement already exists, the surface shows both."
 *
 * Post-cut this file preserves the §4 half of that Condition 3.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// eslint-disable-next-line import/first
import EngineerFirstCallPage from '../../pages/engineer/EngineerFirstCallPage';
// eslint-disable-next-line import/first
import EngineerAdministerPage from '../../pages/engineer/EngineerAdministerPage';

jest.mock('../../hooks/useAuth', () => {
  const stable = {
    identity: {
      user_id: 'test-copy-1',
      email: 'copy@example.com',
      name: 'Copy',
      roles: ['engineer'],
      key_grants: [],
      created_at: '2026-07-05T00:00:00Z',
    },
    login: () => {},
    register: () => {},
    logout: () => {},
    checkSession: () => {},
  };
  return {
    useAuth: () => stable,
    AuthProvider: ({ children }) => children,
  };
});

jest.mock('../../apiClient', () => {
  const mockedApi = {
    engineerListKeyGrants: () =>
      Promise.resolve({ status: 200, body: { grantee_email: 'copy@example.com', grants: [] } }),
  };
  return {
    __esModule: true,
    default: mockedApi,
    api: mockedApi,
    formatApiErrorDetail: (d) => String(d),
  };
});

describe('Phase 8 B-3 Block 3 — §4 verbatim binding-copy gates (post-cut)', () => {
  test('§4.2 binding copy VERBATIM — "There is no response shape in which the claim is separable from its class"', async () => {
    render(
      <BrowserRouter>
        <EngineerFirstCallPage />
      </BrowserRouter>
    );
    const el = await screen.findByTestId('first-call-binding-copy');
    expect(el).toHaveTextContent('There is no response shape in which the claim is separable from its class');
    expect(el).toHaveTextContent('Infrastructure faults return 500 and are never rendered as refusals');
  });

  test('§4.3 footer binding copy VERBATIM — "Key scope is enforced server-side on every call."', async () => {
    render(
      <BrowserRouter>
        <EngineerAdministerPage />
      </BrowserRouter>
    );
    const el = await screen.findByTestId('administer-footer-binding-copy');
    expect(el).toHaveTextContent('Key scope is enforced server-side on every call.');
  });
});
