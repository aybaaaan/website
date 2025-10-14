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
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  databaseURL:
    "https://webusiteu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd",
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
    window.location.href = "/guest/index.html#menu";
  }
}

// ===================== EVENT HANDLERS =====================

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    goToMenuPage();
  });
}

function addToCartFromDetails() {
  const name = localStorage.getItem("foodName");
  const price = parseFloat(localStorage.getItem("foodPrice"));
  const qtyInput = document.getElementById("qty");
  const qty = parseInt(qtyInput.value, 10);

  if (!qty || qty < 1) {
    alert("Please enter a valid quantity.");
    qtyInput.focus();
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
    window.location.href = "/pages/HomePage.html?cart=open#menu";
  } else {
    window.location.href = "/guest/index.html?cart=open#menu";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  if (addBtn) {
    addBtn.addEventListener("click", addToCartFromDetails);
  }
});

// ✅ Make available to inline HTML
window.addToCartFromDetails = addToCartFromDetails;
