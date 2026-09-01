import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import LandingPage from './features/landing/pages/LandingPage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage'
import VerifyEmailPage from './features/auth/pages/VerifyEmailPage'
import VerifyEmailCallbackPage from './features/auth/pages/VerifyEmailCallbackPage'
import GoogleCallbackPage from './features/auth/pages/GoogleCallbackPage'
import ProfilePage from './features/auth/pages/ProfilePage'
import ChangePasswordPage from './features/auth/pages/ChangePasswordPage'
import SessionsPage from './features/auth/pages/SessionsPage'
import DashboardPage from './features/auth/pages/DashboardPage'
import CreateLaundryPage from './features/laundry/pages/CreateLaundryPage'
import StaffDiscoveryPage from './features/staff/pages/StaffDiscoveryPage'
import CourierOnboardingPage from './features/courier/pages/CourierOnboardingPage'
import CatalogPage from './features/catalog/pages/CatalogPage'
import AddressesPage from './features/address/pages/AddressesPage'
import LaundryDiscoveryPage from './features/laundry-discovery/pages/LaundryDiscoveryPage'
import ProtectedRoute from './features/auth/components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/verify/:id/:hash" element={<VerifyEmailCallbackPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/laundries" element={<LaundryDiscoveryPage />} />
          <Route path="/addresses" element={<AddressesPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/change-password" element={<ChangePasswordPage />} />
            <Route path="/profile/sessions" element={<SessionsPage />} />
            <Route path="/profile/laundry/create" element={<CreateLaundryPage />} />
            <Route path="/profile/staff/discovery" element={<StaffDiscoveryPage />} />
            <Route path="/profile/courier/onboarding" element={<CourierOnboardingPage />} />
            <Route path="/addresses" element={<AddressesPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}