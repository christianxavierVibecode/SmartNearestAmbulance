# BUSINESS REQUIREMENTS DOCUMENT (BRD)

## Proyek: Smart Nearest Ambulance

### 1. Latar Belakang (Background)

Dalam kondisi darurat medis, kecepatan respons ambulans menjadi salah satu faktor penting yang dapat meningkatkan peluang keselamatan pasien. Namun, pada banyak rumah sakit atau layanan ambulans, proses pemantauan armada masih dilakukan secara manual melalui panggilan telepon atau aplikasi pesan instan. Kondisi tersebut menyebabkan operator kesulitan mengetahui posisi setiap ambulans secara real-time serta menentukan ambulans yang paling dekat dengan lokasi pasien.

Smart Nearest Ambulance dikembangkan sebagai sistem monitoring armada ambulans berbasis lokasi (GPS) yang membantu operator memantau posisi, status operasional, serta merekomendasikan ambulans terdekat secara otomatis sehingga proses dispatch menjadi lebih cepat, efektif, dan akurat.

---

### 2. Pernyataan Masalah (Problem Statement)

- **Sulit mengetahui posisi ambulans secara real-time:** Operator harus menghubungi sopir secara manual untuk mengetahui lokasi ambulans yang sedang bertugas.
- **Proses dispatch kurang optimal:** Penentuan ambulans yang akan ditugaskan masih berdasarkan perkiraan atau pengalaman operator sehingga berpotensi memilih ambulans yang bukan paling dekat.
- **Kurangnya visibilitas kondisi armada:** Operator tidak mengetahui apakah ambulans sedang tersedia, sedang membawa pasien, atau sedang tidak aktif.
- **Tidak adanya riwayat operasional:** Rumah sakit kesulitan melakukan evaluasi terhadap aktivitas dan pergerakan armada ambulans.

---

### 3. Tujuan Bisnis (Business Objectives)

- Membantu operator memantau lokasi seluruh ambulans secara **real-time**.
- Mempercepat proses penentuan ambulans yang akan ditugaskan kepada pasien melalui rekomendasi **ambulans terdekat**.
- Meningkatkan efisiensi koordinasi antara operator dan sopir ambulans.
- Menyediakan riwayat perjalanan dan status operasional ambulans sebagai bahan evaluasi pelayanan.

---

### 4. Ruang Lingkup (Scope)

#### **Masuk dalam Ruang Lingkup (In Scope)**

- Aplikasi mobile untuk sopir ambulans.
- Pengiriman lokasi GPS ke server secara berkala.
- Dashboard web untuk operator.
- Monitoring lokasi ambulans secara real-time.
- Manajemen status operasional ambulans (Available, On Mission, Maintenance, Offline).
- Rekomendasi ambulans terdekat berdasarkan lokasi pasien dan status armada.
- Riwayat perjalanan ambulans.
- Informasi waktu pembaruan lokasi terakhir (Last Seen).

#### **Di luar Ruang Lingkup (Out of Scope)**

- Rekam medis pasien.
- Sistem pembayaran rumah sakit.
- Manajemen jadwal dokter.
- Integrasi dengan BPJS atau sistem informasi rumah sakit (SIMRS).
- Navigasi rute otomatis seperti Google Maps.

---

### 5. Kebutuhan Bisnis Utama (High-Level Business Requirements)

#### **Kebutuhan Sopir Ambulans (Driver)**

- Sopir dapat melakukan login ke aplikasi menggunakan akun yang telah diberikan.
- Sopir dapat mengubah status operasional ambulans melalui aplikasi.
- Lokasi ambulans dikirim ke server secara otomatis selama aplikasi aktif tanpa memerlukan input manual secara berulang.
- Sopir dapat mengaktifkan tombol darurat (SOS) apabila terjadi kendala saat bertugas.

#### **Kebutuhan Operator**

- Operator dapat melihat daftar seluruh ambulans beserta status operasionalnya.
- Operator dapat memantau lokasi setiap ambulans melalui peta secara real-time.
- Operator dapat mengetahui kapan terakhir lokasi ambulans diperbarui (Last Seen).
- Operator dapat memperoleh rekomendasi ambulans terdekat berdasarkan lokasi pasien dan status armada.
- Operator dapat melihat riwayat perjalanan setiap ambulans.

#### **Kebutuhan Manajemen Rumah Sakit**

- Manajemen dapat melihat laporan aktivitas armada ambulans.
- Manajemen dapat mengetahui tingkat pemanfaatan setiap ambulans sebagai bahan evaluasi operasional.
- Manajemen dapat menggunakan data perjalanan untuk meningkatkan kualitas pelayanan ambulans kepada masyarakat.

---

### 6. Stakeholder

| Stakeholder           | Peran                                                                 |
| --------------------- | --------------------------------------------------------------------- |
| Sopir Ambulans        | Mengoperasikan aplikasi mobile dan mengirimkan lokasi secara otomatis |
| Operator Ambulans     | Memantau armada dan melakukan dispatch ambulans                       |
| Manajemen Rumah Sakit | Mengevaluasi performa operasional armada                              |
| Tim IT                | Mengelola sistem dan infrastruktur aplikasi                           |

---

### 7. Indikator Keberhasilan (Success Criteria)

- Operator dapat mengetahui lokasi ambulans yang aktif secara real-time.
- Waktu penentuan ambulans yang akan ditugaskan menjadi lebih cepat dibandingkan proses manual.
- Seluruh aktivitas perjalanan ambulans tercatat secara otomatis.
- Operator dapat mengetahui ambulans yang paling dekat dengan lokasi pasien hanya dalam beberapa detik.
- Sistem mampu meningkatkan efektivitas koordinasi antara operator dan sopir ambulans.

---

### 8. Keterkaitan dengan Sustainable Development Goals (SDGs)

**SDG 3 – Good Health and Well-being**

Proyek Smart Nearest Ambulance mendukung SDG 3 dengan meningkatkan efektivitas layanan ambulans melalui pemantauan lokasi secara real-time dan rekomendasi ambulans terdekat. Dengan proses dispatch yang lebih cepat dan koordinasi yang lebih baik, diharapkan waktu respons terhadap keadaan darurat dapat dipersingkat sehingga meningkatkan peluang pasien memperoleh penanganan medis tepat waktu.
