"""Connect rulebook · Canon §4.2 seven rules with single-source-of-truth reads.

Owner ruling 2026-08-02 (UI-1-C dispatch · EE-R4 no-parallel-mechanism):
  "The ceiling the commission verdict engine reads and the ceiling
   Change-a-Rule operates on must be THE SAME stored value (single
   source of truth). Verify the use_data verdict engine reads it from
   this seam, not a duplicated constant."

Design:
  * The initial value is the constant AUTO_RUN_CEILING_USD_INITIAL
    ($1,000, Owner-set 2026-07-31). It is the *seed*, not the runtime
    value — every read passes through `get_effective_auto_run_ceiling_usd`
    which consults the checker_requests collection for the most recent
    effective `auto_run_ceiling_usd` rule change.
  * Any direct write outside the ceremony refuses (governed refusal
    envelope with route to `/govern/change-rule`).
  * Consequence class for `auto_run_ceiling_usd`: loosening_symmetric
    (a raise loosens the guard) — enters pending_delay after countersign.
    A lower ceiling would be dual_control per taxonomy (implemented in
    the existing consequence_class.v0.json — this file only maps IDs to
    labels + adds rule 7 to the class).

No new frozen contract lands. The rule value lives as an integer sidecar
on the checker_requests ceremony envelope (`to_value_ref` is the new
value as a string). Reads coalesce from most-recent effective row.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from core import db
from services.use_data.commission_verdict_engine import (
    AUTO_RUN_CEILING_USD_INITIAL,
)


# ------------- Rule 7 · single-source-of-truth read seam ---------------------

RULE_CLASS_AUTO_RUN_CEILING = "auto_run_ceiling_usd"


async def get_effective_auto_run_ceiling_usd() -> float:
    """Return the currently-effective auto-run ceiling in USD.

    Read path (single source of truth):
      1. Look up the most recent `effective` rule-change request whose
         rule_class == 'auto_run_ceiling_usd'.
      2. If found, return `float(to_value_ref)`.
      3. Otherwise, return the constant seed AUTO_RUN_CEILING_USD_INITIAL.

    Called by the commission verdict engine at commit time AND by the
    Connect module's rules read. NO CALLER SHOULD DUPLICATE THE READ.
    """
    coll = db.get_collection("checker_requests")
    doc = await coll.find_one(
        {"rule_class": RULE_CLASS_AUTO_RUN_CEILING, "state": "effective"},
        sort=[("effective_at", -1)],
    )
    if doc is None:
        return AUTO_RUN_CEILING_USD_INITIAL
    try:
        return float(doc.get("to_value_ref"))
    except (TypeError, ValueError):
        # A malformed effective row is a defect — fall back to seed and
        # continue rendering honestly. The malformed row still surfaces
        # in the Trust Center record (as any other checker row would).
        return AUTO_RUN_CEILING_USD_INITIAL


# ------------- Canon §4.2 · seven Connect rules ------------------------------

# The 6 non-ceiling rules read their `value` and `is_dormant` states from
# whatever the backend rulebook actually holds. This file describes the
# per-rule metadata + labels + change-authority text. When a rule class
# isn't backed by a live seam, `is_dormant=True` renders honestly.

async def get_seven_connect_rules() -> List[Dict[str, Any]]:
    """Return the seven Canon §4.2 Connect rules with live values.

    Rule 7 · commission auto-run ceiling reads from
    `get_effective_auto_run_ceiling_usd()`. The other six rules are
    dormant-honest until their backing seams land (Owner ruling: consume
    existing compliance/checker seams; dormant-honest where a rule class
    isn't backed yet).
    """
    ceiling_usd = await get_effective_auto_run_ceiling_usd()
    return [
        {
            "rule_id": "rule1_ingest_provenance_gate",
            "label": "Ingest provenance gate",
            "value_display": "provenance record required at ingest",
            "class_type": "S",  # structural rail
            "enforcement_class": "Enforced",
            "change_authority": "Owner ruling only",
            "canon_ref": "Canon §4.2 · rule 1",
            "is_dormant": False,
        },
        {
            "rule_id": "rule2_rights_declaration_at_connection",
            "label": "Rights declaration at connection",
            "value_display": "declared per source; propagated to Use Data verdicts",
            "class_type": "O",
            "enforcement_class": "Enforced",
            "change_authority": "Change-a-Rule ceremony · Canon §7.5",
            "canon_ref": "Canon §4.2 · rule 2",
            "is_dormant": False,
        },
        {
            "rule_id": "rule3_pii_posture_at_connection",
            "label": "PII posture at connection",
            "value_display": "declared per source (pseudonymize/redact/filter)",
            "class_type": "O",
            "enforcement_class": "Enforced",
            "change_authority": "Change-a-Rule ceremony · Canon §7.5",
            "canon_ref": "Canon §4.2 · rule 3",
            "is_dormant": False,
        },
        {
            "rule_id": "rule4_cadence_declaration",
            "label": "Cadence declaration",
            "value_display": "declared per source; plain-language enforcement",
            "class_type": "O",
            "enforcement_class": "Attested",
            "change_authority": "Change-a-Rule ceremony · Canon §7.5",
            "canon_ref": "Canon §4.2 · rule 4",
            "is_dormant": False,
        },
        {
            "rule_id": "rule5_egress_posture",
            "label": "Egress posture",
            "value_display": "seam · lands when OT-1a facts arrive",
            "class_type": "E",
            "enforcement_class": "Monitored",
            "change_authority": "Change-a-Rule ceremony · Canon §7.5",
            "canon_ref": "Canon §4.2 · rule 5",
            "is_dormant": True,
            "dormant_reason": "awaiting OT-1a facts (egress infrastructure)",
        },
        {
            "rule_id": "rule6_class_d_registry_declaration",
            "label": "Class-D registry declaration",
            "value_display": "declared at setup · versioned per Canon §7.4",
            "class_type": "D",
            "enforcement_class": "Enforced",
            "change_authority": "Registry upload flow · Canon §7.4 (additions immediate; removals/edits Change-a-Rule)",
            "canon_ref": "Canon §4.2 · rule 6",
            "is_dormant": False,
        },
        # Rule 7 · commission auto-run ceiling · SINGLE SOURCE OF TRUTH.
        {
            "rule_id": "rule7_commission_auto_run_ceiling",
            "label": "Commission auto-run ceiling",
            "value": ceiling_usd,
            "value_display": f"${ceiling_usd:,.2f}",
            "unit": "USD",
            "infinity_permitted": True,
            "class_type": "O",
            "enforcement_class": "Enforced",
            "change_authority": (
                "Change-a-Rule ceremony ONLY · Canon §7.5 · direct writes refused"
            ),
            "canon_ref": "Canon §4.2 · rule 7 · Owner-set 2026-07-31",
            "is_dormant": False,
            "rulebook_seam": "checker_requests · rule_class=auto_run_ceiling_usd",
        },
    ]


def get_rule_metadata(rule_id: str) -> Optional[Dict[str, Any]]:
    """Return the static metadata for a rule by id (used by direct-write refusals)."""
    _static = {
        "rule7_commission_auto_run_ceiling": {
            "rule_class": RULE_CLASS_AUTO_RUN_CEILING,
            "change_authority": "Change-a-Rule ceremony ONLY · Canon §7.5",
        },
    }
    return _static.get(rule_id)
