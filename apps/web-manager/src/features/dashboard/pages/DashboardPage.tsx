import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { Brand } from '../../../shared/components/Brand'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isManager = !!user?.capabilities?.is_manager

  if (!isManager) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
          <div className="container-app flex items-center justify-between py-3">
            <Brand size="sm" />
            <button onClick={handleLogout} className="btn-secondary !h-10 !px-4">Keluar</button>
          </div>
        </header>
        <main className="container-app py-12 max-w-xl text-center">
          <div className="card-lifted p-8 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-error-container flex items-center justify-center text-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h1 className="font-display text-2xl font-extrabold">Akses Manager Diperlukan</h1>
            <p className="text-sm text-on-surface-variant">Akun <span className="font-bold">{user?.email}</span> belum memiliki Laundry. Buat laundry terlebih dahulu di aplikasi Customer.</p>
            <div className="flex gap-3 justify-center">
              <a href="http://127.0.0.1:5173/profile/laundry/create" className="btn-primary">Buat Laundry di web-customer</a>
              <button onClick={handleLogout} className="btn-secondary">Keluar</button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <span className="badge-active">Manager</span>
            <span className="text-sm font-semibold">{user.name}</span>
            <button onClick={handleLogout} className="btn-secondary !h-10 !px-4">Keluar</button>
          </div>
        </div>
      </header>
      <main className="container-app py-8">
        <h1 className="font-display text-3xl font-extrabold">Dashboard Manager</h1>
        <p className="text-sm text-on-surface-variant mt-1">Kelola bisnis laundry Anda — {user.laundry?.business_name}</p>

        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="card p-5">
            <p className="text-xs font-bold tracking-widest text-on-surface-variant">LAUNDRY</p>
            <p className="font-display text-lg font-bold mt-1">{user.laundry?.business_name}</p>
            <p className="text-xs text-on-surface-variant">Status: {user.laundry?.status}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold tracking-widest text-on-surface-variant">PERAN</p>
            <p className="font-display text-lg font-bold mt-1">Owner / Manager</p>
            <p className="text-xs text-on-surface-variant">Punya semua kemampuan Staff + manajerial</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold tracking-widest text-on-surface-variant">AKSES</p>
            <p className="text-sm mt-1">Kelola Staff, Layanan & Harga, Settlement</p>
            <div className="flex gap-2 mt-2">
              <Link to="/staff/applications" className="text-xs text-primary font-semibold">Lihat Staff →</Link>
              <Link to="/services" className="text-xs text-primary font-semibold">Kelola Layanan →</Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          <div className="card-lifted p-6">
            <h3 className="font-display font-bold">Staff & Lowongan</h3>
            <p className="text-sm text-on-surface-variant mt-1">Kelola rekrutmen dan aktivasi staff.</p>
            <div className="mt-4 flex gap-2">
              <Link to="/staff/applications" className="btn-primary !h-8 !px-3 text-xs">Kelola Pendaftar →</Link>
              <span className="badge-neutral">Staff Management</span>
            </div>
          </div>
          <div className="card-lifted p-6">
            <h3 className="font-display font-bold">Laporan & Settlement</h3>
            <p className="text-sm text-on-surface-variant mt-1">Lihat pendapatan dan settlement laundry.</p>
            <div className="mt-4 flex gap-2">
              <Link to="/settlements" className="btn-primary !h-8 !px-3 text-xs">Minta Settlement →</Link>
              <span className="badge-neutral">Settlement Laundry</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
