import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type Laundry = {
  id: number
  business_name: string
  address_line: string
  status: string
  rating?: number
  distance?: string
  min_price?: number
  image_url?: string
  badge?: string
  services: any[]
}

const CATEGORIES = [
  { id: 'cuci-lipat', name: 'Cuci Lipat', icon: '🧺', color: 'bg-primary text-white' },
  { id: 'setrika', name: 'Setrika', icon: '🧼', color: 'bg-slate-100 text-slate-700' },
  { id: 'dry-clean', name: 'Dry Clean', icon: '👔', color: 'bg-slate-100 text-slate-700' },
  { id: 'karpet', name: 'Karpet', icon: '🧹', color: 'bg-slate-100 text-slate-700' },
  { id: 'sepatu', name: 'Sepatu', icon: '👟', color: 'bg-slate-100 text-slate-700' },
]

const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=800&q=80',
]

export default function LaundryDiscoveryPage() {
  const navigate = useNavigate()
  const [laundries, setLaundries] = useState<Laundry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Terdekat')
  const [selectedAddress] = useState('Jl. Wash Street No. 42, Kebayoran...')

  const fetchLaundries = async (q = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await fetch(`/api/v1/laundries${qs}`)
      const data = await res.json().catch(() => null)
      
      const rawList: any[] = data?.data ?? data ?? []
      
      const enriched: Laundry[] = rawList.map((item, idx) => ({
        ...item,
        rating: 4.7 + (idx % 3) * 0.1,
        distance: `${0.5 + idx * 0.7} km • Kebayoran Baru`,
        min_price: 7000 + (idx % 4) * 1500,
        image_url: SAMPLE_IMAGES[idx % SAMPLE_IMAGES.length],
        badge: idx === 0 ? 'Terverifikasi' : 'Buka',
      }))

      setLaundries(enriched)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchLaundries()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    void fetchLaundries(search)
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-24 font-sans">
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-black tracking-tight text-[#00667e]">
            Laundrie
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-600">
          <button className="p-1 hover:bg-slate-100 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-1 hover:bg-slate-100 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button className="p-1 hover:bg-slate-100 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="container-app max-w-5xl py-6 space-y-6">
        {/* 2. Main Title */}
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Cari Laundry
        </h1>

        {/* 3. Address Delivery Selector */}
        <div className="bg-slate-100/80 rounded-xl p-3 flex items-center justify-between border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#00667e] shadow-sm">
              📍
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">ANTAR KE</p>
              <p className="text-xs font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                {selectedAddress}
              </p>
            </div>
          </div>
          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* 4. Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for partners, services..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00667e]/30 shadow-sm"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </form>

        {/* 5. Active Orders Section */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">Active Orders</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            <div className="min-w-[260px] bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#00667e] text-white flex items-center justify-center text-lg">
                    🧺
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Wash & Fold</p>
                    <p className="text-[11px] text-slate-500 font-medium">Order #1024</p>
                  </div>
                </div>
                <span className="bg-[#00667e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  In Progress
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-600">
                  <span>Washing</span>
                  <span>Est. 2PM</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00667e] h-full w-2/3 rounded-full" />
                </div>
              </div>
            </div>

            <div className="min-w-[140px] bg-slate-100/50 border border-slate-200/60 rounded-2xl p-4 flex flex-col justify-center items-center text-center opacity-70">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm mb-1">
                👔
              </div>
              <p className="text-xs font-bold text-slate-700">Dry Clean</p>
              <p className="text-[10px] text-slate-500">Awaiting Pick</p>
            </div>
          </div>
        </div>

        {/* 6. Quick Categories Circular Buttons */}
        <div className="flex flex-wrap justify-between items-center gap-2 px-1 pt-1">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-1.5 cursor-pointer group min-w-[60px]">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition transform group-hover:scale-105 shadow-sm ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-[11px] font-semibold text-slate-700">{cat.name}</span>
            </div>
          ))}
        </div>

        {/* 7. Promo Banner Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00667e] to-[#008ba8] p-6 text-white shadow-md">
          <span className="bg-white/20 backdrop-blur text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
            PENGGUNA BARU
          </span>
          <h3 className="text-xl font-black mt-2 leading-snug">
            Diskon 50% Pertama
          </h3>
          <p className="text-xs text-white/80 mt-1 max-w-sm">
            Klaim voucher sekarang untuk cucian pertama yang bersih & segar.
          </p>
        </div>

        {/* 8. Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['Terdekat', '⭐ Rating 4.5+', 'Termurah', 'Express'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                activeFilter === filter
                  ? 'bg-[#00667e] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 9. Recommendations Section */}
        <div className="space-y-4 pt-1">
          <h2 className="text-lg font-bold text-slate-900">Rekomendasi Untukmu</h2>

          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">Memuat data laundry...</div>
          ) : laundries.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">Tidak ada laundry ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {laundries.map((laundry) => (
                <div key={laundry.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  {/* Card Image */}
                  <div className="relative h-48 bg-slate-200">
                    <img
                      src={laundry.image_url}
                      alt={laundry.business_name}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge Top Left */}
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      ✓ {laundry.badge}
                    </span>
                    {/* Heart Favorite Top Right */}
                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-700 hover:bg-white shadow-sm">
                      ♡
                    </button>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-base text-slate-900">{laundry.business_name}</h3>
                        <div className="bg-amber-50 text-amber-700 text-xs font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                          ⭐ {laundry.rating?.toFixed(1)}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        📍 {laundry.distance}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MULAI DARI</p>
                        <p className="text-sm font-extrabold text-[#00667e]">
                          Rp {laundry.min_price?.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">/kg</span>
                        </p>
                      </div>
                      <Link
                        to={`/laundries/${laundry.id}`}
                        className="bg-[#00667e] hover:bg-[#005266] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
                      >
                        Pesan
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 10. Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-4 py-2 flex justify-around items-center z-30 shadow-lg">
        <button className="flex flex-col items-center gap-0.5 text-[#00667e]">
          <div className="w-10 h-7 rounded-full bg-sky-100 flex items-center justify-center text-base">
            🏠
          </div>
          <span className="text-[10px] font-bold">Home</span>
        </button>
        <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700">
          <span className="text-lg">📑</span>
          <span className="text-[10px] font-semibold">Orders</span>
        </button>
        <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700">
          <span className="text-lg">🕒</span>
          <span className="text-[10px] font-semibold">History</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-700">
          <span className="text-lg">👤</span>
          <span className="text-[10px] font-semibold">Account</span>
        </button>
      </nav>
    </div>
  )
}
