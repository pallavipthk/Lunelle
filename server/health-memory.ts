import { db } from './db.js';

export interface MemoryQueryResponse {
  hasRecords: boolean;
  factualSummary: string;
  supportingRecords: Array<{
    type: 'symptom' | 'cycle' | 'lab_report' | 'medication';
    id: string;
    date: string;
    summary: string;
    details: any;
  }>;
  contextualNote: string;
}

export function queryPersonalHealthMemory(userId: string, question: string): MemoryQueryResponse {
  const q = question.toLowerCase().trim();
  const allSymptoms = db.get('symptoms').filter(s => s.user_id === userId);
  const allCycles = db.get('cycle_entries').filter(c => c.user_id === userId);
  const allReports = db.get('lab_reports').filter(r => r.user_id === userId);
  const allResults = db.get('lab_results').filter(res => res.user_id === userId);
  const profile = db.get('user_profiles').find(p => p.user_id === userId);

  // 1. Headache / Specific symptom queries: e.g. "When did I last record a headache?", "Have I experienced this symptom before?"
  if (q.includes('headache') || q.includes('migraine') || q.includes('sir dard')) {
    const matching = allSymptoms.filter(s => 
      s.symptom_name.toLowerCase().includes('headache') || 
      s.symptom_name.toLowerCase().includes('migraine') ||
      s.original_description.toLowerCase().includes('headache') ||
      s.original_description.toLowerCase().includes('sir dard')
    ).sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

    if (matching.length === 0) {
      return {
        hasRecords: false,
        factualSummary: 'No recorded entries for headaches or migraines were found in your personal health log.',
        supportingRecords: [],
        contextualNote: 'Note: Lunelle only checks the records you have actively logged. If you experienced headaches without recording them, they will not appear here.'
      };
    }

    const latest = matching[0];
    return {
      hasRecords: true,
      factualSummary: `You have recorded headaches on ${matching.length} occasion${matching.length > 1 ? 's' : ''}. The most recent entry was logged on ${new Date(latest.date_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} with reported severity "${latest.severity}" (${latest.original_description}).`,
      supportingRecords: matching.map(m => ({
        type: 'symptom',
        id: m.id,
        date: m.date_time,
        summary: `${m.symptom_name} — Severity: ${m.severity}`,
        details: m
      })),
      contextualNote: 'Factual information extracted directly from your personal symptom logs.'
    };
  }

  // 2. Lab report inquiries: e.g. "What did my previous report say?", "lab report", "Hb", "thyroid"
  if (q.includes('report') || q.includes('lab') || q.includes('test') || q.includes('hb') || q.includes('thyroid')) {
    if (allReports.length === 0) {
      return {
        hasRecords: false,
        factualSummary: 'No laboratory reports are currently saved in your medical records.',
        supportingRecords: [],
        contextualNote: 'You can upload PDF or image reports in the Lab Reports tab to track values over time.'
      };
    }

    const sortedReports = [...allReports].sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());
    const latestReport = sortedReports[0];
    const resultsForReport = allResults.filter(r => r.report_id === latestReport.id);

    const resultsSummary = resultsForReport.length > 0
      ? resultsForReport.map(r => `${r.test_name}: ${r.result_value} ${r.unit} (${r.abnormality_flag})`).join(', ')
      : 'No itemized test values extracted yet';

    return {
      hasRecords: true,
      factualSummary: `Your most recently saved report is "${latestReport.title}" dated ${latestReport.report_date} from ${latestReport.lab_name || 'Laboratory'}. Extracted values: ${resultsSummary}.`,
      supportingRecords: [
        {
          type: 'lab_report',
          id: latestReport.id,
          date: latestReport.report_date,
          summary: `${latestReport.title} (${latestReport.lab_name})`,
          details: { report: latestReport, results: resultsForReport }
        }
      ],
      contextualNote: 'Lab results must always be reviewed in consultation with your attending physician.'
    };
  }

  // 3. Cycle inquiries: e.g. "What information have I recorded about my cycle?", "period"
  if (q.includes('cycle') || q.includes('period') || q.includes('menstrual')) {
    if (allCycles.length === 0) {
      return {
        hasRecords: false,
        factualSummary: 'No menstrual cycle entries have been recorded in your profile yet.',
        supportingRecords: [],
        contextualNote: 'Cycle tracking is completely optional. If enabled in Settings, you can log cycle dates, flow, and symptoms.'
      };
    }

    const sortedCycles = [...allCycles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestCycle = sortedCycles[0];

    return {
      hasRecords: true,
      factualSummary: `You have ${allCycles.length} cycle log${allCycles.length > 1 ? 's' : ''} on record. Your last logged entry was on ${latestCycle.date} noting flow level "${latestCycle.flow_level}" and cramp severity "${latestCycle.cramps_severity}".`,
      supportingRecords: sortedCycles.slice(0, 5).map(c => ({
        type: 'cycle',
        id: c.id,
        date: c.date,
        summary: `Cycle Day ${c.cycle_day} — Flow: ${c.flow_level}, Cramps: ${c.cramps_severity}`,
        details: c
      })),
      contextualNote: 'Cycle history summary based strictly on user-confirmed dates.'
    };
  }

  // 4. Monthly symptom progression: e.g. "How have my symptoms changed this month?"
  if (q.includes('month') || q.includes('changed') || q.includes('symptoms')) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSymptoms = allSymptoms.filter(s => new Date(s.date_time) >= thirtyDaysAgo);

    if (recentSymptoms.length === 0) {
      return {
        hasRecords: false,
        factualSummary: 'You have not recorded any symptoms in the past 30 days.',
        supportingRecords: [],
        contextualNote: 'Use the Symptom Tracker to record any changes you notice.'
      };
    }

    // Group by symptom
    const counts: Record<string, number> = {};
    recentSymptoms.forEach(s => {
      counts[s.symptom_name] = (counts[s.symptom_name] || 0) + 1;
    });

    const breakdown = Object.entries(counts).map(([name, count]) => `${name} (${count}x)`).join(', ');

    return {
      hasRecords: true,
      factualSummary: `Over the past 30 days, you logged ${recentSymptoms.length} symptom entr${recentSymptoms.length > 1 ? 'ies' : 'y'}: ${breakdown}.`,
      supportingRecords: recentSymptoms.slice(0, 5).map(s => ({
        type: 'symptom',
        id: s.id,
        date: s.date_time,
        summary: `${s.symptom_name} — ${s.severity}`,
        details: s
      })),
      contextualNote: 'Aggregated frequency based on your recent 30-day symptom logs.'
    };
  }

  // General fallback search across all records
  const matchingSymptoms = allSymptoms.filter(s => 
    s.symptom_name.toLowerCase().includes(q) || s.original_description.toLowerCase().includes(q)
  );

  if (matchingSymptoms.length > 0) {
    return {
      hasRecords: true,
      factualSummary: `Found ${matchingSymptoms.length} matching health record${matchingSymptoms.length > 1 ? 's' : ''} related to "${question}".`,
      supportingRecords: matchingSymptoms.map(s => ({
        type: 'symptom',
        id: s.id,
        date: s.date_time,
        summary: `${s.symptom_name} (${s.date_time.split('T')[0]})`,
        details: s
      })),
      contextualNote: 'Retrieved based on keyword matching in your verified records.'
    };
  }

  return {
    hasRecords: false,
    factualSummary: `I searched your records, but could not find any saved entries directly referencing "${question}".`,
    supportingRecords: [],
    contextualNote: 'Lunelle never invents health history. If you experience this in the future, you can log it to keep a record.'
  };
}
