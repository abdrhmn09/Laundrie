import { type ReactNode } from 'react'
import { Brand } from '../../../shared/components/Brand'
import { FadeIn, SlideIn, Stagger } from '../../../shared/components/motion'

const TRUST_POINTS = [
  'Setiap pesanan disertai bukti penimbangan.',
  'Harga transparan dan bisa diaudit.',
  'Pelacakan real-time dari penjemputan sampai antar.',
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-1/2 flex-col justify-between bg-primary p-10 lg:flex">
        <SlideIn from="left" delay={0}>
          <Brand size="md" />
        </SlideIn>

        <SlideIn from="left" delay={100} className="max-w-[28rem]">
          <span className="badge-active mb-5 inline-flex items-center gap-1.5 !bg-white/15 !text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Terverifikasi & Transparan
          </span>
          <p className="font-display text-4xl font-extrabold leading-tight text-on-primary">
            Laundry yang bisa dipercaya, dari awal sampai antar.
          </p>
          <Stagger as="ul" className="mt-6 space-y-3" delay={200} stagger={80}>
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-primary-container/90">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                <span className="text-base leading-relaxed">{point}</span>
              </li>
            ))}
          </Stagger>
        </SlideIn>

        <FadeIn delay={400}>
          <p className="text-sm text-primary-container/70">
            © 2026 Laundrie · Bersih, transparan, terverifikasi.
          </p>
        </FadeIn>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <FadeIn direction="up" delay={150} className="w-full max-w-[28rem]">
          <div className="mb-8 lg:hidden">
            <Brand size="md" />
          </div>
          {children}
        </FadeIn>
      </main>
    </div>
  )
}
