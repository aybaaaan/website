// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");
});

// ===================== IMPORTS =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ===================== FIREBASE CONFIG =====================
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
const auth = getAuth(app);
const dbFirestore = getFirestore(app);

// ===================== DOM ELEMENTS =====================
const orderList = document.querySelector(".order-list");

function renderNotifications(notifs) {
  const notifContainer = document.getElementById("notifItems");
  if (!notifContainer) return;
  notifContainer.innerHTML = "";

  notifs.forEach((notif) => {
    const notifItem = document.createElement("div");
    notifItem.classList.add("notif-item");
    if (!notif.isRead) notifItem.classList.add("unread");

    notifItem.innerHTML = `
      <p>${notif.message}</p>
      <small>${
        notif.timestamp ? notif.timestamp.toDate().toLocaleString() : ""
      }</small>
    `;

    notifItem.addEventListener("click", async () => {
      const notifDoc = doc(
        dbFirestore,
        "notifications",
        notif.userId,
        "userNotifications",
        notif.id
      );
      await updateDoc(notifDoc, { isRead: true });
      notifItem.classList.remove("unread");
    });

    notifContainer.appendChild(notifItem);
  });
}

// ===================== FETCH USER ORDERS =====================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to view your order history.");
    window.location.href = "/pages/LoginPage.html";
    return;
  }

  // --- NOTIFICATIONS LOGIC  ---
  const notifRef = collection(
    dbFirestore,
    "notifications",
    user.uid,
    "userNotifications"
  );
  const notifQuery = query(notifRef, orderBy("timestamp", "desc"));

  onSnapshot(notifQuery, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, userId: user.uid, ...doc.data() });
    });
    renderNotifications(notifications);
  });

  onSnapshot(notifQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const notif = change.doc.data();
        showToast(notif.message);
      }
    });
  });

  function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  // ==========================================================
  //  FETCH LOGIC: IMAGES -> THEN ORDERS -> GROUPING
  // ==========================================================

  // 1. Storage for menu images
  let menuImages = {};

  // 2. Fetch the "menu" node FIRST
  const menuRef = ref(db, "menu");
  onValue(menuRef, (menuSnapshot) => {
    const menuData = menuSnapshot.val();

    // Reset and Populate image map
    menuImages = {};
    if (menuData) {
      Object.values(menuData).forEach((item) => {
        if (item.name && item.url) {
          menuImages[item.name] = item.url;
        }
      });
    }

    // 3. FETCH ORDERS AFTER IMAGES
    const ordersRef = ref(db, "OrderHistory");
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      orderList.innerHTML = "";

      if (!data) {
        orderList.innerHTML = "<p>No orders found.</p>";
        return;
      }

      // Filter orders belonging to the current user
      const userOrders = Object.values(data).filter(
        (order) => order.userId === user.uid
      );

      if (userOrders.length === 0) {
        orderList.innerHTML = "<p>You have no past orders yet.</p>";
        return;
      }

      // Sort orders by deliveryDate (latest first)
      userOrders.sort(
        (a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate)
      );

      // --- START GROUPING LOGIC ---
      userOrders.forEach((order) => {
        // A. Setup Order Details
        const displayDate = order.deliveryDate
          ? `${new Date(order.deliveryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })} ${order.deliveryTime ? `at ${order.deliveryTime}` : ""}`
          : "Date not available";

        let statusColor = "darkorange";
        if (order.status === "ACCEPTED") statusColor = "#22b415ff";
        else if (order.status === "FOR DELIVERY") statusColor = "#14c0ebff";
        else if (order.status === "CANCELLED") statusColor = "#cc3232";
        else if (order.status === "DELIVERED") statusColor = "#a64d79";

        // B. Prepare Items List
        const itemsArray = order.orders ? Object.values(order.orders) : [];
        const reversedItems = itemsArray.reverse();

        let itemsHtml = "";
        let grandTotal = 0;
        let itemNamesList = []; // Dito natin iipunin ang mga pangalan

        reversedItems.forEach((item) => {
          const itemTotal = item.price * item.qty;
          grandTotal += itemTotal;

          // I-save ang pangalan ng pagkain
          if (item.name) {
            itemNamesList.push(item.name);
          }

          // Image Logic
          let finalImageSrc = "https://via.placeholder.com/140x140";
          if (menuImages[item.name]) {
            finalImageSrc = menuImages[item.name];
          } else {
            const foundKey = Object.keys(menuImages).find(
              (k) => k.toLowerCase() === (item.name || "").toLowerCase()
            );
            if (foundKey) finalImageSrc = menuImages[foundKey];
          }

          // Build row for each item
          itemsHtml += `
              <div class="order-item-row">
                  <img src="${finalImageSrc}" alt="${item.name}" 
                      style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                  
                  <div class="order-info" style="flex: 1;">
                      <h3 style="font-size: 18px; margin-bottom: 5px;">${
                        item.name
                      }</h3>
                      <p style="font-size: 14px; margin: 0;">Qty: ${
                        item.qty
                      } x ₱${item.price}</p>
                      <p class="subtotal" style="font-size: 14px; margin-top: 5px;">
                          Subtotal: ₱${itemTotal.toFixed(2)}
                      </p>
                  </div>

                  ${
                    order.status === "DELIVERED"
                      ? `
                  <button class="reorder-btn" 
                      style="padding: 8px 15px; font-size: 14px; margin: 0;"
                      onclick="reorder('${item.name}', ${item.qty}, ${item.price})">
                      Reorder
                  </button>`
                      : ``
                  }
              </div>
          `;
        });

        // Combine item names for feedback (e.g., "Pita Bread, Garlic Sauce")
        const combinedItemNames = itemNamesList.join(", ");

        // C. Build the MAIN CARD
        orderList.innerHTML += `
          <div class="order-card" style="flex-direction: column; align-items: stretch; cursor: default;">
            
            <div class="order-group-header">
                <div>
                    <p style="font-weight: bold; color: #333; font-size: 16px;">Order ID: ${
                      order.orderID || "N/A"
                    }</p>
                    <p class="order-date" style="margin: 0; font-size: 13px;">${displayDate}</p>
                </div>
                <div style="color: ${statusColor}; font-weight: 700; text-transform: uppercase; font-size: 14px;">
                    ${order.status || "pending"}
                </div>
            </div>

            <div class="order-group-items">
                ${itemsHtml}
            </div>

            <div class="order-group-footer">
                <div style="font-size: 18px; font-weight: bold; color: #333;">
                    Total: <span style="color: #741b47;">₱${grandTotal.toFixed(
                      2
                    )}</span>
                </div>
                
                <!-- Give Feedback only if delivered -->
                ${
                  order.status === "DELIVERED"
                    ? `
                <button class="feedback-btn" onclick="window.location.href='/pages/FeedbackPage.html?item=${encodeURIComponent(
                  combinedItemNames
                )}&orderID=${order.orderID}'">
                  Give Feedback
                </button>`
                    : ``
                }
            </div>
          </div>
        `;
      });
    });
  });
});

// ===================== REORDER FUNCTION =====================
window.reorder = function (name, qty, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, qty, price });
  localStorage.setItem("cart", JSON.stringify(cart));

  // Show popup
  const popup = document.getElementById("reorderPopup");
  const message = document.getElementById("reorderMessage");
  const okBtn = document.getElementById("reorderOkBtn");

  message.textContent = `${name} has been added to your cart again!`;
  popup.style.display = "flex";
  okBtn.onclick = () => {
    popup.style.display = "none";
  };
};
