import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

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
    description: 'Layanan cuci bersih, kering, dan lipat rapi. Cocok untuk pakaian sehari-hari.',
    icon: '🧺',
  },
  {
    id: 102,
    name: 'Setrika Saja (Ironing)',
    unit: 'kg',
    pricing_model: 'PER_UNIT',
    price_per_unit: 6000,
    base_price: 6000,
    description: 'Pakaian disetrika licin dan wangi, siap masuk lemari atau langsung dipakai.',
    icon: '🧼',
  },
  {
    id: 103,
    name: 'Cuci Kering (Dry Clean)',
    unit: 'pcs',
    pricing_model: 'PER_UNIT',
    price_per_unit: 25000,
    base_price: 25000,
    description: 'Perawatan khusus untuk jas, gaun, dan bahan sensitif lainnya. Harga menyesuaikan jenis pakaian.',
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
        rating: 4.8,
        review_count: 124,
        distance: '1.2 km dari lokasimu',
        operating_hours: '08:00 - 22:00',
        estimated_completion: '24 Jam',
        image_url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=1000&q=80',
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

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-28 font-sans">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen text-slate-500 text-sm">
          Memuat detail laundry...
        </div>
      ) : error || !laundry ? (
        <div className="p-6 text-center space-y-4">
          <p className="text-red-600 text-sm">{error || 'Laundry tidak ditemukan'}</p>
          <button onClick={() => navigate('/laundries')} className="px-4 py-2 bg-[#00667e] text-white text-xs font-bold rounded-xl">
            Kembali ke Daftar Laundry
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-sm">
          {/* 1. Hero Image Header */}
          <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
            <img
              src={laundry.image_url}
              alt={laundry.business_name}
              className="w-full h-full object-cover opacity-90"
            />
            {/* Top Action Overlay Buttons */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-800 hover:bg-white transition shadow"
              >
                ←
              </button>
              <div className="flex items-center gap-2">
                <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-800 hover:bg-white transition shadow">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-800 hover:bg-white transition shadow">
                  ♡
                </button>
              </div>
            </div>
          </div>

          {/* 2. Main Content Card Sheet */}
          <div className="-mt-6 relative z-10 bg-white rounded-t-3xl p-5 space-y-5 border-t border-slate-100">
            {/* Badges & Rating */}
            <div className="flex items-center gap-3 text-xs">
              <span className="bg-emerald-600 text-white font-bold px-3 py-1 rounded-full flex items-center gap-1">
                ✓ Terverifikasi
              </span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                ⭐ {laundry.rating} <span className="font-normal text-slate-500">({laundry.review_count} ulasan)</span>
              </span>
            </div>

            {/* Title & Address */}
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {laundry.business_name}
              </h1>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                📍 {laundry.address_line}
              </p>
              <p className="text-xs font-bold text-[#00667e]">
                {laundry.distance}
              </p>
            </div>

            {/* Hours & Completion Info Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-400">Buka</p>
                <p className="font-bold text-slate-800 mt-0.5">{laundry.operating_hours}</p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <p className="text-[11px] font-semibold text-slate-400">Estimasi Selesai</p>
                <p className="font-bold text-slate-800 mt-0.5">{laundry.estimated_completion}</p>
              </div>
            </div>

            {/* 3. Section: Layanan & Harga */}
            <div className="pt-2 space-y-3">
              <h2 className="text-base font-extrabold text-slate-900">
                Layanan & Harga
              </h2>

              <div className="space-y-3">
                {laundry.services.map((service) => {
                  const isSelected = selectedServiceId === service.id
                  const priceVal = service.price_per_unit || service.base_price
                  const isPcs = service.unit === 'pcs'

                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? 'border-[#00667e] bg-sky-50/50 shadow-sm ring-1 ring-[#00667e]'
                          : 'border-slate-100 bg-slate-50/70 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                            isSelected ? 'bg-[#00667e] text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {service.icon || '🧺'}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-slate-900">{service.name}</h3>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-sm text-[#00667e]">
                            {isPcs ? 'Mulai ' : ''}Rp {Number(priceVal).toLocaleString('id-ID')}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400">/{service.unit}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed pl-13">
                        {service.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 4. Bottom Sticky Action Button */}
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur border-t border-slate-200 p-4 z-30 shadow-lg">
            <button
              onClick={handleProceedToOrder}
              className="w-full bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-sm py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition"
            >
              Pesan Sekarang →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
