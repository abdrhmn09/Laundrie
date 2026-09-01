import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

type Service = {
  id: number
  name: string
  service_type: string
  pricing_model: string
  base_price: string
  price_per_unit: string | null
  unit: string | null
  laundry: { business_name: string }
}

export default function CatalogPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/v1/services?per_page=50')
        const data = await res.json().catch(() => null)
        if (res.ok) setServices(data?.data ?? data ?? [])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10">Kembali</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-4xl">
        <h1 className="font-display text-2xl font-extrabold">Katalog Layanan Laundry</h1>
        <p className="text-sm text-on-surface-variant mt-1">Jelajahi layanan dari laundry terdaftar. Harga dari <code>service_prices</code> aktif.</p>
        {loading ? (
          <p className="text-sm text-on-surface-variant mt-6">Memuat…</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-on-surface-variant mt-6">Belum ada layanan. Manager dapat tambah di 5174/services.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="card p-4">
                <p className="font-display text-sm font-bold">{s.name}</p>
                <p className="text-xs text-on-surface-variant">{s.laundry.business_name} • {s.service_type} • {s.pricing_model}</p>
                <p className="text-sm font-bold mt-2">Rp {s.base_price} {s.price_per_unit ? `+ ${s.price_per_unit}/${s.unit}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
