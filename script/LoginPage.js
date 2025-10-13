// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Your web app's Firebase configuration
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
submit.addEventListener("click", function (event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      if (user.email === "admin123@miv.com" && password === "admin123") {
        alert("Admin login successful");
        window.location.href = "/pages/AdminPage.html"; // redirect to Admin page
      } else {
        alert("User login successful");
        window.location.href = "/pages/HomePage.html"; // redirect to Home page
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
    });
});
