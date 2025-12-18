// FIREBASE SETUP
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSpMRcuO5iGPU2hXhnTOMjog29plJwU4U",
  authDomain: "mediterranean-in-velvet-53036.firebaseapp.com",
  databaseURL:
    "https://mediterranean-in-velvet-53036-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-53036",
  storageBucket: "mediterranean-in-velvet-53036.firebasestorage.app",
  messagingSenderId: "1062662016088",
  appId: "1:1062662016088:web:007e0bf8a3e5d0094c8e2d",
  measurementId: "G-TRP0RL8LRL",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const menuRef = ref(db, "menu");
const homeRef = ref(db, "homepage");

const menuGrid = document.getElementById("menuGrid");
const homeGrid = document.getElementById("homeGrid");

// ITEM MODAL VARIABLES
let currentSection = "menu";
let editKey = null;
let base64Image = "";
const fileInput = document.getElementById("imageFile");
const preview = document.getElementById("preview");

const priceInput = document.getElementById("imagePrice");

// Make sure only numbers and one decimal point are allowed
priceInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    .replace(/[^\d.]/g, "") // allow only digits and a single dot
    .replace(/(\..*?)\..*/g, "$1"); // prevent multiple dots
});

// OPEN ADD ITEM MODAL
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

  // Show or hide price input depending on section
  const priceField =
    document.getElementById("imagePrice").closest(".input-group") ||
    document.getElementById("imagePrice");
  if (section === "menu") {
    priceField.style.display = "block";
  } else {
    priceField.style.display = "none";
  }
};

// CLOSE ITEM MODAL
window.closeModal = () =>
  (document.getElementById("itemModal").style.display = "none");

// IMAGE PREVIEW HANDLER
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      base64Image = event.target.result;
      preview.src = base64Image;
    };
    reader.readAsDataURL(file);
  }
});

// SAVE ITEM (ADD OR EDIT)
document.getElementById("saveItem").addEventListener("click", () => {
  const name = document.getElementById("imageName").value.trim();
  const desc = document.getElementById("imageDesc").value.trim();
  const price = document.getElementById("imagePrice").value.trim();
  const category = document.getElementById("itemCategory")?.value || "main"; // default to main

  if (!base64Image || !name || !desc || (currentSection === "menu" && !price)) {
    showFillFieldsModal();
    return;
  }

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  // Build the data object
  const itemData = {
    url: base64Image,
    name,
    desc,
    price,
  };

  // Only add category for menu section
  if (currentSection === "menu") {
    itemData.category = category;
  }

  // Save to Firebase (update or push)
  if (editKey) {
    update(ref(db, `${currentSection}/${editKey}`), itemData);
  } else {
    push(sectionRef, itemData);
  }

  closeModal();
});

// EDIT ITEM
window.editItem = (section, key, url, name, desc, price) => {
  currentSection = section;
  editKey = key;
  document.getElementById("modalTitle").innerText = "Edit Item";
  document.getElementById("imageName").value = name;
  document.getElementById("imageDesc").value = desc;
  document.getElementById("imagePrice").value = price || "";
  preview.src = url;
  base64Image = url;
  document.getElementById("itemModal").style.display = "block";

  // Show or hide price input depending on section
  const priceField =
    document.getElementById("imagePrice").closest(".input-group") ||
    document.getElementById("imagePrice");
  if (section === "menu") {
    priceField.style.display = "block";
  } else {
    priceField.style.display = "none";
  }
};

// DELETE ITEM
let pendingDelete = { section: null, key: null };
window.deleteItem = (section, key) => {
  pendingDelete.section = section;
  pendingDelete.key = key;

  document.getElementById("delete-confirm-message").innerText =
    "Are you sure you want to delete this item?";

  document.getElementById("delete-confirm-modal").style.display = "flex";
};

// RENDER MENU AND HOME ITEMS
function renderItems(refPath, container) {
  onValue(refPath, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((child) => {
      const item = child.val();
      const key = child.key;

      const itemWrapper = document.createElement("div");
      itemWrapper.classList.add("item-wrapper");

      // IMAGE BOX (just the image)
      const box = document.createElement("div");
      box.classList.add("picture-box");
      box.innerHTML = `
      <img src="${item.url}" alt="${item.name}">
      `;

      // DETAILS (outside the picture-box)
      const details = document.createElement("div");
      details.classList.add("item-details");

      if (refPath.key === "menu") {
        const categoryName = getCategoryName(item.category);
        // Show price for menu items
        details.innerHTML = `
    <p class="item-name">${item.name}</p>
    <p class="item-desc"><strong>Description:</strong> ${item.desc}</p>
    <p class="item-price">₱${item.price || 0}</p>
    <p class="item-category"> • ${categoryName}</p>
  `;
      } else {
        // Hide price for homepage items
        details.innerHTML = `
    <p class="item-name">${item.name}</p>
    <p class="item-desc"><strong>Description:</strong> ${item.desc}</p>
  `;
      }

      // append everything in order
      itemWrapper.appendChild(details);

      // then append itemWrapper to container

      // BUTTONS CONTAINER
      const buttonsDiv = document.createElement("div");
      buttonsDiv.classList.add("buttons");

      // EDIT BUTTON FOR MAIN CONTENT
      const editBtn = document.createElement("button");
      editBtn.classList.add("btn-edit");
      editBtn.textContent = "Edit";

      // store safely
      editBtn.dataset.ref = refPath.key;
      editBtn.dataset.key = key;
      editBtn.dataset.url = item.url;
      editBtn.dataset.name = item.name;
      editBtn.dataset.desc = item.desc;
      editBtn.dataset.price = item.price || 0;

      // event listener
      editBtn.addEventListener("click", (e) => {
        const d = e.currentTarget.dataset;
        editItem(d.ref, d.key, d.url, d.name, d.desc, d.price);
      });

      // DELETE BUTTON
      const delBtn = document.createElement("button");
      delBtn.classList.add("btn-delete");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteItem(refPath.key, key));

      // append buttons
      buttonsDiv.append(editBtn, delBtn);

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

const deleteConfirmModal = document.getElementById("delete-confirm-modal");
const cancelDelete = document.getElementById("cancel-delete");

cancelDelete.addEventListener("click", () => {
  deleteConfirmModal.style.display = "none";
  orderKeyToDelete = null;
});

window.addEventListener("click", (e) => {
  if (e.target === deleteConfirmModal)
    deleteConfirmModal.style.display = "none";
});

document.getElementById("cancel-delete").addEventListener("click", () => {
  document.getElementById("delete-confirm-modal").style.display = "none";
});

// DELETE CONFIRMATION FOR ITEM (CONTENTS) DELETION
document.getElementById("confirm-delete").addEventListener("click", () => {
  if (!pendingDelete.section || !pendingDelete.key) return;

  remove(ref(db, `${pendingDelete.section}/${pendingDelete.key}`))
    .then(() => {
      document.getElementById("delete-confirm-modal").style.display = "none";
    })
    .catch((error) => {
      console.error("Delete failed:", error);
    });
});

// ========== MENU CATEGORY TOGGLE ==========
// default
let currentCategory = "main";

document.getElementById("btnMain").addEventListener("click", () => {
  currentCategory = "main";
  updateToggleUI();
  renderMenu();
});

document.getElementById("btnSide").addEventListener("click", () => {
  currentCategory = "side";
  updateToggleUI();
});

function getCategoryName(category) {
  switch (category) {
    case "main":
      return "Main Dish";
    case "side":
      return "Side Dish";
    default:
      return category; // fallback, e.g., "all"
  }
}

function updateToggleUI() {
  document
    .querySelectorAll(".toggle-btn")
    .forEach((btn) => btn.classList.remove("active"));

  const label = document.getElementById("menuCategoryLabel");

  switch (currentCategory) {
    case "main":
      document.getElementById("btnMain").classList.add("active");
      label.textContent = "Main Dish"; // Friendly name
      break;
    case "side":
      document.getElementById("btnSide").classList.add("active");
      label.textContent = "Side Dish"; // Friendly name
      break;
  }
}

// ========== ABOUT US SECTION ==========

// REFERENCES FOR ABOUT US SECTION

// ========== ABOUT US SECTION ==========

const aboutUsRef = ref(db, "aboutUs");
const aboutUsPreview = document.getElementById("aboutUsPreview");

const saveBtn = document.getElementById("aboutUs-save-btn");
const cancelBtn = document.getElementById("aboutUs-cancel-btn");

console.log("✅ admin-manage-content.js loaded");

const editAboutUsBtn = document.getElementById("editAboutUsBtn");
const aboutUsModal = document.getElementById("aboutUsModal");
const aboutUsContent = document.getElementById("aboutUsContent");

if (!editAboutUsBtn) {
  console.error("❌ Edit About Us button not found");
} else {
  editAboutUsBtn.addEventListener("click", () => {
    console.log("✏️ Edit About Us clicked");
    aboutUsModal.style.display = "flex";
  });
}

// realtime preview
onValue(aboutUsRef, (snapshot) => {
  aboutUsPreview.textContent = snapshot.exists() ? snapshot.val().content : "";
});

// open modal
editAboutUsBtn.addEventListener("click", async () => {
  const snapshot = await get(aboutUsRef);
  aboutUsContent.value = snapshot.exists() ? snapshot.val().content : "";
  aboutUsModal.style.display = "flex";
});

// save
saveBtn.addEventListener("click", async () => {
  const newContent = aboutUsContent.value.trim();
  if (!newContent) return alert("Please fill in the About Us text.");

  await update(aboutUsRef, { content: newContent });
  aboutUsModal.style.display = "none";
});

// cancel
cancelBtn.addEventListener("click", () => {
  aboutUsModal.style.display = "none";
});

// click outside modal
aboutUsModal.addEventListener("click", (e) => {
  if (e.target === aboutUsModal) aboutUsModal.style.display = "none";
});
