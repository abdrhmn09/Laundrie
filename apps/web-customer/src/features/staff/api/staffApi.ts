import { getToken } from '../../auth/api/authApi'
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

export interface StaffOpening {
  id: number
  laundry_id: number
  laundry: { id: number; business_name: string; address_line: string; status: string }
  title: string
  description: string | null
  quota: number
  status: string
  is_open: boolean
}

export interface StaffApplication {
  id: number
  laundry_id: number
  application_type: string
  status: string
  opening: StaffOpening
  laundry: { id: number; business_name: string }
}

export const staffApi = {
  async listOpenings(params?: { per_page?: number }): Promise<{ data: StaffOpening[]; meta: unknown }> {
    const qs = params?.per_page ? `?per_page=${params.per_page}` : ''
    return request(`/api/v1/staff-openings${qs}`)
  },
  async apply(openingId: number, data: { application_type: 'staff' | 'staff_courier'; message?: string }): Promise<{ message: string; application: StaffApplication }> {
    return request(`/api/v1/staff-openings/${openingId}/apply`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
  async myApplications(): Promise<{ data: StaffApplication[] }> {
    return request('/api/v1/me/staff-applications')
  },
  async withdraw(applicationId: number): Promise<{ message: string }> {
    return request(`/api/v1/staff-applications/${applicationId}/withdraw`, { method: 'POST' })
  },
}
