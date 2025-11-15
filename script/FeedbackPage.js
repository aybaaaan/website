// ===================== Firebase Imports =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// ===================== Firebase Config =====================
const firebaseConfig = {
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  databaseURL:
    "https://webusiteu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd"
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
      feedbackMessage.textContent = "Please write your feedback before submitting.";
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
      timestamp: formattedTime
    })
      .then(() => {
        feedbackMessage.textContent = "Thank you! Your feedback has been submitted.";
        feedbackMessage.style.color = "green";
        feedbackText.value = "";
        feedbackModal.style.display = "flex";
      })
      .catch((error) => {
        feedbackMessage.textContent = "Error submitting feedback: " + error.message;
        feedbackMessage.style.color = "red";
        feedbackModal.style.display = "flex";
      });
  });

  // ===================== Close Modal =====================
  feedbackOkBtn.addEventListener("click", () => {
    feedbackModal.style.display = "none";
  });
});
