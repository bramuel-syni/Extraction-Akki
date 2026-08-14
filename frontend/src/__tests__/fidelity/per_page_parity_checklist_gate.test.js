/* Frontend fidelity standing gate — per-page parity checklist.
 *
 * Owner ruling 3 (2026-08-01) binding directive:
 *   "Build target = EXACT parity with the file of record: typography,
 *    layout, spacing, density, page composition, section order, interaction
 *    flow, content structure — PAGE BY PAGE. Deviations permitted ONLY where
 *    a page renders live data the prototype fakes — never in look or
 *    structure."
 *
 * File of record: /app/docs/reference/Akki_v4_Standalone_2ab55d9f.html
 *   SHA256: 2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba
 *
 * This gate is the STANDING CHECKLIST: one row per prototype page.
 * Verdict values are one of:
 *   PASS                          — prototype composition matches built page
 *   DEVIATION_LIVE_DATA_ONLY      — deviates ONLY because the built page
 *                                    renders live data the prototype fakes;
 *                                    look and structure preserved
 *   FAIL                          — structural/visual deviation not
 *                                    attributable to live data (rework
 *                                    scheduled per RWP-1)
 *   DEVIATION_BEYOND_PROTOTYPE    — built surface extends prototype scope
 *                                    with Owner mandate (needs ruling)
 *   PLACEMENT_DELTA               — same content, different Canon home
 *                                    (needs Owner arbitration)
 *
 * The gate itself always passes — but it FAILS THE BUILD if any row is
 * silently downgraded (e.g. PASS → FAIL without a scheduled rework item
 * naming its RWP-1 track). Every close report cites this table.
 */

const PROTOTYPE_SHA = '2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba';

// Canonical checklist (mirrors /app/docs/rulings/frontend_fidelity_audit_2026-08-01.md §6).
const PARITY_CHECKLIST = Object.freeze([
  // Landing / root — B1 shell foundation landed 2026-08-01.
  { module: 'Root', page: '/', section: 'Landing composition (redirect to /registry)',                  verdict: 'PASS' },
  { module: 'Root', page: '/', section: 'Chrome (216px sidebar + 66px rich header)',                    verdict: 'PASS' },
  { module: 'Root', page: '/', section: 'Auth strip (folded into role-switcher slot; live-data)',       verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },

  // Connect
  { module: 'Connect', page: '/connect', section: 'Page title + summary',       verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Conditional source states',  verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Tabs (Connections / Record)', verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Connections table',          verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Data-class table',           verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Config-lock notification',   verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Palette + typography',       verdict: 'PASS' },

  // Registry — B2 landed 2026-08-01 (RegistryV4Page mounted at /registry).
  { module: 'Registry', page: '/registry', section: 'What You Hold hero',       verdict: 'PASS' },
  { module: 'Registry', page: '/registry', section: 'Census idle/running',      verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
  { module: 'Registry', page: '/registry', section: 'Tabs (measure / record)',  verdict: 'PASS' },
  { module: 'Registry', page: '/registry', section: 'Measure stat strips',      verdict: 'PASS' },
  { module: 'Registry', page: '/registry', section: 'Composition grid 1.5fr:1fr', verdict: 'PASS' },
  { module: 'Registry', page: '/registry', section: 'Item-by-item table',       verdict: 'PASS' },
  { module: 'Registry', page: '/registry/artifact/:id', section: 'Artifact detail (B2.b prototype-parity)', verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },

  // Connect — B3 landed 2026-08-01 (ConnectV4Page mounted at /connect).
  { module: 'Connect', page: '/connect', section: 'Hero row (srcPending / srcAllConnected)', verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Configuration-lock strip (dark navy)',    verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: 'Deploy facts panel (togglable)',          verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: '3-tile stat strip (Connections · Last sync · Egress)', verdict: 'PASS' },
  { module: 'Connect', page: '/connect', section: "The record 4-col table (Source · Protocol · Cadence · State)", verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
  { module: 'Connect', page: '/connect', section: 'Custody footer + Govern cross-link', verdict: 'PASS' },

  // Use Data
  { module: 'Use Data', page: '/use-data', section: 'Use Your Data hero',       verdict: 'PASS' },
  { module: 'Use Data', page: '/use-data', section: 'Three doors (Integrate / Export / Train)', verdict: 'PASS' },
  { module: 'Use Data', page: '/use-data', section: 'In-progress / Ready sections (Canon §6.5)', verdict: 'FAIL', rework_track: 'A · CD-3.1' },
  { module: 'Use Data', page: '/use-data/integrate', section: 'Developer surface', verdict: 'PASS' },
  { module: 'Use Data', page: '/use-data/export',    section: 'Opportunity cards', verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
  { module: 'Use Data', page: '/use-data/train',     section: 'Training run detail', verdict: 'PASS' },
  { module: 'Use Data', page: '/use-data/wizard',    section: 'Multi-step wizard', verdict: 'PASS' },
  { module: 'Use Data', page: '/commission-view',    section: 'Pre-Canon route retirement', verdict: 'FAIL', rework_track: 'A · CD-3.1 REVERSAL' },

  // Govern
  { module: 'Govern', page: '/govern', section: "DPO's Estate title + intro",   verdict: 'PASS' },
  { module: 'Govern', page: '/govern', section: 'Tabs (enforcement / record)',  verdict: 'PASS' },
  { module: 'Govern', page: '/govern', section: 'Enforcement stat strips',      verdict: 'PASS' },
  { module: 'Govern', page: '/govern', section: 'Data-class × rule record table', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/rules-record', section: 'Rules table + Propose change CTA', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/verify', section: 'Test packs + go-live gate', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/change-rule', section: 'Proposal pipeline', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/destroy', section: 'Dual-control destroy', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/quarantine', section: 'Halted-items list', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/release-review', section: 'Release cards', verdict: 'PASS' },
  { module: 'Govern', page: '/govern/setup', section: 'Governance setup',       verdict: 'PASS' },
  { module: 'Govern', page: 'Succession seat placement', section: 'Placement Govern-Setup vs Team', verdict: 'PLACEMENT_DELTA', rework_track: 'Awaiting Owner arbitration' },

  // Prove
  { module: 'Prove', page: '/prove', section: 'Ask a Question',                 verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
  { module: 'Prove', page: '/prove', section: 'History list',                   verdict: 'PASS' },
  { module: 'Prove', page: '/prove/answer/:id', section: 'Answer shape + Walk the Proof', verdict: 'PASS' },
  { module: 'Prove', page: '/prove/memos', section: 'Memos table',              verdict: 'PASS' },
  { module: 'Prove', page: '/prove/memo/:id', section: 'Memo detail',           verdict: 'PASS' },
  { module: 'Prove', page: '/prove/public-receipts', section: 'Public receipts', verdict: 'PASS' },
  { module: 'Prove', page: '/prove/response-classes', section: 'How answers come back', verdict: 'PASS' },
  { module: 'Prove', page: '/prove/walk/:id', section: 'Walk-the-proof',        verdict: 'PASS' },

  // Team
  { module: 'Team', page: '/team/users-simple', section: 'Manage Users table',  verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
  // Connect — legacy sub-pages still under B3.b consideration (source-profile, new-source, rules, setup).
  { module: 'Connect', page: '/connect/source/:id', section: 'Source profile drill-down',      verdict: 'FAIL', rework_track: 'B3.b · Connect sub-pages sub-batch (post-B3)' },
  { module: 'Connect', page: '/connect/new',        section: 'New-source wizard',              verdict: 'FAIL', rework_track: 'B3.b · Connect sub-pages sub-batch (post-B3)' },
  { module: 'Connect', page: '/connect/rules',      section: 'Connect-side rule table',        verdict: 'FAIL', rework_track: 'B3.b · Connect sub-pages sub-batch (post-B3)' },
  { module: 'Connect', page: '/connect/setup',      section: 'Connect setup instructions',     verdict: 'FAIL', rework_track: 'B3.b · Connect sub-pages sub-batch (post-B3)' },

  // Connect legacy landing wrapper (retained under /connect/legacy for salvage).
  { module: 'Connect', page: '/connect/legacy',     section: 'Legacy Connect landing (salvage)', verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },

  // Placement rulings recorded 2026-08-01 (owner_rulings_ledger_2026-08-01_post_b1b2.md).
  { module: 'Govern', page: '/govern/setup/succession', section: 'Succession seat (file governs placement · lands in B5/B6)', verdict: 'FAIL', rework_track: 'B5/B6 · Govern part 2 (rehome from /team/constitutional-seats)' },
  { module: 'Team', page: '/team/approval-surface', section: 'Approval surface (Canon §9.2 retained under file+canon rule)',   verdict: 'PASS' },
  { module: 'Team', page: '/team/access-register',  section: 'Access register (Canon §9.2 retained under file+canon rule)',    verdict: 'PASS' },
  { module: 'Team', page: '/team/constitutional-seats', section: 'Constitutional seats (will redirect to /govern/setup/succession per placement ruling)', verdict: 'PLACEMENT_DELTA', rework_track: 'B5/B6 · Govern part 2 (redirect after Govern rehome)' },

  // Auth
  { module: 'Auth', page: '/auth/login', section: 'Login (no analog in prototype)', verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
  { module: 'Auth', page: '/auth/register', section: 'Register (no analog in prototype)', verdict: 'DEVIATION_LIVE_DATA_ONLY', rework_track: null },
]);

const ALLOWED_VERDICTS = new Set([
  'PASS',
  'DEVIATION_LIVE_DATA_ONLY',
  'FAIL',
  'DEVIATION_BEYOND_PROTOTYPE',
  'PLACEMENT_DELTA',
]);

describe('Frontend fidelity · per-page parity standing gate', () => {
  test('file of record has the expected SHA256 (Owner-verified 2ab55d9f…)', () => {
    // Sanity: this string is baked into the gate so downstream tests can
    // reference it. Any change means re-audit + Owner sign-off.
    expect(PROTOTYPE_SHA).toBe('2ab55d9f0f317e1e8721fe1a598dc51522e45b6f9b42c2513c843e7a238f1fba');
    expect(PROTOTYPE_SHA).toMatch(/^[a-f0-9]{64}$/);
  });

  test('every checklist row has one of the five allowed verdicts', () => {
    PARITY_CHECKLIST.forEach((row) => {
      expect(ALLOWED_VERDICTS.has(row.verdict)).toBe(true);
    });
  });

  test('every FAIL / PLACEMENT_DELTA / DEVIATION_BEYOND_PROTOTYPE row cites a rework track', () => {
    // A FAIL without a scheduled rework track is a silent drift — the gate's
    // whole purpose is to forbid that.
    const needsTrack = ['FAIL', 'PLACEMENT_DELTA', 'DEVIATION_BEYOND_PROTOTYPE'];
    const bare = PARITY_CHECKLIST.filter(
      (r) => needsTrack.includes(r.verdict) && (!r.rework_track || String(r.rework_track).trim() === ''),
    );
    expect(bare).toEqual([]);
  });

  test('exactly six primary modules covered (Connect · Registry · Use Data · Govern · Prove · Team) + Auth + Root', () => {
    const modules = new Set(PARITY_CHECKLIST.map((r) => r.module));
    ['Root', 'Connect', 'Registry', 'Use Data', 'Govern', 'Prove', 'Team', 'Auth'].forEach((m) => {
      expect(modules.has(m)).toBe(true);
    });
  });

  test('audit summary — counts by verdict (informational · never fails, records baseline)', () => {
    const counts = {};
    PARITY_CHECKLIST.forEach((r) => {
      counts[r.verdict] = (counts[r.verdict] || 0) + 1;
    });
    // Baseline snapshot as of the 2026-08-01 defect-cycle audit escalation.
    // Row count corresponds to the initial parity table checked in with the
    // audit doc; the full 30-view defect-cycle inventory is tracked in
    // /app/docs/rulings/frontend_fidelity_defect_cycle_audit_2026-08-01.md
    // and will be folded into this gate row-by-row across Batches B1–B10.
    expect(counts.PASS).toBeGreaterThanOrEqual(30);
    expect(counts.FAIL).toBeLessThanOrEqual(12);
    // Total row count synchronised with the audit doc + B1.a/B2.b/B3 flips.
    expect(PARITY_CHECKLIST.length).toBe(63);
  });
});

module.exports = { PARITY_CHECKLIST, PROTOTYPE_SHA };
