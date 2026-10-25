export interface EmergencyCheckResult {
  isEmergency: boolean;
  severity: 'immediate_emergency' | 'urgent_medical_review' | 'none';
  matchedKeywords: string[];
  alertTitle: string;
  guidanceText: string;
  emergencyActions: string[];
  helplines: Array<{
    name: string;
    number: string;
    description: string;
  }>;
}

// Deterministic rules for life-threatening or urgent acute medical conditions
const EMERGENCY_PATTERNS = [
  {
    regex: /(chest\s*pain|heart\s*attack|crushing\s*chest|radiat(ing|es)\s*to\s*(arm|jaw|neck)|seene\s*me\s*dard|chhati\s*me\s*dard)/i,
    severity: 'immediate_emergency' as const,
    title: 'Potential Cardiac or Severe Chest Emergency',
    guidance: 'Chest pain or pressure radiating to the arm, jaw, or back may indicate a critical cardiac emergency or acute coronary syndrome. Immediate emergency care is required.',
    actions: [
      'Stop all physical activity and sit in a comfortable, upright position.',
      'Call emergency services (112 / 108 in India) or have someone drive you to the nearest emergency room immediately.',
      'Do not attempt to drive yourself.',
      'If prescribed emergency cardiac medication (such as nitroglycerin or as advised by your cardiologist), follow your physician\'s instructions.'
    ]
  },
  {
    regex: /(cannot\s*breathe|severe\s*shortness\s*of\s*breath|gasping\s*for\s*air|saans\s*nahi\s*aarahi|dum\s*ghut\s*raha|lips\s*turning\s*blue|cyanosis)/i,
    severity: 'immediate_emergency' as const,
    title: 'Severe Respiratory Distress',
    guidance: 'Severe breathing difficulty, inability to speak full sentences, or blue-tinted lips/fingernails indicates acute oxygen deprivation requiring urgent hospital intervention.',
    actions: [
      'Call emergency services (112 / 108) immediately.',
      'Sit upright and loosen any restrictive clothing around your neck or chest.',
      'If you have a diagnosed condition (such as asthma) with a prescribed rescue inhaler, use it as prescribed while waiting for emergency responders.'
    ]
  },
  {
    regex: /(worst\s*headache\s*of\s*my\s*life|thunderclap\s*headache|sudden\s*explosive\s*headache|bhayanak\s*sir\s*dard|sudden\s*severe\s*headache)/i,
    severity: 'immediate_emergency' as const,
    title: 'Acute Severe / Thunderclap Headache',
    guidance: 'A sudden, agonizing headache that reaches maximum intensity within seconds to minutes ("thunderclap") can indicate an intracranial hemorrhage or acute neurological event.',
    actions: [
      'Seek emergency medical evaluation immediately at the nearest hospital emergency department.',
      'Avoid taking blood-thinning painkillers like aspirin without medical direction.'
    ]
  },
  {
    regex: /(face\s*droop|arm\s*weakness|slurred\s*speech|speech\s*difficulty|sudden\s*paralysis|ek\s*taraf\s*kamzori|bolne\s*me\s*taklif)/i,
    severity: 'immediate_emergency' as const,
    title: 'Potential Stroke / Acute Neurological Deficit (FAST)',
    guidance: 'Sudden facial droop, weakness or numbness in one arm/leg, or difficulty speaking are cardinal signs of an acute stroke. Every minute matters for brain recovery.',
    actions: [
      'Note the exact time symptoms started.',
      'Call emergency medical services (112 / 108) right away.',
      'Do not give food, water, or medication by mouth.'
    ]
  },
  {
    regex: /(soaking\s*(two|2|\d+)\s*pads\s*per\s*hour|heavy\s*vaginal\s*bleeding\s*fainting|bhari\s*blood\s*flow\s*chakkar|severe\s*hemorrhage|uncontrolled\s*bleeding)/i,
    severity: 'immediate_emergency' as const,
    title: 'Acute Severe Gynecological Hemorrhage',
    guidance: 'Soaking through two or more maxi pads per hour for consecutive hours, accompanied by dizziness, pallor, or fainting, indicates significant blood loss.',
    actions: [
      'Lie down with legs elevated slightly.',
      'Call for emergency transport or proceed immediately to an emergency gynecological / obstetrics triage.',
      'Save information on number of pads/tampons used to report to attending clinicians.'
    ]
  },
  {
    regex: /(kill\s*myself|suicide|end\s*my\s*life|marne\s*ka\s*man|khud\s*ko\s*chot|self\s*harm)/i,
    severity: 'immediate_emergency' as const,
    title: 'Crisis & Mental Health Support Required',
    guidance: 'You are not alone, and help is available right now. Please connect with compassionate, trained mental health professionals immediately.',
    actions: [
      'Call Tele-MANAS (India toll-free 14416 or 1800-891-4416) available 24/7 in multiple regional languages.',
      'Call Vandrevala Foundation helpline (+91 9999 666 555) or emergency 112.',
      'Reach out to a trusted family member, friend, or nearby medical professional.'
    ]
  },
  {
    regex: /(severe\s*abdominal\s*pain|rigid\s*belly|pet\s*me\s*ashahniya\s*dard|vomiting\s*blood|blood\s*in\s*stool|black\s*tarry\s*stool)/i,
    severity: 'urgent_medical_review' as const,
    title: 'Acute Severe Abdominal Concern',
    guidance: 'Severe, escalating abdominal pain, rigid abdomen, or gastrointestinal bleeding requires prompt in-person clinical assessment to rule out appendicitis, obstruction, or perforation.',
    actions: [
      'Contact a doctor or go to an urgent care / emergency facility.',
      'Do not consume food, pain injections, or laxatives until examined by a doctor.'
    ]
  }
];

export const VERIFIED_HELPLINES = [
  {
    name: 'National Emergency Helpline (India)',
    number: '112',
    description: 'All-in-one emergency response for police, fire, and medical ambulance'
  },
  {
    name: 'Emergency Medical Ambulance',
    number: '108',
    description: 'Government toll-free 24/7 medical emergency ambulance service'
  },
  {
    name: 'Women in Distress Helpline',
    number: '1091',
    description: 'Dedicated national 24/7 emergency support for women'
  },
  {
    name: 'Tele-MANAS Mental Health Support',
    number: '14416 / 1800-891-4416',
    description: 'Government of India toll-free 24/7 mental health crisis service'
  }
];

/**
 * Deterministically checks user text for emergency warnings.
 */
export function checkEmergencyIndicators(text: string): EmergencyCheckResult {
  const normalized = text.toLowerCase().trim();
  const matched: string[] = [];

  for (const pattern of EMERGENCY_PATTERNS) {
    if (pattern.regex.test(normalized)) {
      matched.push(pattern.title);
      return {
        isEmergency: true,
        severity: pattern.severity,
        matchedKeywords: matched,
        alertTitle: pattern.title,
        guidanceText: pattern.guidance,
        emergencyActions: pattern.actions,
        helplines: VERIFIED_HELPLINES
      };
    }
  }

  return {
    isEmergency: false,
    severity: 'none',
    matchedKeywords: [],
    alertTitle: '',
    guidanceText: '',
    emergencyActions: [],
    helplines: VERIFIED_HELPLINES
  };
}
