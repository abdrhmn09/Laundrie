import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { authApi, clearToken, getToken, saveToken, type User } from '../api/authApi'

interface AuthContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: {
    name: string
    email: string
    phone?: string
    password: string
    password_confirmation: string
  }) => Promise<User>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(getToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getToken()
      if (!stored) {
        setIsLoading(false)
        return
      }

      try {
        const { user } = await authApi.me()
        setUser(user)
      } catch {
        clearToken()
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password, device_name: navigator.userAgent })
    saveToken(res.token)
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(
    async (data: {
      name: string
      email: string
      phone?: string
      password: string
      password_confirmation: string
    }) => {
      const res = await authApi.register(data)
      saveToken(res.token)
      setToken(res.token)
      setUser(res.user)
      return res.user
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