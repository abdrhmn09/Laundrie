import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import GoogleCallbackPage from './features/auth/pages/GoogleCallbackPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import VerificationQueuePage from './features/verification/pages/VerificationQueuePage'
import AdminSettlementsPage from './features/finance/pages/AdminSettlementsPage'
import AdminComplaintsPage from './features/complaints/pages/AdminComplaintsPage'
import AuditLogPage from './features/audit/pages/AuditLogPage'
import PlatformConfigPage from './features/config/pages/PlatformConfigPage'
import AdminOrderOverridePage from './features/orders/pages/AdminOrderOverridePage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/verifications" element={<VerificationQueuePage />} />
            <Route path="/verification-documents" element={<VerificationQueuePage />} />
            <Route path="/settlements" element={<AdminSettlementsPage />} />
            <Route path="/complaints" element={<AdminComplaintsPage />} />
            {/* Phase 5 */}
            <Route path="/audit-logs" element={<AuditLogPage />} />
            <Route path="/platform-config" element={<PlatformConfigPage />} />
            <Route path="/orders" element={<AdminOrderOverridePage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
