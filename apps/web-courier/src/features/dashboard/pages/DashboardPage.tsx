import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type CourierJob = {
  id: number
  order_id: number
  job_type: 'PICKUP' | 'DELIVERY'
  status: 'DISPATCHED' | 'ACCEPTED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED'
  notes?: string
  proof_photo_path?: string
  latitude?: number
  longitude?: number
  order: {
    id: number
    order_number: string
    status: string
    estimated_weight?: number
    laundry: { business_name: string; address_line: string }
    customer: { name: string; phone: string }
    pickupAddress: { address_line: string; notes?: string }
    deliveryAddress: { address_line: string; notes?: string }
  }
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [activeJob, setActiveJob] = useState<CourierJob | null>(null)
  const [availableJobs, setAvailableJobs] = useState<CourierJob[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isCourier = !!user?.capabilities?.is_courier
  const isFreelance = user?.courier?.courier_type === 'freelance'

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const [actRes, listRes] = await Promise.all([
        fetch('/api/v1/courier/jobs/active', { headers }),
        fetch('/api/v1/courier/jobs?type=available', { headers }),
      ])

      const actData = await actRes.json().catch(() => null)
      const listData = await listRes.json().catch(() => null)

      if (actRes.ok && actData?.active_job) {
        setActiveJob(actData.active_job)
      } else {
        setActiveJob(null)
      }

      if (listRes.ok && listData?.jobs) {
        setAvailableJobs(listData.jobs)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isCourier) {
      void fetchJobs()
    }
  }, [isCourier])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleAcceptJob = async (jobId: number) => {
    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/v1/courier/jobs/${jobId}/accept`, {
        method: 'POST',
        headers,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal menerima tugas.')

      setMessage('Tugas berhasil diterima!')
      await fetchJobs()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateStatus = async (nextStatus: 'IN_TRANSIT' | 'COMPLETED') => {
    if (!activeJob) return
    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const formData = new FormData()
      formData.append('status', nextStatus)
      if (notes) formData.append('notes', notes)
      if (proofFile) formData.append('proof_photo', proofFile)

      const res = await fetch(`/api/v1/courier/jobs/${activeJob.id}/status`, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal memperbarui status.')

      setMessage(`Status tugas diperbarui ke ${nextStatus}.`)
      setNotes('')
      setProofFile(null)
      await fetchJobs()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (!isCourier) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800">
        <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
          <div className="container-app flex justify-between items-center max-w-xl">
            <Brand size="sm" />
            <button onClick={handleLogout} className="btn-secondary !h-10 text-xs">Keluar</button>
          </div>
        </header>
        <main className="container-app py-12 max-w-xl text-center">
          <div className="bg-white rounded-2xl border p-8 space-y-4 shadow-sm">
            <h1 className="font-display text-2xl font-extrabold text-slate-900">Akses Courier Diperlukan</h1>
            <p className="text-xs text-slate-500">Akun {user?.email} belum terdaftar sebagai Kurir. Daftarkan diri di aplikasi Customer.</p>
            <a href="http://127.0.0.1:5173/profile/courier/onboarding" className="btn-primary inline-block">Daftar Kurir di web-customer</a>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3">
        <div className="container-app flex justify-between items-center max-w-2xl">
          <Brand size="sm" />
          <div className="flex gap-2 items-center">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              isFreelance ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
            }`}>
              {isFreelance ? 'Freelance' : 'Staff Courier'}
            </span>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[100px] sm:max-w-none">{user.name}</span>
            <button onClick={handleLogout} className="btn-secondary !h-9 text-xs px-3">Keluar</button>
          </div>
        </div>
      </header>

      <main className="container-app py-6 max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Kurir
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola penugasan penjemputan (Pickup) dan pengantaran (Delivery).
          </p>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* 1. Active Assigned Job Card */}
        {activeJob ? (
          <div className="bg-white rounded-2xl border border-[#00667e] p-5 space-y-4 shadow-md ring-1 ring-[#00667e]/20">
            <div className="flex justify-between items-center">
              <span className="bg-[#00667e] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                TUGAS AKTIF — {activeJob.job_type}
              </span>
              <span className="text-xs font-extrabold text-[#00667e] animate-pulse">
                ● {activeJob.status}
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400">Order #{activeJob.order.order_number}</p>
              <h3 className="font-bold text-base text-slate-900">{activeJob.order.laundry?.business_name}</h3>
              <p className="text-xs text-slate-600">Pelanggan: <span className="font-bold">{activeJob.order.customer?.name}</span> ({activeJob.order.customer?.phone})</p>
            </div>

            {/* Address Details */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200/60">
              {activeJob.job_type === 'PICKUP' ? (
                <div>
                  <p className="font-bold text-slate-500 text-[10px] uppercase">LOKASI PENJEMPUTAN (CUSTOMER)</p>
                  <p className="font-semibold text-slate-800 mt-0.5">📍 {activeJob.order.pickupAddress?.address_line}</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-500 text-[10px] uppercase">LOKASI PENGANTARAN (CUSTOMER)</p>
                  <p className="font-semibold text-slate-800 mt-0.5">🚚 {activeJob.order.deliveryAddress?.address_line}</p>
                </div>
              )}
            </div>

            {/* Status Update Form Controls */}
            <div className="pt-2 space-y-3">
              {activeJob.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleUpdateStatus('IN_TRANSIT')}
                  disabled={actionLoading}
                  className="w-full bg-[#00667e] hover:bg-[#005266] text-white font-bold text-xs py-3 rounded-xl shadow transition"
                >
                  {actionLoading ? 'Memproses...' : '🚀 Mulai Perjalanan (In-Transit)'}
                </button>
              )}

              {activeJob.status === 'IN_TRANSIT' && (
                <div className="space-y-3">
                  <div>
                    <label className="label text-xs">Unggah Foto Bukti (Opsional/Kamera)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                      className="input text-xs py-1.5"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Catatan Kurir (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pakaian diterima dari Pak Budi"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input text-xs"
                    />
                  </div>
                  <button
                    onClick={() => handleUpdateStatus('COMPLETED')}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow transition"
                  >
                    {actionLoading ? 'Memproses...' : '✅ Selesaikan Tugas (' + (activeJob.job_type === 'PICKUP' ? 'Sampai Laundry' : 'Sampai Customer') + ')'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900">
            ℹ️ Tidak ada tugas aktif yang sedang berjalan. Pilih tugas dari daftar di bawah.
          </div>
        )}

        {/* 2. Available Dispatched Jobs List */}
        <div className="space-y-3">
          <h2 className="font-bold text-base text-slate-900">Daftar Tugas Tersedia (Dispatched Jobs)</h2>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Memuat daftar tugas...</p>
          ) : availableJobs.length === 0 ? (
            <div className="bg-white rounded-xl border p-6 text-center text-xs text-slate-500">
              Belum ada tugas penjemputan/pengantaran baru saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {availableJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        job.job_type === 'PICKUP' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {job.job_type}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Order #{job.order?.order_number}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{job.order?.laundry?.business_name}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">
                      📍 {job.job_type === 'PICKUP' ? job.order?.pickupAddress?.address_line : job.order?.deliveryAddress?.address_line}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={actionLoading || !!activeJob}
                    className="bg-[#00667e] hover:bg-[#005266] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap shadow transition"
                  >
                    Terima Tugas
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
