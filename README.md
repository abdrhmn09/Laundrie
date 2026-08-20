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
│   ├── web/                         → React + TS + Vite PWA (customer/partner/courier UI)
│   │   ├── src/features/            → auth, customer, partner, courier, orders,
│   │   │                              weighing, evidence, invoices
│   │   └── src/shared/              → komponen & util bersama
│   └── api/                         → Laravel 13 modular monolith
│       ├── app/Domain/              → Auth, Customer, Partner, Courier, Order,
│       │                              Pricing, Weighing, Evidence, Payment,
│       │                              Invoice, Notification, Complaint,
│       │                              Settlement, Admin
│       ├── routes/
│       └── tests/
├── infrastructure/
│   ├── docker/
│   └── nginx/
├── docs/
│   ├── architecture/architecture.md ← dokumen arsitektur (ini sumber utama)
│   ├── api/
│   └── operations/
├── DESIGN.md                        ← design system (Stitch) & token visual
└── README.md
```

## Dokumentasi

| Dokumen | Lokasi |
|---|---|
| Arsitektur | `docs/architecture/architecture.md` |
| Design system | `DESIGN.md` (sumber: Stitch `assets/12460762412709776271`) |
| PRD | `docs/laundrie-prd-v2-id.md` |

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
- **Fitur Autentikasi (Web)** — React + TS + Vite + Tailwind di `apps/web`
  - Halaman login, registrasi, dan dashboard terlindungi
  - Integrasi API via proxy dev Vite, token di `localStorage`
  - **5 tes E2E Playwright lulus** (registrasi, login sukses/gagal, logout, proteksi route).

### Menjalankan Pengujian

```bash
# API (perlu MySQL di 127.0.0.1:3307, DB `laundrie`/`laundrie_test`)
cd apps/api && php artisan test

# Web (perlu API berjalan di :8000 dan dev server web di :5173)
cd apps/web && npm run dev &     # web
cd apps/api && php artisan serve --host=127.0.0.1 --port=8000 &
cd apps/web && npm run test:e2e   # Playwright
```
