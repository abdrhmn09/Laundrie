import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { FadeIn, Stagger } from '../../../shared/components/motion'
import { staffApi, type StaffOpening } from '../api/staffApi'

export default function StaffDiscoveryPage() {
  const [openings, setOpenings] = useState<StaffOpening[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [applyingId, setApplyingId] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const res = await staffApi.listOpenings()
        if (!cancelled) setOpenings(res.data ?? [])
      } catch (e: unknown) {
        const err = e as { message?: string }
        if (!cancelled) setError(err.message ?? 'Gagal memuat lowongan.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [])

  const handleApply = async (openingId: number, type: 'staff' | 'staff_courier') => {
    setApplyingId(openingId)
    setError(null)
    setMsg(null)
    try {
      const res = await staffApi.apply(openingId, { application_type: type })
      setMsg(res.message)
    } catch (e: unknown) {
      const err = e as { message?: string; errors?: Record<string, string[]> }
      setError(err.errors ? Object.values(err.errors).flat().join(', ') : err.message ?? 'Gagal melamar.')
    } finally {
      setApplyingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/profile" className="btn-ghost !h-10">Kembali</Link>
        </div>
      </header>

      <main className="container-app py-8 max-w-3xl">
        <FadeIn delay={100}>
          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-on-surface">Gabung sebagai Staff</h1>
            <p className="mt-1 text-sm text-on-surface-variant">PRD §9 — Temukan lowongan OPEN dan kirim lamaran. Staff hanya dibuat setelah ACCEPTED (Rule §54).</p>
          </div>
        </FadeIn>

        {loading && <div className="card p-6 text-center text-sm text-on-surface-variant">Memuat lowongan OPEN…</div>}
        {error && <div className="rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container mb-4">{error}</div>}
        {msg && <div className="rounded-[--radius-md] bg-status-success-container p-3 text-sm text-status-success mb-4">{msg}<br /><span className="text-xs">Setelah Manager ACCEPTED Anda otomatis menjadi Staff dan dapat membuka <a href="http://127.0.0.1:5175" className="underline font-bold">web-staff</a>.</span></div>}

        {!loading && openings.length === 0 && !error && (
          <div className="card p-6 text-center">
            <p className="font-display font-bold">Belum ada lowongan OPEN</p>
            <p className="text-sm text-on-surface-variant">Manager belum membuka lowongan. Cek kembali nanti atau hubungi laundry langsung.</p>
          </div>
        )}

        <Stagger className="grid gap-4" stagger={80}>
          {openings.map((o) => (
            <div key={o.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-display text-base font-bold text-on-surface">{o.laundry.business_name}</p>
                <p className="text-sm text-on-surface-variant">{o.title}</p>
                <p className="text-xs text-on-surface-variant mt-1">Quota: {o.quota} • Status: <span className="badge-success">OPEN</span></p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleApply(o.id, 'staff')} disabled={applyingId === o.id} className="btn-primary !h-9 !px-4 text-xs">
                  {applyingId === o.id ? 'Mengirim…' : 'Lamar Staff'}
                </button>
                <button onClick={() => handleApply(o.id, 'staff_courier')} disabled={applyingId === o.id} className="btn-secondary !h-9 !px-3 text-xs">Staff + Courier</button>
              </div>
            </div>
          ))}
        </Stagger>

        <div className="mt-8 card p-4 bg-primary-container/30">
          <p className="text-xs font-semibold text-on-primary-container">Catatan PRD §9.3</p>
          <p className="text-xs text-on-surface-variant mt-1">Lowongan dengan <span className="font-bold">status = OPEN</span> adalah sumber eksplisit. Indikasi kebutuhan staff tambahan berasal dari endpoint agregat, bukan status laundry. Frontend tidak boleh menebak jumlah staff (Design §36.4).</p>
        </div>
      </main>
    </div>
  )
}
