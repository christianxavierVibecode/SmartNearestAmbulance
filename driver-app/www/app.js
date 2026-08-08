// Configuration: Base URL API
// Deteksi lingkungan: Jika di-run di APK native Capacitor (Capacitor.isNativePlatform() ATAU localhost tanpa port express),
// gunakan URL publik Railway. Jika dibuka via browser web (Express server), gunakan relative path ''.
const isNativeApp = (typeof window.Capacitor !== 'undefined' && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) ||
                    (window.location.hostname === 'localhost' && window.location.port === '');

const API_BASE_URL = isNativeApp
  ? 'https://smartnearestambulance-production.up.railway.app'
  : '';

// Driver App State
let state = {
  token: localStorage.getItem('driver_token') || null,
  user: JSON.parse(localStorage.getItem('driver_user') || 'null'),
  ambulance: null,
  currentStatus: 'offline',
  currentCoords: { lat: -10.1772, lng: 123.5823 },
  trackingInterval: null,
  lastSentTime: null
};

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainScreen = document.getElementById('main-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

const driverNameEl = document.getElementById('driver-name');
const ambulancePlateEl = document.getElementById('ambulance-plate');
const logoutBtn = document.getElementById('logout-btn');

const liveCoordsEl = document.getElementById('live-coords');
const lastSentTimeEl = document.getElementById('last-sent-time');
const gpsStatusText = document.getElementById('gps-status-text');

const statusBtns = document.querySelectorAll('.status-btn');
const statusTextVal = document.getElementById('status-text-val');
const sosBtn = document.getElementById('sos-btn');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

function initAuth() {
  if (state.token && state.user) {
    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    driverNameEl.textContent = state.user.name;
    loadAmbulanceInfo();
  } else {
    loginScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
  }
}

// LOGIN HANDLER
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    if (data.user.role !== 'driver' && data.user.role !== 'operator') {
      throw new Error('Akun ini bukan role driver/sopir');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('driver_token', data.token);
    localStorage.setItem('driver_user', JSON.stringify(data.user));

    initAuth();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
  }
});

// LOGOUT HANDLER
logoutBtn.addEventListener('click', () => {
  if (state.trackingInterval) {
    clearInterval(state.trackingInterval);
  }
  localStorage.removeItem('driver_token');
  localStorage.removeItem('driver_user');
  state.token = null;
  state.user = null;
  location.reload();
});

// FETCH DRIVER'S AMBULANCE INFO
async function loadAmbulanceInfo() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ambulance/me`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const result = await res.json();

    if (res.ok && result.data) {
      state.ambulance = result.data;
      state.currentStatus = result.data.status;
      ambulancePlateEl.textContent = `Plat: ${result.data.plate_number}`;
      updateStatusUI(result.data.status);
    } else {
      console.warn('No ambulance linked to this driver account:', result.message);
      ambulancePlateEl.textContent = 'Tidak Ada Ambulans';
      state.ambulance = null;
    }
  } catch (err) {
    console.error('Failed to load ambulance info:', err);
    ambulancePlateEl.textContent = 'Gagal Memuat Ambulans';
    state.ambulance = null;
  }

  // Start 5-second automatic location tracking
  startLocationTracking();
}

// AUTOMATIC 5-SECOND GPS TRACKING
function startLocationTracking() {
  if (state.trackingInterval) {
    clearInterval(state.trackingInterval);
  }

  // First immediate update
  sendLocationUpdate();

  // Periodic 5-second interval loop
  state.trackingInterval = setInterval(() => {
    sendLocationUpdate();
  }, 5000);
}

function updateGPSCoords(cb) {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.currentCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        if (cb) cb();
      },
      (err) => {
        // Fallback simulate slight movement for demo
        state.currentCoords.lat += (Math.random() - 0.5) * 0.0002;
        state.currentCoords.lng += (Math.random() - 0.5) * 0.0002;
        if (cb) cb();
      },
      { enableHighAccuracy: true, timeout: 4000 }
    );
  } else {
    state.currentCoords.lat += (Math.random() - 0.5) * 0.0002;
    state.currentCoords.lng += (Math.random() - 0.5) * 0.0002;
    if (cb) cb();
  }
}

async function sendLocationUpdate() {
  if (!state.ambulance) return;

  updateGPSCoords(async () => {
    const ambId = state.ambulance.id;
    const { lat, lng } = state.currentCoords;

    liveCoordsEl.textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    try {
      const res = await fetch(`${API_BASE_URL}/api/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ambulance_id: ambId,
          lat: lat,
          lng: lng
        })
      });

      if (res.ok) {
        state.lastSentTime = new Date();
        lastSentTimeEl.textContent = state.lastSentTime.toLocaleTimeString();
        gpsStatusText.textContent = 'GPS Terhubung (5s)';
      }
    } catch (err) {
      console.error('Error sending location:', err);
      gpsStatusText.textContent = 'Gagal Kirim (Retrying...)';
    }
  });
}

// STATUS BUTTONS HANDLER
statusBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!state.ambulance) {
      alert('Tidak ada ambulans yang terhubung dengan akun driver ini');
      return;
    }

    const newStatus = btn.getAttribute('data-status');
    const ambId = state.ambulance.id;

    try {
      const res = await fetch(`${API_BASE_URL}/api/ambulance/${ambId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${state.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        state.currentStatus = newStatus;
        updateStatusUI(newStatus);
      } else {
        const data = await res.json();
        alert(data.message || 'Gagal mengubah status');
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  });
});

function updateStatusUI(status) {
  statusBtns.forEach(b => {
    if (b.getAttribute('data-status') === status) {
      b.classList.add('selected');
    } else {
      b.classList.remove('selected');
    }
  });

  const labels = {
    'available': 'Available (Siap Penugasan)',
    'on_mission': 'On Mission (Menuju Pasien)',
    'maintenance': 'Maintenance (Perbaikan)',
    'offline': 'Offline (Tidak Beroperasi)'
  };

  statusTextVal.textContent = labels[status] || status;
}

// SOS EMERGENCY HANDLER
sosBtn.addEventListener('click', async () => {
  if (!state.ambulance) {
    alert('Tidak ada ambulans yang terhubung dengan akun driver ini');
    return;
  }

  const confirmSos = confirm('KIRIM SINYAL DARURAT (SOS)?\nSinyal ini akan langsung menyalakan sirine alert di dashboard operator.');

  if (!confirmSos) return;

  const ambId = state.ambulance.id;
  const { lat, lng } = state.currentCoords;

  try {
    const res = await fetch(`${API_BASE_URL}/api/sos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ambulance_id: ambId,
        lat: lat,
        lng: lng
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('🚨 SINYAL SOS TERKIRIM!\nOperator dashboard telah menerima notifikasi lokasi darurat Anda.');
    } else {
      alert(data.message || 'Gagal mengirim sinyal SOS');
    }
  } catch (err) {
    console.error('Failed to send SOS:', err);
    alert('Terjadi kesalahan jaringan saat mengirim SOS');
  }
});
