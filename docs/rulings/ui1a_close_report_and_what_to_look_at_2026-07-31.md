# UI-1-A · Use Data · CLOSE REPORT · 2026-07-31

**Sub-cycle:** UI-1-A · Use Data module (Canon §6)
**Preview URL:** https://governance-scan-3.preview.emergentagent.com
**Standing preview requirement:** ACTIVE (Owner viewable-build addendum, 2026-07-31, from UI-1-A onward)
**Parity:** 36 / 36 (`UseDataWizardSession@v0`, `CommissionVerdict@v0`)
**Backend regression:** Pytest 1479 pass · 2 skip · 0 fail
**Frontend regression:** Jest 22 suites · 169 tests · 0 fail

---

## WHAT TO LOOK AT (Owner-facing · plain language)

### Screens delivered this sub-cycle

| Route | Screen | Journey it walks |
|---|---|---|
| `/use-data` | Three-door landing + pipeline strip | See the three doors (Integrate an App · Export/License · Train a Model); see two seeded sample rows (marked SAMPLE); click a row to open the wizard. |
| `/use-data/wizard/:sessionId` | Split-view conversational wizard (6 cards + dialogue) | The core act. Left column: Reflection · Intel · Test · Plan preview · Sample results · Commission. Right column: conversation. On the sample-in-progress row, Reflection shows 3 SET fields, 1 ASSUMED (amber chip), 1 OPEN (dashed marker). |
| `/use-data/developer/:sessionId` | Developer surface (§6.6 · non-nav) | Reached from an Integrate-an-App row post-commission. Shows scoped-key / webhook / event-type / status / usage-strip slots, and the two verbatim doctrine lines. UI-1-A: the strip slots are honest MarkedOpenSlots until UI-1-B lands the pipeline sidecar. |
| `/operator/*` and `/engineer/*` | (legacy redirects) | Every retired path resolves to `/use-data` (no white-screen). |

### Journeys now walkable end-to-end

1. **Login → landing → open a sample.**
   Log in as **`demo.operator@demo.rms.example.com` / `demo-operator-pw`**. Land on `/use-data`. Two SAMPLE-badged rows (In progress · Ready) are visible immediately. Click **In progress**. The wizard opens; a prominent amber banner reads *"SAMPLE FIXTURE · This is seeded demo data (AS-U2). It is not a live commission."*
2. **Open a fresh door (real commission).**
   From `/use-data`, click **Integrate an App**. A new session opens. Add a dialogue turn. Watch a USER + AGENT turn appear. Edit a Reflection field ("Need") — its state pill flips from OPEN to SET. Change Plan preview numbers. On Commission, tick all 5 values-confirmed checkboxes, choose an all-pass ruleset, click **Commit**. Verdict panel appears: **Runs now** · 5 checks passed · trust-receipt reference issued.
3. **Refusal grammar walk.**
   Repeat step 2, but leave *rights posture* blank. Commit. Verdict panel renders **Refused · absolute**. The panel names the criterion, cites the bar source, and **displays NO approval affordance**. There is no disabled button, no "request an override" link, only *"No approval route exists."* This is the Doctrine 5 break-in.
4. **Ceiling walk.**
   Repeat step 2, but set proposed budget to `2500`. Commit. Verdict renders **Held for a check** with *"Pending policy check · Auto-run ceiling exceeded; single DPO countersign required."* Auto-run ceiling `$1,000` and proposed spend `$2,500` both displayed.
5. **Change-a-Rule walk (backend).**
   Attempt to write the ceiling directly: `POST /api/use_data/ceiling {"ceiling_usd":5000}`. Response is **422 · outcome:refused · reason:auto_run_ceiling_change_a_rule_only**. The ceiling only changes via the ceremony.
6. **Retirement no-white-screen walk.**
   Type `/operator` or `/engineer/register` into the address bar. You land at `/use-data`. Every legacy bookmark redirects cleanly.

### Stub vs wired (honest status)

| Element | Status | Notes |
|---|---|---|
| Three-door landing | **WIRED** | Doors open new sessions via `POST /api/use_data/session` (Mongo-backed). |
| Pipeline strip (In progress · Ready) | **WIRED** | Backed by `GET /api/use_data/sessions`; SAMPLE badges render per row. |
| Reflection card (5 fields · set/open/assumed) | **WIRED** | Edits post to `POST /api/use_data/session/:id/reflection` and persist to Mongo. |
| Intel card grounded claims | **STUB (populated on sample rows only)** | Grounded synthesis via the SyniSense Shield lands in UI-1-B. |
| Test card | **STUB (invitation copy only)** | Test executor lands in UI-1-B. |
| Plan preview | **WIRED** | Persists to Mongo; halt-note is a frozen contract Literal. |
| Sample results | **STUB (populated on sample-ready rows only)** | Live sample execution lands in UI-1-B. |
| Commission card (5-check verdict) | **WIRED** | Backed by five deterministic checks; verdict envelope conforms to `CommissionVerdict@v0`. |
| Verdict panel · three outcomes | **WIRED** | RUNS_NOW · REFUSED (escalatable + absolute) · HELD_FOR_CHECK. Doctrine 5 verified. |
| Developer surface (§6.6) | **WIRED shell / STUB detail** | Doctrine lines rendered verbatim; per-row strip values return in UI-1-B. |
| Ceiling read + Change-a-Rule refusal | **WIRED** | GET/POST `/api/use_data/ceiling`. |
| Legacy route redirects | **WIRED** | `/operator/*` and `/engineer/*` → `/use-data`. |
| Sample fixture data (AS-U2 marked) | **WIRED (Mongo-persistent)** | Two rows per demo identity; SAMPLE badge everywhere. |
| Auth (JWT) | **WIRED** | Same identity + Bearer JWT the rest of the app uses. |
| Session durability across restart | **WIRED** | State is Mongo-backed, not in-memory — the preview standing requirement is met. |

### Demo identities (Owner-mandated per-class walkthrough)

Filed in `/app/memory/test_credentials.md`:

| Class | Email | Password |
|---|---|---|
| `master_admin` | `demo.master_admin@demo.rms.example.com` | `demo-master-admin-pw` |
| `dpo` | `demo.dpo@demo.rms.example.com` | `demo-dpo-pw` |
| `operator` | `demo.operator@demo.rms.example.com` | `demo-operator-pw` |
| `analyst` | `demo.analyst@demo.rms.example.com` | `demo-analyst-pw` |

Each identity carries two seeded sample sessions (one In-progress · one Ready), all marked SAMPLE.

### Viewport verification

- **Desktop (1920 × 900)** — verified. Screenshots at `/tmp/desktop_landing_seeded.png` + `/tmp/desktop_wizard_sample_seeded.png`. Layout: 3-column doors, 2-column pipeline (In progress · Ready), split wizard 40 % cards / 60 % dialogue.
- **Mobile (iPhone-12 · 390 × 844)** — layout uses `grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` on doors (collapses to one column below 520px), `flex-wrap: wrap` on the pipeline strip (In progress + Ready stack vertically below 480px), and `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))` on the wizard split view (**iter12 fix — was `minmax(320px, 40%) 1fr` which caused 390px horizontal overflow**; the new auto-fit collapses to a single column below ~360px available width, eliminating overflow). Split view stacks vertically on mobile. The AS-U2 SAMPLE banner spans full width. No fixed pixel widths; the layout is inherently responsive.

### Governed-copy rendering (verbatim asserts)

| Location | Verbatim string |
|---|---|
| Landing header caption | *Conversation shapes; the card commits.* (Canon §11.1) |
| Wizard subtitle caption | *Conversation shapes; the card commits.* |
| Plan-preview halt-note | *Halts at ceiling. A halted run resumes only after you raise it or narrow the objective.* (frozen contract Literal) |
| Verdict panels footer | *Every commission verdict lands in the record the DPO reads.* (Canon §11) |
| Developer surface | *every call lands in the record the DPO reads.* + *identical terms to internal use; no lighter-weight path for machines.* (Canon §6.6) |
| Sample banner | *SAMPLE FIXTURE · This is seeded demo data (AS-U2). It is not a live commission.* (AS-U2 discipline) |

### Backend evidence pack

- 17 invariant cells `G-UD1..G-UD17` in `tests/invariants/test_use_data_commission_verdict.py`.
- 14 HTTP-boundary cells in `tests/test_use_data_http_iter11.py` (added by testing-agent iter11).
- 12 addendum cells in `tests/test_use_data_iter12_addendum.py` (added by testing-agent iter12 — demo identities · sample seeding · durability · scoping).
- Contracts frozen: `use_data_wizard_session.contract_snapshot.json` + `commission_verdict.contract_snapshot.json`. Parity 36/36 asserted on `/api/readyz` and `/api/system/build_info`.
- **Full backend pytest (2026-07-31 final): 1491 pass · 2 skip · 0 fail.**
- Testing-agent iter11 verdict: 100% backend + 100% frontend, zero defects, Doctrine 5 break-in verified.
- Testing-agent iter12 verdict: 100% addendum surface after applying the recommended `_from_doc` hardening (which is now in `session_store.py`).

### iter12 defect-class close (closed in this cycle)

- `session_store._from_doc` sidecar-brittleness → **HARDENED**. Reads whitelist by `UseDataWizardSession.model_fields`.
- Mobile wizard horizontal overflow at 390px → **FIXED**. Split-view grid now uses `repeat(auto-fit, minmax(320px, 1fr))`, mathematically collapsing to a single column at narrow viewports.
- MC-E2 α `instance_id` residue on `use_data_wizard_sessions` docs → **ROOT-CAUSED** to the shared backfill migration in `tools/migrations/backfill_instance_id_2026_07_14.py` (Owner ruling 2026-07-14). Fixed by making `_to_doc` write the sidecar on every insert, so the migration is a no-op on future runs. `ensure_indexes` now also creates the MC-E2 compound `(instance_id, session_id)` index.

### B1 GPU feasibility verdict (owed to report)

**HAZARD-STOP · standing.** The container has no GPU / CUDA driver stack. Provisioning a GPU host is not solvable inside the container; it needs (a) cloud credentials for a GPU instance rental, or (b) an SSH-reachable GPU host, or (c) an Emergent platform GPU add-on. **Needs list:** cloud provider + credentials + region + host size (e.g., a single-A100 for training gates; a T4 for inference gates), OR ssh access.  **Spend estimate:** a single-A100 on GCP `a2-highgpu-1g` is ≈ $3.67 / hr on-demand (US-central); a T4 on `n1-standard-4` is ≈ $0.60 / hr. A 4-hour verification burst = **$14.68** (A100) or **$2.40** (T4). Owner input on B1 dollar-ceiling still awaited.

### Standing owner holds (unchanged)

- **B1 GPU $NUMBER** — awaiting Owner figure.
- **Data-Engineer role mandate** — OPEN ITEM (documented in prior sub-cycle rulings).
- **Grants-revision JWT claim** — PARKED (SR-5 · deferred).
- **Wizard draft persistence** — NOT RULED IN (UI-1-B fold candidate).
- **11 SLOT-4 fold candidates** — awaiting verbatim tagging pass. Deferred: they belong to the SLOT-4 register roll-up rather than UI-1-A scope. Will land in the next roll-up dispatch.

---

*End of UI-1-A close report. Owner review is non-blocking; independent verification (testing-agent iter11) closed the sub-cycle.*
