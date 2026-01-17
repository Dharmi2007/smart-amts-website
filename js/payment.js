// ---------- Firebase Setup ----------
const firebaseConfig = {
    apiKey: "AIzaSyCt8xps-QZ0phnP1cJgjA6nqhiNCGjbH8g",
    authDomain: "smart-amts-d0ec8.firebaseapp.com",
    databaseURL: "https://smart-amts-d0ec8-default-rtdb.firebaseio.com",
    projectId: "smart-amts-d0ec8",
    storageBucket: "smart-amts-d0ec8.firebasestorage.app",
    messagingSenderId: "121822205622",
    appId: "1:121822205622:web:193337ae3482b8602e3817",
    measurementId: "G-83F1GE9M95"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------- Load Trip Info ----------
let tripId = localStorage.getItem('tripId');
if(!tripId){
    const now = new Date();
    // Format: TRIP-YYYYMMDD-HHMM
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2,'0');
    const dd = String(now.getDate()).padStart(2,'0');
    const hh = String(now.getHours()).padStart(2,'0');
    const min = String(now.getMinutes()).padStart(2,'0');

    tripId = `TRIP-${yyyy}${mm}${dd}-${hh}${min}`;
    localStorage.setItem('tripId', tripId);
}

// Default passengers count = 1
const passengersCount = localStorage.getItem('passengers') || 1;

// ---------- Fill Summary Card ----------
const summaryCard = document.getElementById('summaryCard');
summaryCard.innerHTML = `
<div class="ticket-summary">
  <div><b>Trip ID:</b> ${tripId}</div>
  <div><b>Passengers:</b> ${passengersCount}</div>
  <div class="mrp-row"><b>MRP:</b> ₹20</div> <!-- Default MRP -->
</div>
`;

// ---------- Payment Method Dynamic Fields ----------
const paymentMethodSelect = document.getElementById('paymentMethod');
const paymentFieldsDiv = document.getElementById('paymentFields');

paymentMethodSelect.addEventListener('change', updatePaymentFields);

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

// ---------- Pay Button ----------
document.getElementById('payBtn').onclick = function() {
    const name = document.getElementById('passengerName').value;
    const phone = document.getElementById('passengerPhone').value;
    const method = paymentMethodSelect.value;

    if(!name || !phone){
        alert("Please fill full name and phone number");
        return;
    }

    let paymentInfo = {};
    if(method === 'upi'){
        const upi = document.getElementById('upiId').value;
        if(!upi){ alert("Enter UPI ID"); return; }
        paymentInfo.upi = upi;
    } else if(method === 'card'){
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('cardExpiry').value;
        const cvv = document.getElementById('cardCvv').value;
        if(!cardNumber || !expiry || !cvv){ alert("Fill all card details"); return; }
        paymentInfo.cardNumber = cardNumber;
        paymentInfo.expiry = expiry;
        paymentInfo.cvv = cvv;
    }

    // ---------- Payment Data ----------
    const paymentData = {
        tripId,
        passengersCount,
        passengerName: name,
        phone,
        method,
        paymentInfo,
        amount: 20, // Default MRP
        status: "Paid",
        timestamp: Date.now()
    };

    db.ref('payments').push(paymentData)
    .then(() => {
        alert("Payment Successful! Ticket Confirmed 🎉");
        window.location.href = "ticket.html"; // redirect to ticket
    });
};

