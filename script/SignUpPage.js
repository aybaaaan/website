// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
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
  databaseURL: "https://webusiteu-default-rtdb.firebaseio.com/",
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

      // Step 1: Send email verification
      sendEmailVerification(user)
        .then(() => {
          showSuccess(
            "Verification email sent! Please check your inbox or spam and verify before logging in."
          );

          // Step 2: Save user to database (optional, before sign out)
          set(ref(db, "Users/" + user.uid), {
            email: email,
            contactNumber: "",
            name: "",
            createdAt: serverTimestamp(),
            emailVerified: false, // optional tracking field
          });

          // Step 3: Sign out user until verified
          setTimeout(() => {
            signOut(auth).then(() => {
              window.location.href = "/pages/LoginPage.html";
            });
          }, 2500);
        })
        .catch((error) => {
          showError("Failed to send verification email: " + error.message);
        });
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
  setTimeout(() => errorMessage.classList.remove("show"), 4000);
}

function showSuccess(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.backgroundColor = "rgba(76, 175, 80, 0.95)";
  errorMessage.classList.add("show");
  setTimeout(() => errorMessage.classList.remove("show"), 4000);
}
