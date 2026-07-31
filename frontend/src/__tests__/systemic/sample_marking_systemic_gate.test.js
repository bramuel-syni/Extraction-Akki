/* ==============================================================================
   SYSTEMIC SAMPLE-MARKING GATE · Owner ruling 2026-08-01 (third-occurrence fix)
 ------------------------------------------------------------------------------
   ONE gate that walks EVERY page-level surface rendering fixture-capable rows
   and asserts the AS-U2 invariant:

     ┌──────────────────────────────────────────────────────────────────────┐
     │  If a row's payload carries is_sample=true, the surface MUST render  │
     │  a visible SAMPLE badge component keyed to that row.                 │
     │                                                                      │
     │  (Unmarked mocks are prohibited. Canon Doctrine AS-U2.)              │
     └──────────────────────────────────────────────────────────────────────┘

   Registry: SAMPLE_MARKING_REGISTRY (below).
   Future sub-cycles (UI-1-C/D/E) ADD their surfaces to this registry.
   No per-surface whack-a-mole. One place. One invariant.

   This is a rendered-DOM gate — mocked to be hermetic. A live-preview
   sibling (`sample_marking_live_preview_gate`) runs from the testing agent
   and checks that seeded fixture endpoints ACTUALLY return flagged rows
   under the admin identity (the identity that matters, per Owner).
   ============================================================================ */
import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import UseDataLandingPage from '../../pages/use_data/UseDataLandingPage';
import GovernHomePage from '../../pages/govern/GovernHomePage';
import GovernHoldsPage from '../../pages/govern/GovernHoldsPage';

// ---- Registry of fixture-capable surfaces ------------------------------------
// Every UI-1-* sub-cycle that lands a new surface MUST register here.
const SAMPLE_MARKING_REGISTRY = [
  {
    surface_id: 'use_data_landing_pipeline',
    canon_ref: 'Canon §6 · AS-U2 (UI-1-A)',
    Component: UseDataLandingPage,
    endpoints: [
      { api_method: 'useDataCeiling', mock: {
        status: 200, body: { auto_run_ceiling_usd: 0 },
      }},
      { api_method: 'useDataListSessions', mock: {
        status: 200,
        body: {
          in_progress: [
            { session_id: 's-sample-in-progress-abc', opened_at_iso: 't', door: 'integrate_an_app',
              operator_id: 'op-1', dialogue: [], reflection: { fields: [] }, is_sample: true },
            { session_id: 's-real-1', opened_at_iso: 't', door: 'export_or_license',
              operator_id: 'op-1', dialogue: [], reflection: { fields: [] }, is_sample: false },
          ],
          ready: [
            { session_id: 's-sample-ready-abc', opened_at_iso: 't', door: 'export_or_license',
              operator_id: 'op-1', dialogue: [], reflection: { fields: [] },
              commission: { door: 'export_or_license', values_confirmed: [], committed_at_iso: 't', verdict_ref: 'trcv-x' },
              is_sample: true },
          ],
        },
      }},
    ],
    // For every row in the payload with is_sample=true, an element matching
    // one of these testid patterns MUST render.
    sample_badge_testid_patterns: [
      /^use-data-sample-badge-/,
    ],
    row_testid_pattern: /^use-data-pipeline-(in-progress|ready)-row-/,
  },
  {
    surface_id: 'govern_trust_center_record',
    canon_ref: 'Canon §7.1 (UI-1-B iter17)',
    Component: GovernHomePage,
    endpoints: [
      { api_method: 'governEnforcementClassSplit', mock: {
        status: 200,
        body: {
          enforced_count: 1, attested_count: 1, monitored_count: 1,
          machinery_vs_attestation_line: 'line · Neither is superior; both are recorded.',
          canon_ref: 'Canon §7.2',
        },
      }},
      { api_method: 'governTrustCenterRecord', mock: {
        status: 200,
        body: {
          refusals: {
            absolute: 1, escalatable: 1, held_for_check: 1,
            rows: [
              { refusal_id: 'sample-refusal-A', class_hint: 'absolute', reason_code: 'rights_bar',
                criterion_verbatim: 'seeded fixture', issued_at_iso: 't', is_sample: true },
              { refusal_id: 'real-refusal-X', class_hint: 'escalatable', reason_code: 'privacy_floor',
                criterion_verbatim: 'real refusal', issued_at_iso: 't', is_sample: false },
            ],
          },
          holds: { open: 1, released: 0, confirmed_rejected: 0, rows: [
            { session_id: 's-sample-held-1', operator_id: 'op-1', door: 'train_a_model',
              verdict_ref: 'trcv-sample-held-x', held_since_iso: 't', is_sample: true },
          ]},
          masking: { events_30d: 0, recall_breaches_30d: 0, seam_state: 'dormant', rows: [] },
          access_events: { people_30d: 0, applications_30d: 0, seam_state: 'dormant', rows: [] },
          deletions: { authorized_30d: 0, seam_state: 'dormant', rows: [] },
          rule_changes: { pending: 0, effective_30d: 1, suspended_30d: 1, rows: [
            { request_id: 'sample-rc-eff', state: 'effective', rule_class: 'retention_windows',
              from_value_ref: '180d', to_value_ref: '365d', is_sample: true },
            { request_id: 'sample-rc-susp', state: 'suspended', rule_class: 'source_standing_table',
              from_value_ref: 'v3', to_value_ref: 'v4', suspend_reason: 'canceled fixture', is_sample: true },
          ]},
          memory_activity: { planes_active: 0, seam_state: 'dormant', rows: [] },
          doctrine_line_verbatim: 'Violations post as plainly as successes; every violation carries its disposition.',
          canon_ref: 'Canon §7.1',
        },
      }},
      { api_method: 'governEstateRulesRecord', mock: {
        status: 200,
        body: { S_rails: [], O_rules: [], E_engine_settings: [], D_registries: [], canon_ref: 'Canon §7.3' },
      }},
    ],
    // Buckets render SAMPLE badges INSIDE each row (per-row badge).
    sample_badge_testid_patterns: [
      /^govern-record-bucket-.*-row-sample-badge-/,
    ],
    row_testid_pattern: /^govern-record-bucket-.*-row-/,
  },
  {
    surface_id: 'govern_holds_surface',
    canon_ref: 'Canon §7.6 (UI-1-B)',
    Component: GovernHoldsPage,
    endpoints: [
      { api_method: 'governHolds', mock: {
        status: 200,
        body: {
          count: 1,
          holds: [{
            session_id: 's-sample-held-xyz', operator_id: 'op-x', door: 'train_a_model',
            verdict_ref: 'trcv-sample-held-xyz', proposed_spend_usd: 1450, auto_run_ceiling_usd: 1000,
            held_since_iso: 't', hold_reason_verbatim: 'exceeds ceiling', is_sample: true,
            reverse_route: '/use-data/wizard/s-sample-held-xyz',
          }],
          canon_ref: 'Canon §7.6',
        },
      }},
    ],
    sample_badge_testid_patterns: [
      /^govern-hold-sample-badge-/,
    ],
    row_testid_pattern: /^govern-hold-row-/,
  },
  // ---- UI-1-C · Connect surfaces  · REGISTER HERE ----
  // ---- UI-1-D · Registry/Prove surfaces · REGISTER HERE ----
  // ---- UI-1-E · Team surfaces · REGISTER HERE ----
];

jest.mock('../../apiClient', () => {
  const jestMock = {};
  return { __esModule: true, default: jestMock, api: jestMock };
});
import api from '../../apiClient';

function primeEndpoints(entry) {
  Object.keys(api).forEach((k) => { if (api[k]?.mockReset) api[k].mockReset(); });
  entry.endpoints.forEach(({ api_method, mock }) => {
    api[api_method] = jest.fn().mockResolvedValue(mock);
  });
}

describe('SYSTEMIC · sample_marking_systemic_gate · AS-U2 invariant across all fixture-capable surfaces', () => {
  it('registry is non-empty (regression: every new sub-cycle MUST register)', () => {
    expect(SAMPLE_MARKING_REGISTRY.length).toBeGreaterThanOrEqual(3);
  });

  SAMPLE_MARKING_REGISTRY.forEach((entry) => {
    it(`[${entry.surface_id}] every payload row with is_sample=true renders a SAMPLE badge in DOM (${entry.canon_ref})`, async () => {
      primeEndpoints(entry);
      const { Component } = entry;
      render(<MemoryRouter><Component /></MemoryRouter>);

      // Wait for the surface to reach a rendered state (any of its row testids appear).
      await waitFor(() => {
        const allTestIds = Array.from(document.querySelectorAll('[data-testid]')).map((n) => n.getAttribute('data-testid'));
        const anyRow = allTestIds.some((t) => entry.row_testid_pattern.test(t));
        expect(anyRow).toBe(true);
      }, { timeout: 4000 });

      // Enumerate every sample row in every mocked endpoint payload.
      const sampleRowIds = [];
      entry.endpoints.forEach(({ mock }) => {
        const walk = (v) => {
          if (v && typeof v === 'object') {
            if (Array.isArray(v)) v.forEach(walk);
            else {
              // A "row" is any object with is_sample and a stable id-ish key.
              if (v.is_sample === true) {
                const id = v.session_id || v.refusal_id || v.request_id;
                if (id) sampleRowIds.push(id);
                // Handle nested session envelope shape (Use Data pipeline).
                if (v.session && v.session.session_id) sampleRowIds.push(v.session.session_id);
              }
              Object.values(v).forEach(walk);
            }
          }
        };
        walk(mock.body);
      });
      // Dedupe.
      const uniqueSampleIds = Array.from(new Set(sampleRowIds));
      expect(uniqueSampleIds.length).toBeGreaterThan(0);  // sanity: mock has sample rows

      // For every sample-marked row id, assert at least one badge element renders
      // whose testid contains the id AND matches one of the surface's badge patterns.
      const allTestIds = Array.from(document.querySelectorAll('[data-testid]')).map((n) => n.getAttribute('data-testid'));
      uniqueSampleIds.forEach((rowId) => {
        const matchingBadges = allTestIds.filter((t) => {
          if (!t.includes(rowId)) return false;
          return entry.sample_badge_testid_patterns.some((rx) => rx.test(t));
        });
        if (matchingBadges.length === 0) {
          // Emit a diagnostic BEFORE failing so the failure message points at the
          // exact surface + rowId that lacks a badge.
          const diagnostic = `[${entry.surface_id}] sample row "${rowId}" is missing a SAMPLE badge in rendered DOM. ` +
            `Expected a testid matching one of ${entry.sample_badge_testid_patterns.map(String).join(' | ')} ` +
            `and containing "${rowId}". Present testids near this row: ` +
            allTestIds.filter((t) => t.includes(rowId)).join(' , ');
          throw new Error(diagnostic);
        }
      });
    });
  });
});
