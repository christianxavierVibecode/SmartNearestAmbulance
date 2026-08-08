# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Smart Nearest Ambulance

| | |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Status** | Draft — Hackathon Submission |
| **Referensi** | BRD Smart Nearest Ambulance |

---

## 1. Ringkasan Produk

Smart Nearest Ambulance adalah sistem monitoring armada ambulans berbasis lokasi (GPS) yang terdiri dari **aplikasi mobile untuk sopir** dan **dashboard web untuk operator**. Produk ini menggantikan proses koordinasi manual (telepon/pesan instan) dengan pemantauan posisi real-time dan rekomendasi ambulans terdekat secara otomatis, sehingga proses dispatch pasien darurat menjadi lebih cepat dan akurat.

Produk ini dibangun di atas **Node.js**, memanfaatkan **Server-Sent Events (SSE)** untuk distribusi data real-time ke dashboard, dan **AJAX periodik (interval 5 detik)** dari sisi aplikasi sopir untuk mengirim pembaruan lokasi ke server. Basis data yang digunakan adalah **MySQL**.

Aplikasi sopir dibungkus menggunakan **Capacitor JS**, sehingga source code berbasis web dapat berjalan sebagai aplikasi native Android/iOS. Pendekatan ini dipilih karena eksekusi proses background pada aplikasi web murni (mobile browser) tidak konsisten antar perangkat/OS — padahal pengiriman lokasi GPS harus tetap berjalan meski aplikasi berada di background. Dengan Capacitor, aplikasi dapat memanfaatkan plugin native (mis. background geolocation) agar pengiriman lokasi tetap berjalan andal.

---

## 2. Tujuan Produk

1. Memberi operator visibilitas real-time terhadap posisi seluruh ambulans.
2. Mempercepat keputusan dispatch melalui rekomendasi ambulans terdekat otomatis.
3. Menstandardisasi status operasional armada (Available, On Mission, Maintenance, Offline).
4. Menyediakan riwayat perjalanan sebagai bahan evaluasi manajemen.
5. Menyediakan mekanisme darurat (SOS) bagi sopir di lapangan.

---

## 3. Target Pengguna & Persona

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Sopir Ambulans** | Petugas lapangan yang mengoperasikan ambulans | Aplikasi mobile ringan, mudah dipakai saat bertugas, tombol SOS mudah dijangkau |
| **Operator** | Petugas di ruang kendali / call center rumah sakit | Peta real-time, info status & last seen, rekomendasi ambulans terdekat instan |
| **Manajemen Rumah Sakit** | Pengambil keputusan operasional | Laporan aktivitas & pemanfaatan armada |
| **Tim IT** | Pengelola sistem | Sistem stabil, mudah dipantau, mudah di-maintain |

---

## 4. User Stories

### Sopir Ambulans
- Sebagai sopir, saya ingin login menggunakan akun yang diberikan agar identitas dan armada saya tercatat dengan benar.
- Sebagai sopir, saya ingin lokasi saya terkirim otomatis setiap beberapa detik tanpa input manual, agar saya bisa fokus mengemudi.
- Sebagai sopir, saya ingin mengubah status ambulans (Available/On Mission/Maintenance/Offline) dari aplikasi, agar operator tahu kondisi saya.
- Sebagai sopir, saya ingin menekan tombol SOS saat darurat, agar operator segera mendapat notifikasi.

### Operator
- Sebagai operator, saya ingin melihat seluruh ambulans di peta secara real-time, agar saya tahu posisi armada saat ini.
- Sebagai operator, saya ingin melihat kapan lokasi ambulans terakhir diperbarui (Last Seen), agar saya tahu data mana yang masih valid.
- Sebagai operator, saya ingin sistem merekomendasikan ambulans terdekat dari lokasi pasien secara otomatis, agar dispatch lebih cepat.
- Sebagai operator, saya ingin melihat riwayat perjalanan tiap ambulans, agar saya bisa menelusuri aktivitas armada.

### Manajemen Rumah Sakit
- Sebagai manajemen, saya ingin melihat laporan aktivitas & pemanfaatan armada, agar saya bisa mengevaluasi kinerja layanan ambulans.

---

## 5. Fitur Utama (Prioritas MoSCoW)

| Fitur | Prioritas | Ket. |
|---|---|---|
| Login sopir & operator | Must | Autentikasi dasar |
| Pengiriman lokasi GPS otomatis (AJAX, interval 5 detik) | Must | Inti sistem |
| Streaming lokasi real-time ke dashboard (SSE) | Must | Inti sistem |
| Peta monitoring seluruh ambulans | Must | Dashboard operator |
| Manajemen status operasional | Must | Available/On Mission/Maintenance/Offline |
| Rekomendasi ambulans terdekat | Must | Berdasarkan jarak & status |
| Last Seen indicator | Must | Validitas data lokasi |
| Riwayat perjalanan ambulans | Should | Untuk evaluasi |
| Tombol SOS darurat | Should | Keselamatan sopir |
| Laporan pemanfaatan armada (manajemen) | Could | Bisa disederhanakan untuk demo hackathon |

---

## 6. Ruang Lingkup

Mengikuti scope pada BRD — **in scope**: aplikasi mobile sopir, dashboard web operator, monitoring real-time, manajemen status, rekomendasi ambulans terdekat, riwayat perjalanan, last seen.

**Out of scope**: rekam medis pasien, sistem pembayaran, jadwal dokter, integrasi BPJS/SIMRS, navigasi rute otomatis (routing turn-by-turn seperti Google Maps).

---

## 7. Asumsi & Batasan

- Sopir memiliki perangkat mobile dengan koneksi internet dan GPS aktif selama bertugas.
- Sistem diasumsikan digunakan dalam skala satu rumah sakit/layanan ambulans (single-tenant) untuk kebutuhan hackathon.
- Interval pengiriman lokasi 5 detik dianggap cukup untuk kasus penggunaan ini (bukan sub-detik seperti ride-hailing).
- Tidak menghitung rute jalan (routing), rekomendasi ambulans terdekat dihitung berdasarkan jarak garis lurus (belum mempertimbangkan kemacetan/kondisi jalan).
- Demo hackathon kemungkinan dijalankan dengan jumlah ambulans terbatas (simulasi).
- Aplikasi sopir di-build sebagai aplikasi native (Android/iOS) melalui Capacitor JS, bukan diakses langsung lewat browser mobile, agar proses background (pengiriman lokasi) lebih konsisten.
- Sopir memberikan izin lokasi background pada perangkatnya (izin ini wajib diminta secara eksplisit oleh aplikasi native saat pertama kali dijalankan).

---

## 8. Kriteria Keberhasilan

- Operator dapat melihat posisi ambulans aktif secara real-time di dashboard.
- Waktu untuk menentukan ambulans terdekat < beberapa detik (jauh lebih cepat dari proses manual via telepon).
- Setiap pergerakan ambulans tercatat otomatis sebagai riwayat.
- Status "Last Seen" secara jelas menunjukkan data mana yang up-to-date vs stale.
- Sistem tetap responsif saat beberapa ambulans mengirim lokasi secara bersamaan.

---

## 9. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Koneksi internet sopir terputus | Lokasi tidak update, status jadi stale | Mekanisme Last Seen + fallback status "Offline" otomatis |
| Akurasi GPS rendah (indoor/urban canyon) | Rekomendasi ambulans terdekat kurang akurat | Tampilkan radius akurasi jika tersedia dari device |
| Beban server saat banyak koneksi SSE bersamaan | Delay update dashboard | Desain broadcast efisien, batasi payload |
| Waktu pengembangan terbatas (hackathon) | Fitur "Could" berpotensi tidak selesai | Prioritaskan fitur "Must" terlebih dahulu (MVP) |
| OS (Android/iOS) membatasi proses background demi hemat baterai | Pengiriman lokasi bisa terhenti saat app di background/terkunci | Gunakan plugin background geolocation native via Capacitor, minta pengecualian battery optimization di Android |
| Sopir tidak memberikan izin lokasi background | Data lokasi tidak terkirim sama sekali | Minta izin secara jelas di awal + tampilkan penjelasan pentingnya izin tersebut pada aplikasi |

---

## 10. Keterkaitan SDGs

Mendukung **SDG 3 – Good Health and Well-being** dengan mempercepat waktu respons layanan ambulans darurat melalui pemantauan real-time dan rekomendasi dispatch otomatis.
