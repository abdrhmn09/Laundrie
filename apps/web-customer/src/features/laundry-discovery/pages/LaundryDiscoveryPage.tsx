import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

type Laundry = { id: number; business_name: string; address_line: string; status: string; services: any[] }

export default function LaundryDiscoveryPage() {
  const [laundries, setLaundries] = useState<Laundry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchLaundries = async (q = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/v1/laundries${qs}`)
      const data = await res.json().catch(() => null)
      if (res.ok) setLaundries(data?.data ?? data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchLaundries() }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void fetchLaundries(search)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10">Kembali</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-4xl">
        <h1 className="font-display text-2xl font-extrabold">Temukan Laundry</h1>
        <p className="text-sm text-on-surface-variant mt-1">Cari laundry aktif di sekitarmu. Data dari <code>laundries</code> + layanan aktif.</p>

        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama atau alamat laundry" className="input flex-1" />
          <button type="submit" className="btn-primary !h-10 !px-4">Cari</button>
        </form>

        {loading ? (
          <p className="text-sm text-on-surface-variant mt-6">Memuat…</p>
        ) : laundries.length === 0 ? (
          <p className="text-sm text-on-surface-variant mt-6">Tidak ada laundry ditemukan.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {laundries.map((l) => (
              <div key={l.id} className="card p-5">
                <p className="font-display text-sm font-bold">{l.business_name}</p>
                <p className="text-xs text-on-surface-variant">{l.address_line}</p>
                <p className="text-xs mt-2">Layanan: {l.services?.length ?? 0} aktif</p>
                <Link to={`/laundries/${l.id}`} className="text-xs text-primary font-semibold mt-2 inline-block">Lihat Detail →</Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
