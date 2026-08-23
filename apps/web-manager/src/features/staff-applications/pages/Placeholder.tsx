import { Link } from 'react-router-dom'
export default function Placeholder() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><div className="container-app py-3 flex justify-between"><span className="font-display font-bold">web-manager • Staff Application Review</span><Link to="/" className="btn-ghost">Home</Link></div></header>
      <main className="container-app py-12 text-center"><h1 className="font-display text-2xl font-extrabold">Staff Application Review</h1><p className="text-sm text-on-surface-variant mt-2">Design §53 • Manager Dashboard</p></main>
    </div>
  )
}
