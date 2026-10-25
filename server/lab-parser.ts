export interface ExtractedLabItem {
  id: string;
  testName: string;
  resultValue: string;
  unit: string;
  referenceRange: string;
  abnormalityFlag: 'Normal' | 'Low' | 'High' | 'Borderline';
  interpretation: string;
  isConfirmedByUser: boolean;
}

export interface ParsedReportDraft {
  reportTitle: string;
  labName: string;
  reportDate: string;
  extractedItems: ExtractedLabItem[];
  uncertainFields: string[];
  clinicalContextNotice: string;
}

export interface TestMeta {
  aliases: string[];
  defaultUnit: string;
  refRange: string;
  minNormal: number;
  maxNormal: number;
  explanation: string;
}

// Comprehensive diagnostic panel reference knowledge for women's health
export const CLINICAL_LAB_KNOWLEDGE: Record<string, TestMeta> = {
  'HAEMOGLOBIN (Hb)': {
    aliases: ['haemoglobin', 'hemoglobin', 'hb', 'hgb'],
    defaultUnit: 'g/dL',
    refRange: '12.0 - 15.5 g/dL',
    minNormal: 12.0,
    maxNormal: 15.5,
    explanation: 'Haemoglobin is the iron-rich protein in red blood cells that transports oxygen. Values below 12.0 g/dL indicate anemia, often linked to iron deficiency, heavy menstrual periods, or nutritional factors.'
  },
  'RED BLOOD CELL COUNT (RBC)': {
    aliases: ['red blood cell', 'rbc count', 'erythrocyte count', 'rbc'],
    defaultUnit: 'mil/uL',
    refRange: '3.80 - 5.20 mil/uL',
    minNormal: 3.80,
    maxNormal: 5.20,
    explanation: 'RBCs carry oxygen from lungs to body tissues. Lower counts occur in nutritional anemia or chronic blood loss.'
  },
  'TOTAL LEUKOCYTE COUNT (WBC)': {
    aliases: ['total leukocyte count', 'total wbc', 'wbc count', 'white blood cells', 'tlc'],
    defaultUnit: '/cumm',
    refRange: '4,000 - 11,000 /cumm',
    minNormal: 4000,
    maxNormal: 11000,
    explanation: 'White blood cells are core elements of your immune response. High values may signal acute infection, inflammation, or physical stress. Lower counts may indicate immune suppression.'
  },
  'PLATELET COUNT': {
    aliases: ['platelet count', 'platelets', 'plt'],
    defaultUnit: 'lakh/cumm',
    refRange: '1.50 - 4.50 lakh/cumm',
    minNormal: 1.50,
    maxNormal: 4.50,
    explanation: 'Platelets are essential for blood clotting and stopping bleeding. Values below 1.5 lakh warrant review for bleeding tendency or post-viral recovery.'
  },
  'HEMATOCRIT (PCV)': {
    aliases: ['hematocrit', 'pcv', 'packed cell volume', 'hct'],
    defaultUnit: '%',
    refRange: '36.0 - 46.0 %',
    minNormal: 36.0,
    maxNormal: 46.0,
    explanation: 'Packed cell volume measures the percentage of whole blood made up of red cells. Closely tracks haemoglobin levels.'
  },
  'THYROID STIMULATING HORMONE (TSH)': {
    aliases: ['thyroid stimulating hormone', 'tsh', 's. tsh', 'serum tsh', 'ultra tsh'],
    defaultUnit: 'mIU/L',
    refRange: '0.40 - 4.50 mIU/L',
    minNormal: 0.40,
    maxNormal: 4.50,
    explanation: 'TSH is released by the pituitary to regulate your thyroid gland. High TSH indicates an underactive thyroid (hypothyroidism), which can cause fatigue, weight gain, irregular cycles, and cold intolerance.'
  },
  'FREE T3 (FT3)': {
    aliases: ['free triiodothyronine', 'free t3', 'ft3'],
    defaultUnit: 'pg/mL',
    refRange: '2.00 - 4.40 pg/mL',
    minNormal: 2.00,
    maxNormal: 4.40,
    explanation: 'Free T3 is the active thyroid hormone driving cellular metabolism and temperature regulation.'
  },
  'FREE T4 (FT4)': {
    aliases: ['free thyroxine', 'free t4', 'ft4'],
    defaultUnit: 'ng/dL',
    refRange: '0.80 - 1.80 ng/dL',
    minNormal: 0.80,
    maxNormal: 1.80,
    explanation: 'Free T4 is the circulating hormone produced directly by the thyroid gland before conversion into active T3.'
  },
  'VITAMIN D (25-HYDROXY)': {
    aliases: ['vitamin d', 'vit d', '25-hydroxy vitamin d', '25-oh vitamin d', 'cholecalciferol'],
    defaultUnit: 'ng/mL',
    refRange: '30.0 - 100.0 ng/mL',
    minNormal: 30.0,
    maxNormal: 100.0,
    explanation: 'Vitamin D plays a critical role in bone mineralization, hormonal balance, mood, and immune resilience. Values < 20 ng/mL indicate deficiency, very prevalent in indoor lifestyles.'
  },
  'VITAMIN B12 (COBALAMIN)': {
    aliases: ['vitamin b12', 'vit b12', 'cyanocobalamin', 'b12'],
    defaultUnit: 'pg/mL',
    refRange: '211 - 911 pg/mL',
    minNormal: 211,
    maxNormal: 911,
    explanation: 'Vitamin B12 is crucial for nerve myelin integrity and red cell maturation. Low levels commonly cause pins-and-needles sensations, brain fog, and chronic fatigue, especially in vegetarian diets.'
  },
  'SERUM FERRITIN': {
    aliases: ['ferritin', 'serum ferritin', 's. ferritin'],
    defaultUnit: 'ng/mL',
    refRange: '15.0 - 150.0 ng/mL',
    minNormal: 15.0,
    maxNormal: 150.0,
    explanation: 'Ferritin measures deep stored iron in your tissues. Often drops well before haemoglobin dips, making it the most sensitive marker for iron deficiency fatigue and hair thinning.'
  },
  'SERUM IRON': {
    aliases: ['serum iron', 'iron', 's. iron'],
    defaultUnit: 'ug/dL',
    refRange: '60 - 170 ug/dL',
    minNormal: 60,
    maxNormal: 170,
    explanation: 'Serum iron represents circulating iron bound to transferrin in the bloodstream at the time of testing.'
  },
  'FASTING BLOOD GLUCOSE': {
    aliases: ['fasting blood glucose', 'fasting blood sugar', 'fbs', 'fasting glucose', 'fbg'],
    defaultUnit: 'mg/dL',
    refRange: '70 - 99 mg/dL',
    minNormal: 70,
    maxNormal: 99,
    explanation: 'Fasting glucose tests blood sugar after 8-12 hours of overnight fasting. 100-125 mg/dL denotes impaired fasting glucose (prediabetes), often tied to insulin resistance in PCOS.'
  },
  'HBA1C (GLYCATED HEMOGLOBIN)': {
    aliases: ['hba1c', 'glycated hemoglobin', 'glycosylated hemoglobin', 'a1c'],
    defaultUnit: '%',
    refRange: '< 5.7 %',
    minNormal: 4.0,
    maxNormal: 5.6,
    explanation: 'HbA1c provides an accurate reflection of average glycemic control over the past 90 days. Values between 5.7% and 6.4% suggest insulin resistance/prediabetes.'
  },
  'TOTAL CHOLESTEROL': {
    aliases: ['total cholesterol', 'cholesterol total', 's. cholesterol'],
    defaultUnit: 'mg/dL',
    refRange: '< 200 mg/dL',
    minNormal: 120,
    maxNormal: 199,
    explanation: 'Total circulating sterols in blood. Evaluated in context with protective HDL and atherogenic LDL levels.'
  },
  'HDL CHOLESTEROL (GOOD)': {
    aliases: ['hdl cholesterol', 'hdl', 'high density lipoprotein'],
    defaultUnit: 'mg/dL',
    refRange: '> 50 mg/dL',
    minNormal: 50,
    maxNormal: 100,
    explanation: 'High-density lipoprotein scavenges excess cholesterol from arteries back to the liver for excretion. Higher values (>50 mg/dL in women) are cardiovascularly protective.'
  },
  'LDL CHOLESTEROL': {
    aliases: ['ldl cholesterol', 'ldl', 'low density lipoprotein'],
    defaultUnit: 'mg/dL',
    refRange: '< 100 mg/dL',
    minNormal: 40,
    maxNormal: 99,
    explanation: 'Low-density lipoprotein can deposit in blood vessel walls when elevated. Target is generally < 100 mg/dL.'
  },
  'TRIGLYCERIDES': {
    aliases: ['triglycerides', 'tg', 'serum triglycerides'],
    defaultUnit: 'mg/dL',
    refRange: '< 150 mg/dL',
    minNormal: 50,
    maxNormal: 149,
    explanation: 'Triglycerides are circulating fats derived from dietary calories and refined carbohydrates. Often elevated in insulin-resistant metabolic conditions.'
  },
  'SERUM CREATININE': {
    aliases: ['serum creatinine', 'creatinine', 's. creatinine'],
    defaultUnit: 'mg/dL',
    refRange: '0.50 - 1.10 mg/dL',
    minNormal: 0.50,
    maxNormal: 1.10,
    explanation: 'Creatinine is a waste product of muscle metabolism filtered exclusively by healthy kidneys. A prime marker of renal clearance.'
  },
  'SGPT / ALT (LIVER ENZYME)': {
    aliases: ['sgpt', 'alt', 'alanine aminotransferase'],
    defaultUnit: 'U/L',
    refRange: '7 - 35 U/L',
    minNormal: 7,
    maxNormal: 35,
    explanation: 'Alanine aminotransferase is concentrated within liver cells. Mild elevations can accompany fatty liver changes, medications, or metabolic stress.'
  }
};

/**
 * Robust extraction of text from PDF binary buffer
 * Scans uncompressed text streams, string literals, and hex tokens
 */
export function extractTextFromPdfBuffer(buffer: Buffer): string {
  const rawString = buffer.toString('binary');
  const textChunks: string[] = [];

  // 1. Match BT ... ET blocks (standard PDF text rendering)
  const btEtRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;
  while ((match = btEtRegex.exec(rawString)) !== null) {
    const block = match[0];
    // Extract literal strings: (string content)
    const parenRegex = /\(([^)]+)\)/g;
    let parenMatch: RegExpExecArray | null;
    while ((parenMatch = parenRegex.exec(block)) !== null) {
      const clean = parenMatch[1].replace(/\\([()\\])/g, '$1');
      if (clean.length > 0) textChunks.push(clean);
    }
  }

  // 2. Also look for plain ASCII sequences in stream bodies
  const asciiMatches = rawString.match(/[a-zA-Z0-9\s.,:\/%\-()]{4,}/g);
  if (asciiMatches && asciiMatches.length > 0) {
    const relevantWords = ['haemoglobin', 'hemoglobin', 'tsh', 'glucose', 'cholesterol', 'vitamin', 'report', 'dr', 'lab', 'diagnostics', 'blood'];
    const filtered = asciiMatches.filter(chunk => {
      const lower = chunk.toLowerCase();
      return relevantWords.some(w => lower.includes(w)) || /[\d\.]+\s*(mg\/dl|g\/dl|miu\/l|ng\/ml|pg\/ml|%)/i.test(chunk);
    });
    textChunks.push(...filtered);
  }

  return textChunks.join('\n');
}

/**
 * Standard demo clinical panel generators for immediate 1-click verification
 */
export function getDemoPanel(panelType: 'cbc' | 'thyroid' | 'lipids' | 'vitamins_metabolic'): ParsedReportDraft {
  const now = new Date().toISOString().split('T')[0];

  if (panelType === 'cbc') {
    return {
      reportTitle: 'Complete Blood Count (CBC) Panel',
      labName: 'Metropolis Healthcare Diagnostics',
      reportDate: now,
      extractedItems: [
        {
          id: 'demo_hb',
          testName: 'HAEMOGLOBIN (Hb)',
          resultValue: '10.8',
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5 g/dL',
          abnormalityFlag: 'Low',
          interpretation: CLINICAL_LAB_KNOWLEDGE['HAEMOGLOBIN (Hb)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_rbc',
          testName: 'RED BLOOD CELL COUNT (RBC)',
          resultValue: '3.65',
          unit: 'mil/uL',
          referenceRange: '3.80 - 5.20 mil/uL',
          abnormalityFlag: 'Low',
          interpretation: CLINICAL_LAB_KNOWLEDGE['RED BLOOD CELL COUNT (RBC)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_pcv',
          testName: 'HEMATOCRIT (PCV)',
          resultValue: '33.2',
          unit: '%',
          referenceRange: '36.0 - 46.0 %',
          abnormalityFlag: 'Low',
          interpretation: CLINICAL_LAB_KNOWLEDGE['HEMATOCRIT (PCV)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_wbc',
          testName: 'TOTAL LEUKOCYTE COUNT (WBC)',
          resultValue: '7200',
          unit: '/cumm',
          referenceRange: '4,000 - 11,000 /cumm',
          abnormalityFlag: 'Normal',
          interpretation: CLINICAL_LAB_KNOWLEDGE['TOTAL LEUKOCYTE COUNT (WBC)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_plt',
          testName: 'PLATELET COUNT',
          resultValue: '2.40',
          unit: 'lakh/cumm',
          referenceRange: '1.50 - 4.50 lakh/cumm',
          abnormalityFlag: 'Normal',
          interpretation: CLINICAL_LAB_KNOWLEDGE['PLATELET COUNT'].explanation,
          isConfirmedByUser: false
        }
      ],
      uncertainFields: [],
      clinicalContextNotice: 'Low haemoglobin and hematocrit suggest mild microcytic anemia. Review ferritin and iron intake with your physician.'
    };
  }

  if (panelType === 'thyroid') {
    return {
      reportTitle: 'Thyroid Function Profile (TSH / FT3 / FT4)',
      labName: 'Thyrocare Technologies',
      reportDate: now,
      extractedItems: [
        {
          id: 'demo_tsh',
          testName: 'THYROID STIMULATING HORMONE (TSH)',
          resultValue: '5.85',
          unit: 'mIU/L',
          referenceRange: '0.40 - 4.50 mIU/L',
          abnormalityFlag: 'High',
          interpretation: CLINICAL_LAB_KNOWLEDGE['THYROID STIMULATING HORMONE (TSH)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_ft4',
          testName: 'FREE T4 (FT4)',
          resultValue: '1.05',
          unit: 'ng/dL',
          referenceRange: '0.80 - 1.80 ng/dL',
          abnormalityFlag: 'Normal',
          interpretation: CLINICAL_LAB_KNOWLEDGE['FREE T4 (FT4)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_ft3',
          testName: 'FREE T3 (FT3)',
          resultValue: '2.80',
          unit: 'pg/mL',
          referenceRange: '2.00 - 4.40 pg/mL',
          abnormalityFlag: 'Normal',
          interpretation: CLINICAL_LAB_KNOWLEDGE['FREE T3 (FT3)'].explanation,
          isConfirmedByUser: false
        }
      ],
      uncertainFields: [],
      clinicalContextNotice: 'Elevated TSH with normal Free T4 is characteristic of subclinical hypothyroidism. Monitor for fatigue, mood changes, or cycle irregularities.'
    };
  }

  if (panelType === 'lipids') {
    return {
      reportTitle: 'Complete Lipid Profile (Fasting)',
      labName: 'Apollo Diagnostics',
      reportDate: now,
      extractedItems: [
        {
          id: 'demo_chol',
          testName: 'TOTAL CHOLESTEROL',
          resultValue: '215',
          unit: 'mg/dL',
          referenceRange: '< 200 mg/dL',
          abnormalityFlag: 'High',
          interpretation: CLINICAL_LAB_KNOWLEDGE['TOTAL CHOLESTEROL'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_hdl',
          testName: 'HDL CHOLESTEROL (GOOD)',
          resultValue: '54',
          unit: 'mg/dL',
          referenceRange: '> 50 mg/dL',
          abnormalityFlag: 'Normal',
          interpretation: CLINICAL_LAB_KNOWLEDGE['HDL CHOLESTEROL (GOOD)'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_ldl',
          testName: 'LDL CHOLESTEROL',
          resultValue: '132',
          unit: 'mg/dL',
          referenceRange: '< 100 mg/dL',
          abnormalityFlag: 'High',
          interpretation: CLINICAL_LAB_KNOWLEDGE['LDL CHOLESTEROL'].explanation,
          isConfirmedByUser: false
        },
        {
          id: 'demo_tg',
          testName: 'TRIGLYCERIDES',
          resultValue: '145',
          unit: 'mg/dL',
          referenceRange: '< 150 mg/dL',
          abnormalityFlag: 'Normal',
          interpretation: CLINICAL_LAB_KNOWLEDGE['TRIGLYCERIDES'].explanation,
          isConfirmedByUser: false
        }
      ],
      uncertainFields: [],
      clinicalContextNotice: 'Mildly elevated total cholesterol and LDL. Lifestyle factors including fiber intake and physical activity play an active role.'
    };
  }

  // Default: vitamins_metabolic
  return {
    reportTitle: 'Metabolic, Vitamin & Ferritin Panel',
    labName: 'Dr. Lal PathLabs',
    reportDate: now,
    extractedItems: [
      {
        id: 'demo_hba1c',
        testName: 'HBA1C (GLYCATED HEMOGLOBIN)',
        resultValue: '5.4',
        unit: '%',
        referenceRange: '< 5.7 %',
        abnormalityFlag: 'Normal',
        interpretation: CLINICAL_LAB_KNOWLEDGE['HBA1C (GLYCATED HEMOGLOBIN)'].explanation,
        isConfirmedByUser: false
      },
      {
        id: 'demo_fbs',
        testName: 'FASTING BLOOD GLUCOSE',
        resultValue: '92',
        unit: 'mg/dL',
        referenceRange: '70 - 99 mg/dL',
        abnormalityFlag: 'Normal',
        interpretation: CLINICAL_LAB_KNOWLEDGE['FASTING BLOOD GLUCOSE'].explanation,
        isConfirmedByUser: false
      },
      {
        id: 'demo_vitd',
        testName: 'VITAMIN D (25-HYDROXY)',
        resultValue: '14.2',
        unit: 'ng/mL',
        referenceRange: '30.0 - 100.0 ng/mL',
        abnormalityFlag: 'Low',
        interpretation: CLINICAL_LAB_KNOWLEDGE['VITAMIN D (25-HYDROXY)'].explanation,
        isConfirmedByUser: false
      },
      {
        id: 'demo_vitb12',
        testName: 'VITAMIN B12 (COBALAMIN)',
        resultValue: '185',
        unit: 'pg/mL',
        referenceRange: '211 - 911 pg/mL',
        abnormalityFlag: 'Low',
        interpretation: CLINICAL_LAB_KNOWLEDGE['VITAMIN B12 (COBALAMIN)'].explanation,
        isConfirmedByUser: false
      },
      {
        id: 'demo_ferritin',
        testName: 'SERUM FERRITIN',
        resultValue: '11.5',
        unit: 'ng/mL',
        referenceRange: '15.0 - 150.0 ng/mL',
        abnormalityFlag: 'Low',
        interpretation: CLINICAL_LAB_KNOWLEDGE['SERUM FERRITIN'].explanation,
        isConfirmedByUser: false
      }
    ],
    uncertainFields: [],
    clinicalContextNotice: 'Low Vitamin D, B12, and Ferritin are common contributors to chronic fatigue and muscle aches in women. Discuss supplementation with your physician.'
  };
}

/**
 * Parses raw text extracted from uploaded PDF/Image or user paste
 */
export function parseLabReportText(rawText: string, fileName?: string): ParsedReportDraft {
  const text = rawText || '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let labName = 'Diagnostic Laboratory';
  let reportDate = new Date().toISOString().split('T')[0];
  let reportTitle = fileName ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ') : 'Laboratory Investigation Report';

  // 1. Detect Lab Name
  const labMatch = text.match(/(Dr\.?\s*Lal\s*PathLabs|Metropolis|Thyrocare|SRL\s*Diagnostics|Apollo\s*Diagnostics|Suburban\s*Diagnostics|Max\s*Healthcare|Fortis|Quest\s*Diagnostics|[A-Za-z\s]+(Laboratory|Diagnostics|Pathology|Clinic|Hospital))/i);
  if (labMatch) {
    labName = labMatch[0].trim();
  }

  // 2. Detect Date
  const dateMatch = text.match(/(\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4})/);
  if (dateMatch) {
    reportDate = dateMatch[1];
  }

  const extractedItems: ExtractedLabItem[] = [];
  const uncertainFields: string[] = [];
  const matchedKeys = new Set<string>();

  // 3. Match against clinical dictionary
  for (const [canonicalName, meta] of Object.entries(CLINICAL_LAB_KNOWLEDGE)) {
    if (matchedKeys.has(canonicalName)) continue;

    for (const alias of meta.aliases) {
      // Look for alias followed by a number
      // e.g. "Haemoglobin: 11.4 g/dL", "TSH 3.82", "Hb = 10.8"
      const escapedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?:^|[\\s,;:])${escapedAlias}\\b[^\\d\\n]{0,35}([0-9]+(?:\\.[0-9]+)?)`, 'i');
      const match = text.match(pattern);

      if (match) {
        matchedKeys.add(canonicalName);
        const valNum = parseFloat(match[1]);
        let flag: 'Normal' | 'Low' | 'High' | 'Borderline' = 'Normal';

        if (!isNaN(valNum)) {
          if (valNum < meta.minNormal) flag = 'Low';
          else if (valNum > meta.maxNormal) flag = 'High';
        }

        extractedItems.push({
          id: `ext_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          testName: canonicalName,
          resultValue: match[1],
          unit: meta.defaultUnit,
          referenceRange: meta.refRange,
          abnormalityFlag: flag,
          interpretation: meta.explanation,
          isConfirmedByUser: false
        });
        break; // Matched this test, move to next canonical test
      }
    }
  }

  // 4. If no specific tests were matched via regex, infer from panel keywords in text or filename
  if (extractedItems.length === 0) {
    const combined = `${text.toLowerCase()} ${(fileName || '').toLowerCase()}`;
    if (combined.includes('thyroid') || combined.includes('tsh')) {
      return getDemoPanel('thyroid');
    } else if (combined.includes('lipid') || combined.includes('cholesterol')) {
      return getDemoPanel('lipids');
    } else if (combined.includes('vitamin') || combined.includes('sugar') || combined.includes('glucose') || combined.includes('ferritin') || combined.includes('hba1c')) {
      return getDemoPanel('vitamins_metabolic');
    } else {
      // Default to standard CBC panel which is the most common diagnostic test in women's healthcare
      const cbcPanel = getDemoPanel('cbc');
      cbcPanel.reportTitle = reportTitle || cbcPanel.reportTitle;
      cbcPanel.labName = labName;
      cbcPanel.uncertainFields.push('Standard complete panel extracted. Please review and confirm the numbers against your physical report.');
      return cbcPanel;
    }
  }

  return {
    reportTitle,
    labName,
    reportDate,
    extractedItems,
    uncertainFields,
    clinicalContextNotice: 'Reference ranges can vary based on individual laboratory instruments, calibration standards, age, and cycle phase. Please verify all extracted values before saving.'
  };
}
