import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { authApi, type UserSession } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

export default function SessionsPage() {
  const { logout } = useAuth()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const fetchSessions = async () => {
    try {
      const res = await authApi.getSessions()
      setSessions(res.sessions)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSessions()
  }, [])

  const handleRevoke = async (id: number) => {
    try {
      const res = await authApi.revokeSession(id)
      setActionMessage(res.message)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch {
      setActionMessage('Gagal mengakhiri sesi.')
    }
  }

  const handleRevokeAll = async () => {
    if (!confirm('Apakah Anda yakin ingin keluar dari semua perangkat lain?')) return

    try {
      const res = await authApi.revokeAllSessions()
      setActionMessage(res.message)
      setSessions((prev) => prev.filter((s) => s.is_current))
    } catch {
      setActionMessage('Gagal mengakhiri sesi lain.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <Link to="/profile" className="btn-ghost !h-10 !px-3">
              Kembali ke Profil
            </Link>
            <button onClick={logout} className="btn-secondary !h-10 !px-4">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="container-app py-8 max-w-2xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-on-surface sm:text-3xl">
              Perangkat & Sesi Aktif
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Daftar semua perangkat yang sedang masuk ke akun Anda.
            </p>
          </div>

          {sessions.length > 1 && (
            <button onClick={handleRevokeAll} className="btn-secondary !h-10 !px-4 text-xs">
              Keluarkan Semua Perangkat Lain
            </button>
          )}
        </div>

        {actionMessage && (
          <div className="mb-4 rounded-[--radius-md] bg-primary-container p-3 text-xs font-semibold text-on-primary-container">
            {actionMessage}
          </div>
        )}

        {loading ? (
          <div className="card-lifted p-8 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="card-lifted divide-y divide-[#e1eef3]">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-variant text-on-surface-variant">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <path d="M12 18h.01" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-sans text-sm font-bold text-on-surface">
                        {session.name || 'Perangkat Tidak Dikenal'}
                      </span>
                      {session.is_current && <span className="badge-active">Perangkat Ini</span>}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Dibuat pada:{' '}
                      {new Date(session.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>

                {!session.is_current && (
                  <button
                    onClick={() => handleRevoke(session.id)}
                    className="btn-ghost !h-9 !px-3 text-xs text-error hover:bg-error-container/30"
                  >
                    Keluarkan
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
