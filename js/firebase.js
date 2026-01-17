// js/firebase.js

// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCt8xps-QZ0phnP1cJgjA6nqhiNCGjbH8g",
  authDomain: "smart-amts-d0ec8.firebaseapp.com",
  databaseURL: "https://smart-amts-d0ec8-default-rtdb.firebaseio.com",
  projectId: "smart-amts-d0ec8",
  storageBucket: "smart-amts-d0ec8.appspot.com",
  messagingSenderId: "121822205622",
  appId: "1:121822205622:web:193337ae3482b8602e3817",
  measurementId: "G-83F1GE9M95"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ---------------- Leaflet Map ----------------
const map = L.map('map').setView([23.0225, 72.5714], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// ---------------- Simulated Bus Markers ----------------
let busMarkers = {};

database.ref("buses").on("value", snapshot => {
    snapshot.forEach(child => {
        const bus = child.val();
        if(busMarkers[bus.id]){
            busMarkers[bus.id].setLatLng([bus.latitude, bus.longitude]);
        } else {
            busMarkers[bus.id] = L.marker([bus.latitude, bus.longitude]).addTo(map)
                .bindPopup(`Bus ${bus.number}`);
        }
    });
});

// ---------------- Simulate Bus Movement ----------------
function simulateBusMovement(busId){
    database.ref("buses/" + busId).once("value").then(snapshot => {
        const bus = snapshot.val();
        const newLat = bus.latitude + (Math.random()-0.5)*0.001;
        const newLng = bus.longitude + (Math.random()-0.5)*0.001;
        database.ref("buses/" + busId).update({ latitude: newLat, longitude: newLng });
    });
}

// Simulate every 5 seconds
setInterval(()=>{
    simulateBusMovement("bus1");
    simulateBusMovement("bus2");
}, 5000);
