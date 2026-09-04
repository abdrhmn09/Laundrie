import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import GoogleCallbackPage from './features/auth/pages/GoogleCallbackPage'
import StaffLaundryListPage from './features/staff/pages/StaffLaundryListPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import WeighingPage from './features/weighing/pages/WeighingPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/laundries" element={<StaffLaundryListPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/staff/laundries" element={<StaffLaundryListPage />} />
            <Route path="/orders/:id/weighing" element={<WeighingPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
