import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'

export default function Placeholder() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
        </div>
      </header>
      <main className="container-app py-12 text-center">
        <h1 className="font-display text-2xl font-extrabold">Laundry Detail & Catalog</h1>
        <p className="text-sm text-on-surface-variant mt-2">web-customer • Design §53 — coming soon</p>
      </main>
    </div>
  )
}
