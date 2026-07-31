"""Memory service [SLOT] constants — Owner condition (c3):
    "Eviction/persistence constants land as [SLOT]s (config-swappable,
    benchmark-stamped per SR-5 — no hand-picked constants presented as
    measured)."

Every constant here carries the [SLOT: <default>] marker in its docstring.
None of these values is presented as measured. Benchmark-stamping happens at
Sampling & Reflection when the memory workload runs on real integration keys.
"""
from __future__ import annotations

import os


def _int_env(name: str, default: int) -> int:
    val = os.environ.get(name)
    if val is None:
        return default
    try:
        return int(val)
    except ValueError:
        return default


def _optional_int_env(name: str, default):
    val = os.environ.get(name)
    if not val:
        return default
    try:
        return int(val)
    except ValueError:
        return default


# [SLOT: 10_000] Cap on working-set reference count per plane.
# Benchmark-stamp path: Sampling & Reflection at real integration key usage.
WORKING_SET_MAX_REFS_PER_PLANE: int = _int_env("AKKI_MEMORY_WORKING_SET_MAX_REFS", 10_000)

# [SLOT: 30] Reference decay half-life in days (LRU-like, exponential).
WORKING_SET_EVICTION_HALFLIFE_DAYS: int = _int_env("AKKI_MEMORY_EVICTION_HALFLIFE_DAYS", 30)

# [SLOT: null] Retention default; null = indefinite append-only per Governance §28.
# DPO ceremony required to set a positive value.
CONTRIBUTION_STORE_RETENTION_DEFAULT_DAYS = _optional_int_env(
    "AKKI_MEMORY_CONTRIBUTION_RETENTION_DAYS", None,
)

# [SLOT: 1] Minimum cited-source count required to be publication-eligible.
PUBLICATION_MIN_CITED_SOURCES: int = _int_env("AKKI_MEMORY_PUBLICATION_MIN_CITED", 1)

# [SLOT: null] Quality gate score for publication.
# NULL = threshold unset (publication attempts fail loudly per SR-5, never silently pass).
# Setting this constant is an Owner ceremony via BCR §3.11 CK-B.
PUBLICATION_QUALITY_THRESHOLD = _optional_int_env(
    "AKKI_MEMORY_PUBLICATION_QUALITY_THRESHOLD", None,
)


def publication_quality_threshold_is_set() -> bool:
    """Return True iff PUBLICATION_QUALITY_THRESHOLD has been benchmark-stamped."""
    return PUBLICATION_QUALITY_THRESHOLD is not None
