import React, { useState, useEffect } from 'react';
import { 
  Flower2, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Sparkles, 
  Info, 
  BookOpen, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';
import { CycleEntry } from '../types';

export const WomensHealthPage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  const [activeModule, setActiveModule] = useState<'cycle' | 'pcos' | 'perimenopause' | 'education'>('cycle');
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [estimates, setEstimates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New cycle log form state
  const [isLoggingCycle, setIsLoggingCycle] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cycleDay, setCycleDay] = useState(1);
  const [flowLevel, setFlowLevel] = useState<'none' | 'spotting' | 'light' | 'medium' | 'heavy'>('medium');
  const [crampsSeverity, setCrampsSeverity] = useState<'none' | 'mild' | 'moderate' | 'severe'>('mild');
  const [mood, setMood] = useState('Calm');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'normal' | 'high'>('normal');
  const [notes, setNotes] = useState('');

  // PCOS specific tracking state
  const [pcosBreakouts, setPcosBreakouts] = useState(false);
  const [pcosHirsutism, setPcosHirsutism] = useState(false);
  const [pcosWeightShift, setPcosWeightShift] = useState(false);

  // Perimenopause state
  const [hotFlashes, setHotFlashes] = useState(false);
  const [nightSweats, setNightSweats] = useState(false);

  useEffect(() => {
    loadCycleData();
  }, []);

  const loadCycleData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCycleData();
      setCycles(res.cycles || []);
      setEstimates(res.estimates);
    } catch (err) {
      console.error('Failed to load cycle data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCycleEntry({
        date,
        cycle_day: Number(cycleDay),
        flow_level: flowLevel,
        cramps_severity: crampsSeverity,
        mood,
        energy_level: energyLevel,
        notes
      });
      showToast('success', 'Cycle Logged', 'Entry recorded in your cycle ledger.');
      setIsLoggingCycle(false);
      loadCycleData();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to save cycle entry.');
    }
  };

  const handleDeleteCycle = async (id: string) => {
    if (!window.confirm('Delete this cycle record?')) return;
    try {
      await api.deleteCycleEntry(id);
      showToast('success', 'Deleted', 'Cycle entry removed.');
      loadCycleData();
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete entry.');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-soft">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
            Women's Health Center
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
            Inclusive, personalized modules supporting cycle awareness, PCOS, perimenopause, and reproductive health.
          </p>
        </div>

        {/* Module Selector Pill */}
        <div className="flex flex-wrap gap-1 rounded-pill bg-white p-1 border border-border-soft shadow-xs">
          <button
            onClick={() => setActiveModule('cycle')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              activeModule === 'cycle'
                ? 'bg-deep-sage text-butter-cream shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Menstrual & Cycle
          </button>
          <button
            onClick={() => setActiveModule('pcos')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              activeModule === 'pcos'
                ? 'bg-deep-sage text-butter-cream shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            PCOS Support
          </button>
          <button
            onClick={() => setActiveModule('perimenopause')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              activeModule === 'perimenopause'
                ? 'bg-deep-sage text-butter-cream shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Perimenopause
          </button>
          <button
            onClick={() => setActiveModule('education')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              activeModule === 'education'
                ? 'bg-deep-sage text-butter-cream shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Reproductive Health
          </button>
        </div>
      </div>

      {/* MODULE 1: MENSTRUAL & CYCLE TRACKING */}
      {activeModule === 'cycle' && (
        <div className="space-y-6">
          {/* Top Projection Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                Estimated Next Period
              </span>
              <p className="font-serif text-2xl font-bold text-deep-sage">
                {estimates?.estimatedNextPeriod
                  ? new Date(estimates.estimatedNextPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Needs 2+ cycles'}
              </p>
              <p className="text-[10px] text-text-secondary mt-1 leading-relaxed italic">
                {estimates?.disclaimer || 'Projections calculate automatically after logging period starts.'}
              </p>
            </div>

            <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                Average Cycle Length
              </span>
              <p className="font-serif text-2xl font-bold text-deep-sage">
                {estimates?.averageCycleLengthDays || 28} Days
              </p>
              <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                Calculated from verified start-date intervals in your personal logs.
              </p>
            </div>

            <div className="p-6 rounded-card bg-[#F4F7F2] border border-botanical-green/40 shadow-soft flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-deep-sage block mb-1">
                  Log Cycle Event
                </span>
                <p className="text-xs text-text-secondary">
                  Record period start/end, flow intensity, and cramping severity.
                </p>
              </div>
              <button
                onClick={() => setIsLoggingCycle(!isLoggingCycle)}
                className="mt-3 flex items-center justify-center gap-1.5 py-2 px-4 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isLoggingCycle ? 'Close Form' : 'Log Cycle Day'}</span>
              </button>
            </div>
          </div>

          {/* Cycle Form */}
          {isLoggingCycle && (
            <form onSubmit={handleSaveCycle} className="p-6 rounded-card bg-white border border-border-soft shadow-soft space-y-4 max-w-2xl">
              <h3 className="font-serif text-base font-bold text-deep-sage">
                Record Menstrual Cycle Observation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Cycle Day (Optional)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={cycleDay}
                    onChange={e => setCycleDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Flow Intensity</label>
                  <select
                    value={flowLevel}
                    onChange={e => setFlowLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                  >
                    <option value="none">None (Non-bleeding day)</option>
                    <option value="spotting">Spotting (Trace)</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1">Cramping Severity</label>
                  <select
                    value={crampsSeverity}
                    onChange={e => setCrampsSeverity(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                  >
                    <option value="none">None</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">Mood & Energy Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Mild headache, craving dark chocolate, high focus..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLoggingCycle(false)}
                  className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          {/* Cycle History Ledger */}
          <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
            <h3 className="font-serif text-base font-bold text-deep-sage mb-4">
              Recorded Cycle History
            </h3>

            {cycles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-text-secondary">No cycle entries saved yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cycles.map(cyc => (
                  <div key={cyc.id} className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">
                          Cycle Day {cyc.cycle_day}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-border-soft text-text-secondary capitalize">
                          Flow: {cyc.flow_level}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-border-soft text-text-secondary capitalize">
                          Cramps: {cyc.cramps_severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1">
                        {cyc.date} {cyc.notes && `• ${cyc.notes}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteCycle(cyc.id)}
                      className="text-text-secondary hover:text-red-700 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 2: PCOS SUPPORT & EDUCATION */}
      {activeModule === 'pcos' && (
        <div className="space-y-6">
          <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-pale-sage text-deep-sage">
                <Flower2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-deep-sage">Understanding PCOS</h3>
                <p className="text-xs text-text-secondary leading-relaxed mt-1">
                  Polycystic Ovary Syndrome (PCOS) is a common endocrine condition involving hormonal shifts that can affect ovulatory regularity, skin, hair, and metabolic wellness.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-butter-cream/50 border border-amber-200 text-xs text-text-primary leading-relaxed mb-6">
              <strong className="block mb-1 text-amber-950 font-bold">Important Clinical Boundary:</strong>
              Lunelle does not diagnose PCOS. Symptom tracking helps you collect objective observations to share with your endocrinologist or gynecologist for verified ultrasound and hormonal evaluation.
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">
              Optional PCOS Observation Checklist
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-border-soft hover:bg-[#FAF8F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={pcosBreakouts}
                  onChange={e => setPcosBreakouts(e.target.checked)}
                  className="accent-deep-sage"
                />
                <div>
                  <span className="text-xs font-bold text-text-primary">Hormonal Acne / Breakouts</span>
                  <p className="text-[11px] text-text-secondary">Noticed flare-ups along jawline or chin</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-border-soft hover:bg-[#FAF8F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={pcosHirsutism}
                  onChange={e => setPcosHirsutism(e.target.checked)}
                  className="accent-deep-sage"
                />
                <div>
                  <span className="text-xs font-bold text-text-primary">Excess Hair Growth or Thinning</span>
                  <p className="text-[11px] text-text-secondary">Changes in facial hair patterns or scalp thinning</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-border-soft hover:bg-[#FAF8F2] cursor-pointer">
                <input
                  type="checkbox"
                  checked={pcosWeightShift}
                  onChange={e => setPcosWeightShift(e.target.checked)}
                  className="accent-deep-sage"
                />
                <div>
                  <span className="text-xs font-bold text-text-primary">Insulin Resistance / Energy Slumps</span>
                  <p className="text-[11px] text-text-secondary">Pronounced tiredness after meals or sugar cravings</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 3: PERIMENOPAUSE & MENOPAUSE */}
      {activeModule === 'perimenopause' && (
        <div className="space-y-6">
          <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
            <h3 className="font-serif text-lg font-bold text-deep-sage mb-2">
              Perimenopause & Menopause Guidance
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Perimenopause represents the natural biological transition leading up to menopause. Fluctuating estrogen levels can present as vasomotor shifts, sleep changes, and cycle alterations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <h4 className="text-xs font-bold text-deep-sage mb-1">Vasomotor Shifts</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Hot flashes and night sweats caused by changes in the brain’s thermoregulatory center.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <h4 className="text-xs font-bold text-deep-sage mb-1">Sleep Architecture</h4>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Early waking or restless sleep linked to hormonal transitions.
                </p>
              </div>
            </div>

            <p className="text-xs text-text-secondary italic">
              Use the Symptom Tracker to record hot flashes and night sweats; they will be correlated in your Health Insights tab.
            </p>
          </div>
        </div>
      )}

      {/* MODULE 4: REPRODUCTIVE HEALTH EDUCATION */}
      {activeModule === 'education' && (
        <div className="space-y-6">
          <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft space-y-4">
            <h3 className="font-serif text-lg font-bold text-deep-sage">
              Reproductive Health Information
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Evidence-based educational summaries covering cervical health, pelvic wellness, and preventive screenings.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <h4 className="text-xs font-bold text-deep-sage">Cervical Health & Pap Screening</h4>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  Routine cervical cytology (Pap smear) and HPV testing are recommended every 3 to 5 years for women aged 21 to 65 to screen for pre-cancerous cellular changes.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <h4 className="text-xs font-bold text-deep-sage">Breast Health Awareness</h4>
                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                  Familiarity with your baseline breast tissue helps detect changes early. Discuss age-appropriate mammography schedules with your physician.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
