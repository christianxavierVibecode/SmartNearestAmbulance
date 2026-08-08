# AGENT.md — Instruksi untuk AI Coding Agent

Dokumen ini adalah panduan kerja bagi AI Agent/VibeCode yang menulis kode untuk project **Smart Nearest Ambulance**. Baca dokumen ini terlebih dahulu sebelum mengerjakan apa pun.

---

## 0. ATURAN WAJIB — Baca Sebelum Coding

1. **Selalu buka dan baca `TODO.md` di awal setiap sesi kerja**, sebelum menulis atau mengubah kode apa pun. `TODO.md` adalah satu-satunya sumber kebenaran mengenai apa yang sudah selesai dan apa yang harus dikerjakan berikutnya.
2. Cari task **pertama yang belum dicentang** (`- [ ]`) di `TODO.md`, dari atas ke bawah. Itulah task yang harus dikerjakan sekarang.
3. **Kerjakan hanya satu task tersebut.** Jangan mengerjakan beberapa task sekaligus, dan jangan meloncat ke task lain meskipun terlihat berkaitan — task sudah dipecah kecil dan berurutan dengan sengaja.
4. Setelah task selesai dan berhasil diverifikasi, **update `TODO.md`**: ubah `- [ ]` menjadi `- [x]` pada task tersebut.
5. Jika sebuah task ternyata butuh keputusan besar di luar cakupan task itu sendiri (misalnya perubahan arsitektur), **berhenti dan tanyakan ke user**, jangan mengambil keputusan sendiri secara diam-diam.
6. Jangan pernah menghapus atau mengubah urutan task di `TODO.md` tanpa diminta — hanya menandai status selesai/belum.

### 0.1 Aturan Khusus — Referensi Desain (`DESIGN.md`)

Project ini memiliki file `DESIGN.md` (diunduh dari styles.refero.design) yang berisi referensi tampilan/gaya visual untuk frontend.

- **Setiap kali menulis atau mengubah kode yang berkaitan dengan tampilan** — HTML/JSX markup, CSS/style, layout, komponen UI, warna, tipografi, spacing, ataupun styling di dashboard operator maupun aplikasi sopir (Capacitor) — **wajib buka dan baca `DESIGN.md` terlebih dahulu** sebelum menulis kode tersebut.
- Ikuti gaya visual (warna, font, spacing, komponen) yang didefinisikan di `DESIGN.md` secara konsisten di seluruh halaman, jangan membuat gaya baru yang menyimpang tanpa alasan.
- Task di `TODO.md` yang berkaitan dengan UI (mis. "Buat layout utama", "Buat badge status", "Buat halaman login") **dianggap otomatis mensyaratkan** pembacaan `DESIGN.md` lebih dulu, meskipun tidak disebutkan eksplisit di teks task.
- Task backend murni (routes, controller, model, database, utilitas non-UI) **tidak perlu** membaca `DESIGN.md`.
- Jika `DESIGN.md` tidak mencakup pola untuk suatu komponen spesifik yang sedang dibuat, gunakan gaya/prinsip desain yang paling mendekati dari file tersebut agar tetap konsisten, alih-alih membuat gaya baru dari nol.

---

## 1. Ringkasan Project

Smart Nearest Ambulance adalah sistem monitoring armada ambulans berbasis GPS yang membantu operator memantau posisi ambulans secara real-time dan mendapatkan rekomendasi ambulans terdekat untuk dispatch pasien darurat.

Dokumen referensi lengkap (baca jika butuh konteks bisnis/fungsional lebih dalam):
- `BRD.md` — latar belakang bisnis & ruang lingkup
- `PRD-Smart-Nearest-Ambulance.md` — kebutuhan produk, user stories, prioritas fitur
- `FRD-Smart-Nearest-Ambulance.md` — kebutuhan fungsional teknis, API spec, algoritma
- `database/schema.sql` (ERD) — struktur tabel database
- `DESIGN.md` — referensi tampilan/UI (lihat aturan wajib khusus di bagian 0.1)
- `TODO.md` — daftar task atomik yang harus diikuti

---

## 2. Tech Stack (Fixed — Jangan Diubah Tanpa Persetujuan User)

| Komponen | Teknologi |
|---|---|
| Backend | Node.js + Express |
| Database | MySQL |
| Realtime | Server-Sent Events (SSE) — **bukan WebSocket** |
| Pengiriman lokasi dari app sopir | AJAX periodik setiap **5 detik** (bukan streaming kontinu) |
| Aplikasi sopir | Web app dibungkus **Capacitor JS** (native Android/iOS) |
| Dashboard operator | Web app biasa (browser), peta menggunakan Leaflet.js |
| Autentikasi | JWT |

Keputusan arsitektur di atas sudah final berdasarkan diskusi dengan user — jangan mengganti SSE menjadi WebSocket, jangan mengganti Capacitor menjadi framework mobile lain, dan jangan mengganti MySQL menjadi database lain, kecuali user secara eksplisit meminta perubahan.

---

## 3. Batasan Scope (Out of Scope — Jangan Dikerjakan)

Sesuai BRD, fitur berikut **di luar scope** dan tidak boleh diimplementasikan kecuali diminta ulang oleh user:
- Rekam medis pasien
- Sistem pembayaran rumah sakit
- Manajemen jadwal dokter
- Integrasi BPJS / SIMRS
- Navigasi rute otomatis (routing turn-by-turn seperti Google Maps) — rekomendasi ambulans terdekat cukup pakai jarak lurus (Haversine), bukan routing jalan.

---

## 4. Konvensi Kerja

- **Struktur folder backend**: `src/routes`, `src/controllers`, `src/models`, `src/config`, `src/middlewares`, `src/utils` — ikuti pola ini secara konsisten untuk setiap fitur baru.
- **Commit message**: gunakan format Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, dst).
- **Satu task `TODO.md` = idealnya satu commit.**
- Query database menggunakan `mysql2/promise` dengan prepared statement (parameterized query) — jangan concatenate string SQL langsung, untuk menghindari SQL injection.
- Endpoint API mengikuti spesifikasi yang sudah didefinisikan di `FRD-Smart-Nearest-Ambulance.md` bagian "Spesifikasi API Endpoint" — jangan mengubah nama route/method tanpa alasan kuat.
- Nama tabel & kolom database mengikuti `database/schema.sql` persis — jangan membuat kolom/tabel baru secara sepihak di luar apa yang diminta task.

---

## 5. Alur Kerja Standar Setiap Sesi

1. Baca `TODO.md`.
2. Identifikasi task pertama yang belum selesai.
3. Jika perlu konteks tambahan, baca bagian relevan di `PRD` / `FRD` / `schema.sql`.
4. **Jika task berkaitan dengan tampilan/UI, baca `DESIGN.md` terlebih dahulu** (lihat aturan 0.1).
5. Implementasikan **hanya** task tersebut.
6. Verifikasi task berhasil (jalankan/test sesuai instruksi di task, mis. "test manual dengan curl/Postman").
7. Tandai task selesai di `TODO.md`.
8. Laporkan ke user secara singkat apa yang sudah dikerjakan, lalu berhenti — tunggu instruksi lanjut ke task berikutnya kecuali diminta untuk lanjut otomatis.
