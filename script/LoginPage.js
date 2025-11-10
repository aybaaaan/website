// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
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
