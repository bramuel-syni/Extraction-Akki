"""G-2 Registry Maintenance · R4 attest cell #5 · v1 consolidation byte-identity.

Owner ruling: docs/rulings/g2_rm_e1_to_e3_2026-07-14.md · RM-E1 α HARD GATE:
promise-text byte-carriage only during consolidation. Any drift = HALT + log
for future amendment turn; never edited in-flight.

This test verifies:
  1. v1.md exists on-disk.
  2. Every pipe-table row in v0.md is present verbatim in v1.md.
  3. Every pipe-table row in v0.1..v0.5 supplements is present verbatim in v1.md.
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

from backend.services.registry.parser import (
    REPO_ROOT,
    SUPPLEMENT_PATHS,
    V0_PATH,
    V1_PATH,
)


_ROW_RE = re.compile(r"^\|.+\|\s*$", flags=re.MULTILINE)
_SEP_RE = re.compile(r"^\|[\s\|:\-]+\|\s*$")


def _extract_rows(text: str) -> list[str]:
    rows = _ROW_RE.findall(text)
    return [r for r in rows if not _SEP_RE.match(r)]


def test_v1_consolidated_file_exists():
    """v1 consolidated Registry lands at docs/registry/function_promise_registry_v1.md."""
    assert V1_PATH.exists(), f"v1 consolidated file missing: {V1_PATH}"


def test_v1_promise_text_byte_identical_to_source():
    """RM-E1 α HARD GATE: every v0.md + archaeological-supplement row is
    verbatim in v1.md.

    Zero drift permitted for archaeological (pre-v1) sources. Post-v1
    supplements (matching non-v0.<n> naming, e.g. `_supplement_<phase>`)
    are NEW material landing after v1 consolidation — they are NOT
    required to be inside v1.md. This is the governance §14 additive-
    supplement pattern applied to a post-consolidation registry.

    Any deviation on archaeological rows = HALT + escalate as finding for
    future ruled amendment turn per Owner ruling
    `docs/rulings/g2_rm_e1_to_e3_2026-07-14.md`.
    """
    v1_text = V1_PATH.read_text(encoding="utf-8")
    v0_text = V0_PATH.read_text(encoding="utf-8")
    v0_rows = _extract_rows(v0_text)

    drift: list[str] = []
    for row in v0_rows:
        if row not in v1_text:
            drift.append(f"v0.md row not in v1: {row[:120]}")

    archaeological_names = {
        f"function_promise_registry_v0.{i}_supplement.md" for i in range(1, 6)
    }
    for supp in SUPPLEMENT_PATHS:
        if supp.name not in archaeological_names:
            # Post-v1 supplement (governance §14 extension): new material,
            # NOT required to be inside v1.md.
            continue
        supp_rows = _extract_rows(supp.read_text(encoding="utf-8"))
        for row in supp_rows:
            if row not in v1_text:
                drift.append(f"{supp.name} row not in v1: {row[:120]}")

    assert not drift, (
        "RM-E1 α byte-identity gate FAILED · {} drift findings\n{}\n"
        "Per Owner ruling: log for future amendment turn; NEVER edit in-flight."
    ).format(len(drift), "\n".join(drift[:20]))


def test_v1_carries_v1_header_and_ruling_ref():
    """v1 header cites the G-2 ruling record."""
    v1_text = V1_PATH.read_text(encoding="utf-8")
    assert "Function-Promise Registry v1.0" in v1_text
    assert "g2_rm_e1_to_e3_2026-07-14.md" in v1_text
    assert "RM-E1 α byte-carriage" in v1_text


def test_v1_preserves_v0_lineage_immutability():
    """Standing Rule v3: v0.md + supplements remain byte-identical predecessors."""
    for path in [V0_PATH, *SUPPLEMENT_PATHS]:
        assert path.exists(), f"Predecessor file missing: {path}"
