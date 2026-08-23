import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { authApi, type ApiError } from '../api/authApi'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await authApi.forgotPassword(email)
      setSubmitted(true)
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
            Lupa Password
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk menyetel ulang password.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="card-lifted p-6 sm:p-8">
          {submitted ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                  <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  <path d="m16 19 2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-on-surface">Cek Inbox Email Anda</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Instruksi pemulihan password telah dikirim ke <span className="font-semibold text-on-surface">{email}</span>.
                </p>
              </div>
              <Link to="/login" className="btn-secondary w-full">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="rounded-[--radius-md] bg-error-container p-4 text-sm font-semibold text-on-error-container">
                  {error.message}
                </div>
              )}

              <Field id="email" label="Email Terdaftar" error={error?.errors?.email?.[0]}>
                <input
                  id="email"
                  type="email"
                  required
                  className="input"
                  placeholder="nama@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting ? 'Kirim Tautan...' : 'Kirim Tautan Reset Password'}
              </button>

              <p className="text-center text-sm text-on-surface-variant">
                Sudah ingat password?{' '}
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
