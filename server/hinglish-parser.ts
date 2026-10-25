export interface ExtractedSymptomDraft {
  originalText: string;
  detectedLanguage: 'en' | 'hi' | 'mr' | 'hinglish';
  symptomName: string;
  bodyArea: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  startDateEstimate: string;
  duration: string;
  frequency: string;
  contextualFactors: string[];
  associatedSymptoms: string[];
  notes: string;
  ambiguities: string[];
  clarificationQuestion?: string;
  confidence: 'high' | 'moderate' | 'needs_clarification';
}

interface VocabularyRule {
  patterns: RegExp[];
  symptomName: string;
  bodyArea: string;
  defaultSeverity?: 'Mild' | 'Moderate' | 'Severe';
}

const SYMPTOM_VOCABULARY: VocabularyRule[] = [
  {
    patterns: [/(headache|sir\s*dard|sar\s*dard|sir\s*dukh|doke\s*dukhtey)/i],
    symptomName: 'Headache',
    bodyArea: 'Head'
  },
  {
    patterns: [/(migraine|adha\s*sir\s*dard|ardhashishi)/i],
    symptomName: 'Migraine',
    bodyArea: 'Head',
    defaultSeverity: 'Severe'
  },
  {
    patterns: [/(cramps|period\s*pain|pet\s*(m|me)\s*cramps|kamar\s*dard|kashtartava)/i],
    symptomName: 'Menstrual / Pelvic Cramps',
    bodyArea: 'Lower Abdomen / Pelvis'
  },
  {
    patterns: [/(period\s*(\d+)?\s*din\s*late|missed\s*period|delayed\s*period|mahavari\s*late)/i],
    symptomName: 'Delayed Menstrual Cycle',
    bodyArea: 'Reproductive System'
  },
  {
    patterns: [/(weakness|kamzori|kamjori|thakva|fatigue|tiredness|exhaustion|energy\s*low)/i],
    symptomName: 'Fatigue & Generalized Weakness',
    bodyArea: 'Whole Body',
    defaultSeverity: 'Moderate'
  },
  {
    patterns: [/(nausea|ulti\s*jaisa|vomiting\s*sensation|matli|malkhamat)/i],
    symptomName: 'Nausea',
    bodyArea: 'Stomach / GI'
  },
  {
    patterns: [/(bloating|pet\s*phula|gas|heavy\s*stomach|potat\s*fugi)/i],
    symptomName: 'Abdominal Bloating',
    bodyArea: 'Abdomen'
  },
  {
    patterns: [/(insomnia|neend\s*nhi\s*aayi|sleepless|sleep\s*trouble|jhop\s*nahi)/i],
    symptomName: 'Sleep Disturbance / Insomnia',
    bodyArea: 'Neurological / Sleep'
  },
  {
    patterns: [/(hot\s*flash(es)?|aag\s*jaisa\s*lagna|sudden\s*heat|ushta)/i],
    symptomName: 'Hot Flashes',
    bodyArea: 'Vasomotor / Hormonal'
  },
  {
    patterns: [/(acne|breakout|pimples|chehre\s*pe\s*daane|muhase)/i],
    symptomName: 'Skin Breakouts / Acne',
    bodyArea: 'Face / Skin'
  },
  {
    patterns: [/(anxiety|ghabrahat|nervousness|stress|tanaav|tension)/i],
    symptomName: 'Anxiety / Restlessness',
    bodyArea: 'Mental Wellbeing'
  },
  {
    patterns: [/(chakkar|dizziness|lightheaded|vertigo|chakkar\s*aana)/i],
    symptomName: 'Dizziness / Lightheadedness',
    bodyArea: 'Head / Neurological'
  }
];

export function parseHinglishHealthInput(input: string): ExtractedSymptomDraft {
  const text = input.trim();
  const lower = text.toLowerCase();

  // 1. Language detection
  let detectedLanguage: 'en' | 'hi' | 'mr' | 'hinglish' = 'en';
  if (/(mala|sakalpasun|thakva|vattoy|dukhtey|ahe|nahi)/i.test(text)) {
    detectedLanguage = 'mr';
  } else if (/(kal\s*se|aaj|raat|dukh|dard|bohot|zyada|thoda|hai|meri|iska)/i.test(text)) {
    detectedLanguage = 'hinglish';
  } else if (/[\u0900-\u097F]/.test(text)) {
    detectedLanguage = 'hi';
  }

  // 2. Symptom recognition
  let matchedRule = SYMPTOM_VOCABULARY.find(rule => 
    rule.patterns.some(pattern => pattern.test(lower))
  );

  let symptomName = matchedRule ? matchedRule.symptomName : 'Health Concern';
  let bodyArea = matchedRule ? matchedRule.bodyArea : 'Unspecified';

  // Fallback heuristic if unknown specific rule
  if (!matchedRule) {
    if (/(pain|dard|ache|dukh)/i.test(lower)) {
      symptomName = 'Unspecified Pain';
      bodyArea = 'General';
    }
  }

  // 3. Severity Extraction
  let severity: 'Mild' | 'Moderate' | 'Severe' = matchedRule?.defaultSeverity || 'Moderate';
  if (/(bhot\s*[zj]y?ada|bahut\s*[zj]y?ada|severe|unbearable|ashahniya|chubh\s*raha|extreme|very\s*bad)/i.test(lower)) {
    severity = 'Severe';
  } else if (/(thoda|mild|alka|halka|slight|kam|little)/i.test(lower)) {
    severity = 'Mild';
  }

  // Check for progression: e.g. "pain pehle mild tha ab severe ho gaya"
  let notes = '';
  if (/(pehle\s*mild\s*tha\s*ab\s*severe|initially\s*mild\s*now\s*severe|worsen|badh\s*gaya)/i.test(lower)) {
    severity = 'Severe';
    notes = 'User noted symptoms started mild and progressed to severe.';
  }

  // 4. Start date & time reference extraction
  const today = new Date();
  let startDateEstimate = today.toISOString().split('T')[0];
  let duration = 'Ongoing';

  if (/(kal\s*se|yesterday|kal\s*raat)/i.test(lower)) {
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    startDateEstimate = yesterday.toISOString().split('T')[0];
    duration = 'Since yesterday';
  } else if (/(parso\s*se|day\s*before\s*yesterday)/i.test(lower)) {
    const dby = new Date(today);
    dby.setDate(today.getDate() - 2);
    startDateEstimate = dby.toISOString().split('T')[0];
    duration = '2 days';
  } else if (/(aaj\s*subah\s*se|since\s*morning|sakalpasun)/i.test(lower)) {
    startDateEstimate = today.toISOString().split('T')[0];
    duration = 'Since this morning';
  }

  // Check for specific days count: e.g., "10 din late hai", "3 days se"
  const daysMatch = lower.match(/(\d+)\s*(din|days)/i);
  if (daysMatch) {
    duration = `${daysMatch[1]} days`;
    if (/(late|overdue)/i.test(lower)) {
      notes = notes ? `${notes} (Overdue by ${daysMatch[1]} days)` : `Overdue by ${daysMatch[1]} days`;
    }
  }

  // 5. Contextual Factors
  const contextualFactors: string[] = [];
  if (/(neend\s*nhi|poor\s*sleep|sleep\s*late|sleepless|stress|tension|late\s*night)/i.test(lower)) {
    contextualFactors.push('Poor sleep / Late night');
  }
  if (/(stress|tanaav|busy\s*work|exam)/i.test(lower)) {
    contextualFactors.push('Elevated stress');
  }
  if (/(bahar\s*ka\s*khana|spicy\s*food|skipped\s*meal|bhookha)/i.test(lower)) {
    contextualFactors.push('Dietary irregularity / Outside food');
  }

  // 6. Ambiguities and clarification checks
  const ambiguities: string[] = [];
  let clarificationQuestion: string | undefined;
  let confidence: 'high' | 'moderate' | 'needs_clarification' = 'high';

  if (symptomName === 'Health Concern' || symptomName === 'Unspecified Pain') {
    ambiguities.push('Specific symptom location or nature was not fully specified');
    clarificationQuestion = 'Could you specify the exact area of the discomfort (e.g. head, lower abdomen, back)?';
    confidence = 'needs_clarification';
  }

  if (/(period.*late)/i.test(lower) && !daysMatch) {
    ambiguities.push('Exact number of days delayed not provided');
    clarificationQuestion = 'Approximately how many days past your expected cycle date are you?';
    confidence = 'moderate';
  }

  return {
    originalText: text,
    detectedLanguage,
    symptomName,
    bodyArea,
    severity,
    startDateEstimate,
    duration,
    frequency: 'Intermittent',
    contextualFactors,
    associatedSymptoms: [],
    notes: notes || 'Extracted via Hinglish voice/text parser for user review',
    ambiguities,
    clarificationQuestion,
    confidence
  };
}
