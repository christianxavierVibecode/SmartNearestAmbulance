# FUNCTIONAL REQUIREMENTS DOCUMENT (FRD)
## Smart Nearest Ambulance

| | |
|---|---|
| **Versi Dokumen** | 1.0 |
| **Status** | Draft — Hackathon Submission |
| **Referensi** | BRD & PRD Smart Nearest Ambulance |

---

## 1. Tujuan Dokumen

Menjabarkan kebutuhan fungsional secara teknis: arsitektur sistem, alur data, spesifikasi API, skema database, algoritma rekomendasi, dan mekanisme realtime — sebagai acuan implementasi.

---

## 2. Arsitektur Sistem

**Stack utama:** Node.js (backend), REST API + SSE, **MySQL** (database relasional), **Capacitor JS** (pembungkus native untuk aplikasi sopir), Web dashboard (operator, berjalan di browser biasa).

### Mengapa Capacitor JS untuk Aplikasi Sopir

Aplikasi web murni (dijalankan lewat browser mobile) memiliki perilaku background yang tidak konsisten antar OS/perangkat — proses JavaScript dapat di-suspend saat aplikasi diminimize/layar terkunci, sehingga pengiriman lokasi AJAX periodik bisa berhenti tanpa diketahui operator. Untuk mengatasi ini, source code aplikasi sopir dibungkus dengan **Capacitor JS** menjadi aplikasi native Android/iOS, sehingga dapat memanfaatkan plugin native (mis. background geolocation/background task) yang tetap berjalan meski aplikasi tidak berada di foreground.

Dashboard operator **tetap berupa aplikasi web biasa** (diakses via browser), karena tidak memerlukan proses background — operator selalu membuka dashboard secara aktif di layar.

### Alur Data Utama

```
[App Sopir - dibungkus Capacitor JS (Android/iOS)]
    | Background Geolocation Plugin -> AJAX POST /api/location   (interval 5 detik)
    v
[Node.js REST API]
    | 1. Validasi & simpan lokasi ke MySQL (tabel location_history)
    | 2. Broadcast event ke seluruh client SSE yang terhubung
    v
[SSE Endpoint /api/stream]  -----stream------>  [Dashboard Web Operator (Browser)]
                                                  (EventSource, auto-update peta)
```

### Catatan Teknis Penting

Sesuai arahan awal, data lokasi di-INSERT ke database oleh AJAX periodik, lalu di-*stream* oleh SSE. Berikut dua pola implementasi yang bisa dipilih tim development:

1. **Insert-then-broadcast (direkomendasikan):** saat request AJAX lokasi diterima, server langsung melakukan INSERT ke DB **dan** langsung mem-broadcast payload yang sama ke semua koneksi SSE aktif (tanpa perlu query ulang ke DB). Ini memberi latensi terendah karena broadcast tidak menunggu proses database selesai secara berurutan.
2. **DB-polling:** server memiliki job/interval terpisah yang membaca data terbaru dari DB lalu mem-broadcast ke SSE. Lebih sederhana tapi menambah latensi ~1 siklus polling.

Untuk kebutuhan hackathon dengan interval 5 detik, **pola 1** lebih disarankan karena tetap sederhana namun lebih responsif, tanpa mengubah keputusan arsitektur yang sudah ditetapkan (Node.js + SSE + AJAX periodik).

---

## 3. Functional Requirements (FR)

### Modul Autentikasi

| ID | Deskripsi | Aktor |
|---|---|---|
| FR-01 | Sistem menyediakan login untuk sopir dan operator menggunakan akun yang telah didaftarkan | Sopir, Operator |
| FR-02 | Sistem membatasi akses fitur sesuai role (driver/operator/management) | Semua |

### Modul Sopir (Mobile App)

| ID | Deskripsi | Aktor |
|---|---|---|
| FR-03 | Sopir dapat mengubah status ambulans: Available, On Mission, Maintenance, Offline | Sopir |
| FR-04 | Aplikasi mengirim lokasi GPS ke server secara otomatis setiap 5 detik selama aplikasi aktif, tanpa input manual berulang | Sistem (background) |
| FR-05 | Sopir dapat menekan tombol SOS untuk mengirim sinyal darurat berisi lokasi terkini | Sopir |

### Modul Operator (Dashboard Web)

| ID | Deskripsi | Aktor |
|---|---|---|
| FR-06 | Operator dapat melihat daftar seluruh ambulans beserta status operasionalnya | Operator |
| FR-07 | Operator dapat melihat posisi seluruh ambulans pada peta yang diperbarui secara real-time melalui SSE | Operator |
| FR-08 | Operator dapat melihat waktu pembaruan lokasi terakhir (Last Seen) per ambulans | Operator |
| FR-09 | Sistem menampilkan rekomendasi ambulans terdekat berdasarkan lokasi pasien dan status ketersediaan armada | Operator |
| FR-10 | Operator dapat melihat riwayat perjalanan ambulans tertentu | Operator |
| FR-11 | Operator menerima notifikasi real-time saat ada sinyal SOS dari sopir | Operator |

### Modul Aplikasi Native (Capacitor)

| ID | Deskripsi | Aktor |
|---|---|---|
| FR-13 | Aplikasi meminta izin lokasi background kepada sopir saat pertama kali dijalankan (Android: `ACCESS_BACKGROUND_LOCATION`, iOS: mode lokasi "Always") | Sistem |
| FR-14 | Aplikasi tetap mengirim lokasi via plugin background geolocation meski berada di background/layar terkunci | Sistem (background) |
| FR-15 | Aplikasi menampilkan indikator/notifikasi bahwa proses pelacakan lokasi sedang aktif (sesuai kebijakan OS untuk background location) | Sistem |

### Modul Manajemen

| ID | Deskripsi | Aktor |
|---|---|---|
| FR-12 | Manajemen dapat melihat laporan aktivitas dan tingkat pemanfaatan tiap ambulans | Manajemen |

---

## 4. Spesifikasi API Endpoint

| Method | Endpoint | Deskripsi | Body / Query |
|---|---|---|---|
| POST | `/api/auth/login` | Login sopir/operator | `{ username, password }` |
| PUT | `/api/ambulance/:id/status` | Update status operasional | `{ status }` |
| POST | `/api/location` | Kirim lokasi GPS (dipanggil AJAX tiap 5 detik oleh app sopir) | `{ ambulance_id, lat, lng, timestamp }` |
| POST | `/api/sos` | Kirim sinyal darurat | `{ ambulance_id, lat, lng, timestamp }` |
| GET | `/api/ambulances` | List seluruh ambulans + status + last seen | — |
| GET | `/api/ambulance/nearest` | Rekomendasi ambulans terdekat | `?lat=&lng=` |
| GET | `/api/ambulance/:id/history` | Riwayat perjalanan ambulans | `?from=&to=` |
| GET | `/api/stream` | Endpoint SSE untuk dashboard operator | — |

---

## 5. Skema Database (MySQL, engine InnoDB)

**users**
`id INT PK AUTO_INCREMENT, name VARCHAR(100), role ENUM('driver','operator','management'), username VARCHAR(50) UNIQUE, password_hash VARCHAR(255)`

**ambulances**
`id INT PK AUTO_INCREMENT, plate_number VARCHAR(20), driver_id INT FK -> users.id, status ENUM('available','on_mission','maintenance','offline') DEFAULT 'offline', last_seen_at DATETIME NULL`

**location_history**
`id BIGINT PK AUTO_INCREMENT, ambulance_id INT FK -> ambulances.id, latitude DECIMAL(10,7), longitude DECIMAL(10,7), recorded_at DATETIME, INDEX(ambulance_id, recorded_at)`

**sos_alerts**
`id INT PK AUTO_INCREMENT, ambulance_id INT FK -> ambulances.id, latitude DECIMAL(10,7), longitude DECIMAL(10,7), triggered_at DATETIME, resolved BOOLEAN DEFAULT FALSE`

**trips** *(opsional, untuk riwayat perjalanan terstruktur)*
`id INT PK AUTO_INCREMENT, ambulance_id INT FK -> ambulances.id, start_time DATETIME, end_time DATETIME NULL, start_location VARCHAR(255), end_location VARCHAR(255)`

> Catatan: index pada `location_history(ambulance_id, recorded_at)` penting agar query riwayat perjalanan (FR-10) tetap cepat meski volume data tumbuh cepat akibat insert tiap 5 detik per ambulans.

---

## 6. Algoritma Rekomendasi Ambulans Terdekat

1. Ambil seluruh ambulans dengan status `available`.
2. Hitung jarak garis lurus antara lokasi pasien dan lokasi terakhir tiap ambulans menggunakan **formula Haversine** (jarak berbasis koordinat bumi/lat-lng).
3. Urutkan hasil dari jarak terkecil ke terbesar.
4. Kecualikan ambulans dengan `last_seen_at` melewati batas *staleness* (lihat bagian 8), karena posisinya dianggap tidak valid.
5. Kembalikan kandidat teratas (mis. top 3) ke dashboard operator.

> Catatan: sesuai scope BRD, ini adalah estimasi jarak lurus, bukan jarak tempuh jalan (routing tidak termasuk dalam scope).

---

## 7. Mekanisme Realtime (SSE)

- Dashboard operator membuka koneksi persisten via `EventSource` ke `/api/stream`.
- Server mem-broadcast event dengan tipe:
  - `location_update` → `{ ambulance_id, lat, lng, timestamp }`
  - `status_update` → `{ ambulance_id, status }`
  - `sos_alert` → `{ ambulance_id, lat, lng, timestamp }`
- Format payload: JSON, dikirim sebagai `data: {...}\n\n` sesuai spesifikasi SSE.
- `EventSource` secara native melakukan reconnect otomatis jika koneksi terputus — tidak perlu implementasi manual tambahan di sisi client.
- Disarankan mengirim event `heartbeat` berkala (mis. tiap 15–30 detik) agar koneksi tidak dianggap idle/timeout oleh proxy atau browser.

---

## 8. State Machine Status Ambulans & Last Seen

**Status manual (diubah sopir):** `Available → On Mission → Available`, atau ke `Maintenance` / `Offline` kapan saja.

**Last Seen (otomatis oleh sistem):**
- Setiap kali `/api/location` diterima, `last_seen_at` di-update.
- Jika `last_seen_at` tidak diperbarui melebihi threshold (misal 15–20 detik, 3–4x interval kirim 5 detik), dashboard menandai ambulans sebagai **"data stale"** (indikator visual, misal warna abu-abu di peta) — status operasional tidak otomatis diubah kecuali tim ingin menambahkan aturan auto-set ke `Offline` setelah batas waktu lebih lama (misal 2 menit tanpa update).

---

## 9. Non-Functional Requirements

| Aspek | Kebutuhan |
|---|---|
| **Performa** | Update posisi di dashboard idealnya tampil dalam ≤5 detik setelah dikirim dari app sopir (sejalan dengan interval pengiriman) |
| **Skalabilitas** | Mendukung minimal puluhan koneksi SSE bersamaan untuk kebutuhan demo hackathon |
| **Keamanan** | Autentikasi berbasis token (JWT) untuk seluruh endpoint API; endpoint lokasi & SOS hanya bisa diakses oleh sopir yang terautentikasi |
| **Reliabilitas** | Data lokasi tetap tersimpan di DB meskipun tidak ada client dashboard yang aktif menerima stream |
| **Kompatibilitas** | Dashboard web berjalan di browser modern yang mendukung `EventSource` (SSE); aplikasi sopir di-build via Capacitor JS untuk target Android/iOS |
| **Background Execution** | Pengiriman lokasi harus tetap berjalan saat aplikasi sopir di background, dicapai melalui plugin native background geolocation (bukan `setInterval` murni di WebView, yang tidak andal saat app di-suspend) |

---

## 10. Batasan Teknis

- SSE bersifat satu arah (server → client); perintah dari operator ke sopir (jika dibutuhkan di masa depan) memerlukan mekanisme tambahan (REST call terpisah, bukan lewat channel SSE yang sama).
- Interval AJAX 5 detik berarti pergerakan ambulans di antara dua pengiriman tidak tercatat granular (bukan tracking sub-detik).
- Rekomendasi ambulans terdekat berbasis jarak lurus, bukan jarak tempuh jalan sesungguhnya.
- Reliabilitas background location tetap bergantung pada pengaturan battery optimization/OS di perangkat sopir; aplikasi perlu meminta pengguna mengecualikan aplikasi dari optimisasi baterai (khususnya Android) agar plugin background geolocation tidak dihentikan sistem.
- Build native via Capacitor memerlukan proses build terpisah untuk Android (Android Studio/Gradle) dan iOS (Xcode) — bukan sekadar deploy web biasa, sehingga perlu disiapkan sejak awal untuk kebutuhan demo/submission hackathon.
- Izin lokasi background (`ACCESS_BACKGROUND_LOCATION` di Android, mode "Always" di iOS) harus dideklarasikan di konfigurasi native (AndroidManifest.xml / Info.plist) melalui konfigurasi plugin Capacitor terkait.
