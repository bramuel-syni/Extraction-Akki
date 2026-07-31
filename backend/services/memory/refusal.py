"""Memory service — governed refusal shape builder.

Owner E2 non-negotiable: governed refusal carries `outcome=refused` +
`reason` + `detail`. Auth denial carries only `reason` + `detail` (no
`outcome`). Never confuse the two shapes.

The governed refusal shape is what THIS module builds. Auth denial is
handled by `services/auth/auth_refusal.py` and is NEVER produced here.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, Optional, Set

_REASONS_PATH = Path(__file__).resolve().parent / "memory_refusal_reasons.v0.json"
_REASONS: Dict = json.loads(_REASONS_PATH.read_text(encoding="utf-8"))
_LEGAL_REASONS: Set[str] = {r["code"] for r in _REASONS["reasons"]}


class MemoryGovernedRefusal(Exception):
    """Raised at the service boundary to signal a governed refusal.

    Router catches this and emits the correct HTTP response with
    `outcome=refused` + `reason` + `detail`.
    """

    def __init__(self, reason: str, detail: str = ""):
        if reason not in _LEGAL_REASONS:
            raise ValueError(
                f"Memory governed-refusal reason {reason!r} is NOT on the closed "
                f"taxonomy. Legal reasons: {sorted(_LEGAL_REASONS)}. "
                f"Adding a new reason requires an Owner ruling."
            )
        self.reason = reason
        self.detail = detail
        super().__init__(f"{reason}: {detail}")


def legal_reasons() -> Set[str]:
    """Return the closed set of admissible governed-refusal reason codes."""
    return frozenset(_LEGAL_REASONS)


def build_refusal_response(exc: MemoryGovernedRefusal) -> Dict:
    """Build the JSON body of a governed-refusal response.

    Shape (Owner E2 non-negotiable):
        {
            "outcome": "refused",
            "reason": "<code from memory_refusal_reasons.v0.json>",
            "detail": "<human-readable explanation>"
        }
    """
    return {"outcome": "refused", "reason": exc.reason, "detail": exc.detail}
