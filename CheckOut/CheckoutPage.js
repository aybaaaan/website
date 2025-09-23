// ===================== CHECKOUT PAGE =====================
const checkoutContainer = document.getElementById("checkoutContainer");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const addMoreBtn = document.getElementById("addMoreBtn");
const proceedBtn = document.getElementById("proceedBtn");

// Load orders from localStorage
let orders = JSON.parse(localStorage.getItem("cart")) || [];

// Update subtotal and total
function updateTotals() {
  let subtotal = orders.reduce((sum, item) => sum + item.price * item.qty, 0);
  subtotalEl.textContent = subtotal.toFixed(2);
  totalEl.textContent = subtotal.toFixed(2);
}

// Render all orders dynamically
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
        <p>Qty: <span class="quantity">${item.qty}</span></p>
        <p>Price: Php <span class="priceNum">${(item.price * item.qty).toFixed(
          2
        )}</span></p>
        <div class="quantity-control">
          <button class="decreaseBtn">-</button>
          <button class="increaseBtn">+</button>
        </div>
        <button class="removeBtn">Remove</button>
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
      orderDiv.remove();
      updateTotals();
      localStorage.setItem("cart", JSON.stringify(orders));
      if (orders.length === 0)
        checkoutContainer.innerHTML = "<p>Your cart is empty!</p>";
    });
  });

  updateTotals();
}

// Add more items
addMoreBtn.addEventListener("click", () => {
  window.location.href = "/HomePage/Homepage.html?cart=open#menu";
});

// Proceed to checkout
// ===================== MODAL LOGIC =====================
const modal = document.getElementById("checkoutModal");
const closeModal = document.getElementById("closeModal");
const deliveryTab = document.getElementById("deliveryTab");
const formFields = document.getElementById("formFields");
const checkoutForm = document.getElementById("checkoutForm");

// Default: Delivery fields
function renderDeliveryFields() {
  formFields.innerHTML = `
    <input type="text" placeholder="Name" required>
    <input type="text" placeholder="Address" required>
    <input type="text" placeholder="Contact Number" required>
    <label class="payment-label">Payment Method:</label>
    <select required>
      <option value="" disabled selected>Select Payment</option>
      <option value="cod">Cash on Delivery</option>
      <option value="gcash">GCash QR Code</option>
    </select>
  `;
}

// Toggle tabs

// Open modal on Proceed button
proceedBtn.addEventListener("click", () => {
  if (orders.length === 0) {
    alert("Your order is empty!");
    return;
  }

  modal.style.display = "flex";
  renderDeliveryFields(); // default tab
});

// Close modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Close when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Submit order
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // Show success popup instead of clearing immediately
  const successModal = document.getElementById("successModal");
  successModal.style.display = "flex";
});

// Handle return home button
document.getElementById("returnHomeBtn").addEventListener("click", () => {
  // Clear orders
  orders = [];
  localStorage.removeItem("cart");

  // Reset checkout display
  checkoutContainer.innerHTML = "<p>Your cart is empty!</p>";
  subtotalEl.textContent = "0.00";
  totalEl.textContent = "0.00";

  // Close success popup
  document.getElementById("successModal").style.display = "none";

  // Redirect to homepage
  window.location.href = "/HomePage/HomePage.html#home";
});

// Initialize checkout page
renderOrders();
