import { getToken, type User } from '../../auth/api/authApi'
import type { ApiError } from '../../auth/api/authApi'

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
  if (!res.ok) throw { message: data?.message ?? 'Terjadi kesalahan pada server.', errors: data?.errors } as ApiError
  return data as T
}

export const courierApi = {
  async createFreelance(data: { vehicle_type: string; service_area?: unknown }): Promise<{ message: string; courier: unknown; user: User }> {
    return request('/api/v1/profile/courier/freelance', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async createStaffCourier(data: { laundry_id?: number; vehicle_type?: string }): Promise<{ message: string; courier: unknown; user: User }> {
    return request('/api/v1/profile/courier/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}
