import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Order = { id: number; order_number: string; status: string; estimated_total: string; laundry: { business_name: string } }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/orders', { headers })
      const data = await res.json().catch(() => null)
      if (res.ok) setOrders(data?.data ?? data ?? [])
      setLoading(false)
    }
    void load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/orders/new" className="btn-primary !h-9 !px-4 text-xs">Buat Pesanan</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold">Pesanan Saya</h1>
        {loading ? (
          <p className="text-sm text-on-surface-variant mt-4">Memuat…</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-on-surface-variant mt-4">Belum ada pesanan. <Link to="/orders/new" className="text-primary underline">Buat sekarang</Link></p>
        ) : (
          <div className="mt-4 grid gap-3">
            {orders.map((o) => (
              <Link key={o.id} to={`/orders/${o.id}`} className="card p-4 hover:shadow-md">
                <p className="font-display text-sm font-bold">{o.order_number} • <span className="badge-neutral">{o.status}</span></p>
                <p className="text-xs text-on-surface-variant">{o.laundry.business_name} • Rp {o.estimated_total}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
