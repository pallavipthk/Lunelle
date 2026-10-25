import React, { useState } from 'react';
import { 
  HeartPulse, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { api } from '../api';
import { useNotifications } from '../context/NotificationContext';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { EmergencyCheckResult } from '../types';

export const GuidedAssessmentPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [step, setStep] = useState(1);
  const [concern, setConcern] = useState('');
  const [duration, setDuration] = useState('1-2 days');
  const [progression, setProgression] = useState('stable');
  const [associatedNotes, setAssociatedNotes] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concern.trim()) return;

    setIsEvaluating(true);
    try {
      const res = await api.evaluateAssessment(concern.trim(), {
        duration,
        progression,
        associatedNotes
      });
      setEvaluationResult(res);
      setStep(3); // Result summary step
    } catch (err: any) {
      showToast('error', 'Assessment Error', err.message || 'Could not complete assessment.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveToTimeline = async () => {
    if (!evaluationResult) return;
    setIsSaving(true);
    try {
      await api.saveAssessmentSummary({
        concern,
        emergency_flagged: evaluationResult.emergencyFlagged,
        responses_json: { duration, progression, associatedNotes },
        summary_text: evaluationResult.summary,
        recommended_next_steps: evaluationResult.nextSteps
      });

      // Also log as a symptom event for whole-health timeline
      await api.addSymptom({
        symptom_name: `Guided Assessment: ${concern}`,
        original_description: evaluationResult.summary,
        severity: evaluationResult.emergencyFlagged ? 'Severe' : 'Moderate',
        notes: `Next steps: ${evaluationResult.nextSteps.join('; ')}`,
        confirmation_status: 'confirmed'
      });

      setIsSaved(true);
      showToast('success', 'Saved', 'Assessment summary saved to your Whole-Health Timeline.');
    } catch (err) {
      showToast('error', 'Error', 'Failed to save summary.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setConcern('');
    setAssociatedNotes('');
    setEvaluationResult(null);
    setIsSaved(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-border-soft">
        <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
          Guided Symptom Assessment
        </h1>
        <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
          A safety-first symptom triage process to help organize what you are experiencing.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-card-lg border border-border-soft shadow-soft">
        {/* STEP 1: DESCRIBE CONCERN */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-bold text-deep-sage">
              1. What health concern are you experiencing today?
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Describe your symptoms in your own words. Our safety layer will immediately check for emergency warning indicators.
            </p>

            <textarea
              value={concern}
              onChange={e => setConcern(e.target.value)}
              placeholder='e.g. "Severe lower right abdominal pain that started this morning" or "Throbbing headache with light sensitivity"'
              className="w-full p-3.5 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage min-h-[100px] resize-none"
            />

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (concern.trim()) setStep(2);
                }}
                disabled={!concern.trim()}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-40 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONTEXT & TIMING */}
        {step === 2 && (
          <form onSubmit={handleEvaluate} className="space-y-5">
            <h2 className="font-serif text-lg font-bold text-deep-sage">
              2. Timing & Associated Details
            </h2>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                How long have you noticed this concern?
              </label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              >
                <option value="Just started today (few hours)">Just started today (few hours)</option>
                <option value="1-2 days">1 to 2 days</option>
                <option value="3-7 days">3 to 7 days</option>
                <option value="Over a week">Over a week</option>
                <option value="Several weeks or intermittent">Several weeks or recurring</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                How has the intensity changed?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'improving', label: 'Improving' },
                  { id: 'stable', label: 'About the same' },
                  { id: 'worsening', label: 'Worsening / Escalating' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProgression(p.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      progression === p.id
                        ? 'border-deep-sage bg-pale-sage/40 text-deep-sage font-bold'
                        : 'border-border-soft hover:bg-[#FAF8F2]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Any associated symptoms or factors? (Optional)
              </label>
              <input
                type="text"
                value={associatedNotes}
                onChange={e => setAssociatedNotes(e.target.value)}
                placeholder="e.g. Mild nausea, late period, stressful week..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={isEvaluating}
                className="flex items-center gap-1.5 px-6 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating Safety...</span>
                  </>
                ) : (
                  <span>Review Assessment</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: STRUCTURED SUMMARY & GUIDANCE */}
        {step === 3 && evaluationResult && (
          <div className="space-y-5">
            {evaluationResult.emergencyFlagged && evaluationResult.emergencyDetails ? (
              <EmergencyBanner emergency={evaluationResult.emergencyDetails} />
            ) : (
              <div className="p-3.5 rounded-xl bg-pale-sage/40 border border-botanical-green/40 text-xs text-deep-sage flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-sage shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Assessment Complete:</strong>
                  No immediate emergency indicators detected. Here is your structured summary:
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                Reported Health Concern
              </span>
              <p className="text-xs font-semibold text-text-primary">"{concern}"</p>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Duration: {duration} • Progression: {progression} {associatedNotes && `• Context: ${associatedNotes}`}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-deep-sage mb-2">
                Recommended Next Steps
              </h3>
              <ul className="space-y-1.5">
                {evaluationResult.nextSteps.map((stepText: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-primary">
                    <span className="text-botanical-green font-bold">•</span>
                    <span>{stepText}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-[11px] text-text-secondary italic">
              {evaluationResult.uncertaintyNote}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border-soft">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2 rounded-pill border border-border-soft text-text-secondary hover:text-text-primary text-xs"
              >
                Start New Assessment
              </button>

              <button
                type="button"
                onClick={handleSaveToTimeline}
                disabled={isSaving || isSaved}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50"
              >
                {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-butter-cream" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved to Health Timeline' : 'Save Summary to Records'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
