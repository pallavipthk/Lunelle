import { 
  User, 
  UserProfile, 
  Symptom, 
  CycleEntry, 
  LabReport, 
  ExplainableInsight, 
  Reminder, 
  VaultDocument, 
  EmergencyCheckResult, 
  ExtractedSymptomDraft 
} from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('lunelle_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; preferred_name?: string; preferred_language?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ token: string; user: User; profile: UserProfile }>(res);
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<{ token: string; user: User; profile: UserProfile }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ user: User; profile: UserProfile }>(res);
  },

  async updateProfile(updates: Partial<UserProfile>) {
    const res = await fetch(`${API_BASE}/auth/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates)
    });
    return handleResponse<{ success: boolean; profile: UserProfile }>(res);
  },

  // Symptoms
  async parseSymptomText(text: string) {
    const res = await fetch(`${API_BASE}/symptoms/parse-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ text })
    });
    return handleResponse<{ emergencyCheck: EmergencyCheckResult; draft: ExtractedSymptomDraft }>(res);
  },

  async getSymptoms(params?: { search?: string; category?: string; startDate?: string; endDate?: string }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/symptoms?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ symptoms: Symptom[] }>(res);
  },

  async addSymptom(data: Partial<Symptom>) {
    const res = await fetch(`${API_BASE}/symptoms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; symptom: Symptom }>(res);
  },

  async updateSymptom(id: string, updates: Partial<Symptom>) {
    const res = await fetch(`${API_BASE}/symptoms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates)
    });
    return handleResponse<{ success: boolean; symptom: Symptom }>(res);
  },

  async deleteSymptom(id: string) {
    const res = await fetch(`${API_BASE}/symptoms/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Cycle
  async getCycleData() {
    const res = await fetch(`${API_BASE}/cycle`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{
      cycles: CycleEntry[];
      estimates: {
        averageCycleLengthDays: number;
        estimatedNextPeriod: string | null;
        disclaimer: string;
      };
    }>(res);
  },

  async addCycleEntry(data: Partial<CycleEntry>) {
    const res = await fetch(`${API_BASE}/cycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; entry: CycleEntry }>(res);
  },

  async deleteCycleEntry(id: string) {
    const res = await fetch(`${API_BASE}/cycle/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Lab Reports
  async uploadReportFile(file: File | null, manualText?: string) {
    const formData = new FormData();
    if (file) formData.append('report_file', file);
    if (manualText) formData.append('manual_text', manualText);

    const res = await fetch(`${API_BASE}/lab-reports/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse<{ fileInfo: any; draft: any }>(res);
  },

  async getDemoReportPanel(panelType: string) {
    const res = await fetch(`${API_BASE}/lab-reports/demo-panel/${panelType}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ draft: any }>(res);
  },

  async confirmLabReport(data: any) {
    const res = await fetch(`${API_BASE}/lab-reports/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; report: LabReport; results: any[] }>(res);
  },

  async getLabReports() {
    const res = await fetch(`${API_BASE}/lab-reports`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ reports: LabReport[] }>(res);
  },

  async deleteLabReport(id: string) {
    const res = await fetch(`${API_BASE}/lab-reports/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Explainable Health Pattern Finder (Insights)
  async getInsights() {
    const res = await fetch(`${API_BASE}/insights`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ insights: ExplainableInsight[] }>(res);
  },

  // AI Assistant with Personal Health Memory
  async sendAssistantMessage(message: string, tone?: 'gentle' | 'clinical' | 'nutrition') {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, tone })
    });
    return handleResponse<{
      isEmergency: boolean;
      response: string;
      emergencyDetails?: EmergencyCheckResult;
      memory?: any;
      suggestedFollowUps?: string[];
      tone?: string;
    }>(res);
  },

  // Guided Assessment
  async evaluateAssessment(concern: string, responses: any) {
    const res = await fetch(`${API_BASE}/assessment/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ concern, responses })
    });
    return handleResponse<{
      emergencyFlagged: boolean;
      emergencyDetails?: EmergencyCheckResult;
      summary: string;
      nextSteps: string[];
      uncertaintyNote?: string;
    }>(res);
  },

  async saveAssessmentSummary(data: any) {
    const res = await fetch(`${API_BASE}/assessment/save-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; assessment: any }>(res);
  },

  // Reminders
  async getReminders() {
    const res = await fetch(`${API_BASE}/reminders`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ reminders: Reminder[] }>(res);
  },

  async addReminder(data: Partial<Reminder>) {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponse<{ success: boolean; reminder: Reminder }>(res);
  },

  async toggleReminder(id: string) {
    const res = await fetch(`${API_BASE}/reminders/${id}/toggle`, {
      method: 'PUT',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean; reminder: Reminder }>(res);
  },

  async deleteReminder(id: string) {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Medical Vault
  async getVaultFiles() {
    const res = await fetch(`${API_BASE}/vault`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ files: VaultDocument[] }>(res);
  },

  async uploadVaultDocument(formData: FormData) {
    const res = await fetch(`${API_BASE}/vault/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData
    });
    return handleResponse<{ success: boolean; document: VaultDocument }>(res);
  },

  async deleteVaultDocument(id: string) {
    const res = await fetch(`${API_BASE}/vault/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // Privacy & Data Control
  getExportUrl() {
    return `${API_BASE}/privacy/export`;
  },

  async deleteAllHealthRecords() {
    const res = await fetch(`${API_BASE}/privacy/delete-all-health-records`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE}/privacy/delete-account`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  }
};
