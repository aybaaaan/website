// ===============================
// SECTION SWITCHING
// ===============================
function showSection(id) {
  document.querySelectorAll("main section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===============================
// LOGOUT MODAL LOGIC
// ===============================
const logoutBtn = document.getElementById("btn-logout");
const logoutModal = document.getElementById("logoutModal"); // fixed ID
const cancelLogout = document.getElementById("cancel-logout");
const confirmLogout = document.getElementById("confirm-logout");

logoutBtn.addEventListener("click", e => {
  e.preventDefault();
  logoutModal.style.display = "flex";
});

cancelLogout.addEventListener("click", () => logoutModal.style.display = "none");
confirmLogout.addEventListener("click", () => window.location.href = "/pages/LoginPage.html");

window.addEventListener("click", e => {
  if (e.target === logoutModal) logoutModal.style.display = "none";
});

// ===============================
// FIREBASE SETUP
// ===============================
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

// ===============================
// ITEM MODAL VARIABLES
// ===============================
let currentSection = "menu";
let editKey = null;
let base64Image = "";
const fileInput = document.getElementById("imageFile");
const preview = document.getElementById("preview");

// ===============================
// OPEN ADD ITEM MODAL
// ===============================
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

// ===============================
// CLOSE ITEM MODAL
// ===============================
window.closeModal = () => document.getElementById("itemModal").style.display = "none";

// ===============================
// IMAGE PREVIEW HANDLER
// ===============================
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

// ===============================
// SAVE ITEM (ADD OR EDIT)
// ===============================
document.getElementById("saveItem").addEventListener("click", () => {
  const name = document.getElementById("imageName").value.trim();
  const desc = document.getElementById("imageDesc").value.trim();
  const price = document.getElementById("imagePrice").value.trim();

  if (!base64Image || !name || !desc || !price) {
    showFillFieldsModal(); // ✅ replaced alert()
    return;
  }

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  if (editKey) {
    update(ref(db, `${currentSection}/${editKey}`), { url: base64Image, name, desc, price });
  } else {
    push(sectionRef, { url: base64Image, name, desc, price });
  }

  closeModal();
});

// ===============================
// EDIT ITEM
// ===============================
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

// ===============================
// DELETE ITEM
// ===============================
window.deleteItem = (section, key) => remove(ref(db, `${section}/${key}`));

// ===============================
// RENDER MENU AND HOME ITEMS
// ===============================
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

    // ADD BUTTON
    const plus = document.createElement("div");
    plus.classList.add("picture-box", "plus");
    plus.innerText = "+";
    plus.onclick = () => openAddModal(refPath.key);
    container.appendChild(plus);
  });
}

renderItems(menuRef, menuGrid);
renderItems(homeRef, homeGrid);

// RENDER ORDERS
onValue(ordersRef, snapshot => {
  ordersContainer.innerHTML = "";
  snapshot.forEach(child => {
    const data = child.val();
    const row = document.createElement("div");
    row.classList.add("order-card");

    let foodListHTML = "";
    if (data.orders && Array.isArray(data.orders)) {
      data.orders.forEach(item => {
        foodListHTML += `<li>${item.name} — Qty: ${item.qty} — ₱${(item.price * item.qty).toFixed(2)}</li>`;
      });
    } else {
      foodListHTML = "<li>No food items found.</li>";
    }

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

    row.querySelector(".btn-confirm").addEventListener("click", () => {
      showCustomerOrderPopup(`Order for ${data.name} marked as confirmed!`);
    });

   row.querySelector(".btn-delete").addEventListener("click", () => {
  showDeleteConfirmPopup(`Are you sure you want to delete the order for ${data.name}?`, child.key);
  });


    ordersContainer.appendChild(row);
  });
});

// CUSTOM POPUP MODALS (REPLACE ALERTS)

// Fill Fields / Image Modal
const fillFieldsModal = document.getElementById("fill-fields-images");
const closeFillFields = document.getElementById("close-fill-fields");

function showFillFieldsModal() {
  fillFieldsModal.style.display = "flex";
}

closeFillFields.addEventListener("click", () => {
  fillFieldsModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === fillFieldsModal) fillFieldsModal.style.display = "none";
});

// Customer Order Confirmation Modal
const customerOrderModal = document.getElementById("customer-order-popup");
const customerOrderMessage = document.getElementById("customer-order-message");
const closeCustomerOrder = document.getElementById("close-customer-order");

function showCustomerOrderPopup(message) {
  customerOrderMessage.textContent = message;
  customerOrderModal.style.display = "flex";
}

closeCustomerOrder.addEventListener("click", () => {
  customerOrderModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === customerOrderModal) customerOrderModal.style.display = "none";
});


// DELETE CONFIRMATION MODAL

const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const deleteConfirmMessage = document.getElementById("delete-confirm-message");
const cancelDelete = document.getElementById("cancel-delete");
const confirmDelete = document.getElementById("confirm-delete");

let orderKeyToDelete = null;

function showDeleteConfirmPopup(message, orderKey) {
  deleteConfirmMessage.textContent = message;
  orderKeyToDelete = orderKey;
  deleteConfirmModal.style.display = "flex";
}

cancelDelete.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
  orderKeyToDelete = null;
});

confirmDelete.addEventListener("click", () => {
  if (orderKeyToDelete) remove(ref(db, "Order/" + orderKeyToDelete));
  deleteConfirmModal.style.display = "none";
  orderKeyToDelete = null;
});

window.addEventListener("click", e => {
  if (e.target === deleteConfirmModal) deleteConfirmModal.style.display = "none";
});

