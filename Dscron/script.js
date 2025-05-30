function showLogin() {
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("registerForm").classList.remove("active");
}

function showRegister() {
  document.getElementById("registerForm").classList.add("active");
  document.getElementById("loginForm").classList.remove("active");
}
