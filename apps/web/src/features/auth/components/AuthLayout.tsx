import { type ReactNode } from 'react'
import { Brand } from '../../../shared/components/Brand'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-1/2 flex-col justify-between bg-primary p-10 lg:flex">
        <Brand size="md" />
        <div className="max-w-md">
          <p className="font-display text-4xl font-extrabold leading-tight text-on-primary">
            Laundry yang bisa dipercaya, dari awal sampai antar.
          </p>
          <p className="mt-4 text-base leading-relaxed text-primary-container/90">
            Setiap pesanan disertai bukti penimbangan yang transparan dan harga yang bisa diaudit.
          </p>
        </div>
        <p className="text-sm text-primary-container/70">
          © 2026 Laundrie · Bersih, transparan, terverifikasi.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand size="md" />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}