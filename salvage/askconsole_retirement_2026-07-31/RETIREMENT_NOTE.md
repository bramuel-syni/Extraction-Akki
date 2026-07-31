# RETIRED ARTIFACT · Ask Console page (2026-07-31)

**Filed:** 2026-07-31 (Owner ruling R2 · preview hygiene, standing · UI-1-A close).
**Authority:** Owner directive verbatim —
> *"the preview ROOT serves the NEW build only. The Owner must never land on a pre-canon surface at the preview link. Move the root to the Canon OS shell — fixed nav order Connect · Registry · Use Data · Govern · Prove · Team (Canon §3.1) … Legacy ask-console moves off the root (it may live at a non-root path as provenance if anything depends on it, else tear down; the old service_1 ask flow is backend-unaffected)."*

This artifact is preserved read-only for historical provenance. It is:
- READ-ONLY (chmod 444).
- NOT canon.
- NOT reachable from the live app (the file is REMOVED from `/app/frontend/src/pages/AskConsolePage.js`).
- NOT the ask-first landing pattern (retired vocabulary per R1).

## Route redirects landed (App.js)

| Legacy path | Redirects to |
|---|---|
| `/` (was AskConsolePage) | Canon OS shell (`CanonOSShellPage`) |
| `/ask` | `/` |
| `/ask-console` | `/` |
| `/console` | `/` |

## Retired vocabulary purged (per R1)

- Wordmark reads "Akki OS" (was: `RMS Intelligence System` in `<title>`, `AskConsolePage` wordmark).
- `<title>` in `/app/frontend/public/index.html` reads "Akki OS".
- `<noscript>` fallback reads "Akki OS requires JavaScript." (was: "RMS Intelligence System requires JavaScript.")
- Nav labels use Canon vocabulary — Connect · Registry · Use Data · Govern · Prove · Team.
- No ask-first landing pattern in the shell — the root is a six-tile nav, not an ask box.

## Honest gap (backend still reachable)

The **backend** ask-first endpoint (`/api/ask` in the legacy code path) is UNAFFECTED per Owner directive. If any script still calls it, it responds as before. Only the UI is off the live tree.

═══════════════════════════════════════════════════════════════════

*End of retirement note. Owner directive verbatim carrier · read-only preservation.*
