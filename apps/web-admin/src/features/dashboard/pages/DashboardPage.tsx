import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { Brand } from '../../../shared/components/Brand'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); navigate('/login') }
  const isAdmin = !!user?.capabilities?.is_admin
  const role = user?.admin?.role ?? user?.role

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app flex justify-between py-3"><Brand size="sm" /><button onClick={handleLogout} className="btn-secondary !h-10">Keluar</button></div></header>
        <main className="container-app py-12 max-w-xl text-center">
          <div className="card-lifted p-8 space-y-4">
            <h1 className="font-display text-2xl font-extrabold">Akses Admin Diperlukan</h1>
            <p className="text-sm text-on-surface-variant">Akun {user?.email} bukan admin. Hubungi Super Admin.</p>
            <button onClick={handleLogout} className="btn-secondary">Keluar</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app flex justify-between py-3"><Brand size="sm" /><div className="flex gap-3 items-center"><span className="badge-error">{role}</span><span className="text-sm font-semibold">{user.name}</span><button onClick={handleLogout} className="btn-secondary !h-10">Keluar</button></div></div></header>
      <main className="container-app py-8">
        <h1 className="font-display text-3xl font-extrabold">Dashboard Admin</h1>
        <p className="text-sm text-on-surface-variant">Role: {role} • Least Privilege (PRD §20)</p>

        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="card p-5"><p className="text-xs font-bold tracking-widest">OPERATIONS</p><p className="text-sm mt-1">Moderasi Laundry & Courier, Override Order</p><span className="badge-warning mt-2">Ops Admin</span></div>
          <div className="card p-5"><p className="text-xs font-bold tracking-widest">FINANCE</p><p className="text-sm mt-1">Refund, Settlement Payout</p><span className="badge-success mt-2">Finance Admin</span></div>
          <div className="card p-5"><p className="text-xs font-bold tracking-widest">SUPER</p><p className="text-sm mt-1">Config & RBAC, Audit Log Penuh</p><span className="badge-error mt-2">Super Admin</span></div>
        </div>

        <div className="card-lifted p-6 mt-6">
          <h3 className="font-display font-bold">Menu Admin (11 screen Design §28)</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {['Dashboard Operasional','Orders Management','Laundry Moderasi','Courier Moderasi','Evidence Compliance','Complaints','Payments','Settlements','Audit Logs','Settings','Users'].map(s => <span key={s} className="badge-neutral">{s}</span>)}
          </div>
          <p className="text-xs text-on-surface-variant mt-3">Akses dibatasi per role — Finance tidak bisa override order, Ops tidak bisa eksekusi payout (PRD §20.2).</p>
        </div>
      </main>
    </div>
  )
}
