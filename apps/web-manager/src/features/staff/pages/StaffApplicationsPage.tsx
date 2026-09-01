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

type VerificationDoc = {
  id: number
  owner_type: string
  owner_id: number
  document_type: string
  file_path: string
  status: string
  owner_label?: string | null
}

function DocPreview({ docId }: { docId: number }) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPdf, setIsPdf] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null
    const load = async () => {
      try {
        const token = getToken()
        const headers: Record<string, string> = {}
        if (token) headers.Authorization = `Bearer ${token}`
        const res = await fetch(`/api/v1/laundry/verification-documents/${docId}/file`, { headers })
        if (!res.ok) throw new Error('Gagal memuat file')
        const blob = await res.blob()
        if (cancelled) return
        setIsPdf(blob.type.includes('pdf'))
        const disposition = res.headers.get('Content-Disposition')
        if (disposition) {
          const match = disposition.match(/filename="(.+)"/)
          if (match) setFileName(match[1])
        }
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      } catch (e: unknown) {
        if (!cancelled) setError((e as Error).message)
      }
    }
    void load()
    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [docId])
  if (error) return <p className="text-xs text-error">Error: {error}</p>
  if (!url) return <div className="flex h-64 w-full items-center justify-center rounded border bg-surface-variant/30"><p className="text-xs text-on-surface-variant">Memuat pratinjau dokumen…</p></div>
  return (
    <div className="space-y-2">
      <div className="rounded-lg border-2 border-primary/20 bg-white p-2 shadow-sm">
        {isPdf ? (
          <iframe src={url} title={`Preview ${docId}`} className="h-80 w-full rounded" />
        ) : (
          <img src={url} alt={`Dokumen ${docId}`} className="h-80 w-full object-contain rounded bg-white" />
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-variant">Pratinjau jelas — klik untuk perbesar. {fileName && `File: ${fileName}`}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener"
          onClick={(e) => { e.preventDefault(); if (url) window.open(url, '_blank') }}
          className="text-xs font-semibold text-primary underline"
        >
          Buka di tab baru ↗
        </a>
      </div>
    </div>
  )
}

export default function StaffApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([])
  const [docs, setDocs] = useState<VerificationDoc[]>([])
  const [staffList, setStaffList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<number | null>(null)
  const [directEmail, setDirectEmail] = useState('')

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
      // Fetch dokumen KTP staff untuk laundry ini (diverifikasi manager, bukan admin) — tampilkan semua status agar pratinjau jelas
      const res2 = await fetch('/api/v1/laundry/verification-documents', { headers })
      const data2 = await res2.json().catch(() => null)
      if (res2.ok) setDocs(data2?.data ?? data2 ?? [])
      // Fetch daftar staff aktif
      const res3 = await fetch('/api/v1/laundry/staff', { headers })
      const data3 = await res3.json().catch(() => null)
      if (res3.ok) setStaffList(data3?.data ?? data3 ?? [])
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

  const handleDocReview = async (docId: number, status: 'APPROVED' | 'REJECTED') => {
    const reason = status === 'REJECTED' ? prompt('Alasan penolakan KTP (wajib):') : null
    if (status === 'REJECTED' && !reason) {
      setError('Alasan penolakan wajib diisi.')
      return
    }
    setActionId(docId)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const body: Record<string, string> = { status }
      if (reason) body.rejection_reason = reason
      const res = await fetch(`/api/v1/laundry/verification-documents/${docId}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? `Gagal ${status}.`)
      await fetchApps()
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleDirectAdd = async () => {
    if (!directEmail) {
      setError('Email wajib diisi untuk tambah staff langsung.')
      return
    }
    setActionId(-1)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/laundry/staff', {
        method: 'POST',
        headers,
        body: JSON.stringify({ email: directEmail }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal tambah staff.')
      setDirectEmail('')
      await fetchApps()
    } catch (e: unknown) {
      const err = e as Error
      setError(err.message)
    } finally {
      setActionId(null)
    }
  }

  const handleActivateCourier = async (staffId: number) => {
    if (!confirm('Aktifkan staff ini sebagai Kurir Staff Laundry (laundry_staff)?')) return
    setActionId(staffId)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/v1/laundry/staff/${staffId}/courier`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ vehicle_type: 'motor' }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal aktifkan courier.')
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
        <p className="text-sm text-on-surface-variant mt-1">PRD §10-11 — Manager menerima/menolak lamaran, tambah staff langsung, dan aktifkan Staff sebagai Kurir.</p>

        {error && <div className="mt-4 rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

        {/* Tambah Staff Langsung — PRD §11 */}
        <div className="mt-6 card p-5">
          <h3 className="font-display text-sm font-bold">Tambah Staff Langsung (tanpa lamaran)</h3>
          <p className="text-xs text-on-surface-variant mt-1">Masukkan email user yang sudah terdaftar sebagai Pelanggan. Manager dapat langsung jadikan Staff tanpa menunggu lamaran.</p>
          <div className="mt-3 flex gap-2">
            <input value={directEmail} onChange={(e) => setDirectEmail(e.target.value)} placeholder="email@contoh.com" className="input flex-1" />
            <button onClick={handleDirectAdd} disabled={actionId === -1} className="btn-primary !h-10 !px-4 text-xs">
              {actionId === -1 ? 'Menambahkan…' : 'Tambah Staff'}
            </button>
          </div>
        </div>

        {/* Daftar Staff Aktif — dengan aksi Kurir */}
        {staffList.length > 0 && (
          <div className="mt-6">
            <h3 className="font-display text-sm font-bold">Staff Aktif Saat Ini</h3>
            <div className="mt-3 grid gap-3">
              {staffList.map((s: any) => (
                <div key={s.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-bold">{s.user?.name ?? `User #${s.user_id}`} <span className="text-xs text-on-surface-variant">({s.user?.email ?? s.user_id})</span></p>
                    <p className="text-xs text-on-surface-variant">Role: {s.role} • Status: {s.status}</p>
                  </div>
                  <button onClick={() => handleActivateCourier(s.id)} disabled={actionId === s.id} className="btn-secondary !h-8 !px-3 text-xs">Aktifkan sebagai Kurir</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <p className="mt-6 text-sm text-on-surface-variant">Memuat pendaftar…</p>
        ) : apps.length === 0 ? (
          <div className="mt-6 card p-6 text-center">
            <p className="font-display font-bold">Belum ada pendaftar</p>
            <p className="text-sm text-on-surface-variant">Bagikan lowongan atau buat lowongan baru di Staff & Lowongan.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {apps.map((app) => {
              const appDocs = docs.filter((d) => (d.owner_type === 'staff_application' && d.owner_id === app.id) || (d.owner_type === 'user' && d.owner_id === app.user_id))
              return (
                <div key={app.id} className="card p-5 flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                  {appDocs.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-semibold text-on-surface mb-2">Dokumen KTP Pelamar (diverifikasi Manager, bukan Admin):</p>
                      <div className="grid gap-3">
                        {appDocs.map((doc) => (
                          <div key={doc.id} className="rounded-lg border bg-white p-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium">{doc.document_type} • <span className={`badge ${doc.status === 'PENDING' ? 'badge-warning' : doc.status === 'APPROVED' ? 'badge-success' : 'badge-error'}`}>{doc.status}</span></p>
                              {doc.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <button onClick={() => handleDocReview(doc.id, 'APPROVED')} disabled={actionId === doc.id} className="btn-primary !h-7 !px-3 text-xs">Setujui KTP</button>
                                  <button onClick={() => handleDocReview(doc.id, 'REJECTED')} disabled={actionId === doc.id} className="btn-secondary !h-7 !px-2 text-xs text-error">Tolak KTP</button>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <DocPreview docId={doc.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
