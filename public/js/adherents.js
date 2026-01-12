// js/adherents.js
const ADHERENTS_KEY = "adherents";
let adherents = [];

function safeLoad(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage() {
  localStorage.setItem(ADHERENTS_KEY, JSON.stringify(adherents));
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function initAdherents() {
  adherents = safeLoad(ADHERENTS_KEY);

  const form = document.getElementById("formAdherent");
  const tbody = document.querySelector("#tableAdherents tbody");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveAdherent();
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const idx = Number(btn.dataset.index);
      if (btn.classList.contains("edit-btn")) editAdherent(idx);
      if (btn.classList.contains("delete-btn")) deleteAdherent(idx);
    });
  }

  afficherAdherents();
}

// keep global function name for existing onclick compatibility
function saveAdherent() {
  const nomEl = document.getElementById("nomAdherent");
  const emailEl = document.getElementById("emailAdherent");
  const telEl = document.getElementById("telephoneAdherent");
  const idxEl = document.getElementById("indexAdherent");
  if (!nomEl || !emailEl || !telEl || !idxEl) return;

  const nom = nomEl.value.trim();
  const email = emailEl.value.trim();
  const telephone = telEl.value.trim();
  const index = idxEl.value;

  if (!nom || !email || !telephone) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  const obj = { nom, email, telephone };

  if (index === "") {
    adherents.push(obj);
  } else {
    const i = Number(index);
    if (Number.isFinite(i) && i >= 0 && i < adherents.length) adherents[i] = obj;
    else adherents.push(obj);
  }

  saveToStorage();
  afficherAdherents();
  resetForm();
}

function afficherAdherents() {
  const tbody = document.querySelector("#tableAdherents tbody");
  if (!tbody) return;

  if (adherents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Aucun adhérent</td></tr>`;
    return;
  }

  tbody.innerHTML = adherents.map((a, i) => {
    return `
      <tr>
        <td>${escapeHtml(a.nom)}</td>
        <td>${escapeHtml(a.email)}</td>
        <td>${escapeHtml(a.telephone)}</td>
        <td>
          <button type="button" class="btn btn-warning btn-sm me-1 edit-btn" data-index="${i}">Modifier</button>
          <button type="button" class="btn btn-danger btn-sm delete-btn" data-index="${i}">Supprimer</button>
        </td>
      </tr>
    `;
  }).join("");
}

function editAdherent(index) {
  if (!Number.isFinite(index) || index < 0 || index >= adherents.length) return;
  const a = adherents[index];
  document.getElementById("nomAdherent").value = a.nom || "";
  document.getElementById("emailAdherent").value = a.email || "";
  document.getElementById("telephoneAdherent").value = a.telephone || "";
  document.getElementById("indexAdherent").value = index;
  document.getElementById("nomAdherent").focus();
}

function deleteAdherent(index) {
  if (!Number.isFinite(index) || index < 0 || index >= adherents.length) return;
  if (!confirm("Supprimer cet adhérent ?")) return;
  adherents.splice(index, 1);
  saveToStorage();
  afficherAdherents();
  resetForm();
}

function resetForm() {
  const form = document.getElementById("formAdherent");
  const idx = document.getElementById("indexAdherent");
  if (form) form.reset();
  if (idx) idx.value = "";
}

// Initialize if page loads this script directly
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAdherents);
} else {
  initAdherents();
}

// After adding or editing an adherent
document.dispatchEvent(new Event('updateAdherents'));
