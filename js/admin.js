// ===============================
// Admin Dashboard – Firebase Analytics (FINAL WORKING)
// ===============================

// Firebase references
const busesRef = database.ref("buses");
const feedbacksRef = database.ref("feedbacks");

// Store buses globally
let busesArray = [];

// ===============================
// REAL-TIME BUS ANALYTICS
// ===============================
busesRef.on("value", snapshot => {
  const busesData = snapshot.val();
  if (!busesData) return;

  busesArray = Object.keys(busesData).map(key => ({
    id: key,
    ...busesData[key]
  }));

  // -----------------------
  // 1️⃣ Total Running Buses (Route-wise)
  // -----------------------
  const runningBuses = busesArray.filter(bus => bus.status === "Running");
  const totalRunning = runningBuses.length;

  const routeCount = {};
  runningBuses.forEach(bus => {
    const route = bus.route || "N/A";
    routeCount[route] = (routeCount[route] || 0) + 1;
  });

  let busCountHTML = `🚍 <b>Total Running Buses:</b> ${totalRunning}<br>`;
  Object.keys(routeCount).forEach(route => {
    busCountHTML += `Route <b>${route}</b>: ${routeCount[route]} buses<br>`;
  });

  document.getElementById("busCount").innerHTML = busCountHTML;

  // -----------------------
  // 2️⃣ Bus Cards + Crowd Analytics
  // -----------------------
  const busDetailsDiv = document.getElementById("busDetails");
  busDetailsDiv.innerHTML = "";

  let peakCrowdBus = null;
  let maxCrowdPercent = -1;

  busesArray.forEach(bus => {
    const occupancy = Number(bus.occupancy) || 0;
    const capacity = Number(bus.capacity) || 1;
    const crowdPercent = Math.round((occupancy / capacity) * 100);

    let crowdLevel = "Low";
    if (crowdPercent >= 70) crowdLevel = "High";
    else if (crowdPercent >= 40) crowdLevel = "Medium";

    if (crowdPercent > maxCrowdPercent) {
      maxCrowdPercent = crowdPercent;
      peakCrowdBus = bus;
    }

    const div = document.createElement("div");
    div.className = "bus-card";
    div.style.border = "2px solid #ddd";
    div.style.padding = "10px";
    div.style.margin = "8px 0";
    div.style.borderRadius = "6px";

    div.innerHTML = `
      <strong>Bus:</strong> ${bus.name || bus.id}<br>
      <strong>Route:</strong> ${bus.route || "N/A"}<br>
      <strong>Occupancy:</strong> ${occupancy}/${capacity}<br>
      <strong>Crowd Level:</strong> ${crowdLevel} (${crowdPercent}%)
    `;

    busDetailsDiv.appendChild(div);
  });

  // -----------------------
  // 3️⃣ Peak Crowd Route
  // -----------------------
  const crowdInfoEl = document.getElementById("crowdInfo");
  if (crowdInfoEl) {
    crowdInfoEl.innerHTML =
      "🔥 <b>Peak Crowd Route:</b> " +
      (peakCrowdBus ? (peakCrowdBus.route || peakCrowdBus.name) : "No data");
  }
});

// ===============================
// FEEDBACK SYSTEM (FIREBASE)
// ===============================

// 🔢 Real-time feedback count
feedbacksRef.on("value", snapshot => {
  const data = snapshot.val();
  const count = data ? Object.keys(data).length : 0;

  const feedbackCountEl = document.getElementById("feedbackCount");
  if (feedbackCountEl) {
    feedbackCountEl.innerText = count;
  }
});

// Toggle feedback panel
function toggleFeedbacks() {
  const section = document.getElementById("feedbackSection");

  if (section.style.display === "none") {
    section.style.display = "block";
    loadFeedbacks();
  } else {
    section.style.display = "none";
  }
}

// Load feedback list
function loadFeedbacks() {
  const feedbackList = document.getElementById("feedbackList");
  feedbackList.innerHTML = "";

  feedbacksRef.once("value").then(snapshot => {
    if (!snapshot.exists()) {
      feedbackList.innerHTML = "<p>No feedbacks yet</p>";
      return;
      div.innerHTML = `
  <strong>Bus:</strong> ${fb.bus}<br>
  <strong>Station:</strong> ${fb.station}<br>
  <strong>Issue:</strong> ${fb.issue}<br>
  <strong>Message:</strong> ${fb.message}<br>
  <small>⏰ ${time}</small>
`;      
    }

    snapshot.forEach(child => {
      const fb = child.val();

      const time = fb.time
        ? new Date(fb.time).toLocaleString()
        : "Invalid Date";

      const div = document.createElement("div");
      div.className = "feedback-item";
      div.style.borderBottom = "1px solid #ccc";
      div.style.padding = "8px 0";

      div.innerHTML = `
        <strong>Bus:</strong> ${fb.bus}<br>
        <strong>Route:</strong> ${fb.route}<br>
        <strong>Issue:</strong> ${fb.issue}<br>
        <strong>Message:</strong> ${fb.message}<br>
        <small>⏰ ${time}</small>
      `;

      feedbackList.appendChild(div);
    });
  });
}
