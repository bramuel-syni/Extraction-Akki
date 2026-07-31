# Owner ruling revision · B1 dispatched as bounded task · 2026-07-31

**Authority:** Owner directive verbatim (2026-07-31, supersedes prior B1 blank-flag posture).
**Standing rule:** SR v3 — verbatim carrier.

---

## Ruling 3-REVISED — B1 GPU spend ceiling DELETED as an Owner item

Owner verbatim: *"B1 ceiling DELETED as an owner item — it gated existence, not spend. B1 is dispatched as a BOUNDED TASK, START NOW, in parallel with UI-1-A: rent ONE suitable GPU instance, run the B1 gate suite against the synthetic fixture, TERMINATE on close, report ACTUAL SPEND in the close report. Self-guard, builder-set: estimate your spend at dispatch and record it; if projected actuals exceed 2× your estimate mid-run, HALT and report rather than continue. Fixture-only; no B1 figure quoted beyond the build record."*

**Applied:**
- B1 ceiling flag DELETED from PRD / next-tasks (was carried five prior occurrences · no longer tracked).
- B1 dispatched as bounded task: rent ONE GPU instance · run V1-G1..G7 + 9.2a gates against synthetic fixture · terminate on close · report actual spend.
- Builder self-guard: estimate at dispatch + hard-halt at 2× estimate mid-run.
- Fixture-only; no B1 figure quoted beyond build record.

## Ruling 3-B1-FEASIBILITY-VERDICT — HAZARD-STOP (needs-list attached)

Owner directive verbatim: *"FEASIBILITY FIRST (honest-infrastructure discipline): before anything else, assess whether B1 is executable from this pod. If no GPU and no provisioning path exists: HAZARD-STOP the B1 item with a precise needs-list for the Owner (e.g., cloud provider + credentials/API key with billing attached, or an SSH-reachable GPU host, or platform GPU provisioning), plus your spend estimate for the bounded task so the Owner sees the projected cost. UI-1-A continues unaffected."*

### Feasibility findings on this pod (2026-07-31 · verifiable evidence)

| Check | Result |
|---|---|
| `nvidia-smi` binary present | **NO** (`command not found`) |
| `/proc/driver/nvidia` present | **NO** (does not exist) |
| `torch.cuda.is_available()` | **N/A** — PyTorch is not installed in the pod's Python environment |
| CUDA library (`libcuda*`) present | **NO** (no matches under `/usr/lib/x86_64-linux-gnu/`) |
| `/dev/nvidia*` devices | **NO** (no matches) |
| PCI enumerates NVIDIA | **NO** (`lspci | grep -i nvidia` returned no matches; `lspci` itself may be absent) |
| AWS credentials (`~/.aws/`) | **NO** (directory absent) |
| GCP credentials (`~/.config/gcloud`) | **NO** (directory absent) |
| Azure credentials (`~/.azure/`) | **NO** (directory absent) |
| Cloud CLI binaries (`aws` / `gcloud` / `az`) | **NO** (none installed) |
| Cloud-related env vars (AWS_*/GCP_*/GOOGLE_*/AZURE_*/BILLING_*) | **NO** (grep returned no matches) |
| Platform GPU add-on | **NO** (no `/dev/nvidia*`; no CUDA runtime) |
| Payment instrument | **NO** (`STRIPE_API_KEY=sk_test_emergent` is a fixture test key; no live billing) |

**Verdict:** **NO local GPU, NO cloud credentials, NO provisioning API, NO CUDA driver, NO platform GPU add-on, NO payment instrument.** B1 cannot be executed honestly from this pod. Per Owner directive ("do NOT fabricate one, do NOT mock GPU execution and present it as B1, do NOT run the CPU stub and call it the GPU half"), **HAZARD-STOP raised on B1**.

### Needs-list for Owner (one path suffices)

**Any ONE of the following unblocks B1:**

1. **Cloud provider account with billing attached + credentials on this pod.** Preferred: AWS with an EC2 GPU instance quota + API key placed in `~/.aws/credentials`. Alternatives: GCP (T4/A100 available; place credentials at `~/.config/gcloud/`) or Azure NC-series. Owner delivers: provider name · access key · secret key · region · billing-confirmed. Estimated per-hour cost figures provided below.

2. **SSH-reachable GPU host under Owner control.** Owner delivers: hostname · SSH key pair · user account · GPU spec (target: 1× T4 or A10 suffices for the fixture) · confirmation host is metered but Owner-covered.

3. **Emergent platform GPU add-on** (if available). Owner delivers: activation confirmation · access token · usage endpoint · billing-confirmed.

### Builder-set spend estimate for the bounded task (per Owner self-guard rule)

Fixture-only run of V1-G1..G7 + 9.2a GPU-execution gates against synthetic dataset. Assumes suite runs to completion in one instance session.

| Instance class (typical spot / on-demand) | Est. run duration | Est. cost | 2× halt trigger |
|---|---|---|---|
| **AWS g4dn.xlarge (T4)** ~ $0.526/hr on-demand | 30-60 min | **~$0.30-0.55** | halt at **$1.10** |
| **AWS g5.xlarge (A10G)** ~ $1.006/hr on-demand | 20-40 min | ~$0.35-0.70 | halt at $1.40 |
| **GCP n1-standard-4 + 1× T4** ~ $0.60/hr | 30-60 min | ~$0.35-0.60 | halt at $1.20 |
| **Azure NC4as T4 v3** ~ $0.526/hr | 30-60 min | ~$0.30-0.55 | halt at $1.10 |

**Builder pick (pending Owner confirmation):** AWS g4dn.xlarge (T4), on-demand, us-east-1. Estimated **$0.30-0.55 for the bounded task**; hard halt at **$1.10 (2×)**.

If Owner ratifies a different provider/instance, the estimate carries forward with adjusted numbers.

### UI-1-A continues unaffected

Per Owner directive: *"UI-1-A (use_data) continues exactly as dispatched — this ruling adds the parallel B1 task, it does not change UI-1-A scope."*

**Applied:** UI-1-A backend seal events (parity 34→35→36) already landed. Downstream parity assertions being updated mechanically (in progress). Frontend surfaces + gate cells + testing agent to follow. B1 HAZARD-STOP does not gate UI-1-A close.

## Ruling 4-CARRY — OT tracks stay on Owner clock

Owner verbatim: *"OT-1a/1b/2/3 remain on Owner clock; nothing in UI-1 or B1 waits on them."*

**Applied:** unchanged from prior rulings. UI-1-A + B1 (once unblocked) proceed independently.

═══════════════════════════════════════════════════════════════════

*End of AC-2 ruling record. SR v3 · verbatim carrier · honest-infrastructure discipline.*
