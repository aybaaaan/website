// ==== HEADER SCROLL EFFECT ====
const headerContainer = document.querySelector(".header-container");

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    headerContainer.classList.add("scrolled");
  } else {
    headerContainer.classList.remove("scrolled");
  }
});

// ===================== CAROUSEL (HOME) =====================
document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".carousel-item");
  const indicators = document.querySelectorAll(".indicator");
  const prevButton = document.querySelector(".carousel-prev");
  const nextButton = document.querySelector(".carousel-next");

  let currentSlide = 0;
  const totalSlides = slides.length;

  function showSlide(index) {
    // Hide all slides and deactivate indicators
    slides.forEach((slide) => slide.classList.remove("active"));
    indicators.forEach((indicator) => indicator.classList.remove("active"));

    // Show current slide and activate indicator
    slides[index].classList.add("active");
    indicators[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    showSlide(currentSlide);
  }

  // Event listeners for navigation buttons
  nextButton.addEventListener("click", nextSlide);
  prevButton.addEventListener("click", prevSlide);

  // Event listeners for indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", function () {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      prevSlide();
    } else if (event.key === "ArrowRight") {
      nextSlide();
    }
  });

  // Optional: Auto-advance slides every 5 seconds
  // setInterval(nextSlide, 5000);
});

// ===================== FOOD DETAILS PAGE =====================
function goToDetails(name, price, img, desc) {
  localStorage.setItem("foodName", name);
  localStorage.setItem("foodPrice", price);
  localStorage.setItem("foodImg", img);
  localStorage.setItem("foodDesc", desc);
  window.location.href = "/pages/FoodDetails.html";
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

  document.getElementById("cartTotal").textContent = `Total: Php ${formatPHP(
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

  accountBtn.addEventListener("click", () => {
    accountMenu.classList.toggle("active");
  });

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
      window.location.href = "/pages/CheckoutPage.html";
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

let currentSlide = 0;

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
    menuContainer.innerHTML += `
      <div class="menu-card">
        <img src="${item.url}" alt="${item.name}">
        <div class="card-content">
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc">${item.desc}</p>
          <div class="card-bottom">
            <span class="card-price">₱${item.price || 0}.00</span>
            <button class="order-btn" onclick="goToDetails(
              '${item.name}',
              '${item.price || 0}.00',
              '${item.url}',
              '${item.desc}'
            )">Order</button>
          </div>
        </div>
      </div>
    `;
  });
}

// Event listeners for toggle buttons
document.getElementById("btnMain").addEventListener("click", () => {
  renderMenuByCategory("main");
});

document.getElementById("btnSide").addEventListener("click", () => {
  renderMenuByCategory("side");
});

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
    : new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });

  orderTimestamps[orderID] = timestamp;

  if (dismissedOrders[orderID] === status) return;

  if (orderToasts[orderID]) {
    // Update existing toast
    const toast = orderToasts[orderID];
    toast.querySelector(".status-text").textContent = `UPDATE: OrderID ${orderID} status is now ${status}`;
    toast.querySelector(".status-text").style.color = color;
    toast.querySelector(".status-time").textContent = `Status Changed: ${timestamp}`;
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

  const userOrders = Object.values(data).filter(o => o.userId === user.uid);

  userOrders.forEach(order => {
    if (dismissedOrders[order.orderID] && dismissedOrders[order.orderID] !== order.status) {
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
onValue(ref(db, "homepage/aboutUs"), (snapshot) => {
  aboutUsContent.textContent = snapshot.exists()
    ? snapshot.val().content
    : "About Us section is empty.";
});

// LOG OUT FUNCTIONALITY
const auth = getAuth();

if (confirmLogout) {
  confirmLogout.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "/guest/index.html"; // after logout → guest page
    });
  });
}
const buttons = document.querySelectorAll('.menu-toggle button');

buttons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active from all buttons (optional if only one can be active)
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active to the clicked button
    button.classList.add('active');
  });
});

window.showSlide = showSlide; // allow indicators to work
