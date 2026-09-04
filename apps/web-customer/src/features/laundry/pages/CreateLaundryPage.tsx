import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext'
import { getToken } from '../../auth/api/authApi'
import { laundryApi } from '../api/laundryApi'
import { Brand } from '../../../shared/components/Brand'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'

export default function CreateLaundryPage() {
  const { user, setUser } = useAuth()
  const [businessName, setBusinessName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // If already manager, redirect to profile
  if (user?.capabilities?.is_manager) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
          <div className="container-app flex items-center justify-between py-3">
            <Brand size="sm" />
            <Link to="/profile" className="btn-ghost !h-10">Kembali ke Profil</Link>
          </div>
        </header>
        <main className="container-app py-12 max-w-xl text-center">
          <div className="card-lifted p-8 space-y-4">
            <h1 className="font-display text-2xl font-extrabold text-on-surface">Anda sudah memiliki Laundry</h1>
            <p className="text-sm text-on-surface-variant">Laundry: <span className="font-bold text-primary">{user.laundry?.business_name}</span></p>
            <Link to="/profile" className="btn-primary w-full">Kembali ke Profil</Link>
          </div>
        </main>
      </div>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      if (!businessName || !addressLine || !contactPhone) throw new Error('Lengkapi semua field wajib.')
      const res = await laundryApi.create({
        business_name: businessName,
        address_line: addressLine,
        contact_phone: contactPhone,
      })
      setUser(res.user)
      setSuccess(res.message)
      // PRD §8: otomatis Manager → redirect ke web-manager per permintaan user
      const token = getToken()
      const qs = token ? `?token=${encodeURIComponent(token)}` : ''
      setTimeout(() => {
        window.location.href = `http://127.0.0.1:5174${qs}`
      }, 900)
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Record<string, string[]> }
      const msg = e.errors ? Object.values(e.errors).flat().join(', ') : e.message
      setError(msg ?? 'Gagal membuat laundry.')
    } finally {
      setSubmitting(false)
    }
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
            <h1 className="font-display text-2xl font-extrabold text-on-surface">Buat Laundry</h1>
            <p className="mt-1 text-sm text-on-surface-variant">PRD §8 — Laundry dibuat dari profil, Anda otomatis menjadi Owner/Manager.</p>
          </div>
        </FadeIn>

        <FadeIn delay={200}>
          <form onSubmit={handleSubmit} className="card-lifted p-6 space-y-5" noValidate>
            {error && <div className="rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}
            {success && <div className="rounded-[--radius-md] bg-status-success-container p-3 text-sm text-status-success">{success}<br /><span className="text-xs">Mengalihkan ke Dashboard Manager…</span></div>}
            <Field id="business_name" label="Nama Bisnis Laundry">
              <input id="business_name" className="input" placeholder="Laundrie Express Peudada" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
            </Field>
            <Field id="address_line" label="Alamat Operasional Laundry">
              <textarea id="address_line" className="input min-h-[80px]" placeholder="Jl. Merdeka No. 10, Peudada, Bireuen" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
              <p className="text-xs text-on-surface-variant mt-1">Terpisah dari alamat pribadi Anda (Schema §4.7, Rule §57).</p>
            </Field>
            <Field id="contact_phone" label="Kontak Laundry">
              <input id="contact_phone" className="input" placeholder="08123456789" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required />
            </Field>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting && <span className="spinner" aria-hidden="true" />}
              {submitting ? 'Membuat...' : 'Buat Laundry'}
            </button>
            <p className="text-xs text-center text-on-surface-variant">Setelah dibuat, <span className="font-bold">laundries.user_id = Anda</span> dan Anda otomatis Manager (Schema §4.7).</p>
          </form>
        </FadeIn>
      </main>
    </div>
  )
}
