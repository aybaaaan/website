// FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

const ordersPerPageCards = 10;
let currentPageCards = 1;
let ordersArrayCards = [];

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbFirestore = getFirestore(app);

const ordersRef = ref(db, "Order");
const announcementRef = ref(db, "Announcements");

const ordersContainer = document.getElementById("ordersContainer");

// RENDER ORDERS
onValue(ordersRef, (snapshot) => {
  ordersArrayCards = [];
  if (!snapshot.exists()) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  snapshot.forEach((child) => {
    const orderData = child.val();
    orderData.key = child.key; // store key for actions
    ordersArrayCards.push(orderData);
  });

  currentPageCards = 1;
  renderOrdersPage();
});

function renderOrdersPage() {
  ordersContainer.innerHTML = "";

  if (ordersArrayCards.length === 0) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  const startIndex = (currentPageCards - 1) * ordersPerPageCards;
  const endIndex = startIndex + ordersPerPageCards;
  const pageOrders = ordersArrayCards.slice(startIndex, endIndex);

  pageOrders.forEach((data) => {
    const row = document.createElement("div");
    row.classList.add("order-card");

    // ============ FORMAT DATE & TIME ============
    const deliveryDate = data.deliveryDate || "N/A";
    let deliveryTime = "N/A";
    if (data.deliveryTime) {
      const [hour, minute] = data.deliveryTime.split(":").map(Number);
      const dateObj = new Date();
      dateObj.setHours(hour, minute);
      deliveryTime = dateObj.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    let orderDate = "N/A";
    let orderTime = "N/A";
    if (data.timestamp) {
      const dateObj = new Date(data.timestamp);
      orderDate = dateObj.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      orderTime = dateObj.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // ============ FOOD LIST ============
    let foodListHTML = "";
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach((item) => {
        foodListHTML += `<li>${item.name} — Qty: ${item.qty} — ₱${(
          item.price * item.qty
        ).toFixed(2)}</li>`;
      });
    } else {
      foodListHTML = "<li>No food items found.</li>";
    }

    // ============ ROW INNER HTML ============
    row.innerHTML = `
      <div class="order-card-left">
        <h2>${data.name || "Unknown"}</h2>
        <p><strong>Address:</strong> ${
          typeof data.address === "string"
            ? data.address // If stored as plain text
            : data.address
            ? [
                data.address.houseno,
                data.address.street,
                data.address.barangay,
                data.address.city,
                data.address.province,
              ]
                .filter(Boolean)
                .join(", ")
            : "N/A"
        }</p>

        <p><strong>Contact:</strong> ${data.contact || "N/A"}</p>
        <p><strong>Payment:</strong> ${data.payment || "N/A"}</p>
        <p><strong>Order Date & Time:</strong> ${data.orderDate} ${
      data.orderTime
    }</p>
        <div class="food-section">
          <button class="food-toggle">Order Details ▼</button>
          <div class="order-food-list">
            <ul>${foodListHTML}</ul>
          </div>
        </div>
      </div>

      <div class="order-card-right">
        <h6 class= "orderNumber"><strong>Order #: ${
          data.orderID || "N/A"
        }  </strong></h6>
        <p>
  <strong><span style= "color: #a64d79;">Total:</strong></span>
  <span style="font-size: 18px; color: #a64d79; font-weight: bold;">
    ₱${data.total ? data.total.toFixed(2) : "0.00"}
  </span>
</p>

        <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
        <p><strong>Delivery Time:</strong> ${deliveryTime}</p>
        <div class="order-actions">
          <label class="status-label" for="status-dropdown-${
            data.key
          }">Update Status:</label>
          <select class="order-status-dropdown" id="status-dropdown-${
            data.key
          }">
            <option value="accepted" ${
              data.status === "accepted" ? "selected" : ""
            }>Accepted</option>
            <option value="for-delivery" ${
              data.status === "for-delivery" ? "selected" : ""
            }>For Delivery</option>
            <option value="cancelled" ${
              data.status?.toLowerCase() === "cancelled" ? "selected" : ""
            }>Cancelled</option>
            <option value="delivered" ${
              data.status?.toLowerCase() === "delivered" ? "selected" : ""
            }>Delivered</option>
            <option value="pending" ${
              !data.status || data.status?.toLowerCase() === "pending"
                ? "selected"
                : ""
            }>Pending</option>
          </select>
        </div>
      </div>
    `;

    // ============ STATUS DROPDOWN ============
    const statusDropdown = row.querySelector(".order-status-dropdown");

    const setTextColor = () => {
      switch (statusDropdown.value) {
        case "accepted":
          statusDropdown.style.color = "black";
          break;
        case "for-delivery":
          statusDropdown.style.color = "green";
          break;
        case "cancelled":
          statusDropdown.style.color = "#cc3232";
          break;
        case "pending":
          statusDropdown.style.color = "darkorange";
          break;
        case "delivered":
          statusDropdown.style.color = "#a64d79";
          break;
        default:
          statusDropdown.style.color = "#000";
      }
    };
    setTextColor();

    statusDropdown.addEventListener("change", () => {
      const newStatus = statusDropdown.value;
      const orderKey = data.key;
      const userId = data.userId;

      const getMessage = (status) => {
        switch (status.toLowerCase()) {
          case "accepted":
            return "Mark this order as Accepted?";
          case "pending":
            return "Mark this order as Pending?";
          case "for-delivery":
            return "Mark this order as For Delivery?";
          case "delivered":
            return "Mark this order as Delivered? This will remove it from the view.";
          case "cancelled":
            return "Are you sure you want to Cancel this order? This will delete it from the database.";
          default:
            return "Update order status?";
        }
      };

      showStatusConfirm(getMessage(newStatus), (confirmed) => {
        if (!confirmed) {
          statusDropdown.value = data.status || "pending";
          setTextColor();
          return;
        }

        setTextColor();

        if (!userId)
          return console.error("No userId found, cannot send notification");

        if (newStatus.toLowerCase() === "delivered") {
          update(ref(db, `Order/${orderKey}`), {
            status: "delivered",
            statusTimestamp: Date.now(),
          })
            .then(() => {
              row.remove();
              //return sendNotification(userId, "delivered", orderKey);
            })
            .catch(console.error);
        } else if (newStatus.toLowerCase() === "cancelled") {
          update(ref(db, `Order/${orderKey}`), {
            status: "cancelled",
            statusTimestamp: Date.now(),
          })
            .then(() => remove(ref(db, `Order/${orderKey}`)))
            .then(() => {
              row.remove();
              //return sendNotification(userId, "cancelled", orderKey);
            })
            .catch(console.error);
        } else {
          // other statuses: accepted, pending, for-delivery
          const now = Date.now(); // exact timestamp in ms

          update(ref(db, `Order/${orderKey}`), {
            status: newStatus,
            statusTimestamp: now, // <-- save exact admin update time
          })
            .then(() => {
              /* Notification call removed */
            })
            .catch(console.error);
        }
      });
    });

    // ============ FOOD TOGGLE ============
    const foodToggle = row.querySelector(".food-toggle");
    const foodList = row.querySelector(".order-food-list");
    foodToggle.addEventListener("click", () => {
      foodList.classList.toggle("active");
      foodToggle.textContent = foodList.classList.contains("active")
        ? "Order Details ▲"
        : "Order Details ▼";
    });

    ordersContainer.appendChild(row);
  });

  // ============ UPDATE PAGINATION INFO ============
  const totalPages = Math.ceil(ordersArrayCards.length / ordersPerPageCards);
  document.getElementById(
    "ordersPageInfo"
  ).textContent = `Page ${currentPageCards} of ${totalPages}`;

  document.getElementById("prevPageOrders").disabled = currentPageCards === 1;
  document.getElementById("nextPageOrders").disabled =
    currentPageCards === totalPages;
}

// PAGINATION BUTTONS FOR ORDERS
document.getElementById("prevPageOrders").addEventListener("click", () => {
  if (currentPageCards > 1) {
    currentPageCards--;
    renderOrdersPage();
  }
});
document.getElementById("nextPageOrders").addEventListener("click", () => {
  const totalPages = Math.ceil(ordersArrayCards.length / ordersPerPageCards);
  if (currentPageCards < totalPages) {
    currentPageCards++;
    renderOrdersPage();
  }
});

// ORDER'S STATUS CONFIRMATION MODAL
const statusConfirmModal = document.getElementById("status-confirm-modal");
const statusConfirmMessage = document.getElementById("status-confirm-message");
const statusYesBtn = document.getElementById("status-yes");
const statusCancelBtn = document.getElementById("status-cancel");

let pendingStatusChange = null;

function showStatusConfirm(message, callback) {
  statusConfirmMessage.textContent = message;
  statusConfirmModal.style.display = "flex";

  // Remove old event listeners
  statusYesBtn.onclick = null;
  statusCancelBtn.onclick = null;

  statusYesBtn.onclick = () => {
    statusConfirmModal.style.display = "none";
    callback(true);
  };

  statusCancelBtn.onclick = () => {
    statusConfirmModal.style.display = "none";
    callback(false);
  };
}

window.addEventListener("click", (e) => {
  if (e.target === statusConfirmModal)
    statusConfirmModal.style.display = "none";
});

// CUSTOM POPUP MODALS (REPLACE ALERTS)

// Fill Fields / Image Modal
const fillFieldsModal = document.getElementById("fill-fields-images");
const closeFillFields = document.getElementById("close-fill-fields");

closeFillFields.addEventListener("click", () => {
  fillFieldsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === fillFieldsModal) fillFieldsModal.style.display = "none";
});

// Customer Order Confirmation Modal
const customerOrderModal = document.getElementById("customer-order-popup");
const customerOrderMessage = document.getElementById("customer-order-message");
const closeCustomerOrder = document.getElementById("close-customer-order");

closeCustomerOrder.addEventListener("click", () => {
  customerOrderModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === customerOrderModal)
    customerOrderModal.style.display = "none";
});

// DELETE CONFIRMATION MODAL

const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const deleteConfirmMessage = document.getElementById("delete-confirm-message");
const cancelDelete = document.getElementById("cancel-delete");
const confirmDelete = document.getElementById("confirm-delete");

let orderKeyToDelete = null;

cancelDelete.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
  orderKeyToDelete = null;
});

confirmDelete.addEventListener("click", () => {
  if (orderKeyToDelete) remove(ref(db, "Order/" + orderKeyToDelete));
  deleteConfirmModal.style.display = "none";
  orderKeyToDelete = null;
});

window.addEventListener("click", (e) => {
  if (e.target === deleteConfirmModal)
    deleteConfirmModal.style.display = "none";
});
