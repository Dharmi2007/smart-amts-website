// ---------- Load Ticket from localStorage ----------
document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from localStorage
    const data = {
        busNumber: localStorage.getItem('busNo') || "AMTS 102",
        from: localStorage.getItem('from') || "Maninagar",
        to: localStorage.getItem('to') || "CG Road",
        date: localStorage.getItem('date') || "-",
        time: localStorage.getItem('time') || "-",
        fare: localStorage.getItem('fare') || 20,
        passenger: localStorage.getItem('passengerName') || "Passenger",
        seats: localStorage.getItem('passengers') || 1,
        fare: 20,  // Default MRP
        status: "Confirmed"
    };

    // Load ticket to HTML
    loadTicket(data);
});

// Function to fill ticket HTML
function loadTicket(data){
    document.getElementById("busNo").innerText = data.busNumber || "-";
    document.getElementById("route").innerText = `${data.from} → ${data.to}` || "-";
    document.getElementById("journeyDate").innerText = data.date || "-";
    document.getElementById("journeyTime").innerText = data.time || "-";
    document.getElementById("passengerName").innerText = data.passenger || "-";
    document.getElementById("seats").innerText = data.seats || "-";
    document.getElementById("fare").innerText = `₹${data.fare}`; // show ₹ sign
    document.getElementById("status").innerText = data.status || "-";
}

