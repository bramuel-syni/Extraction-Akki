"""Connect module — Phase 3 sub-cycle 1 thin backend seam (Owner ruling 2026-08-01).

Owner directive verbatim:
    "CONNECT module (frontend): source connection + rights-at-connection.
     Wire against the STUB seam now (real archive/CMS readers land when
     OT-1a facts arrive) — the stub must be honestly marked per the four
     designed states (dormant capability visible + unlit; not-yet-measured
     hatched), never presented as live."

Design:
  * `GET /api/connect/capabilities` — returns the dormant capability
    inventory with each capability marked `state: "dormant"` +
    `awaiting: "OT-1a"`.
  * `POST /api/connect/sources` — governed stub. Returns 501 with
    `{outcome:"refused", reason:"connect_seam_dormant", detail: ...}` —
    never presented as live. This is an HONEST governed stub, not a
    silent fallback.
  * `GET /api/connect/sources` — returns empty list with the same
    dormant marker.

No new frozen contract lands (the source-registration shape is not
crossing an environment boundary yet — the endpoint refuses). D4b
FREEZE decision deferred until OT-1a facts arrive.
"""
from __future__ import annotations

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse


router = APIRouter(prefix="/connect", tags=["connect"])


# Dormant capability inventory. Owner-anchored; each item is a first-class
# object that will become "lit" only when its OT-1a fact lands.
_DORMANT_CAPABILITIES = [
    {
        "capability_id": "archive_reader",
        "label": "Archive reader",
        "note": "Reads static archives (S3, GCS, local mount) into extraction.",
        "state": "dormant",
        "awaiting": "OT-1a",
        "unmeasured_dimensions": ["throughput", "latency", "cost_per_hour"],
    },
    {
        "capability_id": "cms_connector",
        "label": "CMS connector",
        "note": "Reads content-management-system articles + assets into extraction.",
        "state": "dormant",
        "awaiting": "OT-1a",
        "unmeasured_dimensions": ["throughput", "latency", "cost_per_hour"],
    },
    {
        "capability_id": "live_stream_reader",
        "label": "Live stream reader",
        "note": "Reads live broadcast streams into extraction with hour-window checkpoints.",
        "state": "dormant",
        "awaiting": "OT-1a",
        "unmeasured_dimensions": ["throughput", "latency", "cost_per_hour"],
    },
    {
        "capability_id": "webhook_receiver",
        "label": "Webhook receiver",
        "note": "Accepts push notifications from external systems into extraction.",
        "state": "dormant",
        "awaiting": "OT-1a",
        "unmeasured_dimensions": ["throughput", "latency", "cost_per_hour"],
    },
]


@router.get("/capabilities")
async def get_capabilities():
    """Dormant capability inventory. Honestly marked per Ruling 1 four
    designed states discipline."""
    return {
        "capabilities": _DORMANT_CAPABILITIES,
        "posture": "all_dormant_pending_OT_1a",
        "note": (
            "Every capability is dormant. Not-yet-measured dimensions are "
            "recorded honestly; none is presented as live."
        ),
    }


@router.get("/sources")
async def list_sources():
    """No live sources — the seam is dormant. Returns empty list with
    an honest posture marker."""
    return {
        "sources": [],
        "posture": "connect_seam_dormant",
        "note": (
            "No sources are registered. Registration will land when Owner "
            "OT-1a facts arrive; the endpoint currently refuses registration."
        ),
    }


@router.post("/sources", status_code=501)
async def register_source(request: Request):
    """Governed stub — refuses registration until OT-1a facts arrive.

    Owner E2 taxonomy: refusal envelope carries `outcome=refused` +
    `reason=connect_seam_dormant` + `detail`. NEVER silent-fallback.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}
    return JSONResponse(
        status_code=501,
        content={
            "outcome": "refused",
            "reason": "connect_seam_dormant",
            "detail": (
                "The Connect module is dormant pending Owner OT-1a facts "
                "(source connector registry). No sources can be registered "
                "at this time. Every capability is visible on GET /api/connect/"
                "capabilities marked dormant + not-yet-measured."
            ),
            "requested_capability": body.get("capability_id"),
            "requested_label": body.get("label"),
        },
    )
