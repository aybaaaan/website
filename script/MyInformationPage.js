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
const saveBtn = document.getElementById("saveBtn");
// ================= PHONE INPUT VALIDATION =================

phoneInput.addEventListener("input", (e) => {
  // Allow only numbers
  e.target.value = e.target.value.replace(/\D/g, "");
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

  // Fetch Firestore user info
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    nameInput.value = data.name || "";
    phoneInput.value = data.phone || "";
  } else {
    console.log("No user document found, creating one...");
    await setDoc(userRef, {
      email: user.email,
      name: "",
      phone: "",
    });
  }
});

// ================= SAVE CHANGES =================
saveBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("You are not logged in.");

  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    email: user.email,
    name: nameInput.value,
    phone: phoneInput.value,
  });

  alert("Profile updated successfully!");
});

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});
