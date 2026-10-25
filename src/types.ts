export interface User {
  id: string;
  email: string;
}

export interface UserProfile {
  user_id: string;
  preferred_name: string;
  preferred_language: 'en' | 'hi' | 'mr';
  health_history: string;
  allergies: string;
  medications: string;
  conditions: string;
  observations: string;
  cycle_tracking_enabled: boolean;
  pcos_module_enabled: boolean;
  perimenopause_module_enabled: boolean;
  reproductive_module_enabled: boolean;
  communication_style: 'simple' | 'detailed' | 'conversational';
  reminder_prefs: string;
  data_consent: boolean;
  updated_at: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  symptom_name: string;
  original_description: string;
  date_time: string;
  start_date: string;
  duration: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | number;
  frequency: string;
  body_area: string;
  associated_symptoms: string[];
  contextual_factors: string[];
  notes: string;
  attachments: string[];
  original_language: string;
  confirmation_status: 'draft' | 'confirmed';
  created_at: string;
}

export interface CycleEntry {
  id: string;
  user_id: string;
  date: string;
  cycle_day: number;
  flow_level: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  cramps_severity: 'none' | 'mild' | 'moderate' | 'severe';
  mood: string;
  energy_level: 'low' | 'normal' | 'high';
  notes: string;
  symptoms: string[];
  created_at: string;
}

export interface LabResultItem {
  id: string;
  report_id: string;
  user_id: string;
  test_name: string;
  result_value: string;
  unit: string;
  reference_range: string;
  abnormality_flag: 'Normal' | 'Low' | 'High' | 'Borderline';
  interpretation: string;
  created_at: string;
}

export interface LabReport {
  id: string;
  user_id: string;
  title: string;
  lab_name: string;
  report_date: string;
  file_name: string;
  file_path: string;
  file_size: number;
  notes: string;
  status: 'pending_review' | 'confirmed';
  created_at: string;
  items?: LabResultItem[];
}

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

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  category: 'medication' | 'appointment' | 'preventive' | 'cycle' | 'task';
  schedule_time: string;
  days_of_week: number[];
  repeat_interval: 'daily' | 'weekly' | 'monthly' | 'once';
  is_completed: boolean;
  is_active: boolean;
  last_triggered_at?: string;
  notes: string;
  created_at: string;
}

export interface VaultDocument {
  id: string;
  user_id: string;
  title: string;
  category: 'Lab Report' | 'Prescription' | 'Doctor Note' | 'Scan / Imaging' | 'Insurance' | 'Other';
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  document_date: string;
  notes: string;
  created_at: string;
}

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
