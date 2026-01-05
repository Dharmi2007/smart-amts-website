document.getElementById("busCount").innerHTML =
  "Total Running Buses: " + buses.length;

document.getElementById("crowdInfo").innerHTML =
  "Peak Crowd Route: " + buses.find(b => b.crowd === "High").route;

document.getElementById("feedbackCount").innerHTML =
  "Total Feedbacks: " + feedbacks.length;
