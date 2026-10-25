import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ArrowRight, 
  Edit3, 
  Sparkles, 
  Loader2,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { api } from '../api';
import { LabReport, LabResultItem } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { TextToSpeechPlayer } from '../components/TextToSpeechPlayer';

export const LabReportsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const [reports, setReports] = useState<LabReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Upload & Extraction workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedDraft, setExtractedDraft] = useState<any | null>(null);

  // Review & Confirmation state
  const [editTitle, setEditTitle] = useState('');
  const [editLabName, setEditLabName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [isSavingConfirmed, setIsSavingConfirmed] = useState(false);

  // Selected report detail for interpretation
  const [activeReport, setActiveReport] = useState<LabReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.getLabReports();
      setReports(res.reports || []);
      if (res.reports?.length > 0 && !activeReport) {
        setActiveReport(res.reports[0]);
      }
    } catch (err) {
      console.error('Failed to load lab reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadAndExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !manualText.trim()) {
      showToast('info', 'Input Required', 'Please select a file or paste test text.');
      return;
    }

    setIsExtracting(true);
    try {
      const res = await api.uploadReportFile(selectedFile, manualText);
      setExtractedDraft(res.draft);
      setEditTitle(res.draft.reportTitle);
      setEditLabName(res.draft.labName);
      setEditDate(res.draft.reportDate);
      setReviewItems(res.draft.extractedItems || []);
      showToast('success', 'Extraction Complete', 'Please review the values below before confirming.');
    } catch (err: any) {
      showToast('error', 'Extraction Failed', err.message || 'Could not parse document.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleLoadDemoPanel = async (type: 'cbc' | 'thyroid' | 'lipids' | 'vitamins_metabolic') => {
    setIsExtracting(true);
    setIsUploading(true);
    try {
      const res = await api.getDemoReportPanel(type);
      setExtractedDraft(res.draft);
      setEditTitle(res.draft.reportTitle);
      setEditLabName(res.draft.labName);
      setEditDate(res.draft.reportDate);
      setReviewItems(res.draft.extractedItems || []);
      showToast('success', 'Panel Loaded', 'Clinical values extracted for verification.');
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to load panel.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleItemFieldChange = (index: number, field: string, value: string) => {
    const updated = [...reviewItems];
    updated[index] = { ...updated[index], [field]: value };
    setReviewItems(updated);
  };

  const handleSaveConfirmedReport = async () => {
    if (!editTitle.trim() || reviewItems.length === 0) return;

    setIsSavingConfirmed(true);
    try {
      await api.confirmLabReport({
        title: editTitle,
        lab_name: editLabName,
        report_date: editDate,
        file_name: selectedFile?.name || 'Manual Laboratory Log',
        file_size: selectedFile?.size || 0,
        notes: extractedDraft?.clinicalContextNotice || '',
        items: reviewItems
      });

      showToast('success', 'Report Saved', 'Confirmed values saved to your medical history.');
      setExtractedDraft(null);
      setSelectedFile(null);
      setManualText('');
      setIsUploading(false);
      loadReports();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Could not save confirmed report.');
    } finally {
      setIsSavingConfirmed(false);
    }
  };

  const handleDeleteReport = async (id: string, title: string) => {
    if (!window.confirm(`Delete lab report "${title}" and all its itemized results?`)) return;
    try {
      await api.deleteLabReport(id);
      showToast('success', 'Deleted', 'Lab report deleted.');
      if (activeReport?.id === id) setActiveReport(null);
      loadReports();
    } catch (err) {
      showToast('error', 'Error', 'Failed to remove report.');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-soft">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
            Lab Report Interpreter
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
            Upload diagnostic blood tests, review extracted reference ranges, and understand trends.
          </p>
        </div>

        <button
          onClick={() => setIsUploading(!isUploading)}
          className="flex items-center gap-2 px-4 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 shadow-sm"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{isUploading ? 'Close Upload' : 'Upload New Report'}</span>
        </button>
      </div>

      {/* UPLOAD & REVIEW STAGE */}
      {isUploading && (
        <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft space-y-5 max-w-3xl">
          <h3 className="font-serif text-base font-bold text-deep-sage">
            Step 1: Upload Report File or Paste Values
          </h3>

          {!extractedDraft ? (
            <form onSubmit={handleUploadAndExtract} className="space-y-4">
              <div className="border-2 border-dashed border-border-soft rounded-2xl p-6 text-center hover:bg-[#FAF8F2] transition-colors">
                <UploadCloud className="w-8 h-8 text-botanical-green mx-auto mb-2" />
                <p className="text-xs font-semibold text-text-primary">
                  Choose PDF or Image (CBC, Thyroid, Lipids, etc.)
                </p>
                <p className="text-[11px] text-text-secondary mt-1">
                  Supported formats: PDF, JPG, PNG, WEBP (Max 15MB)
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="mt-3 text-xs text-text-secondary file:mr-4 file:py-1.5 file:px-4 file:rounded-pill file:border-0 file:text-xs file:font-semibold file:bg-pale-sage file:text-deep-sage hover:file:bg-botanical-green/40"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Or Paste Text from Report (Optional)
                </label>
                <textarea
                  value={manualText}
                  onChange={e => setManualText(e.target.value)}
                  placeholder="e.g. Haemoglobin: 11.4 g/dL (Reference 12.0 - 15.5), TSH: 3.82 mIU/L"
                  className="w-full p-3 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage min-h-[60px] resize-none"
                />
              </div>

              <div className="pt-2 border-t border-border-soft">
                <p className="text-[11px] font-bold text-text-secondary mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-botanical-green" />
                  <span>Or Load Standard Panel (1-Click Instant Extraction):</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadDemoPanel('cbc')}
                    className="p-2.5 rounded-xl border border-border-soft bg-[#FAF8F2] hover:bg-pale-sage/50 text-left transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-deep-sage">🩸 CBC Panel</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Hb, RBC, Platelets</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoPanel('thyroid')}
                    className="p-2.5 rounded-xl border border-border-soft bg-[#FAF8F2] hover:bg-pale-sage/50 text-left transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-deep-sage">🦋 Thyroid</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">TSH, FT3, FT4</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoPanel('lipids')}
                    className="p-2.5 rounded-xl border border-border-soft bg-[#FAF8F2] hover:bg-pale-sage/50 text-left transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-deep-sage">🥑 Lipid Profile</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Chol, HDL, LDL</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadDemoPanel('vitamins_metabolic')}
                    className="p-2.5 rounded-xl border border-border-soft bg-[#FAF8F2] hover:bg-pale-sage/50 text-left transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-deep-sage">💊 Vitamins & Iron</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">Vit D, B12, Ferritin</p>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isExtracting || (!selectedFile && !manualText.trim())}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Values...</span>
                    </>
                  ) : (
                    <span>Extract & Review Report</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: REVIEW & CONFIRMATION */
            <div className="space-y-4 pt-2">
              <div className="p-3 rounded-xl bg-pale-sage/40 border border-botanical-green/40 text-xs text-deep-sage flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-sage shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">User Confirmation Required:</strong>
                  Automatic extraction is a convenience aid. Please verify all numbers against your printed laboratory report before confirming.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Report Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Laboratory Name</label>
                  <input
                    type="text"
                    value={editLabName}
                    onChange={e => setEditLabName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-text-secondary block mb-1">Report Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white"
                  />
                </div>
              </div>

              {/* Items Verification Table */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-deep-sage uppercase tracking-wider">
                  Extracted Test Items ({reviewItems.length})
                </h4>
                {reviewItems.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-text-secondary block font-semibold mb-0.5">Test Name</label>
                      <input
                        type="text"
                        value={item.testName}
                        onChange={e => handleItemFieldChange(idx, 'testName', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded border border-border-soft bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary block font-semibold mb-0.5">Result Value</label>
                      <input
                        type="text"
                        value={item.resultValue}
                        onChange={e => handleItemFieldChange(idx, 'resultValue', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded border border-border-soft bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary block font-semibold mb-0.5">Unit & Range</label>
                      <input
                        type="text"
                        value={`${item.unit} (${item.referenceRange})`}
                        onChange={e => handleItemFieldChange(idx, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded border border-border-soft bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary block font-semibold mb-0.5">Flag</label>
                      <select
                        value={item.abnormalityFlag}
                        onChange={e => handleItemFieldChange(idx, 'abnormalityFlag', e.target.value)}
                        className="w-full px-2.5 py-1 text-xs rounded border border-border-soft bg-white font-semibold"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Low">Low</option>
                        <option value="High">High</option>
                        <option value="Borderline">Borderline</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setExtractedDraft(null)}
                  className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfirmedReport}
                  disabled={isSavingConfirmed}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90"
                >
                  {isSavingConfirmed ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Confirm & Save Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAVED REPORTS & INTERPRETATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Saved Reports List */}
        <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft lg:col-span-1">
          <h3 className="font-serif text-base font-bold text-deep-sage mb-3">
            Confirmed Laboratory Reports
          </h3>

          {reports.length === 0 ? (
            <div className="text-center py-6 space-y-3">
              <FileCheck className="w-8 h-8 text-botanical-green mx-auto opacity-60" />
              <p className="text-xs text-text-secondary">No laboratory reports saved yet.</p>
              <div className="pt-2 border-t border-border-soft space-y-2">
                <p className="text-[10px] uppercase font-bold text-deep-sage tracking-wider">Try a Sample Panel:</p>
                <div className="flex flex-col gap-1.5 text-left">
                  <button
                    onClick={() => handleLoadDemoPanel('cbc')}
                    className="p-2 rounded-lg bg-[#FAF8F2] hover:bg-pale-sage/60 text-[11px] font-semibold text-deep-sage border border-border-soft flex items-center justify-between"
                  >
                    <span>🩸 Complete Blood Count (CBC)</span>
                    <ArrowRight className="w-3 h-3 text-text-secondary" />
                  </button>
                  <button
                    onClick={() => handleLoadDemoPanel('thyroid')}
                    className="p-2 rounded-lg bg-[#FAF8F2] hover:bg-pale-sage/60 text-[11px] font-semibold text-deep-sage border border-border-soft flex items-center justify-between"
                  >
                    <span>🦋 Thyroid Profile (TSH)</span>
                    <ArrowRight className="w-3 h-3 text-text-secondary" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reports.map(rep => (
                <div
                  key={rep.id}
                  onClick={() => setActiveReport(rep)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    activeReport?.id === rep.id
                      ? 'border-deep-sage bg-pale-sage/40 shadow-xs'
                      : 'border-border-soft hover:bg-[#FAF8F2]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">{rep.title}</h4>
                      <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                        {rep.report_date} • {rep.lab_name}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(rep.id, rep.title);
                      }}
                      className="text-text-secondary hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Detailed Interpretation & Breakdown */}
        <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft lg:col-span-2">
          {activeReport ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border-soft gap-2">
                <div>
                  <h3 className="font-serif text-xl font-bold text-deep-sage">{activeReport.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Conducted by <span className="font-semibold text-text-primary">{activeReport.lab_name}</span> on {activeReport.report_date}
                  </p>
                </div>
                <TextToSpeechPlayer
                  textToRead={`${activeReport.title}. Extracted results: ${activeReport.items?.map(it => `${it.test_name}: ${it.result_value} ${it.unit}, reference range ${it.reference_range}`).join('. ')}`}
                  label="Listen to Summary"
                />
              </div>

              {/* Itemized Tests List */}
              <div className="space-y-4">
                {activeReport.items?.map((item: LabResultItem) => (
                  <div key={item.id} className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-deep-sage">{item.test_name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.abnormality_flag === 'Normal'
                          ? 'bg-pale-sage text-deep-sage'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {item.abnormality_flag}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-text-primary">{item.result_value}</span>
                      <span className="text-xs text-text-secondary">{item.unit}</span>
                      <span className="text-xs text-text-secondary ml-3 font-mono">
                        (Printed Lab Range: {item.reference_range})
                      </span>
                    </div>

                    {item.interpretation && (
                      <p className="text-xs text-text-secondary leading-relaxed pt-1 border-t border-border-soft/60">
                        {item.interpretation}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-butter-cream/40 border border-amber-200 text-[11px] text-text-secondary leading-relaxed">
                <strong className="block text-amber-950 font-semibold mb-0.5">Clinical Review Notice:</strong>
                Laboratory results can fluctuate with hydration status, timing of blood draw, medications, and analyzer calibrations. Never change medical dosages without discussing these findings with your doctor.
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-botanical-green mx-auto mb-2 opacity-50" />
              <p className="text-xs text-text-secondary">
                Select a confirmed report on the left or upload a new one to view clinical explanations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
