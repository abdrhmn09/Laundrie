import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { Alert } from '../../../shared/components/Alert'
import { useAuth } from '../context/AuthContext'
import { getFieldError, type ApiError } from '../api/authApi'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' || user.role === 'staff' ? '/dashboard' : '/')
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
          Selamat datang kembali
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Masuk untuk melacak pesanan dan bukti penimbangan Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-lifted space-y-5 p-6 sm:p-8">
        {error && <Alert tone="error">{error.message}</Alert>}

        <Field id="email" label="Email" error={getFieldError(error, 'email')}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="nama@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field id="password" label="Password" error={getFieldError(error, 'password')}>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            placeholder="Masukkan password Anda"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Memproses...' : 'Masuk'}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar di sini
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}