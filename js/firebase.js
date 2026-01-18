// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCt8xps-QZ0phnP1cJgjA6nqhiNCGjbH8g",
  authDomain: "smart-amts-d0ec8.firebaseapp.com",
  databaseURL: "https://smart-amts-d0ec8-default-rtdb.firebaseio.com",
  projectId: "smart-amts-d0ec8",
  storageBucket: "smart-amts-d0ec8.appspot.com",
  messagingSenderId: "121822205622",
  appId: "1:121822205622:web:193337ae3482b8602e3817"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ---------------- Leaflet Map ----------------
const map = L.map('map').setView([23.0225, 72.5714], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ---------------- Bus Markers ----------------
const busMarkers = {};

// ---------------- Listen for new buses ----------------
database.ref("buses").on("child_added", snapshot => {
  const busId = snapshot.key;  // 🔑 use Firebase key as bus ID
  const bus = snapshot.val();

  if (!bus.latitude || !bus.longitude) return;

  busMarkers[busId] = L.marker([bus.latitude, bus.longitude])
    .addTo(map)
    .bindPopup(`🚌 ${bus.name || busId}`);
});

// ---------------- Listen for changes in bus location ----------------
database.ref("buses").on("child_changed", snapshot => {
  const busId = snapshot.key;
  const bus = snapshot.val();

  if (busMarkers[busId]) {
    busMarkers[busId].setLatLng([bus.latitude, bus.longitude]);
    busMarkers[busId].getPopup().setContent(`🚌 ${bus.name || busId}`);
  }
});

// ---------------- OPTIONAL: Follow a bus ----------------
// Uncomment if you want map to center on first bus
// database.ref("buses").once("value").then(snap => {
//   const firstBus = snap.val() && Object.values(snap.val())[0];
//   if(firstBus) map.setView([firstBus.latitude, firstBus.longitude], 13);
// });
