// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd",
  databaseURL: "https://webusiteu-default-rtdb.firebaseio.com/", // add this if missing
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const submit = document.getElementById("submit");
const errorMessage = document.getElementById("error-message");

submit.addEventListener("click", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmpassword").value;

  // Reset error state
  errorMessage.textContent = "";
  errorMessage.classList.remove("show");

  // Validation
  if (!email || !password || !confirmPassword) {
    return showError("Please fill in all fields.");
  }

  if (password !== confirmPassword) {
    return showError("Passwords do not match. Please try again.");
  }

  if (password.length < 6) {
    return showError("Password must be at least 6 characters.");
  }

  // Firebase signup
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Store user in Realtime Database with timestamp
      set(ref(db, "Users/" + user.uid), {
        email: email,
        contactNumber: "",
        name: "",
        createdAt: serverTimestamp(), // <-- important line!
      });

      showSuccess("Sign Up Successful!");
      setTimeout(() => {
        window.location.href = "/pages/LoginPage.html";
      }, 1500);
    })
    .catch((error) => {
      if (error.code === "auth/invalid-email") {
        showError("Please enter a valid email address (example@domain.com).");
      } else if (error.code === "auth/email-already-in-use") {
        showError("This email is already registered. Please sign in instead.");
      } else {
        showError(error.message);
      }
    });
});

// ===============================
// Error / Success Functions
// ===============================
function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(255, 77, 77, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}

function showSuccess(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}
