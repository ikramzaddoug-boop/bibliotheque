let livres = JSON.parse(localStorage.getItem("livres")) || [];
let auteurs = JSON.parse(localStorage.getItem("auteurs")) || [];
let categories = JSON.parse(localStorage.getItem("categories")) || [];

document.addEventListener("DOMContentLoaded", () => {
  remplirSelects();
  afficherLivres();
});

function remplirSelects() {
  const auteurSelect = document.getElementById("auteurLivre");
  const categorieSelect = document.getElementById("categorieLivre");

  auteurSelect.innerHTML = `<option value="">-- Choisir un auteur --</option>`;
  categorieSelect.innerHTML = `<option value="">-- Choisir une catégorie --</option>`;

  auteurs.forEach(a => {
    auteurSelect.innerHTML += `<option value="${a.nom}">${a.nom}</option>`;
  });

  categories.forEach(c => {
    categorieSelect.innerHTML += `<option value="${c.nom}">${c.nom}</option>`;
  });
}

function afficherLivres() {
  const container = document.getElementById("livresContainer");
  if (!container) return;

  container.innerHTML = "";

  livres.forEach((livre, index) => {
    container.innerHTML += `
      <div class="col-md-4">
        <div class="card shadow h-100">
          <img src="${livre.image}" class="card-img-top"
               style="height:250px;object-fit:cover">

          <div class="card-body">
            <h5>${livre.titre}</h5>
            <p class="text-muted">${livre.auteur}</p>
            <span class="badge ${livre.disponible ? "bg-success" : "bg-danger"}">
              ${livre.disponible ? "Disponible" : "Emprunté"}
            </span>
          </div>

          <div class="card-footer text-center">
            <button class="btn btn-warning btn-sm" onclick="editLivre(${index})">
              Modifier
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteLivre(${index})">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function saveLivre() {
  const titre = document.getElementById("titreLivre").value;
  const auteur = document.getElementById("auteurLivre").value;
  const categorie = document.getElementById("categorieLivre").value;
  const index = document.getElementById("indexLivre").value;
  const imageInput = document.getElementById("imageLivre");

  if (!titre || !auteur || !categorie) {
    alert("Tous les champs sont obligatoires");
    return;
  }

  // 👉 MODIFICATION SANS NOUVELLE IMAGE
  if (index !== "" && imageInput.files.length === 0) {
    livres[index].titre = titre;
    livres[index].auteur = auteur;
    livres[index].categorie = categorie;

    localStorage.setItem("livres", JSON.stringify(livres));
    afficherLivres();
    document.getElementById("formLivre").reset();
    document.getElementById("indexLivre").value = "";
    return;
  }

  // 👉 AJOUT OU MODIFICATION AVEC IMAGE
  if (imageInput.files.length > 0) {
    const reader = new FileReader();
    reader.onload = function () {
      const livre = {
        titre,
        auteur,
        categorie,
        image: reader.result,
        disponible: true
      };

      if (index === "") {
        livres.push(livre);
      } else {
        livres[index] = livre;
      }

      localStorage.setItem("livres", JSON.stringify(livres));
      afficherLivres();
      document.getElementById("formLivre").reset();
      document.getElementById("indexLivre").value = "";
    };
    reader.readAsDataURL(imageInput.files[0]);
  }
}

function editLivre(index) {
  const livre = livres[index];

  document.getElementById("titreLivre").value = livre.titre;
  document.getElementById("auteurLivre").value = livre.auteur;
  document.getElementById("categorieLivre").value = livre.categorie;
  document.getElementById("indexLivre").value = index;
}

function deleteLivre(index) {
  if (confirm("Supprimer ce livre ?")) {
    livres.splice(index, 1);
    localStorage.setItem("livres", JSON.stringify(livres));
    afficherLivres();
  }
}
