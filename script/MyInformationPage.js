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

// ================= REUSABLE TEXT-FIELD GENERATOR =================
function createTextField(labelText, id, disabled = true) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("input-group");

  const label = document.createElement("label");
  label.textContent = labelText;
  label.setAttribute("for", id);

  const input = document.createElement("input");
  input.type = "text";
  input.id = id;
  input.placeholder = `Enter your ${labelText}`;
  input.disabled = disabled;

  wrapper.appendChild(label);
  wrapper.appendChild(input);
  return wrapper;
}

// ================= INSERT FIELDS INTO PAGE =================
// ================= TAGAYTAY BARANGAYS DATA =================
const tagaytayBarangays = [
  "Kaybagal Center",
  "Kaybagal North",
  "Kaybagal South",
  "Maharlika East",
  "Maharlika West",
  "Maitim 2nd East",
  "Maitim 2nd West",
  "Patutong Malaki North",
  "Patutong Malaki South",
  "San Jose",
  "Silang Crossing West",
];

// Helper function to create a Dropdown (gaya ng style ng createTextField mo)
function createSelectField(labelText, id, options) {
  const wrapper = document.createElement("div");
  wrapper.className = "input-group";

  const label = document.createElement("label");
  label.innerText = labelText;
  label.setAttribute("for", id);

  const select = document.createElement("select");
  select.id = id;
  select.name = id;
  select.disabled = true;

  // Default "Select" option
  const defaultOption = document.createElement("option");
  defaultOption.text = "Select Barangay";
  defaultOption.value = "";
  defaultOption.disabled = true;
  defaultOption.selected = true;
  select.appendChild(defaultOption);

  // Add Tagaytay Barangays
  options.forEach((brgy) => {
    const option = document.createElement("option");
    option.value = brgy;
    option.text = brgy;
    select.appendChild(option);
  });

  wrapper.appendChild(label);
  wrapper.appendChild(select);
  return wrapper;
}

// ================= INSERT FIELDS INTO PAGE =================
const container = document.getElementById("info-fields");

container.appendChild(createTextField("Name", "name"));
container.appendChild(createTextField("Phone Number", "phone"));
container.appendChild(createTextField("House No.", "houseno"));
container.appendChild(createTextField("Street", "street"));
container.appendChild(
  createSelectField("Barangay", "barangay", tagaytayBarangays)
);
container.appendChild(createTextField("City", "city", true));
container.appendChild(createTextField("Province", "province", true));

// Now we can safely reference them
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const housenoInput = document.getElementById("houseno");
const streetInput = document.getElementById("street");
const barangayInput = document.getElementById("barangay"); // Ito ngayon ay <select> na
const cityInput = document.getElementById("city");
const provinceInput = document.getElementById("province");

// Fixed values
cityInput.value = "Tagaytay";
provinceInput.value = "Cavite";

const emailEl = document.getElementById("email");
const editBtn = document.getElementById("editBtn");

// ================= PHONE ONLY VALIDATION =================
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");
});

// ================= AUTH STATE =================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("You must be logged in to view this page.");
    window.location.href = "../pages/LoginPage.html";
    return;
  }

  emailEl.textContent = user.email;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    const address = data.address || {};

    nameInput.value = data.name || user.email.split("@")[0];
    phoneInput.value = data.phone || "Not set";
    housenoInput.value = address.houseno || "Not set";
    streetInput.value = address.street || "Not set";
    barangayInput.value = address.barangay || "Not set";

    cityInput.value = address.city || "Tagaytay"; // always fixed
    provinceInput.value = address.province || "Cavite"; // always fixed
  } else {
    await setDoc(userRef, {
      email: user.email,
      name: user.email.split("@")[0],
      phone: "Not set",
      houseno: "Not set",
      street: "Not set",
      barangay: "Not set",
      city: "Tagaytay",
      province: "Cavite",
    });
  }
});

// ================= EDIT / SAVE TOGGLE =================
let editing = false;

editBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return showSuccess("You are not logged in.");

  if (!editing) {
    editing = true;

    nameInput.disabled = false;
    phoneInput.disabled = false;
    housenoInput.disabled = false;
    streetInput.disabled = false;
    barangayInput.disabled = false;

    // city and province remain disabled
    editBtn.textContent = "Save Changes";
    nameInput.focus();
  } else {
    editing = false;

    nameInput.disabled = true;
    phoneInput.disabled = true;
    housenoInput.disabled = true;
    streetInput.disabled = true;
    barangayInput.disabled = true;

    // city and province remain disabled
    editBtn.textContent = "Edit Profile";

    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        email: user.email,
        name: nameInput.value.trim() || user.email.split("@")[0],
        phone: phoneInput.value.trim() || "Not set",
        address: {
          houseno: housenoInput.value.trim() || "Not set",
          street: streetInput.value.trim() || "Not set",
          barangay: barangayInput.value.trim() || "Not set",
          city: "Tagaytay",
          province: "Cavite",
        },
      },
      { merge: true }
    );

    showSuccess("Profile updated successfully!");
  }
});

// Password Elements
const passwordInput = document.getElementById("password");

// Fake password placeholder (Firebase does NOT allow fetching real password)
passwordInput.value = "********";

function showError(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(244, 67, 54, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}
function showSuccess(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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

    const currentPass = document
      .getElementById("modalCurrentPass")
      .value.trim();
    const newPass = modalNewPass.value.trim();

    if (!currentPass) return showError("Please enter your current password.");
    if (!newPass) return showError("Please enter a new password.");

    if (newPass.length < 6)
      return showError("Password must be at least 6 characters.");

    const uppercase = /[A-Z]/;
    const number = /[0-9]/;
    const symbol = /[!@#$%^&*(),.?\":{}|<>]/;

    if (!uppercase.test(newPass))
      return showError("Password must contain at least one uppercase letter.");
    if (!number.test(newPass))
      return showError("Password must contain at least one number.");
    if (!symbol.test(newPass))
      return showError("Password must contain at least one symbol.");

    try {
      // STEP 1: Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);

      // STEP 2: Update password
      await updatePassword(user, newPass);

      showSuccess("Password updated successfully!");

      // Close modal + reset
      changePasswordModal.style.display = "none";
      modalCurrentPass.value = "";
      modalNewPass.value = "";
    } catch (error) {
      console.error(error);

      if (error.code === "auth/wrong-password") {
        showError("Incorrect current password.");
      } else if (error.code === "auth/too-many-requests") {
        showError("Too many attempts. Please try again later.");
      } else {
        showError(
          "Failed to update password. Please enter your current password."
        );
      }
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
