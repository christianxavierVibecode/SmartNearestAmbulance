# Smart Nearest Ambulance (SNA)

Sistem Real-Time Monitoring & Rekomendasi Ambulans Terdekat berbasis GPS untuk memantau armada ambulans dan membantu operator melakukan dispatch secara responsif.

---

## 🚀 Fitur Utama

- **Real-Time GPS Tracking**: Pengiriman koordinat lokasi ambulans setiap 5 detik via AJAX.
- **Server-Sent Events (SSE) Broadcast**: Streaming perubahan lokasi & status ambulans ke Operator Dashboard secara *real-time*.
- **Rekomendasi Ambulans Terdekat**: Perhitungan jarak *Haversine* untuk menentukan top-3 ambulans yang siap bertugas (`available`).
- **Emergency SOS Alert**: Tombol darurat sopir dengan notifikasi mencolok di dashboard operator.
- **Operator Dashboard**: Visualisasi peta interaktif dengan Leaflet.js & OpenStreetMap.
- **Driver Mobile App**: Aplikasi mobile Android berbasis Capacitor JS dengan background geolocation.
- **Custom Error Pages**: Tampilan error HTTP kustom (400, 401, 403, 404, 429, 500, 503) berbasis *Grain style reference*.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend** | Node.js, Express.js, `mysql2/promise`, JWT, `express-validator`, Morgan |
| **Database** | MySQL |
| **Realtime** | Server-Sent Events (SSE) |
| **Dashboard Operator** | Web Standard (HTML5, CSS3, JS), Leaflet.js, OpenStreetMap |
| **Aplikasi Driver** | Web App dibungkus Capacitor JS (Android Native) |

---

## 📦 Struktur Project

```text
SmartNearestAmbulance/
├── AiReferences/         # Dokumentasi PRD, FRD, BRD, DESIGN, AGENT, TODO & icon.png
├── dashboard/            # Operator Web Dashboard & Halaman error (error.html)
├── database/             # Schema SQL & Seed data (seed.sql, demo_seed.sql)
├── driver-app/           # Capacitor Mobile App untuk Sopir Ambulans
│   ├── android/          # Native Android Project
│   └── www/              # Web assets driver app
├── src/                  # Backend Source Code (Express.js)
│   ├── config/           # Database configuration
│   ├── controllers/      # Route logic handlers
│   ├── middlewares/      # Auth, Role, Validation & Error Handlers
│   ├── models/           # Data access models
│   ├── routes/           # Express API endpoints
│   └── utils/            # SSE Manager, Haversine formula, Hash, JWT
├── .env.example          # Template konfigurasi environment
├── package.json          # Root Node.js dependencies
└── README.md             # Dokumentasi project
```

---

## ⚙️ Panduan Setup & Instalasi

### 1. Prasyarat
- Node.js (v18+)
- MySQL Server (XAMPP / MySQL Community Server)
- Android Studio & JDK (khusus untuk build APK mobile)

### 2. Instalasi Backend & Configuration

```bash
# Clone repository
git clone https://github.com/christianxavierVibecode/SmartNearestAmbulance.git
cd SmartNearestAmbulance

# Install Node.js dependencies
npm install

# Copy & edit file environment
cp .env.example .env
```

Sesuaikan konfigurasi database pada `.env`:
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

Buat database di MySQL bernama `smart_nearest_ambulance`, lalu eksekusi script SQL berikut:

```bash
# 1. Import tabel schema
mysql -u root smart_nearest_ambulance < database/schema.sql

# 2. Import data awal (atau gunakan demo_seed.sql untuk demo hackathon)
mysql -u root smart_nearest_ambulance < database/demo_seed.sql
```

---

## 🏃 Menjalankan Aplikasi

### Menjalankan Backend Server & Operator Dashboard

```bash
npm run dev
```

- **API Base URL**: `http://localhost:3000/api`
- **Operator Dashboard**: `http://localhost:3000/`
- **Driver Web App (Browser preview)**: `http://localhost:3000/driver/`

---

## 📱 Build Aplikasi Mobile Driver (Capacitor Android)

### 1. Sync Capacitor Web Assets
```bash
cd driver-app
npm install
npx cap sync android
```

### 2. Buka Project di Android Studio
```bash
npx cap open android
```

---

## 🔐 Kredensial Demo (Default Seed)

| Role | Username | Password |
|---|---|---|
| **Operator** | `operator1` | `password123` |
| **Management** | `admin1` | `password123` |
| **Driver 1** | `driver1` | `password123` |
| **Driver 2** | `driver2` | `password123` |

---

## 📄 API Endpoints Summary

- `POST /api/auth/login` — Autentikasi User & return JWT Token
- `GET /api/ambulances` — Daftar seluruh ambulans & lokasi terakhir
- `GET /api/ambulance/nearest?lat={lat}&lng={lng}` — Rekomendasi 3 ambulans terdekat
- `PUT /api/ambulance/:id/status` — Update status ambulans (`available`, `on_mission`, `maintenance`, `offline`)
- `POST /api/location` — Kirim posisi GPS terkini ambulans
- `GET /api/stream` — Realtime Server-Sent Events stream
- `POST /api/sos` — Trigger panggilan darurat SOS
- `PUT /api/sos/:id/resolve` — Selesaikan status panggilan SOS
