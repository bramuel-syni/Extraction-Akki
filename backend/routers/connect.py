"""Connect module · Canon §4 rebuild (Owner UI-1-C dispatch 2026-08-02).

Endpoints:
    GET  /api/connect/landing         Canon §4.1 five-section aggregate
    GET  /api/connect/rules           Canon §4.2 seven Connect rules
    POST /api/connect/rules/{id}      direct-write refused → Change-a-Rule
    GET  /api/connect/sources         list all sources (record table)
    POST /api/connect/sources         master_admin only · adds a PENDING source
    GET  /api/connect/sources/{id}    source profile (§4.4)
    POST /api/connect/sources/{id}/connect   operator · pending → connected
    POST /api/connect/sources/{id}/test      operator · re-test
    POST /api/connect/sources/{id}/retry     operator · retry after fail
    GET  /api/connect/declared_registries    Class-D declared registries
    POST /api/connect/declared_registries    master_admin · declare
    GET  /api/connect/capabilities    (retained) dormant capability inventory

Role gates:
    master_admin  ─ adds a source, declares a registry, confirms instance defaults.
    operator      ─ connect/test/retry a source.
    dpo/admin     ─ read across.
    others        ─ read the landing + rules (public-ish per §4.1).

The Connect module LINKS to Govern (never duplicates governance content).
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from services.auth.dependencies import require_identity_or_deny
from services.connect import sources_store
from services.connect.rulebook import (
    get_seven_connect_rules,
    get_rule_metadata,
    RULE_CLASS_AUTO_RUN_CEILING,
)
from services.use_data.commission_verdict_engine import (
    AUTO_RUN_CEILING_USD_INITIAL,
)


router = APIRouter(prefix="/connect", tags=["connect"])


# --------- role helpers ------------------------------------------------------


async def _identity_or_deny(request: Request):
    result = await require_identity_or_deny(request)
    if isinstance(result, JSONResponse):
        return None, result
    return result, None


def _has_role(identity, *needed: str) -> bool:
    roles = set(getattr(identity, "roles", []) or [])
    return bool(roles & set(needed))


def _deny(reason: str, detail: str, status: int = 403) -> JSONResponse:
    return JSONResponse(
        status_code=status,
        content={"reason": reason, "detail": detail},
    )


# --------- §4.1 · landing ----------------------------------------------------


@router.get("/landing")
async def get_landing(request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    counts = await sources_store.count_by_state()
    declared_count = counts["total"]
    connected_count = counts.get(sources_store.STATE_CONNECTED, 0)
    awaiting_count = counts.get(sources_store.STATE_AWAITING_CREDENTIALS, 0)
    failed_count = counts.get(sources_store.STATE_FAILED, 0)
    in_progress_count = counts.get(sources_store.STATE_IN_PROGRESS, 0)
    last_sync = await sources_store.last_sync_iso()
    # Two-state headline slot · SAME layout, different content.
    headline_kind = "steady_state" if (
        declared_count > 0
        and connected_count == declared_count - counts.get(sources_store.STATE_PENDING, 0)
        and awaiting_count == 0
        and failed_count == 0
        and in_progress_count == 0
    ) else "pre_connection"
    if headline_kind == "steady_state":
        headline_text = (
            f"All {connected_count} sources connected · "
            f"last sync {last_sync or 'not yet'}"
        )
    else:
        headline_text = (
            f"{declared_count} sources declared · {connected_count} connected · "
            f"{awaiting_count} awaiting credentials"
        )
    # Instance config for status banner (Canon §4.1 · with DEFAULT markers per QRB).
    from config import current_instance_id, load_instance_config
    iid = current_instance_id()
    inst = load_instance_config(iid)
    # Read defaults metadata for QRB evidence-class discipline. Fields
    # that carry defaults render with a visible DEFAULT marker until
    # confirmed by an authorized identity.
    defaults = inst.get("defaults", [])
    status_banner = {
        "configuration_locked": inst.get("configuration_locked", False),
        "signed_by": inst.get("configuration_signed_by"),
        "signed_at_iso": inst.get("configuration_signed_at_iso"),
        "deployment_target": inst.get("deployment_target", "RMS Local"),
        "primary_regulator": inst.get("primary_regulator", "DPO capacity"),
        "credentials_holder": inst.get("credentials_holder", "instance vault"),
        "config_read_only_route": "/instance/config",
        # QRB · a defaulted value is honest-marked, not silent.
        "defaults": defaults,
        "field_is_default": {
            f: (f in defaults) for f in (
                "deployment_target", "primary_regulator", "credentials_holder"
            )
        },
    }
    # Three cards (§4.1)
    cards = {
        "connections_healthy": connected_count,
        "connections_total": max(0, declared_count - counts.get(sources_store.STATE_PENDING, 0)),
        "last_sync_iso": last_sync,
        "egress_posture": inst.get(
            "egress_posture",
            "seam · lands when OT-1a egress facts arrive",
        ),
        "egress_is_dormant": ("egress_posture" not in inst),
    }
    # Record table rows (§4.1). Sample rows pinned above real rows.
    raw_sources = await sources_store.list_sources()
    from services.connect.sources_store import cadence_plain, protocol_familiar
    record_rows: List[Dict[str, Any]] = []
    for s in raw_sources:
        record_rows.append({
            "source_id": s["source_id"],
            "name": s.get("name"),
            "protocol": s.get("protocol"),
            "protocol_familiar": protocol_familiar(s.get("protocol", "")),
            "cadence": s.get("cadence"),
            "cadence_plain": cadence_plain(s.get("cadence", "")),
            "state": s.get("state"),
            "failure_reason_plain": s.get("failure_reason_plain"),
            "in_progress_note": s.get("in_progress_note"),
            "awaiting_note": s.get("awaiting_note"),
            "last_sync_iso": s.get("last_sync_iso"),
            "is_sample": bool(s.get("is_sample", False)),
        })
    footer = {
        "credentials_holder": status_banner["credentials_holder"],
        "signed_off_by": status_banner["signed_by"] or "not yet signed",
        "govern_link_text": "data use rules live in Govern",
        "govern_link_route": "/govern/rules",
    }
    # Declared registries (chips)
    declared_registries = await sources_store.list_declared_registries()
    return {
        "canon_ref": "Canon §4.1",
        "headline": {"kind": headline_kind, "text": headline_text},
        "status_banner": status_banner,
        "cards": cards,
        "record_rows": record_rows,
        "footer": footer,
        "declared_registries": declared_registries,
    }


# --------- §4.2 · seven Connect rules ----------------------------------------


@router.get("/rules")
async def get_rules(request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    rules = await get_seven_connect_rules()
    return {"canon_ref": "Canon §4.2", "rules": rules}


class RuleDirectWriteBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    value: Any


@router.post("/rules/{rule_id}")
async def refuse_direct_rule_write(rule_id: str, body: RuleDirectWriteBody, request: Request):
    """Direct-write to any Connect rule refuses → Change-a-Rule ceremony.

    Gate: gate_auto_run_ceiling_1000_change_a_rule_only.
    """
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    meta = get_rule_metadata(rule_id) or {}
    return JSONResponse(
        status_code=422,
        content={
            "outcome": "refused",
            "reason": "connect_rule_change_a_rule_only",
            "detail": (
                f"Rule {rule_id} changes only via the Change-a-Rule ceremony "
                f"(Canon §7.5). Direct write is refused."
            ),
            "route_to_approval": "Open Govern · Change a rule",
            "route": "/govern/change-rule",
            "rule_id": rule_id,
            "rule_class": meta.get("rule_class"),
        },
    )


# --------- §4.1 · sources ----------------------------------------------------


class NewSourceBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    source_id: str
    name: str
    protocol: str
    cadence: str
    rights_declared: str
    pii_posture: str


@router.get("/sources")
async def list_sources(request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    from services.connect.sources_store import cadence_plain, protocol_familiar
    rows = await sources_store.list_sources()
    for r in rows:
        r["protocol_familiar"] = protocol_familiar(r.get("protocol", ""))
        r["cadence_plain"] = cadence_plain(r.get("cadence", ""))
    return {
        "canon_ref": "Canon §4.1",
        "posture": "connect_seam_dormant_writes_only" if not rows else "connect_seam_operable",
        "sources": rows,
    }


@router.post("/sources", status_code=201)
async def add_source(body: NewSourceBody, request: Request):
    """master_admin adds a source in PENDING state (§4.1 role table)."""
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    if not _has_role(identity, "master_admin"):
        return _deny(
            "auth_scope_insufficient",
            "Only master_admin can add a Connect source (Canon §4.1 role table).",
        )
    if await sources_store.get_source(body.source_id) is not None:
        return JSONResponse(
            status_code=409,
            content={"reason": "source_id_exists", "detail": "source_id already registered"},
        )
    payload = body.model_dump()
    payload["state"] = sources_store.STATE_PENDING
    payload["added_by"] = getattr(identity, "email", None)
    await sources_store.insert_source(payload)
    return await sources_store.get_source(body.source_id)


@router.get("/sources/{source_id}")
async def get_source_profile(source_id: str, request: Request):
    """Source profile (Canon §4.4) — mapping card leads with the ANSWER."""
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    src = await sources_store.get_source(source_id)
    if src is None:
        return JSONResponse(status_code=404, content={"reason": "source_not_found"})
    from services.connect.sources_store import cadence_plain, protocol_familiar
    src["protocol_familiar"] = protocol_familiar(src.get("protocol", ""))
    src["cadence_plain"] = cadence_plain(src.get("cadence", ""))
    n_confirmed = src.get("fields_confirmed", 0)
    n_total = src.get("fields_total", 0)
    k_need = len(src.get("fields_need_attention", []))
    src["mapping_header"] = f"{n_confirmed} of {n_total} fields confirmed · {k_need} need attention"
    src["operator_can_resolve"] = _has_role(identity, "operator", "master_admin", "admin")
    src["canon_ref"] = "Canon §4.4"
    return src


@router.post("/sources/{source_id}/connect")
async def source_connect(source_id: str, request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    if not _has_role(identity, "operator", "master_admin", "admin"):
        return _deny(
            "auth_scope_insufficient",
            "Only operator/master_admin/admin can connect a source (Canon §4.1).",
        )
    src = await sources_store.get_source(source_id)
    if src is None:
        return JSONResponse(status_code=404, content={"reason": "source_not_found"})
    if src.get("state") not in (sources_store.STATE_PENDING, sources_store.STATE_FAILED, sources_store.STATE_AWAITING_CREDENTIALS):
        return _deny(
            "state_transition_invalid",
            f"Source is in state {src.get('state')!r}; connect only valid from pending/failed/awaiting_credentials.",
            status=409,
        )
    updated = await sources_store.update_state(source_id, sources_store.STATE_CONNECTED, last_sync_iso=None, failure_reason_plain=None)
    return updated


@router.post("/sources/{source_id}/test")
async def source_test(source_id: str, request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    if not _has_role(identity, "operator", "master_admin", "admin"):
        return _deny("auth_scope_insufficient", "Only operator/master_admin/admin can test a source.")
    src = await sources_store.get_source(source_id)
    if src is None:
        return JSONResponse(status_code=404, content={"reason": "source_not_found"})
    return {"source_id": source_id, "state": src.get("state"), "test_result": "seam · lands at OT-1a"}


@router.post("/sources/{source_id}/retry")
async def source_retry(source_id: str, request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    if not _has_role(identity, "operator", "master_admin", "admin"):
        return _deny("auth_scope_insufficient", "Only operator/master_admin/admin can retry a source.")
    src = await sources_store.get_source(source_id)
    if src is None:
        return JSONResponse(status_code=404, content={"reason": "source_not_found"})
    if src.get("state") != sources_store.STATE_FAILED:
        return _deny("state_transition_invalid", "Retry only valid from failed state.", status=409)
    updated = await sources_store.update_state(source_id, sources_store.STATE_IN_PROGRESS)
    return updated


# --------- §4.2 A5 · declared Class-D registries ------------------------------


class DeclareRegistryBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    registry_name: str
    schema_class: str = Field(..., description="pseudonymize | redact | filter")
    note: Optional[str] = None


@router.get("/declared_registries")
async def get_declared_registries(request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    rows = await sources_store.list_declared_registries()
    return {"canon_ref": "Canon §4.2 · A5", "declared": rows}


@router.post("/declared_registries", status_code=201)
async def declare_registry(body: DeclareRegistryBody, request: Request):
    identity, denial = await _identity_or_deny(request)
    if denial is not None:
        return denial
    if not _has_role(identity, "master_admin"):
        return _deny(
            "auth_scope_insufficient",
            "Only master_admin can declare a Class-D registry (Canon §4.2 A5).",
        )
    if body.schema_class not in ("pseudonymize", "redact", "filter"):
        return JSONResponse(status_code=422, content={
            "reason": "invalid_schema_class",
            "detail": "schema_class must be one of pseudonymize / redact / filter",
        })
    if await sources_store.declared_registry_exists(body.registry_name):
        return JSONResponse(status_code=409, content={
            "reason": "registry_already_declared",
            "detail": f"registry '{body.registry_name}' already declared",
        })
    await sources_store.declare_registry({
        "registry_name": body.registry_name,
        "schema_class": body.schema_class,
        "note": body.note,
        "declared_by": getattr(identity, "email", None),
    })
    return {"declared": True, "registry_name": body.registry_name}


# --------- retained dormant capability inventory ------------------------------

_DORMANT_CAPABILITIES = [
    {"capability_id": "archive_reader",   "label": "Archive reader",     "state": "dormant", "awaiting": "OT-1a"},
    {"capability_id": "cms_connector",    "label": "CMS connector",       "state": "dormant", "awaiting": "OT-1a"},
    {"capability_id": "live_stream_reader","label": "Live stream reader", "state": "dormant", "awaiting": "OT-1a"},
    {"capability_id": "webhook_receiver", "label": "Webhook receiver",    "state": "dormant", "awaiting": "OT-1a"},
]


@router.get("/capabilities")
async def get_capabilities():
    return {
        "capabilities": _DORMANT_CAPABILITIES,
        "posture": "capabilities_dormant_pending_OT_1a",
        "note": "Retained from Phase 3 sub-cycle 1 stub. Dormant-honest.",
    }
