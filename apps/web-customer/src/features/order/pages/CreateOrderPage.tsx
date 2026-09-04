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
  const [pickupStart, setPickupStart] = useState(() => {
    const d = new Date(Date.now() + 2 * 3600 * 1000)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })
  const [pickupEnd, setPickupEnd] = useState(() => {
    const d = new Date(Date.now() + 4 * 3600 * 1000)
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 16)
  })
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
  const selectedServiceObj = services.find((s) => s.id === Number(selectedService))

  const unitPrice = selectedServiceObj ? parseFloat(selectedServiceObj.base_price) || 0 : 0
  const qtyVal = parseFloat(quantity) || 0
  const estimatedSubtotal = unitPrice * qtyVal

  const safeIsoDate = (val: string, fallbackOffsetHours: number) => {
    if (val) {
      const d = new Date(val)
      if (!isNaN(d.getTime())) return d.toISOString()
    }
    return new Date(Date.now() + fallbackOffsetHours * 3600 * 1000).toISOString()
  }

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

      const res = await fetch('/api/v1/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          laundry_id: Number(selectedLaundry),
          pickup_address_id: pAddrId,
          delivery_address_id: dAddrId,
          scheduled_pickup_start: safeIsoDate(pickupStart, 2),
          scheduled_pickup_end: safeIsoDate(pickupEnd, 4),
          items: [{ service_id: Number(selectedService), quantity: qtyVal || 1 }],
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-5xl">
          <Brand size="sm" />
          <Link to="/laundries" className="btn-ghost !h-10 text-xs font-semibold">Batal</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-5xl space-y-6">
        <div className="space-y-1">
          <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Konfirmasi & Buat Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Periksa rincian mitra laundry, jenis layanan, serta konfigurasi metode logistik.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-700">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 Cols on Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Selected Laundry Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MITRA LAUNDRY TERPILIH</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">✓ Terverifikasi</span>
              </div>

              {selectedLaundryObj ? (
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-slate-900">{selectedLaundryObj.business_name}</h3>
                  {selectedLaundryObj.address_line && (
                    <p className="text-xs text-slate-500">📍 {selectedLaundryObj.address_line}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <label className="label text-xs">Pilih Outlet Laundry *</label>
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
                </div>
              )}
            </div>

            {/* 2. Service Selection & Quantity */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Layanan & Estimasi Berat / Jumlah
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="label text-xs">Estimasi Jumlah ({selectedServiceObj?.unit || 'KG/Pcs'}) *</label>
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
            </div>

            {/* 3. Pickup Logistics (Saat Mengirim Pakaian Awal) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">TAHAP 1</span>
                <h2 className="text-base font-extrabold text-slate-900">Metode Penyerahan Pakaian (Awal)</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPickupMethod('COURIER')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    pickupMethod === 'COURIER'
                      ? 'border-[#00667e] bg-sky-50/60 ring-2 ring-[#00667e]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">🛵</span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">Jemput Kurir</p>
                    <p className="text-[11px] text-slate-500">Kurir menjemput ke lokasi Anda</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPickupMethod('SELF')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    pickupMethod === 'SELF'
                      ? 'border-[#00667e] bg-sky-50/60 ring-2 ring-[#00667e]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">🏪</span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">Antar Sendiri</p>
                    <p className="text-[11px] text-slate-500">Bawa pakaian langsung ke outlet</p>
                  </div>
                </button>
              </div>

              {pickupMethod === 'COURIER' ? (
                <div className="space-y-4 pt-2 border-t border-slate-100">
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
                        <option key={a.id} value={a.id}>{a.label ?? 'Alamat'} — {a.address_line.slice(0, 40)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                  ℹ️ Anda mengantarkan pakaian secara mandiri ke outlet mitra laundry.
                </div>
              )}
            </div>

            {/* 4. Delivery Logistics (Saat Pakaian Selesai Dicuci) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">TAHAP 2</span>
                <h2 className="text-base font-extrabold text-slate-900">Metode Pengambilan Pakaian (Selesai)</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('COURIER')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    deliveryMethod === 'COURIER'
                      ? 'border-[#00667e] bg-sky-50/60 ring-2 ring-[#00667e]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">Diantar Kurir</p>
                    <p className="text-[11px] text-slate-500">Dikirim kembali ke alamat Anda</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('SELF')}
                  className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${
                    deliveryMethod === 'SELF'
                      ? 'border-[#00667e] bg-sky-50/60 ring-2 ring-[#00667e]/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">🚶</span>
                  <div>
                    <p className="font-bold text-xs sm:text-sm text-slate-900">Ambil Sendiri</p>
                    <p className="text-[11px] text-slate-500">Ambil sendiri ke outlet</p>
                  </div>
                </button>
              </div>

              {deliveryMethod === 'COURIER' ? (
                <div className="pt-2 border-t border-slate-100">
                  <label className="label text-xs">Alamat Pengantaran *</label>
                  <select
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value ? Number(e.target.value) : '')}
                    required={deliveryMethod === 'COURIER'}
                    className="input text-xs"
                  >
                    <option value="">Pilih Alamat Pengantaran</option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>{a.label ?? 'Alamat'} — {a.address_line.slice(0, 40)}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600">
                  ℹ️ Anda mengambil pakaian yang sudah selesai di outlet mitra laundry secara mandiri.
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sticky Summary Sidebar on Desktop) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm sticky top-24">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                Ringkasan Checkout
              </h3>

              <div className="space-y-3 text-xs">
                {selectedLaundryObj && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">MITRA LAUNDRY</p>
                    <p className="font-bold text-slate-900 mt-0.5">{selectedLaundryObj.business_name}</p>
                  </div>
                )}

                {selectedServiceObj && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">LAYANAN DIPILIH</p>
                    <p className="font-bold text-slate-900">{selectedServiceObj.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {quantity} {selectedServiceObj.unit || 'kg'} x Rp {unitPrice.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-slate-600">
                    <span>Estimasi Subtotal:</span>
                    <span className="font-bold text-slate-900">Rp {estimatedSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Penjemputan:</span>
                    <span className="font-semibold text-slate-800">{pickupMethod === 'COURIER' ? '🛵 Kurir' : '🏪 Outlet'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pengantaran:</span>
                    <span className="font-semibold text-slate-800">{deliveryMethod === 'COURIER' ? '🚚 Kurir' : '🚶 Outlet'}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-3 border-t border-slate-200">
                    <span>ESTIMASI TOTAL:</span>
                    <span className="text-[#00667e]">Rp {estimatedSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
              >
                {submitting ? 'Memproses Pesanan...' : 'Konfirmasi & Buat Pesanan →'}
              </button>

              <div className="p-3 bg-sky-50 rounded-2xl text-[11px] text-[#00667e] font-semibold text-center">
                🔒 Pembayaran dilakukan setelah penimbangan final dikonfirmasi.
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}

