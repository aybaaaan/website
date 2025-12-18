// Load food details when the page opens
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("foodName").textContent =
    localStorage.getItem("foodName") || "Food Name";
  document.getElementById("foodPrice").textContent =
    localStorage.getItem("foodPrice") || "0";
  document.getElementById("foodDesc").textContent =
    localStorage.getItem("foodDesc") ||
    "This is a delicious Mediterranean dish.";
  document.getElementById("foodImage").src =
    localStorage.getItem("foodImg") || "";
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log("Logged in as:", user.email);
  } else {
    console.log("No user logged in.");
  }
});

// Go back to HomePage (menu section)
function goToMenuPage() {
  if (currentUser) {
    // Logged-in users → HomePage.html
    window.location.href = "/pages/HomePage.html#menu";
  } else {
    // Guests → index.html
    window.location.href = "/index.html#menu";
  }
}

// ===================== EVENT HANDLERS =====================

backBtn.addEventListener("click", (e) => {
  e.preventDefault();

  if (currentUser) {
    goToMenuPage();
  } else {
    window.location.href = "../index.html#menu";
  }
});

const qtyInput = document.getElementById("qty");
const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const addBtn = document.getElementById("addBtn");

// Handle + button
plusBtn.addEventListener("click", () => {
  qtyInput.value = parseInt(qtyInput.value, 10) + 1;
});

// Handle - button
minusBtn.addEventListener("click", () => {
  const current = parseInt(qtyInput.value, 10);
  if (current > 1) qtyInput.value = current - 1;
});

function addToCartFromDetails() {
  const name = localStorage.getItem("foodName");
  const price = parseFloat(localStorage.getItem("foodPrice"));
  const qtyInput = document.getElementById("qty");
  const qty = parseInt(qtyInput.value, 10);

  if (!qty || qty < 1) {
    showPopup("Please enter a valid quantity.", () => {
      qtyInput.focus();
    });
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // Redirect based on login
  if (currentUser) {
    window.location.href = "../pages/HomePage.html?cart=open#menu";
  } else {
    window.location.href = "../index.html?cart=open#menu";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.addEventListener("click", addToCartFromDetails);
  }
});

function showPopup(message, callback) {
  // Remove any existing popup first
  const existingPopup = document.querySelector(".custom-popup");
  if (existingPopup) existingPopup.remove();

  // Create the popup
  const popup = document.createElement("div");
  popup.classList.add("custom-popup");
  popup.innerHTML = `
    <div class="popup-content">
      <p>${message}</p>
      <button id="popup-ok">OK</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Handle OK button
  document.getElementById("popup-ok").addEventListener("click", () => {
    popup.remove();
    if (callback) callback(); // optional callback (like focus)
  });
}

// ✅ Make available to inline HTML
window.addToCartFromDetails = addToCartFromDetails;
