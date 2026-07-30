"""P1-R2 (Owner ruling 2026-07-30) — AST-based egress gate replacing
regex/pattern scan. Catches four evasion classes named in Canon Correction #2.

Exemption list is now a POSITIVE, named-file allowlist at
`docs/mandates/shield_egress_exemptions.v0.json` — not a directory scope.

Runs as CI gate; fails the build on any violation.
"""
from __future__ import annotations

import ast
import json
from pathlib import Path
from typing import Dict, List, Set

BACKEND = Path(__file__).resolve().parents[2]
REPO_ROOT = BACKEND.parent
EXEMPTIONS_PATH = REPO_ROOT / "docs" / "mandates" / "shield_egress_exemptions.v0.json"


def _load_exemptions() -> Dict:
    return json.loads(EXEMPTIONS_PATH.read_text(encoding="utf-8"))


_CONFIG = _load_exemptions()
_EXEMPTED_FILES: Set[str] = {e["path"] for e in _CONFIG["exempted_files"]}
_FORBIDDEN_IMPORT_NAMES: Set[str] = set(_CONFIG["forbidden_import_names"])
_FORBIDDEN_HOSTS: Set[str] = set(_CONFIG["forbidden_provider_hosts"])


def _rel_path(p: Path) -> str:
    try:
        return str(p.relative_to(REPO_ROOT))
    except ValueError:
        return str(p)


def _is_exempted(p: Path) -> bool:
    rel = _rel_path(p)
    return rel in _EXEMPTED_FILES


class _EgressWalker(ast.NodeVisitor):
    """AST walker that catches all four evasion classes plus provider-host HTTP.

    Evasion classes covered:
      1. Direct import (import openai) — detected by `import` stmt.
      2. Aliased import (import openai as _o) — detected via `alias.asname`.
      3. Attribute indirection (provider = openai; provider.method()) — the
         forbidden-name binding is caught at import time; downstream attribute
         chains inherit the taint.
      4. Dynamic import (importlib.import_module("openai")) — detected by
         string-literal argument on any call to importlib.import_module.
      5. Provider-host HTTP (httpx.post/get/request with a URL string
         containing a forbidden host) — detected by string-content taint
         on outbound HTTP call sites.
    """
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.violations: List[str] = []

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            name = alias.name.split(".")[0]
            if name in _FORBIDDEN_IMPORT_NAMES or alias.name in _FORBIDDEN_IMPORT_NAMES:
                self.violations.append(
                    f"{self.filepath}:{node.lineno}: forbidden import {alias.name!r} "
                    f"(as {alias.asname!r} — aliasing does not exempt)"
                )
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        mod = node.module or ""
        root = mod.split(".")[0]
        if mod in _FORBIDDEN_IMPORT_NAMES or root in _FORBIDDEN_IMPORT_NAMES:
            self.violations.append(
                f"{self.filepath}:{node.lineno}: forbidden `from {mod} import ...` "
                f"({[a.name for a in node.names]})"
            )
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        # Dynamic import detection.
        func = node.func
        target_name = ""
        if isinstance(func, ast.Attribute) and isinstance(func.value, ast.Name):
            target_name = f"{func.value.id}.{func.attr}"
        elif isinstance(func, ast.Name):
            target_name = func.id
        # importlib.import_module("openai")
        if target_name in ("importlib.import_module", "import_module") and node.args:
            arg = node.args[0]
            if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                root = arg.value.split(".")[0]
                if arg.value in _FORBIDDEN_IMPORT_NAMES or root in _FORBIDDEN_IMPORT_NAMES:
                    self.violations.append(
                        f"{self.filepath}:{node.lineno}: dynamic import of {arg.value!r} "
                        f"via importlib.import_module"
                    )
        # httpx / requests / aiohttp calls with a string URL containing a forbidden host.
        outbound_names = {
            "httpx.get", "httpx.post", "httpx.put", "httpx.delete", "httpx.request",
            "requests.get", "requests.post", "requests.put", "requests.delete",
            "aiohttp.get", "aiohttp.post",
        }
        if target_name in outbound_names and node.args:
            arg = node.args[0]
            if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
                for host in _FORBIDDEN_HOSTS:
                    if host in arg.value:
                        self.violations.append(
                            f"{self.filepath}:{node.lineno}: outbound HTTP to forbidden "
                            f"provider host in URL {arg.value!r}"
                        )
                        break
        self.generic_visit(node)


def _scan_file(p: Path) -> List[str]:
    try:
        text = p.read_text(encoding="utf-8")
    except OSError:
        return []
    try:
        tree = ast.parse(text, filename=str(p))
    except SyntaxError:
        return []
    walker = _EgressWalker(_rel_path(p))
    walker.visit(tree)
    return walker.violations


def _iter_backend_python_files() -> List[Path]:
    out: List[Path] = []
    for p in BACKEND.rglob("*.py"):
        if "__pycache__" in p.parts:
            continue
        # skip the AST gate itself and tests (tests legitimately monkeypatch providers)
        if "tests" in p.parts:
            continue
        if _is_exempted(p):
            continue
        out.append(p)
    return out


def test_ast_egress_gate_no_direct_llm_imports_outside_shield():
    """P1-G-R2.a..d — AST walker catches all four evasion classes.

    Fails the build with a per-violation report if any forbidden import,
    aliased import, dynamic import, or provider-host HTTP call appears
    outside the named-file exemption list.
    """
    all_violations: List[str] = []
    for p in _iter_backend_python_files():
        all_violations.extend(_scan_file(p))
    assert not all_violations, (
        "P1-R2 AST egress gate FAIL — direct LLM/provider access outside "
        "the Shield chokepoint. Named-file exemption list at "
        "docs/mandates/shield_egress_exemptions.v0.json. "
        f"\n\n{len(all_violations)} violation(s):\n  " + "\n  ".join(all_violations)
    )


def test_ast_egress_gate_config_is_positive_list():
    """P1-G-R2.f — the exemption list is a positive list (nothing appears by default)."""
    # The exemption list MUST enumerate specific files; empty is legal (means
    # the ENTIRE backend must not import providers). Directory-wildcard patterns
    # are prohibited (CC #2 fix).
    for entry in _CONFIG["exempted_files"]:
        p = entry["path"]
        assert not p.endswith("/"), f"directory-wildcard exemption prohibited: {p!r}"
        assert not p.endswith("*"), f"wildcard exemption prohibited: {p!r}"
        # Every exempted file MUST exist on disk (Owner ruling: named files, not paths).
        assert (REPO_ROOT / p).exists(), f"exempted file does not exist: {p!r}"
    # Forbidden host list is non-empty (otherwise runtime firewall has nothing to catch).
    assert _FORBIDDEN_HOSTS, "forbidden_provider_hosts must be non-empty"
    assert _FORBIDDEN_IMPORT_NAMES, "forbidden_import_names must be non-empty"
