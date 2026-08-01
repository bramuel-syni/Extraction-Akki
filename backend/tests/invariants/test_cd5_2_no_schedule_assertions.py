"""CD-5.2 · sprint-decontamination gate (backend shipped surfaces).

Owner ruling (CD-1 §5.2 · 2026-08-01):
    "no shipped surface asserts schedule, phase, or sprint names (also a
     §2.1-class leak of build state onto surfaces)."

Dormant-honest copy renders WHAT is true (registered in canon; awaits owner
dispatch); it does NOT render an assistant-invented schedule. This gate walks
every backend router + service module and fails on any of the following
patterns appearing as SHIPPED string content (i.e. not in comments and not
inside test files):

    - "scheduled for UI-<N>"           - "scheduled for Phase <X>"
    - "scheduled for sprint <X>"       - "scheduled for UI-2/UI-3/..."
    - "will be built in UI-<N>"        - "will land in UI-<N>"

The gate is intentionally cheap: a regex sweep over the raw source of the
routers/ and services/ trees. When a legitimate future-work assertion is
needed, it must render as "awaits owner dispatch" or as a Canon citation.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]

# Patterns forbidden in SHIPPED backend copy. Matched case-insensitively on
# raw source text; hits inside `#`-prefixed comments are still forbidden per
# CD-5.2 (comments become docs; docs are read; leak is leak).
FORBIDDEN_SCHEDULE_PATTERNS = [
    r"scheduled\s+for\s+UI-\d",
    r"scheduled\s+for\s+Phase\s+\w",
    r"scheduled\s+for\s+sprint\s+\w",
    r"will\s+be\s+built\s+in\s+UI-\d",
    r"will\s+land\s+in\s+UI-\d",
    r"lands\s+in\s+UI-\d",
]

# Directories to sweep (shipped source only — NOT tests).
SHIPPED_DIRS = [
    REPO_ROOT / "backend" / "routers",
    REPO_ROOT / "backend" / "services",
    REPO_ROOT / "backend" / "contracts",
    REPO_ROOT / "backend" / "models",
]

# Files whose docstrings/module-headers are EXEMPT because they are internal
# construction notes citing a Canon phase for architectural reference (not a
# shipped dormant-honest reason). Add sparingly.
EXEMPTIONS: set[str] = set()


def _iter_shipped_py_files():
    for base in SHIPPED_DIRS:
        if not base.exists():
            continue
        for p in base.rglob("*.py"):
            if "__pycache__" in p.parts:
                continue
            if str(p) in EXEMPTIONS:
                continue
            yield p


@pytest.mark.parametrize("pattern", FORBIDDEN_SCHEDULE_PATTERNS)
def test_no_shipped_schedule_assertions_backend(pattern):
    rx = re.compile(pattern, re.IGNORECASE)
    hits: list[tuple[str, int, str]] = []
    for path in _iter_shipped_py_files():
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            if rx.search(line):
                # Allow the pattern list itself (this file is the gate).
                if path == Path(__file__):
                    continue
                hits.append((str(path), lineno, line.strip()[:180]))
    assert not hits, (
        "CD-5.2 violation — shipped backend copy asserts a schedule/phase/sprint:\n"
        + "\n".join(f"  · {p}:{ln} · {snippet}" for (p, ln, snippet) in hits)
        + "\nFix: replace with 'awaits owner dispatch' or a Canon citation."
    )
