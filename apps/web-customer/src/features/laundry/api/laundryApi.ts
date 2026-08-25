import { getToken, type User } from '../../auth/api/authApi'

const TOKEN_KEY = 'laundrie_token'

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  const token = localStorage.getItem(TOKEN_KEY) ?? getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(path, { ...init, headers })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw { message: data?.message ?? 'Terjadi kesalahan pada server.', errors: data?.errors } as import('../../auth/api/authApi').ApiError
  }
  return data as T
}

export interface Laundry {
  id: number
  business_name: string
  status: string
  address_line: string
}

export const laundryApi = {
  async create(data: {
    business_name: string
    legal_name?: string
    address_line: string
    latitude?: number
    longitude?: number
    contact_phone: string
    contact_email?: string
  }): Promise<{ message: string; laundry: Laundry; user: User }> {
    return request('/api/v1/profile/laundry', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async getMy(): Promise<{ laundry: Laundry }> {
    return request('/api/v1/profile/laundry')
  },
  async getOptions(): Promise<{ user: User; options: { can_create_laundry: boolean; can_join_as_staff: boolean; can_register_courier: boolean } }> {
    return request('/api/v1/profile/options')
  },
}
