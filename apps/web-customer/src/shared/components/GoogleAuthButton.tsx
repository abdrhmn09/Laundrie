import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/context/AuthContext'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (res: { credential: string }) => void }) => void
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void
          prompt: () => void
        }
      }
    }
  }
}

export default function GoogleAuthButton({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined

  // Fallback: redirect ke backend Google OAuth jika tidak ada client_id (pakai Socialite redirect)
  const handleRedirect = () => {
    const frontendUrl = window.location.origin
    window.location.href = `/api/v1/auth/google/redirect?frontend_url=${encodeURIComponent(frontendUrl)}`
  }

  useEffect(() => {
    if (!clientId) return
    if (!window.google?.accounts?.id) {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => initGoogle()
      document.head.appendChild(script)
      return () => {
        // cleanup
      }
    } else {
      initGoogle()
    }

    function initGoogle() {
      if (!window.google?.accounts?.id || !containerRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId!,
        callback: async (response: { credential: string }) => {
          setLoading(true)
          setError(null)
          try {
            const res = await fetch('/api/v1/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ id_token: response.credential }),
            })
            const data = await res.json().catch(() => null)
            if (!res.ok) throw new Error(data?.message ?? 'Gagal login Google.')
            // Simpan token dan user via AuthContext
            localStorage.setItem('laundrie_token', data.token)
            if (data.user) setUser(data.user)
            navigate('/dashboard')
          } catch (e: unknown) {
            const err = e as Error
            setError(err.message)
          } finally {
            setLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: containerRef.current.offsetWidth || 320,
        text: mode === 'register' ? 'signup_with' : 'signin_with',
        shape: 'rectangular',
      })
    }
  }, [clientId, mode, setUser, navigate])

  if (!clientId) {
    // Jika belum set VITE_GOOGLE_CLIENT_ID, tampilkan tombol redirect biasa
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={handleRedirect}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-[--radius-md] border border-[#e1eef3] bg-white px-4 py-3 text-sm font-semibold text-on-surface shadow-sm transition hover:bg-surface-variant/50"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {loading ? 'Memproses...' : mode === 'register' ? 'Daftar dengan Google' : 'Masuk dengan Google'}
        </button>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="flex justify-center" />
      {error && <p className="text-xs text-error">{error}</p>}
      {loading && <p className="text-xs text-on-surface-variant text-center">Memproses login Google…</p>}
    </div>
  )
}
