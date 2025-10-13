// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");
});

// Reorder function
function reorder(name, qty, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find((item) => item.name === name);
  if (existing) existing.qty += qty;
  else cart.push({ name, qty, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${qty} x ${name} added to your cart!`);
  window.location.href = "/pages/CheckoutPage.html";
}
