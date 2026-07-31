"""Docs bundle download route — Owner Ops Request (2026-02-14).

Serves a read-only tar.gz snapshot of `/app/docs/` from a fixed
data path. Zero mutation of docs/ or contracts/. No secrets in
payload. GET only; HEAD supported via FastAPI/Starlette default.

Path layout:
    /app/backend/data/bundles/akki_docs_bundle_<date>.tar.gz

Endpoints:
    GET /api/docs-bundle/{filename}  — download named bundle
    GET /api/docs-bundle/            — list available bundles
"""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/docs-bundle", tags=["docs-bundle"])

BUNDLE_DIR = Path(__file__).resolve().parent.parent / "data" / "bundles"


@router.get("/")
async def list_bundles() -> dict:
    """List available docs bundle filenames."""
    if not BUNDLE_DIR.exists():
        return {"bundles": []}
    names = sorted(
        p.name for p in BUNDLE_DIR.iterdir()
        if p.is_file() and p.name.endswith(".tar.gz")
    )
    return {"bundles": names}


async def _serve_bundle(filename: str) -> FileResponse:
    """Shared implementation for GET / HEAD. Path traversal is refused.

    filename must not contain `/` or `..`, must end with `.tar.gz`, and must
    resolve inside BUNDLE_DIR.
    """
    if "/" in filename or ".." in filename or not filename.endswith(".tar.gz"):
        raise HTTPException(status_code=404, detail="not found")
    target = (BUNDLE_DIR / filename).resolve()
    if not str(target).startswith(str(BUNDLE_DIR.resolve()) + "/"):
        raise HTTPException(status_code=404, detail="not found")
    if not target.is_file():
        raise HTTPException(status_code=404, detail="not found")
    return FileResponse(
        path=str(target),
        media_type="application/gzip",
        filename=filename,
    )



@router.get("/{filename}", operation_id="download_docs_bundle_get")
async def download_bundle(filename: str) -> FileResponse:
    """Serve a named docs bundle as application/gzip (GET)."""
    return await _serve_bundle(filename)


@router.head("/{filename}", operation_id="download_docs_bundle_head")
async def head_bundle(filename: str) -> FileResponse:
    """HEAD variant — same guardrails as GET; distinct operation_id
    (fixes cosmetic FastAPI duplicate-op-id warning flagged at
    independent verification 2026-07-31)."""
    return await _serve_bundle(filename)
