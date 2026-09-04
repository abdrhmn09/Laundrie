import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Laundry = { id: number; business_name: string; address_line?: string }
type Service = { id: number; name: string; base_price: string; laundry_id: number; unit?: string }
type Address = { id: number; label: string | null; address_line: string; is_default: boolean }

export default function CreateOrderPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlLaundryId = searchParams.get('laundry_id')
  const urlServiceId = searchParams.get('service_id')

  const [laundries, setLaundries] = useState<Laundry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])

  const [selectedLaundry, setSelectedLaundry] = useState<number | ''>(
    urlLaundryId ? Number(urlLaundryId) : ''
  )
  const [selectedService, setSelectedService] = useState<number | ''>(
    urlServiceId ? Number(urlServiceId) : ''
  )

  // Granular Logistics Options
  const [pickupMethod, setPickupMethod] = useState<'COURIER' | 'SELF'>('COURIER')
  const [deliveryMethod, setDeliveryMethod] = useState<'COURIER' | 'SELF'>('COURIER')

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
      
      const loadedLaundries = lData?.data ?? lData ?? []
      const loadedAddresses = aData?.data ?? aData ?? []

      setLaundries(loadedLaundries)
      setAddresses(loadedAddresses)

      if (loadedAddresses.length > 0) {
        const defaultAddr = loadedAddresses.find((a: Address) => a.is_default) || loadedAddresses[0]
        setPickupAddress(defaultAddr.id)
        setDeliveryAddress(defaultAddr.id)
      }
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
      if (res.ok) {
        const list = data?.data ?? data ?? []
        setServices(list)
        if (urlServiceId && list.some((s: Service) => s.id === Number(urlServiceId))) {
          setSelectedService(Number(urlServiceId))
        } else if (list.length > 0 && !selectedService) {
          setSelectedService(list[0].id)
        }
      }
    }
    void loadServices()
  }, [selectedLaundry, urlServiceId])

  const selectedLaundryObj = laundries.find((l) => l.id === Number(selectedLaundry))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLaundry || !selectedService) {
      setError('Pilih laundry dan layanan terlebih dahulu.')
      return
    }

    if (pickupMethod === 'COURIER' && (!pickupAddress || !pickupStart || !pickupEnd)) {
      setError('Lengkapi alamat dan jadwal jam penjemputan kurir.')
      return
    }

    if (deliveryMethod === 'COURIER' && !deliveryAddress) {
      setError('Pilih alamat pengantaran kurir untuk pakaian selesai.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const defaultAddrId = addresses[0]?.id || 1
      const pAddrId = pickupMethod === 'COURIER' ? Number(pickupAddress) : defaultAddrId
      const dAddrId = deliveryMethod === 'COURIER' ? Number(deliveryAddress) : defaultAddrId

      const now = new Date()
      const defaultStart = new Date(now.getTime() + 3600 * 1000).toISOString()
      const defaultEnd = new Date(now.getTime() + 7200 * 1000).toISOString()

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          laundry_id: Number(selectedLaundry),
          pickup_address_id: pAddrId,
          delivery_address_id: dAddrId,
          scheduled_pickup_start: pickupMethod === 'COURIER' ? new Date(pickupStart).toISOString() : defaultStart,
          scheduled_pickup_end: pickupMethod === 'COURIER' ? new Date(pickupEnd).toISOString() : defaultEnd,
          items: [{ service_id: Number(selectedService), quantity: parseFloat(quantity) || 1 }],
          pickup_method: pickupMethod,
          delivery_method: deliveryMethod,
        }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal membuat pesanan.')
      navigate(`/orders/${data.order.id}`)
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-xl">
          <Brand size="sm" />
          <Link to="/laundries" className="btn-ghost !h-10 text-xs font-semibold">Batal</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-xl">
        <div className="mb-6 space-y-1">
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Konfirmasi Pesanan
          </h1>
          <p className="text-xs text-slate-500">
            Periksa detail laundry, layanan, dan metode pengiriman & pengambilan.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Selected Laundry Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MITRA LAUNDRY</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Terpilih</span>
            </div>

            {selectedLaundryObj ? (
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedLaundryObj.business_name}</h3>
                {selectedLaundryObj.address_line && (
                  <p className="text-xs text-slate-500 mt-0.5">📍 {selectedLaundryObj.address_line}</p>
                )}
              </div>
            ) : (
              <select
                value={selectedLaundry}
                onChange={(e) => setSelectedLaundry(e.target.value ? Number(e.target.value) : '')}
                required
                className="input text-xs"
              >
                <option value="">Pilih Laundry Mitra</option>
                {laundries.map((l) => (
                  <option key={l.id} value={l.id}>{l.business_name}</option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Service Selection & Quantity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LAYANAN & ESTIMASI BERAT</span>

            <div>
              <label className="label text-xs">Pilih Layanan *</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value ? Number(e.target.value) : '')}
                required
                className="input text-xs font-medium"
              >
                <option value="">Pilih Layanan</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — Rp {Number(s.base_price).toLocaleString('id-ID')} /{s.unit || 'kg'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-xs">Estimasi Berat / Jumlah (KG/Pcs) *</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="input text-xs font-medium"
              />
            </div>
          </div>

          {/* 3. Section 1: Pickup Option (Saat Mengirim Pakaian Awal) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">1. METODE PENYERAHAN PAKAIAN (AWAL)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPickupMethod('COURIER')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  pickupMethod === 'COURIER'
                    ? 'border-[#00667e] bg-sky-50/50 ring-1 ring-[#00667e]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="text-xl">🛵</span>
                <div>
                  <p className="font-bold text-xs text-slate-900 mt-2">Jemput Kurir</p>
                  <p className="text-[10px] text-slate-500">Kurir menjemput ke lokasi</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPickupMethod('SELF')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  pickupMethod === 'SELF'
                    ? 'border-[#00667e] bg-sky-50/50 ring-1 ring-[#00667e]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="text-xl">🏪</span>
                <div>
                  <p className="font-bold text-xs text-slate-900 mt-2">Antar Sendiri</p>
                  <p className="text-[10px] text-slate-500">Bawa sendiri ke outlet</p>
                </div>
              </button>
            </div>

            {pickupMethod === 'COURIER' ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="label text-xs">Alamat Penjemputan *</label>
                  <select
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value ? Number(e.target.value) : '')}
                    required={pickupMethod === 'COURIER'}
                    className="input text-xs"
                  >
                    <option value="">Pilih Alamat Penjemputan</option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>{a.label ?? 'Alamat'} — {a.address_line.slice(0, 30)}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label text-xs">Jadwal Jemput Mulai *</label>
                    <input
                      type="datetime-local"
                      value={pickupStart}
                      onChange={(e) => setPickupStart(e.target.value)}
                      required={pickupMethod === 'COURIER'}
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">Jadwal Jemput Selesai *</label>
                    <input
                      type="datetime-local"
                      value={pickupEnd}
                      onChange={(e) => setPickupEnd(e.target.value)}
                      required={pickupMethod === 'COURIER'}
                      className="input text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
                ℹ️ Anda mengantarkan pakaian langsung ke toko outlet laundry secara mandiri.
              </div>
            )}
          </div>

          {/* 4. Section 2: Delivery Option (Saat Pakaian Selesai Dicuci) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">2. METODE PENGAMBILAN PAKAIAN (SELESAI)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('COURIER')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'COURIER'
                    ? 'border-[#00667e] bg-sky-50/50 ring-1 ring-[#00667e]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="text-xl">🚚</span>
                <div>
                  <p className="font-bold text-xs text-slate-900 mt-2">Diantar Kurir</p>
                  <p className="text-[10px] text-slate-500">Dikirim kembali ke rumah</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('SELF')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  deliveryMethod === 'SELF'
                    ? 'border-[#00667e] bg-sky-50/50 ring-1 ring-[#00667e]'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="text-xl">🚶</span>
                <div>
                  <p className="font-bold text-xs text-slate-900 mt-2">Ambil Sendiri</p>
                  <p className="text-[10px] text-slate-500">Ambil sendiri di outlet</p>
                </div>
              </button>
            </div>

            {deliveryMethod === 'COURIER' ? (
              <div className="pt-2">
                <label className="label text-xs">Alamat Pengantaran *</label>
                <select
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value ? Number(e.target.value) : '')}
                  required={deliveryMethod === 'COURIER'}
                  className="input text-xs"
                >
                  <option value="">Pilih Alamat Pengantaran</option>
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>{a.label ?? 'Alamat'} — {a.address_line.slice(0, 30)}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
                ℹ️ Anda akan mengambil pakaian yang sudah bersih secara langsung di outlet setelah siap.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-full shadow-md transition"
          >
            {submitting ? 'Memproses Pesanan...' : 'Konfirmasi & Buat Pesanan →'}
          </button>
        </form>
      </main>
    </div>
  )
}
