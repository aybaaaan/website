// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");
});

// ===================== IMPORTS =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ===================== FIREBASE CONFIG =====================
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

// ===================== DOM ELEMENTS =====================
const orderList = document.querySelector(".order-list");

// ===================== FETCH USER ORDERS =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to view your order history.");
    window.location.href = "/pages/LoginPage.html";
    return;
  }

  const ordersRef = ref(db, "Order");
  onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    orderList.innerHTML = "";

    if (!data) {
      orderList.innerHTML = "<p>No orders found.</p>";
      return;
    }

    // Filter orders belonging to the current user
    const userOrders = Object.values(data).filter(
      (order) => order.userId === user.uid
    );

    if (userOrders.length === 0) {
      orderList.innerHTML = "<p>You have no past orders yet.</p>";
      return;
    }

    // Sort orders by deliveryDate (latest first)
    userOrders.sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));

    userOrders.forEach((order) => {
      // Combine delivery date and time
      const displayDate = order.deliveryDate
        ? `${new Date(order.deliveryDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} ${order.deliveryTime ? `at ${order.deliveryTime}` : ""}`
        : "Date not available";

      // Reverse items (stack-like behavior)
      const reversedItems = [...order.orders].reverse();

      reversedItems.forEach((item) => {
        orderList.innerHTML += `
          <div class="order-card">
            <img src="https://via.placeholder.com/140x140" alt="${item.name}" />
            <div class="order-info">
              <h3>${item.name}</h3>
              <p>Quantity: ${item.qty}</p>
              <p>Price: ₱${item.price} each</p>
              <p class="subtotal">Subtotal: ₱${(item.price * item.qty).toFixed(2)}</p>
              <p class="order-date">Date Received: ${displayDate}</p>
            </div>
            <button class="reorder-btn" onclick="reorder('${item.name}', ${item.qty}, ${item.price})">
              Reorder
            </button>
            <button class="feedback-btn" onclick="window.location.href='/pages/FeedbackPage.html?item=${encodeURIComponent(item.name)}&order=${order.deliveryDate}'">
              Give Feedback
            </button>
          </div>
        `;
      });
    });
  });
});

// ===================== REORDER FUNCTION =====================
window.reorder = function (name, qty, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, qty, price });
  localStorage.setItem("cart", JSON.stringify(cart));

  // Show popup
  const popup = document.getElementById("reorderPopup");
  const message = document.getElementById("reorderMessage");
  const okBtn = document.getElementById("reorderOkBtn");

  message.textContent = `${name} has been added to your cart again!`;
  popup.style.display = "flex";

  okBtn.onclick = () => {
    popup.style.display = "none";
  };
};
