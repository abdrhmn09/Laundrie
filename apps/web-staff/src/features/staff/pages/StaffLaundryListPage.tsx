import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { FadeIn, Stagger } from '../../../shared/components/motion'
import { getToken } from '../../auth/api/authApi'

type Opening = { id: number; laundry: { id: number; business_name: string; address_line: string }; title: string; quota: number; status: string }

export default function StaffLaundryListPage() {
  const navigate = useNavigate()
  const [openings, setOpenings] = useState<Opening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const token = getToken()
        const headers: Record<string, string> = { Accept: 'application/json' }
        if (token) headers.Authorization = `Bearer ${token}`
        const res = await fetch('/api/v1/staff-openings', { headers })
        const data = await res.json().catch(() => null)
        if (!res.ok) throw new Error(data?.message ?? 'Gagal memuat daftar laundry.')
        if (!cancelled) setOpenings(data?.data ?? [])
      } catch (e: unknown) {
        const err = e as Error
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/register" className="btn-ghost !h-10">Kembali Daftar</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-3xl">
        <FadeIn delay={100}>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-on-surface">Daftar Laundry — Lowongan Staff</h1>
            <p className="mt-1 text-sm text-on-surface-variant">Pilih laundry dengan lowongan <span className="font-bold">OPEN</span> untuk mengajukan lamaran. Setelah memilih, Anda akan diminta mengunggah KTP (wajib) dan memilih tipe lamaran.</p>
          </div>
        </FadeIn>

        {loading && <div className="card p-6 text-center text-sm text-on-surface-variant">Memuat daftar laundry…</div>}
        {error && <div className="rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container mb-4">{error}</div>}

        {!loading && openings.length === 0 && !error && (
          <div className="card p-6 text-center">
            <p className="font-display font-bold">Belum ada laundry membuka lowongan</p>
            <p className="text-sm text-on-surface-variant">Cek kembali nanti atau hubungi laundry langsung.</p>
          </div>
        )}

        <Stagger className="grid gap-4" stagger={80}>
          {openings.map((o) => (
            <div key={o.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-display text-base font-bold text-on-surface">{o.laundry.business_name}</p>
                <p className="text-xs text-on-surface-variant">{o.laundry.address_line}</p>
                <p className="text-sm text-on-surface-variant mt-1">{o.title} • Quota {o.quota} • <span className="badge-success">OPEN</span></p>
              </div>
              <button onClick={() => navigate(`/register?openingId=${o.id}`)} className="btn-primary !h-9 !px-4 text-xs">Lamar di sini</button>
            </div>
          ))}
        </Stagger>

        <div className="mt-8 card p-4 bg-primary-container/30">
          <p className="text-xs font-semibold text-on-primary-container">Catatan PRD §9.3</p>
          <p className="text-xs text-on-surface-variant mt-1">Hanya lowongan <span className="font-bold">OPEN</span> yang ditampilkan. Staff hanya dibuat setelah Manager <span className="font-bold">ACCEPTED</span>.</p>
        </div>
      </main>
    </div>
  )
}
