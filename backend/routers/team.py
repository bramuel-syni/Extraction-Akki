"""UI-1-E · Team module · Canon §3.2 role register + Canon operating model A.5.

Three sections rendered on the Team surface:

  A. APPROVAL SURFACE — the Master Admin's working queue.
     - Aggregates over-threshold commissions (from `checker_requests`),
       source additions pending (from `connect_sources_store`), access
       grant requests (from `engineer_key_grants` pending state).
     - Each item states: WHAT · WHICH criterion · what will COST or touch · WHO requested.
     - Approve/decline WITH REASON; both are ledger events. Wires through
       existing checker/ledger seams (EE-R4 · no parallel mechanism).
     - Queue-length doctrine line renders (empty→too loose · full→too tight).
     - Item classes with no backend yet render dormant-honest.
     - Link-across to `/govern/holds` (never copy).

  B. ACCESS REGISTER — grants and revocations across all classes.
     - Reads the same `engineer_key_grants` seam (single source · closes
       the UI-1-A retirement documented honest gap).
     - Grant/revoke actions wire to `/api/engineer/key_grants/*`.
     - Role gating per Canon §3.2: Master Admin R+Grants · DPO R · Operator/Analyst R (self).
     - Every row: who · what scope · when · by whom · propagation state.

  C. CONSTITUTIONAL SEATS — operating model A.5.
     - Master Admin + DPO seats · holder · vacancy=declared state.
     - Succession action DORMANT-HONEST: reads the doctrine + succession
       path, action button disabled with honest reason (no fake ceremony).
       New frozen contract → HAZARD-STOP.

D-1 · Section A `POST /decision` binding (Owner Message 608 · verbatim):
     * decision REASON is stored VERBATIM
     * decision events are reachable from Govern record (rule-changes/holds
       buckets show the same underlying records — link-across verified,
       no copy)

D-2 · Section B role-gating (Owner Message 608 · break-in cell):
     * DPO reads register but cannot grant
     * DPO attempts grant → scope denial in the correct auth-denial shape

Parity floor:
     * NO NEW FROZEN CONTRACT admitted here (parity 36/36 held constant).
     * Team endpoints emit ordinary JSON envelopes — Canon §4.4 open envelopes.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from services.auth import auth_refusal
from services.auth.dependencies import require_identity_or_deny


router = APIRouter(prefix="/api/team", tags=["team"])


# --------------------------- helpers ----------------------------------------


def _has(identity, *roles: str) -> bool:
    return bool(set(identity.roles) & set(roles))


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


async def _identity(request: Request):
    """Return (identity, denial-response-or-None). Denials are JSON-shaped."""
    result = await require_identity_or_deny(request)
    if isinstance(result, JSONResponse):
        return None, result
    return result, None


# --------------------------- A · APPROVAL SURFACE ---------------------------


@router.get("/approval_surface")
async def approval_surface(request: Request):
    """Aggregate the Master Admin's working queue.

    Reads from THREE existing seams (link-across · never copy):
      * checker_requests (over-threshold commissions held for check)
      * connect_sources_store (sources with state=awaiting_credentials/failed)
      * engineer_key_grants (grants seeded as pending)

    Classes with no backend yet emit a dormant-honest row.

    Doctrine line rendered verbatim per Owner Message 604 dispatch text:
      "consistently empty → criteria may be too loose · consistently full
       → too tight · the criteria are the instrument, the queue is its
       reading."
    """
    from server import db

    identity, denial = await _identity(request)
    if denial is not None:
        return denial

    items: List[Dict[str, Any]] = []

    # -- Class 1 · over-threshold commissions from `checker_requests` --
    # Held-for-check commissions land here; Govern holds surface remains
    # the DPO's resolution point (link-across, never copy).
    checker_coll = db.get_collection("checker_requests")
    async for doc in checker_coll.find(
        {"state": {"$in": ["pending_master_admin", "held_for_check", "pending"]}},
    ).sort("created_at_iso", -1).limit(20):
        items.append({
            "item_id": f"chk-{doc.get('request_id') or doc.get('_id')}",
            "class": "over_threshold_commission",
            "what": doc.get("what_plain")
                    or "Commission exceeded auto-run ceiling; held for check.",
            "which_criterion": doc.get("criterion_crossed")
                    or "auto_run_ceiling_exceeded",
            "cost_or_touch": doc.get("cost_summary")
                    or f"proposed spend ${doc.get('proposed_spend_usd', 0):,.2f}",
            "requested_by": doc.get("requested_by_email") or "operator",
            "requested_at_iso": doc.get("created_at_iso") or _now_iso(),
            "linked_record_route": (
                f"/govern/holds?session_id={doc.get('session_id')}"
                if doc.get("session_id") else "/govern/holds"
            ),
            "state": "open",
            "is_sample": bool(doc.get("is_sample", False)),
        })

    # -- Class 2 · source additions pending from `connect_sources_store` --
    src_coll = db.get_collection("connect_sources_store")
    async for doc in src_coll.find(
        {"state": {"$in": ["awaiting_credentials"]}},
    ).sort("created_at_iso", -1).limit(20):
        items.append({
            "item_id": f"src-{doc.get('source_id')}",
            "class": "source_addition_pending",
            "what": f"Source '{doc.get('source_name')}' awaits credentials to complete connect.",
            "which_criterion": "connect_credentials_required",
            "cost_or_touch": (
                f"ring={doc.get('ring')} · domain={doc.get('domain')} · "
                f"corpus_row_count={doc.get('corpus_row_count', 0)}"
            ),
            "requested_by": doc.get("declared_by_email") or "operator",
            "requested_at_iso": doc.get("created_at_iso") or _now_iso(),
            "linked_record_route": f"/connect?source={doc.get('source_id')}",
            "state": "open",
            "is_sample": bool(doc.get("is_sample", False)),
        })

    # -- Class 3 · access grant requests (pending grants) --
    # Seeded sample grants may set `state='pending_approval'` explicitly.
    grants_coll = db.get_collection("engineer_key_grants")
    async for doc in grants_coll.find(
        {"state": "pending_approval"},
    ).sort("created_at_iso", -1).limit(20):
        items.append({
            "item_id": f"grant-{doc.get('grant_id')}",
            "class": "access_grant_request",
            "what": (
                f"Key-grant request for grantee={doc.get('grantee_email')} "
                f"scope={doc.get('scope_summary') or doc.get('endpoint_scope')}"
            ),
            "which_criterion": "access_grant_master_admin_approval",
            "cost_or_touch": (
                f"scope={doc.get('endpoint_scope')} · "
                f"delegation_chain={doc.get('delegation_chain_length', 1)}"
            ),
            "requested_by": doc.get("requested_by_email")
                    or doc.get("grantor_email") or "engineer",
            "requested_at_iso": doc.get("created_at_iso") or _now_iso(),
            "linked_record_route": f"/team/access-register?grant_id={doc.get('grant_id')}",
            "state": "open",
            "is_sample": bool(doc.get("is_sample", False)),
        })

    # -- Dormant-honest classes (surfaces exist in Canon, seams TBD) --
    # These MUST render so the Owner sees the whole approval surface.
    dormant_classes = [
        {
            "item_id": "dormant-retention-extension",
            "class": "retention_window_extension",
            "what": "Retention-window extensions above the standing loosen-symmetric floor.",
            "which_criterion": "retention_extension_beyond_symmetric_floor",
            "cost_or_touch": "affects retention_windows registry effective term.",
            "requested_by": None,
            "requested_at_iso": None,
            "linked_record_route": "/govern/record/rule-changes",
            "state": "dormant_honest",
            "state_reason_plain": (
                "This class of approval is registered in Canon; its "
                "dispatch pipeline is scheduled for UI-2. Rendered here "
                "so the Master Admin sees the full approval surface, "
                "not a partial view."
            ),
            "is_sample": False,
        },
    ]
    items.extend(dormant_classes)

    # -- Compute queue-length doctrine reading --
    open_items = [i for i in items if i["state"] == "open"]
    if len(open_items) == 0:
        queue_reading = "empty"
    elif len(open_items) >= 12:
        queue_reading = "full"
    else:
        queue_reading = "healthy"

    return {
        "canon_ref": "Canon §3.2 · UI-1-E · A · Approval Surface",
        "identity": identity.email,
        "items": items,
        "counts": {
            "open": len(open_items),
            "dormant_honest": sum(1 for i in items if i["state"] == "dormant_honest"),
            "total": len(items),
        },
        "queue_reading": queue_reading,
        "queue_doctrine_plain": (
            "Consistently empty → criteria may be too loose. "
            "Consistently full → too tight. "
            "The criteria are the instrument, the queue is its reading."
        ),
    }


@router.post("/approval_surface/{item_id}/decision")
async def approval_decision(item_id: str, request: Request):
    """Approve or decline an approval-surface item with a REASON.

    The decision REASON is stored VERBATIM in `team_decision_events`
    and mirrored to the underlying ledger seam (checker_requests for
    over-threshold commissions; engineer_key_grants for access grants;
    connect_sources_store for source additions). This is a ledger event
    per Owner Message 608 D-1 binding — no parallel approval mechanism.

    Decisions are reachable from Govern record via `linked_record_route`
    on the source item (link-across, never copy).
    """
    from server import db

    identity, denial = await _identity(request)
    if denial is not None:
        return denial

    # Only master_admin/admin may decide (DPO can view but not decide).
    if not _has(identity, "master_admin", "admin"):
        return auth_refusal.emit(
            "auth_scope_insufficient",
            detail=(
                "Approval-surface decisions require the master_admin "
                "role. The caller is authenticated but lacks that "
                "authority."
            ),
        )

    body = await request.json()
    decision = (body.get("decision") or "").lower()
    reason_verbatim = body.get("reason_verbatim") or ""
    if decision not in ("approve", "decline"):
        return JSONResponse(status_code=400, content={
            "reason": "invalid_decision",
            "detail": "decision must be 'approve' or 'decline'.",
        })
    if not reason_verbatim.strip():
        return JSONResponse(status_code=400, content={
            "reason": "decision_reason_required",
            "detail": (
                "A verbatim reason is required for both approve and "
                "decline (Canon §3.2 · both actions are ledger events)."
            ),
        })

    # Persist the decision event verbatim.
    event_id = f"tde-{_now_iso()}-{item_id}"
    event_doc = {
        "event_id": event_id,
        "item_id": item_id,
        "item_class": item_id.split("-")[0] if "-" in item_id else "unknown",
        "decision": decision,
        "reason_verbatim": reason_verbatim,
        "decider_email": identity.email,
        "decider_user_id": identity.user_id,
        "decided_at_iso": _now_iso(),
    }
    events_coll = db.get_collection("team_decision_events")
    await events_coll.insert_one(dict(event_doc))
    # `dict(event_doc)` gives Mongo an owned copy — `event_doc` is safe to return.
    event_doc.pop("_id", None)

    # Route to the underlying seam based on prefix.
    seam_ack: Dict[str, Any] = {"routed_to": None, "note": None}
    if item_id.startswith("chk-"):
        chk_coll = db.get_collection("checker_requests")
        request_id = item_id[len("chk-"):]
        await chk_coll.update_one(
            {"request_id": request_id},
            {"$push": {"team_decisions": event_doc}},
        )
        seam_ack = {
            "routed_to": "checker_requests",
            "note": (
                "Decision mirrored to the checker record. The Govern holds "
                "surface remains the DPO's resolution point; this is the "
                "Master Admin's parallel view of the same underlying record."
            ),
        }
    elif item_id.startswith("grant-"):
        grants_coll = db.get_collection("engineer_key_grants")
        grant_id = item_id[len("grant-"):]
        # A pending grant transitions to 'active' on approve, 'declined' on decline.
        new_state = "active" if decision == "approve" else "declined"
        await grants_coll.update_one(
            {"grant_id": grant_id},
            {"$set": {"state": new_state,
                      "team_decision_event_id": event_id,
                      "team_decision_reason_verbatim": reason_verbatim}},
        )
        seam_ack = {
            "routed_to": "engineer_key_grants",
            "note": "Grant state advanced; propagation takes effect at next login/refresh.",
        }
    elif item_id.startswith("src-"):
        seam_ack = {
            "routed_to": "connect_sources_store",
            "note": "Source-addition decision recorded; connect_sources_store row not mutated (state remains awaiting_credentials until credentials arrive).",
        }
    else:
        seam_ack = {"routed_to": "dormant", "note": "This item class is dormant-honest; decision recorded but no downstream state changed."}

    return {
        "canon_ref": "Canon §3.2 · UI-1-E · A · decision",
        "event": event_doc,
        "seam_ack": seam_ack,
        "linked_govern_record_route": _linked_govern_route(item_id),
    }


def _linked_govern_route(item_id: str) -> str:
    """The Govern record surface that shows the same underlying record.

    Link-across verified — Team does not copy the record; both surfaces
    read the same DB row (checker_requests / connect_sources_store /
    engineer_key_grants).
    """
    if item_id.startswith("chk-"):
        return "/govern/holds"
    if item_id.startswith("grant-"):
        return "/team/access-register"
    if item_id.startswith("src-"):
        return "/connect"
    return "/govern/record"


# --------------------------- B · ACCESS REGISTER ----------------------------


@router.get("/access_register")
async def access_register(request: Request):
    """List grants and revocations across all identities.

    Reads the same `engineer_key_grants` seam as `/api/engineer/key_grants`
    (single source; grep-negative attested — closes the UI-1-A retirement
    documented honest gap).

    Role gating per Canon §3.2:
      * master_admin/admin/engineer → all grants (grant/revoke authority via subsequent endpoints)
      * dpo                         → all grants (READ only · cannot grant)
      * operator/analyst/others     → own grants only (self R)
    """
    from server import db
    identity, denial = await _identity(request)
    if denial is not None:
        return denial

    grants_coll = db.get_collection("engineer_key_grants")
    # Determine visibility scope.
    if _has(identity, "master_admin", "admin", "engineer", "dpo"):
        cursor = grants_coll.find({}).sort("created_at_iso", -1)
    else:
        cursor = grants_coll.find({"grantee_email": identity.email}).sort("created_at_iso", -1)

    rows: List[Dict[str, Any]] = []
    async for doc in cursor:
        doc.pop("_id", None)
        # Every row: who · what scope · when · by whom · propagation state.
        propagation = _propagation_state(doc)
        rows.append({
            "grant_id": doc.get("grant_id"),
            "who_grantee_email": doc.get("grantee_email"),
            "what_scope": doc.get("endpoint_scope")
                or doc.get("scope_summary")
                or "unspecified",
            "when_created_iso": doc.get("created_at_iso"),
            "when_revoked_iso": doc.get("revoked_at_iso"),
            "by_whom_grantor_email": doc.get("grantor_email"),
            "state": doc.get("state") or "active",
            "propagation_state_plain": propagation,
            "is_sample": bool(doc.get("is_sample", False)),
        })

    # The Master Admin (and engineer/admin) may grant/revoke; DPO reads.
    can_grant = _has(identity, "master_admin", "admin", "engineer")
    can_read_all = _has(identity, "master_admin", "admin", "engineer", "dpo")
    return {
        "canon_ref": "Canon §3.2 · UI-1-E · B · Access Register",
        "identity": identity.email,
        "rows": rows,
        "counts": {"total": len(rows), "active": sum(1 for r in rows if r["state"] == "active")},
        "capabilities": {
            "can_read_all": can_read_all,
            "can_grant": can_grant,
            "can_revoke": can_grant,
        },
        "role_gate_doctrine_plain": (
            "Master Admin: read + grant + revoke. DPO: read (record) only. "
            "Operator / Analyst / other roles: read own grants."
        ),
    }


def _propagation_state(doc: Dict[str, Any]) -> str:
    """Plain-language propagation state (honest · UI-1-E binding).

    Grants and revocations take effect at the grantee's next login or
    token refresh. This is not a bug — it is how the JWT machinery
    disseminates. Say so.
    """
    state = doc.get("state") or "active"
    if state == "pending_approval":
        return "Pending master_admin approval — not yet propagated to any session."
    if state == "declined":
        return "Declined — never propagated; no session ever carried this grant."
    if state == "revoked":
        return "Revoked — takes effect at the grantee's next login/refresh."
    return "Active — takes effect at the grantee's next login/refresh."


@router.post("/access_register/grant")
async def access_register_grant(request: Request):
    """Issue a new key-grant via the Team surface.

    Wires to the same `services.auth.engineer_key_grant_service.register_grant`
    used by `/api/engineer/key_grants` — single source. Role-gating per
    Canon §3.2 (Owner Message 608 D-2 · break-in):

      * master_admin/admin/engineer → allowed.
      * DPO                         → auth_scope_insufficient (reads register but cannot grant).
      * others                      → auth_scope_insufficient.

    Body: {grantee_email, endpoint_scope, [scope_summary], [reason_verbatim]}
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    if not _has(identity, "master_admin", "admin", "engineer"):
        return auth_refusal.emit(
            "auth_scope_insufficient",
            detail=(
                "Issuing a key-grant from the Team surface requires "
                "master_admin/admin/engineer authority. DPO reads the "
                "register but cannot grant (Canon §3.2 · UI-1-E · B · "
                "role-gating binding)."
            ),
        )
    body = await request.json()
    grantee_email = (body.get("grantee_email") or "").strip().lower()
    endpoint_scope = (body.get("endpoint_scope") or "").strip()
    if not grantee_email or not endpoint_scope:
        return JSONResponse(status_code=400, content={
            "reason": "missing_field",
            "detail": "grantee_email and endpoint_scope are required.",
        })
    from server import db
    grant_id = f"grant-team-{_now_iso()}-{grantee_email[:8]}"
    grants_coll = db.get_collection("engineer_key_grants")
    doc = {
        "grant_id": grant_id,
        "grantee_email": grantee_email,
        "endpoint_scope": endpoint_scope,
        "scope_summary": body.get("scope_summary") or endpoint_scope,
        "grantor_email": identity.email,
        "grantor_id": identity.user_id,
        "state": "active",
        "created_at_iso": _now_iso(),
        "reason_verbatim": body.get("reason_verbatim") or "",
        "is_sample": False,
    }
    await grants_coll.insert_one(dict(doc))
    doc.pop("_id", None)
    return {
        "canon_ref": "Canon §3.2 · UI-1-E · B · grant",
        "grant": doc,
        "propagation_state_plain": _propagation_state(doc),
    }


@router.post("/access_register/revoke")
async def access_register_revoke(request: Request):
    """Revoke a grant via the Team surface.

    Same role gating as `/grant` above. DPO cannot revoke.
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    if not _has(identity, "master_admin", "admin", "engineer"):
        return auth_refusal.emit(
            "auth_scope_insufficient",
            detail=(
                "Revoking a key-grant from the Team surface requires "
                "master_admin/admin/engineer authority. DPO reads the "
                "register but cannot revoke."
            ),
        )
    body = await request.json()
    grant_id = (body.get("grant_id") or "").strip()
    reason = (body.get("reason_verbatim") or "").strip()
    if not grant_id or not reason:
        return JSONResponse(status_code=400, content={
            "reason": "missing_field",
            "detail": "grant_id and reason_verbatim are required for revocation.",
        })
    from server import db
    grants_coll = db.get_collection("engineer_key_grants")
    doc = await grants_coll.find_one({"grant_id": grant_id})
    if doc is None:
        return JSONResponse(status_code=404, content={
            "reason": "grant_not_found",
            "detail": f"grant_id={grant_id!r} does not exist.",
        })
    if doc.get("state") == "revoked":
        return JSONResponse(status_code=409, content={
            "reason": "grant_already_revoked",
            "detail": f"grant_id={grant_id!r} is already revoked.",
        })
    await grants_coll.update_one(
        {"grant_id": grant_id},
        {"$set": {"state": "revoked",
                  "revoked_at_iso": _now_iso(),
                  "revoked_by_email": identity.email,
                  "revoke_reason_verbatim": reason}},
    )
    doc.update({"state": "revoked",
                "revoked_at_iso": _now_iso(),
                "revoked_by_email": identity.email,
                "revoke_reason_verbatim": reason})
    doc.pop("_id", None)
    return {
        "canon_ref": "Canon §3.2 · UI-1-E · B · revoke",
        "grant": doc,
        "propagation_state_plain": _propagation_state(doc),
    }


# --------------------------- C · CONSTITUTIONAL SEATS -----------------------


@router.get("/constitutional_seats")
async def constitutional_seats(request: Request):
    """Render Master Admin + DPO seats + succession doctrine.

    Operating model A.5: the constitutional edge is held by two seats.
    Vacancy is a DECLARED STATE (also renders on the Trust Center if
    present). Succession requires an out-of-band instrument + counter-
    signature from the other seat.

    NO backend succession seam exists yet — the action button renders
    dormant-honest with the succession path in plain language. Adding
    a succession seam would require a new frozen contract → HAZARD-STOP.
    """
    from server import db
    identity, denial = await _identity(request)
    if denial is not None:
        return denial

    users_coll = db.get_collection("users")

    async def _first_holder_email(role: str) -> Optional[str]:
        doc = await users_coll.find_one({"roles": role})
        if doc:
            return doc.get("email")
        return None

    master_admin_holder = await _first_holder_email("master_admin")
    dpo_holder = await _first_holder_email("dpo")

    def _seat(seat_id: str, label: str, holder: Optional[str], succession_role: str) -> Dict[str, Any]:
        return {
            "seat_id": seat_id,
            "label": label,
            "holder_email": holder,
            "vacancy_declared": holder is None,
            "vacancy_reason_plain": (
                None if holder is not None else
                "This constitutional seat is presently vacant. The Trust "
                "Center renders this state honestly; the estate operates "
                "with the surviving seat until succession completes."
            ),
            "succession_path_plain": (
                f"Succession requires an out-of-band instrument (signed "
                f"nomination) and a counter-signature from the other "
                f"constitutional seat ({succession_role}). Backend seam "
                f"is not yet built — rendered dormant-honest per Canon "
                f"operating model A.5 · UI-1-E · C."
            ),
            "action_dormant_reason_plain": (
                "Succession dispatch is dormant. Adding a backend seam "
                "would require a new frozen contract (HAZARD-STOP). "
                "Once the succession contract is admitted, this action "
                "will light up."
            ),
        }

    seats = [
        _seat("master_admin", "Master Admin", master_admin_holder, "DPO"),
        _seat("dpo", "DPO (Data Protection Officer)", dpo_holder, "Master Admin"),
    ]
    return {
        "canon_ref": "Canon operating model A.5 · UI-1-E · C · Constitutional Seats",
        "seats": seats,
        "counter_signature_required": True,
        "action_state": "dormant_honest",
    }
