/**
 * Lab Report & Prescription Analyzer
 *
 * Interprets lab report text, extracts values, compares to reference ranges.
 * All reference ranges are India-specific where available.
 * 100% on-device processing.
 */

import { cleanOCRText } from './ocr';

// ─── Reference Ranges (Indian population adjusted) ───────────────────────
const REFERENCE_RANGES = {
  // Complete Blood Count (CBC)
  'hemoglobin': { label: 'Hemoglobin', unit: 'g/dL', male: [13.5, 17.5], female: [12.0, 15.5], criticalLow: 7, criticalHigh: 20 },
  'hb': { label: 'Hemoglobin', unit: 'g/dL', male: [13.5, 17.5], female: [12.0, 15.5] },
  'rbc': { label: 'RBC Count', unit: 'million/µL', male: [4.5, 5.5], female: [4.0, 5.0] },
  'wbc': { label: 'WBC Count', unit: '/µL', range: [4000, 11000], criticalLow: 2000, criticalHigh: 30000 },
  'tlc': { label: 'Total Leukocyte Count', unit: '/µL', range: [4000, 11000] },
  'platelets': { label: 'Platelet Count', unit: '/µL', range: [150000, 450000], criticalLow: 50000, criticalHigh: 1000000 },
  'neutrophils': { label: 'Neutrophils', unit: '%', range: [40, 80] },
  'lymphocytes': { label: 'Lymphocytes', unit: '%', range: [20, 40] },
  'eosinophils': { label: 'Eosinophils', unit: '%', range: [1, 6] },
  'monocytes': { label: 'Monocytes', unit: '%', range: [2, 8] },
  'basophils': { label: 'Basophils', unit: '%', range: [0, 1] },
  'mcv': { label: 'MCV', unit: 'fL', range: [80, 100] },
  'mch': { label: 'MCH', unit: 'pg', range: [27, 32] },
  'mchc': { label: 'MCHC', unit: 'g/dL', range: [32, 36] },
  'rdw': { label: 'RDW', unit: '%', range: [11.5, 14.5] },
  'pcv': { label: 'PCV / Hematocrit', unit: '%', male: [40, 50], female: [36, 46] },
  'hematocrit': { label: 'Hematocrit', unit: '%', male: [40, 50], female: [36, 46] },
  'hct': { label: 'Hematocrit', unit: '%', male: [40, 50], female: [36, 46] },
  'esr': { label: 'ESR', unit: 'mm/hr', range: [0, 22] },

  // Liver Function Test (LFT)
  'alt': { label: 'ALT / SGPT', unit: 'U/L', range: [7, 56] },
  'sgpt': { label: 'SGPT / ALT', unit: 'U/L', range: [7, 56] },
  'ast': { label: 'AST / SGOT', unit: 'U/L', range: [10, 40] },
  'sgot': { label: 'SGOT / AST', unit: 'U/L', range: [10, 40] },
  'alp': { label: 'ALP', unit: 'U/L', range: [44, 147] },
  'ggt': { label: 'GGT', unit: 'U/L', range: [0, 55] },
  'total bilirubin': { label: 'Total Bilirubin', unit: 'mg/dL', range: [0.1, 1.2] },
  'direct bilirubin': { label: 'Direct Bilirubin', unit: 'mg/dL', range: [0, 0.3] },
  'total protein': { label: 'Total Protein', unit: 'g/dL', range: [6.0, 8.3] },
  'albumin': { label: 'Albumin', unit: 'g/dL', range: [3.5, 5.5] },
  'globulin': { label: 'Globulin', unit: 'g/dL', range: [2.0, 3.5] },
  'ag ratio': { label: 'A/G Ratio', unit: '', range: [1.0, 2.0] },

  // Kidney Function Test (KFT)
  'creatinine': { label: 'Creatinine', unit: 'mg/dL', male: [0.6, 1.2], female: [0.5, 1.1] },
  'bun': { label: 'BUN', unit: 'mg/dL', range: [7, 20] },
  'blood urea': { label: 'Blood Urea', unit: 'mg/dL', range: [10, 50] },
  'uric acid': { label: 'Uric Acid', unit: 'mg/dL', male: [3.4, 7.0], female: [2.4, 6.0] },
  'sodium': { label: 'Sodium', unit: 'mEq/L', range: [136, 145], criticalLow: 120, criticalHigh: 160 },
  'potassium': { label: 'Potassium', unit: 'mEq/L', range: [3.5, 5.1], criticalLow: 2.5, criticalHigh: 6.5 },
  'chloride': { label: 'Chloride', unit: 'mEq/L', range: [98, 106] },
  'calcium': { label: 'Calcium', unit: 'mg/dL', range: [8.5, 10.5] },
  'phosphorus': { label: 'Phosphorus', unit: 'mg/dL', range: [2.5, 4.5] },
  'magnesium': { label: 'Magnesium', unit: 'mg/dL', range: [1.7, 2.4] },

  // Lipid Profile
  'total cholesterol': { label: 'Total Cholesterol', unit: 'mg/dL', range: [125, 200], optimal: '<200' },
  'hdl': { label: 'HDL (Good Cholesterol)', unit: 'mg/dL', range: [40, 60] },
  'ldl': { label: 'LDL (Bad Cholesterol)', unit: 'mg/dL', range: [0, 100], optimal: '<100' },
  'triglycerides': { label: 'Triglycerides', unit: 'mg/dL', range: [0, 150] },
  'vldl': { label: 'VLDL', unit: 'mg/dL', range: [0, 40] },
  'tc/hdl ratio': { label: 'TC/HDL Ratio', unit: '', range: [0, 5] },

  // Thyroid
  'tsh': { label: 'TSH', unit: 'µIU/mL', range: [0.5, 5.0] },
  't3': { label: 'T3', unit: 'ng/dL', range: [80, 200] },
  't4': { label: 'T4', unit: 'µg/dL', range: [5.0, 12.0] },
  'free t3': { label: 'Free T3', unit: 'pg/mL', range: [2.3, 4.2] },
  'free t4': { label: 'Free T4', unit: 'ng/dL', range: [0.8, 1.8] },

  // Diabetes
  'fasting glucose': { label: 'Fasting Glucose', unit: 'mg/dL', range: [70, 110] },
  'fasting blood sugar': { label: 'Fasting Blood Sugar', unit: 'mg/dL', range: [70, 110] },
  'postprandial glucose': { label: 'Postprandial Glucose', unit: 'mg/dL', range: [70, 140] },
  'ppbs': { label: 'PPBS', unit: 'mg/dL', range: [70, 140] },
  'hba1c': { label: 'HbA1c', unit: '%', range: [4.0, 5.7] },
  'hba1c mmol': { label: 'HbA1c', unit: 'mmol/mol', range: [20, 39] },
  'random glucose': { label: 'Random Glucose', unit: 'mg/dL', range: [70, 140] },

  // Iron Studies
  'serum iron': { label: 'Serum Iron', unit: 'µg/dL', range: [60, 170] },
  'ferritin': { label: 'Ferritin', unit: 'ng/mL', male: [30, 300], female: [15, 150] },
  'transferrin': { label: 'Transferrin', unit: 'mg/dL', range: [200, 360] },
  'tibc': { label: 'TIBC', unit: 'µg/dL', range: [250, 450] },
  'vitamin b12': { label: 'Vitamin B12', unit: 'pg/mL', range: [200, 900] },
  'vitamin d': { label: 'Vitamin D (25-OH)', unit: 'ng/mL', range: [20, 50] },
  'folate': { label: 'Folate', unit: 'ng/mL', range: [3, 17] },

  // Inflammatory
  'crp': { label: 'C-Reactive Protein (CRP)', unit: 'mg/L', range: [0, 6] },
  'hs-crp': { label: 'hs-CRP', unit: 'mg/L', range: [0, 1] },

  // Urinalysis
  'urine ph': { label: 'Urine pH', unit: '', range: [4.5, 8.0] },
  'specific gravity': { label: 'Specific Gravity', unit: '', range: [1.005, 1.030] },
};

// ─── Common Drug Patterns (for prescription parsing) ─────────────────────
const DOSAGE_PATTERNS = [
  /(\d+)\s*(mg|mcg|g|ml|iu|tablet|capsule|tab|caps)/i,
  /(\d+\.?\d*)\s*(mg|mcg|g)/i,
];

const FREQUENCY_PATTERNS = [
  /(once|twice|thrice|1|2|3)\s*(daily|a day|per day|times)/i,
  /(every|q)\s*(\d+)\s*(hour|h)/i,
  /(bd|tid|qid|od|hs|prn|stat|sos)/i,
  /(morning|evening|night|bedtime|after food|before food|empty stomach)/i,
  /(weekly|monthly)/i,
];

// ─── Parsing Functions ───────────────────────────────────────────────────

/**
 * Parse lab report text into structured key-value pairs
 */
export function parseLabReport(text) {
  const cleaned = cleanOCRText(text);
  const lines = cleaned.split('\n').filter(l => l.trim());
  const results = [];
  const headerPatterns = [
    /^(test|parameter|investigation|component|name)[:\s]*/i,
    /^(result|value|observed)[:\s]*/i,
    /^(reference|normal|range|ref\s*range)[:\s]*/i,
    /^(unit)[:\s]*/i,
    /^(status|flag|remark)[:\s]*/i,
  ];

  let inTable = false;
  let headers = [];

  for (const line of lines) {
    // Check for table headers
    if (headerPatterns.some(p => p.test(line))) {
      inTable = true;
      headers = line.split(/[\t]{2,}/).filter(h => h.trim());
      continue;
    }

    if (inTable) {
      // Try: "Test Name    Value    Unit    Range    Status"
      const parts = line.split(/[\t]{2,}/).filter(p => p.trim());
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const value = parts[1].trim();
        const unit = parts[2]?.trim() || '';
        const range = parts[3]?.trim() || '';
        const flag = parts[4]?.trim() || '';
        const parsed = interpretValue(name, value, unit, range);
        if (parsed) {
          results.push({ ...parsed, flag, raw: line });
          continue;
        }
      }
    }

    // Fallback: "Test Name : Value Unit (Range)"
    const colonMatch = line.match(/^([^:]+):\s*([\d.]+)\s*([a-zA-Z/%µ]+)?\s*(?:\(([^)]+)\))?/);
    if (colonMatch) {
      const name = colonMatch[1].trim();
      const value = colonMatch[2];
      const unit = (colonMatch[3] || '').trim();
      const range = (colonMatch[4] || '').trim();
      const parsed = interpretValue(name, value, unit, range);
      if (parsed) results.push(parsed);
    }
  }

  return results;
}

/**
 * Interpret a single lab value against reference ranges
 */
export function interpretValue(name, valueStr, unit, rangeText) {
  const value = parseFloat(valueStr);
  if (isNaN(value)) return null;

  const nameLower = name.toLowerCase().trim();
  const refKey = Object.keys(REFERENCE_RANGES).find(
    key => nameLower.includes(key) || key.includes(nameLower)
  );
  const ref = refKey ? REFERENCE_RANGES[refKey] : null;

  if (!ref) {
    return {
      name,
      value,
      unit,
      interpretedUnit: unit,
      range: rangeText,
      status: 'unknown',
      severity: 'unknown',
      isCritical: false,
    };
  }

  const range = ref.range || (gender === 'male' ? ref.male : ref.female) || ref.male || [];
  const isMale = ref.male && !ref.female;
  const isFemale = ref.female && !ref.male;

  // Determine status
  let status = 'normal';
  let severity = 'normal';

  if (range.length === 2) {
    if (value < range[0]) {
      status = 'low';
      severity = value < (range[0] * 0.7) ? 'abnormal' : 'borderline';
    } else if (value > range[1]) {
      status = 'high';
      severity = value > (range[1] * 1.3) ? 'abnormal' : 'borderline';
    }
  }

  const isCritical =
    (ref.criticalLow && value < ref.criticalLow) ||
    (ref.criticalHigh && value > ref.criticalHigh);

  return {
    name: ref.label || name,
    value,
    unit: ref.unit || unit,
    interpretedUnit: ref.unit || unit,
    range: range.length === 2 ? `${range[0]} — ${range[1]}` : rangeText,
    low: range[0],
    high: range[1],
    status,
    severity: isCritical ? 'critical' : severity,
    isCritical,
    reference: ref.label,
  };
}

/**
 * Parse prescription text for drug names and dosages
 */
export function parsePrescription(text) {
  const cleaned = cleanOCRText(text);
  const lines = cleaned.split('\n').filter(l => l.trim());
  const medications = [];

  for (const line of lines) {
    // Skip non-medication lines
    if (/^(patient|name|age|date|hospital|doctor|address|dr\.)/i.test(line)) continue;
    if (/^[^a-z]+$/i.test(line)) continue;

    const dosage = DOSAGE_PATTERNS.reduce((m, p) => {
      const match = line.match(p);
      return match ? { amount: match[1], unit: match[2] } : m;
    }, null);

    const frequency = FREQUENCY_PATTERNS.reduce((m, p) => {
      const match = line.match(p);
      return match ? match[0] : m;
    }, null);

    // Extract drug name (first word or two)
    let drugName = line.trim();
    if (dosage) {
      drugName = drugName.replace(new RegExp(dosage.amount + '\\s*' + dosage.unit, 'i'), '').trim();
    }
    if (frequency) {
      drugName = drugName.replace(new RegExp(frequency, 'i'), '').trim();
    }
    // Remove common filler words
    drugName = drugName.replace(/^(tab|capsule|injection|syrup|cream|ointment|drops|sachet)\s+/i, '').trim();
    drugName = drugName.replace(/\s+\d+$/, '').trim();

    if (drugName && drugName.length > 2) {
      medications.push({
        drug: drugName,
        ...(dosage || {}),
        frequency: frequency || null,
        raw: line.trim(),
      });
    }
  }

  return medications;
}

/**
 * Generate a summary/interpretation of lab results
 */
export function generateLabSummary(results) {
  const abnormal = results.filter(r => r.status !== 'normal');
  const critical = results.filter(r => r.isCritical);
  const normal = results.filter(r => r.status === 'normal');

  let summary = [];
  if (critical.length > 0) {
    summary.push(`🚨 ${critical.length} critical value(s) detected — consult doctor immediately.`);
    critical.forEach(c => summary.push(`  • ${c.name}: ${c.value} ${c.unit} (Critical)`));
  }

  if (abnormal.length > 0) {
    summary.push(`\n⚠️ ${abnormal.length} abnormal value(s) found:`);
    abnormal.forEach(a => {
      if (!a.isCritical) {
        const direction = a.status === 'high' ? '↑ Elevated' : '↓ Low';
        summary.push(`  • ${a.name}: ${a.value} ${a.unit} (${direction}, normal: ${a.range})`);
      }
    });
  }

  if (normal.length > 0) {
    summary.push(`\n✅ ${normal.length} value(s) within normal range.`);
  }

  return summary.join('\n');
}

/**
 * Check for drug interactions (basic — expand with real database)
 */
export function checkDrugInteractions(medications) {
  const knownInteractions = {
    'aspirin': ['warfarin', 'ibuprofen', 'methotrexate', 'blood thinners'],
    'ibuprofen': ['aspirin', 'warfarin', 'apixaban', 'lisinopril'],
    'metformin': ['iodinated contrast', 'alcohol'],
    'warfarin': ['aspirin', 'ibuprofen', 'paracetamol', 'antibiotics'],
    'simvastatin': ['grapefruit', 'clarithromycin', 'antifungals'],
    'paracetamol': ['alcohol', 'warfarin', 'carbamazepine'],
  };

  const warnings = [];
  const drugNames = medications.map(m => m.drug?.toLowerCase()).filter(Boolean);

  for (let i = 0; i < drugNames.length; i++) {
    for (let j = i + 1; j < drugNames.length; j++) {
      const d1 = drugNames[i];
      const d2 = drugNames[j];
      const interactions = knownInteractions[d1] || [];
      if (interactions.some(int => d2.includes(int) || int.includes(d2))) {
        warnings.push({
          drugs: [medications[i].drug, medications[j].drug],
          severity: 'moderate',
          advice: 'Potential interaction. Consult your doctor or pharmacist.',
        });
      }
    }
  }

  return warnings;
}

export { REFERENCE_RANGES };

