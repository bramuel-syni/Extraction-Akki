/* Phase 3 sub-cycle 1 — Jest gate roster (Owner ruling 2026-08-01).
 *
 * Backend integration tests (HTTP) live in pytest; these tests focus on:
 *   • Ratified copy renders VERBATIM (byte-identical to Ruling 4 strings).
 *   • Four response classes render with distinct visual treatments.
 *   • Marked-open-slot renders NEVER filled with invented copy.
 *   • Design-law gates on Connect + Commission View surfaces.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

import {
  REFUSAL_ACTION_TRIPLET,
  FROZEN_IS_IMMUTABLE,
  UNSET_RETENTION_BANNER,
} from '../../design/ratified_copy';
import { MarkedOpenSlot } from '../../design/MarkedOpenSlot';
import {
  GovernedRefusalCard,
  AccessControlDeniedPanel,
  ValidationErrorPanel,
  InfrastructureFaultPanel,
} from '../../design/ResponseClassPanel';
import { AKKI_V4_PALETTE, RESPONSE_CLASS, classifyResponse } from '../../design/akkiv4_design_system';

/* =============================================================================
   Ratified copy — VERBATIM tests.
   ============================================================================= */

describe('Phase-3-SubC1 · ratified binding copy verbatim (Ruling 4)', () => {
  it('refusal action triplet is three exact strings (byte-identical to Ruling 4)', () => {
    expect(REFUSAL_ACTION_TRIPLET).toEqual([
      'Accept as recorded statement',
      'Narrow the objective',
      'Lower the standard',
    ]);
    // The tuple is frozen (immutable) so an accidental mutation raises.
    expect(Object.isFrozen(REFUSAL_ACTION_TRIPLET)).toBe(true);
  });

  it('"Frozen is immutable." string is byte-identical', () => {
    expect(FROZEN_IS_IMMUTABLE).toBe('Frozen is immutable.');
  });

  it('unset-retention banner string is byte-identical', () => {
    expect(UNSET_RETENTION_BANNER).toBe(
      'the system holds everything indefinitely until you set a window ' +
      '— a decision only you can make'
    );
  });
});

/* =============================================================================
   GovernedRefusalCard — verbatim action triplet CTAs.
   ============================================================================= */

describe('Phase-3-SubC1 · GovernedRefusalCard renders action triplet verbatim', () => {
  it('renders the three action buttons with verbatim Ruling 4 labels', () => {
    render(
      <GovernedRefusalCard
        reason="coverage_gap"
        detail="Sample too small for stated tolerance."
        traceId="trace-t1"
        onAccept={() => {}}
        onNarrow={() => {}}
        onLower={() => {}}
      />
    );
    // Each button has a unique test-id and the verbatim label.
    expect(screen.getByTestId('refusal-action-accept'))
      .toHaveTextContent('Accept as recorded statement');
    expect(screen.getByTestId('refusal-action-narrow'))
      .toHaveTextContent('Narrow the objective');
    expect(screen.getByTestId('refusal-action-lower'))
      .toHaveTextContent('Lower the standard');
    // Class-with-claim rule: "Refused · <reason>" in headline position.
    expect(screen.getByTestId('refusal-class-with-claim')).toBeInTheDocument();
    // One trace thread — trace_id in the audit rail.
    expect(screen.getByTestId('response-governed-refusal-trace-id'))
      .toHaveTextContent('trace-t1');
  });

  it('renders in the answer position (not as a modal or toast)', () => {
    render(<GovernedRefusalCard reason="r" detail="d" onAccept={() => {}} onNarrow={() => {}} onLower={() => {}} />);
    const el = screen.getByTestId('response-governed-refusal');
    // No `role="dialog"` — refusal is NOT a modal.
    expect(el.getAttribute('role')).toBe('alert');
    // Rendered inline in the DOM tree — no `position: fixed` (not a toast).
    const style = window.getComputedStyle(el);
    expect(style.position).not.toBe('fixed');
  });
});

/* =============================================================================
   Four response classes — distinct visual treatments.
   ============================================================================= */

describe('Phase-3-SubC1 · four response classes never conflated', () => {
  it('each class has a distinct accent color (Owner cycle-3 design law)', () => {
    const uniqueColors = new Set([
      RESPONSE_CLASS.GOVERNED_REFUSAL.accentColor,
      RESPONSE_CLASS.VALIDATION_ERROR.accentColor,
      RESPONSE_CLASS.INFRASTRUCTURE_FAULT.accentColor,
      RESPONSE_CLASS.ACCESS_CONTROL_DENIAL.accentColor,
    ]);
    expect(uniqueColors.size).toBe(4);
  });

  it('each class has a distinct test-id', () => {
    render(
      <>
        <GovernedRefusalCard reason="r" detail="d" onAccept={() => {}} onNarrow={() => {}} onLower={() => {}} />
        <AccessControlDeniedPanel reason="auth_missing" detail="Please sign in" />
        <ValidationErrorPanel headline="Bad shape" detail="Field X is required" fields={['field_x']} />
        <InfrastructureFaultPanel headline="503" detail="Retry shortly" />
      </>
    );
    expect(screen.getByTestId('response-governed-refusal')).toBeInTheDocument();
    expect(screen.getByTestId('response-access-control-denial')).toBeInTheDocument();
    expect(screen.getByTestId('response-validation-error')).toBeInTheDocument();
    expect(screen.getByTestId('response-infrastructure-fault')).toBeInTheDocument();
  });

  it('classifyResponse correctly maps HTTP status + body to response class', () => {
    expect(classifyResponse(401, {reason: 'auth_missing'})).toBe(RESPONSE_CLASS.ACCESS_CONTROL_DENIAL);
    expect(classifyResponse(403, {reason: 'auth_scope_insufficient'})).toBe(RESPONSE_CLASS.ACCESS_CONTROL_DENIAL);
    expect(classifyResponse(400, {reason: 'malformed_payload'})).toBe(RESPONSE_CLASS.VALIDATION_ERROR);
    expect(classifyResponse(500, {})).toBe(RESPONSE_CLASS.INFRASTRUCTURE_FAULT);
    expect(classifyResponse(422, {outcome: 'refused', reason: 'x'})).toBe(RESPONSE_CLASS.GOVERNED_REFUSAL);
  });

  it('auth-denial envelope carries NO outcome key (Owner E2 taxonomy)', () => {
    // This is a static structural attest: AccessControlDeniedPanel takes
    // {reason, detail} — never `outcome`. If the component signature ever
    // grows an `outcome` prop, this test must be re-ruled by the Owner.
    render(<AccessControlDeniedPanel reason="auth_missing" detail="d" />);
    // The panel's test-id maps to access_control_denial, not governed_refusal.
    expect(screen.queryByTestId('response-governed-refusal')).toBeNull();
    expect(screen.getByTestId('response-access-control-denial')).toBeInTheDocument();
  });
});

/* =============================================================================
   MarkedOpenSlot — never filled with invented copy.
   ============================================================================= */

describe('Phase-3-SubC1 · marked-open-slot pattern (Ruling 4)', () => {
  it('renders "— open —" marker + slot name — never invented copy', () => {
    render(<MarkedOpenSlot slotName="test_slot" />);
    const el = screen.getByTestId('open-copy-slot-test_slot');
    expect(el).toHaveTextContent(/— open —/);
    expect(el).toHaveTextContent(/test_slot/);
  });

  it('the marker is visually distinct (dashed border, sage color)', () => {
    render(<MarkedOpenSlot slotName="s1" />);
    const el = screen.getByTestId('open-copy-slot-s1');
    const style = el.getAttribute('style') || '';
    // The style attribute string includes the sage palette color.
    expect(style).toMatch(/dashed/);
    expect(style).toMatch(/rgb\(138, 143, 124\)/);  // AKKI_V4_PALETTE.sage
  });
});

/* =============================================================================
   Palette + typography attest.
   ============================================================================= */

describe('Phase-3-SubC1 · Akki v4 palette + typography canonical', () => {
  it('palette hex codes match Owner cycle-3 design law verbatim', () => {
    expect(AKKI_V4_PALETTE.cream).toBe('#F3F2E9');
    expect(AKKI_V4_PALETTE.navy).toBe('#16304F');
    expect(AKKI_V4_PALETTE.oxblood).toBe('#7E3038');
    expect(AKKI_V4_PALETTE.sage).toBe('#8A8F7C');
    expect(AKKI_V4_PALETTE.amber).toBe('#B07C2A');
  });

  it('palette object is frozen (Ruling 4 anti-mutation)', () => {
    expect(Object.isFrozen(AKKI_V4_PALETTE)).toBe(true);
  });
});
