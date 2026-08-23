export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: string
  status: string
  avatar_url: string | null
  date_of_birth: string | null
  gender: string | null
  email_notifications: boolean
  whatsapp_notifications: boolean
  notification_preferences: Record<string, boolean> | null
  onboarding_details: Record<string, any> | null
  email_verified: boolean
  email_verified_at: string | null
  phone_verified_at: string | null
  last_login_at: string | null
  created_at: string
  capabilities?: {
    is_customer: boolean
    is_manager: boolean
    is_staff: boolean
    is_courier: boolean
    is_freelance_courier: boolean
    is_laundry_staff_courier: boolean
    is_admin: boolean
  }
  laundry?: { id: number; business_name: string; status: string } | null
  staff?: { id: number; laundry_id: number; laundry_name: string | null; role: string; status: string } | null
  courier?: { id: number; courier_type: string; laundry_id: number | null; status: string } | null
  admin?: { role: string } | null
}

export interface UserSession {
  id: number
  name: string
  abilities: string[]
  last_used_at: string | null
  created_at: string
  is_current: boolean
}

export interface AuthResponse {
  message: string
  user: User
  token: string
  token_type: string
  requires_verification?: boolean
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

const TOKEN_KEY = 'laundrie_token'

export const authApi = {
  async register(data: {
    name: string
    email: string
    phone?: string
    password: string
    password_confirmation: string
    role?: string
    vehicle_type?: string
    license_plate?: string
    sim_number?: string
    outlet_name?: string
    outlet_address?: string
    invitation_code?: string
  }): Promise<AuthResponse> {
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

  async verifyEmail(id: string, hash: string, query: string): Promise<{ message: string; user?: User }> {
    return request(`/api/v1/auth/verify-email/${id}/${hash}?${query}`)
  },

  async resendVerification(): Promise<{ message: string }> {
    return request('/api/v1/auth/resend-verification', { method: 'POST' })
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return request('/api/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  async resetPassword(data: {
    token: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    return request('/api/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateProfile(data: {
    name?: string
    phone?: string
    avatar_url?: string
    date_of_birth?: string
    gender?: string
    email_notifications?: boolean
    whatsapp_notifications?: boolean
  }): Promise<{ message: string; user: User }> {
    return request('/api/v1/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async uploadAvatar(file: File): Promise<{ message: string; user: User }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const response = await fetch('/api/v1/auth/profile/avatar', {
      method: 'POST',
      headers,
      body: formData,
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw {
        message: data?.message ?? 'Gagal mengunggah foto profil.',
        errors: data?.errors,
      } as ApiError
    }

    return data
  },

  async deleteAvatar(): Promise<{ message: string; user: User }> {
    return request('/api/v1/auth/profile/avatar', { method: 'DELETE' })
  },

  async changePassword(data: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<{ message: string }> {
    return request('/api/v1/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async getSessions(): Promise<{ sessions: UserSession[] }> {
    return request('/api/v1/auth/sessions')
  },

  async revokeSession(id: number): Promise<{ message: string }> {
    return request(`/api/v1/auth/sessions/${id}`, { method: 'DELETE' })
  },

  async revokeAllSessions(): Promise<{ message: string }> {
    return request('/api/v1/auth/sessions', { method: 'DELETE' })
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