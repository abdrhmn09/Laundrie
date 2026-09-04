import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { getToken } from '../../auth/api/authApi'
import { Brand } from '../../../shared/components/Brand'
import WeighingCameraModal from '../components/WeighingCameraModal'

interface WeighingData {
  order_id: number
  estimated_weight: number | null
  actual_weight: number | null
  status: string
  active_measurement?: any
  active_evidence?: any
  measurements_history?: any[]
}

export default function WeighingPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [weighingData, setWeighingData] = useState<WeighingData | null>(null)
  const [actualWeight, setActualWeight] = useState<string>('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchWeighingData()
  }, [id])

  const fetchWeighingData = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}/weighing`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
        },
      })
      if (res.ok) {
        const data = await res.json()
        setWeighingData(data)
        if (data.actual_weight) {
          setActualWeight(data.actual_weight.toString())
        }
      }
    } catch (err) {
      console.error('Failed to fetch weighing data:', err)
    }
  }

  const handleCapturePhoto = (file: File) => {
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!actualWeight || !photoFile) {
      setError('Harap masukkan berat aktual dan ambil foto bukti penimbangan.')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const formData = new FormData()
    formData.append('actual_weight', actualWeight)
    formData.append('photo', photoFile)

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/orders/${id}/weighing/record`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: 'application/json',
        },
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Gagal menyimpan penimbangan')
      }

      setSuccessMsg(`Penimbangan berhasil! Status pesanan: ${data.order_status}`)
      await fetchWeighingData()
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur">
        <div className="container-app flex justify-between py-3">
          <Brand size="sm" />
          <button onClick={() => navigate('/dashboard')} className="btn-secondary !h-10">Kembali ke Dashboard</button>
        </div>
      </header>

      <main className="container-app py-8 max-w-2xl">
        <div className="card-lifted p-6 space-y-6">
          <div>
            <span className="badge-active">Order #{id}</span>
            <h1 className="font-display text-2xl font-extrabold mt-2">Penimbangan & Bukti Berat</h1>
            <p className="text-sm text-on-surface-variant">Staf memasukkan berat aktual dan mengunggah foto bukti penimbangan.</p>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
          {successMsg && <div className="p-4 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">{successMsg}</div>}

          {weighingData && (
            <div className="p-4 bg-surface-container rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Estimasi Berat Pelanggan:</span>
                <span className="font-bold">{weighingData.estimated_weight ? `${weighingData.estimated_weight} KG` : 'Tidak Diisi'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Status Pesanan:</span>
                <span className="font-bold">{weighingData.status}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Berat Aktual (KG) *</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                max="999"
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                placeholder="Contoh: 5.25"
                className="input-field text-lg font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Foto Bukti Penimbangan (Kamera In-App) *</label>
              {photoPreview ? (
                <div className="relative rounded-lg overflow-hidden border">
                  <img src={photoPreview} alt="Bukti penimbangan" className="w-full h-64 object-cover" />
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="absolute bottom-3 right-3 btn-secondary !bg-white/90 text-xs shadow-md"
                  >
                    🔄 Ambil Ulang Foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-12 border-2 border-dashed border-outline/40 rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 transition"
                >
                  <span className="text-3xl mb-2">📸</span>
                  <span className="text-sm font-semibold text-primary">Buka Kamera Penimbangan</span>
                  <span className="text-xs text-on-surface-variant mt-1">Ambil foto timbangan dengan pakaian</span>
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !actualWeight || !photoFile}
              className="btn-primary w-full py-3 text-base"
            >
              {isSubmitting ? 'Menyimpan Penimbangan...' : 'Simpan & Verifikasi Penimbangan'}
            </button>
          </form>
        </div>
      </main>

      <WeighingCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
      />
    </div>
  )
}
