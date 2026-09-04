import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

const CATEGORIES = [
  { value: 'weight_price', label: '⚖️ Selisih Berat / Harga Tidak Sesuai' },
  { value: 'item_lost', label: '❌ Pakaian Hilang' },
  { value: 'damaged', label: '🧵 Pakaian Rusak / Luntur' },
  { value: 'late_delivery', label: '🕐 Pengantaran Terlambat' },
  { value: 'other', label: '📝 Lainnya' },
]

const RESOLUTIONS = [
  { value: 'REFUND', label: '💳 Pengembalian Dana (Refund)' },
  { value: 'RE_WASH', label: '🧺 Cuci Ulang Tanpa Biaya' },
  { value: 'COMPENSATION', label: '🎁 Kompensasi / Ganti Rugi' },
]

export default function ComplaintPage() {
  const { id } = useParams<{ id: string }>()
  const [category, setCategory] = useState('weight_price')
  const [description, setDescription] = useState('')
  const [resolution, setResolution] = useState('REFUND')
  const [photo, setPhoto] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const form = new FormData()
      form.append('category', category)
      form.append('description', description)
      form.append('requested_resolution', resolution)
      if (photo) form.append('evidence_photo', photo)

      const res = await fetch(`/api/v1/orders/${id}/complaints`, {
        method: 'POST',
        headers,
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal mengajukan komplain.')

      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-xl">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10 text-xs font-semibold">← Kembali</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-xl">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-black text-slate-900">Ajukan Komplain Sengketa</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pesanan #{id} · Komplain akan ditinjau oleh Tim Operasional Laundrie dalam 1×24 jam.</p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
            <div className="text-5xl">✅</div>
            <h2 className="font-display text-xl font-black text-slate-900">Komplain Berhasil Diajukan!</h2>
            <p className="text-xs text-slate-500">Tim kami akan menghubungi Anda dalam 1×24 jam melalui notifikasi aplikasi.</p>
            <Link to="/dashboard" className="btn-primary inline-block mt-2">Kembali ke Dashboard</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Category */}
            <div>
              <label className="label text-xs">Kategori Masalah *</label>
              <div className="grid gap-2 mt-1">
                {CATEGORIES.map((c) => (
                  <label key={c.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    category === c.value
                      ? 'border-[#00667e] bg-[#00667e]/5 ring-1 ring-[#00667e]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="category"
                      value={c.value}
                      checked={category === c.value}
                      onChange={() => setCategory(c.value)}
                      className="accent-[#00667e]"
                    />
                    <span className="text-xs font-semibold text-slate-800">{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="label text-xs">Deskripsi Masalah * <span className="text-slate-400">(min. 10 karakter)</span></label>
              <textarea
                rows={4}
                placeholder="Ceritakan masalah yang Anda alami secara rinci..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                className="input resize-none text-xs leading-relaxed"
              />
            </div>

            {/* Requested Resolution */}
            <div>
              <label className="label text-xs">Resolusi yang Diminta *</label>
              <div className="grid gap-2 mt-1">
                {RESOLUTIONS.map((r) => (
                  <label key={r.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    resolution === r.value
                      ? 'border-[#00667e] bg-[#00667e]/5 ring-1 ring-[#00667e]/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="resolution"
                      value={r.value}
                      checked={resolution === r.value}
                      onChange={() => setResolution(r.value)}
                      className="accent-[#00667e]"
                    />
                    <span className="text-xs font-semibold text-slate-800">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Evidence Photo */}
            <div>
              <label className="label text-xs">Foto Bukti (Opsional)</label>
              <div className={`mt-1 border-2 border-dashed rounded-2xl p-4 transition ${
                photo ? 'border-[#00667e] bg-[#00667e]/5' : 'border-slate-200'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600"
                />
                {photo && (
                  <p className="text-[10px] text-emerald-700 font-bold mt-2">✓ {photo.name} siap diunggah</p>
                )}
                {!photo && (
                  <p className="text-[10px] text-slate-400 mt-1">Unggah foto sebagai bukti pendukung komplain Anda.</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-full shadow-md transition"
            >
              {submitting ? 'Mengajukan Komplain...' : 'Kirim Komplain Sengketa →'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
