# PRD — Laundrie
**Dokumen Persyaratan Produk (PRD)**

| | |
|---|---|
| **Produk** | Laundrie — Penjemputan, Pengantaran & Marketplace Laundry |
| **Versi dokumen** | 3.3 — profil sebagai entry point Owner/Manager, Staff, Staff Courier, dan Freelance Courier |
| **Status** | Living document |
| **Terakhir diperbarui** | 23 Agustus 2026 |
| **Dokumen terkait** | `architecture.md` · `schema.md` · `Design.md` · `Rules.md` |

> **Kontrak antar-dokumen.** PRD mendefinisikan apa dan mengapa. `architecture.md` mendefinisikan bagaimana alur dan authorization dijalankan. `schema.md` adalah sumber kebenaran struktur data. `Design.md` mendefinisikan layar, data, tombol, dan UX. PRD tidak boleh memperkenalkan entity, field, role, state, atau flow yang tidak tercermin pada dokumen sumber terkait.

---

## 0. Ringkasan Eksekutif

Laundrie adalah platform marketplace dan orkestrasi laundry yang menghubungkan Customer, Laundry, Staff Laundry, dan Courier.

Customer dapat memesan laundry pickup/delivery. Laundry menerima dan memproses pakaian. Staff adalah pekerja operasional umum laundry tanpa pembagian role penerimaan/pemrosesan. Pemilik laundry otomatis menjadi **Manager/Owner** dan memiliki semua kemampuan Staff ditambah kemampuan manajerial.

Laundrie mendukung dua tipe Courier:

1. **Laundry Staff Courier** — user yang merupakan Manager atau Staff pada laundry tertentu dan memiliki profil courier dengan `courier_type = laundry_staff`.
2. **Freelance Courier** — user dengan profil courier `courier_type = freelance` yang tidak terikat laundry.

Profil user menjadi pusat onboarding capability. User biasa dapat:
- membuat laundry sendiri;
- mencari laundry yang membuka lowongan Staff;
- mencari laundry yang terindikasi membutuhkan Staff;
- melamar sebagai Staff;
- melamar sebagai Staff sekaligus Courier;
- mendaftar sebagai Courier Freelance.

Satu akun user dapat sekaligus menjadi Customer, Manager, Staff, dan/atau Courier. Tidak perlu membuat akun kedua untuk setiap capability.

Pembeda utama produk tetap **transparansi berat**: layanan berbasis berat harus mempunyai evidence penimbangan yang sah sebelum harga difinalisasi dan processing dapat berjalan, kecuali override admin yang tercatat.

---

## 1. Latar Belakang & Masalah

### 1.1 Customer
Customer membutuhkan:
- pickup/delivery yang praktis;
- transparansi harga;
- bukti berat;
- tracking;
- pembayaran;
- complaint/refund;
- pilihan laundry yang dapat dibandingkan.

### 1.2 Laundry
Laundry membutuhkan:
- order digital;
- staff tambahan;
- katalog layanan dan harga;
- koordinasi courier;
- evidence weighing;
- settlement;
- laporan operasional.

### 1.3 Staff
User yang belum memiliki laundry dapat mencari kesempatan kerja pada laundry yang:
- secara eksplisit membuka lowongan Staff; atau
- terindikasi membutuhkan staff berdasarkan data agregat operasional.

Staff tidak langsung dibuat sebagai member laundry. User harus mengirim lamaran dan menunggu keputusan Manager.

### 1.4 Courier
Platform membutuhkan dua sumber supply courier:
- tenaga internal laundry;
- freelance courier platform.

Staff laundry dapat merangkap sebagai Courier tanpa membuat akun user kedua.

### 1.5 Platform
Platform harus mengorkestrasi onboarding, membership, recruitment, courier capability, order, payment, weighing evidence, notification, complaint, dan settlement tanpa membuat model role yang terlalu kompleks.

---

## 2. Visi & North Star

Membuat laundry pickup/delivery sesederhana pesan-antar makanan, dengan bukti transparan terhadap berat dan harga serta supply operasional yang fleksibel.

> **North Star:** Customer dapat berkata, “Saya tinggal pesan, pakaian dijemput, saya tahu berat aktualnya, tahu kenapa harganya begitu, dan pakaian dikembalikan ke rumah.”

Untuk marketplace supply:

> **Secondary North Star:** Laundry dapat menemukan staff/courier yang dibutuhkan, sementara user dapat menemukan peluang kerja atau pengantaran dari satu profil tanpa membuat akun terpisah.

---

## 3. Prinsip Produk

1. **One Account, Multiple Capabilities.** Satu user dapat memiliki beberapa capability.
2. **Manager = Staff + Management.** Owner/Manager memiliki semua kemampuan operasional Staff.
3. **Staff role sederhana.** Semua Staff adalah `STAFF`; pekerjaan tidak dipisah menjadi role penerimaan/pemrosesan.
4. **Courier sebagai capability tambahan.** Courier bukan pengganti role Staff.
5. **Server authority.** Permission, application acceptance, payment, pricing, dan state transition ditentukan server.
6. **Evidence over assertion.** Berat dan event operasional penting mempunyai bukti.
7. **No silent overwrite.** Histori dan evidence penting tidak ditimpa diam-diam.
8. **Profile as entry point.** Onboarding bisnis, Staff, dan Courier dapat dimulai dari Profil.
9. **Discovery berbasis data.** Lowongan eksplisit adalah sumber utama. Indikasi “butuh staff” berasal dari endpoint agregasi, bukan tebakan frontend.
10. **Mobile-first.** Profile application, staff discovery, weighing, dan courier flow harus mudah digunakan di ponsel.

---

## 4. Tujuan MVP

### 4.1 Core Transaction
- Customer dapat mendaftar, mengelola profil dan alamat.
- Customer dapat menemukan laundry dan layanan.
- Customer dapat checkout dan membayar.
- Courier dapat pickup dan delivery.
- Laundry dapat menerima, menimbang, memproses, dan menyiapkan order.
- Order dapat selesai end-to-end.

### 4.2 Trust Layer
- Weight evidence wajib untuk layanan berbasis berat.
- Evidence immutable setelah confirmed.
- Final price berasal dari actual weight yang tervalidasi.
- Invoice memuat data final dan evidence.

### 4.3 Laundry Supply
- User dapat membuat laundry dari Profil.
- User pemilik laundry otomatis menjadi Manager.
- Manager dapat menambah Staff.
- Manager dapat membuka/menutup lowongan Staff.
- User dapat menemukan lowongan dan mengirim lamaran.
- Manager dapat menerima/menolak lamaran.
- Membership Staff hanya dibuat setelah application accepted.

### 4.4 Courier Supply
- User dapat mendaftar sebagai Freelance Courier.
- User dapat melamar sebagai Staff + Courier pada laundry.
- Manager/Staff dapat memiliki profile Courier tanpa akun kedua.
- Dispatch dapat memilih laundry_staff atau freelance sesuai policy.

---

## 5. Aktor & Capability

| Capability | Source |
|---|---|
| Customer | akun user yang dapat melakukan transaksi |
| Owner/Manager | `laundries.user_id` |
| Staff | row `staff` dengan `role = STAFF` |
| Laundry Staff Courier | `couriers.courier_type = laundry_staff` + membership Staff/Owner |
| Freelance Courier | `couriers.courier_type = freelance` + `laundry_id = NULL` |
| Operations Admin | admin role |
| Finance Admin | admin role |
| Super Admin | admin role |

### 5.1 Manager
Manager dapat:
- melakukan semua operasi Staff;
- mengelola Staff;
- membuka/menutup lowongan Staff;
- meninjau lamaran;
- mengelola layanan;
- mengubah harga;
- mengelola profil/konfigurasi laundry;
- melihat settlement/laporan.

### 5.2 Staff
Staff dapat:
- menerima order;
- weighing;
- evidence;
- processing;
- menandai siap;
- menjalankan tugas operasional lainnya;
- menjadi Courier bila profile courier aktif.

Staff tidak dapat:
- mengelola Staff;
- membuka/menutup lowongan;
- menerima/menolak lamaran;
- mengubah layanan/harga;
- mengelola konfigurasi manajerial.

### 5.3 Courier
Courier dapat:
- melihat job yang diberikan;
- pickup;
- delivery;
- upload proof;
- melihat riwayat/pendapatan sesuai tipe.

### 5.4 User biasa
User biasa tidak memerlukan role khusus untuk memulai onboarding capability. Profil menyediakan entry point untuk:
- `Buat Laundry`;
- `Gabung sebagai Staff`;
- `Daftar sebagai Courier`.

---

## 6. Modul Produk

| Modul | Cakupan |
|---|---|
| Auth & Profile | identity, avatar/cover, capability overview |
| Laundry Creation | onboarding laundry |
| Staff Recruitment | lowongan dan lamaran staff |
| Staff Management | membership, aktivasi/nonaktif |
| Courier Onboarding | freelance / staff courier |
| Catalog & Pricing | services dan service_prices |
| Order | lifecycle order |
| Courier Jobs | pickup/delivery |
| Weighing & Evidence | trust layer |
| Payment | gateway/webhook/refund |
| Invoice | invoice final |
| Notifications | event notifications |
| Complaint | disputes |
| Review | laundry/courier review |
| Settlement | laundry/courier payout |
| Admin | operations, finance, audit |

### 6.1 Pemisahan Aplikasi Frontend per Peran Pengguna

Untuk mengoptimalkan UX dan kinerja per perangkat, platform membagi antarmuka menjadi **5 aplikasi frontend terpisah** di dalam monorepo:

1. **Customer App (`apps/web-customer`):** Web/PWA untuk pencarian laundry, pemesanan, tracking, bukti berat, dan lamaran pekerjaan.
2. **Manager Dashboard (`apps/web-manager`):** Web/Desktop dashboard untuk manajemen bisnis laundry, rekrutmen staff, harga, dan settlement.
3. **Staff Operational App (`apps/web-staff`):** Mobile/Tablet PWA operasional cepat untuk penerimaan, penimbangan, kamera bukti, dan pemrosesan.
4. **Courier App (`apps/web-courier`):** Mobile PWA untuk penugasan pickup/delivery, navigasi, bukti kurir, dan saldo pendapatan.
5. **Admin Portal (`apps/web-admin`):** Dashboard internal platform untuk moderasi, penanganan dispute, audit log, dan settlement.

Seluruh aplikasi frontend terhubung ke **1 backend API terpadu** (Laravel Modular Monolith).

---

## 7. Profile as Capability Hub

Profil bukan hanya halaman data pribadi. Profil adalah pusat status capability user.

### 7.1 User yang Belum Memiliki Laundry/Staff/Courier

Card utama:

```text
Mulai Berperan di Laundrie

[ Buat Laundry ]
Saya ingin membuka dan mengelola laundry.

[ Gabung sebagai Staff ]
Saya ingin bekerja di laundry yang membutuhkan staff.

[ Daftar sebagai Courier ]
Saya ingin mendapatkan pekerjaan pickup/delivery.
```

### 7.2 User yang Sudah Memiliki Capability

Profil menampilkan:
- `Manager` + laundry;
- `Staff` + laundry;
- `Courier Freelance`;
- `Courier Staff Laundry`;
- lamaran Staff pending;
- lamaran Staff Courier pending.

CTA yang tampil menyesuaikan capability.

### 7.3 Satu Akun
Satu user boleh memiliki kombinasi:

```text
Customer
+ Manager
+ Courier laundry_staff
```

atau:

```text
Customer
+ Staff
+ Courier laundry_staff
```

atau:

```text
Customer
+ Freelance Courier
```

Tidak membuat akun user kedua.

---

## 8. Membuat Laundry dari Profil

### Flow

```text
Profil
→ Buat Laundry
→ Isi data laundry
→ Unggah dokumen
→ Kirim verifikasi
→ Laundry dibuat
→ User otomatis Owner/Manager
```

### Data
- business name;
- legal name;
- contact;
- address (alamat operasional laundry tersendiri, terpisah dari alamat pribadi manajer);
- latitude/longitude;
- operating hours;
- capacity;
- dokumen verifikasi sesuai policy.

### Setelah create
`laundries.user_id = current user`.

User otomatis Manager.

### Manager dapat segera
- melengkapi profil;
- membuat service;
- mengatur harga;
- menambah Staff;
- membuka lowongan;
- mengelola Courier Staff.

---

## 9. Staff Recruitment

### 9.1 Lowongan Eksplisit

Manager dapat membuat `staff_openings`.

Lowongan berisi:
- title;
- description;
- quota;
- status `OPEN/CLOSED`.

Role selalu Staff umum.

### 9.2 Lowongan Staff + Courier

Lowongan dapat menerima kandidat `staff_courier`.

UI memberi badge:

> **Staff + Courier**

Namun backend tetap menggunakan:
- `staff.role = STAFF`;
- `courier_type = laundry_staff`.

### 9.3 Discovery

User melihat:
1. laundry dengan lowongan `OPEN`;
2. laundry dengan indikasi kebutuhan staff dari endpoint agregasi.

Indikasi kebutuhan tidak menjadi status `NEED_STAFF` di database.

Contoh sinyal yang dapat diberikan endpoint:
- rasio staff aktif terhadap volume order;
- order aktif tinggi;
- backlog operasional;
- lowongan terbuka;
- kebutuhan courier internal.

Nilai ranking adalah hasil business/analytics endpoint, bukan perhitungan frontend.

---

## 10. Lamaran Staff

### 10.1 Jenis
`staff_applications.application_type`:

```text
staff
staff_courier
```

### 10.2 Flow Staff

```text
User
→ Pilih Laundry
→ Lihat Lowongan
→ Lamar sebagai Staff
→ PENDING
→ Manager Review
→ ACCEPTED
→ staff row dibuat
```

### 10.3 Flow Staff + Courier

```text
User
→ Pilih Lowongan Staff + Courier
→ Lamar
→ PENDING
→ Manager ACCEPTED
→ staff row dibuat
→ lengkapi vehicle/service area
→ verification
→ courier row dibuat
→ courier_type = laundry_staff
```

### 10.4 Status
- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `WITHDRAWN`

### 10.5 Aturan
User yang hanya melamar belum menjadi Staff.

Staff hanya terbentuk setelah accepted.

Rejected/withdrawn application tetap disimpan sebagai histori.

---

## 11. Staff Management

Manager melihat:

```text
Nama     Status      Courier
Andi     Aktif       -
Budi     Aktif       Staff + Courier
Citra    Nonaktif    -
```

Manager dapat:
- tambah staff;
- menerima application;
- menonaktifkan staff;
- mengaktifkan staff;
- mengaktifkan/menonaktifkan courier profile;
- melihat pekerjaan staff/courier.

Tidak ada tombol:
- Promote to Manager;
- Change Staff Role.

Owner/Manager ditentukan oleh ownership laundry.

---

## 12. Courier Onboarding

### 12.1 Pilihan dari Profil

```text
Daftar sebagai Courier

[ Courier Freelance ]
Tidak terikat pada satu laundry.

[ Courier Staff Laundry ]
Bekerja sebagai Staff laundry dan juga menjalankan pickup/delivery.
```

### 12.2 Freelance

Input:
- identity;
- phone;
- vehicle;
- service area;
- payout;
- verification document.

Result:

```text
courier_type = freelance
laundry_id = NULL
```

### 12.3 Staff Laundry

User memilih laundry/lowongan yang menerima `staff_courier`.

User melamar sebagai `staff_courier`.

Setelah accepted:
- menjadi Staff;
- profile courier dibuat setelah kelengkapan;
- `courier_type = laundry_staff`;
- `laundry_id = laundry tersebut`.

---

## 13. Dispatch

Kandidat Courier:

```text
available
+ service area cocok
+ kapasitas memenuhi
+ freelance
  ATAU
  laundry_staff dengan laundry_id order
```

Policy dapat:
- memprioritaskan courier laundry;
- memprioritaskan freelance;
- atau menggunakan jarak/kapasitas.

Prioritas bukan state machine dan dapat dikonfigurasi.

---

## 14. Core Order Lifecycle

Customer-facing:

```text
Pesanan
→ Dijemput
→ Diterima Laundry
→ Ditimbang
→ Diproses
→ Siap Diantar
→ Diantar
→ Selesai
```

Backend mengikuti state machine `architecture.md`.

Order berbasis berat tidak dapat masuk processing tanpa evidence yang sah, kecuali override admin ter-audit.

---

## 15. Pricing

Manager-only mutation:
- tambah service;
- edit service;
- ubah price;
- aktif/nonaktif service.

Staff hanya membaca harga yang diperlukan untuk pekerjaan.

Perubahan harga membuat row baru di `service_prices`.

Tidak boleh overwrite histori.

---

## 16. Trust Layer

Untuk layanan berbasis berat:

```text
Receive
→ Weigh
→ Camera
→ Capture
→ Evidence validation
→ Confirm
→ Final Price
→ Processing
```

Evidence confirmed tidak diedit.

Correction:
- invalidate evidence lama;
- buat evidence baru;
- audit trail tetap utuh.

---

## 17. Payment & Invoice

Payment:
- server source of truth;
- webhook idempotent;
- refund audited.

### 17.1 Alur Keuangan & Payout Kurir Berdasarkan Tipe Kurir

- **Freelance Courier (`courier_type = freelance`):**
  - Menerima payout **otomatis** segera setelah seluruh proses pesanan selesai (`COMPLETED`).
  - Pendapatan (ongkir + bonus) langsung dikreditkan ke saldo wallet/rekening kurir freelance untuk dapat dicairkan.
- **Laundry Staff Courier (`courier_type = laundry_staff`) & Staff Laundry:**
  - Payout **TIDAK** otomatis diberikan per order oleh sistem platform.
  - Penggajian, komisi, dan pembagian hasil sepenuhnya **tergantung pada Manajer Laundry** melalui alokasi internal laundry.
  - Pendapatan order dikumpulkan ke dalam **Settlement Laundry** yang dicairkan secara periodik kepada Manajer Laundry.

Invoice:
- unique invoice number;
- final weight;
- final price;
- fees/discount/tax;
- payment status;
- evidence reference.

---

## 18. Complaint & Review

Complaint tersedia untuk issue:
- weight/price;
- lost;
- damaged;
- late pickup;
- late delivery;
- quality;
- wrong order;
- payment.

Review hanya setelah `COMPLETED`.

Target review:
- laundry;
- courier.

---

## 19. Notification

Event onboarding:
- application received;
- application accepted;
- application rejected;
- staff activated;
- courier verification updated;
- courier job assigned.

Event order:
- confirmed;
- courier assigned;
- pickup;
- laundry received;
- weight verified;
- final price;
- processing;
- ready;
- delivery;
- completed;
- payment/refund;
- complaint.

---

## 20. Platform Admin & Tata Kelola Modul

Portal Admin (`apps/web-admin`) bertindak sebagai pusat kendali operasional, keuangan, dan tata kelola platform Laundrie. Akun staf admin internal terdaftar pada entitas `admin_users` (`schema.md` §4.27) yang terikat ke `users.id`. Akses admin dibagi secara ketat berdasarkan prinsip *Least Privilege* menggunakan tiga role terpisah:

### 20.1 Peran dan Tanggung Jawab Admin

#### 1. Operations Admin (`role = operations_admin`)
- **Moderasi & Verifikasi Mitra Laundry:** Meninjau pendaftaran laundry baru, memeriksa dokumen verifikasi (`verification_documents`: KTP, NIB, foto lokasi), serta menyetujui (`VERIFIED`/`ACTIVE`) atau menolak (`REJECTED`) pendaftaran dengan alasan eksplisit.
- **Moderasi & Verifikasi Kurir:** Meninjau pendaftaran kurir (baik `freelance` maupun `laundry_staff`), mengevaluasi kelengkapan dokumen (SIM, STNK, KTP), dan mengelola status kurir (`PENDING → VERIFIED → ACTIVE / SUSPENDED`).
- **Monitoring Pesanan & Override Status:** Memantau alur pesanan yang berjalan, mengintervensi order yang tertahan (*stale orders*), dan melakukan manual override status pesanan (mis. dari `RECEIVED_AT_LAUNDRY` atau `PROCESSING` ke `CANCELLED`) hanya dalam kondisi khusus dengan alasan tertulis wajib.
- **Arbitrase Sengketa & Komplain:** Menginvestigasi komplain pelanggan (`complaints`), mengevaluasi bukti digital (`dispute_evidence`, `weight_evidences`), memutuskan resolusi sengketa, dan meneruskan permintaan refund ke Finance Admin jika diperlukan.
- **Monitoring Kepatuhan Bukti Penimbangan:** Memantau dashboard anomali penimbangan (variansi berat ekstrem >30%, bukti invalidasi tinggi, potensi penyalahgunaan foto), meninjau bukti penimbangan yang di-invalidate oleh laundry, serta mengambil tindakan peringatan/suspensi mitra.

#### 2. Finance Admin (`role = finance_admin`)
- **Manajemen Pembayaran & Gateway:** Memantau transaksi pembayaran masuk via Midtrans/gateway, menangani status pembayaran menggantung (*unconfirmed webhook*), serta melakukan rekonsiliasi pembayaran harian.
- **Persetujuan & Eksekusi Refund:** Meninjau permintaan refund (`refunds`) yang diajukan oleh Operations Admin atau sistem, menyetujui/menolak refund (`APPROVED`/`REJECTED`), dan memicu proses pengembalian dana via payment gateway.
- **Kelayakan & Payout Settlement Laundry:** Meninjau perhitungan akumulasi settlement laundry per periode (`settlements`), mengonfirmasi potongan komisi/diskon platform, dan mengotorisasi pembayaran akhir (*payout execution*) ke rekening manajer laundry.
- **Penyelesaian Payout Kurir:** Memantau pengkreditan saldo dan pembayaran payout kurir freelance.

#### 3. Super Admin (`role = super_admin`)
- **Konfigurasi Aturan Dinamis Platform:** Mengatur parameter global sistem (mis. threshold selisih berat untuk persetujuan otomatis, aturan biaya pembatalan order per fase lifecycle, komisi platform %, batas waktu bayar webhook, radius dispatch kurir).
- **Pengawasan Audit Log & Keamanan Platform:** Memantau seluruh rekaman jejak audit (`audit_logs`) lintas platform, melacak aksi manual override admin, mendeteksi aktivitas mencurigakan, dan menegakkan kebijakan keamanan.
- **Manajemen Pengguna & Otorisasi RBAC:** Mengelola akun staf internal platform, menetapkan hak akses (role Assignment: Operations Admin, Finance Admin, Super Admin), serta memblokir/mengaktifkan kembali akun pengguna (`users.status = BANNED/ACTIVE`).

### 20.2 Tata Kelola Manual Override & Auditability

1. **Prinsip Immudabilitas Audit:** Setiap aksi perubah data yang dilakukan Admin (override status order, persetujuan/penolakan dokumen verifikasi, invalidasi bukti, persetujuan refund, perubahan peran pengguna) **wajib** mencatat entri immutable baru di `audit_logs` dengan memuat `actor_id`, `actor_type`, `action`, `old_values`, `new_values`, `ip_address`, dan `user_agent`.
2. **Justifikasi Wajib:** Aksi override status pesanan atau penolakan verifikasi wajib menyertakan input alasan kontekstual (`reason` / `rejection_reason`) yang disimpan permanen di database.
3. **Pemisahan Tugas (Segregation of Duties):** Operations Admin tidak dapat mengeksekusi payout settlement atau refund langsung tanpa persetujuan Finance Admin. Sebaliknya, Finance Admin tidak dapat mengubah status operasional pesanan atau meng-override penimbangan tanpa Operations Admin.

### 20.3 Pemetaan Relasi & Hirarki Entitas di Admin Console

Admin Portal mampu menampilkan visualisasi hirarki relasi bisnis secara utuh:

```text
Laundry A (laundries)
├── Owner / Manager (laundries.user_id -> users)
├── Staff Operasional (staff WHERE laundry_id = A)
├── Staff Courier (couriers WHERE laundry_id = A AND courier_type = laundry_staff)
├── Open Openings (staff_openings WHERE laundry_id = A)
└── Lowongan Lamaran (staff_applications WHERE laundry_id = A)

Freelance Network
├── Courier X (couriers WHERE courier_type = freelance)
└── Courier Y (couriers WHERE courier_type = freelance)
```

---

## 21. KPI

### Transaction
- orders/day;
- completion;
- cancellation;
- payment success.

### Marketplace Supply
- jumlah laundry aktif;
- staff openings created;
- open openings;
- applications per opening;
- application acceptance rate;
- median time to fill opening;
- active staff per laundry;
- Staff Courier adoption;
- Freelance Courier active supply.

### Operational
- pickup success;
- delivery success;
- processing time;
- evidence compliance;
- dispute rate.

### Trust
```text
Evidence Compliance Rate
Weight Dispute Rate
Average Weight Variance
Evidence Invalidation Rate
```

### Supply Discovery
- percentage user profile visitors yang membuka Staff/Courier onboarding;
- application conversion;
- courier onboarding conversion.

---

## 22. Acceptance Criteria

### Profile
- User tanpa capability melihat `Buat Laundry`, `Gabung sebagai Staff`, `Daftar sebagai Courier`.
- User dapat melihat status capability yang sudah dimiliki.
- User tidak membuat akun kedua.

### Laundry
- User dapat membuat laundry.
- User otomatis menjadi Owner/Manager.
- Manager dapat membuka lowongan Staff.
- Manager dapat menutup lowongan.

### Staff
- User dapat melihat lowongan OPEN.
- User dapat melihat laundry yang direkomendasikan berdasarkan kebutuhan agregat.
- User dapat melamar sebagai Staff.
- User dapat melamar sebagai Staff + Courier.
- Manager dapat accept/reject.
- Staff hanya dibuat setelah accepted.

### Courier
- User dapat daftar Freelance.
- User dapat daftar Staff Courier melalui lowongan.
- Freelance memiliki `laundry_id = NULL`.
- Staff Courier terikat ke satu laundry.
- Staff Courier tidak membuat akun kedua.

### Permission
- Manager memiliki seluruh kemampuan Staff.
- Staff tidak dapat mengelola Staff.
- Staff tidak dapat membuat/mengubah harga.
- Server menolak mutation yang tidak berwenang.

### Transaction
- Order dapat berjalan sampai `COMPLETED`.
- Evidence diwajibkan.
- Payment idempotent.
- Invoice benar.

---

## 23. Non-Functional Requirements

- API normal target umumnya <500ms di luar provider eksternal.
- List pagination wajib.
- Background work menggunakan queue.
- Private media menggunakan signed URLs.
- Authorization server-side.
- Idempotensi untuk action kritis.
- Logging dan audit untuk mutation penting.
- Backup/monitoring tersedia.

---

## 24. Out of Scope MVP

- Microservices penuh;
- Kafka;
- route optimization kompleks;
- AI recruitment;
- AI pricing;
- computer vision;
- hardware timbangan;
- multi-region;
- payroll;
- HRIS penuh;
- fitur interview/recruitment enterprise;
- career marketplace di luar Staff laundry dan Courier.

---

## 25. Fase Implementasi

### Fase 0
Validasi:
- demand customer;
- minat laundry;
- minat staff;
- minat freelance courier.

### Fase 1
Core:
- auth/profile;
- create laundry;
- customer ordering;
- payment;
- courier;
- laundry operation.

### Fase 2
Trust:
- weighing/evidence;
- invoice;
- audit.

### Fase 3
Supply:
- staff openings;
- staff applications;
- profile-based recruitment;
- freelance courier onboarding;
- staff courier onboarding.

### Fase 4
Optimization:
- recruitment ranking;
- dispatch policy;
- notification;
- analytics.

### Fase 5
Scaling
Dilakukan hanya ketika data membuktikan kebutuhan.

---

## 26. Source of Truth Antar Dokumen

| Keputusan | Source |
|---|---|
| Business goals & user experience objective | `PRD.md` |
| State machine | `architecture.md` |
| Authorization enforcement | `architecture.md` |
| Table/field/enum | `schema.md` |
| Screen/route/button/data | `Design.md` |
| Security rules | `Rules.md` |

### Larangan Drift

Tidak boleh:
1. membuat Staff role baru;
2. membuat entity branch/partner;
3. membuat courier account kedua untuk Staff;
4. membuat Staff membership sebelum application accepted;
5. membuat “need staff” sebagai enum status laundry;
6. menghitung kebutuhan staff dengan data parsial di frontend;
7. mengubah harga dari Staff;
8. membuat courier freelance dengan `laundry_id`;
9. menganggap application sebagai membership;
10. membuat promotion Staff menjadi Manager.

---

## 27. Referensi

- `architecture.md`
- `schema.md`
- `Design.md`
- `Rules.md`

> Setiap perubahan flow onboarding wajib memperbarui keempat dokumen terkait pada perubahan yang sama.
