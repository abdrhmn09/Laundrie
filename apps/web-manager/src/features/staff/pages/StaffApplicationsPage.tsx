import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Application = {
  id: number
  staff_opening_id: number
  laundry_id: number
  user_id: number
  application_type: string
  message: string | null
  status: string
  opening: { id: number; title: string }
  laundry: { business_name: string }
  applicant: { id: number; name: string; email: string }
}

export default function StaffApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)

  const fetchApps = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/laundry/staff-applications', { headers })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal memuat pendaftar.')
      setApps(data?.data ?? data ?? [])
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchApps() }, [])

  const handleAction = async (id: number, action: 'accept' | 'reject') => {
    setActionId(id)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/v1/laundry/staff-applications/${id}/${action}`, { method: 'POST', headers })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? `Gagal ${action}.`)
      await fetchApps()
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10">Kembali Dashboard</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-4xl">
        <h1 className="font-display text-2xl font-extrabold">Manajemen Pendaftar Staff</h1>
        <p className="text-sm text-on-surface-variant mt-1">PRD §10 — Manager menerima/menolak lamaran. Staff hanya dibuat setelah ACCEPTED. Dokumen KTP pendaftar dapat dilihat via verifikasi.</p>

        {error && <div className="mt-4 rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

        {loading ? (
          <p className="mt-6 text-sm text-on-surface-variant">Memuat pendaftar…</p>
        ) : apps.length === 0 ? (
          <div className="mt-6 card p-6 text-center">
            <p className="font-display font-bold">Belum ada pendaftar</p>
            <p className="text-sm text-on-surface-variant">Bagikan lowongan atau buat lowongan baru di Staff & Lowongan.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {apps.map((app) => (
              <div key={app.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-bold">{app.applicant.name} <span className="text-xs text-on-surface-variant">({app.applicant.email})</span></p>
                  <p className="text-xs text-on-surface-variant">Lowongan: {app.opening.title} • Tipe: {app.application_type} • Status: <span className={`badge ${app.status === 'PENDING' ? 'badge-warning' : app.status === 'ACCEPTED' ? 'badge-success' : 'badge-error'}`}>{app.status}</span></p>
                  {app.message && <p className="text-xs mt-1">Pesan: {app.message}</p>}
                </div>
                {app.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(app.id, 'accept')} disabled={actionId === app.id} className="btn-primary !h-9 !px-4 text-xs">
                      {actionId === app.id ? 'Memproses…' : 'Terima'}
                    </button>
                    <button onClick={() => handleAction(app.id, 'reject')} disabled={actionId === app.id} className="btn-secondary !h-9 !px-3 text-xs text-error">Tolak</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
