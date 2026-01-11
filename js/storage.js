// js/storage.js
const STORAGE_KEYS = {
  livres: "livres",
  auteurs: "auteurs",
  categories: "categories",
  adherents: "adherents",
  emprunts: "emprunts"
};

// Load initial JSON if not in localStorage or if stored value is invalid/empty
async function loadInitialData(key, jsonPath) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      await fetchAndStore(key, jsonPath);
      return;
    }

    // try parse and check content
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      await fetchAndStore(key, jsonPath);
    }
  } catch (err) {
    // fail silently but log for debugging
    console.error("loadInitialData error for", key, err);
  }
}

async function fetchAndStore(key, jsonPath) {
  const resp = await fetch(jsonPath);
  if (!resp.ok) throw new Error(`Failed to fetch ${jsonPath}: ${resp.status}`);
  const data = await resp.json();

  // Add 'disponible' property to books when seeding
  if (key === STORAGE_KEYS.livres) {
    (data || []).forEach(l => { if (l.disponible === undefined) l.disponible = true; });
  }

  localStorage.setItem(key, JSON.stringify(data || []));
}

function getData(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}