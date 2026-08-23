import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react'
import AuthLayout from '../components/AuthLayout'
import { FadeIn } from '../../../shared/components/motion'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'

export default function VerifyEmailCallbackPage() {
  const { id, hash } = useParams<{ id: string; hash: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const doVerify = async () => {
      if (!id || !hash) {
        setErrorMsg('Parameter verifikasi tidak lengkap.')
        setLoading(false)
        return
      }

      try {
        const queryStr = searchParams.toString()
        await authApi.verifyEmail(id, hash, queryStr)
        await refreshUser()
        setSuccess(true)
        setTimeout(() => navigate('/dashboard'), 3000)
      } catch (err: unknown) {
        const e = err as { message: string }
        setErrorMsg(e.message ?? 'Gagal memverifikasi email.')
      } finally {
        setLoading(false)
      }
    }

    void doVerify()
  }, [id, hash, searchParams, navigate, refreshUser])

  return (
    <AuthLayout>
      <FadeIn delay={200}>
        <div className="card-lifted space-y-6 p-6 sm:p-8 text-center">
          {loading ? (
            <div className="space-y-4 py-8">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-sans text-sm font-semibold text-on-surface">Memverifikasi email Anda...</p>
            </div>
          ) : success ? (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-success-container text-status-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-on-surface">Email Berhasil Diverifikasi!</h2>
                <p className="mt-2 text-sm text-on-surface-variant">
                  Terima kasih. Anda akan dialihkan ke dashboard dalam beberapa detik.
                </p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
                Buka Dashboard Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-on-surface">Verifikasi Gagal</h2>
                <p className="mt-2 text-sm text-error font-medium">{errorMsg}</p>
              </div>
              <button onClick={() => navigate('/login')} className="btn-secondary w-full">
                Kembali ke Login
              </button>
            </div>
          )}
        </div>
      </FadeIn>
    </AuthLayout>
  )
}
