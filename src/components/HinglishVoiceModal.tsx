import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, CheckCircle2, Edit3, X, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { api } from '../api';
import { ExtractedSymptomDraft, EmergencyCheckResult } from '../types';
import { EmergencyBanner } from './EmergencyBanner';

interface HinglishVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSymptomSaved: () => void;
}

export const HinglishVoiceModal: React.FC<HinglishVoiceModalProps> = ({
  isOpen,
  onClose,
  onSymptomSaved
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyCheckResult | null>(null);
  const [extractedDraft, setExtractedDraft] = useState<ExtractedSymptomDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editable draft fields
  const [editSymptomName, setEditSymptomName] = useState('');
  const [editSeverity, setEditSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [editBodyArea, setEditBodyArea] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser SpeechRecognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  if (!isOpen) return null;

  const startListening = () => {
    setMicPermissionDenied(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN'; // Supports Hindi / Hinglish phonetics and falls back gracefully

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setMicPermissionDenied(true);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsParsing(true);
    setEmergencyAlert(null);
    setExtractedDraft(null);

    try {
      const result = await api.parseSymptomText(inputText.trim());
      if (result.emergencyCheck?.isEmergency) {
        setEmergencyAlert(result.emergencyCheck);
      }
      setExtractedDraft(result.draft);
      setEditSymptomName(result.draft.symptomName);
      setEditSeverity(result.draft.severity);
      setEditBodyArea(result.draft.bodyArea);
      setEditDuration(result.draft.duration);
      setEditNotes(result.draft.notes);
    } catch (err: any) {
      console.error('Parser failed:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmAndSave = async () => {
    if (!editSymptomName.trim() || !extractedDraft) return;
    setIsSaving(true);

    try {
      await api.addSymptom({
        symptom_name: editSymptomName.trim(),
        original_description: extractedDraft.originalText,
        start_date: extractedDraft.startDateEstimate,
        duration: editDuration,
        severity: editSeverity,
        body_area: editBodyArea,
        notes: editNotes,
        original_language: extractedDraft.detectedLanguage,
        confirmation_status: 'confirmed',
        contextual_factors: extractedDraft.contextualFactors
      });

      onSymptomSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save confirmed symptom:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-card-lg shadow-soft-lg w-full max-w-xl max-h-[90vh] overflow-y-auto border border-border-soft p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-soft">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pale-sage text-deep-sage">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-deep-sage">Log by Voice or Hinglish</h2>
              <p className="text-xs text-text-secondary">Speak or type in English, Hindi, Marathi, or Hinglish</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-[#FAF8F2]"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Alert if recognized */}
        {emergencyAlert && <div className="mt-4"><EmergencyBanner emergency={emergencyAlert} /></div>}

        {/* Input Area */}
        <div className="mt-5 space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder='e.g., "Kal se headache hai aur aaj thoda zyada hai" or "Period 10 din late hai"'
              className="w-full p-4 text-xs leading-relaxed rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage focus:ring-1 focus:ring-deep-sage min-h-[90px] resize-none"
            />
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute top-3 right-3 text-text-secondary hover:text-text-primary text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Microphone & Dictation Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              {recognitionSupported ? (
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-pill text-xs font-medium transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse shadow-md'
                      : 'bg-pale-sage/60 text-deep-sage hover:bg-pale-sage'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Listening... (Tap to stop)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Speak Symptom</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-text-secondary flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Voice speech-to-text is not supported in this browser; please use keyboard input.
                </span>
              )}
              {isListening && (
                <div className="flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-3 bg-red-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!inputText.trim() || isParsing}
              className="flex items-center gap-2 px-4 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50 transition-all shadow-sm"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Understanding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Draft</span>
                </>
              )}
            </button>
          </div>

          {micPermissionDenied && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Microphone permission was not granted.</p>
                <p className="text-[11px] text-amber-800 mt-0.5">You can grant microphone access in your browser settings or type your symptoms above.</p>
              </div>
            </div>
          )}

          {/* Extracted Reviewable Draft */}
          {extractedDraft && (
            <div className="mt-5 p-4 rounded-card bg-[#FAF8F2] border border-border-soft space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-border-soft/60">
                <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-botanical-green" />
                  Review & Confirm Extracted Health Details
                </span>
                <span className="text-[10px] uppercase font-semibold text-text-secondary bg-white px-2 py-0.5 rounded-full border border-border-soft">
                  Language: {extractedDraft.detectedLanguage}
                </span>
              </div>

              {/* Clarification prompt if ambiguous */}
              {extractedDraft.clarificationQuestion && (
                <div className="p-2.5 rounded-xl bg-butter-cream/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Follow-up clarification:</span>
                    <p className="text-[11px] mt-0.5">{extractedDraft.clarificationQuestion}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Symptom Name
                  </label>
                  <input
                    type="text"
                    value={editSymptomName}
                    onChange={e => setEditSymptomName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white focus:border-deep-sage"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Severity
                  </label>
                  <select
                    value={editSeverity}
                    onChange={e => setEditSeverity(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white focus:border-deep-sage"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Body Area
                  </label>
                  <input
                    type="text"
                    value={editBodyArea}
                    onChange={e => setEditBodyArea(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white focus:border-deep-sage"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Duration / Timing
                  </label>
                  <input
                    type="text"
                    value={editDuration}
                    onChange={e => setEditDuration(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white focus:border-deep-sage"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                  Contextual Notes & Triggers
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border-soft bg-white focus:border-deep-sage"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setExtractedDraft(null)}
                  className="px-3.5 py-1.5 rounded-pill border border-border-soft text-text-secondary hover:text-text-primary text-xs"
                >
                  Discard Draft
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndSave}
                  disabled={isSaving || !editSymptomName.trim()}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Confirm & Save to Records</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
