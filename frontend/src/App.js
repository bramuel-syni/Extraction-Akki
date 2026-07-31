import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AskConsolePage from './pages/AskConsolePage';
import TraceReceiptPage from './pages/trace/TraceReceiptPage';
import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
// UI-1-A (2026-07-31) · Operator + Engineer modules SALVAGED to
// /salvage/ui1a_retirement_2026-07-31/ per Owner directive (Canon §6 cutover).
// Legacy paths redirect to the new /use-data landing per the retirement note.
// Buyer §5 surface was cut at commercial cut 2026-07-06 (BCR v1.4 §12).
import MasterAdminHomePage from './pages/master_admin/MasterAdminHomePage';
import ChangeARulePage from './pages/master_admin/ChangeARulePage';
import AuditTrailPage from './pages/master_admin/AuditTrailPage';
// Phase 8 Stage B-5a — Compliance Console (UI Spec v2.1 §4).
import ComplianceHomePage from './pages/compliance/ComplianceHomePage';
import ComplianceProveOneRunPage from './pages/compliance/ComplianceProveOneRunPage';
import ComplianceRetentionRightsPage from './pages/compliance/ComplianceRetentionRightsPage';
import ComplianceRulebookWritePage from './pages/compliance/ComplianceRulebookWritePage';
import ExtractionConsoleHomePage from './pages/extraction/ExtractionConsoleHomePage';
import RegistryAdminView from './pages/extraction/RegistryAdminView';
// §3.15 Opportunity Briefs — UI Spec v2.2 §3.7 · advisory · Registry-read grounded.
import OpportunityBriefsPage from './pages/opportunity_briefs/OpportunityBriefsPage';
// Phase 3 sub-cycle 1 — Connect module (Owner ruling 2026-08-01).
import ConnectHomePage from './pages/connect/ConnectHomePage';
import ConnectNewSourcePage from './pages/connect/ConnectNewSourcePage';
// Phase 3 sub-cycle 1 — Commission View (FB-5). Kept live per Canon §6.5
// (In-progress + Ready pipeline detail); Use Data landing links here for
// the run-detail drilldown.
import CommissionViewHomePage from './pages/commission_view/CommissionViewHomePage';
import CommissionRunDetailPage from './pages/commission_view/CommissionRunDetailPage';
// Phase 3 sub-cycle 2 — Memory Service surface + Plane observability panel
// + Registry Estate Map (Owner ruling 2026-08-02).
import MemoryHomePage from './pages/memory/MemoryHomePage';
import MemoryPlaneDetailPage from './pages/memory/MemoryPlaneDetailPage';
import MemoryPlaneObservabilityPage from './pages/memory/MemoryPlaneObservabilityPage';
import RegistryEstateMapPage from './pages/registry/RegistryEstateMapPage';
// Phase 3 sub-cycle 3 — Govern module surfaces (Owner ruling 2026-08-02
// sub-cycle 3 dispatch; consume EXISTING checker + compliance endpoints only).
import GovernHomePage from './pages/govern/GovernHomePage';
import GovernRetentionPage from './pages/govern/GovernRetentionPage';
import GovernChangeRulePage from './pages/govern/GovernChangeRulePage';
import GovernRefusalHealthPage from './pages/govern/GovernRefusalHealthPage';
import GovernPendingPage from './pages/govern/GovernPendingPage';
// UI-1-A (2026-07-31) · Use Data module per AKKI_OS_EXPERIENCE_CANON_v1 §6.
// Three doors · one conversational wizard · six cards · Commission verdict.
import UseDataLandingPage from './pages/use_data/UseDataLandingPage';
import UseDataWizardPage from './pages/use_data/UseDataWizardPage';
import UseDataDeveloperSurfacePage from './pages/use_data/UseDataDeveloperSurfacePage';
import { AuthProvider } from './hooks/useAuth';

// Phase 8 Stage B-1 — Auth landing (Owner E1 ratified: custom JWT + bcrypt).
// The AuthProvider wraps the entire tree so any surface can call useAuth().
// Ask Console remains the primary surface at `/`; auth surface at `/auth/*`.
// G-10/G-7 PROMOTE (docs/rulings/g10_g7_promote_2026-07-14.md, 2026-07-14):
// TraceReceiptPage lifted out of /legacy/* and mounted at public /trace and
// /trace/:traceId.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<AskConsolePage />} />
          <Route path="auth/login" element={<AuthLoginPage />} />
          <Route path="auth/register" element={<AuthRegisterPage />} />
          {/* G-10/G-7 PROMOTE — Trust Receipt three-lens surface (public). */}
          <Route path="trace" element={<TraceReceiptPage />} />
          <Route path="trace/:traceId" element={<TraceReceiptPage />} />
          {/* UI-1-A · Use Data module (Canon §6). */}
          <Route path="use-data" element={<UseDataLandingPage />} />
          <Route path="use-data/wizard/:sessionId" element={<UseDataWizardPage />} />
          <Route path="use-data/developer/:sessionId" element={<UseDataDeveloperSurfacePage />} />
          {/* UI-1-A · Legacy operator/* + engineer/* routes redirect to
              /use-data landing (retirement note §Route redirects landed). */}
          <Route path="operator" element={<Navigate to="/use-data" replace />} />
          <Route path="operator/*" element={<Navigate to="/use-data" replace />} />
          <Route path="engineer/*" element={<Navigate to="/use-data" replace />} />
          {/* Phase 8 Stage B-4 — Master Admin surface (UI Spec §6) */}
          <Route path="master-admin" element={<MasterAdminHomePage />} />
          <Route path="master-admin/change-a-rule/:ruleId" element={<ChangeARulePage />} />
          <Route path="master-admin/audit-trail" element={<AuditTrailPage />} />
          {/* Phase 8 Stage B-5a — Compliance Console (UI Spec v2.1 §4) */}
          <Route path="compliance" element={<ComplianceHomePage />} />
          <Route path="compliance/prove" element={<ComplianceProveOneRunPage />} />
          <Route path="compliance/prove/:traceId" element={<ComplianceProveOneRunPage />} />
          <Route path="compliance/retention" element={<ComplianceRetentionRightsPage />} />
          {/* Phase 8 Stage B-5b — Compliance rulebook write UI (§4.4-4.5) */}
          <Route path="compliance/rulebook" element={<ComplianceRulebookWritePage />} />
          <Route path="extraction/console" element={<ExtractionConsoleHomePage />} />
          <Route path="extraction/registry-admin" element={<RegistryAdminView />} />
          {/* §3.15 Opportunity Briefs — advisory surface (UI Spec v2.2 §3.7) */}
          <Route path="opportunity-briefs" element={<OpportunityBriefsPage />} />
          {/* Phase 3 sub-cycle 1 · Connect module (Owner ruling 2026-08-01). */}
          <Route path="connect" element={<ConnectHomePage />} />
          <Route path="connect/new" element={<ConnectNewSourcePage />} />
          {/* Phase 3 sub-cycle 1 · Commission View (FB-5). */}
          <Route path="commission-view" element={<CommissionViewHomePage />} />
          <Route path="commission-view/:sessionId" element={<CommissionRunDetailPage />} />
          {/* Phase 3 sub-cycle 2 · Memory Service surface + Plane
              observability panel + Registry Estate Map. */}
          <Route path="memory" element={<MemoryHomePage />} />
          <Route path="memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
          <Route path="memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
          <Route path="registry" element={<RegistryEstateMapPage />} />
          {/* Phase 3 sub-cycle 3 · Govern module surfaces (existing endpoints only). */}
          <Route path="govern" element={<GovernHomePage />} />
          <Route path="govern/retention" element={<GovernRetentionPage />} />
          <Route path="govern/change-rule" element={<GovernChangeRulePage />} />
          <Route path="govern/refusal-health" element={<GovernRefusalHealthPage />} />
          <Route path="govern/pending" element={<GovernPendingPage />} />
          {/* Anything else falls back to the Ask Console (single ingress per UI Spec §3.1). */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
