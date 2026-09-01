import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Laundry = { id: number; business_name: string }
type Service = { id: number; name: string; base_price: string; laundry_id: number }
type Address = { id: number; label: string | null; address_line: string; is_default: boolean }

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [laundries, setLaundries] = useState<Laundry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])

  const [selectedLaundry, setSelectedLaundry] = useState<number | ''>('')
  const [selectedService, setSelectedService] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('1')
  const [pickupAddress, setPickupAddress] = useState<number | ''>('')
  const [deliveryAddress, setDeliveryAddress] = useState<number | ''>('')
  const [pickupStart, setPickupStart] = useState('')
  const [pickupEnd, setPickupEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const [lRes, aRes] = await Promise.all([
        fetch('/api/v1/laundries', { headers }),
        fetch('/api/v1/addresses', { headers }),
      ])
      const lData = await lRes.json().catch(() => null)
      const aData = await aRes.json().catch(() => null)
      if (lRes.ok) setLaundries(lData?.data ?? lData ?? [])
      if (aRes.ok) setAddresses(aData?.data ?? aData ?? [])
    }
    void load()
  }, [])

  useEffect(() => {
    if (!selectedLaundry) {
      setServices([])
      return
    }
    const loadServices = async () => {
      const res = await fetch(`/api/v1/services?laundry_id=${selectedLaundry}`)
      const data = await res.json().catch(() => null)
      if (res.ok) setServices(data?.data ?? data ?? [])
    }
    void loadServices()
  }, [selectedLaundry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLaundry || !selectedService || !pickupAddress || !deliveryAddress || !pickupStart || !pickupEnd) {
      setError('Lengkapi semua field wajib.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          laundry_id: Number(selectedLaundry),
          pickup_address_id: Number(pickupAddress),
          delivery_address_id: Number(deliveryAddress),
          scheduled_pickup_start: new Date(pickupStart).toISOString(),
          scheduled_pickup_end: new Date(pickupEnd).toISOString(),
          items: [{ service_id: Number(selectedService), quantity: parseFloat(quantity) || 1 }],
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal buat pesanan.')
      navigate(`/orders/${data.order.id}`)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10">Kembali</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-2xl">
        <h1 className="font-display text-2xl font-extrabold">Buat Pesanan — Customer</h1>
        <p className="text-sm text-on-surface-variant mt-1">Pilih laundry, layanan, alamat, dan jadwal pickup (PRD §14).</p>

        {error && <div className="mt-4 rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-6 card p-5 space-y-4">
          <div>
            <label className="label">Laundry *</label>
            <select value={selectedLaundry} onChange={(e) => setSelectedLaundry(e.target.value ? Number(e.target.value) : '')} required className="input">
              <option value="">Pilih Laundry</option>
              {laundries.map((l) => (
                <option key={l.id} value={l.id}>{l.business_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Layanan *</label>
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : '')} required className="input" disabled={!selectedLaundry}>
              <option value="">Pilih Layanan</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — Rp {s.base_price}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Quantity (kg/pcs) *</label>
            <input type="number" step="0.1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="input" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Alamat Pickup *</label>
              <select value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value ? Number(e.target.value) : '')} required className="input">
                <option value="">Pilih Alamat</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>{a.label ?? 'Alamat'} — {a.address_line.slice(0,30)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Alamat Delivery *</label>
              <select value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value ? Number(e.target.value) : '')} required className="input">
                <option value="">Pilih Alamat</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>{a.label ?? 'Alamat'} — {a.address_line.slice(0,30)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Pickup Start *</label>
              <input type="datetime-local" value={pickupStart} onChange={(e) => setPickupStart(e.target.value)} required className="input" />
            </div>
            <div>
              <label className="label">Pickup End *</label>
              <input type="datetime-local" value={pickupEnd} onChange={(e) => setPickupEnd(e.target.value)} required className="input" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Membuat…' : 'Buat Pesanan (DRAFT)'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/addresses" className="text-xs text-primary underline">Kelola Alamat →</Link>
          <span className="mx-2 text-xs">|</span>
          <Link to="/catalog" className="text-xs text-primary underline">Lihat Katalog →</Link>
        </div>
      </main>
    </div>
  )
}
