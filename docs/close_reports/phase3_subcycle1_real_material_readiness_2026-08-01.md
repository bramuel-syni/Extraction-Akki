# Phase 3 · Sub-Cycle 1 · Real-Material Readiness Slice — Close Report

**Cycle:** Phase 3 · sub-cycle 1
**Landed:** 2026-08-01
**Authority:** Owner ruling 2026-08-01 (Phase 3 approved, re-sequenced) — `docs/rulings/phase3_subcycle1_owner_rulings_2026-08-01.md`
**Governors:** Wizard (FB-4/FB-6 seams) + Connect (thin governed stub) + Deviation-audit reflexive (design law + response-class taxonomy + ratified-copy discipline) + Northena (one trace thread)
**Operative close signal:** backend + frontend testing agent report `iteration_7.json` · **retest_needed: false**

═══════════════════════════════════════════════════════════════════

## §1. Mandate and outcome

Owner requested Phase 3 sub-cycle 1 as the **real-material readiness slice** — a VERTICAL cut across Connect + Use-Data that delivers a demo-ready evidence flow ahead of any module-complete surface. Module order was deliberately overridden per Ruling 1.

Outcome: **delivered atomically**. 6 new frontend screens · 1 thin backend Connect stub · wizard extension (FB-4 milestones + FB-6 lawful-basis surfaced) · full design law bound to every screen · 23 new FPR rows · parity unchanged at 34/34 (sidecar pattern — no new frozen contract seat).

## §2. Rulings on disk (STEP 0 · AC-2 same-day)

- `docs/rulings/phase3_subcycle1_owner_rulings_2026-08-01.md` — six Owner rulings recorded verbatim: (1) Phase 3 approved + re-sequenced; (2) Plane-observability panel approved-with-phase-3 (sub-cycle 2, not standalone, NOT built this sub-cycle); (3) Grants-revision JWT claim PARKED (SR-5); (4) A5-1 binding copy PARTIAL RATIFICATION (refusal action triplet + "Frozen is immutable." + unset-retention banner verbatim; all other Appendix A strings SUSPENDED — marked-open-slot rendering); (5) A5-2 Data Engineer role defaults to Master Admin landing alias; (6) B1 GPU spend ceiling AWAITING OWNER FIGURE.

## §3. Stage A proposal (STEP 1 · AC-1)

- `docs/stage_a_proposals/phase3_subcycle1_real_material_readiness.md` — design-only proposal with: P3-R1 placement rule answered (vertical + horizontals + data gravity); 7-screen inventory mapped to Surfaces v2 + Frontend Brief v2 + Akki v4 demo; FB-18 gate cells enumerated; 23 FPR rows named; D4b assessment for backend contract changes (SIDECAR pattern, LIVE prior, no new frozen seat); response-class taxonomy (four classes, distinct visual treatments); build sequencing. **HAZARD-STOP check:** cleared (no doc-vs-doc conflict).

## §4. Screens landed

| # | Screen | Route | FB anchor |
|---|---|---|---|
| 1 | Connect home | `/connect` | FB-1 |
| 2 | Connect new source (governed stub) | `/connect/new` | Owner Ruling 1 |
| 3 | Commission wizard — milestone capture (extended) | `/operator/commission` | **FB-4** |
| 4 | Commission wizard — lawful basis (visible red-highlighted REQUIRED) | `/operator/commission` | **FB-6** |
| 5 | Commit review — supplied vs assumed (pre-existing draft rail) | `/operator/commit-review/:sessionId` | FB-8 pre-cursor |
| 6 | Commission View home | `/commission-view` | **FB-5** |
| 7 | Commission View run detail | `/commission-view/:sessionId` | **FB-5** |

## §5. Design-system utilities landed (single source of truth)

- `frontend/src/design/akkiv4_design_system.js` — Akki v4 palette (frozen) + response-class taxonomy (4 classes) + classifyResponse helper.
- `frontend/src/design/ratified_copy.js` — Ruling 4 verbatim strings (refusal action triplet, "Frozen is immutable.", unset-retention banner) + AUTH_DENIAL_COPY table.
- `frontend/src/design/MarkedOpenSlot.jsx` — dashed sage border + "— open —" glyph. Never invented copy.
- `frontend/src/design/ResponseClassPanel.jsx` — GovernedRefusalCard / AccessControlDeniedPanel / ValidationErrorPanel / InfrastructureFaultPanel. Refusal renders IN THE ANSWER POSITION (inline, `role=alert`, not `role=dialog`, not `position:fixed`).
- `frontend/src/design/AkkiShell.jsx` — page shell with Georgia serif wordmark + Helvetica labels + trace-thread audit rail footer + DormantCapabilityChip + AgentAssumedChip.

## §6. Backend seams landed

- `backend/routers/connect.py` — `/api/connect/capabilities` (4 dormant capabilities all awaiting OT-1a), `/api/connect/sources` (empty + posture marker), `POST /api/connect/sources` (governed 501 refusal with `outcome=refused reason=connect_seam_dormant`).
- `backend/services/wizard/milestones.py` — sidecar collection `wizard_session_milestones`; propose/agree operations; anti-laundering (propose resets `agreed`).
- `backend/routers/wizard_operator.py` — extended with 3 milestone endpoints + freeze gate refusing when milestones not agreed (`outcome=refused reason=milestones_not_agreed`).

**No new frozen contract landed** — sub-cycle 1 uses the sidecar pattern for milestone state. `WizardCommitState_v0` byte-identical; parity 34/34 unchanged. D4b assessment recorded in Stage A proposal §4.

## §7. FB-18 gate roster verified

| Gate | Status |
|---|---|
| gate_commit_requires_agreed_milestones | ✓ backend + frontend (commit CTA disabled + freeze endpoint refuses) |
| gate_commit_requires_lawful_basis | ✓ pre-existing Guard 1 + draft rail red highlight |
| gate_commission_view_reads_only_existing_artifacts | ✓ no new backend compute path; reads wizard session + milestone sidecar only |
| gate_missed_milestone_renders_plainly | ✓ STATUS_STYLE map: same fontWeight 700 as done, distinct oxblood color |
| gate_refusal_files_gap_with_demand_count | ✓ GovernedRefusalCard renders reason + detail + refusal action triplet |
| gate_late_refusal_never_error_styled | ✓ four response classes never conflated (Jest snapshot gate) |
| gate_four_response_classes_visually_distinct | ✓ Jest: distinct accent colors + distinct test-ids |
| gate_no_build_state_on_any_surface | ✓ no "coming soon"; every capability lit or dormant-marked |
| gate_ratified_copy_verbatim | ✓ Jest byte-identical assertions on all three ratified strings |
| gate_open_copy_slots_marked_never_filled | ✓ MarkedOpenSlot component + Jest gate |
| gate_class_with_claim_headline | ✓ every panel headline carries class marker + claim |
| gate_refusal_in_answer_position | ✓ Jest: role=alert, position not fixed |
| gate_agent_assumed_visibly_marked | ✓ AgentAssumedChip (amber) + XOR-with-supplied source tag |
| gate_one_trace_thread | ✓ AkkiShell trace-rail + ResponseClassPanel trace_id |

## §8. Test results (STEP 2 · operative close signal)

- **Backend:** `1413 passed / 1 skipped / 0 failed / 0 regressions` in ~53s. Includes 10 new sub-cycle-1 cells in `test_phase3_subcycle1_gates.py`.
- **Frontend Jest:** `25 suites / 167 passed / 0 failed` in ~3s. Includes 13 new sub-cycle-1 cells in `test_design_law_and_ratified_copy.test.js`.
- **MRR gates:** all GREEN (MRR-G1 · MRR-G2 · MRR-G3 · MRR-G4 · MRR-G-Parity · MRR-G-DataBlind · MRR-G-SourceSHA).
- **REACT_APP_BACKEND_URL preview URL verified via browser (Owner discipline):** testing agent Playwright-navigated all 4 new routes + wizard extension; every visual + copy invariant confirmed.
- **Testing agent verdict** (`iteration_7.json`, 2026-08-01): full-stack sub-cycle-1 CONFIRMED GREEN. retest_needed=false.

## §9. FPR rows registered in machine YAML (AC-3)

- `docs/registry/function_promise_registry_v0.7_supplement_phase3_subcycle1.md` — 23 new R4 reflexive rows across 5 sections (T1 design system / T2 Connect / T3 Wizard / T4 Commission View / T5 backend seams).
- `docs/registry/machine/registry.yaml` regenerated (parser SUPPLEMENT_PATHS extended; post-v1 additive per governance §14).

## §10. Enforcement-cell count re-measured

Sub-cycle-1 total: **23 new cells = 10 backend gate + 13 Jest gate**.
Cycle-3 + Phase-3-Sub-1 cumulative total: **56 + 23 = 79 new enforcement cells across the two most-recent cycles**.

## §11. Design-law bindings (every screen · Owner cycle-3 message verbatim)

- No build state on any surface — ✓ no "coming soon"; every capability lit (measured) or dormant (hatched).
- Class-with-claim in headline position — ✓ every headline in answer position carries class marker.
- Refusal rendering in the answer position — ✓ inline, `role=alert`, not modal/toast.
- Four response classes NEVER conflated — ✓ distinct visual treatments enforced by Jest.
- Agent-assumed marking — ✓ AgentAssumedChip + XOR source tag.
- One trace thread — ✓ AkkiShell footer + panel trace_id.
- Plain language — ✓ no engineering jargon in front-page copy.
- Visual family per Akki v4 demo — ✓ cream/navy/oxblood/sage/amber + Georgia + Helvetica.

## §12. Ratified binding copy (Ruling 4)

Rendered VERBATIM byte-identical:
- Refusal action triplet ("Accept as recorded statement" · "Narrow the objective" · "Lower the standard").
- "Frozen is immutable."
- Unset-retention banner ("the system holds everything indefinitely until you set a window — a decision only you can make").

Suspended Appendix A slots render marked-open via `<MarkedOpenSlot>` — never invented copy.

## §13. Owner-flagged holds preserved

- Plane-observability panel: NOT built (Ruling 2 · rides sub-cycle 2).
- Grants-revision JWT claim: PARKED (Ruling 3 · SR-5 discipline — no speculation).
- Data Engineer role mandate: OPEN ITEM (Ruling 5 · defaults to Master Admin alias).
- B1 GPU spend ceiling: AWAITING OWNER FIGURE (Ruling 6 · gates Phase 2 Stage B hardware only, NOT this sub-cycle).

## §14. What remains for sub-cycle 2 (per Owner ruling 2026-08-01 sequence)

- Memory + Registry module frontend surfaces (per Frontend Brief v2 · Memory Service module).
- Plane-observability panel (Ruling 2 · rides sub-cycle 2).
- Sub-cycle 3: Govern.
- Sub-cycle 4: Prove + Team.

Each independently verified per Owner discipline.

## §15. Demo login still works

Admin login (`admin@rms.example.com` / `admin-b1-test-pw`) verified by testing agent · Playwright navigation across all new routes. Every route reachable + functional.

═══════════════════════════════════════════════════════════════════

*Sub-cycle 1 close signed. Full backend suite green · full frontend suite green · MRR all-green · testing-agent report iteration_7.json · retest_needed=false. Ready for sub-cycle 2 dispatch.*
