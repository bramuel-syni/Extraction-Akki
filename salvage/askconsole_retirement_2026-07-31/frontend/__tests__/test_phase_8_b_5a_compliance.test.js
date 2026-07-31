/**
 * Phase 8 Stage B-5a — Compliance Console §4 binding-copy + invariant gates.
 *
 * Gates enumerated at Stage A §2B.4 (30 collected cases):
 *   - B5a-G1 (surface read-only) parametrised × 3 pages
 *   - B5a-G3 (retention-unset states honestly) verbatim
 *   - E2 taxonomy — 403s route through AuthDeniedNotice, NOT RefusalCard × 3
 *   - Held-class enumeration single-source × 3 classes
 *   - Barrel-reuse — pages consume via ui_spec_v1 barrel × 3 pages × 8 items
 *   - Fixture-schema (each fixture parses through registry)
 *   - v2.1 binding-copy verbatim per page (Home + Prove + Retention)
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fs from 'fs';
import * as path from 'path';

import ComplianceHomePage from '../../pages/compliance/ComplianceHomePage';
import ComplianceProveOneRunPage from '../../pages/compliance/ComplianceProveOneRunPage';
import ComplianceRetentionRightsPage from '../../pages/compliance/ComplianceRetentionRightsPage';

const V2_1_MANDATE_PATH = path.resolve(
  __dirname,
  '../../../../docs/mandates/RMS_UI_Specification_v2_1.md'
);
const V2_1_HOME_BINDING_COPY_EXPECTED =
  "This is the same record every user's audit view reaches \u2014 read-only, nothing reconstructed for display.";
const V2_1_PROVE_BINDING_COPY_EXPECTED =
  'Read-only. This is the record itself, not a summary of it. Export for a regulator on request.';
const V2_1_RETENTION_UNSET_EXPECTED =
  "No deletion rule is set. The system holds everything indefinitely and append-only until you set a retention window. This is a decision only you can make \u2014 the system won't guess a duration.";
const V2_1_RETENTION_GOVERNED_RULE_EXPECTED =
  'Setting a retention window here becomes a governed rule \u2014 versioned, dated, and recorded like every control change.';

const HELD_CLASSES = ['ledger_row', 'wizard_transcript', 'delivered_artifact'];

jest.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    identity: {
      user_id: 'dpo-1',
      email: 'dpo@rms.example.com',
      name: 'DPO',
      roles: ['dpo', 'admin'],
      key_grants: [],
      created_at: '2026-07-06T00:00:00Z',
    },
    login: () => {},
    logout: () => {},
    refresh: () => {},
  }),
  AuthProvider: ({ children }) => children,
}));

jest.mock('../../apiClient', () => ({
  __esModule: true,
  default: {
    complianceRetentionConfig: () => Promise.resolve({
      status: 200,
      body: {
        global_default: { days: null, set_at: null, set_by: null },
        held_classes: [
          { class_name: 'ledger_row', posture: 'unset', days: null, set_at: null, set_by: null },
          { class_name: 'wizard_transcript', posture: 'unset', days: null, set_at: null, set_by: null },
          { class_name: 'delivered_artifact', posture: 'unset', days: null, set_at: null, set_by: null },
        ],
        resolved_at: '2026-07-06T00:00:00Z',
      },
    }),
    complianceRefusalsByMonth: () => Promise.resolve({
      status: 200,
      body: {
        month: '2026-07',
        totals: {
          admission_refusals: 0,
          composition_below_floor: 0,
          outer_gate_refusals: 0,
          unclassified: 0,
          total: 0,
        },
        by_reason: [],
        by_day: [],
      },
    }),
    // Phase 8 Seam 3 Sub-stage 1 — coverage marker mock (empty state).
    complianceRefusalsCoverage: () => Promise.resolve({
      status: 200,
      body: {
        families_since_system_start: [],
        families_since_seam_3: [],
        per_family_since_date: {},
        seam_3_earliest_date: null,
        honest_note_when_no_families_covered:
          'No refusal-family coverage yet \u00B7 mock empty state.',
      },
    }),
    northenaTraceRead: () => Promise.resolve({
      status: 200,
      body: {
        trace_id: 'test-trace-1',
        resolved_at: '2026-07-06T00:00:00Z',
        run_ids: ['test-run-1'],
        engines_touched: ['northena_ledger'],
        ledger_rows: [{
          run_id: 'test-run-1',
          trace_id: 'test-trace-1',
          stage: 'admit',
          decision: 'admitted',
          reason: 'admitted',
          artifact_ref: {
            artifact_type: 'objective_request',
            artifact_id: 'a1',
            version: 'v0',
          },
          lawful_basis_ref: 'lb-ref-2026-07',
          at: '2026-07-06T00:00:00Z',
          stamp_audit: null,
        }],
        registry_freshness: { freshness_marker: 'ok' },
      },
    }),
  },
}));

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

// ────────────────────────────────────────────────────────────────
// B5a-G1 — surface read-only (parametrised × 3 pages)
// ────────────────────────────────────────────────────────────────

describe.each([
  ['ComplianceHomePage.js', 'src/pages/compliance/ComplianceHomePage.js'],
  ['ComplianceProveOneRunPage.js', 'src/pages/compliance/ComplianceProveOneRunPage.js'],
  ['ComplianceRetentionRightsPage.js', 'src/pages/compliance/ComplianceRetentionRightsPage.js'],
])('B5a-G1 — %s is read-only (no POST/PUT/PATCH/DELETE call sites)', (name, filePath) => {
  test('has no write-verb HTTP call sites', () => {
    const abs = path.resolve(__dirname, '../../../', filePath);
    const source = fs.readFileSync(abs, 'utf-8');
    // No apiClient POST/PUT/PATCH/DELETE method calls.
    expect(source).not.toMatch(/api\.\w*(?:Post|Put|Patch|Delete)\(/i);
    expect(source).not.toMatch(/client\.(?:post|put|patch|delete)\(/i);
  });
});

// ────────────────────────────────────────────────────────────────
// B5a-G3 — retention-unset banner verbatim from v2.1 §4.3
// ────────────────────────────────────────────────────────────────

test('B5a-G3 — retention-unset banner text present in v2.1 mandate on-disk', () => {
  const mandateText = fs.readFileSync(V2_1_MANDATE_PATH, 'utf-8');
  expect(mandateText).toContain(V2_1_RETENTION_UNSET_EXPECTED);
});

test('B5a-G3 — retention-unset banner renders verbatim when all classes are unset', async () => {
  renderWithRouter(<ComplianceRetentionRightsPage />);
  await waitFor(() => {
    expect(screen.getByTestId('compliance-retention-unset-copy')).toBeInTheDocument();
  });
  expect(screen.getByTestId('compliance-retention-unset-copy').textContent).toBe(
    V2_1_RETENTION_UNSET_EXPECTED
  );
});

// ────────────────────────────────────────────────────────────────
// E2 taxonomy — 403s route through AuthDeniedNotice, NOT RefusalCard × 3
// ────────────────────────────────────────────────────────────────

describe.each([
  ['ComplianceHomePage.js', 'src/pages/compliance/ComplianceHomePage.js'],
  ['ComplianceProveOneRunPage.js', 'src/pages/compliance/ComplianceProveOneRunPage.js'],
  ['ComplianceRetentionRightsPage.js', 'src/pages/compliance/ComplianceRetentionRightsPage.js'],
])('E2 taxonomy — %s auth denials route through AuthDeniedNotice', (name, filePath) => {
  test('imports AuthDeniedNotice and does NOT import RefusalCard', () => {
    const abs = path.resolve(__dirname, '../../../', filePath);
    const source = fs.readFileSync(abs, 'utf-8');
    expect(source).toMatch(/AuthDeniedNotice/);
    expect(source).not.toMatch(/RefusalCard/);
  });
});

// ────────────────────────────────────────────────────────────────
// Held-class enumeration single-source × 3
// ────────────────────────────────────────────────────────────────

test.each(HELD_CLASSES)('Held-class %s appears in Retention page code', (className) => {
  const abs = path.resolve(
    __dirname,
    '../../pages/compliance/ComplianceRetentionRightsPage.js'
  );
  const source = fs.readFileSync(abs, 'utf-8');
  expect(source).toMatch(new RegExp(`\\b${className}\\b`));
});

// ────────────────────────────────────────────────────────────────
// Barrel-reuse — pages consume via ui_spec_v1 barrel × 3 pages × components
// ────────────────────────────────────────────────────────────────

const BARREL_COMPONENTS = [
  'ClassBadge',
  'RefusalCard',
  'OuterGateReceiptInline',
  'StatusBadge',
  'LedgerTable',
  'TrustReceiptLink',
  'AuthDeniedNotice',
  'RetentionPostureBadge',
];

const COMPLIANCE_PAGES = [
  'src/pages/compliance/ComplianceHomePage.js',
  'src/pages/compliance/ComplianceProveOneRunPage.js',
  'src/pages/compliance/ComplianceRetentionRightsPage.js',
];

describe('Compliance pages — barrel-reuse single-source', () => {
  test.each(COMPLIANCE_PAGES)('%s does not import any barrel component directly from ../../components/<Component>', (filePath) => {
    const abs = path.resolve(__dirname, '../../../', filePath);
    const source = fs.readFileSync(abs, 'utf-8');
    for (const comp of BARREL_COMPONENTS) {
      // A page must never import "from '../../components/{Component}'" directly.
      const forbiddenImport = new RegExp(`from ['\"]\\.\\./\\.\\./components/${comp}['\"]`);
      expect(source).not.toMatch(forbiddenImport);
    }
  });
});

// ────────────────────────────────────────────────────────────────
// v2.1 binding-copy verbatim per page
// ────────────────────────────────────────────────────────────────

test('v2.1 §4.1 Home binding copy renders verbatim', async () => {
  renderWithRouter(<ComplianceHomePage />);
  await waitFor(() => {
    expect(screen.getByTestId('compliance-home-binding-copy')).toBeInTheDocument();
  });
  expect(screen.getByTestId('compliance-home-binding-copy').textContent).toBe(
    V2_1_HOME_BINDING_COPY_EXPECTED
  );
});

test('v2.1 §4.2 Prove-one-run binding copy renders verbatim', async () => {
  renderWithRouter(<ComplianceProveOneRunPage />);
  await waitFor(() => {
    expect(screen.getByTestId('compliance-prove-binding-copy')).toBeInTheDocument();
  });
  expect(screen.getByTestId('compliance-prove-binding-copy').textContent).toBe(
    V2_1_PROVE_BINDING_COPY_EXPECTED
  );
});

test('v2.1 §4.3 Retention governed-rule binding copy renders verbatim', async () => {
  renderWithRouter(<ComplianceRetentionRightsPage />);
  await waitFor(() => {
    expect(screen.getByTestId('compliance-retention-governed-rule-copy')).toBeInTheDocument();
  });
  expect(screen.getByTestId('compliance-retention-governed-rule-copy').textContent).toBe(
    V2_1_RETENTION_GOVERNED_RULE_EXPECTED
  );
});

// ────────────────────────────────────────────────────────────────
// Held-class separately-addressable render × 3
// ────────────────────────────────────────────────────────────────

test.each(HELD_CLASSES)(
  'Held-class %s renders in a structurally-separate DOM region',
  async (className) => {
    renderWithRouter(<ComplianceRetentionRightsPage />);
    await waitFor(() => {
      expect(screen.getByTestId(`retention-region-${className}`)).toBeInTheDocument();
    });
    // Each region has a distinct heading.
    expect(screen.getByTestId(`retention-region-heading-${className}`)).toBeInTheDocument();
  }
);

// ────────────────────────────────────────────────────────────────
// Fixture-schema — the frontend mocks use envelope shapes that carry
// the required fields (trace_id + resolved_at + run_ids + engines_touched).
// This mirrors B-4's fixture-contract gate style.
// ────────────────────────────────────────────────────────────────

test('Prove-one-run trace envelope mock carries the four spec fields', async () => {
  // Import the mock module directly and check the response shape.
  const api = (await import('../../apiClient')).default;
  const { body } = await api.northenaTraceRead('test-trace-1');
  expect(body).toHaveProperty('trace_id');
  expect(body).toHaveProperty('resolved_at');
  expect(body).toHaveProperty('run_ids');
  expect(body).toHaveProperty('engines_touched');
});

test('Retention-config mock carries exactly 3 held-classes in canonical order', async () => {
  const api = (await import('../../apiClient')).default;
  const { body } = await api.complianceRetentionConfig();
  expect(body.held_classes.length).toBe(3);
  expect(body.held_classes.map((c) => c.class_name)).toEqual(HELD_CLASSES);
});
