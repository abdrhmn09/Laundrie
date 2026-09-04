import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

function StarRating({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  const [hover, setHover] = useState(0)
  return (
    <div>
      <label className="label text-xs">{label}</label>
      <div className="flex gap-1.5 mt-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl transition-transform hover:scale-110 active:scale-95 leading-none"
          >
            <span className={(hover || value) >= star ? 'text-amber-400' : 'text-slate-200'}>★</span>
          </button>
        ))}
        {value > 0 && (
          <span className="text-xs text-slate-500 ml-1 self-center font-semibold">
            {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Baik', 'Sangat Baik'][value]}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [laundryRating, setLaundryRating] = useState(0)
  const [courierRating, setCourierRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (laundryRating === 0) {
      setError('Berikan penilaian bintang untuk Mitra Laundry terlebih dahulu.')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/v1/orders/${id}/reviews`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          laundry_rating: laundryRating,
          courier_rating: courierRating > 0 ? courierRating : undefined,
          comment: comment || undefined,
          is_anonymous: isAnonymous,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal mengirim ulasan.')

      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 2500)
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
          <h1 className="font-display text-2xl font-black text-slate-900">Beri Penilaian & Ulasan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pesanan #{id} · Ulasan Anda membantu mitra laundry berkembang lebih baik.</p>
        </div>

        {success ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-3 shadow-sm">
            <div className="text-5xl">🙏</div>
            <h2 className="font-display text-xl font-black text-slate-900">Terima Kasih atas Ulasanmu!</h2>
            <p className="text-xs text-slate-500">Penilaian Anda membantu pengguna lain menemukan mitra laundry terbaik.</p>
            <p className="text-[11px] text-slate-400">Mengalihkan ke dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                ⚠️ {error}
              </div>
            )}

            {/* Laundry Rating */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENILAIAN MITRA LAUNDRY</p>
              <StarRating label="Beri bintang untuk kualitas layanan *" value={laundryRating} onChange={setLaundryRating} />
            </div>

            {/* Courier Rating */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENILAIAN KURIR (OPSIONAL)</p>
              <StarRating label="Beri bintang untuk kualitas pengiriman kurir" value={courierRating} onChange={setCourierRating} />
            </div>

            {/* Comment */}
            <div>
              <label className="label text-xs">Ulasan / Komentar (Opsional)</label>
              <textarea
                rows={3}
                placeholder="Ceritakan pengalamanmu menggunakan layanan ini..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                className="input resize-none text-xs leading-relaxed"
              />
              <p className="text-[10px] text-slate-400 text-right mt-1">{comment.length}/1000</p>
            </div>

            {/* Anonymous Option */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 accent-[#00667e] rounded"
              />
              <div>
                <p className="text-xs font-semibold text-slate-800">Kirim sebagai Anonim</p>
                <p className="text-[10px] text-slate-400">Nama Anda tidak akan ditampilkan pada ulasan publik.</p>
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting || laundryRating === 0}
              className="w-full bg-[#00667e] hover:bg-[#005266] disabled:opacity-50 active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-full shadow-md transition"
            >
              {submitting ? 'Mengirim Ulasan...' : `Kirim Penilaian ${'★'.repeat(laundryRating)}${'☆'.repeat(5 - laundryRating)} →`}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
