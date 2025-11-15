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

// FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
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

  if (!base64Image || !name || !desc || (currentSection === "menu" && !price)) {
    showFillFieldsModal();
    return;
  }

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  if (editKey) {
    update(ref(db, `${currentSection}/${editKey}`), {
      url: base64Image,
      name,
      desc,
      price,
    });
  } else {
    push(sectionRef, { url: base64Image, name, desc, price });
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
        // Show price for menu items
        details.innerHTML = `
    <p class="item-name">${item.name}</p>
    <p class="item-desc">${item.desc}</p>
    <p class="item-price">₱${item.price || 0}</p>
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

      const buttonsDiv = document.createElement("div");
      buttonsDiv.classList.add("buttons");
      buttonsDiv.innerHTML = `
        <button class="btn-edit" onclick="editItem('${refPath.key}','${key}','${
        item.url
      }','${item.name}','${item.desc}','${item.price || 0}')">Edit</button>
        <button class="btn-delete" onclick="deleteItem('${
          refPath.key
        }','${key}')">Delete</button>
      `;

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
  ordersContainer.innerHTML = "";
  snapshot.forEach((child) => {
    const data = child.val();

    // ==================== FORMAT DATE AND TIME =======================
    // get delivery date and time
    const deliveryDate = data.deliveryDate || "N/A"; // ✅ added
    let deliveryTime = "N/A";
    if (data.deliveryTime) {
      // 12-hour format with AM/PM
      const [hour, minute] = data.deliveryTime.split(":").map(Number);
      const dateObj = new Date();
      dateObj.setHours(hour, minute);
      deliveryTime = dateObj.toLocaleTimeString("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    // get order date and time
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

    const row = document.createElement("div");
    row.classList.add("order-card");

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

    row.innerHTML = `
  <div class="order-card-left">
    <h2>${data.name || "Unknown"}</h2>
    <p><strong>Address:</strong> ${data.address || "N/A"}</p>
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

  <div class="order-card-right">
    <p><strong>Total:</strong> <span class="total-amount">₱${
      data.total ? data.total.toFixed(2) : "0.00"
    }</span></p>
    <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
    <p><strong>Delivery Time:</strong> ${deliveryTime}</p>

    <div class="order-actions">
      <label class="status-label" for="order-status">Status:</label>
      <select class="order-status-dropdown">
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

    const statusDropdown = row.querySelector(".order-status-dropdown");

    const setTextColor = () => {
      switch (statusDropdown.value) {
        case "for-delivery":
          statusDropdown.style.color = "green";
          break;
        case "cancelled":
          statusDropdown.style.color = "#cc3232";
          break;
        case "pending":
          statusDropdown.style.color = "grey";
          break;
        case "delivered":
          statusDropdown.style.color = "#a64d79";
          break;
        default:
          statusDropdown.style.color = "#000";
      }
    };

    // Initial color
    setTextColor();

    statusDropdown.addEventListener("change", () => {
      const newStatus = statusDropdown.value;
      const orderKey = child.key;
      const userId = child.val().userId;
      const orderCard = row;

      const getMessage = (status) => {
        switch (status.toLowerCase()) {
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
          // revert dropdown to previous value
          statusDropdown.value = data.status || "pending";
          setTextColor();
          return;
        }

        // proceed with action
        setTextColor();

        if (!userId)
          return console.error("No userId found, cannot send notification");

        if (newStatus.toLowerCase() === "cancelled") {
          // Remove from DB
          remove(ref(db, `Order/${orderKey}`))
            .then(() => {
              orderCard.remove();
              console.log("Order cancelled and removed from DB");
              return sendNotification(userId, newStatus, orderKey);
            })
            .catch((err) => console.error(err));
        } else if (newStatus.toLowerCase() === "delivered") {
          // Remove from view only
          orderCard.remove();
          sendNotification(userId, newStatus, orderKey)
            .then(() => console.log("Delivered notification sent!"))
            .catch((err) => console.error(err));
        } else {
          // Normal status update
          update(ref(db, `Order/${orderKey}`), { status: newStatus })
            .then(() => sendNotification(userId, newStatus, orderKey))
            .then(() => console.log("Status updated and notification sent"))
            .catch((err) => console.error(err));
        }
      });
    });

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

// GLOBAL NOTIFICATION FUNCTION (fixed)
function sendNotification(userId, status, orderKey) {
  if (!userId) {
    console.error("❌ Cannot send notification — missing userId.");
    return;
  }

  // Normalize status (capitalize first letter)
  const formattedStatus = status
    .toLowerCase()
    .replace(/(^\w|\s\w)/g, (c) => c.toUpperCase());

  const notifRef = ref(db, `notifications/${userId}`);

  let message = "";
  switch (formattedStatus) {
    case "Pending":
      message = "Your order is now pending confirmation.";
      break;
    case "For-Delivery":
    case "For Delivery":
      message = "Your order is now on its way!";
      break;
    case "Cancelled":
      message = "Your order has been cancelled.";
      break;
    case "Delivered":
      message = "Your order has been delivered successfully!";
      break;
    default:
      message = "Your order status has been updated.";
  }

  const notificationData = {
    orderId: orderKey,
    status: formattedStatus,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  return push(notifRef, notificationData)
    .then(() =>
      console.log(`✔ Notification saved under notifications/${userId}`)
    )
    .catch((error) => console.error("❌ Error sending notification:", error));
}

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

const loginsRef = ref(db, "Logins");

// ===== RANGE HANDLER =====
function getStartDate(range) {
  const now = new Date();
  if (range === "today") return new Date(now.setHours(0, 0, 0, 0));
  if (range === "week")
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );
  if (range === "month") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(0);
}

// ===== FETCH DATA AND UPDATE CHART =====
onValue(loginsRef, (snapshot) => {
  if (snapshot.exists()) {
    const data = snapshot.val();
    const labels = [];
    const counts = [];
    const dateCounts = {};

    Object.values(data).forEach((entry) => {
      if (entry.createdAt) {
        const rawDate = new Date(entry.createdAt);
        const formattedDate = rawDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        dateCounts[formattedDate] = (dateCounts[formattedDate] || 0) + 1;
      }
    });

    // Prepare data for chart
    for (const date in dateCounts) {
      labels.push(date);
      counts.push(dateCounts[date]);
    }

    // Update chart
    usersChart.data.labels = labels;
    usersChart.data.datasets[0].data = counts;
    usersChart.update();
  } else {
    console.log("No login data found.");
  }
});

// ====== CHART CONFIG ======
const userChart = document.getElementById("usersChart").getContext("2d");
let usersChart = new Chart(userChart, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "User Logins",
        data: [],
        backgroundColor: "#4CAF50",
      },
    ],
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  },
});

// ================== BUTTON EVENTS ==================
document.getElementById("btn-logins-today").addEventListener("click", () => {
  currentLoginRange = "today";
  renderLoginChart("today");
});

document.getElementById("btn-logins-week").addEventListener("click", () => {
  currentLoginRange = "week";
  renderLoginChart("week");
});

document.getElementById("btn-logins-month").addEventListener("click", () => {
  currentLoginRange = "month";
  renderLoginChart("month");
});

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
  const startDate = getStartDate(range);
  const counts = {};

  if (type === "sales") {
    // Revenue per individual order
    const labels = [];
    const data = [];
    for (const key in orders) {
      const order = orders[key];
      if (!order.orderID || !order.total) continue;

      const date = new Date(order.orderDate);
      if (date >= startDate) {
        labels.push(order.orderID); // each order as a label
        data.push(Number(order.total)); // revenue for that order
      }
    }
    return { labels, data };
  } else {
    // Existing logic for sales (total per day) or orders count
    for (const key in orders) {
      const order = orders[key];
      if (!order.orderDate) continue;

      const date = new Date(order.orderDate);
      if (date >= startDate) {
        const label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (type === "revenue") {
          if (!order.total) continue;
          counts[label] = (counts[label] || 0) + Number(order.total);
        } else if (type === "orders") {
          counts[label] = (counts[label] || 0) + 1;
        }
      }
    }
    return { labels: Object.keys(counts), data: Object.values(counts) };
  }
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

// =========== FEEDBACK DISPLAY ===========
const feedbackRef = ref(db, "Feedbacks");
const feedbackContainer = document.getElementById("feedbackContainer");

onValue(feedbackRef, (snapshot) => {
  feedbackContainer.innerHTML = ""; // clear before adding

  if (!snapshot.exists()) {
    feedbackContainer.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  const allFeedbacks = snapshot.val();
  const grouped = {};

  // Group by item
  Object.values(allFeedbacks).forEach((fb) => {
    const itemName = fb.item || "Unknown Item";
    if (!grouped[itemName]) grouped[itemName] = [];
    grouped[itemName].push(fb);
  });

  // Render feedbacks per item
  for (const item in grouped) {
    const feedbackCard = document.createElement("div");
    feedbackCard.classList.add("feedback-card");

    let feedbackListHTML = "";
    grouped[item].forEach((fb, index) => {
      feedbackListHTML += `<li>${fb.feedback} <small>(${fb.timestamp})</small></li>`;
    });

    feedbackCard.innerHTML = `
      <h4>${item}</h4>
      <button class="feedback-toggle">Show Feedbacks ▼</button>
      <div class="feedback-list">
        <ul>${feedbackListHTML}</ul>
      </div>
    `;

    // Toggle button
    const toggleBtn = feedbackCard.querySelector(".feedback-toggle");
    const listDiv = feedbackCard.querySelector(".feedback-list");
    listDiv.style.display = "none";

    toggleBtn.addEventListener("click", () => {
      if (listDiv.style.display === "none") {
        listDiv.style.display = "block";
        toggleBtn.textContent = "Hide Feedbacks ▲";
      } else {
        listDiv.style.display = "none";
        toggleBtn.textContent = "Show Feedbacks ▼";
      }
    });

    feedbackContainer.appendChild(feedbackCard);
  }
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
