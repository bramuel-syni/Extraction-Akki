// Phase 8-EXT — Jest cells (P8E-E1..P8E-E7 α applied).
import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import useEngineerScope from '../../hooks/useEngineerScope';
import OnboardingInvitePage from '../../pages/engineer/OnboardingInvitePage';

// UI Spec §5.4 verbatim strings (P8E-E6 α em-dash preserved U+2014).
const UI_SPEC_5_4_LINE_102 = 'Two roles, one console, identical screens, different scope — enforcement server-side, never view-layer filtering alone.';
const UI_SPEC_5_4_LINE_114 = 'External-scope denials are 403 access-control class ({reason, detail}) — never outcome=refused, never the refusal card.';

describe('Phase 8-EXT · useEngineerScope hook (P8E-E5 α + P8E-E2 α)', () => {
  test('external_engineer identity is scoped', () => {
    const { result } = renderHook(() => useEngineerScope({
      roles: ['external_engineer'], email: 'ext@example.com',
    }));
    expect(result.current.isExternal).toBe(true);
    expect(result.current.ownEmail).toBe('ext@example.com');
  });

  test('engineer (internal) identity has full scope; P8E-E5 α "engineer" retained', () => {
    const { result } = renderHook(() => useEngineerScope({
      roles: ['engineer'], email: 'int@example.com',
    }));
    expect(result.current.isExternal).toBe(false);
    // Scope filter passes any resource for internal.
    expect(result.current.scopeFilter({ grantee_email: 'other@example.com' })).toBe(true);
  });

  test('external + engineer combined: internal authority wins', () => {
    const { result } = renderHook(() => useEngineerScope({
      roles: ['external_engineer', 'engineer'], email: 'both@example.com',
    }));
    expect(result.current.isExternal).toBe(false);
  });

  test('scopeFilter narrows external to own resources only', () => {
    const { result } = renderHook(() => useEngineerScope({
      roles: ['external_engineer'], email: 'ext@example.com',
    }));
    expect(result.current.scopeFilter({ grantee_email: 'ext@example.com' })).toBe(true);
    expect(result.current.scopeFilter({ grantee_email: 'other@example.com' })).toBe(false);
  });
});

describe('Phase 8-EXT · OnboardingInvitePage (P8E-E3 α + P8E-E6 α)', () => {
  test('page mounts with binding-copy verbatim including em-dash U+2014', () => {
    render(<OnboardingInvitePage />);
    expect(screen.getByTestId('onboarding-invite-page')).toBeInTheDocument();
    expect(screen.getByTestId('onboarding-invite-title')).toHaveTextContent('Invite an external engineer');
    const specLine = screen.getByTestId('onboarding-invite-spec-line');
    expect(specLine).toHaveTextContent(UI_SPEC_5_4_LINE_114);
    // Anti-slop-gate: em-dash char code MUST be exactly U+2014.
    const emDashIdx = specLine.textContent.indexOf('\u2014');
    expect(emDashIdx).toBeGreaterThan(-1);
    expect(specLine.textContent.charCodeAt(emDashIdx)).toBe(0x2014);
    expect(specLine.textContent.charCodeAt(emDashIdx)).not.toBe(0x002D); // -
    expect(specLine.textContent.charCodeAt(emDashIdx)).not.toBe(0x2013); // –
  });

  test('submit button is disabled until email entered', () => {
    render(<OnboardingInvitePage />);
    expect(screen.getByTestId('onboarding-invite-submit')).toBeDisabled();
  });
});

describe('Phase 8-EXT · UI Spec §5.4 binding-copy verbatim (P8E-E6 α)', () => {
  test('§5.4 line 102 verbatim string carries em-dash U+2014', () => {
    expect(UI_SPEC_5_4_LINE_102).toContain('\u2014');
    const idx = UI_SPEC_5_4_LINE_102.indexOf('\u2014');
    expect(UI_SPEC_5_4_LINE_102.charCodeAt(idx)).toBe(0x2014);
  });

  test('§5.4 line 114 verbatim string carries em-dash U+2014', () => {
    expect(UI_SPEC_5_4_LINE_114).toContain('\u2014');
    expect(UI_SPEC_5_4_LINE_114.charCodeAt(UI_SPEC_5_4_LINE_114.indexOf('\u2014'))).toBe(0x2014);
  });
});
