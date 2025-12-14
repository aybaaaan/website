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
let filteredOrders = [];

async function loadOrders() {
  const snapshot = await get(ref(db, "Order"));
  if (!snapshot.exists()) {
    ordersArray = [];
    renderPage();
    return;
  }

  ordersArray = Object.values(snapshot.val());
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
  const table = document.getElementById("salesReportTable");

  // Convert the table to a worksheet
  const worksheet = XLSX.utils.table_to_sheet(table);

  // Create a workbook and append the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Report");

  // Save the Excel file
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
