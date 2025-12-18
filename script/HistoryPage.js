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
  apiKey: "AIzaSyBSpMRcuO5iGPU2hXhnTOMjog29plJwU4U",
  authDomain: "mediterranean-in-velvet-53036.firebaseapp.com",
  databaseURL:
    "https://mediterranean-in-velvet-53036-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-53036",
  storageBucket: "mediterranean-in-velvet-53036.firebasestorage.app",
  messagingSenderId: "1062662016088",
  appId: "1:1062662016088:web:007e0bf8a3e5d0094c8e2d",
  measurementId: "G-TRP0RL8LRL",
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
  //  FETCH LOGIC: IMAGES -> THEN ORDERS -> FEEDBACKS -> GROUPING
  // ==========================================================

  let menuImages = {};
  const menuRef = ref(db, "menu");
  onValue(menuRef, (menuSnapshot) => {
    const menuData = menuSnapshot.val();

    menuImages = {};
    if (menuData) {
      Object.values(menuData).forEach((item) => {
        if (item.name && item.url) {
          menuImages[item.name] = item.url;
        }
      });
    }

    const ordersRef = ref(db, "Order");
    const historyRef = ref(db, "OrderHistory");
    const feedbackRef = ref(db, "Feedbacks");

    let ordersData = {};
    let historyData = {};
    let feedbackData = {};

    onValue(ordersRef, (snapshot) => {
      ordersData = snapshot.val() || {};
      renderCombinedOrders();
    });

    onValue(historyRef, (snapshot) => {
      historyData = snapshot.val() || {};
      renderCombinedOrders();
    });

    onValue(feedbackRef, (snapshot) => {
      feedbackData = snapshot.val() || {};
      renderCombinedOrders();
    });

    function renderCombinedOrders() {
      orderList.innerHTML = "";

      const allOrders = [
        ...Object.values(ordersData),
        ...Object.values(historyData),
      ];

      if (allOrders.length === 0) {
        orderList.innerHTML = "<p>You have no past orders yet.</p>";
        return;
      }

      const userOrders = allOrders.filter((order) => order.userId === user.uid);
      if (userOrders.length === 0) {
        orderList.innerHTML = "<p>You have no past orders yet.</p>";
        return;
      }

      userOrders.sort((a, b) => {
        const timeA = a.timestamp?.seconds
          ? a.timestamp.seconds * 1000
          : new Date(a.timestamp || 0).getTime();

        const timeB = b.timestamp?.seconds
          ? b.timestamp.seconds * 1000
          : new Date(b.timestamp || 0).getTime();

        return timeB - timeA; // newest first
      });

      userOrders.forEach((order) => {
        const displayDate = order.deliveryDate
          ? `${new Date(order.deliveryDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })} ${order.deliveryTime ? `at ${order.deliveryTime}` : ""}`
          : "Date not available";

        let statusColor = "#e66920ff";
        if (order.status === "ACCEPTED") statusColor = "#000";
        else if (order.status === "FOR DELIVERY") statusColor = "#3ac204ff";
        else if (order.status === "CANCELLED") statusColor = "#cc3232";
        else if (order.status === "DELIVERED") statusColor = "#a64d79";

        const itemsArray = order.orders ? Object.values(order.orders) : [];
        const reversedItems = itemsArray.reverse();

        let itemsHtml = "";
        let grandTotal = 0;
        let itemNamesList = [];

        reversedItems.forEach((item) => {
          const itemTotal = item.price * item.qty;
          grandTotal += itemTotal;
          if (item.name) itemNamesList.push(item.name);

          let finalImageSrc = "https://via.placeholder.com/140x140";
          if (menuImages[item.name]) finalImageSrc = menuImages[item.name];
          else {
            const foundKey = Object.keys(menuImages).find(
              (k) => k.toLowerCase() === (item.name || "").toLowerCase()
            );
            if (foundKey) finalImageSrc = menuImages[foundKey];
          }

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
                      ? `<button class="reorder-btn" 
                      style="padding: 8px 15px; font-size: 14px; margin: 0;"
                      onclick="reorder('${item.name}', ${item.qty}, ${item.price})">
                      Reorder
                  </button>`
                      : ``
                  }
              </div>
          `;
        });

        const combinedItemNames = itemNamesList.join(", ");

        // Check feedback
        let hasFeedback = false;
        let feedbackMode = "new";
        if (feedbackData) {
          Object.values(feedbackData).forEach((fb) => {
            const fbID = fb.orderID || fb.orderId;
            if (String(fbID) === String(order.orderID)) {
              hasFeedback = true;
              feedbackMode = "edit";
            }
          });
        }

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

            ${
              order.status === "CANCELLED" && order.cancelReason
                ? `<div class="cancel-reason">
                    Reason: <p> ${order.cancelReason} </p>
                  </div>`
                : ""
            }

            <div class="order-group-items">
                ${itemsHtml}
            </div>

            <div class="order-group-footer">
                <div style="font-size: 18px; font-weight: bold; color: #333;">
                    Total: <span style="color: #741b47;">₱${grandTotal.toFixed(
                      2
                    )}</span>
                </div>
                
                ${
                  order.status === "DELIVERED"
                    ? `<button class="feedback-btn" onclick="window.location.href='/pages/FeedbackPage.html?item=${encodeURIComponent(
                        combinedItemNames
                      )}&orderID=${order.orderID}&mode=${feedbackMode}'">
                        ${hasFeedback ? "Edit Feedback" : "Give Feedback"}
                    </button>`
                    : ``
                }
            </div>
          </div>
        `;
      });
    }
  });
});

// ===================== REORDER FUNCTION =====================
window.reorder = function (name, qty, price) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ name, qty, price });
  localStorage.setItem("cart", JSON.stringify(cart));

  const popup = document.getElementById("reorderPopup");
  const message = document.getElementById("reorderMessage");
  const okBtn = document.getElementById("reorderOkBtn");

  message.textContent = `${name} has been added to your cart again!`;
  popup.style.display = "flex";
  okBtn.onclick = () => {
    popup.style.display = "none";
  };
};
