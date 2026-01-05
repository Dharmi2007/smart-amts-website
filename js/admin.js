// ===============================
// Admin Dashboard – MVP Simulation
// ===============================

// 1️⃣ Total Running Buses
const runningBuses = buses.filter(bus => bus.status === "Running").length;
document.getElementById("busCount").innerHTML =
  "🚍 Total Running Buses: " + runningBuses;

// 2️⃣ Peak Crowd Route (safe & simple)
const highCrowdBus = buses.find(bus => bus.crowd === "High");
document.getElementById("crowdInfo").innerHTML =
  "🔥 Peak Crowd Route: " + (highCrowdBus ? highCrowdBus.route : "No Data");

// 3️⃣ Total Feedbacks (Simulated for MVP)
const simulatedFeedbacks = buses.filter(
  bus => bus.crowd === "High" || bus.crowd === "Medium"
).length * 2;

document.getElementById("feedbackCount").innerHTML =
  "🗣️ Total Feedbacks: " + simulatedFeedbacks;

// Note: Real-time feedback and analytics
// will be implemented in development phase
