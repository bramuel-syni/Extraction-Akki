"""Synisense Shield — language dispatch + fail-closed language guard (P1-R1).

Owner ruling (P1 Stage A approval, 2026-07-30) closes Canon Correction #3:
layer 3 recognises multiple languages (falls back gracefully); layers
1 + 2 + 3 compose; when the composition would leave a text with high
proper-noun density but no de-id coverage, the call fails-closed with
`ServiceUnavailable`.

The implementation is intentionally minimal in P1: language detection uses
a deterministic Latin-script density heuristic (proper-noun density on
capitalised tokens excluding sentence-initial). Full multilingual NER (per-
language spaCy model dispatch) is a Phase 2 concern, gated on the Owner-
supplied estate language set.

This module provides the fail-closed guard the P1-G-R1.a gate exercises.
"""
from __future__ import annotations

import re
from typing import Tuple

# Simple heuristics; no external deps.
_WORD_RE = re.compile(r"\b[\w'\-]+\b", re.UNICODE)
_LATIN_RE = re.compile(r"[A-Za-z\u00c0-\u024f]")  # Latin + Latin extended
_CAPITALISED_RE = re.compile(r"\b[A-Z][a-z\u00c0-\u024f'\-]+\b")
_SENTENCE_INITIAL_RE = re.compile(r"(?:^|[.!?]\s+)([A-Z][a-z\u00c0-\u024f'\-]+)")

# Threshold: fraction of tokens that are capitalised-non-sentence-initial
# above which the guard treats the input as name-bearing.
PROPER_NOUN_DENSITY_THRESHOLD = 0.10

# Currently supported spaCy languages (P1 initial set; extends in Phase 2
# once Owner supplies the estate language set).
SUPPORTED_NER_LANGUAGES = frozenset({"en"})


def detect_script(text: str) -> str:
    """Best-effort script detection. Returns one of {'latin', 'other'}.

    The distinction matters because layer-1 regex catches many identifier
    patterns (emails, phones, URLs) language-independently, but NAME
    detection depends on script-specific tooling. For non-Latin scripts,
    layer-3 spaCy currently has no model, so the guard's fail-closed
    check runs to determine admissibility.
    """
    if not text:
        return "latin"
    latin_chars = sum(1 for c in text if _LATIN_RE.match(c))
    total_alpha = sum(1 for c in text if c.isalpha())
    if total_alpha == 0:
        return "latin"
    if latin_chars / total_alpha < 0.5:
        return "other"
    return "latin"


def proper_noun_density(text: str) -> Tuple[float, int]:
    """Return (density, capitalised_count).

    density = capitalised_non_sentence_initial / total_tokens.
    Sentence-initial capitals are excluded because they are grammatical
    not identifying.
    """
    tokens = _WORD_RE.findall(text)
    total = len(tokens)
    if total == 0:
        return (0.0, 0)
    sentence_initials = {m.group(1) for m in _SENTENCE_INITIAL_RE.finditer(text)}
    caps = [t for t in tokens if _CAPITALISED_RE.match(t)]
    non_initial_caps = [t for t in caps if t not in sentence_initials]
    return (len(non_initial_caps) / total, len(non_initial_caps))


def language_supported(lang: str) -> bool:
    """Return True iff `lang` (BCP-47 tag) has a spaCy NER model registered."""
    return lang in SUPPORTED_NER_LANGUAGES


def fail_closed_language_guard(
    text: str,
    *,
    tenant_catalogue_hit_count: int,
    detected_language: str = "en",
) -> Tuple[bool, str]:
    """Fail-closed language guard for the Shield chokepoint.

    Returns (should_raise, reason).

    Rules:
      1. If tenant catalogue has hits: proceed (coverage present).
      2. If detected language is supported by spaCy NER: proceed.
      3. If proper-noun density is below threshold: proceed (nothing to catch).
      4. Otherwise: FAIL-CLOSED. Raise ServiceUnavailable with reason
         `deid_coverage_insufficient_for_language`.

    This is the P1-R1 R1.a/R1.e enforcement path.
    """
    if tenant_catalogue_hit_count > 0:
        return (False, "tenant_catalogue_covered")
    if language_supported(detected_language):
        return (False, "language_ner_supported")
    density, _count = proper_noun_density(text)
    if density < PROPER_NOUN_DENSITY_THRESHOLD:
        return (False, "below_proper_noun_density_threshold")
    return (
        True,
        f"deid_coverage_insufficient_for_language: language={detected_language} "
        f"catalogue_hits=0 proper_noun_density={density:.3f} "
        f"threshold={PROPER_NOUN_DENSITY_THRESHOLD:.3f}",
    )
