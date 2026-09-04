import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Service = {
  id: number
  name: string
  service_type: string
  pricing_model: string
  base_price: string
  price_per_unit: string | null
  unit: string | null
  minimum_charge: string
  estimated_duration: number | null
  status: string
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form
  const [name, setName] = useState('')
  const [serviceType, setServiceType] = useState('wash_fold')
  const [pricingModel, setPricingModel] = useState('flat')
  const [basePrice, setBasePrice] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [unit, setUnit] = useState('kg')
  const [minimumCharge, setMinimumCharge] = useState('0')
  const [submitting, setSubmitting] = useState(false)

  const fetchServices = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/services?per_page=50', { headers })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal memuat layanan.')
      setServices(data?.data ?? data ?? [])
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchServices() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/laundry/services', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          service_type: serviceType,
          pricing_model: pricingModel,
          base_price: parseFloat(basePrice) || 0,
          price_per_unit: pricePerUnit ? parseFloat(pricePerUnit) : null,
          unit: unit || 'kg',
          minimum_charge: parseFloat(minimumCharge) || 0,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal membuat layanan.')
      setName(''); setBasePrice(''); setPricePerUnit(''); setMinimumCharge('0')
      await fetchServices()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePriceUpdate = async (id: number) => {
    const newPrice = prompt('Harga baru (base_price):')
    if (!newPrice) return
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch(`/api/v1/laundry/services/${id}/prices`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ base_price: parseFloat(newPrice), price_per_unit: 0, minimum_charge: 0 }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal ubah harga.')
      await fetchServices()
    } catch (e: unknown) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10">Kembali Dashboard</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-4xl">
        <h1 className="font-display text-2xl font-extrabold">Layanan & Harga — Manager Only</h1>
        <p className="text-sm text-on-surface-variant mt-1">Kelola layanan laundry Anda. Perubahan harga membuat row baru di <code>service_prices</code> (Schema S5, Design §16).</p>

        {error && <div className="mt-4 rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

        <form onSubmit={handleCreate} className="mt-6 card p-5 space-y-4">
          <h3 className="font-display font-bold">Tambah Layanan</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Nama Layanan *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cuci Lipat" required className="input" />
            </div>
            <div>
              <label className="label">Tipe Layanan</label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="input">
                <option value="wash_fold">Wash Fold</option>
                <option value="wash_iron">Wash Iron</option>
                <option value="dry_clean">Dry Clean</option>
                <option value="express">Express</option>
                <option value="linen">Linen</option>
              </select>
            </div>
            <div>
              <label className="label">Model Harga</label>
              <select value={pricingModel} onChange={(e) => setPricingModel(e.target.value)} className="input">
                <option value="flat">Flat</option>
                <option value="per_weight">Per Weight (kg)</option>
                <option value="per_item">Per Item (pcs)</option>
              </select>
            </div>
            <div>
              <label className="label">Base Price *</label>
              <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="15000" required className="input" />
            </div>
            {(pricingModel === 'per_weight' || pricingModel === 'per_item') && (
              <>
                <div>
                  <label className="label">Price per Unit</label>
                  <input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} placeholder="8000" className="input" />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input">
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="label">Minimum Charge</label>
              <input type="number" value={minimumCharge} onChange={(e) => setMinimumCharge(e.target.value)} placeholder="0" className="input" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary !h-10 !px-4 text-xs">
            {submitting ? 'Menyimpan…' : 'Tambah Layanan'}
          </button>
        </form>

        <div className="mt-8">
          <h3 className="font-display font-bold">Daftar Layanan Aktif</h3>
          {loading ? (
            <p className="text-sm text-on-surface-variant mt-2">Memuat…</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-on-surface-variant mt-2">Belum ada layanan. Tambah di atas.</p>
          ) : (
            <div className="mt-3 grid gap-3">
              {services.map((s) => (
                <div key={s.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-bold">{s.name} <span className="text-xs text-on-surface-variant">({s.service_type} • {s.pricing_model})</span></p>
                    <p className="text-xs text-on-surface-variant">Harga: {s.base_price} {s.price_per_unit ? `+ ${s.price_per_unit}/${s.unit}` : ''} • Min: {s.minimum_charge} • Status: {s.status}</p>
                  </div>
                  <button onClick={() => handlePriceUpdate(s.id)} className="btn-secondary !h-8 !px-3 text-xs">Ubah Harga</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
