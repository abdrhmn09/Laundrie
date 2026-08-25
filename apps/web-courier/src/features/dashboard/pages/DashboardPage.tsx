import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { Brand } from '../../../shared/components/Brand'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const handleLogout = async () => { await logout(); navigate('/login') }
  const isCourier = !!user?.capabilities?.is_courier

  if (!isCourier) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app flex justify-between py-3"><Brand size="sm" /><button onClick={handleLogout} className="btn-secondary !h-10">Keluar</button></div></header>
        <main className="container-app py-12 max-w-xl text-center">
          <div className="card-lifted p-8 space-y-4">
            <h1 className="font-display text-2xl font-extrabold">Akses Courier Diperlukan</h1>
            <p className="text-sm text-on-surface-variant">Akun {user?.email} belum terdaftar sebagai Courier. Daftar di web-customer.</p>
            <a href="http://127.0.0.1:5173/profile/courier/onboarding" className="btn-primary">Daftar Courier di web-customer</a>
          </div>
        </main>
      </div>
    )
  }

  const isFreelance = user.courier?.courier_type === 'freelance'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app flex justify-between py-3"><Brand size="sm" /><div className="flex gap-3 items-center"><span className="badge-success">{isFreelance ? 'Freelance' : 'Laundry Staff'}</span><span className="text-sm font-semibold">{user.name}</span><button onClick={handleLogout} className="btn-secondary !h-10">Keluar</button></div></div></header>
      <main className="container-app py-8">
        <h1 className="font-display text-3xl font-extrabold">Dashboard Courier</h1>
        <p className="text-sm text-on-surface-variant">Tipe: {user.courier?.courier_type} • Status: {user.courier?.status} {isFreelance ? '• laundry_id NULL' : `• ${user.courier?.laundry_id ? 'Laundry #' + user.courier.laundry_id : ''}`}</p>

        <div className="grid gap-4 sm:grid-cols-3 mt-8">
          <div className="card p-5"><p className="text-xs font-bold tracking-widest">TIPE</p><p className="font-display font-bold mt-1">{isFreelance ? 'Freelance Courier' : 'Staff Courier'}</p><p className="text-xs">{isFreelance ? 'Tidak terikat laundry' : 'Terikat 1 laundry'}</p></div>
          <div className="card p-5"><p className="text-xs font-bold tracking-widest">JOB AKTIF</p><p className="font-display text-2xl font-extrabold mt-1">2</p><p className="text-xs">Pickup & Delivery</p></div>
          <div className="card p-5"><p className="text-xs font-bold tracking-widest">PENDAPATAN</p><p className="text-sm mt-1">{isFreelance ? 'Saldo siap tarik (otomatis per COMPLETED)' : 'Dikelola Manager via Settlement'}</p></div>
        </div>

        {isFreelance ? (
          <div className="card-lifted p-6 mt-6">
            <h3 className="font-display font-bold">Earnings & Payout (Freelance)</h3>
            <p className="text-sm text-on-surface-variant">Setiap COMPLETED langsung kredit saldo. Tombol Tarik Saldo aktif bila memenuhi ambang.</p>
            <button className="btn-primary mt-4">Tarik Saldo</button>
          </div>
        ) : (
          <div className="card p-6 mt-6 bg-secondary-container/20">
            <h3 className="font-display font-bold">Pendapatan Staff Courier</h3>
            <p className="text-sm">Pendapatan Anda dikelola Manager sebagai bagian dari penggajian internal (PRD §17.1, Rule §55). Tidak ada Tarik Saldo langsung.</p>
            <p className="text-xs mt-2">Lihat job selesai: 5 COMPLETED • Staff di Laundrie Express Peudada</p>
          </div>
        )}
      </main>
    </div>
  )
}
