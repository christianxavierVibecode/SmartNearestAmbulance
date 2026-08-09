const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Sesuaikan path ke dalam folder driver-app
const driverAppPath = path.join(__dirname, 'driver-app');

// 2. Baca appName dari capacitor.config.json di dalam folder driver-app
const configPath = path.join(driverAppPath, 'capacitor.config.json');

if (!fs.existsSync(configPath)) {
    console.error(`❌ File tidak ditemukan di: ${configPath}`);
    console.error('Pastikan file capacitor.config.json ada di dalam folder driver-app.');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const appName = config.appName.replace(/\s+/g, '-'); // Mengganti spasi menjadi strip

// 3. Tentukan lokasi asal dan tujuan APK di dalam driver-app
const apkDir = path.join(driverAppPath, 'android', 'app', 'build', 'outputs', 'apk', 'debug');
const oldApkPath = path.join(apkDir, 'app-debug.apk'); 
const newApkPath = path.join(apkDir, `${appName}.apk`);

// 4. Rename file APK jika file aslinya ditemukan
if (fs.existsSync(oldApkPath)) {
    fs.renameSync(oldApkPath, newApkPath);
    console.log(`✅ Sukses mengubah nama APK menjadi: ${appName}.apk`);
} else {
    console.error(`❌ File apk-debug.apk tidak ditemukan di direktori:\n${apkDir}`);
    console.error('Pastikan Anda sudah melakukan build manual di Android Studio.');
    process.exit(1);
}

// 5. Otomatisasi Git Push dan Tag
const version = `v${Date.now()}`; // Membuat tag unik berdasarkan timestamp
try {
    console.log('🚀 Melakukan Git Add dan Commit untuk APK baru...');
    execSync('git add .'); 
    execSync(`git commit -m "Build: Release ${appName} (${version})"`);
    
    console.log(`🏷️  Membuat tag rilis: ${version}`);
    execSync(`git tag ${version}`);
    
    console.log('📤 Mengirim kode dan tag ke GitHub...');
    execSync('git push origin main'); // Ganti 'main' ke 'master' jika branch utama Anda bernama master
    execSync(`git push origin ${version}`);
    
    console.log('🎉 Selesai! GitHub Actions sekarang sedang memproses rilis Anda di cloud.');
} catch (error) {
    console.error('❌ Terjadi kesalahan saat menjalankan perintah Git:', error.message);
}
