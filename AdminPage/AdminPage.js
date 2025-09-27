function showSection(id) {
  document.querySelectorAll("main section").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// Logout Modal Logic
const logoutBtn = document.getElementById("btn-logout");
const logoutModal = document.getElementById("logoutModal");
const cancelLogout = document.getElementById("cancel-logout");
const confirmLogout = document.getElementById("confirm-logout");

logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  logoutModal.style.display = "block";
});

cancelLogout.addEventListener("click", () => {
  logoutModal.style.display = "none";
});

confirmLogout.addEventListener("click", () => {
  window.location.href = "/LOGIN/LoginPage.html";
});

window.addEventListener("click", (e) => {
  if (e.target === logoutModal) {
    logoutModal.style.display = "none";
  }
});
