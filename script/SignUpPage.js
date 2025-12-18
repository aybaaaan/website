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
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// ===============================
// NEW FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyBSpMRcuO5iGPU2hXhnTOMjog29plJwU4U",
  authDomain: "mediterranean-in-velvet-53036.firebaseapp.com",
  databaseURL:
    "https://mediterranean-in-velvet-53036-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mediterranean-in-velvet-53036",
  storageBucket: "mediterranean-in-velvet-53036.firebasestorage.app",
  messagingSenderId: "1062662016088",
  appId: "1:1062662016088:web:007e0bf8a3e5d0094c8e2d",
  measurementId: "G-TRP0RL8LRL",
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

  // Strong password check
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  if (!passwordPattern.test(password)) {
    return showError(
      "Password must be at least 6 characters and include a capital letter, a number, and a symbol."
    );
  }

  // Firebase signup
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Send email verification
      sendEmailVerification(user)
        .then(() => {
          showSuccess(
            "Verification email sent! Please check your inbox or spam and verify before logging in."
          );

          // Save user to database
          set(ref(db, "Logins/" + user.uid), {
            email: email,
            createdAt: new Date().toLocaleString(),
          });

          // Sign out user until verified
          setTimeout(() => {
            signOut(auth).then(() => {
              window.location.href = "../pages/LoginPage.html";
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

// Password visibility toggle
const passwordWrappers = document.querySelectorAll(".password-wrapper");

passwordWrappers.forEach((wrapper) => {
  const input = wrapper.querySelector("input");
  const icon = wrapper.querySelector("img");

  icon.addEventListener("click", () => {
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    // Swap PNG icons
    icon.src = isHidden ? "../icons/view.png" : "../icons/hide.png";
  });
});
