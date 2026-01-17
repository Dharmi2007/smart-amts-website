// ================= GLOBALS =================
var map;
var markers = [];
var userMarker = null;
var userLocation = null;
var buses = [];
var database = window.db;
window.db = firebase.database();
var busMarkers = {};
var busSelect = document.getElementById("busSelect");

// ================= SOS BUTTON =================
const sosBtn = document.getElementById("sosBtn");
const alertTypeSelect = document.getElementById("alertType");

sosBtn.addEventListener("click", function(){

    if(!userLocation){
        alert("Turn on location first!");
        return;
    }

    const type = alertTypeSelect.value;
    const selectedBus = busSelect.value;

    if(!selectedBus){
        alert("Please select a bus for SOS alert!");
        return;
    }

    // Assign priority
    let priority = "low";
    if(type === "accident" || type === "medical") priority = "high";
    else if(type === "harassment") priority = "medium";

    // Prepare alert object
    const alertData = {
        passengerID: "passenger_001", // Replace with dynamic ID if login exists
        busID: selectedBus,           // AMTS number selected
        type: type,
        location: { 
            lat: userLocation.lat, 
            lng: userLocation.lng 
        },
        status: "received",
        timestamp: Date.now()
    };

    // Push to Firebase under "alerts"
    database.ref("alerts").push(alertData)
        .then(() => alert("🚨 SOS alert sent successfully!"))
        .catch(err => {
            console.error(err);
            alert("Failed to send alert!");
        });
});

// ================= DISTANCE CALCULATION =================
function getDistanceKm(lat1, lon1, lat2, lon2) {
    let R = 6371;
    let dLat = (lat2 - lat1) * Math.PI/180;
    let dLon = (lon2 - lon1) * Math.PI/180;

    let a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ================= LOAD BUS DATA =================
var busRef = database.ref("buses");

busRef.on("value", function(snapshot) {
    buses = [];
    snapshot.forEach(function(childSnap){
        var b = childSnap.val();
        buses.push({
            number: b.name,
            from: b.from,
            to: b.to,
            crowdlevel: b.crowdLevel,
            capacity: b.capacity,
            lat: b.latitude,
            lng: b.longitude,
            status: b.status
        });
    });
    populateBusDropdown();
});

// Child changed for live marker update
busRef.on("child_changed", function(snapshot){
    var b = snapshot.val();
    var id = snapshot.key;

    if(busMarkers[id]){
        busMarkers[id].setLatLng([b.latitude, b.longitude]);
        console.log("Marker updated:", id);
        return;
    }
});

// ================= POPULATE BUS DROPDOWN =================
function populateBusDropdown(){
    busSelect.innerHTML = '<option value="">--Choose Bus--</option>';
    buses.forEach(bus => {
        if(bus.status?.toLowerCase() === "running"){
            const option = document.createElement("option");
            option.value = bus.number;
            option.text = `${bus.number} (${bus.from} → ${bus.to})`;
            busSelect.appendChild(option);
        }
    });
}

// ================= AUTOCOMPLETE =================
function showSuggestions(input, listId){
    const value = input.value.toLowerCase();
    const list = document.getElementById(listId);
    list.innerHTML = '';

    const locations = ['Nehrunagar','CG Road','Maninagar'];

    locations.forEach(loc => {
        if(loc.toLowerCase().includes(value)){
            const div = document.createElement('div');
            div.innerText = loc;
            div.onclick = () => {
                input.value = loc;
                list.innerHTML = '';
            };
            list.appendChild(div);
        }
    });
}

// ================= USER LOCATION =================
window.getUserLocation = function(){
    if(!navigator.geolocation){
        alert("Location not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(function(pos){
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };

        document.querySelector(".layout").classList.add("two-column");
        document.getElementById("mapSection").classList.remove("hidden");

        if(!map){
            map = L.map("map").setView([userLocation.lat, userLocation.lng], 14);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        }

        if(userMarker) map.removeLayer(userMarker);

        userMarker = L.marker([userLocation.lat, userLocation.lng])
            .addTo(map)
            .bindPopup("📍 Your Location")
            .openPopup();

    }, function(){
        alert("Location permission denied");
    });
};

// ================= FIND BUS =================
window.findBus = function(){
    var fromVal = document.getElementById("from").value.trim().toLowerCase();
    var toVal = document.getElementById("to").value.trim().toLowerCase();

    var matched = buses.filter(function(bus){
        return bus.status?.toLowerCase() === "running" &&
               bus.from?.toLowerCase() === fromVal &&
               bus.to?.toLowerCase() === toVal;
    });

    var html = "";
    if(matched.length === 0){
        html = "<p style='color:red'>No buses found</p>";
    } else {
        matched.forEach(function(bus){
            html += "<div>" +
                "<b>Bus:</b> " + bus.number + "<br>" +
                "<b>From:</b> " + bus.from + "<br>" +
                "<b>To:</b> " + bus.to + "<br>" +
                "<b>Crowd:</b> " + bus.crowdlevel + "<br>" +
                "<b>Capacity:</b> " + bus.capacity +
                "</div><hr>";
        });
    }

    document.getElementById("busList").innerHTML = html;
    document.getElementById("busCard").classList.remove("hidden");

    document.getElementById("mapSection").classList.remove("hidden");
    document.querySelector(".layout").classList.add("two-column");

    if(fromVal === "maninagar" && toVal === "cg road"){
        showMap(matched, true);
    } else {
        showMap(matched, false);
    }
};

// ================= SHOW MAP =================
window.showMap = function(list, demoMode){

    document.getElementById("mapSection").classList.remove("hidden");

    if(!map){
        map = L.map("map").setView([23.0225, 72.5714], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    }

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    if(demoMode){
        list.forEach(function(bus){
            var marker = L.marker([22.991, 72.603]).addTo(map)
                .bindPopup("🚍 Demo Bus " + bus.number);
            markers.push(marker);

            const path = [
                [22.991, 72.603],
                [23.005, 72.598],
                [23.015, 72.592],
                [23.025, 72.586],
                [23.030, 72.582]
            ];
            animateMarker(marker, path);
        });
        return;
    }

    list.forEach(function(bus){
        if(bus.lat && bus.lng){
            var marker = L.marker([bus.lat, bus.lng]).addTo(map)
                .bindPopup("🚍 Bus " + bus.number);
            markers.push(marker);
            busMarkers[bus.number] = marker;
        }
    });
};

// ================= REAL-TIME DISTANCE ONLY =================
function updateLiveDistance(){

    if (!userLocation || buses.length === 0) return;

    let fromVal = document.getElementById("from").value.trim().toLowerCase();
    let toVal   = document.getElementById("to").value.trim().toLowerCase();

    let bus = buses.find(b =>
        b.from?.toLowerCase() === fromVal &&
        b.to?.toLowerCase() === toVal &&
        b.status?.toLowerCase() === "running"
    );

    if(!bus || !bus.lat || !bus.lng){
        document.getElementById("distanceInfo").innerHTML =
            "<p>No live location available for this bus</p>";
        return;
    }

    let dist = getDistanceKm(
        userLocation.lat, userLocation.lng,
        bus.lat, bus.lng
    );

    document.getElementById("distanceInfo").innerHTML =
        `<b>📍 Distance to bus:</b> ${dist.toFixed(2)} km`;
}

// ================= MOVING BUS FUNCTION =================
function animateMarker(marker, path){
    let i = 0;
    setInterval(function(){
        if(i >= path.length) i = 0;
        marker.setLatLng(path[i]);
        i++;
    }, 1500);
}

// ================= TRIP REGISTRATION (DEMAND INSIGHT) =================
window.submitTravelIntent = function () {

    const busNumber = document.getElementById("intentBus").value.trim();
    const from = document.getElementById("intentFrom").value.trim();
    const to = document.getElementById("intentTo").value.trim();
    const passengers = document.getElementById("intentPassengers").value;

    if (!busNumber || !from || !to || !passengers) {
        alert("Please fill all trip details");
        return;
    }

    const tripData = {
        busNumber: busNumber,
        from: from,
        to: to,
        passengers: Number(passengers),
        timestamp: Date.now()
    };

    database.ref("tripRegistrations").push(tripData)
        .then(() => {
            alert("✅ Trip registered successfully (for demand analysis)");

            // Optional: clear form
            document.getElementById("intentBus").value = "";
            document.getElementById("intentFrom").value = "";
            document.getElementById("intentTo").value = "";
            document.getElementById("intentPassengers").value = 1;
        })
        .catch(error => {
            console.error(error);
            alert("❌ Failed to register trip");
        });
};

// ================= FEEDBACK =================
window.submitFeedback = function(){
    var bus = document.getElementById("feedbackBus").value;
    var station = document.getElementById("feedbackStation").value;
    var issue = document.getElementById("feedbackType").value;
    var message = document.getElementById("feedbackMessage").value;

    if(!bus || !station){
        alert("Enter bus and station");
        return;
    }

    var refFB = database.ref("feedbacks");
    refFB.push({
        bus,
        station,
        issue,
        message: message || "No message",
        time: Date.now()
    });

    alert("Feedback submitted 👍");
};

// ================= SHOW MAP SECTION (REPLACE TOGGLE) =================
window.showMapSection = function(){
    document.querySelector(".layout").classList.add("two-column");
    document.getElementById("mapSection").classList.remove("hidden"); // always visible
};


// ================= AUTO REFRESH EVERY 5 SEC =================
setInterval(() => {
    updateLiveDistance();
}, 5000); 

function registerTripAndProceed() {
    const bus = document.getElementById('intentBus').value;
    const from = document.getElementById('intentFrom').value;
    const to = document.getElementById('intentTo').value;
    const passengers = document.getElementById('intentPassengers').value;
    const passengerName = document.getElementById('intentPassengerName').value || "Passenger";

    if(!from || !to) { 
        alert("Please fill all locations"); 
        return; 
    }

    const tripRef = db.ref('trips').push();
    const tripData = { bus, from, to, passengers, passengerName, timestamp: Date.now() };

    tripRef.set(tripData).then(() => {
        localStorage.setItem('busNo', bus);
        localStorage.setItem('from', from);
        localStorage.setItem('to', to);
        localStorage.setItem('passengerName', passengerName);
        localStorage.setItem('passengers', passengers);

        window.location.href = 'payment.html';
    }).catch(err => {
        console.error(err);
        alert("Error saving trip, try again");
    });
}
