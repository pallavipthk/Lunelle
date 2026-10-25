import { db } from './db.js';
import { checkEmergencyIndicators, EmergencyCheckResult } from './safety-rules.js';
import { queryPersonalHealthMemory, MemoryQueryResponse } from './health-memory.js';

export type AssistantTone = 'gentle' | 'clinical' | 'nutrition';

export interface AssistantResponse {
  isEmergency: boolean;
  emergencyDetails?: EmergencyCheckResult;
  response: string;
  memory: MemoryQueryResponse;
  suggestedFollowUps?: string[];
  tone?: AssistantTone;
}

/**
 * Strips raw markdown hashtags and asterisks to provide clean, cute, natural reading text
 */
function cleanFormatting(text: string): string {
  if (!text) return '';
  return text
    // Remove headers like ### or ##
    .replace(/^#{1,6}\s*/gm, '')
    // Remove bold asterisks **word** -> word
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // Remove italic asterisks *word* -> word
    .replace(/\*([^*]+)\*/g, '$1')
    // Remove standalone hash or star characters
    .replace(/(^|\s)[#*]+(\s|$)/g, '$1')
    .trim();
}

export function processHealthAssistantMessage(userId: string, userMessage: string, tone: AssistantTone = 'gentle'): AssistantResponse {
  const rawMsg = userMessage.trim();
  const lowerMsg = rawMsg.toLowerCase();

  // 1. DETERMINISTIC EMERGENCY SAFETY CHECK
  const emergency = checkEmergencyIndicators(rawMsg);
  if (emergency.isEmergency) {
    const formattedAlert = `🚨 ${emergency.alertTitle}

${emergency.guidanceText}

Immediate Actions to Take:
${emergency.emergencyActions.map(a => `• ${a}`).join('\n')}

Verified 24/7 Emergency Helplines (India):
${emergency.helplines.map(h => `• ${h.name}: ${h.number} (${h.description})`).join('\n')}

Please seek immediate medical attention.`;

    return {
      isEmergency: true,
      emergencyDetails: emergency,
      response: cleanFormatting(formattedAlert),
      memory: {
        hasRecords: false,
        factualSummary: 'Emergency response triggered.',
        supportingRecords: [],
        contextualNote: 'Immediate emergency protocol takes precedence over log search.'
      },
      tone
    };
  }

  // 2. QUERY PERSONAL HEALTH MEMORY
  const memory = queryPersonalHealthMemory(userId, rawMsg);
  const userProfile = db.get('user_profiles').find(p => p.user_id === userId);
  const userName = userProfile?.preferred_name || 'Friend';

  const allSymptoms = db.get('symptoms').filter(s => s.user_id === userId);
  const allReports = db.get('lab_reports').filter(r => r.user_id === userId);
  const allResults = db.get('lab_results').filter(res => res.user_id === userId);
  const allCycles = db.get('cycle_entries').filter(c => c.user_id === userId);

  // 3. CLINICAL & HEALTH REASONING
  let responseText = '';
  const suggestedFollowUps: string[] = [];

  // 3A. COMPREHENSIVE HEALTH SUMMARY QUERY ("summarize my health", "mere records batao", "overall health")
  const isHealthSummaryQuery = lowerMsg.includes('summarize my health') || 
                               lowerMsg.includes('health summary') || 
                               lowerMsg.includes('mera overall health') || 
                               lowerMsg.includes('all my records') ||
                               lowerMsg.includes('mera summary');

  if (isHealthSummaryQuery) {
    const recentSymptomsList = allSymptoms.slice(0, 3).map(s => `• ${s.symptom_name} (${s.severity}) on ${s.date_time.split('T')[0]}`).join('\n');
    const flaggedLabs = allResults.filter(r => r.abnormality_flag && r.abnormality_flag !== 'Normal');
    const labSummaryList = flaggedLabs.length > 0 
      ? flaggedLabs.slice(0, 3).map(l => `• ${l.test_name}: ${l.result_value} ${l.unit} (${l.abnormality_flag})`).join('\n')
      : '• No flagged abnormal lab values in your recorded history.';
    const recentCycle = allCycles[0];
    const cycleSummary = recentCycle 
      ? `• Latest cycle logged on ${recentCycle.date}: Flow is ${recentCycle.flow_level}, mood: ${recentCycle.mood}.`
      : '• No recent cycle entry logged yet.';

    responseText = `Hello ${userName},

Here is your comprehensive Lunelle Health Overview:

🌸 Your Recent Symptoms:
${recentSymptomsList || '• No active symptoms currently logged.'}

🩸 Key Laboratory Highlights:
${labSummaryList}

🌙 Cycle & Rhythm Status:
${cycleSummary}

💡 Wellness Recommendation for Today:
• Stay hydrated with 2.5L water throughout the day.
• Prioritize an early bedtime to support immune repair.
• Schedule an annual review with your healthcare provider for routine health monitoring.

Would you like more details on any specific symptom or lab report?`;

    suggestedFollowUps.push('What foods improve my energy?', 'Explain normal hemoglobin range', 'How to relieve menstrual cramps naturally?');
  }
  // Personal Records Question ("what did my report say", "when was my last headache", etc.)
  else if ((lowerMsg.includes('when did i') || 
       lowerMsg.includes('my previous') || 
       lowerMsg.includes('my last') || 
       lowerMsg.includes('have i recorded') ||
       lowerMsg.includes('in my record') ||
       lowerMsg.includes('my cycle') ||
       lowerMsg.includes('my symptoms')) && memory.hasRecords) {
    responseText = `Hello ${userName},

Here is what I found in your authorized Lunelle personal records:

${memory.factualSummary}

Supporting Details from your history:
${memory.supportingRecords.map(r => `• ${r.date}: ${r.summary}`).join('\n')}

Note: ${memory.contextualNote}`;
    suggestedFollowUps.push('How have my symptoms changed this month?', 'What should I ask my doctor about these logs?');
  } 
  // HAEMOGLOBIN / ANEMIA / LOW HB
  else if (lowerMsg.includes('haemoglobin') || lowerMsg.includes('hemoglobin') || lowerMsg.includes('hb') || lowerMsg.includes('anemia') || lowerMsg.includes('iron') || lowerMsg.includes('khoon')) {
    const userHbResult = allResults.find(r => r.test_name.toLowerCase().includes('haemoglobin') || r.test_name.toLowerCase().includes('hb'));
    const personalContext = userHbResult 
      ? `\n\nFrom your Lunelle records: Your latest recorded Haemoglobin is ${userHbResult.result_value} ${userHbResult.unit} (Flag: ${userHbResult.abnormality_flag}).`
      : '';

    responseText = `Hello ${userName},

A haemoglobin value around 9.0 to 11.5 g/dL is below the standard reference range for women (normal is 12.0 to 15.5 g/dL). This indicates mild-to-moderate anemia.${personalContext}

🔍 What this means for your body:
Haemoglobin is the protein in red blood cells that carries oxygen to your brain and muscles. When levels are low, less oxygen circulates, causing:
• Feeling tired or worn out even after good sleep
• Brain fog, lightheadedness, or slight shortness of breath on stairs
• Pale skin, brittle nails, or hair fall
• Cold hands and feet

🌿 Common contributing factors:
1. Heavy menstrual bleeding: The most frequent reason for iron depletion in reproductive-age women.
2. Low iron intake or absorption: Inadequate dietary iron or gut absorption issues.
3. Low Ferritin or B12 stores: Deep tissue iron reserves may be depleted.

🥗 Gentle supportive nutrition:
• Iron-rich foods: Spinach (palak), beetroot, pomegranate, lentils, chickpeas, jaggery (gud), and sesame seeds.
• Pair with Vitamin C: Add fresh lemon juice or amla/oranges to meals to multiply plant iron absorption up to 3 times!
• Avoid chai or coffee with meals: Tannins block iron uptake, so wait 45 minutes after eating.

👩‍⚕️ Good questions to ask your doctor:
• Should we test my Serum Ferritin and Total Iron Binding Capacity?
• Would oral iron with Vitamin C be helpful for me?
• Could my menstrual flow volume be contributing to this?

Reminder: Diagnostic lab values should always be reviewed with your attending doctor.`;

    suggestedFollowUps.push('What foods improve iron absorption?', 'How does heavy period cause low Hb?', 'What is ferritin?');
  }
  // THYROID / TSH / HYPOTHYROIDISM
  else if (lowerMsg.includes('tsh') || lowerMsg.includes('thyroid') || lowerMsg.includes('hypothyroid') || lowerMsg.includes('hyperthyroid')) {
    const userTshResult = allResults.find(r => r.test_name.toLowerCase().includes('tsh'));
    const personalContext = userTshResult 
      ? `\n\nFrom your Lunelle records: Your recorded TSH is ${userTshResult.result_value} ${userTshResult.unit} (Flag: ${userTshResult.abnormality_flag}).`
      : '';

    responseText = `Hello ${userName},

The Thyroid Stimulating Hormone (TSH) test checks your thyroid gland function. The normal range is 0.40 to 4.50 mIU/L.${personalContext}

⚖️ Understanding TSH:
TSH is produced by the pituitary gland to regulate your thyroid:
• High TSH (above 4.5 mIU/L): Indicates an underactive thyroid (hypothyroidism). The brain is signaling harder because circulating hormones are slow.
• Low TSH (below 0.40 mIU/L): Indicates an overactive thyroid (hyperthyroidism).

🌸 Common symptoms of underactive thyroid:
• Unexplained weight gain or slow metabolism
• Persistent tiredness and low energy
• Irregular, delayed, or heavier menstrual periods
• Dry skin, hair loss, feeling easily chilled
• Brain fog or lower mood

👩‍⚕️ Next clinical steps:
• Discuss whether Free T3, Free T4, or thyroid antibodies (Anti-TPO) should be checked.
• If prescribed thyroid medicine, take it with plain water first thing in the morning, 45 minutes before breakfast or tea.`;

    suggestedFollowUps.push('How does thyroid affect menstrual cycles?', 'What foods support thyroid health?', 'What is subclinical hypothyroidism?');
  }
  // MENSTRUAL CRAMPS / PERIOD PAIN / DYSMENORRHEA
  else if (lowerMsg.includes('cramp') || lowerMsg.includes('period pain') || lowerMsg.includes('pet dard') || lowerMsg.includes('dard') || lowerMsg.includes('dysmenorrhea')) {
    responseText = `Hello ${userName},

Menstrual cramps are triggered by prostaglandins—natural compounds that make the uterine muscles contract to shed the lining.

🌿 Evidence-based comfort measures:
1. Warm heat therapy: A heating pad or hot-water bottle over your lower abdomen relaxes uterine muscles as effectively as mild pain relievers.
2. Soothing warm teas:
   • Fresh ginger tea (adrak chai): Natural anti-inflammatory that calms cramping prostaglandins.
   • Fennel (saunf) or chamomile water: Relaxes smooth muscle spasms and reduces bloating.
3. Gentle pelvic stretches: Child's pose (Balasana), Cat-Cow, and slow belly breathing boost blood circulation.
4. Magnesium-rich foods: Bananas, pumpkin seeds, soaked almonds, and dark chocolate help relax muscles.

⚠️ When to check with your gynecologist:
If your cramps are so intense that they prevent daily activities, or if you notice heavy clotting, consulting your doctor helps rule out conditions like endometriosis or fibroids.`;

    suggestedFollowUps.push('Can diet reduce menstrual cramps?', 'What are signs of endometriosis?', 'How to track cramp severity in Lunelle?');
  }
  // WEAKNESS / FATIGUE / THAKAN
  else if (lowerMsg.includes('weakness') || lowerMsg.includes('thakan') || lowerMsg.includes('tired') || lowerMsg.includes('fatigue') || lowerMsg.includes('energy') || lowerMsg.includes('sust')) {
    responseText = `Hello ${userName},

Persistent tiredness or weakness (thakan) is your body's signal that cellular energy or essential nutrients need attention.

🔍 Most frequent causes in women:
1. Low Iron or Ferritin (Anemia): Very common with regular or heavy periods.
2. Vitamin D3 & B12 Deficiency: Extremely common with indoor work and vegetarian diets.
3. Sluggish Thyroid (TSH): Slows down cellular metabolic rate.
4. Sleep & Stress (Cortisol): Irregular rest cycles or nighttime screen light prevent deep restoration.
5. Blood Sugar Dips: Eating refined carbs without protein causes rapid energy spikes followed by sudden crashes.

💡 Practical next steps:
• Check your latest CBC, Vitamin D, Vitamin B12, and TSH in your Lunelle Lab Reports tab.
• Include adequate protein (eggs, paneer, dals, tofu, nuts) at breakfast to steady your energy.
• Drink 2.5 to 3 liters of water throughout the day.`;

    suggestedFollowUps.push('What lab tests check for fatigue?', 'What foods give sustained energy?', 'How does sleep affect hormones?');
  }
  // PCOS / PCOD / IRREGULAR CYCLES / PERIOD LATE
  else if (lowerMsg.includes('pcos') || lowerMsg.includes('pcod') || lowerMsg.includes('period late') || lowerMsg.includes('irregular') || lowerMsg.includes('late period') || lowerMsg.includes('missed period')) {
    responseText = `Hello ${userName},

Polycystic Ovary Syndrome (PCOS) is a common hormonal and metabolic pattern affecting many women.

🌸 Key signs of PCOS:
• Irregular ovulation: Cycles that are delayed, skipped, or unpredictable.
• Androgen signs: Hormonal acne along the jawline, facial or body hair, or hair thinning.
• Insulin resistance: Often creates sugar cravings, afternoon slumps, and difficulty balancing weight.

🥗 Supportive lifestyle habits:
• Low-glycemic, fiber-rich meals: Pair complex grains (millets, oats, brown rice) with protein and healthy fats.
• Strength training: 20 to 30 minutes of resistance or bodyweight exercises 3 times weekly helps muscles absorb glucose efficiently.
• Quality sleep: 7 to 8 hours of restful sleep lowers stress hormones that can delay ovulation.

👩‍⚕️ Medical consultation:
A pelvic ultrasound and basic hormone panel (FSH, LH, Fasting Insulin, AMH, Testosterone) help your doctor provide a clear personal plan.`;

    suggestedFollowUps.push('What is the difference between PCOD and PCOS?', 'What supplements help with PCOS?', 'How to track cycle regularity in Lunelle?');
  }
  // VITAMIN D / B12
  else if (lowerMsg.includes('vitamin d') || lowerMsg.includes('vit d') || lowerMsg.includes('vitamin b12') || lowerMsg.includes('b12')) {
    responseText = `Hello ${userName},

Vitamin D3 and Vitamin B12 are fundamental building blocks for women's long-term health:

☀️ Vitamin D (25-Hydroxy):
• Normal range: 30.0 to 100.0 ng/mL (under 20 ng/mL indicates deficiency).
• Why it matters: Keeps bones strong, balances immune activity, and supports hormonal balance.
• Signs of low levels: Muscle soreness, joint stiffness, feeling run down, and low mood.
• Support: 15 to 20 minutes of morning sun on arms and face. Doctors often recommend weekly supplements if levels are low.

🌿 Vitamin B12:
• Normal range: 211 to 911 pg/mL.
• Why it matters: Essential for nerve health and making healthy red blood cells.
• Signs of low levels: Pins-and-needles tingling in fingers or toes, fatigue, and memory fog.
• Support: Found in dairy, eggs, and fortified foods. Vegetarians often benefit from regular B12 supplements.`;

    suggestedFollowUps.push('What are normal Vitamin D levels?', 'Can low B12 cause nerve tingling?', 'How often should I test my vitamins?');
  }
  // BLOATING / DIGESTION / PET KHARAB
  else if (lowerMsg.includes('bloat') || lowerMsg.includes('gas') || lowerMsg.includes('digestion') || lowerMsg.includes('acidity') || lowerMsg.includes('pet')) {
    responseText = `Hello ${userName},

Abdominal bloating and digestive changes are closely connected to hormonal shifts, especially during the luteal phase (the week before your period) when progesterone slows down gut movement.

🌿 Natural digestive comfort:
1. Warm fennel or cumin water (jeera-saunf paani): Excellent for relaxing abdominal smooth muscles and releasing trapped gas.
2. Hydrate between meals: Drink warm water throughout the day, but avoid drinking large quantities right while eating to aid enzyme digestion.
3. Light movement: A 15-minute gentle walk after meals stimulates natural peristalsis.
4. Reduce sodium and processed foods: Helps prevent water retention and bloating before your period starts.`;

    suggestedFollowUps.push('Why does bloating happen before periods?', 'What foods soothe an upset stomach?', 'How to log digestive symptoms in Lunelle?');
  }
  // HEADACHE / MIGRAINE / SIR DARD
  else if (lowerMsg.includes('headache') || lowerMsg.includes('migraine') || lowerMsg.includes('sir dard') || lowerMsg.includes('sar dard')) {
    const matchingHeadaches = allSymptoms.filter(s => s.symptom_name.toLowerCase().includes('headache') || s.original_description.toLowerCase().includes('sir dard'));
    const personalHistory = matchingHeadaches.length > 0 
      ? `\n\nIn your Lunelle history: You have recorded headaches ${matchingHeadaches.length} time(s). Most recent: ${matchingHeadaches[0].date_time.split('T')[0]}.`
      : '';

    responseText = `Hello ${userName},

Headaches and migraines in women are frequently triggered by hormonal fluctuations (estrogen drops before periods), dehydration, eye strain, or muscle tension in the neck and shoulders.${personalHistory}

🌿 Quick soothing relief:
• Cool compress or ice pack placed across the forehead or back of the neck.
• Drink a large glass of water or electrolyte fluid immediately.
• Rest in a dark, quiet room with dimmed screens.
• Gentle neck and shoulder rolls to release tension.

⚠️ When to seek prompt medical care:
If a headache comes on suddenly like a thunderclap, is accompanied by vision loss, slurred speech, or weakness on one side of your body, seek emergency care right away.`;

    suggestedFollowUps.push('When did I last record a headache?', 'How are headaches linked to periods?', 'Can stress cause daily headaches?');
  }
  // HINGLISH OR CONVERSATIONAL GENERAL HEALTH QUERY
  else if (lowerMsg.includes('kaise') || lowerMsg.includes('kya kare') || lowerMsg.includes('batao') || lowerMsg.includes('madad') || lowerMsg.includes('help') || lowerMsg.includes('meri') || lowerMsg.includes('mujhe')) {
    responseText = `Hello ${userName},

Aapka sawal samajh aaya. Lunelle mein aap apne health symptoms, lab reports, aur cycle patterns ko bohot aasani se samajh sakte hain.

🌿 Main aapki in cheezon mein madad kar sakti hoon:
1. Lab Reports Samajhna: Agar aapne CBC, Thyroid (TSH), Vitamin D, ya Blood Sugar test karwaya hai, aap report upload kar sakte hain ya value puch sakte hain.
2. Symptom Tracker: Sir dard, thakan, cramps, ya mood changes ko note karein.
3. Personal History: Aap kabhi bhi puch sakte hain: "Mera pichla report kya tha?" ya "Maine last headache kab log kiya tha?".

Aapko kis cheez ke baare mein jaankari chahiye? Mujhe batayein, main poori madad karungi.`;

    suggestedFollowUps.push('When did I last record a symptom?', 'What did my previous report say?', 'Explain normal hemoglobin range');
  }
  // UNIVERSAL CLINICAL RESPONSE FOR ANY OTHER QUESTION
  else {
    const memoryNote = memory.hasRecords 
      ? `\n\nFrom your recorded history: ${memory.factualSummary}` 
      : '';

    responseText = `Hello ${userName},

Thank you for your question. As your Lunelle health companion, I am here to help you understand what your body is experiencing, make sense of test numbers, and keep track of your wellness journey.${memoryNote}

🌿 How I can support you today:
• Lab Test Guidance: Clear explanations for Haemoglobin, TSH, Vitamin D, B12, Blood Sugar, Ferritin, and Lipids.
• Women's Health & Cycles: Insights on menstrual health, cramps, ovulation signs, PCOS, and perimenopause.
• Nutrition & Energy: Evidence-based food and lifestyle habits that support hormonal harmony.
• Personal Health Memory: Searching your personal logged records anytime you ask.

Could you tell me a little more about what you would like to explore or what you are feeling? I am ready to help.

Note: Lunelle provides supportive health information and log tracking, not medical diagnoses. Always consult your doctor for personalized medical care.`;

    suggestedFollowUps.push('Explain normal hemoglobin range', 'What did my previous report say?', 'How to manage menstrual cramps?');
  }

  // Clean all hashtags (#) and stars (*) before returning!
  return {
    isEmergency: false,
    response: cleanFormatting(responseText),
    memory,
    suggestedFollowUps
  };
}
