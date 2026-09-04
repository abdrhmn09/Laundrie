import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Settlement = {
  id: number
  settlement_number: string
  gross_amount: number
  platform_commission: number
  net_amount: number
  status: string
  bank_name: string
  account_number: string
  account_holder: string
  created_at: string
  laundry?: { business_name: string }
  courier?: { user: { name: string; email: string } }
}

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSettlements = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch('/api/v1/admin/settlements', { headers })
      const data = await res.json()
      if (res.ok) {
        setSettlements(data.settlements || [])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSettlements()
  }, [])

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/v1/admin/settlements/${id}/approve`, {
        method: 'POST',
        headers,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal menyetujui pencairan.')

      setMessage('Pencairan dana berhasil disetujui & dicairkan!')
      await fetchSettlements()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-4xl">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10 text-xs font-semibold">Dashboard Admin</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-4xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Persetujuan Settlement & Payout Mitra (Finance Admin)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar pengajuan pencairan saldo dari Pemilik Laundry dan Kurir Freelance.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl">
            ⚠️ {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Antrean Pencairan Dana</h3>

          {loading ? (
            <p className="text-xs text-slate-500 py-6 text-center">Memuat antrean settlement...</p>
          ) : settlements.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Tidak ada pengajuan pencairan saat ini.</p>
          ) : (
            <div className="space-y-3">
              {settlements.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        {s.settlement_number}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {s.laundry ? `Mitra Laundry: ${s.laundry.business_name}` : `Kurir: ${s.courier?.user?.name}`}
                      </span>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      Rp {Number(s.net_amount).toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">(Kotor: Rp {Number(s.gross_amount).toLocaleString('id-ID')})</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      Rekening: <span className="font-bold">{s.bank_name} {s.account_number}</span> a.n {s.account_holder}
                    </p>
                  </div>

                  {s.status === 'PENDING' ? (
                    <button
                      onClick={() => handleApprove(s.id)}
                      disabled={actionLoading}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow transition whitespace-nowrap"
                    >
                      Setujui & Cairkan Payout →
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full whitespace-nowrap">
                      TERCAIRKAN ✅
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
