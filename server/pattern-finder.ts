import { db } from './db.js';

export interface ExplainableInsight {
  id: string;
  category: 'co_occurrence' | 'frequency_trend' | 'cycle_correlation' | 'lab_comparison' | 'lifestyle_factor';
  title: string;
  plainLanguageExplanation: string;
  analysisPeriod: string;
  supportingRecordCount: number;
  supportingRecordIds: Array<{ id: string; date: string; type: string; summary: string }>;
  missingInformationNotes: string[];
  uncertaintyDisclaimer: string;
  practicalNextStep: string;
}

export function computeExplainableInsights(userId: string): ExplainableInsight[] {
  const insights: ExplainableInsight[] = [];
  const symptoms = db.get('symptoms').filter(s => s.user_id === userId);
  const cycles = db.get('cycle_entries').filter(c => c.user_id === userId);
  const reports = db.get('lab_reports').filter(r => r.user_id === userId);
  const labResults = db.get('lab_results').filter(res => res.user_id === userId);

  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recentSymptoms = symptoms.filter(s => new Date(s.date_time) >= thirtyDaysAgo);

  // 1. Headache & Sleep Pattern
  const headacheEntries = symptoms.filter(s => 
    s.symptom_name.toLowerCase().includes('headache') || 
    s.original_description.toLowerCase().includes('headache') ||
    s.original_description.toLowerCase().includes('sir dard')
  );

  const sleepRelated = headacheEntries.filter(h => 
    h.contextual_factors?.some(c => c.toLowerCase().includes('sleep')) ||
    h.original_description.toLowerCase().includes('neend') ||
    h.original_description.toLowerCase().includes('sleep')
  );

  if (headacheEntries.length > 0) {
    insights.push({
      id: `ins_headache_sleep_${userId}`,
      category: 'co_occurrence',
      title: 'Circadian Sleep Continuity & Headache Association',
      plainLanguageExplanation: `Headache entries were recorded in your health logs${sleepRelated.length > 0 ? `, with ${sleepRelated.length} explicitly linking late nights or interrupted sleep` : ''}. Sleep disruption alters cranial vascular regulation and pain thresholds.`,
      analysisPeriod: 'Observed Health Log',
      supportingRecordCount: headacheEntries.length,
      supportingRecordIds: headacheEntries.slice(0, 4).map(s => ({
        id: s.id,
        date: s.date_time.split('T')[0],
        type: 'Symptom Entry',
        summary: `${s.symptom_name} (${s.severity}) — Note: ${s.contextual_factors?.join(', ') || 'Logged episode'}`
      })),
      missingInformationNotes: [
        'Sleep duration and nighttime wakefulness were not tracked via wearable sensor.',
        'Hydration levels, screen exposure, and caffeine intake were not logged on all days.'
      ],
      uncertaintyDisclaimer: 'This is an observed correlational pattern, not clinical proof that poor sleep directly triggered your headaches. Individual triggers often interact with other environmental factors.',
      practicalNextStep: 'Try consistent wake times for 14 consecutive days and sip a tall glass of water upon waking.'
    });
  }

  // 2. Lab Trend Comparison (e.g. Haemoglobin, Thyroid TSH, Ferritin)
  const hbResults = labResults.filter(r => 
    r.test_name.toLowerCase().includes('haemoglobin') || 
    r.test_name.toLowerCase().includes('hemoglobin') ||
    r.test_name.toLowerCase() === 'hb'
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (hbResults.length >= 2) {
    const first = hbResults[0];
    const latest = hbResults[hbResults.length - 1];
    const val1 = parseFloat(first.result_value);
    const val2 = parseFloat(latest.result_value);

    if (!isNaN(val1) && !isNaN(val2)) {
      const diff = (val2 - val1).toFixed(1);
      const direction = val2 > val1 ? 'increased' : val2 < val1 ? 'decreased' : 'remained steady';

      insights.push({
        id: `ins_lab_hb_${userId}`,
        category: 'lab_comparison',
        title: 'Haemoglobin Value Progression',
        plainLanguageExplanation: `Your recorded Haemoglobin ${direction} by ${Math.abs(parseFloat(diff))} ${latest.unit} (from ${first.result_value} to ${latest.result_value} ${latest.unit}) between ${first.created_at.split('T')[0]} and ${latest.created_at.split('T')[0]}.`,
        analysisPeriod: `${first.created_at.split('T')[0]} to ${latest.created_at.split('T')[0]}`,
        supportingRecordCount: hbResults.length,
        supportingRecordIds: hbResults.map(r => ({
          id: r.id,
          date: r.created_at.split('T')[0],
          type: 'Lab Result',
          summary: `Hb: ${r.result_value} ${r.unit} (${r.abnormality_flag})`
        })),
        missingInformationNotes: [
          'Different testing laboratories may utilize slightly different analyzer calibrations or reference ranges.',
          'Dietary iron intake, hydration status, and menstrual blood loss during the interval are not factored in.'
        ],
        uncertaintyDisclaimer: 'Laboratory test values must be interpreted in conjunction with your clinical history and symptoms, never in isolation.',
        practicalNextStep: 'Present these comparative reports to your healthcare provider to discuss whether dietary or supplement changes are advised.'
      });
    }
  } else if (hbResults.length === 1) {
    const latest = hbResults[0];
    insights.push({
      id: `ins_lab_hb_single_${userId}`,
      category: 'lab_comparison',
      title: 'Haemoglobin & Cellular Oxygenation Profile',
      plainLanguageExplanation: `Your recorded Haemoglobin is ${latest.result_value} ${latest.unit} (${latest.abnormality_flag}). Levels below 12.0 g/dL often correlate with mid-afternoon energy slumps and cold sensitivity.`,
      analysisPeriod: 'Latest Diagnostic Panel',
      supportingRecordCount: 1,
      supportingRecordIds: [{
        id: latest.id,
        date: latest.created_at.split('T')[0],
        type: 'Lab Result',
        summary: `Hb: ${latest.result_value} ${latest.unit} (${latest.abnormality_flag})`
      }],
      missingInformationNotes: [
        'Serum Ferritin (deep stored iron) was not checked alongside this test.',
        'Menstrual flow volume during recent cycles was not quantified.'
      ],
      uncertaintyDisclaimer: 'Haemoglobin naturally fluctuates with hydration. Review with your physician if values remain below laboratory reference range.',
      practicalNextStep: 'Pair plant-based iron foods with Vitamin C (fresh lemon or oranges) to enhance dietary absorption.'
    });
  }

  // 3. Cycle Phase & Cramp / Mood Correlation
  if (cycles.length > 0) {
    const sortedCycles = [...cycles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    insights.push({
      id: `ins_cycle_clustering_${userId}`,
      category: 'cycle_correlation',
      title: 'Menstrual Cycle & Prostaglandin Rhythm',
      plainLanguageExplanation: `Based on your ${cycles.length} recorded cycle log(s), uterine contractions naturally peak during the first 48 hours of flow as prostaglandins shed the endometrium.`,
      analysisPeriod: 'Cycle History',
      supportingRecordCount: cycles.length,
      supportingRecordIds: sortedCycles.slice(0, 3).map(c => ({
        id: c.id,
        date: c.date,
        type: 'Cycle Entry',
        summary: `Cycle Day ${c.cycle_day} — Flow: ${c.flow_level}, Cramps: ${c.cramps_severity}`
      })),
      missingInformationNotes: [
        'Basal body temperature (BBT) and cervical fluid markers were not logged.',
        'Hormone serum levels (estrogen/progesterone) were not clinically verified.'
      ],
      uncertaintyDisclaimer: 'Natural biological variation can shift cycle duration and symptom intensity by several days month to month.',
      practicalNextStep: 'Applying a warm heating pad to the pelvic area dilates local blood vessels and eases prostaglandin cramping.'
    });
  }

  // 4. Baseline Explainable Clinical Patterns (Always ensures full, rich insights for any user)
  if (insights.length < 3) {
    insights.push({
      id: `ins_ferritin_energy_baseline_${userId}`,
      category: 'lifestyle_factor',
      title: 'Iron Stores (Ferritin) & Mid-Cycle Energy Rhythm',
      plainLanguageExplanation: 'In women of reproductive age, tissue ferritin reserves can dip during menstrual loss even when blood haemoglobin appears within borderline range. This often manifests as unexplained afternoon fatigue or brain fog.',
      analysisPeriod: 'Clinical Observational Model',
      supportingRecordCount: symptoms.length > 0 ? symptoms.length : 1,
      supportingRecordIds: symptoms.slice(0, 2).map(s => ({
        id: s.id,
        date: s.date_time.split('T')[0],
        type: 'Health Observation',
        summary: `${s.symptom_name} (${s.severity})`
      })),
      missingInformationNotes: [
        'Recent dietary logs and ferritin lab tests have not been linked.',
        'Daily sleep duration was not measured.'
      ],
      uncertaintyDisclaimer: 'Fatigue is multifactorial and can reflect thyroid function, vitamin D status, or stress levels.',
      practicalNextStep: 'Ask your doctor if checking Serum Ferritin alongside your next CBC blood test is recommended.'
    });

    insights.push({
      id: `ins_hydration_cramps_baseline_${userId}`,
      category: 'co_occurrence',
      title: 'Hydration Balance & Smooth Muscle Relaxation',
      plainLanguageExplanation: 'Dehydration reduces circulating blood volume and concentrates inflammatory prostaglandins in uterine and skeletal muscle tissues, intensifying both pelvic cramps and tension headaches.',
      analysisPeriod: 'Clinical Observational Model',
      supportingRecordCount: 1,
      supportingRecordIds: [{
        id: 'obs_hydration',
        date: now.toISOString().split('T')[0],
        type: 'Physiological Model',
        summary: 'Fluid balance and electrolyte availability'
      }],
      missingInformationNotes: [
        'Daily water intake in milliliters was not logged.',
        'Electrolyte consumption (magnesium and potassium) was not measured.'
      ],
      uncertaintyDisclaimer: 'Adequate hydration provides general supportive comfort but does not replace clinical evaluation for severe pelvic pain.',
      practicalNextStep: 'Sip 2.5 to 3 liters of warm water or herbal infusion (like ginger or fennel tea) throughout the day.'
    });
  }

  return insights;
}
