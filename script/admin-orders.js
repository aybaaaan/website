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
let filteredOrdersCards = null;


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
    orderData.key = child.key;

    // Default safety
    if (orderData.isSeen === undefined) {
      orderData.isSeen = false;
    }

    ordersArrayCards.push(orderData);
  });

  // ✅ SORT — NEWEST FIRST
  ordersArrayCards.sort((a, b) => b.timestamp - a.timestamp);

  currentPageCards = 1;
  renderOrdersPage();


});


function renderOrdersPage() {
  ordersContainer.innerHTML = "";

  const sourceArray = filteredOrdersCards ?? ordersArrayCards;

  if (sourceArray.length === 0) {
    ordersContainer.innerHTML = "<p>No orders found.</p>";
    return;
  }

  const startIndex = (currentPageCards - 1) * ordersPerPageCards;
  const endIndex = startIndex + ordersPerPageCards;
  const pageOrders = sourceArray.slice(startIndex, endIndex);

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
        <h2>
  ${data.name || "Unknown"}
  ${
    data.status === "PENDING"
      ? '<span class="inline-new-badge">NEW</span>'
      : ''
  }
  </h2>
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
            <option value="ACCEPTED">Accepted</option>
            <option value="PREPARING">Preparing</option>
            <option value="FOR DELIVERY">For Delivery</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="DELIVERED">Delivered</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
    `;

    // ✅ Mark order as seen when admin clicks the card
row.addEventListener("click", () => {
  if (data.isSeen === false) {
    update(ref(db, `Order/${data.key}`), {
      isSeen: true,
    });
  }
});


    // ============ STATUS DROPDOWN ============
    const statusDropdown = row.querySelector(".order-status-dropdown");
    const status = (data.status || "PENDING").toUpperCase();
    const deleteBtn = row.querySelector(".delete-order-btn");

    statusDropdown.value = status;

    const setTextColor = () => {
      switch (statusDropdown.value) {
        case "ACCEPTED":
          statusDropdown.style.color = "#000";
          break;
        case "FOR DELIVERY":
          statusDropdown.style.color = "#3ac204ff";
          break;
        case "CANCELLED":
          statusDropdown.style.color = "#cc3232";
          break;
        case "DELIVERED":
          statusDropdown.style.color = "#a64d79";
          break;
        case "PENDING":
        case "PREPARING":
          statusDropdown.style.color = "#e66920ff";
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
          case "preparing":
            return "Mark this order as Preparing?";
          case "pending":
            return "Mark this order as Pending?";
          case "fordelivery":
            return "Mark this order as For Delivery?";
          case "delivered":
            return "Mark this order as Delivered? This will remove it from the view.";
          case "cancelled":
            return "Are you sure you want to Cancel this order? This will moved into the Archived Orders.";
          default:
            return "Update order status?";
        }
      };

      showStatusConfirm(getMessage(newStatus), (confirmed) => {
        if (!confirmed) {
          statusDropdown.value = status;
          setTextColor();
          return;
        }

        setTextColor();

        if (!userId)
          return console.error("No userId found, cannot send notification");

        const upperStatus = newStatus.toUpperCase();

        update(ref(db, `Order/${orderKey}`), {
          status: newStatus.toUpperCase(),
          statusTimestamp: Date.now(),
        })
          .then(async () => {
            if (upperStatus === "DELIVERED") {
              // Archive delivered order
              const orderSnapshot = await get(ref(db, `Order/${orderKey}`));
              if (!orderSnapshot.exists()) return;

              const orderData = orderSnapshot.val();
              orderData.status = "DELIVERED";
              orderData.archivedAt = Date.now();

              await push(ref(db, "OrderHistory"), orderData);
              await remove(ref(db, `Order/${orderKey}`));
            } else if (upperStatus === "CANCELLED") {
              const orderSnapshot = await get(ref(db, `Order/${orderKey}`));
              if (!orderSnapshot.exists()) return;

              const orderData = orderSnapshot.val();
              orderData.status = "CANCELLED";
              orderData.archivedAt = Date.now();

              await push(ref(db, "OrderHistory"), orderData);
              await remove(ref(db, `Order/${orderKey}`));
            }
          })
          .catch(console.error);
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
  const totalPages = Math.ceil(sourceArray.length / ordersPerPageCards);
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
  const sourceArray = filteredOrdersCards ?? ordersArrayCards;
const totalPages = Math.ceil(sourceArray.length / ordersPerPageCards);

  if (currentPageCards < totalPages) {
    currentPageCards++;
    renderOrdersPage();
  }
});

const searchNameInput = document.getElementById("searchName");
const searchOrderIdInput = document.getElementById("searchOrderId");
const searchOrdersBtn = document.getElementById("searchOrders");
const clearFiltersBtn = document.getElementById("clearFilters");

searchOrdersBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const nameValue = searchNameInput.value.toLowerCase().trim();
  const orderIdValue = searchOrderIdInput.value.toLowerCase().trim();

  filteredOrdersCards = ordersArrayCards.filter((order) => {
    const customerName = String(order.name || "").toLowerCase();
    const orderID = String(order.orderID || "").toLowerCase();

    return (
      customerName.includes(nameValue) &&
      orderID.includes(orderIdValue)
    );
  });

  currentPageCards = 1;
  renderOrdersPage();
});

clearFiltersBtn.addEventListener("click", (e) => {
  e.preventDefault();

  searchNameInput.value = "";
  searchOrderIdInput.value = "";
  filteredOrdersCards = null;

  currentPageCards = 1;
  renderOrdersPage();
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
