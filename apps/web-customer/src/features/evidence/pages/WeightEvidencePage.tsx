import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getToken } from '../../auth/api/authApi'
import { Brand } from '../../../shared/components/Brand'

interface WeighingInfo {
  order_id: number
  estimated_weight: number | null
  actual_weight: number | null
  status: string
  active_evidence?: {
    id: number
    weight: number
    photo_url: string | null
    photo_hash: string
    captured_at: string
    status: string
  }
}

export default function WeightEvidencePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [data, setData] = useState<WeighingInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (id) fetchWeighing()
  }, [id])

  const fetchWeighing = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}/weighing`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
        },
      })
      if (!res.ok) throw new Error('Gagal mengambil bukti penimbangan.')
      const result = await res.json()
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmReview = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}/weighing/confirm`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
        },
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message || 'Gagal menyetujui penimbangan.')

      setActionSuccess('Anda telah menyetujui hasil penimbangan. Harga pesanan difinalisasi.')
      await fetchWeighing()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur">
        <div className="container-app flex justify-between py-3">
          <Brand size="sm" />
          <button onClick={() => navigate('/orders')} className="btn-secondary !h-10">Daftar Pesanan</button>
        </div>
      </header>

      <main className="container-app py-8 max-w-xl">
        <div className="card-lifted p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-extrabold">Bukti Penimbangan Foto</h1>
            <span className="badge-active">Order #{id}</span>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
          {actionSuccess && <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">{actionSuccess}</div>}

          {isLoading ? (
            <div className="text-center py-12 text-on-surface-variant text-sm">Memuat bukti penimbangan...</div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-surface-container rounded-xl text-sm">
                <div>
                  <p className="text-xs text-on-surface-variant">Estimasi Awal</p>
                  <p className="font-display font-bold text-lg">{data.estimated_weight ? `${data.estimated_weight} KG` : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Hasil Penimbangan Staf</p>
                  <p className="font-display font-bold text-lg text-primary">{data.actual_weight ? `${data.actual_weight} KG` : '-'}</p>
                </div>
              </div>

              {data.active_evidence?.photo_url ? (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Foto Timbangan (In-App Camera Capture)</p>
                  <div className="rounded-xl overflow-hidden border bg-slate-900">
                    <img src={data.active_evidence.photo_url} alt="Bukti Foto" className="w-full h-72 object-contain" />
                  </div>
                  <div className="text-[11px] text-on-surface-variant flex justify-between px-1">
                    <span>SHA-256 Hash: {data.active_evidence.photo_hash?.substring(0, 16)}...</span>
                    <span>Waktu: {new Date(data.active_evidence.captured_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border text-sm text-on-surface-variant">
                  Foto bukti penimbangan belum tersedia.
                </div>
              )}

              {data.status === 'WEIGHT_REVIEW_REQUIRED' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Persetujuan Pelanggan Diperlukan</p>
                  <p className="text-sm text-amber-900">
                    Terdapat perbedaan berat signifikan antara estimasi awal ({data.estimated_weight} KG) dan hasil penimbangan staf ({data.actual_weight} KG). Mohon konfirmasi persetujuan Anda.
                  </p>
                  <button
                    onClick={handleConfirmReview}
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-sm font-bold"
                  >
                    {isSubmitting ? 'Memproses Persetujuan...' : 'Setujui Hasil Penimbangan'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  )
}
