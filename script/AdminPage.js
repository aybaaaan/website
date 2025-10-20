// Section switching
function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// Logout modal logic
const logoutBtn = document.getElementById("btn-logout");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancel-logout");
const confirmLogout = document.getElementById("confirm-logout");

logoutBtn.addEventListener("click", e => {
  e.preventDefault();
  logoutModal.style.display = "block";
});
cancelLogout.addEventListener("click", () => logoutModal.style.display = "none");
confirmLogout.addEventListener("click", () => window.location.href = "/pages/LoginPage.html");
window.addEventListener("click", e => { if (e.target === logoutModal) logoutModal.style.display = "none"; });

// Firebase setup
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getDatabase, ref, onValue, push, update, remove } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  databaseURL: "https://webusiteu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const menuRef = ref(db, "menu");
const homeRef = ref(db, "homepage");
const ordersRef = ref(db, "Order");

const menuGrid = document.getElementById("menuGrid");
const homeGrid = document.getElementById("homeGrid");
const ordersContainer = document.getElementById("ordersContainer");

// Modal variables
let currentSection = "menu";
let editKey = null;
let base64Image = "";
const fileInput = document.getElementById("imageFile");
const preview = document.getElementById("preview");

// Open modal
window.openAddModal = (section = "menu") => {
  currentSection = section;
  editKey = null;
  preview.src = "";
  base64Image = "";
  fileInput.value = "";
  document.getElementById("imageName").value = "";
  document.getElementById("imageDesc").value = "";
  document.getElementById("imagePrice").value = "";
  document.getElementById("modalTitle").innerText = "Add Item";
  document.getElementById("itemModal").style.display = "block";
};

// Close modal
window.closeModal = () => document.getElementById("itemModal").style.display = "none";

// Preview selected file
fileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = event => {
      base64Image = event.target.result;
      preview.src = base64Image;
    };
    reader.readAsDataURL(file);
  }
});

// Save item
document.getElementById("saveItem").addEventListener("click", () => {
  const name = document.getElementById("imageName").value.trim();
  const desc = document.getElementById("imageDesc").value.trim();
  const price = document.getElementById("imagePrice").value.trim();

  if (!base64Image || !name || !desc || !price)
    return alert("Please fill all fields and select an image.");

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  if (editKey) {
    update(ref(db, currentSection + "/" + editKey), {
      url: base64Image,
      name,
      desc,
      price
    });
  } else {
    push(sectionRef, {
      url: base64Image,
      name,
      desc,
      price
    });
  }

  closeModal();
});

// Edit item
window.editItem = (section, key, url, name, desc, price) => {
  currentSection = section;
  editKey = key;
  document.getElementById("modalTitle").innerText = "Edit Item";
  document.getElementById("imageName").value = name;
  document.getElementById("imageDesc").value = desc;
  document.getElementById("imagePrice").value = price;
  preview.src = url;
  base64Image = url;
  document.getElementById("itemModal").style.display = "block";
};

// Delete item
window.deleteItem = (section, key) => remove(ref(db, section + "/" + key));

// Render items
function renderItems(refPath, container) {
  onValue(refPath, snapshot => {
    container.innerHTML = "";
    snapshot.forEach(child => {
      const item = child.val();
      const key = child.key;

      const itemWrapper = document.createElement("div");
      itemWrapper.classList.add("item-wrapper");

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

      const buttonsDiv = document.createElement("div");
      buttonsDiv.classList.add("buttons");
      buttonsDiv.innerHTML = `
        <button class="btn-edit" onclick="editItem('${refPath.key}','${key}','${item.url}','${item.name}','${item.desc}','${item.price || 0}')">Edit</button>
        <button class="btn-delete" onclick="deleteItem('${refPath.key}','${key}')">Delete</button>
      `;

      itemWrapper.appendChild(box);
      itemWrapper.appendChild(buttonsDiv);
      container.appendChild(itemWrapper);
    });

    const plus = document.createElement("div");
    plus.classList.add("picture-box", "plus");
    plus.innerText = "+";
    plus.onclick = () => openAddModal(refPath.key);
    container.appendChild(plus);
  });
}

renderItems(menuRef, menuGrid);
renderItems(homeRef, homeGrid);

// Render Orders
onValue(ordersRef, snapshot => {
  ordersContainer.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const row = document.createElement("div");
    row.classList.add("order-card");

    let foodListHTML = "";
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach(item => {
        foodListHTML += `<li>${item.name} — Qty: ${item.qty} — ₱${(item.price*item.qty).toFixed(2)}</li>`;
      });
    } else foodListHTML = "<li>No food items found.</li>";

    const formattedTime = data.timestamp ? new Date(data.timestamp).toLocaleString() : "N/A";

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

        <p><strong>Total:</strong> ₱${data.total ? data.total.toFixed(2) : "0.00"}</p>
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
      foodToggle.textContent = foodList.classList.contains("active") ? "Order Details ▲" : "Order Details ▼";
    });

    row.querySelector(".btn-confirm").addEventListener("click", () => alert(`Order for ${data.name} marked as confirmed!`));

    row.querySelector(".btn-delete").addEventListener("click", () => {
      if (confirm(`Delete order for ${data.name}?`)) remove(ref(db, "Order/" + child.key));
    });

    ordersContainer.appendChild(row);
  });
});
