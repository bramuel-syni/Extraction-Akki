import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Fidelity Batch B1 (2026-08-01) — Owner ruling: build target = EXACT
// parity with /app/docs/mandates/Akki_v4_Standalone.html (SHA 2ab55d9f…).
// The Canon OS six-tile shell retired; every in-app route wraps in the
// prototype's persistent sidebar + rich header via AkkiV4ShellLayout.
// Legacy `/` visitors redirect to `/registry` (the prototype default).
import AkkiV4ShellLayout from './design/AkkiV4ShellLayout';
import RegistryV4Page from './pages/registry/RegistryV4Page';
// Retired: CanonOSShellPage — kept as file for salvage until batch B10 close.
// Do not import; the six-tile grid is off the live tree.
import TraceReceiptPage from './pages/trace/TraceReceiptPage';
import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
import MasterAdminHomePage from './pages/master_admin/MasterAdminHomePage';
import ChangeARulePage from './pages/master_admin/ChangeARulePage';
import AuditTrailPage from './pages/master_admin/AuditTrailPage';
// Phase 3 sub-cycle 1 — Connect module (Canon §4). Rebuilt UI-1-C 2026-08-02.
import ConnectHomePage from './pages/connect/ConnectHomePage';
import ConnectNewSourcePage from './pages/connect/ConnectNewSourcePage';
import ConnectRulesPage from './pages/connect/ConnectRulesPage';
import ConnectSourceProfilePage from './pages/connect/ConnectSourceProfilePage';
import ConnectSetupPage from './pages/connect/ConnectSetupPage';
import CommissionViewHomePage from './pages/commission_view/CommissionViewHomePage';
import CommissionRunDetailPage from './pages/commission_view/CommissionRunDetailPage';
import MemoryHomePage from './pages/memory/MemoryHomePage';
import MemoryPlaneDetailPage from './pages/memory/MemoryPlaneDetailPage';
import MemoryPlaneObservabilityPage from './pages/memory/MemoryPlaneObservabilityPage';
import RegistryEstateMapPage from './pages/registry/RegistryEstateMapPage';
import RegistryWhatYouHoldPage from './pages/registry/RegistryWhatYouHoldPage';
import ProvePage from './pages/prove/ProvePage';
import ProveWalkPage from './pages/prove/ProveWalkPage';
import TeamLandingPage from './pages/team/TeamLandingPage';
import TeamApprovalSurfacePage from './pages/team/TeamApprovalSurfacePage';
import TeamAccessRegisterPage from './pages/team/TeamAccessRegisterPage';
import TeamConstitutionalSeatsPage from './pages/team/TeamConstitutionalSeatsPage';
import GovernHomePage from './pages/govern/GovernHomePage';
import GovernRetentionPage from './pages/govern/GovernRetentionPage';
import GovernChangeRulePage from './pages/govern/GovernChangeRulePage';
import GovernRefusalHealthPage from './pages/govern/GovernRefusalHealthPage';
import GovernPendingPage from './pages/govern/GovernPendingPage';
import GovernEstateRulesPage from './pages/govern/GovernEstateRulesPage';
import GovernRegistriesPage from './pages/govern/GovernRegistriesPage';
import GovernHoldsPage from './pages/govern/GovernHoldsPage';
import UseDataLandingPage from './pages/use_data/UseDataLandingPage';
import UseDataWizardPage from './pages/use_data/UseDataWizardPage';
import UseDataDeveloperSurfacePage from './pages/use_data/UseDataDeveloperSurfacePage';
import UseDataVerdictDemoPage from './pages/use_data/UseDataVerdictDemoPage';
// eslint-disable-next-line no-unused-vars
import ProveDormantPage from './pages/ProveDormantPage';
// eslint-disable-next-line no-unused-vars
import TeamDormantPage from './pages/TeamDormantPage';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth routes — light chrome, no shell wrap. */}
          <Route path="auth/login" element={<AuthLoginPage />} />
          <Route path="auth/register" element={<AuthRegisterPage />} />
          {/* Public trace receipt lens — no shell wrap. */}
          <Route path="trace" element={<TraceReceiptPage />} />
          <Route path="trace/:traceId" element={<TraceReceiptPage />} />

          {/* All in-app routes render inside AkkiV4Shell (216 px sidebar
              + 66 px rich header + main content area). */}
          <Route element={<AkkiV4ShellLayout />}>
            {/* Root redirects to Registry — the prototype's default landing. */}
            <Route index element={<Navigate to="/registry" replace />} />

            {/* Canon §5 · Registry ('What You Hold'). Prototype-parity page
                is the new default; legacy page kept at /registry/legacy. */}
            <Route path="registry" element={<RegistryV4Page />} />
            <Route path="registry/legacy" element={<RegistryWhatYouHoldPage />} />
            <Route path="registry/estate-map" element={<RegistryEstateMapPage />} />

            {/* Canon §4 · Connect. */}
            <Route path="connect" element={<ConnectHomePage />} />
            <Route path="connect/new" element={<ConnectNewSourcePage />} />
            <Route path="connect/rules" element={<ConnectRulesPage />} />
            <Route path="connect/source/:sourceId" element={<ConnectSourceProfilePage />} />
            <Route path="connect/setup" element={<ConnectSetupPage />} />

            {/* Canon §6 · Use Data. */}
            <Route path="use-data" element={<UseDataLandingPage />} />
            <Route path="use-data/wizard/:sessionId" element={<UseDataWizardPage />} />
            <Route path="use-data/developer/:sessionId" element={<UseDataDeveloperSurfacePage />} />
            <Route path="use-data/verdict-demo" element={<UseDataVerdictDemoPage />} />
            <Route path="use-data/verdict-panel" element={<Navigate to="/use-data/verdict-demo" replace />} />

            {/* Canon §7 · Govern. */}
            <Route path="govern" element={<GovernHomePage />} />
            <Route path="govern/retention" element={<GovernRetentionPage />} />
            <Route path="govern/change-rule" element={<GovernChangeRulePage />} />
            <Route path="govern/refusal-health" element={<GovernRefusalHealthPage />} />
            <Route path="govern/pending" element={<GovernPendingPage />} />
            <Route path="govern/rules" element={<GovernEstateRulesPage />} />
            <Route path="govern/registries" element={<GovernRegistriesPage />} />
            <Route path="govern/holds" element={<GovernHoldsPage />} />

            {/* Canon §9 · Prove. */}
            <Route path="prove" element={<ProvePage />} />
            <Route path="prove/trace/:traceId" element={<ProveWalkPage />} />

            {/* Canon §3.4 · Team. */}
            <Route path="team" element={<TeamLandingPage />} />
            <Route path="team/approval-surface" element={<TeamApprovalSurfacePage />} />
            <Route path="team/access-register" element={<TeamAccessRegisterPage />} />
            <Route path="team/constitutional-seats" element={<TeamConstitutionalSeatsPage />} />

            {/* /memory + /master-admin retained for now — CD-3.2 retirement
                lands in batch B9 (top-level nav retirement + re-home). */}
            <Route path="memory" element={<MemoryHomePage />} />
            <Route path="memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
            <Route path="memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
            <Route path="master-admin" element={<MasterAdminHomePage />} />
            <Route path="master-admin/change-a-rule/:ruleId" element={<ChangeARulePage />} />
            <Route path="master-admin/audit-trail" element={<AuditTrailPage />} />

            {/* Commission View — CD-3.1 REVERSAL lands in batch B4. Retained
                for now to avoid white screens; redirects to /use-data as a
                salvage step land in B4. */}
            <Route path="commission-view" element={<CommissionViewHomePage />} />
            <Route path="commission-view/:sessionId" element={<CommissionRunDetailPage />} />
          </Route>

          {/* Legacy path redirects — unchanged from UI-1-A. */}
          <Route path="operator" element={<Navigate to="/" replace />} />
          <Route path="operator/*" element={<Navigate to="/" replace />} />
          <Route path="engineer/*" element={<Navigate to="/" replace />} />
          <Route path="ask" element={<Navigate to="/" replace />} />
          <Route path="ask-console" element={<Navigate to="/" replace />} />
          <Route path="console" element={<Navigate to="/" replace />} />
          <Route path="compliance" element={<Navigate to="/prove" replace />} />
          <Route path="compliance/*" element={<Navigate to="/prove" replace />} />
          <Route path="extraction/*" element={<Navigate to="/registry" replace />} />
          <Route path="opportunity-briefs" element={<Navigate to="/registry" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
