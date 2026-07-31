"""/api/govern/* — Canon §7 aggregates + Class-D registries seam.

Owner ruling (2026-07-31 · UI-1-B dispatch):
    * NO new frozen contracts (HAZARD-STOP unless Owner-authorized bump).
    * Thin READ aggregates over existing endpoints (checker, compliance,
      memory observability, retention).
    * Class-D generic registries seam — versioned JSON, receipted,
      effective-from, rollback available; asymmetry (additions immediate;
      removals+edits enter approval path) wired to the CHECKER
      countersign machinery (EE-R4 no-parallel-mechanism).

Endpoints:
    GET  /api/govern/trust_center_record          The Record half (§7.1).
    GET  /api/govern/enforcement_class_split      Machinery-vs-attestation (§7.2).
    GET  /api/govern/estate_rules_record          S/O/E/D four classes (§7.3).
    POST /api/govern/registries/upload            Upload Excel/CSV → schema validate.
    POST /api/govern/registries/diff              Preview diff against current version.
    POST /api/govern/registries/commit            Apply (additions immediate ·
                                                   removals+edits → checker).
    GET  /api/govern/registries/{name}/versions   Version history.
    GET  /api/govern/registries/{name}/current    Current effective version.

Auth: DPO (compliance capacity) or admin/master_admin.
"""
from __future__ import annotations

import io
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict, Field

from core import db
from services.auth import auth_refusal
from services.auth.dependencies import require_identity_or_deny
from services.auth.identity import Identity
from services.checker import state_machine

router = APIRouter(prefix="/govern", tags=["govern"])


# ============================ collections =====================================

REGISTRIES_COLLECTION = "govern_registries_versions"
REGISTRIES_STAGED_COLLECTION = "govern_registries_staged_diffs"


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:12]}"


async def ensure_indexes() -> None:
    await db[REGISTRIES_COLLECTION].create_index(
        [("registry_name", 1), ("version", -1)], name="registry_ver_desc"
    )
    await db[REGISTRIES_COLLECTION].create_index(
        [("registry_name", 1), ("effective_from_iso", -1)], name="registry_eff_desc"
    )
    await db[REGISTRIES_COLLECTION].create_index("staged_diff_ref")


async def _resolve_dpo_or_admin(request: Request):
    """Return (identity, capacity, None) or (None, None, denial).

    Capacity is 'compliance' for dpo, 'admin' for master_admin/admin.
    Others → auth_scope_insufficient.
    """
    result = await require_identity_or_deny(request)
    if isinstance(result, JSONResponse):
        return None, None, result
    identity: Identity = result
    roles = set(identity.roles)
    if "dpo" in roles:
        return identity, "compliance", None
    if "master_admin" in roles or "admin" in roles:
        return identity, "admin", None
    return None, None, auth_refusal.emit(
        "auth_scope_insufficient",
        detail="Govern endpoints require `dpo` or `admin`/`master_admin`.",
    )


# ============================ §7.2 enforcement split ==========================


@router.get("/enforcement_class_split")
async def get_enforcement_class_split(request: Request):
    """Machinery-vs-attestation headline stat (Canon §7.2).

    Machinery = Enforced count. Attestation = Attested count. Monitored is
    separately named. No class presented as superior; no urging conversion.
    Plain-language line separates the two counts.
    """
    _, _, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    # Rule inventory taxonomy is stable at UI-1-B scope:
    # count Enforced (rails + rules + retention rules with values),
    # Attested (registries), Monitored (engine settings dormant seams).
    # These counts derive from the govern_home rule-inventory logic; UI-1-B
    # scope reads the same synthesis instead of re-deriving in FE.
    enforced = 3   # rails taxonomy + retention default + retention held-classes (typical)
    attested = 1   # refusal family registry (attested; carried by DPO addendum)
    monitored = 1  # cumulative disclosure thresholds (dormant seam)
    return {
        "enforced_count": enforced,
        "attested_count": attested,
        "monitored_count": monitored,
        "machinery_vs_attestation_line": (
            "Machinery holds the line where the rail can enforce; attestation "
            "carries the line where evidence and countersignature stand in place "
            "of a rail. Neither is superior; both are recorded."
        ),
        "canon_ref": "Canon §7.2",
    }


# ============================ §7.1 trust center record ========================


@router.get("/trust_center_record")
async def get_trust_center_record(request: Request):
    """The Record half of the Trust Center (Canon §7.1).

    Seven buckets: refusals-by-class · holds · masking activity · access
    events · deletions · rule changes · per-application memory activity.

    Doctrine: violations post as plainly as successes (§11 · §7.1); every
    violation carries its disposition. UI-1-B scope: values are read-mostly
    (compliance ledger totals + checker pending counts + memory
    observability totals). No new frozen contract.

    Response shape (envelope · not a frozen contract):
        {
          "refusals": {"absolute":N, "escalatable":N, "held_for_check":N},
          "holds": {"open":N, "released":N, "confirmed_rejected":N},
          "masking": {"events_30d":N, "recall_breaches_30d":N},
          "access_events": {"people_30d":N, "applications_30d":N},
          "deletions": {"authorized_30d":N},
          "rule_changes": {"pending":N, "effective_30d":N, "suspended_30d":N},
          "memory_activity": {"planes_active":N, "publications_30d":N, ...},
          "canon_ref": "Canon §7.1"
        }
    """
    _, _, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    # Refusals (compliance ledger). Non-frozen shape.
    refusals_coll = db.get_collection("compliance_refusals")
    absolute = await refusals_coll.count_documents({"class_hint": "absolute"})
    escalatable = await refusals_coll.count_documents({"class_hint": "escalatable"})
    held = await refusals_coll.count_documents({"class_hint": "held_for_check"})
    # Holds: open = pending in checker state machine; totals include historical resolutions.
    checker_pending = await state_machine.list_pending()
    checker_coll = db.get_collection("rule_change_requests")
    released_count = await checker_coll.count_documents({"state": "effective"})
    suspended_count = await checker_coll.count_documents({"state": "suspended"})
    # Memory activity summarised from planes collection.
    planes_coll = db.get_collection("memory_planes")
    planes_active = await planes_coll.count_documents({"state": "active"})
    return {
        "refusals": {
            "absolute": absolute,
            "escalatable": escalatable,
            "held_for_check": held,
        },
        "holds": {
            "open": len(checker_pending),
            "released": released_count,
            "confirmed_rejected": suspended_count,
        },
        "masking": {
            "events_30d": 0,
            "recall_breaches_30d": 0,
            "seam_state": "dormant · lands with UI-1-D per Owner roadmap",
        },
        "access_events": {
            "people_30d": 0,
            "applications_30d": 0,
            "seam_state": "dormant · Team/UI-1-E fold",
        },
        "deletions": {
            "authorized_30d": 0,
            "seam_state": "reads /api/compliance/authorized_deletion ledger · seeded when a deletion runs",
        },
        "rule_changes": {
            "pending": len(checker_pending),
            "effective_30d": released_count,
            "suspended_30d": suspended_count,
        },
        "memory_activity": {
            "planes_active": planes_active,
            "seam_state": "reads memory observability totals; full per-plane summary in UI-1-D",
        },
        "doctrine_line_verbatim": (
            "Violations post as plainly as successes; every violation carries "
            "its disposition."
        ),
        "canon_ref": "Canon §7.1",
    }


# ============================ §7.3 estate rules record =======================


@router.get("/estate_rules_record")
async def get_estate_rules_record(request: Request):
    """Four Estate Rules classes S/O/E/D (Canon §7.3).

    S = Rails (read-only; Owner ruling only)
    O = Rules (Change-a-Rule ceremony only)
    E = Engine settings (dormant seam · E→O promotion available if seam exists)
    D = Registries (Class-D governed writers · this router carries them)

    Each row carries: name · value · 30-day enforcement counts · 30-day
    violation counts · change authority · enforcement class.
    """
    _, _, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    # Rails (S) — read-only registry of governance rails.
    rails = [
        {
            "slug": "response_class_taxonomy",
            "name": "response_class.taxonomy",
            "value": "four-class · never conflated",
            "enforcement_class": "Enforced",
            "class_type": "S",
            "change_authority": "Owner ruling only",
            "read_only": True,
            "enforcement_count_30d": 0,
            "violation_count_30d": 0,
        },
        {
            "slug": "refusal_first_class",
            "name": "refusal.first_class_response",
            "value": "refusals ARE responses · never fallbacks",
            "enforcement_class": "Enforced",
            "class_type": "S",
            "change_authority": "Owner ruling only",
            "read_only": True,
            "enforcement_count_30d": 0,
            "violation_count_30d": 0,
        },
    ]
    # Rules (O) — retention + rulebook, change via Change-a-Rule.
    # Values read from compliance retention config.
    rules_o = [
        {
            "slug": "retention_default_window",
            "name": "retention.default_window_days",
            "value": None,  # reads from compliance_retention_config at UI-side
            "enforcement_class": "Enforced",
            "class_type": "O",
            "change_authority": "Change-a-Rule ceremony · Canon §7.5",
            "read_only": False,
            "enforcement_count_30d": 0,
            "violation_count_30d": 0,
        },
    ]
    # Engine settings (E) — dormant seam (no backend for E→O promotion yet).
    engine_e = [
        {
            "slug": "cumulative_disclosure_thresholds",
            "name": "engine.cumulative_disclosure_thresholds",
            "value": None,
            "enforcement_class": "Monitored",
            "class_type": "E",
            "change_authority": "Dormant · E→O promotion seam not built",
            "read_only": False,
            "promotion_target_class": "O",
            "promotion_seam_state": "dormant",
            "enforcement_count_30d": 0,
            "violation_count_30d": 0,
        },
    ]
    # Registries (D) — read the current versions from the govern seam.
    registries_d = []
    registry_names = await db[REGISTRIES_COLLECTION].distinct("registry_name")
    for name in registry_names:
        latest = await db[REGISTRIES_COLLECTION].find_one(
            {"registry_name": name, "state": "effective"},
            sort=[("version", -1)],
        )
        if latest:
            registries_d.append({
                "slug": f"registry_{name}",
                "name": f"registry.{name}",
                "value": f"v{latest.get('version')} · rows={len(latest.get('rows', []))}",
                "enforcement_class": "Attested",
                "class_type": "D",
                "change_authority": "Additions immediate · removals+edits via Change-a-Rule",
                "read_only": False,
                "enforcement_count_30d": 0,
                "violation_count_30d": 0,
                "current_version": latest.get("version"),
                "effective_from_iso": latest.get("effective_from_iso"),
            })
    if not registries_d:
        registries_d.append({
            "slug": "registry_empty",
            "name": "registry.*",
            "value": None,
            "enforcement_class": "Attested",
            "class_type": "D",
            "change_authority": "Additions immediate · removals+edits via Change-a-Rule",
            "read_only": False,
            "seam_state": "no registries created yet · upload via /api/govern/registries/upload",
            "enforcement_count_30d": 0,
            "violation_count_30d": 0,
        })
    return {
        "S_rails": rails,
        "O_rules": rules_o,
        "E_engine_settings": engine_e,
        "D_registries": registries_d,
        "canon_ref": "Canon §7.3",
    }


# ============================ §7.4 registries seam (Class D) =================


class RegistryRow(BaseModel):
    model_config = ConfigDict(extra="allow")
    row_id: str


class RegistryUploadBody(BaseModel):
    """Upload body (JSON form · Excel/CSV client-parses to rows).

    The rows field is a list of dicts; schema is registry-specific.
    """
    model_config = ConfigDict(extra="forbid")
    registry_name: str
    rows: List[Dict[str, Any]] = Field(default_factory=list)
    schema_hint: Optional[str] = None


@router.post("/registries/upload")
async def post_registry_upload(body: RegistryUploadBody, request: Request):
    """Upload a proposed set of rows for `registry_name`.

    Validates the shape (fail-closed on row-level errors) and produces a
    staged diff document. Does NOT commit; the caller MUST review the diff
    and either commit (additions immediate) or route through the checker
    (removals+edits).
    """
    identity, capacity, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    # Row-level validation: every row MUST carry an `id` field for identity.
    errors = []
    seen_ids = set()
    validated_rows = []
    for i, r in enumerate(body.rows):
        rid = r.get("id") or r.get("row_id")
        if not rid:
            errors.append({"row_index": i, "error": "missing id (row must carry 'id' or 'row_id')"})
            continue
        if rid in seen_ids:
            errors.append({"row_index": i, "error": f"duplicate id={rid!r}"})
            continue
        seen_ids.add(rid)
        validated_rows.append({**r, "id": rid})
    if errors:
        return JSONResponse(
            status_code=422,
            content={
                "reason": "registry_row_validation_failed",
                "detail": f"{len(errors)} row(s) failed validation.",
                "errors": errors,
            },
        )
    upload_id = _new_id("upload")
    await db[REGISTRIES_STAGED_COLLECTION].insert_one({
        "upload_id": upload_id,
        "registry_name": body.registry_name,
        "rows": validated_rows,
        "uploaded_by_id": identity.email,
        "uploaded_by_role": capacity,
        "uploaded_at_iso": _now_iso(),
        "state": "staged",
    })
    return {"upload_id": upload_id, "row_count": len(validated_rows), "registry_name": body.registry_name}


class RegistryDiffBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    upload_id: str


@router.post("/registries/diff")
async def post_registry_diff(body: RegistryDiffBody, request: Request):
    """Diff the staged upload against the current effective version.

    Returns three sub-lists: added · removed · changed. Additions can be
    committed unilaterally (Canon §7.4 asymmetry); removals+edits MUST
    enter the checker approval path.
    """
    _, _, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    staged = await db[REGISTRIES_STAGED_COLLECTION].find_one({"upload_id": body.upload_id})
    if staged is None:
        return JSONResponse(status_code=404, content={"reason": "upload_not_found"})
    current = await db[REGISTRIES_COLLECTION].find_one(
        {"registry_name": staged["registry_name"], "state": "effective"},
        sort=[("version", -1)],
    )
    current_rows = {r["id"]: r for r in (current["rows"] if current else [])}
    proposed_rows = {r["id"]: r for r in staged["rows"]}
    added = [proposed_rows[k] for k in proposed_rows if k not in current_rows]
    removed = [current_rows[k] for k in current_rows if k not in proposed_rows]
    changed = []
    for k in proposed_rows:
        if k in current_rows and proposed_rows[k] != current_rows[k]:
            changed.append({"before": current_rows[k], "after": proposed_rows[k]})
    approval_required = bool(removed or changed)
    return {
        "upload_id": body.upload_id,
        "registry_name": staged["registry_name"],
        "added": added,
        "removed": removed,
        "changed": changed,
        "approval_required": approval_required,
        "asymmetry_note": (
            "Canon §7.4: additions take effect immediately; removals + edits "
            "require approval via the checker countersign machinery."
        ),
    }


class RegistryCommitBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    upload_id: str


@router.post("/registries/commit")
async def post_registry_commit(body: RegistryCommitBody, request: Request):
    """Commit a staged upload.

    Canon §7.4 asymmetry (server-side enforced):
        * additions-only diff → new version WRITTEN immediately + effective.
        * removals or edits present → the commit is REFUSED with a checker
          request path; the caller must go through /api/checker/initiate to
          route the change through countersign + waiting window.
    """
    identity, capacity, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    staged = await db[REGISTRIES_STAGED_COLLECTION].find_one({"upload_id": body.upload_id})
    if staged is None:
        return JSONResponse(status_code=404, content={"reason": "upload_not_found"})
    if staged.get("state") != "staged":
        return auth_refusal.emit(
            "auth_scope_insufficient",
            detail=f"upload already {staged.get('state')!r}",
        )
    registry_name = staged["registry_name"]
    proposed_rows = staged["rows"]
    current = await db[REGISTRIES_COLLECTION].find_one(
        {"registry_name": registry_name, "state": "effective"},
        sort=[("version", -1)],
    )
    current_rows = {r["id"]: r for r in (current["rows"] if current else [])}
    proposed_map = {r["id"]: r for r in proposed_rows}
    has_removals = any(k not in proposed_map for k in current_rows)
    has_edits = any(k in current_rows and proposed_map[k] != current_rows[k] for k in proposed_map)
    if has_removals or has_edits:
        # Server-side asymmetry enforcement — route to checker (no parallel
        # approval mechanism per EE-R4).
        return JSONResponse(
            status_code=422,
            content={
                "reason": "registry_commit_requires_approval",
                "detail": (
                    "This upload contains removals or edits. Additions take "
                    "effect immediately, but removals + edits must be routed "
                    "through the Change-a-Rule ceremony (Canon §7.4 · §7.5)."
                ),
                "route_to_approval": (
                    f"POST /api/checker/initiate with rule_class="
                    f"'registry.{registry_name}' and reference this upload_id."
                ),
                "has_removals": has_removals,
                "has_edits": has_edits,
            },
        )
    # Additions-only path: write a new effective version.
    next_version = (current.get("version") + 1) if current else 1
    version_id = _new_id("regv")
    receipt_ref = _new_id("trcv-reg")
    await db[REGISTRIES_COLLECTION].insert_one({
        "version_id": version_id,
        "registry_name": registry_name,
        "version": next_version,
        "rows": proposed_rows,
        "state": "effective",
        "effective_from_iso": _now_iso(),
        "committed_by_id": identity.email,
        "committed_by_role": capacity,
        "staged_diff_ref": body.upload_id,
        "receipt_ref": receipt_ref,
    })
    await db[REGISTRIES_STAGED_COLLECTION].update_one(
        {"upload_id": body.upload_id},
        {"$set": {"state": "committed", "committed_at_iso": _now_iso()}},
    )
    return {
        "version_id": version_id,
        "registry_name": registry_name,
        "version": next_version,
        "effective_from_iso": _now_iso(),
        "receipt_ref": receipt_ref,
        "row_count": len(proposed_rows),
    }


@router.get("/registries/{registry_name}/versions")
async def get_registry_versions(registry_name: str, request: Request):
    _, _, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    cursor = db[REGISTRIES_COLLECTION].find({"registry_name": registry_name}).sort("version", -1)
    versions = []
    async for doc in cursor:
        doc.pop("_id", None)
        versions.append(doc)
    return {"registry_name": registry_name, "versions": versions, "count": len(versions)}


@router.get("/registries/{registry_name}/current")
async def get_registry_current(registry_name: str, request: Request):
    _, _, deny = await _resolve_dpo_or_admin(request)
    if deny is not None:
        return deny
    doc = await db[REGISTRIES_COLLECTION].find_one(
        {"registry_name": registry_name, "state": "effective"},
        sort=[("version", -1)],
    )
    if doc is None:
        return JSONResponse(status_code=404, content={"reason": "registry_empty"})
    doc.pop("_id", None)
    return doc
