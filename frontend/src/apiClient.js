import axios from 'axios';

// Resilient BACKEND_URL resolution (P1 verification blocker fix, 2026-07-30):
// * Use process.env.REACT_APP_BACKEND_URL when set (preview URL, explicit config).
// * Fall back to same-origin ('') so API calls go to relative /api paths —
//   works in preview (Kubernetes ingress routes /api/* to backend on same origin),
//   local docker-compose, and any deployment where the frontend is served by
//   the same host that terminates the backend ingress.
// Never emit "undefined/api" as a baseURL.
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

// Phase 8 Stage B-1 — access token store + Bearer interceptor.
// Owner E1 ratified: JWT single-source. Federation-forward: OAuth adapters
// later mint the same JWT claim shape; the token store here is the
// integration seam that later adapters replace.
const TOKEN_STORAGE_KEY = 'rms.b1.auth.access_token';
const REFRESH_STORAGE_KEY = 'rms.b1.auth.refresh_token';

export const tokenStore = {
  getAccessToken: () => {
    try { return window.localStorage.getItem(TOKEN_STORAGE_KEY); } catch { return null; }
  },
  getRefreshToken: () => {
    try { return window.localStorage.getItem(REFRESH_STORAGE_KEY); } catch { return null; }
  },
  setTokens: ({ access_token, refresh_token }) => {
    try {
      if (access_token) window.localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
      if (refresh_token) window.localStorage.setItem(REFRESH_STORAGE_KEY, refresh_token);
    } catch { /* Storage unavailable — no-op */ }
  },
  clear: () => {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(REFRESH_STORAGE_KEY);
    } catch { /* no-op */ }
  },
};

const client = axios.create({ baseURL: API, timeout: 15000 });

// Bearer interceptor: attach access token when present.
client.interceptors.request.use((cfg) => {
  const t = tokenStore.getAccessToken();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// Detail-safe error message formatter for FastAPI validation-422s.
// FastAPI returns detail as an array of {msg, ...}; rendering that in JSX
// crashes React. This helper flattens any shape to a string.
export function formatApiErrorDetail(detail) {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  return String(detail);
}

export const api = {
  health: () => client.get('/health').then(r => r.data),
  instanceConfig: () => client.get('/instance/config').then(r => r.data),
  systemState: () => client.get('/system/state').then(r => r.data),
  northenaStatus: () => client.get('/northena/status').then(r => r.data),
  openRuns: () => client.get('/northena/ledger/open_runs').then(r => r.data),
  ledgerByRun: (runId) => client.get(`/northena/ledger/by_run/${runId}`).then(r => r.data),
  traceLens: (traceId) => client.get(`/northena/trace/${traceId}`).then(r => r.data),
  v1Status: () => client.get('/v1/status').then(r => r.data),
  v3Status: () => client.get('/v3/status').then(r => r.data),
  solvaStatus: () => client.get('/solva/status').then(r => r.data),
  service1Status: () => client.get('/service_1/status').then(r => r.data),
  liftManifest: () => client.get('/discipline/lift_manifest').then(r => r.data),
  stampAuditRecent: (limit = 50) => client.get(`/v1/stamp_audit/recent?limit=${limit}`).then(r => r.data),
  contractFiveRings: () => client.get('/contracts/five_rings').then(r => r.data),
  contractQualMatrix: () => client.get('/contracts/qualification_matrix').then(r => r.data),
  // Phase 8a-lite (Ask Console) — v2 dispatch consumer.
  dispatchV2: (objectiveRequestV2) =>
    client
      .post('/service_1/v2/dispatch', objectiveRequestV2, {
        validateStatus: (s) => s >= 200 && s < 500,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 8 Stage B-1 — auth surface. Returns raw response body per Owner E2
  // {reason, detail} shape on auth denial; validateStatus permits 401/403/409.
  authRegister: (email, password, name) =>
    client
      .post('/auth/register', { email, password, name }, {
        validateStatus: (s) => s >= 200 && s < 500,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  authLogin: (email, password) =>
    client
      .post('/auth/login', { email, password }, {
        validateStatus: (s) => s >= 200 && s < 500,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  authMe: () =>
    client
      .get('/auth/me', { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  authRefresh: () => {
    const rt = tokenStore.getRefreshToken();
    return client
      .post('/auth/refresh', null, {
        headers: rt ? { Authorization: `Bearer ${rt}` } : {},
        validateStatus: (s) => s >= 200 && s < 500,
      })
      .then((r) => ({ status: r.status, body: r.data }));
  },
  // Phase 8 Stage B-2 — Operator surface (UI Spec §2).
  operatorStatus: () =>
    client
      .get('/operator/status', { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  fleetPolicy: () => client.get('/fleet/policy').then((r) => r.data),
  // Wizard operator (7 endpoints from Phase 7 B-1/B-2/B-3) — auth-passing.
  wizardOperatorStart: () =>
    client
      .post('/wizard/operator/session', null, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  wizardOperatorTurn: (sid, payload) =>
    client
      .post(`/wizard/operator/${sid}/turn`, payload, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  wizardOperatorCommitReview: (sid) =>
    client
      .post(`/wizard/operator/${sid}/commit-review`, null, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  wizardOperatorFreeze: (sid, body) =>
    client
      .post(`/wizard/operator/${sid}/freeze`, body || {}, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  wizardOperatorGet: (sid) =>
    client
      .get(`/wizard/operator/${sid}`, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 3 sub-cycle 1 — FB-4 milestone endpoints (Owner 2026-08-01).
  wizardOperatorGetMilestones: (sid) =>
    client
      .get(`/wizard/operator/${sid}/milestones`, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  wizardOperatorPostMilestones: (sid, milestones) =>
    client
      .post(`/wizard/operator/${sid}/milestones`, { milestones }, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  wizardOperatorAgreeMilestones: (sid, agreedBy) =>
    client
      .post(`/wizard/operator/${sid}/milestones/agree`, { agreed_by: agreedBy }, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 3 sub-cycle 1 — Connect module (thin governed stub).
  connectCapabilities: () =>
    client
      .get('/connect/capabilities', { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  connectListSources: () =>
    client
      .get('/connect/sources', { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  connectRegisterSource: (payload) =>
    client
      .post('/connect/sources', payload, { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 3 sub-cycle 2 — Memory Service + Registry (Owner ruling 2026-08-02).
  memoryListPlanes: () =>
    client
      .get('/memory/planes', { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  memoryGetPlane: (planeId) =>
    client
      .get(`/memory/planes/${planeId}`, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  memoryGetPlaneObservability: (planeId) =>
    client
      .get(`/memory/planes/${planeId}/observability`, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  memoryGetReconstructedState: (planeId) =>
    client
      .get(`/memory/planes/${planeId}/reconstructed_state`, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  memoryAttemptPublish: (planeId, contributionId, qualityScore) =>
    client
      .post(`/memory/planes/${planeId}/publish`,
        { contribution_id: contributionId, quality_score: qualityScore },
        { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  memoryRevokePlane: (planeId, reason) =>
    client
      .post(`/memory/planes/${planeId}/revoke`,
        { reason }, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  registryReadDimension: (kind) =>
    client
      .get(`/census/dimensions/registry/${kind}`, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 8 Stage B-3 — Engineer surface (§4 key-grant CRUD).
  engineerListKeyGrants: (granteeEmail) =>
    client
      .get('/engineer/key_grants', {
        params: granteeEmail ? { grantee_email: granteeEmail } : {},
        validateStatus: (s) => s >= 200 && s < 500,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  engineerRegisterKeyGrant: (body) =>
    client
      .post('/engineer/key_grants', body, { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  engineerRevokeKeyGrant: (grantId, reason) =>
    client
      .post(
        `/engineer/key_grants/${grantId}/revoke`,
        { reason },
        { validateStatus: (s) => s >= 200 && s < 500 },
      )
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 8 Stage B-3 — Buyer wizard (§5) CUT at commercial cut
  // 2026-07-06 (BCR v1.4 §12). All 7 buyer wizard client methods
  // (wizardBuyerStart / Turn / Propose / CommitReview / Freeze /
  // Handoff / Get) removed from the extractor build tree; the buyer
  // wizard router variant on the backend is likewise cut whole.
  // Phase 8 Stage B-4 — Master Admin surface (UI Spec §6).
  masterAdminPendingSeams: () =>
    client
      .get('/master_admin/pending_seams', { validateStatus: (s) => s >= 200 && s < 500 })
      .then((r) => ({ status: r.status, body: r.data })),
  masterAdminAuditTrail: (limit = 50) =>
    client
      .get(`/master_admin/audit_trail?limit=${limit}`, {
        validateStatus: (s) => s >= 200 && s < 500,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  masterAdminTierLockCommit: (body) =>
    client
      .post('/pricing/tier_lock', body, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  masterAdminModelVersionBump: () =>
    client
      .post('/pricing/model_version', null, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  masterAdminFleetPolicyBump: () =>
    client
      .post('/fleet/policy', null, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  // Helper for §6.3 audit-trail "See full diff" lazy fetch — accepts
  // an absolute API path from `full_diff_ref` (already `/api/…`).
  northenaLedgerByRunAbs: (absPath) => {
    const trimmed = absPath.startsWith('/api') ? absPath.slice(4) : absPath;
    return client.get(trimmed).then((r) => r.data);
  },
  // Phase 8 B-5a — Compliance Console read/prove (v2.1 §4.1-4.3).
  complianceRetentionConfig: () =>
    client
      .get('/compliance/retention_config', {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  complianceRefusalsByMonth: (month) =>
    client
      .get(`/compliance/refusals?month=${encodeURIComponent(month)}`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 8 Seam 3 Sub-stage 1 — coverage marker (E3.β query-time).
  complianceRefusalsCoverage: () =>
    client
      .get('/compliance/refusals_coverage', {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  // Phase 3 sub-cycle 3 — Govern module client helpers (existing endpoints
  // only; NO new frozen contracts). Owner ruling 2026-08-02.
  checkerPending: (role) =>
    client
      .get(`/checker/pending${role ? `?role=${encodeURIComponent(role)}` : ''}`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  checkerInitiate: (payload) =>
    client
      .post('/checker/initiate', payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  checkerCountersign: (requestId, payload = {}) =>
    client
      .post(`/checker/countersign/${encodeURIComponent(requestId)}`, payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  checkerObject: (requestId, payload = {}) =>
    client
      .post(`/checker/object/${encodeURIComponent(requestId)}`, payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  complianceRetentionWrite: (payload) =>
    client
      .post('/compliance/retention_config', payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  complianceAuthorizedDeletion: (payload) =>
    client
      .post('/compliance/authorized_deletion', payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  northenaTraceRead: (traceId) =>
    client
      .get(`/northena/trace/${encodeURIComponent(traceId)}`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  // UI-1-A (2026-07-31) · Use Data conversational wizard · Canon §6.
  useDataCeiling: () =>
    client
      .get('/use_data/ceiling', { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataOpenSession: (door) =>
    client
      .post('/use_data/session', { door }, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataListSessions: () =>
    client
      .get('/use_data/sessions', {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataReadSession: (sessionId) =>
    client
      .get(`/use_data/session/${encodeURIComponent(sessionId)}`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataAppendTurn: (sessionId, role, text) =>
    client
      .post(`/use_data/session/${encodeURIComponent(sessionId)}/turn`, { role, text }, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataUpsertReflection: (sessionId, payload) =>
    client
      .post(`/use_data/session/${encodeURIComponent(sessionId)}/reflection`, payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataSetPlan: (sessionId, payload) =>
    client
      .post(`/use_data/session/${encodeURIComponent(sessionId)}/plan`, payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  useDataCommit: (sessionId, payload) =>
    client
      .post(`/use_data/session/${encodeURIComponent(sessionId)}/commit`, payload, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  // UI-1-B (2026-07-31) · Govern Canon §7 aggregates + Class-D registries seam.
  governEnforcementClassSplit: () =>
    client
      .get('/govern/enforcement_class_split', { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  governTrustCenterRecord: () =>
    client
      .get('/govern/trust_center_record', { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  governEstateRulesRecord: () =>
    client
      .get('/govern/estate_rules_record', { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  governRegistryUpload: (registryName, rows) =>
    client
      .post('/govern/registries/upload', { registry_name: registryName, rows }, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  governRegistryDiff: (uploadId) =>
    client
      .post('/govern/registries/diff', { upload_id: uploadId }, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  governRegistryCommit: (uploadId) =>
    client
      .post('/govern/registries/commit', { upload_id: uploadId }, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  governRegistryVersions: (name) =>
    client
      .get(`/govern/registries/${encodeURIComponent(name)}/versions`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  governRegistryCurrent: (name) =>
    client
      .get(`/govern/registries/${encodeURIComponent(name)}/current`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  governHolds: () =>
    client
      .get('/govern/holds', { validateStatus: (s) => s >= 200 && s < 600 })
      .then((r) => ({ status: r.status, body: r.data })),
  // UI-1-B · Change-a-Rule ceremony visible countdown + cancel (Canon §7.5).
  checkerRequestRead: (requestId) =>
    client
      .get(`/checker/request/${encodeURIComponent(requestId)}`, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
  checkerCancel: (requestId, reason) =>
    client
      .post(`/checker/cancel/${encodeURIComponent(requestId)}`, { reason }, {
        validateStatus: (s) => s >= 200 && s < 600,
      })
      .then((r) => ({ status: r.status, body: r.data })),
};

export default api;
