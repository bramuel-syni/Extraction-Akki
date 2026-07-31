"""Phase 8 Seam 3 Sub-stage 2 — invariant re-scope AST gate.

Owner ruling (Stage A §5.1 line 257 + rulings §10 rider):
    `no_deletion_path` → `no_unauthorized_deletion_path`.

Semantics:
    * Enumerates all `.py` files under `backend/services/` +
      `backend/routers/` (production paths; tests + __pycache__ excluded).
    * grep-negative on `delete_one(`, `delete_many(`, and `.drop(` — no
      deletion I/O may occur outside the whitelist.
    * Whitelist-positive ONLY for `services/retention/authorized_deletion.py`
      — the SINGLE-SOURCE-OF-DELETION module (per Stage A §5.1 line 241
      "Contains the ONLY db.<collection>.delete_one/delete_many/drop
      call sites"). The rollback function `rollback_saturated_queue_admit`
      lives in this same file per Sub-stage 2 close-report §11 rationale
      (infra-rollback ≠ user-data retention deletion; same module owner).

Retirement note:
    * `test_northena_ledger_retention.py::test_no_deletion_path_in_northena_services`
      widened to whitelist-aware form via `test_no_unauthorized_deletion_path_in_northena_services`
      alias. The old gate is preserved as a narrow-scope pattern check
      (grep-negative on function name shapes `def delete_*` /
      `def purge_*` / `def expire_*`) — Sub-stage 2 does not add any
      such function names to `services/northena/`.

Three held-classes separately addressable (per §5.1 test matrix):
    * ledger_row  → northena_ledger collection
    * wizard_transcript → wizard_session collection
    * delivered_artifact → objectives_async_state collection
    Each class gets its own addressable gate in
    `test_phase_8_seam_3_sub_stage_2.py::§C`.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import List

import pytest

# Backend root, resolved from THIS file:
#   test lives at /app/backend/tests/invariants/test_no_unauthorized_deletion_path.py
#   backend root is 2 levels up: parents[0]=invariants, [1]=tests, [2]=backend
_BACKEND_ROOT = Path(__file__).resolve().parents[2]

# Whitelist — files where deletion I/O is authorised. Owner-anchored
# per Stage A §5.1 line 241 ("SINGLE-SOURCE-OF-DELETION module").
#
# Memory Service Stage B (2026-07-31): working-set eviction is
# usage-proportional cache-refresh (per Owner ruling 2026-07-30 cycle 3
# option (b) §"working-set persistence is usage-proportional"). It does
# NOT delete user data or ledger rows; it evicts plane-local *references*
# to artifacts held elsewhere. This is class-distinct from
# authorized_deletion of held data. Added to whitelist with rationale
# preserved inline.
_WHITELIST: List[str] = [
    "services/retention/authorized_deletion.py",
    "services/memory/working_set.py",  # cache-eviction, not user-data deletion
]

# Production scan roots (exclude tests + __pycache__).
_SCAN_ROOTS = ("services", "routers")

# Grep-target patterns — deletion I/O call sites.
_DELETION_PATTERNS = (
    re.compile(r"\.delete_one\("),
    re.compile(r"\.delete_many\("),
    re.compile(r"\.drop\("),
)


def _iter_production_python_files():
    for root in _SCAN_ROOTS:
        base = _BACKEND_ROOT / root
        if not base.exists():
            continue
        for py in base.rglob("*.py"):
            if "__pycache__" in py.parts:
                continue
            yield py


def _relative_key(path: Path) -> str:
    """Return the path relative to _BACKEND_ROOT for whitelist comparison."""
    return str(path.relative_to(_BACKEND_ROOT))


def test_no_unauthorized_deletion_path_in_production_tree():
    """Sub-stage 2 invariant re-scope (Stage A §5.1):
    NO `delete_one` / `delete_many` / `.drop(` call sites anywhere in
    the production tree except the Owner-anchored whitelist.

    Widens the pre-existing `no_deletion_path` invariant which was
    grep-negative-across-tree (with no whitelist). Now:
      * unauthorized deletion paths → violation
      * authorized deletion module → allowed

    Retires the old implicit `test_no_deletion_path_in_northena_services`
    via retirement note preserved in `test_northena_ledger_retention.py`.
    """
    offenders: List[str] = []
    for py in _iter_production_python_files():
        rel = _relative_key(py)
        if rel in _WHITELIST:
            continue
        text = py.read_text(encoding="utf-8")
        for lineno, line in enumerate(text.splitlines(), start=1):
            stripped = line.strip()
            # Skip comment/docstring lines that mention the tokens.
            if stripped.startswith("#") or stripped.startswith('"'):
                continue
            for pat in _DELETION_PATTERNS:
                if pat.search(line):
                    offenders.append(f"{rel}:{lineno}: {stripped!r}")
    assert not offenders, (
        "no_unauthorized_deletion_path INVARIANT VIOLATION — deletion I/O "
        "found outside `services/retention/authorized_deletion.py`:\n  "
        + "\n  ".join(offenders)
        + "\n\nRoute all deletion I/O through the SINGLE-SOURCE-OF-DELETION "
          "module per Stage A §5.1. For infrastructure-rollback deletions "
          "(not user-data retention), add a distinct function inside "
          "`authorized_deletion.py` and call it from your site."
    )


def test_no_unauthorized_deletion_path_whitelist_positive():
    """The whitelist entries MUST exist on disk (fail-fast on drift)."""
    for rel in _WHITELIST:
        path = _BACKEND_ROOT / rel
        assert path.exists(), (
            f"whitelist path {rel} does not exist on disk. "
            "Whitelist drift — update Owner-anchored whitelist accordingly."
        )


def test_no_unauthorized_deletion_path_whitelist_retirement_note():
    """The old `test_no_deletion_path_in_northena_services` gate MUST
    remain on disk with a retirement note preserved.

    Per Stage A §5.1 line 257 ("Retires old implicit test_no_deletion_path
    via retirement note").
    """
    old_gate = (
        _BACKEND_ROOT / "tests" / "invariants"
        / "test_northena_ledger_retention.py"
    )
    assert old_gate.exists(), "old gate module missing"
    text = old_gate.read_text(encoding="utf-8")
    # Retirement marker: the old gate must reference its widening.
    assert "no_unauthorized_deletion_path" in text, (
        "old gate `test_no_deletion_path_in_northena_services` MUST carry a "
        "retirement note referencing `no_unauthorized_deletion_path` per "
        "Stage A §5.1 line 257."
    )
