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
  updatePassword,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyC7FLz6RyFhiNok82uPj3hs7Ev8r7UI3Ik",
  authDomain: "mediterranean-in-velvet-10913.firebaseapp.com",
  databaseURL:
    "https://mediterranean-in-velvet-10913-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-10913",
  storageBucket: "mediterranean-in-velvet-10913.firebasestorage.app",
  messagingSenderId: "478608649838",
  appId: "1:478608649838:web:cbe6ed90b718037244c07f",
  measurementId: "G-T9TT5N8NJX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ================= ELEMENTS =================
const emailEl = document.getElementById("email");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const editBtn = document.getElementById("editBtn");

// Password Elements
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const changePasswordBtn = document.getElementById("changePasswordBtn");

// ================= POPUP FEEDBACK =================
function showSuccess(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}

function showError(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(244, 67, 54, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}

// ================= PHONE ONLY VALIDATION =================
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});

// ================= AUTH STATE =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to view this page.");
    window.location.href = "/pages/LoginPage.html";
    return;
  }

  emailEl.textContent = user.email;

  // Fake password placeholder (Firebase does NOT allow fetching real password)
  passwordInput.value = "********";

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();

    nameInput.value =
      data.name && data.name.trim() !== ""
        ? data.name
        : user.email.split("@")[0];

    phoneInput.value =
      data.phone && data.phone.trim() !== "" ? data.phone : "Not set";

    addressInput.value =
      data.address && data.address.trim() !== "" ? data.address : "Not set";
  } else {
    await setDoc(userRef, {
      email: user.email,
      name: user.email.split("@")[0],
      phone: "Not set",
      address: "Not set",
    });

    nameInput.value = user.email.split("@")[0];
    phoneInput.value = "Not set";
    addressInput.value = "Not set";
  }
});

// ================= EDIT / SAVE =================
let editing = false;

editBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return showError("You are not logged in.");

  if (!editing) {
    editing = true;
    nameInput.disabled = false;
    phoneInput.disabled = false;
    addressInput.disabled = false;
    editBtn.textContent = "Save Changes";
    nameInput.focus();
  } else {
    editing = false;
    nameInput.disabled = true;
    phoneInput.disabled = true;
    addressInput.disabled = true;
    editBtn.textContent = "Edit Profile";

    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        email: user.email,
        name: nameInput.value.trim() || user.email.split("@")[0],
        phone: phoneInput.value.trim() || "Not set",
        address: addressInput.value.trim() || "Not set",
      },
      { merge: true }
    );

    showSuccess("Profile updated successfully!");
  }
})

// ================= CHANGE PASSWORD VISIBILITY =================
document.addEventListener("DOMContentLoaded", () => {
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const changePasswordModal = document.getElementById("changePasswordModal");
  const modalNewPass = document.getElementById("modalNewPass");
  const modalSubmitBtn = document.getElementById("modalSubmitBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");

  changePasswordBtn.addEventListener("click", () => {
    changePasswordModal.style.display = "flex";
  });

  modalCancelBtn.addEventListener("click", () => {
    changePasswordModal.style.display = "none";
    modalNewPass.value = "";
  });

  modalSubmitBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return showError("You are not logged in.");

    const newPass = modalNewPass.value.trim();
    if (!newPass) return;
    if (newPass.length < 6) return showError("Password must be at least 6 characters.");

    // ===== Password strength check =====
    const uppercase = /[A-Z]/;
    const number = /[0-9]/;
    const symbol = /[!@#$%^&*(),.?":{}|<>]/;

    if (!uppercase.test(newPass)) return showError("Password must contain at least one uppercase letter.");
    if (!number.test(newPass)) return showError("Password must contain at least one number.");
    if (!symbol.test(newPass)) return showError("Password must contain at least one symbol.");

    try {
      await updatePassword(user, newPass);
      showSuccess("Password updated successfully!");
      changePasswordModal.style.display = "none";
      modalNewPass.value = "";
    } catch (error) {
      console.error(error);
      showError("Failed to update password. Please log in again.");
    }
  });
});




// ================= HAMBURGER MENU =================
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});
