let livres = [];
let adherents = [];
let emprunts = [];

const selectors = {
  livreSelect: "livreSelect",
  adherentSelect: "adherentSelect",
  form: "formEmprunt",
  dateEmprunt: "dateEmprunt",
  container: "empruntsContainer"
};

// Safe localStorage load
function safeLoad(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Save array to localStorage
function saveToStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Format date
function formatDateISO(date = new Date()) {
  return date.toISOString().split("T")[0];
}

// Escape HTML
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Initialize everything
function initEmprunts() {
  // Load fresh data every time
  livres = safeLoad("livres");
  adherents = safeLoad("adherents");
  emprunts = safeLoad("emprunts");

  // Ensure all livres have 'disponible'
  let changed = false;
  livres.forEach(l => {
    if (l.disponible === undefined) { l.disponible = true; changed = true; }
  });
  if (changed) saveToStorage("livres", livres);

  // Form submit
  const form = document.getElementById(selectors.form);
  if (form) form.addEventListener("submit", e => { e.preventDefault(); saveEmprunt(); });

  // Buttons in cards
  const container = document.getElementById(selectors.container);
  if (container) {
    container.addEventListener("click", e => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const action = btn.dataset.action;
      const idx = Number(btn.dataset.index);
      if (action === "return") returnBook(idx);
      if (action === "delete") deleteEmprunt(idx);
    });
  }

  remplirSelects();
  afficherEmprunts();
}

// Populate dropdowns
function remplirSelects() {
  livres = safeLoad("livres");
  adherents = safeLoad("adherents");

  const livreSelect = document.getElementById(selectors.livreSelect);
  const adherentSelect = document.getElementById(selectors.adherentSelect);
  if (!livreSelect || !adherentSelect) return;

  // Livre options
  let livreOptions = `<option value="">-- Choisir un livre --</option>`;
  livres.forEach((livre, index) => {
    const title = escapeHtml(livre.titre || "Sans titre");
    const author = escapeHtml(livre.auteur || "-");
    const cat = escapeHtml(livre.categorie || "-");
    const isAvailable = livre.disponible !== false;
    const disabled = isAvailable ? "" : "disabled";
    const label = isAvailable ? title : `${title} — (Emprunté)`;
    livreOptions += `<option value="${index}" ${disabled}>${label} (${author} | ${cat})</option>`;
  });
  livreSelect.innerHTML = livreOptions;

  // Adherent options
  let adherentOptions = `<option value="">-- Choisir un adhérent --</option>`;
  adherents.forEach((a, index) => {
    const name = escapeHtml(a.nom || `Adhérent ${index + 1}`);
    adherentOptions += `<option value="${index}">${name}</option>`;
  });
  adherentSelect.innerHTML = adherentOptions;

  const note = document.getElementById("livreAvailabilityNote");
  if (note) note.textContent = "Les livres marqués (Emprunté) ne sont pas sélectionnables.";
}

// Show emprunts
function afficherEmprunts() {
  emprunts = safeLoad("emprunts");
  livres = safeLoad("livres");
  adherents = safeLoad("adherents");

  const container = document.getElementById(selectors.container);
  if (!container) return;

  if (emprunts.length === 0) {
    container.innerHTML = `<p class="text-muted">Aucun emprunt pour le moment.</p>`;
    return;
  }

  const cards = emprunts.map((e, index) => {
    const livre = livres[e.livreIndex] || null;
    const titre = escapeHtml(e.livreTitle || (livre ? livre.titre : "Livre inconnu"));
    const auteur = escapeHtml(livre ? livre.auteur : (e.livreAuthor || "-"));
    const categorie = escapeHtml(livre ? livre.categorie : (e.livreCategory || "-"));
    const adherent = escapeHtml(e.adherentName || (adherents[e.adherentIndex]?.nom || "Adhérent inconnu"));
    const image = livre?.image ? escapeHtml(livre.image) : "https://via.placeholder.com/250x250?text=No+Image";
    const statusBadge = !e.dateRetour ? `<span class="badge bg-danger">Emprunté</span>` : `<span class="badge bg-success">Retourné</span>`;
    const returnBtn = !e.dateRetour ? `<button class="btn btn-success btn-sm me-1" data-action="return" data-index="${index}">Retourner</button>` : "";

    return `
      <div class="col-md-4">
        <div class="card shadow h-100">
          <img src="${image}" class="card-img-top" style="height:250px; object-fit:cover">
          <div class="card-body">
            <h5>${titre}</h5>
            <p class="text-muted">${auteur}</p>
            <p><strong>Catégorie:</strong> ${categorie}</p>
            <p><strong>Adhérent:</strong> ${adherent}</p>
            ${statusBadge}
            <p class="mt-2"><small class="text-muted">Emprunt: ${escapeHtml(e.dateEmprunt || "-")} — Retour: ${escapeHtml(e.dateRetour || "-")}</small></p>
          </div>
          <div class="card-footer text-center">
            ${returnBtn}
            <button class="btn btn-danger btn-sm" data-action="delete" data-index="${index}">Supprimer</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `<div class="row g-3">${cards}</div>`;
}

// Save new emprunt
function saveEmprunt() {
  livres = safeLoad("livres");
  adherents = safeLoad("adherents");
  emprunts = safeLoad("emprunts");

  const li = Number(document.getElementById(selectors.livreSelect)?.value);
  const ai = Number(document.getElementById(selectors.adherentSelect)?.value);
  const dateEmprunt = document.getElementById(selectors.dateEmprunt)?.value;

  if (!Number.isFinite(li) || !livres[li] || !Number.isFinite(ai) || !adherents[ai] || !dateEmprunt) {
    alert("Veuillez remplir tous les champs correctement.");
    return;
  }

  if (livres[li].disponible === false) { alert("Ce livre est déjà emprunté."); return; }

  livres[li].disponible = false;

  emprunts.push({
    livreIndex: li,
    adherentIndex: ai,
    livreTitle: livres[li].titre || "",
    livreAuthor: livres[li].auteur || "",
    livreCategory: livres[li].categorie || "",
    adherentName: adherents[ai].nom || "",
    dateEmprunt,
    dateRetour: ""
  });

  saveToStorage("livres", livres);
  saveToStorage("emprunts", emprunts);

  remplirSelects();
  afficherEmprunts();
  document.getElementById(selectors.form)?.reset();
}

// Return book
function returnBook(index) {
  emprunts = safeLoad("emprunts");
  livres = safeLoad("livres");

  const emprunt = emprunts[index];
  if (!emprunt) return;

  const li = emprunt.livreIndex;
  if (livres[li]) livres[li].disponible = true;
  emprunt.dateRetour = formatDateISO();

  saveToStorage("livres", livres);
  saveToStorage("emprunts", emprunts);

  remplirSelects();
  afficherEmprunts();
}

// Delete emprunt
function deleteEmprunt(index) {
  emprunts = safeLoad("emprunts");
  livres = safeLoad("livres");

  const emprunt = emprunts[index];
  if (!emprunt) return;

  if (!emprunt.dateRetour && livres[emprunt.livreIndex]) livres[emprunt.livreIndex].disponible = true;

  emprunts.splice(index, 1);

  saveToStorage("livres", livres);
  saveToStorage("emprunts", emprunts);

  remplirSelects();
  afficherEmprunts();
}

// Init
document.addEventListener("DOMContentLoaded", initEmprunts);
