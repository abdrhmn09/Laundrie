import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { authApi, getFieldError, type ApiError } from '../api/authApi'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') ?? ''
  const emailParam = searchParams.get('email') ?? ''

  const [email] = useState(emailParam)
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordError = getFieldError(error, 'password')
  const confirmationError = getFieldError(error, 'password_confirmation')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      setSuccess(true)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <FadeIn delay={200}>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
            Setel Password Baru
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Buat password baru yang kuat untuk akun <span className="font-semibold text-on-surface">{email}</span>.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="card-lifted p-6 sm:p-8">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-status-success-container text-status-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-on-surface">Password Berhasil Diperbarui</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Silakan login dengan password baru Anda.
                </p>
              </div>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Masuk Sekarang
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="rounded-[--radius-md] bg-error-container p-4 text-sm font-semibold text-on-error-container">
                  {error.message}
                </div>
              )}

              <Field id="password" label="Password Baru" error={passwordError}>
                <div className="input-password-wrap">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="input"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? 'Sembunyi' : 'Lihat'}
                  </button>
                </div>
                <PasswordStrengthMeter password={password} />
              </Field>

              <Field id="password_confirmation" label="Konfirmasi Password Baru" error={confirmationError}>
                <input
                  id="password_confirmation"
                  type="password"
                  required
                  className="input"
                  placeholder="Ulangi password baru Anda"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting ? 'Menyimpan...' : 'Simpan Password Baru'}
              </button>

              <p className="text-center text-sm text-on-surface-variant">
                Batal?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Kembali ke Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </FadeIn>
    </AuthLayout>
  )
}
