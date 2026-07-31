# RETIRED ARTIFACTS · UI-1-A cutover (2026-07-31)

**Filed:** 2026-07-31 (on execution of AKKI_OS_EXPERIENCE_CANON_v1 · UI-1-A Use Data module dispatch)
**Authority:** Owner directive verbatim — "copy operator/ and engineer/ to /salvage/ui1a_retirement_<date>/ (read-only, retirement note), REMOVE from the live tree and bundle (clean cutover — no dead code per the conformance audit's 'no refits, no preserved fields'), and add ROUTE REDIRECTS from the legacy paths (/operator/*, /engineer/*) to the new /use-data landing so no bookmark white-screens."

The artifacts in this directory are preserved for historical record ONLY. They are:
- READ-ONLY (chmod 444).
- NOT canon.
- NOT to be cited as authority in any subsequent session, ruling, or code change.

## Files retired here

| Path | Prior route | Reason |
|---|---|---|
| `frontend/pages/operator/OperatorHomePage.js` | `/operator` | Superseded by `/use-data` (Canon §6.1 three-door landing). |
| `frontend/pages/operator/CommissionWizardPage.js` | `/operator/commission` | Superseded by `/use-data/wizard/*` (Canon §6.2 conversational wizard). |
| `frontend/pages/operator/CommitReviewPage.js` | `/operator/commit-review/:sessionId` | Folded into `/use-data/wizard/*` Commission card commit affordance (Canon §6.3). |
| `frontend/pages/engineer/EngineerRegisterAppPage.js` | `/engineer/register` | Superseded by `/use-data` Integrate-an-App door (Canon §6.1). |
| `frontend/pages/engineer/EngineerFirstCallPage.js` | `/engineer/first-call` | Absorbed into the Developer surface (Canon §6.6 · non-nav post-commission view). |
| `frontend/pages/engineer/EngineerAdministerPage.js` | `/engineer/administer` | Superseded by `/use-data/developer/*` (Canon §6.6 Developer surface, non-nav). |
| `frontend/pages/engineer/OnboardingInvitePage.jsx` | `/engineer/onboarding` | Key-grant issuance / revocation administration ultimately belongs to Team (UI-1-E access register). Until UI-1-E lands, the backend endpoints remain the path; the UI is retired to prevent visual survival of the retired role model. |

## Route redirects landed (App.js)

Legacy routes remain reachable via `Navigate` to prevent bookmark white-screens:
- `/operator` → `/use-data`
- `/operator/commission` → `/use-data`
- `/operator/commit-review/*` → `/use-data`
- `/engineer/register` → `/use-data`
- `/engineer/first-call` → `/use-data`
- `/engineer/administer` → `/use-data`
- `/engineer/onboarding` → `/use-data`

## Honest gap disclosure (per Owner directive)

Key-grant issuance / revocation administration UI is temporarily absent from the live tree. Until UI-1-E (Team · access register) lands, only the backend endpoints (`POST /api/engineer/keys/grant`, revocation endpoints) carry the path. Master Admin callers may still mint or revoke grants via authenticated HTTP calls; the surface for doing so from within the app returns with UI-1-E. This gap is noted here rather than by keeping a retired page alive.

═══════════════════════════════════════════════════════════════════

*End of retirement note. Owner directive verbatim carrier · read-only preservation.*
