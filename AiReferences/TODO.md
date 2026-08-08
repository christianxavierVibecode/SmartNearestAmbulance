# TODO.md — Smart Nearest Ambulance

> Setiap task di bawah ini dirancang **atomik**: satu task = satu langkah kecil yang bisa diselesaikan dalam satu kali jalan oleh AI agent. Kerjakan **berurutan dari atas ke bawah**, satu task per eksekusi, lalu centang `[x]` setelah selesai sebelum lanjut ke task berikutnya.
>
> Referensi: BRD.md, PRD-Smart-Nearest-Ambulance.md, FRD-Smart-Nearest-Ambulance.md, ERD (schema.sql).

---

## Phase 0 — Project Setup

- [x] Inisialisasi project Node.js (`npm init -y`)
- [x] Install dependency backend: `express mysql2 dotenv jsonwebtoken bcrypt cors`
- [x] Install dependency dev: `nodemon`
- [x] Buat struktur folder: `src/routes`, `src/controllers`, `src/models`, `src/config`, `src/middlewares`, `src/utils`
- [x] Buat file `.env.example` berisi variabel: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`
- [x] Buat `src/config/db.js` — koneksi pool MySQL menggunakan `mysql2/promise`
- [x] Buat `src/server.js` — Express app dasar dengan endpoint `GET /health` yang mengembalikan `{status: "ok"}`
- [x] Jalankan server dan pastikan `GET /health` berhasil diakses

## Phase 1 — Database Schema

- [x] Buat file `database/schema.sql` berisi `CREATE TABLE users` (sesuai ERD)
- [x] Tambahkan `CREATE TABLE ambulances` ke `schema.sql` beserta foreign key ke `users`
- [x] Tambahkan `CREATE TABLE location_history` ke `schema.sql` beserta index `(ambulance_id, recorded_at)`
- [x] Tambahkan `CREATE TABLE sos_alerts` ke `schema.sql`
- [x] Tambahkan `CREATE TABLE trips` ke `schema.sql`
- [x] Jalankan `schema.sql` ke database MySQL lokal, verifikasi seluruh tabel terbentuk
- [x] Buat `database/seed.sql` — insert 1 user role `operator`, 1 user role `management`, 3 user role `driver`
- [x] Tambahkan ke `seed.sql` — insert 3 baris `ambulances` dengan `driver_id` mengacu ke 3 driver di atas
- [x] Jalankan `seed.sql`, verifikasi data masuk dengan query `SELECT`

## Phase 2 — Autentikasi

- [ ] Buat `src/models/userModel.js` — fungsi `findByUsername(username)`
- [ ] Buat `src/utils/hash.js` — fungsi `hashPassword` dan `comparePassword` menggunakan bcrypt
- [ ] Buat `src/utils/jwt.js` — fungsi `generateToken(payload)` dan `verifyToken(token)`
- [ ] Buat `src/controllers/authController.js` — fungsi `login` (validasi username/password, return JWT)
- [ ] Buat `src/routes/authRoutes.js` — daftarkan `POST /api/auth/login`
- [ ] Buat `src/middlewares/authMiddleware.js` — verifikasi JWT dari header `Authorization`
- [ ] Buat `src/middlewares/roleMiddleware.js` — fungsi `allowRoles(...roles)` untuk membatasi akses per role
- [ ] Test manual: login dengan akun operator seed, pastikan token JWT diterima

## Phase 3 — Ambulance & Status Management

- [ ] Buat `src/models/ambulanceModel.js` — fungsi `getAll()` (join dengan driver name)
- [ ] Tambahkan fungsi `updateStatus(id, status)` ke `ambulanceModel.js`
- [ ] Buat `src/controllers/ambulanceController.js` — fungsi `listAmbulances`
- [ ] Tambahkan fungsi `updateAmbulanceStatus` ke `ambulanceController.js` dengan validasi enum status
- [ ] Buat `src/routes/ambulanceRoutes.js` — daftarkan `GET /api/ambulances` (protected: operator, management)
- [ ] Tambahkan `PUT /api/ambulance/:id/status` ke `ambulanceRoutes.js` (protected: driver)
- [ ] Test manual: update status salah satu ambulans, verifikasi tersimpan di DB

## Phase 4 — Lokasi & Realtime (SSE)

- [ ] Buat `src/models/locationModel.js` — fungsi `insertLocation(ambulanceId, lat, lng)`
- [ ] Tambahkan fungsi `updateLastSeen(ambulanceId)` ke `ambulanceModel.js`
- [ ] Buat `src/utils/sseManager.js` — modul untuk menyimpan daftar client SSE aktif (array of `res` object)
- [ ] Tambahkan fungsi `broadcast(eventName, data)` ke `sseManager.js`
- [ ] Buat `src/controllers/streamController.js` — handler `GET /api/stream` (set header SSE, daftarkan client baru ke `sseManager`)
- [ ] Tambahkan mekanisme heartbeat di `streamController.js` (kirim comment `: heartbeat\n\n` setiap 20 detik)
- [ ] Tambahkan cleanup client saat koneksi SSE ditutup (`req.on('close')`)
- [ ] Buat `src/controllers/locationController.js` — fungsi `receiveLocation` (insert DB + update last_seen + broadcast SSE event `location_update`)
- [ ] Buat `src/routes/locationRoutes.js` — daftarkan `POST /api/location` (protected: driver) dan `GET /api/stream`
- [ ] Test manual: buka SSE stream via browser/Postman, kirim POST lokasi, verifikasi event diterima real-time

## Phase 5 — Rekomendasi Ambulans Terdekat

- [ ] Buat `src/utils/haversine.js` — fungsi `calculateDistance(lat1, lng1, lat2, lng2)` dalam kilometer
- [ ] Tambahkan fungsi `getAvailableWithLastLocation()` ke `ambulanceModel.js` (join lokasi terakhir per ambulans)
- [ ] Buat `src/controllers/ambulanceController.js` fungsi `findNearest` (query param `lat`, `lng`)
- [ ] Implementasikan filter: hanya status `available` dan `last_seen_at` belum melewati threshold stale
- [ ] Implementasikan sort by distance ascending, return top 3
- [ ] Tambahkan `GET /api/ambulance/nearest` ke `ambulanceRoutes.js`
- [ ] Test manual: panggil endpoint dengan koordinat sample, verifikasi urutan hasil benar

## Phase 6 — SOS Darurat

- [ ] Buat `src/models/sosModel.js` — fungsi `createAlert(ambulanceId, lat, lng)` dan `resolveAlert(id)`
- [ ] Buat `src/controllers/sosController.js` — fungsi `triggerSos` (insert DB + broadcast event `sos_alert`)
- [ ] Tambahkan fungsi `resolveSos` ke `sosController.js`
- [ ] Buat `src/routes/sosRoutes.js` — daftarkan `POST /api/sos` (protected: driver) dan `PUT /api/sos/:id/resolve` (protected: operator)
- [ ] Test manual: trigger SOS, verifikasi event realtime diterima client SSE

## Phase 7 — Riwayat Perjalanan (Trips)

- [ ] Buat `src/models/tripModel.js` — fungsi `startTrip(ambulanceId)` dan `endTrip(ambulanceId)`
- [ ] Integrasikan `startTrip` saat status ambulans berubah menjadi `on_mission` (di `ambulanceController.updateAmbulanceStatus`)
- [ ] Integrasikan `endTrip` saat status berubah dari `on_mission` ke `available`
- [ ] Tambahkan fungsi `getHistoryByAmbulance(id)` ke `tripModel.js`
- [ ] Buat endpoint `GET /api/ambulance/:id/history` di `ambulanceRoutes.js`
- [ ] Test manual: ubah status ambulans on_mission → available, verifikasi 1 baris trip tercatat

## Phase 8 — Dashboard Web Operator

- [ ] Buat folder `dashboard/` dengan `index.html`, `style.css`, `app.js`
- [ ] Buat halaman login sederhana (form username/password → simpan token di `localStorage`)
- [ ] Buat layout utama: sidebar daftar ambulans + area peta

### Setup Peta (Leaflet + OpenStreetMap)

- [ ] Tambahkan Leaflet via CDN di `index.html` — `<link>` ke `leaflet.css` dan `<script>` ke `leaflet.js` dari `unpkg.com/leaflet`
- [ ] Buat elemen `<div id="map">` dengan tinggi eksplisit di CSS (Leaflet butuh container dengan dimensi jelas)
- [ ] Inisialisasi peta dengan `L.map('map').setView([lat, lng], zoom)`, pusatkan ke wilayah operasional (mis. area NTT)
- [ ] Tambahkan tile layer OpenStreetMap default: `L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map)`
- [ ] Verifikasi atribusi "© OpenStreetMap contributors" tampil di pojok kanan bawah peta (wajib, jangan dihapus)

### Marker Ambulans

- [ ] Buat custom icon Leaflet (`L.icon` atau `L.divIcon`) per status ambulans: `available` = hijau, `on_mission` = biru, `maintenance` = kuning, `offline` = abu-abu
- [ ] Fetch `GET /api/ambulances` saat halaman dimuat, render marker awal ke peta menggunakan `L.marker(...).addTo(map)` dengan icon sesuai status
- [ ] Simpan referensi tiap marker dalam object/map JS (key: `ambulance_id`) agar mudah diupdate nanti tanpa render ulang seluruh peta
- [ ] Tambahkan popup per marker (`marker.bindPopup(...)`) berisi plat nomor, nama sopir, status, dan last seen

### Update Realtime via SSE

- [ ] Buat koneksi `EventSource` ke `/api/stream`
- [ ] Handle event `location_update` — cari marker terkait dari object referensi, panggil `marker.setLatLng([lat, lng])` (bukan render ulang marker baru)
- [ ] Handle event `status_update` — ganti icon marker terkait sesuai status baru (`marker.setIcon(...)`)
- [ ] Tampilkan badge status (warna berbeda per status) di sidebar list ambulans, sinkron dengan perubahan realtime
- [ ] Tampilkan indikator "Last Seen" per ambulans (format relative time, mis. "5 detik lalu"), update tiap beberapa detik
- [ ] Terapkan styling "stale" pada marker (opacity dikurangi / icon abu-abu) jika `last_seen_at` melewati threshold

### Rekomendasi Ambulans Terdekat

- [ ] Buat form input lokasi pasien: klik di peta (`map.on('click', ...)`) atau input manual lat/lng
- [ ] Tambahkan marker sementara dengan icon berbeda (mis. ikon pasien/RS) di lokasi yang dipilih
- [ ] Panggil `GET /api/ambulance/nearest` dengan koordinat terpilih, tampilkan hasil (top 3) di panel sidebar
- [ ] Gambar garis (`L.polyline`) dari marker lokasi pasien ke tiap ambulans hasil rekomendasi sebagai visualisasi jarak

### SOS & Riwayat

- [ ] Handle event `sos_alert` dari SSE — tampilkan popup/notifikasi mencolok dan sorot marker ambulans terkait (mis. ganti sementara ke icon merah/animasi)
- [ ] Buat halaman/panel riwayat perjalanan per ambulans (fetch `GET /api/ambulance/:id/history`)
- [ ] Test manual end-to-end: buka dashboard, verifikasi peta OSM tampil, marker muncul sesuai status, dan posisi marker berubah realtime saat ada update lokasi

## Phase 9 — Aplikasi Sopir (Capacitor JS)

- [ ] Inisialisasi project Capacitor (`npm init @capacitor/app`) di folder `driver-app/`
- [ ] Buat halaman login sopir (form sederhana, simpan token setelah login)
- [ ] Buat halaman utama sopir: tombol ubah status (Available/On Mission/Maintenance/Offline) + tombol SOS
- [ ] Install plugin background geolocation Capacitor (mis. `@capacitor-community/background-geolocation`)
- [ ] Tambahkan Android platform (`npx cap add android`)
- [ ] Konfigurasi izin `ACCESS_BACKGROUND_LOCATION` di `AndroidManifest.xml`
- [ ] Implementasikan request izin lokasi saat aplikasi pertama kali dibuka
- [ ] Implementasikan pengiriman lokasi otomatis setiap 5 detik via AJAX `POST /api/location`
- [ ] Hubungkan tombol status ke `PUT /api/ambulance/:id/status`
- [ ] Hubungkan tombol SOS ke `POST /api/sos` dengan lokasi terkini
- [ ] Build APK (`npx cap sync android` → build via Android Studio), test di emulator/device fisik
- [ ] Test skenario: minimize aplikasi, verifikasi lokasi tetap terkirim di background

## Phase 10 — Non-Functional & Polish

- [ ] Tambahkan validasi input (mis. `express-validator`) di seluruh endpoint POST/PUT
- [ ] Buat centralized error handler middleware di `src/middlewares/errorHandler.js`
- [ ] Tambahkan request logging sederhana (`morgan`)
- [ ] Konfigurasi CORS agar hanya origin dashboard yang diizinkan
- [ ] Pisahkan config `.env` untuk development vs production
- [ ] Tulis `README.md` — instruksi setup backend, database, dashboard, dan build aplikasi driver
- [ ] Siapkan data demo (skrip seed tambahan) untuk simulasi presentasi hackathon
- [ ] Lakukan end-to-end test: app sopir kirim lokasi → tersimpan di DB → muncul realtime di dashboard
