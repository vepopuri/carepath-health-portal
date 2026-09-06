import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth } from './components/auth/RequireAuth';
import { LoginPage } from './pages/LoginPage';
import { AppShell } from './components/shell/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { MyPlanPage } from './pages/MyPlanPage';
import { FamilyPage } from './pages/FamilyPage';
import { FindCarePage } from './pages/FindCarePage';
import { ProviderDetailsPage } from './pages/ProviderDetailsPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ClaimDetailsPage } from './pages/ClaimDetailsPage';
import { PriorAuthorizationsPage } from './pages/PriorAuthorizationsPage';
import { BillingPage } from './pages/BillingPage';
import { DocumentsPage } from './pages/DocumentsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/plan" element={<MyPlanPage />} />
            <Route path="/family" element={<FamilyPage />} />
            <Route path="/find-care" element={<FindCarePage />} />
            <Route path="/find-care/:providerId" element={<ProviderDetailsPage />} />
            <Route path="/claims" element={<ClaimsPage />} />
            <Route path="/claims/:claimId" element={<ClaimDetailsPage />} />
            <Route path="/prior-authorizations" element={<PriorAuthorizationsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="*" element={<OverviewPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
