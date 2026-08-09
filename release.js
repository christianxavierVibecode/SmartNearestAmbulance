const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Sesuaikan path ke dalam folder driver-app
const driverAppPath = path.join(__dirname, 'driver-app');

// 2. Baca appName dari capacitor.config.json di dalam folder driver-app
const configPath = path.join(driverAppPath, 'capacitor.config.json');

if (!fs.existsSync(configPath)) {
    console.error(`❌ File tidak ditemukan di: ${configPath}`);
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const appName = config.appName.replace(/\s+/g, '-'); 

// 3. Tentukan lokasi asal dan tujuan APK
const apkDir = path.join(driverAppPath, 'android', 'app', 'build', 'outputs', 'apk', 'debug');
const oldApkPath = path.join(apkDir, 'app-debug.apk');
const newApkPath = path.join(apkDir, `${appName}.apk`);

// 4. Rename file APK jika file aslinya ditemukan
if (fs.existsSync(oldApkPath)) {
    fs.renameSync(oldApkPath, newApkPath);
    console.log(`✅ Sukses mengubah nama APK menjadi: ${appName}.apk`);
} else if (!fs.existsSync(newApkPath)) {
    console.error(`❌ File APK tidak ditemukan di direktori:\n${apkDir}`);
    console.error('Pastikan Anda sudah melakukan build manual di Android Studio.');
    process.exit(1);
} else {
    console.log(`ℹ️ File ${appName}.apk sudah ada, melanjutkan proses Git.`);
}

// 5. Otomatisasi Git Push dan Tag dengan Penanganan Error yang Lebih Baik
const version = `v${Date.now()}`; 
try {
    console.log('🚀 Memaksa Git untuk mendeteksi file APK baru...');
    // MENAMBAHKAN PARAMETER -f UNTUK MEMAKSA GIT MEMBAWA FILE APK TANPA TERBLOKIR GITIGNORE
    const relativeApkPath = path.relative(__dirname, newApkPath).replace(/\\/g, '/');
    execSync(`git add -f "${relativeApkPath}"`);
    
    // Tambahkan file sisa lainnya jika ada perubahan kode web
    execSync('git add .'); 

    console.log('📝 Melakukan Git Commit...');
    // Cek apakah ada perubahan yang siap dikomit agar tidak memicu error kosong
    const status = execSync('git status --porcelain').toString().trim();
    if (status) {
        execSync(`git commit -m "Build: Release ${appName} (${version})"`);
    } else {
        console.log('ℹ️ Tidak ada perubahan kode baru untuk dikomit, membuat tag langsung.');
    }
    
    console.log(`🏷️  Membuat tag rilis: ${version}`);
    execSync(`git tag ${version}`);
    
    console.log('📤 Mengirim kode dan tag ke GitHub...');
    execSync('git push origin main'); 
    execSync(`git push origin ${version}`);
    
    console.log('🎉 Selesai! GitHub Actions sekarang sedang memproses rilis Anda di cloud.');
} catch (error) {
    console.error('❌ Terjadi kesalahan saat menjalankan perintah Git:', error.message);
    if (error.stdout) console.error('Detail stdout:', error.stdout.toString());
    if (error.stderr) console.error('Detail stderr:', error.stderr.toString());
}
