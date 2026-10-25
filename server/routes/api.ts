import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db.js';
import { hashPassword, comparePassword, signToken, requireAuth, AuthRequest } from '../auth.js';
import { checkEmergencyIndicators } from '../safety-rules.js';
import { parseHinglishHealthInput } from '../hinglish-parser.js';
import { queryPersonalHealthMemory } from '../health-memory.js';
import { computeExplainableInsights } from '../pattern-finder.js';
import { parseLabReportText, extractTextFromPdfBuffer, getDemoPanel } from '../lab-parser.js';
import { processHealthAssistantMessage } from '../ai-assistant-engine.js';

export const apiRouter = Router();

// Configure private storage for Medical Vault and Lab Reports
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Supported formats: PDF, JPG, PNG, WEBP, TXT'));
    }
  }
});

// ==========================================
// 1. AUTHENTICATION & ONBOARDING
// ==========================================

apiRouter.post('/auth/register', (req, res: Response) => {
  try {
    const { email, password, preferred_name, preferred_language } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.get('users').find(u => u.email === cleanEmail);
    if (existing) {
      res.status(400).json({ error: 'An account with this email already exists' });
      return;
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const newUser = {
      id: userId,
      email: cleanEmail,
      password_hash: passwordHash,
      created_at: now
    };

    const newProfile = {
      user_id: userId,
      preferred_name: preferred_name || 'Friend',
      preferred_language: preferred_language || 'en',
      health_history: '',
      allergies: '',
      medications: '',
      conditions: '',
      observations: '',
      cycle_tracking_enabled: true,
      pcos_module_enabled: false,
      perimenopause_module_enabled: false,
      reproductive_module_enabled: true,
      communication_style: 'simple' as const,
      reminder_prefs: JSON.stringify({ inApp: true, browser: false }),
      data_consent: true,
      updated_at: now
    };

    db.get('users').push(newUser);
    db.get('user_profiles').push(newProfile);
    db.save();

    const token = signToken(userId, cleanEmail);
    res.status(201).json({
      token,
      user: { id: userId, email: cleanEmail },
      profile: newProfile
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Registration failed' });
  }
});

apiRouter.post('/auth/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.get('users').find(u => u.email === cleanEmail);
    if (!user || !comparePassword(password, user.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const profile = db.get('user_profiles').find(p => p.user_id === user.id);
    const token = signToken(user.id, user.email);

    res.json({
      token,
      user: { id: user.id, email: user.email },
      profile
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = db.get('users').find(u => u.id === req.userId);
  const profile = db.get('user_profiles').find(p => p.user_id === req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user: { id: user.id, email: user.email }, profile });
});

apiRouter.post('/auth/update-profile', requireAuth, (req: AuthRequest, res: Response) => {
  const profiles = db.get('user_profiles');
  const index = profiles.findIndex(p => p.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Profile not found' });
    return;
  }

  const updated = {
    ...profiles[index],
    ...req.body,
    updated_at: new Date().toISOString()
  };
  profiles[index] = updated;
  db.save();

  res.json({ success: true, profile: updated });
});

// ==========================================
// 2. SYMPTOMS & HINGLISH PARSING
// ==========================================

apiRouter.post('/symptoms/parse-text', requireAuth, (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: 'Input text is required' });
    return;
  }

  // First verify emergency indicators
  const emergencyCheck = checkEmergencyIndicators(text);
  const parsedDraft = parseHinglishHealthInput(text);

  res.json({
    emergencyCheck,
    draft: parsedDraft
  });
});

apiRouter.get('/symptoms', requireAuth, (req: AuthRequest, res: Response) => {
  const { search, category, startDate, endDate } = req.query;
  let items = db.get('symptoms').filter(s => s.user_id === req.userId);

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    items = items.filter(i => 
      i.symptom_name.toLowerCase().includes(s) || 
      i.original_description.toLowerCase().includes(s) ||
      i.notes.toLowerCase().includes(s)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    items = items.filter(i => i.body_area.toLowerCase() === category.toLowerCase());
  }

  if (startDate && typeof startDate === 'string') {
    items = items.filter(i => i.date_time >= startDate);
  }

  if (endDate && typeof endDate === 'string') {
    items = items.filter(i => i.date_time <= endDate);
  }

  // Sort chronological descending
  items.sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());

  res.json({ symptoms: items });
});

apiRouter.post('/symptoms', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      symptom_name,
      original_description,
      date_time,
      start_date,
      duration,
      severity,
      frequency,
      body_area,
      associated_symptoms,
      contextual_factors,
      notes,
      original_language,
      confirmation_status
    } = req.body;

    if (!symptom_name) {
      res.status(400).json({ error: 'Symptom name is required' });
      return;
    }

    const newSymptom = {
      id: `sym_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: req.userId!,
      symptom_name,
      original_description: original_description || symptom_name,
      date_time: date_time || new Date().toISOString(),
      start_date: start_date || new Date().toISOString().split('T')[0],
      duration: duration || 'Not specified',
      severity: severity || 'Moderate',
      frequency: frequency || 'Occasional',
      body_area: body_area || 'General',
      associated_symptoms: Array.isArray(associated_symptoms) ? associated_symptoms : [],
      contextual_factors: Array.isArray(contextual_factors) ? contextual_factors : [],
      notes: notes || '',
      attachments: [],
      original_language: original_language || 'en',
      confirmation_status: confirmation_status || 'confirmed',
      created_at: new Date().toISOString()
    };

    db.get('symptoms').push(newSymptom);
    db.save();

    res.status(201).json({ success: true, symptom: newSymptom });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save symptom' });
  }
});

apiRouter.put('/symptoms/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const symptoms = db.get('symptoms');
  const index = symptoms.findIndex(s => s.id === req.params.id && s.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Symptom entry not found or unauthorized' });
    return;
  }

  symptoms[index] = { ...symptoms[index], ...req.body, user_id: req.userId! };
  db.save();
  res.json({ success: true, symptom: symptoms[index] });
});

apiRouter.delete('/symptoms/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const symptoms = db.get('symptoms');
  const index = symptoms.findIndex(s => s.id === req.params.id && s.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Symptom entry not found or unauthorized' });
    return;
  }

  symptoms.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Symptom record deleted' });
});

// ==========================================
// 3. WOMEN'S HEALTH & CYCLE TRACKING
// ==========================================

apiRouter.get('/cycle', requireAuth, (req: AuthRequest, res: Response) => {
  const cycles = db.get('cycle_entries')
    .filter(c => c.user_id === req.userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate honest estimates without claiming guarantees
  let estimatedNextPeriod: string | null = null;
  let averageCycleLengthDays = 28;
  const periodStarts = cycles.filter(c => c.flow_level !== 'none');

  if (periodStarts.length >= 2) {
    // calculate average gap
    const dates = periodStarts.map(p => new Date(p.date).getTime()).sort((a, b) => b - a);
    let diffSum = 0;
    let gapsCount = 0;
    for (let i = 0; i < dates.length - 1; i++) {
      const diffDays = Math.round((dates[i] - dates[i + 1]) / (1000 * 3600 * 24));
      if (diffDays >= 15 && diffDays <= 60) {
        diffSum += diffDays;
        gapsCount++;
      }
    }
    if (gapsCount > 0) {
      averageCycleLengthDays = Math.round(diffSum / gapsCount);
    }
    const latestDate = new Date(dates[0]);
    latestDate.setDate(latestDate.getDate() + averageCycleLengthDays);
    estimatedNextPeriod = latestDate.toISOString().split('T')[0];
  }

  res.json({
    cycles,
    estimates: {
      averageCycleLengthDays,
      estimatedNextPeriod,
      disclaimer: 'Estimates are mathematical projections based on your recorded dates, not biological guarantees or medical conclusions.'
    }
  });
});

apiRouter.post('/cycle', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { date, cycle_day, flow_level, cramps_severity, mood, energy_level, notes, symptoms } = req.body;
    if (!date) {
      res.status(400).json({ error: 'Date is required for cycle logging' });
      return;
    }

    const newEntry = {
      id: `cyc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: req.userId!,
      date,
      cycle_day: cycle_day || 1,
      flow_level: flow_level || 'medium',
      cramps_severity: cramps_severity || 'mild',
      mood: mood || 'Calm',
      energy_level: energy_level || 'normal',
      notes: notes || '',
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      created_at: new Date().toISOString()
    };

    db.get('cycle_entries').push(newEntry);
    db.save();

    res.status(201).json({ success: true, entry: newEntry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record cycle entry' });
  }
});

apiRouter.delete('/cycle/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const cycles = db.get('cycle_entries');
  const index = cycles.findIndex(c => c.id === req.params.id && c.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Cycle entry not found or unauthorized' });
    return;
  }
  cycles.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Cycle entry removed' });
});

// ==========================================
// 4. LAB REPORTS & EXTRACTION
// ==========================================

apiRouter.post('/lab-reports/upload', requireAuth, upload.single('report_file'), (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    const manualText = req.body.manual_text;

    let textToParse = manualText || '';
    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (file.mimetype === 'text/plain' || ext === '.txt') {
        textToParse = `${fs.readFileSync(file.path, 'utf-8')}\n${manualText || ''}`;
      } else if (file.mimetype === 'application/pdf' || ext === '.pdf') {
        const fileBuffer = fs.readFileSync(file.path);
        const extractedPdfText = extractTextFromPdfBuffer(fileBuffer);
        textToParse = `${extractedPdfText}\n${file.originalname}\n${manualText || ''}`;
      } else {
        // Image or other binary format
        textToParse = `${file.originalname} ${manualText || ''}`;
      }
    }

    const draft = parseLabReportText(textToParse, file?.originalname);

    res.json({
      fileInfo: file ? {
        originalName: file.originalname,
        fileName: file.filename,
        size: file.size,
        path: `/uploads/${file.filename}`
      } : null,
      draft
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Report upload processing failed' });
  }
});

apiRouter.get('/lab-reports/demo-panel/:panelType', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const type = req.params.panelType as 'cbc' | 'thyroid' | 'lipids' | 'vitamins_metabolic';
    const draft = getDemoPanel(type);
    res.json({ draft });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate demo report draft' });
  }
});

apiRouter.post('/lab-reports/confirm', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { title, lab_name, report_date, file_name, file_path, file_size, notes, items } = req.body;
    if (!title || !items || !Array.isArray(items)) {
      res.status(400).json({ error: 'Report title and confirmed items are required' });
      return;
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newReport = {
      id: reportId,
      user_id: req.userId!,
      title,
      lab_name: lab_name || 'Diagnostic Center',
      report_date: report_date || now.split('T')[0],
      file_name: file_name || '',
      file_path: file_path || '',
      file_size: file_size || 0,
      notes: notes || '',
      status: 'confirmed' as const,
      created_at: now
    };

    const newResults = items.map((it: any) => ({
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      report_id: reportId,
      user_id: req.userId!,
      test_name: it.testName || it.test_name,
      result_value: String(it.resultValue || it.result_value),
      unit: it.unit || '',
      reference_range: it.referenceRange || it.reference_range || '',
      abnormality_flag: it.abnormalityFlag || it.abnormality_flag || 'Normal',
      interpretation: it.interpretation || '',
      created_at: now
    }));

    db.get('lab_reports').push(newReport);
    const labResults = db.get('lab_results');
    newResults.forEach(r => labResults.push(r));
    db.save();

    res.status(201).json({
      success: true,
      report: newReport,
      results: newResults
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save confirmed report' });
  }
});

apiRouter.get('/lab-reports', requireAuth, (req: AuthRequest, res: Response) => {
  const reports = db.get('lab_reports')
    .filter(r => r.user_id === req.userId)
    .sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

  const results = db.get('lab_results').filter(res => res.user_id === req.userId);

  const combined = reports.map(rep => ({
    ...rep,
    items: results.filter(res => res.report_id === rep.id)
  }));

  res.json({ reports: combined });
});

apiRouter.delete('/lab-reports/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const reports = db.get('lab_reports');
  const index = reports.findIndex(r => r.id === req.params.id && r.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Report not found or unauthorized' });
    return;
  }

  // Remove linked results
  const results = db.get('lab_results');
  const remainingResults = results.filter(res => res.report_id !== req.params.id);
  db.set('lab_results', remainingResults);

  reports.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Report and linked items removed' });
});

// ==========================================
// 5. EXPLAINABLE HEALTH PATTERN FINDER
// ==========================================

apiRouter.get('/insights', requireAuth, (req: AuthRequest, res: Response) => {
  const insights = computeExplainableInsights(req.userId!);
  res.json({ insights });
});

// ==========================================
// 6. PERSONAL HEALTH MEMORY & AI ASSISTANT
// ==========================================

apiRouter.post('/assistant/chat', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { message, tone } = req.body;
    if (!message) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    const assistantResult = processHealthAssistantMessage(req.userId!, message, tone);

    // Record conversation
    db.get('ai_conversations').push({
      id: `conv_${Date.now()}_u`,
      user_id: req.userId!,
      role: 'user',
      content: message,
      created_at: new Date().toISOString()
    });
    db.get('ai_conversations').push({
      id: `conv_${Date.now()}_a`,
      user_id: req.userId!,
      role: 'assistant',
      content: assistantResult.response,
      metadata_json: { 
        memoryConsulted: assistantResult.memory.hasRecords,
        isEmergency: assistantResult.isEmergency 
      },
      created_at: new Date().toISOString()
    });
    db.save();

    res.json(assistantResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Assistant failed to process query' });
  }
});

// ==========================================
// 7. GUIDED SYMPTOM ASSESSMENT
// ==========================================

apiRouter.post('/assessment/evaluate', requireAuth, (req: AuthRequest, res: Response) => {
  const { concern, responses } = req.body;
  if (!concern) {
    res.status(400).json({ error: 'Health concern description is required' });
    return;
  }

  // Safety layer check
  const emergencyCheck = checkEmergencyIndicators(concern);
  if (emergencyCheck.isEmergency) {
    res.json({
      emergencyFlagged: true,
      emergencyDetails: emergencyCheck,
      summary: emergencyCheck.guidanceText,
      nextSteps: emergencyCheck.emergencyActions
    });
    return;
  }

  // Generate structured summary of user-provided information
  const userSummary = `Assessment Summary for: "${concern}". Reported duration and context: ${JSON.stringify(responses || {})}.`;
  const nextSteps = [
    'Monitor symptom progression over the next 24-48 hours.',
    'Maintain adequate hydration and rest in a well-ventilated space.',
    'If symptoms escalate in severity, become continuous, or if new warning signs emerge, consult a healthcare provider promptly.'
  ];

  res.json({
    emergencyFlagged: false,
    summary: userSummary,
    nextSteps,
    uncertaintyNote: 'This assessment organizes the information you provided. It is not an automated diagnosis and does not replace in-person clinical evaluation.'
  });
});

apiRouter.post('/assessment/save-summary', requireAuth, (req: AuthRequest, res: Response) => {
  const { concern, emergency_flagged, responses_json, summary_text, recommended_next_steps } = req.body;
  const newSummary = {
    id: `ass_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: req.userId!,
    concern: concern || 'General Symptom Assessment',
    emergency_flagged: Boolean(emergency_flagged),
    responses_json: responses_json || {},
    summary_text: summary_text || '',
    recommended_next_steps: recommended_next_steps || [],
    created_at: new Date().toISOString()
  };

  db.get('assessment_summaries').push(newSummary);
  db.save();

  res.status(201).json({ success: true, assessment: newSummary });
});

// ==========================================
// 8. REMINDERS & PREVENTIVE CARE
// ==========================================

apiRouter.get('/reminders', requireAuth, (req: AuthRequest, res: Response) => {
  const reminders = db.get('reminders')
    .filter(r => r.user_id === req.userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ reminders });
});

apiRouter.post('/reminders', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const { title, category, schedule_time, repeat_interval, notes } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Title is required for reminder' });
      return;
    }

    const newReminder = {
      id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: req.userId!,
      title,
      category: category || 'medication',
      schedule_time: schedule_time || '09:00',
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      repeat_interval: repeat_interval || 'daily',
      is_completed: false,
      is_active: true,
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    db.get('reminders').push(newReminder);
    db.save();

    res.status(201).json({ success: true, reminder: newReminder });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create reminder' });
  }
});

apiRouter.put('/reminders/:id/toggle', requireAuth, (req: AuthRequest, res: Response) => {
  const reminders = db.get('reminders');
  const index = reminders.findIndex(r => r.id === req.params.id && r.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Reminder not found or unauthorized' });
    return;
  }

  reminders[index].is_completed = !reminders[index].is_completed;
  db.save();
  res.json({ success: true, reminder: reminders[index] });
});

apiRouter.delete('/reminders/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const reminders = db.get('reminders');
  const index = reminders.findIndex(r => r.id === req.params.id && r.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  reminders.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Reminder deleted' });
});

// ==========================================
// 9. MEDICAL VAULT
// ==========================================

apiRouter.get('/vault', requireAuth, (req: AuthRequest, res: Response) => {
  const files = db.get('medical_vault')
    .filter(f => f.user_id === req.userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ files });
});

apiRouter.post('/vault/upload', requireAuth, upload.single('document'), (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No document file uploaded' });
      return;
    }

    const { title, category, document_date, notes } = req.body;
    const newDoc = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: req.userId!,
      title: title || file.originalname,
      category: category || 'Other',
      file_name: file.originalname,
      file_path: `/uploads/${file.filename}`,
      file_size: file.size,
      mime_type: file.mimetype,
      document_date: document_date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      created_at: new Date().toISOString()
    };

    db.get('medical_vault').push(newDoc);
    db.save();

    res.status(201).json({ success: true, document: newDoc });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Document upload failed' });
  }
});

apiRouter.delete('/vault/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const docs = db.get('medical_vault');
  const index = docs.findIndex(d => d.id === req.params.id && d.user_id === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Document not found or unauthorized' });
    return;
  }

  // Delete local file if it exists
  const doc = docs[index];
  const fullPath = path.resolve(process.cwd(), doc.file_path.replace(/^\//, ''));
  if (fs.existsSync(fullPath)) {
    try { fs.unlinkSync(fullPath); } catch (e) { /* ignore */ }
  }

  docs.splice(index, 1);
  db.save();
  res.json({ success: true, message: 'Document removed from private vault' });
});

// ==========================================
// 10. PRIVACY, DATA EXPORT & ACCOUNT DELETION
// ==========================================

apiRouter.get('/privacy/export', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const exportPackage = {
    exportDate: new Date().toISOString(),
    profile: db.get('user_profiles').find(p => p.user_id === userId),
    symptoms: db.get('symptoms').filter(s => s.user_id === userId),
    cycles: db.get('cycle_entries').filter(c => c.user_id === userId),
    labReports: db.get('lab_reports').filter(r => r.user_id === userId),
    labResults: db.get('lab_results').filter(res => res.user_id === userId),
    reminders: db.get('reminders').filter(r => r.user_id === userId),
    vaultDocuments: db.get('medical_vault').filter(v => v.user_id === userId),
    assessments: db.get('assessment_summaries').filter(a => a.user_id === userId)
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=lunelle_health_export_${Date.now()}.json`);
  res.send(JSON.stringify(exportPackage, null, 2));
});

apiRouter.post('/privacy/delete-all-health-records', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  db.set('symptoms', db.get('symptoms').filter(s => s.user_id !== userId));
  db.set('cycle_entries', db.get('cycle_entries').filter(c => c.user_id !== userId));
  db.set('lab_reports', db.get('lab_reports').filter(r => r.user_id !== userId));
  db.set('lab_results', db.get('lab_results').filter(res => res.user_id !== userId));
  db.set('reminders', db.get('reminders').filter(r => r.user_id !== userId));
  db.set('medical_vault', db.get('medical_vault').filter(v => v.user_id !== userId));
  db.set('assessment_summaries', db.get('assessment_summaries').filter(a => a.user_id !== userId));
  db.set('ai_conversations', db.get('ai_conversations').filter(c => c.user_id !== userId));

  res.json({ success: true, message: 'All personal health records have been permanently erased.' });
});

apiRouter.post('/privacy/delete-account', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  // Delete user from all tables
  db.set('users', db.get('users').filter(u => u.id !== userId));
  db.set('user_profiles', db.get('user_profiles').filter(p => p.user_id !== userId));
  db.set('symptoms', db.get('symptoms').filter(s => s.user_id !== userId));
  db.set('cycle_entries', db.get('cycle_entries').filter(c => c.user_id !== userId));
  db.set('lab_reports', db.get('lab_reports').filter(r => r.user_id !== userId));
  db.set('lab_results', db.get('lab_results').filter(res => res.user_id !== userId));
  db.set('reminders', db.get('reminders').filter(r => r.user_id !== userId));
  db.set('medical_vault', db.get('medical_vault').filter(v => v.user_id !== userId));
  db.set('assessment_summaries', db.get('assessment_summaries').filter(a => a.user_id !== userId));
  db.set('ai_conversations', db.get('ai_conversations').filter(c => c.user_id !== userId));

  res.json({ success: true, message: 'Account and associated data permanently deleted.' });
});
