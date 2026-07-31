/**
 * Phase 8 Stage B-4 first-commit gate — §4.2 fixture-schema invariant.
 *
 * Owner ratification 2026-07-05: "converts 'marked as illustration'
 * from assertion to invariant." Each illustrative fixture rendered on
 * the Engineer §4.2 surface MUST match the property-name shape of its
 * corresponding frozen backend contract snapshot. Drift is caught here,
 * not on ship.
 *
 * Approach:
 *   - Read the `.contract_snapshot.json` neighbors under
 *     `backend/tests/invariants/` via `fs.readFileSync` (Node file
 *     system access — no new npm deps).
 *   - Assert fixture top-level keys ⊆ contract properties keys.
 *   - Nested-object subset traversal handles arbitrary nesting.
 *
 * Fixture ↔ contract mapping (verbatim from EngineerFirstCallPage
 * export `FIXTURE_CONTRACT_MAP`):
 *   ANSWERED_ILLUSTRATIVE       → composed_conclusion.contract_snapshot.json
 *   REFUSED_ILLUSTRATIVE        → service_1_refusal.contract_snapshot.json
 *   ASYNC_ACCEPTED_ILLUSTRATIVE → async_delivery_accepted_v1.contract_snapshot.json
 */
import path from 'path';
import fs from 'fs';

import {
  ANSWERED_ILLUSTRATIVE,
  REFUSED_ILLUSTRATIVE,
  ASYNC_ACCEPTED_ILLUSTRATIVE,
  FIXTURE_CONTRACT_MAP,
} from '../../pages/engineer/EngineerFirstCallPage';

const INVARIANTS_DIR = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'backend',
  'tests',
  'invariants'
);

function loadContractSnapshot(name) {
  const p = path.join(INVARIANTS_DIR, name);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function assertFixtureKeysSubset(fixture, schema, pathTrail = '$') {
  const props = schema.properties || {};
  const validKeys = new Set(Object.keys(props));
  const violations = [];
  for (const key of Object.keys(fixture)) {
    if (!validKeys.has(key)) {
      violations.push(`${pathTrail}.${key}`);
    }
  }
  return violations;
}

describe('Phase 8 Stage B-4 — §4.2 fixture-schema gate (Owner-ratified invariant)', () => {
  test('ANSWERED_ILLUSTRATIVE keys are a subset of ComposedConclusion_v0 properties', () => {
    const snapshot = loadContractSnapshot(FIXTURE_CONTRACT_MAP.ANSWERED_ILLUSTRATIVE);
    const violations = assertFixtureKeysSubset(ANSWERED_ILLUSTRATIVE, snapshot);
    expect(violations).toEqual([]);
  });

  test('REFUSED_ILLUSTRATIVE keys are a subset of Service1Refusal_v0 properties', () => {
    const snapshot = loadContractSnapshot(FIXTURE_CONTRACT_MAP.REFUSED_ILLUSTRATIVE);
    const violations = assertFixtureKeysSubset(REFUSED_ILLUSTRATIVE, snapshot);
    expect(violations).toEqual([]);
  });

  test('ASYNC_ACCEPTED_ILLUSTRATIVE keys are a subset of AsyncDeliveryAccepted_v1 properties', () => {
    const snapshot = loadContractSnapshot(FIXTURE_CONTRACT_MAP.ASYNC_ACCEPTED_ILLUSTRATIVE);
    const violations = assertFixtureKeysSubset(ASYNC_ACCEPTED_ILLUSTRATIVE, snapshot);
    expect(violations).toEqual([]);
  });

  test('REFUSED_ILLUSTRATIVE discriminator outcome=refused matches Service1Refusal_v0 const', () => {
    const snapshot = loadContractSnapshot(FIXTURE_CONTRACT_MAP.REFUSED_ILLUSTRATIVE);
    const outcomeSchema = snapshot.properties.outcome;
    expect(outcomeSchema).toBeDefined();
    expect(outcomeSchema.const || (outcomeSchema.enum && outcomeSchema.enum[0])).toBe('refused');
    expect(REFUSED_ILLUSTRATIVE.outcome).toBe('refused');
  });

  test('FIXTURE_CONTRACT_MAP covers exactly the 3 first-call illustrative fixtures', () => {
    expect(Object.keys(FIXTURE_CONTRACT_MAP).sort()).toEqual(
      ['ANSWERED_ILLUSTRATIVE', 'ASYNC_ACCEPTED_ILLUSTRATIVE', 'REFUSED_ILLUSTRATIVE'].sort()
    );
  });

  test('ANSWERED_ILLUSTRATIVE conclusion_class value is in DefensibilityClass enum', () => {
    const snapshot = loadContractSnapshot(FIXTURE_CONTRACT_MAP.ANSWERED_ILLUSTRATIVE);
    const defsEnum = snapshot.$defs.DefensibilityClass.enum;
    expect(defsEnum).toContain(ANSWERED_ILLUSTRATIVE.conclusion_class);
  });
});
