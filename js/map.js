/* ============================
   MAP INITIALIZATION
============================ */

const map = L.map("map").setView([23.0225, 72.5714], 13);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

/* ============================
   BUS MARKER
============================ */

let busMarker = L.marker([23.0225, 72.5714]).addTo(map);

/* ============================
   FIREBASE LIVE LOCATION LISTENER
============================ */

firebase.database().ref("buses/bus1").on("value", (snapshot) => {

  const data = snapshot.val();
  if (!data) return;

  const lat = data.latitude;
  const lng = data.longitude;

  // update marker position
  busMarker.setLatLng([lat, lng]);

  // center map on bus
  map.setView([lat, lng], 15);

  // popup data
  busMarker.bindPopup(`
    <b>Live Bus</b><br>
    Latitude: ${lat.toFixed(4)}<br>
    Longitude: ${lng.toFixed(4)}<br>
    Status: ${data.status || "Running"}
  `).openPopup();
});
