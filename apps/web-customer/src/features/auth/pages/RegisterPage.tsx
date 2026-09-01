import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { useAuth } from '../context/AuthContext'
import { getFieldError, type ApiError } from '../api/authApi'
import GoogleAuthButton from '../../../shared/components/GoogleAuthButton'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

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
  const confirmationError = getFieldError(error, 'password_confirmation')

  const emailFormatError = touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Format email tidak valid.'
    : undefined
  const passwordLengthError = touched.password && password && password.length < 8
    ? 'Password minimal 8 karakter.'
    : undefined
  const confirmationMatchError = touched.password_confirmation && passwordConfirmation && passwordConfirmation !== password
    ? 'Konfirmasi password tidak cocok.'
    : undefined

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError({ message: 'Anda wajib menyetujui Syarat & Ketentuan.' })
      return
    }

    setTouched({ name: true, email: true, phone: true, password: true, password_confirmation: true })
    setSubmitting(true)
    setError(null)

    try {
      // web-customer hanya untuk Pelanggan (customer) — peran lain daftar via web masing-masing (PRD §7)
      await register({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        role: 'customer',
      })
      navigate('/verify-email')
    } catch (err) {
      setError(err as ApiError)
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
            Daftar Akun Pelanggan
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Buat akun untuk memesan laundry jemput-antar. Untuk menjadi Mitra Laundry atau Kurir, daftar via Profil → pilih peran → Anda akan diarahkan ke web khusus peran tersebut untuk melengkapi dokumen verifikasi.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <form onSubmit={handleSubmit} className="card-lifted space-y-5 p-6 sm:p-8" noValidate>
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              className="space-y-2 rounded-[--radius-md] bg-error-container p-4"
              role="alert"
            >
              <p className="text-sm font-semibold text-on-error-container">{error.message}</p>
            </div>
          )}

          <div className="rounded-lg bg-primary/5 p-3.5 border border-primary/20 text-xs leading-relaxed text-on-surface-variant">
            <p>💡 <strong>Akun Pelanggan:</strong> Setelah mendaftar, Anda dapat menambah peran lain (Laundry/Courier) kapan saja via <span className="font-bold">Profil → Buat Laundry / Gabung Staff / Daftar Courier</span> yang mengarah ke web khusus (5174 untuk Manager, 5176 untuk Courier) untuk pengisian dokumen.</p>
          </div>

          <Field id="name" label="Nama Lengkap" error={nameError}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              className="input"
              placeholder="Nama Lengkap Anda"
              value={name}
              onBlur={() => handleBlur('name')}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field id="email" label="Email" error={emailError ?? emailFormatError}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="nama@contoh.com"
              value={email}
              onBlur={() => handleBlur('email')}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field id="phone" label="Nomor WhatsApp" error={phoneError}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="input"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onBlur={() => handleBlur('phone')}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field id="password" label="Password" error={passwordError ?? passwordLengthError} hint="Minimal 8 karakter.">
            <div className="input-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="input"
                placeholder="Minimal 8 karakter"
                value={password}
                onBlur={() => handleBlur('password')}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </Field>

          <Field id="password_confirmation" label="Konfirmasi Password" error={confirmationError ?? confirmationMatchError}>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              className="input"
              placeholder="Ulangi password Anda"
              value={passwordConfirmation}
              onBlur={() => handleBlur('password_confirmation')}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </Field>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="tos"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <label htmlFor="tos" className="text-xs text-on-surface-variant leading-relaxed">
              Saya menyetujui <span className="font-semibold text-on-surface">Syarat & Ketentuan</span> serta{' '}
              <span className="font-semibold text-on-surface">Kebijakan Privasi</span> Laundrie.
            </label>
          </div>

          <button type="submit" disabled={submitting || !agreed} className="btn-primary w-full">
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
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
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>

          <div className="border-t border-[#e1eef3] pt-4 text-center">
            <p className="text-xs text-on-surface-variant">Ingin daftar sebagai Mitra?</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs">
              <a href="http://127.0.0.1:5174/register" className="badge-neutral hover:bg-primary/10">🧺 Mitra Laundry (5174)</a>
              <a href="http://127.0.0.1:5176/register" className="badge-neutral hover:bg-primary/10">🚚 Mitra Kurir (5176)</a>
            </div>
          </div>
        </form>
      </FadeIn>
    </AuthLayout>
  )
}
