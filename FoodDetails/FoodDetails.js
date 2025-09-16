// Load food details when the page opens
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("foodName").textContent = localStorage.getItem("foodName") || "Food Name";
  document.getElementById("foodPrice").textContent = localStorage.getItem("foodPrice") || "0";
  document.getElementById("foodDesc").textContent = localStorage.getItem("foodDesc") || "This is a delicious Mediterranean dish.";
  document.getElementById("foodImage").src = localStorage.getItem("foodImg") || "";
});

// Go back to HomePage (menu section)
function goBack() {
  window.location.href = "../HomePage/HomePage.html#menu";
}

function addToCartFromDetails() {
  const name = localStorage.getItem("foodName");
  const price = parseFloat(localStorage.getItem("foodPrice"));
  const qtyInput = document.getElementById("qty");
  const qty = parseInt(qtyInput.value, 10);

  if (!qty || qty < 1) {
    alert("Please enter a valid quantity.");
    qtyInput.focus();
    return;
  }

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  // Redirect back to HomePage and open cart sidebar
  window.location.href = "../HomePage/HomePage.html?cart=open";
}
