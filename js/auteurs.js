let auteurs = [];

const selectors = {
  tableBody: "#tableAuteurs tbody",
  form: "#formAuteur",
  nom: "#nomAuteur",
  nationalite: "#nationaliteAuteur",
  index: "#indexAuteur"
};

function initAuteurs() {
  // cache DOM nodes
  const tbody = document.querySelector(selectors.tableBody);
  const form = document.querySelector(selectors.form);

  // load safely
  try {
    const raw = localStorage.getItem("auteurs");
    auteurs = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(auteurs)) auteurs = [];
  } catch (e) {
    auteurs = [];
  }

  // attach event listeners once
  if (form) form.addEventListener("submit", (e) => { e.preventDefault(); saveAuteur(); });
  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const idx = btn.dataset.index;
      if (btn.classList.contains("edit-btn")) {
        editAuteur(Number(idx));
      } else if (btn.classList.contains("delete-btn")) {
        deleteAuteur(Number(idx));
      }
    });
  }

  afficherAuteurs();
}

function saveToStorage() {
  localStorage.setItem("auteurs", JSON.stringify(auteurs));
}

function afficherAuteurs() {
  const tbody = document.querySelector(selectors.tableBody);
  if (!tbody) return;

  if (auteurs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-center">Aucun auteur</td></tr>`;
    return;
  }

  tbody.innerHTML = auteurs
    .map((auteur, index) => {
      const nom = escapeHtml(auteur.nom);
      const nat = escapeHtml(auteur.nationalite);
      return `
      <tr>
        <td>${nom}</td>
        <td>${nat}</td>
        <td>
          <button type="button" class="btn btn-warning btn-sm me-1 edit-btn" data-index="${index}">Modifier</button>
          <button type="button" class="btn btn-danger btn-sm delete-btn" data-index="${index}">Supprimer</button>
        </td>
      </tr>`;
    })
    .join("");
}

function saveAuteur() {
  const nomEl = document.querySelector(selectors.nom);
  const natEl = document.querySelector(selectors.nationalite);
  const idxEl = document.querySelector(selectors.index);

  if (!nomEl || !natEl || !idxEl) return;

  const nom = nomEl.value.trim();
  const nationalite = natEl.value.trim();
  const index = idxEl.value;

  if (!nom || !nationalite) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  const auteur = { nom, nationalite };

  if (index === "") {
    auteurs.push(auteur);
  } else {
    const i = Number(index);
    if (Number.isFinite(i) && i >= 0 && i < auteurs.length) {
      auteurs[i] = auteur;
    } else {
      // fallback: push if index invalid
      auteurs.push(auteur);
    }
  }

  saveToStorage();
  afficherAuteurs();
  resetForm();
}

function editAuteur(index) {
  if (!Number.isFinite(index) || index < 0 || index >= auteurs.length) return;
  const auteur = auteurs[index];
  const nomEl = document.querySelector(selectors.nom);
  const natEl = document.querySelector(selectors.nationalite);
  const idxEl = document.querySelector(selectors.index);
  if (!nomEl || !natEl || !idxEl) return;

  nomEl.value = auteur.nom;
  natEl.value = auteur.nationalite;
  idxEl.value = index;
  nomEl.focus();
}

function deleteAuteur(index) {
  if (!Number.isFinite(index) || index < 0 || index >= auteurs.length) return;
  const auteur = auteurs[index];
  const name = auteur && auteur.nom ? auteur.nom : "cet auteur";
  if (confirm(`Supprimer ${name} ?`)) {
    auteurs.splice(index, 1);
    saveToStorage();
    afficherAuteurs();
    resetForm();
  }
}

function resetForm() {
  const form = document.querySelector(selectors.form);
  const idxEl = document.querySelector(selectors.index);
  if (form) form.reset();
  if (idxEl) idxEl.value = "";
}

// small helper to avoid HTML injection when rendering
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}