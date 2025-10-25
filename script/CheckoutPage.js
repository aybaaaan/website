// ===================== CHECKOUT PAGE =====================
const checkoutContainer = document.getElementById("checkoutContainer");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const addMoreBtn = document.getElementById("addMoreBtn");
const proceedBtn = document.getElementById("proceedBtn");

// Load orders from localStorage
let orders = JSON.parse(localStorage.getItem("cart")) || [];

// Update subtotal and total
function updateTotals() {
  let subtotal = orders.reduce((sum, item) => sum + item.price * item.qty, 0);
  subtotalEl.textContent = subtotal.toFixed(2);
  totalEl.textContent = subtotal.toFixed(2);
}

// Render orders dynamically
function renderOrders() {
  checkoutContainer.innerHTML = "";

  if (orders.length === 0) {
    checkoutContainer.innerHTML = "<p>Your cart is empty!</p>";
    subtotalEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    return;
  }

  orders.forEach((item, index) => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-item");

    orderDiv.innerHTML = `
      <div class="details">
        <h3>${item.name}</h3>
        <p class="details-qty">Qty: <span class="quantity">${
          item.qty
        }</span></p>
        <p class="details-price">Price: Php <span class="priceNum">${(
          item.price * item.qty
        ).toFixed(2)}</span></p>
        <div class="quantity-control">
          <button class="decreaseBtn">-</button>
          <button class="increaseBtn">+</button>
        </div>
        <button class="removeBtn">Remove</button>
      </div>
    `;

    checkoutContainer.appendChild(orderDiv);

    const qtyEl = orderDiv.querySelector(".quantity");
    const priceEl = orderDiv.querySelector(".priceNum");
    const increaseBtn = orderDiv.querySelector(".increaseBtn");
    const decreaseBtn = orderDiv.querySelector(".decreaseBtn");
    const removeBtn = orderDiv.querySelector(".removeBtn");

    // Increase quantity
    increaseBtn.addEventListener("click", () => {
      item.qty++;
      qtyEl.textContent = item.qty;
      priceEl.textContent = (item.price * item.qty).toFixed(2);
      updateTotals();
      localStorage.setItem("cart", JSON.stringify(orders));
    });

    // Decrease quantity
    decreaseBtn.addEventListener("click", () => {
      if (item.qty > 1) {
        item.qty--;
        qtyEl.textContent = item.qty;
        priceEl.textContent = (item.price * item.qty).toFixed(2);
        updateTotals();
        localStorage.setItem("cart", JSON.stringify(orders));
      }
    });

    // Remove item
    removeBtn.addEventListener("click", () => {
      orders.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(orders));
      renderOrders();
    });
  });

  updateTotals();
}

// ===================== MODAL LOGIC =====================
const modal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const checkoutForm = document.getElementById("checkoutForm");
const dateInput = document.getElementById("delivery-date");

// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
const fs = getFirestore(app);
const db = getDatabase(app);
const auth = getAuth(app);
const ordersRef = ref(db, "Order");

// ===================== AUTH STATE TRACKER =====================
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log("Logged in as:", user.email);
  } else {
    console.log("No user logged in.");
  }
});

async function loadUserProfile() {
  if (!currentUser) return;

  try {
    const userRef = doc(fs, "users", currentUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();

      document.getElementById("name").value =
        data.name && data.name !== "Not set"
          ? data.name
          : currentUser.email.split("@")[0];

      document.getElementById("contact").value =
        data.phone && data.phone !== "Not set" ? data.phone : "";

      document.getElementById("address").value =
        data.address && data.address !== "Not set" ? data.address : "";
    } else {
      console.log("⚠️ No user profile found in Firestore.");
    }
  } catch (err) {
    console.error("Error loading user profile:", err);
  }
}

// ===================== NAVIGATION HELPERS =====================
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

addMoreBtn.addEventListener("click", goToMenuPage);

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    goToMenuPage();
  });
}

//login kineme
// ========== Reusable popup (for alerts) ==========
function showPopup(message, redirectUrl = null) {
  let popup = document.getElementById("customPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "customPopup";
    popup.className = "popup-modal";
    popup.innerHTML = `
      <div class="popup-content">
        <p class="popup-message"></p>
        <div class="popup-actions">
          <button class="popup-btn confirm" id="popupOkBtn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
  }

  const messageEl = popup.querySelector(".popup-message");
  const okBtn = popup.querySelector("#popupOkBtn");

  messageEl.textContent = message;
  popup.style.display = "flex";

  okBtn.onclick = () => {
    popup.style.display = "none";
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 150);
    }
  };

  // Close when clicking outside
  window.onclick = (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  };
}

// FOR DELIVERY DATE INPUT
// Prevent users from choosing past dates
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dateInput.min = `${yyyy}-${mm}-${dd}`;

// Prevent past times for today's date
dateInput.addEventListener("change", () => {
  const selectedDate = new Date(dateInput.value);
  const now = new Date();

  // Reset time input
  timeInput.value = "";

  // If user picks today, limit times
  if (
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate()
  ) {
    // Set minimum time to current time (rounded to next 15 minutes)
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);
    const minTime = now.toTimeString().slice(0, 5);
    timeInput.min = minTime;
  } else {
    // If another day, reset min
    timeInput.min = "09:00";
  }
});

// ========== Login and Cart Validation ==========
proceedBtn.addEventListener("click", async () => {
  if (!currentUser) {
    if (modal) modal.style.display = "none";
    showPopup(
      "You must be logged in to place an order.",
      "/pages/LoginPage.html"
    );
    return;
  }

  if (orders.length === 0) {
    showPopup("Your cart is empty!");
    return;
  }

  // 🔹 Try to load profile info from Firestore
  await loadUserProfile();

  modal.style.display = "flex";
});

// ========== Modal Close Logic ==========
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// ==================== INVALID DELIVERY TIME POPUP ====================
const timePopup = document.getElementById("timePopup");
const timePopupOkBtn = document.getElementById("timePopupOkBtn");
const timePopupMsg = document.getElementById("timePopupMsg");

function showTimePopup(message) {
  timePopupMsg.textContent = message;
  timePopup.style.display = "flex";
  timePopup.setAttribute("aria-hidden", "false");
}

timePopupOkBtn.addEventListener("click", () => {
  timePopup.style.display = "none";
  timePopup.setAttribute("aria-hidden", "true");
});

// ==================== SUBMIT HANDLER ====================
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const payment = document.getElementById("payment").value;
  const deliveryDate = document.getElementById("delivery-date").value;
  const deliveryTime = document.getElementById("delivery-time").value;

  if (!name || !address || !contact || !payment) {
    showTimePopup("Please fill out all fields.");
    return;
  }

  const now = new Date();
  const selectedDateTime = new Date(`${deliveryDate}T${deliveryTime}`);

  if (!deliveryDate || !deliveryTime) {
    showTimePopup("Please select a delivery date and time.");
    return;
  }

  // can't choose past dates/times
  if (selectedDateTime < now) {
    showTimePopup(
      "Please choose a valid delivery time (cannot be in the past)."
    );
    return;
  }

  // at least 20 minutes from now
  const minAllowedTime = new Date(now.getTime() + 20 * 60000);
  if (selectedDateTime < minAllowedTime) {
    showTimePopup(
      "Please allow at least 20 minutes for preparation and delivery."
    );
    return;
  }

  // only between 9 AM and 8 PM
  const hour = selectedDateTime.getHours();
  if (hour < 9 || hour > 20) {
    showTimePopup("Delivery time must be between 9:00 AM and 8:00 PM.");
    return;
  }
  const orderData = {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    name,
    address,
    contact,
    deliveryDate,
    deliveryTime,
    payment,
    orders,
    total: parseFloat(totalEl.textContent),
    timestamp: new Date(),
    status: "Pending",
  };

  try {
    await push(ordersRef, orderData);

    // Update user profile in Firestore
    const userRef = doc(fs, "users", currentUser.uid);
    await setDoc(
      userRef,
      {
        email: currentUser.email,
        name,
        phone: contact,
        address,
      },
      { merge: true }
    );

    // FOR DELIVERY DATE INPUT
    // Prevent users from choosing past dates
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;

    // Clear cart and close checkout modal
    localStorage.removeItem("cart");
    orders = [];
    renderOrders();
    modal.style.display = "none";

    // Show success popup
    document.getElementById("successModal").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Failed to place order. Please try again.");
  }
});

// Return Home button handler
document.getElementById("returnHomeBtn").addEventListener("click", () => {
  document.getElementById("successModal").style.display = "none";
  window.location.href = "/pages/HomePage.html#home";
});

// Initialize checkout
renderOrders();
