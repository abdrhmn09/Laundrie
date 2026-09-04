import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Brand } from './Brand'
import { useAuth } from '../../features/auth/context/AuthContext'

type NavItem = {
  href: string
  icon: string
  label: string
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard',              icon: '🏠', label: 'Dashboard' },
  { href: '/verifications',          icon: '📋', label: 'Verifikasi Dokumen' },
  { href: '/complaints',             icon: '⚖️', label: 'Arbitrase Komplain' },
  { href: '/settlements',            icon: '💳', label: 'Settlement & Payout' },
  { href: '/orders',                 icon: '📦', label: 'Override Order' },
  { href: '/audit-logs',             icon: '🔒', label: 'Audit Trail' },
  { href: '/platform-config',        icon: '⚙️', label: 'Platform Config' },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex font-sans">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#0d1b2a] text-white flex flex-col sticky top-0 h-screen">
        <div className="px-4 pt-5 pb-4 border-b border-white/10">
          <Brand size="sm" className="invert" />
          <p className="text-[10px] text-slate-400 mt-1 font-semibold tracking-widest uppercase">Admin Console</p>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-white/10 text-white border-r-2 border-[#00b4d8]'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 space-y-1">
          <p className="text-[10px] text-slate-400 font-semibold truncate">{user?.email}</p>
          <button
            onClick={() => logout()}
            className="w-full text-left text-xs text-red-400 hover:text-red-300 font-semibold transition"
          >
            Keluar ↗
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
