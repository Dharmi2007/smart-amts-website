let map;
let markers = [];

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

function findBus() {
  const from = document.getElementById("from").value.trim().toLowerCase();
  const to = document.getElementById("to").value.trim().toLowerCase();

  const matched = buses.filter(bus =>
    bus.from.toLowerCase() === from &&
    bus.to.toLowerCase() === to
  );

  let html = "";

  if (matched.length === 0) {
    html = "<p style='color:red'>No buses available for this route</p>";
  } else {
    matched.forEach(bus => {
      html += `
        <div style="margin-bottom:12px">
          <b>${bus.number}</b><br>
          <b>Start:</b> ${bus.from}<br>
          <b>Destination:</b> ${bus.to}<br>
          <b>Via:</b> ${bus.via}<br>
          <b>Crowd:</b> ${bus.crowd}
        </div>
        <hr>
      `;
    });
  }

  document.getElementById("busList").innerHTML = html;
  document.getElementById("busCard").classList.remove("hidden");

  showMap(matched);
}

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

  setInterval(() => {
    markers.forEach((m, i) => {
      m.setLatLng([busList[i].lat, busList[i].lng]);
    });
  }, 3000);
}

function submitFeedback() {
  feedbacks.push(document.getElementById("feedbackText").value);
  alert("Thank you for your feedback!");
}

