const map = L.map("map").setView([23.0225, 72.5714], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

const markers = {};

function renderBuses() {
  buses.forEach(bus => {
    if (!markers[bus.id]) {
      markers[bus.id] = L.marker([bus.lat, bus.lng]).addTo(map);
    } else {
      markers[bus.id].setLatLng([bus.lat, bus.lng]);
    }

    markers[bus.id].bindPopup(`
      <b>Bus ${bus.number}</b><br>
      Route: ${bus.route}<br>
      Crowd: ${bus.crowd}<br>
      Status: ${bus.status}
    `);
  });
}

function updateBusLocations() {
  buses.forEach(bus => {
    bus.lat += (Math.random() - 0.5) * 0.001;
    bus.lng += (Math.random() - 0.5) * 0.001;
  });
}

renderBuses();

setInterval(() => {
  updateBusLocations();
  renderBuses();
}, 3000);


