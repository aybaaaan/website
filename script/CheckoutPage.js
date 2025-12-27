// ===================== CHECKOUT PAGE =====================
const checkoutContainer = document.getElementById("checkoutContainer");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const addMoreBtn = document.getElementById("addMoreBtn");
const proceedBtn = document.getElementById("proceedBtn");
const paymentSelect = document.getElementById("payment");
const summaryItems = document.getElementById("summaryItems");

// Order summary elements
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");

// Payment info box
const paymentInfo = document.getElementById("paymentInfo");

// Load orders from localStorage
let orders = JSON.parse(localStorage.getItem("cart")) || [];
let isSubmittingOrder = false;

// Update subtotal and total
function updateTotals() {
  let subtotal = orders.reduce((sum, item) => sum + item.price * item.qty, 0);
  subtotalEl.textContent = subtotal.toFixed(2);
  totalEl.textContent = subtotal.toFixed(2);
}

// Render orders dynamically
function renderOrders() {
  checkoutContainer.innerHTML = "";

  if (orders.length === 0) {
    checkoutContainer.innerHTML = "<p>Your cart is empty!</p>";
    subtotalEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    return;
  }

  orders.forEach((item, index) => {
    const orderDiv = document.createElement("div");
    orderDiv.classList.add("order-item");

    orderDiv.innerHTML = `
      <div class="details">
        <h3>${item.name}</h3>
        <p class="details-qty">Qty: <span class="quantity">${
          item.qty
        }</span></p>
        <p class="details-price">Price: Php <span class="priceNum">${(
          item.price * item.qty
        ).toFixed(2)}</span></p>
        <div class="quantity-control">
        <div class="qty-btn">
          <button class="decreaseBtn">-</button>
          <button class="increaseBtn">+</button>
        </div>
          <button class="removeBtn">Remove</button>
        </div>
      </div>
    `;

    checkoutContainer.appendChild(orderDiv);

    const qtyEl = orderDiv.querySelector(".quantity");
    const priceEl = orderDiv.querySelector(".priceNum");
    const increaseBtn = orderDiv.querySelector(".increaseBtn");
    const decreaseBtn = orderDiv.querySelector(".decreaseBtn");
    const removeBtn = orderDiv.querySelector(".removeBtn");

    // Increase quantity
    increaseBtn.addEventListener("click", () => {
      item.qty++;
      qtyEl.textContent = item.qty;
      priceEl.textContent = (item.price * item.qty).toFixed(2);
      updateTotals();
      localStorage.setItem("cart", JSON.stringify(orders));
    });

    // Decrease quantity
    decreaseBtn.addEventListener("click", () => {
      if (item.qty > 1) {
        item.qty--;
        qtyEl.textContent = item.qty;
        priceEl.textContent = (item.price * item.qty).toFixed(2);
        updateTotals();
        localStorage.setItem("cart", JSON.stringify(orders));
      }
    });

    // Remove item
    removeBtn.addEventListener("click", () => {
      orders.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(orders));
      renderOrders();
    });
  });

  updateTotals();
}

// ===================== Hamburger Icon =====================
const hamburger = document.querySelector("#hamburger");
const navMenu = document.querySelector("#nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close menu when a link is clicked
  document.querySelectorAll(".nav a").forEach((n) =>
    n.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    })
  );
}

// ===================== FIREBASE CONFIG =====================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  get,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

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
const fs = getFirestore(app);
const db = getDatabase(app);
const auth = getAuth(app);
const ordersRef = ref(db, "Order");

// ===================== ADDED: BARANGAY CONFIG & HELPER =====================
const allowedBarangays = [
  "Kaybagal Center",
  "Kaybagal North",
  "Kaybagal South",
  "Maharlika East",
  "Maharlika West",
  "Maitim 2nd East",
  "Maitim 2nd West",
  "Patutong Malaki North",
  "Patutong Malaki South",
  "San Jose",
  "Silang Crossing West",
];

function populateBarangays() {
  const select = document.getElementById("barangay-select");
  if (!select) return;

  select.innerHTML =
    '<option value="" disabled selected>Select Barangay</option>';

  allowedBarangays.forEach((brgy) => {
    const option = document.createElement("option");
    option.value = brgy;
    option.textContent = brgy;
    select.appendChild(option);
  });
}
populateBarangays(); // Run immediately

// ===================== AUTH STATE TRACKER =====================
let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    console.log("Logged in as:", user.email);
  } else {
    console.log("No user logged in.");
  }
});

// ===================== MODIFIED: LOAD USER PROFILE =====================
async function loadUserProfile() {
  if (!currentUser) return;

  try {
    const userRef = doc(fs, "users", currentUser.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();

      // Load Name
      document.getElementById("name").value =
        data.name && data.name !== "Not set"
          ? data.name
          : currentUser.email.split("@")[0];

      // Load Phone
      document.getElementById("contact").value =
        data.phone && data.phone !== "Not set" ? data.phone : "";

      // Load Address (NEW LOGIC for Split Inputs)
      if (data.address && typeof data.address === "object") {
        const addr = data.address;
        const safeVal = (val) => (val && val !== "Not set" ? val : "");

        // Fill separate inputs
        const houseInput = document.getElementById("house-no");
        const streetInput = document.getElementById("street");
        const barangaySelect = document.getElementById("barangay-select");

        if (houseInput) houseInput.value = safeVal(addr.houseno);
        if (streetInput) streetInput.value = safeVal(addr.street);

        // Only select barangay if it's in our allowed list
        if (barangaySelect && allowedBarangays.includes(addr.barangay)) {
          barangaySelect.value = addr.barangay;
        }
      }
    } else {
      console.log("No user profile found in Firestore.");
    }
  } catch (err) {
    console.error("Error loading user profile:", err);
  }
}

// ===================== NAVIGATION HELPERS =====================
function goToMenuPage() {
  if (currentUser) {
    // Logged-in users → HomePage.html
    window.location.href = "../pages/HomePage.html#menu";
  } else {
    // Guests → index.html
    window.location.href = "../index.html#menu";
  }
}

// ===================== EVENT HANDLERS =====================

addMoreBtn.addEventListener("click", goToMenuPage);

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", (e) => {
    e.preventDefault();
    goToMenuPage();
  });
}

//login kineme
// ========== Reusable popup (for alerts) ==========
function showPopup(message, redirectUrl = null) {
  let popup = document.getElementById("customPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "customPopup";
    popup.className = "popup-modal";
    popup.innerHTML = `
      <div class="popup-content">
        <p class="popup-message"></p>
        <div class="popup-actions">
          <button class="popup-btn confirm" id="popupOkBtn">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);
  }

  const messageEl = popup.querySelector(".popup-message");
  const okBtn = popup.querySelector("#popupOkBtn");

  messageEl.textContent = message;
  popup.style.display = "flex";

  okBtn.onclick = () => {
    popup.style.display = "none";
    if (redirectUrl) {
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 150);
    }
  };

  // Close when clicking outside
  window.onclick = (e) => {
    if (e.target === popup) {
      popup.style.display = "none";
    }
  };
}

// ===================== MODAL LOGIC =====================
const modal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const timeInput = document.getElementById("delivery-time");
const checkoutForm = document.getElementById("checkoutForm");
const dateInput = document.getElementById("delivery-date");

// FOR DELIVERY DATE INPUT
// Prevent users from choosing past dates
const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
dateInput.min = `${yyyy}-${mm}-${dd}`;

//Prevent past times for today's date
dateInput.addEventListener("change", () => {
  const selectedDate = new Date(dateInput.value);
  const now = new Date();

  // Reset time input
  populateTimeOptions();

  // If user picks today, limit times
  
});

function setDeliveryDateToday() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Set min date (already in your code, but safe to keep)
  dateInput.min = todayStr;

  // Auto-set value ONLY if empty
  if (!dateInput.value) {
    dateInput.value = todayStr;

    // Trigger change event so time rules apply
    dateInput.dispatchEvent(new Event("change"));
  }
}

// ========== Login and Cart Validation ==========
proceedBtn.addEventListener("click", async () => {
  const now = new Date();
  const currentHour = now.getHours();

  //If today and already past 9 PM
  if (currentHour >= 21) {
    showTimePopup(
      "Ordering is closed for today. Our delivery time is from 8:00 AM to 9:00 PM. Please order again tomorrow."
    );
    return;
  }
  

  if (!currentUser) {
    if (modal) modal.style.display = "none";
    showPopup(
      "You must be logged in to place an order.",
      "/pages/LoginPage.html"
    );
    return;
  }

  if (orders.length === 0) {
    showPopup("Your cart is empty!");
    return;
  }

  // 🔹 Try to load profile info from Firestore
  await loadUserProfile();

  // Build item list inside summary
  summaryItems.innerHTML = ""; // clear previous

  orders.forEach((item) => {
    const row = document.createElement("p");
    row.textContent = `${item.name} — Qty: ${item.qty} — Price: ₱${(
      item.price * item.qty
    ).toFixed(2)}`;
    summaryItems.appendChild(row);
  });

  // Update subtotal & total
  summarySubtotal.textContent = subtotalEl.textContent;
  summaryTotal.textContent = parseFloat(totalEl.textContent).toFixed(2);

  modal.style.display = "flex";
  // Update summary when modal shows
  summarySubtotal.textContent = subtotalEl.textContent;
  summaryTotal.textContent = parseFloat(totalEl.textContent).toFixed(2);

  // OPEN MODAL
  modal.style.display = "flex";

  // AUTO-SET DELIVERY DATE TO TODAY
  setDeliveryDateToday();
  populateTimeOptions();
});

// ========== Modal Close Logic ==========
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

function populateTimeOptions() {
  const timeSelect = document.getElementById("delivery-time");
  if (!timeSelect) return;

  timeSelect.innerHTML = '<option value="" disabled selected>Select time</option>';

  if (!dateInput.value) return;

  const now = new Date();
  const selectedDateStr = dateInput.value; 
  const isToday = selectedDateStr === now.toISOString().split('T')[0];

  // Operating Hours: 8:00 AM (8) to 9:00 PM (21)
  for (let h = 8; h <= 21; h++) {
    for (let m = 0; m < 60; m += 10) {
      if (h === 21 && m > 0) break; // Hanggang 9:00 PM lang

      const hourStr = String(h).padStart(2, "0");
      const minStr = String(m).padStart(2, "0");
      const timeValue = `${hourStr}:${minStr}`;

      const option = document.createElement("option");
      option.value = timeValue;
      
      // 12-hour format display
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      option.textContent = `${displayHour}:${minStr} ${ampm}`;

      // VALIDATION LOGIC
      if (isToday) {
        // Kunin ang current time components para sa comparison
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // I-disable kung ang oras sa loop ay mas maaga sa oras ngayon
        if (h < currentHour || (h === currentHour && m <= currentMinute)) {
          option.disabled = true; // Unclickable requirement
          option.style.color = "#ccc"; 
          option.textContent += " (Unavailable)"; 
        }
      }
      timeSelect.appendChild(option);
    }
  }
}



// ==================== INVALID DELIVERY TIME POPUP ====================
const timePopup = document.getElementById("timePopup");
const timePopupOkBtn = document.getElementById("timePopupOkBtn");
const timePopupMsg = document.getElementById("timePopupMsg");

function showTimePopup(message) {
  timePopupMsg.textContent = message;
  timePopup.style.display = "flex";
  timePopup.setAttribute("aria-hidden", "false");
}

timePopupOkBtn.addEventListener("click", () => {
  timePopup.style.display = "none";
  timePopup.setAttribute("aria-hidden", "true");
});

// ===================== ORDER ID GENERATOR =====================
async function generateOrderID() {
  const counterRef = ref(db, "OrderCounter/lastOrderID");

  const result = await runTransaction(counterRef, (current) => {
    return (current || 1000) + 1; // start at 1001 if empty
  });

  return result.snapshot.val();
}

// ==================== SUBMIT HANDLER (MODIFIED) ====================
checkoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const orderID = await generateOrderID();
  const name = document.getElementById("name").value.trim();
  const contact = document.getElementById("contact").value.trim();
  const payment = document.getElementById("payment").value;
  const deliveryDate = document.getElementById("delivery-date").value;
  const deliveryTime = document.getElementById("delivery-time").value;

  // --- NEW ADDRESS INPUTS ---
  const houseNo = document.getElementById("house-no").value.trim();
  const street = document.getElementById("street").value.trim();
  const selectedBarangay = document.getElementById("barangay-select").value;

  // 1. Basic Field Check
  if (!name || !contact || !payment) {
    showTimePopup("Please fill out all personal details.");
    return;
  }

  // 2. Validate Address Info (Specifics)
  if (!houseNo || !street) {
    showTimePopup("Please fill out your House No. and Street.");
    return;
  }
  if (!selectedBarangay || !allowedBarangays.includes(selectedBarangay)) {
    showTimePopup("Please select a valid Barangay.");
    return;
  }

  // --- TIME & DATE VALIDATION ---
  const selectedDateTime = new Date(`${deliveryDate}T${deliveryTime}`);

  if (!deliveryDate || !deliveryTime) {
    showTimePopup("Please select a delivery date and time.");
    return;
  }

  const now = new Date();
  const hour = selectedDateTime.getHours();
  const isToday = selectedDateTime.toDateString() === now.toDateString();

  // 1️⃣ Past time check
  if (selectedDateTime <= now) {
    showTimePopup("Please choose a delivery time later than the current time.");
    return;
  }

  // at least 20 minutes from now
  const minAllowedTime = new Date(now.getTime() + 20 * 60000);
  if (selectedDateTime < minAllowedTime) {
    showTimePopup(
      "Please allow at least 20 minutes for preparation and delivery."
    );
    return;
  }

  // 2️⃣ After 9PM — stop all orders today
  if (isToday && now.getHours() >= 21) {
    showTimePopup(
      "Ordering is closed for today. Please select tomorrow's date."
    );
    return;
  }

  // only between 9 AM and 8 PM
  if (hour < 8 || hour >= 21) {
    showTimePopup("Delivery time must be between 8:00 AM and 9:00 PM.");
    return;
  }

  if (isSubmittingOrder) return;
  isSubmittingOrder = true;

  // Disable submit button immediately
  const submitBtn = checkoutForm.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Placing Order...";
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
  }
  // Get the user's current local date and time (when they clicked SUBMIT)
  const currentTime = new Date();

  // Format nicely for saving
  // Format nicely for saving
  const userOrderDate = currentTime.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const userOrderTime = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // --- PREPARE ADDRESS DATA ---
  // String format for Order (Admin/Rider view)
  const fullAddressString = `House No. ${houseNo}, Street. ${street}, Brgy. ${selectedBarangay}, Tagaytay, Cavite`;

  // Object format for User Profile (Future Auto-fill)
  const addressObject = {
    houseno: houseNo,
    street: street,
    barangay: selectedBarangay,
    city: "Tagaytay",
    province: "Cavite",
  };

  const orderData = {
    orderID,
    userId: currentUser.uid,
    userEmail: currentUser.email,
    name,
    address: fullAddressString, // SAVED AS STRING
    contact,
    deliveryDate,
    deliveryTime,
    payment,
    orders,
    total: parseFloat(totalEl.textContent),
    orderDate: userOrderDate,
    orderTime: userOrderTime,
    timestamp: Date.now(),
    createdAt: Date.now(), // for sorting (newest first)
    status: "PENDING",
  };

  try {
    // Save to Realtime Database
    // Save to Realtime Database
    await push(ordersRef, orderData);

    // ======================== EMAILJS ADMIN NOTIFICATION ========================
    /*const emailParams = {
      orderID: orderID,
      userEmail: currentUser.email,
      name: name,
      contact: contact,
      address: fullAddressString, // Used the new complete address variable
      orderDate: userOrderDate,
      orderTime: userOrderTime,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      payment: payment,
      status: "pending",
      order_list: orders
        .map(
          (item) =>
            `${item.name} (Qty: ${item.qty}) — ₱${(
              item.price * item.qty
            ).toFixed(2)}`
        )
        .join("\n"),
      total: totalEl.textContent,
    };

    emailjs
      .send("service_7vla50x", "template_s96a7yg", emailParams)
      .then(() => {
        console.log("EmailJS: Admin notified successfully");
      })
      .catch((err) => {
        console.error("EmailJS failed:", err);
      });
    //
    // Update user profile in Firestore with STRUCTURED ADDRESS
    const userRef = doc(fs, "users", currentUser.uid);

    await setDoc(
      userRef,
      {
        email: currentUser.email,
        name,
        phone: contact,
        address: addressObject, // store as object
      },
      { merge: true }
    );*/

    // FOR DELIVERY DATE INPUT
    // Prevent users from choosing past dates
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;

    // Clear cart and close checkout modal
    localStorage.removeItem("cart");
    orders = [];
    renderOrders();
    modal.style.display = "none";

    // Show success popup
    document.getElementById("successModal").style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Failed to place order. Please try again.");

    isSubmittingOrder = false;
    const submitBtn = checkoutForm.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.disabled = false;
  }
});

paymentSelect.addEventListener("change", () => {
  const selected = paymentSelect.value;

  if (selected === "GCASH") {
    paymentInfo.style.display = "block";
    paymentInfo.innerHTML = `
      <strong>GCash Payment:</strong><br>
      The delivery personnel will provide a GCash QR scanner upon arrival. 
      Please prepare your device for scanning.
    `;
  } else if (selected === "CASH_ON_DELIVERY") {
    paymentInfo.style.display = "block";
    paymentInfo.innerHTML = `
      <strong>Cash on Delivery:</strong><br>
      Please prepare the exact cash amount and hand it to the delivery personnel upon arrival.
    `;
  } else {
    paymentInfo.style.display = "none";
  }
});

// Return Home button handler
document.getElementById("returnHomeBtn").addEventListener("click", () => {
  document.getElementById("successModal").style.display = "none";
  window.location.href = "/pages/HomePage.html#home";
});

// Initialize checkout
renderOrders();
