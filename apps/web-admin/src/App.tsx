import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import VerificationQueuePage from './features/verification/pages/VerificationQueuePage'
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
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
