import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { FadeIn } from '../../../shared/components/motion'
import { useAuth } from '../../auth/context/AuthContext'

export default function CourierOnboardingPage() {
  const { user } = useAuth()
  const [type, setType] = useState<'freelance' | 'laundry_staff'>('freelance')
  const [vehicle, setVehicle] = useState('motor')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const isAlreadyCourier = !!user?.courier

  const handleSubmit = async () => {
    setSubmitting(true)
    setMsg(null)
    // TODO: POST /api/v1/profile/courier/freelance or /staff per PRD §12, Architecture §9.2.x
    await new Promise((r) => setTimeout(r, 700))
    setMsg(type === 'freelance' ? 'Pendaftaran freelance courier berhasil (mock). Menunggu verifikasi PENDING → VERIFIED.' : 'Lamaran Staff+Courier dikirim. Menunggu Manager menerima lamaran Anda.')
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/profile" className="btn-ghost !h-10">Kembali</Link>
        </div>
      </header>

      <main className="container-app py-8 max-w-xl">
        <FadeIn delay={100}>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-on-surface">Daftar sebagai Courier</h1>
            <p className="mt-1 text-sm text-on-surface-variant">PRD §12 — Freelance (laundry_id NULL) atau Staff Laundry (terikat 1 laundry, Rule §53).</p>
          </div>
        </FadeIn>

        {isAlreadyCourier ? (
          <div className="card-lifted p-6 text-center space-y-3">
            <p className="font-display font-bold text-on-surface">Anda sudah terdaftar sebagai Courier</p>
            <p className="text-sm text-on-surface-variant">Tipe: <span className="badge-active">{user.courier?.courier_type}</span> Status: {user.courier?.status}</p>
            <Link to="/profile" className="btn-secondary w-full">Kembali ke Profil</Link>
          </div>
        ) : (
          <FadeIn delay={200}>
            <div className="card-lifted p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setType('freelance')} className={`card p-4 text-left border-2 ${type === 'freelance' ? 'border-primary bg-primary-container/20' : 'border-[#e1eef3]'}`}>
                  <p className="font-display text-sm font-bold">Freelance</p>
                  <p className="text-xs text-on-surface-variant">Tidak terikat laundry</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">laundry_id = NULL</p>
                </button>
                <button onClick={() => setType('laundry_staff')} className={`card p-4 text-left border-2 ${type === 'laundry_staff' ? 'border-primary bg-primary-container/20' : 'border-[#e1eef3]'}`}>
                  <p className="font-display text-sm font-bold">Staff Laundry</p>
                  <p className="text-xs text-on-surface-variant">Merangkap Staff</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Butuh lamaran staff_courier</p>
                </button>
              </div>

              <div>
                <label className="label">Jenis Kendaraan</label>
                <select className="input" value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                  <option value="motor">Motor</option>
                  <option value="mobil">Mobil</option>
                  <option value="sepeda">Sepeda</option>
                </select>
              </div>

              {type === 'laundry_staff' && (
                <div className="rounded-[--radius-md] bg-secondary-container/30 p-3 text-xs text-on-surface-variant">
                  Anda akan diarahkan ke <span className="font-bold">Staff Discovery</span> untuk melamar lowongan yang menerima <span className="badge-active">Staff + Courier</span>. Setelah Manager ACCEPTED, profil courier laundry_staff akan dibuat otomatis (PRD §10.3).
                </div>
              )}

              {msg && <div className="rounded-[--radius-md] bg-status-success-container p-3 text-sm text-status-success">{msg}</div>}

              <button onClick={handleSubmit} disabled={submitting} className="btn-primary w-full">
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting ? 'Memproses...' : type === 'freelance' ? 'Daftar Freelance Courier' : 'Lamar sebagai Staff + Courier'}
              </button>

              <p className="text-xs text-center text-on-surface-variant">Rule §53: tidak membuat akun users kedua.</p>
            </div>
          </FadeIn>
        )}
      </main>
    </div>
  )
}
