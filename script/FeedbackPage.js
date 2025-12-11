// ===================== Firebase Imports =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// ===================== Firebase Config =====================
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

// ===================== Utility Function =====================
async function getOrderData(orderID) {
  const ordersRef = ref(db, "Order");
  const snapshot = await get(ordersRef);

  if (!snapshot.exists()) throw new Error("No orders in database.");

  let foundOrder = null;

  snapshot.forEach((childSnap) => {
    const order = childSnap.val();
    // Convert both to string to ensure comparison works
    if (String(order.orderID) === String(orderID)) {
      foundOrder = order;
    }
  });

  if (!foundOrder) throw new Error("Order not found in database.");

  return foundOrder;
}

document.addEventListener("DOMContentLoaded", () => {
  const feedbackText = document.getElementById("feedbackText");
  const feedbackItemNameEl = document.getElementById("feedbackItemName");
  const submitBtn = document.getElementById("submitFeedback");
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackOkBtn = document.getElementById("feedbackOkBtn");

  // ===================== NEW: STAR ELEMENTS =====================
  const stars = document.querySelectorAll(".star");
  let currentRating = 0;

  // ===================== GET URL PARAMETERS =====================
  const urlParams = new URLSearchParams(window.location.search);
  const itemName = urlParams.get("item") || "Unknown Item";
  const orderID = urlParams.get("orderID"); // Important to link order

  // ===================== Hamburger Icon =====================
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Display item name in UI
  feedbackItemNameEl.textContent = itemName;

  // ===================== NEW: STAR CLICK LOGIC =====================
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      // Get value (1-5)
      currentRating = parseInt(star.getAttribute("data-value"));
      
      // Update Colors
      stars.forEach((s, index) => {
        if (index < currentRating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });

  // ===================== SUBMIT FEEDBACK =====================
  submitBtn.addEventListener("click", async () => {
    const text = feedbackText.value.trim();

    // NEW: Check if rating is selected
    if (currentRating === 0) {
      feedbackMessage.textContent = "Please select a star rating.";
      feedbackMessage.style.color = "red";
      feedbackModal.style.display = "flex";
      return;
    }

    if (!text) {
      feedbackMessage.textContent =
        "Please write your feedback before submitting.";
      feedbackMessage.style.color = "red";
      feedbackModal.style.display = "flex";
      return;
    }

    if (!orderID) {
      feedbackMessage.textContent = "Order ID missing. Cannot submit feedback.";
      feedbackMessage.style.color = "red";
      feedbackModal.style.display = "flex";
      return;
    }

    try {
      // ---------------- FETCH ORDER DATA ----------------
      const orderRef = ref(db, "Order");
      const snapshot = await get(orderRef);

      if (!snapshot.exists()) throw new Error("No orders in database.");

      let orderData = null;
      snapshot.forEach((child) => {
        if (String(child.val().orderID) === String(orderID)) {
          orderData = child.val();
        }
      });

      if (!orderData) throw new Error("Order data not found");

      const customerName = orderData.name || "Unknown Customer";
      const foodItems = orderData.orders
        ? Object.values(orderData.orders).map((i) => i.name)
        : ["Unknown Items"];

      // ---------------- SAVE FEEDBACK ----------------
      const newFeedbackRef = push(ref(db, "Feedbacks"));
      await set(newFeedbackRef, {
        orderID: orderID,
        customerName: customerName,
        itemName: itemName,
        feedback: text,
        rating: currentRating, // NEW: Added rating here
        timestamp: new Date().toLocaleString(),
        foodItems: foodItems,
      });

      feedbackMessage.textContent =
        "Thank you! Your feedback has been submitted.";
      feedbackMessage.style.color = "green";
      feedbackText.value = "";
      
      // NEW: Reset Stars
      currentRating = 0;
      stars.forEach(s => s.classList.remove("active"));

    } catch (error) {
      feedbackMessage.textContent =
        "Error submitting feedback: " + error.message;
      feedbackMessage.style.color = "red";
    }

    feedbackModal.style.display = "flex";
  });

  // ===================== CLOSE MODAL =====================
  feedbackOkBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
  });
});