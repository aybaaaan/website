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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========== FEEDBACK DISPLAY ===========
const feedbackRef = ref(db, "Feedbacks");
const feedbackContainer = document.getElementById("feedbackContainer");

// Variables for Feedback Pagination
const feedbackPerPage = 5;
let currentFeedbackPage = 1;
let allFeedbacks = [];

// Fetch Feedbacks
onValue(feedbackRef, (snapshot) => {
  allFeedbacks = []; // Reset array

  if (!snapshot.exists()) {
    feedbackContainer.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  const rawData = snapshot.val();
  allFeedbacks = Object.values(rawData);

  // Optionally sort by something if available, e.g. timestamp?
  // allFeedbacks.sort((a, b) => b.timestamp - a.timestamp);

  // Reset to first page on new data load
  currentFeedbackPage = 1;
  renderFeedbackPage();
});

// Render Function
async function renderFeedbackPage() {
  feedbackContainer.innerHTML = "";

  if (allFeedbacks.length === 0) {
    feedbackContainer.innerHTML = "<p>No feedback yet.</p>";
    return;
  }

  // Calculate slice indices
  const startIndex = (currentFeedbackPage - 1) * feedbackPerPage;
  const endIndex = startIndex + feedbackPerPage;
  const pageItems = allFeedbacks.slice(startIndex, endIndex);

  // Loop through visible items
  for (const fb of pageItems) {
    const card = document.createElement("div");
    card.classList.add("admin-feedback-card");

    let orderNumber = fb.orderID || "N/A";
    let orderedItems = fb.foodItems
      ? fb.foodItems.join(", ")
      : "No items found";
    let customerName = "Unknown";

    // Only fetch customer name if we have an Order ID
    if (fb.orderID) {
      try {
        // Optimization: Fetch only specific order if possible,
        // but current structure suggests fetching all orders is the pattern.
        // To save bandwidth, we check locally if we have ordersArray loaded, otherwise fetch.
        // Assuming orders are small enough or fetched elsewhere:
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
      } catch (err) {
        console.error("Error fetching order details for feedback:", err);
      }
    }

    //  START OF ADDED CODE FOR STAR RATING
    let starHtml = "";
    const rating = fb.rating || 0;
    // Generate 5 stars
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        // Filled Gold Star
        starHtml +=
          '<span style="color: #ffc107; font-size: 20px;">&#9733;</span>';
      } else {
        // Empty Grey Star
        starHtml +=
          '<span style="color: #ccc; font-size: 20px;">&#9733;</span>';
      }
    }
    //  END OF ADDED CODE FOR STAR RATING

    card.innerHTML = `
      <p><strong>Order ID:</strong> ${orderNumber}</p>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Rating:</strong> ${starHtml} <small>(${rating}/5)</small></p> <p><strong>Ordered Items:</strong> ${orderedItems}</p>
      <p><strong>Feedback:</strong> ${fb.feedback || "No feedback"}</p>
    `;

    feedbackContainer.appendChild(card);
  }

  // Update Pagination Controls
  const totalPages = Math.ceil(allFeedbacks.length / feedbackPerPage);
  document.getElementById(
    "feedbackPageInfo"
  ).textContent = `Page ${currentFeedbackPage} of ${totalPages}`;

  document.getElementById("prevPageFeedback").disabled =
    currentFeedbackPage === 1;
  document.getElementById("nextPageFeedback").disabled =
    currentFeedbackPage >= totalPages;
}

// Pagination Button Listeners
document.getElementById("prevPageFeedback").addEventListener("click", () => {
  if (currentFeedbackPage > 1) {
    currentFeedbackPage--;
    renderFeedbackPage();
  }
});

document.getElementById("nextPageFeedback").addEventListener("click", () => {
  const totalPages = Math.ceil(allFeedbacks.length / feedbackPerPage);
  if (currentFeedbackPage < totalPages) {
    currentFeedbackPage++;
    renderFeedbackPage();
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

// REFERENCES FOR ABOUT US SECTION
const aboutUsRef = ref(db, "aboutUs");
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
// default
let currentCategory = "main";

document.getElementById("btnMain").addEventListener("click", () => {
  currentCategory = "main";
  updateToggleUI();
  renderMenu();
});

document.getElementById("btnSide").addEventListener("click", () => {
  currentCategory = "side";
  updateToggleUI();
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
