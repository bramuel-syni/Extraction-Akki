"""Machine-Readable Registry · parser.

Reads the human-authored source-of-truth (`docs/registry/function_promise_registry_v0.md`)
plus its additive-supplements (per governance §14 · MRR-E4 β) and emits a lossless
machine-readable form.

Owner rulings landed 2026-07-11 (see /app/docs/rulings/machine_readable_registry_mrr_e1_to_e4.md):
  - MRR-E1 α : human doc → machine form, parser-derived.
  - MRR-E1 condition : machine form embeds `source_of_truth: {path, sha256}`.
  - MRR-E2 γ : dual-surface archival (inline rulings + top-level supersession ledger).
  - MRR-E4 β : rows in supplement sidecar; parser accepts combined source.

The machine form MUST NOT be hand-edited. Regenerate via /app/tools/registry/regenerate.py.
"""
from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


REPO_ROOT = Path(__file__).resolve().parents[3]
V0_PATH = REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.md"
V1_PATH = REPO_ROOT / "docs" / "registry" / "function_promise_registry_v1.md"
SUPPLEMENT_PATHS = [
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.1_supplement.md",
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.2_supplement.md",
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.3_supplement.md",
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.4_supplement.md",
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.5_supplement.md",
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.6_supplement_memory_stage_a.md",
    REPO_ROOT / "docs" / "registry" / "function_promise_registry_v0.7_supplement_phase3_subcycle1.md",
]
DOCTRINE_PATH = REPO_ROOT / "docs" / "governance" / "registry_doctrine_v1.md"
RULINGS_FINDINGS_PATH = REPO_ROOT / "docs" / "rulings" / "registry_findings_01_to_11.md"
CONSOLIDATION_LOG_PATH = REPO_ROOT / "docs" / "registry" / "consolidation_log_v0.md"


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


@dataclass
class Promise:
    promise_id: str
    text: str
    active: bool
    functions_that_cite: int
    source_citations: list[str] = field(default_factory=list)


@dataclass
class Function:
    function_id: str
    governor: str
    mandate: str
    promise: list[str]
    service_trace: list[str]
    surface: str
    enforcement: str
    cost: str
    dependencies: str
    ladder_rung: str
    owner: str
    rulings: list[dict[str, str]] = field(default_factory=list)
    source: str = "v0.md"


@dataclass
class Finding:
    finding_id: str
    subject: str
    source: str
    observation: str
    escalation_marker: str = ""
    ruling_tag: str = ""
    ruling_ref: str = ""
    owner_markers: list[str] = field(default_factory=list)


@dataclass
class RegistryModel:
    promises: list[Promise]
    functions: list[Function]
    findings: list[Finding]
    findings_supersession_ledger: list[dict[str, str]]
    source_of_truth: dict[str, str]
    supplements: list[dict[str, str]]


_PIPE_TABLE_ROW_RE = re.compile(r"^\|(.+)\|\s*$")


def _split_row(line: str) -> list[str]:
    m = _PIPE_TABLE_ROW_RE.match(line)
    if not m:
        return []
    cells = [c.strip() for c in m.group(1).split("|")]
    return cells


def _is_separator(cells: list[str]) -> bool:
    return all(re.fullmatch(r":?-+:?", c) for c in cells if c)


def _iter_pipe_tables(text: str) -> list[list[list[str]]]:
    """Yield tables as [header_row, ...data_rows] with each row as cell list."""
    tables: list[list[list[str]]] = []
    current: list[list[str]] = []
    for raw in text.splitlines():
        cells = _split_row(raw)
        if cells:
            current.append(cells)
        else:
            if len(current) >= 2:
                tables.append(current)
            current = []
    if len(current) >= 2:
        tables.append(current)
    # Strip separator rows.
    cleaned: list[list[list[str]]] = []
    for table in tables:
        rows = [r for r in table if not _is_separator(r)]
        if len(rows) >= 2:
            cleaned.append(rows)
    return cleaned


def _pipe_split_multi(value: str) -> list[str]:
    if not value or value == "—":
        return []
    parts = re.split(r"\s*·\s*|\s+\|\s+", value)
    return [p.strip() for p in parts if p.strip()]


def _promise_id_extractor(text: str) -> str:
    """First column of promise table is `promise_id` or a rendered `PROM-...` identifier."""
    m = re.match(r"^\|?\s*(PROM-[A-Za-z0-9\-]+)", text)
    if m:
        return m.group(1)
    return text.strip()


def parse_promise_table(rows: list[list[str]]) -> list[Promise]:
    header = [h.lower() for h in rows[0]]
    if "promise" not in header[0].lower() and "promise_id" not in header[0].lower():
        return []
    promises: list[Promise] = []
    for row in rows[1:]:
        if len(row) < 5:
            continue
        pid_cell = row[0]
        pid_match = re.match(r"(PROM-[A-Za-z0-9\-]+)", pid_cell)
        if not pid_match:
            continue
        promise_id = pid_match.group(1)
        text = row[1]
        active = row[2].strip().lower() in {"yes", "true"}
        try:
            functions_that_cite = int(row[3].strip())
        except ValueError:
            functions_that_cite = 0
        citations = _pipe_split_multi(row[4]) if len(row) > 4 else []
        promises.append(
            Promise(
                promise_id=promise_id,
                text=text,
                active=active,
                functions_that_cite=functions_that_cite,
                source_citations=citations,
            )
        )
    return promises


def parse_function_table(rows: list[list[str]], source_label: str) -> list[Function]:
    header = [h.strip().lower() for h in rows[0]]
    expected = {
        "function_id",
        "governor",
        "mandate",
        "promise",
        "service_trace",
        "surface",
        "enforcement",
        "cost",
        "dependencies",
        "ladder_rung",
        "owner",
    }
    header_set = set(header)
    if not expected.issubset(header_set):
        return []
    functions: list[Function] = []
    # Locate the position of the 'dependencies' column in the header for
    # smart padding: some v0.md rows omit this cell in the middle rather than
    # dropping cells at the end.
    try:
        dep_idx = header.index("dependencies")
    except ValueError:
        dep_idx = -1
    for row in rows[1:]:
        # Pad short rows preserving right-alignment when dependencies cell is missing.
        # v0.md source-of-truth reality: some rows omit the (may-be-empty) dependencies
        # cell in the middle; last column ("owner") still sits at row[-1].
        row = list(row)
        while len(row) < len(header) and dep_idx >= 0:
            row.insert(dep_idx, "")
        if len(row) < len(header):
            row = row + [""] * (len(header) - len(row))
        record = dict(zip(header, row))
        fid_cell = record.get("function_id", "")
        fid_match = re.match(r"`?([a-z][a-z0-9_.\-]+)`?", fid_cell)
        if not fid_match:
            continue
        function_id = fid_match.group(1)
        promise_list = _pipe_split_multi(record.get("promise", ""))
        st_list = _pipe_split_multi(record.get("service_trace", ""))
        functions.append(
            Function(
                function_id=function_id,
                governor=record.get("governor", ""),
                mandate=record.get("mandate", ""),
                promise=promise_list,
                service_trace=st_list,
                surface=record.get("surface", ""),
                enforcement=record.get("enforcement", ""),
                cost=record.get("cost", ""),
                dependencies=record.get("dependencies", "").strip() or "none",
                ladder_rung=record.get("ladder_rung", ""),
                owner=record.get("owner", ""),
                source=source_label,
            )
        )
    return functions


_FINDING_ID_RE = re.compile(r"^\*?\*?(Q[23]-\d{2})\*?\*?")


def parse_findings_from_v0(text: str) -> list[Finding]:
    """Parse §4 Q2 + §5 Q3 finding tables from v0.md."""
    findings: list[Finding] = []
    tables = _iter_pipe_tables(text)
    for table in tables:
        header = [h.strip().lower() for h in table[0]]
        if not header or header[0] not in {"finding_id", "orphan gate id / class", "journey step / mandate gap"}:
            continue
        for row in table[1:]:
            if len(row) < 3:
                continue
            first = row[0].strip()
            m = _FINDING_ID_RE.match(first)
            if not m:
                continue
            fid = m.group(1)
            subject = row[1] if len(row) > 1 else ""
            source = row[2] if len(row) > 2 else ""
            observation = row[3] if len(row) > 3 else ""
            # Combine all row cells; RULED tag column position differs between §4 and §5.
            row_joined = " | ".join(row)
            escalation = ""
            ruling_tag = ""
            ruling_ref = ""
            owner_markers: list[str] = []
            # Match **[RULED ... ]**. Content may include nested brackets like [OWNER: ...];
            # non-greedy match up to first ]** stops at the outer closing bracket.
            ruled_match = re.search(r"\*\*\[RULED.*?\]\*\*", row_joined, flags=re.DOTALL)
            if ruled_match:
                ruling_tag = ruled_match.group(0).strip("*")
                # Prefer the observation cell for narrative but rewrite it if the
                # RULED tag actually lived in a different cell so downstream owner-marker
                # + ledger checks find the tag verbatim.
                if ruling_tag not in observation:
                    observation = row_joined
                ref_match = re.search(r"rulings/registry_findings_01_to_11\.md §\d+", ruling_tag)
                if ref_match:
                    ruling_ref = ref_match.group(0)
            owner_markers = re.findall(r"\[OWNER: [^\]]+\]", row_joined)
            escalation_match = re.search(r"\[CLIENT-PROMISE[^\]]*\]", row_joined)
            if escalation_match:
                escalation = escalation_match.group(0)
            findings.append(
                Finding(
                    finding_id=fid,
                    subject=subject,
                    source=source,
                    observation=observation,
                    escalation_marker=escalation,
                    ruling_tag=ruling_tag,
                    ruling_ref=ruling_ref,
                    owner_markers=owner_markers,
                )
            )
    return findings


def build_supersession_ledger(findings: list[Finding]) -> list[dict[str, str]]:
    """MRR-E2 γ : top-level supersession ledger cross-referencing inline rulings."""
    ledger: list[dict[str, str]] = []
    for f in findings:
        if not f.ruling_tag:
            continue
        ledger.append(
            {
                "finding_id": f.finding_id,
                "original_state": f"[CLIENT-PROMISE · ESCALATE-AT-CLOSE]" if f.escalation_marker else "surfaced",
                "superseded_state": f"[SUPERSEDED · RULED 2026-07-11 · {f.ruling_tag}]",
                "ruling_ref": f.ruling_ref or "rulings/registry_findings_01_to_11.md",
                "ruling_date": "2026-07-11",
            }
        )
    return ledger


def attach_rulings_to_functions(functions: list[Function], findings: list[Finding]) -> None:
    """MRR-E2 γ inline rulings: attach ruling refs to any function row whose surface/id
    is mentioned in a finding's observation column.

    Registry-conservative attachment: only attach when the function_id or its unqualified
    tail appears verbatim in the finding observation. Zero interpretive attachment.
    """
    for func in functions:
        for finding in findings:
            if not finding.ruling_tag:
                continue
            tail = func.function_id.rsplit(".", 1)[-1]
            hay = finding.observation
            if func.function_id in hay or (tail and f"`{tail}`" in hay):
                func.rulings.append(
                    {
                        "finding_id": finding.finding_id,
                        "tag": finding.ruling_tag,
                        "ref": finding.ruling_ref or "rulings/registry_findings_01_to_11.md",
                    }
                )


def parse_source(v0_path: Path, supplements: list[Path]) -> RegistryModel:
    """Parse combined `(v0.md + supplements)` into a RegistryModel."""
    v0_text = v0_path.read_text(encoding="utf-8")
    supplement_texts = [(p, p.read_text(encoding="utf-8")) for p in supplements]

    combined_text = v0_text + "\n" + "\n".join(t for _, t in supplement_texts)
    tables = _iter_pipe_tables(combined_text)

    promises: list[Promise] = []
    functions: list[Function] = []
    for table in tables:
        promises.extend(parse_promise_table(table))
        # For function tables the source_label defaults to v0.md; supplements
        # override that per-table by re-parsing supplement-only content below.
        functions.extend(parse_function_table(table, source_label="v0.md"))

    # Re-mark supplement-origin function rows.
    for supp_path, supp_text in supplement_texts:
        supp_tables = _iter_pipe_tables(supp_text)
        supp_fids: set[str] = set()
        for table in supp_tables:
            for row in parse_function_table(table, source_label=supp_path.name):
                supp_fids.add(row.function_id)
        for func in functions:
            if func.function_id in supp_fids:
                func.source = supp_path.name

    findings = parse_findings_from_v0(v0_text)
    attach_rulings_to_functions(functions, findings)
    ledger = build_supersession_ledger(findings)

    v0_sha = sha256_file(v0_path)
    supplements_meta = [{"path": str(p.relative_to(REPO_ROOT)), "sha256": sha256_file(p)} for p in supplements]

    return RegistryModel(
        promises=promises,
        functions=functions,
        findings=findings,
        findings_supersession_ledger=ledger,
        source_of_truth={"path": str(v0_path.relative_to(REPO_ROOT)), "sha256": v0_sha},
        supplements=supplements_meta,
    )


def parse_v1_source(v1_path: Path, archaeological_supplements: list[Path]) -> RegistryModel:
    """G-2 · 2026-07-14: parse v1 consolidated Registry as the single active source.

    v1 contains v0.md body + all supplement bodies + §Q3-Amendments +
    §Conformance-Evidence-Registry + §M (Q4 R4 rows) — all consolidated by the
    G-2 mechanical fold (RM-E1 α byte-carriage).

    `archaeological_supplements` are recorded in metadata (`supplements` field)
    for archaeological continuity but NOT re-parsed (their content is already
    inside v1). This is the "v1 as single active source" posture per Owner
    ruling `docs/rulings/g2_rm_e1_to_e3_2026-07-14.md`.

    POST-V1 SUPPLEMENTS (governance §14 extension): any supplement in the
    SUPPLEMENT_PATHS list whose content is NOT inside v1 (identified by name
    suffix — supplements landing AFTER v1 consolidation carry the marker
    `_supplement_<phase_slug>` rather than the archaeological `v0.<n>_supplement`
    naming). These are re-parsed as ADDITIVE material. Owner ruling 2026-07-30
    cycle 3 option (b) + follow-up (2a) 2026-07-31: FPR rows land in supplement
    sidecar BEFORE each function does (AC-3), so post-v1 supplements MUST be
    parseable into the machine YAML.
    """
    v1_text = v1_path.read_text(encoding="utf-8")
    tables = _iter_pipe_tables(v1_text)

    promises: list[Promise] = []
    functions: list[Function] = []
    for table in tables:
        promises.extend(parse_promise_table(table))
        functions.extend(parse_function_table(table, source_label="v1.md"))

    # Post-v1 supplements (governance §14 extension): archaeological v0.<n>
    # supplements are already inside v1; supplements with post-v1 slug naming
    # carry NEW material and must be re-parsed additively.
    archaeological_names = {
        f"function_promise_registry_v0.{i}_supplement.md" for i in range(1, 6)
    }
    post_v1_supplements = [
        p for p in archaeological_supplements if p.name not in archaeological_names
    ]
    for supp_path in post_v1_supplements:
        supp_text = supp_path.read_text(encoding="utf-8")
        supp_tables = _iter_pipe_tables(supp_text)
        for table in supp_tables:
            promises.extend(parse_promise_table(table))
            functions.extend(parse_function_table(table, source_label=supp_path.name))

    # Deduplicate promises by promise_id (v1 body contains v0.md §2 verbatim;
    # supplements do not restate promises so no dupes expected — defensive).
    seen: set[str] = set()
    deduped: list[Promise] = []
    for p in promises:
        if p.promise_id in seen:
            continue
        seen.add(p.promise_id)
        deduped.append(p)
    promises = deduped

    # Deduplicate functions by function_id.
    seen_fids: set[str] = set()
    deduped_funcs: list[Function] = []
    for f in functions:
        if f.function_id in seen_fids:
            continue
        seen_fids.add(f.function_id)
        deduped_funcs.append(f)
    functions = deduped_funcs

    findings = parse_findings_from_v0(v1_text)
    attach_rulings_to_functions(functions, findings)
    ledger = build_supersession_ledger(findings)

    v1_sha = sha256_file(v1_path)
    supplements_meta = [
        {"path": str(p.relative_to(REPO_ROOT)), "sha256": sha256_file(p), "role": "archaeological"}
        for p in archaeological_supplements
    ]

    return RegistryModel(
        promises=promises,
        functions=functions,
        findings=findings,
        findings_supersession_ledger=ledger,
        source_of_truth={"path": str(v1_path.relative_to(REPO_ROOT)), "sha256": v1_sha},
        supplements=supplements_meta,
    )


def _yaml_scalar(value: Any) -> str:
    """Render a scalar as a YAML block-safe string. Multiline / special chars → literal block."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, int):
        return str(value)
    if value is None or value == "":
        return "\"\""
    s = str(value)
    if "\n" in s:
        indented = "\n".join(f"    {line}" for line in s.split("\n"))
        return f"|\n{indented}"
    needs_quote = any(c in s for c in [":", "#", "*", "&", "!", "|", ">", "%", "@", "`", "\""])
    if needs_quote or s.startswith(("[", "{", "-", "?", ",")):
        escaped = s.replace("\\", "\\\\").replace("\"", "\\\"")
        return f"\"{escaped}\""
    return s


def render_yaml(model: RegistryModel) -> str:
    """MRR-E1 α direction : render RegistryModel as machine-readable YAML.

    Includes MRR-E1 integrity-binding condition: top-level `source_of_truth: {path, sha256}`.
    """
    lines: list[str] = []
    lines.append("# GENERATED FROM function_promise_registry_v0.md + v0.1_supplement.md")
    lines.append("# DO NOT HAND-EDIT · regenerate via tools/registry/regenerate.py")
    lines.append("# Owner rulings MRR-E1 α · E2 γ · E3 β+addition · E4 β (2026-07-11)")
    lines.append("# Doctrine: Registry Doctrine v1.0 §8.1.d machine-readable form")
    lines.append("")
    lines.append("schema_version: \"machine_registry_v0\"")
    lines.append("generated_by: \"backend/services/registry/parser.py\"")
    lines.append("")
    lines.append("source_of_truth:")
    lines.append(f"  path: {_yaml_scalar(model.source_of_truth['path'])}")
    lines.append(f"  sha256: {_yaml_scalar(model.source_of_truth['sha256'])}")
    lines.append("")
    lines.append("supplements:")
    for supp in model.supplements:
        lines.append(f"  - path: {_yaml_scalar(supp['path'])}")
        lines.append(f"    sha256: {_yaml_scalar(supp['sha256'])}")
    lines.append("")
    lines.append(f"# Row totals: promises={len(model.promises)} · functions={len(model.functions)} · findings={len(model.findings)}")
    lines.append("")
    lines.append("promises:")
    for p in model.promises:
        lines.append(f"  - promise_id: {_yaml_scalar(p.promise_id)}")
        lines.append(f"    text: {_yaml_scalar(p.text)}")
        lines.append(f"    active: {_yaml_scalar(p.active)}")
        lines.append(f"    functions_that_cite: {_yaml_scalar(p.functions_that_cite)}")
        lines.append("    source_citations:")
        for c in p.source_citations:
            lines.append(f"      - {_yaml_scalar(c)}")
    lines.append("")
    lines.append("functions:")
    for f in model.functions:
        lines.append(f"  - function_id: {_yaml_scalar(f.function_id)}")
        lines.append(f"    governor: {_yaml_scalar(f.governor)}")
        lines.append(f"    mandate: {_yaml_scalar(f.mandate)}")
        lines.append("    promise:")
        for pr in f.promise:
            lines.append(f"      - {_yaml_scalar(pr)}")
        lines.append("    service_trace:")
        for st in f.service_trace:
            lines.append(f"      - {_yaml_scalar(st)}")
        lines.append(f"    surface: {_yaml_scalar(f.surface)}")
        lines.append(f"    enforcement: {_yaml_scalar(f.enforcement)}")
        lines.append(f"    cost: {_yaml_scalar(f.cost)}")
        lines.append(f"    dependencies: {_yaml_scalar(f.dependencies)}")
        lines.append(f"    ladder_rung: {_yaml_scalar(f.ladder_rung)}")
        lines.append(f"    owner: {_yaml_scalar(f.owner)}")
        lines.append(f"    source: {_yaml_scalar(f.source)}")
        if f.rulings:
            lines.append("    rulings:")
            for r in f.rulings:
                lines.append(f"      - finding_id: {_yaml_scalar(r['finding_id'])}")
                lines.append(f"        tag: {_yaml_scalar(r['tag'])}")
                lines.append(f"        ref: {_yaml_scalar(r['ref'])}")
        else:
            lines.append("    rulings: []")
    lines.append("")
    lines.append("findings:")
    for finding in model.findings:
        lines.append(f"  - finding_id: {_yaml_scalar(finding.finding_id)}")
        lines.append(f"    subject: {_yaml_scalar(finding.subject)}")
        lines.append(f"    source: {_yaml_scalar(finding.source)}")
        lines.append(f"    observation: {_yaml_scalar(finding.observation)}")
        lines.append(f"    escalation_marker: {_yaml_scalar(finding.escalation_marker)}")
        lines.append(f"    ruling_tag: {_yaml_scalar(finding.ruling_tag)}")
        lines.append(f"    ruling_ref: {_yaml_scalar(finding.ruling_ref)}")
        lines.append("    owner_markers:")
        for om in finding.owner_markers:
            lines.append(f"      - {_yaml_scalar(om)}")
        if not finding.owner_markers:
            lines[-1] = "    owner_markers: []"
    lines.append("")
    lines.append("findings_supersession_ledger:")
    for entry in model.findings_supersession_ledger:
        lines.append(f"  - finding_id: {_yaml_scalar(entry['finding_id'])}")
        lines.append(f"    original_state: {_yaml_scalar(entry['original_state'])}")
        lines.append(f"    superseded_state: {_yaml_scalar(entry['superseded_state'])}")
        lines.append(f"    ruling_ref: {_yaml_scalar(entry['ruling_ref'])}")
        lines.append(f"    ruling_date: {_yaml_scalar(entry['ruling_date'])}")
    lines.append("")
    return "\n".join(lines)


def build_and_render() -> str:
    model = parse_source(V0_PATH, SUPPLEMENT_PATHS)
    return render_yaml(model)


if __name__ == "__main__":
    print(build_and_render())
