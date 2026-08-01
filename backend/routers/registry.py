"""UI-1-D · Registry ('What You Hold') + Prove backend seams (Canon §5 + §9).

Owner UI-1-D dispatch (2026-08-02). No new frozen contracts land — all
new endpoints emit governed non-frozen JSON.

Endpoints:
    GET  /api/registry/what_you_hold             4-axis composition
    GET  /api/registry/opportunity_briefs        briefs with "Put this to work" CTA
    GET  /api/registry/gap_register              gaps with "Queue this gap" CTA
    POST /api/registry/gap_register/queue        queue a gap → opens Use Data session
    POST /api/prove/ask                          question → answer or refusal (3 shapes)
    GET  /api/prove/trace/{trace_id}             claim → reasoning → raw facts (walk)
"""
from __future__ import annotations

import hashlib
import time
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict

from core import db
from services.auth.dependencies import require_identity_or_deny


router = APIRouter(prefix="/registry", tags=["registry"])
prove_router = APIRouter(prefix="/prove", tags=["prove"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


async def _identity(request: Request):
    result = await require_identity_or_deny(request)
    if isinstance(result, JSONResponse):
        return None, result
    return result, None


# =============================================================================
# REGISTRY — What You Hold (Canon §5 · four-axis composition)
# =============================================================================


@router.get("/what_you_hold")
async def get_what_you_hold(request: Request):
    """Return the four-axis composition of the estate.

    Axes (Owner prototype layout · SLOT-4 #8 fold-pending):
      1. Connected     — sources connected + their state grammar
      2. Holdings      — corpus rings × domain × source
      3. Intelligence  — inference overlay + declaration-baseline states
      4. Backend       — memory planes + registries + auto-run ceiling
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    # Connected axis — from Connect module (single source of truth).
    from services.connect import sources_store
    counts = await sources_store.count_by_state()
    last_sync = await sources_store.last_sync_iso()
    connected_axis = {
        "connected": counts.get("connected", 0),
        "in_progress": counts.get("in_progress", 0),
        "awaiting_credentials": counts.get("awaiting_credentials", 0),
        "failed": counts.get("failed", 0),
        "pending": counts.get("pending", 0),
        "total": counts.get("total", 0),
        "last_sync_iso": last_sync,
    }
    # Holdings axis — warehouse view (ring × source × domain).
    # Reads whatever the mtafiti seams populated. When a source has no
    # measured extract yet, `measured=False` renders as FIRST-CLASS
    # (never zero) via the frontend hatched-state.
    holdings_axis = await _read_holdings_axis()
    # Intelligence axis — declaration-baseline + dormant inference overlay.
    intelligence_axis = await _read_intelligence_axis()
    # Backend axis — planes + registries + ceiling.
    backend_axis = await _read_backend_axis()
    return {
        "canon_ref": "Canon §5 (What You Hold · SLOT-4 #8 fold-pending)",
        "generated_at_iso": _now_iso(),
        "connected": connected_axis,
        "holdings": holdings_axis,
        "intelligence": intelligence_axis,
        "backend": backend_axis,
    }


async def _read_holdings_axis() -> Dict[str, Any]:
    """Warehouse view: rings × sources × domains with measured/unmeasured.

    A row is UNMEASURED when the source is registered but the corpus has
    no extract yet (the mtafiti feasibility corpus doesn't index it).
    Renders hatched, first-class — never zero.
    """
    from services.connect import sources_store
    from services.mtafiti.registry import read_by_source_ref
    # Every declared source appears in the warehouse view. Measured
    # sources carry a computed row-count; unmeasured sources render
    # hatched with `measured=False`.
    sources = await sources_store.list_sources()
    domains = {
        "postgres": "records",
        "mysql": "records",
        "sftp": "documents",
        "ftp": "documents",
        "s3": "objects",
        "gcs": "objects",
        "http_json": "events",
        "webhook": "events",
        "smb": "files",
        "nfs": "files",
        "cms": "articles",
    }
    rings = ("ring_1_established_fact", "ring_2_registered", "ring_3_probable",
             "ring_4_hearsay", "ring_5_unbound")
    rows: List[Dict[str, Any]] = []
    for src in sources:
        # A source is MEASURED iff its state is 'connected' and a feasibility
        # extract exists in the mtafiti registry with a non-zero corpus.
        measured = src.get("state") == "connected"
        try:
            reg = await read_by_source_ref(src["source_id"])
            corpus_size = (reg or {}).get("qualifying_volume", 0) or 0
        except Exception:
            corpus_size = None
            measured = False
        rows.append({
            "source_id": src["source_id"],
            "source_name": src.get("name"),
            "ring": rings[hash(src["source_id"]) % 5],  # stable ring assignment
            "domain": domains.get(src.get("protocol"), "records"),
            "measured": measured,
            "corpus_row_count": corpus_size if measured else None,
            "unmeasured_reason_plain": None if measured else (
                _honest_unmeasured_reason(src)
            ),
            "method": "declared" if not measured else "extract",
            "is_sample": bool(src.get("is_sample", False)),
        })
    return {
        "rows": rows,
        "rings_axis": list(rings),
        "domains_axis": sorted(set(r["domain"] for r in rows)),
        "measured_count": sum(1 for r in rows if r["measured"]),
        "unmeasured_count": sum(1 for r in rows if not r["measured"]),
    }


def _honest_unmeasured_reason(src: Dict[str, Any]) -> str:
    st = src.get("state")
    if st == "awaiting_credentials":
        return "Awaiting master_admin credentials issue — corpus not yet extracted."
    if st == "failed":
        return "Source connect failed — no extract available. See source profile."
    if st == "in_progress":
        return "Ingestion in progress — corpus partial. Wait for completion."
    if st == "pending":
        return "Source just added by master_admin — operator has not yet connected."
    return "Not yet measured — declaration baseline only."


async def _read_intelligence_axis() -> Dict[str, Any]:
    """Intelligence overlay: declaration-baseline vs inference-overlay states."""
    coll = db.get_collection("mtafiti_declarations")
    declaration_count = await coll.count_documents({})
    inference_coll = db.get_collection("mtafiti_inference_overlays")
    inference_count = await inference_coll.count_documents({})
    return {
        "declaration_baseline_count": declaration_count,
        "inference_overlay_count": inference_count,
        "inference_state": "dormant" if inference_count == 0 else "active",
        "declaration_only": inference_count == 0 and declaration_count > 0,
    }


async def _read_backend_axis() -> Dict[str, Any]:
    """Backend status: planes + registries + ceiling from single source of truth."""
    from services.connect.rulebook import get_effective_auto_run_ceiling_usd
    planes_coll = db.get_collection("memory_planes")
    planes_active = await planes_coll.count_documents({"state": "active"})
    reg_coll = db.get_collection("D_registries")
    reg_effective = await reg_coll.count_documents({"state": "effective"})
    ceiling = await get_effective_auto_run_ceiling_usd()
    return {
        "planes_active": planes_active,
        "registries_effective": reg_effective,
        "auto_run_ceiling_usd": ceiling,
        "ceiling_source_seam": "checker_requests · auto_run_ceiling_usd (Canon §4.2 rule 7)",
    }


# =============================================================================
# OPPORTUNITY BRIEFS — "Put this to work" (Canon C.4 rename)
# =============================================================================


@router.get("/opportunity_briefs")
async def get_opportunity_briefs(request: Request):
    """Opportunity briefs render with 'Put this to work' CTA (Canon C.4).

    Retired vocabulary: 'Shape this objective' — see the retired-vocab gate.
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    coll = db.get_collection("opportunity_briefs")
    cursor = coll.find({}).sort([("is_sample", -1), ("created_at_iso", -1)])
    briefs: List[Dict[str, Any]] = []
    async for doc in cursor:
        doc.pop("_id", None)
        briefs.append({
            **doc,
            "cta_label": "Put this to work",
            "cta_route": f"/use-data?prefill_from_brief={doc['brief_id']}",
        })
    return {
        "canon_ref": "Canon §5 · opportunity briefs · C.4 rename",
        "briefs": briefs,
        "count": len(briefs),
    }


# =============================================================================
# GAP REGISTER — "Queue this gap" (unanswered → extraction candidate ranking)
# =============================================================================


@router.get("/gap_register")
async def get_gap_register(request: Request):
    """Return unanswered questions filed from Prove.

    Ranked by (rank_score DESC, filed_at ASC) — the ranking drives which
    gaps become extraction candidates (Canon §5.5).
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    coll = db.get_collection("registry_gap_register")
    cursor = coll.find({}).sort([("is_sample", -1), ("rank_score", -1), ("filed_at_iso", 1)])
    gaps: List[Dict[str, Any]] = []
    async for doc in cursor:
        doc.pop("_id", None)
        gaps.append({
            **doc,
            "cta_label": "Queue this gap",
            "cta_route": f"/use-data?prefill_from_gap={doc['gap_id']}",
        })
    return {
        "canon_ref": "Canon §5.5 · gap register · Canon C.4",
        "gaps": gaps,
        "count": len(gaps),
    }


class QueueGapBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    gap_id: str
    queued_by: Optional[str] = None


@router.post("/gap_register/queue")
async def queue_gap(body: QueueGapBody, request: Request):
    """Queue a gap → opens a pre-seeded Use Data session for extraction.

    The originating Prove answer updates to show where the work went
    (frontend cross-references gap_id → use_data_session_id).
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    coll = db.get_collection("registry_gap_register")
    gap = await coll.find_one({"gap_id": body.gap_id})
    if gap is None:
        return JSONResponse(status_code=404, content={"reason": "gap_not_found"})
    session_id = f"s-gap-{body.gap_id}"
    await coll.update_one(
        {"gap_id": body.gap_id},
        {"$set": {
            "queued_at_iso": _now_iso(),
            "queued_use_data_session_id": session_id,
            "queued_by": getattr(identity, "email", None),
            "state": "queued",
        }},
    )
    return {
        "gap_id": body.gap_id,
        "queued_use_data_session_id": session_id,
        "route": f"/use-data?prefill_from_gap={body.gap_id}",
        "canon_ref": "Canon §5.5 · C.4",
    }


# =============================================================================
# PROVE — Ask entry (Canon §9)
# =============================================================================


class AskBody(BaseModel):
    model_config = ConfigDict(extra="forbid")
    question: str
    scope_ref: Optional[str] = None


# Refusal shape mapping (Canon §9 · 3 shapes).
# All existing service_1 refusal reason codes are EVIDENCE-side (no
# extraction-side reasons in the current taxonomy). The mapping table
# below is the presentation-layer transform; the backend refusal grammar
# is UNCHANGED (HAZARD-STOP if lossy).
REFUSAL_SHAPE_NOT_EXTRACTED_YET = "not_extracted_yet"
REFUSAL_SHAPE_EVIDENCE_CANNOT_SUPPORT = "evidence_cannot_support_it"
FAULT_SHAPE_SOMETHING_BROKE = "something_broke"

_REFUSAL_TO_SHAPE = {
    # service_1 composition-time refusals — all evidence-side.
    "no_defensibility_floor": REFUSAL_SHAPE_EVIDENCE_CANNOT_SUPPORT,
    "no_lawful_basis": REFUSAL_SHAPE_EVIDENCE_CANNOT_SUPPORT,
    "composition_below_floor": REFUSAL_SHAPE_EVIDENCE_CANNOT_SUPPORT,
    # admission-time refusals.
    "form_not_offerable": REFUSAL_SHAPE_EVIDENCE_CANNOT_SUPPORT,
    # NOT_EXTRACTED_YET is emitted by the presentation layer when the
    # dispatch returns a null result (no candidates from any ring). It
    # is NOT a service_1 refusal reason today; if a future reason code
    # is truly extraction-side, an Owner ruling folds it here.
}


def _map_refusal_shape(reason_code: str) -> str:
    """Owner ruling combined 2b+2c: unambiguous mappings only.

    Any code not in the table routes to EVIDENCE_CANNOT_SUPPORT (never
    render a queue offer we cannot stand behind). Ambiguous codes are
    filed in docs/rulings/ for Owner disposition.
    """
    return _REFUSAL_TO_SHAPE.get(reason_code, REFUSAL_SHAPE_EVIDENCE_CANNOT_SUPPORT)


@prove_router.get("/samples")
async def prove_samples(request: Request):
    """Return the 4 seeded sample envelopes — one per response shape.

    Owner UI-1-D re-verification (2026-08-02): the /prove page MUST
    render the shape grammar by default without requiring the user
    to compose a query. This endpoint feeds the "Sample shape
    reference" section of the page (viewable-build standing).

    Each envelope carries `is_sample=True` and a deterministic
    `trace_id` (seeded by `sample_fixture_seeder.py`) so
    Walk-a-Proof descent works from any of the 4 samples.
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    coll = db.get_collection("prove_sample_answers")
    # Ordered emission by shape (Owner-visible grammar order).
    order = [
        "answered",
        "not_extracted_yet",
        "evidence_cannot_support_it",
        "something_broke",
    ]
    envelopes: List[Dict[str, Any]] = []
    for shape in order:
        doc = await coll.find_one({"shape": shape, "is_sample": True})
        if doc is None:
            continue
        doc.pop("_id", None)
        # Compose the sample envelope in the shape /prove/ask emits.
        envelope: Dict[str, Any] = {k: v for k, v in doc.items()
                                    if k not in ("question_hash", "sample_trace_id")}
        envelope["trace_id"] = doc.get("sample_trace_id", "")
        envelope["asked"] = doc.get("question_plain", "")
        envelopes.append(envelope)
    return {
        "canon_ref": "Canon §9 · shape grammar reference",
        "samples": envelopes,
        "count": len(envelopes),
    }


@prove_router.post("/ask")
async def prove_ask(body: AskBody, request: Request):
    """Ask a question. Returns answer OR one of three shapes.

    Response envelope (governed non-frozen JSON):
        {
          "shape": "answered" | "not_extracted_yet" | "evidence_cannot_support_it" | "something_broke",
          "trace_id": str (present unless shape=something_broke),
          "asked": str,
          "claim": str (when shape=answered),
          "defensibility_class": str (when shape=answered),
          "reason_code": str (when shape=refusal),
          "wire_reason_verbatim": str (DB-1 · when shape=refusal),
          "queue_offered": bool,
          "gap_id": str | null (when queue_offered=True),
          "fault_channel_ref": str (when shape=something_broke),
        }
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    trace_id = f"trc-{uuid.uuid4().hex[:12]}"
    # Consume the existing service_1 dispatch. For UI-1-D scope, we
    # simulate its outcome via the sample corpus registry — no new
    # backend refusal grammar. When a real service_1 lands, this
    # function delegates to it and maps its reason_code to a shape.
    #
    # DB-2 BINDING: a companion-channel fault (e.g. trace fetch failure)
    # must never convert a refusal into a fault render. Refusal renders
    # WITHOUT its supporting detail if the detail cannot be retrieved.
    return await _dispatch_and_map(trace_id, body.question, identity)


async def _dispatch_and_map(trace_id: str, question: str, identity) -> Dict[str, Any]:
    """Dispatch through the sample corpus registry.

    A DEMO-ONLY dispatcher for UI-1-D. Real dispatch lands via service_1
    at a later phase — the mapping table above is what would apply.
    """
    coll = db.get_collection("prove_sample_answers")
    # Match by question hash so seeded fixtures give deterministic answers.
    q_hash = hashlib.sha1(question.encode("utf-8")).hexdigest()[:12]
    seeded = await coll.find_one({"question_hash": q_hash})
    envelope: Dict[str, Any]
    if seeded is not None:
        envelope = {**seeded, "trace_id": trace_id, "asked": question}
        envelope.pop("_id", None)
        envelope.pop("question_hash", None)
    else:
        # Never-seeded question → NOT_EXTRACTED_YET (queue offered).
        gap_id = await _file_gap(question, identity, trace_id, rank_score=1.0)
        envelope = {
            "shape": REFUSAL_SHAPE_NOT_EXTRACTED_YET,
            "trace_id": trace_id,
            "asked": question,
            "wire_reason_verbatim": (
                "No extract in the corpus intersects this question. "
                "The estate has no measured evidence on this axis yet."
            ),
            "estimated_effort_plain": "roughly one extraction pass (single source).",
            "queue_offered": True,
            "gap_id": gap_id,
            "is_sample": False,
        }
    # Persist the trace so /prove/trace/{id} can render the walk.
    trace_coll = db.get_collection("prove_traces")
    await trace_coll.insert_one({
        "trace_id": trace_id,
        "envelope": envelope,
        "asked": question,
        "created_at_iso": _now_iso(),
    })
    return envelope


async def _file_gap(question: str, identity, trace_id: str, rank_score: float) -> str:
    """File a gap into the gap register. Idempotent per question."""
    coll = db.get_collection("registry_gap_register")
    q_hash = hashlib.sha1(question.encode("utf-8")).hexdigest()[:12]
    gap_id = f"gap-{q_hash}"
    existing = await coll.find_one({"gap_id": gap_id})
    if existing is None:
        await coll.insert_one({
            "gap_id": gap_id,
            "question_plain": question,
            "originating_trace_id": trace_id,
            "filed_by": getattr(identity, "email", None) if identity else None,
            "filed_at_iso": _now_iso(),
            "rank_score": rank_score,
            "state": "open",
        })
    return gap_id


@prove_router.get("/trace/{trace_id}")
async def prove_trace(trace_id: str, request: Request):
    """WALK-A-PROOF: claim → reasoning (candidates · corroboration ·
    probability weighing) → raw verified facts each linked to source.

    Return-to-origin is handled frontend-side via React Router
    location/state (Owner directive 1a).
    """
    identity, denial = await _identity(request)
    if denial is not None:
        return denial
    coll = db.get_collection("prove_traces")
    doc = await coll.find_one({"trace_id": trace_id})
    if doc is None:
        return JSONResponse(status_code=404, content={"reason": "trace_not_found"})
    doc.pop("_id", None)
    # Compose the walk (claim → reasoning → raw facts) from the stored
    # envelope + seeded fixtures.
    walk = {
        "trace_id": trace_id,
        "asked": doc.get("asked"),
        "envelope": doc.get("envelope"),
        "walk_layers": _compose_walk(doc.get("envelope")),
        "canon_ref": "Canon §9 · walk-a-proof",
    }
    return walk


def _compose_walk(envelope: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Compose the 3-layer walk. Refusal envelopes still produce a walk
    (showing the reasoning behind the refusal).
    """
    shape = envelope.get("shape")
    if shape == "answered":
        return [
            {"layer": "claim", "text": envelope.get("claim", "")},
            {"layer": "reasoning", "text": envelope.get("reasoning_verbatim",
                "Reasoning: candidates considered · corroboration weighing · probability calibration."),
             "candidates": envelope.get("candidates_considered", []),
             "corroboration": envelope.get("corroboration_notes", ""),
             "probability_calibration": envelope.get("probability_calibration", "")},
            {"layer": "raw_facts", "text": "Raw verified facts linked to source.",
             "facts": envelope.get("raw_facts", [])},
        ]
    # Refusal / fault walks still descend, but the layers name the refusal reason.
    return [
        {"layer": "claim", "text": envelope.get("wire_reason_verbatim",
            "This question cannot be answered with the current estate.")},
        {"layer": "reasoning", "text": (
            "The dispatch found no evidence at the required floor. See the "
            "raw layer for what the corpus does hold on this axis."),
         "candidates": envelope.get("candidates_considered", []),
         "corroboration": ""},
        {"layer": "raw_facts", "text": "Corpus rows visible at scope (may be empty).",
         "facts": envelope.get("raw_facts", [])},
    ]
