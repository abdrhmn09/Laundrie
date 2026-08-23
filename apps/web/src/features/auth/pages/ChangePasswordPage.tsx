import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { Field } from '../../../shared/components/Field'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { authApi, getFieldError, type ApiError } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [success, setSuccess] = useState(false)

  const currentPasswordError = getFieldError(error, 'current_password')
  const passwordError = getFieldError(error, 'password')
  const confirmationError = getFieldError(error, 'password_confirmation')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await authApi.changePassword({
        current_password: currentPassword,
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <Link to="/profile" className="btn-ghost !h-10 !px-3">
              Kembali ke Profil
            </Link>
            <button onClick={logout} className="btn-secondary !h-10 !px-4">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="container-app py-8 max-w-xl">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-extrabold text-on-surface sm:text-3xl">
            Ganti Password
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ubah password Anda secara berkala untuk menjaga keamanan akun.
          </p>
        </div>

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
                <h2 className="font-display text-xl font-bold text-on-surface">Password Berhasil Diubah</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Gunakan password baru Anda untuk sesi login berikutnya.
                </p>
              </div>
              <button onClick={() => navigate('/profile')} className="btn-primary w-full">
                Kembali ke Profil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="rounded-[--radius-md] bg-error-container p-4 text-sm font-semibold text-on-error-container">
                  {error.message}
                </div>
              )}

              <Field id="current_password" label="Password Saat Ini" error={currentPasswordError}>
                <input
                  id="current_password"
                  type="password"
                  required
                  className="input"
                  placeholder="Masukkan password saat ini"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Field>

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
                  placeholder="Ulangi password baru"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                />
              </Field>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting} className="btn-primary flex-1">
                  {submitting && <span className="spinner" aria-hidden="true" />}
                  {submitting ? 'Menyimpan...' : 'Ubah Password'}
                </button>
                <Link to="/profile" className="btn-secondary">
                  Batal
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
