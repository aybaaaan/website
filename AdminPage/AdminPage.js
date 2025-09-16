const logout = document.getElementById("btn-logout");
logout.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/LOGIN/LoginPage.html";
});