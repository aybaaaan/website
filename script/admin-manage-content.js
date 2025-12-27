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
  apiKey: "AIzaSyC7FLz6RyFhiNok82uPj3hs7Ev8r7UI3Ik",
  authDomain: "mediterranean-in-velvet-10913.firebaseapp.com",
  databaseURL: "https://mediterranean-in-velvet-10913-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-10913",
  storageBucket: "mediterranean-in-velvet-10913.firebasestorage.app",
  messagingSenderId: "478608649838",
  appId: "1:478608649838:web:cbe6ed90b718037244c07f",
  measurementId: "G-T9TT5N8NJX"
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

priceInput.addEventListener("input", (e) => {
  e.target.value = e.target.value
    .replace(/[^\d.]/g, "") 
    .replace(/(\..*?)\..*/g, "$1"); 
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

  const priceField = document.getElementById("imagePrice").closest(".input-group") || document.getElementById("imagePrice");
  priceField.style.display = section === "menu" ? "block" : "none";
};

window.closeModal = () => (document.getElementById("itemModal").style.display = "none");

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

// SAVE ITEM
document.getElementById("saveItem").addEventListener("click", () => {
  const name = document.getElementById("imageName").value.trim();
  const desc = document.getElementById("imageDesc").value.trim();
  const price = document.getElementById("imagePrice").value.trim();
  const category = document.getElementById("itemCategory")?.value || "main";

  if (!base64Image || !name || !desc || (currentSection === "menu" && !price)) {
    alert("Please fill all fields");
    return;
  }

  const sectionRef = currentSection === "menu" ? menuRef : homeRef;

  const itemData = {
    url: base64Image,
    name,
    desc,
    price,
  };

  if (currentSection === "menu") {
    itemData.category = category;
    // Default status para sa bagong items
    if (!editKey) {
        itemData.status = "enabled"; 
    }
  }

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

  const priceField = document.getElementById("imagePrice").closest(".input-group") || document.getElementById("imagePrice");
  priceField.style.display = section === "menu" ? "block" : "none";
};

// DELETE ITEM
let pendingDelete = { section: null, key: null };
window.deleteItem = (section, key) => {
  pendingDelete.section = section;
  pendingDelete.key = key;
  document.getElementById("delete-confirm-modal").style.display = "flex";
};

// RENDER ITEMS
function renderItems(refPath, container) {
  onValue(refPath, (snapshot) => {
    container.innerHTML = "";
    snapshot.forEach((child) => {
      const item = child.val();
      const key = child.key;

      const itemWrapper = document.createElement("div");
      itemWrapper.classList.add("item-wrapper");

      // Visual feedback kung disabled ang item
      if (refPath.key === "menu" && item.status === "disabled") {
        itemWrapper.style.opacity = "0.6";
      }

      const box = document.createElement("div");
      box.classList.add("picture-box");
      box.innerHTML = `<img src="${item.url}" alt="${item.name}">`;

      const details = document.createElement("div");
      details.classList.add("item-details");

      if (refPath.key === "menu") {
        const categoryName = getCategoryName(item.category);
        const displayStatus = item.status === "disabled" ? 
          `<span style="color:#e67e22; font-weight:bold; font-size:12px; margin-left:5px;">[OUT OF STOCK]</span>` : "";
        
        details.innerHTML = `
          <p class="item-name">${item.name}${displayStatus}</p>
          <p class="item-desc"><strong>Description:</strong> ${item.desc}</p>
          <p class="item-price">₱${item.price || 0}</p>
          <p class="item-category"> • ${categoryName}</p>
        `;
      } else {
        details.innerHTML = `
          <p class="item-name">${item.name}</p>
          <p class="item-desc"><strong>Description:</strong> ${item.desc}</p>
        `;
      }

      const buttonsDiv = document.createElement("div");
      buttonsDiv.classList.add("buttons");

      // EDIT BUTTON
      const editBtn = document.createElement("button");
      editBtn.classList.add("btn-edit");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editItem(refPath.key, key, item.url, item.name, item.desc, item.price));

      // TOGGLE STATUS BUTTON (MENU ONLY)
      if (refPath.key === "menu") {
        const toggleBtn = document.createElement("button");
        const isCurrentlyEnabled = item.status !== "disabled";
        
        toggleBtn.textContent = isCurrentlyEnabled ? "Disable" : "Enable";
        
        // DITO IA-APPLY ANG CLASS PARA SA HOVER EFFECTS
        toggleBtn.className = isCurrentlyEnabled ? "btn-disable" : "btn-enable";
        
        toggleBtn.addEventListener("click", () => {
            const newStatus = isCurrentlyEnabled ? "disabled" : "enabled";
            update(ref(db, `menu/${key}`), { status: newStatus });
        });
        buttonsDiv.appendChild(toggleBtn);
      }

      // DELETE BUTTON
      const delBtn = document.createElement("button");
      delBtn.classList.add("btn-delete");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteItem(refPath.key, key));

      buttonsDiv.appendChild(editBtn);
      buttonsDiv.appendChild(delBtn);

      itemWrapper.appendChild(details);
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

// CONFIRM DELETE
document.getElementById("confirm-delete").addEventListener("click", () => {
  if (!pendingDelete.section || !pendingDelete.key) return;
  remove(ref(db, `${pendingDelete.section}/${pendingDelete.key}`))
    .then(() => { document.getElementById("delete-confirm-modal").style.display = "none"; });
});

document.getElementById("cancel-delete").addEventListener("click", () => {
  document.getElementById("delete-confirm-modal").style.display = "none";
});

// CATEGORY UTILS
function getCategoryName(category) {
  return category === "main" ? "Main Dish" : (category === "side" ? "Side Dish" : category);
}

// TOGGLE UI LOGIC
let currentCategory = "main";
const btnMain = document.getElementById("btnMain");
const btnSide = document.getElementById("btnSide");

if(btnMain && btnSide) {
    btnMain.addEventListener("click", () => { currentCategory = "main"; updateToggleUI(); });
    btnSide.addEventListener("click", () => { currentCategory = "side"; updateToggleUI(); });
}

function updateToggleUI() {
  document.querySelectorAll(".toggle-btn").forEach((btn) => btn.classList.remove("active"));
  const label = document.getElementById("menuCategoryLabel");
  if (currentCategory === "main") {
    btnMain?.classList.add("active");
    if(label) label.textContent = "Main Dish";
  } else {
    btnSide?.classList.add("active");
    if(label) label.textContent = "Side Dish";
  }
}

// ABOUT US logic
const aboutUsRef = ref(db, "aboutUs");
const aboutUsModal = document.getElementById("aboutUsModal");
const aboutUsContent = document.getElementById("aboutUsContent");

document.getElementById("editAboutUsBtn")?.addEventListener("click", async () => {
    const snapshot = await get(aboutUsRef);
    aboutUsContent.value = snapshot.exists() ? snapshot.val().content : "";
    aboutUsModal.style.display = "flex";
});

document.getElementById("aboutUs-save-btn")?.addEventListener("click", async () => {
    await update(aboutUsRef, { content: aboutUsContent.value.trim() });
    aboutUsModal.style.display = "none";
});

document.getElementById("aboutUs-cancel-btn")?.addEventListener("click", () => {
    aboutUsModal.style.display = "none";
});