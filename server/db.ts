import fs from 'fs';
import path from 'path';

export interface DatabaseStore {
  users: Array<{
    id: string;
    email: string;
    password_hash: string;
    created_at: string;
  }>;
  user_profiles: Array<{
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
  }>;
  symptoms: Array<{
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
  }>;
  cycle_entries: Array<{
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
  }>;
  lab_reports: Array<{
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
  }>;
  lab_results: Array<{
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
  }>;
  reminders: Array<{
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
  }>;
  medical_vault: Array<{
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
  }>;
  assessment_summaries: Array<{
    id: string;
    user_id: string;
    concern: string;
    emergency_flagged: boolean;
    responses_json: any;
    summary_text: string;
    recommended_next_steps: string[];
    created_at: string;
  }>;
  ai_conversations: Array<{
    id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata_json?: any;
    created_at: string;
  }>;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lunelle_store.json');
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const defaultData: DatabaseStore = {
  users: [],
  user_profiles: [],
  symptoms: [],
  cycle_entries: [],
  lab_reports: [],
  lab_results: [],
  reminders: [],
  medical_vault: [],
  assessment_summaries: [],
  ai_conversations: [],
};

class StorageEngine {
  private data: DatabaseStore;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseStore {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultData, ...parsed };
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh store:', err);
    }
    return JSON.parse(JSON.stringify(defaultData));
  }

  public save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public get<T extends keyof DatabaseStore>(table: T): DatabaseStore[T] {
    return this.data[table];
  }

  public set<T extends keyof DatabaseStore>(table: T, value: DatabaseStore[T]): void {
    this.data[table] = value;
    this.save();
  }

  public raw(): DatabaseStore {
    return this.data;
  }
}

export const db = new StorageEngine();
