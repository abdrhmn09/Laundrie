# DESIGN — Laundrie

| | |
|---|---|
| **Sumber** | Laundrie Design System (Stitch, `assets/12460762412709776271`) |
| **Stitch project** | `projects/9094307253132854664` |
| **Gaya** | Clean Fresh / Friendly Utility — bersih, cerah, mobile-first |
| **Terakhir diperbarui** | 20 Agustus 2026 |

Dokumen ini adalah **single source of truth visual** untuk seluruh permukaan UI (customer PWA, partner & courier web app, admin console). Nilai-nilai di sini bersumber dari design system yang dikelola di Stitch — jika berubah di Stitch, dokumen ini harus diperbarui. Dokumen ini melengkapi `docs/architecture/architecture.md` (arsitektur) dan PRD (apa yang dibangun) dengan **bagaimana tampilannya**.

---

## 1. Prinsip Desain

1. **Trust terlihat.** Bukti berat, status verified, dan audit tidak hanya ada di belakang layar — harus terlihat sebagai elemen visual yang meyakinkan (badge, bingkai bukti, step indicator).
2. **Mobile-first.** Checkout pelanggan, layar penimbangan staf, dan alur kurir adalah tiga layar paling kritis (PRD §121) — dirancang untuk HP, satu tangan, minim mengetik.
3. **Bersih, bukan klinis.** Banyak ruang putih, warna air yang cerah, dan radius lembut. Tidak boleh terasa dingin seperti rumah sakit, juga tidak ramai seperti pasar.
4. **Server adalah otoritas visual.** Status/warna yang ditampilkan selalu diturunkan dari state server (endpoint), bukan keputusan lokal di client.
5. **Angka penting, besar.** Berat (KG) dan harga (Rp) selalu ditonjolkan secara tipografis.

---

## 2. Design Tokens

### 2.1 Warna (Light mode)

| Token | Hex | Pemakaian |
|---|---|---|
| `primary` | `#0E7490` | Aksi utama, link aktif, status verified/active, fokus |
| `on-primary` | `#FFFFFF` | Teks di atas primary |
| `primary-container` | `#C5EAF4` | Latar elemen aksi sekunder (chip, outline state) |
| `on-primary-container` | `#004E63` | Teks di atas primary-container |
| `secondary` | `#4A636C` | Teks sekunder, border, ikon pasif |
| `secondary-container` | `#CDE7F1` | Latar kartu pasif / read-only |
| `tertiary` | `#5B5F0E` | Aksen sukses/settlement, info khusus |
| `error` | `#BA1A1A` | Error, dispute, kegagalan |
| `error-container` | `#FFDAD6` | Latar alert/error ringan |
| `surface` | `#FAFDFF` | Latar aplikasi |
| `surface-container` | `#F0F9FC` | Latar kartu (blue-tinted, bukan abu-abu) |
| `on-surface` | `#181C1E` | Teks utama |
| `surface-variant` | `#DBE4E8` | Latar tersier / field |
| `on-surface-variant` | `#3F484D` | Teks sekunder di atas surface-variant |
| `outline` | `#6F797E` | Border utama |
| `outline-variant` | `#BFC8CC` | Border ringan / divider |
| `background` | `#FFFFFF` | Background dasar halaman |

**Status semantik** (dipakai pada badge/pill): sukses/verified = hijau, review/warning = kuning, dispute/error = merah, active = teal (`primary`). Detail shade disesuaikan per komponen namun harus tetap dapat dibedakan dari token fungsional di atas.

### 2.2 Tipografi

Strategi dual-font: **Plus Jakarta Sans** untuk headline & angka besar, **Inter** untuk body & UI.

| Level | Font | Ukuran / Weight / Line-height | Pemakaian |
|---|---|---|---|
| `display-lg` | Plus Jakarta Sans | 56px / 800 / 64px, `-0.02em` | Halaman status besar, empty state |
| `headline-lg` | Plus Jakarta Sans | 32px / 700 / 40px | Judul halaman |
| `headline-md` | Plus Jakarta Sans | 24px / 700 / 32px | Judul kartu / seksi |
| `headline-sm` | Plus Jakarta Sans | 20px / 700 / 28px | Judul item, angka harga pada kartu |
| `body-lg` | Inter | 16px / 400 / 24px | Teks paragraf utama |
| `body-md` | Inter | 14px / 400 / 20px | Teks operasional, deskripsi |
| `label-lg` | Inter | 14px / 600 / 20px | Label tombol, nav |
| `label-md` | Inter | 12px / 600 / 16px, `0.03em` | Label field, badge, keterangan kecil |

Aturan: angka berat (`4.60 KG`) dan harga (`Rp48.800`) memakai Plus Jakarta Sans dengan weight 700+ dan ukuran satu tingkat di atas teks di sekitarnya. Invoice memakai angka tabular (tabular-nums) agar kolom rapi.

### 2.3 Bentuk (Roundness)

| Token | Radius | Pemakaian |
|---|---|---|
| `sm` | 8px | Chip kecil, ikon dalam container |
| `md` / `DEFAULT` | 12px | Kartu, input, tombol utama |
| `lg` | 16px | Kartu besar, sheet |
| `xl` | 24px | Modal/bottom sheet, panel besar |
| `full` | pill | Badge status, chip, avatar |

### 2.4 Spacing

Baseline **8px**; grid mobile-first.

| Token | Nilai |
|---|---|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `section-gap` | 48px |
| `margin-mobile` | 16px (margin tepi HP) |
| `container-max-width` | 1120px (desktop) |

### 2.5 Elevation

Hindari shadow keras. Gunakan **tonal layering**:
- Level 0: background putih polos.
- Level 1 (kartu/input): `surface-container` `#F0F9FC` + border 1px `#E1EEF3`; kartu penting boleh shadow lembut `0px 4px 12px, rgba(0,0,0,0.06)`.
- Level 2 (modal/bottom sheet): putih penuh + shadow `0 0 20px, rgba(0,0,0,0.10)`, radius besar.

---

## 3. Komponen Kunci

### 3.1 Buttons
- **Primary:** `primary` solid, teks `on-primary`, radius 12px, weight 700, tinggi minimum 48px (area tap ramah jari).
- **Secondary:** outline `primary` atau `primary-container`, teks `on-primary-container`.
- **Disabled:** `surface-variant` dengan teks `on-surface-variant` pada 60% opacity.
- Tombol aksi operasional (mis. "TAKE SCALE PHOTO", "CONFIRM WEIGHT") full-width di bagian bawah layar HP.

### 3.2 Status Badges
Pill (`full`) kecil berisi label status. Warna mengikuti status semantik: `VERIFIED` (hijau), `REVIEW` (kuning), `DISPUTE` (merah), `ACTIVE` (teal). Dipakai konsisten di kartu pesanan, daftar, dan detail.

### 3.3 Order / Weight Card
Menampilkan: order number (`LDR-2026-000183`), status badge, berat besar (Plus Jakarta Sans bold), estimasi harga. Border 1px `#E1EEF3` + `surface-container` muda. Tap → detail.

### 3.4 Evidence Viewer
Area foto bukti penimbangan dengan bingkai `primary`. Watermark overlay dari metadata sistem (bukan input manual):

```
LAUNDRIE
Order: LDR-2026-000183
Weight: 4.60 KG
Captured: 20 Aug 2026 14:32:18
Laundry: CleanWash
Staff: ST-002
Evidence: WE-000183
```

### 3.5 Step Indicator (Tracking Pesanan)
`Pickup → Laundry → Weighing → Processing → Delivery`. Step selesai = `primary` solid; aktif = outline `primary` + ring; mendatang = outline abu (`outline-variant`).

### 3.6 Camera / Weighing Flow
Layar full-screen. Tombol kamera besar, field berat numerik besar, persentase selisih (`-8.0%`, `Normal`), tombol konfirmasi besar di bawah. Semua dibangun dengan `navigator.mediaDevices` (in-app camera, bukan galeri).

### 3.7 Bottom Navigation (Customer PWA)
4 tab: Beranda, Pesanan, Notifikasi, Profil. Active = `primary`.

### 3.8 Invoice
Seksi: Layanan → Rincian Biaya → **TOTAL** → Bukti Penimbangan. Angka tabular, logo kiri atas, watermark bukti disertakan.

### 3.9 Input Fields
Border 1px `outline-variant`, radius 12px, padding 16px, label di atas (label-md), fokus berubah `primary` + ring.

---

## 4. Layout

- **Mobile:** margin tepi 16px, single column, stack longgar. Kartu penuh hingga margin.
- **Desktop:** grid 12 kolom, max-width 1120px.
- **Fokus operasional:** tombol aksi di thumb-zone (bawah layar), angka kunci (berat/harga) di atas fold.

---

## 5. Implementasi Frontend

Panduan teknis untuk `apps/web`:
- Styling: **Tailwind CSS** — mapping design tokens ke theme config (colors, borderRadius, fontSize, spacing).
- Font: Plus Jakarta Sans + Inter via `@fontsource` atau font CDN.
- Warna status diutamakan dari state API, bukan `Math.random`/state lokal.
- Komponen bersama (badge, button, card, step indicator) di `apps/web/src/shared/`; komponen fitur di `apps/web/src/features/*/`.

---

## 6. Sinkronisasi dengan Stitch

Design system ini dikelola di Stitch (`assets/12460762412709776271`). Alur pembaruan:
1. Ubah token di Stitch design system (untuk project `projects/9094307253132854664`).
2. Terapkan ke screen yang dipilih via `stitch_apply_design_system`.
3. Update dokumen ini agar konsisten.

Dokumen ini harus diperbarui setiap kali design token berubah.
