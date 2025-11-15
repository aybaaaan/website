// ===================== Firebase Imports =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

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

// ===================== DOM Elements =====================
document.addEventListener("DOMContentLoaded", () => {
  const feedbackText = document.getElementById("feedbackText");
  const itemNameEl = document.querySelector(".feedback-card p strong");
  const submitBtn = document.getElementById("submitFeedback");
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackMessage = document.getElementById("feedbackMessage");
  const feedbackOkBtn = document.getElementById("feedbackOkBtn");

  // ===================== Get URL Parameters =====================
  const urlParams = new URLSearchParams(window.location.search);
  const itemName = urlParams.get("item") || "Unknown Item";
  itemNameEl.textContent = `Item Name: ${itemName}`;

  // ===================== Submit Feedback =====================
  submitBtn.addEventListener("click", () => {
    const text = feedbackText.value.trim();

    if (!text) {
      feedbackMessage.textContent =
        "Please write your feedback before submitting.";
      feedbackMessage.style.color = "red";
      feedbackModal.style.display = "flex";
      return;
    }

    // Generate readable timestamp
    const now = new Date();
    const formattedTime = now.toLocaleString(); // example: "11/15/2025, 12:34:56 AM"

    // Store feedback sa Firebase
    const feedbackRef = ref(db, "Feedbacks");
    const newFeedbackRef = push(feedbackRef);

    set(newFeedbackRef, {
      item: itemName,
      feedback: text,
      timestamp: formattedTime,
    })
      .then(() => {
        feedbackMessage.textContent =
          "Thank you! Your feedback has been submitted.";
        feedbackMessage.style.color = "green";
        feedbackText.value = "";
        feedbackModal.style.display = "flex";
      })
      .catch((error) => {
        feedbackMessage.textContent =
          "Error submitting feedback: " + error.message;
        feedbackMessage.style.color = "red";
        feedbackModal.style.display = "flex";
      });
  });

  // ===================== Close Modal =====================
  feedbackOkBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
  });
});
