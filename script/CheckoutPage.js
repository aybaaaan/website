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
const formFields = document.getElementById("formFields");

function renderDeliveryFields() {
  formFields.innerHTML = `
    <input id="name" type="text" placeholder="Name" required>
    <input id="address" type="text" placeholder="Address" required>
    <input id="contact" type="text" placeholder="Contact Number" required>
    <label class="payment-label">Payment Method:</label>
    <select id="payment" required>
      <option value="" disabled selected>Select Payment</option>
      <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
      <option value="GCASH">GCash QR Code</option>
    </select>
    <button type="submit" id="placeOrderBtn">Place Order</button>
  `;
}

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

// ========== Login and Cart Validation ==========
proceedBtn.addEventListener("click", () => {
  if (!currentUser) {
    if (modal) modal.style.display = "none";
    showPopup("You must be logged in to place an order.", "/pages/LoginPage.html");
    return;
  }

  if (orders.length === 0) {
    showPopup("Your cart is empty!");
    return;
  }

  modal.style.display = "flex";
  renderDeliveryFields();
});

// ========== Modal Close Logic ==========
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});


// SINGLE Submit Handler
/*checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const payment = document.getElementById("payment").value;

  if (!name || !address || !contact || !payment) {
    alert("Please fill out all fields.");
    return;
  }

  const orderData = {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    name,
    address,
    contact,
    payment,
    orders,
    total: parseFloat(totalEl.textContent),
    timestamp: Date.now(),
    status: "Pending",
  };

  try {
    await push(ordersRef, orderData);
    alert("Order placed successfully!");

    localStorage.removeItem("cart");
    orders = [];
    renderOrders();
    modal.style.display = "none";
    document.getElementById("successModal").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Failed to place order. Please try again.");
  }
});
*/

// SINGLE Submit Handler
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const payment = document.getElementById("payment").value;

  if (!name || !address || !contact || !payment) {
    alert("Please fill out all fields.");
    return;
  }

  const orderData = {
    userId: currentUser.uid,
    userEmail: currentUser.email,
    name,
    address,
    contact,
    payment,
    orders,
    total: parseFloat(totalEl.textContent),
    timestamp: Date.now(),
    status: "Pending",
  };

  try {
    await push(ordersRef, orderData);

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
