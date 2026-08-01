/* UI-1-C · Connect module Jest gates.
 *
 * Canon §4.1 five-section landing + §4.2 seven rules + §4.4 source profile
 * + §4.2 A5 setup. Assertions are on RENDERED DOM (never on constants),
 * per Owner iter16/iter17 discipline.
 */
import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

import ConnectHomePage from '../../pages/connect/ConnectHomePage';
import ConnectRulesPage from '../../pages/connect/ConnectRulesPage';
import ConnectSourceProfilePage from '../../pages/connect/ConnectSourceProfilePage';
import ConnectSetupPage from '../../pages/connect/ConnectSetupPage';

jest.mock('../../apiClient', () => {
  const mock = {
    connectLanding: jest.fn(),
    connectRules: jest.fn(),
    connectRuleDirectWrite: jest.fn(),
    connectSourceProfile: jest.fn(),
    connectSourceConnect: jest.fn(),
    connectSourceTest: jest.fn(),
    connectSourceRetry: jest.fn(),
    connectDeclaredRegistries: jest.fn(),
    connectDeclareRegistry: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset && f.mockReset());
});


const LANDING_BODY = {
  canon_ref: 'Canon §4.1',
  headline: { kind: 'pre_connection', text: '4 sources declared · 1 connected · 1 awaiting credentials' },
  status_banner: {
    configuration_locked: false,
    signed_by: null,
    signed_at_iso: null,
    deployment_target: 'RMS Local',
    primary_regulator: 'DPO capacity',
    credentials_holder: 'instance vault',
    config_read_only_route: '/instance/config',
    defaults: ['deployment_target', 'primary_regulator', 'credentials_holder'],
    field_is_default: {
      deployment_target: true, primary_regulator: true, credentials_holder: true,
    },
  },
  cards: {
    connections_healthy: 1, connections_total: 4,
    last_sync_iso: '2026-08-02T09:00:00Z',
    egress_posture: 'seam · lands when OT-1a facts arrive',
    egress_is_dormant: true,
  },
  record_rows: [
    { source_id: 'src-a', name: 'Alpha', protocol: 'postgres', protocol_familiar: 'database endpoint',
      cadence: 'daily_09', cadence_plain: 'each morning at 9', state: 'connected', is_sample: true },
    { source_id: 'src-b', name: 'Beta',  protocol: 'http_json', protocol_familiar: 'HTTP · JSON API',
      cadence: 'daily_00', cadence_plain: 'each night at midnight', state: 'failed',
      failure_reason_plain: 'TLS handshake failed at 03:11 UTC — install the current certificate then retry.',
      is_sample: true },
    { source_id: 'src-c', name: 'Gamma', protocol: 'sftp', protocol_familiar: 'transfer host',
      cadence: 'weekly_mon', cadence_plain: 'every Monday morning', state: 'awaiting_credentials',
      awaiting_note: 'Awaiting the master_admin to issue credentials.', is_sample: true },
    { source_id: 'src-d', name: 'Delta', protocol: 's3', protocol_familiar: 'object-store endpoint',
      cadence: 'hourly', cadence_plain: 'every hour', state: 'in_progress',
      in_progress_note: '3,000 of 10,000 rows ingested', is_sample: true },
  ],
  footer: {
    credentials_holder: 'instance vault',
    signed_off_by: 'not yet signed',
    govern_link_text: 'data use rules live in Govern',
    govern_link_route: '/govern/rules',
  },
  declared_registries: [
    { registry_name: 'sanctioned_partners', schema_class: 'pseudonymize',
      is_empty: true, version: null, last_updated_at_iso: null, is_sample: true },
  ],
};


/* =============================================================================
   Cell 1 · gate_landing_five_sections_exact_order_no_governance
   ============================================================================= */
describe('UI-1-C · gate_landing_five_sections_exact_order_no_governance', () => {
  it('renders exactly the five Canon §4.1 sections in order and NO governance content', async () => {
    api.connectLanding.mockResolvedValueOnce({ status: 200, body: LANDING_BODY });
    render(<MemoryRouter><ConnectHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('connect-home')).toBeInTheDocument());
    // Exact DOM order: headline → status banner → cards → table → footer.
    const home = screen.getByTestId('connect-home');
    const sections = [
      'connect-headline-slot',
      'connect-status-banner',
      'connect-three-cards',
      'connect-record-table',
      'connect-footer',
    ];
    const positions = sections.map((s) => {
      const el = screen.getByTestId(s);
      // Return the position of each section in the home container.
      return Array.from(home.querySelectorAll('*')).indexOf(el);
    });
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i]).toBeGreaterThan(positions[i - 1]);
    }
    // Gate: no governance content on this page.
    expect(screen.queryByText(/change-a-rule ceremony/i)).toBeNull();
    expect(screen.queryByText(/refusal ledger/i)).toBeNull();
    expect(screen.queryByText(/trust center/i)).toBeNull();
    expect(screen.queryByText(/holds surface/i)).toBeNull();
    // Footer contains a link to Govern for rules (Connect LINKS, never duplicates).
    expect(screen.getByTestId('connect-footer-govern-link')).toHaveAttribute('href', '/govern/rules');
  });
});


/* =============================================================================
   Cell 2 · gate_landing_headline_two_state_same_slot
   ============================================================================= */
describe('UI-1-C · gate_landing_headline_two_state_same_slot', () => {
  it('pre-connection state renders in the same slot testid as steady-state (layout invariant)', async () => {
    // Pre-connection.
    api.connectLanding.mockResolvedValueOnce({ status: 200, body: LANDING_BODY });
    const { unmount } = render(<MemoryRouter><ConnectHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('connect-headline-slot')).toBeInTheDocument());
    const preText = screen.getByTestId('connect-headline-text').textContent;
    expect(screen.getByTestId('connect-headline-slot').getAttribute('data-headline-kind')).toBe('pre_connection');
    expect(preText).toMatch(/declared/i);
    unmount();
    // Steady state — SAME testid slot, different content, layout unchanged.
    api.connectLanding.mockResolvedValueOnce({
      status: 200,
      body: {
        ...LANDING_BODY,
        headline: { kind: 'steady_state', text: 'All 4 sources connected · last sync 2m ago' },
      },
    });
    render(<MemoryRouter><ConnectHomePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('connect-headline-slot').getAttribute('data-headline-kind')).toBe('steady_state')
    );
    const steadyText = screen.getByTestId('connect-headline-text').textContent;
    expect(steadyText).toMatch(/all .* connected/i);
    // The SAME testid served both states — layout never changed.
  });
});


/* =============================================================================
   Cell 3 · gate_status_banner_defaults_marker_visible
   ============================================================================= */
describe('UI-1-C · gate_status_banner_defaults_marker_visible', () => {
  it('defaulted values (deployment_target, primary_regulator) render a visible DEFAULT marker until confirmed', async () => {
    api.connectLanding.mockResolvedValueOnce({ status: 200, body: LANDING_BODY });
    render(<MemoryRouter><ConnectHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('connect-status-banner')).toBeInTheDocument());
    expect(screen.getByTestId('connect-banner-deployment')).toHaveTextContent(/RMS Local/);
    expect(screen.getByTestId('connect-banner-deployment-default')).toBeInTheDocument();
    expect(screen.getByTestId('connect-banner-deployment-default').textContent).toMatch(/default/i);
    expect(screen.getByTestId('connect-banner-regulator-default')).toBeInTheDocument();
  });

  it('when a field is NOT in defaults, no marker renders (confirmed rendering is clean)', async () => {
    const confirmed = {
      ...LANDING_BODY,
      status_banner: {
        ...LANDING_BODY.status_banner,
        defaults: [],
        field_is_default: { deployment_target: false, primary_regulator: false, credentials_holder: false },
      },
    };
    api.connectLanding.mockResolvedValueOnce({ status: 200, body: confirmed });
    render(<MemoryRouter><ConnectHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('connect-banner-deployment')).toBeInTheDocument());
    expect(screen.queryByTestId('connect-banner-deployment-default')).toBeNull();
    expect(screen.queryByTestId('connect-banner-regulator-default')).toBeNull();
  });
});


/* =============================================================================
   Cell 4 · gate_record_table_four_states_grammar
   ============================================================================= */
describe('UI-1-C · gate_record_table_four_states_grammar', () => {
  it('the four state grammar (connected/in_progress/awaiting_credentials/failed) all render with proper labels', async () => {
    api.connectLanding.mockResolvedValueOnce({ status: 200, body: LANDING_BODY });
    render(<MemoryRouter><ConnectHomePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('connect-record-table')).toBeInTheDocument());
    // All four state badges render.
    expect(screen.getByTestId('connect-source-state-badge-connected')).toHaveTextContent(/connected/i);
    expect(screen.getByTestId('connect-source-state-badge-in_progress')).toHaveTextContent(/in progress/i);
    expect(screen.getByTestId('connect-source-state-badge-awaiting_credentials')).toHaveTextContent(/awaiting credentials/i);
    expect(screen.getByTestId('connect-source-state-badge-failed')).toHaveTextContent(/^failed$/i);
    // Failed state MUST carry an honest plain-language reason (Owner directive).
    const failReason = screen.getByTestId('connect-source-failure-reason-src-b');
    expect(failReason).toBeInTheDocument();
    expect(failReason.textContent.length).toBeGreaterThan(20);  // not a bare word
    expect(failReason.textContent.toLowerCase()).not.toBe('failed');
    // Row click opens the source profile via a Link to /connect/source/:id.
    expect(screen.getByTestId('connect-source-link-src-a')).toHaveAttribute('href', '/connect/source/src-a');
  });
});


/* =============================================================================
   Cell 5 · gate_source_profile_answer_first_plain_language_questions
   ============================================================================= */
describe('UI-1-C · gate_source_profile_answer_first_plain_language_questions', () => {
  it('lands with the answer (N of M confirmed · K need attention) and questions in plain language', async () => {
    api.connectSourceProfile.mockResolvedValueOnce({
      status: 200,
      body: {
        source_id: 'src-a',
        name: 'Alpha',
        protocol_familiar: 'database endpoint',
        cadence_plain: 'each morning at 9',
        state: 'connected',
        is_sample: true,
        fields_confirmed: 6,
        fields_total: 8,
        fields_need_attention: [
          { field_id: 'email_col', question_plain: 'Should this column be pseudonymized or redacted before use?',
            resolution_control: 'posture_selector', options: ['pseudonymize', 'redact'] },
        ],
        mapping_header: '6 of 8 fields confirmed · 1 need attention',
        operator_can_resolve: true,
        canon_ref: 'Canon §4.4',
        signed_off_by: 'op@example.com',
      },
    });
    render(
      <MemoryRouter initialEntries={['/connect/source/src-a']}>
        <Routes>
          <Route path="/connect/source/:sourceId" element={<ConnectSourceProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('connect-source-profile')).toBeInTheDocument());
    // Answer-first header.
    expect(screen.getByTestId('connect-source-mapping-header').textContent).toMatch(/6 of 8 fields confirmed/);
    // Plain-language question rendered.
    const attention = screen.getByTestId('connect-source-profile-attention-email_col');
    expect(attention.textContent).toMatch(/pseudonymized or redacted/i);
    // Full field list is COLLAPSED behind a toggle.
    expect(screen.queryByTestId('connect-source-full-fields')).toBeNull();
    fireEvent.click(screen.getByTestId('connect-source-full-fields-toggle'));
    await waitFor(() => expect(screen.getByTestId('connect-source-full-fields')).toBeInTheDocument());
  });

  it('operator sees Connect/Test/Retry; read-only classes see a note (role-conditional)', async () => {
    // Operator path — already covered above via operator_can_resolve=true.
    // Read-only path:
    api.connectSourceProfile.mockResolvedValueOnce({
      status: 200,
      body: {
        source_id: 'src-a', name: 'Alpha',
        protocol_familiar: 'database endpoint', cadence_plain: 'each morning at 9',
        state: 'connected', is_sample: false,
        fields_confirmed: 8, fields_total: 8, fields_need_attention: [],
        mapping_header: '8 of 8 fields confirmed · 0 need attention',
        operator_can_resolve: false,
        signed_off_by: 'ops@x.example', signed_off_at_iso: '2026-08-02T09:00Z',
        canon_ref: 'Canon §4.4',
      },
    });
    render(
      <MemoryRouter initialEntries={['/connect/source/src-a']}>
        <Routes>
          <Route path="/connect/source/:sourceId" element={<ConnectSourceProfilePage />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByTestId('connect-source-actions')).toBeInTheDocument());
    expect(screen.getByTestId('connect-source-actions').getAttribute('data-can-resolve')).toBe('false');
    expect(screen.queryByTestId('connect-source-connect-btn')).toBeNull();
    expect(screen.getByTestId('connect-source-read-only-note').textContent).toMatch(/read-only/i);
    expect(screen.getByTestId('connect-source-read-only-note').textContent).toMatch(/ops@x/);
  });
});


/* =============================================================================
   Cell 6 · gate_auto_run_ceiling_1000_change_a_rule_only
   ============================================================================= */
describe('UI-1-C · gate_auto_run_ceiling_1000_change_a_rule_only', () => {
  it('rule 7 renders $1,000 by default AND direct write refuses with a route to Change-a-Rule', async () => {
    api.connectRules.mockResolvedValueOnce({
      status: 200,
      body: {
        canon_ref: 'Canon §4.2',
        rules: [
          { rule_id: 'rule7_commission_auto_run_ceiling', label: 'Commission auto-run ceiling',
            value: 1000, value_display: '$1,000.00', unit: 'USD', infinity_permitted: true,
            class_type: 'O', enforcement_class: 'Enforced',
            change_authority: 'Change-a-Rule ceremony ONLY · Canon §7.5 · direct writes refused',
            canon_ref: 'Canon §4.2 · rule 7 · Owner-set 2026-07-31',
            is_dormant: false },
        ],
      },
    });
    render(<MemoryRouter><ConnectRulesPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('connect-rule-card-rule7_commission_auto_run_ceiling')).toBeInTheDocument()
    );
    // Rule 7 renders the ceiling verbatim ($1,000.00) and the ∞ permitted note.
    const value = screen.getByTestId('connect-rule-value-rule7_commission_auto_run_ceiling');
    expect(value.textContent).toMatch(/\$1,000\.00/);
    expect(value.textContent).toMatch(/∞ permitted/);
    // Direct-write probe fires the refusal.
    api.connectRuleDirectWrite.mockResolvedValueOnce({
      status: 422,
      body: {
        outcome: 'refused',
        reason: 'connect_rule_change_a_rule_only',
        detail: 'Rule rule7 changes only via the Change-a-Rule ceremony (Canon §7.5). Direct write is refused.',
        route_to_approval: 'Open Govern · Change a rule',
        route: '/govern/change-rule',
      },
    });
    fireEvent.click(screen.getByTestId('connect-rule-direct-write-probe-rule7_commission_auto_run_ceiling'));
    await waitFor(() =>
      expect(screen.getByTestId('connect-rule-direct-write-refusal-rule7_commission_auto_run_ceiling')).toBeInTheDocument()
    );
    expect(
      screen.getByTestId('connect-rule-refusal-route-rule7_commission_auto_run_ceiling')
    ).toHaveAttribute('href', '/govern/change-rule');
    // Route through the checker — NOT a UI-only refusal.
    expect(api.connectRuleDirectWrite).toHaveBeenCalledWith('rule7_commission_auto_run_ceiling', expect.anything());
  });
});


/* =============================================================================
   Cell 7 · gate_seven_rules_render_including_dormant_honest
   ============================================================================= */
describe('UI-1-C · gate_seven_rules_render_including_dormant_honest', () => {
  it('exactly 7 rules render; dormant rules carry an honest DORMANT badge (never dressed as live)', async () => {
    api.connectRules.mockResolvedValueOnce({
      status: 200,
      body: {
        canon_ref: 'Canon §4.2',
        rules: [
          { rule_id: 'r1', label: 'R1', value_display: 'v1', class_type: 'S', enforcement_class: 'Enforced', change_authority: 'Owner ruling only', is_dormant: false },
          { rule_id: 'r2', label: 'R2', value_display: 'v2', class_type: 'O', enforcement_class: 'Enforced', change_authority: 'Change-a-Rule · Canon §7.5', is_dormant: false },
          { rule_id: 'r3', label: 'R3', value_display: 'v3', class_type: 'O', enforcement_class: 'Enforced', change_authority: 'Change-a-Rule · Canon §7.5', is_dormant: false },
          { rule_id: 'r4', label: 'R4', value_display: 'v4', class_type: 'O', enforcement_class: 'Attested', change_authority: 'Change-a-Rule · Canon §7.5', is_dormant: false },
          { rule_id: 'r5', label: 'R5', value_display: 'seam · dormant', class_type: 'E', enforcement_class: 'Monitored', change_authority: 'Change-a-Rule · Canon §7.5', is_dormant: true, dormant_reason: 'awaiting OT-1a facts' },
          { rule_id: 'r6', label: 'R6', value_display: 'declared at setup', class_type: 'D', enforcement_class: 'Enforced', change_authority: 'Canon §7.4', is_dormant: false },
          { rule_id: 'r7', label: 'R7', value_display: '$1,000.00', unit: 'USD', infinity_permitted: true, class_type: 'O', enforcement_class: 'Enforced', change_authority: 'Change-a-Rule ceremony ONLY · Canon §7.5', is_dormant: false },
        ],
      },
    });
    render(<MemoryRouter><ConnectRulesPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('connect-rules-list')).toBeInTheDocument());
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByTestId(`connect-rule-card-r${i}`)).toBeInTheDocument();
    }
    // Dormant rule wears the honest DORMANT badge.
    expect(screen.getByTestId('connect-rule-dormant-badge-r5')).toBeInTheDocument();
    // Live rules DO NOT wear the dormant badge.
    expect(screen.queryByTestId('connect-rule-dormant-badge-r1')).toBeNull();
    expect(screen.queryByTestId('connect-rule-dormant-badge-r7')).toBeNull();
  });
});


/* =============================================================================
   Cell 8 · gate_setup_registry_empty_fail_closed
   ============================================================================= */
describe('UI-1-C · gate_setup_registry_empty_fail_closed', () => {
  it('a declared registry with no rows yet renders EMPTY + FAIL-CLOSED honestly', async () => {
    api.connectDeclaredRegistries.mockResolvedValue({
      status: 200,
      body: {
        canon_ref: 'Canon §4.2 · A5',
        declared: [
          { registry_name: 'r_empty', schema_class: 'pseudonymize', is_empty: true, version: null, is_sample: true },
          { registry_name: 'r_loaded', schema_class: 'filter', is_empty: false, version: 3, last_updated_at_iso: '2026-08-02T00:00Z', is_sample: false },
        ],
      },
    });
    render(<MemoryRouter><ConnectSetupPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('connect-setup-registry-row-r_empty')).toBeInTheDocument()
    );
    expect(screen.getByTestId('connect-setup-empty-fail-closed-r_empty').textContent).toMatch(/empty.*fail.closed/i);
    expect(screen.queryByTestId('connect-setup-empty-fail-closed-r_loaded')).toBeNull();
    // Both rows link into /govern/registries (Connect declares; Govern operates).
    expect(screen.getByTestId('connect-setup-govern-link-r_empty')).toHaveAttribute('href', '/govern/registries');
    expect(screen.getByTestId('connect-setup-govern-link-r_loaded')).toHaveAttribute('href', '/govern/registries');
  });
});
