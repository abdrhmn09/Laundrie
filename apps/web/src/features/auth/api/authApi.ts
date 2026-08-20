export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
  token_type: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

const TOKEN_KEY = 'laundrie_token'

export const authApi = {
  async register(
    data: { name: string; email: string; phone?: string; password: string; password_confirmation: string },
  ): Promise<AuthResponse> {
    return request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async login(data: {
    email: string
    password: string
    device_name?: string
  }): Promise<AuthResponse> {
    return request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async logout(): Promise<void> {
    await request('/api/v1/auth/logout', { method: 'POST' })
  },

  async me(): Promise<{ user: User }> {
    return request('/api/v1/auth/me')
  },
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  const token = localStorage.getItem(TOKEN_KEY)
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(path, { ...init, headers })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error: ApiError = {
      message: data?.message ?? 'Terjadi kesalahan pada server.',
      errors: data?.errors,
    }
    throw error
  }

  return data as T
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function getFieldError(error: ApiError | null, field: string): string | undefined {
  return error?.errors?.[field]?.[0]
}