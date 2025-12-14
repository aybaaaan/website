// LOGOUT MODAL LOGIC
const logoutBtn = document.getElementById("btn-logout");
const logoutModal = document.getElementById("logoutModal"); // fixed ID
const cancelLogout = document.getElementById("cancel-logout");
const confirmLogout = document.getElementById("confirm-logout");

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutModal.style.display = "flex";
});

cancelLogout.addEventListener(
  "click",
  () => (logoutModal.style.display = "none")
);
confirmLogout.addEventListener(
  "click",
  () => (window.location.href = "../pages/LoginPage.html")
);

window.addEventListener("click", (e) => {
  if (e.target === logoutModal) logoutModal.style.display = "none";
});

//Hamburger
const hamburger = document.getElementById("hamburger");
const sidebar = document.querySelector("aside");

hamburger.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});
