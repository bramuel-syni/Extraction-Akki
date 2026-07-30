# Test Result — RMS Intelligence System / Akki OS

## Original user problem statement

Owner dispatch (2026-07-30): P1 code work per `docs/mandates/AKKI_OS_BUILD_DISPATCH_v1.md` §3 — Custody Closure & Honest Startup. 32 gates across P1-R1..R7 (de-id catalogue + multilingual + fail-closed; AST egress gate + runtime firewall; bypass parameter removal; production-scoped hard-fail startup; trust_receipt_v1 sibling contract with masking_tier + positive allowlist; token-preservation clause leads; .env/admin-seed/mobile/tier_lock hygiene).

Owner conditions:
- (i) masking_tier lands as NEW trust-receipt sibling contract (never a field on the existing frozen shape). Parity 31→32 via seal event.
- (ii) masking_tier added to a positive allowlist registry (governed change, nothing appears by default).
- Scoping: hard-fail startup is production-scoped only; dev/sandbox echo mode stays functional.

## Testing Protocol (from system prompt)

- MUST test BACKEND first using `deep_testing_backend_v2`.
- After backend testing done, STOP to ask user whether to test frontend.
- ONLY test frontend if user asks to test frontend.
- NEVER invoke `deep_testing_frontend_v2` without explicit user permission.
- MUST READ + UPDATE this file before invoking testing agents.
- NEVER fix something already fixed by testing agents.

## Incorporate User Feedback

The user's most recent feedback (2026-07-30, post-P1-close):
- **VERIFIED PASSING (Owner-independent)**: `/api/health` OK · parity 32/32 · auth API correct (login → JWT + 6 roles; wrong password → `{"reason":"auth_missing"}` with no `outcome` key — correct shape) · Ask Console renders · `/api/service_1/v2/dispatch` returns structured 202 AsyncDeliveryAccepted_v0.
- **BLOCKER**: served frontend bundle contained `const BACKEND_URL = undefined;` → axios baseURL was `"undefined/api"` → all UI-side API calls malformed → UI login showed "Something went wrong."
- **User instruction**: apply the resilient-fallback fix, restart frontend, smoke-test UI login and Ask Console via preview URL, then invoke testing_agent to verify.

## Fix applied (2026-07-30 · P1 addendum)

- 5 source files: `apiClient.js`, `ComplianceRulebookWritePage.js`, `OnboardingInvitePage.jsx`, `SampleGroundingContext.jsx`, `CounterSignBanner.jsx` — all now use `process.env.REACT_APP_BACKEND_URL || ''` fallback pattern (empty string = same-origin, relative /api).
- `/app/frontend/.env` — `REACT_APP_BACKEND_URL=https://governance-scan-3.preview.emergentagent.com` (platform-convention preview URL).
- Frontend restarted via supervisor; CRA recompiled bundle; bundle-grep confirms preview URL baked in, no runtime `undefined/api`.
- BUILD_JOURNAL entry + close report addendum on disk (`docs/close_reports/p1_addendum_frontend_backend_url_blocker_fix_2026-07-30.md`).

Curl-smoke passes via preview URL. Builder inspection alone is NOT the operative close signal — testing_agent verification required per user's system reminder.

## Verification targets for the testing agent

The testing agent must verify:
1. UI login at `/auth/login` with credentials `admin@rms.example.com` / `admin-b1-test-pw` succeeds and lands authenticated (redirect to a signed-in surface; token stored; `/api/auth/me` reachable from the SPA).
2. Ask Console (`/`) renders without console errors and can submit a question that reaches `/api/service_1/v2/dispatch` returning a structured response (202 accepted OR governed refusal card rendered per Owner E2 taxonomy).
3. The served bundle no longer emits `undefined/api` at runtime as a baseURL (network tab confirms API calls go to `https://governance-scan-3.preview.emergentagent.com/api/*` and NOT to `undefined/api`).
4. Wrong-password login still returns the correct auth-refusal shape `{reason, detail}` with NO `outcome` key (Owner E2 non-negotiable).
5. No regressions on other frontend surfaces that use apiClient (`/compliance`, `/operator`, `/master-admin`, `/engineer/*`, `/trace`, `/opportunity-briefs`, `/extraction/*`).

## Test credentials

- Admin: `admin@rms.example.com` / `admin-b1-test-pw` (6 roles: admin, operator, engineer, buyer, master_admin, dpo)
- Preview URL: `https://governance-scan-3.preview.emergentagent.com`

## Frontend/Backend testing history

- 2026-07-30 (this session) — testing_agent invoked post-P1-addendum to verify the frontend BACKEND_URL blocker fix.

## Communication protocol with testing sub-agents

- Task passed to testing_agent must be scoped narrowly to the blocker fix + regression check on the surfaces above.
- Testing-agent's report (working / not-working per case + diff of test_result.md changes) is the operative close signal.
- Main agent will NOT re-run tests already run by the testing agent.

---

## Testing agent verification (2026-07-30, mobile viewport 390x844)

frontend:
  - task: "Frontend BACKEND_URL blocker fix (P1 addendum)"
    implemented: true
    working: true
    file: "frontend/src/apiClient.js + 4 others + /app/frontend/.env"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: true
        -agent: "testing"
        -comment: "All 5 verification cases PASS on iPhone 12 viewport (390x844) against preview URL https://governance-scan-3.preview.emergentagent.com.
          CASE 1 (login) — PASS: POST /api/auth/login → 200 with JWT (6 roles: admin, operator, engineer, buyer, master_admin, dpo); redirected from /auth/login to / (Ask Console). No 'Something went wrong' toast. Follow-up GET /api/auth/me succeeded.
          CASE 2 (Ask Console) — PASS: /api/service_1/v2/dispatch returned HTTP 202 with structured body {objective_id: obj-588843b80865, status: accepted, delivery_estimate: PT30M, quote:{...}, trace_id: trc-d09dd8bf0138}. UI rendered 'Accepted — being composed' card with Trust receipt + Ask another buttons.
          CASE 3 (wrong password) — PASS: POST /api/auth/login with WRONG_PASSWORD → HTTP 401, body = {\"reason\":\"auth_missing\",\"detail\":\"Invalid credentials.\"} — parsed keys are exactly ['reason', 'detail'], NO 'outcome' key. Inline error rendered on the login form ('Invalid credentials. AUTH_MISSING'), not a page-level toast. Owner E2 taxonomy preserved.
          CASE 4 (bundle sanity) — PASS: zero runtime API calls to 'undefined/api'. All 5 observed API requests routed to https://governance-scan-3.preview.emergentagent.com/api/* (auth/login x2, auth/me x2, service_1/v2/dispatch x1). No 'undefined/api' substring in served page content.
          CASE 5 (regression sweep, authenticated) — PASS on all 7 routes: /compliance, /operator, /master-admin, /engineer/register, /trace, /opportunity-briefs, /extraction/console — every route mounted with visible content, no white-screen, no fatal errors (no 'Uncaught'/'TypeError' visible in DOM).
          Console noise observed but non-fatal: React Router v6→v7 future-flag warnings (v7_startTransition, v7_relativeSplatPath) on every navigation, plus 1x 401 (expected, from the wrong-password test) and 2x 404s (likely a favicon or non-critical asset — did not block any page mount). 'Something went wrong' toast from the pre-fix state is ABSENT everywhere.
          Screenshots captured: case1_after_login.png (Ask Console shell post-login), case2_ask_console.png (structured 202 acceptance card), case3_wrong_pw.png (inline 'Invalid credentials · AUTH_MISSING' rendered on login form).
          Blocker is resolved. Recommend main agent close the P1 addendum."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1

test_plan:
  current_focus: []
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "testing"
    -message: "Frontend BACKEND_URL blocker verification complete. 5/5 cases PASS. Login works end-to-end (JWT + 6 roles + redirect). Ask Console dispatch returns structured 202. Wrong-password shape is exactly {reason, detail} with no outcome key (Owner E2 non-negotiable satisfied). No runtime 'undefined/api' calls observed. All 7 regression routes mount. 'Something went wrong' toast is gone. Main agent may close the P1 addendum — no follow-up testing needed."

---
