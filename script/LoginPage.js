// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAvQnRa_q4JlxVgcifjFtKM4i2ckHTJInc",
  authDomain: "webusiteu.firebaseapp.com",
  projectId: "webusiteu",
  storageBucket: "webusiteu.firebasestorage.app",
  messagingSenderId: "974146331400",
  appId: "1:974146331400:web:a0590d7dc71dd3c00f02bd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const submit = document.getElementById("submit");
const errorMessage = document.getElementById("error-message");

submit.addEventListener("click", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  // Reset error
  errorMessage.textContent = "";
  errorMessage.classList.remove("show");

  // Validation
  if (!email || !password) {
    return showError("Please fill in all fields.");
  }

  // Firebase login
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Admin login
      if (user.email === "admin123@miv.com" && password === "admin123") {
        showSuccess("Admin login successful!");
        setTimeout(() => {
          window.location.href = "/pages/AdminPage.html";
        }, 1500);
      } else {
        showSuccess("Login successful!");
        setTimeout(() => {
          window.location.href = "/pages/HomePage.html";
        }, 1500);
      }
    })
    .catch((error) => {
      console.log(error.code); // helpful for debugging

      if (error.code === "auth/invalid-email") {
        showError("Please enter a valid email address (example@domain.com).");
      } else if (error.code === "auth/user-not-found") {
        showError("No account found with this email.");
      } else if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        showError("Incorrect email or password. Please try again.");
      } else {
        showError("An unexpected error occurred. Please try again later.");
      }
    });
});

function showError(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(255, 77, 77, 0.95)";
  errorMessage.classList.add("show");

  // Auto hide after 3 seconds
  setTimeout(() => {
    errorMessage.classList.remove("show");
  }, 3000);
}

function showSuccess(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");

  // Auto hide after 3 seconds
  setTimeout(() => {
    errorMessage.classList.remove("show");
  }, 3000);
}
