import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { useAuth } from '../context/AuthContext'
import { getFieldError, type ApiError } from '../api/authApi'
import GoogleAuthButton from '../../../shared/components/GoogleAuthButton'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  const emailError = getFieldError(error, 'email')
  const passwordError = getFieldError(error, 'password')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await login(email, password)
      if (res.requires_verification) {
        navigate('/verify-email')
      } else {
        navigate('/laundries')
      }
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
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
            Selamat datang kembali
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Masuk untuk melacak pesanan dan bukti penimbangan Anda.
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
              {(emailError || passwordError) && (
                <ul className="list-inside list-disc text-sm text-on-error-container">
                  {emailError && (
                    <li>
                      <a href="#email" className="underline underline-offset-2 hover:text-on-error-container/80">
                        {emailError}
                      </a>
                    </li>
                  )}
                  {passwordError && (
                    <li>
                      <a href="#password" className="underline underline-offset-2 hover:text-on-error-container/80">
                        {passwordError}
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          <Field id="email" label="Email" error={emailError}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? 'email-error' : undefined}
              className="input"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field id="password" label="Password" error={passwordError}>
            <div className="input-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                aria-invalid={passwordError ? true : undefined}
                aria-describedby={passwordError ? 'password-error' : undefined}
                className="input"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>
          </Field>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="font-sans text-xs font-semibold text-primary hover:underline"
            >
              Lupa Password?
            </Link>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e1eef3]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-on-surface-variant">atau</span>
            </div>
          </div>

          <GoogleAuthButton mode="login" />

          <p className="text-center text-sm text-on-surface-variant">
            Belum punya akun?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Daftar di sini
            </Link>
          </p>
        </form>
      </FadeIn>
    </AuthLayout>
  )
}