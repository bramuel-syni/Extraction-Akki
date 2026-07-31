# Engineer-Key Grant Propagation Fix — Single-Source Discipline (2026-07-31)

**Status:** LANDED · verified end-to-end by backend testing agent
**Authority:** Owner (independent verification finding + prescribed fix, 2026-07-31)
**Cycle:** 3 (Memory Service Stage B addendum)
**Canon anchors:** EE-R4 verbatim + 8_ext.md line 179 canonical

---

## Defect (found at independent verification 2026-07-31)

`POST /api/engineer/key_grants` persisted grants to the `engineer_key_grants` collection (B-3 audit-anchored store) but the grantee's `users.key_grants` array was never updated. Consequence: on the grantee's next login the JWT carried `key_grants: []` and could never pass `_has_memory_authority`.

**Effect:** the per-key plane-isolation path (`routers/memory.py` lines ~118-127 `_authorize_plane_access`, `services/memory/scoped_accessor.py` `for_plane` factory) existed in code and unit tests but was UNREACHABLE through the real auth surface. Real integrating engineers — the Memory Service's primary consumers per the Integration Brief seam contract — were locked out. Cycle-3 close claimed the gates were green on the SPEC while the SPEC had a gap.

## Owner-prescribed choice

Owner named two options and pointed at the better one:
> "(b) better single-source: identity resolution/login derives key_grants from the engineer_key_grants collection at token-issue time so there is exactly ONE store of grant truth and no mirror to drift."

## Canon check

**EE-R4 verbatim:** *"Every externally reachable endpoint enforces scope server-side — view-layer filtering alone fails review. Enforcement rides the existing B-1 scope primitive; no parallel mechanism."*

**8_ext.md §2.1.2 line 179 canonical:** *"Onward key grants | external_engineer | existing `POST /api/engineer/key_grants` | Own-scope enforced per EE-R4 at 2.1.2.a; existing B-3 ledger emission unchanged"*

Both anchors point at a single store of grant truth. Option (a) — mirror into `users.key_grants` — creates a second store; when the two disagree (e.g., a revocation lands in one but not the other), a stale-mirror grant becomes a scope-bypass vector. Option (b) has no mirror to drift.

**Choice: (b) SINGLE-SOURCE.** `engineer_key_grants` collection is the ONE store; `users.key_grants` array is now vestigial (retained for backward compatibility with pre-2026-07-31 seeded users; NEVER read for auth). No canon supports the mirror; canon actively prohibits it.

## Implementation

1. **New helper** `services/auth/engineer_key_grant_service.py::resolve_active_grants_for_email(email)` — reads `engineer_key_grants` filtered by `grantee_email=email + revoked_at IS None`; returns `List[KeyGrant]` in the identity claim shape (drops audit fields grantor_id / justification / lawful_basis_ref / issued_at / revoked_at / revocation_reason — those live on the collection row + ledger, not the JWT).
2. **New helper** `services/auth/user_store.py::resolve_identity(doc)` — async identity resolver; builds base identity via `user_doc_to_identity(doc)` then OVERWRITES `key_grants` with the single-source derivation.
3. **Login path** `user_store.authenticate` — now calls `resolve_identity` (was: `user_doc_to_identity` direct).
4. **Refresh path** `routers/auth.py::refresh` — now calls `user_store.resolve_identity` (was: `user_doc_to_identity` direct).
5. **Revocation propagation** — no extra work required: the derivation filter excludes revoked rows, so on the grantee's next login/refresh the JWT no longer carries the grant. Symmetric with issuance.
6. **Admin seed row** `services/auth/engineer_key_grant_service.py::seed_admin_grant_if_absent` — idempotently seeds admin's derivation-visible grant row into the same single-source collection. Server startup calls this after `seed_admin_if_absent`.

## End-to-end gate (M-G-E2E-1..7)

New file `backend/tests/invariants/test_memory_engineer_key_grant_e2e_propagation.py` — 7 cells all green via HTTP over ASGITransport (no in-process helpers):
- M-G-E2E-1: fresh user without grant → 403 `auth_scope_insufficient` (no outcome key)
- M-G-E2E-2: admin-grant → relogin → JWT carries grant → plane POST succeeds → `issued_to_integration_key == grant_id`
- M-G-E2E-3: cross-key HTTP break-in on GET/contribute/revoke → 403 `auth_scope_insufficient` (no outcome key)
- M-G-E2E-4: admin full-scope read is SPEC-INTENDED (recorded decision, not accident)
- M-G-E2E-5: revocation propagates on next login
- M-G-E2E-6: refresh path also single-source derived
- M-G-E2E-7: rogue grant hand-written into `users.key_grants` mirror is IGNORED at login (EE-R4 attest)

## Backend testing agent verification (iteration_6.json, 2026-07-31)

> "Cycle 3 engineer-key grant single-source propagation fix verified end-to-end. Ran full backend suite (1403 pass / 1 skip / 0 fail — no regressions). All 7 M-G-E2E invariant cells pass. Additionally exercised the propagation invariants over HTTP against the external REACT_APP_BACKEND_URL with fresh uuid-suffixed users: register-without-grant-denied, admin-grant→relogin→identity.key_grants carries grant → memory plane POST succeeds with issued_to_integration_key == grant_id, cross-key break-in on GET/contribute/revoke → 403 auth_scope_insufficient (no outcome key), admin full-scope read succeeds, revocation propagates on next login AND through refresh with an OLD refresh token minted pre-revocation (single-source discipline holds through refresh path). Governed refusal envelope carries outcome=refused+reason+detail. Auth denials omit outcome. /api/readyz and /api/system/build_info both report parity_count=34. OpenAPI ContributeRequest schema example carries all 7 required fields and all 5 rings. Backend restarted; no 'Duplicate Operation ID' warning in fresh startup logs (docs_bundle GET/HEAD split with distinct operation_ids is effective)."
>
> retest_needed: False

## Cosmetic items also folded in this fix

- `routers/docs_bundle.py`: split `@router.api_route("/{filename}", methods=["GET","HEAD"])` into two decorators (`@router.get` + `@router.head`) with distinct `operation_id` kwargs. FastAPI Duplicate-Operation-ID warning gone.
- `routers/memory.py::ContributeRequest`: added `ConfigDict(json_schema_extra=...)` with a valid example payload carrying `content_ref` + all 5 rings + `class_declared` + `cited_sources` + `cited_source_classes` + `rights_class` + `intended_scope`. Downstream integrator can copy-paste.

## Enforcement-cell count re-measured

Cycle 3 total: 24 (M-G) + 25 (P2 buildable-now) + **7 new M-G-E2E cells** = **56 new enforcement cells**. Backend test count: **1403 passing** (was 1382 at initial close; +21 tests all in the E2E propagation suite).

═══════════════════════════════════════════════════════════════════
