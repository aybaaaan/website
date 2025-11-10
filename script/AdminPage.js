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
const firestore = getFirestore(app);

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
window.deleteItem = (section, key) => remove(ref(db, `${section}/${key}`));

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
      <div class="order-details">
        <h3>${data.name || "Unknown"}</h3>
        <p><strong>Address:</strong> ${data.address || "N/A"}</p>
        <p><strong>Contact:</strong> ${data.contact || "N/A"}</p>
        <p><strong>Payment Method:</strong> ${data.payment || "N/A"}</p>
        <p><strong>Order Date and Time:</strong> ${data.orderDate}, ${
      data.orderTime
    }</p>

        <div class="food-section">
          <button class="food-toggle">Order Details ▼</button>
          <div class="order-food-list">
            <ul>${foodListHTML}</ul>
          </div>
        </div>

        <p><strong>Total:</strong> ₱${
          data.total ? data.total.toFixed(2) : "0.00"
        }</p>
        <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
        <p><strong>Delivery Time:</strong> ${deliveryTime}</p>
      </div>

      <div class="order-actions">
        <button class="btn-confirm">Confirm</button>
        <button class="btn-delete">Delete</button>
      </div>
    `;

    const foodToggle = row.querySelector(".food-toggle");
    const foodList = row.querySelector(".order-food-list");
    foodToggle.addEventListener("click", () => {
      foodList.classList.toggle("active");
      foodToggle.textContent = foodList.classList.contains("active")
        ? "Order Details ▲"
        : "Order Details ▼";
    });

    row.querySelector(".btn-confirm").addEventListener("click", () => {
      showCustomerOrderPopup(`Order for ${data.name} marked as confirmed!`);
    });

    row.querySelector(".btn-delete").addEventListener("click", () => {
      showDeleteConfirmPopup(
        `Are you sure you want to delete the order for ${data.name}?`,
        child.key
      );
    });

    ordersContainer.appendChild(row);
  });
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

function showCustomerOrderPopup(message) {
  customerOrderMessage.textContent = message;
  customerOrderModal.style.display = "flex";
}

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
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  },
});

// ====== no fetch user logins data from Firestore yet ======

// ================== DATA CHART ==================
// SALES ANALYTICS CHART
const ctx = document.getElementById("dataChart");
let chart;
let currentRange = "month"; // default range
let currentType = "sales";

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
    chart.data.datasets[0].data = res.data;
    chart.data.datasets[0].label = datasetLabel;
    chart.update();
  } else {
    chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: res.labels,
        datasets: [
          {
            label: datasetLabel,
            data: res.data,
            backgroundColor: "#3b82f6",
            borderWidth: 1,
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

// ============ INITIAL RENDER ============
renderChart();
