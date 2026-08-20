# PRD --- Laundrie

**Dokumen Persyaratan Produk (PRD)**\
**Produk:** Laundrie --- Penjemputan, Pengantaran & Marketplace Laundry
Platform\
**Status dokumen:** Diperbarui / Definisi Produk\
**Version:** 2.0\
**Terakhir diperbarui:** 20 Agustus 2026\
**Tujuan utama:** Membangun MVP yang siap produksi dan menghubungkan
pelanggan, laundry mitra, dan kurir dalam satu alur operasional,
dengan verifikasi berat yang transparan dan penetapan harga yang dapat diaudHal tersebut.

------------------------------------------------------------------------

## 1. Ringkasan Eksekutif

Laundrie adalah marketplace laundry digital dan platform orkestrasi
yang terinspirasi oleh model kemudahan platform pesan-antar makanan. Pelanggan
dapat menemukan laundry mitra terdekat, memilih layanan, meminta penjemputan,
melacak status pesanan, menerima laundry di rumah, dan membayar melalui
platform.

Pembeda utama adalah **transparansi berat**. Ketika laundry mitra
menerima pesanan, laundry wajib melakukan proses penimbangan dan
mengambil bukti foto dari timbangan. Platform mencatat
berat aktual, timestamp, pesanan, identitas staf, dan metadata bukti.
Bukti tidak dapat diubah setelah dikonfirmasi dan dilampirkan pada
invoice pelanggan.

MVP sengaja dirancang sebagai **monolit modular**, bukan
sistem microservice. Stack yang dipilih adalah React + TypeScript + Vite/PWA
di frontend, Laravel 13/PHP 8.3+ di backend, PostgreSQL sebagai
database utama, Redis untuk cache/queue, dan object storage yang kompatibel dengan S3
untuk foto dan invoice yang dihasilkan. Kafka dan Go sengaja
tidak digunakan dalam core MVP untuk menghindari kompleksitas operasional terlalu dini. Go
may be introduced later for specialized high-concurrency services such
as dispatch, tracking, or route .

------------------------------------------------------------------------

## 2. Visi Produk

Membuat penjemputan dan pengantaran laundry sesederhana memesan makanan: pilih
layanan, jadwalkan penjemputan, biarkan platform mengoordinasikan sisanya, dan
terima bukti transparan mengenai apa yang ditimbang dan bagaimana biaya dihitung.

Visi jangka panjangnya bukan sekadar direktori laundry. Laundrie harus
menjadi jaringan operasional yang menghubungkan:

-   pelanggan;
-   laundry mitra;
-   kurir;
-   pembayaran;
-   manajemen status pesanan;
-   bukti dan audit;
-   notifikasi;
-   kualitas layanan;
-   analitik operasional.

------------------------------------------------------------------------

## 3. Pernyataan Masalah

### 3.1 Masalah pelanggan

Pelanggan sering menunda atau menghindari laundry karena:

-   keterbatasan waktu;
-   tidak praktisnya membawa pakaian;
-   ketidakpastian terkait penjemputan dan pengantaran;
-   harga akhir yang tidak jelas;
-   kualitas laundry yang tidak konsisten;
-   ketidakpastian mengenai berat aktual;
-   sulit membandingkan penyedia laundry di sekitar;
-   proses komplain dan refund yang lemah.

### 3.2 Masalah laundry mitra

Laundry kecil dan menengah dapat mengalami:

-   infrastruktur pemesanan digital yang terbatas;
-   komunikasi pelanggan yang terfragmentasi;
-   koordinasi penjemputan secara manual;
-   kesulitan memperoleh pelanggan baru;
-   pelacakan pesanan yang lemah;
-   tidak memiliki sistem bukti yang terstandarisasi;
-   analitik operasional yang terbatas.

### 3.3 Masalah kurir

Kurir independen maupun kurir khusus membutuhkan:

-   penugasan pekerjaan yang jelas;
-   informasi penjemputan/pengantaran;
-   alur status;
-   visibilitas pendapatan;
-   bukti penjemputan dan pengantaran;
-   informasi rute.

### 3.4 Masalah yang harus diselesaikan platform

Laundrie harus menyinkronkan tiga pihak operasional tanpa membuat
pelanggan harus memahami kompleksitas internal sistem.

Yang dilihat pelanggan:

> Order → Penjemputan → Laundry → Pengantaran

Secara internal, sistem mengelola:

> Order → Dispatch → Penjemputan → Laundry intake → Weighing evidence → Price
> finalization → Processing → Ready → Pengantaran → Completion

------------------------------------------------------------------------

## 4. Prinsip Produk

1.  **Utamakan kemudahan.** Pelanggan tidak seharusnya mengoordinasikan laundry,
    kurir, dan mitra secara manual.
2.  **Bukti lebih utama daripada klaim.** Fakta operasional penting harus memiliki
    catatan sistem dan bukti jika memungkinkan.
3.  **Transparansi harga.** Estimated price and final price must be
    distinguishable.
4.  **Riwayat tidak dapat diubah secara diam-diam.** Bukti penting dan perubahan status harus
    tidak ditimpa secara diam-diam.
5.  **Kesederhanaan operasional.** Mitra harus membutuhkan sesedikit mungkin tindakan
    sebisa mungkin.
6.  **Mulai dengan monolit modular.** Bangun satu backend yang koheren sebelum
    memperkenalkan sistem terdistribusi.
7.  **Skalakan ketika memang dibutuhkan.** Redis cukup untuk queue dan cache MVP;
    Kafka disiapkan untuk arsitektur event-streaming
    di masa depan.
8.  **Operasional mobile-first.** Antarmuka pelanggan, kurir, dan laundry
    harus bekerja dengan baik di ponsel.
9.  **Kepercayaan adalah fitur produk.** Bukti berat, timestamp, audit
    trail, dan invoice transparan merupakan bagian dari produk, bukan sekadar
    alat admin.

------------------------------------------------------------------------

## 5. Tujuan

### 5.1 Tujuan MVP

-   Memungkinkan pelanggan mendaftar dan mengelola alamat.
-   Menampilkan laundry mitra dan layanan yang tersedia.
-   Membuat pesanan laundry.
-   Mendukung penjemputan dan pengantaran.
-   Menetapkan pekerjaan kurir.
-   Memungkinkan laundry mitra menerima dan memproses pesanan.
-   Mewajibkan pencatatan berat aktual saat laundry menerima pakaian.
-   Mewajibkan bukti foto dari proses penimbangan.
-   Memberi tahu pelanggan ketika berat aktual dan harga tersedia.
-   Menghasilkan invoice yang berisi bukti berat.
-   Mendukung integrasi pembayaran online.
-   Menyimpan riwayat pesanan dan audHal tersebut.
-   Menyediakan dashboard operasional untuk administrator.

### 5.2 Tujuan bisnis

-   Memvalidasi kesediaan pelanggan membayar layanan penjemputan/pengantaran.
-   Memvalidasi kesediaan mitra bergabung dengan platform.
-   Membangun perilaku pemesanan berulang.
-   Mengurangi sengketa terkait berat dan harga.
-   Membangun playbook operasional yang dapat diulang untuk satu area peluncuran.

------------------------------------------------------------------------

## 6. Hal yang Bukan Tujuan MVP

Hal-hal berikut sengaja tidak dimasukkan ke MVP produksi pertama
kecuali bukti operasional menunjukkan bahwa hal tersebut diperlukan:

-   operasi nasional;
-   robot otonom;
-   optimasi rute kompleks;
-   penetapan harga berbasis AI tingkat lanjut;
-   event streaming Kafka;
-   dekomposisi penuh menjadi microlayanan;
-   pembuatan hardware khusus;
-   pengenalan bahan kain otomatis;
-   deteksi kerusakan pakaian otomatis;
-   manajemen gudang penuh;
-   pembayaran internasional;
-   mesin pajak multi-negara;
-   ekosistem loyalitas yang kompleks;
-   alur pengadaan enterprise.

------------------------------------------------------------------------

## 7. Target Pengguna

### 7.1 Pelanggan

Seseorang yang ingin laundry dijemput, diproses, dan dikembalikan tanpa
harus datang ke tempat laundry.

### 7.2 Laundry Mitra

Bisnis laundry terverifikasi yang menerima pesanan, menimbang laundry,
memprosesnya, memperbarui status pesanan, dan menyiapkan pesanan untuk kurir
antar.

### 7.3 Staf Laundry

Staf yang mengoperasikan dashboard/aplikasi mitra, terutama untuk
penerimaan, penimbangan, pemrosesan, dan serah terima.

### 7.4 Kurir

Operator penjemputan/pengantaran yang menerima pekerjaan dan mencatat
kejadian penjemputan dan pengantaran.

### 7.5 Admin Operasional

Staf platform yang bertanggung jawab atas mitra, kurir, pesanan, sengketa,
harga, dan pengecualian operasional.

### 7.6 Admin Keuangan

Staf berwenang yang dapat meninjau pembayaran, refund, settlement mitra,
dan biaya platform.

### 7.7 Super Admin

Administrator tingkat sistem dengan hak konfigurasi dan keamanan.

------------------------------------------------------------------------

## 8. Peran dan Hak Akses Pengguna

  -----------------------------------------------------------------------
  Role                                Hak akses utama
  ----------------------------------- -----------------------------------
  Customer                            Melihat, memesan, membayar, melacak, memberi ulasan,
                                      mengajukan sengketa

  Laundry Staf                       Menerima, menimbang, mengunggah bukti,
                                      memproses, memperbarui status

  Laundry Manager                     Mengelola cabang, layanan, staf,
                                      harga, pesanan, laporan

  Courier                             Melihat pekerjaan, menjemput, mengantar, mengunggah
                                      bukti

  Operations Admin                    Mengelola pesanan, pengguna, mitra,
                                      kurir, sengketa

  Finance Admin                       Pembayaran, refund, settlement,
                                      rekonsiliasi

  Super Admin                         Konfigurasi penuh platform
  -----------------------------------------------------------------------

Hak akses wajib ditegakkan di sisi server. Menyembunyikan elemen di frontend bukan
kontrol keamanan.

------------------------------------------------------------------------

## 9. Alur Utama Pelanggan

1.  Pelanggan membuka Laundrie.
2.  Pelanggan memilih alamat.
3.  Sistem menampilkan laundry mitra yang tersedia.
4.  Pelanggan memilih laundry.
5.  Pelanggan memilih layanan.
6.  Pelanggan memasukkan perkiraan jumlah/berat jika relevan.
7.  Pelanggan memilih slot penjemputan.
8.  Sistem menghitung harga estimasi.
9.  Pelanggan mengonfirmasi pesanan.
10. Kurir ditugaskan.
11. Kurir menjemput pakaian.
12. Laundry menerima pakaian.
13. Laundry menimbang pakaian.
14. Laundry mengambil bukti penimbangan.
15. Sistem menghitung harga layanan aktual.
16. Pelanggan menerima notifikasi berat aktual.
17. Pembayaran difinalisasi sesuai kebijakan pembayaran.
18. Laundry memproses pakaian.
19. Laundry menandai pesanan siap.
20. Kurir menerima pekerjaan pengantaran.
21. Kurir mengantarkan pakaian.
22. Pelanggan mengonfirmasi penerimaan.
23. Pesanan selesai.
24. Pelanggan dapat memberi rating untuk laundry/kurir.

------------------------------------------------------------------------

## 10. Alur Utama Mitra

1.  Mitra menerima notifikasi pesanan.
2.  Staf menerima pesanan atau sistem mengonfirmasi otomatis sesuai
    konfigurasi.
3.  Kurir tiba.
4.  Staf/kurir memverifikasi identitas pesanan.
5.  Laundry menerima pakaian.
6.  Staf membuka alur penerimaan.
7.  Staf menimbang pakaian.
8.  Staf mengambil foto timbangan menggunakan kamera dalam aplikasi.
9.  Sistem mencatat berat dan metadata bukti.
10. Staf mengonfirmasi bukti.
11. Sistem menghitung harga final.
12. Pelanggan diberi tahu.
13. Staf memproses pakaian.
14. Staf mencatat pengecualian jika diperlukan.
15. Staf menandai pesanan siap.
16. Kurir mengambil pesanan yang telah diproses.
17. Pesanan masuk ke tahap pengantaran.

------------------------------------------------------------------------

## 11. Alur Utama Kurir

1.  Kurir masuk.
2.  Kurir menjadi tersedia.
3.  Sistem menetapkan pekerjaan penjemputan/pengantaran.
4.  Kurir melihat detail pelanggan dan mitra.
5.  Kurir menuju lokasi penjemputan.
6.  Kurir mengonfirmasi kedatangan.
7.  Kurir memverifikasi kode/QR pesanan.
8.  Kurir mengambil paket.
9.  Kurir mencatat bukti penjemputan.
10. Kurir mengantarkan ke laundry.
11. Laundry mengonfirmasi penerimaan.
12. Untuk pengantaran, kurir menerima pesanan yang sudah siap.
13. Kurir menuju pelanggan.
14. Kurir mencatat bukti pengantaran.
15. Pelanggan mengonfirmasi penerimaan.
16. Pekerjaan kurir ditutup.

------------------------------------------------------------------------

## 12. Model Marketplace

Laundrie adalah lapisan platform, bukan bisnis laundry itu sendiri.

Platform mengoordinasikan:

``` text
Customer
   │
   ▼
Laundrie Platform
   │
   ├── Partner Laundry
   ├── Courier
   ├── Payment
   ├── Evidence
   └── Notifications
```

Platform dapat memperoleh pendapatan melalui:

-   biaya layanan;
-   margin biaya pengantaran;
-   komisi mitra;
-   paket langganan untuk mitra pada fase berikutnya;
-   penempatan promosi pada fase berikutnya.

MVP sebaiknya menghindari monetisasi yang terlalu rumHal tersebut. Tujuan utama
adalah membuktikan volume transaksi dan ekonomi operasional.

------------------------------------------------------------------------

## 13. Jenis Layanan

Contoh layanan awal:

-   Cuci & Lipat;
-   Cuci & Setrika;
-   Dry Cleaning;
-   Laundry Ekspres;
-   Seprai/Linen;
-   Sepatu atau item khusus jika didukung mitra.

Setiap layanan harus mendefinisikan:

-   model harga;
-   biaya minimum;
-   perkiraan waktu pengerjaan;
-   jenis item yang didukung;
-   add-on opsional;
-   ketersediaan layanan;
-   aturan berat/unHal tersebut.

------------------------------------------------------------------------

## 14. Model Penetapan Harga

Sistem harus membedakan:

**Harga estimasi** --- ditampilkan sebelum laundry menerima pakaian.\
**Harga final** --- dihitung dari hasil pengukuran penerimaan yang terverifikasi dan
aturan yang berlaku.

Generic formula:

``` text
Final Price
= Service Charge
+ (Actual Weight × Price Per Unit)
+ Add-ons
+ Pickup Fee
+ Delivery Fee
+ Platform Fee
- Discounts
```

Formula aktual harus dapat dikonfigurasi per layanan dan mitra.

------------------------------------------------------------------------

## 15. Berat Estimasi

Pelanggan dapat memasukkan berat estimasi jika berguna untuk penetapan harga atau
perencanaan kapasitas.

Example:

``` text
Estimated Weight: 5.00 KG
Estimated Service Price: Rp40,000
```

Nilai estimasi tidak boleh pernah dianggap sebagai berat terverifikasi.

------------------------------------------------------------------------

## 16. Berat Terverifikasi

Berat terverifikasi dicatat ketika laundry mitra menerima
pakaian.

Example:

``` text
Estimated: 5.00 KG
Verified: 4.60 KG
```

Berat terverifikasi menjadi dasar penetapan harga jika layanan menggunakan
perhitungan berdasarkan berat.

------------------------------------------------------------------------

## 17. Bukti Berat --- Fitur Inti Kepercayaan

Setiap pesanan yang relevan harus memiliki catatan bukti penimbangan sebelum
harga final dikonfirmasi.

Persyaratan minimum bukti:

-   ID pesanan;
-   ID laundry mitra;
-   ID staf;
-   berat terukur;
-   unit;
-   timestamp pengambilan;
-   bukti foto;
-   hash foto;
-   status bukti.

Metadata bukti opsional:

-   ID perangkat;
-   lokasi perkiraan jika diizinkan;
-   identitas timbangan;
-   ID sesi pengambilan.

------------------------------------------------------------------------

## 18. Persyaratan Kamera Dalam Aplikasi

Untuk bukti penimbangan, alur MVP yang disarankan adalah:

``` text
Open order
   ↓
Start weighing
   ↓
Open camera
   ↓
Capture photo
   ↓
Preview
   ↓
Confirm
   ↓
Submit evidence
```

Aplikasi sebaiknya mencegah atau menonaktifkan upload bebas dari galeri
untuk alur utama bukti penimbangan.

Hal ini tidak membuat kecurangan menjadi mustahil, tetapi mengurangi penggunaan
foto lama yang tidak terkaHal tersebut.

------------------------------------------------------------------------

## 19. Watermark

Setelah pengambilan, backend atau pipeline client tepercaya harus menghasilkan an
evidence representation with system metadata such as:

``` text
LAUNDRIE
Order: LDR-2026-000183
Weight: 4.60 KG
Captured: 20 Aug 2026 14:32:18
Laundry: CleanWash
Staff: ST-002
Evidence: WE-000183
```

Nilai watermark harus berasal dari catatan sistem, bukan teks manual yang dimasukkan
oleh staf.

The original evidence file and generated display/evidence version must
be dikelola sesuai kebijakan retensi.

------------------------------------------------------------------------

## 20. Bukti Tidak Dapat Diubah

Setelah bukti dikonfirmasi, catatan tidak boleh diedit secara diam-diam.

Jika terjadi kesalahan:

``` text
Evidence #1
Status: INVALIDATED
Reason: Camera obstructed

Evidence #2
Status: CONFIRMED
```

Sistem mempertahankan kedua catatan untuk keperluan audHal tersebut.

Field bukti penting sebaiknya bersifat append-only setelah konfirmasi.

------------------------------------------------------------------------

## 21. Hash Bukti

Sistem harus menghitung hash kriptografis seperti SHA-256 untuk
file bukti yang disimpan.

``` text
Captured file
    ↓
SHA-256
    ↓
photo_hash
```

Jika file berubah kemudian, hash-nya juga berubah.

Hashing memberikan verifikasi integritas; hashing tidak membuktikan bahwa
timbangan fisik itu sendiri benar.

------------------------------------------------------------------------

## 22. Audit Trail Bukti

Example:

``` text
ORDER #LDR-000183
│
├── 14:21 Courier pickup
├── 14:31 Laundry received
├── 14:32 Weighing started
├── 14:32 Evidence captured
│      Weight: 4.60 KG
│      Staff: ST-002
│      Evidence: WE-000183
├── 14:33 Customer notified
├── 14:35 Price finalized
└── 14:36 Processing started
```

Setiap kejadian penting harus berisi:

-   aktor;
-   timestamp;
-   aksi;
-   entitas target;
-   metadata relevan;
-   sumber jika memungkinkan.

------------------------------------------------------------------------

## 23. Aturan Selisih Berat

Sistem harus mendukung ambang selisih yang dapat dikonfigurasi.

Contoh kebijakan awal:

  Selisih dari estimasi   Tindakan
  -------------------------- ---------------------------------------
  ≤ 10%                      Alur normal
  \> 10%                     Notifikasi pelanggan
  \> 30%                     Ulasan manual / konfirmasi lebih kuat

Nilai ini adalah default produk awal, bukan aturan bisnis permanen.
Data pilot harus digunakan untuk mengkalibrasinya.

------------------------------------------------------------------------

## 24. Notifikasi Berat kepada Pelanggan

Ketika berat aktual dicatat, pelanggan harus menerima:

-   berat aktual;
-   berat estimasi;
-   selisih harga;
-   foto bukti;
-   total terbaru;
-   tindakan berikutnya jika diperlukan konfirmasi.

Example:

``` text
Laundry received

Estimated: 5.00 KG
Actual: 4.60 KG

Updated price: Rp36,800

[View weighing evidence]
```

------------------------------------------------------------------------

## 25. Kebijakan Konfirmasi Pelanggan

Platform harus membedakan antara:

-   finalisasi harga otomatis untuk selisih kecil yang normal;
-   konfirmasi eksplisit pelanggan untuk selisih besar atau
    pengecualian yang ditentukan kebijakan.

Kebijakan persisnya dapat bergantung pada kemampuan penyedia pembayaran dan
kontrak mitra.

------------------------------------------------------------------------

## 26. Persyaratan Invoice

Invoice final harus berisi:

-   nomor invoice;
-   nomor pesanan;
-   pelanggan;
-   laundry mitra;
-   layanan;
-   berat estimasi;
-   berat aktual terverifikasi;
-   harga per unit;
-   subtotal layanan;
-   biaya penjemputan;
-   biaya pengantaran;
-   biaya platform;
-   diskon;
-   pajak jika berlaku;
-   total final;
-   status pembayaran;
-   referensi bukti penimbangan;
-   gambar bukti atau representasi bukti aman jika sesuai;
-   timestamp.

------------------------------------------------------------------------

## 27. Contoh Invoice

``` text
LAUNDRIE
Laundry Invoice

Order: LDR-2026-000183
Customer: Randy
Laundry: CleanWash

Service: Wash & Fold

Estimated Weight      5.00 KG
Actual Weight         4.60 KG
Price / KG            Rp8,000
Service               Rp36,800
Pickup                Rp5,000
Delivery              Rp5,000
Platform Fee          Rp2,000

TOTAL                 Rp48,800

WEIGHING EVIDENCE
[Evidence Photo]
Weight: 4.60 KG
Recorded: 20 Aug 2026 14:32:18
Evidence ID: WE-000183

Payment: PAID
```

------------------------------------------------------------------------

## 28. Pembuatan Invoice

Pembuatan invoice sebaiknya berjalan secara asynchronous jika memungkinkan.

``` text
Order finalized
    ↓
Event
    ↓
Redis Queue
    ↓
Invoice Worker
    ↓
Generate PDF
    ↓
Object Storage
    ↓
Store invoice path
```

Hal ini mencegah pembuatan PDF menghambat request
yang sedang diproses untuk pelanggan.

------------------------------------------------------------------------

## 29. Model Status Pesanan

Siklus status yang disarankan:

``` text
DRAFT
↓
PENDING_PAYMENT
↓
CONFIRMED
↓
COURIER_ASSIGNED
↓
PICKUP_EN_ROUTE
↓
PICKED_UP
↓
RECEIVED_AT_LAUNDRY
↓
WEIGHING_REQUIRED
↓
WEIGHT_VERIFIED
↓
PRICE_FINALIZED
↓
PROCESSING
↓
READY_FOR_DELIVERY
↓
DELIVERY_ASSIGNED
↓
DELIVERY_EN_ROUTE
↓
DELIVERED
↓
COMPLETED
```

Status pengecualian dapat meliputi:

-   CANCELLED;
-   PAYMENT_FAILED;
-   WEIGHT_REVIEW_REQUIRED;
-   CUSTOMER_DISPUTE;
-   PARTNER_EXCEPTION;
-   DELIVERY_FAILED;
-   REFUND_PENDING;
-   REFUNDED.

------------------------------------------------------------------------

## 30. Aturan Perubahan Status

Backend harus menegakkan transisi status yang valid.

Example:

``` text
PROCESSING → COMPLETED
```

tidak boleh diizinkan jika kejadian pengantaran yang diperlukan belum terjadi.

Similarly:

``` text
RECEIVED_AT_LAUNDRY → PROCESSING
```

tidak boleh diizinkan untuk layanan berbasis berat sampai bukti penimbangan yang diperlukan
dikonfirmasi, kecuali override admin dicatat secara eksplisHal tersebut.

------------------------------------------------------------------------

## 31. Pembatalan Pesanan

Aturan pembatalan harus bergantung pada status.

Example:

-   sebelum kurir ditugaskan: pelanggan dapat membatalkan dengan bebas;
-   setelah dispatch penjemputan: pembatalan dapat dikenai biaya;
-   setelah laundry menerima pakaian: pembatalan/refund memerlukan
    kebijakan operasional;
-   setelah pemrosesan: pembatalan mungkin tidak diizinkan kecuali oleh
    support/admin.

Aturan harus dapat dikonfigurasi.

------------------------------------------------------------------------

## 32. Penjadwalan Penjemputan

Pelanggan memilih slot penjemputan.

Sebuah slot harus memiliki:

-   waktu mulai;
-   waktu selesai;
-   area layanan;
-   kapasitas;
-   ketersediaan;
-   aturan hari libur/blackout.

MVP dapat menggunakan jendela waktu tetap daripada optimasi rute real-time
.

------------------------------------------------------------------------

## 33. Penjadwalan Pengantaran

Pengantaran dapat diperkirakan berdasarkan waktu pemrosesan laundry dan
jendela pengantaran yang dikonfigurasi.

Platform harus mengomunikasikan:

-   perkiraan waktu siap;
-   perkiraan jendela pengantaran;
-   keterlambatan;
-   pengecualian.

------------------------------------------------------------------------

## 34. Dispatch Kurir --- MVP

Dispatch MVP dapat menggunakan mesin penugasan sederhana berdasarkan:

-   ketersediaan kurir;
-   area layanan;
-   pekerjaan aktif saat ini;
-   jarak perkiraan;
-   kapasitas.

Jangan membangun optimasi tingkat lanjut sebelum volume transaksi memang membenarkannya.
Hal tersebut.

------------------------------------------------------------------------

## 35. Service Dispatch Kurir di Masa Depan

Pada skala lebih tinggi, dispatch dapat dipisahkan menjadi service Go:

``` text
Laravel
  ↓
Dispatch API / Event
  ↓
Go Dispatch Service
  ↓
Courier availability
  ↓
Location / route calculations
```

Ini adalah optimasi masa depan, bukan dependensi MVP.

------------------------------------------------------------------------

## 36. Onboarding Mitra

Onboarding mitra harus mengumpulkan:

-   nama bisnis;
-   informasi pemilik/manajer;
-   detail kontak;
-   alamat operasional;
-   jam operasional;
-   katalog layanan;
-   harga;
-   informasi rekening bank/settlement pembayaran;
-   dokumen verifikasi bisnis jika diperlukan;
-   kapasitas operasional;
-   akun staf laundry.

------------------------------------------------------------------------

## 37. Verifikasi Mitra

Status mitra:

``` text
PENDING
→ DOCUMENT_REVIEW
→ VERIFIED
→ ACTIVE
```

Status penolakan/suspensi yang mungkin:

-   REJECTED;
-   SUSPENDED;
-   CLOSED.

------------------------------------------------------------------------

## 38. Cabang Laundry

Model data harus mendukung banyak cabang per mitra sejak
awal, meskipun pilot diluncurkan hanya dengan satu cabang.

Sebuah cabang memiliki:

-   alamat;
-   service radius;
-   jam operasional;
-   staf;
-   layanan;
-   harga;
-   kapasitas;
-   status aktif.

------------------------------------------------------------------------

## 39. Manajemen Staf

Manajer laundry dapat membuat atau mengundang staf.

Peran staf dapat meliputi:

-   staf penerimaan;
-   staf pemrosesan;
-   manajer.

Setiap tindakan operasional harus mengidentifikasi akun staf jika memungkinkan.

------------------------------------------------------------------------

## 40. Onboarding Kurir

Onboarding kurir mengumpulkan:

-   informasi identitas;
-   nomor telepon;
-   jenis kendaraan;
-   area layanan;
-   ketersediaan;
-   informasi pembayaran;
-   dokumen verifikasi jika diperlukan.

Courier status:

``` text
PENDING → VERIFIED → ACTIVE → SUSPENDED
```

------------------------------------------------------------------------

## 41. Akun Pelanggan

Profil pelanggan mencakup:

-   nama;
-   nomor telepon;
-   email jika digunakan;
-   alamat tersimpan;
-   riwayat pesanan;
-   referensi pembayaran;
-   preferensi notifikasi.

Informasi pembayaran sensitif tidak boleh disimpan jika tidak diperlukan.

------------------------------------------------------------------------

## 42. Manajemen Alamat

Alamat pelanggan harus mendukung:

-   label;
-   nama penerima;
-   nomor telepon;
-   baris alamat;
-   latitude/longitude jika integrasi peta digunakan;
-   catatan pengantaran;
-   status aktif/default.

Visibilitas alamat lengkap harus dibatasi kepada pengguna yang membutuhkannya
untuk kebutuhan operasional.

------------------------------------------------------------------------

## 43. Pencarian Laundry

Pelanggan dapat menelusuri laundry mitra berdasarkan:

-   ketersediaan layanan;
-   jarak;
-   perkiraan waktu pengerjaan;
-   harga;
-   rating;
-   status operasional.

Peringkat pencarian pada awalnya tidak perlu diperlakukan sebagai sistem rekomendasi
yang kompleks.

------------------------------------------------------------------------

## 44. Halaman Detail Laundry

Harus menampilkan:

-   nama laundry;
-   status verifikasi;
-   layanan;
-   prices;
-   perkiraan waktu pengerjaan;
-   jam operasional;
-   area layanan;
-   rating/ulasan jika data sudah mencukupi;
-   ketersediaan saat ini.

------------------------------------------------------------------------

## 45. Keranjang / Draft Pesanan

Sebelum checkout, pelanggan melihat:

-   laundry yang dipilih;
-   layanan yang dipilih;
-   berat/jumlah estimasi;
-   alamat penjemputan;
-   slot penjemputan;
-   alamat pengantaran;
-   subtotal estimasi;
-   biaya;
-   diskon;
-   total estimasi.

------------------------------------------------------------------------

## 46. Checkout

Checkout harus menyatakan dengan jelas:

> Harga final dapat berubah setelah penerimaan laundry terverifikasi ketika layanan yang dipilih
> berbasis berat.

Pemberitahuan ini penting untuk mencegah pelanggan terkejut.

------------------------------------------------------------------------

## 47. Arsitektur Pembayaran

Platform sebaiknya menggunakan payment gateway seperti Midtrans atau
penyedia yang setara.

Backend harus menyimpan:

-   payment intent/referensi pembayaran;
-   relasi pesanan;
-   jumlah;
-   mata uang;
-   status;
-   referensi respons gateway;
-   timestamp.

Jangan pernah menjadikan tampilan sukses pembayaran di sisi client sebagai sumber kebenaran.

------------------------------------------------------------------------

## 48. Status Pembayaran

Disarankan:

``` text
PENDING
AUTHORIZED
PAID
FAILED
EXPIRED
REFUND_PENDING
REFUNDED
PARTIALLY_REFUNDED
```

Status persis bergantung pada integrasi gateway.

------------------------------------------------------------------------

## 49. Webhook Pembayaran

Webhook payment gateway harus divalidasi di sisi server.

Flow:

``` text
Payment Gateway
      ↓
Webhook
      ↓
Laravel
      ↓
Signature / authenticity validation
      ↓
Idempotent payment update
      ↓
Order state update
```

Webhook duplikat tidak boleh membuat tagihan atau perubahan status ganda.

------------------------------------------------------------------------

## 50. Refund

Permintaan refund harus dapat diaudHal tersebut.

Data yang diperlukan:

-   ID refund;
-   ID pesanan;
-   ID pembayaran;
-   jumlah;
-   alasan;
-   diminta oleh;
-   disetujui oleh;
-   referensi gateway;
-   status;
-   timestamp.

------------------------------------------------------------------------

## 51. Settlement Mitra

Settlement mitra harus dihitung dari pesanan yang selesai.

Example:

``` text
Gross customer payment
- platform commission
- applicable discounts funded by platform
- delivery/platform adjustments
= partner payable
```

Aturan settlement harus dapat dikonfigurasi dan memiliki versi.

------------------------------------------------------------------------

## 52. Pendapatan Kurir

Pendapatan kurir harus dihitung dari pekerjaan yang selesai berdasarkan
aturan yang dikonfigurasi.

The MVP may use:

``` text
Base delivery fee
+ distance/zone adjustment
+ peak bonus if enabled
- applicable deductions
```

------------------------------------------------------------------------

## 53. Notifikasi

Saluran dapat mencakup:

-   notifikasi push;
-   WhatsApp/SMS jika dibutuhkan secara operasional;
-   email untuk invoice/struk.

Kejadian penting:

-   pesanan dikonfirmasi;
-   kurir ditugaskan;
-   kurir sedang tiba;
-   pakaian dijemput;
-   laundry diterima;
-   penimbangan selesai;
-   harga aktual tersedia;
-   pemrosesan dimulai;
-   siap diantar;
-   pengantaran ditugaskan;
-   telah diantar;
-   kejadian pembayaran/refund;
-   pembaruan sengketa.

------------------------------------------------------------------------

## 54. Arsitektur Notifikasi

Gunakan queued jobs untuk penyedia notifikasi eksternal.

``` text
Domain Event
   ↓
Redis Queue
   ↓
Notification Worker
   ├── Push
   ├── Email
   └── WhatsApp/SMS
```

------------------------------------------------------------------------

## 55. Pelacakan Pelanggan

Pelanggan harus melihat timeline yang disederhanakan:

``` text
✓ Order confirmed
✓ Courier picked up
✓ Laundry received
✓ Weight verified
✓ Washing
○ Ready for delivery
○ Delivered
```

UI sebaiknya tidak menampilkan detail operasional internal yang
tidak diperlukan.

------------------------------------------------------------------------

## 56. Dashboard Mitra

Dashboard should show:

-   pesanan hari ini;
-   penerimaan tertunda;
-   penimbangan diperlukan;
-   pesanan yang diproses;
-   pesanan siap;
-   pengecualian;
-   ringkasan pendapatan/settlement;
-   aktivitas staf jika berwenang.

------------------------------------------------------------------------

## 57. Layar Penerimaan Laundry

Layar penerimaan adalah alur prioritas tinggi.

Urutan yang diperlukan:

``` text
Scan order
↓
Verify package/order
↓
Start weighing
↓
Enter/receive weight
↓
Capture evidence
↓
Review evidence
↓
Confirm
```

Antarmuka harus meminimalkan pengetikan.

------------------------------------------------------------------------

## 58. UX Layar Penimbangan

Tampilkan secara jelas:

-   ID pesanan;
-   berat estimasi;
-   field berat aktual;
-   tombol kamera;
-   preview bukti;
-   persentase selisih;
-   harga yang dihitung;
-   tombol submHal tersebut.

Example:

``` text
Order #183
Estimated: 5.00 KG

Actual Weight
[ 4.60 ] KG

[ TAKE SCALE PHOTO ]

Difference: -8.0%
Status: Normal

[ CONFIRM WEIGHT ]
```

------------------------------------------------------------------------

## 59. Integrasi Timbangan Digital --- Masa Depan

Versi mendatang dapat mengintegrasikan timbangan digital yang kompatibel melalui:

-   Bluetooth;
-   USB/local gateway;
-   API timbangan yang terhubung jaringan.

Alur target:

``` text
Digital Scale
    ↓
Weight reading
    ↓
Laundrie app
    ↓
Verified measurement
    ↓
Evidence capture
```

Ini mengurangi input angka manual dan meningkatkan integritas pengukuran.

------------------------------------------------------------------------

## 60. Alur Pemrosesan

Mitra dapat menggunakan tahapan seperti:

``` text
RECEIVED
→ SORTING
→ WASHING
→ DRYING
→ FOLDING/IRONING
→ QUALITY_CHECK
→ PACKED
→ READY
```

MVP dapat menampilkan status yang disederhanakan sambil mempertahankan
kemampuan pengembangan internal.

------------------------------------------------------------------------

## 61. Pengecualian Laundry

Mitra harus dapat melaporkan:

-   noda yang tidak dapat dihilangkan;
-   item rusak yang ditemukan saat penerimaan;
-   item terlarang;
-   item hilang;
-   layanan tidak tersedia;
-   perlu dicuci ulang;
-   memerlukan klarifikasi pelanggan.

Setiap pengecualian harus memiliki alasan dan, jika sesuai, bukti
foto.

------------------------------------------------------------------------

## 62. Bukti Kerusakan

Jika mitra menemukan kerusakan yang sudah ada sebelumnya, sistem harus mendukung:

-   photo;
-   deskripsi;
-   timestamp;
-   ID staf;
-   notifikasi pelanggan.

Ini melindungi pelanggan dan mitra.

------------------------------------------------------------------------

## 63. Sistem Komplain

Pelanggan dapat membuat komplain terkait:

-   berat/harga;
-   item hilang;
-   item rusak;
-   penjemputan terlambat;
-   pengantaran terlambat;
-   kualitas layanan;
-   pesanan salah;
-   masalah pembayaran.

------------------------------------------------------------------------

## 64. Alur Sengketa

``` text
Customer complaint
      ↓
Case created
      ↓
Evidence collected
      ↓
Operations review
      ↓
Decision
      ↓
Refund / credit / rejection / partner action
      ↓
Case closed
```

------------------------------------------------------------------------

## 65. Paket Bukti untuk Sengketa

Kasus sengketa dapat menghubungkan:

-   timeline pesanan;
-   bukti penimbangan;
-   catatan pembayaran;
-   bukti penjemputan;
-   bukti pengantaran;
-   foto kerusakan;
-   catatan mitra;
-   pesan pelanggan;
-   kejadian audit yang relevan.

------------------------------------------------------------------------

## 66. Ulasan dan Rating

Pelanggan dapat memberi rating:

-   laundry;
-   courier;
-   pesanan secara keseluruhan.

Rating hanya boleh diberikan setelah pesanan selesai.

Moderasi ulasan harus mencegah spam dan penyalahgunaan.

------------------------------------------------------------------------

## 67. Manajemen Pesanan Admin

Admin dapat:

-   mencari pesanan;
-   melihat timeline;
-   memeriksa bukti;
-   memeriksa pembayaran;
-   menetapkan ulang kurir jika diizinkan;
-   menerbitkan refund jika berwenang;
-   menyelesaikan sengketa;
-   membatalkan validitas bukti dengan alasan wajib;
-   melihat audit log.

Tindakan admin harus diaudHal tersebut.

------------------------------------------------------------------------

## 68. Manajemen Mitra Admin

Admin dapat:

-   menyetujui/menolak mitra;
-   menangguhkan mitra;
-   mengonfigurasi ketersediaan layanan;
-   meninjau metrik operasional;
-   memeriksa sengketa;
-   memeriksa selisih berat;
-   meninjau kepatuhan bukti.

------------------------------------------------------------------------

## 69. Manajemen Kurir Admin

Admin dapat:

-   memverifikasi kurir;
-   menangguhkan/mengaktifkan;
-   melihat pekerjaan aktif;
-   meninjau pengantaran yang gagal;
-   memeriksa performa kurir;
-   mengelola data terkait pembayaran.

------------------------------------------------------------------------

## 70. Dashboard Kepatuhan Bukti

Dashboard operasional utama harus menampilkan:

-   persentase pesanan yang relevan dengan bukti penimbangan valid;
-   tingkat kegagalan pengambilan bukti;
-   tingkat pembatalan validitas bukti;
-   rata-rata selisih berat estimasi vs aktual;
-   mitra dengan selisih yang tidak biasa tinggi;
-   staf dengan pembatalan bukti yang tidak biasa tinggi;
-   sengketa pelanggan terkait berat.

Ini menciptakan kemampuan awal untuk memantau fraud/anomali tanpa
membutuhkan ML.

------------------------------------------------------------------------

## 71. Pemantauan Anomali Berat

Platform dapat menghitung:

``` text
weight_difference_pct
= (actual - estimated) / estimated × 100
```

Dikelompokkan berdasarkan:

-   mitra;
-   cabang;
-   staf;
-   layanan;
-   tanggal/waktu.

Selisih besar adalah sinyal untuk ditinjau, bukan bukti otomatis adanya fraud.

------------------------------------------------------------------------

## 72. Prinsip Pencegahan Fraud

Kontrol yang dapat digunakan:

-   kamera dalam aplikasi;
-   hash bukti;
-   timestamp;
-   catatan yang tidak dapat diubah;
-   identitas staf;
-   metadata perangkat;
-   dashboard anomali;
-   review admin;
-   integrasi timbangan digital di masa depan.

Tidak ada satu kontrol pun yang menjamin pencegahan fraud.

------------------------------------------------------------------------

## 73. Audit Log

Audit log harus mencatat tindakan penting:

-   kejadian login/keamanan jika sesuai;
-   pembuatan pesanan;
-   perubahan status pesanan;
-   pengiriman data berat;
-   konfirmasi/pembatalan validitas bukti;
-   finalisasi harga;
-   refund;
-   override admin;
-   perubahan penugasan mitra/kurir.

Field yang disarankan:

``` text
id
actor_type
actor_id
action
entity_type
entity_id
old_values
new_values
metadata
ip_address
user_agent
created_at
```

Nilai sensitif harus disamarkan atau diminimalkan.

------------------------------------------------------------------------

## 74. Gambaran Umum Model Data

Entitas inti:

``` text
users
customers
partners
branches
staff
couriers
addresses
services
service_prices
orders
order_items
order_status_histories
weight_measurements
weight_evidences
payments
refunds
settlements
courier_jobs
notifications
complaints
dispute_evidence
reviews
audit_logs
invoices
```

------------------------------------------------------------------------

## 75. `users`

Field yang disarankan:

``` text
id
name
email
phone
password_hash
status
last_login_at
created_at
updated_at
```

Field khusus penyedia autentikasi dapat ditambahkan secara terpisah.

------------------------------------------------------------------------

## 76. `partners`

``` text
id
business_name
legal_name
owner_user_id
verification_status
status
contact_phone
contact_email
created_at
updated_at
```

------------------------------------------------------------------------

## 77. `branches`

``` text
id
partner_id
name
address_id
latitude
longitude
operating_hours
status
capacity_config
created_at
updated_at
```

------------------------------------------------------------------------

## 78. `services`

``` text
id
branch_id
name
service_type
pricing_model
base_price
price_per_unit
unit
minimum_charge
estimated_duration
status
created_at
updated_at
```

Harga harus dapat diberi versi dalam implementasi produksi untuk menjaga
kebenaran invoice historis.

------------------------------------------------------------------------

## 79. `orders`

``` text
id
order_number
customer_id
branch_id
pickup_address_id
delivery_address_id
status
estimated_weight
actual_weight
estimated_total
final_total
currency
scheduled_pickup_start
scheduled_pickup_end
scheduled_delivery_start
scheduled_delivery_end
created_at
updated_at
completed_at
```

Berat aktual juga dapat dinormalisasi ke tabel pengukuran khusus
daripada disimpan langsung; duplikasi harus dikendalikan.

------------------------------------------------------------------------

## 80. `order_items`

``` text
id
order_id
service_id
quantity
unit_price
estimated_amount
final_amount
metadata
created_at
updated_at
```

------------------------------------------------------------------------

## 81. `weight_measurements`

``` text
id
order_id
measurement_type
estimated_value
actual_value
unit
evidence_id
recorded_by
recorded_at
status
created_at
updated_at
```

Catatan pengukuran tidak boleh ditimpa setelah finalisasi tanpa
alur koreksi yang eksplisHal tersebut.

------------------------------------------------------------------------

## 82. `weight_evidences`

``` text
id
order_id
measurement_id
branch_id
staff_id
weight
unit
photo_path
photo_hash
captured_at
confirmed_at
status
device_id
latitude
longitude
invalidated_at
invalidated_by
invalidation_reason
created_at
updated_at
```

Latitude/longitude hanya boleh disimpan jika secara hukum dan operasional
memang dibenarkan.

------------------------------------------------------------------------

## 83. `payments`

``` text
id
order_id
provider
provider_reference
amount
currency
status
paid_at
metadata
created_at
updated_at
```

------------------------------------------------------------------------

## 84. `invoices`

``` text
id
order_id
invoice_number
subtotal
fees
discount
tax
total
currency
status
pdf_path
generated_at
created_at
updated_at
```

Invoice harus mereferensikan bukti yang digunakan untuk perhitungan final
melalui relasi pesanan/pengukuran.

------------------------------------------------------------------------

## 85. `courier_jobs`

``` text
id
order_id
courier_id
job_type
status
assigned_at
accepted_at
started_at
completed_at
pickup_proof_path
delivery_proof_path
created_at
updated_at
```

------------------------------------------------------------------------

## 86. `complaints`

``` text
id
order_id
customer_id
category
status
priority
description
resolution
resolved_by
resolved_at
created_at
updated_at
```

------------------------------------------------------------------------

## 87. `audit_logs`

``` text
id
actor_type
actor_id
action
entity_type
entity_id
old_values
new_values
metadata
ip_address
user_agent
created_at
```

Aturan retensi dan privasi harus ditetapkan sebelum peluncuran produksi.

------------------------------------------------------------------------

## 88. ERD --- Tingkat Tinggi

``` text
USER
 ├── CUSTOMER ──< ORDER >── BRANCH ── PARTNER
 │                    │
 │                    ├── ORDER_ITEM >── SERVICE
 │                    ├── WEIGHT_MEASUREMENT
 │                    │          │
 │                    │          └── WEIGHT_EVIDENCE
 │                    ├── PAYMENT
 │                    ├── INVOICE
 │                    ├── COURIER_JOB >── COURIER
 │                    ├── COMPLAINT
 │                    └── ORDER_STATUS_HISTORY
 │
 └── STAFF ── BRANCH
```

------------------------------------------------------------------------

## 89. Desain API

API sebaiknya RESTful untuk MVP.

Contoh kelompok route:

``` text
/api/v1/auth
/api/v1/customers
/api/v1/partners
/api/v1/branches
/api/v1/services
/api/v1/orders
/api/v1/payments
/api/v1/courier
/api/v1/evidence
/api/v1/invoices
/api/v1/complaints
/api/v1/admin
```

Versioning harus diterapkan sejak awal.

------------------------------------------------------------------------

## 90. Contoh Alur API Pesanan

``` text
POST /api/v1/orders
        ↓
Order created
        ↓
POST /api/v1/orders/{id}/confirm
        ↓
Payment / confirmation
        ↓
Dispatch
        ↓
Partner intake
```

------------------------------------------------------------------------

## 91. Contoh API Bukti Berat

``` text
POST /api/v1/orders/{order}/weighing/start
POST /api/v1/orders/{order}/weighing/evidence
POST /api/v1/orders/{order}/weighing/confirm
GET  /api/v1/orders/{order}/weighing
```

Server harus memvalidasi bahwa aktor memiliki izin untuk melakukan setiap
aksi.

------------------------------------------------------------------------

## 92. Alur Upload Bukti

``` text
Mobile Camera
     ↓
Client validation
     ↓
Authenticated upload
     ↓
Object Storage temporary/private object
     ↓
Backend records metadata
     ↓
Hash verification
     ↓
Evidence confirmation
     ↓
Immutable record
```

Storage private lebih disarankan untuk bukti asli.

------------------------------------------------------------------------

## 93. Object Storage

Gunakan storage yang kompatibel dengan S3 untuk:

-   foto penimbangan;
-   foto kerusakan;
-   bukti penjemputan/pengantaran;
-   invoice;
-   dokumen mitra jika diperlukan.

Examples include Amazon S3 or Cloudflare R2.

Database menyimpan object key dan metadata, bukan file biner berukuran besar.

------------------------------------------------------------------------

## 94. Signed URL

Gambar bukti tidak boleh bersifat publik secara global secara default.

Gunakan signed URL berumur pendek untuk akses yang berwenang.

Example conceptual flow:

``` text
Customer requests evidence
       ↓
Laravel authorization
       ↓
Generate temporary signed URL
       ↓
Object storage
```

------------------------------------------------------------------------

## 95. Stack Frontend

MVP yang disarankan:

-   React;
-   TypeScript;
-   Vite;
-   PWA yang matang;
-   React Router;
-   pendekatan state management ringan jika diperlukan;
-   Tailwind CSS or equivalent UI system.

Antarmuka harus responsif dan dioptimalkan untuk operasional mobile.

------------------------------------------------------------------------

## 96. Stack Backend

MVP yang disarankan:

-   Laravel 13;
-   PHP 8.3+;
-   REST API;
-   Laravel Sanctum or appropriate token/session strategy;
-   Eloquent ORM;
-   Laravel Queue;
-   Laravel Horizon for Redis monitoring queue;
-   Laravel Scheduler for scheduled jobs.

------------------------------------------------------------------------

## 97. Stack Database

Database utama:

**PostgreSQL**

Alasan:

-   integritas relasional yang kuat;
-   transaksi;
-   pengindeksan;
-   JSONB untuk metadata fleksibel tertentu;
-   opsi ekstensi geospasial jika diperlukan;
-   ekosistem yang matang.

------------------------------------------------------------------------

## 98. Arsitektur Redis

Redis digunakan untuk:

-   queue;
-   cache;
-   rate limiting;
-   state sementara;
-   lock;
-   koordinasi job.

Example:

``` text
Laravel
  ├── PostgreSQL → durable business data
  └── Redis
       ├── Queue
       ├── Cache
       └── Locks
```

Redis bukan sumber kebenaran utama untuk pesanan atau pembayaran.

------------------------------------------------------------------------

## 99. Mengapa Bukan Kafka di MVP

Kafka berguna ketika platform membutuhkan event streaming durable berskala besar
di banyak service dan consumer yang independen.

Untuk MVP, Kafka akan menambah:

-   operasi cluster;
-   manajemen topic;
-   manajemen consumer;
-   kompleksitas monitoring;
-   beban deployment tambahan.

Masalah bisnis saat ini belum membutuhkan kompleksitas tersebut.

Pemicu pertimbangan Kafka di masa depan:

``` text
Multiple independent services
+ high event volume
+ replayable event streams
+ analytics/event consumers
+ operational need for distributed event architecture
```

------------------------------------------------------------------------

## 100. Mengapa Bukan Go untuk Backend MVP

Go secara teknis sangat kuat untuk service concurrent, tetapi menggunakan Go sebagai
seluruh backend MVP akan mengharuskan kita membangun lebih banyak infrastruktur aplikasi
yang sudah disediakan Laravel.

Prioritas MVP adalah:

> memvalidasi bisnis + meluncurkan alur operasional + mengumpulkan data.

Laravel menyediakan jalur yang lebih cepat untuk:

-   autentikasi;
-   CRUD;
-   validasi;
-   ORM;
-   queue;
-   notifikasi;
-   pengembangan API;
-   tugas terjadwal.

Go sebaiknya diperkenalkan ketika bottleneck yang terukur atau service khusus
memang membutuhkannya.

------------------------------------------------------------------------

## 101. Kandidat Service Go di Masa Depan

Service yang berpotensi:

1.  dispatch kurir;
2.  pemrosesan lokasi real-time;
3.  optimasi rute;
4.  gateway tracking volume tinggi;
5.  worker pemrosesan gambar jika beban CPU meningkat.

Batas service harus dibuat berdasarkan masalah scaling yang nyata, bukan
berdasarkan preferensi teknologi.

------------------------------------------------------------------------

## 102. Arsitektur yang Direkomendasikan

``` text
                         ┌───────────────────┐
                         │ Customer PWA       │
                         └─────────┬─────────┘
                                   │
                         ┌─────────▼─────────┐
                         │ Partner/Courier UI │
                         └─────────┬─────────┘
                                   │
                              HTTPS/API
                                   │
                         ┌─────────▼─────────┐
                         │ Laravel 13        │
                         │ Modular Monolith  │
                         └────┬────────┬─────┘
                              │        │
                 ┌────────────┘        └─────────────┐
                 ▼                                   ▼
          ┌──────────────┐                    ┌─────────────┐
          │ PostgreSQL   │                    │ Redis       │
          │ Source Data  │                    │ Cache/Queue │
          └──────────────┘                    └──────┬──────┘
                                                     │
                                              ┌──────▼──────┐
                                              │ Queue Worker │
                                              └──────┬──────┘
                                                     │
                    ┌────────────────────────────────┼───────────────┐
                    ▼                                ▼               ▼
             Invoice Worker                 Notification       Image/Evidence
                    │                         Worker             Worker
                    └──────────────────────────┬────────────────────┘
                                               ▼
                                      ┌─────────────────┐
                                      │ S3 / R2 Storage │
                                      └─────────────────┘
```

------------------------------------------------------------------------

## 103. Batas Modular Backend

Di dalam Laravel, organisasi kode berdasarkan domain, bukan satu folder controllers
raksasa.

Example:

``` text
app/Domain/
  Auth/
  Customer/
  Partner/
  Courier/
  Order/
  Pricing/
  Weighing/
  Evidence/
  Payment/
  Invoice/
  Notification/
  Complaint/
  Settlement/
  Admin/
```

Ini mempermudah ekstraksi menjadi service di masa depan tanpa memaksa
microservices sejak hari ini.

------------------------------------------------------------------------

## 104. Autentikasi

Autentikasi pelanggan, staf, kurir, dan admin harus dipisahkan secara logis
melalui role/hak akses.

Kontrol yang disarankan:

-   hashing password yang aman;
-   kedaluwarsa session/token;
-   verifikasi email/nomor telepon jika diperlukan;
-   MFA opsional untuk role dengan hak istimewa;
-   rate limiting login;
-   manajemen perangkat/session untuk role sensitif.

------------------------------------------------------------------------

## 105. Otorisasi

Gunakan otorisasi berbasis policy.

Contoh:

-   pelanggan hanya dapat melihat pesanan mereka;
-   staf dapat melihat pesanan yang ditugaskan ke cabang mereka;
-   kurir dapat melihat pekerjaan yang ditugaskan kepada mereka;
-   manajer mitra dapat melihat pesanan cabang;
-   admin dapat mengakses data lintas platform sesuai role.

------------------------------------------------------------------------

## 106. Persyaratan Keamanan

Persyaratan minimum:

-   HTTPS di seluruh sistem;
-   autentikasi aman;
-   otorisasi sisi server;
-   validasi input;
-   encoding output;
-   perlindungan CSRF jika berlaku;
-   rate limiting;
-   validasi upload file yang aman;
-   strategi pemindaian malware/konten untuk file yang diunggah jika
    sesuai;
-   manajemen secret;
-   backup database;
-   pencatatan audit;
-   least privilege.

------------------------------------------------------------------------

## 107. Keamanan Upload File

Upload bukti harus memvalidasi:

-   pengguna terautentikasi;
-   otorisasi;
-   tipe file;
-   MIME type;
-   ukuran file;
-   dimensi gambar;
-   konsistensi ekstensi/konten;
-   isolasi path penyimpanan.

Jangan pernah mempercayai filename atau MIME type dari client saja.

------------------------------------------------------------------------

## 108. Privasi

Sistem menangani:

-   nama;
-   nomor telepon;
-   alamat;
-   riwayat pesanan;
-   referensi pembayaran;
-   gambar bukti.

Akses harus dibatasi berdasarkan role dan kebutuhan bisnis.

Metadata lokasi harus opsional/diminimalkan kecuali diperlukan untuk suatu
fitur operasional.

------------------------------------------------------------------------

## 109. Retensi Data

Tentukan kebijakan retensi untuk:

-   invoice;
-   foto bukti;
-   bukti kurir;
-   audit log;
-   catatan pembayaran;
-   komplain.

Periode retensi harus mengikuti persyaratan hukum, akuntansi,
kontrak, dan operasional yang berlaku.

------------------------------------------------------------------------

## 110. Persyaratan Performa

Target awal MVP:

-   respons API normal secara umum harus di bawah 500 ms, tidak termasuk
    latensi penyedia eksternal;
-   upload gambar harus asynchronous jika memungkinkan;
-   pembuatan invoice tidak boleh menghambat operasi checkout/pesanan;
-   endpoint list harus menggunakan pagination;
-   query database harus memiliki index dan dipantau.

Ini adalah target engineering, bukan jaminan.

------------------------------------------------------------------------

## 111. Ketersediaan

Target awal:

-   environment produksi dipantau;
-   backup otomatis;
-   health check;
-   monitoring queue;
-   prosedur dasar pemulihan insiden.

Jangan mengeluarkan biaya besar untuk infrastruktur multi-region sebelum bisnis
memerlukannya.

------------------------------------------------------------------------

## 112. Observability

Pantau:

-   error API;
-   kegagalan queue;
-   kegagalan webhook pembayaran;
-   kegagalan upload bukti;
-   kegagalan pembuatan invoice;
-   performa database;
-   error storage;
-   kegagalan notifikasi.

Gunakan structured log dengan request ID/order ID untuk tracing.

------------------------------------------------------------------------

## 113. Idempotensi

Endpoint penting harus mendukung perilaku idempotent ketika request duplikat
mungkin terjadi.

Contoh:

-   webhook pembayaran;
-   konfirmasi pesanan;
-   konfirmasi bukti;
-   pembuatan refund;
-   aksi penugasan kurir.

Retry tidak boleh menghasilkan efek bisnis ganda.

------------------------------------------------------------------------

## 114. Background Job

Recommended Redis jobs:

``` text
GenerateInvoiceJob
SendOrderNotificationJob
SendPaymentNotificationJob
ProcessEvidenceImageJob
GenerateSignedEvidenceVariantJob
PartnerSettlementJob
CourierPayoutJob
CleanupTemporaryUploadsJob
```

Job harus dapat di-retry dan idempotent.

------------------------------------------------------------------------

## 115. Scheduled Job

Laravel Scheduler dapat menangani:

-   deteksi pesanan yang stale;
-   pembayaran kedaluwarsa;
-   pembersihan pesanan yang belum dibayar;
-   pengingat notifikasi;
-   pembuatan settlement;
-   agregasi analitik harian;
-   pembersihan upload sementara.

------------------------------------------------------------------------

## 116. Strategi Pengujian

### Pengujian Unit

Uji:

-   aturan harga;
-   perhitungan selisih;
-   transisi status;
-   hak akses;
-   perhitungan settlement.

### Pengujian Feature/API

Uji:

-   pembuatan pesanan;
-   webhook pembayaran;
-   alur penimbangan;
-   konfirmasi bukti;
-   trigger pembuatan invoice;
-   alur komplain.

### Pengujian Integrasi

Uji:

-   sandbox payment gateway;
-   object storage;
-   queue Redis;
-   penyedia notifikasi.

### Pengujian End-to-End

Uji seluruh alur:

``` text
Customer order
→ payment
→ pickup
→ laundry intake
→ weighing evidence
→ processing
→ delivery
→ completion
```

------------------------------------------------------------------------

## 117. Kriteria Penerimaan --- Pesanan Inti

Pesanan dianggap berfungsi ketika:

-   pelanggan dapat membuatnya;
-   status pembayaran tercatat dengan benar;
-   kurir dapat menerima pekerjaan penjemputan;
-   laundry dapat menerimanya;
-   timeline status akurat;
-   pelanggan dapat melacaknya;
-   pesanan dapat mencapai status selesai.

------------------------------------------------------------------------

## 118. Kriteria Penerimaan --- Bukti Berat

Pesanan berbasis berat secara normal tidak dapat mencapai `PRICE_FINALIZED` kecuali:

1.  berat aktual tersedia;
2.  bukti yang diperlukan tersedia;
3.  bukti terkait dengan pesanan yang benar;
4.  bukti dibuat oleh staf yang berwenang;
5.  bukti lolos validasi;
6.  bukti dikonfirmasi;
7.  aturan selisih telah dievaluasi.

Jika admin melakukan override aturan, override tersebut harus diaudHal tersebut.

------------------------------------------------------------------------

## 119. Kriteria Penerimaan --- Invoice

Invoice harus:

-   berisi berat final;
-   berisi harga final;
-   mereferensikan pesanan yang benar;
-   menyertakan atau menampilkan bukti penimbangan secara aman sesuai
    desain invoice;
-   memiliki nomor invoice unik;
-   dapat dibuat ulang dari data transaksi yang tersimpan;
-   tidak berubah secara diam-diam setelah finalisasi.

------------------------------------------------------------------------

## 120. Layar MVP

### Pelanggan

1.  Splash/landing
2.  Login/daftar
3.  Beranda
4.  Pencarian laundry
5.  Detail laundry
6.  Pemilihan layanan
7.  Pemilihan alamat
8.  Penjadwalan penjemputan
9.  Checkout
10. Payment
11. Pelacakan pesanan
12. Tampilan bukti berat
13. Invoice
14. Riwayat pesanan
15. Komplain
16. Ulasan
17. Profil

### Mitra

1.  Login
2.  Dashboard
3.  Pesanan
4.  Detail pesanan
5.  Penerimaan
6.  Penimbangan/pengambilan bukti
7.  Papan pemrosesan
8.  Pesanan siap
9.  Staf
10. Layanan/harga
11. Settlement
12. Laporan

### Kurir

1.  Login
2.  Ketersediaan
3.  Daftar pekerjaan
4.  Detail pekerjaan
5.  Penjemputan
6.  Pengantaran
7.  Pendapatan
8.  Riwayat

### Admin

1.  Dashboard
2.  Pesanan
3.  Partners
4.  Couriers
5.  Pelanggan
6.  Kepatuhan bukti
7.  Komplains
8.  Pembayaran
9.  Settlement
10. Audit log
11. Konfigurasi sistem

------------------------------------------------------------------------

## 121. Prioritas UX

Tiga layar operasional yang paling penting adalah:

1.  checkout pelanggan;
2.  penimbangan/pengambilan bukti laundry;
3.  penjemputan/pengantaran kurir.

Jika layar-layar ini lambat atau membingungkan, bisnis dapat gagal
secara operasional meskipun backend secara teknis sangat baik.

------------------------------------------------------------------------

## 122. KPI Bisnis

### Akuisisi

-   pelanggan baru;
-   biaya akuisisi pelanggan;
-   biaya akuisisi mitra.

### Transaksi

-   pesanan/hari;
-   nilai transaksi bruto;
-   nilai rata-rata pesanan;
-   tingkat penyelesaian;
-   tingkat pembatalan.

### Retensi

-   tingkat pemesanan ulang;
-   pesanan/pelanggan/bulan;
-   retensi 30 hari.

### Operasional

-   tingkat penjemputan tepat waktu;
-   waktu pemrosesan laundry;
-   tingkat pengantaran tepat waktu;
-   tingkat kepatuhan bukti;
-   tingkat kegagalan bukti;
-   tingkat sengketa.

### Ekonomi

-   pendapatan platform/pesanan;
-   pembayaran ke mitra;
-   biaya kurir/pesanan;
-   margin kotor/pesanan;
-   contribution margin/pesanan.

------------------------------------------------------------------------

## 123. KPI Kepercayaan

Karena transparansi berat adalah pembeda utama, pantau:

``` text
Evidence Compliance Rate
= valid evidence orders / applicable orders

Weight Dispute Rate
= weight-related disputes / completed orders

Average Weight Variance
= average absolute(actual - estimated) percentage

Evidence Invalidation Rate
= invalidated evidence / submitted evidence
```

Metrik ini harus disegmentasikan berdasarkan mitra dan staf.

------------------------------------------------------------------------

## 124. Sinyal Fraud/Anomali

Sinyal yang berpotensi perlu ditinjau:

-   variansi berat positif yang sangat tinggi;
-   variansi yang sangat rendah di semua pesanan;
-   tingkat pembatalan bukti yang tinggi;
-   kegagalan pengambilan bukti berulang;
-   timestamp mencurigakan;
-   manual override yang berlebihan;
-   konsentrasi sengketa yang tidak biasa.

Ini adalah sinyal untuk investigasi manusia, bukan tuduhan otomatis.

------------------------------------------------------------------------

## 125. Risiko Bisnis

### Risiko: Permintaan pelanggan lebih rendah dari perkiraan

Mitigasi:

-   lakukan pilot di satu area geografis;
-   validasi sebelum scaling;
-   ukur pemesanan ulang.

### Risiko: Mitra laundry menolak alur operasional

Mitigasi:

-   jaga alur penerimaan di bawah satu menit jika memungkinkan;
-   latih staf;
-   berikan insentif mitra yang jelas.

### Risiko: Ekonomi kurir tidak berjalan

Mitigasi:

-   gunakan radius layanan terbatas;
-   optimalkan batching kemudian;
-   ukur contribution margin pengantaran.

### Risiko: Bukti berat menambah friksi

Mitigasi:

-   alur kamera satu ketukan;
-   metadata otomatis;
-   pengetikan minimal;
-   integrasi timbangan digital di masa depan.

### Risiko: Fraud tetap mungkin terjadi

Mitigasi:

-   bukti + audit trail + pemantauan anomali;
-   future scale lokal.

### Risiko: Engineering terlalu kompleks

Mitigasi:

-   monolit modular;
-   Redis sebagai pengganti Kafka;
-   Laravel sebagai pengganti backend Go yang terlalu dini;
-   ekstrak service hanya setelah ada kebutuhan yang terukur.

------------------------------------------------------------------------

## 126. Tim MVP dan Rencana Pengembangan

Tim minimum yang realistis untuk pilot serius adalah sekitar **4--6
orang**, tergantung apakah desain, operasional, dan QA dilakukan full-time
atau dirangkap.

Tanggung jawab yang disarankan:

1.  **Product/Founder** --- bisnis, akuisisi mitra, keputusan produk.
    keputusan produk.
2.  **Full-stack/backend engineer** --- Laravel, PostgreSQL, Redis,
    API.
3.  **Frontend engineer** --- React/TypeScript/PWA dan antarmuka operasional.
    antarmuka.
4.  **Mobile/field atau full-stack engineer** --- workflow kamera/bukti/kurir;
    dapat dirangkap frontend/backend dalam tim kecil.
5.  **UI/UX designer** --- awalnya dapat part-time.
6.  **Operations/QA** --- onboarding mitra, testing, customer support,
    validasi lapangan; awalnya dapat dirangkap founder.

Tim engineering 3 orang dapat membangun prototype, tetapi menjalankan
marketplace nyata bukan hanya masalah coding. Operasional mitra,
koordinasi kurir, support, dan QA sangat penting.

------------------------------------------------------------------------

## 127. Fase Implementasi

### Fase 0 --- Validasi

Validasi:

-   permintaan pelanggan;
-   minat mitra;
-   radius pengantaran;
-   kesediaan menerima harga;
-   alur operasional.

Deliverable:

-   prototype yang dapat diklik;
-   wawancara mitra;
-   wawancara pelanggan;
-   asumsi pilot.

### Fase 1 --- Core MVP

Bangun:

-   autentikasi;
-   aplikasi pelanggan;
-   dashboard mitra;
-   alur kurir;
-   pesanan;
-   harga dasar;
-   pembayaran;
-   queue Redis;
-   PostgreSQL;
-   object storage.

### Fase 2 --- Lapisan Kepercayaan

Bangun:

-   alur penimbangan;
-   pengambilan kamera;
-   penyimpanan bukti;
-   hash foto;
-   timestamp;
-   bukti immutable;
-   aturan selisih;
-   bukti pada invoice;
-   audit trail.

### Fase 3 --- Pilot

Luncurkan dengan:

-   geografi terbatas;
-   jumlah laundry mitra terbatas;
-   jumlah kurir terbatas;
-   katalog layanan terkontrol.

Ukur KPI operasional.

### Fase 4 --- Optimasi

Tingkatkan:

-   dispatch;
-   notifikasi;
-   analitik;
-   dashboard mitra;
-   retensi pelanggan;
-   penanganan sengketa.

### Fase 5 --- Scaling

Hanya ketika data membenarkannya:

-   service Go untuk dispatch/tracking;
-   Kafka/event streaming;
-   sistem geospasial yang lebih canggih;
-   integrasi timbangan digital;
-   arsitektur multi-kota.

------------------------------------------------------------------------

# Lampiran A --- State Machine Pesanan Lengkap

``` text
                    ┌───────────────┐
                    │     DRAFT     │
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │PENDING_PAYMENT│
                    └───────┬───────┘
                            ↓
                    ┌───────────────┐
                    │   CONFIRMED   │
                    └───────┬───────┘
                            ↓
                  ┌──────────────────┐
                  │ COURIER_ASSIGNED │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │ PICKUP_EN_ROUTE  │
                  └────────┬─────────┘
                           ↓
                  ┌──────────────────┐
                  │    PICKED_UP     │
                  └────────┬─────────┘
                           ↓
              ┌─────────────────────────┐
              │ RECEIVED_AT_LAUNDRY     │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │     WEIGHING_REQUIRED   │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │     WEIGHT_VERIFIED     │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │     PRICE_FINALIZED     │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │       PROCESSING        │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │   READY_FOR_DELIVERY    │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │    DELIVERY_ASSIGNED    │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │    DELIVERY_EN_ROUTE    │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │       DELIVERED         │
              └────────────┬────────────┘
                           ↓
              ┌─────────────────────────┐
              │       COMPLETED         │
              └─────────────────────────┘
```

------------------------------------------------------------------------

# Lampiran B --- Urutan Bukti Penimbangan

``` text
Laundry Staff
     │
     │ Open Order
     ▼
Laundrie App
     │
     │ Start Weighing
     ▼
Scale
     │
     │ Physical measurement
     ▼
Staff
     │
     │ Camera capture
     ▼
Evidence Image
     │
     ├── timestamp
     ├── order ID
     ├── staff ID
     ├── weight
     └── hash
     │
     ▼
Laravel API
     │
     ├── authorize
     ├── validate
     ├── store metadata
     └── store object
     │
     ▼
PostgreSQL + S3/R2
     │
     ▼
Weight Verified
     │
     ├── discrepancy check
     ├── price calculation
     └── customer notification
     │
     ▼
Invoice
```

------------------------------------------------------------------------

# Lampiran C --- Struktur Repository yang Disarankan

``` text
laundrie/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── customer/
│   │   │   │   ├── partner/
│   │   │   │   ├── courier/
│   │   │   │   ├── orders/
│   │   │   │   ├── weighing/
│   │   │   │   ├── evidence/
│   │   │   │   └── invoices/
│   │   │   └── shared/
│   │   └── public/
│   │
│   └── api/
│       ├── app/
│       │   └── Domain/
│       │       ├── Auth/
│       │       ├── Customer/
│       │       ├── Partner/
│       │       ├── Courier/
│       │       ├── Order/
│       │       ├── Pricing/
│       │       ├── Weighing/
│       │       ├── Evidence/
│       │       ├── Payment/
│       │       ├── Invoice/
│       │       ├── Notification/
│       │       ├── Complaint/
│       │       └── Admin/
│       ├── routes/
│       └── tests/
│
├── infrastructure/
│   ├── docker/
│   └── nginx/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   └── operations/
│
└── README.md
```

------------------------------------------------------------------------

# Lampiran D --- Definition of Done untuk MVP

MVP tidak boleh dinyatakan selesai hanya karena UI sudah berjalan.

Definisi minimum agar siap produksi adalah:

-   pelanggan dapat memesan;
-   pembayaran tercatat dengan andal;
-   kurir dapat menjemput;
-   laundry dapat menerima;
-   berat dapat dicatat;
-   bukti berat yang diperlukan dapat diambil;
-   bukti disimpan dengan aman;
-   bukti tidak dapat diubah secara diam-diam;
-   harga aktual dihitung dengan benar;
-   pelanggan dapat melihat bukti;
-   invoice berisi pengukuran final dan total yang benar;
-   laundry dapat memproses dan menandai siap;
-   kurir dapat mengantar;
-   pelanggan dapat mengonfirmasi penyelesaian;
-   komplain dapat dibuat;
-   admin dapat menyelidiki seluruh timeline;
-   tindakan penting diaudit;
-   backup dan monitoring tersedia;
-   background job yang gagal dapat di-retry;
-   webhook pembayaran bersifat idempotent;
-   otorisasi ditegakkan di sisi server.

------------------------------------------------------------------------

# Lampiran E --- Keputusan Teknologi Final

  -----------------------------------------------------------------------
  Layer                   Keputusan MVP            Alasan
  ----------------------- ----------------------- -----------------------
  Web/PWA                 React + TypeScript +    Pengembangan mobile-first yang cepat
                          Vite                    pengembangan produk

  Backend                 Laravel 13 / PHP 8.3+   Framework aplikasi yang kuat
                                                  dan delivery MVP yang cepat
                                                  delivery

  Architecture            Modular monolith        Deployment sederhana dengan
                                                  batas domain yang jelas

  Database                PostgreSQL              Integritas transaksi
                                                  dan kemampuan relasional
                                                  yang matang

  Queue                   Redis                   Cukup untuk MVP
                                                  background job

  Queue monitoring        Laravel Horizon         Visibilitas operasional
                                                  untuk queue Redis

  Object storage          S3-compatible / R2      Media dan
                                                  penyimpanan invoice yang tahan lama

  Payment                 Midtrans or equivalent  Integrasi pembayaran lokal
                                                  lokal

  Maps                    Google Maps/Mapbox or   Alamat dan
                          equivalent              pemetaan operasional

  Realtime                WebSocket later         Hanya jika
                                                  diperlukan secara operasional

  Go                      Future specialized      Diperkenalkan setelah
                          services                kebutuhan scaling terukur

  Kafka                   Future event streaming  Hanya setelah kebutuhan event
                                                  terdistribusi
                                                  muncul
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Lampiran F --- North Star Produk

Laundrie tidak seharusnya menang hanya karena memiliki teknologi yang paling canggih.
teknologi.

Laundrie harus menang karena pelanggan dapat berkata:

> **"Aku tinggal pesan, pakaian dijemput, aku tahu berapa beratnya, tahu
> kenapa harganya segitu, dan pakaian dikembalikan ke rumah."**

Teknologi ada untuk membuat janji tersebut dapat diandalkan.

Karena itu, pembeda MVP yang paling kuat bukan Kafka, Go,
microservices, atau sistem AI yang rumHal tersebut. Pembeda tersebut adalah **alur operasional yang andal
dengan bukti yang transparan**:

``` text
ORDER
  ↓
PICKUP
  ↓
LAUNDRY RECEIPT
  ↓
WEIGHT EVIDENCE
  ↓
FINAL PRICE
  ↓
PROCESSING
  ↓
DELIVERY
  ↓
INVOICE + AUDIT TRAIL
```

Alur tersebut adalah core product yang harus divalidasi sebelum melakukan scaling
arsitektur.
