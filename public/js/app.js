// RxGuard — Frontend App Logic
const API = '';
const selectedDrugs = [];
let autocompleteTimeout = null;
let autocompleteIndex = -1;

const drugInput       = document.getElementById('drugInput');
const drugTagsEl      = document.getElementById('drugTags');
const analyzeBtn      = document.getElementById('analyzeBtn');
const autocompleteEl  = document.getElementById('autocompleteList');
const resultsSection  = document.getElementById('results');
const resultsSummary  = document.getElementById('resultsSummary');
const resultsGrid     = document.getElementById('resultsGrid');

const SEVERITY = {
  none:            { label: 'No Interaction', icon: '✓', color: '#00e5a0', barWidth: '8%',  summaryClass: 'results__summary--safe',            summaryTitle: 'No Significant Interactions Found',   summaryDesc: 'The selected drugs appear safe to use together based on available data.' },
  minor:           { label: 'Minor',          icon: '↓', color: '#ffd166', barWidth: '30%', summaryClass: 'results__summary--minor',           summaryTitle: 'Minor Interactions Detected',         summaryDesc: 'Low-risk interactions found. Monitor for any unusual effects.' },
  moderate:        { label: 'Moderate',       icon: '⚠', color: '#ff9f43', barWidth: '55%', summaryClass: 'results__summary--moderate',        summaryTitle: 'Moderate Interactions Detected',      summaryDesc: 'Potentially significant interactions. Consult your pharmacist or physician.' },
  major:           { label: 'Major',          icon: '⚡', color: '#ff4757', barWidth: '80%', summaryClass: 'results__summary--major',           summaryTitle: 'Major Interactions — Use Caution!',   summaryDesc: 'High-risk interactions identified. Do not combine without medical supervision.' },
  contraindicated: { label: 'Contraindicated',icon: '✕', color: '#a855f7', barWidth: '100%',summaryClass: 'results__summary--contraindicated', summaryTitle: 'CONTRAINDICATED — Do Not Combine!',   summaryDesc: 'This combination is medically forbidden and potentially life-threatening.' },
  unknown:         { label: 'Unknown',        icon: '?', color: '#7a8aaa', barWidth: '0%',  summaryClass: '',                                  summaryTitle: 'Interaction Data Unavailable',        summaryDesc: 'No data found. This does not mean the combination is safe.' }
};

function addDrug(name) {
  const normalized = name.trim();
  if (!normalized) return;
  if (selectedDrugs.find(d => d.toLowerCase() === normalized.toLowerCase())) {
    showToast(`${normalized} is already added`); return;
  }
  if (selectedDrugs.length >= 6) { showToast('Maximum 6 drugs at a time'); return; }
  selectedDrugs.push(normalized);
  renderTags();
  drugInput.value = '';
  hideAutocomplete();
  updateAnalyzeBtn();
}

function removeDrug(name) {
  const idx = selectedDrugs.indexOf(name);
  if (idx !== -1) selectedDrugs.splice(idx, 1);
  renderTags(); updateAnalyzeBtn();
}

function renderTags() {
  drugTagsEl.innerHTML = selectedDrugs.map(name => `
    <div class="drug-tag">
      <span>${escHtml(name)}</span>
      <button class="drug-tag__remove" onclick="removeDrug('${escHtml(name)}')" title="Remove">×</button>
    </div>
  `).join('');
}

function updateAnalyzeBtn() { analyzeBtn.disabled = selectedDrugs.length < 2; }
function quickAdd(name) { addDrug(name); }

// Autocomplete
drugInput.addEventListener('input', () => {
  clearTimeout(autocompleteTimeout);
  const q = drugInput.value.trim();
  if (q.length < 2) { hideAutocomplete(); return; }
  autocompleteTimeout = setTimeout(() => fetchAutocomplete(q), 250);
});

drugInput.addEventListener('keydown', (e) => {
  const items = autocompleteEl.querySelectorAll('.autocomplete-item');
  if (e.key === 'ArrowDown') { autocompleteIndex = Math.min(autocompleteIndex + 1, items.length - 1); updateActiveItem(items); }
  else if (e.key === 'ArrowUp') { autocompleteIndex = Math.max(autocompleteIndex - 1, -1); updateActiveItem(items); }
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (autocompleteIndex >= 0 && items[autocompleteIndex]) items[autocompleteIndex].click();
    else if (drugInput.value.trim()) addDrug(drugInput.value.trim());
  } else if (e.key === 'Escape') hideAutocomplete();
});

function updateActiveItem(items) { items.forEach((el, i) => el.classList.toggle('active', i === autocompleteIndex)); }

async function fetchAutocomplete(q) {
  try {
    const resp = await fetch(`${API}/api/drugs/search?q=${encodeURIComponent(q)}`);
    const data = await resp.json();
    renderAutocomplete(data);
  } catch (err) { hideAutocomplete(); }
}

function renderAutocomplete(drugs) {
  autocompleteIndex = -1;
  if (!drugs.length) { hideAutocomplete(); return; }
  autocompleteEl.innerHTML = drugs.map(d => `
    <div class="autocomplete-item" onclick="addDrug('${escHtml(d.displayName)}')">
      <div>
        <div class="autocomplete-item__name">${escHtml(d.displayName)}</div>
        ${d.commonBrands && d.commonBrands.length ? `<div style="font-size:0.75rem;color:#7a8aaa">${d.commonBrands.slice(0,3).join(', ')}</div>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:0.4rem">
        <span class="autocomplete-item__cat">${escHtml(d.category || '')}</span>
        ${d.source === 'rxnorm' ? '<span style="font-size:0.65rem;color:#00d4ff;background:rgba(0,212,255,0.1);padding:0.15rem 0.45rem;border-radius:10px">RxNorm</span>' : ''}
      </div>
    </div>
  `).join('');
  autocompleteEl.classList.add('show');
}

function hideAutocomplete() { autocompleteEl.classList.remove('show'); autocompleteEl.innerHTML = ''; autocompleteIndex = -1; }
document.addEventListener('click', (e) => { if (!e.target.closest('.input-wrap')) hideAutocomplete(); });

// Analyze
async function analyzeInteractions() {
  if (selectedDrugs.length < 2) return;

  analyzeBtn.querySelector('.btn__text').style.display = 'none';
  analyzeBtn.querySelector('.btn__icon').style.display = 'none';
  analyzeBtn.querySelector('.btn__loader').style.display = 'flex';
  analyzeBtn.disabled = true;
  resultsSection.style.display = 'none';

  // Show a searching message for live API calls
  showToast('🔍 Querying FDA database for global coverage…');

  try {
    const resp = await fetch(`${API}/api/interactions/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drugs: selectedDrugs })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Analysis failed');
    renderResults(data);
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showToast('⚠ Could not connect to server. Is it running?', true);
    console.error(err);
  } finally {
    analyzeBtn.querySelector('.btn__text').style.display = '';
    analyzeBtn.querySelector('.btn__icon').style.display = '';
    analyzeBtn.querySelector('.btn__loader').style.display = 'none';
    analyzeBtn.disabled = false;
  }
}

function renderResults(data) {
  const sev = SEVERITY[data.highestSeverity] || SEVERITY.unknown;

  resultsSummary.className = `results__summary ${sev.summaryClass}`;
  resultsSummary.innerHTML = `
    <div class="summary__icon">${sev.icon}</div>
    <div>
      <div class="summary__title">${sev.summaryTitle}</div>
      <div class="summary__subtitle">
        Checked ${data.drugsChecked.length} drug${data.drugsChecked.length !== 1 ? 's' : ''} ·
        ${data.interactionCount} interaction${data.interactionCount !== 1 ? 's' : ''} found ·
        Powered by Clinical DB + OpenFDA
      </div>
    </div>
  `;

  const order = ['contraindicated','major','moderate','minor','unknown','none'];
  const sorted = [...data.interactions].sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));

  resultsGrid.innerHTML = sorted.map((interaction, i) => {
    const s = SEVERITY[interaction.severity] || SEVERITY.unknown;
    const drug1 = interaction.drug1 || '';
    const drug2 = interaction.drug2 || '';
    const effects = interaction.clinicalEffects || [];
    const source = interaction.source || '';
    const isLocalDB = source === 'Clinical Database';
    const isFDA = source.includes('FDA');
    const fdaInfo = interaction.fdaInfo || null;

    const sourceBadge = isLocalDB
      ? `<span class="source-badge source-badge--local">⚕ Clinical DB</span>`
      : isFDA
      ? `<span class="source-badge source-badge--fda">🏛 OpenFDA</span>`
      : `<span class="source-badge source-badge--unknown">— No Data</span>`;

    const fdaBlock = fdaInfo ? `
      <div class="detail-section">
        <div class="detail-section__label">FDA Drug Details</div>
        <div class="fda-info-grid">
          ${fdaInfo.drug1 ? `<div class="fda-drug-card">
            <div class="fda-drug-name">${escHtml(capitalizeFirst(drug1))}</div>
            ${fdaInfo.drug1.brandName ? `<div class="fda-drug-meta">Brand: ${escHtml(fdaInfo.drug1.brandName)}</div>` : ''}
            ${fdaInfo.drug1.drugClass ? `<div class="fda-drug-meta fda-drug-class">${escHtml(fdaInfo.drug1.drugClass)}</div>` : ''}
          </div>` : ''}
          ${fdaInfo.drug2 ? `<div class="fda-drug-card">
            <div class="fda-drug-name">${escHtml(capitalizeFirst(drug2))}</div>
            ${fdaInfo.drug2.brandName ? `<div class="fda-drug-meta">Brand: ${escHtml(fdaInfo.drug2.brandName)}</div>` : ''}
            ${fdaInfo.drug2.drugClass ? `<div class="fda-drug-meta fda-drug-class">${escHtml(fdaInfo.drug2.drugClass)}</div>` : ''}
          </div>` : ''}
        </div>
      </div>` : '';

    return `
      <div class="interaction-card" data-severity="${interaction.severity}" style="animation-delay:${i * 0.08}s">
        <div class="interaction-card__header" onclick="toggleCard(this)">
          <div class="interaction-card__drugs">
            <span>${escHtml(capitalizeFirst(drug1))}</span>
            <span class="interaction-card__sep">+</span>
            <span>${escHtml(capitalizeFirst(drug2))}</span>
            ${sourceBadge}
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem">
            <span class="severity-badge severity-badge--${interaction.severity}">${s.icon} ${s.label}</span>
            <svg class="chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </div>
        </div>
        <div class="interaction-card__body">
          <div class="severity-bar">
            <span class="severity-bar__label" style="color:${s.color}">Severity</span>
            <div class="severity-bar__track">
              <div class="severity-bar__fill" style="width:${s.barWidth};background:${s.color}"></div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-section__label">Description</div>
            <div class="detail-section__text">${escHtml(interaction.description)}</div>
          </div>
          ${interaction.mechanism ? `<div class="detail-section"><div class="detail-section__label">Mechanism</div><div class="detail-section__text">${escHtml(interaction.mechanism)}</div></div>` : ''}
          ${effects.length ? `<div class="detail-section"><div class="detail-section__label">Clinical Effects</div><div class="effects-list">${effects.map(e => `<span class="effect-tag">${escHtml(e)}</span>`).join('')}</div></div>` : ''}
          ${interaction.management ? `<div class="detail-section"><div class="detail-section__label">Management</div><div class="detail-section__text">${escHtml(interaction.management)}</div></div>` : ''}
          ${interaction.onsetTime ? `<div class="detail-section"><div class="detail-section__label">Onset Time</div><div class="detail-section__text">${escHtml(interaction.onsetTime)}</div></div>` : ''}
          ${fdaBlock}
          <div class="source-footer">Data source: ${escHtml(source || 'Unknown')}</div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleCard(headerEl) {
  const body = headerEl.nextElementSibling;
  const chevron = headerEl.querySelector('.chevron');
  body.classList.toggle('open');
  chevron.classList.toggle('open');
}

// Stats
async function loadStats() {
  try {
    const resp = await fetch(`${API}/api/stats`);
    const data = await resp.json();
    animateCount('statDrugs', data.totalDrugs || 0);
    animateCount('statInteractions', data.totalInteractions || 0);
    animateCount('statSearches', data.totalSearches || 0);
    animateCount('statMajor', data.majorInteractions || 0);
  } catch (err) {
    document.getElementById('statDrugs').textContent = '23+';
    document.getElementById('statInteractions').textContent = '18+';
    document.getElementById('statSearches').textContent = '—';
    document.getElementById('statMajor').textContent = '8';
  }
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  const duration = 1200, steps = 40;
  let step = 0;
  const timer = setInterval(() => {
    step++;
    el.textContent = Math.round(easeOut(step / steps) * target);
    if (step >= steps) { el.textContent = target; clearInterval(timer); }
  }, duration / steps);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function capitalizeFirst(str) { if (!str) return ''; return str.charAt(0).toUpperCase() + str.slice(1); }

let toastTimeout;
function showToast(msg, isError = false) {
  clearTimeout(toastTimeout);
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  if (isError) toast.style.borderColor = 'rgba(255,71,87,0.4)';
  document.body.appendChild(toast);
  toastTimeout = setTimeout(() => toast.remove(), 3000);
}

window.addEventListener('DOMContentLoaded', () => { loadStats(); });
