// db.js — Simple JSON file database (no MongoDB needed!)
const fs = require('fs');
const path = require('path');
const { interactions, drugs } = require('./data/drugData');

const DB_FILE = path.join(__dirname, 'data', 'searchHistory.json');

// ── Load search history from file ──
function loadHistory() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {}
  return [];
}

// ── Save search history to file ──
function saveHistory(history) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(history, null, 2));
  } catch (e) {}
}

// ── Log a search ──
function logSearch(drugNames, severityFound) {
  const history = loadHistory();
  history.unshift({
    drugs: drugNames,
    severityFound,
    timestamp: new Date().toISOString()
  });
  // Keep last 100 searches only
  saveHistory(history.slice(0, 100));
}

// ── Normalize drug name ──
const normalize = (str) => str.toLowerCase().trim();

// ── Search drugs for autocomplete ──
function searchDrugs(query) {
  const q = query.toLowerCase();
  return drugs.filter(d =>
    d.name.includes(q) ||
    d.displayName.toLowerCase().includes(q) ||
    (d.commonBrands && d.commonBrands.some(b => b.toLowerCase().includes(q)))
  ).slice(0, 8);
}

// ── Find interaction between two drugs ──
function findInteraction(drug1, drug2) {
  const d1 = normalize(drug1);
  const d2 = normalize(drug2);
  return interactions.find(i =>
    (i.drug1 === d1 && i.drug2 === d2) ||
    (i.drug1 === d2 && i.drug2 === d1)
  ) || null;
}

// ── Get stats ──
function getStats() {
  const history = loadHistory();
  const majorCount = interactions.filter(i =>
    i.severity === 'major' || i.severity === 'contraindicated'
  ).length;

  return {
    totalDrugs: drugs.length,
    totalInteractions: interactions.length,
    majorInteractions: majorCount,
    totalSearches: history.length,
    recentSearches: history.slice(0, 5)
  };
}

module.exports = { searchDrugs, findInteraction, logSearch, getStats, normalize };
