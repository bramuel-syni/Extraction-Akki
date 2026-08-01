/* UI-1-E · Team surface · Jest gate roster (Stage A · ~10 cells).
 *
 * Cells:
 *   1  · gate_team_landing_renders_all_three_section_tiles
 *   2  · gate_team_approval_surface_renders_all_items_by_default_page_level
 *   3  · gate_team_approval_item_grammar_what_criterion_cost_requester
 *   4  · gate_team_approval_decision_requires_verbatim_reason
 *   5  · gate_team_approval_decision_confirmation_and_govern_link_across
 *   6  · gate_team_access_register_page_level_render_and_sample_badges
 *   7  · gate_team_access_register_grant_form_visible_for_master_admin
 *   8  · gate_team_access_register_dpo_reads_but_cannot_grant_denial_shape
 *   9  · gate_team_access_register_revoke_flow_end_to_end
 *   10 · gate_team_constitutional_seats_renders_two_seats_action_dormant_honest
 *   11 · gate_team_retired_vocabulary_absent_approval_queue_as_name
 *   12 · gate_team_page_level_sample_marking_systemic
 *   13 · gate_team_approval_non_200_renders_honest_error_never_silent
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

import TeamLandingPage from '../../pages/team/TeamLandingPage';
import TeamApprovalSurfacePage from '../../pages/team/TeamApprovalSurfacePage';
import TeamAccessRegisterPage from '../../pages/team/TeamAccessRegisterPage';
import TeamConstitutionalSeatsPage from '../../pages/team/TeamConstitutionalSeatsPage';

jest.mock('../../apiClient', () => {
  const mock = {
    teamApprovalSurface: jest.fn(),
    teamApprovalDecision: jest.fn(),
    teamAccessRegister: jest.fn(),
    teamAccessGrant: jest.fn(),
    teamAccessRevoke: jest.fn(),
    teamConstitutionalSeats: jest.fn(),
  };
  return { __esModule: true, default: mock, api: mock };
});
import api from '../../apiClient';

const APPROVAL_SURFACE_ENVELOPE = {
  canon_ref: 'Canon §3.2 · UI-1-E · A · Approval Surface',
  identity: 'admin@rms.example.com',
  items: [
    {
      item_id: 'chk-sample-team-chk-abc',
      class: 'over_threshold_commission',
      what: 'Train-a-Model commission on Q3 partner feedback — proposed spend exceeds the standing auto-run ceiling.',
      which_criterion: 'auto_run_ceiling_exceeded',
      cost_or_touch: '$1,450.00 (auto-run ceiling: $1,000.00)',
      requested_by: 'operator@rms.example.com',
      requested_at_iso: '2026-08-02T00:00:00Z',
      linked_record_route: '/govern/holds?session_id=s-sample-held-abc',
      state: 'open',
      is_sample: true,
    },
    {
      item_id: 'src-sample-team-src-abc',
      class: 'source_addition_pending',
      what: "Source 'sample_broker_pipeline_awaiting_creds' awaits credentials to complete connect.",
      which_criterion: 'connect_credentials_required',
      cost_or_touch: 'ring=R2 · domain=revenue · corpus_row_count=0',
      requested_by: 'operator@rms.example.com',
      requested_at_iso: '2026-08-02T00:00:00Z',
      linked_record_route: '/connect?source=sample-team-src-abc',
      state: 'open',
      is_sample: true,
    },
    {
      item_id: 'grant-sample-team-grant-pending-abc',
      class: 'access_grant_request',
      what: 'Key-grant request for grantee=external.engineer@partner.example.com scope=read-only warehouse view of one identity\'s holdings',
      which_criterion: 'access_grant_master_admin_approval',
      cost_or_touch: 'scope=GET /api/registry/what_you_hold (read-only) · delegation_chain=1',
      requested_by: 'external.engineer@partner.example.com',
      requested_at_iso: '2026-08-02T00:00:00Z',
      linked_record_route: '/team/access-register?grant_id=sample-team-grant-pending-abc',
      state: 'open',
      is_sample: true,
    },
    {
      item_id: 'dormant-retention-extension',
      class: 'retention_window_extension',
      what: 'Retention-window extensions above the standing loosen-symmetric floor.',
      which_criterion: 'retention_extension_beyond_symmetric_floor',
      cost_or_touch: 'affects retention_windows registry effective term.',
      requested_by: null,
      requested_at_iso: null,
      linked_record_route: '/govern/record/rule-changes',
      state: 'dormant_honest',
      state_reason_plain: 'This class of approval is registered in Canon; its dispatch pipeline awaits owner dispatch.',
      is_sample: false,
    },
  ],
  counts: { open: 3, dormant_honest: 1, total: 4 },
  queue_reading: 'healthy',
  queue_doctrine_plain: 'Consistently empty → criteria may be too loose. Consistently full → too tight. The criteria are the instrument, the queue is its reading.',
};

const ACCESS_REGISTER_ENVELOPE_MASTER_ADMIN = {
  canon_ref: 'Canon §3.2 · UI-1-E · B · Access Register',
  identity: 'admin@rms.example.com',
  rows: [
    {
      grant_id: 'sample-team-grant-active-1-abc',
      who_grantee_email: 'auditor@dpo.example.com',
      what_scope: 'GET /api/govern/record (read-only auditor scope)',
      when_created_iso: '2026-08-02T00:00:00Z',
      when_revoked_iso: null,
      by_whom_grantor_email: 'admin@rms.example.com',
      state: 'active',
      propagation_state_plain: "Active — takes effect at the grantee's next login/refresh.",
      is_sample: true,
    },
    {
      grant_id: 'sample-team-grant-active-2-abc',
      who_grantee_email: 'partner@vendor.example.com',
      what_scope: 'GET /api/prove/samples (shape-reference read)',
      when_created_iso: '2026-08-02T00:00:00Z',
      when_revoked_iso: null,
      by_whom_grantor_email: 'admin@rms.example.com',
      state: 'active',
      propagation_state_plain: "Active — takes effect at the grantee's next login/refresh.",
      is_sample: true,
    },
    {
      grant_id: 'sample-team-grant-revoked-abc',
      who_grantee_email: 'former.contractor@ex.example.com',
      what_scope: 'GET /api/use-data/sessions',
      when_created_iso: '2026-08-02T00:00:00Z',
      when_revoked_iso: '2026-08-02T01:00:00Z',
      by_whom_grantor_email: 'admin@rms.example.com',
      state: 'revoked',
      propagation_state_plain: "Revoked — takes effect at the grantee's next login/refresh.",
      is_sample: true,
    },
  ],
  counts: { total: 3, active: 2, revoked: 1, pending_approval: 0 },
  capabilities: { can_read_all: true, can_grant: true, can_revoke: true },
  role_gate_doctrine_plain: 'Master Admin: read + grant + revoke. DPO: read (record) only. Operator / Analyst / other roles: read own grants.',
};

const ACCESS_REGISTER_ENVELOPE_DPO = {
  ...ACCESS_REGISTER_ENVELOPE_MASTER_ADMIN,
  identity: 'demo.dpo@demo.rms.example.com',
  capabilities: { can_read_all: true, can_grant: false, can_revoke: false },
};

const SEATS_ENVELOPE = {
  canon_ref: 'Canon operating model A.5 · UI-1-E · C · Constitutional Seats',
  seats: [
    {
      seat_id: 'master_admin',
      label: 'Master Admin',
      holder_email: 'admin@rms.example.com',
      vacancy_declared: false,
      vacancy_reason_plain: null,
      succession_path_plain: 'Succession requires an out-of-band instrument (signed nomination) and a counter-signature from the other constitutional seat (DPO). Backend seam is not yet built — rendered dormant-honest per Canon operating model A.5 · UI-1-E · C.',
      action_dormant_reason_plain: 'Succession dispatch is dormant. Adding a backend seam would require a new frozen contract (HAZARD-STOP). Once the succession contract is admitted, this action will light up.',
    },
    {
      seat_id: 'dpo',
      label: 'DPO (Data Protection Officer)',
      holder_email: 'demo.dpo@demo.rms.example.com',
      vacancy_declared: false,
      vacancy_reason_plain: null,
      succession_path_plain: 'Succession requires an out-of-band instrument (signed nomination) and a counter-signature from the other constitutional seat (Master Admin). Backend seam is not yet built — rendered dormant-honest per Canon operating model A.5 · UI-1-E · C.',
      action_dormant_reason_plain: 'Succession dispatch is dormant. Adding a backend seam would require a new frozen contract (HAZARD-STOP). Once the succession contract is admitted, this action will light up.',
    },
  ],
  counter_signature_required: true,
  action_state: 'dormant_honest',
};

beforeEach(() => {
  Object.values(api).forEach((f) => f.mockReset && f.mockReset());
  api.teamApprovalSurface.mockResolvedValue({ status: 200, body: APPROVAL_SURFACE_ENVELOPE });
  api.teamAccessRegister.mockResolvedValue({ status: 200, body: ACCESS_REGISTER_ENVELOPE_MASTER_ADMIN });
  api.teamConstitutionalSeats.mockResolvedValue({ status: 200, body: SEATS_ENVELOPE });
});


// ============================================================================
// Cell 1
// ============================================================================
describe('UI-1-E · gate_team_landing_renders_all_three_section_tiles', () => {
  it('the /team landing page shows 3 section tiles (A · B · C) with correct routes', () => {
    render(<MemoryRouter><TeamLandingPage /></MemoryRouter>);
    expect(screen.getByTestId('team-landing-page')).toBeInTheDocument();
    ['approval-surface', 'access-register', 'constitutional-seats'].forEach((id) => {
      const tile = screen.getByTestId(`team-section-tile-${id}`);
      expect(tile).toBeInTheDocument();
      expect(tile.getAttribute('href')).toBe(`/team/${id}`);
    });
  });
});


// ============================================================================
// Cell 2 · PAGE-LEVEL render (systemic lesson from UI-1-D iter22 · fetches on mount)
// ============================================================================
describe('UI-1-E · gate_team_approval_surface_renders_all_items_by_default_page_level', () => {
  it('mounts and fetches → all 4 seeded items + queue-reading render by default', async () => {
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-approval-item-chk-sample-team-chk-abc')).toBeInTheDocument()
    );
    // All 4 items render.
    expect(screen.getByTestId('team-approval-item-src-sample-team-src-abc')).toBeInTheDocument();
    expect(screen.getByTestId('team-approval-item-grant-sample-team-grant-pending-abc')).toBeInTheDocument();
    expect(screen.getByTestId('team-approval-item-dormant-retention-extension')).toBeInTheDocument();
    // Queue-reading doctrine renders verbatim.
    const doctrine = screen.getByTestId('team-approval-queue-doctrine');
    expect(doctrine).toBeInTheDocument();
    expect(doctrine.getAttribute('data-queue-reading')).toBe('healthy');
    expect(doctrine.textContent).toMatch(/consistently empty.*criteria may be too loose/i);
    expect(doctrine.textContent).toMatch(/consistently full.*too tight/i);
    // Sample badges render on the 3 seeded items.
    expect(screen.getByTestId('team-approval-sample-badge-chk-sample-team-chk-abc')).toBeInTheDocument();
    expect(screen.getByTestId('team-approval-sample-badge-src-sample-team-src-abc')).toBeInTheDocument();
    expect(screen.getByTestId('team-approval-sample-badge-grant-sample-team-grant-pending-abc')).toBeInTheDocument();
    // Dormant-honest item has no sample badge but has its dormant reason.
    expect(screen.getByTestId('team-approval-dormant-reason-dormant-retention-extension')).toBeInTheDocument();
  });
});


// ============================================================================
// Cell 3
// ============================================================================
describe('UI-1-E · gate_team_approval_item_grammar_what_criterion_cost_requester', () => {
  it('each item states WHAT · WHICH criterion · COST/touch · WHO requested', async () => {
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    const iid = 'chk-sample-team-chk-abc';
    await waitFor(() => expect(screen.getByTestId(`team-approval-item-${iid}`)).toBeInTheDocument());
    expect(screen.getByTestId(`team-approval-what-${iid}`).textContent).toMatch(/Train-a-Model/);
    expect(screen.getByTestId(`team-approval-criterion-${iid}`).textContent).toBe('auto_run_ceiling_exceeded');
    expect(screen.getByTestId(`team-approval-cost-${iid}`).textContent).toMatch(/\$1,450\.00/);
    expect(screen.getByTestId(`team-approval-requester-${iid}`).textContent).toBe('operator@rms.example.com');
  });
});


// ============================================================================
// Cell 4 · Owner Message 608 · D-1 binding (decision reason verbatim, ledger event)
// ============================================================================
describe('UI-1-E · gate_team_approval_decision_requires_verbatim_reason', () => {
  it('the submit button is disabled until BOTH decision (approve/decline) AND reason are set', async () => {
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    const iid = 'chk-sample-team-chk-abc';
    await waitFor(() =>
      expect(screen.getByTestId(`team-decision-submit-${iid}`)).toBeInTheDocument()
    );
    const submit = screen.getByTestId(`team-decision-submit-${iid}`);
    expect(submit).toBeDisabled();
    // pick decision but no reason → still disabled.
    fireEvent.click(screen.getByTestId(`team-approve-btn-${iid}`));
    expect(submit).toBeDisabled();
    // add reason → enabled.
    fireEvent.change(screen.getByTestId(`team-decision-reason-${iid}`), { target: { value: 'looks good' } });
    expect(submit).not.toBeDisabled();
    // clear reason → disabled again (both required).
    fireEvent.change(screen.getByTestId(`team-decision-reason-${iid}`), { target: { value: '   ' } });
    expect(submit).toBeDisabled();
  });
});


// ============================================================================
// Cell 5 · Owner Message 608 · D-1 binding (reachable from Govern record — link-across)
// ============================================================================
describe('UI-1-E · gate_team_approval_decision_confirmation_and_govern_link_across', () => {
  it('successful decision renders confirmation with linked-govern route (link-across, not copy)', async () => {
    api.teamApprovalDecision.mockResolvedValueOnce({
      status: 200,
      body: {
        canon_ref: 'Canon §3.2 · UI-1-E · A · decision',
        event: {
          event_id: 'tde-evt-1',
          item_id: 'chk-sample-team-chk-abc',
          decision: 'approve',
          reason_verbatim: 'training scope is within Q3 budget',
          decider_email: 'admin@rms.example.com',
          decided_at_iso: '2026-08-02T00:00:00Z',
        },
        seam_ack: { routed_to: 'checker_requests', note: 'Decision mirrored to the checker record.' },
        linked_govern_record_route: '/govern/holds',
      },
    });
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    const iid = 'chk-sample-team-chk-abc';
    await waitFor(() =>
      expect(screen.getByTestId(`team-approve-btn-${iid}`)).toBeInTheDocument()
    );
    fireEvent.click(screen.getByTestId(`team-approve-btn-${iid}`));
    fireEvent.change(screen.getByTestId(`team-decision-reason-${iid}`), {
      target: { value: 'training scope is within Q3 budget' },
    });
    fireEvent.click(screen.getByTestId(`team-decision-submit-${iid}`));
    await waitFor(() =>
      expect(screen.getByTestId('team-decision-confirmation')).toBeInTheDocument()
    );
    // The confirmation carries the linked-govern route — a link-across, not a copy.
    const linkToGovern = screen.getByTestId('team-decision-goto-govern');
    expect(linkToGovern.getAttribute('href')).toBe('/govern/holds');
    // The API was called with the verbatim reason.
    expect(api.teamApprovalDecision).toHaveBeenCalledWith(
      'chk-sample-team-chk-abc', 'approve', 'training scope is within Q3 budget',
    );
    // Also verify the linked record route on the ITEM is present in DOM
    // (link-across from the item's own row).
    expect(screen.getByTestId(`team-approval-linked-record-${iid}`)).toBeInTheDocument();
    expect(screen.getByTestId(`team-approval-linked-record-${iid}`).getAttribute('href'))
      .toBe('/govern/holds?session_id=s-sample-held-abc');
  });
});


// ============================================================================
// Cell 6 · PAGE-LEVEL render + sample marking on Access Register
// ============================================================================
describe('UI-1-E · gate_team_access_register_page_level_render_and_sample_badges', () => {
  it('access register mounts → fetches → renders sample grants with SAMPLE badges', async () => {
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-grant-row-sample-team-grant-active-1-abc')).toBeInTheDocument()
    );
    // All 3 sample grant rows render.
    expect(screen.getByTestId('team-grant-row-sample-team-grant-active-2-abc')).toBeInTheDocument();
    expect(screen.getByTestId('team-grant-row-sample-team-grant-revoked-abc')).toBeInTheDocument();
    // Every seeded row shows a SAMPLE badge (systemic sample-marking discipline).
    ['sample-team-grant-active-1-abc',
     'sample-team-grant-active-2-abc',
     'sample-team-grant-revoked-abc'].forEach((gid) => {
      const badge = screen.getByTestId(`team-grant-sample-badge-${gid}`);
      expect(badge).toBeInTheDocument();
      expect(badge.getAttribute('data-sample-badge')).toBe('true');
    });
    // Propagation state renders honestly.
    expect(screen.getByTestId('team-grant-propagation-sample-team-grant-active-1-abc').textContent)
      .toMatch(/next login\/refresh/i);
  });
});


// ============================================================================
// Cell 7
// ============================================================================
describe('UI-1-E · gate_team_access_register_grant_form_visible_for_master_admin', () => {
  it('as master_admin (can_grant=true) the grant form renders', async () => {
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('team-access-grant-form')).toBeInTheDocument());
    expect(screen.getByTestId('team-access-grant-grantee-input')).toBeInTheDocument();
    expect(screen.getByTestId('team-access-grant-scope-input')).toBeInTheDocument();
    expect(screen.getByTestId('team-access-grant-submit')).toBeInTheDocument();
    // The grant-form does NOT render the role-denial banner.
    expect(screen.queryByTestId('team-access-grant-role-denial')).toBeNull();
  });
});


// ============================================================================
// Cell 8 · Owner Message 608 · D-2 binding — break-in style
// ============================================================================
describe('UI-1-E · gate_team_access_register_dpo_reads_but_cannot_grant_denial_shape', () => {
  it('DPO (can_grant=false, can_read_all=true) reads the register but form is REPLACED by a role-denial banner', async () => {
    api.teamAccessRegister.mockResolvedValueOnce({ status: 200, body: ACCESS_REGISTER_ENVELOPE_DPO });
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-access-grant-role-denial')).toBeInTheDocument()
    );
    // The grant form is NOT rendered for DPO.
    expect(screen.queryByTestId('team-access-grant-form')).toBeNull();
    const denial = screen.getByTestId('team-access-grant-role-denial');
    expect(denial.textContent).toMatch(/reads.*register.*but cannot issue grants/i);
    // DPO can still READ the rows.
    expect(screen.getByTestId('team-grant-row-sample-team-grant-active-1-abc')).toBeInTheDocument();
    // DPO does NOT see revoke buttons (can_revoke=false).
    expect(screen.queryByTestId('team-grant-revoke-btn-sample-team-grant-active-1-abc')).toBeNull();
  });
});


// ============================================================================
// Cell 9
// ============================================================================
describe('UI-1-E · gate_team_access_register_revoke_flow_end_to_end', () => {
  it('revoke flow: click revoke → enter reason → confirm → api called → confirmation renders', async () => {
    api.teamAccessRevoke.mockResolvedValueOnce({
      status: 200,
      body: {
        grant: {
          grant_id: 'sample-team-grant-active-1-abc',
          state: 'revoked',
          revoke_reason_verbatim: 'expired',
        },
        propagation_state_plain: "Revoked — takes effect at the grantee's next login/refresh.",
      },
    });
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    const gid = 'sample-team-grant-active-1-abc';
    await waitFor(() =>
      expect(screen.getByTestId(`team-grant-revoke-btn-${gid}`)).toBeInTheDocument()
    );
    // Click revoke → reveals the reason input + confirm button.
    fireEvent.click(screen.getByTestId(`team-grant-revoke-btn-${gid}`));
    fireEvent.change(screen.getByTestId(`team-grant-revoke-reason-${gid}`), { target: { value: 'expired' } });
    fireEvent.click(screen.getByTestId(`team-grant-revoke-confirm-${gid}`));
    await waitFor(() =>
      expect(screen.getByTestId('team-access-ack-revoke')).toBeInTheDocument()
    );
    expect(api.teamAccessRevoke).toHaveBeenCalledWith(gid, 'expired');
  });
});


// ============================================================================
// Cell 10
// ============================================================================
describe('UI-1-E · gate_team_constitutional_seats_renders_two_seats_action_dormant_honest', () => {
  it('renders both seats + action-state=dormant_honest + succession path narrative', async () => {
    render(<MemoryRouter><TeamConstitutionalSeatsPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-seat-master_admin')).toBeInTheDocument()
    );
    expect(screen.getByTestId('team-seat-dpo')).toBeInTheDocument();
    // Action-state banner.
    expect(screen.getByTestId('team-seats-action-state-banner').getAttribute('data-action-state'))
      .toBe('dormant_honest');
    // Initiate-succession buttons are disabled (dormant-honest).
    expect(screen.getByTestId('team-seat-initiate-succession-btn-master_admin')).toBeDisabled();
    expect(screen.getByTestId('team-seat-initiate-succession-btn-dpo')).toBeDisabled();
    // The dormant reason renders in plain language.
    expect(screen.getByTestId('team-seat-action-dormant-reason-master_admin').textContent)
      .toMatch(/HAZARD-STOP|new frozen contract/i);
    // Succession-path narrative renders.
    expect(screen.getByTestId('team-seat-succession-path-master_admin').textContent)
      .toMatch(/counter-signature.*DPO/);
    expect(screen.getByTestId('team-seat-succession-path-dpo').textContent)
      .toMatch(/counter-signature.*Master Admin/);
  });
});


// ============================================================================
// Cell 11 · retired-vocab discipline (Owner: "Approval Queue" as a NAME must not render)
// ============================================================================
describe('UI-1-E · gate_team_retired_vocabulary_absent_approval_queue_as_name', () => {
  const RETIRED_NAMES = [
    'Approval Queue',  // Canon vocab is "approval surface"/"Team"; "Approval Queue" as a NAME must not render.
    'Ask Console', 'RMS Intelligence', 'Shape this objective',
    'My Objectives', 'Engineer Register',
  ];

  it('/team landing: retired names absent', () => {
    render(<MemoryRouter><TeamLandingPage /></MemoryRouter>);
    const text = document.body.textContent || '';
    RETIRED_NAMES.forEach((term) => {
      expect({ term, present: text.includes(term) }).toEqual({ term, present: false });
    });
  });

  it('/team/approval-surface: retired names absent (Canon vocab is "approval surface")', async () => {
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('team-approval-surface-page')).toBeInTheDocument());
    const text = document.body.textContent || '';
    RETIRED_NAMES.forEach((term) => {
      expect({ term, present: text.includes(term) }).toEqual({ term, present: false });
    });
    // Positive: the Canon-vocab word "Approval Surface" DOES render (title, breadcrumb, etc.).
    expect(text).toMatch(/Approval Surface/);
  });

  it('/team/access-register: retired names absent', async () => {
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('team-access-register-page')).toBeInTheDocument());
    const text = document.body.textContent || '';
    RETIRED_NAMES.forEach((term) => {
      expect({ term, present: text.includes(term) }).toEqual({ term, present: false });
    });
  });

  it('/team/constitutional-seats: retired names absent', async () => {
    render(<MemoryRouter><TeamConstitutionalSeatsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('team-constitutional-seats-page')).toBeInTheDocument());
    const text = document.body.textContent || '';
    RETIRED_NAMES.forEach((term) => {
      expect({ term, present: text.includes(term) }).toEqual({ term, present: false });
    });
  });
});


// ============================================================================
// Cell 12 · Page-level sample-marking systemic (Owner Message 606 lesson)
// ============================================================================
describe('UI-1-E · gate_team_page_level_sample_marking_systemic', () => {
  it('/team/approval-surface: seeded is_sample rows carry data-sample-badge=true', async () => {
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-approval-item-chk-sample-team-chk-abc')).toBeInTheDocument()
    );
    const seededItems = APPROVAL_SURFACE_ENVELOPE.items.filter((i) => i.is_sample);
    seededItems.forEach((item) => {
      const badge = screen.getByTestId(`team-approval-sample-badge-${item.item_id}`);
      expect(badge.getAttribute('data-sample-badge')).toBe('true');
    });
  });

  it('/team/access-register: seeded is_sample rows carry data-sample-badge=true', async () => {
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-grant-row-sample-team-grant-active-1-abc')).toBeInTheDocument()
    );
    const seededRows = ACCESS_REGISTER_ENVELOPE_MASTER_ADMIN.rows.filter((r) => r.is_sample);
    seededRows.forEach((row) => {
      const badge = screen.getByTestId(`team-grant-sample-badge-${row.grant_id}`);
      expect(badge.getAttribute('data-sample-badge')).toBe('true');
    });
  });

  // Owner Message 611 · UI-1-E close binding: at least one SAMPLE revoked
  // grant MUST render on /team/access-register for admin, with visible
  // revoked state + revocation timestamp visible in the row.
  it('/team/access-register: at least one SAMPLE revoked grant renders with visible revoked state + timestamp', async () => {
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-grant-row-sample-team-grant-revoked-abc')).toBeInTheDocument()
    );
    const revokedRow = screen.getByTestId('team-grant-row-sample-team-grant-revoked-abc');
    expect(revokedRow.getAttribute('data-state')).toBe('revoked');
    // State badge renders "REVOKED" (data-testid team-grant-state-revoked).
    expect(revokedRow.querySelector('[data-testid="team-grant-state-revoked"]')).toBeTruthy();
    // Revoked-timestamp visible on the row (rendered under `when`).
    expect(revokedRow.textContent).toMatch(/revoked.*2026-08-02/i);
    // Propagation state carries the honest "next login/refresh" note.
    expect(screen.getByTestId('team-grant-propagation-sample-team-grant-revoked-abc').textContent)
      .toMatch(/next login\/refresh/i);
    // Sample badge visible (systemic sample-marking).
    expect(screen.getByTestId('team-grant-sample-badge-sample-team-grant-revoked-abc')
      .getAttribute('data-sample-badge')).toBe('true');
  });
});


// ============================================================================
// Cell 13 · silent-swallow guard (UI-1-D iter22 lesson)
// ============================================================================
describe('UI-1-E · gate_team_approval_non_200_renders_honest_error_never_silent', () => {
  it('/team/approval-surface: 401 on load renders prove-style honest error panel', async () => {
    api.teamApprovalSurface.mockResolvedValueOnce({
      status: 401,
      body: { reason: 'auth_missing', detail: 'Authentication required.' },
    });
    render(<MemoryRouter><TeamApprovalSurfacePage /></MemoryRouter>);
    await waitFor(() =>
      expect(screen.getByTestId('team-approval-error-panel')).toBeInTheDocument()
    );
    expect(screen.getByTestId('team-approval-error-panel').getAttribute('data-status')).toBe('401');
    expect(screen.getByTestId('team-approval-error-panel').textContent).toMatch(/auth_missing/i);
  });

  it('/team/access-register: 403 on grant renders inline error, never silent', async () => {
    api.teamAccessGrant.mockResolvedValueOnce({
      status: 403,
      body: { reason: 'auth_scope_insufficient', detail: 'DPO cannot grant.' },
    });
    render(<MemoryRouter><TeamAccessRegisterPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('team-access-grant-form')).toBeInTheDocument());
    fireEvent.change(screen.getByTestId('team-access-grant-grantee-input'), { target: { value: 'x@y.com' } });
    fireEvent.change(screen.getByTestId('team-access-grant-scope-input'), { target: { value: 'GET /api/x' } });
    fireEvent.click(screen.getByTestId('team-access-grant-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('team-access-ack-error')).toBeInTheDocument()
    );
    expect(screen.getByTestId('team-access-ack-error').getAttribute('data-status')).toBe('403');
    expect(screen.getByTestId('team-access-ack-error').textContent).toMatch(/auth_scope_insufficient/i);
  });

  it('/team/constitutional-seats: 500 renders the seats error panel with status', async () => {
    api.teamConstitutionalSeats.mockResolvedValueOnce({
      status: 500, body: { reason: 'internal_error', detail: 'Something broke.' },
    });
    render(<MemoryRouter><TeamConstitutionalSeatsPage /></MemoryRouter>);
    await waitFor(() => expect(screen.getByTestId('team-seats-error-panel')).toBeInTheDocument());
    expect(screen.getByTestId('team-seats-error-panel').getAttribute('data-status')).toBe('500');
  });
});
