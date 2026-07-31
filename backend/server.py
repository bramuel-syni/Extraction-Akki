"""RMS Intelligence System — FastAPI assembler (G0).

Minimal scaffold. G0 mounts:
  * /api/health           — liveness probe.
  * /api/system/state     — surfaces data-source mode (synthetic vs real).
  * /api/openapi.json     — re-exposed (FastAPI default) for the CI smoke.

Future phases will mount Layer-D Service-2 routers (G3), Mtafiti / Targeta
admin (G4), Operator Console (G5), and Outer-Gate file-out (G6). At G0
the surface is intentionally tiny; the load-bearing work this gate is
contract freezing, not endpoint count.

Cousin pointer: /reference/akki-legacy/backend/server.py L1-L80 (shape of
the thin assembler + router-include style).
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from core import APP_NAME, db, iso, now
from routers import contracts as contracts_router
from routers import discipline as discipline_router
from routers import handoff as handoff_router
from routers import v1 as v1_router
from routers import g1 as g1_router
from routers import northena as northena_router
from routers import objectives as objectives_router
from routers import service_1 as service_1_router
from routers import solva as solva_router
from services.data_source import get_active_data_source
from services.service_1 import async_state as async_state_service
from services.service_1 import async_worker as async_worker_service
from services.system_state import current_system_state
from services.wizard import session_persistence as wizard_session_persistence
from services.auth import user_store as auth_user_store
from services.auth import session_binding as auth_session_binding

log = logging.getLogger("rms.server")

app = FastAPI(
    title=APP_NAME,
    version="0.0.1-g0",
    description=(
        "RMS Intelligence System. Doctrine names canonical: "
        "Akki / SyniSense / Northena / Solva / Mtafiti / Targeta. "
        "G0 ships frozen contracts + Inner-Gate substrate only."
    ),
    # Expose OpenAPI + docs under /api so the Kubernetes ingress routes them.
    openapi_url="/api/openapi.json",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = APIRouter(prefix="/api")


@api.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "app": APP_NAME,
        "gate": "G0",
        "time": iso(now()),
    }


@api.get("/system/state")
async def system_state() -> dict:
    """Surfaces the data-source mode (synthetic vs real) per G0 Deliverable 3.c.
    The G5 Engine console will read this and render "running on synthetic /
    V-gates pending" when applicable.
    """
    ds = get_active_data_source()
    return current_system_state(data_source_name=ds.name, data_source_mode=ds.mode)


app.include_router(api)
# Contract-surfacing routes — make the frozen Pydantic models discoverable
# via /api/openapi.json::components.schemas (G0 follow-up; tester TEST 4).
app.include_router(contracts_router.router, prefix="/api")
app.include_router(v1_router.router, prefix="/api")
app.include_router(g1_router.router, prefix="/api")
app.include_router(northena_router.router, prefix="/api")
app.include_router(solva_router.router, prefix="/api")
app.include_router(service_1_router.router, prefix="/api")
app.include_router(discipline_router.router, prefix="/api")
app.include_router(handoff_router.router, prefix="/api")
app.include_router(objectives_router.router, prefix="/api")
from routers import mtafiti as mtafiti_router  # noqa: E402
app.include_router(mtafiti_router.router, prefix="/api")
from routers import pricing as pricing_router  # noqa: E402
app.include_router(pricing_router.router, prefix="/api")
app.include_router(pricing_router.fleet_router, prefix="/api")
from routers import wizard_operator as wizard_operator_router  # noqa: E402
app.include_router(wizard_operator_router.router, prefix="/api")
# Phase 8 Stage B-3 — Commercial-cut 2026-07-06 (BCR v1.4 §12):
# `routers/wizard_buyer.py` was cut whole; the buyer wizard router
# variant no longer mounts. Operator wizard mount (below) unchanged.
# (previously: `app.include_router(wizard_buyer_router.router, prefix="/api")`)
# Phase 8 Stage B-1 — auth/key model (Owner E1 ratified: custom JWT via PyJWT + bcrypt).
from routers import auth as auth_router  # noqa: E402
app.include_router(auth_router.router, prefix="/api")
# Phase 8 Stage B-2 — operator surface (UI Spec §2.1 Home aggregate).
from routers import operator as operator_router  # noqa: E402
app.include_router(operator_router.router, prefix="/api")
# Phase 8 Stage B-3 — engineer surface (§4 key-grant CRUD backend).
from routers import engineer as engineer_router  # noqa: E402
app.include_router(engineer_router.router, prefix="/api")
# Phase 8 Stage B-4 — master admin surface (§6 backend).
from routers import master_admin as master_admin_router  # noqa: E402
app.include_router(master_admin_router.router, prefix="/api")

# Phase 8 Stage B-5a — Compliance Console read/prove.
from routers import compliance as compliance_router  # noqa: E402
app.include_router(compliance_router.router, prefix="/api")

# Phase 8 Seam 3 Sub-stage 3 — §8 consequence-class checker router.
from routers import checker as checker_router  # noqa: E402
app.include_router(checker_router.router, prefix="/api")

# Phase 9 Sub-stage 9.1 — worker plane (BCR §3.1 V1-I3 capabilities-claim JWT).
from routers import workers as workers_router  # noqa: E402
app.include_router(workers_router.router, prefix="/api")

# Phase 9 Sub-stage 9.3 — Extraction Console SM-E1..E3 sample lifecycle.
from routers import extraction_sample as extraction_sample_router  # noqa: E402
app.include_router(extraction_sample_router.router, prefix="/api")

# Artifact Store (BCR §3.2) — V3 last mile. Three-op adapter behind
# a router: GET/HEAD durable-download endpoints (AS-U1, AS-B3). No
# POST/DELETE: writes ride the internal outer-gate atomic-write path;
# deletion routes via Seam 3 authorized_deletion only (AS-H1).
from routers import artifact_store as artifact_store_router  # noqa: E402
app.include_router(artifact_store_router.router, prefix="/api")

# Transform Forms (BCR §3.7) — Knowledge Artifact + Callable Skill.
# TF-E1..TF-E4 α + conditions per Owner rulings (2026-07-08). Parity 31.
from routers import transform_forms as transform_forms_router  # noqa: E402
app.include_router(transform_forms_router.router, prefix="/api")

# Census-dimensions mini-phase (Owner Message 565 · rulings 2026-07-10).
# CD-E1..CD-E4 α + conditions. Read-only endpoints; sidecar writes ride
# in-process census-run path. Parity 31 preserved (CD-E2 α ↔ CD-E4 coupling).
from routers import census_dimensions as census_dimensions_router  # noqa: E402
app.include_router(census_dimensions_router.router, prefix="/api")

# Multi-Instance Capability MC-E1..MC-E6 close 2026-07-14 · instance
# config surface (MC-E6 β — class-(a) branding moved from live code to
# config). Public read `/api/instance/config`.
from routers import instance as instance_router  # noqa: E402
app.include_router(instance_router.router, prefix="/api")

# S2.onboard structured intake (MC-E3 α · initial-set ledgered).
from routers import s2_onboard as s2_onboard_router  # noqa: E402
app.include_router(s2_onboard_router.router, prefix="/api")

# §3.4 Production Housing PH-R1 (Owner rulings 2026-07-10 · all α + build_info
# enhancement promoted). Adds BCR §3.4 annex endpoints:
#   /api/healthz  liveness  · no auth · no DB touch
#   /api/readyz   readiness · DB ping + frozen-contract parity count
#   /api/system/build_info  git SHA + build timestamp + parity (no secrets)
# Shared FS-enumeration parity counter at services/health/parity_counter.py
# (PH-E3 α · same source as V1-G7 gate).
from routers import health as health_router  # noqa: E402
app.include_router(health_router.router, prefix="/api")
from routers import system_info as system_info_router  # noqa: E402
app.include_router(system_info_router.router, prefix="/api")

# Owner Ops · Docs bundle download (2026-02-14). Read-only tar.gz snapshot
# of /app/docs/ served from /app/backend/data/bundles/. Zero mutation of
# docs/ or contracts/. No secrets in payload.
from routers import docs_bundle as docs_bundle_router  # noqa: E402
app.include_router(docs_bundle_router.router, prefix="/api")

# Memory Service (Owner ruling 2026-07-30 cycle 3 option (b) + follow-ups
# 1a/2a/3a). Backend-only surface at /api/memory/*. Two new frozen contracts
# (memory_plane_v0, memory_write_back_v0) → parity 32 → 34. Ledger reuses
# NorthenaLedgerRow_v1 with 7 governed memory_* data_class values in
# data_class_registry.v4.json (registry-version-bump per authority 2a).
from routers import memory as memory_router  # noqa: E402
app.include_router(memory_router.router, prefix="/api")


@app.on_event("startup")
async def _startup() -> None:
    log.info("rms.startup: db=%s gate=Phase_5_Stage_B", db.name)
    # Phase 5 Stage B — async delivery substrate boot sequence.
    # Ordering: (1) ensure Mongo indexes exist; (2) run recovery sweep
    # to re-enqueue non-terminal objectives left over from prior boot;
    # (3) start the worker pool. Any error here fails ASGI startup —
    # loud, not silent (Standing Disposition infra-not-refusal).
    try:
        await async_state_service.ensure_indexes()
        await async_worker_service.recovery_sweep()
        await async_worker_service.start_workers()
        # Phase 7 Stage B-1 — wizard_sessions Mongo indexes.
        await wizard_session_persistence.ensure_indexes()
        # Phase 8 Stage B-1 — auth users + wizard session binding indexes.
        await auth_user_store.ensure_indexes()
        await auth_session_binding.ensure_indexes()
        # Census-dimensions mini-phase (Owner Message 565) — unique index on feed_id.
        await db["census_content_dimensions"].create_index("feed_id", unique=True)
        # P1-R4 (Owner ruling 2026-07-30, production-scoped) — startup guards.
        # Under AKKI_ENV=production, refuses to boot on missing secrets. Under
        # development/sandbox, logs structured warnings and continues.
        from services.synisense.startup_guard import enforce_startup_guards
        enforce_startup_guards()
        # Idempotent admin seed for local/dev + testing agent.
        import os as _os
        _admin_email = _os.environ.get("ADMIN_EMAIL")
        _admin_password = _os.environ.get("ADMIN_PASSWORD")
        if _admin_email and _admin_password:
            await auth_user_store.seed_admin_if_absent(_admin_email, _admin_password)
            # Single-source of grant truth (2026-07-31 verification fix per EE-R4):
            # admin's derivation-visible grant lives in `engineer_key_grants`
            # collection alongside all other grants. No `users.key_grants` mirror.
            from services.auth.engineer_key_grant_service import (
                ensure_indexes as _grant_ensure_indexes,
                seed_admin_grant_if_absent,
            )
            await _grant_ensure_indexes()
            await seed_admin_grant_if_absent(admin_email=_admin_email)
    except Exception:
        log.exception("rms.startup: async delivery substrate boot failed")
        raise


@app.on_event("shutdown")
async def _shutdown() -> None:
    log.info("rms.shutdown: draining async workers")
    # Graceful shutdown — cancel worker tasks; in-flight objectives
    # left in `running` state on disk; next boot's recovery sweep will
    # reset them to `accepted` and re-enqueue.
    try:
        await async_worker_service.stop_workers()
    except Exception:
        log.exception("rms.shutdown: worker stop error (state persists in Mongo)")
