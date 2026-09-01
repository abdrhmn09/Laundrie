import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveToken } from '../api/authApi'
import AuthLayout from '../components/AuthLayout'
import { FadeIn } from '../../../shared/components/motion'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const err = searchParams.get('error')

    if (err) {
      setError('Login Google gagal. Silakan coba lagi.')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    if (!token) {
      setError('Token tidak ditemukan.')
      setTimeout(() => navigate('/login'), 3000)
      return
    }

    saveToken(token)
    void (async () => {
      try {
        await refreshUser()
        navigate('/dashboard')
      } catch {
        setError('Gagal memuat profil setelah login Google.')
      }
    })()
  }, [searchParams, navigate, refreshUser])

  return (
    <AuthLayout>
      <FadeIn delay={200}>
        <div className="card-lifted space-y-6 p-6 sm:p-8 text-center">
          {!error ? (
            <div className="space-y-4 py-8">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="font-sans text-sm font-semibold text-on-surface">Memproses login Google…</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-error">{error}</p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full">
                Kembali ke Login
              </button>
            </div>
          )}
        </div>
      </FadeIn>
    </AuthLayout>
  )
}
