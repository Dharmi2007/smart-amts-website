/* ============================
   MAP INITIALIZATION
============================ */

const map = L.map("map").setView([23.0225, 72.5714], 13);

// OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const busMarkers = {};

firebase.database().ref("buses").on("value", (snapshot) => {

  snapshot.forEach((childSnap) => {

    const busId = childSnap.key;
    const data = childSnap.val();

    if (!data || !data.latitude || !data.longitude) return;

    const lat = Number(data.latitude);
    const lng = Number(data.longitude);

    if (!busMarkers[busId]) {

      busMarkers[busId] = L.marker([lat, lng]).addTo(map)
        .bindPopup(`
          <b>${data.name || busId}</b><br>
          Status: ${data.status || "Unknown"}
        `);

    } else {
      busMarkers[busId].setLatLng([lat, lng]);
    }

  });

});


