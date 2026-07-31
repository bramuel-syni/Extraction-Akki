# Test Credentials — Akki OS (RMS Intelligence System)

## Admin demo login (permanent seed · admin identity)
- **Email:** `admin@rms.example.com`
- **Password:** `admin-b1-test-pw`
- **Roles:** admin, operator, engineer, buyer, master_admin, dpo
- **Endpoint:** `POST /api/auth/login` → returns `access_token` (Bearer JWT)
- **Purpose:** end-to-end flow testing, wizard flows, admin-scope access to `/api/memory/*`, `/api/system/*`, all admin surfaces.

## Master admin (permanent seed)
- **Email:** `master@rms.example.com`
- **Password:** `master-b1-test-pw`
- **Roles:** master_admin
- **Endpoint:** `POST /api/auth/login`

## Demo identities per user class (UI-1-A viewable-build addendum · 2026-07-31)

Owner directive verbatim: *"seed demo identities per class where missing: master_admin, dpo, operator, analyst — record credentials in /app/memory/test_credentials.md"*

All demo emails end in `@demo.rms.example.com` so they are visually distinct from real accounts. Passwords are **demo-marked** and safe to circulate for preview walkthroughs.

### `master_admin` class
- **Email:** `demo.master_admin@demo.rms.example.com`
- **Password:** `demo-master-admin-pw`
- **Roles:** master_admin, admin, operator, dpo, engineer
- **What they see:** Every module including Master Admin (Change-a-Rule, Audit Trail, Rulebook write) and Govern (DPO estate). Their pre-seeded Use Data sessions carry the SAMPLE badge.

### `dpo` class
- **Email:** `demo.dpo@demo.rms.example.com`
- **Password:** `demo-dpo-pw`
- **Roles:** dpo, operator
- **What they see:** Govern (DPO estate, retention, refusal health, pending queue), Compliance Console, and Use Data landing (an auditor's view of the Commission verdict flow).

### `operator` class
- **Email:** `demo.operator@demo.rms.example.com`
- **Password:** `demo-operator-pw`
- **Roles:** operator, ask_console_user
- **What they see:** The default Use Data caller — three-door landing, six-card wizard, verdict rendering (RUNS_NOW / REFUSED / HELD_FOR_CHECK). Pre-seeded sample sessions in In progress + Ready.

### `analyst` class (ask_console_user)
- **Email:** `demo.analyst@demo.rms.example.com`
- **Password:** `demo-analyst-pw`
- **Roles:** ask_console_user
- **What they see:** Ask Console (question-only) + Opportunity Briefs. Use Data access shows the doors but auth-scoped surfaces refuse with the governed grammar.

## Sample seeded state (AS-U2 · visibly marked)

On startup the backend idempotently seeds, per demo identity above:
- `s-sample-in-progress-{uid[-12:]}` — an **Integrate-an-App** conversation with reflection fields populated (three set, one assumed with amber chip, one open), IntelCard grounded claims, Plan preview coverage/cost range, no commission yet.
- `s-sample-ready-{uid[-12:]}` — an **Export/License** commission with `verdict_ref` populated (RUNS_NOW simulated), all values_confirmed.

Both rows carry the sidecar `is_sample=true` flag on the persistence doc, and the surface renders a prominent **SAMPLE** badge + wizard banner on every one. **No unmarked fixtures.**

## Backend testing surface — engineer-key issuance
Engineer keys for `/api/memory/*` and any external-integrator surface are minted server-side by an admin/master_admin call to `POST /api/engineer/keys/grant`. Testing agent may either:
  1. Log in as admin (above), grant an engineer key to a fresh identity, then use the resulting JWT for engineer-key-scoped calls; OR
  2. Log in as admin directly and use admin scope for `/api/memory/*` (admin has full plane scope per `routers/memory.py::_authorize_plane_access`).

## Backend health (UI-1-A · 2026-07-31)
- `/api/readyz` returns `{"status":"ready","parity_count":36,"expected_parity":36,"db":"ok"}`
- `/api/system/build_info` returns `parity_count = 36`
- Backend Pytest: **1479 passed · 2 skipped · 0 failed** (1465 + 14 iter11 HTTP + no regressions from Mongo migration).

## Environment
- Backend URL: `REACT_APP_BACKEND_URL` from `/app/frontend/.env` — used verbatim.
- MongoDB: local via `MONGO_URL` + `DB_NAME` from `/app/backend/.env`. Sessions persist across restarts.
- LLM: EMERGENT_LLM_KEY in `/app/backend/.env`.
- Preview URL: `https://governance-scan-3.preview.emergentagent.com` (Owner-mandated standing preview from UI-1-A onward).
