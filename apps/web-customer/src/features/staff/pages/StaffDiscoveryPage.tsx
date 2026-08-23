import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { FadeIn, Stagger } from '../../../shared/components/motion'

// Mock discovery data — real data from GET /api/v1/staff-openings + agregasi kebutuhan (PRD §9.3, Design §36)
const MOCK_OPENINGS = [
  { id: 1, laundry: 'Laundrie Express Peudada', title: 'Staff Laundry', status: 'OPEN', needsCourier: false, quota: 2 },
  { id: 2, laundry: 'CleanWash Banda Aceh', title: 'Staff + Courier', status: 'OPEN', needsCourier: true, quota: 1 },
  { id: 3, laundry: 'Laundry Kilat Darussalam', title: 'Staff Laundry', status: 'OPEN', needsCourier: true, quota: 3 },
]

export default function StaffDiscoveryPage() {
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

        <Stagger className="grid gap-4" stagger={80}>
          {MOCK_OPENINGS.map((o) => (
            <div key={o.id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-display text-base font-bold text-on-surface">{o.laundry}</p>
                <p className="text-sm text-on-surface-variant">{o.title} {o.needsCourier && <span className="badge-active ml-2">Membutuhkan Courier</span>}</p>
                <p className="text-xs text-on-surface-variant mt-1">Quota: {o.quota} • Status: <span className="badge-success">OPEN</span></p>
              </div>
              <div className="flex gap-2">
                <Link to={`/profile/staff/apply/${o.id}?type=staff`} className="btn-primary !h-9 !px-4 text-xs">Lamar Staff</Link>
                {o.needsCourier && <Link to={`/profile/staff/apply/${o.id}?type=staff_courier`} className="btn-secondary !h-9 !px-3 text-xs">Staff + Courier</Link>}
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
