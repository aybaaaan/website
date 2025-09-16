document.addEventListener('DOMContentLoaded', function() {
      const slides = document.querySelectorAll('.carousel-slide');
      const indicators = document.querySelectorAll('.indicator');
      const prevButton = document.querySelector('.carousel-prev');
      const nextButton = document.querySelector('.carousel-next');
      let currentSlide = 0;
      const totalSlides = slides.length;

      function showSlide(index) {
        // Hide all slides and deactivate indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Show current slide and activate indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');
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
      nextButton.addEventListener('click', nextSlide);
      prevButton.addEventListener('click', prevSlide);

      // Event listeners for indicators
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
          currentSlide = index;
          showSlide(currentSlide);
        });
      });

      // Keyboard navigation
      document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
          prevSlide();
        } else if (event.key === 'ArrowRight') {
          nextSlide();
        }
      });

      // Optional: Auto-advance slides every 5 seconds
      setInterval(nextSlide, 5000);
    });

let cart = [];

//food details page

//when clicking the Food Details button
function goToDetails(name, price, img, desc) {
  localStorage.setItem("foodName", name);
  localStorage.setItem("foodPrice", price);
  localStorage.setItem("foodImg", img);
  localStorage.setItem("foodDesc", desc); // Placeholder description
  window.location.href = "../FoodDetails/FoodDetails.html"; 
}

//back to menu from home
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


document.addEventListener("DOMContentLoaded", () => {
  renderCart(); // kapag bumalik galing FoodDetails, cart will persist
});

function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.qty} x ${item.name} - Php ${item.price * item.qty}`;
    cartItemsContainer.appendChild(li);
  });
}




//when clicking the cart icons
function toggleCart() {
    document.getElementById("cartSidebar").classList.toggle("active");
    //renderCart(); - no interface pa
}

//exit function
function closeCart() {
    document.getElementById("cartSidebar").classList.remove("active");
}

// Bind the close button after DOM loads
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("closeCart").addEventListener("click", closeCart);
});


//Carousel Sa Menu Page
let currentIndex = 0;
const cardWidth = 320; // 300px + 20px gap
const visibleCards = 3;
const totalCards = 5;

function scrollMenu(direction) {
    const container = document.getElementById("menuCards");
    const maxIndex = totalCards - visibleCards;
    
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = 0;
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    
    const offset = -currentIndex * cardWidth;
    container.style.transform = `translateX(${offset}px)`;
}

function removeFromCart(name) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter(item => item.name !== name);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

// Add delete button to each cart item in renderCart
const originalRenderCart = renderCart;
renderCart = function() {
    const cartItems = document.getElementById("cartItems");
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `<li class="empty">Your cart is empty!</li>`;
    } else {
        cartItems.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            return `
                <li class="cart-item">
                    <p><strong>${item.name}</strong> x${item.qty}</p>
                    <p>Php ${formatPHP(itemTotal)}</p>
                    <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">Delete</button>
                </li>
            `;
        }).join("");
    }

    document.getElementById("cartTotal").textContent = `Total: Php ${formatPHP(total)}`;
};

function addToCart(name, price) {
  const cleanPrice = Number(String(price).replace(/[^0-9.]/g, "")) || 0;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price: cleanPrice, qty: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
  document.getElementById("cartSidebar").classList.add("active");
}


function renderCart() {
  const cartItems = document.getElementById("cartItems");
  let total = 0;

  // always pull fresh from localStorage
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart.length === 0) {
    cartItems.innerHTML = `<li class="empty">Your cart is empty!</li>`;
  } else {
    cartItems.innerHTML = cart.map(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      return `
        <li class="cart-item">
          <p><strong>${item.name}</strong> x${item.qty}</p>
          <p>Php ${formatPHP(itemTotal)}</p>
          <button class="remove-btn" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">Delete</button>
        </li>
      `;
    }).join("");
  }

  document.getElementById("cartTotal").textContent = `Total: Php ${formatPHP(total)}`;
}

function formatPHP(n) {
  return Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

























//wala pa to

/*function goToReview() {
    document.getElementById("cartSidebar").classList.remove("active");
    document.getElementById("reviewOrderPage").classList.remove("hidden");
    renderReview();
}*/

/*function closeReview() {
    document.getElementById("reviewOrderPage").classList.add("hidden");
}*/

/*function renderReview() {
    let reviewItems = document.getElementById("reviewItems");
    let total = 0;

    if (cart.length === 0) {
        reviewItems.innerHTML = "<p>No items yet.</p>";
    } else {
        reviewItems.innerHTML = cart.map(item => {
            total += item.price * item.qty;
            return `<div class="review-item">
                        <span>${item.name}</span>
                        <span>Qty: ${item.qty}</span>
                        <span>Php ${item.price * item.qty}</span>
                    </div>`;
        }).join("");
    }

    document.getElementById("reviewTotal").textContent = `Total: Php ${total}`;
}*/


