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
  databaseURL: "https://mediterranean-in-velvet-10913-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-10913",
  storageBucket: "mediterranean-in-velvet-10913.firebasestorage.app",
  messagingSenderId: "478608649838",
  appId: "1:478608649838:web:cbe6ed90b718037244c07f",
  measurementId: "G-T9TT5N8NJX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ===================== DOM ELEMENTS =====================
document.addEventListener("DOMContentLoaded", () => {
  const feedbackText = document.getElementById("feedbackText");
  const feedbackItemNameEl = document.getElementById("feedbackItemName");
  const submitBtn = document.getElementById("submitFeedback");
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackOkBtn = document.getElementById("feedbackOkBtn");
  const stars = document.querySelectorAll(".star");
  let currentRating = 0;

  // ===================== URL PARAMETERS =====================
  const urlParams = new URLSearchParams(window.location.search);
  const itemName = urlParams.get("item") || "Unknown Item";
  const orderID = urlParams.get("orderID");
  const mode = urlParams.get("mode") || "new";

  feedbackItemNameEl.textContent = itemName;

  // ===================== STAR LOGIC =====================
  stars.forEach((star) => {
    star.addEventListener("click", () => {
      currentRating = parseInt(star.getAttribute("data-value"));
      stars.forEach((s, index) => {
        if (index < currentRating) s.classList.add("active");
        else s.classList.remove("active");
      });
    });
  });

  // ===================== LOAD EXISTING FEEDBACK IF EDIT =====================
  if (mode === "edit" && orderID) {
    (async () => {
      try {
        const feedbackRef = ref(db, "Feedbacks");
        const snapshot = await get(feedbackRef);

        if (!snapshot.exists()) return;

        snapshot.forEach((child) => {
          const fb = child.val();
          if (String(fb.orderID) === String(orderID)) {
            feedbackText.value = fb.feedback || "";
            currentRating = fb.rating || 0;

            stars.forEach((s, index) => {
              if (index < currentRating) s.classList.add("active");
              else s.classList.remove("active");
            });
          }
        });
      } catch (error) {
        console.error("Error fetching existing feedback:", error);
      }
    })();
  }

  // ===================== SUBMIT FEEDBACK =====================
  submitBtn.addEventListener("click", async () => {
    const text = feedbackText.value.trim();

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
      const orderRef = ref(db, "OrderHistory");
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

      // Check if feedback exists
      const feedbackRef = ref(db, "Feedbacks");
      const snapshotFb = await get(feedbackRef);
      let existingKey = null;

      snapshotFb.forEach((child) => {
        const fb = child.val();
        if (String(fb.orderID) === String(orderID)) {
          existingKey = child.key;
        }
      });

      if (existingKey) {
        // UPDATE
        await set(ref(db, `Feedbacks/${existingKey}`), {
          orderID,
          customerName,
          itemName,
          feedback: text,
          rating: currentRating,
          timestamp: new Date().toLocaleString(),
          foodItems,
        });
        feedbackMessage.textContent = "Your feedback has been updated!";
      } else {
        // NEW
        const newFeedbackRef = push(ref(db, "Feedbacks"));
        await set(newFeedbackRef, {
          orderID,
          customerName,
          itemName,
          feedback: text,
          rating: currentRating,
          timestamp: new Date().toLocaleString(),
          foodItems,
        });
        feedbackMessage.textContent =
          "Thank you! Your feedback has been submitted.";
      }

      feedbackMessage.style.color = "green";
      feedbackText.value = "";
      currentRating = 0;
      stars.forEach((s) => s.classList.remove("active"));
    } catch (error) {
      feedbackMessage.textContent =
        "Error submitting feedback: " + error.message;
      feedbackMessage.style.color = "red";
    }

    feedbackModal.style.display = "flex";

    feedbackOkBtn.onclick = () => {
      feedbackModal.style.display = "none";
      window.location.href = "../pages/HistoryPage.html";
    };
  });

  // ===================== CLOSE MODAL =====================
  feedbackOkBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
  });
});
