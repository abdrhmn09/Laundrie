import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

const ROLE_LABEL: Record<string, string> = {
  customer: 'Pelanggan',
  staff: 'Staf',
  courier: 'Kurir',
  admin: 'Admin',
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { tone: string; label: string }> = {
    active: { tone: 'badge-active', label: 'Aktif' },
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
          <h2 className="mb-4 font-display text-xl font-bold text-on-surface">Profil</h2>
          <div className="card-lifted divide-y divide-[#e1eef3] p-2 sm:p-3">
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Nama</span>
              <span className="font-sans text-sm font-semibold text-on-surface">{user?.name}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Email</span>
              <span className="font-sans text-sm font-semibold text-on-surface">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Nomor WhatsApp</span>
              <span className="font-sans text-sm font-semibold text-on-surface">
                {user?.phone ?? 'Belum diisi'}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-3.5 sm:px-4">
              <span className="text-sm text-on-surface-variant">Terdaftar sejak</span>
              <span className="font-sans text-sm font-semibold text-on-surface">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '-'}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}