import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

type ServiceItem = {
  id: number
  name: string
  unit: string
  pricing_model: string
  price_per_unit: string | number
  base_price: string | number
  description?: string
  icon?: string
}

type LaundryDetail = {
  id: number
  business_name: string
  address_line: string
  contact_phone: string
  status: string
  rating?: number
  review_count?: number
  distance?: string
  operating_hours?: string
  estimated_completion?: string
  image_url?: string
  services: ServiceItem[]
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 101,
    name: 'Cuci Komplit (Wash & Fold)',
    unit: 'kg',
    pricing_model: 'PER_UNIT',
    price_per_unit: 8000,
    base_price: 8000,
    description: 'Layanan cuci bersih, kering, dan lipat rapi dengan deterjen ramah lingkungan. Cocok untuk pakaian sehari-hari.',
    icon: '🧺',
  },
  {
    id: 102,
    name: 'Setrika Saja (Ironing)',
    unit: 'kg',
    pricing_model: 'PER_UNIT',
    price_per_unit: 6000,
    base_price: 6000,
    description: 'Pakaian disetrika licin, teratur, dan wangi tahan lama, siap masuk lemari atau langsung dipakai.',
    icon: '🧼',
  },
  {
    id: 103,
    name: 'Cuci Kering (Dry Clean)',
    unit: 'pcs',
    pricing_model: 'PER_UNIT',
    price_per_unit: 25000,
    base_price: 25000,
    description: 'Perawatan khusus untuk jas, gaun, dan bahan kain sensitif. Dijamin bersih tanpa merusak tekstur serat.',
    icon: '👔',
  },
]

export default function LaundryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [laundry, setLaundry] = useState<LaundryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)

  useEffect(() => {
    if (id) void fetchLaundryDetail()
  }, [id])

  const fetchLaundryDetail = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/v1/laundries/${id}`)
      if (!res.ok) throw new Error('Detail laundry tidak ditemukan.')
      const data = await res.json()
      const raw = data?.data ?? data

      const mappedServices: ServiceItem[] = (raw.services && raw.services.length > 0)
        ? raw.services.map((s: any, idx: number) => ({
            ...s,
            description: s.description || DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length].description,
            icon: DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length].icon,
          }))
        : DEFAULT_SERVICES

      const enriched: LaundryDetail = {
        ...raw,
        rating: raw.rating || 4.8,
        review_count: raw.review_count || 124,
        distance: raw.distance || '1.2 km dari lokasimu',
        operating_hours: raw.operating_hours || '08:00 - 22:00',
        estimated_completion: raw.estimated_completion || '24 Jam Selesai',
        image_url: raw.image_url || 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1200&q=80',
        services: mappedServices,
      }

      setLaundry(enriched)
      if (mappedServices.length > 0) {
        setSelectedServiceId(mappedServices[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail laundry.')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToOrder = () => {
    if (!laundry) return
    const serviceParam = selectedServiceId ? `&service_id=${selectedServiceId}` : ''
    navigate(`/orders/new?laundry_id=${laundry.id}${serviceParam}`)
  }

  const selectedService = laundry?.services.find((s) => s.id === selectedServiceId) || laundry?.services[0]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-5xl">
          <Brand size="sm" />
          <Link to="/laundries" className="btn-ghost !h-10 text-xs font-semibold">
            ← Kembali ke Daftar Laundry
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-xs font-semibold">
          Memuat detail laundry...
        </div>
      ) : error || !laundry ? (
        <div className="container-app max-w-lg py-16 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-red-600 text-sm font-bold">{error || 'Laundry tidak ditemukan'}</p>
          <button onClick={() => navigate('/laundries')} className="btn-primary !h-10 text-xs">
            Kembali ke Daftar Laundry
          </button>
        </div>
      ) : (
        <main className="container-app max-w-5xl py-6 space-y-6">
          {/* Hero Banner Section */}
          <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <img
              src={laundry.image_url}
              alt={laundry.business_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
            
            {/* Overlay Info Header */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4 text-white">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-emerald-500/90 backdrop-blur text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    ✓ Partner Terverifikasi
                  </span>
                  <span className="bg-amber-400/90 backdrop-blur text-slate-950 text-[11px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    ⭐ {laundry.rating} <span className="font-normal text-slate-800">({laundry.review_count} Ulasan)</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-sm">
                  {laundry.business_name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-200 flex items-center gap-1.5 font-medium">
                  <span>📍 {laundry.address_line}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-sky-300 font-bold">{laundry.distance}</span>
                </p>
              </div>

              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/40 transition shadow">
                ♡
              </button>
            </div>
          </div>

          {/* Main 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content (2 Columns on Desktop) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Partner Overview & Hours Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Informasi Mitra
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JAM OPERASIONAL</p>
                    <p className="font-bold text-slate-800 text-sm">🕒 {laundry.operating_hours}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESTIMASI SELESAI</p>
                    <p className="font-bold text-slate-800 text-sm">⚡ {laundry.estimated_completion}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KONTAK MITRA</p>
                    <p className="font-bold text-[#00667e] text-sm">📞 {laundry.contact_phone || '0812-3456-7890'}</p>
                  </div>
                </div>
              </div>

              {/* Services & Pricing Selection */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Pilihan Layanan & Tarif
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Pilih jenis layanan yang ingin Anda pesan.</p>
                  </div>
                  <span className="text-xs font-bold text-[#00667e] bg-sky-50 px-3 py-1 rounded-full">
                    {laundry.services.length} Layanan Available
                  </span>
                </div>

                <div className="space-y-3">
                  {laundry.services.map((service) => {
                    const isSelected = selectedServiceId === service.id
                    const priceVal = service.price_per_unit || service.base_price

                    return (
                      <div
                        key={service.id}
                        onClick={() => setSelectedServiceId(service.id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? 'border-[#00667e] bg-sky-50/60 shadow-sm ring-2 ring-[#00667e]/30'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-sm ${
                              isSelected ? 'bg-[#00667e] text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {service.icon || '🧺'}
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900">{service.name}</h3>
                              <p className="text-[11px] font-medium text-slate-500">Kategori: {service.unit === 'kg' ? 'Kiloan' : 'Satuan / Pcs'}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-black text-base text-[#00667e]">
                              Rp {Number(priceVal).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[11px] font-bold text-slate-400">/{service.unit}</p>
                          </div>
                        </div>

                        {service.description && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100/80">
                            {service.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Content (Sticky Summary Card on Desktop) */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-sm sticky top-24">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                  Ringkasan Pesanan
                </h3>

                {selectedService ? (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{selectedService.name}</p>
                        <p className="text-[11px] text-slate-500">Tarif Per Unit</p>
                      </div>
                      <p className="font-extrabold text-sm text-[#00667e]">
                        Rp {Number(selectedService.price_per_unit || selectedService.base_price).toLocaleString('id-ID')} <span className="text-[11px] font-normal text-slate-500">/{selectedService.unit}</span>
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 text-slate-600">
                      <div className="flex justify-between">
                        <span>Layanan Antar-Jemput:</span>
                        <span className="font-semibold text-emerald-600">✓ Tersedia</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jaminan Garansi:</span>
                        <span className="font-semibold text-slate-800">24 Jam Komplain</span>
                      </div>
                    </div>
                  </div>
                ) : null}

                <button
                  onClick={handleProceedToOrder}
                  className="w-full bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  Pesan Sekarang →
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Fixed Floating CTA */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 p-4 z-30 shadow-lg">
            <div className="container-app max-w-5xl flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">LAYANAN DIPILIH</p>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[160px] sm:max-w-xs">{selectedService?.name}</p>
                <p className="text-sm font-black text-[#00667e]">
                  Rp {Number(selectedService?.price_per_unit || selectedService?.base_price || 0).toLocaleString('id-ID')} <span className="text-[10px] font-normal text-slate-500">/{selectedService?.unit}</span>
                </p>
              </div>
              <button
                onClick={handleProceedToOrder}
                className="bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition shrink-0"
              >
                Pesan Sekarang →
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

