// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCt8xps-QZ0phnP1cJgjA6nqhiNCGjbH8g",
  authDomain: "smart-amts-d0ec8.firebaseapp.com",
  databaseURL: "https://smart-amts-d0ec8-default-rtdb.firebaseio.com",
  projectId: "smart-amts-d0ec8",
  storageBucket: "smart-amts-d0ec8.appspot.com",
  messagingSenderId: "121822205622",
  appId: "1:121822205622:web:193337ae3482e3817",
  measurementId: "G-83F1GE9M95"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ---------------- Load Trip Info ----------------
let tripId = localStorage.getItem('tripId');
if(!tripId){
    const now = new Date();
    tripId = `TRIP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    localStorage.setItem('tripId', tripId);
}

// Default passengers count = 1
const passengersCount = Number(localStorage.getItem('passengers')) || 1;

// ---------------- Fill Summary Card ----------------
const summaryCard = document.getElementById('summaryCard');
summaryCard.innerHTML = `
<div class="ticket-summary">
  <div><b>Trip ID:</b> ${tripId}</div>
  <div><b>Passengers:</b> ${passengersCount}</div>
  <div class="mrp-row"><b>MRP:</b> ₹20</div>
</div>
`;

// ---------------- Payment Method Dynamic Fields ----------------
const paymentMethodSelect = document.getElementById('paymentMethod');
const paymentFieldsDiv = document.getElementById('paymentFields');

function updatePaymentFields() {
    const method = paymentMethodSelect.value;
    let html = '';
    if(method === 'upi') {
        html = `<label>UPI ID</label>
                <input type="text" id="upiId" placeholder="Enter your UPI ID">`;
    } else if(method === 'card') {
        html = `<label>Card Number</label>
                <input type="text" id="cardNumber" placeholder="Enter Card Number">
                <label>Expiry (MM/YY)</label>
                <input type="text" id="cardExpiry" placeholder="MM/YY">
                <label>CVV</label>
                <input type="password" id="cardCvv" placeholder="CVV">`;
    }
    paymentFieldsDiv.innerHTML = html;
}

// Initialize fields
updatePaymentFields();
paymentMethodSelect.addEventListener('change', updatePaymentFields);

// ---------------- Pay Button ----------------
document.getElementById('payBtn').onclick = function() {
    const name = document.getElementById('passengerName').value.trim();
    const phone = document.getElementById('passengerPhone').value.trim();
    const method = paymentMethodSelect.value;

    if(!name || !phone){
        alert("Please fill full name and phone number");
        return;
    }

    let paymentInfo = {};
    if(method === 'upi'){
        const upi = document.getElementById('upiId').value.trim();
        if(!upi){ alert("Enter UPI ID"); return; }
        paymentInfo.upi = upi;
    } else if(method === 'card'){
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiry = document.getElementById('cardExpiry').value.trim();
        const cvv = document.getElementById('cardCvv').value.trim();
        if(!cardNumber || !expiry || !cvv){ alert("Fill all card details"); return; }
        paymentInfo = { cardNumber, expiry, cvv };
    }

    // ---------------- Save trip info to localStorage ----------------
    const now = new Date();
    localStorage.setItem('busNo', localStorage.getItem('busNo') || "AMTS 102");
    localStorage.setItem('from', localStorage.getItem('from') || "");
    localStorage.setItem('to', localStorage.getItem('to') || "");
    localStorage.setItem('passengerName', name);
    localStorage.setItem('passengers', localStorage.getItem('passengers') || 1);
    localStorage.setItem('date', now.toLocaleDateString('en-GB'));
    localStorage.setItem('time', now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    localStorage.setItem('fare', 20);

    // ---------------- Save to Firebase ----------------
    const tripRef = database.ref('tripRegistrations').push();
    tripRef.set({
        tripId: tripId,
        busNumber: localStorage.getItem('busNo'),
        from: localStorage.getItem('from'),
        to: localStorage.getItem('to'),
        passengers: Number(localStorage.getItem('passengers')) || 1,
        passengerName: name,
        phone: phone,
        paymentMethod: method,
        paymentInfo: paymentInfo,
        amount: 20,
        paymentStatus: "Paid",
        source: "ticket",
        timestamp: Date.now()
    })
    .then(() => {
        // ✅ Payment saved successfully
        alert("Payment Successful! Ticket Confirmed 🎉");
        window.location.href = "ticket.html"; // Redirect to ticket page
    })
    .catch(err => {
        console.error("Firebase Push Error:", err);
        alert("Payment failed! Check console for details.");
        // Still redirect to ticket page even if Firebase fails
        window.location.href = "ticket.html";
    });
};
