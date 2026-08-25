import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

const ROLE_LABEL: Record<string, string> = {
  customer: 'Pelanggan',
  staff: 'Staf Laundry',
  manager: 'Manajer Laundry',
  courier: 'Kurir',
  operations_admin: 'Admin Operasional',
  finance_admin: 'Admin Keuangan',
  super_admin: 'Super Admin',
  admin: 'Admin',
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    active: { tone: 'badge-active', label: 'Aktif' },
    email_unverified: { tone: 'badge-warning', label: 'Email Belum Diverifikasi' },
    pending_verification: { tone: 'badge-warning', label: 'Menunggu Verifikasi' },
    suspended: { tone: 'badge-error', label: 'Ditangguhkan' },
  }
  const cfg = map[status] ?? { tone: 'badge-neutral', label: status }
  return <span className={cfg.tone}>{cfg.label}</span>
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const roleLabel = user ? (ROLE_LABEL[user.role] ?? user.role) : ''

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <Link to="/profile" className="hidden sm:inline-flex btn-ghost !h-10 !px-3">
              Profil Saya
            </Link>
            <div className="hidden text-right sm:block">
              <p className="font-sans text-sm font-semibold text-on-surface">{user?.name}</p>
              <p className="font-sans text-xs text-on-surface-variant">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary !h-10 !px-4"
              aria-label="Keluar"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="container-app py-8">
        {/* Verification Warning Banner */}
        {user && !user.email_verified && (
          <div className="mb-6 rounded-[--radius-md] border border-status-warning-container bg-status-warning-container/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 shrink-0 text-status-warning">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              <p className="text-sm font-medium text-on-surface">
                Email Anda belum diverifikasi. Verifikasi email untuk membuka semua fitur Laundrie.
              </p>
            </div>
            <Link to="/verify-email" className="btn-primary !h-9 !px-4 text-xs shrink-0">
              Verifikasi Sekarang
            </Link>
          </div>
        )}

        <section className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Selamat datang, {user?.name.split(' ')[0]}
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={user?.status ?? ''} />
            <span className="badge-neutral">{roleLabel}</span>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 font-display text-xl font-bold text-on-surface">Ringkasan</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-lifted p-5 sm:p-6">
              <p className="font-sans text-xs font-semibold tracking-[0.03em] text-on-surface-variant">
                PESANAN AKTIF
              </p>
              <p className="mt-2 font-display text-4xl font-extrabold text-primary">0</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Pesanan baru akan muncul di sini.
              </p>
            </div>

            <div className="card-lifted p-5 sm:p-6">
              <p className="font-sans text-xs font-semibold tracking-[0.03em] text-on-surface-variant">
                PEMBERITAHUAN
              </p>
              <p className="mt-2 font-display text-4xl font-extrabold text-on-surface">0</p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Belum ada pemberitahuan baru.
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-on-surface">Profil & Keamanan</h2>
            <Link to="/profile" className="text-xs font-semibold text-primary hover:underline">
              Kelola Profil Lengkap →
            </Link>
          </div>
          <div className="card-lifted divide-y divide-[#e1eef3] p-2 sm:p-3">
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Nama</span>
              <span className="font-sans text-sm font-semibold text-on-surface">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Email</span>
              <div className="flex items-center gap-2">
                <span className="font-sans text-sm font-semibold text-on-surface">{user?.email}</span>
                {user?.email_verified ? (
                  <span className="badge-success text-[10px] !py-0.5">Verified</span>
                ) : (
                  <span className="badge-warning text-[10px] !py-0.5">Unverified</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Nomor WhatsApp</span>
              <span className="font-sans text-sm font-semibold text-on-surface">
                {user?.phone ?? 'Belum diisi'}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Menu Keamanan</span>
              <div className="flex gap-2">
                <Link to="/profile/change-password" className="text-xs font-semibold text-primary hover:underline">
                  Ganti Password
                </Link>
                <span className="text-outline-variant">•</span>
                <Link to="/profile/sessions" className="text-xs font-semibold text-primary hover:underline">
                  Sesi Aktif
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}