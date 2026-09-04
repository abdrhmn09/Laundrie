import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Complaint = {
  id: number
  category: string
  description: string
  requested_resolution: string
  status: string
  resolution_notes?: string
  resolved_at?: string
  created_at: string
  order: {
    id: number
    order_number: string
    laundry: { business_name: string }
    customer: { name: string; phone: string }
  }
  evidences: Array<{ id: number; file_path: string; description: string }>
}

const CATEGORY_LABELS: Record<string, string> = {
  weight_price: '⚖️ Selisih Berat / Harga',
  item_lost: '❌ Pakaian Hilang',
  damaged: '🧵 Pakaian Rusak',
  late_delivery: '🕐 Keterlambatan',
  other: '📝 Lainnya',
}

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'bg-amber-100 text-amber-800',
  IN_REVIEW: 'bg-sky-100 text-sky-800',
  RESOLVED_REFUND: 'bg-emerald-100 text-emerald-800',
  RESOLVED_REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-slate-100 text-slate-600',
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Complaint | null>(null)
  const [resolution, setResolution] = useState('RESOLVED_REFUND')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchComplaints = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch('/api/v1/admin/complaints', { headers })
      const data = await res.json()
      if (res.ok) setComplaints(data.complaints || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchComplaints()
  }, [])

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/v1/admin/complaints/${selected.id}/resolve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ status: resolution, resolution_notes: notes }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal memproses arbitrase.')

      setMessage(`Komplain #${selected.id} berhasil diputuskan: ${resolution}`)
      setSelected(null)
      setNotes('')
      await fetchComplaints()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const pending = complaints.filter((c) => ['SUBMITTED', 'IN_REVIEW'].includes(c.status))
  const resolved = complaints.filter((c) => !['SUBMITTED', 'IN_REVIEW'].includes(c.status))

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-5xl">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10 text-xs font-semibold">Dashboard Admin</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-5xl grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Left: Complaint list */}
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-2xl font-black text-slate-900">Arbitrase Komplain & Sengketa</h1>
            <p className="text-xs text-slate-500 mt-0.5">Tinjau dan putuskan setiap pengajuan sengketa pelanggan.</p>
          </div>

          {message && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">✓ {message}</div>
          )}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">⚠️ {error}</div>
          )}

          {/* Pending */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              Menunggu Keputusan
              <span className="ml-2 bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {pending.length}
              </span>
            </h2>

            {loading ? (
              <p className="text-xs text-slate-500 py-4 text-center">Memuat antrean komplain...</p>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-xl border p-5 text-center text-xs text-slate-500">
                🎉 Tidak ada komplain yang membutuhkan keputusan.
              </div>
            ) : (
              pending.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelected(c); setNotes(''); setResolution('RESOLVED_REFUND') }}
                  className={`w-full text-left bg-white rounded-2xl border p-4 hover:shadow-md transition space-y-2 ${
                    selected?.id === c.id ? 'border-[#00667e] ring-1 ring-[#00667e]/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">#{c.id} · {CATEGORY_LABELS[c.category]}</span>
                      <p className="text-xs font-bold text-slate-900 mt-0.5">Order #{c.order?.order_number}</p>
                      <p className="text-[11px] text-slate-500">{c.order?.laundry?.business_name} · Customer: {c.order?.customer?.name}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{c.description}</p>
                  {c.evidences.length > 0 && (
                    <p className="text-[10px] text-sky-700 font-semibold">📎 {c.evidences.length} foto bukti terlampir</p>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Resolved History */}
          {resolved.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-500">Riwayat Telah Diputuskan ({resolved.length})</h2>
              {resolved.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4 space-y-1 opacity-70">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-slate-700">#{c.id} — {CATEGORY_LABELS[c.category]} · Order #{c.order?.order_number}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                  </div>
                  {c.resolution_notes && <p className="text-[11px] text-slate-500 line-clamp-1">📋 {c.resolution_notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Arbitration Panel */}
        <div className="lg:sticky lg:top-20 h-fit">
          {selected ? (
            <form onSubmit={handleResolve} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">Panel Keputusan Arbitrase</h3>
                <p className="text-xs text-slate-500 mt-0.5">Komplain #{selected.id} · Order #{selected.order?.order_number}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                <p className="font-bold text-slate-700">Deskripsi Masalah:</p>
                <p className="text-slate-600 leading-relaxed">{selected.description}</p>
                <p className="font-bold text-slate-700 mt-2">Resolusi yang Diminta:</p>
                <p className="text-sky-700 font-semibold">{selected.requested_resolution}</p>
              </div>

              {/* Evidence Photos */}
              {selected.evidences.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Foto Bukti Customer</p>
                  {selected.evidences.map((ev) => (
                    <a
                      key={ev.id}
                      href={`/storage/${ev.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-sky-700 font-semibold hover:underline"
                    >
                      📎 Lihat Foto Bukti #{ev.id}
                    </a>
                  ))}
                </div>
              )}

              {/* Resolution decision */}
              <div className="space-y-2">
                <label className="label text-xs">Keputusan Arbitrase *</label>
                {[
                  { value: 'RESOLVED_REFUND', label: '💳 Setujui Refund Dana', color: 'emerald' },
                  { value: 'RESOLVED_REJECTED', label: '❌ Tolak Komplain', color: 'red' },
                  { value: 'CLOSED', label: '🔒 Tutup (Diselesaikan Informal)', color: 'slate' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${
                    resolution === opt.value ? 'border-[#00667e] bg-[#00667e]/5 ring-1 ring-[#00667e]/20' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value={opt.value}
                      checked={resolution === opt.value}
                      onChange={() => setResolution(opt.value)}
                      className="accent-[#00667e]"
                    />
                    <span className="text-xs font-semibold">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="label text-xs">Catatan Keputusan (wajib diisi) *</label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan alasan keputusan Anda secara rinci..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                  minLength={5}
                  className="input resize-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setSelected(null)} className="flex-1 btn-secondary text-xs !h-11">
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="flex-1 bg-[#00667e] hover:bg-[#005266] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-full shadow transition">
                  {submitting ? 'Memproses...' : 'Tetapkan Keputusan →'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 space-y-2">
              <div className="text-3xl">⚖️</div>
              <p className="font-semibold">Pilih komplain di sebelah kiri untuk memulai arbitrase.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
