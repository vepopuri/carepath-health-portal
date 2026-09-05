import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { MyPlanPage } from './pages/MyPlanPage';
import { FindCarePage } from './pages/FindCarePage';
import { ProviderDetailsPage } from './pages/ProviderDetailsPage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ClaimDetailsPage } from './pages/ClaimDetailsPage';
import { PriorAuthorizationsPage } from './pages/PriorAuthorizationsPage';
import { BillingPage } from './pages/BillingPage';
import { DocumentsPage } from './pages/DocumentsPage';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/plan" element={<MyPlanPage />} />
        <Route path="/find-care" element={<FindCarePage />} />
        <Route path="/find-care/:providerId" element={<ProviderDetailsPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/claims/:claimId" element={<ClaimDetailsPage />} />
        <Route path="/prior-authorizations" element={<PriorAuthorizationsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="*" element={<OverviewPage />} />
      </Route>
    </Routes>
  );
}

export default App;
