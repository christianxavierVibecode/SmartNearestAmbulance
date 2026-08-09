<p align="center">
  <img src="AiReferences/iconApp.png" width="128" height="128" alt="Smart Nearest Ambulance App Icon" style="border-radius: 24px;">
  <h1 align="center">Smart Nearest Ambulance (SNA)</h1>
  <p align="center">
    <strong>Sistem Real-Time GPS Tracking, Monitoring Armada & Rekomendasi Ambulans Terdekat</strong>
  </p>
  <p align="center">
    <a href="#-tentang-proyek--latar-belakang-brd">Tentang Proyek</a> •
    <a href="#-tampilan-aplikasi--user-flow-preview">Preview Tampilan</a> •
    <a href="#-fitur-utama">Fitur Utama</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-panduan-setup--instalasi">Panduan Setup</a> •
    <a href="#-otomatisasi-build--release-apk">Otomatisasi Release</a>
  </p>
</p>

---

## 📋 Tentang Proyek & Latar Belakang (BRD)

Dalam kondisi darurat medis, kecepatan respons armada ambulans merupakan faktor kritis yang menentukan tingkat keselamatan pasien (*Golden Hour*). Pada sistem konvensional, proses pemantauan posisi ambulans dan koordinasi *dispatch* masih dilakukan secara manual melalui telepon atau aplikasi pesan instan. Hal ini menyebabkan operator kesulitan mengetahui koordinat aktual seluruh armada dan berpotensi salah memilih unit ambulans yang ditugaskan.

**Smart Nearest Ambulance (SNA)** hadir sebagai solusi berbasis *Location-Based Service* (GPS) dan *Real-Time Data Streaming* yang membantu operator rumah sakit memantau pergerakan armada secara langsung pada peta interaktif, menerima sinyal darurat (SOS), serta mendapatkan rekomendasi ambulans terdekat secara otomatis berdasarkan algoritma *Haversine*.

### 🎯 Pernyataan Masalah (Problem Statement)
- **Sulit Memantau Posisi Real-Time**: Operator harus menghubungi sopir secara manual untuk mengetahui posisi fisik ambulans.
- **Proses Dispatch Kurang Optimal**: Penentuan unit ambulans yang ditugaskan masih berdasarkan perkiraan manual sehingga berisiko terlambat.
- **Minim Visibilitas Status Armada**: Operator tidak mengetahui secara pasti apakah ambulans sedang *Available*, *On Mission*, *Maintenance*, atau *Offline*.
- **Kurangnya Data Riwayat Operasional**: Sulit melakukan evaluasi performa waktu tanggap (*response time*) layanan ambulans.

### 💡 Tujuan Bisnis (Business Objectives)
- **Memantau Posisi Real-Time**: Menyajikan lokasi seluruh ambulans pada peta interaktif operator dengan pembaruan setiap 5 detik.
- **Rekomendasi Terdekat Otomatis**: Menghitung jarak lurus titik pasien ke seluruh armada *available* dan menampilkan Top-3 rujukan terdekat.
- **Respon Darurat Instan**: Menyediakan fitur SOS emergency button pada aplikasi mobile driver yang langsung memicu notifikasi peringatan di dashboard operator.
- **Kontribusi SDG 3 (Good Health and Well-being)**: Mendukung peningkatan aksesibilitas dan kecepatan penanganan darurat kesehatan bagi masyarakat.

---

## 👥 Stakeholders & Peran Sistem

| Stakeholder | Peran & Akses Utama |
|---|---|
| **Operator Ambulans** | Memantau seluruh armada via Dashboard Web, memproses rekomendasi terdekat, dan menangani panggilan darurat SOS. |
| **Sopir Ambulans (Driver)** | Menggunakan aplikasi mobile Android (Capacitor), memperbarui status tugas, dan mentransmisikan lokasi GPS otomatis. |
| **Manajemen Rumah Sakit** | Mengakses laporan riwayat perjalanan armada (*trips history*) untuk evaluasi performa operasional. |

---

## 🖼️ Tampilan Aplikasi & User Flow Preview

Berikut adalah gambaran antarmuka dan alur kerja sistem Smart Nearest Ambulance pada Operator Dashboard dan Aplikasi Mobile Driver:

### 1. Autentikasi User (Operator & Driver Login)
Pengguna masuk ke dalam sistem sesuai dengan *role* akun yang terdaftar untuk menjaga keamanan dan hak akses data.

<p align="center">
  <img src="AiReferences/readmeImg/Halaman%20Login%20Operator.jpeg" width="48%" alt="Halaman Login Operator">&nbsp;
  <img src="AiReferences/readmeImg/Halaman%20Login%20Driver.jpeg" width="48%" alt="Halaman Login Driver">
</p>

---

### 2. Aplikasi Driver Mobile (Izin Lokasi & Manajemen Status)
Sopir memberikan izin akses lokasi latar belakang (*Background Geolocation*) agar lokasi GPS dapat terus terkirim setiap 5 detik. Sopir juga dapat mengubah status operasional armada (`Available`, `On Mission`, `Maintenance`, `Offline`).

<p align="center">
  <img src="AiReferences/readmeImg/Persetujuan%20Akses%20Lokasi%20pada%20aplikasi%20driver.jpeg" width="48%" alt="Persetujuan Akses Lokasi">&nbsp;
  <img src="AiReferences/readmeImg/Status%20Ambulance%20pada%20driver.jpeg" width="48%" alt="Status Ambulance Driver">
</p>

---

### 3. Monitoring Operator & Rekomendasi Ambulans Terdekat
Operator memantau posisi seluruh marker ambulans pada peta Leaflet.js / OpenStreetMap. Saat menerima panggilan darurat, operator dapat memasukkan titik koordinat pasien atau mengonversi link Google Maps untuk memperoleh **Rekomendasi 3 Ambulans Terdekat**.

<p align="center">
  <img src="AiReferences/readmeImg/Status%20Ambulance%20pada%20operator.jpeg" width="48%" alt="Status Ambulance Operator">&nbsp;
  <img src="AiReferences/readmeImg/Rekomendasi%20ambulance%20berdasarkan%20lokasi%20pasien.jpeg" width="48%" alt="Rekomendasi Ambulans Terdekat">
</p>

---

### 4. Sistem Sinyal Darurat (SOS Emergency Alert)
Jika sopir mengalami kendala di lapangan atau membutuhkan penanganan darurat segera, sopir dapat memicu **Tombol SOS**. Sinyal ini ditransmisikan secara *real-time* via SSE ke dashboard operator dengan efek peringatan visual dan sorotan marker khusus.

<p align="center">
  <img src="AiReferences/readmeImg/Sinya%20SOS%20dikirim%20dari%20driver.jpeg" width="48%" alt="Sinyal SOS Kirim Driver">&nbsp;
  <img src="AiReferences/readmeImg/Sinyal%20SOS%20di%20terima%20oleh%20operator.jpeg" width="48%" alt="Sinyal SOS Diterima Operator">
</p>

---

## ⚡ Fitur Utama

- **Real-Time GPS Tracking**: Pengiriman koordinat lokasi ambulans setiap 5 detik secara otomatis dari aplikasi driver.
- **Server-Sent Events (SSE) Broadcast**: Streaming pembaruan lokasi dan status tanpa perlunya reload halaman dashboard.
- **Algoritma Haversine Recommendation**: Menghitung jarak presisi (*kilometer*) titik pasien ke unit ambulans berstatus `Available`.
- **Integrasi Google Maps URL Parser**: Memudahkan operator mengonversi URL Google Maps (`maps.app.goo.gl`) menjadi koordinat latitude/longitude.
- **Interactive Leaflet.js Map**: Peta interaktif dengan peta OpenStreetMap dan icon marker khusus sesuai status armada.
- **Custom Error Pages (Grain Style)**: Tampilan error HTTP kustom (400, 401, 403, 404, 429, 500, 503) yang estetis dan responsif.
- **Otomatisasi Release APK via GitHub Actions**: Pembangunan rilis APK driver secara otomatis ketika tag versi di-push.

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|---|---|
| **Backend API** | Node.js, Express.js, `mysql2/promise`, JWT, `express-validator`, Morgan |
| **Database** | MySQL (Relational DB dengan prepared statements) |
| **Realtime Engine** | Server-Sent Events (SSE) |
| **Dashboard Operator** | Web Standard (HTML5, CSS3, JS Vanilla), Leaflet.js, OpenStreetMap |
| **Aplikasi Driver** | Web App dibungkus **Capacitor JS** (Native Android Build) |
| **DevOps / CI/CD** | GitHub Actions (`softprops/action-gh-release`), Railway Deployment |

---

## 📦 Struktur Project

```text
SmartNearestAmbulance/
├── .github/workflows/    # Configuration CI/CD GitHub Actions Auto Release
│   └── release.yml
├── AiReferences/         # Dokumen PRD, FRD, BRD, DESIGN, AGENT, iconApp & Preview Img
│   ├── readmeImg/        # Tangkapan layar preview antarmuka aplikasi
│   ├── iconApp.png       # Master logo icon aplikasi
│   └── BRD.md            # Business Requirements Document
├── dashboard/            # Operator Web Dashboard & Custom Error Pages
│   ├── index.html
│   ├── error.html
│   ├── style.css
│   └── app.js
├── database/             # Schema SQL & Seed Scripts
│   ├── schema.sql        # DDL tabel utama
│   ├── seed.sql          # Data dasar pengujian
│   └── demo_seed.sql     # Data simulasi lengkap untuk presentasi/hackathon
├── driver-app/           # Capacitor Mobile App (Driver)
│   ├── android/          # Native Android Studio Project
│   └── www/              # Web assets driver (HTML/CSS/JS)
├── src/                  # Source Code Backend Express.js
│   ├── config/           # DB Connection pool
│   ├── controllers/      # Business logic handlers
│   ├── middlewares/      # Auth, Role, Validation, Logging & Error Handlers
│   ├── models/           # Data access objects (MySQL)
│   ├── routes/           # Express API endpoints
│   └── utils/            # SSE Manager, Haversine, JWT, Password Hash
├── .env.example          # Template variabel lingkungan
├── release.js            # Node script otomatisasi rename APK & Push Git Release Tag
├── package.json          # Root Node.js dependencies
└── README.md             # Dokumentasi utama proyek
```

---

## ⚙️ Panduan Setup & Instalasi

### 1. Prasyarat Sistem
- Node.js (v18+)
- MySQL Server (XAMPP / MySQL Community Server)
- Android Studio & JDK 17+ (khusus pengembangan & build APK mobile)

### 2. Instalasi Backend & Environment

```bash
# Clone repository
git clone https://github.com/christianxavierVibecode/SmartNearestAmbulance.git
cd SmartNearestAmbulance

# Install dependencies root
npm install

# Salin konfigurasi environment
cp .env.example .env
```

Sesuaikan isi `.env`:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_nearest_ambulance
JWT_SECRET=dev_jwt_secret_key_12345
CORS_ORIGIN=*
```

### 3. Setup Database MySQL

Buat database MySQL baru bernama `smart_nearest_ambulance`, kemudian jalankan script SQL:

```bash
# 1. Import Struktur Tabel
mysql -u root smart_nearest_ambulance < database/schema.sql

# 2. Import Data Seed Demo Hackathon (Kupang - NTT)
mysql -u root smart_nearest_ambulance < database/demo_seed.sql
```

---

## 🏃 Menjalankan Aplikasi Lokal

```bash
# Jalankan backend Express & Dashboard Operator
npm run dev
```

- **API Base URL**: `http://localhost:3000/api`
- **Operator Web Dashboard**: `http://localhost:3000/`
- **Driver Web App (Preview Browser)**: `http://localhost:3000/driver/`

---

## 📱 Otomatisasi Build & Release APK Driver

Aplikasi driver dibangun menggunakan Capacitor JS. Kami telah menyediakan skrip otomatisasi `release.js` yang secara otomatis melakukan *rename* APK, membuat tag versi Git, dan memicu **GitHub Actions** untuk merilis file APK ke GitHub Releases.

### Alur Rilis Otomatis:

1. **Sinkronisasi Web Assets ke Android Native**:
   ```bash
   cd driver-app
   npm install
   npx cap sync android
   ```

2. **Buka Project di Android Studio & Build APK**:
   ```bash
   npx cap open android
   ```
   *Di Android Studio: Pilih menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.*

3. **Jalankan Skrip Release Otomatis**:
   Kembali ke terminal utama project, jalankan:
   ```bash
   node release.js
   ```
   *Skrip ini akan mengubah nama `app-debug.apk` menjadi `SNA-Driver.apk`, membuat commit Git, membuat tag versi `v*`, dan mengirimkannya ke GitHub. GitHub Actions secara otomatis mengunggah file APK ke halaman **Releases**.*

---

## 🔐 Kredensial Akun Demo (`demo_seed.sql`)

| Role | Username | Password | Keterangan |
|---|---|---|---|
| **Operator** | `operator1` | `password123` | Operator Pusat Command |
| **Management** | `admin1` | `password123` | Logistik & Manajemen RS |
| **Driver 1** | `driver1` | `password123` | Budi Santoso (Ambulans DH 1001 AA) |
| **Driver 2** | `driver2` | `password123` | Siti Rahma (Ambulans DH 2002 BB) |

---

## 📄 Ringkasan API Endpoint

- `POST /api/auth/login` — Autentikasi User & Pengembalian Token JWT
- `GET /api/ambulances` — Mengambil daftar seluruh ambulans & koordinat terakhir
- `GET /api/ambulance/nearest?lat={lat}&lng={lng}` — Menghitung top-3 ambulans terdekat
- `POST /api/ambulance/parse-gmaps` — Mengonversi link Google Maps menjadi koordinat GPS
- `PUT /api/ambulance/:id/status` — Memperbarui status ambulans (`available`, `on_mission`, `maintenance`, `offline`)
- `POST /api/location` — Mentransmisikan koordinat GPS terkini ambulans
- `GET /api/stream` — Realtime Server-Sent Events (SSE) Stream
- `POST /api/sos` — Mengirimkan sinyal darurat SOS dari driver
- `PUT /api/sos/:id/resolve` — Memperbarui status penanganan SOS oleh operator
