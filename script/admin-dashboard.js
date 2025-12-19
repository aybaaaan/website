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
const OrderRef = ref(db, "Order");
const OrderHistoryRef = ref(db, "OrderHistory");

function updateTotalOrders() {
  let total = 0;

  onValue(OrderRef, (snap) => {
    total += snap.exists() ? Object.values(snap.val()).length : 0;

    onValue(OrderHistoryRef, (histSnap) => {
      total += histSnap.exists() ? Object.values(histSnap.val()).length : 0;

      document.getElementById("orderResult").innerHTML = `
        <div class="orders-total-container">
          <p class="orders-total">${total}</p>
          <p class="orders-text">Orders</p>
        </div>
      `;
    });
  });
}

updateTotalOrders();

const ordersPerPage = 10;
let currentPage = 1;
let ordersArray = []; // store all orders for pagination
let filteredOrders = [];

async function loadOrders() {
  const [orderSnap, historySnap] = await Promise.all([
    get(ref(db, "Order")),
    get(ref(db, "OrderHistory")),
  ]);

  const activeOrders = orderSnap.exists() ? Object.values(orderSnap.val()) : [];

  const archivedOrders = historySnap.exists()
    ? Object.values(historySnap.val())
    : [];

  // 🔥 MERGE BOTH
  ordersArray = [...activeOrders, ...archivedOrders];

  filteredOrders = [...ordersArray];
  currentPage = 1;
  renderPage();
}

function renderPage() {
  const tableBody = document.querySelector("#salesReportTable tbody");
  tableBody.innerHTML = "";

  if (filteredOrders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8">No orders found.</td></tr>`;
    document.getElementById("pageInfo").textContent = "";
    return;
  }

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const pageOrders = filteredOrders.slice(startIndex, endIndex);

  pageOrders.forEach((order) => {
    const dateObj = order.orderDate ? new Date(order.orderDate) : null;
    const formattedDate = dateObj
      ? dateObj.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";

    const items = Array.isArray(order.orders) ? order.orders : [];

    // ✅ total qty & total amount FIX
    const totalQty = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);
    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
      0
    );

    const row = document.createElement("tr");

    row.innerHTML = `
    <td>${order.orderID || "N/A"}</td>

    <!-- 👇 hyperlink-style customer -->
    <td>
      <a href="#" 
         class="customer-link"
         data-order='${JSON.stringify(order).replace(/'/g, "&apos;")}'>
         ${order.name || "Unknown"}
      </a>
    </td>

    <!-- 👇 dropdown food items -->
    <td>
      <details>
        <summary>${items.length} item(s)</summary>
        <ul class="food-list">
          ${items
            .map(
              (i) =>
                `<li>${i.name} × ${i.qty} — ₱${(i.price * i.qty).toFixed(
                  2
                )}</li>`
            )
            .join("")}
        </ul>
      </details>
    </td>

    <td>${totalQty}</td>
    <td>${totalAmount.toFixed(2)}</td>
    <td>${order.total ? order.total.toFixed(2) : totalAmount.toFixed(2)}</td>
    <td>${order.payment || "N/A"}</td>
    <td>${formattedDate}</td>
  `;

    tableBody.appendChild(row);
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  document.getElementById(
    "pageInfo"
  ).textContent = `Page ${currentPage} of ${totalPages}`;

  // Disable/enable buttons
  document.getElementById("prevPageTable").disabled = currentPage === 1;
  document.getElementById("nextPageTable").disabled =
    currentPage === totalPages;
}

function applyDateFilter() {
  const fromVal = document.getElementById("dateFrom").value;
  const toVal = document.getElementById("dateTo").value;

  filteredOrders = ordersArray.filter((order) => {
    if (!order.orderDate) return false;

    const d = new Date(order.orderDate);

    // Normalize order date (LOCAL, date-only)
    const orderDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (fromVal) {
      const [fy, fm, fd] = fromVal.split("-").map(Number);
      const from = new Date(fy, fm - 1, fd); // ✅ LOCAL date
      if (orderDay < from) return false;
    }

    if (toVal) {
      const [ty, tm, td] = toVal.split("-").map(Number);
      const to = new Date(ty, tm - 1, td); // ✅ LOCAL date
      if (orderDay > to) return false;
    }

    return true;
  });

  currentPage = 1;
  renderPage();
}

document.getElementById("dateFrom").addEventListener("change", applyDateFilter);
document.getElementById("dateTo").addEventListener("change", applyDateFilter);

document.getElementById("resetDateFilter").addEventListener("click", () => {
  document.getElementById("dateFrom").value = "";
  document.getElementById("dateTo").value = "";
  filteredOrders = [...ordersArray];
  currentPage = 1;
  renderPage();
});

// Pagination button events
document.getElementById("prevPageTable").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderPage();
  }
});

document.getElementById("nextPageTable").addEventListener("click", () => {
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderPage();
  }
});

// load for the table
loadOrders();

// EXPORT TO EXCEL PART
document.getElementById("exportExcelBtn").addEventListener("click", () => {
  const data = [];

  filteredOrders.forEach((order) => {
    const dateObj = order.orderDate ? new Date(order.orderDate) : null;
    const formattedDate = dateObj ? dateObj.toLocaleDateString("en-PH") : "N/A";

    (order.orders || []).forEach((item) => {
      data.push({
        "Order ID": order.orderID || "N/A",
        Customer: order.name || "Unknown",
        Food: item.name,
        Qty: item.qty,
        "Item Total (₱)": (item.price * item.qty).toFixed(2),
        "Order Total (₱)": order.total || "",
        "Payment Method": order.payment || "N/A",
        "Order Date": formattedDate,
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  XLSX.writeFile(workbook, "sales_report.xlsx");
});

// ================== DATA CHART ==================
// SALES ANALYTICS CHART
const ctx = document.getElementById("dataChart");
let chart;
let currentRange = "month"; // default range
let currentType = "sales";

// ============ FETCH SALES DATA ============
async function getChartData(range, type = "sales") {
  const [orderSnap, historySnap] = await Promise.all([
    get(ref(db, "Order")),
    get(ref(db, "OrderHistory")),
  ]);

  const orders = {
    ...(orderSnap.exists() ? orderSnap.val() : {}),
    ...(historySnap.exists() ? historySnap.val() : {}),
  };

  const startDate = getStartDate(range);
  const counts = {};

  for (const key in orders) {
    const order = orders[key];
    if (!order.orderDate || !order.orders) continue;

    const dateObj = new Date(order.orderDate);
    if (dateObj < startDate) continue;

    const label = dateObj.toISOString().split("T")[0];
    if (!counts[label]) counts[label] = 0;

    if (type === "sales") {
      counts[label] += order.orders.reduce(
        (s, i) => s + Number(i.price) * Number(i.qty),
        0
      );
    } else if (type === "revenue") {
      counts[label] += Number(order.total) || 0;
    } else if (type === "orders") {
      counts[label] += 1;
    }
  }

  const labels = Object.keys(counts).sort();
  return { labels, data: labels.map((l) => counts[l]) };
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

const modal = document.getElementById("orderModal");
const modalBody = document.getElementById("orderModalBody");

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("customer-link")) {
    e.preventDefault();

    const order = JSON.parse(e.target.dataset.order);
    modalBody.innerHTML = "";

    // ===== ORDER ID =====
    document.getElementById("modalOrderID").textContent =
      order.orderID || "N/A";

    // ===== ORDER ITEMS =====
    (order.orders || []).forEach((item) => {
      const tr = document.createElement("tr");
      const subtotal = Number(item.price) * Number(item.qty);

      tr.innerHTML = `
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td class="modal-subtotal">₱${subtotal.toFixed(2)}</td>
      `;
      modalBody.appendChild(tr);
    });

    // ===== ORDER SUMMARY =====
    const total = order.total
      ? Number(order.total)
      : (order.orders || []).reduce(
          (sum, i) => sum + Number(i.price) * Number(i.qty),
          0
        );

    document.getElementById("modalTotal").textContent = total.toFixed(2);
    document.getElementById("modalPayment").textContent =
      order.payment || "N/A";

    const dateObj = order.orderDate ? new Date(order.orderDate) : null;
    document.getElementById("modalDate").textContent = dateObj
      ? dateObj.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "N/A";

    modal.style.display = "block";
  }
});

document.getElementById("closeOrderModal").addEventListener("click", () => {
  modal.style.display = "none";
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

// ============ INITIAL RENDER ============
renderChart();
