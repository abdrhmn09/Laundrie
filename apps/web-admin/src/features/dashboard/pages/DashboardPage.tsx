import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import AdminLayout from '../../../shared/components/AdminLayout'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); navigate('/login') }
  const isAdmin = !!user?.capabilities?.is_admin
  const role = user?.admin?.role ?? user?.role

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="card-lifted p-8 space-y-4 max-w-md text-center">
          <h1 className="font-display text-2xl font-extrabold">Akses Admin Diperlukan</h1>
          <p className="text-sm text-on-surface-variant">Akun {user?.email} bukan admin. Hubungi Super Admin.</p>
          <button onClick={handleLogout} className="btn-secondary">Keluar</button>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Dashboard Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Role: <span className="font-bold text-slate-700">{role}</span> • Principle of Least Privilege & Mandatory Audit Logging (PRD §20)</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-extrabold tracking-widest text-amber-600 uppercase">OPERATIONS</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">Moderasi Laundry & Courier, Override Status Order</p>
            <Link to="/orders" className="mt-3 inline-block text-xs font-bold text-[#00667e]">Override Order →</Link>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-extrabold tracking-widest text-emerald-600 uppercase">FINANCE</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">Refund Komplain & Settlement Payout Mitra</p>
            <Link to="/settlements" className="mt-3 inline-block text-xs font-bold text-[#00667e]">Review Settlement →</Link>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-extrabold tracking-widest text-purple-600 uppercase">SUPER ADMIN</p>
            <p className="text-xs font-semibold text-slate-600 mt-1">Dynamic Platform Config & Full Audit Logs</p>
            <Link to="/audit-logs" className="mt-3 inline-block text-xs font-bold text-[#00667e]">Lihat Audit Trail →</Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-display text-base font-extrabold text-slate-900">Modul Utama Platform Admin Console</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/verifications" className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition">
              <span className="text-lg block">📋</span>
              <span className="text-xs font-bold text-slate-800">Verifikasi Dokumen</span>
            </Link>
            <Link to="/complaints" className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition">
              <span className="text-lg block">⚖️</span>
              <span className="text-xs font-bold text-slate-800">Arbitrase Komplain</span>
            </Link>
            <Link to="/orders" className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition">
              <span className="text-lg block">📦</span>
              <span className="text-xs font-bold text-slate-800">Override Status Order</span>
            </Link>
            <Link to="/platform-config" className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition">
              <span className="text-lg block">⚙️</span>
              <span className="text-xs font-bold text-slate-800">Platform Config</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
