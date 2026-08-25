import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Doc = {
  id: number
  owner_type: string
  owner_id: number
  document_type: string
  file_path: string
  status: string
  created_at: string
}

export default function VerificationQueuePage() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('PENDING')
  const [ownerType, setOwnerType] = useState<string>('')
  const [actionId, setActionId] = useState<number | null>(null)

  const fetchDocs = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const params = new URLSearchParams()
      if (filter) params.set('status', filter)
      if (ownerType) params.set('owner_type', ownerType)
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/v1/admin/verification-documents${qs}`, { headers })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal memuat dokumen.')
      setDocs(data?.data ?? data ?? [])
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchDocs() }, [filter, ownerType])

  const handleReview = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Alasan penolakan (wajib):') : null
    if (status === 'REJECTED' && !reason) {
      setError('Alasan penolakan wajib diisi.')
      return
    }
    setActionId(id)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const body: Record<string, string> = { status }
      if (reason) body.rejection_reason = reason
      const res = await fetch(`/api/v1/admin/verification-documents/${id}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? `Gagal ${status}.`)
      await fetchDocs()
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
      <main className="container-app py-8 max-w-5xl">
        <h1 className="font-display text-2xl font-extrabold">Manajemen Dokumen Verifikasi</h1>
        <p className="text-sm text-on-surface-variant mt-1">PRD §20 — Admin review KTP/NIB/foto lokasi (laundry) dan KTP/SIM/STNK (courier) + KTP staff. Route <code>/api/v1/admin/verification-documents/{"{id}"}/review</code> butuh role admin.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input !h-9 !py-1 text-sm">
            <option value="">Semua Status</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
          <select value={ownerType} onChange={(e) => setOwnerType(e.target.value)} className="input !h-9 !py-1 text-sm">
            <option value="">Semua Tipe</option>
            <option value="laundry">Laundry</option>
            <option value="courier">Courier</option>
            <option value="user">User (Staff KTP)</option>
            <option value="staff_application">Staff Application</option>
          </select>
          <button onClick={() => void fetchDocs()} className="btn-secondary !h-9 !px-4 text-xs">Refresh</button>
        </div>

        {error && <div className="mt-4 rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

        {loading ? (
          <p className="mt-6 text-sm text-on-surface-variant">Memuat dokumen…</p>
        ) : docs.length === 0 ? (
          <div className="mt-6 card p-6 text-center">
            <p className="font-display font-bold">Tidak ada dokumen</p>
            <p className="text-sm text-on-surface-variant">Filter: {filter || 'semua'} • {ownerType || 'semua tipe'}</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {docs.map((doc) => (
              <div key={doc.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-bold">#{doc.id} • {doc.owner_type} #{doc.owner_id} • {doc.document_type}</p>
                  <p className="text-xs text-on-surface-variant">Status: <span className={`badge ${doc.status === 'PENDING' ? 'badge-warning' : doc.status === 'APPROVED' ? 'badge-success' : 'badge-error'}`}>{doc.status}</span> • {new Date(doc.created_at).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-on-surface-variant mt-1">Path: <code className="text-xs bg-surface-variant px-1 rounded">{doc.file_path}</code></p>
                </div>
                {doc.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(doc.id, 'APPROVED')} disabled={actionId === doc.id} className="btn-primary !h-9 !px-4 text-xs">
                      {actionId === doc.id ? 'Memproses…' : 'Setujui'}
                    </button>
                    <button onClick={() => handleReview(doc.id, 'REJECTED')} disabled={actionId === doc.id} className="btn-secondary !h-9 !px-3 text-xs text-error">Tolak</button>
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
