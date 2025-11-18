// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ===============================
// Firebase Config
// ===============================
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements
const submit = document.getElementById("submit");
const errorMessage = document.getElementById("error-message");
const forgotPasswordLink = document.getElementById("forgot-password");

// UI Feedback
function showSuccess(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(244, 67, 54, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 3000);
}

// ===============================
// LOGIN LOGIC
// ===============================
submit.addEventListener("click", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  errorMessage.textContent = "";
  errorMessage.classList.remove("show");

  if (!email || !password) {
    return showError("Please fill in all fields.");
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      user.reload().then(() => {
        if (!user.emailVerified) {
          showError(
            "Please verify your email before logging in. Check your inbox or spam folder."
          );
          signOut(auth);
          return;
        }

        if (user.email === "admin@miv.com" && password === "admin123") {
          showSuccess("Admin login successful!");
          setTimeout(() => {
            window.location.href = "/pages/AdminPage.html";
          }, 1500);
        } else {
          showSuccess("User login successful!");
          setTimeout(() => {
            window.location.href = "/pages/HomePage.html";
          }, 1500);
        }
      });
    })
    .catch((error) => {
      if (error.code === "auth/invalid-email") {
        showError("Invalid email format.");
      } else {
        showError("Login failed: Invalid Email or Password.");
      }
    });
});

// ===============================
// FORGOT PASSWORD LOGIC
// ===============================
forgotPasswordLink.addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  if (!email) {
    return showError("Please enter your email to reset password.");
  }

  sendPasswordResetEmail(auth, email)
    .then(() => {
      showSuccess("Password reset email sent! Check your inbox or spam.");
    })
    .catch((error) => {
      showError("Error sending reset email: " + error.message);
    });
});

// ===============================
// PASSWORD VISIBILITY TOGGLE
// ===============================
const passwordWrappers = document.querySelectorAll(".password-wrapper");

passwordWrappers.forEach((wrapper) => {
  const input = wrapper.querySelector("input");
  const icon = wrapper.querySelector("span");

  icon.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text";
      icon.style.color = "#741b47";
    } else {
      input.type = "password";
      icon.style.color = "#000000";
    }
  });
});
