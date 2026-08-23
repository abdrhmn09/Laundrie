# Rules.md — Laundrie

| | |
|---|---|
| **Fungsi** | Rambu-rambu konkret yang mengikat AI dan tim engineering. Larangan eksplisit, bukan sekadar konteks. |
| **Versi dokumen** | 1.1 — Penyelarasan role STAFF tunggal, Owner=Manager, model courier, rekrutmen staff & schema v1.1 |
| **Status** | Living document — **paling sering diupdate** sepanjang proyek. Review berkala (lihat §11) agar tidak jadi tempat sampah. |
| **Terakhir diperbarui** | 23 Agustus 2026 |
| **Dokumen terkait** | `PRD.md` · `architecture.md` · `schema.md` · `Design.md` |

---

## 0. Prinsip Utama: Cek Dulu, Jangan Menebak

AI (dan engineer) **wajib** merujuk `schema.md` sebelum menulis nama kolom/tabel apa pun, dan `architecture.md` sebelum menyebut nama endpoint, domain, atau status. Jika sebuah nama tabel/kolom/status yang dibutuhkan tidak ada di `schema.md`/`architecture.md`, itu bukan alasan untuk mengarang nama yang "kedengarannya masuk akal" — berhenti dan tanyakan, atau usulkan penambahan resmi ke dokumen terkait terlebih dahulu.

Contoh prompt yang benar: *"Baca schema.md dan architecture.md dulu sebelum bikin migration baru untuk modul komplain."*

---

## 1. Konvensi Penamaan

| Konteks | Aturan |
|---|---|
| Class/Model (Laravel) | PascalCase — `WeightEvidence`, `OrderStatusHistory` |
| Method/variable (PHP & TS) | camelCase — `calculateFinalPrice()`, `estimatedWeight` |
| Tabel & kolom DB | snake_case, tabel plural — lihat `schema.md` §1 |
| Route URI | kebab-case untuk segmen multi-kata — `/api/v1/weighing-evidence` bukan `/weighingEvidence` |
| React Component | PascalCase — `WeightEvidenceCard.tsx` |
| React hook | camelCase dengan prefix `use` — `useOrderStatus()` |
| File non-komponen (util, service) | kebab-case atau camelCase konsisten per folder — `order-status.utils.ts` |
| Migration file | `<timestamp>_create_<table>_table.php` / `<timestamp>_add_<column>_to_<table>_table.php` |
| Folder domain backend | PascalCase mengikuti `architecture.md` §6 — `app/Domain/Weighing/` |

---

## 2. Larangan Eksplisit

- **Jangan hardcode kredensial** (DB password, API key, secret payment gateway) di kode — selalu lewat environment variable / secret manager.
- **Jangan buat tabel atau kolom baru tanpa memperbarui `schema.md`** di pull request yang sama.
- **Jangan install package/dependency baru tanpa konfirmasi** — cek daftar yang disetujui di §6 dulu.
- **Jangan menimpa (overwrite) `weight_evidences` yang berstatus `CONFIRMED`.** Koreksi wajib berupa record baru + invalidasi record lama dengan `invalidation_reason` terisi (`schema.md` §4.15, `architecture.md` §10.3).
- **Jangan menjadikan respons sukses pembayaran dari client sebagai status resmi.** Status pembayaran hanya berubah lewat webhook yang tervalidasi di server.
- **Jangan mengizinkan transisi status order yang melanggar state machine** di `architecture.md` §8.2 — termasuk `RECEIVED_AT_LAUNDRY → PROCESSING` tanpa bukti berat terkonfirmasi, kecuali override admin yang tercatat di `audit_logs`.
- **Jangan menyimpan foto bukti atau dokumen mitra di storage public.** Selalu private bucket + signed URL berumur pendek.
- **Jangan mempercayai filename atau MIME type dari client** tanpa validasi ulang di server.
- **Jangan mengizinkan upload bebas dari galeri** untuk alur bukti penimbangan utama — hanya kamera dalam-aplikasi.
- **Jangan menyimpan data pembayaran sensitif** (nomor kartu penuh, dsb.) jika tidak benar-benar diperlukan.
- **Jangan menambahkan service Go, Kafka, atau memecah ke microservices** tanpa keputusan arsitektur eksplisit yang tercatat — hanya berdasarkan bottleneck yang terukur (`architecture.md` §20), bukan preferensi teknologi.
- **Jangan menampilkan nilai status/enum mentah dari backend** (mis. `WEIGHT_REVIEW_REQUIRED`) langsung ke pelanggan di UI — selalu terjemahkan ke label manusiawi sesuai `Design.md` §30 / §41.
- **Jangan menggunakan role staff legacy (`PENERIMAAN`, `PEMROSESAN`, `MANAJER`)** — semua staff menggunakan `staff.role = STAFF` (`schema.md` §4.3). Manager/Owner ditentukan otomatis dari `laundries.user_id` (`schema.md` §4.7).
- **Jangan membuat entitas `branches` atau `partners`** — entitas tersebut telah dihapus, seluruh operasi laundry menggunakan `laundries`.
- **Jangan membuat akun `users` kedua untuk Staff yang juga beroperasi sebagai Courier** — gunakan akun user yang sama dengan profil `couriers` bertipe `laundry_staff` (`schema.md` §4.6).
- **Jangan membuat membership `staff` sebelum lamaran diterima (`ACCEPTED`)** atau sebelum diundang langsung oleh Manager (`Design.md` §36).
- **Jangan mencairkan payout otomatis per-order dari sistem ke `laundry_staff`** — porsi ongkir/pendapatan order `laundry_staff` masuk ke Settlement Laundry dan dikelola/dibayarkan secara internal oleh Manajer Laundry (`architecture.md` §12.5.1).
- **Jangan menggabungkan antarmuka Customer, Manager, Staff, Courier, dan Admin ke dalam satu aplikasi frontend monolith (`apps/web`)** — wajib dipisah menjadi 5 aplikasi frontend terpisah (`apps/web-customer`, `apps/web-manager`, `apps/web-staff`, `apps/web-courier`, `apps/web-admin`) (`Design.md` §49, §57).
- **Jangan mencampur atau menggunakan alamat pribadi user/manajer (`addresses`) sebagai alamat operasional laundry.** Alamat laundry wajib disimpan tersendiri di entitas `laundries` (`address_line`, `latitude`, `longitude`).
- **Jangan melakukan manual override status pesanan atau penimbangan tanpa mencatat alasan tertulis (`reason`) dan entri immutable di `audit_logs`.**
- **Jangan mengeksekusi payout settlement atau pengembalian dana (refund) secara otomatis tanpa alur persetujuan ter-audit oleh Finance Admin.**
- **Jangan membuat endpoint list tanpa pagination.**

---

## 3. Wajib

- Selalu pakai **Query Builder/Eloquent**; hindari raw query kecuali parameternya sudah di-bind/di-escape.
- **Validasi semua input** lewat Laravel Form Request/Validation sebelum masuk ke model.
- **Cek `schema.md`** sebelum menyebut nama kolom/tabel; **cek `architecture.md`** sebelum menyebut nama endpoint/domain/status.
- **Otorisasi ditegakkan di server** lewat Policy — menyembunyikan elemen UI di frontend bukan kontrol keamanan.
- Endpoint/job berikut **wajib idempotent** terhadap request/eksekusi duplikat: webhook pembayaran, konfirmasi order, konfirmasi bukti penimbangan, pembuatan refund, aksi penugasan kurir.
- Setiap tindakan operasional penting (perubahan status, konfirmasi/invalidasi bukti, override admin, refund, perubahan penugasan mitra/kurir) **wajib ditulis ke `audit_logs`**.
- **Seluruh aksi Admin yang mengubah state** (override order, persetujuan/penolakan verifikasi dokumen, invalidasi bukti, persetujuan refund/settlement, pengaktifan/pemblokiran user) **wajib mencatat entri di `audit_logs`** dengan `actor_type = 'admin'`, `actor_id` terisi, serta alasan tertulis.
- Proses berat (generate invoice, proses gambar, kirim notifikasi, hitung settlement) **wajib asynchronous** lewat queue — tidak boleh menghambat request pelanggan.
- Harga layanan **wajib diberi versi** (`service_prices`) — jangan overwrite harga lama secara langsung di `services`.
- Seluruh staff laundry wajib menggunakan `staff.role = STAFF` (`schema.md` §4.3). Penentuan Owner/Manager **wajib** berasal dari `laundries.user_id` (`schema.md` §4.7), tanpa memerlukan entri `staff`.
- Profil courier **wajib** membedakan `courier_type = laundry_staff` (dengan `laundry_id` terisi) dan `freelance` (dengan `laundry_id = NULL`).
- **Freelance Courier (`courier_type = freelance`) wajib** secara otomatis menerima kredit pendapatan/payout ke saldo kurir segera setelah status order menjadi `COMPLETED` (`architecture.md` §12.5.1).
- **Aplikasi frontend wajib** dipisah menjadi 5 proyek aplikasi terpisah (`web-customer`, `web-manager`, `web-staff`, `web-courier`, `web-admin`) yang berdiri sendiri di dalam monorepo `apps/` (`Design.md` §57).
- **Alamat operasional laundry wajib dipisahkan dari alamat pribadi user (manajer).** Data alamat laundry disimpan langsung pada entitas `laundries` (§4.7), sedangkan alamat pribadi user/manajer disimpan di tabel `addresses` (§4.10).

---

## 4. Aturan Keamanan Minimal

- HTTPS di seluruh sistem; hashing password yang aman (bcrypt/argon2 bawaan Laravel).
- Rate limiting untuk endpoint login dan endpoint publik yang rawan abuse.
- Proteksi CSRF untuk endpoint yang relevan (form berbasis session).
- Encoding output untuk mencegah XSS; jangan pernah render input pengguna sebagai HTML mentah tanpa sanitasi.
- MFA opsional untuk role berhak istimewa (Finance Admin, Super Admin).
- Least privilege: setiap role hanya mengakses data yang dibutuhkan perannya (lihat matriks di `architecture.md` §15.1).
- Backup database otomatis dan diuji restore-nya secara berkala.

## 4.1 Keamanan Upload File

Upload bukti (penimbangan, pickup/delivery, dokumen mitra) wajib memvalidasi di server:
1. Pengguna terautentikasi dan berwenang atas order/entitas terkait.
2. Tipe file dan MIME type aktual (bukan dari header client).
3. Ukuran file dan dimensi gambar wajar.
4. Konsistensi ekstensi vs isi file.
5. Path penyimpanan terisolasi per entitas (tidak bisa ditebak/dijelajahi).

---

## 5. Error Handling & Logging

- Gunakan **structured logging** dengan `request_id`/`order_id` untuk memudahkan tracing lintas layer.
- Semua job queue wajib **retry-able**; job yang gagal permanen masuk `failed_jobs` dan dipantau, bukan hilang diam-diam.
- Response error API konsisten (kode, pesan untuk pengguna, detail validasi per field) — **jangan expose stack trace atau detail internal** ke client di environment production.
- Kegagalan yang wajib dipantau (lihat `architecture.md` §17.3): error API, kegagalan queue, kegagalan webhook pembayaran, kegagalan upload bukti, kegagalan generasi invoice, kegagalan notifikasi.

---

## 6. Daftar Library/Dependency yang Disetujui

**Backend (Laravel 13 / PHP 8.3+):** Sanctum (auth), Horizon (queue monitoring), Eloquent, Laravel Scheduler, driver Flysystem S3-compatible (object storage), SDK resmi payment gateway (mis. Midtrans), library image processing untuk watermark (mis. Intervention Image).

**Frontend (React + TypeScript + Vite):** React Router, Tailwind CSS, satu state-management ringan yang dipilih tim (Zustand/Context — jangan campur beberapa tanpa alasan), library form ringan bila diperlukan (mis. React Hook Form).

Package di luar daftar ini **wajib dikonfirmasi tim** sebelum diinstall (lihat §2). Tambahkan ke daftar ini setelah disetujui supaya tidak perlu konfirmasi ulang tiap kali dipakai.

---

## 7. Testing Minimal per Jenis Perubahan

| Perubahan | Test wajib |
|---|---|
| Aturan harga/selisih berat | Unit test kalkulasi (`architecture.md` §10.6) |
| Transisi status order | Unit test aturan transisi valid/invalid (§8.2) |
| Endpoint baru | Feature/API test (happy path + otorisasi ditolak) |
| Webhook pembayaran | Test idempotensi (kirim event duplikat, pastikan efek tidak dobel) |
| Alur penimbangan/bukti | Feature test alur capture → confirm, dan alur invalidasi |
| Migration schema | Pastikan `schema.md` diperbarui di PR yang sama |

---

## 8. Format Commit & Git Workflow

- Gunakan **conventional commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Satu branch per fitur/perbaikan; PR wajib direview sebelum merge ke `main`.
- **Migration baru wajib disertai update `schema.md`** pada PR yang sama — PR yang mengubah struktur data tanpa update schema.md ditolak.
- Perubahan keputusan arsitektur (mis. mulai mengekstrak service) wajib disertai update `architecture.md`.

---

## 9. Definisi Teknis "Selesai" (Definition of Done)

Sebuah fitur/pesanan dianggap selesai secara teknis ketika:

- [ ] Pelanggan dapat memesan; pembayaran tercatat andal lewat webhook tervalidasi.
- [ ] Kurir dapat menerima pekerjaan pickup; laundry dapat menerima pesanan.
- [ ] Untuk layanan berbasis berat: bukti penimbangan wajib tersedia sebelum `PRICE_FINALIZED`.
- [ ] Bukti disimpan aman (private storage) dan tidak dapat diubah diam-diam.
- [ ] Harga final dihitung benar; invoice berisi pengukuran final, total benar, dan referensi bukti.
- [ ] Laundry dapat memproses & menandai siap; kurir dapat mengantar; pelanggan dapat konfirmasi penyelesaian.
- [ ] Komplain dapat dibuat; admin dapat menyelidiki seluruh timeline lewat `audit_logs`.
- [ ] Background job yang gagal dapat di-retry; webhook pembayaran idempotent.
- [ ] Otorisasi ditegakkan di server (bukan hanya disembunyikan di UI).
- [ ] Lolos linter/formatter, ada test yang relevan (§7), dan `schema.md`/`architecture.md` sinkron dengan kode.

---

## 10. Standar Komentar & Dokumentasi Kode

- Docblock (PHPDoc/TSDoc) pada method public atau logika kompleks (kalkulasi harga, evaluasi selisih berat, state machine).
- Komentar menjelaskan **kenapa**, bukan mengulang **apa** yang sudah jelas dari nama variabel/fungsi.
- Perubahan pada aturan bisnis kritis (ambang selisih berat, formula settlement) wajib disertai referensi ke bagian PRD/architecture yang relevan dalam commit message atau PR description.

---

## 11. Perawatan File Ini

Jangan jadikan `Rules.md` tempat sampah. Kalau setiap insiden langsung ditambahkan baris baru tanpa pernah dirapikan, file ini membengkak dan AI justru makin sering keliru karena kebanjiran instruksi yang saling tumpang tindih.

- Review ulang berkala (disarankan tiap awal fase implementasi baru — lihat `PRD.md` §24).
- Pisahkan aturan yang **benar-benar harus selalu dibaca** (larangan keamanan, immutability bukti, aturan idempotensi) dari aturan **situasional** (gaya penulisan test tertentu, konvensi sementara) — pindahkan aturan situasional ke dokumentasi tim/PR description jika sudah tidak relevan secara umum.
- Saat menambah larangan baru dari sebuah insiden, tulis ringkas dan tegas — bukan narasi panjang tentang insidennya.
