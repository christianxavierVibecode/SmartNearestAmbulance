// State Management
let state = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  ambulances: [],
  activeSosAlerts: [],
  sseSource: null,
  patientLocation: null,
  mapSelectingMode: false
};

// Map & Markers References
let map = null;
let markersMap = {}; // Key: ambulance_id -> L.marker instance
let patientMarker = null;
let polylineGroup = null;
let sosMarkersMap = {}; // Key: alert_id -> L.marker instance

// DOM Elements
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const appContainer = document.getElementById('app-container');
const userNameEl = document.getElementById('user-name');
const userRoleEl = document.getElementById('user-role');
const logoutBtn = document.getElementById('logout-btn');
const sseIndicator = document.getElementById('sse-indicator');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const ambulanceListEl = document.getElementById('ambulance-list');
const ambulanceCountEl = document.getElementById('ambulance-count');

const nearestForm = document.getElementById('nearest-form');
const patientLatInput = document.getElementById('patient-lat');
const patientLngInput = document.getElementById('patient-lng');
const selectMapBtn = document.getElementById('select-map-btn');
const mapInstructions = document.getElementById('map-instructions');
const cancelMapSelectBtn = document.getElementById('cancel-map-select');
const nearestResultsEl = document.getElementById('nearest-results');

const sosListEl = document.getElementById('sos-list');
const sosBadgeCount = document.getElementById('sos-badge-count');

const historyModal = document.getElementById('history-modal');
const historyModalTitle = document.getElementById('history-modal-title');
const historyModalBody = document.getElementById('history-modal-body');
const closeHistoryModalBtn = document.getElementById('close-history-modal');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  setupEventListeners();
});

// AUTHENTICATION
function initAuth() {
  if (state.token && state.user) {
    loginModal.classList.add('hidden');
    appContainer.classList.remove('hidden');
    userNameEl.textContent = state.user.name;
    userRoleEl.textContent = state.user.role;
    initDashboard();
  } else {
    loginModal.classList.remove('hidden');
    appContainer.classList.add('hidden');
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login gagal');
    }

    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    initAuth();
  } catch (err) {
    loginError.textContent = err.message;
    loginError.classList.remove('hidden');
  }
});

logoutBtn.addEventListener('click', () => {
  if (state.sseSource) {
    state.sseSource.close();
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  state.token = null;
  state.user = null;
  location.reload();
});

// DASHBOARD SETUP
function initDashboard() {
  initMap();
  fetchAmbulances();
  initSse();
}

// MAP SETUP (Leaflet + OpenStreetMap)
function initMap() {
  if (map) return;

  // NTT / Kupang Default Focus
  const defaultLat = -10.177;
  const defaultLng = 123.58;
  const defaultZoom = 13;

  map = L.map('map').setView([defaultLat, defaultLng], defaultZoom);

  // OpenStreetMap Tile Layer + Mandatory Attribution
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  polylineGroup = L.layerGroup().addTo(map);

  // Map Click Listener for Patient Location Selection
  map.on('click', (e) => {
    if (state.mapSelectingMode) {
      const { lat, lng } = e.latlng;
      setPatientLocation(lat, lng);
      exitMapSelectingMode();
      // Auto trigger nearest search
      fetchNearestAmbulances(lat, lng);
    }
  });
}

// CUSTOM LEAFLET ICONS
function createAmbulanceIcon(status) {
  return L.divIcon({
    className: `custom-ambulance-marker ${status}`,
    html: '🚑',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function createPatientIcon() {
  return L.divIcon({
    className: 'custom-patient-marker',
    html: '🏥',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
}

function createSosIcon() {
  return L.divIcon({
    className: 'custom-sos-marker',
    html: '🚨',
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });
}

// FETCH & RENDER AMBULANCES
async function fetchAmbulances() {
  try {
    const res = await fetch('/api/ambulances', {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    const result = await res.json();

    if (res.ok) {
      state.ambulances = result.data;
      renderAmbulanceList();
      renderAmbulanceMarkers();
    }
  } catch (err) {
    console.error('Failed to fetch ambulances:', err);
  }
}

function renderAmbulanceList() {
  ambulanceCountEl.textContent = `${state.ambulances.length} armada`;
  ambulanceListEl.innerHTML = '';

  state.ambulances.forEach(amb => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `amb-card-${amb.id}`;

    const lastSeenText = amb.last_seen_at ? getRelativeTime(amb.last_seen_at) : 'Belum ada data';

    card.innerHTML = `
      <div class="card-header">
        <span class="plate-number">${amb.plate_number}</span>
        <span class="status-badge ${amb.status}">${getStatusLabel(amb.status)}</span>
      </div>
      <div class="card-body">
        <div>Pengemudi: <strong class="driver-name">${amb.driver_name || 'Tidak ada'}</strong></div>
        <div class="last-seen">Last Seen: <span id="last-seen-${amb.id}">${lastSeenText}</span></div>
      </div>
      <div class="card-footer">
        <button class="btn btn-outline btn-sm" onclick="viewTripHistory(${amb.id}, '${amb.plate_number}')">Riwayat Trip</button>
      </div>
    `;

    ambulanceListEl.appendChild(card);
  });
}

function renderAmbulanceMarkers() {
  state.ambulances.forEach(amb => {
    const lat = amb.last_seen_at ? amb.latitude : null;
    const lng = amb.last_seen_at ? amb.longitude : null;

    // Default position fallback if not reported yet
    const markerLat = lat || -10.177 + (amb.id * 0.005);
    const markerLng = lng || 123.58 + (amb.id * 0.005);

    if (markersMap[amb.id]) {
      markersMap[amb.id].setLatLng([markerLat, markerLng]);
      markersMap[amb.id].setIcon(createAmbulanceIcon(amb.status));
    } else {
      const marker = L.marker([markerLat, markerLng], {
        icon: createAmbulanceIcon(amb.status)
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 13px;">
          <strong>Ambulans ${amb.plate_number}</strong><br>
          Sopir: ${amb.driver_name || '-'}<br>
          Status: <strong>${getStatusLabel(amb.status)}</strong>
        </div>
      `);

      markersMap[amb.id] = marker;
    }
  });
}

// REALTIME SSE LISTENER
function initSse() {
  if (state.sseSource) {
    state.sseSource.close();
  }

  state.sseSource = new EventSource('/api/stream');

  state.sseSource.onopen = () => {
    sseIndicator.className = 'status-indicator online';
    sseIndicator.querySelector('.status-text').textContent = 'Realtime SSE Connected';
  };

  state.sseSource.onerror = () => {
    sseIndicator.className = 'status-indicator offline';
    sseIndicator.querySelector('.status-text').textContent = 'Reconnecting...';
  };

  // Handle location_update
  state.sseSource.addEventListener('location_update', (e) => {
    const data = JSON.parse(e.data);
    const { ambulance_id, lat, lng, timestamp } = data;

    // Update marker on map
    if (markersMap[ambulance_id]) {
      markersMap[ambulance_id].setLatLng([lat, lng]);
    }

    // Update state & UI
    const amb = state.ambulances.find(a => a.id === ambulance_id);
    if (amb) {
      amb.last_seen_at = timestamp;
      amb.latitude = lat;
      amb.longitude = lng;
      const lastSeenEl = document.getElementById(`last-seen-${ambulance_id}`);
      if (lastSeenEl) {
        lastSeenEl.textContent = getRelativeTime(timestamp);
      }
    }
  });

  // Handle status_update
  state.sseSource.addEventListener('status_update', (e) => {
    const data = JSON.parse(e.data);
    const { ambulance_id, status } = data;

    // Update marker icon
    if (markersMap[ambulance_id]) {
      markersMap[ambulance_id].setIcon(createAmbulanceIcon(status));
    }

    // Update state & UI badge
    const amb = state.ambulances.find(a => a.id === ambulance_id);
    if (amb) {
      amb.status = status;
      renderAmbulanceList();
    }
  });

  // Handle sos_alert
  state.sseSource.addEventListener('sos_alert', (e) => {
    const data = JSON.parse(e.data);
    const { alert_id, ambulance_id, lat, lng, timestamp } = data;

    state.activeSosAlerts.push(data);
    updateSosBadge();

    // Render SOS Marker on Map
    const sosMarker = L.marker([lat, lng], {
      icon: createSosIcon()
    }).addTo(map);

    sosMarker.bindPopup(`
      <div style="font-family: Inter, sans-serif; font-size: 13px; color: #dc2626;">
        <strong>🚨 SINYAL SOS DARURAT!</strong><br>
        Ambulans ID: ${ambulance_id}<br>
        Waktu: ${new Date(timestamp).toLocaleTimeString()}
      </div>
    `).openPopup();

    sosMarkersMap[alert_id] = sosMarker;
    renderSosList();
  });
}

// SOS ALERTS MANAGEMENT
function updateSosBadge() {
  const count = state.activeSosAlerts.length;
  if (count > 0) {
    sosBadgeCount.textContent = count;
    sosBadgeCount.classList.remove('hidden');
  } else {
    sosBadgeCount.classList.add('hidden');
  }
}

function renderSosList() {
  if (state.activeSosAlerts.length === 0) {
    sosListEl.innerHTML = '<p class="empty-state">Belum ada sinyal darurat SOS aktif.</p>';
    return;
  }

  sosListEl.innerHTML = '';
  state.activeSosAlerts.forEach(sos => {
    const amb = state.ambulances.find(a => a.id === sos.ambulance_id);
    const plateNumber = amb ? amb.plate_number : `ID ${sos.ambulance_id}`;

    const card = document.createElement('div');
    card.className = 'card sos-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="sos-header">🚨 SOS DARURAT (${plateNumber})</span>
        <span class="status-badge" style="background:#fecaca; color:#dc2626;">AKTIF</span>
      </div>
      <div class="card-body">
        <div>Koordinat: <strong>${sos.lat.toFixed(5)}, ${sos.lng.toFixed(5)}</strong></div>
        <div class="last-seen">Waktu: ${new Date(sos.timestamp).toLocaleTimeString()}</div>
      </div>
      <div class="card-footer">
        <button class="btn btn-primary btn-sm" onclick="resolveSosAlert(${sos.alert_id})">Selesaikan SOS</button>
      </div>
    `;
    sosListEl.appendChild(card);
  });
}

async function resolveSosAlert(alertId) {
  try {
    const res = await fetch(`/api/sos/${alertId}/resolve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    if (res.ok) {
      // Remove SOS marker
      if (sosMarkersMap[alertId]) {
        map.removeLayer(sosMarkersMap[alertId]);
        delete sosMarkersMap[alertId];
      }

      state.activeSosAlerts = state.activeSosAlerts.filter(s => s.alert_id !== alertId);
      updateSosBadge();
      renderSosList();
    }
  } catch (err) {
    console.error('Failed to resolve SOS alert:', err);
  }
}

// RECOMMENDATION / NEAREST AMBULANCE
function setPatientLocation(lat, lng) {
  state.patientLocation = { lat, lng };
  patientLatInput.value = lat.toFixed(6);
  patientLngInput.value = lng.toFixed(6);

  if (patientMarker) {
    patientMarker.setLatLng([lat, lng]);
  } else {
    patientMarker = L.marker([lat, lng], {
      icon: createPatientIcon()
    }).addTo(map);

    patientMarker.bindPopup('<strong>🏥 Lokasi Pasien / RS</strong>').openPopup();
  }
}

function enterMapSelectingMode() {
  state.mapSelectingMode = true;
  mapInstructions.classList.remove('hidden');
  map.getContainer().style.cursor = 'crosshair';
}

function exitMapSelectingMode() {
  state.mapSelectingMode = false;
  mapInstructions.classList.add('hidden');
  map.getContainer().style.cursor = '';
}

selectMapBtn.addEventListener('click', () => {
  enterMapSelectingMode();
});

cancelMapSelectBtn.addEventListener('click', () => {
  exitMapSelectingMode();
});

nearestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const lat = parseFloat(patientLatInput.value);
  const lng = parseFloat(patientLngInput.value);

  if (!isNaN(lat) && !isNaN(lng)) {
    setPatientLocation(lat, lng);
    fetchNearestAmbulances(lat, lng);
  }
});

async function fetchNearestAmbulances(lat, lng) {
  try {
    nearestResultsEl.innerHTML = '<p class="empty-state">Mencari ambulans terdekat...</p>';

    const res = await fetch(`/api/ambulance/nearest?lat=${lat}&lng=${lng}`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || 'Gagal mengambil rekomendasi');
    }

    renderNearestResults(result.data, lat, lng);
  } catch (err) {
    nearestResultsEl.innerHTML = `<p class="empty-state" style="color:#dc2626;">${err.message}</p>`;
  }
}

function renderNearestResults(ambulances, patientLat, patientLng) {
  polylineGroup.clearLayers();
  nearestResultsEl.innerHTML = '';

  if (ambulances.length === 0) {
    nearestResultsEl.innerHTML = '<p class="empty-state">Tidak ada ambulans berstatus Available di sekitar lokasi ini.</p>';
    return;
  }

  ambulances.forEach((amb, index) => {
    // Draw connecting line from patient to ambulance
    const line = L.polyline([
      [patientLat, patientLng],
      [amb.latitude, amb.longitude]
    ], {
      color: index === 0 ? '#009959' : '#007bff',
      weight: index === 0 ? 4 : 2,
      dashArray: '6, 6'
    }).addTo(polylineGroup);

    const card = document.createElement('div');
    card.className = 'card nearest-card';
    card.innerHTML = `
      <div class="card-header">
        <span class="plate-number">#${index + 1} ${amb.plate_number}</span>
        <span class="distance-badge">${amb.distance_km} km</span>
      </div>
      <div class="card-body">
        <div>Pengemudi: <strong class="driver-name">${amb.driver_name || '-'}</strong></div>
        <div class="last-seen">Last Seen: ${getRelativeTime(amb.last_seen_at)}</div>
      </div>
    `;

    nearestResultsEl.appendChild(card);
  });
}

// TRIP HISTORY MODAL
async function viewTripHistory(ambulanceId, plateNumber) {
  historyModalTitle.textContent = `Riwayat Perjalanan (${plateNumber})`;
  historyModalBody.innerHTML = '<p class="empty-state">Memuat riwayat...</p>';
  historyModal.classList.remove('hidden');

  try {
    const res = await fetch(`/api/ambulance/${ambulanceId}/history`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });

    const result = await res.json();

    if (!res.ok) throw new Error(result.message || 'Gagal memuat riwayat');

    renderTripHistory(result.data);
  } catch (err) {
    historyModalBody.innerHTML = `<p class="empty-state" style="color:#dc2626;">${err.message}</p>`;
  }
}

function renderTripHistory(trips) {
  if (trips.length === 0) {
    historyModalBody.innerHTML = '<p class="empty-state">Belum ada riwayat perjalanan tercatat untuk ambulans ini.</p>';
    return;
  }

  historyModalBody.innerHTML = '';
  trips.forEach((trip, idx) => {
    const startTimeStr = new Date(trip.start_time).toLocaleString('id-ID');
    const endTimeStr = trip.end_time ? new Date(trip.end_time).toLocaleString('id-ID') : 'Sedang Berlangsung...';

    const item = document.createElement('div');
    item.className = 'trip-item';
    item.innerHTML = `
      <div class="trip-time">Trip #${trips.length - idx}: ${startTimeStr} &rarr; ${endTimeStr}</div>
    `;
    historyModalBody.appendChild(item);
  });
}

closeHistoryModalBtn.addEventListener('click', () => {
  historyModal.classList.add('hidden');
});

// TAB SWITCHING
function setupEventListeners() {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabTarget = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabTarget}`).classList.add('active');
    });
  });
}

// UTILITY HELPERS
function getStatusLabel(status) {
  const map = {
    'available': 'Available',
    'on_mission': 'On Mission',
    'maintenance': 'Maintenance',
    'offline': 'Offline'
  };
  return map[status] || status;
}

function getRelativeTime(timestamp) {
  if (!timestamp) return 'Belum ada data';
  const now = new Date();
  const past = new Date(timestamp);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 5) return 'Baru saja';
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  return `${diffHour} jam lalu`;
}
