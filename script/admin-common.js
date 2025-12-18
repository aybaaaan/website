import {
  getApp,
  getApps,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSpMRcuO5iGPU2hXhnTOMjog29plJwU4U",
  authDomain: "mediterranean-in-velvet-53036.firebaseapp.com",
  databaseURL:
    "https://mediterranean-in-velvet-53036-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-53036",
  storageBucket: "mediterranean-in-velvet-53036.firebasestorage.app",
  messagingSenderId: "1062662016088",
  appId: "1:1062662016088:web:007e0bf8a3e5d0094c8e2d",
  measurementId: "G-TRP0RL8LRL",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

const ordersBadge = document.getElementById("ordersBadge");
const ordersLink = document.querySelector(".orders-link");

if (ordersLink) {
  ordersLink.addEventListener("click", () => {
    localStorage.setItem("lastSeenOrdersTime", Date.now());

    // Instantly hide badge for good UX
    if (ordersBadge) {
      ordersBadge.classList.add("hidden");
    }
  });
}

const ordersRef = ref(db, "Order");

onValue(ordersRef, (snapshot) => {
  if (!snapshot.exists() || !ordersBadge) return;

  const orders = Object.values(snapshot.val());
  const lastSeen = Number(localStorage.getItem("lastSeenOrdersTime")) || 0;

  const unseen = orders.filter((o) => {
    if (!o.timestamp) return false;
    return Number(o.timestamp) > lastSeen;
  }).length;

  if (unseen > 0) {
    ordersBadge.textContent = unseen > 9 ? "9+" : unseen;
    ordersBadge.classList.remove("hidden");
  } else {
    ordersBadge.classList.add("hidden");
  }
});

// LOGOUT MODAL LOGIC
const logoutBtn = document.getElementById("btn-logout");
const logoutModal = document.getElementById("logoutModal"); // fixed ID
const cancelLogout = document.getElementById("cancel-logout");
const confirmLogout = document.getElementById("confirm-logout");

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutModal.style.display = "flex";
});

cancelLogout.addEventListener(
  "click",
  () => (logoutModal.style.display = "none")
);
confirmLogout.addEventListener(
  "click",
  () => (window.location.href = "../pages/LoginPage.html")
);

window.addEventListener("click", (e) => {
  if (e.target === logoutModal) logoutModal.style.display = "none";
});

//Hamburger
const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector("aside");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
