# Laundrie

Penjemputan, Pengantaran & Marketplace Laundry — dengan verifikasi berat transparan (bukti penimbangan immutable) dan penetapan harga yang dapat diaudit.

## Arsitektur

- **Modular Monolith** — satu backend Laravel 13 / PHP 8.3+ yang diorganisasi per-domain.
- **PostgreSQL** sebagai source of truth.
- **Redis** untuk queue, cache, dan lock (bukan sumber kebenaran bisnis).
- **Object storage S3-compatible** untuk bukti, invoice, dan dokumen.
- Frontend **React + TypeScript + Vite** (PWA mobile-first) untuk customer, partner, dan courier.

## Struktur Repository

```
laundrie/
├── apps/
│   ├── web-customer/                → Customer PWA (PRD §6.1) — pencarian, order, tracking
│   ├── web-manager/                 → Manager Dashboard (PRD §6.1)
│   ├── web-staff/                   → Staff Operational PWA
│   ├── web-courier/                 → Courier PWA (pickup/delivery)
│   ├── web-admin/                   → Admin Portal (11 screen Design.md §28)
│   │   ├── src/features/            → auth, landing, customer, laundry, courier, orders,
│   │   │                              weighing, evidence, invoices
│   │   └── src/shared/              → komponen & util bersama (motion, Brand, Field)
│   └── api/                         → Laravel 13 modular monolith
│       ├── app/Domain/              → Auth, Customer, Laundry, Courier, Order,
│       │                              Pricing, Weighing, Evidence, Payment,
│       │                              Invoice, Notification, Complaint,
│       │                              Settlement, Admin
│       ├── routes/
│       └── tests/
├── infrastructure/
│   ├── docker/
│   │   └── docker-compose.yml    → Postgres 16 + Redis 7 + MySQL transisi (name: laundrie)
│   ├── docker-compose.yml        → symlink/duplikat untuk `docker compose -f infrastructure/docker-compose.yml up -d`
│   └── nginx/
├── docs/                            → living docs (single source of truth)
│   ├── PRD.md
│   ├── Architecture.md
│   ├── Design.md
│   ├── Schema.md
│   └── Rule.md
└── README.md
```

## Dokumentasi

| Dokumen | Lokasi | Sumber |
|---|---|---|
| PRD | `docs/PRD.md` (v3.3) | Business goals & UX |
| Arsitektur | `docs/Architecture.md` (v2.2) | State machine, domain, API |
| Schema | `docs/Schema.md` (v1.1) | Kolom/tabel — sumber tunggal |
| Design | `docs/Design.md` (v3.3) | Layar, token, komponen |
| Rules | `docs/Rule.md` (v1.1) | Larangan & konvensi AI/engineering |

## Status

### Selesai

- Scaffold struktur direktori sesuai dokumen arsitektur (Bagian 19).
- **Fitur Autentikasi (API)** — Laravel 13 + Sanctum di `apps/api`
  - `POST /api/v1/auth/register` — daftar pengguna (customer/staff/courier/admin)
  - `POST /api/v1/auth/login` — masuk, token Bearer dengan kemampuan per-role
  - `POST /api/v1/auth/logout` — mencabut token
  - `GET /api/v1/auth/me` — profil pengguna terautentikasi
  - Rate limiting login (5 percobaan/menit per IP), pengecekan status akun (aktif/suspended/pending)
  - **19 tes feature lulus** (76 assertions) via PHPUnit (MySQL `laundrie_test`).
- **Fitur Autentikasi (Web)** — React + TS + Vite + Tailwind di `apps/web-customer`
  - Halaman login, registrasi, dashboard terlindungi + landing page dengan motion reusable (`FadeIn`, `SlideIn`, `Stagger`, `AnimateOnView`)
  - Integrasi API via proxy dev Vite, token di `localStorage`
  - **5 tes E2E Playwright lulus** (registrasi, login sukses/gagal, logout, proteksi route).

### Menjalankan Infra (Postgres + Redis per Architecture.md:4,14)

```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d   # atau -f infrastructure/docker-compose.yml
docker ps | grep laundrie
```

### Menjalankan Pengujian

```bash
# API (perlu Postgres di 127.0.0.1:5432 + Redis di 6379, DB `laundrie`/`laundrie_test`)
cd apps/api && php artisan migrate:fresh --seed
cd apps/api && php artisan test
# Horizon (queue redis)
php artisan horizon

# Web Customer (perlu API di :8000 dan dev server di :5173)
cd apps/web-customer && npm run dev &     # web-customer :5173
cd apps/api && php artisan serve --host=127.0.0.1 --port=8000 &
cd apps/web-customer && npm run test:e2e   # Playwright
# 5 app: 5173 customer, 5174 manager, 5175 staff, 5176 courier, 5177 admin
```
