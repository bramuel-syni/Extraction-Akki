"""MemoryWriteBack_v0 — frozen envelope for a plane contribution.

Owner ruling (2026-07-30 cycle 3, option (b)) §condition (c2):
    write-back contract freeze prior is FREEZE per D4b (Stage A §3).

Contract per Integration Brief §23 verbatim (write-back contract):
    "every contribution lands in five-ring shape; class capped at what
    cited sources support; internal-only rights at birth; plane-local
    by default."

Enforcement:
    - Five-ring shape: `five_ring_stamp` field is the frozen five-rings
      shape (references contracts.five_rings). Validated at write.
    - Class cap: `class_declared` ≤ max(cited_source classes). Enforced
      by services/memory/write_back.py::enforce_class_cap.
    - Internal-only rights at birth: `rights_class` defaults to
      `internal_only`; changing requires a separate publication act.
    - Plane-local by default: `intended_scope` defaults to
      `mind_context_only`; `registry_publication` requires the
      governed publication ceremony (services/memory/publication.py).
"""
from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MemoryWriteBack_v0(BaseModel):
    """Write-back contribution envelope (plane-local by default)."""

    model_config = ConfigDict(extra="forbid")

    contribution_id: str = Field(
        ...,
        min_length=1,
        description="Server-minted unique contribution identifier (uuid-hex, prefix `wb-`).",
    )
    plane_id: str = Field(
        ...,
        min_length=1,
        description="Plane this contribution lands in. Enforced by scoped_accessor.",
    )
    content_ref: str = Field(
        ...,
        description=(
            "Reference to the contribution's byte content in the artifact store. "
            "Never the content inline — references, not copies."
        ),
    )
    five_ring_stamp: Dict[str, Any] = Field(
        ...,
        description=(
            "The five-rings shape carried by this contribution (content, provenance, "
            "defensibility, context, re-extraction handle). See contracts/five_rings.py "
            "for the ring schema. Validated at write."
        ),
    )
    class_declared: str = Field(
        ...,
        min_length=1,
        description=(
            "Class declared for the contribution (matches Solva's class taxonomy). "
            "Capped at max(cited_source classes) by write_back.enforce_class_cap."
        ),
    )
    cited_sources: List[str] = Field(
        ...,
        min_length=1,
        description="Cited source references. At least one required; drives class cap.",
    )
    rights_class: Literal[
        "internal_only", "registry_visible", "public_receipt",
    ] = Field(
        default="internal_only",
        description=(
            "Rights class at birth. Default `internal_only`. Widening requires a "
            "separate publication ceremony (Owner ruling condition (c2) implicit — "
            "publication is a governed act, never automatic)."
        ),
    )
    intended_scope: Literal[
        "mind_context_only", "registry_publication",
    ] = Field(
        default="mind_context_only",
        description=(
            "Where the contribution is intended to land. Default plane-local; "
            "`registry_publication` triggers the governed publication ceremony."
        ),
    )
    created_at: str = Field(
        ...,
        description="ISO-8601 UTC timestamp of contribution acceptance.",
    )

    @field_validator("cited_sources")
    @classmethod
    def _at_least_one_cited_source(cls, v: List[str]) -> List[str]:
        """Enforce non-empty cited_sources (validates min_length semantically)."""
        if not v:
            raise ValueError(
                "cited_sources must be non-empty — class cap requires at least one source"
            )
        return v
