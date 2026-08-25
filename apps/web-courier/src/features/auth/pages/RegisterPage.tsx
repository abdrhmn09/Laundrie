import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { useAuth } from '../context/AuthContext'
import { getFieldError, getToken, type ApiError } from '../api/authApi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, user } = useAuth()
  const isLoggedIn = !!user && !!getToken()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const [courierType, setCourierType] = useState<'freelance' | 'laundry_staff'>('freelance')
  const [vehicleType, setVehicleType] = useState('motor')
  const [licensePlate, setLicensePlate] = useState('')
  const [simNumber, setSimNumber] = useState('')

  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [simFile, setSimFile] = useState<File | null>(null)
  const [stnkFile, setStnkFile] = useState<File | null>(null)

  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  const nameError = getFieldError(error, 'name')
  const emailError = getFieldError(error, 'email')
  const phoneError = getFieldError(error, 'phone')
  const passwordError = getFieldError(error, 'password')

  const handleBlur = (field: string) => setTouched((t) => ({ ...t, [field]: true }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError({ message: 'Anda wajib menyetujui Syarat & Ketentuan.' })
      return
    }
    if (!ktpFile || !simFile || !stnkFile) {
      setError({ message: 'Semua dokumen wajib diunggah: KTP, SIM, dan STNK (wajib).' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let token = getToken()
      if (!isLoggedIn) {
        if (!name || !email || !phone || !password) throw new Error('Lengkapi data akun.')
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
      // Buat courier profile
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const endpoint = courierType === 'freelance' ? '/api/v1/profile/courier/freelance' : '/api/v1/profile/courier/staff'
      const payload: Record<string, unknown> = {
        vehicle_type: vehicleType,
        service_area: ['Banda Aceh'],
      }
      if (courierType === 'freelance') {
        // freelance tidak butuh laundry_id
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw { message: data?.message ?? 'Gagal mendaftar courier.', errors: data?.errors }
      const courierId = data?.courier?.id
      if (courierId) {
        const docs: [File | null, string][] = [
          [ktpFile, 'KTP'],
          [simFile, 'SIM'],
          [stnkFile, 'STNK'],
        ]
        for (const [file, type] of docs) {
          if (!file) continue
          const fd = new FormData()
          fd.append('owner_type', 'courier')
          fd.append('owner_id', String(courierId))
          fd.append('document_type', type)
          fd.append('file', file)
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
            Daftar Mitra Kurir
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pilih tipe kurir dan lengkapi dokumen verifikasi. <span className="font-bold">Freelance</span> = tidak terikat laundry (`laundry_id NULL`), <span className="font-bold">Staff Laundry</span> = terikat 1 laundry dan harus sudah menjadi Staff (via lamaran).
          </p>
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

          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setCourierType('freelance')} className={`card p-3 text-left border-2 ${courierType === 'freelance' ? 'border-primary bg-primary/5' : 'border-[#e1eef3]'}`}>
              <p className="font-display text-sm font-bold">Freelance</p>
              <p className="text-xs text-on-surface-variant">Tidak terikat laundry</p>
            </button>
            <button type="button" onClick={() => setCourierType('laundry_staff')} className={`card p-3 text-left border-2 ${courierType === 'laundry_staff' ? 'border-primary bg-primary/5' : 'border-[#e1eef3]'}`}>
              <p className="font-display text-sm font-bold">Staff Laundry</p>
              <p className="text-xs text-on-surface-variant">Merangkap Staff</p>
            </button>
          </div>

          {!isLoggedIn && (
            <div className="space-y-4">
              <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Data Akun</h3>
              <Field id="name" label="Nama Lengkap" error={nameError}>
                <input id="name" type="text" required className="input" placeholder="Nama Anda" value={name} onBlur={() => handleBlur('name')} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field id="email" label="Email" error={emailError}>
                <input id="email" type="email" required className="input" placeholder="nama@contoh.com" value={email} onBlur={() => handleBlur('email')} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field id="phone" label="Nomor WhatsApp" error={phoneError}>
                <input id="phone" type="tel" className="input" placeholder="08xxxxxxxxxx" value={phone} onBlur={() => handleBlur('phone')} onChange={(e) => setPhone(e.target.value)} />
              </Field>
              <Field id="password" label="Password" error={passwordError} hint="Minimal 8 karakter.">
                <div className="input-password-wrap">
                  <input id="password" type={showPassword ? 'text' : 'password'} required className="input" placeholder="Minimal 8 karakter" value={password} onBlur={() => handleBlur('password')} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? 'Sembunyi' : 'Lihat'}</button>
                </div>
                <PasswordStrengthMeter password={password} />
              </Field>
              <Field id="password_confirmation" label="Konfirmasi Password">
                <input id="password_confirmation" type="password" required className="input" placeholder="Ulangi password" value={passwordConfirmation} onBlur={() => handleBlur('password_confirmation')} onChange={(e) => setPasswordConfirmation(e.target.value)} />
              </Field>
            </div>
          )}

          {isLoggedIn && (
            <div className="rounded-lg bg-status-success-container p-3 text-sm text-status-success">
              Login sebagai <span className="font-bold">{user?.email}</span>. Pilih tipe kurir di bawah.
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Data Kurir — PRD §12</h3>
            <Field id="vehicle_type" label="Jenis Kendaraan">
              <select id="vehicle_type" className="input" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                <option value="motor">Motor</option>
                <option value="mobil">Mobil</option>
                <option value="sepeda">Sepeda</option>
              </select>
            </Field>
            <Field id="license_plate" label="Plat Nomor">
              <input id="license_plate" type="text" className="input uppercase" placeholder="BL 1234 AB" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
            </Field>
            <Field id="sim_number" label="Nomor SIM">
              <input id="sim_number" type="text" className="input" placeholder="SIM C" value={simNumber} onChange={(e) => setSimNumber(e.target.value)} />
            </Field>
            {courierType === 'laundry_staff' && (
              <div className="rounded-md bg-secondary-container/30 p-3 text-xs text-on-surface-variant">
                Untuk <span className="font-bold">Staff Laundry Courier</span>, Anda harus sudah menjadi Staff di suatu laundry (via <span className="font-bold">Gabung Staff → Lamar</span> di web-customer). Jika belum, daftar sebagai <span className="font-bold">Freelance</span> dulu atau lamar sebagai Staff terlebih dahulu.
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Dokumen Verifikasi — Schema §4.26 *Wajib</h3>
            <Field id="ktp" label="KTP *">
              <input id="ktp" type="file" accept="image/*,.pdf" required className="input" onChange={(e) => setKtpFile(e.target.files?.[0] ?? null)} />
              {ktpFile && <p className="text-xs text-status-success">Terpilih: {ktpFile.name}</p>}
            </Field>
            <Field id="sim" label="SIM *">
              <input id="sim" type="file" accept="image/*,.pdf" required className="input" onChange={(e) => setSimFile(e.target.files?.[0] ?? null)} />
              {simFile && <p className="text-xs text-status-success">Terpilih: {simFile.name}</p>}
            </Field>
            <Field id="stnk" label="STNK *">
              <input id="stnk" type="file" accept="image/*,.pdf" required className="input" onChange={(e) => setStnkFile(e.target.files?.[0] ?? null)} />
              {stnkFile && <p className="text-xs text-status-success">Terpilih: {stnkFile.name}</p>}
            </Field>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input id="tos" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
            <label htmlFor="tos" className="text-xs text-on-surface-variant leading-relaxed">
              Saya menyetujui <span className="font-semibold text-on-surface">Syarat & Ketentuan</span> serta <span className="font-semibold text-on-surface">Kebijakan Privasi</span> Laundrie.
            </label>
          </div>

          <button type="submit" disabled={submitting || !agreed || !ktpFile || !simFile || !stnkFile} className="btn-primary w-full">
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Memproses...' : isLoggedIn ? 'Daftar Courier Sekarang' : 'Daftar & Jadi Kurir'}
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            Sudah punya akun Kurir? <Link to="/login" className="font-semibold text-primary hover:underline">Masuk di sini</Link>
          </p>
        </form>
      </FadeIn>
    </AuthLayout>
  )
}
