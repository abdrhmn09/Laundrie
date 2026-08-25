import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi, clearToken, getToken, saveToken, type AuthResponse, type User } from '../api/authApi'

type RegisterPayload = Parameters<typeof authApi.register>[0]

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (data: RegisterPayload) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(getToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const refreshUser = useCallback(async () => {
    const stored = getToken()
    if (!stored) {
      setUser(null)
      return null
    }

    try {
      const res = await authApi.me()
      setUser(res.user)
      return res.user
    } catch {
      clearToken()
      setToken(null)
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const params = new URLSearchParams(window.location.search)
      const urlToken = params.get('token')
      if (urlToken) {
        saveToken(urlToken)
        setToken(urlToken)
        params.delete('token')
        const newQs = params.toString()
        const newUrl = window.location.pathname + (newQs ? `?${newQs}` : '') + window.location.hash
        window.history.replaceState({}, '', newUrl)
      }
      await refreshUser()
      setIsLoading(false)
    }

    void bootstrap()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password, device_name: navigator.userAgent })
    saveToken(res.token)
    setToken(res.token)
    setUser(res.user)
    return res
  }, [])

  const register = useCallback(
    async (data: RegisterPayload) => {
      const res = await authApi.register(data)
      saveToken(res.token)
      setToken(res.token)
      setUser(res.user)
      return res
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearToken()
      setToken(null)
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: user !== null,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}