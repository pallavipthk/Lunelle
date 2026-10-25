import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Mic, 
  Plus, 
  Activity, 
  FileText, 
  Bell, 
  Flower2, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Symptom, Reminder, LabReport, ExplainableInsight, CycleEntry } from '../types';
import { NavTab } from '../components/Navigation';

interface DashboardOverviewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenVoiceModal: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigate,
  onOpenVoiceModal
}) => {
  const { profile } = useAuth();

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [insights, setInsights] = useState<ExplainableInsight[]>([]);
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [cycleEstimates, setCycleEstimates] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick check-in state
  const [quickEnergy, setQuickEnergy] = useState<'normal' | 'low' | 'high'>('normal');
  const [quickNote, setQuickNote] = useState('');
  const [isCheckInSaved, setIsCheckInSaved] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [symRes, remRes, repRes, insRes, cycRes] = await Promise.all([
        api.getSymptoms(),
        api.getReminders(),
        api.getLabReports(),
        api.getInsights(),
        api.getCycleData()
      ]);

      setSymptoms(symRes.symptoms || []);
      setReminders(remRes.reminders || []);
      setLabReports(repRes.reports || []);
      setInsights(insRes.insights || []);
      setCycles(cycRes.cycles || []);
      setCycleEstimates(cycRes.estimates);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;

    try {
      await api.addSymptom({
        symptom_name: `Daily Health Note: ${quickEnergy.toUpperCase()} Energy`,
        original_description: quickNote.trim(),
        severity: 'Mild',
        notes: `Quick check-in logged via Overview. Energy level: ${quickEnergy}.`,
        confirmation_status: 'confirmed'
      });
      setIsCheckInSaved(true);
      setQuickNote('');
      loadDashboardData();
      setTimeout(() => setIsCheckInSaved(false), 4000);
    } catch (err) {
      console.error('Failed to submit check-in:', err);
    }
  };

  const name = profile?.preferred_name || 'Friend';

  return (
    <div className="space-y-8 animate-fade-in text-left font-cute">
      {/* 1. Greeting & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E9E6DD]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B77D78] uppercase tracking-wider mb-1">
            <span>🌸</span>
            <span>A little more in tune with you</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#345344] tracking-tight">
            Good day, {name} ♡
          </h1>
          <p className="text-xs sm:text-sm text-[#778078] mt-1 font-soft">
            Your private health sanctuary is peaceful, secure, and up to date.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#DFE8DA]/60 text-[#345344] text-xs font-bold hover:bg-[#DFE8DA] transition-all shadow-xs border border-[#A9BFA6]/40 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice / Hinglish Log</span>
          </button>
          <button
            onClick={() => onNavigate('symptoms')}
            className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-b from-[#3D6250] to-[#2B4438] text-[#F6EACB] text-xs font-bold hover:shadow-md transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Symptom</span>
          </button>
        </div>
      </div>

      {/* 2. Top Grid: Daily Check-in & Women's Health Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Quick Check-in Card */}
        <div className="p-6 rounded-[24px] bg-white border-2 border-[#E9E6DD] shadow-[0_6px_20px_rgba(52,83,68,0.05)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-botanical-green" />
                Daily Health Check-in
              </span>
              <span className="text-[10px] text-text-secondary font-mono">Today</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              How are you feeling right now? Record a quick observation in seconds.
            </p>

            {isCheckInSaved ? (
              <div className="p-3 rounded-xl bg-pale-sage/50 border border-botanical-green/40 text-deep-sage text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-deep-sage" />
                <span>Your daily observation was recorded in your health timeline.</span>
              </div>
            ) : (
              <form onSubmit={handleQuickCheckIn} className="space-y-3">
                <div className="flex rounded-lg bg-[#FAF8F2] p-1 border border-border-soft">
                  {(['low', 'normal', 'high'] as const).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setQuickEnergy(lvl)}
                      className={`flex-1 py-1 text-[11px] font-semibold capitalize rounded-md transition-all ${
                        quickEnergy === lvl ? 'bg-white text-deep-sage shadow-xs' : 'text-text-secondary'
                      }`}
                    >
                      {lvl} Energy
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={quickNote}
                  onChange={e => setQuickNote(e.target.value)}
                  placeholder="e.g. Mild lower back tension, good appetite..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                />
                <button
                  type="submit"
                  disabled={!quickNote.trim()}
                  className="w-full py-1.5 px-3 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 disabled:opacity-40 transition-all"
                >
                  Save Check-in
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Women's Health Summary Widget (Shown when enabled) */}
        {profile?.cycle_tracking_enabled ? (
          <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
                  <Flower2 className="w-4 h-4 text-muted-rose" />
                  Cycle Overview
                </span>
                <button
                  onClick={() => onNavigate('womens-health')}
                  className="text-[11px] text-muted-rose hover:underline font-semibold"
                >
                  Open Tracker
                </button>
              </div>

              {cycles.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#FAF8F2] border border-border-soft">
                    <p className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
                      Latest Recorded Cycle Day
                    </p>
                    <p className="font-serif text-xl font-bold text-deep-sage mt-0.5">
                      Cycle Day {cycles[0].cycle_day}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      Flow: <span className="capitalize font-medium text-text-primary">{cycles[0].flow_level}</span> • Cramps: <span className="capitalize font-medium text-text-primary">{cycles[0].cramps_severity}</span>
                    </p>
                  </div>

                  {cycleEstimates?.estimatedNextPeriod && (
                    <div className="text-xs text-text-secondary">
                      <span className="font-semibold text-text-primary">Next Estimated Period: </span>
                      {new Date(cycleEstimates.estimatedNextPeriod).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      <p className="text-[10px] text-text-secondary mt-0.5 italic">
                        {cycleEstimates.disclaimer}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-text-secondary leading-relaxed">
                    No cycle dates recorded yet. Log your period dates to view mathematical cycle estimates.
                  </p>
                  <button
                    onClick={() => onNavigate('womens-health')}
                    className="mt-3 text-xs font-semibold text-deep-sage underline"
                  >
                    Log First Cycle Entry
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border-soft/60 flex items-center justify-between text-[11px] text-text-secondary">
              <span>Average length: {cycleEstimates?.averageCycleLengthDays || 28} days</span>
              <span className="text-botanical-green font-medium">Tracking Active</span>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
                  <Flower2 className="w-4 h-4 text-text-secondary" />
                  Cycle Tracking
                </span>
                <span className="text-[10px] bg-pale-sage px-2 py-0.5 rounded text-deep-sage">Optional</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Cycle tracking is currently disabled. Lunelle adapts completely to your life stage and tracking choices.
              </p>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="mt-4 text-xs font-semibold text-deep-sage hover:underline text-left"
            >
              Configure in Settings →
            </button>
          </div>
        )}

        {/* AI Health Companion Shortcut */}
        <div className="p-6 rounded-card bg-[#F6EACB]/40 border border-butter-cream shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-deep-sage text-butter-cream">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-deep-sage">AI Health Assistant</h3>
                <p className="text-[10px] text-text-secondary">Connected to your saved records</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              Ask questions about past headaches, clarify lab report terms, or review symptoms in English, Hindi, Marathi, or Hinglish.
            </p>
            <div className="space-y-1.5">
              <button
                onClick={() => onNavigate('assistant')}
                className="w-full text-left text-xs p-2 rounded-lg bg-white/80 hover:bg-white text-text-primary transition-colors border border-border-soft truncate"
              >
                “When did I last record a headache?”
              </button>
              <button
                onClick={() => onNavigate('assistant')}
                className="w-full text-left text-xs p-2 rounded-lg bg-white/80 hover:bg-white text-text-primary transition-colors border border-border-soft truncate"
              >
                “What does my latest lab report indicate?”
              </button>
            </div>
          </div>
          <button
            onClick={() => onNavigate('assistant')}
            className="mt-4 flex items-center justify-between text-xs font-semibold text-deep-sage hover:underline"
          >
            <span>Open AI Assistant</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Middle Grid: Recent Health Entries & Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Health Entries */}
        <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-border-soft mb-4">
            <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-botanical-green" />
              Recent Health Entries
            </span>
            <button
              onClick={() => onNavigate('my-health')}
              className="text-xs text-deep-sage font-semibold hover:underline"
            >
              View All Timeline ({symptoms.length})
            </button>
          </div>

          {symptoms.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-text-secondary">No health symptoms recorded yet.</p>
              <button
                onClick={() => onNavigate('symptoms')}
                className="mt-2 text-xs font-semibold text-deep-sage underline"
              >
                Log your first symptom
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {symptoms.slice(0, 4).map(sym => (
                <div key={sym.id} className="p-3 rounded-xl bg-[#FAF8F2] border border-border-soft flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-text-primary">{sym.symptom_name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        sym.severity === 'Severe' ? 'bg-red-50 text-red-700' :
                        sym.severity === 'Moderate' ? 'bg-amber-50 text-amber-800' :
                        'bg-pale-sage text-deep-sage'
                      }`}>
                        {sym.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                      {sym.original_description}
                    </p>
                  </div>
                  <span className="text-[10px] text-text-secondary shrink-0 font-mono">
                    {sym.date_time.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-border-soft mb-4">
            <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-deep-sage" />
              Reminders & Preventive Tasks
            </span>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs text-deep-sage font-semibold hover:underline"
            >
              Manage ({reminders.length})
            </button>
          </div>

          {reminders.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-text-secondary">No active reminders configured.</p>
              <button
                onClick={() => onNavigate('reminders')}
                className="mt-2 text-xs font-semibold text-deep-sage underline"
              >
                Add medication or appointment reminder
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {reminders.slice(0, 4).map(rem => (
                <div key={rem.id} className="p-3 rounded-xl bg-[#FAF8F2] border border-border-soft flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={async () => {
                        await api.toggleReminder(rem.id);
                        loadDashboardData();
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        rem.is_completed ? 'bg-deep-sage border-deep-sage text-butter-cream' : 'border-border-soft bg-white'
                      }`}
                      aria-label="Toggle reminder complete"
                    >
                      {rem.is_completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <p className={`text-xs font-semibold ${rem.is_completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                        {rem.title}
                      </p>
                      <p className="text-[10px] text-text-secondary capitalize">
                        {rem.category} • {rem.schedule_time} ({rem.repeat_interval})
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
                    rem.is_completed ? 'bg-pale-sage text-deep-sage' : 'bg-butter-cream text-text-primary'
                  }`}>
                    {rem.is_completed ? 'Done' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Explainable Insights Section (When data exists) */}
      <div className="p-6 rounded-card bg-white border border-border-soft shadow-soft">
        <div className="flex items-center justify-between pb-4 border-b border-border-soft mb-4">
          <div>
            <span className="text-xs font-bold text-deep-sage flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-botanical-green" />
              Explainable Health Patterns
            </span>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Transparent correlations calculated directly from your logged history.
            </p>
          </div>
          <button
            onClick={() => onNavigate('insights')}
            className="text-xs text-deep-sage font-semibold hover:underline"
          >
            Explore Insights ({insights.length})
          </button>
        </div>

        {insights.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#FAF8F2] border border-border-soft text-center">
            <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
              Lunelle only computes health insights when sufficient recorded data exists (e.g. repeated headache logs or cycle correlations). Log symptoms over a few days to unlock explainable patterns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map(ins => (
              <div key={ins.id} className="p-4 rounded-xl bg-[#FAF8F2] border border-botanical-green/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-text-secondary mb-1.5">
                    <span className="font-semibold text-deep-sage">{ins.analysisPeriod}</span>
                    <span>{ins.supportingRecordCount} supporting entries</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-deep-sage mb-1">{ins.title}</h4>
                  <p className="text-xs text-text-primary leading-relaxed mb-3">
                    {ins.plainLanguageExplanation}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/90 border border-border-soft text-[10px] text-text-secondary italic">
                  {ins.uncertaintyDisclaimer}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
