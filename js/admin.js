// ===============================
// Admin Dashboard – Fixed Crowd Analytics + Route-wise Bus Count
// ===============================

// Firebase references
const busesRef = database.ref("buses");
const feedbacksRef = database.ref("feedbacks");

// Global array to store buses
let busesArray = [];

// ===============================
// Real-time Buses Listener
// ===============================
busesRef.on("value", snapshot => {
  const busesData = snapshot.val();
  if (!busesData) return;

  busesArray = Object.keys(busesData).map(key => ({
    id: key,
    ...busesData[key]
  }));

  // -----------------------
  // 1️⃣ Total Running Buses – Route-wise
  // -----------------------
  const runningBusesArray = busesArray.filter(bus => bus.status === "Running");
  const totalRunning = runningBusesArray.length;

  const routeCount = {};
  runningBusesArray.forEach(bus => {
    const route = bus.route || "N/A";
    if (!routeCount[route]) routeCount[route] = 0;
    routeCount[route]++;
  });

  let busCountHTML = `🚍 Total Running Buses: 1${totalRunning}<br>`;
  for (const route in routeCount) {
    busCountHTML += `Route ${route}: ${routeCount[route]} running<br>`;
  }

  document.getElementById("busCount").innerHTML = busCountHTML;

  // -----------------------
  // 2️⃣ Bus Cards + Crowd Analytics
  // -----------------------
  const busDetailsDiv = document.getElementById("busDetails");
  busDetailsDiv.innerHTML = "";

  let peakCrowdBus = null;
  let maxCrowdPercent = -1;
  let mediumHighCount = 0;

  busesArray.forEach(bus => {
    const occupancy = Number(bus.occupancy) || 0;
    const capacity = Number(bus.capacity) || 1;
    const crowdPercent = Math.round((occupancy / capacity) * 100);

    // Determine crowd level
    let crowdLevel = "Low";
    if (crowdPercent >= 70) crowdLevel = "High";
    else if (crowdPercent >= 40) crowdLevel = "Medium";

    // Track peak crowded bus
    if (crowdPercent > maxCrowdPercent) {
      maxCrowdPercent = crowdPercent;
      peakCrowdBus = bus;
    }

    // Count medium/high for feedback simulation
    if (crowdLevel === "Medium" || crowdLevel === "High") mediumHighCount++;

    bus.crowdLevel = crowdLevel;

    // Create bus detail card
    const div = document.createElement("div");
    div.className = "bus-card";
    div.style.border = "2px solid #ccc";
    div.style.padding = "10px";
    div.style.margin = "5px 0";
    div.style.borderRadius = "5px";

    div.innerHTML = `
      <strong>Bus Name:</strong> ${bus.name || bus.id}<br>
      <strong>Route:</strong> ${bus.route || "N/A"}<br>
      <strong>Occupancy:</strong> ${occupancy}/${capacity}<br>
      <strong>Crowd Level:</strong> ${crowdLevel} (${crowdPercent}%)
    `;

    busDetailsDiv.appendChild(div);
  });

  // -----------------------
  // 3️⃣ Peak Crowd Route
  // -----------------------
  let crowdInfoEl = document.getElementById("crowdInfo");
  if (crowdInfoEl) {
    crowdInfoEl.innerHTML =
      "🔥 Peak Crowd Route: " + (peakCrowdBus ? (peakCrowdBus.route || peakCrowdBus.name) : "No Data");
  }

  // -----------------------
  // 4️⃣ Simulated Feedbacks
  // -----------------------
  document.getElementById("feedbackCount").innerText = mediumHighCount * 2;
});

// ===============================
// Route Search Logic
// ===============================
const routeInput = document.getElementById("routeSearch");
const routeResultDiv = document.getElementById("routeResult");

if (routeInput && routeResultDiv) {
  routeInput.addEventListener("input", () => {
    const query = routeInput.value.trim().toLowerCase();
    routeResultDiv.innerHTML = "";

    if (!query) return;

    const matchedBuses = busesArray.filter(bus => (bus.route || "").toLowerCase().includes(query));

    if (matchedBuses.length === 0) {
      routeResultDiv.innerHTML = "<em>No buses found for this route</em>";
      return;
    }

    const totalBuses = matchedBuses.length;
    const runningBuses = matchedBuses.filter(bus => bus.status === "Running").length;
    const stoppedBuses = totalBuses - runningBuses;

    routeResultDiv.innerHTML = `
      <strong>Route: </strong>${matchedBuses[0].route}<br>
      <strong>Total Buses:</strong> ${totalBuses}<br>
      <strong>Running:</strong> ${runningBuses}<br>
      <strong>Stopped:</strong> ${stoppedBuses}
    `;
  });
}

// ===============================
// TOGGLE FEEDBACKS
// ===============================
function toggleFeedbacks() {
  const section = document.getElementById("feedbackSection");
  if (section.style.display === "none") {
    section.style.display = "block";
    loadFeedbacks();
  } else {
    section.style.display = "none";
  }
}

// ===============================
// Load Feedbacks from Firebase
// ===============================
function loadFeedbacks() {
  const feedbackList = document.getElementById("feedbackList");
  feedbackList.innerHTML = "";

  feedbacksRef.once("value")
    .then(snapshot => {
      if (!snapshot.exists()) {
        feedbackList.innerHTML = "<p>No feedbacks found</p>";
        return;
      }

      snapshot.forEach(child => {
        const data = child.val();

        const div = document.createElement("div");
        div.className = "feedback-item";
        div.innerHTML = `
          ⭐ Rating: ${data.rating || "N/A"}<br>
          🚌 Route: ${data.route || "N/A"}<br>
          💬 ${data.message || "No message"}<br>
          ⏰ ${data.time || ""}
        `;

        feedbackList.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      feedbackList.innerHTML = "<p>Error loading feedbacks</p>";
    });
}
