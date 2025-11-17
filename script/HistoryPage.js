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

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  addDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ===================== FIREBASE CONFIG =====================
const firebaseConfig = {
  apiKey: "AIzaSyC7FLz6RyFhiNok82uPj3hs7Ev8r7UI3Ik",
  authDomain: "mediterranean-in-velvet-10913.firebaseapp.com",
  databaseURL:
    "https://mediterranean-in-velvet-10913-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-10913",
  storageBucket: "mediterranean-in-velvet-10913.firebasestorage.app",
  messagingSenderId: "478608649838",
  appId: "1:478608649838:web:cbe6ed90b718037244c07f",
  measurementId: "G-T9TT5N8NJX",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const dbFirestore = getFirestore(app);

// ===================== DOM ELEMENTS =====================
const orderList = document.querySelector(".order-list");

function renderNotifications(notifs) {
  const notifContainer = document.getElementById("notifItems");
  if (!notifContainer) return; // <-- prevents errors

  notifContainer.innerHTML = "";

  notifs.forEach((notif) => {
    const notifItem = document.createElement("div");
    notifItem.classList.add("notif-item");
    if (!notif.isRead) notifItem.classList.add("unread");

    notifItem.innerHTML = `
      <p>${notif.message}</p>
      <small>${
        notif.timestamp ? notif.timestamp.toDate().toLocaleString() : ""
      }</small>
    `;

    notifItem.addEventListener("click", async () => {
      const notifDoc = doc(
        dbFirestore,
        "notifications",
        notif.userId,
        "userNotifications",
        notif.id
      );
      await updateDoc(notifDoc, { isRead: true });
      notifItem.classList.remove("unread");
    });

    notifContainer.appendChild(notifItem);
  });
}

// ===================== FETCH USER ORDERS =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to view your order history.");
    window.location.href = "/pages/LoginPage.html";
    return;
  }

  // Firestore real-time notifications
  const notifRef = collection(
    dbFirestore,
    "notifications",
    user.uid,
    "userNotifications"
  );
  const notifQuery = query(notifRef, orderBy("timestamp", "desc"));

  onSnapshot(notifQuery, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, userId: user.uid, ...doc.data() });
    });

    renderNotifications(notifications);
  });

  onSnapshot(notifQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const notif = change.doc.data();
        showToast(notif.message);
      }
    });
  });

  function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
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
    userOrders.sort(
      (a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate)
    );

    userOrders.forEach((order) => {
      // Combine delivery date and time
      const displayDate = order.deliveryDate
        ? `${new Date(order.deliveryDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })} ${order.deliveryTime ? `at ${order.deliveryTime}` : ""}`
        : "Date not available";

      let statusColor = "darkorange";
      if (order.status === "accepted") statusColor = "black";
      else if (order.status === "for-delivery") statusColor = "green";
      else if (order.status === "cancelled") statusColor = "#cc3232";
      else if (order.status === "delivered") statusColor = "#a64d79";

      // Reverse items (stack-like behavior)
      const reversedItems = [...order.orders].reverse();

      reversedItems.forEach((item) => {
        orderList.innerHTML += `
          <div class="order-card">
            <img src="https://via.placeholder.com/140x140" alt="${item.name}" />
            <div class="order-info">
              <p class="order-id">Order ID: ${order.orderID || "N/A"}</p>
              <h3>${item.name}</h3>
              <p>Quantity: ${item.qty}</p>
              <p>Price: ₱${item.price} each</p>
              <p class="subtotal">Subtotal: ₱${(item.price * item.qty).toFixed(
                2
              )}</p>
              <p class="order-date">Date Received: ${displayDate}</p>
              <p class="order-status" style="color: ${statusColor}; font-weight: 600;">
                Status: ${order.status || "pending"}
              </p>
            </div>
            <button class="reorder-btn" onclick="reorder('${item.name}', ${
          item.qty
        }, ${item.price})">
              Reorder
            </button>
            <button class="feedback-btn" onclick="window.location.href='/pages/FeedbackPage.html?item=${encodeURIComponent(item.name)}&orderID=${order.orderID}'">
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
