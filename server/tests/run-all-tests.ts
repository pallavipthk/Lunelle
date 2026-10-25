import assert from 'assert';
import { checkEmergencyIndicators } from '../safety-rules.js';
import { parseHinglishHealthInput } from '../hinglish-parser.js';
import { db } from '../db.js';
import { queryPersonalHealthMemory } from '../health-memory.js';
import { computeExplainableInsights } from '../pattern-finder.js';
import { hashPassword, comparePassword, signToken } from '../auth.js';

console.log('🧪 Starting Lunelle Verification Test Suite...\n');

let passedCount = 0;
let totalCount = 0;

function runTest(name: string, fn: () => void) {
  totalCount++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedCount++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}\n`);
  }
}

// -------------------------------------------------------------
// 1. Emergency-Warning Recognition Tests (Section 15 & 24)
// -------------------------------------------------------------
runTest('Emergency Rules: Chest pain radiates to arm triggers immediate emergency', () => {
  const result = checkEmergencyIndicators('I have sudden chest pain radiating to my left arm');
  assert.strictEqual(result.isEmergency, true);
  assert.strictEqual(result.severity, 'immediate_emergency');
  assert.ok(result.emergencyActions.length > 0);
  assert.ok(result.helplines.some(h => h.number === '112'));
});

runTest('Emergency Rules: FAST stroke symptoms slurred speech & facial droop', () => {
  const result = checkEmergencyIndicators('sudden face droop and slurred speech');
  assert.strictEqual(result.isEmergency, true);
  assert.strictEqual(result.severity, 'immediate_emergency');
});

runTest('Emergency Rules: Severe postpartum / gynecological hemorrhage', () => {
  const result = checkEmergencyIndicators('soaking 2 pads per hour and feeling dizzy');
  assert.strictEqual(result.isEmergency, true);
});

runTest('Emergency Rules: Non-urgent mild headache does NOT trigger emergency', () => {
  const result = checkEmergencyIndicators('mild headache since afternoon after long screen work');
  assert.strictEqual(result.isEmergency, false);
});

// -------------------------------------------------------------
// 2. Hinglish-Aware Voice and Text System Tests (Section 8 & 24)
// -------------------------------------------------------------
runTest('Hinglish: "kal se sir dukh raha h" extracts Headache & yesterday', () => {
  const draft = parseHinglishHealthInput('kal se sir dukh raha h');
  assert.strictEqual(draft.symptomName, 'Headache');
  assert.strictEqual(draft.bodyArea, 'Head');
  assert.strictEqual(draft.duration, 'Since yesterday');
  assert.strictEqual(draft.originalText, 'kal se sir dukh raha h');
});

runTest('Hinglish: "period 10 din late hai" extracts Delayed Menstrual Cycle and duration', () => {
  const draft = parseHinglishHealthInput('period 10 din late hai');
  assert.strictEqual(draft.symptomName, 'Delayed Menstrual Cycle');
  assert.strictEqual(draft.duration, '10 days');
});

runTest('Hinglish: "pet m cramps bhot jyada h" extracts Severe Menstrual / Pelvic Cramps', () => {
  const draft = parseHinglishHealthInput('pet m cramps bhot jyada h');
  assert.strictEqual(draft.symptomName, 'Menstrual / Pelvic Cramps');
  assert.strictEqual(draft.severity, 'Severe');
});

runTest('Hinglish: "pain pehle mild tha ab severe ho gaya" extracts progression', () => {
  const draft = parseHinglishHealthInput('pain pehle mild tha ab severe ho gaya');
  assert.strictEqual(draft.severity, 'Severe');
  assert.ok(draft.notes.includes('started mild and progressed to severe'));
});

runTest('Marathi: "Mala sakalpasun thakva vattoy" extracts Fatigue in Marathi', () => {
  const draft = parseHinglishHealthInput('Mala sakalpasun thakva vattoy');
  assert.strictEqual(draft.detectedLanguage, 'mr');
  assert.strictEqual(draft.symptomName, 'Fatigue & Generalized Weakness');
  assert.strictEqual(draft.duration, 'Since this morning');
});

// -------------------------------------------------------------
// 3. Authentication & Security Tests (Section 4 & 24)
// -------------------------------------------------------------
runTest('Auth: Password hashing and verification with bcryptjs', () => {
  const password = 'LunelleUserSecurePass2026!';
  const hash = hashPassword(password);
  assert.notStrictEqual(password, hash);
  assert.strictEqual(comparePassword(password, hash), true);
  assert.strictEqual(comparePassword('wrongpassword', hash), false);
});

runTest('Auth: JWT signing and token integrity', () => {
  const token = signToken('usr_test_123', 'test@lunelle.health');
  assert.ok(typeof token === 'string' && token.length > 20);
});

// -------------------------------------------------------------
// 4. Personal Health Memory Tests (Section 9 & 24)
// -------------------------------------------------------------
runTest('Health Memory: Honest response when no record exists', () => {
  const testUserId = `usr_test_empty_${Date.now()}`;
  const response = queryPersonalHealthMemory(testUserId, 'When did I last record a headache?');
  assert.strictEqual(response.hasRecords, false);
  assert.ok(response.factualSummary.includes('No recorded entries'));
});

runTest('Health Memory: Cites exact saved records when available', () => {
  const testUserId = `usr_test_memory_${Date.now()}`;
  const now = new Date().toISOString();
  
  // Insert verified symptom entry
  db.get('symptoms').push({
    id: 'sym_mem_1',
    user_id: testUserId,
    symptom_name: 'Headache',
    original_description: 'kal se headache hai',
    date_time: now,
    start_date: now.split('T')[0],
    duration: '1 day',
    severity: 'Moderate',
    frequency: 'Constant',
    body_area: 'Head',
    associated_symptoms: [],
    contextual_factors: ['Poor sleep'],
    notes: 'Memory test',
    attachments: [],
    original_language: 'hinglish',
    confirmation_status: 'confirmed',
    created_at: now
  });

  const response = queryPersonalHealthMemory(testUserId, 'When did I last record a headache?');
  assert.strictEqual(response.hasRecords, true);
  assert.ok(response.factualSummary.toLowerCase().includes('headache'));
  assert.strictEqual(response.supportingRecords.length, 1);
  assert.strictEqual(response.supportingRecords[0].id, 'sym_mem_1');
});

// -------------------------------------------------------------
// 5. Explainable Health Pattern Finder Tests (Section 12 & 24)
// -------------------------------------------------------------
runTest('Pattern Finder: Generates explainable pattern with evidence links and non-causation disclaimer', () => {
  const testUserId = `usr_pattern_${Date.now()}`;
  const now = new Date();

  // Create 3 headache entries with poor sleep
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - (i * 3));
    db.get('symptoms').push({
      id: `sym_pattern_${i}`,
      user_id: testUserId,
      symptom_name: 'Headache',
      original_description: `sir dard after late night ${i}`,
      date_time: d.toISOString(),
      start_date: d.toISOString().split('T')[0],
      duration: '4 hours',
      severity: 'Moderate',
      frequency: 'Occasional',
      body_area: 'Head',
      associated_symptoms: [],
      contextual_factors: ['Poor sleep / Late night'],
      notes: '',
      attachments: [],
      original_language: 'hinglish',
      confirmation_status: 'confirmed',
      created_at: d.toISOString()
    });
  }

  const insights = computeExplainableInsights(testUserId);
  assert.ok(insights.length >= 1);
  const headacheInsight = insights.find(ins => ins.id.includes('headache_sleep'));
  assert.ok(headacheInsight !== undefined);
  assert.ok(headacheInsight!.supportingRecordCount >= 2);
  assert.ok(headacheInsight!.uncertaintyDisclaimer.includes('not clinical proof'));
  assert.ok(headacheInsight!.missingInformationNotes.length > 0);
});

console.log(`\n📊 Test Suite Summary: ${passedCount} / ${totalCount} tests passed.\n`);
if (passedCount === totalCount) {
  console.log('🎉 All Lunelle core clinical & technical verification tests passed successfully!');
} else {
  process.exit(1);
}
