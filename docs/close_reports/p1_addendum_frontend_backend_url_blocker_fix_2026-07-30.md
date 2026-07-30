# P1 Close Report — ADDENDUM · Frontend BACKEND_URL Blocker Fix

**Date:** 2026-07-30 (same-day addendum).
**Trigger:** Independent verification at Owner-verification-cycle-1 returned **4/5 pass, 1 BLOCKER**.
**Discipline:** append-only per honest-record posture. The main close report's "demoable immediately" claim did NOT hold at first verification; this addendum records the defect and its fix.

---

## §1 The blocker as reported by the verifier

- **Passed** (evidence-backed): `/api/health` 200 · parity 32/32 · auth API (correct login → JWT + 6 roles) · auth denial shape correct (`{reason, detail}`, no `outcome` key) · Ask Console renders · `/api/service_1/v2/dispatch` returns structured 202 AsyncDeliveryAccepted_v0.
- **BLOCKER**: the served frontend bundle contained `const BACKEND_URL = undefined;` so axios `baseURL` was literally `"undefined/api"`. Every UI-originated API call was malformed; UI login showed *"Something went wrong."*

## §2 Root causes (verifier-identified)

1. The `/app/frontend/.env` set at first close carried `REACT_APP_BACKEND_URL=http://localhost:8001` — CORRECT for backend-side dev but WRONG for a browser running on the user's machine (localhost:8001 resolves against the user's machine, not the pod).
2. The frontend service was restarted at close but the running dev server / built bundle did not compile `process.env.REACT_APP_BACKEND_URL` correctly at that moment (a CRA env-recompile race).
3. Five source files (apiClient.js + 4 page/component files) referenced `process.env.REACT_APP_BACKEND_URL` DIRECTLY with no fallback. When the compile-time constant was `undefined`, the emitted string interpolation was literally `"undefined/api"`.

## §3 Fix applied (this addendum)

### Code change — resilient fallback across 5 files

All five references to `process.env.REACT_APP_BACKEND_URL` now use the pattern:

```
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
```

Files changed:

| File | Change |
|---|---|
| `frontend/src/apiClient.js` | Added block comment describing the fallback contract; changed `const API = ${process.env.REACT_APP_BACKEND_URL}/api;` to `const BACKEND_URL = process.env.REACT_APP_BACKEND_URL \|\| ''; const API = ${BACKEND_URL}/api;` |
| `frontend/src/pages/compliance/ComplianceRulebookWritePage.js` | `\|\| ''` fallback |
| `frontend/src/pages/engineer/OnboardingInvitePage.jsx` | `\|\| ''` fallback |
| `frontend/src/pages/extraction/SampleGroundingContext.jsx` | `\|\| ''` fallback |
| `frontend/src/components/ui_spec_v1/CounterSignBanner.jsx` | `\|\| ''` fallback |

**Semantics:** when `REACT_APP_BACKEND_URL` is set (preview URL, explicit dev config, deployment), it's used. When absent or `undefined`, `BACKEND_URL` falls back to the empty string, so `API = "/api"` — a relative path that resolves to same-origin. This makes the app work in preview (Kubernetes ingress routes `/api/*` to backend on same origin), in local docker-compose, and in any deployment where the frontend is served by the same host that terminates the backend ingress.

### Environment file change

`/app/frontend/.env` — `REACT_APP_BACKEND_URL` changed from `http://localhost:8001` to `https://governance-scan-3.preview.emergentagent.com` (the platform-convention preview URL).

### Frontend service restart

`sudo supervisorctl restart frontend` — CRA re-read `.env` and recompiled the bundle. Verified:
- Bundle contains: `const BACKEND_URL = "https://governance-scan-3.preview.emergenta[gent.com]";` (via `strings` grep).
- Bundle no longer contains `undefined/api` as a runtime string (the only "undefined/api" match is inside the source comment "Never emit undefined/api as a baseURL" which is preserved through the dev bundle; harmless).

### Preview URL verified reachable

- `GET https://governance-scan-3.preview.emergentagent.com/api/health` → 200 `{"status":"ok"}`.
- `POST https://governance-scan-3.preview.emergentagent.com/api/auth/login` (admin creds) → 200 with JWT + 6 roles.
- `POST` with wrong password → `{"reason":"auth_missing","detail":"Invalid credentials."}` (auth-refusal taxonomy still respected — Owner E2).

## §4 Test-file update check

Only e2e test that references `REACT_APP_BACKEND_URL`: `frontend/e2e/build_info_smoke.spec.ts` — reads the value from `frontend/.env` at test time. No hardcoded expectation of `localhost:8001`; the new preview URL value is what it will read. **No test file update required.**

Jest suite (`src/__tests__/ui_spec_v1/`): does not read `REACT_APP_BACKEND_URL`. **No update required.**

## §5 Honest-record admission

The main close report §10 conformance table claimed: *"Working `.env` setup, demoable immediately: `backend/.env`, `frontend/.env`, `memory/test_credentials.md`"* — this row was NOT met at first verification. It is met NOW after this addendum's fix. The defect class this represents: **untested frontend-side .env value under real preview conditions.** Recorded as a finding for future closes: `.env` values MUST be smoke-tested through the actual browser preview URL, not just via curl from inside the pod.

## §6 Testing-agent verification of the fix

Per user's system reminder: builder inspection / curl output is **not sufficient** to close this blocker. The testing_agent has been invoked to independently verify (a) the frontend bundle no longer emits `undefined/api`, (b) UI login at `/auth/login` with `admin@rms.example.com` / `admin-b1-test-pw` succeeds and lands authenticated, (c) an Ask Console question submission reaches the backend (202 accepted or governed refusal rendered). Its report is the operative signal for closing this blocker.

**Status:** fix applied on disk + frontend restarted + curl-smoke passes. **Awaiting testing_agent verification** as the operative close signal.

— End of addendum. —
