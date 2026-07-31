import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AskConsolePage from './pages/AskConsolePage';
import TraceReceiptPage from './pages/trace/TraceReceiptPage';
import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
import OperatorHomePage from './pages/operator/OperatorHomePage';
import CommissionWizardPage from './pages/operator/CommissionWizardPage';
import CommitReviewPage from './pages/operator/CommitReviewPage';
import EngineerRegisterAppPage from './pages/engineer/EngineerRegisterAppPage';
import EngineerFirstCallPage from './pages/engineer/EngineerFirstCallPage';
import EngineerAdministerPage from './pages/engineer/EngineerAdministerPage';
import OnboardingInvitePage from './pages/engineer/OnboardingInvitePage';
// Commercial-cut 2026-07-06 (BCR v1.4 §12): buyer §5 surface (BuyerShape/
// Acquire/Receive) cut whole — buyer wizard variant is not built on this
// tree post-cut. Salvage location:
//   /app/salvage/commercial_cut_2026_07_06/frontend/pages/
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
// Phase 3 sub-cycle 1 — Commission View (FB-5).
import CommissionViewHomePage from './pages/commission_view/CommissionViewHomePage';
import CommissionRunDetailPage from './pages/commission_view/CommissionRunDetailPage';
// Phase 3 sub-cycle 2 — Memory Service surface + Plane observability panel
// + Registry Estate Map (Owner ruling 2026-08-02).
import MemoryHomePage from './pages/memory/MemoryHomePage';
import MemoryPlaneDetailPage from './pages/memory/MemoryPlaneDetailPage';
import MemoryPlaneObservabilityPage from './pages/memory/MemoryPlaneObservabilityPage';
import RegistryEstateMapPage from './pages/registry/RegistryEstateMapPage';
import { AuthProvider } from './hooks/useAuth';

// Phase 8 Stage B-1 — Auth landing (Owner E1 ratified: custom JWT + bcrypt).
// The AuthProvider wraps the entire tree so any surface can call useAuth().
// Ask Console remains the primary surface at `/`; auth surface at `/auth/*`.
// G-10/G-7 PROMOTE (docs/rulings/g10_g7_promote_2026-07-14.md, 2026-07-14):
// TraceReceiptPage lifted out of /legacy/* and mounted at public /trace and
// /trace/:traceId. Remaining seven /legacy/* pages retired at the same
// ruling; the AppShell and /legacy/* nested Routes block removed.
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
          {/* Phase 8 Stage B-2 — Operator surface (UI Spec §2) */}
          <Route path="operator" element={<OperatorHomePage />} />
          <Route path="operator/commission" element={<CommissionWizardPage />} />
          <Route path="operator/commit-review/:sessionId" element={<CommitReviewPage />} />
          {/* Phase 8 Stage B-3 — Engineer surface (UI Spec §4) */}
          <Route path="engineer/register" element={<EngineerRegisterAppPage />} />
          <Route path="engineer/first-call" element={<EngineerFirstCallPage />} />
          <Route path="engineer/administer" element={<EngineerAdministerPage />} />
          {/* Phase 8-EXT — external-engineer onboarding (UI Spec v2.1 §5.4) */}
          <Route path="engineer/onboarding" element={<OnboardingInvitePage />} />
          {/* Phase 8 Stage B-3 — Buyer surface (UI Spec §5) CUT at
              commercial cut 2026-07-06 (BCR v1.4 §12); no live routes. */}
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
          {/* Anything else falls back to the Ask Console (single ingress per UI Spec §3.1). */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
