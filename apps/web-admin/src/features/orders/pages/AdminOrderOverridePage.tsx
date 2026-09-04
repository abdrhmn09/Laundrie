import { useEffect, useState } from 'react'
import AdminLayout from '../../../shared/components/AdminLayout'
import { getToken } from '../../auth/api/authApi'

type Order = {
  id: number
  order_number: string
  status: string
  estimated_total: number
  currency: string
  created_at: string
  laundry: { business_name: string }
  customer: { name: string; phone: string }
}

const ORDER_STATUSES = [
  'DRAFT', 'PENDING_PAYMENT', 'CONFIRMED', 'ASSIGNED_TO_COURIER',
  'PICKUP_IN_PROGRESS', 'RECEIVED_AT_LAUNDRY', 'WEIGHING_REQUIRED',
  'WEIGHT_REVIEW_REQUIRED', 'PRICE_FINALIZED', 'PROCESSING',
  'READY_FOR_DELIVERY', 'DELIVERY_IN_PROGRESS', 'COMPLETED', 'CANCELLED',
]

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  CONFIRMED: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-blue-100 text-blue-800',
}

export default function AdminOrderOverridePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [justification, setJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus) params.set('status', filterStatus)

      const res = await fetch(`/api/v1/admin/orders?${params}`, { headers })
      const data = await res.json()
      if (res.ok) setOrders(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchOrders() }, [search, filterStatus])

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !newStatus) return
    setSubmitting(true); setError(null); setMessage(null)

    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/v1/admin/orders/${selected.id}/override`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ new_status: newStatus, justification }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal melakukan override.')

      setMessage(`Pesanan #${selected.order_number}: ${selected.status} → ${newStatus}`)
      setSelected(null); setJustification(''); setNewStatus('')
      await fetchOrders()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900">Override Status Order Manual</h1>
          <p className="text-xs text-slate-500 mt-0.5">Ubah status pesanan secara manual dengan justifikasi wajib — setiap aksi dicatat di Audit Trail.</p>
        </div>

        {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl">✓ {message}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl">⚠️ {error}</div>}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Cari order_number / nama customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="input text-xs !h-9 max-w-xs" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input text-xs !h-9 max-w-[200px]">
            <option value="">Semua Status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          {/* Order Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Daftar Pesanan ({orders.length})</span>
            </div>

            {loading ? (
              <p className="text-xs text-center py-10 text-slate-400">Memuat pesanan...</p>
            ) : orders.length === 0 ? (
              <p className="text-xs text-center py-10 text-slate-400">Tidak ada pesanan ditemukan.</p>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => { setSelected(order); setNewStatus(order.status); setJustification('') }}
                    className={`w-full text-left px-5 py-3.5 hover:bg-slate-50 transition ${selected?.id === order.id ? 'bg-slate-50 border-l-2 border-[#00667e]' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-slate-900">#{order.order_number}</p>
                        <p className="text-[11px] text-slate-500">{order.laundry?.business_name} · {order.customer?.name}</p>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase whitespace-nowrap ${STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Rp {Number(order.estimated_total).toLocaleString('id-ID')} · {new Date(order.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Override Panel */}
          {selected ? (
            <form onSubmit={handleOverride} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
              <div>
                <h3 className="font-display text-base font-black text-slate-900">Manual Override</h3>
                <p className="text-xs text-slate-500">#{selected.order_number} · {selected.customer?.name}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                <p className="text-slate-500">Status Saat Ini:</p>
                <span className={`inline-block font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[selected.status] ?? 'bg-slate-100 text-slate-600'}`}>
                  {selected.status}
                </span>
              </div>

              <div>
                <label className="label text-xs">Status Baru *</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required className="input text-xs">
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="label text-xs">Justifikasi Wajib * <span className="text-slate-400">(dicatat permanen)</span></label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan alasan override secara rinci (min. 10 karakter)..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required minLength={10}
                  className="input resize-none text-xs leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => setSelected(null)} className="flex-1 btn-secondary text-xs !h-11">Batal</button>
                <button type="submit" disabled={submitting || newStatus === selected.status} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-full shadow transition">
                  {submitting ? 'Memproses...' : 'Override Status →'}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center">⚠️ Aksi ini tidak dapat dibatalkan dan tercatat di Audit Trail.</p>
            </form>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 space-y-2 h-fit">
              <div className="text-3xl">📦</div>
              <p className="font-semibold">Pilih pesanan dari daftar untuk melakukan override.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
