let map;
let markers = [];
let userMarker = null;
let userLocation = null;

let selectedBusNumber = "";
let selectedStation = "";

/* ---------- AUTOCOMPLETE ---------- */
function showSuggestions(input, listId) {
  const value = input.value.toLowerCase();
  const list = document.getElementById(listId);
  list.innerHTML = "";

  if (!value) return;

  locations.forEach(loc => {
    if (loc.toLowerCase().includes(value)) {
      const div = document.createElement("div");
      div.innerText = loc;
      div.onclick = () => {
        input.value = loc;
        list.innerHTML = "";
      };
      list.appendChild(div);
    }
  });
}

/* ---------- LOCATION FEATURE ---------- */
function getUserLocation() {
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      document.getElementById("mapSection").classList.remove("hidden");

      if (!map) {
        map = L.map("map").setView([userLocation.lat, userLocation.lng], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      } else {
        map.setView([userLocation.lat, userLocation.lng], 14);
      }

      if (userMarker) map.removeLayer(userMarker);

      userMarker = L.marker([userLocation.lat, userLocation.lng])
        .addTo(map)
        .bindPopup("📍 Your Location")
        .openPopup();
    },
    () => {
      alert("Location permission denied");
    }
  );
}

/* ---------- DISTANCE ---------- */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

/* ---------- FIND BUS ---------- */
function findBus() {
  const fromVal = document.getElementById("from").value.trim();
  const toVal = document.getElementById("to").value.trim();

  const from = fromVal.toLowerCase();
  const to = toVal.toLowerCase();

  const matched = buses.filter(bus =>
    bus.from.toLowerCase() === from &&
    bus.to.toLowerCase() === to
  );

  let html = "";

  if (matched.length === 0) {
    html = "<p style='color:red'>No buses available for this route</p>";
    selectedBusNumber = "";
    selectedStation = "";
  } else {
    matched.forEach(bus => {
      let distanceText = "";

      if (userLocation) {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          bus.lat,
          bus.lng
        );
        distanceText = `<br><b>Distance:</b> ${dist} km from you`;
      }

      html += `
        <div style="margin-bottom:12px; cursor:pointer"
             onclick="selectBus('${bus.number}','${bus.from}','${bus.to}')">
          <b>${bus.number}</b><br>
          <b>Start:</b> ${bus.from}<br>
          <b>Destination:</b> ${bus.to}<br>
          <b>Via:</b> ${bus.via}<br>
          <b>Crowd:</b> ${bus.crowd}
          ${distanceText}
        </div>
        <hr>
      `;
    });

    // Passenger boards from "from" location → this is the station
    selectedStation = fromVal;
  }

  document.getElementById("busList").innerHTML = html;
  document.getElementById("busCard").classList.remove("hidden");

  showMap(matched);
}

/* ---------- BUS SELECT ---------- */
function selectBus(busNumber, from, to) {
  const busInput = document.getElementById("feedbackBus");
  const stationInput = document.getElementById("feedbackStation");

  if (busInput) busInput.value = busNumber;
  if (stationInput) stationInput.value = from + " → " + to;
}
/* ---------- MAP ---------- */
function toggleMap() {
  document.getElementById("mapSection").classList.toggle("hidden");
}

function showMap(busList) {
  document.getElementById("mapSection").classList.remove("hidden");

  if (!map) {
    map = L.map("map").setView([23.0225, 72.5714], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  }

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  busList.forEach(bus => {
    const marker = L.marker([bus.lat, bus.lng])
      .addTo(map)
      .bindPopup(`Bus ${bus.number}`);
    markers.push(marker);
  });
}

/* ================= FEEDBACK SYSTEM (FIREBASE) ================= */

function submitFeedback() {
  const busInput = document.getElementById("feedbackBus");
  const stationInput = document.getElementById("feedbackStation");
  const typeInput = document.getElementById("feedbackType");
  const msgInput = document.getElementById("feedbackMessage");

  if (!busInput.value || !stationInput.value) {
    alert("⚠️ Please enter Bus and Station");
    return;
  }

  const feedback = {
    bus: busInput.value.trim(),
    station: stationInput.value.trim(),
    issue: typeInput.value,
    message: msgInput.value.trim() || "No message",
    time: Date.now()
  };

  database.ref("feedbacks").push(feedback)
    .then(() => {
      alert("✅ Feedback submitted successfully!");
      msgInput.value = "";
    })
    .catch(err => {
      console.error("Firebase Error:", err);
      alert("❌ Failed to submit feedback");
    });
}
