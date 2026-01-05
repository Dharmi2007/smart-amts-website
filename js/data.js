// =============================== 
// Ahmedabad Bus Stops (Autocomplete)
// ===============================
const locations = [
  "Maninagar",
  "Kalupur",
  "CG Road",
  "Nehrunagar",
  "LD College",
  "Vastrapur",
  "Satellite",
  "Iskcon",
  "Bopal",
  "Naroda",
  "Shahibaug",
  "Gita Mandir"
];

// ===============================
// AMTS Buses (STATIC MASTER DATA)
// ===============================
const buses = [
  {
    id: 1,
    number: "AMTS 23",
    route: "Maninagar → CG Road",
    from: "Maninagar",
    to: "CG Road",
    via: "Gita Mandir → Ellis Bridge",
    lat: 23.0105,
    lng: 72.5900,
    crowd: "High",
    status: "Running"
  },
  {
    id: 2,
    number: "AMTS 45",
    route: "Maninagar → CG Road",
    from: "Maninagar",
    to: "CG Road",
    via: "Kankaria → Paldi",
    lat: 23.0150,
    lng: 72.5850,
    crowd: "Medium",
    status: "Running"
  },
  {
    id: 3,
    number: "AMTS 12",
    route: "Kalupur → Nehrunagar",
    from: "Kalupur",
    to: "Nehrunagar",
    via: "Relief Road → Ashram Road",
    lat: 23.0300,
    lng: 72.5800,
    crowd: "High",
    status: "Delayedri"
  },
  {
    id: 4,
    number: "AMTS 50",
    route: "Bopal → LD College",
    from: "Bopal",
    to: "LD College",
    via: "Iskcon → CG Road",
    lat: 23.0400,
    lng: 72.5100,
    crowd: "Low",
    status: "Running"
  },
  {
    id: 5,
    number: "AMTS 72",
    route: "Naroda → Gita Mandir",
    from: "Naroda",
    to: "Gita Mandir",
    via: "Shahibaug",
    lat: 23.0700,
    lng: 72.6500,
    crowd: "Medium",
    status: "Running"
  }
];

// ===============================
// Passenger Feedback (Future use)
// ===============================
const feedbacks = [];
