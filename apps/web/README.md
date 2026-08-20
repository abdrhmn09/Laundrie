# Laundrie Web

Frontend Laundrie berbasis React + TypeScript + Vite + Tailwind CSS v4.

## Fitur Saat Ini

- **Autentikasi** (Satu halaman aplikasi)
  - Halaman Registrasi (`/register`) — nama, email, nomor WhatsApp, password
  - Halaman Login (`/login`) — email + password
  - Dashboard (`/` atau `/dashboard`) — halaman yang dilindungi, menampilkan profil pengguna
  - Logout — mencabut token di server dan menghapus sesi lokal

## Struktur

```
src/
├── features/
│   └── auth/
│       ├── api/authApi.ts          # klien API + penyimpanan token
│       ├── context/AuthContext.tsx # state autentikasi global
│       ├── components/ProtectedRoute.tsx
│       └── pages/
│           ├── LoginPage.tsx
│           ├── RegisterPage.tsx
│           └── DashboardPage.tsx
├── App.tsx                         # routing
├── index.css                       # tema Tailwind (design system)
└── main.tsx
```

## Menjalankan

```bash
npm install
npm run dev        # http://127.0.0.1:5173 (proxy /api -> http://127.0.0.1:8000)
npm run build      # kompilasi + build produksi
npm run lint       # oxlint
```

## Tes End-to-End (Playwright)

Pastikan API berjalan di `http://127.0.0.1:8000` dan dev server web berjalan di `http://127.0.0.1:5173`:

```bash
npx playwright install chromium
npm run test:e2e
```

Skenario yang diuji:

1. Halaman login menampilkan form.
2. Registrasi pengguna baru berhasil dan masuk ke dashboard.
3. Login gagal dengan password salah menampilkan pesan error.
4. Alur lengkap: register → logout → login → dashboard.
5. Akses halaman utama tanpa login dialihkan ke `/login`.

## Integrasi API

Web berkomunikasi dengan API Laravel melalui proxy dev Vite:

- `POST /api/v1/auth/register` — mendaftarkan pengguna
- `POST /api/v1/auth/login` — masuk dan mendapatkan token Sanctum
- `POST /api/v1/auth/logout` — mencabut token (Bearer)
- `GET /api/v1/auth/me` — mengambil data pengguna terautentikasi

Token disimpan di `localStorage` dengan kunci `laundrie_token`.