// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
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
    .then(() => {
      showSuccess("Sign Up Successful!");
      setTimeout(() => {
        window.location.href = "/pages/LoginPage.html";
      }, 1500);
    })
    .catch((error) => {
      // Handle specific Firebase email error
      if (error.code === "auth/invalid-email") {
        showError("Please enter a valid email address (example@domain.com).");
      } else if (error.code === "auth/email-already-in-use") {
        showError("This email is already registered. Please sign in instead.");
      } else {
        showError(error.message);
      }
    });
});

function showError(msg) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(255, 77, 77, 0.95)";
  errorMessage.classList.add("show");

  // Hide automatically after 3 seconds
  setTimeout(() => {
    errorMessage.classList.remove("show");
  }, 3000);
}

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
