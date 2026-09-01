import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { Brand } from '../../../shared/components/Brand'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); navigate('/login') }
  const isStaff = !!user?.capabilities?.is_staff

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app flex justify-between py-3"><Brand size="sm" /><button onClick={handleLogout} className="btn-secondary !h-10">Keluar</button></div></header>
        <main className="container-app py-12 max-w-xl text-center">
          <div className="card-lifted p-8 space-y-4">
            <h1 className="font-display text-2xl font-extrabold">Akses Staff Diperlukan</h1>
            <p className="text-sm text-on-surface-variant">Akun {user?.email} belum menjadi Staff. Lamar lowongan di web-customer.</p>
            <a href="http://127.0.0.1:5173/profile/staff/discovery" className="btn-primary">Cari Lowongan di web-customer</a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app flex justify-between py-3"><Brand size="sm" /><div className="flex gap-3 items-center"><span className="badge-active">Staff</span><span className="text-sm font-semibold">{user.name}</span><button onClick={handleLogout} className="btn-secondary !h-10">Keluar</button></div></div></header>
      <main className="container-app py-8">
        <h1 className="font-display text-3xl font-extrabold">Dashboard Staff</h1>
        <p className="text-sm text-on-surface-variant">Operasional harian — {user.staff?.laundry_name} • Role: {user.staff?.role}</p>
        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="card p-5"><p className="text-xs font-bold tracking-widest text-on-surface-variant">LAUNDRY</p><p className="font-display font-bold mt-1">{user.staff?.laundry_name}</p><p className="text-xs">Status: {user.staff?.status}</p></div>
          <div className="card p-5"><p className="text-xs font-bold tracking-widest text-on-surface-variant">PEKERJAAN</p><p className="font-display text-2xl font-extrabold mt-1">3</p><p className="text-xs">Antrean Intake Hari Ini</p></div>
          <div className="card p-5"><p className="text-xs font-bold tracking-widest text-on-surface-variant">PERAN</p><p className="text-sm mt-1">Semua Staff = operasional umum (PRD §11)</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          <div className="card-lifted p-6"><h3 className="font-display font-bold">Intake & Penimbangan</h3><p className="text-sm text-on-surface-variant">Mulai timbang, ambil foto bukti berat.</p><span className="badge-neutral mt-2">Weighing & Camera</span></div>
          <div className="card-lifted p-6"><h3 className="font-display font-bold">Pemrosesan</h3><p className="text-sm text-on-surface-variant">Tandai siap diantar.</p><span className="badge-neutral mt-2">Processing</span></div>
        </div>
        {user.capabilities?.is_courier && <div className="mt-6 card p-4 bg-primary-container/20"><p className="text-sm font-bold">Anda juga Courier ({user.courier?.courier_type}) — buka web-courier untuk job pickup/delivery.</p><a href="http://127.0.0.1:5176" className="btn-primary !h-8 !px-3 text-xs mt-2">Buka web-courier</a></div>}
      </main>
    </div>
  )
}
