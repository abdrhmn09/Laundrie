import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { Alert } from '../../../shared/components/Alert'
import { useAuth } from '../context/AuthContext'
import { getFieldError, type ApiError } from '../api/authApi'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const user = await register({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
      })
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
          Buat akun baru
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Mulai pesan jasa laundry dengan bukti berat yang transparan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card-lifted space-y-5 p-6 sm:p-8">
        {error && <Alert tone="error">{error.message}</Alert>}

        <Field id="name" label="Nama Lengkap" error={getFieldError(error, 'name')}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            required
            className="input"
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

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

        <Field id="phone" label="Nomor WhatsApp (opsional)" error={getFieldError(error, 'phone')}>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className="input"
            placeholder="08xxxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>

        <Field id="password" label="Password" error={getFieldError(error, 'password')}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            className="input"
            placeholder="Minimal 8 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field id="password_confirmation" label="Konfirmasi Password" error={getFieldError(error, 'password_confirmation')}>
          <input
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            required
            className="input"
            placeholder="Ulangi password Anda"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
        </Field>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Memproses...' : 'Daftar'}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}