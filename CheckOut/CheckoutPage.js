let quantity = 1;
let pricePerItem = 0;

// DOM elements
const qtyEl = document.getElementById("quantity");
const priceEl = document.getElementById("price");
const subtotalEl = document.getElementById("subtotal");
const totalEl = document.getElementById("total");
const orderItem = document.getElementById("orderItem");

// Update prices
function updatePrices() {
  if (quantity <= 0) {
    subtotalEl.textContent = "0.00";
    totalEl.textContent = "0.00";
    priceEl.textContent = "0.00";
    return;
  }
  let totalPrice = (pricePerItem * quantity).toFixed(2);
  priceEl.textContent = totalPrice;
  subtotalEl.textContent = totalPrice;
  totalEl.textContent = totalPrice;
}

// Quantity buttons
document.getElementById("increaseBtn").addEventListener("click", () => {
  quantity++;
  qtyEl.textContent = quantity;
  updatePrices();
});

document.getElementById("decreaseBtn").addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;
    qtyEl.textContent = quantity;
    updatePrices();
  }
});

// Remove item
document.getElementById("removeBtn").addEventListener("click", () => {
  orderItem.remove();
  subtotalEl.textContent = "0.00";
  totalEl.textContent = "0.00";
  alert("Order removed. Your cart is empty now.");
});

// Add more items
document.getElementById("addMoreBtn").addEventListener("click", () => {
  alert("Adding more items...");
  window.location.href = "MenuPage.html";
});

// Proceed to checkout
document.getElementById("proceedBtn").addEventListener("click", () => {
  if (!document.body.contains(orderItem)) {
    alert("Your order is empty!");
    return;
  }
  alert("Submitting your order to the client...");
});
