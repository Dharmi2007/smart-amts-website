// js/firebase.js

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt8xps-QZ0phnP1cJgjA6nqhiNCGjbH8g",
  authDomain: "smart-amts-d0ec8.firebaseapp.com",
  projectId: "smart-amts-d0ec8",
  storageBucket: "smart-amts-d0ec8.firebasestorage.app",
  messagingSenderId: "121822205622",
  appId: "1:121822205622:web:193337ae3482b8602e3817",
  measurementId: "G-83F1GE9M95"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const database = firebase.database();
const auth = firebase.auth();
const firestore = firebase.firestore();

// Test log
console.log("🔥 Firebase successfully connected");
