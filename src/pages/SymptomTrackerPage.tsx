import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Plus, 
  Mic, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  AlertCircle, 
  Download,
  Loader2,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { api } from '../api';
import { Symptom } from '../types';
import { useNotifications } from '../context/NotificationContext';

interface SymptomTrackerPageProps {
  onOpenVoiceModal: () => void;
}

export const SymptomTrackerPage: React.FC<SymptomTrackerPageProps> = ({ onOpenVoiceModal }) => {
  const { showToast } = useNotifications();
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [isAddingManual, setIsAddingManual] = useState(false);

  // Manual Form States
  const [symptomName, setSymptomName] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [bodyArea, setBodyArea] = useState('General');
  const [duration, setDuration] = useState('');
  const [contextFactors, setContextFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    setIsLoading(true);
    try {
      const res = await api.getSymptoms();
      setSymptoms(res.symptoms || []);
    } catch (err) {
      console.error('Failed to load symptoms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSymptom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomName.trim()) return;

    setIsSaving(true);
    try {
      await api.addSymptom({
        symptom_name: symptomName.trim(),
        original_description: notes.trim() || symptomName.trim(),
        severity,
        body_area: bodyArea,
        duration: duration || 'Not specified',
        contextual_factors: contextFactors,
        notes,
        confirmation_status: 'confirmed'
      });

      showToast('success', 'Symptom Logged', `Saved "${symptomName}" to your health log.`);
      setIsAddingManual(false);
      setSymptomName('');
      setNotes('');
      setDuration('');
      setContextFactors([]);
      loadSymptoms();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to record symptom.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete record for "${name}"?`)) return;
    try {
      await api.deleteSymptom(id);
      showToast('success', 'Deleted', 'Symptom record removed.');
      loadSymptoms();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not delete symptom.');
    }
  };

  const toggleFactor = (factor: string) => {
    if (contextFactors.includes(factor)) {
      setContextFactors(prev => prev.filter(f => f !== factor));
    } else {
      setContextFactors(prev => [...prev, factor]);
    }
  };

  const filtered = symptoms.filter(s => {
    if (filterSeverity !== 'all' && s.severity !== filterSeverity) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.symptom_name.toLowerCase().includes(q) ||
        s.original_description.toLowerCase().includes(q) ||
        s.body_area.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-soft">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
            Symptom Tracker
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
            Track daily health observations with precision, voice dictation, or Hinglish phrases.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-2 px-4 py-2 rounded-pill bg-pale-sage/60 text-deep-sage text-xs font-semibold hover:bg-pale-sage transition-all shadow-sm"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice / Hinglish Log</span>
          </button>
          <button
            onClick={() => setIsAddingManual(!isAddingManual)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAddingManual ? 'Cancel' : 'Structured Entry'}</span>
          </button>
        </div>
      </div>

      {/* Manual Entry Form */}
      {isAddingManual && (
        <form onSubmit={handleCreateSymptom} className="p-6 rounded-card bg-white border border-border-soft shadow-soft space-y-4 max-w-2xl">
          <h3 className="font-serif text-base font-bold text-deep-sage">
            New Structured Symptom Entry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Symptom Name *
              </label>
              <input
                type="text"
                required
                value={symptomName}
                onChange={e => setSymptomName(e.target.value)}
                placeholder="e.g. Headache, Abdominal Cramp, Fatigue"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Severity
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              >
                <option value="Mild">Mild — Noticeable but not disruptive</option>
                <option value="Moderate">Moderate — Affects normal activities</option>
                <option value="Severe">Severe — Significantly incapacitating</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Body Area
              </label>
              <input
                type="text"
                value={bodyArea}
                onChange={e => setBodyArea(e.target.value)}
                placeholder="e.g. Head, Lower Abdomen, Back, Whole Body"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">
                Duration / Timing
              </label>
              <input
                type="text"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g. 2 hours, Since morning, Intermittent"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Contextual Factors & Triggers (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                'Poor Sleep / Late Night',
                'High Stress / Workload',
                'Skipped Meal / Dehydration',
                'Physical Overexertion',
                'Pre-Menstrual Window',
                'Weather / Heat'
              ].map(factor => (
                <button
                  key={factor}
                  type="button"
                  onClick={() => toggleFactor(factor)}
                  className={`px-3 py-1 rounded-pill text-xs transition-all ${
                    contextFactors.includes(factor)
                      ? 'bg-deep-sage text-butter-cream font-medium'
                      : 'bg-[#FAF8F2] border border-border-soft text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {factor}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Detailed Notes / Description
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional observations or thoughts..."
              className="w-full p-3 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage min-h-[70px] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingManual(false)}
              className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !symptomName.trim()}
              className="px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Symptom Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-card border border-border-soft shadow-soft">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symptoms, areas, descriptions..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-secondary font-medium shrink-0">Severity:</span>
          {['all', 'Mild', 'Moderate', 'Severe'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 text-xs rounded-pill capitalize transition-all ${
                filterSeverity === sev
                  ? 'bg-pale-sage text-deep-sage font-bold border border-botanical-green/40'
                  : 'bg-[#FAF8F2] text-text-secondary border border-border-soft'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Symptoms List */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-card bg-white border border-border-soft text-center shadow-soft">
          <Activity className="w-10 h-10 text-botanical-green mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-base font-bold text-deep-sage mb-1">
            No symptoms matching your filters
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Record a symptom manually or try speaking your symptoms in English, Hindi, Marathi, or Hinglish.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(sym => (
            <div
              key={sym.id}
              className="p-5 rounded-card bg-white border border-border-soft shadow-soft hover:shadow-soft-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-serif text-base font-bold text-deep-sage">{sym.symptom_name}</h3>
                    <p className="text-[11px] text-text-secondary font-mono mt-0.5">
                      {new Date(sym.date_time).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })} • {sym.duration || 'Ongoing'}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    sym.severity === 'Severe' ? 'bg-red-50 text-red-700 border border-red-200' :
                    sym.severity === 'Moderate' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-pale-sage text-deep-sage border border-botanical-green/30'
                  }`}>
                    {sym.severity}
                  </span>
                </div>

                <p className="text-xs text-text-primary leading-relaxed mt-2 bg-[#FAF8F2] p-3 rounded-xl border border-border-soft/60">
                  {sym.original_description}
                </p>

                {sym.contextual_factors?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {sym.contextual_factors.map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-butter-cream/60 border border-border-soft text-text-primary">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border-soft/60 flex items-center justify-between text-xs text-text-secondary">
                <span className="text-[10px] uppercase font-semibold text-text-secondary">
                  Area: {sym.body_area}
                </span>
                <button
                  onClick={() => handleDelete(sym.id, sym.symptom_name)}
                  className="text-red-700 hover:text-red-900 p-1 rounded-md"
                  title="Delete symptom record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
