// =========================
// FIREBASE IMPORTS
// =========================
import {
  getDatabase,
  ref,
  get,
  update,
  push,
  onChildAdded,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const db = getDatabase();

// =========================
// 1. SAVE NOTIFICATION (Admin)
// =========================
export async function sendStatusNotification(orderId, newStatus) {
  // Update status in database
  await update(ref(db, `Order/${orderId}`), {
    status: newStatus,
  });

  // Fetch userId from the order
  const snap = await get(ref(db, `Order/${orderId}`));
  const order = snap.val();
  const userId = order.userId;

  if (!userId) return console.error("userId missing");

  // Preset messages
  const messages = {
    pending: { title: "Order Pending", body: "Your order is now pending." },
    accepted: {
      title: "Order Accepted",
      body: "Your order has been accepted!",
    },
    "for-delivery": {
      title: "Out for Delivery",
      body: "Your order is now out for delivery!",
    },
    delivered: { title: "Delivered", body: "Your order has been delivered." },
    cancelled: { title: "Cancelled", body: "Your order has been cancelled." },
  };

  const msg = messages[newStatus];

  // Save notification
  await push(ref(db, `Notifications/${userId}`), {
    title: msg.title,
    message: msg.body,
    orderId,
    timestamp: Date.now(),
    read: false,
  });

  console.log("Notification saved ✔");
}

// =========================
// 2. USER SIDE LISTENER
// =========================
export function listenForUserNotifications(userId, callback) {
  Notification.requestPermission();

  const notifRef = ref(db, `Notifications/${userId}`);

  onChildAdded(notifRef, (snap) => {
    const data = snap.val();

    // Browser popup
    new Notification(data.title, { body: data.message });

    // Callback for UI
    if (callback) callback(data);
  });
}
