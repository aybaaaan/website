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

// input fields

// submit button
const submit = document.getElementById("submit");
const errorMessage = document.getElementById("error-message");

// Success popup function
function showSuccess(msg) {
  const popup = document.getElementById("error-message");
  popup.textContent = msg;
  popup.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

// Error popup function (optional)
function showError(msg) {
  const popup = document.getElementById("error-message");
  popup.textContent = msg;
  popup.style.backgroundColor = "rgba(244, 67, 54, 0.95)";
  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}

// ================= LOGIN =================
submit.addEventListener("click", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Reset message
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

      if (user.email === "admin123@miv.com" && password === "admin123") {
        showSuccess("Admin login successful");
        setTimeout(() => {
          window.location.href = "/pages/AdminPage.html";
        }, 1500);
      } else {
        showSuccess("User login successful");
        setTimeout(() => {
          window.location.href = "/pages/HomePage.html";
        }, 1500);
      }
    })
    .catch((error) => {
      showError("Invalid email or password. Please try again.");
    });
});
