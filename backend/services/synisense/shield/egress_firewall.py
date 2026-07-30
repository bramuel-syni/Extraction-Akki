"""Synisense Shield — runtime egress firewall (P1-R2).

Owner ruling (P1 Stage A approval, 2026-07-30) requires a runtime egress
allowlist at the process boundary to close Canon Correction #2 (single-
egress guard was regex/pattern scan; four evasion classes passed).

The firewall is an httpx transport wrapper that inspects the call stack
of every outbound HTTP request. Requests to forbidden provider hosts
from non-exempted call paths are refused at the transport layer —
nothing reaches the network.

Static AST gate (`backend/tests/invariants/test_no_direct_llm_calls_outside_shield.py`)
plus this runtime firewall together provide belt-and-braces enforcement.
"""
from __future__ import annotations

import inspect
import json
import logging
from pathlib import Path
from typing import Any, List, Optional
from urllib.parse import urlparse

import httpx

log = logging.getLogger("synisense.shield.egress_firewall")

_EXEMPTIONS_PATH = Path(__file__).resolve().parents[4] / "docs" / "mandates" / "shield_egress_exemptions.v0.json"


def _load_config() -> dict:
    """Load the egress exemptions config from disk."""
    if not _EXEMPTIONS_PATH.exists():
        # Failsafe: empty config -> no exempted files, no forbidden hosts.
        # Under this posture the firewall is a no-op; the static AST gate
        # still runs. Log loudly.
        log.warning(
            "synisense.shield.egress_firewall: exemptions config absent at %s. "
            "Runtime firewall active but with empty allowlist.",
            _EXEMPTIONS_PATH,
        )
        return {"exempted_files": [], "forbidden_import_names": [], "forbidden_provider_hosts": []}
    return json.loads(_EXEMPTIONS_PATH.read_text(encoding="utf-8"))


_CONFIG = _load_config()
_EXEMPTED_FILES = frozenset(
    entry["path"] for entry in _CONFIG.get("exempted_files", [])
)
_FORBIDDEN_HOSTS = frozenset(_CONFIG.get("forbidden_provider_hosts", []))


class EgressFirewallDenied(RuntimeError):
    """Raised when an outbound request violates the runtime allowlist."""


def _call_stack_files() -> List[str]:
    """Return the set of caller file paths (relative to repo root) on the
    current call stack, excluding this firewall's own frames."""
    files: List[str] = []
    frame = inspect.currentframe()
    # Walk back through the stack.
    seen = set()
    while frame is not None:
        fn = frame.f_code.co_filename
        # Skip this module itself.
        if "egress_firewall" not in fn and fn not in seen:
            files.append(fn)
            seen.add(fn)
        frame = frame.f_back
    return files


def _is_shield_call() -> bool:
    """True iff any frame in the current call stack lands in an exempted file."""
    stack_files = _call_stack_files()
    for f in stack_files:
        for exempted in _EXEMPTED_FILES:
            if f.endswith(exempted):
                return True
    return False


def check_egress(url: str) -> Optional[str]:
    """Check if a URL is allowed to egress from the current call stack.

    Returns None if allowed; returns a denial reason string if refused.
    """
    if not _FORBIDDEN_HOSTS:
        return None
    host = urlparse(url).hostname or ""
    for forbidden in _FORBIDDEN_HOSTS:
        if host == forbidden or host.endswith("." + forbidden):
            if not _is_shield_call():
                return (
                    f"egress_firewall_deny: outbound to forbidden provider host "
                    f"{host!r} from non-Shield call stack. "
                    f"See docs/mandates/shield_egress_exemptions.v0.json."
                )
    return None


class EgressFirewallTransport(httpx.BaseTransport):
    """httpx sync transport wrapper. Wrap any httpx.Client's transport in
    this to enforce the runtime egress firewall."""
    def __init__(self, inner: httpx.BaseTransport):
        self._inner = inner

    def handle_request(self, request: httpx.Request) -> httpx.Response:
        denial = check_egress(str(request.url))
        if denial:
            log.error("synisense.shield.egress_firewall: %s", denial)
            raise EgressFirewallDenied(denial)
        return self._inner.handle_request(request)


class EgressFirewallAsyncTransport(httpx.AsyncBaseTransport):
    """httpx async transport wrapper."""
    def __init__(self, inner: httpx.AsyncBaseTransport):
        self._inner = inner

    async def handle_async_request(self, request: httpx.Request) -> httpx.Response:
        denial = check_egress(str(request.url))
        if denial:
            log.error("synisense.shield.egress_firewall: %s", denial)
            raise EgressFirewallDenied(denial)
        return await self._inner.handle_async_request(request)


def exempted_files() -> frozenset:
    """Expose the exempted-files set for signature-inspection tests."""
    return _EXEMPTED_FILES


def forbidden_hosts() -> frozenset:
    """Expose the forbidden-hosts set for signature-inspection tests."""
    return _FORBIDDEN_HOSTS
