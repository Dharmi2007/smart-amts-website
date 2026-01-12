// ================= GLOBALS =================
var map;
var markers = [];
var userMarker = null;
var userLocation = null;
var buses = [];
var database = window.db;

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
    console.log("Buses loaded:", buses);
});

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

        // ⭐ split layout ON
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

    // 🔥 FIXED PART 🔥
    document.getElementById("mapSection").classList.remove("hidden"); // show map
    document.querySelector(".layout").classList.add("two-column");      // split layout

    if(fromVal === "maninagar" && toVal === "cg road"){
        showMap(matched, true);   // demo animation
    } else {
        showMap(matched, false);  // normal GPS
    }
};

// ================= SHOW MAP =================
window.showMap = function(list, demoMode){

    // always unhide map
    document.getElementById("mapSection").classList.remove("hidden");

    // create map once
    if(!map){
        map = L.map("map").setView([23.0225, 72.5714], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    }

    // clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // ---------- DEMO MODE (moving bus) ----------
    if(demoMode){

        list.forEach(function(bus){

            var marker = L.marker([22.991, 72.603]).addTo(map)
                .bindPopup("🚍 Demo Bus " + bus.number);

            markers.push(marker);

            const path = [
                [22.991, 72.603], // Maninagar
                [23.005, 72.598],
                [23.015, 72.592],
                [23.025, 72.586],
                [23.030, 72.582]  // CG Road
            ];

            animateMarker(marker, path);
        });

        return;
    }

    // ---------- NORMAL MODE (REAL GPS) ----------
    list.forEach(function(bus){
        if(bus.lat && bus.lng){
            var marker = L.marker([bus.lat, bus.lng]).addTo(map)
                .bindPopup("🚍 Bus " + bus.number);
            markers.push(marker);
        }
    });
};

// ================= MOVING BUS FUNCTION =================
function animateMarker(marker, path){
    let i = 0;
    setInterval(function(){
        if(i >= path.length) i = 0;
        marker.setLatLng(path[i]);
        i++;
    }, 1500);
}

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

// ================= MAP TOGGLE =================
window.toggleMap = function(){
    document.querySelector(".layout").classList.add("two-column");
    document.getElementById("mapSection").classList.toggle("hidden");
};
