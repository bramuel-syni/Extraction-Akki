# Test Credentials — Akki OS (RMS Intelligence System)

## Admin demo login (permanent seed)
- **Email:** `admin@rms.example.com`
- **Password:** `admin-b1-test-pw`
- **Roles:** admin
- **Endpoint:** `POST /api/auth/login` → returns `access_token` (Bearer JWT)
- **Purpose:** end-to-end flow testing, wizard flows, admin-scope access to `/api/memory/*`, `/api/system/*`, all admin surfaces.

## Master admin (permanent seed)
- **Email:** `master@rms.example.com`
- **Password:** `master-b1-test-pw`
- **Roles:** master_admin
- **Endpoint:** `POST /api/auth/login`

## Backend testing surface — engineer-key issuance
Engineer keys for `/api/memory/*` and any external-integrator surface are minted server-side by an admin/master_admin call to `POST /api/engineer/keys/grant`. Testing agent may either:
  1. Log in as admin (above), grant an engineer key to a fresh identity, then use the resulting JWT for engineer-key-scoped calls; OR
  2. Log in as admin directly and use admin scope for `/api/memory/*` (admin has full plane scope per `routers/memory.py::_authorize_plane_access`).

## Memory Service parity (post Stage B, 2026-07-31)
- `/api/readyz` returns `{"status":"ready","parity_count":34,"expected_parity":34,"db":"ok"}`
- `/api/system/build_info` returns `parity_count = 34`

## Environment
- Backend URL: `REACT_APP_BACKEND_URL` from `/app/frontend/.env` — used verbatim.
- MongoDB: local via `MONGO_URL` + `DB_NAME` from `/app/backend/.env`.
- LLM: EMERGENT_LLM_KEY in `/app/backend/.env`.
