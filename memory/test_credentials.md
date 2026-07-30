# Test Credentials (updated 2026-07-30 P1 close)

## Admin login
- **Email:** `admin@rms.example.com`
- **Password:** `admin-b1-test-pw`
- **Roles:** admin, operator, engineer, buyer, master_admin, dpo
- **Seed vehicle:** `services/auth/user_store.seed_admin_if_absent` — idempotent, only creates when absent, never overwrites.

## Environment posture
- `AKKI_ENV=development` (dev fallback active; Shield trust-receipt master secret is set in .env; dev echo mode remains functional under Owner scoping).
- `EMERGENT_LLM_KEY` is loaded from `/app/backend/.env`.

## How to demo
1. `curl http://localhost:8001/api/health` — expect `status: ok`.
2. `POST /api/auth/login` with the JSON body `{"email":"admin@rms.example.com","password":"admin-b1-test-pw"}`; expect 200 + JWT.
3. Frontend at `http://localhost:3000/auth/login` — same credentials.

## Refusal taxonomy note (Owner E2 non-negotiable)
- Access-control denial (bad credentials, missing token, expired token, scope insufficient, identity mismatch) returns `{reason, detail}` with HTTP 401/403. **NEVER `outcome=refused`.** Governed refusal is the platform's V2/V3 concern; auth denial is a taxonomy-separate class.
