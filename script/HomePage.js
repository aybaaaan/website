window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
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

// ===================== MENU CAROUSEL (HORIZONTAL) =====================
let currentIndex = 0;

function scrollMenu(direction) {
  const cards = document.querySelectorAll(".menu-card");
  const container = document.getElementById("menuCards");

  if (cards.length === 0) return;

  const cardWidth = cards[0].offsetWidth + 12; // card + gap
  const totalCards = cards.length;

  const visibleCards = Math.floor(
    document.querySelector(".menu-cards-container").offsetWidth / cardWidth
  );

  currentIndex += direction;

  // prevent scrolling too far
  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > totalCards - visibleCards) {
    currentIndex = totalCards - visibleCards;
  }

  const offset = -currentIndex * cardWidth;
  container.style.transform = `translateX(${offset}px)`;
}

window.scrollMenu = scrollMenu;
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

  // Toggle open/close
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
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
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  databaseURL:
    "https://webusiteu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd",
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
            <div class="carousel-item-caption">
              <h1>${item.name}</h1>
              <p>${item.desc}</p>
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

// ================== LOAD MENU CARDS ==================
onValue(ref(db, "menu"), (snapshot) => {
  const data = snapshot.val();
  const menuContainer = document.getElementById("menuCards");
  menuContainer.innerHTML = "";

  if (data) {
    Object.values(data).forEach((item) => {
      menuContainer.innerHTML += `
      <div class="menu-card">
        <img src="${item.url}" alt="${item.name}">
        <div class="card-content">
          <h3 class="card-title">${item.name}</h3>
          <p>${item.desc}</p>
          <p class="card-price">₱${item.price || 0}</p>
          <button class="order-btn" onclick="goToDetails(
            '${item.name}',
            '${item.price || 0}',
            '${item.url}',
            '${item.desc}'
          )">Order</button>
        </div>
      </div>
    `;
    });
  }
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

window.showSlide = showSlide; // allow indicators to work
