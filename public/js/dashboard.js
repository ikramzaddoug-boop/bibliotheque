// js/dashboard.js
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "../login.html";
}

function safeLoad(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function updateStats() {
  const books = safeLoad("livres");
  const clients = safeLoad("adherents");
  const authors = safeLoad("auteurs");
  const loans = safeLoad("emprunts");

  const tb = document.getElementById("totalBooks");
  const tc = document.getElementById("totalClients");
  const ta = document.getElementById("totalAuthors");
  const tl = document.getElementById("totalLoans");

  if (tb) tb.textContent = books.length;
  if (tc) tc.textContent = clients.length;
  if (ta) ta.textContent = authors.length;
  if (tl) tl.textContent = loans.length;
}

function drawCategoryChart() {
  if (typeof google === "undefined" || !google.visualization) return;
  const books = safeLoad("livres");
  const container = document.getElementById("categoryChart");
  if (!container) return;

  const categoryCount = {};
  books.forEach(book => {
    const cat = (book && book.categorie) ? book.categorie : "Non renseignée";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  const rows = Object.keys(categoryCount).length ? Object.entries(categoryCount) : [["Aucune", 0]];
  const dataArray = [["Category", "Books"], ...rows];

  const data = google.visualization.arrayToDataTable(dataArray);
  const options = { legend: { position: "none" }, height: 320, chartArea: { left: 40, top: 20, right: 20, bottom: 30 } };
  const chart = new google.visualization.ColumnChart(container);
  chart.draw(data, options);
}

function drawStatusChart() {
  if (typeof google === "undefined" || !google.visualization) return;
  const books = safeLoad("livres");
  const loans = safeLoad("emprunts");
  const container = document.getElementById("statusChart");
  if (!container) return;

  const borrowed = loans.filter(l => !l.dateRetour).length;
  const available = books.filter(b => b.disponible !== false).length;

  const data = google.visualization.arrayToDataTable([
    ["Status", "Count"],
    ["Empruntés", borrowed],
    ["Disponibles", available]
  ]);

  const options = { height: 220, pieHole: 0.4, chartArea: { left: 20, top: 10, right: 20, bottom: 10 } };
  const chart = new google.visualization.PieChart(container);
  chart.draw(data, options);
}

function drawCharts() {
  drawCategoryChart();
  drawStatusChart();
}

function populateRecentLoans(limit = 5) {
  const loans = safeLoad("emprunts");
  const tbody = document.getElementById("recentLoansBody");
  if (!tbody) return;

  if (loans.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-muted">Aucun emprunt récent</td></tr>';
    return;
  }
  const recent = loans.slice(-limit).reverse();
  tbody.innerHTML = recent.map(e => {
    const livre = escapeHtml(e.livreTitle || e.livre || "—");
    const adherent = escapeHtml(e.adherentName || e.adherent || "—");
    const d1 = escapeHtml(e.dateEmprunt || "—");
    const d2 = escapeHtml(e.dateRetour || "—");
    return `<tr><td>${livre}</td><td>${adherent}</td><td>${d1}</td><td>${d2}</td></tr>`;
  }).join("");
}

function initDashboard() {
  updateStats();

  // If Google Charts is available, load packages and draw. Otherwise log a friendly message.
  if (typeof google !== "undefined" && google.charts) {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(drawCharts);
  } else {
    console.warn("Google Charts not loaded. Add <script src=\"https://www.gstatic.com/charts/loader.js\"></script> to the page.");
  }

  populateRecentLoans(5);

  // redraw charts on resize (debounced)
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (typeof google !== "undefined" && google.visualization) drawCharts();
    }, 200);
  });
}

// initialize (called after page/data seeding or on DOM ready)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}