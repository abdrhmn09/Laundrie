import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { useAuth } from '../context/AuthContext'
import { getFieldError, getToken, type ApiError } from '../api/authApi'
import GoogleAuthButton from '../../../shared/components/GoogleAuthButton'

type Opening = { id: number; laundry: { business_name: string }; title: string; quota: number; status: string }

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, user } = useAuth()
  const isLoggedIn = !!user && !!getToken()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [openings, setOpenings] = useState<Opening[]>([])
  const [loadingOpenings, setLoadingOpenings] = useState(false)
  const [selectedOpening, setSelectedOpening] = useState<number | null>(() => {
    const sp = new URLSearchParams(window.location.search)
    const oid = sp.get('openingId')
    return oid ? Number(oid) : null
  })
  const [applicationType, setApplicationType] = useState<'staff' | 'staff_courier'>('staff')
  const [ktpFile, setKtpFile] = useState<File | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  const { isLoading: authLoading } = useAuth()
  useEffect(() => {
    if (authLoading) return
    let cancelled = false
    const load = async () => {
      try {
        setLoadingOpenings(true)
        setError(null)
        const token = getToken()
        const headers: Record<string, string> = { Accept: 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`
        const res = await fetch('/api/v1/staff-openings', { headers })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.message ?? `Gagal memuat lowongan (${res.status})`)
        if (!cancelled) setOpenings(data?.data ?? [])
      } catch (e: unknown) {
        const err = e as Error
        if (!cancelled) setError({ message: err.message } as any)
      } finally {
        if (!cancelled) setLoadingOpenings(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [authLoading, isLoggedIn])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError({ message: 'Anda wajib menyetujui Syarat & Ketentuan.' })
      return
    }
    if (!selectedOpening) {
      setError({ message: 'Pilih lowongan terlebih dahulu.' })
      return
    }
    if (!ktpFile) {
      setError({ message: 'KTP wajib diunggah (wajib).' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let token = getToken()
      if (!isLoggedIn) {
        const res = await register({
          name,
          email,
          phone,
          password,
          password_confirmation: passwordConfirmation,
          role: 'customer',
        } as any)
        token = res.token
      }
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/v1/staff-openings/${selectedOpening}/apply`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ application_type: applicationType }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw { message: data?.message ?? 'Gagal melamar.', errors: data?.errors }
      // Upload KTP wajib setelah lamaran (Schema §4.26)
      if (ktpFile) {
        const appId = data?.application?.id
        const userId = data?.application?.user_id ?? user?.id
        if (appId && token) {
          const fd = new FormData()
          fd.append('owner_type', 'staff_application')
          fd.append('owner_id', String(appId))
          fd.append('document_type', 'KTP')
          fd.append('file', ktpFile)
          const docHeaders: Record<string, string> = { Accept: 'application/json' }
          if (token) docHeaders.Authorization = `Bearer ${token}`
          await fetch('/api/v1/verification-documents', { method: 'POST', headers: docHeaders, body: fd })
        } else if (userId && token) {
          const fd = new FormData()
          fd.append('owner_type', 'user')
          fd.append('owner_id', String(userId))
          fd.append('document_type', 'KTP')
          fd.append('file', ktpFile)
          const docHeaders: Record<string, string> = { Accept: 'application/json' }
          if (token) docHeaders.Authorization = `Bearer ${token}`
          await fetch('/api/v1/verification-documents', { method: 'POST', headers: docHeaders, body: fd })
        }
      }
      navigate('/dashboard')
    } catch (err) {
      const e = err as ApiError
      setError(e)
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <FadeIn delay={200}>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
            Daftar sebagai Staff Laundry
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Temukan lowongan <span className="font-bold">OPEN</span> dan kirim lamaran. Staff hanya dibuat setelah Manager <span className="font-bold">ACCEPTED</span> (PRD §10, Rule §54). Untuk Staff + Courier, pilih tipe <span className="font-bold">staff_courier</span>.
          </p>
          <div className="mt-3">
            <Link to="/laundries" className="btn-secondary !h-9 !px-4 text-xs">Lihat Daftar Laundry →</Link>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <form onSubmit={handleSubmit} className="card-lifted space-y-5 p-6 sm:p-8" noValidate>
          {error && (
            <div ref={errorRef} tabIndex={-1} className="rounded-[--radius-md] bg-error-container p-4" role="alert">
              <p className="text-sm font-semibold text-on-error-container">{error.message}</p>
              {error.errors && <ul className="mt-2 list-disc pl-5 text-xs text-on-error-container">{Object.entries(error.errors).map(([k, v]) => <li key={k}>{k}: {v.join(', ')}</li>)}</ul>}
            </div>
          )}

          {!isLoggedIn && (
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Data Akun</h3>
              <Field id="name" label="Nama Lengkap" error={getFieldError(error, 'name')}>
                <input id="name" type="text" required className="input" placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field id="email" label="Email" error={getFieldError(error, 'email')}>
                <input id="email" type="email" required className="input" placeholder="nama@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field id="phone" label="Nomor WhatsApp" error={getFieldError(error, 'phone')}>
                <input id="phone" type="tel" className="input" placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field id="password" label="Password" error={getFieldError(error, 'password')} hint="Minimal 8 karakter.">
                <div className="input-password-wrap">
                  <input id="password" type={showPassword ? 'text' : 'password'} required className="input" placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Sembunyi' : 'Lihat'}</button>
                </div>
                <PasswordStrengthMeter password={password} />
              </Field>
              <Field id="password_confirmation" label="Konfirmasi Password">
                <input id="password_confirmation" type="password" required className="input" placeholder="Ulangi password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
              </Field>
            </div>
          )}

          {isLoggedIn && (
            <div className="rounded-lg bg-status-success-container p-3 text-sm text-status-success">
              Login sebagai <span className="font-bold">{user?.email}</span>. Pilih lowongan di bawah.
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Pilih Lowongan OPEN</h3>
            {loadingOpenings && <p className="text-sm text-on-surface-variant">Memuat lowongan…</p>}
            {!loadingOpenings && openings.length === 0 && <p className="text-sm text-on-surface-variant">Belum ada lowongan OPEN. Hubungi laundry atau cek kembali nanti.</p>}
            <div className="grid gap-3">
              {openings.map((o) => (
                <label key={o.id} className={`card p-4 flex items-center justify-between gap-3 cursor-pointer border-2 ${selectedOpening === o.id ? 'border-primary bg-primary/5' : 'border-[#e1eef3]'}`}>
                  <div>
                    <p className="font-display text-sm font-bold">{o.laundry.business_name}</p>
                    <p className="text-xs text-on-surface-variant">{o.title} • Quota {o.quota} • {o.status}</p>
                  </div>
                  <input type="radio" name="opening" checked={selectedOpening === o.id} onChange={() => setSelectedOpening(o.id)} className="h-4 w-4 text-primary" />
                </label>
              ))}
            </div>
            <Field id="application_type" label="Tipe Lamaran">
              <select id="application_type" className="input" value={applicationType} onChange={(e) => setApplicationType(e.target.value as any)}>
                <option value="staff">Staff saja</option>
                <option value="staff_courier">Staff + Courier (jika laundry butuh kurir)</option>
              </select>
            </Field>
            <Field id="ktp" label="KTP (Wajib) *">
              <input id="ktp" type="file" accept="image/*,.pdf" required className="input" onChange={(e) => setKtpFile(e.target.files?.[0] ?? null)} />
              {ktpFile && <p className="text-xs text-status-success">Terpilih: {ktpFile.name}</p>}
            </Field>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input id="tos" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
            <label htmlFor="tos" className="text-xs text-on-surface-variant leading-relaxed">
              Saya menyetujui <span className="font-semibold text-on-surface">Syarat & Ketentuan</span> serta <span className="font-semibold text-on-surface">Kebijakan Privasi</span> Laundrie.
            </label>
          </div>

          <button type="submit" disabled={submitting || !agreed || !ktpFile || !selectedOpening} className="btn-primary w-full">
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Mengirim Lamaran…' : isLoggedIn ? 'Kirim Lamaran Staff' : 'Daftar & Lamar Staff'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e1eef3]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-on-surface-variant">atau</span>
            </div>
          </div>

          <GoogleAuthButton mode="register" />

          <p className="text-center text-sm text-on-surface-variant">
            Sudah punya akun Staff? <Link to="/login" className="font-semibold text-primary hover:underline">Masuk di sini</Link>
          </p>
        </form>
      </FadeIn>
    </AuthLayout>
  )
}
