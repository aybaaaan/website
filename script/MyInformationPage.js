// ================= FIREBASE IMPORTS =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================= ELEMENTS =================
const emailEl = document.getElementById("email");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const editBtn = document.getElementById("editBtn");

// ================= PHONE INPUT VALIDATION =================
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, ""); // Only numbers
});

// ================= AUTH STATE =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to view this page.");
    window.location.href = "/pages/LoginPage.html";
    return;
  }

  // Display email from Firebase Auth
  emailEl.textContent = user.email;

  // Firestore Reference
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    // Default name (if empty, use part before @gmail.com)
    nameInput.value =
      data.name && data.name.trim() !== ""
        ? data.name
        : user.email.split("@")[0];

    // Default phone (if empty, show Not set)
    phoneInput.value = data.phone && data.phone.trim() !== "" ? data.phone : "Not set";
  } else {
    console.log("No user document found, creating one...");
    await setDoc(userRef, {
      email: user.email,
      name: user.email.split("@")[0],
      phone: "Not set",
    });

    nameInput.value = user.email.split("@")[0];
    phoneInput.value = "Not set";
  }
});

// ================= EDIT / SAVE TOGGLE =================
function showSuccess(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");

  // Hide automatically after 3 seconds
  setTimeout(() => {
    errorMessage.classList.remove("show");
  }, 3000);
}


let editing = false;

editBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return showSuccess("You are not logged in.");

  if (!editing) {
    // Switch to edit mode
    editing = true;
    nameInput.disabled = false;
    phoneInput.disabled = false;
    editBtn.textContent = "Save Changes";
    nameInput.focus();
  } else {
    // Save changes
    editing = false;
    nameInput.disabled = true;
    phoneInput.disabled = true;
    editBtn.textContent = "Edit Profile";

    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        email: user.email,
        name: nameInput.value.trim() || user.email.split("@")[0],
        phone: phoneInput.value.trim() || "Not set",
      },
      { merge: true }
    );

    // ✅ Replace alert with popup
    showSuccess("Profile updated successfully!");
  }
});


// ================= HAMBURGER MENU =================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});
