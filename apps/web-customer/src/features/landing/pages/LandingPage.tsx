import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { FadeIn, AnimateOnView, Stagger } from '../../../shared/components/motion'

const STEPS = [
  {
    num: '01',
    title: 'Pesan Online',
    desc: 'Pilih layanan dan jadwalkan penjemputan langsung dari aplikasi.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Kami Jemput',
    desc: 'Kurir menjemput pakaian Anda sesuai jadwal yang ditentukan.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2.81A2 2 0 0 1 20 8v8a2 2 0 0 1-2 2h-2" />
        <path d="M14 2l4 4-4 4" />
        <path d="M10 22V18" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Antar ke Anda',
    desc: 'Pakaian bersih diantar tepat waktu dengan bukti penimbangan.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
]

const PLANS = [
  {
    name: 'Kiloan',
    price: '8.000',
    unit: '/kg',
    desc: 'Cuci kering per kilogram.',
    features: ['Minimal 2 kg', 'Cuci kering setrika', 'Pengeringan 24 jam'],
    cta: 'Pilih Kiloan',
    featured: false,
  },
  {
    name: 'Satuan',
    price: '15.000',
    unit: '/item',
    desc: 'Per item baju, celana, jaket.',
    features: ['Per item pakaian', 'Cuci kering setrika', 'Harga tetap per item'],
    cta: 'Pilih Satuan',
    featured: true,
  },
  {
    name: 'Express',
    price: '15.000',
    unit: '/kg',
    desc: 'Selesai dalam 4 jam.',
    features: ['Minimal 3 kg', 'Prioritas tinggi', 'Selesai 4 jam'],
    cta: 'Pilih Express',
    featured: false,
  },
]

const FEATURES = [
  {
    title: 'Pelacakan Real-time',
    desc: 'Lihat status pesanan Anda dari penjemputan sampai pengantaran secara langsung.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 22c-4.97 0-9-2.24-9-5v-4m18 4c0-2.76-4.03-5-9-5s-9 2.24-9 5" />
        <circle cx="12" cy="7" r="4" />
        <path d="M3 5v4m18-4v4" />
      </svg>
    ),
  },
  {
    title: 'Harga Transparan',
    desc: 'Tidak ada biaya tersembunyi. Harga jelas sebelum Anda memesan.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v12M8 10h8M9 14h6" />
      </svg>
    ),
  },
  {
    title: 'Bukti Penimbangan',
    desc: 'Setiap pesanan disertai foto bukti berat pakaian Anda.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 21H5a2 2 0 0 1-2-2v-1a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v1a2 2 0 0 1-2 2Z" />
        <path d="M12 10v4" />
      </svg>
    ),
  },
  {
    title: 'Aman & Terpercaya',
    desc: 'Pakaian Anda ditangani oleh mitra terverifikasi dan diasuransikan.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-10 border-b border-outline-variant/40 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="container-app flex h-16 items-center justify-between">
          <Brand size="sm" to="/" />
          <nav className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost h-10 px-3 text-sm">
              Masuk
            </Link>
            <Link to="/register" className="btn-primary h-10 rounded-[--radius-sm] px-4 text-sm">
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-28 lg:pb-32 lg:pt-36">
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <FadeIn delay={0}>
            <span className="hero-badge mb-6 inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Terverifikasi &amp; Transparan
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
              Laundry yang bisa dipercaya, dari awal sampai antar.
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="mx-auto mt-5 text-base text-white/80 sm:text-lg lg:max-w-2xl">
              Pesan jasa laundry secara online, lacak prosesnya secara real-time, dan dapatkan bukti penimbangan di setiap pesanan.
            </p>
          </FadeIn>
          <FadeIn delay={240}>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary h-12 rounded-[--radius-sm] bg-white px-8 text-primary hover:bg-white/90">
                Mulai Sekarang
              </Link>
              <a href="#cara-kerja" className="btn-ghost h-12 !text-white/80 hover:!text-white hover:!bg-white/10">
                Lihat Cara Kerja
              </a>
            </div>
          </FadeIn>
        </div>
        {/* decorative bg circles */}
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-white/5" />
      </section>

      {/* ── Cara Kerja ── */}
      <section id="cara-kerja" className="bg-surface-container py-16 sm:py-20 lg:py-24">
        <div className="container-app">
          <AnimateOnView className="text-center">
            <span className="badge-active mb-4">Cara Kerja</span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Tiga langkah mudah
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
              Mulai dari pemesanan sampai pakaian bersih diantar ke rumah Anda.
            </p>
          </AnimateOnView>

          <Stagger className="mt-12 grid gap-8 sm:grid-cols-3" stagger={100}>
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[--radius-lg] bg-primary/10 text-primary">
                  {step.icon}
                </div>
                <span className="mb-1 block font-display text-xs font-bold tracking-widest text-primary/60">
                  LANGKAH {step.num}
                </span>
                <h3 className="font-display text-xl font-bold text-on-surface">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{step.desc}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Harga Layanan ── */}
      <section id="harga" className="py-16 sm:py-20 lg:py-24">
        <div className="container-app">
          <AnimateOnView className="text-center">
            <span className="badge-active mb-4">Harga</span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Pilih paket yang sesuai
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
              Harga transparan tanpa biaya tersembunyi.
            </p>
          </AnimateOnView>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-3 sm:gap-8" stagger={100}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`card-lifted flex h-full flex-col p-6 sm:p-8 ${
                  plan.featured
                    ? 'ring-2 ring-primary shadow-[0px_4px_20px_rgba(14,116,144,0.15)]'
                    : ''
                }`}
              >
                {plan.featured && (
                  <span className="badge-active mb-4 w-fit">Paling Populer</span>
                )}
                <h3 className="font-display text-lg font-bold text-on-surface">{plan.name}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{plan.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-sm font-semibold text-on-surface-variant">Rp</span>
                  <span className="font-display text-4xl font-extrabold text-primary">{plan.price}</span>
                  <span className="text-sm text-on-surface-variant">{plan.unit}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-on-surface">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`mt-6 block text-center ${
                    plan.featured ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Keunggulan ── */}
      <section id="keunggulan" className="bg-surface-container py-16 sm:py-20 lg:py-24">
        <div className="container-app">
          <AnimateOnView className="text-center">
            <span className="badge-active mb-4">Keunggulan</span>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
              Mengapa Laundrie?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-on-surface-variant">
              Kami memastikan setiap pesanan ditangani dengan transparan dan akuntabel.
            </p>
          </AnimateOnView>

          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={80}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card h-full p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[--radius-md] bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold text-on-surface">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">{f.desc}</p>
              </div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── CTA Akhir ── */}
      <section className="bg-primary py-16 sm:py-20 lg:py-24">
        <AnimateOnView className="container-app mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Siap mencoba Laundrie?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Daftar sekarang dan nikmati laundry transparan tanpa khawatir.
          </p>
          <Link
            to="/register"
            className="btn-primary mt-8 inline-flex h-12 rounded-[--radius-sm] bg-white px-8 text-primary hover:bg-white/90"
          >
            Daftar Gratis
          </Link>
        </AnimateOnView>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-outline-variant/40 bg-white py-8">
        <div className="container-app flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Brand size="sm" to="/" />
          <p className="text-xs text-on-surface-variant">
            &copy; {new Date().getFullYear()} Laundrie &middot; Bersih, transparan, terverifikasi.
          </p>
        </div>
      </footer>
    </div>
  )
}
