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

// ===================== DOM Elements =====================
const feedbackText = document.getElementById("feedbackText");
const submitBtn = document.getElementById("submitFeedback");
const feedbackModal = document.getElementById("feedbackModal");
const feedbackMessage = document.getElementById("feedbackMessage");
const feedbackOkBtn = document.getElementById("feedbackOkBtn");

// ===================== URL Parameters =====================
const urlParams = new URLSearchParams(window.location.search);
const currentOrderID = urlParams.get("orderID");
const itemName = urlParams.get("item");

// ===================== Submit Feedback =====================
submitBtn.addEventListener("click", async () => {
  const text = feedbackText.value.trim();
  if (!text) {
    feedbackMessage.textContent =
      "Please write your feedback before submitting.";
    feedbackMessage.style.color = "red";
    feedbackModal.style.display = "flex";
    return;
  }

  try {
    // Get the order data
    const orderData = await getOrderData(currentOrderID);

    const feedbackData = {
      orderID: currentOrderID,
      item: itemName,
      feedback: text,
      timestamp: new Date().toLocaleString(),
      foodItems: orderData.orders || [],
      customerName: orderData.name || "", // Fixed this line
    };

    const newFeedbackRef = push(ref(db, "Feedbacks"));
    await set(newFeedbackRef, feedbackData);

    feedbackMessage.textContent =
      "Thank you! Your feedback has been submitted.";
    feedbackMessage.style.color = "green";
    feedbackText.value = "";
    feedbackModal.style.display = "flex";
  } catch (error) {
    feedbackMessage.textContent = "Error submitting feedback: " + error.message;
    feedbackMessage.style.color = "red";
    feedbackModal.style.display = "flex";
  }
});

// ===================== Close Modal =====================
feedbackOkBtn.addEventListener("click", () => {
  feedbackModal.style.display = "none";
});
