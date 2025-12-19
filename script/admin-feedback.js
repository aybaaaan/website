console.log("🔥 admin.js loaded");

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
  databaseURL: "https://mediterranean-in-velvet-10913-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-10913",
  storageBucket: "mediterranean-in-velvet-10913.firebasestorage.app",
  messagingSenderId: "478608649838",
  appId: "1:478608649838:web:cbe6ed90b718037244c07f",
  measurementId: "G-T9TT5N8NJX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// =========== FEEDBACK DISPLAY ===========
const feedbackRef = ref(db, "Feedbacks");
const feedbackContainer = document.getElementById("feedbackContainer");

// Variables for Feedback Pagination
const feedbackPerPage = 5;
let currentFeedbackPage = 1;

let selectedRating = "all";
let filteredFeedbacks = [];

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

  allFeedbacks.sort((a, b) => {
    const ratingA = Number(a.rating) || 0;
    const ratingB = Number(b.rating) || 0;
    return ratingB - ratingA;
  });

  filteredFeedbacks = [...allFeedbacks]; // 👈 INITIALIZE
  currentFeedbackPage = 1;
  renderFeedbackPage();
});

function applyRatingFilter() {
  if (selectedRating === "all") {
    filteredFeedbacks = [...allFeedbacks];
  } else {
    filteredFeedbacks = allFeedbacks.filter(
      (fb) => Number(fb.rating || 0) === Number(selectedRating)
    );
  }

  currentFeedbackPage = 1;
  renderFeedbackPage();

  console.log("Selected rating:", selectedRating);
  console.log("Filtered count:", filteredFeedbacks.length);
}

// Render Function
async function renderFeedbackPage() {
  feedbackContainer.innerHTML = "";

  if (filteredFeedbacks.length === 0) {
    feedbackContainer.innerHTML = "<p>No feedback found.</p>";
    return;
  }

  const startIndex = (currentFeedbackPage - 1) * feedbackPerPage;
  const endIndex = startIndex + feedbackPerPage;
  const pageItems = filteredFeedbacks.slice(startIndex, endIndex);

  // Loop through visible items
  for (const fb of pageItems) {
    const card = document.createElement("div");
    card.classList.add("admin-feedback-card");

    let orderNumber = fb.orderID || "N/A";
    let orderedItems = fb.foodItems
      ? fb.foodItems.join(", ")
      : "No items found";
    let customerName = fb.customerName || "Unknown";

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
  const totalPages = Math.ceil(filteredFeedbacks.length / feedbackPerPage);
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
  const totalPages = Math.ceil(filteredFeedbacks.length / feedbackPerPage);
  if (currentFeedbackPage < totalPages) {
    currentFeedbackPage++;
    renderFeedbackPage();
  }
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".rating-btn");
  if (!btn) return;

  selectedRating = btn.dataset.rating;

  document
    .querySelectorAll(".rating-btn")
    .forEach((b) => b.classList.remove("active"));

  btn.classList.add("active");

  applyRatingFilter();
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
