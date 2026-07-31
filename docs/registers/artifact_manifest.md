Artifact manifest 
# Artifact Manifest v1 · Filed-Artifact Register 
Owner ruling 2026-07-27: registers belong in the registers directory. One row per filed artifact. 
`.docx` files are canonical; `.md` mirrors are derived (marked as such). The wayfinding index at 
`docs/mandates/MANIFEST.md` and the generated YAML at 
`docs/generated/mandate_specs/MANIFEST.yaml` are NOT artifact registers and are not 
tracked here. 
## Filed artifacts 
| # | Path | SHA-256 | Byte size | Line count | Date filed | Filing dispatch reference | Class | 
|---:|---|---|---:|---:|---|---|---| 
| 1 | `docs/rulings/owner_brief_blinded_assessment_2026-07-25.md` | 
`c5026ff4c6662877e198440278fd576ab63f846aa84d0cd40f2b87a0eea7dc17` | 10671 | 110 | 
2026-07-27 | Emission 1 blinding-brief filing rider · orchestrator dispatch 
d9jps7dmb8cc739sh9c0 | Ruling | 
| 2 | `docs/mandates/akki_role_register.docx` | 
`837f04ffa965d3a4d678660331bd14710cbc0e7d2c17823dc4a9541dc781d634` | 22637 | (N/A 
— binary) | 2026-07-27 | Emission 1B Doc 1/3 · orchestrator dispatch d9jqs5cem9is739rsa2g | 
Mandate · canonical | 
| 3 | `docs/mandates/akki_role_register.md` | 
`471e1f4e578ec7aadf6edff11e898f44c459bfccdf7d63ddd3ee283fc0b65bd7` | 29319 | 340 | 
2026-07-27 | Emission 1B Doc 1/3 · header prepend d9jrebui4ous73fisdig | Mandate · derived 
mirror | 
| 4 | `docs/mandates/akki_operating_model_product_spec_v2.0.docx` | 
`4c9301643bd8f37d3c62e998cf2f4531a4125a0da686f4a258827b7ec118b38e` | 31288 | (N/A — 
binary) | 2026-07-27 | Emission 1B Doc 2/3 · orchestrator dispatch d9jqsae2dhbc738i7m80 | 
Mandate · canonical | 
| 5 | `docs/mandates/akki_operating_model_product_spec_v2.0.md` | 
`20b4d305c26c1054c6c5cf49ae4d542a16e3579b2eddea1bdc04ec6450ceee4f` | 42275 | 446 | 
2026-07-27 | Emission 1B Doc 2/3 · header prepend d9jrebui4ous73fisdig | Mandate · derived 
mirror | 
| 6 | `docs/mandates/akki_analyze_codebase_acquisition_v1.0.docx` | 
`9e33f832679daaf32eeb288b0943de56e32e501225c1447ae4e9b66b8f3e508e` | 15513 | (N/A 
— binary) | 2026-07-27 | Emission 1B Doc 3/3 · orchestrator dispatch d9jqse36622c73d31f50 | 
Mandate · canonical | 



| 7 | `docs/mandates/akki_analyze_codebase_acquisition_v1.0.md` | 
`76b2998e7b9075efd703fbd246d1dd048a4bfe6c5af7d1818973fe3e2a2ebd7d` | 8766 | 110 | 
2026-07-27 | Emission 1B Doc 3/3 · header prepend d9jrebui4ous73fisdig | Mandate · derived 
mirror | 
| 8 | `docs/mandates/akki_source_condition_spec.docx` | NOT PRESENT | NOT PRESENT | 
NOT PRESENT | pending | orchestrator dispatch d9jre5cem9is739rsen0 · fetch completed to 
`/tmp` in prior turn · superseded by later dispatch before .docx move | Mandate · canonical 
(pending) | 
| 9 | `docs/mandates/akki_source_condition_spec.md` | NOT PRESENT | NOT PRESENT | 
NOT PRESENT | pending | orchestrator dispatch d9jre5cem9is739rsen0 · pending .docx move 
+ python-docx conversion + header prepend | Mandate · derived mirror (pending) | 
| 10 | `docs/mandates/akki_condition_coverage_amendment_v1.0.docx` | NOT PRESENT | 
NOT PRESENT | NOT PRESENT | pending | orchestrator dispatch d9jre7r6622c73d31khg · 
fetch not initiated | Mandate · canonical (pending) | 
| 11 | `docs/mandates/akki_condition_coverage_amendment_v1.0.md` | NOT PRESENT | NOT 
PRESENT | NOT PRESENT | pending | orchestrator dispatch d9jre7r6622c73d31khg · pending 
full pipeline | Mandate · derived mirror (pending) | 
| 12 | `docs/handoff/frontend_uiux_brief_v1_2026-07-27.docx` | 
`2242631548ae5f6edc9401d8470ab61567aa88ba3c9d4ca11f01b5f1e7a11b08` | 60723 | (N/A 
— binary) | 2026-07-27 | Frontend UI/UX brief v1 · doc-only atomic · orchestrator dispatch 
d9mb-uiux-brief-v1-2026-07-27 | Handoff · canonical | 
| 13 | `docs/handoff/frontend_uiux_brief_v1_2026-07-27.md` | 
`4cae46edb9b2e2ed4da2364154c344abf835bae3a0d49fa3e430ec34e07f7001` | 52346 | 721 | 
2026-07-27 | Frontend UI/UX brief v1 · doc-only atomic · orchestrator dispatch 
d9mb-uiux-brief-v1-2026-07-27 | Handoff · derived mirror | 
## Backfill · SHAs harvested from close reports 
Backfill scope: on-disk artifacts whose SHAs are cited in existing close reports at 
`docs/close_reports/*.md` and `docs/rulings/*.md`. Each row's SHA has been re-hashed live via 
`sha256sum` and reflects current on-disk bytes. Where the on-disk SHA diverges from a 
close-report-cited SHA, the on-disk SHA is authoritative (register anchors to live bytes, not to 
legacy report citations); divergences are called out in the drift note at row-tail. 
| # | Path | SHA-256 | Byte size | Line count | Date filed | Filing dispatch reference | Class | 
|---:|---|---|---:|---:|---|---|---| 
| B-1 | `docs/rulings/owner_change_order_2026-07-25.md` | 
`33b16441025ac0bc757fd92f770252d30f0e63de4e4609c635be3ce9252fa568` | 17141 | 138 | 



2026-07-25 | Owner change order landing 2026-07-25 · sanction anchor for A1..A8 
amendments | Ruling | 
| B-2 | `docs/close_reports/change_order_2026_07_25.md` | 
`8def7256f1be9768bcd3fe93106056a7e83fe62e46f8824e0f95d664dc8ec539` | 19443 | 136 | 
2026-07-25 | Change order execution close · appends 7 rows to 
`docs/mandates/MANIFEST.md` | Close report | 
| B-3 | `docs/close_reports/g_13.md` | 
`962de8859b9d35971df6998c43e0f31d24f45cc3d31fe997a0d8987854a7d613` | 25452 | 336 | 
2026-07-25 | G-13 execution atomic close (post-G-13 · Parity 33→34 seal at MandateSpec@v0 
· UI-1 forward instruction) | Close report | 
| B-4 | `docs/close_reports/g2_registry_maintenance.md` | 
`7713146daa3e855fbc9df0d14f274ca33b0b1901dc10a508911bfbcb8d537ca8` | 17282 | 213 | 
2026-07-14 | G2 registry maintenance close · Registry v1 §M sidecar-pattern authority | Close 
report | 
| B-5 | `docs/close_reports/g3_operating_values_v1_1.md` | 
`0a91e1b4b72b00593a8c3a770615efae0ef150e1016bbaf906bbe62d9853ce3e` | 19489 | 214 | 
2026-07-15 | G3 operating values v1.1 close | Close report | 
| B-6 | `docs/close_reports/phase_8_b_3.md` | 
`a31b5a9d43c0563140a73762789f765390187052ebd4e24b47d9bb6a528f7215` | 14349 | 176 | 
2026-07-04 | Phase 8 Stage B-3 close · engineer key-grant ledger machinery. **Drift note:** 
close-report body cites self-SHA 
`c2863974bf52f69ff8b7256ad1bae07854a546526672c2d099305a98d01bec22` at line 139; 
current on-disk SHA differs · expected post-close-append drift per §7 Stage-A convention · 
register anchors to live on-disk bytes. | Close report | 
| B-7 | `docs/registry/function_promise_registry_v1.md` | 
`d6ad136f65426c0f86df2227a540aac8142b24dd0cbb015b71ef2991a7a6718a` | 133379 | 671 | 
2026-07-14 | G2 registry maintenance close · foreign-key anchor for R4 sidecars · byte-identical 
to close-report-cited SHA (zero drift) | Registry | 
| B-8 | `docs/registers/phase_ledger_v1.md` | 
`0dc8705ed83123fa8a0da0d6fc6d3fa1f38ed8a0b065a15149310acfcf32a95c` | 52877 | 174 | 
2026-07-25 (latest transition · UI-1 Stage A landing) | Phase ledger v1 · §1 closed (42) · §2 
open (1 · UI-1) · §3 defined-undispatched (2) · §4 terminal figure 42/46 = 91.3% | Register | 
| B-9 | `docs/registers/owner_decisions_v1.md` | 
`e3ac235e90e2f6ded40f8e21ea19fa2b401eaf091d56e4bcccfa278dd85506e8` | 10755 | 112 | 
2026-07-24 (latest append) | Owner decision register v1 (OD-* entries) | Register | 
| B-10 | `backend/tests/invariants/admission_refusal.contract_snapshot.json` | 
`99381316dc71bf8f97acb36706bdfb057cb14c2da9ef1d32639aa788d72d67fb` | 2995 | 68 | 



2026-07-04 | Phase 4a Stage B close · AdmissionRefusal@v0 snapshot · byte-identical to 
close-report-cited SHA (zero drift) | Contract snapshot | 
| B-11 | `backend/tests/invariants/composed_conclusion.contract_snapshot.json` | 
`a85eaf95349befdacdaf6d88804474df137299a6250cc5e8cababb2670fb00fb` | 3325 | 64 | 
2026-07-04 | Phase 4b close · ComposedConclusion@v0 snapshot · byte-identical to 
close-report-cited SHA (zero drift) | Contract snapshot | 
| B-12 | `backend/services/service_1/admission_refusal_reasons.v0.json` | 
`81b56ddff72bedb8cc0f2111e3a03474080e9c7e268a780f4717275ae62f1a59` | 665 | 11 | 
2026-07-04 | Phase 4a Stage B close · admission-refusal reasons registry v0 · byte-identical to 
close-report-cited SHA (zero drift) | Data registry | 
## Backfill · candidates not on disk (surfaced for Owner attention) 
The following SHAs are cited in close reports but the referenced paths are NOT PRESENT on 
disk. Recorded here for Owner-side reconciliation (they may have been moved, renamed, or 
shaved subsequent to the citing close report): 
| Cited SHA | Cited path | Source close report | Status | 
|---|---|---|---| 
| `0d3f6de687c1543a61822e460cda93e0fb1d7208be39cc9a9518005abd24b1a7` | 
`backend/contracts/mandate_spec.py` (inferred from G-13 close report §12 · MandateSpec@v0 
contract SHA) | `docs/close_reports/g_13.md:112` | NOT PRESENT at expected path · file may 
have been renamed or relocated post-G-13; parity-34 seal event referenced this contract, so the 
contract exists somewhere under `/app/backend/contracts/` but path resolution is beyond this 
dispatch's read scope · flagged for Owner reconciliation | 
| `5eb216b93d20264338e31a00c3615a985e3cc38bd8aa28a66b01e19ea34ac1e3` | 
`backend/tests/invariants/mandate_spec.contract_snapshot.json` (inferred) | 
`docs/close_reports/g_13.md:113` | NOT PRESENT at expected path · same reconciliation note 
as above | 
## Register discipline notes 
1. **Path convention:** All paths in this register are repo-relative (starting from `docs/` or 
`backend/`), matching the convention in `docs/mandates/MANIFEST.md`. Absolute `/app/` prefix 
is stripped for portability. 
2. **Byte size for .docx entries:** `.docx` files are OOXML/ZIP binaries. "Line count" is not 
meaningful; marked `(N/A — binary)`. Byte size (`wc -c`) is authoritative for `.docx`; SHA-256 is 
the canonical fingerprint. 



3. **Line count for .md entries:** `wc -l` is authoritative for `.md` files. Post-header-prepend rows 
(3, 5, 7) reflect current line counts (338→340, 444→446, 108→110 · +2 per file for the 
mandated `> Derived searchable mirror. The .docx is canonical.` header + blank separator). 
4. **Register-append discipline:** New artifact filings append rows to this table; existing rows 
are never rewritten in-place. Any SHA change to an already-registered artifact requires a 
Standing Owner Disposition on whether to (a) append a supersession row, (b) close the artifact 
under a rollback event, or (c) treat the change as byte-identical restoration with attest. 
5. **Wayfinding-index cross-reference:** `docs/mandates/MANIFEST.md` (SHA 
`c11af311b23b1251e5c7a4c7a93abfd6068fb8082bc70f6b5397365ce2752bce` · 96 lines · 
authored under the Substrate-Drop v2 authoring-direction-inverted rule) is a wayfinding index 
scoped to mandate/spec `.md` files under `/app/docs/mandates/*.md`. It is NOT an artifact 
register and is NOT tracked here. The generated YAML at 
`docs/generated/mandate_specs/MANIFEST.yaml` (SHA 
`1b62012b06ae8decacd4f64bdc2a32c48b716a04800e5c84b74559ba0b8e72f3` · 12 lines · `# 
GENERATED · DO NOT EDIT`) is auto-derived from the wayfinding index and is likewise NOT 
tracked here. 
6. **Owner dispatch references:** The "Filing dispatch reference" column carries orchestrator 
dispatch IDs where supplied by Owner in the filing dispatch. For backfilled rows, the reference 
points to the close report that authoritatively cited the SHA. 
UI_1...