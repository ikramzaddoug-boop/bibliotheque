// js/auth.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const toggle = document.getElementById("togglePassword");
  const pwd = document.getElementById("password");

  if (toggle && pwd) {
    toggle.addEventListener("click", () => {
      const isPwd = pwd.type === "password";
      pwd.type = isPwd ? "text" : "password";
      toggle.innerHTML = isPwd ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      loginAdmin();
    });
  }
});

function showAlert(message, type = "danger") {
  const container = document.getElementById("loginAlert");
  if (!container) {
    alert(message);
    return;
  }
  container.innerHTML = `<div class="alert alert-${type} alert-sm" role="alert">${escapeHtml(message)}</div>`;
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Exposed for compatibility with inline callers
function loginAdmin() {
  const usernameEl = document.getElementById("username");
  const passwordEl = document.getElementById("password");
  const username = usernameEl ? usernameEl.value.trim() : "";
  const password = passwordEl ? passwordEl.value : "";

  if (!username || !password) {
    showAlert("Veuillez saisir le nom d'utilisateur et le mot de passe.", "warning");
    return;
  }

  // Demo credentials: admin / admin
  if (username === "admin" && password === "admin") {
    localStorage.setItem("isLoggedIn", "true");
    showAlert("Connexion réussie — redirection…", "success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
  } else {
    showAlert("Identifiants incorrects", "danger");
  }
}