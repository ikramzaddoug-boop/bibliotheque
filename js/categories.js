// js/categories.js
const CATEGORIES_KEY = "categories";
let categories = [];

function safeLoadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCategories() {
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function initCategories() {
  categories = safeLoadCategories();

  const form = document.getElementById("formCategorie");
  const tbody = document.querySelector("#tableCategories tbody");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveCategorie();
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      if (btn.classList.contains("edit-btn")) editCategorie(idx);
      if (btn.classList.contains("delete-btn")) deleteCategorie(idx);
    });
  }

  afficherCategories();
}

function afficherCategories() {
  const tbody = document.querySelector("#tableCategories tbody");
  if (!tbody) return;

  if (categories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">Aucune catégorie</td></tr>`;
    return;
  }

  tbody.innerHTML = categories.map((c, i) => `
    <tr>
      <td>${escapeHtml(c.nom)}</td>
      <td>
        <button type="button" class="btn btn-warning btn-sm me-1 edit-btn" data-index="${i}">Modifier</button>
        <button type="button" class="btn btn-danger btn-sm delete-btn" data-index="${i}">Supprimer</button>
      </td>
    </tr>
  `).join("");
}

// keep function names for compatibility
function saveCategorie() {
  const nomEl = document.getElementById("nomCategorie");
  const idxEl = document.getElementById("indexCategorie");
  if (!nomEl || !idxEl) return;

  const nom = nomEl.value.trim();
  const index = idxEl.value;

  if (!nom) {
    alert("Veuillez entrer un nom de catégorie");
    return;
  }

  const obj = { nom };
  if (index === "") categories.push(obj);
  else {
    const i = Number(index);
    if (Number.isFinite(i) && i >= 0 && i < categories.length) categories[i] = obj;
    else categories.push(obj);
  }

  saveCategories();
  afficherCategories();
  resetForm();
}

function editCategorie(index) {
  if (!Number.isFinite(index) || index < 0 || index >= categories.length) return;
  document.getElementById("nomCategorie").value = categories[index].nom || "";
  document.getElementById("indexCategorie").value = index;
  document.getElementById("nomCategorie").focus();
}

function deleteCategorie(index) {
  if (!Number.isFinite(index) || index < 0 || index >= categories.length) return;
  if (!confirm("Supprimer cette catégorie ?")) return;
  categories.splice(index, 1);
  saveCategories();
  afficherCategories();
}

function resetForm() {
  const form = document.getElementById("formCategorie");
  const idx = document.getElementById("indexCategorie");
  if (form) form.reset();
  if (idx) idx.value = "";
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCategories);
} else {
  initCategories();
}