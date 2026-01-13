// ===============================
// ADMIN DASHBOARD – AI-ENHANCED REAL DATA VERSION
// ===============================

// ---------- FIREBASE ----------
const feedbacksRef = database.ref("feedbacks");

// ---------- GLOBAL ----------
let feedbackCache = {};

// =====================================================
// 🔥 LIVE FEEDBACK LISTENER
// =====================================================
feedbacksRef.on("value", snap => {
  feedbackCache = snap.val() || {};

  // Total feedback count
  const countEl = document.getElementById("feedbackCount");
  if (countEl) countEl.innerText = Object.keys(feedbackCache).length;

  // Refresh panels if open
  if (document.getElementById("feedbackSection")?.style.display === "block") {
    renderFeedbacks();
  }

  if (document.getElementById("crowdSection")?.style.display === "block") {
    renderCrowdAnalytics();
  }

  updateFeedbackAnalytics();
  generateSmartInsights(); // 🧠 AI INSIGHTS
});

// =====================================================
// TOGGLES
// =====================================================
function toggleFeedbacks() {
  const sec = document.getElementById("feedbackSection");
  sec.style.display = sec.style.display === "none" ? "block" : "none";
  if (sec.style.display === "block") renderFeedbacks();
}

function toggleCrowdAnalytics() {
  const sec = document.getElementById("crowdSection");
  sec.style.display = sec.style.display === "none" ? "block" : "none";
  if (sec.style.display === "block") renderCrowdAnalytics();
}

// =====================================================
// NORMALIZE FEEDBACK
// =====================================================
function normalizeFeedback(fb) {
  const bus = fb.bus || fb.busId || fb.busName || "Unknown Bus";
  const issue = fb.issue || fb.problem || fb.type || "General";
  const message = fb.message || fb.msg || fb.feedback || "";

  const station =
    fb.station && fb.station.trim()
      ? fb.station
      : fb.route && fb.route !== "NA"
      ? fb.route
      : "Not Provided";

  let timeObj = null;
  if (fb.time) {
    const d = new Date(fb.time);
    if (!isNaN(d)) timeObj = d;
  }

  const status = fb.status || "open";

  return { bus, issue, message, station, timeObj, status };
}

// =====================================================
// ================= FEEDBACK PANEL =====================
// =====================================================
function renderFeedbacks() {
  const list = document.getElementById("feedbackList");
  list.innerHTML = "";

  const busFilter = document.getElementById("filterBus")?.value || "";
  const issueFilter = document.getElementById("filterIssue")?.value || "";
  const dateFilter = document.getElementById("filterDate")?.value || "";

  const keys = Object.keys(feedbackCache);
  if (!keys.length) {
    list.innerHTML = "<p>No feedback yet</p>";
    return;
  }

  keys.forEach(id => {
    const fb = normalizeFeedback(feedbackCache[id]);

    if (busFilter && fb.bus !== busFilter) return;
    if (issueFilter && fb.issue !== issueFilter) return;
    if (dateFilter && fb.timeObj &&
        fb.timeObj.toISOString().slice(0, 10) !== dateFilter) return;

    const div = document.createElement("div");
    div.className = "feedback-item";
    div.style.borderLeft =
      fb.status === "resolved"
        ? "6px solid #2ecc71"
        : "6px solid #e74c3c";

    div.innerHTML = `
      <strong>Bus:</strong> ${fb.bus}<br>
      <strong>Station:</strong> ${fb.station}<br>
      <strong>Issue:</strong> ${fb.issue}<br>
      <strong>Message:</strong> ${fb.message || "—"}<br>
      <small>⏰ ${fb.timeObj ? fb.timeObj.toLocaleString() : "Invalid Date"}</small><br>
      <strong>Status:</strong> ${fb.status}<br>
      ${
        fb.status === "open"
          ? `<button onclick="markResolved('${id}')">✅ Resolve</button>`
          : ""
      }
    `;

    list.appendChild(div);
  });
}

// =====================================================
// FEEDBACK ANALYTICS
// =====================================================
function updateFeedbackAnalytics() {
  const busCount = {};

  Object.values(feedbackCache).forEach(raw => {
    const fb = normalizeFeedback(raw);
    busCount[fb.bus] = (busCount[fb.bus] || 0) + 1;
  });

  const busStatsEl = document.getElementById("busStats");
  if (busStatsEl) {
    let html = "<h3>🚌 Feedback by Bus</h3>";
    Object.keys(busCount).forEach(b => {
      html += `<p>${b}: ${busCount[b]}</p>`;
    });
    busStatsEl.innerHTML = html;
  }

  let maxBus = "", max = 0;
  Object.keys(busCount).forEach(b => {
    if (busCount[b] > max) {
      max = busCount[b];
      maxBus = b;
    }
  });

  const mostEl = document.getElementById("mostComplained");
  if (mostEl) {
    mostEl.innerHTML = maxBus
      ? `🔥 <b>Most Complained Bus:</b> ${maxBus} (${max})`
      : "🔥 <b>Most Complained Bus:</b> No data";
  }

  populateFilters(busCount);
}

// =====================================================
// FILTER DROPDOWNS
// =====================================================
function populateFilters(busCount) {
  const busSel = document.getElementById("filterBus");
  if (busSel) {
    busSel.innerHTML = `<option value="">All Buses</option>`;
    Object.keys(busCount).forEach(b => {
      busSel.innerHTML += `<option value="${b}">${b}</option>`;
    });
  }

  const issueSel = document.getElementById("filterIssue");
  if (issueSel) {
    const issues = new Set();
    Object.values(feedbackCache).forEach(fb => {
      issues.add(normalizeFeedback(fb).issue);
    });

    issueSel.innerHTML = `<option value="">All Issues</option>`;
    issues.forEach(i => {
      issueSel.innerHTML += `<option value="${i}">${i}</option>`;
    });
  }
}

// =====================================================
// RESOLVE FEEDBACK
// =====================================================
function markResolved(id) {
  feedbacksRef.child(id).update({ status: "resolved" });
}

// =====================================================
// EXPORT CSV
// =====================================================
function exportFeedbackCSV() {
  let csv = "Bus,Station,Issue,Message,Status,Time\n";

  Object.values(feedbackCache).forEach(raw => {
    const fb = normalizeFeedback(raw);
    csv += `"${fb.bus}","${fb.station}","${fb.issue}","${fb.message}","${fb.status}","${
      fb.timeObj ? fb.timeObj.toLocaleString() : ""
    }"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "feedback.csv";
  a.click();
}

// =====================================================
// ================= CROWD ANALYTICS ====================
// =====================================================
function renderCrowdAnalytics() {
  const listEl = document.getElementById("crowdBusList");
  const peakBusEl = document.getElementById("peakCrowdBus");
  const peakTimeEl = document.getElementById("peakCrowdTime");

  if (!listEl || !peakBusEl || !peakTimeEl) return;

  listEl.innerHTML = "";

  const crowdKeywords = ["crowd", "crowded", "rush", "packed", "full", "standing"];
  const busCrowdCount = {};
  const hourCrowdCount = {};

  Object.values(feedbackCache).forEach(raw => {
    const fb = normalizeFeedback(raw);
    const text = (fb.issue + " " + fb.message).toLowerCase();

    if (!crowdKeywords.some(w => text.includes(w))) return;

    busCrowdCount[fb.bus] = (busCrowdCount[fb.bus] || 0) + 1;

    if (fb.timeObj) {
      const hour = fb.timeObj.getHours();
      hourCrowdCount[hour] = (hourCrowdCount[hour] || 0) + 1;
    }
  });

  let maxBus = "", maxBusCount = 0;
  Object.keys(busCrowdCount).forEach(bus => {
    const c = busCrowdCount[bus];
    if (c > maxBusCount) {
      maxBusCount = c;
      maxBus = bus;
    }

    let level = "Low 🟢";
    if (c >= 5) level = "High 🔴";
    else if (c >= 3) level = "Medium 🟠";

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "8px";
    div.style.margin = "6px 0";
    div.style.borderRadius = "6px";

    div.innerHTML = `
      <strong>${bus}</strong><br>
      Crowd Complaints: ${c}<br>
      Level: ${level}
    `;
    listEl.appendChild(div);
  });

  peakBusEl.innerHTML = maxBus
    ? `🔥 <b>Most Crowded Bus:</b> ${maxBus} (${maxBusCount} complaints)`
    : "🔥 <b>Most Crowded Bus:</b> No data";

  let peakHour = null, maxHourCount = 0;
  Object.keys(hourCrowdCount).forEach(h => {
    if (hourCrowdCount[h] > maxHourCount) {
      maxHourCount = hourCrowdCount[h];
      peakHour = h;
    }
  });

  peakTimeEl.innerHTML =
    peakHour !== null
      ? `⏰ <b>Peak Crowd Time:</b> ${formatHour(peakHour)} (${maxHourCount} reports)`
      : "⏰ <b>Peak Crowd Time:</b> No data";
}

// =====================================================
// 🧠 SMART AI INSIGHTS
// =====================================================
function generateSmartInsights() {
  const insights = [];
  const delayMap = {};
  const crowdMap = {};
  const hourMap = {};
  let unknownBus = 0;

  Object.values(feedbackCache).forEach(raw => {
    const fb = normalizeFeedback(raw);

    if (fb.bus === "Unknown Bus") unknownBus++;

    if (fb.issue.toLowerCase().includes("late")) {
      delayMap[fb.bus] = (delayMap[fb.bus] || 0) + 1;
    }

    const text = (fb.issue + " " + fb.message).toLowerCase();
    if (["crowd", "crowded", "packed", "rush", "standing"].some(w => text.includes(w))) {
      crowdMap[fb.bus] = (crowdMap[fb.bus] || 0) + 1;
      if (fb.timeObj) {
        const h = fb.timeObj.getHours();
        hourMap[h] = (hourMap[h] || 0) + 1;
      }
    }
  });

  Object.keys(delayMap).forEach(bus => {
    if (delayMap[bus] >= 2) {
      insights.push(`🚍 ${bus} shows frequent delays. Review scheduling during peak hours.`);
    }
  });

  Object.keys(crowdMap).forEach(bus => {
    if (crowdMap[bus] >= 3) {
      insights.push(`🔥 ${bus} experiences high crowd density. Deploy extra bus during peak time.`);
    }
  });

  let peakHour = null, max = 0;
  Object.keys(hourMap).forEach(h => {
    if (hourMap[h] > max) {
      max = hourMap[h];
      peakHour = h;
    }
  });

  if (peakHour !== null) {
    insights.push(`⏰ Crowd peaks around ${formatHour(peakHour)}.`);
  }

  if (unknownBus >= 2) {
    insights.push(`⚠️ ${unknownBus} feedback entries missing bus ID. Improve data validation.`);
  }

  if (!insights.length) {
    insights.push("✅ Operations are running smoothly with no critical alerts.");
  }

  renderSmartInsights(insights);
}

function renderSmartInsights(insights) {
  const el = document.getElementById("aiInsights");
  if (!el) return;
  el.innerHTML = "";
  insights.forEach(i => {
    const li = document.createElement("li");
    li.textContent = i;
    el.appendChild(li);
  });
}

// =====================================================
// HELPER
// =====================================================
function formatHour(h) {
  const hour = Number(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

function updateBusLocation() {

    const busId = document.getElementById("busSelect").value;
    const lat = parseFloat(document.getElementById("latInput").value);
    const lng = parseFloat(document.getElementById("lngInput").value);

    firebase.database().ref("buses/" + busId).update({
        latitude: lat,
        longitude: lng,
        lastUpdated: Date.now()
    }).then(() => {
        alert("Selected bus location updated successfully!");
    });
}


firebase.database().ref("buses").on("value", function(snapshot){
    const select = document.getElementById("busSelect");
    select.innerHTML = "";

    snapshot.forEach(child => {
        const bus = child.val();
        const option = document.createElement("option");

        option.value = child.key;   // 🔥 REAL BUS ID
        option.textContent = bus.name;  // AMTS 101, AMTS 102 etc.

        select.appendChild(option);
    });
});

// ================= ALERTS REAL-TIME =================
// ================= ALERTS REAL-TIME =================
const alertsRef = database.ref("alerts");

// Listen for new alerts
alertsRef.on("child_added", function(snapshot){
    const a = snapshot.val();
    displayAlert(snapshot.key, a);
});

function displayAlert(id, alert){
    const list = document.getElementById("alertList"); // Make sure this exists in HTML
    if(!list) return;

    const div = document.createElement("div");
    div.className = "alert-item";
    div.style.borderLeft = "6px solid #e74c3c";
    div.style.padding = "8px";
    div.style.margin = "6px 0";
    div.style.borderRadius = "6px";

    div.innerHTML = `
        <strong>Passenger ID:</strong> ${alert.passengerID}<br>
        <strong>Bus ID:</strong> ${alert.busID || "N/A"}<br>
        <strong>Type:</strong> ${alert.type}<br>
        <strong>Location:</strong> Lat: ${alert.location.lat}, Lng: ${alert.location.lng}<br>
        <small>⏰ ${new Date(alert.timestamp).toLocaleString()}</small><br>
        ${
          alert.status === "received"
            ? `<button onclick="markAlertHandled('${id}')">✅ Mark as Handled</button>`
            : ""
        }
    `;

    list.prepend(div); // latest alert on top
}

// Toggle alerts section
function toggleAlerts() {
    const sec = document.getElementById("alertSection");
    sec.style.display = sec.style.display === "none" ? "block" : "none";
}

// Mark alert as handled
function markAlertHandled(id){
    // 1. Update in Firebase
    alertsRef.child(id).update({ status: "handled" });

    // 2. Update the UI
    const btn = document.querySelector(`button[onclick="markAlertHandled('${id}')"]`);
    if(btn){
        btn.parentElement.innerHTML += "<span style='color:green; font-weight:bold;'> ✅ Completed</span>";
        btn.remove(); // remove the button
    }
}

