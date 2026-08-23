import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { FadeIn } from '../../../shared/components/motion'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'

export default function VerifyEmailPage() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (user?.email_verified) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleResend = async () => {
    setResending(true)
    setMessage(null)

    try {
      const res = await authApi.resendVerification()
      setMessage(res.message)
      setCooldown(60)
    } catch (err: unknown) {
      const e = err as { message: string }
      setMessage(e.message ?? 'Gagal mengirim ulang email verifikasi.')
    } finally {
      setResending(false)
    }
  }

  const handleCheckStatus = async () => {
    const updated = await refreshUser()
    if (updated?.email_verified) {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout>
      <FadeIn delay={200}>
        <div className="mb-8 text-center sm:text-left">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
            Verifikasi Email Anda
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Kami telah mengirimkan email verifikasi ke{' '}
            <span className="font-semibold text-on-surface">{user?.email ?? 'email Anda'}</span>.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <div className="card-lifted space-y-6 p-6 sm:p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
              <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-on-surface-variant">
              Silakan periksa kotak masuk atau folder spam email Anda, lalu klik tautan verifikasi yang kami kirimkan.
            </p>
          </div>

          {message && (
            <div className="rounded-[--radius-md] bg-primary-container/40 p-3 text-xs font-semibold text-on-primary-container">
              {message}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button onClick={handleCheckStatus} className="btn-primary w-full">
              Saya Sudah Verifikasi
            </button>

            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="btn-secondary w-full"
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Kirim Ulang (${cooldown}s)` : 'Kirim Ulang Email Verifikasi'}
            </button>
          </div>

          <div className="pt-2 border-t border-[#e1eef3]">
            <button
              onClick={logout}
              className="text-xs font-semibold text-on-surface-variant hover:text-error"
            >
              Keluar dan gunakan akun lain
            </button>
          </div>
        </div>
      </FadeIn>
    </AuthLayout>
  )
}
