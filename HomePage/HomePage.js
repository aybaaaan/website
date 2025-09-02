let cart = [];

//when clicking the cart icon
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



function addToCart(name, price) {
    let item = cart.find(f => f.name === name);
    if (item) {
        item.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    renderCart();
    toggleCart();
}

function renderCart() {
    let cartItems = document.getElementById("cartItems");
    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty!</p>";
    } else {
        cartItems.innerHTML = cart.map(item => {
            total += item.price * item.qty;
            return `<div class="cart-item">
                        <p>${item.name} x${item.qty}</p>
                        <p>Php ${item.price * item.qty}</p>
                    </div>`;
        }).join("");
    }

    document.getElementById("cartTotal").textContent = `Total: Php ${total}`;
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


