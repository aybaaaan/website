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
  () => (window.location.href = "/pages/LoginPage.html")
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

const menuRef = ref(db, "menu");
const homeRef = ref(db, "homepage");
const ordersRef = ref(db, "Order");

const menuGrid = document.getElementById("menuGrid");
const homeGrid = document.getElementById("homeGrid");
const ordersContainer = document.getElementById("ordersContainer");

// ITEM MODAL VARIABLES
let currentSection = "menu";
let editKey = null;
let base64Image = "";
const fileInput = document.getElementById("imageFile");
const preview = document.getElementById("preview");

const priceInput = document.getElementById("imagePrice");

// Make sure only numbers and one decimal point are allowed
priceInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    .replace(/[^\d.]/g, "") // allow only digits and a single dot
    .replace(/(\..*?)\..*/g, "$1"); // prevent multiple dots
});

// OPEN ADD ITEM MODAL
window.openAddModal = (section = "menu") => {
  currentSection = section;
  editKey = null;
  preview.src = "";
  base64Image = "";
  fileInput.value = "";
  document.getElementById("imageName").value = "";
  document.getElementById("imageDesc").value = "";
  document.getElementById("imagePrice").value = "";
  document.getElementById("modalTitle").innerText = "Add Item";
  document.getElementById("itemModal").style.display = "block";

  // Show or hide price input depending on section
  const priceField =
    document.getElementById("imagePrice").closest(".input-group") ||
    document.getElementById("imagePrice");
  if (section === "menu") {
    priceField.style.display = "block";
  } else {
    priceField.style.display = "none";
  }
};

// CLOSE ITEM MODAL
window.closeModal = () =>
  (document.getElementById("itemModal").style.display = "none");

// IMAGE PREVIEW HANDLER
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      base64Image = event.target.result;
      preview.src = base64Image;
    };
    reader.readAsDataURL(file);
  }
});

// SAVE ITEM (ADD OR EDIT)
document.getElementById("saveItem").addEventListener("click", () => {
  const name = document.getElementById("imageName").value.trim();
  const desc = document.getElementById("imageDesc").value.trim();
  const price = document.getElementById("imagePrice").value.trim();
  const category = document.getElementById("itemCategory")?.value || "main"; // default to main

  if (!base64Image || !name || !desc || (currentSection === "menu" && !price)) {
    showFillFieldsModal();
    return;
  }

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  // Build the data object
  const itemData = {
    url: base64Image,
    name,
    desc,
    price,
  };

  // Only add category for menu section
  if (currentSection === "menu") {
    itemData.category = category;
  }

  // Save to Firebase (update or push)
  if (editKey) {
    update(ref(db, `${currentSection}/${editKey}`), itemData);
  } else {
    push(sectionRef, itemData);
  }

  closeModal();
});

// EDIT ITEM
window.editItem = (section, key, url, name, desc, price) => {
  currentSection = section;
  editKey = key;
  document.getElementById("modalTitle").innerText = "Edit Item";
  document.getElementById("imageName").value = name;
  document.getElementById("imageDesc").value = desc;
  document.getElementById("imagePrice").value = price || "";
  preview.src = url;
  base64Image = url;
  document.getElementById("itemModal").style.display = "block";

  // ✅ Show or hide price input depending on section
  const priceField =
    document.getElementById("imagePrice").closest(".input-group") ||
    document.getElementById("imagePrice");
  if (section === "menu") {
    priceField.style.display = "block";
  } else {
    priceField.style.display = "none";
  }
};

// DELETE ITEM
let pendingDelete = { section: null, key: null };
window.deleteItem = (section, key) => {
  pendingDelete.section = section;
  pendingDelete.key = key;

  document.getElementById("delete-confirm-message").innerText =
    "Are you sure you want to delete this item?";

  document.getElementById("delete-confirm-modal").style.display = "flex";
};

// RENDER MENU AND HOME ITEMS
function renderItems(refPath, container) {
  onValue(refPath, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((child) => {
      const item = child.val();
      const key = child.key;

      const itemWrapper = document.createElement("div");
      itemWrapper.classList.add("item-wrapper");

      // IMAGE BOX (just the image)
      const box = document.createElement("div");
      box.classList.add("picture-box");
      box.innerHTML = `
      <img src="${item.url}" alt="${item.name}">
      `;

      // DETAILS (outside the picture-box)
      const details = document.createElement("div");
      details.classList.add("item-details");

      if (refPath.key === "menu") {
        const categoryName = getCategoryName(item.category);
        // Show price for menu items
        details.innerHTML = `
    <p class="item-name"><strong>Name:</strong> ${item.name}</p>
    <p class="item-desc"><strong>Description:</strong> ${item.desc}</p>
    <p class="item-price"><strong>Price:</strong> ₱${item.price || 0}</p>
    <p class="item-category">Category: ${categoryName}</p>
  `;
      } else {
        // Hide price for homepage items
        details.innerHTML = `
    <p class="item-name">${item.name}</p>
    <p class="item-desc">${item.desc}</p>
  `;
      }

      // append everything in order
      itemWrapper.appendChild(details);

      // then append itemWrapper to container

      // BUTTONS CONTAINER
      const buttonsDiv = document.createElement("div");
      buttonsDiv.classList.add("buttons");

      // EDIT BUTTON
      const editBtn = document.createElement("button");
      editBtn.classList.add("btn-edit");
      editBtn.textContent = "Edit";

      // store safely
      editBtn.dataset.ref = refPath.key;
      editBtn.dataset.key = key;
      editBtn.dataset.url = item.url;
      editBtn.dataset.name = item.name;
      editBtn.dataset.desc = item.desc;
      editBtn.dataset.price = item.price || 0;

      // event listener
      editBtn.addEventListener("click", (e) => {
        const d = e.currentTarget.dataset;
        editItem(d.ref, d.key, d.url, d.name, d.desc, d.price);
      });

      // DELETE BUTTON
      const delBtn = document.createElement("button");
      delBtn.classList.add("btn-delete");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteItem(refPath.key, key));

      // append buttons
      buttonsDiv.append(editBtn, delBtn);

      itemWrapper.appendChild(box);
      itemWrapper.appendChild(buttonsDiv);
      container.appendChild(itemWrapper);
    });

    // ADD BUTTON
    const plus = document.createElement("div");
    plus.classList.add("picture-box", "plus");
    plus.innerText = "+";
    plus.onclick = () => openAddModal(refPath.key);
    container.appendChild(plus);
  });
}

renderItems(menuRef, menuGrid);
renderItems(homeRef, homeGrid);

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
        <p class= "orderNumber"><strong>Order #:</strong> ${
          data.orderID || "N/A"
        }</p>
        <p><strong>Total:</strong> ₱${
          data.total ? data.total.toFixed(2) : "0.00"
        }</p>
        <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
        <p><strong>Delivery Time:</strong> ${deliveryTime}</p>
        <div class="order-actions">
          <label class="status-label" for="order-status">Status:</label>
          <select class="order-status-dropdown">
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
              return sendNotification(userId, "delivered", orderKey);
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
              return sendNotification(userId, "cancelled", orderKey);
            })
            .catch(console.error);
        } else {
          // other statuses: accepted, pending, for-delivery
          const now = Date.now(); // exact timestamp in ms

          update(ref(db, `Order/${orderKey}`), {
            status: newStatus,
            statusTimestamp: now, // <-- save exact admin update time
          })
            .then(() => sendNotification(userId, newStatus, orderKey))
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

// PAGINATION BUTTONS
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

// STATUS CONFIRMATION MODAL
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

function showFillFieldsModal() {
  fillFieldsModal.style.display = "flex";
}

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

function showDeleteConfirmPopup(message, orderKey) {
  deleteConfirmMessage.textContent = message;
  orderKeyToDelete = orderKey;
  deleteConfirmModal.style.display = "flex";
}

function showCustomerOrderPopup(message) {
  customerOrderMessage.textContent = message;
  customerOrderModal.style.display = "flex";
}

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

// ===================== USER LOGINS CHART =====================
// ===== Users =====
const loginsRef = ref(db, "Logins");

// Fetch all logins
onValue(loginsRef, (snapshot) => {
  if (snapshot.exists()) {
    const allLoginData = Object.values(snapshot.val()).filter(
      (entry) => entry.createdAt
    );

    const totalUsers = allLoginData.length;

    // Display total users
    const display = document.getElementById("loginResult");
    display.innerHTML = `
      <div class="users-total-container">
        <p class="users-total">${totalUsers}</p>
        <p class="users-text">Users</p>
      </div>
    `;
  } else {
    console.log("No login data found.");
  }
});

// ===== Orders =====
const OrderRef = ref(db, "Order"); // your orders node

onValue(OrderRef, (snapshot) => {
  if (snapshot.exists()) {
    const allOrders = Object.values(snapshot.val());
    const totalOrders = allOrders.length;

    const display = document.getElementById("orderResult");
    display.innerHTML = `
      <div class="orders-total-container">
        <p class="orders-total">${totalOrders}</p>
        <p class="orders-text">Orders</p>
      </div>
    `;
  } else {
    console.log("No orders found.");
  }
});

const ordersPerPage = 10;
let currentPage = 1;
let ordersArray = []; // store all orders for pagination

async function loadOrders() {
  const snapshot = await get(ref(db, "Order"));
  if (!snapshot.exists()) {
    ordersArray = [];
    renderPage();
    return;
  }

  ordersArray = Object.values(snapshot.val());
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const tableBody = document.querySelector("#salesReportTable tbody");
  tableBody.innerHTML = "";

  if (ordersArray.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8">No orders found.</td></tr>`;
    document.getElementById("pageInfo").textContent = "";
    return;
  }

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const pageOrders = ordersArray.slice(startIndex, endIndex);

  pageOrders.forEach((order) => {
    const dateObj = order.orderDate ? new Date(order.orderDate) : null;
    const formattedDate = dateObj
      ? dateObj.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

    if (
      order.orders &&
      Array.isArray(order.orders) &&
      order.orders.length > 0
    ) {
      order.orders.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index === 0 ? order.orderID : ""}</td>
          <td>${index === 0 ? order.name || "Unknown" : ""}</td>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>${(item.price * item.qty).toFixed(2)}</td>
          <td>${
            index === 0 ? (order.total ? order.total.toFixed(2) : "0.00") : ""
          }</td>
          <td>${index === 0 ? order.payment || "N/A" : ""}</td>
          <td>${index === 0 ? formattedDate : ""}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.orderID || "N/A"}</td>
        <td>${order.name || "Unknown"}</td>
        <td colspan="3">No items</td>
        <td>${order.total ? order.total.toFixed(2) : "0.00"}</td>
        <td>${order.payment || "N/A"}</td>
        <td>${formattedDate}</td>
      `;
      tableBody.appendChild(row);
    }
  });

  const totalPages = Math.ceil(ordersArray.length / ordersPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  // Disable/enable buttons
  document.getElementById("prevPageTable").disabled = currentPage === 1;
  document.getElementById("nextPageTable").disabled =
    currentPage === totalPages;
}

// Pagination button events
document.getElementById("prevPageTable").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

document.getElementById("nextPageTable").addEventListener("click", () => {
  const totalPages = Math.ceil(ordersArray.length / ordersPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// Initial load
loadOrders();

// ================== DATA CHART ==================
// SALES ANALYTICS CHART
const ctx = document.getElementById("dataChart");
let chart;
let currentRange = "month"; // default range
let currentType = "sales";

// ============ FETCH SALES DATA ============
async function getChartData(range, type = "sales") {
  const snapshot = await get(ref(db, "Order"));
  if (!snapshot.exists()) return { labels: [], data: [] };

  const orders = snapshot.val();
  const startDate = getStartDate(range); // day/week/month start
  const counts = {}; // { "YYYY-MM-DD": totalRevenue }

  for (const key in orders) {
    const order = orders[key];
    if (!order.orderDate || !order.orders) continue;

    const dateObj = new Date(order.orderDate);
    if (dateObj < startDate) continue;

    // group by date string
    const label = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"

    if (!counts[label]) counts[label] = 0;

    if (type === "sales") {
      // sum price * quantity of all items
      const totalSale = order.orders.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.qty),
        0
      );
      counts[label] += totalSale;
    } else if (type === "revenue") {
      counts[label] += Number(order.total) || 0;
    } else if (type === "orders") {
      counts[label] += 1;
    }
  }

  // sort dates
  const sortedLabels = Object.keys(counts).sort();
  const chartData = sortedLabels.map((d) => counts[d]);

  return { labels: sortedLabels, data: chartData };
}

// --- RENDER CHART ---
async function renderChart() {
  const res = await getChartData(currentRange, currentType);

  // Determine the label based on type
  let datasetLabel = "";
  if (currentType === "sales") datasetLabel = "Sales (₱)";
  else if (currentType === "orders") datasetLabel = "Number of Orders";
  else if (currentType === "revenue") datasetLabel = "Revenue (₱)";

  if (chart) {
    chart.data.labels = res.labels;

    // Update both datasets with the new data
    chart.data.datasets[0].data = res.data;
    chart.data.datasets[1].data = res.data;

    chart.data.datasets[0].label = datasetLabel + " (Line)";
    chart.data.datasets[1].label = datasetLabel + " (Bar)";
    chart.update();
  } else {
    chart = new Chart(ctx, {
      data: {
        labels: res.labels,
        datasets: [
          {
            type: "line",
            label: datasetLabel + " (Line)",
            data: res.data,
            borderColor: "#3b82f6",
            borderWidth: 3,
            fill: false,
          },
          {
            type: "bar",
            label: datasetLabel + " (Bar)",
            data: res.data, // same data, or you can put different
            backgroundColor: "rgba(59, 130, 246, 0.4)",
            borderColor: "#3b82f6",
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true } },
        maintainAspectRatio: false,
      },
    });
  }
}

// ========= GET START DATE ==========
function getStartDate(range) {
  const now = new Date();

  if (range === "today") return new Date(now.setHours(0, 0, 0, 0));

  if (range === "week") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
  }

  if (range === "month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return new Date(0);
}

// =========== FEEDBACK DISPLAY ===========
const feedbackRef = ref(db, "Feedbacks");
const feedbackContainer = document.getElementById("feedbackContainer");

onValue(feedbackRef, (snapshot) => {
  feedbackContainer.innerHTML = "";

  if (!snapshot.exists()) {
    feedbackContainer.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  const allFeedbacks = snapshot.val();

  Object.values(allFeedbacks).forEach(async (fb) => {
    const card = document.createElement("div");
    card.classList.add("admin-feedback-card");

    let orderNumber = fb.orderID || "N/A";
    let orderedItems = fb.foodItems
      ? fb.foodItems.join(", ")
      : "No items found"; // FIXED
    let customerName = "Unknown";

    if (fb.orderID) {
      const ordersRoot = await get(ref(db, "Order"));
      if (ordersRoot.exists()) {
        ordersRoot.forEach((orderSnap) => {
          const orderData = orderSnap.val();
          if (String(orderData.orderID) === String(fb.orderID)) {
            customerName = orderData.name || "Unknown";
            orderNumber = orderData.orderID;
          }
        });
      }
    }

    card.innerHTML = `
    <p><strong>Order ID:</strong> ${orderNumber}</p>
    <p><strong>Customer:</strong> ${customerName}</p>
    <p><strong>Ordered Items:</strong> ${orderedItems}</p>
    <p><strong>Feedback:</strong> ${fb.feedback || "No feedback"}</p>
  `;

    feedbackContainer.appendChild(card);
  });
});

// ============ BUTTON EVENTS ============
document.getElementById("btn-today").addEventListener("click", () => {
  currentRange = "today";
  renderChart();
});
document.getElementById("btn-week").addEventListener("click", () => {
  currentRange = "week";
  renderChart();
});
document.getElementById("btn-month").addEventListener("click", () => {
  currentRange = "month";
  renderChart();
});

// REFERENCES FOR ABOUT US SECTION
const aboutUsRef = ref(db, "homepage/aboutUs");
const aboutUsPreview = document.getElementById("aboutUsPreview");

onValue(aboutUsRef, (snapshot) => {
  aboutUsPreview.textContent = snapshot.exists() ? snapshot.val().content : "";
});

document.addEventListener("DOMContentLoaded", () => {
  const aboutUsModal = document.getElementById("aboutUsModal");
  const aboutUsContent = document.getElementById("aboutUsContent");
  const saveBtn = document.getElementById("aboutUs-save-btn");
  const cancelBtn = document.getElementById("aboutUs-cancel-btn");

  // Open modal manually if needed (e.g., admin button elsewhere)
  document
    .getElementById("editAboutUsBtn")
    ?.addEventListener("click", async () => {
      const snapshot = await get(aboutUsRef);
      aboutUsContent.value = snapshot.exists() ? snapshot.val().content : "";
      aboutUsModal.style.display = "flex";
    });

  saveBtn.addEventListener("click", async () => {
    const newContent = aboutUsContent.value.trim();
    if (!newContent) return alert("Please fill in the About Us text.");
    await update(aboutUsRef, { content: newContent });
    aboutUsModal.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    aboutUsModal.style.display = "none";
  });

  aboutUsModal.addEventListener("click", (e) => {
    if (e.target === aboutUsModal) aboutUsModal.style.display = "none";
  });
});

// ============ TYPE TOGGLE ============
document.getElementById("data-type").addEventListener("change", (e) => {
  currentType = e.target.value; // "sales" or "orders"
  renderChart();
});

// ============ DELETE CONFIRMATION ============

document.getElementById("cancel-delete").addEventListener("click", () => {
  document.getElementById("delete-confirm-modal").style.display = "none";
});

document.getElementById("confirm-delete").addEventListener("click", () => {
  if (!pendingDelete.section || !pendingDelete.key) return;

  remove(ref(db, `${pendingDelete.section}/${pendingDelete.key}`))
    .then(() => {
      document.getElementById("delete-confirm-modal").style.display = "none";
    })
    .catch((error) => {
      console.error("Delete failed:", error);
    });
});

// ============ INITIAL RENDER ============
renderChart();

// ========== MENU CATEGORY TOGGLE ==========
let currentCategory = "all"; // default

document.getElementById("btnAll").addEventListener("click", () => {
  currentCategory = "all";
  updateToggleUI();
  renderMenu(); // filter menuGrid items by category
});

document.getElementById("btnMain").addEventListener("click", () => {
  currentCategory = "main";
  updateToggleUI();
  renderMenu();
});

document.getElementById("btnSide").addEventListener("click", () => {
  currentCategory = "side";
  updateToggleUI();
  renderMenu();
});

function getCategoryName(category) {
  switch (category) {
    case "main":
      return "Main Dish";
    case "side":
      return "Side Dish";
    default:
      return category; // fallback, e.g., "all"
  }
}

function updateToggleUI() {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const label = document.getElementById("menuCategoryLabel");

  switch (currentCategory) {
    case "all":
      document.getElementById("btnAll").classList.add("active");
      label.textContent = "All Dishes";
      break;
    case "main":
      document.getElementById("btnMain").classList.add("active");
      label.textContent = "Main Dish"; // Friendly name
      break;
    case "side":
      document.getElementById("btnSide").classList.add("active");
      label.textContent = "Side Dish"; // Friendly name
      break;
  }
}
