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

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

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

const announcementRef = ref(db, "Announcements");

// ANNOUNCEMENT MODAL VARIABLES
let currentAnnouncementKey = null;
const announcementModal = document.getElementById("announcementModal");
const announcementTitleInput = document.getElementById("announcementTitle");
const announcementContentInput = document.getElementById("announcementContent");
const saveAnnouncementBtn = document.getElementById("saveAnnouncement");
const announcementContainer = document.getElementById("announcementContainer");

// OPEN ADD ANNOUNCEMENT MODAL
window.openAnnouncementModal = () => {
  currentAnnouncementKey = null;
  document.getElementById("announcementModalTitle").innerText =
    "Add New Announcement";
  announcementTitleInput.value = "";
  announcementContentInput.value = "";
  announcementModal.style.display = "flex";
};

// CLOSE ANNOUNCEMENT MODAL
window.closeAnnouncementModal = () => {
  announcementModal.style.display = "none";
};

// EDIT ANNOUNCEMENT
window.editAnnouncement = (key, title, content) => {
  currentAnnouncementKey = key;
  document.getElementById("announcementModalTitle").innerText =
    "Edit Announcement";
  announcementTitleInput.value = title;
  announcementContentInput.value = content;
  announcementModal.style.display = "flex";
};

// DELETE ANNOUNCEMENT - Reusing existing delete modal
window.deleteAnnouncement = (key) => {
  // Set a new section identifier for the delete logic
  pendingDelete.section = "announcements";
  pendingDelete.key = key;

  document.getElementById("delete-confirm-message").innerText =
    "Are you sure you want to delete this announcement?";
  document.getElementById("delete-confirm-modal").style.display = "flex";
};

// SAVE ANNOUNCEMENT (ADD OR EDIT)
saveAnnouncementBtn.addEventListener("click", () => {
  const title = announcementTitleInput.value.trim();
  const content = announcementContentInput.value.trim();

  if (!title || !content) {
    alert("Please fill in both the subject and content for the announcement.");
    return;
  }

  const announcementData = {
    title: title,
    content: content,
    timestamp: Date.now(), // Add a timestamp for ordering
  };

  if (currentAnnouncementKey) {
    // Update existing
    update(
      ref(db, `Announcements/${currentAnnouncementKey}`),
      announcementData
    );
  } else {
    // Add new
    push(announcementRef, announcementData);
  }

  window.closeAnnouncementModal();
});

// ... [Keep existing saveItem, editItem, deleteItem functions] ...

// RENDER ANNOUNCEMENTS
onValue(announcementRef, (snapshot) => {
  announcementContainer.innerHTML = "";
  if (!snapshot.exists()) {
    announcementContainer.innerHTML = "<p>No announcements found.</p>";
    return;
  }

  const announcements = [];
  snapshot.forEach((child) => {
    const item = child.val();
    item.key = child.key;
    announcements.push(item);
  });

  // Sort newest first
  announcements.sort((a, b) => b.timestamp - a.timestamp);

  announcements.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("announcement-card");

    const date = item.timestamp
      ? new Date(item.timestamp).toLocaleString()
      : "N/A";

    // Add innerHTML safely
    card.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.content.replace(/\n/g, "<br>")}</p>
      <small style="color: #666; font-style: italic;">Posted: ${date}</small>
      <div class="announcement-actions">
        <button class="btn-edit">Edit</button>
        <button class="btn-delete">Delete</button>
      </div>
    `;

    // Attach edit event
    const editBtn = card.querySelector(".btn-edit");
    editBtn.addEventListener("click", () => {
      window.editAnnouncement(item.key, item.title, item.content);
    });

    // Attach delete event
    const deleteBtn = card.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", () => {
      window.deleteAnnouncement(item.key);
    });

    announcementContainer.appendChild(card);
  });
});

// UPDATE: Handle CONFIRM DELETE button for all sections
document.getElementById("confirm-delete").addEventListener("click", () => {
  if (pendingDelete.section && pendingDelete.key) {
    const sectionName = pendingDelete.section;
    let path;

    // Determine the top-level node name
    const topLevelNode =
      sectionName === "announcements" ? "Announcements" : sectionName;

    // Construct the path
    path = `${topLevelNode}/${pendingDelete.key}`;

    if (path) {
      remove(ref(db, path))
        .then(() => console.log(`${sectionName} item deleted.`))
        .catch((error) => console.error("Deletion failed: ", error));
    } // Reset and close

    pendingDelete = { section: null, key: null };
    document.getElementById("delete-confirm-modal").style.display = "none";
  }
});

document.getElementById("cancel-delete").addEventListener("click", () => {
  document.getElementById("delete-confirm-modal").style.display = "none";
});

// DELETE ITEM
let pendingDelete = { section: null, key: null };
window.deleteItem = (section, key) => {
  pendingDelete.section = section;
  pendingDelete.key = key;

  document.getElementById("delete-confirm-message").innerText =
    "Are you sure you want to delete this item?";

  document.getElementById("delete-confirm-modal").style.display = "flex";
};
