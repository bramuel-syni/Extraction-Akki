import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Canon OS root shell — Owner ruling R2 (2026-07-31): the preview root
// serves the Canon OS shell only. Legacy ask-first landing pattern is
// retired from the live tree.
import CanonOSShellPage from './pages/CanonOSShellPage';
import TraceReceiptPage from './pages/trace/TraceReceiptPage';
import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
// UI-1-A (2026-07-31) — Operator + Engineer + AskConsole SALVAGED to
// /salvage/ui1a_retirement_2026-07-31/ + /salvage/askconsole_retirement_2026-07-31/.
// Legacy paths redirect to `/` (Canon OS root).
import MasterAdminHomePage from './pages/master_admin/MasterAdminHomePage';
import ChangeARulePage from './pages/master_admin/ChangeARulePage';
import AuditTrailPage from './pages/master_admin/AuditTrailPage';
// Phase 3 sub-cycle 1 — Connect module (Canon §4).
import ConnectHomePage from './pages/connect/ConnectHomePage';
import ConnectNewSourcePage from './pages/connect/ConnectNewSourcePage';
// Phase 3 sub-cycle 1 — Commission View (FB-5).
import CommissionViewHomePage from './pages/commission_view/CommissionViewHomePage';
import CommissionRunDetailPage from './pages/commission_view/CommissionRunDetailPage';
// Phase 3 sub-cycle 2 — Memory Service + Registry Estate Map.
import MemoryHomePage from './pages/memory/MemoryHomePage';
import MemoryPlaneDetailPage from './pages/memory/MemoryPlaneDetailPage';
import MemoryPlaneObservabilityPage from './pages/memory/MemoryPlaneObservabilityPage';
import RegistryEstateMapPage from './pages/registry/RegistryEstateMapPage';
// Phase 3 sub-cycle 3 — Govern module surfaces (Canon §7).
import GovernHomePage from './pages/govern/GovernHomePage';
import GovernRetentionPage from './pages/govern/GovernRetentionPage';
import GovernChangeRulePage from './pages/govern/GovernChangeRulePage';
import GovernRefusalHealthPage from './pages/govern/GovernRefusalHealthPage';
import GovernPendingPage from './pages/govern/GovernPendingPage';
// UI-1-A (2026-07-31) · Use Data module per Canon §6.
import UseDataLandingPage from './pages/use_data/UseDataLandingPage';
import UseDataWizardPage from './pages/use_data/UseDataWizardPage';
import UseDataDeveloperSurfacePage from './pages/use_data/UseDataDeveloperSurfacePage';
import UseDataVerdictDemoPage from './pages/use_data/UseDataVerdictDemoPage';
// UI-1-A addendum · dormant modules per R2 (Canon §3.1 nav order preserved
// even for scheduled-but-not-yet-built modules; honest dormant tiles).
import ProveDormantPage from './pages/ProveDormantPage';
import TeamDormantPage from './pages/TeamDormantPage';
import { AuthProvider } from './hooks/useAuth';

// R2 · preview hygiene, standing: the preview ROOT serves the NEW build only.
// Retired legacy roots (Ask Console + Operator/Engineer + Compliance +
// Extraction + Opportunity Briefs) redirect to `/`. Backend endpoints for
// those surfaces are UNAFFECTED (per Owner: "the old service_1 ask flow
// is backend-unaffected"); only the user-facing UI is off the live tree.
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<CanonOSShellPage />} />
          <Route path="auth/login" element={<AuthLoginPage />} />
          <Route path="auth/register" element={<AuthRegisterPage />} />
          {/* Trust Receipt three-lens surface (public). */}
          <Route path="trace" element={<TraceReceiptPage />} />
          <Route path="trace/:traceId" element={<TraceReceiptPage />} />
          {/* Canon §4 · Connect. */}
          <Route path="connect" element={<ConnectHomePage />} />
          <Route path="connect/new" element={<ConnectNewSourcePage />} />
          {/* Canon §8 · Registry Estate Map (sub-cycle 2 shell · full prototype
              shape lands in UI-1-D). Memory-under-govern lives here too. */}
          <Route path="registry" element={<RegistryEstateMapPage />} />
          <Route path="memory" element={<MemoryHomePage />} />
          <Route path="memory/planes/:planeId" element={<MemoryPlaneDetailPage />} />
          <Route path="memory/planes/:planeId/observability" element={<MemoryPlaneObservabilityPage />} />
          {/* Canon §6 · Use Data. */}
          <Route path="use-data" element={<UseDataLandingPage />} />
          <Route path="use-data/wizard/:sessionId" element={<UseDataWizardPage />} />
          <Route path="use-data/developer/:sessionId" element={<UseDataDeveloperSurfacePage />} />
          <Route path="use-data/verdict-demo" element={<UseDataVerdictDemoPage />} />
          <Route path="use-data/verdict-panel" element={<Navigate to="/use-data/verdict-demo" replace />} />
          {/* Canon §7 · Govern (DPO estate). */}
          <Route path="govern" element={<GovernHomePage />} />
          <Route path="govern/retention" element={<GovernRetentionPage />} />
          <Route path="govern/change-rule" element={<GovernChangeRulePage />} />
          <Route path="govern/refusal-health" element={<GovernRefusalHealthPage />} />
          <Route path="govern/pending" element={<GovernPendingPage />} />
          {/* Canon §9 · Prove — DORMANT (UI-1-D fold). */}
          <Route path="prove" element={<ProveDormantPage />} />
          {/* Canon §5 · Team — DORMANT (UI-1-E fold). */}
          <Route path="team" element={<TeamDormantPage />} />
          {/* Master Admin ceremony surfaces (kept live; reached from Govern for now). */}
          <Route path="master-admin" element={<MasterAdminHomePage />} />
          <Route path="master-admin/change-a-rule/:ruleId" element={<ChangeARulePage />} />
          <Route path="master-admin/audit-trail" element={<AuditTrailPage />} />
          {/* Commission View (FB-5): pipeline detail; reached from Use Data In-progress rows. */}
          <Route path="commission-view" element={<CommissionViewHomePage />} />
          <Route path="commission-view/:sessionId" element={<CommissionRunDetailPage />} />
          {/* UI-1-A · Legacy path redirects — every retired route resolves to the
              Canon OS root to prevent bookmark white-screens. See salvage/
              ui1a_retirement_2026-07-31/ + askconsole_retirement_2026-07-31/
              RETIREMENT_NOTE.md for provenance. */}
          <Route path="operator" element={<Navigate to="/" replace />} />
          <Route path="operator/*" element={<Navigate to="/" replace />} />
          <Route path="engineer/*" element={<Navigate to="/" replace />} />
          <Route path="ask" element={<Navigate to="/" replace />} />
          <Route path="ask-console" element={<Navigate to="/" replace />} />
          <Route path="console" element={<Navigate to="/" replace />} />
          {/* Legacy compliance / extraction / opportunity briefs UIs — retired
              from the live nav; backend endpoints unaffected. UI returns in
              UI-1-D · Prove. */}
          <Route path="compliance" element={<Navigate to="/prove" replace />} />
          <Route path="compliance/*" element={<Navigate to="/prove" replace />} />
          <Route path="extraction/*" element={<Navigate to="/registry" replace />} />
          <Route path="opportunity-briefs" element={<Navigate to="/registry" replace />} />
          {/* Anything else → Canon OS root. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
