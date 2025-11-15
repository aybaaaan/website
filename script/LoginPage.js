// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firebase config
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

// ===============================
// UI Feedback Functions
// ===============================
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

  // Reset error message
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

      // ✅ Reload to get latest emailVerified status
      user.reload().then(() => {
        // 🚫 Block if not verified
        if (!user.emailVerified) {
          showError(
            "Please verify your email before logging in. Check your inbox or spam folder."
          );
          signOut(auth); // sign them out immediately
          return;
        }

        // ✅ Allow login if verified
        if (user.email === "admin123@miv.com" && password === "admin123") {
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

//password visibility toggle
const passwordWrappers = document.querySelectorAll(".password-wrapper");

passwordWrappers.forEach((wrapper) => {
  const input = wrapper.querySelector("input");
  const icon = wrapper.querySelector("span");

  icon.addEventListener("click", () => {
    if (input.type === "password") {
      input.type = "text"; // show password
      icon.style.color = "#741b47"; // change color (example: DodgerBlue)
    } else {
      input.type = "password"; // hide password
      icon.style.color = "#000000"; // revert to original black
    }
  });
});
