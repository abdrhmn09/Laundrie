import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { useAuth } from '../context/AuthContext'
import { getFieldError, getToken, type ApiError } from '../api/authApi'
import GoogleAuthButton from '../../../shared/components/GoogleAuthButton'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, user } = useAuth()
  const isLoggedIn = !!user && !!getToken()

  // User fields (only if not logged in)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  // Laundry fields — PRD §8, Schema §4.7
  const [businessName, setBusinessName] = useState('')
  const [legalName, setLegalName] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')

  // Documents — Schema §4.26 verification_documents
  const [ktpFile, setKtpFile] = useState<File | null>(null)
  const [nibFile, setNibFile] = useState<File | null>(null)
  const [fotoLokasiFile, setFotoLokasiFile] = useState<File | null>(null)

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
  const bizError = getFieldError(error, 'business_name')
  const addrError = getFieldError(error, 'address_line')

  const handleBlur = (field: string) => setTouched((t) => ({ ...t, [field]: true }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError({ message: 'Anda wajib menyetujui Syarat & Ketentuan.' })
      return
    }
    if (!ktpFile || !fotoLokasiFile) {
      setError({ message: 'Dokumen wajib: KTP dan Foto Lokasi harus diunggah. NIB opsional.' })
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      let token = getToken()
      // Jika belum login, registrasi dulu sebagai manager
      if (!isLoggedIn) {
        if (!name || !email || !phone || !password) throw new Error('Lengkapi data akun.')
        const res = await register({
          name,
          email,
          phone,
          password,
          password_confirmation: passwordConfirmation,
          role: 'manager',
        } as any)
        token = res.token
      }
      // Buat laundry via profile/laundry (butuh token)
      if (!businessName || !addressLine || !contactPhone) throw new Error('Lengkapi data laundry wajib.')
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      // Untuk MVP, kirim JSON dulu (dokumen via JSON path, upload terpisah via verification_documents endpoint nanti)
      const payload: Record<string, unknown> = {
        business_name: businessName,
        legal_name: legalName || undefined,
        address_line: addressLine,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        contact_phone: contactPhone,
        contact_email: contactEmail || undefined,
      }
      const res = await fetch('/api/v1/profile/laundry', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw { message: data?.message ?? 'Gagal membuat laundry.', errors: data?.errors }
      // Upload dokumen verifikasi jika ada (Schema §4.26)
      const laundryId = data?.laundry?.id
      if (laundryId) {
        const docs: [File | null, string][] = [
          [ktpFile, 'KTP'],
          [nibFile, 'NIB'],
          [fotoLokasiFile, 'foto_lokasi'],
        ]
        for (const [file, type] of docs) {
          if (!file) continue
          const fd = new FormData()
          fd.append('owner_type', 'laundry')
          fd.append('owner_id', String(laundryId))
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
            Daftar Mitra Laundry
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Khusus untuk pemilik laundry. Anda akan menjadi <span className="font-bold">Owner/Manager</span> otomatis (PRD §8, Schema §4.7). Jika sudah punya akun Pelanggan, login dulu di web-customer lalu klik <span className="font-bold">Profil → Buat Laundry</span> — Anda akan diarahkan ke sini dengan token.
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
              Anda login sebagai <span className="font-bold">{user?.email}</span>. Langsung isi data laundry di bawah.
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Data Laundry — PRD §8</h3>
            <Field id="business_name" label="Nama Bisnis Laundry *" error={bizError}>
              <input id="business_name" type="text" required className="input" placeholder="Laundrie Express Peudada" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </Field>
            <Field id="legal_name" label="Nama Legal (Opsional)">
              <input id="legal_name" type="text" className="input" placeholder="CV Laundrie Peudada" value={legalName} onChange={(e) => setLegalName(e.target.value)} />
            </Field>
            <Field id="address_line" label="Alamat Operasional Laundry *" error={addrError}>
              <textarea id="address_line" required rows={2} className="input" placeholder="Jl. Merdeka No. 10, Peudada" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
              <p className="text-xs text-on-surface-variant mt-1">Terpisah dari alamat pribadi (Schema §4.7).</p>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="latitude" label="Latitude">
                <input id="latitude" type="number" step="any" className="input" placeholder="5.2000" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </Field>
              <Field id="longitude" label="Longitude">
                <input id="longitude" type="number" step="any" className="input" placeholder="96.7000" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </Field>
            </div>
            <Field id="contact_phone" label="Kontak Laundry *">
              <input id="contact_phone" type="tel" required className="input" placeholder="0812xxxx" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </Field>
            <Field id="contact_email" label="Email Laundry">
              <input id="contact_email" type="email" className="input" placeholder="info@laundry.id" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </Field>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-sm font-bold text-primary border-b pb-2">Dokumen Verifikasi — Schema §4.26</h3>
            <p className="text-xs text-on-surface-variant">Upload akan diproses via <code>verification_documents</code> setelah laundry dibuat. Untuk MVP, file disimpan terpisah; status awal <span className="font-bold">PENDING → DOCUMENT_REVIEW</span>.</p>
            <Field id="ktp" label="KTP Pemilik *">
              <input id="ktp" type="file" accept="image/*,.pdf" required className="input" onChange={(e) => setKtpFile(e.target.files?.[0] ?? null)} />
              {ktpFile && <p className="text-xs text-status-success">Terpilih: {ktpFile.name}</p>}
            </Field>
            <Field id="nib" label="NIB / Izin Usaha (Opsional)">
              <input id="nib" type="file" accept="image/*,.pdf" className="input" onChange={(e) => setNibFile(e.target.files?.[0] ?? null)} />
              {nibFile && <p className="text-xs text-status-success">Terpilih: {nibFile.name}</p>}
              <p className="text-xs text-on-surface-variant">Opsional — bisa diunggah atau tidak, tetap ditampilkan.</p>
            </Field>
            <Field id="foto_lokasi" label="Foto Lokasi Usaha *">
              <input id="foto_lokasi" type="file" accept="image/*" required className="input" onChange={(e) => setFotoLokasiFile(e.target.files?.[0] ?? null)} />
              {fotoLokasiFile && <p className="text-xs text-status-success">Terpilih: {fotoLokasiFile.name}</p>}
            </Field>
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input id="tos" type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary" />
            <label htmlFor="tos" className="text-xs text-on-surface-variant leading-relaxed">
              Saya menyetujui <span className="font-semibold text-on-surface">Syarat & Ketentuan</span> serta <span className="font-semibold text-on-surface">Kebijakan Privasi</span> Laundrie.
            </label>
          </div>

          <button type="submit" disabled={submitting || !agreed || !ktpFile || !fotoLokasiFile} className="btn-primary w-full">
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Memproses...' : isLoggedIn ? 'Buat Laundry Sekarang' : 'Daftar & Buat Laundry'}
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
            Sudah punya akun Laundry? <Link to="/login" className="font-semibold text-primary hover:underline">Masuk di sini</Link>
          </p>
        </form>
      </FadeIn>
    </AuthLayout>
  )
}
