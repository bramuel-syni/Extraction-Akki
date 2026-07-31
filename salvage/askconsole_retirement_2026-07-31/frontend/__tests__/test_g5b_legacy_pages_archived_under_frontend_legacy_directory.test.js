/**
 * G-10/G-7 PROMOTE invariant — 2026-07-14 Owner ruling
 * (docs/rulings/g10_g7_promote_2026-07-14.md).
 *
 * Predecessor: Phase 8a-lite G5b archival gate (2026-07-04) asserted the
 * eight legacy G5b pages lived under `src/legacy/pages/`. That gate
 * closed with the promotion: TraceReceiptPage lifts out of /legacy/*
 * and mounts at public `/trace` and `/trace/:traceId` (G-7 SolvaTrace
 * three-lens rendering surface); the remaining seven pages retire
 * whole with their nested `<Route path="legacy">` block and the
 * AppShell chrome.
 *
 * This gate is the mechanical successor: asserts (a) the entire
 * `src/legacy/` tree is gone, (b) TraceReceiptPage now lives at
 * `src/pages/trace/`, (c) App.js imports it from that path and
 * wires the public route.
 *
 * Framework: Node fs (static grep) — legitimate for code-hygiene checks.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', '..');

describe('G-10/G-7 PROMOTE: TraceReceiptPage at src/pages/trace/, legacy tree retired', () => {
  test('src/legacy/ directory no longer exists', () => {
    const legacyDir = path.join(SRC_DIR, 'legacy');
    expect(fs.existsSync(legacyDir)).toBe(false);
  });

  test('src/components/AppShell.js is retired (only used by legacy /legacy/* shell)', () => {
    const appShellPath = path.join(SRC_DIR, 'components', 'AppShell.js');
    expect(fs.existsSync(appShellPath)).toBe(false);
  });

  test('TraceReceiptPage.js lives at src/pages/trace/TraceReceiptPage.js', () => {
    const promotedPath = path.join(SRC_DIR, 'pages', 'trace', 'TraceReceiptPage.js');
    expect(fs.existsSync(promotedPath)).toBe(true);
  });

  test('src/App.js imports TraceReceiptPage from ./pages/trace/', () => {
    const appPath = path.join(SRC_DIR, 'App.js');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toMatch(
      /from\s+['"]\.\/pages\/trace\/TraceReceiptPage['"]/,
    );
    // Never re-imports from the retired legacy location.
    expect(content).not.toMatch(/from\s+['"]\.\/legacy\/pages\//);
  });

  test('src/App.js declares the public /trace routes', () => {
    const appPath = path.join(SRC_DIR, 'App.js');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).toMatch(
      /<Route\s+path=["']trace["']\s+element=\{<TraceReceiptPage\s*\/>\}/,
    );
    expect(content).toMatch(
      /<Route\s+path=["']trace\/:traceId["']\s+element=\{<TraceReceiptPage\s*\/>\}/,
    );
  });

  test('src/App.js no longer declares the retired <Route path="legacy"> block', () => {
    const appPath = path.join(SRC_DIR, 'App.js');
    const content = fs.readFileSync(appPath, 'utf8');
    expect(content).not.toMatch(/path=["']legacy["']/);
  });

  test('AskConsolePage.js links Trust Receipt to /trace/, not /legacy/trace/', () => {
    const askPath = path.join(SRC_DIR, 'pages', 'AskConsolePage.js');
    const content = fs.readFileSync(askPath, 'utf8');
    expect(content).not.toMatch(/\/legacy\/trace\//);
    expect(content).toMatch(/\/trace\/\$\{[^}]*trace_id[^}]*\}/);
  });
});
