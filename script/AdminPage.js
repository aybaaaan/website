function showSection(id) {
  document.querySelectorAll("main section").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// Logout Modal Logic
const logoutBtn = document.getElementById("btn-logout");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancel-logout");
const confirmLogout = document.getElementById("confirm-logout");

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutModal.style.display = "block";
});

cancelLogout.addEventListener("click", () => {
  logoutModal.style.display = "none";
});

confirmLogout.addEventListener("click", () => {
  window.location.href = "/pages/LoginPage.html";
});

window.addEventListener("click", (e) => {
  if (e.target === logoutModal) {
    logoutModal.style.display = "none";
  }
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

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

const menuRef = ref(db, "menu");
const homeRef = ref(db, "homepage");

const menuGrid = document.getElementById("menuGrid");
const homeGrid = document.getElementById("homeGrid");

// ADD ITEM Modal logic =================================
let currentSection = "menu";
let editKey = null;

window.openAddModal = (section = "menu") => {
  currentSection = section;
  editKey = null;
  document.getElementById("modalTitle").innerText = "Add Item";
  document.getElementById("imageUrl").value = "";
  document.getElementById("imageName").value = "";
  document.getElementById("imageDesc").value = "";
  document.getElementById("imagePrice").value = "";
  document.getElementById("preview").src = "";
  document.getElementById("itemModal").style.display = "block";
};

window.closeModal = () => {
  document.getElementById("itemModal").style.display = "none";
};

window.previewImage = (event) => {
  document.getElementById("preview").src = event.target.value;
};

// EDIT ITEM Modal Logic ==============================
window.editItem = (section, key, url, name, desc, price) => {
  currentSection = section;
  editKey = key;
  document.getElementById("modalTitle").innerText = "Edit Item";
  document.getElementById("imageUrl").value = url;
  document.getElementById("imageName").value = name;
  document.getElementById("imageDesc").value = desc;
  document.getElementById("imagePrice").value = price;
  document.getElementById("preview").src = url;
  document.getElementById("itemModal").style.display = "block";
};

// Save item (add or update)
document.getElementById("saveItem").addEventListener("click", () => {
  const url = document.getElementById("imageUrl").value;
  const name = document.getElementById("imageName").value;
  const desc = document.getElementById("imageDesc").value;
  const price = document.getElementById("imagePrice").value;

  if (!url || !name || !desc || !price) return alert("Please fill all fields");

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  if (editKey) {
    update(ref(db, currentSection + "/" + editKey), {
      url,
      name,
      desc,
      price,
    });
  } else {
    push(sectionRef, { url, name, desc, price });
  }

  closeModal();
});

// Delete item ==========================================
window.deleteItem = (section, key) => {
  remove(ref(db, section + "/" + key));
};

// Render items =========================================
function renderItems(refPath, container) {
  onValue(refPath, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((child) => {
      const item = child.val();
      const key = child.key;

      // Create the wrapper for each item
      const itemWrapper = document.createElement("div");
      itemWrapper.classList.add("item-wrapper"); // new wrapper for picture + buttons

      // Create picture box
      const box = document.createElement("div");
      box.classList.add("picture-box");
      box.innerHTML = `
        <img src="${item.url}" alt="${item.name}">
        <div class="overlay">
          <p class="item-name">${item.name}</p>
          <p class="item-desc">${item.desc}</p>
          <p class="item-price">₱${item.price || 0}</p>
        </div>
      `;

      // Create buttons div (separate from the picture)
      const buttonsDiv = document.createElement("div");
      buttonsDiv.classList.add("buttons");
      buttonsDiv.innerHTML = `
        <button class="btn-edit" onclick="editItem('${refPath.key}','${key}','${
        item.url
      }','${item.name}','${item.desc}','${item.price || 0}')">Edit</button>
        <button class="btn-delete" onclick="deleteItem('${
          refPath.key
        }','${key}')">Delete</button>
      `;

      // Append both to wrapper
      itemWrapper.appendChild(box);
      itemWrapper.appendChild(buttonsDiv);

      // Add wrapper to container
      container.appendChild(itemWrapper);
    });

    // Keep the "+" add box at the end
    const plus = document.createElement("div");
    plus.classList.add("picture-box", "plus");
    plus.innerText = "+";
    plus.onclick = () => openAddModal(refPath.key);
    container.appendChild(plus);
  });
}

renderItems(menuRef, menuGrid);
renderItems(homeRef, homeGrid);

// ORDERS LIST ===============================================
const ordersRef = ref(db, "Order");
const ordersContainer = document.getElementById("ordersContainer");

onValue(ordersRef, (snapshot) => {
  ordersContainer.innerHTML = "";

  snapshot.forEach((child) => {
    const data = child.val();
    const row = document.createElement("div");
    row.classList.add("order-card");

    // Generate the list of ordered foods
    let foodListHTML = "";
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach((item) => {
        foodListHTML += `
          <li>
            ${item.name} — Qty: ${item.qty} — ₱${(
          item.price * item.qty
        ).toFixed(2)}
          </li>
        `;
      });
    } else {
      foodListHTML = "<li>No food items found.</li>";
    }

    // Format timestamp
    const formattedTime = data.timestamp
      ? new Date(data.timestamp).toLocaleString()
      : "N/A";

    row.innerHTML = `
  <div class="order-details">
    <h3>${data.name || "Unknown"}</h3>
    <p><strong>Address:</strong> ${data.address || "N/A"}</p>
    <p><strong>Contact:</strong> ${data.contact || "N/A"}</p>
    <p><strong>Payment Method:</strong> ${data.payment || "N/A"}</p>
    
    <div class="food-section">
      <button class="food-toggle">Order Details ▼</button>
      <div class="order-food-list">
        <ul>${foodListHTML}</ul>
      </div>
    </div>

    <p><strong>Total:</strong> ₱${
      data.total ? data.total.toFixed(2) : "0.00"
    }</p>
    <p><strong>Time:</strong> ${formattedTime}</p>
  </div>

  <div class="order-actions">
    <button class="btn-confirm">Confirm</button>
    <button class="btn-delete">Delete</button>
  </div>
`;

    const foodToggle = row.querySelector(".food-toggle");
    const foodList = row.querySelector(".order-food-list");
    foodToggle.addEventListener("click", () => {
      foodList.classList.toggle("active");
      foodToggle.textContent = foodList.classList.contains("active")
        ? "Order Details ▲"
        : "Order Details ▼";
    });

    row.querySelector(".btn-confirm").addEventListener("click", () => {
      alert(`Order for ${data.name} marked as confirmed!`);
    });

    row.querySelector(".btn-delete").addEventListener("click", () => {
      const confirmDelete = confirm(`Delete order for ${data.name}?`);
      if (confirmDelete) {
        remove(ref(db, "Order/" + child.key));
      }
    });

    ordersContainer.appendChild(row);
  });
});
