# UI-1-E · TEAM MODULE · Close report

**Filed:** 2026-08-02 · Canon §3.2 (role register · access) + Canon operating model A.5 (constitutional seats).
**Sub-cycle:** UI-1-E — final phase of UI-1. **Dispatched:** Owner Message 610 (2026-08-02). **Closed:** 2026-08-02.
**Standing preview:** https://governance-scan-3.preview.emergentagent.com
**Parity floor:** **36/36 held constant** (no frozen contract touched · HAZARD-STOP honored).
**Testing floor:** Backend **1586 pass · 4 skip · 0 fail** (+16 UI-1-E cells since UI-1-D close · 12 invariants + 4 iter23 live) · Jest **19 suites · 183 pass · 3 skipped · 0 fail** (+13 UI-1-E cells / 19 tests) · Live-preview `testing_agent_v3_fork` iter23 **found 1 CRITICAL regression** (engineer 500 on instance_id extra_forbidden) · iter24 **all 35 gates GREEN · `retest_needed: false`**.

## SLOT-3 provenance

**SLOT-3 fold-in obligation acknowledged.** The Team surface is a known Canon gap — `module_spec_06_team_module.md` was never delivered. UI-1-E was built to the Canon text (§3.2 + operating model A.5) and Owner Message 604 + 610 dispatch text. This close report enters the Team surface into the Canon-ratified record; the SLOT-3 slot is thereby folded in via built artefact plus this report. Formal `module_spec_06` may follow, or the built surface may be canonised in its place — Owner disposition awaited.

---

## 1 · Owner bindings honored (Message 604 + 610)

| # | Directive | Evidence |
|---|-----------|----------|
| A-1 | Section A: Master Admin's working queue · items state WHAT · WHICH criterion · COST/touch · WHO requested | `TeamApprovalSurfacePage.jsx` renders 4 data-testids per item: `team-approval-what-{id}` · `team-approval-criterion-{id}` · `team-approval-cost-{id}` · `team-approval-requester-{id}`. Backend `routers/team.py::approval_surface()` aggregates from 3 seams (checker_requests · connect_sources_store · engineer_key_grants). |
| A-2 | Approve/decline WITH REASON — both are ledger events wired through existing checker/ledger seams (EE-R4) | `POST /api/team/approval_surface/{id}/decision` requires `reason_verbatim` (400 if missing/whitespace). Stores event in `team_decision_events` collection AND mirrors to `checker_requests.team_decisions` array (link-across, not copy). Backend gate `test_e_a4_decision_verbatim_stored_and_ledger_event_created` asserts verbatim persistence; backend gate `test_e_a5_decision_persisted_and_appears_on_underlying_checker_record` asserts mirroring. |
| A-3 | Queue-length doctrine line renders in plain language | `data-testid="team-approval-queue-doctrine"` with `data-queue-reading` attr renders verbatim: *"Consistently empty → criteria may be too loose. Consistently full → too tight. The criteria are the instrument, the queue is its reading."* Test cell 2 asserts. |
| A-4 | Items route here from over-threshold commissions · source additions · access grant requests; link-across to /govern/holds (never copy) | 3 seams read in `approval_surface()`. Each item carries `linked_record_route`. Over-threshold items link to `/govern/holds?session_id=...`. Frontend renders `<Link data-testid="team-approval-linked-record-{id}">` on each item. After decision, confirmation shows `<Link data-testid="team-decision-goto-govern">Open the Govern record →</Link>`. **Link-across verified — the SAME `checker_requests` row is the DPO's resolution point on Govern holds; Team pushes to `team_decisions[]` on that row.** |
| A-5 | Dormant-honest classes render for item classes with no backend yet | `retention_window_extension` dormant-honest row renders unconditionally with `data-testid="team-approval-dormant-reason-{id}"` explaining "This class of approval is registered in Canon; its dispatch pipeline is scheduled for UI-2." |
| A-6 (D-1) | Decision REASON verbatim · reachable from Govern record | Backend gate D-1 (`test_e_a4`) proves verbatim. Frontend cell 5 (`gate_team_approval_decision_confirmation_and_govern_link_across`) proves link-across. Iter24 live agent verified round-trip via live HTTP. |
| B-1 | Access Register lists grants and revocations across all classes as ledger events | `GET /api/team/access_register` returns rows with grammar: `grant_id · who_grantee_email · what_scope · when_created_iso · when_revoked_iso · by_whom_grantor_email · state · propagation_state_plain · is_sample`. Table renders in TeamAccessRegisterPage.jsx with per-column headings. |
| B-2 | Engineer key-grant admin UI RETURNS here (closes UI-1-A retirement gap) | Grant issue + revoke work via Team surface. **Backend endpoints DELEGATE to `services.auth.engineer_key_grant_service.register_grant + revoke_grant` — the SAME machinery `/api/engineer/key_grants/*` uses.** Iter24 live gate `test_p0_team_grant_engineer_single_source_roundtrip` verifies the same grant_id appears on both surfaces; revoke via Team propagates `revoked_at + revocation_reason` to engineer surface. |
| B-3 | Every row shows who · what scope · when · by whom · propagation state | 5 dedicated testids per row: `team-grant-who-{id}` · `team-grant-what-{id}` · `team-grant-when-{id}` · `team-grant-by-whom-{id}` · `team-grant-propagation-{id}`. Test cell 6 asserts. |
| B-4 | Revocations show propagation state honestly (takes effect at next login/refresh) | `_propagation_state()` helper returns plain-language state: *"Active/Revoked/Pending — takes effect at the grantee's next login/refresh."* Rendered in `team-grant-propagation-{id}`. |
| B-5 | Role gating per Canon §3.2: Master Admin R+Grants · DPO R · Operator/Analyst R (self) | `_has(identity, "master_admin", "admin", "engineer")` gates grant/revoke. DPO gets `can_grant=false, can_read_all=true`; operator/analyst get self-only view. |
| B-6 (D-2) | DPO reads register but cannot grant — break-in gate | Backend gates `test_e_b2` (DPO capabilities), `test_e_b3` (DPO grant → 403 auth_scope_insufficient), `test_e_b4` (DPO revoke → 403). Frontend cell 8 asserts grant-form is REPLACED by `team-access-grant-role-denial` banner for DPO; no revoke buttons render. Iter24 live agent verified in-browser. |
| B-7 (Owner Message 610 grant→login→propagation) | Single-source machinery end-to-end (grant→login→propagation verified) | Iter24 P0 gate `test_p0_team_grant_engineer_single_source_roundtrip`: (a) Team POST /grant → grant_id; (b) same grant_id on GET /api/engineer/key_grants?grantee_email=X; (c) Team POST /revoke → revoked_at populated on engineer surface with matching revocation_reason. |
| C-1 | Constitutional Seats: Master Admin + DPO seats with holder | `GET /api/team/constitutional_seats` reads first `users` doc per role. Renders `team-seat-master_admin` + `team-seat-dpo` with `team-seat-holder-{id}`. |
| C-2 | Vacancy is a DECLARED STATE that renders on Trust Center too if present | Vacancy field `vacancy_declared: bool` set when no holder found. `team-seat-vacancy-reason-{id}` renders when vacant. (Trust Center integration is passive — vacancy is a queryable state on `/api/team/constitutional_seats`; Trust Center may query when a vacancy is declared. No current vacancies in the seed.) |
| C-3 | Succession requires out-of-band instrument + counter-signature from other seat · if no backend seam, render read-only with path described and action dormant-honest | `team-seat-succession-path-master_admin` mentions counter-signature from DPO; `team-seat-succession-path-dpo` mentions counter-signature from Master Admin. Buttons disabled (`team-seat-initiate-succession-btn-{id}`). Dormant reason mentions **HAZARD-STOP** and "new frozen contract" verbatim. |
| C-4 | New frozen contract → HAZARD-STOP | **No new frozen contract admitted.** Parity 36/36 constant throughout UI-1-E. Backend gate `test_e_g1_parity_36_unchanged` asserts. |
| D-1 | Team tile goes LIVE in Canon OS shell (last dormant tile lights up · shell fully lit) | `CanonOSShellPage.jsx` Team tile state='lit' path='/team'. Preview strip updated to *"All six modules are Canon-conformant and reachable (Connect · Registry · Use Data · Govern · Prove · Team)."* Extended shell vocab test asserts all six modules reachable · Team no longer nolink. |
| D-2 | Register Team surfaces into the systemic page-level sample-marking gate | UI-1-E Jest cells 12 (approval + access-register page-level sample-marking) enforce is_sample→SAMPLE badge invariant on Team surfaces. Sample-marking gate now covers **9 registered surfaces** including Team (approval + access register). |
| D-3 | Seeded sample queue items + grant rows per identity incl. admin | Seeder `services/team/sample_fixture_seeder.py` plants per identity: 1 sample chk-* checker_requests · 1 sample src-* connect_sources_store · 1 pending grant · 2 active grants · 1 revoked grant. `is_sample=True` on all. |
| D-4 | Extended retired-vocab gate: "Approval Queue" as NAME must NOT render | Extended `RETIRED_TERMS` list in `canon_os_root_vocab_gate.test.js` + Jest cell 11 in `ui1e_gates.test.js` asserts absence on all 4 team routes. **Positive assertion:** "Approval Surface" (Canon vocab) IS rendered on `/team/approval-surface`. |
| D-5 | Akki v4 aesthetic | Palette imported from `akkiv4_design_system` throughout: navy · sage · amber · oxblood · mist · bone · cream · ink. Label typography via AKKI_V4_TYPOGRAPHY.labels. |
| D-6 | Doctrines §11 (DB-1 wire-verbatim · DB-2 fault never shares refusal styling) | DB-1 enforced on `reason_verbatim` fields (decision + revoke). DB-2 not relevant on Team surface (no fault channel here — inherited from Prove/service). |
| D-7 | Mobile + desktop support | Live iter24 verified at 1920x800 (desktop). Mobile responsiveness via inline styles that already flex/wrap (table has horizontal scroll on narrow viewports). |
| D-8 | Parity 36/36 unchanged | `/api/readyz` returns parity_count=36 expected_parity=36. Locked by test cell `test_e_g1_parity_36_unchanged`. |
| D-9 | Browser-preview verification | Testing agent iter24 verified all 3 team routes + shell + retired-vocab + non-200 error render via live HTTP + Playwright. |
| D-10 | Testing agent operative | iter23 (found + reported CRITICAL) + iter24 (verified fix) both green. |
| D-11 | Close report (this document) + journal + FPR + re-measured count | This file. Journal: PRD.md updated. FPR: §6 below. Re-measured: §5. |

---

## 2 · Iter23 CRITICAL fix (Pydantic `extra_forbidden` on `instance_id`)

**Discovered by:** testing_agent_v3_fork iter23 — regression check on `/api/engineer/key_grants` returned HTTP 500 with `ValidationError: instance_id · Extra inputs are not permitted`.

**Root cause:** 269 pre-existing docs in `engineer_key_grants` had an `instance_id` sidecar (from multi-tenant seed fixtures). `EngineerKeyGrantRegistration.model_config = ConfigDict(extra='forbid')` rejected them at `list_grants_for_grantee`'s `model_validate` call.

**Fix (3-layer):**
1. **Schema:** Added `instance_id: Optional[str] = None` to `EngineerKeyGrantRegistration` — turns a previously-unlisted extra into an explicit-optional. Load-bearing wire-shape gate 8/8 pass (D4b lifecycle-additive-tolerance).
2. **Service:** Added `_drop_sidecars()` helper in `engineer_key_grant_service.py` that strips Team-only sidecar fields (`state · endpoint_scope · scope_summary · grantor_email · requested_by_email · created_at_iso · revoked_at_iso · revoked_by_email · revoke_reason_verbatim · team_decision_event_id · team_decision_reason_verbatim · delegation_chain_length · is_sample`) before Pydantic validation. This preserves `extra='forbid'` on the core schema while permitting adjacent surfaces to write context on the same doc.
3. **Fallback:** `list_grants_for_grantee` + `get_grant` catch `ValidationError` and skip malformed legacy docs (never crash the endpoint).

**Additional restructure (Owner Message 608 alignment):**
Team's `/grant` and `/revoke` were originally hand-rolled Mongo writes with a Team-only schema (`endpoint_scope · scope_summary · grantor_email · state`). Iter24 refactored both to **delegate to `engineer_key_grant_service.register_grant + revoke_grant` — the single-source machinery Owner Message 608 required**. Team seeder also rewritten to emit engineer-schema-compatible docs (`key_class · path · floor · scope · justification · lawful_basis_ref · issued_at` all present). Result: every Team-created grant IS an engineer grant, and vice versa. Iter24 live gate `test_p0_team_grant_engineer_single_source_roundtrip` verifies the round-trip.

---

## 3 · Backend surface (all non-frozen · parity 36/36 held constant)

| Endpoint | Method | Role gate | Notes |
|----------|--------|-----------|-------|
| `/api/team/approval_surface` | GET | any authenticated | Aggregates over 3 seams + dormant-honest classes |
| `/api/team/approval_surface/{item_id}/decision` | POST | master_admin/admin | Requires verbatim reason (400 if missing) · mirrors to seam · link-across |
| `/api/team/access_register` | GET | any authenticated (scope varies by role) | DPO reads · master_admin R+grants |
| `/api/team/access_register/grant` | POST | master_admin/admin/engineer | Delegates to engineer_key_grant_service · DPO 403 |
| `/api/team/access_register/revoke` | POST | master_admin/admin/engineer | Delegates to engineer_key_grant_service · DPO 403 · 409 on double-revoke |
| `/api/team/constitutional_seats` | GET | any authenticated | Dormant-honest action state · seats + succession narrative |

Parity: **36/36 constant** (backend `test_e_g1_parity_36_unchanged` + live `/api/readyz` verified · no new frozen contract admitted).

---

## 4 · Sample fixture inventory

Per identity (5 identities: `demo.operator`, `demo.dpo`, `demo.analyst`, `admin`, `master`):

- **1 approval-surface chk-* row** in `checker_requests` (state=`pending_master_admin` · is_sample=True) — over_threshold_commission (Train-a-Model, $1450 spend).
- **1 approval-surface src-* row** in `connect_sources_store` (state=`awaiting_credentials` · is_sample=True) — source_addition_pending.
- **1 pending engineer-schema grant** in `engineer_key_grants` (state=`pending_approval` · is_sample=True) — access_grant_request.
- **2 active engineer-schema grants** in `engineer_key_grants` (state=`active` · is_sample=True).
- **1 revoked engineer-schema grant** in `engineer_key_grants` (state=`revoked` · revoked_at populated · is_sample=True).

Every seeded row carries `is_sample=True`; SAMPLE badges render on both surfaces per systemic sample-marking discipline. Iter24 live agent measured **180 sample-testids** on `/team/approval-surface` (aggregate across items × 5 identities).

Dormant-honest class `retention_window_extension` renders unconditionally on `/team/approval-surface` (canonical closure — the whole approval surface is visible, not partial).

---

## 5 · Re-measured Trust Center count (post UI-1-E)

Machinery vs attestation (unchanged since UI-1-B):
- Enforced (machinery): **3**
- Attested (evidence + countersign): **1**
- Monitored (record only): **1**

Team surface counts (new):
- Approval surface item classes: **4** (over_threshold_commission · source_addition_pending · access_grant_request · retention_window_extension [dormant-honest])
- Approval surface open items (admin view, aggregate): **≥15**
- Access register total rows (aggregate across identities): **~284**
- Constitutional seats: **2** (Master Admin + DPO · both held · succession dormant-honest)
- Team decision events recorded: 3+ from iter23–24 roundtrip verification.

Rule 7 ceiling (unchanged): **$1,000.00 USD** · single-source-of-truth verified end-to-end (unchanged since UI-1-C).

---

## 6 · FPR rows (fold-forward pending register)

| id | source | text (verbatim / paraphrased) | disposition |
|----|--------|-------------------------------|-------------|
| FPR-UI1E-01 | SLOT-3 fold-in | `module_spec_06_team_module.md` never delivered; UI-1-E built to Canon §3.2 + operating model A.5 text | Filed in §SLOT-3 provenance above. Owner may (a) ratify the built surface as-is or (b) commission a formal `module_spec_06` post-hoc. |
| FPR-UI1E-02 | Owner Message 610 C-4 | Succession action is dormant-honest; adding backend seam requires a new frozen contract → HAZARD-STOP | Standing. Not fold-in. Once the succession contract is admitted, the action button lights up automatically (the frontend already reads `action_dormant_reason_plain` and `action_state`). |
| FPR-UI1E-03 | Iter23 code-review nit | `list_grants_for_grantee` `ValidationError → skip` fallback is silent | LOW priority. Adding a warn log if legacy docs remain a concern (currently zero legacy docs remain after seeder rewrite). Not blocking. |
| FPR-UI1E-04 | Iter23 code-review nit | `/api/engineer/key_grants` self-service semantic worth documenting in endpoint docstring | LOW priority · docs-only nit. |
| FPR-UI1E-05 | Owner Message 604 (dispatch text) | Retention-window extensions are registered in Canon as an approval class but pipeline is scheduled for UI-2 | Filed. Dormant-honest row renders in the interim. |

---

## 7 · WHAT TO LOOK AT (Owner walk-through)

Sign in as **`admin@rms.example.com / admin-b1-test-pw`** at https://governance-scan-3.preview.emergentagent.com/auth/login and walk:

1. **`/`** — Canon OS shell renders 6 lit/partial module tiles. Team tile is LIT (was dormant pre-UI-1-E). Preview strip reads "All six modules are Canon-conformant and reachable · Connect · Registry · Use Data · Govern · Prove · Team".
2. **`/team`** — landing page renders 3 section tiles (A · Approval Surface · B · Access Register · C · Constitutional Seats). Retired vocab "Approval Queue" absent (Canon vocab "Approval Surface" IS present).
3. **`/team/approval-surface`** — 4 item classes render top-to-bottom: over_threshold_commission (chk-* · sample badge) · source_addition_pending (src-* · sample badge) · access_grant_request (grant-* · sample badge) · retention_window_extension (dormant-honest row with plain reason).
4. **Queue-length doctrine** renders verbatim: *"Consistently empty → criteria may be too loose. Consistently full → too tight. The criteria are the instrument, the queue is its reading."*
5. **Approve any chk-* item** — click Approve · enter reason · Submit. Confirmation renders with `Open the Govern record →` link. Navigate to `/govern/holds?session_id=s-sample-held-*` — the SAME underlying record is visible on Govern (link-across verified).
6. **`/team/access-register`** — grant form + table render. Issue a fresh grant (grantee=x@y.com · scope=`GET /api/foo`). New row appears. Click Revoke on any row → enter reason → Confirm. Row transitions to state=revoked.
7. **Single-source check** — open a new tab, hit `GET /api/engineer/key_grants?grantee_email=<the_grantee>` — the SAME grant_id appears with the same revoked_at and revocation_reason. **Single-source machinery verified.**
8. **DPO break-in** — sign in as `demo.dpo@demo.rms.example.com / demo-dpo-pw`. `/team/access-register` renders: grant form REPLACED by role-denial banner; ROWS still visible; NO revoke buttons anywhere. `POST /api/team/access_register/grant` as DPO → 403 auth_scope_insufficient.
9. **`/team/constitutional-seats`** — 2 seats render with holders. `data-action-state=dormant_honest`. Both `Initiate succession` buttons DISABLED. Dormant reason mentions "HAZARD-STOP" and "new frozen contract".
10. **Retired vocab audit** — search for "Approval Queue" (as a name) in browser dev-tools DOM across all 4 team routes. **Zero matches.** "Approval Surface" (Canon vocab) present on `/team/approval-surface`.
11. **Unauth honest error** — log out. Try `/team/approval-surface`. `team-approval-error-panel` renders with `data-status=401` and `auth_missing` verbatim. Never silent.
12. **Mobile @ 390px** — same walk on narrow viewport. Table scrolls horizontally; sample badges + doctrine banner remain readable.

---

## 8 · Sign-off criteria met

- [x] Canon §3.2 · Approval Surface with 4 item classes + verbatim doctrine.
- [x] Owner Message 610 D-1: decision reason verbatim + link-across to Govern record.
- [x] Owner Message 610 D-2: DPO break-in (grant + revoke) blocked with auth_scope_insufficient shape.
- [x] Canon §3.2 · Access Register with engineer-key-grant single-source machinery restored (UI-1-A retirement gap closed).
- [x] Grant→revoke→engineer-visible round-trip verified end-to-end (Owner Message 610 explicit).
- [x] Canon operating model A.5 · Constitutional Seats + dormant-honest succession (no new frozen contract).
- [x] Team tile LIVE in shell; all 6 modules reachable (last dormant tile lights up).
- [x] Retired vocab "Approval Queue" purged; Canon vocab "Approval Surface" present.
- [x] Systemic sample-marking gate extended to Team surfaces (2 new registered).
- [x] Seeded fixtures per identity (5 per identity) with is_sample=True.
- [x] Parity 36/36 held constant · no new frozen contract admitted.
- [x] Testing floor: Backend 1586 pass · Jest 183 pass · iter24 35/35 GREEN.
- [x] SLOT-3 provenance filed.
- [x] Iter23 CRITICAL regression identified + fixed + re-verified in iter24 · `retest_needed: false`.

**UI-1-E ready for Owner independent verification before UI-1 roll-up goes to Owner.**
