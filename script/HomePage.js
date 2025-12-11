// ==== HEADER SCROLL EFFECT ====
const headerContainer = document.querySelector(".header-container");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    headerContainer.classList.add("scrolled");
  } else {
    headerContainer.classList.remove("scrolled");
  }
});

// ===================== FOOD DETAILS PAGE =====================
function goToDetails(name, price, img, desc) {
  localStorage.setItem("foodName", name);
  localStorage.setItem("foodPrice", price);
  localStorage.setItem("foodImg", img);
  localStorage.setItem("foodDesc", desc);
  window.location.href = "../pages/FoodDetails.html";
}

// ===================== MENU NAVIGATION =====================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const active = params.get("active");

  if (active === "menu") {
    const menuLink = document.querySelector(".nav-item[href='#menu']");
    if (menuLink) {
      menuLink.classList.add("active");
    }
  }
});

// ===================== FORMAT PRICE =====================
function formatPHP(n) {
  return Number(n).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ===================== RENDER CART =====================
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  let total = 0;

  // always pull fresh from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItems.innerHTML = `<li class="empty">Your cart is empty!</li>`;
  } else {
    cartItems.innerHTML = cart
      .map((item) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
        <li class="cart-item">
          <p><strong>${item.name}</strong> x${item.qty}</p>
          <p class="cart-price">Php ${formatPHP(itemTotal)}</p>
          <button class="remove-btn" onclick="removeFromCart('${item.name.replace(
            /'/g,
            "\\'"
          )}')">Remove</button>
        </li>
      `;
      })
      .join("");
  }

  document.getElementById("cartTotal").textContent = `‣ Subtotal: Php ${formatPHP(
    total
  )}`;
}

// ===================== REMOVE ITEM =====================
function removeFromCart(name) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.name !== name);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// ===================== ADD TO CART =====================
function addToCart(name, price) {
  const cleanPrice = Number(String(price).replace(/[^0-9.]/g, "")) || 0;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find((i) => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: cleanPrice, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();

  // open cart sidebar when adding item
  document.getElementById("cartSidebar").classList.add("active");
}

// ===================== CART OPEN/CLOSE =====================
function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("active");
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("active");
}

// ===================== ON PAGE LOAD =====================
document.addEventListener("DOMContentLoaded", () => {
  renderCart(); // always update items
  listenToAnnouncements();

  // open cart only if redirected with ?cart=open
  const params = new URLSearchParams(window.location.search);
  if (params.get("cart") === "open") {
    document.getElementById("cartSidebar").classList.add("active");
  }

  // Close cart with the "×" button
  document.getElementById("closeCart").addEventListener("click", closeCart);
});

// ===================== ACCOUNT DROPDOWN =====================
document.addEventListener("DOMContentLoaded", () => {
  const accountBtn = document.getElementById("accountBtn");
  const accountMenu = document.getElementById("accountMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const cancelLogout = document.getElementById("cancelLogout");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logoutPopup.style.display = "flex";
    });
  }

  if (cancelLogout) {
    cancelLogout.addEventListener("click", () => {
      logoutPopup.style.display = "none"; // close popup
    });
  }

 if (accountBtn) {
  accountBtn.addEventListener("click", () => {
    accountMenu.classList.toggle("active");
  });
}

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !accountBtn.contains(event.target) &&
      !accountMenu.contains(event.target)
    ) {
      accountMenu.classList.remove("active");
    }
  });
});

// ===================== LINK HOMEPAGE CHECKOUT BUTTON =====================
document.querySelectorAll(".checkout-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      // Show popup instead of alert
      const popup = document.getElementById("emptyCartPopup");
      const okBtn = document.getElementById("emptyCartOkBtn");

      popup.style.display = "flex";

      okBtn.onclick = () => {
        popup.style.display = "none";
      };
    } else {
      window.location.href = "../pages/CheckoutPage.html";
    }
  });
});

// ===================== HAMBURGER MENU =====================
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("nav-menu");

  if (!hamburger || !navMenu) return;

  // ==== HAMBURGER MENU TOGGLE ====
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");

    // Toggle header color when menu is open
    headerContainer.classList.toggle("menu-open");
  });

  // Close menu when clicking a link
  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (event) => {
    if (
      navMenu.classList.contains("active") &&
      !hamburger.contains(event.target) &&
      !navMenu.contains(event.target)
    ) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  });

  // Close when resizing to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 768) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  });
});

window.goToDetails = goToDetails;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.closeCart = closeCart;

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  limitToLast,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";
import {
  getAuth,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
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
const announcementRef = ref(db, "Announcements");

let currentSlide = 0;
let autoSlideInterval;

function showSlide(index) {
  const items = document.querySelectorAll(".carousel-item");
  const indicators = document.querySelectorAll(".indicator");
  if (items.length === 0) return;

  if (index >= items.length) currentSlide = 0;
  else if (index < 0) currentSlide = items.length - 1;
  else currentSlide = index;

  items.forEach((item, i) => {
    item.classList.toggle("active", i === currentSlide);
    indicators[i]?.classList.toggle("active", i === currentSlide);
  });
}

window.nextSlide = function () {
  showSlide(currentSlide + 1);
};
window.prevSlide = function () {
  showSlide(currentSlide - 1);
};

// Automatic sliding
function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    nextSlide();
  }, 3000); // every 3 seconds
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

// Start auto-slide initially
startAutoSlide();

// Pause on hover
const carousel = document.getElementById("carousel");
carousel.addEventListener("mouseenter", stopAutoSlide);
carousel.addEventListener("mouseleave", startAutoSlide);

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") nextSlide();
  else if (e.key === "ArrowLeft") prevSlide();
});

// ================== LOAD HOMEPAGE CAROUSEL ==================
onValue(ref(db, "homepage"), (snapshot) => {
  const data = snapshot.val();
  const carousel = document.getElementById("carousel");
  const indicators = document.getElementById("indicators");
  carousel.innerHTML = "";
  indicators.innerHTML = "";

  if (data) {
    Object.values(data).forEach((item, index) => {
      carousel.innerHTML += `
          <div class="carousel-item ${index === 0 ? "active" : ""}">
            <img src="${item.url}" alt="${item.name}" />
            <div class="carousel-item-caption-container">
              <div class="carousel-item-caption">
                <h1>Featured Dishes</h1>
                <h2>${item.name}</h2>
                <p class ="item-desc">${item.desc}</p>
              </div>
            </div>
          </div>
        `;

      indicators.innerHTML += `
          <span class="indicator ${index === 0 ? "active" : ""}" 
                data-slide="${index}" onclick="showSlide(${index})"></span>
        `;
    });
    currentSlide = 0;
    showSlide(currentSlide);
  }
});

// ================== MENU CATEGORY TOGGLE ==================
let allMenuItems = []; // store all menu items globally for toggling

// Keep a snapshot of menu items whenever they load
onValue(ref(db, "menu"), (snapshot) => {
  const data = snapshot.val();
  allMenuItems = data ? Object.values(data) : [];

  // Optional: default show Main Dishes
  renderMenuByCategory("main");
});

// Function to render menu based on category
function renderMenuByCategory(category) {
  const menuContainer = document.getElementById("menuCards");
  menuContainer.innerHTML = "";

  const filteredItems =
    category === "all"
      ? allMenuItems
      : allMenuItems.filter((item) => item.category === category);

  filteredItems.forEach((item) => {
    const card = document.createElement("div");
    card.className = "menu-card";

    card.innerHTML = `
      <img src="${item.url}" alt="${item.name}">
      <div class="card-content">
        <h3 class="card-title">${item.name}</h3>
        <p class="card-desc">${item.desc}</p>
        <div class="card-bottom">
          <span class="card-price">₱${item.price || 0}.00</span>
        </div>
      </div>
    `;

    // Create the Order button dynamically
    const cardBottom = card.querySelector(".card-bottom");
    const btn = document.createElement("button");
    btn.className = "order-btn";
    btn.textContent = "Order";
    btn.addEventListener("click", () => {
      goToDetails(item.name, item.price || 0, item.url, item.desc);
    });

    cardBottom.appendChild(btn);
    menuContainer.appendChild(card);
  });
}
// Event listeners for toggle buttons
document.getElementById("btnMain").addEventListener("click", () => {
  renderMenuByCategory("main");
});

document.getElementById("btnSide").addEventListener("click", () => {
  renderMenuByCategory("side");
});

// ===================== NEW: ANNOUNCEMENT LOGIC FUNCTIONS =====================

// NEW: Container for Announcement Toast and Modal elements
let viewedAnnouncementKey =
  localStorage.getItem("viewedAnnouncementKey") || null;
let viewedAnnouncementTimestamp =
  localStorage.getItem("viewedAnnouncementTimestamp") || null;

let allAnnouncements = [];
const announcementToastContainer = document.getElementById(
  "announcementToastContainer"
);
const announcementModal = document.getElementById("announcementModal");
const closeAnnouncementModalBtn = document.getElementById(
  "closeAnnouncementModal"
);

if (closeAnnouncementModalBtn) {
  closeAnnouncementModalBtn.addEventListener("click", () => {
    announcementModal.style.display = "none";
  });
}
// Listen for clicks outside the modal to close it
window.addEventListener("click", (e) => {
  if (e.target === announcementModal) announcementModal.style.display = "none";
});

/**
 * Listens for the single newest announcement from the database.
 * Uses query, orderByChild, and limitToLast to efficiently fetch the latest post.
 */
/**
 * Listens for ALL announcements from the database, stores them globally,
 * and triggers a toast for the single newest one.
 */
function listenToAnnouncements() {
  // Query to get ALL announcements, ordered by timestamp (newest last)
  const allAnnouncementsQuery = query(
    announcementRef,
    orderByChild("timestamp")
  );

  onValue(allAnnouncementsQuery, (snapshot) => {
    if (!snapshot.exists()) {
      allAnnouncements = [];
      if (announcementToastContainer) announcementToastContainer.innerHTML = "";
      return;
    }

    const announcementsData = [];
    snapshot.forEach((child) => {
      const announcement = child.val();
      announcementsData.push({ ...announcement, key: child.key });
    });

    // Store ALL announcements globally (newest is the last item)
    allAnnouncements = announcementsData;

    // Get the single newest announcement to display the toast notification
    const newestAnnouncement = announcementsData[announcementsData.length - 1];

    if (newestAnnouncement) {
      showAnnouncementToast(newestAnnouncement);
    }
  });
}

/**
 * Displays the announcement as a persistent toast notification.
 * @param {object} announcement The announcement data (key, title, content, timestamp).
 */

let announcementToast = null; // single toast element

function showAnnouncementToast(announcement) {
  if (!announcementToastContainer || !announcement) return;

  const postDate = announcement.timestamp
    ? new Date(announcement.timestamp).toLocaleString()
    : "N/A Date/Time";

  // Only skip toast if user has already viewed this exact announcement version
  if (
    viewedAnnouncementKey === announcement.key &&
    viewedAnnouncementTimestamp === String(announcement.timestamp)
  )
    return;

  // Remove old toast if exists
  if (announcementToast) {
    announcementToast.remove();
    announcementToast = null;
  }

  // Create toast
  announcementToast = document.createElement("div");
  announcementToast.classList.add("order-toast", "announcement-toast");
  announcementToast.innerHTML = `
    <div>
      <p class="announcement-label">!NEW ANNOUNCEMENT FROM MEDITERRANEAN IN VELVET!</p>
      <p class="announcement-subject">Subject: ${announcement.title}</p>
      <small>Received: ${postDate}</small>
    </div>
    <button id="announcement-read-btn">View</button>
  `;
  announcementToastContainer.appendChild(announcementToast);

  // Add click listener
  document
    .getElementById("announcement-read-btn")
    .addEventListener("click", () => {
      viewedAnnouncementKey = announcement.key;
      viewedAnnouncementTimestamp = String(announcement.timestamp);
      localStorage.setItem("viewedAnnouncementKey", viewedAnnouncementKey);
      localStorage.setItem(
        "viewedAnnouncementTimestamp",
        viewedAnnouncementTimestamp
      );

      announcementToast.remove();
      announcementToast = null;

      showAnnouncementContentModal();
    });

  setTimeout(() => announcementToast.classList.add("show"), 10);
}
/* Helper function to check for content overflow and attach event listener */
function checkOverflowAndAddButton(
  card,
  contentWrapper,
  contentElement,
  button
) {
  setTimeout(() => {
    // If content overflows the visible wrapper, show the button
    if (contentElement.scrollHeight > contentWrapper.offsetHeight) {
      button.style.display = "block";
      button.textContent = "Show Full";
    }
  }, 0);

  button.addEventListener("click", () => {
    const isExpanded = card.classList.toggle("expanded");

    if (isExpanded) {
      // Expand wrapper to full content height
      contentWrapper.style.height = contentElement.scrollHeight + "px";
      button.textContent = "Show Less";
    } else {
      // Collapse wrapper to minimal height (auto adjust if needed)
      contentWrapper.style.height = ""; // remove inline height, CSS handles default
      button.textContent = "Show Full";
    }
  });
}

/**
 * Updates the announcement modal with all announcements, now with "Show Full/Show Less" button logic.
 */
function showAnnouncementContentModal() {
  if (!announcementModal || allAnnouncements.length === 0) return;
  const modalContentElement = document.getElementById(
    "announcement-modal-content"
  );
  modalContentElement.innerHTML = ""; // Clear previous modal content

  // Reverse so newest on top
  const reversedAnnouncements = [...allAnnouncements].reverse();
  const newestAnnouncementKey =
    allAnnouncements[allAnnouncements.length - 1]?.key;

  reversedAnnouncements.forEach((item, index) => {
    const postDate = item.timestamp
      ? new Date(item.timestamp).toLocaleString()
      : "N/A";

    const card = document.createElement("div");
    card.className = "announcement-card";

    const titleBlock = document.createElement("div");
    titleBlock.innerHTML = `
            <h4 class="announcement-title">${item.title}</h4>
            ${
              item.key === newestAnnouncementKey
                ? '<span class="new-label">NEW</span>'
                : ""
            }
            <small class="announcement-date">Posted: ${postDate}</small>
        `;

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "announcement-content-wrapper";

    const contentElement = document.createElement("p");
    contentElement.className = "announcement-content";
    contentElement.textContent = item.content;
    contentElement.style.whiteSpace = "pre-wrap";

    const showFullBtn = document.createElement("button");
    showFullBtn.className = "see-full-btn";
    showFullBtn.textContent = "Show Full";

    contentWrapper.appendChild(contentElement);
    card.appendChild(titleBlock);
    card.appendChild(contentWrapper);
    card.appendChild(showFullBtn);
    modalContentElement.appendChild(card);

    checkOverflowAndAddButton(
      card,
      contentWrapper,
      contentElement,
      showFullBtn
    );
  });

  announcementModal.style.display = "flex";
}

//=================== ORDER STATUS TOASTS =====================//
const orderToasts = {}; // Track the toast element per orderID
const orderStatuses = {}; // Track last known status
const orderTimestamps = {}; // Track timestamp per orderID

let dismissedOrders = JSON.parse(localStorage.getItem("dismissedOrders")) || {};
function saveDismissedOrders() {
  localStorage.setItem("dismissedOrders", JSON.stringify(dismissedOrders));
}

function getStatusColor(status) {
  if (status === "accepted") return "#a64d79";
  if (status === "for-delivery") return "#a64d79";
  if (status === "cancelled") return "#a64d79";
  if (status === "delivered") return "#a64d79";
  return "#a64d79";
}

function showOrUpdateOrderToast(order) {
  const orderID = order.orderID;
  const status = order.status;
  const container = document.getElementById("orderStatusToast");
  const color = getStatusColor(status);

  // Use timestamp from admin update
  const timestamp = order.statusTimestamp
    ? new Date(order.statusTimestamp).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  orderTimestamps[orderID] = timestamp;

  if (dismissedOrders[orderID] === status) return;

  if (orderToasts[orderID]) {
    // Update existing toast
    const toast = orderToasts[orderID];
    toast.querySelector(
      ".status-text"
    ).textContent = `UPDATE: OrderID ${orderID} status is now ${status}`;
    toast.querySelector(".status-text").style.color = color;
    toast.querySelector(
      ".status-time"
    ).textContent = `Status Updated: ${timestamp}`;
    orderStatuses[orderID] = status;
  } else {
    // Create new toast
    const toast = document.createElement("div");
    toast.classList.add("order-toast");
    toast.innerHTML = `
      <div>
        <p class="status-text" style="color:${color};">
          UPDATE: OrderID ${orderID} status is now ${status}
        </p>
        <small class="status-time" style="opacity:0.8;">
          Status Updated: ${timestamp}
        </small>
      </div>
      <button>OK</button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);

    toast.querySelector("button").addEventListener("click", () => {
      toast.remove();
      orderToasts[orderID] = null;
      dismissedOrders[orderID] = status;
      saveDismissedOrders();
    });

    orderToasts[orderID] = toast;
    orderStatuses[orderID] = status;
  }
}

onValue(ref(db, "Order"), (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const user = auth.currentUser;
  if (!user) return;

  listenToAnnouncements();

  const userOrders = Object.values(data).filter((o) => o.userId === user.uid);

  userOrders.forEach((order) => {
    if (
      dismissedOrders[order.orderID] &&
      dismissedOrders[order.orderID] !== order.status
    ) {
      delete dismissedOrders[order.orderID];
      saveDismissedOrders();
    }

    if (orderStatuses[order.orderID] !== order.status) {
      showOrUpdateOrderToast(order);
    }
  });
});

// ===================== LOAD ABOUT US CONTENT =====================
const aboutUsContent = document.getElementById("aboutUsContent");
onValue(ref(db, "aboutUs"), (snapshot) => {
  aboutUsContent.textContent = snapshot.exists()
    ? snapshot.val().content
    : "About Us section is empty.";
});

// LOG OUT FUNCTIONALITY
const auth = getAuth();

if (confirmLogout) {
  confirmLogout.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "../index.html"; // after logout → guest page
    });
  });
}
const buttons = document.querySelectorAll(".menu-toggle button");

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active from all buttons (optional if only one can be active)
    buttons.forEach((btn) => btn.classList.remove("active"));

    // Add active to the clicked button
    button.classList.add("active");
  });
});

const links = document.querySelectorAll(".nav-menu a");

links.forEach(link => {
  link.addEventListener("click", function () {
    links.forEach(l => l.classList.remove("active"));
    this.classList.add("active");
  });
});

window.showSlide = showSlide; // allow indicators to work



// ===================== CUSTOMER REVIEWS LOGIC =====================
const feedbacksRef = ref(db, "Feedbacks");
const reviewsContainer = document.getElementById("reviewsContainer");

// Fetch and Display Reviews
onValue(feedbacksRef, (snapshot) => {
  if (!snapshot.exists()) {
    reviewsContainer.innerHTML = "<p style='width:100%; text-align:center;'>No reviews yet.</p>";
    return;
  }

  const data = snapshot.val();
  const allReviews = Object.values(data);

  // 1. SORT: Show newest first
  allReviews.reverse(); 

  // 2. LIMIT: Limit to 15 reviews
  const limitedReviews = allReviews.slice(0, 15);

  reviewsContainer.innerHTML = ""; // Clear loading text

  limitedReviews.forEach(review => {
    // Generate Stars HTML
    // If no rating, 0 stars (all empty)
    let starsHtml = "";
    const rating = review.rating || 0; 

    for(let i=1; i<=5; i++) {
        if(i <= rating) starsHtml += "★"; // Filled star
        else starsHtml += "☆"; // Empty star
    }

    // Determine Name and Content
    const name = review.customerName || "Customer";
    const feedbackText = review.feedback ? `"${review.feedback}"` : "No comment provided.";
    const foodItem = review.itemName || "Ordered Item";

    // Create Card HTML
    const card = document.createElement("div");
    card.classList.add("review-card");
    
    // Added tooltip title
    card.innerHTML = `
        <div class="review-header" title="Click to expand">
            <span class="reviewer-name">${name}</span>
            <span class="review-stars">${starsHtml}</span>
        </div>
        <p class="review-text">${feedbackText}</p>
        <span class="review-item-name">Ordered: ${foodItem}</span>
    `;

    // Click event to expand/collapse text
    card.addEventListener("click", () => {
        const textElement = card.querySelector(".review-text");
        textElement.classList.toggle("expanded");
    });

    reviewsContainer.appendChild(card);
  });
});

// Review Scroll Buttons Logic
document.getElementById("reviewPrevBtn").addEventListener("click", () => {
    reviewsContainer.scrollBy({ left: -320, behavior: "smooth" });
});

document.getElementById("reviewNextBtn").addEventListener("click", () => {
    reviewsContainer.scrollBy({ left: 320, behavior: "smooth" });
});