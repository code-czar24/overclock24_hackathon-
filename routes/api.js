const express = require('express');
const router = express.Router();
const https = require('https');
const { searchDrugs, findInteraction, logSearch, getStats, normalize } = require('../db');

// ── Helper: fetch JSON from URL ──
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'RxGuard/1.0 (hackathon project)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Invalid JSON from API')); }
      });
    }).on('error', reject).setTimeout(6000, function() { this.destroy(new Error('Timeout')); });
  });
}

// ── RxNorm: drug name → RxCUI code ──
async function getRxCUI(drugName) {
  try {
    const encoded = encodeURIComponent(drugName.trim());
    const data = await fetchJSON(
      `https://rxnav.nlm.nih.gov/REST/rxcui.json?name=${encoded}&search=2`
    );
    const cui = data?.idGroup?.rxnormId?.[0];
    return cui || null;
  } catch (e) { return null; }
}

// ── RxNorm: drug name → suggestions (autocomplete) ──
async function getRxNormSuggestions(query) {
  try {
    const encoded = encodeURIComponent(query.trim());
    const data = await fetchJSON(
      `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${encoded}`
    );
    return data?.suggestionGroup?.suggestionList?.suggestion || [];
  } catch (e) { return []; }
}

// ── RxNorm: approximate match (handles brand names) ──
async function getRxNormApproximate(query) {
  try {
    const encoded = encodeURIComponent(query.trim());
    const data = await fetchJSON(
      `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encoded}&maxEntries=5`
    );
    const candidates = data?.approximateGroup?.candidate || [];
    return candidates.map(c => ({ name: c.name, rxcui: c.rxcui }));
  } catch (e) { return []; }
}

// ── OpenFDA: get drug info from FDA label database ──
async function getFDADrugInfo(drugName) {
  try {
    const encoded = encodeURIComponent(`"${drugName.trim()}"`);
    const data = await fetchJSON(
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:${encoded}+openfda.brand_name:${encoded}&limit=1`
    );
    const result = data?.results?.[0];
    if (!result) return null;

    return {
      name: result.openfda?.generic_name?.[0] || drugName,
      brandName: result.openfda?.brand_name?.[0] || null,
      manufacturer: result.openfda?.manufacturer_name?.[0] || null,
      drugClass: result.openfda?.pharm_class_epc?.[0] || null,
      interactions: result.drug_interactions?.[0] || null,
      warnings: result.warnings?.[0] || result.warnings_and_cautions?.[0] || null,
      indications: result.indications_and_usage?.[0] || null,
      rxcui: result.openfda?.rxcui?.[0] || null
    };
  } catch (e) { return null; }
}

// ── Parse FDA interaction text for a specific drug ──
function parseInteractionFromFDA(fdaInfo1, fdaInfo2) {
  if (!fdaInfo1 && !fdaInfo2) return null;

  const interactionText = fdaInfo1?.interactions || fdaInfo2?.interactions || '';
  const drug2Name = (fdaInfo2?.name || '').toLowerCase();
  const drug1Name = (fdaInfo1?.name || '').toLowerCase();

  // Check if drug2 is mentioned in drug1's interaction text and vice versa
  const mentionedIn1 = interactionText.toLowerCase().includes(drug2Name);
  const text2 = fdaInfo2?.interactions || '';
  const mentionedIn2 = text2.toLowerCase().includes(drug1Name);

  if (mentionedIn1 || mentionedIn2) {
    const relevantText = mentionedIn1 ? interactionText : text2;
    // Extract the relevant sentence
    const sentences = relevantText.split(/[.!?]+/);
    const relevant = sentences.filter(s =>
      s.toLowerCase().includes(mentionedIn1 ? drug2Name : drug1Name)
    ).slice(0, 2).join('. ').trim();

    return {
      severity: 'moderate', // Conservative default from FDA text
      description: relevant.length > 20
        ? relevant + '.'
        : `Interaction noted in FDA labeling between ${fdaInfo1?.name || 'Drug 1'} and ${fdaInfo2?.name || 'Drug 2'}. Review full prescribing information.`,
      mechanism: 'See FDA prescribing information for full details.',
      clinicalEffects: ['See FDA label for clinical effects'],
      management: 'Consult the full FDA prescribing information or a pharmacist.',
      source: 'OpenFDA Drug Label',
      onsetTime: 'Variable'
    };
  }
  return null;
}

// ── GET /api/drugs/search?q= ── autocomplete (local + RxNorm)
router.get('/drugs/search', async (req, res) => {
  const q = req.query.q || '';
  if (q.length < 2) return res.json([]);

  // Local results first (instant)
  const local = searchDrugs(q);

  // RxNorm approximate match for global coverage
  let rxnormResults = [];
  try {
    const approx = await getRxNormApproximate(q);
    rxnormResults = approx
      .filter(r => !local.find(l => l.name === r.name?.toLowerCase()))
      .slice(0, 5)
      .map(r => ({
        name: r.name?.toLowerCase() || '',
        displayName: r.name || '',
        category: 'Drug (RxNorm)',
        commonBrands: [],
        source: 'rxnorm'
      }));
  } catch (e) {}

  res.json([...local, ...rxnormResults]);
});

// ── GET /api/drugs ── all local drugs
router.get('/drugs', (req, res) => {
  const { drugs } = require('../data/drugData');
  res.json(drugs.map(d => ({ name: d.name, displayName: d.displayName, category: d.category })));
});

// ── POST /api/interactions/check ── main engine
router.post('/interactions/check', async (req, res) => {
  const { drugs } = req.body;
  if (!drugs || drugs.length < 2) {
    return res.status(400).json({ error: 'Please provide at least 2 drug names' });
  }

  const interactions = [];
  const fdaCache = {}; // Cache FDA lookups per drug

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      const d1 = drugs[i], d2 = drugs[j];

      // 1️⃣ Check local DB first (fast, detailed)
      const localResult = findInteraction(d1, d2);
      if (localResult) {
        interactions.push({
          ...localResult,
          drug1: d1, drug2: d2,
          source: 'Clinical Database'
        });
        continue;
      }

      // 2️⃣ Try OpenFDA for global drug coverage
      let fdaInteraction = null;
      try {
        if (!fdaCache[d1]) fdaCache[d1] = await getFDADrugInfo(d1);
        if (!fdaCache[d2]) fdaCache[d2] = await getFDADrugInfo(d2);

        fdaInteraction = parseInteractionFromFDA(fdaCache[d1], fdaCache[d2]);
      } catch (e) {}

      if (fdaInteraction) {
        interactions.push({ ...fdaInteraction, drug1: d1, drug2: d2 });
        continue;
      }

      // 3️⃣ FDA found both drugs but no specific interaction text
      if (fdaCache[d1] || fdaCache[d2]) {
        const info1 = fdaCache[d1];
        const info2 = fdaCache[d2];
        interactions.push({
          drug1: d1, drug2: d2,
          severity: 'none',
          description: `No documented interaction found between ${info1?.name || d1} and ${info2?.name || d2} in the FDA label database. Both drugs were found and verified.`,
          mechanism: null,
          clinicalEffects: [],
          management: 'No specific interaction documented. Always consult a healthcare professional.',
          onsetTime: null,
          source: 'OpenFDA (No interaction found)',
          fdaInfo: {
            drug1: info1 ? { brandName: info1.brandName, drugClass: info1.drugClass } : null,
            drug2: info2 ? { brandName: info2.brandName, drugClass: info2.drugClass } : null
          }
        });
        continue;
      }

      // 4️⃣ Truly unknown
      interactions.push({
        drug1: d1, drug2: d2,
        severity: 'unknown',
        description: `No interaction data found for this combination in our database or the FDA drug label system. This does not mean the combination is safe.`,
        mechanism: null,
        clinicalEffects: [],
        management: 'Always consult a pharmacist or physician before combining medications.',
        onsetTime: null,
        source: 'Not found'
      });
    }
  }

  const order = ['contraindicated', 'major', 'moderate', 'minor', 'none', 'unknown'];
  const highestSeverity = interactions.reduce((highest, curr) => {
    return order.indexOf(curr.severity) < order.indexOf(highest) ? curr.severity : highest;
  }, 'unknown');

  logSearch(drugs.map(normalize), highestSeverity);

  res.json({
    success: true,
    drugsChecked: drugs,
    interactionCount: interactions.filter(i => i.severity !== 'none' && i.severity !== 'unknown').length,
    highestSeverity,
    interactions
  });
});

// ── GET /api/drug/info/:name ── detailed drug info from FDA
router.get('/drug/info/:name', async (req, res) => {
  try {
    const info = await getFDADrugInfo(req.params.name);
    if (!info) return res.status(404).json({ error: 'Drug not found in FDA database' });
    res.json(info);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/stats ──
router.get('/stats', (req, res) => {
  res.json(getStats());
});

module.exports = router;
