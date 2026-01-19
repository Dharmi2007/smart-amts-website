/* =========================
   SERVICE ALERT FEATURE
========================= */

// Toggle alert panel
function toggleAlerts() {
  const panel = document.getElementById("alertPanel");
  if (!panel) return;

  panel.style.display =
    panel.style.display === "block" ? "none" : "block";
}

// Firebase reference (db already initialized in passenger.html)
const alertRef = db.ref("alerts");

// Listen for real-time alerts
alertRef.on("value", (snapshot) => {
  const alerts = snapshot.val();

  const alertList = document.getElementById("alertsList");
  const alertCount = document.getElementById("alertCount");

  if (!alertList || !alertCount) return;

  alertList.innerHTML = "";
  let count = 0;

  if (!alerts) {
    alertCount.innerText = "0";
    return;
  }

  // Show latest alerts first
  Object.values(alerts).reverse().forEach(alert => {
    if (!alert.active) return;

    count++;

    const card = document.createElement("div");
    card.className = `alert-card ${alert.type}`;

    card.innerHTML = `
      <strong>${alert.title}</strong>
      <p>${alert.message}</p>
      <small>${new Date(alert.createdAt).toLocaleString()}</small>
    `;

    alertList.appendChild(card);

    // Emergency popup
    if (alert.type === "emergency") {
      window.alert("🚨 EMERGENCY ALERT!\n\n" + alert.message);
    }
  });

  alertCount.innerText = count;
});
