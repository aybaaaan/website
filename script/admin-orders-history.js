import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  remove,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7FLz6RyFhiNok82uPj3hs7Ev8r7UI3Ik",
  authDomain: "mediterranean-in-velvet-10913.firebaseapp.com",
  databaseURL: "https://mediterranean-in-velvet-10913-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-10913",
  storageBucket: "mediterranean-in-velvet-10913.firebasestorage.app",
  messagingSenderId: "478608649838",
  appId: "1:478608649838:web:cbe6ed90b718037244c07f",
  measurementId: "G-T9TT5N8NJX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const orderHistoryRef = ref(db, "OrderHistory");

let ordersHistoryArray = [];
let filteredOrders = [];
let currentPageHistory = 1;
const ordersPerPageHistory = 10;

const container = document.getElementById("orderHistoryContainer");
const pageInfo = document.getElementById("orderHistoryPageInfo");
const prevBtn = document.getElementById("prevPageHistory");
const nextBtn = document.getElementById("nextPageHistory");

const filterStatus = document.getElementById("filterStatus");
const filterCustomer = document.getElementById("filterCustomer");
const filterOrderId = document.getElementById("filterOrderId");
const filterStartDate = document.getElementById("filterStartDate");
const filterEndDate = document.getElementById("filterEndDate");
const applyFiltersBtn = document.getElementById("applyFilters");
const clearFiltersBtn = document.getElementById("clearFilters");

let orderToDelete = null;

const deleteMessage = document.getElementById("deleteMessage");
const confirmDeleteBtn = document.getElementById("confirm-delete");
const cancelDeleteBtn = document.getElementById("cancel-delete");

onValue(orderHistoryRef, (snapshot) => {
  ordersHistoryArray = [];
  if (!snapshot.exists()) {
    container.innerHTML = "<p>No archived orders found.</p>";
    pageInfo.textContent = "";
    return;
  }

  snapshot.forEach((child) => {
    const orderData = child.val();
    orderData.key = child.key;
    ordersHistoryArray.push(orderData);
  });

  filteredOrders = [...ordersHistoryArray];
  currentPageHistory = 1;
  renderOrderHistoryPage();
});

function renderOrderHistoryPage() {
  container.innerHTML = "";

  const startIndex = (currentPageHistory - 1) * ordersPerPageHistory;
  const endIndex = startIndex + ordersPerPageHistory;
  const pageOrders = filteredOrders.slice(startIndex, endIndex);

  if (pageOrders.length === 0) {
    container.innerHTML = "<p>No orders match the filter criteria.</p>";
  }

  pageOrders.forEach((data) => {
    const row = document.createElement("div");
    row.classList.add("order-card");

    let foodListHTML = "<li>No food items found</li>";
    if (data.orders && Array.isArray(data.orders)) {
      foodListHTML = data.orders
        .map((item) => {
          return `<li>${item.name} — Qty: ${item.qty} — ₱${(
            item.price * item.qty
          ).toFixed(2)}</li>`;
        })
        .join("");
    }

    const orderDateStr = data.timestamp
      ? new Date(data.timestamp).toLocaleString()
      : "N/A";
    const archivedDateStr = data.archivedAt
      ? new Date(data.archivedAt).toLocaleString()
      : "N/A";

    const statusClass =
      data.status === "DELIVERED"
        ? "status-delivered"
        : data.status === "CANCELLED"
        ? "status-cancelled"
        : "";

    row.innerHTML = `
          <div class ="nameid"><h2 class="name">${data.name || "Unknown"}</h2>
          <p class="orderid"><strong>Order ID:</strong> ${
            data.orderID || "N/A"
          }</p>
          
          
          <p class="total"><strong>Total:</strong> ₱${
            data.total ? data.total.toFixed(2) : "0.00"
          }</p>
          <p class="orderdate"><strong>Ordered At:</strong> ${
            data.orderDate
          }</p>
          <p class="archivedate"><strong>Archived At:</strong> ${archivedDateStr}</p>
        </div>
        <div class="right-actions">
        <p class="status"><strong>Status:</strong> <span class="${statusClass}">${
      data.status || "N/A"
    }</span></p>
          <div class="food-section">
            <button class="food-toggle">Show Food Items ▼</button>

            <div class="order-food-list">
              <ul>${foodListHTML}</ul>
            </div>

            <!-- delete button placeholder -->
            <div class="delete-wrapper" id="delete-${
              data.key
            }" style="display:none;">
              <button class="delete-btn">Delete Order</button>
            </div>
          </div>
        `;

    const foodToggle = row.querySelector(".food-toggle");
    const foodList = row.querySelector(".order-food-list");
    foodToggle.addEventListener("click", () => {
      foodList.classList.toggle("active");
      foodToggle.textContent = foodList.classList.contains("active")
        ? "Hide Food Items ▲"
        : "Show Food Items ▼";
    });

    const deleteWrapper = row.querySelector(`#delete-${data.key}`);

    if ((data.status || "").toUpperCase() === "CANCELLED") {
      deleteWrapper.style.display = "block";

      const deleteBtn = deleteWrapper.querySelector(".delete-btn");

      deleteBtn.addEventListener("click", () => {
        orderToDelete = data;
        deleteMessage.textContent = `Are you sure you want to permanently delete order ID: ${data.orderID}?`;
        deleteModal.classList.remove("hidden");
      });
    }

    container.appendChild(row);
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPageHistory);
  pageInfo.textContent = `Page ${currentPageHistory} of ${totalPages}`;

  prevBtn.disabled = currentPageHistory === 1;
  nextBtn.disabled = currentPageHistory === totalPages;
}

confirmDeleteBtn.addEventListener("click", () => {
  if (!orderToDelete) return;

  remove(ref(db, `OrderHistory/${orderToDelete.key}`)).catch(console.error);

  deleteModal.classList.add("hidden");
  orderToDelete = null;
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
  orderToDelete = null;
});

prevBtn.addEventListener("click", () => {
  if (currentPageHistory > 1) {
    currentPageHistory--;
    renderOrderHistoryPage();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPageHistory);
  if (currentPageHistory < totalPages) {
    currentPageHistory++;
    renderOrderHistoryPage();
  }
});

function applyFilters() {
  const statusVal = filterStatus.value.toUpperCase();
  const customerVal = filterCustomer.value.toLowerCase();
  const orderIdVal = filterOrderId.value.toLowerCase();
  const startDateVal = filterStartDate.value
    ? new Date(filterStartDate.value).setHours(0, 0, 0, 0)
    : null;
  const endDateVal = filterEndDate.value
    ? new Date(filterEndDate.value).setHours(23, 59, 59, 999)
    : null;

  filteredOrders = ordersHistoryArray.filter((order) => {
    let match = true;

    if (statusVal) match = match && order.status.toUpperCase() === statusVal;
    if (customerVal)
      match = match && order.name.toLowerCase().includes(customerVal);
    if (startDateVal) match = match && order.archivedAt >= startDateVal;
    if (endDateVal) match = match && order.archivedAt <= endDateVal;
    if (orderIdVal)
      match =
        match &&
        String(order.orderID || "")
          .toLowerCase()
          .includes(orderIdVal);

    return match;
  });

  currentPageHistory = 1;
  renderOrderHistoryPage();
}

applyFiltersBtn.addEventListener("click", applyFilters);

clearFiltersBtn.addEventListener("click", () => {
  filterStatus.value = "";
  filterCustomer.value = "";
  filterOrderId.value = "";
  filterStartDate.value = "";
  filterEndDate.value = "";
  filteredOrders = [...ordersHistoryArray];
  currentPageHistory = 1;
  renderOrderHistoryPage();
});
