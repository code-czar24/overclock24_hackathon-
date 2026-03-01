// Comprehensive drug interaction database
const interactions = [
  // MAJOR / CONTRAINDICATED
  {
    drug1: "warfarin", drug2: "aspirin",
    severity: "major",
    description: "Concurrent use significantly increases bleeding risk. Both drugs independently impair hemostasis through different mechanisms.",
    mechanism: "Aspirin inhibits platelet aggregation via COX-1 inhibition while warfarin inhibits vitamin K-dependent clotting factors.",
    clinicalEffects: ["Increased INR", "Gastrointestinal bleeding", "Intracranial hemorrhage", "Prolonged bleeding time"],
    management: "Avoid combination unless benefit outweighs risk. If necessary, use lowest effective aspirin dose with close INR monitoring.",
    onsetTime: "Rapid (within hours)"
  },
  {
    drug1: "warfarin", drug2: "ibuprofen",
    severity: "major",
    description: "NSAIDs inhibit platelet function and can cause GI ulceration, dramatically increasing hemorrhagic complications with warfarin.",
    mechanism: "COX inhibition reduces prostaglandin-mediated platelet aggregation; GI mucosal damage creates bleeding risk.",
    clinicalEffects: ["GI bleeding", "Elevated INR", "Hematuria", "Bruising"],
    management: "Use paracetamol (acetaminophen) instead for pain relief. Monitor INR closely if NSAID is essential.",
    onsetTime: "Within 1–3 days"
  },
  {
    drug1: "metformin", drug2: "alcohol",
    severity: "major",
    description: "Combining metformin with heavy alcohol use increases the risk of lactic acidosis, a rare but potentially fatal complication.",
    mechanism: "Alcohol impairs hepatic gluconeogenesis and increases lactic acid production, compounding metformin's effect on lactate metabolism.",
    clinicalEffects: ["Lactic acidosis", "Nausea/vomiting", "Abdominal pain", "Hypoglycemia"],
    management: "Limit or avoid alcohol. Counsel patients on the risks. Monitor lactate levels in heavy drinkers.",
    onsetTime: "Variable, hours to days"
  },
  {
    drug1: "ssri", drug2: "maoi",
    severity: "contraindicated",
    description: "Life-threatening serotonin syndrome. This combination is absolutely contraindicated.",
    mechanism: "MAOIs block monoamine oxidase, preventing serotonin breakdown. SSRIs increase synaptic serotonin. Combined effect causes catastrophic serotonin excess.",
    clinicalEffects: ["Serotonin syndrome", "Hyperthermia", "Seizures", "Muscle rigidity", "Death"],
    management: "Absolutely contraindicated. Wait 14 days after stopping MAOI before starting SSRI, or 5 weeks after stopping fluoxetine before starting MAOI.",
    onsetTime: "Rapid (within hours)"
  },
  {
    drug1: "fluoxetine", drug2: "tramadol",
    severity: "major",
    description: "Risk of serotonin syndrome and seizures. Both increase serotonergic activity and fluoxetine inhibits tramadol metabolism.",
    mechanism: "Fluoxetine inhibits CYP2D6, reducing tramadol conversion to active metabolite O-desmethyltramadol, and both increase serotonin levels.",
    clinicalEffects: ["Serotonin syndrome", "Seizures", "Reduced analgesia (paradoxically)", "Agitation"],
    management: "Avoid combination. Use alternative analgesic. If necessary, use lowest tramadol dose with close monitoring.",
    onsetTime: "Within 24–48 hours"
  },
  {
    drug1: "simvastatin", drug2: "clarithromycin",
    severity: "major",
    description: "Clarithromycin dramatically increases simvastatin plasma levels, raising the risk of myopathy and rhabdomyolysis.",
    mechanism: "Clarithromycin is a potent CYP3A4 inhibitor, blocking simvastatin metabolism and increasing its concentration up to 10-fold.",
    clinicalEffects: ["Myopathy", "Rhabdomyolysis", "Acute kidney injury", "Elevated CK levels"],
    management: "Temporarily discontinue simvastatin during clarithromycin therapy. Use pravastatin as safer alternative.",
    onsetTime: "Within 2–5 days"
  },
  {
    drug1: "digoxin", drug2: "amiodarone",
    severity: "major",
    description: "Amiodarone significantly increases digoxin toxicity by raising plasma digoxin levels up to 70–100%.",
    mechanism: "Amiodarone inhibits P-glycoprotein and CYP3A4, reducing digoxin clearance and increasing its blood levels.",
    clinicalEffects: ["Digoxin toxicity", "Bradycardia", "Heart block", "Nausea/vomiting", "Visual disturbances"],
    management: "Reduce digoxin dose by 50% when starting amiodarone. Monitor digoxin levels and ECG closely.",
    onsetTime: "Gradual, within 1–2 weeks"
  },
  {
    drug1: "lithium", drug2: "ibuprofen",
    severity: "major",
    description: "NSAIDs can increase lithium levels by up to 25–60%, causing lithium toxicity.",
    mechanism: "NSAIDs reduce renal prostaglandin synthesis, decreasing renal blood flow and lithium clearance.",
    clinicalEffects: ["Lithium toxicity", "Tremor", "Confusion", "Renal damage", "Seizures"],
    management: "Avoid NSAIDs in patients on lithium. Use paracetamol (acetaminophen) instead. If essential, reduce lithium dose and monitor levels.",
    onsetTime: "Within 3–10 days"
  },
  // MODERATE
  {
    drug1: "metformin", drug2: "ibuprofen",
    severity: "moderate",
    description: "NSAIDs may reduce kidney function, reducing metformin elimination and increasing the risk of metformin accumulation and lactic acidosis.",
    mechanism: "NSAIDs cause renal vasoconstriction reducing GFR, impairing metformin excretion.",
    clinicalEffects: ["Increased metformin exposure", "Lactic acidosis risk", "Worsened renal function"],
    management: "Use minimum NSAID dose for shortest duration. Monitor renal function. Consider paracetamol alternative.",
    onsetTime: "Days to weeks"
  },
  {
    drug1: "amlodipine", drug2: "simvastatin",
    severity: "moderate",
    description: "Amlodipine inhibits CYP3A4, increasing simvastatin exposure and raising myopathy risk.",
    mechanism: "CYP3A4 inhibition by amlodipine increases simvastatin AUC by approximately 77%.",
    clinicalEffects: ["Myopathy", "Myalgia", "Elevated CK"],
    management: "Cap simvastatin dose at 20mg/day when combined with amlodipine. Consider alternative statin like rosuvastatin.",
    onsetTime: "Weeks"
  },
  {
    drug1: "lisinopril", drug2: "potassium",
    severity: "moderate",
    description: "ACE inhibitors like lisinopril retain potassium. Supplemental potassium can cause dangerous hyperkalemia.",
    mechanism: "Lisinopril reduces aldosterone, decreasing potassium excretion. Added exogenous potassium worsens hyperkalemia risk.",
    clinicalEffects: ["Hyperkalemia", "Cardiac arrhythmia", "Muscle weakness", "Cardiac arrest"],
    management: "Monitor serum potassium levels regularly. Avoid potassium supplements unless prescribed and monitored.",
    onsetTime: "Days to weeks"
  },
  {
    drug1: "ciprofloxacin", drug2: "antacid",
    severity: "moderate",
    description: "Antacids containing aluminium, magnesium or calcium significantly reduce ciprofloxacin absorption.",
    mechanism: "Metal cations form chelate complexes with ciprofloxacin, preventing GI absorption. Bioavailability reduced by up to 90%.",
    clinicalEffects: ["Treatment failure", "Subtherapeutic antibiotic levels"],
    management: "Take ciprofloxacin 2 hours before or 6 hours after antacid administration.",
    onsetTime: "Immediate"
  },
  {
    drug1: "atorvastatin", drug2: "grapefruit",
    severity: "moderate",
    description: "Grapefruit juice inhibits intestinal CYP3A4 enzymes, increasing atorvastatin levels and myopathy risk.",
    mechanism: "Furanocoumarins in grapefruit irreversibly inhibit CYP3A4 in the gut wall, increasing drug bioavailability.",
    clinicalEffects: ["Increased statin exposure", "Myalgia", "Myopathy risk"],
    management: "Avoid large quantities of grapefruit or grapefruit juice. Switch to pravastatin or rosuvastatin if needed.",
    onsetTime: "Within hours"
  },
  {
    drug1: "sertraline", drug2: "ibuprofen",
    severity: "moderate",
    description: "SSRIs combined with NSAIDs significantly increase the risk of upper GI bleeding.",
    mechanism: "SSRIs deplete platelet serotonin, impairing platelet aggregation. NSAIDs damage GI mucosa and also inhibit platelets.",
    clinicalEffects: ["GI bleeding", "Peptic ulcers", "Increased bruising"],
    management: "Consider adding a proton pump inhibitor (PPI) like omeprazole. Monitor for GI symptoms.",
    onsetTime: "Variable"
  },
  // MINOR
  {
    drug1: "paracetamol", drug2: "alcohol",
    severity: "minor",
    description: "Regular heavy alcohol use increases hepatotoxicity risk with paracetamol, particularly with overdose.",
    mechanism: "Chronic alcohol induces CYP2E1, increasing formation of toxic NAPQI metabolite. Glutathione stores also depleted by alcohol.",
    clinicalEffects: ["Hepatotoxicity", "Liver failure (in overdose)"],
    management: "Occasional moderate alcohol use with therapeutic paracetamol doses is generally safe. Avoid in chronic heavy drinkers.",
    onsetTime: "Dose/duration dependent"
  },
  {
    drug1: "aspirin", drug2: "antacid",
    severity: "minor",
    description: "Antacids may reduce aspirin absorption slightly, but the interaction is generally clinically insignificant at therapeutic doses.",
    mechanism: "Alkaline environment from antacids may alter aspirin ionization and reduce absorption.",
    clinicalEffects: ["Slightly reduced aspirin bioavailability"],
    management: "Generally safe to use together. Separate by 1–2 hours if optimal aspirin absorption is required.",
    onsetTime: "Immediate"
  },
  // SAFE / NONE
  {
    drug1: "paracetamol", drug2: "ibuprofen",
    severity: "none",
    description: "Paracetamol and ibuprofen have complementary mechanisms and can be safely alternated or even used together for short-term pain/fever management in most patients.",
    mechanism: "Paracetamol acts centrally with uncertain mechanism; ibuprofen inhibits COX peripherally. No pharmacokinetic interaction.",
    clinicalEffects: ["Enhanced pain relief when alternated"],
    management: "Safe combination. Commonly used together or alternated every 3–4 hours in clinical settings. Follow standard dosing guidelines.",
    onsetTime: "N/A"
  },
  {
    drug1: "metformin", drug2: "lisinopril",
    severity: "none",
    description: "This combination is actually beneficial and commonly prescribed together for diabetic patients with hypertension.",
    mechanism: "No clinically significant pharmacokinetic interaction. Both are renoprotective in diabetes.",
    clinicalEffects: ["Beneficial: improved glycemic control + blood pressure + renal protection"],
    management: "Continue as prescribed. Monitor renal function and potassium periodically as standard care.",
    onsetTime: "N/A"
  }
];

const drugs = [
  { name: "warfarin", displayName: "Warfarin", category: "Anticoagulant", description: "Blood thinner used to prevent clots", commonBrands: ["Coumadin", "Jantoven"] },
  { name: "aspirin", displayName: "Aspirin", category: "NSAID / Antiplatelet", description: "Pain reliever and blood thinner", commonBrands: ["Bayer", "Ecotrin"] },
  { name: "ibuprofen", displayName: "Ibuprofen", category: "NSAID", description: "Anti-inflammatory pain reliever", commonBrands: ["Advil", "Motrin", "Nurofen"] },
  { name: "paracetamol", displayName: "Paracetamol", category: "Analgesic / Antipyretic", description: "Pain reliever and fever reducer", commonBrands: ["Tylenol", "Panadol", "Calpol"] },
  { name: "metformin", displayName: "Metformin", category: "Antidiabetic", description: "First-line medication for type 2 diabetes", commonBrands: ["Glucophage", "Fortamet"] },
  { name: "lisinopril", displayName: "Lisinopril", category: "ACE Inhibitor", description: "Blood pressure medication", commonBrands: ["Zestril", "Prinivil"] },
  { name: "amlodipine", displayName: "Amlodipine", category: "Calcium Channel Blocker", description: "Blood pressure and angina medication", commonBrands: ["Norvasc", "Istin"] },
  { name: "simvastatin", displayName: "Simvastatin", category: "Statin", description: "Cholesterol-lowering medication", commonBrands: ["Zocor", "Simvador"] },
  { name: "atorvastatin", displayName: "Atorvastatin", category: "Statin", description: "Cholesterol-lowering medication", commonBrands: ["Lipitor"] },
  { name: "amiodarone", displayName: "Amiodarone", category: "Antiarrhythmic", description: "Heart rhythm medication", commonBrands: ["Cordarone", "Pacerone"] },
  { name: "digoxin", displayName: "Digoxin", category: "Cardiac Glycoside", description: "Heart failure and arrhythmia medication", commonBrands: ["Lanoxin"] },
  { name: "lithium", displayName: "Lithium", category: "Mood Stabilizer", description: "Bipolar disorder treatment", commonBrands: ["Eskalith", "Lithobid"] },
  { name: "fluoxetine", displayName: "Fluoxetine", category: "SSRI Antidepressant", description: "Antidepressant medication", commonBrands: ["Prozac", "Sarafem"] },
  { name: "sertraline", displayName: "Sertraline", category: "SSRI Antidepressant", description: "Antidepressant medication", commonBrands: ["Zoloft"] },
  { name: "tramadol", displayName: "Tramadol", category: "Opioid Analgesic", description: "Pain medication", commonBrands: ["Ultram", "ConZip"] },
  { name: "clarithromycin", displayName: "Clarithromycin", category: "Antibiotic", description: "Macrolide antibiotic", commonBrands: ["Biaxin"] },
  { name: "ciprofloxacin", displayName: "Ciprofloxacin", category: "Antibiotic", description: "Fluoroquinolone antibiotic", commonBrands: ["Cipro"] },
  { name: "potassium", displayName: "Potassium", category: "Electrolyte Supplement", description: "Mineral supplement", commonBrands: ["K-Dur", "Klor-Con"] },
  { name: "antacid", displayName: "Antacid", category: "GI Agent", description: "Stomach acid neutralizer", commonBrands: ["Tums", "Maalox", "Gaviscon"] },
  { name: "alcohol", displayName: "Alcohol (Ethanol)", category: "Substance", description: "Ethyl alcohol – interacts with many medications", commonBrands: [] },
  { name: "grapefruit", displayName: "Grapefruit", category: "Food/Supplement", description: "Fruit that inhibits CYP3A4 enzyme", commonBrands: [] },
  { name: "ssri", displayName: "SSRI (Generic)", category: "Antidepressant Class", description: "Selective serotonin reuptake inhibitor class", commonBrands: ["Prozac", "Zoloft", "Lexapro"] },
  { name: "maoi", displayName: "MAOI (Generic)", category: "Antidepressant Class", description: "Monoamine oxidase inhibitor class", commonBrands: ["Nardil", "Parnate"] }
];

module.exports = { interactions, drugs };
