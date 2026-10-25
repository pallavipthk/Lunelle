import React, { useState, useEffect } from 'react';
import { 
  HeartPulse, 
  Calendar, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Activity, 
  FileText, 
  Flower2, 
  Sparkles,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';
import { Symptom, CycleEntry, LabReport, VaultDocument } from '../types';

export const MyHealthPage: React.FC = () => {
  const { profile, updateProfile } = useAuth();
  const { showToast } = useNotifications();

  // Tab: Profile vs Timeline
  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'profile'>('timeline');

  // Timeline events state
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [reports, setReports] = useState<LabReport[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [allergies, setAllergies] = useState(profile?.allergies || '');
  const [medications, setMedications] = useState(profile?.medications || '');
  const [conditions, setConditions] = useState(profile?.conditions || '');
  const [observations, setObservations] = useState(profile?.observations || '');

  // Detail Modal
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  useEffect(() => {
    loadTimeline();
  }, []);

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const [symRes, cycRes, repRes, docRes] = await Promise.all([
        api.getSymptoms(),
        api.getCycleData(),
        api.getLabReports(),
        api.getVaultFiles()
      ]);

      setSymptoms(symRes.symptoms || []);
      setCycles(cycRes.cycles || []);
      setReports(repRes.reports || []);
      setDocuments(docRes.files || []);
    } catch (err) {
      console.error('Failed to load timeline records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        allergies,
        medications,
        conditions,
        observations
      });
      setIsEditingProfile(false);
      showToast('success', 'Profile Updated', 'Your medical summary details have been saved.');
    } catch (err) {
      showToast('error', 'Update Failed', 'Could not save profile changes.');
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this symptom entry?')) return;
    try {
      await api.deleteSymptom(id);
      showToast('success', 'Entry Deleted', 'Record removed from timeline.');
      setSelectedEvent(null);
      loadTimeline();
    } catch (err) {
      showToast('error', 'Delete Failed', 'Could not delete entry.');
    }
  };

  // Build unified chronological timeline
  interface TimelineItem {
    id: string;
    type: 'symptom' | 'cycle' | 'lab_report' | 'document';
    title: string;
    date: string;
    badge: string;
    description: string;
    details: any;
  }

  const timelineItems: TimelineItem[] = [
    ...symptoms.map(s => ({
      id: s.id,
      type: 'symptom' as const,
      title: s.symptom_name,
      date: s.date_time,
      badge: `${s.severity} Severity`,
      description: s.original_description,
      details: s
    })),
    ...cycles.map(c => ({
      id: c.id,
      type: 'cycle' as const,
      title: `Cycle Log (Day ${c.cycle_day})`,
      date: c.date,
      badge: `Flow: ${c.flow_level}`,
      description: `Cramps: ${c.cramps_severity} • Mood: ${c.mood || 'Normal'}`,
      details: c
    })),
    ...reports.map(r => ({
      id: r.id,
      type: 'lab_report' as const,
      title: r.title,
      date: r.report_date,
      badge: r.lab_name,
      description: r.items?.length ? `${r.items.length} investigation tests itemized` : 'Laboratory investigation report',
      details: r
    })),
    ...documents.map(d => ({
      id: d.id,
      type: 'document' as const,
      title: d.title,
      date: d.document_date,
      badge: d.category,
      description: `${d.file_name} (${(d.file_size / 1024).toFixed(1)} KB)`,
      details: d
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Apply filters & search
  const filteredTimeline = timelineItems.filter(item => {
    if (selectedCategory !== 'all' && item.type !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-soft">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
            My Health & Timeline
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
            Your centralized health profile and chronological personal ledger.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex rounded-pill bg-white p-1 border border-border-soft shadow-xs">
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              activeSubTab === 'timeline'
                ? 'bg-deep-sage text-butter-cream shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Whole-Health Timeline
          </button>
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-pill transition-all ${
              activeSubTab === 'profile'
                ? 'bg-deep-sage text-butter-cream shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Health Profile & Allergies
          </button>
        </div>
      </div>

      {/* VIEW 1: WHOLE-HEALTH TIMELINE */}
      {activeSubTab === 'timeline' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-card border border-border-soft shadow-soft">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events, symptoms, reports..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-text-secondary font-medium shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All Records' },
                { id: 'symptom', label: 'Symptoms' },
                { id: 'cycle', label: 'Cycle' },
                { id: 'lab_report', label: 'Lab Reports' },
                { id: 'document', label: 'Vault Docs' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 text-xs rounded-pill whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-pale-sage text-deep-sage font-bold border border-botanical-green/40'
                      : 'bg-[#FAF8F2] text-text-secondary hover:text-text-primary border border-border-soft'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Feed */}
          {filteredTimeline.length === 0 ? (
            <div className="p-12 rounded-card bg-white border border-border-soft text-center shadow-soft">
              <HeartPulse className="w-10 h-10 text-botanical-green mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-base font-bold text-deep-sage mb-1">
                No matching timeline entries
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
                Start tracking your symptoms or upload laboratory reports to construct your chronological health story.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-soft">
              {filteredTimeline.map(item => (
                <div
                  key={`${item.type}_${item.id}`}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedEvent(item)}
                >
                  {/* Timeline dot icon */}
                  <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-white border-2 border-deep-sage flex items-center justify-center shadow-sm">
                    {item.type === 'symptom' && <Activity className="w-3 h-3 text-deep-sage" />}
                    {item.type === 'cycle' && <Flower2 className="w-3 h-3 text-muted-rose" />}
                    {item.type === 'lab_report' && <FileText className="w-3 h-3 text-botanical-green" />}
                    {item.type === 'document' && <ShieldCheck className="w-3 h-3 text-deep-sage" />}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 rounded-card bg-white border border-border-soft shadow-soft hover:shadow-soft-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF8F2] border border-border-soft font-semibold text-text-secondary">
                          {item.badge}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-secondary font-mono">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PERSONAL HEALTH PROFILE */}
      {activeSubTab === 'profile' && (
        <div className="bg-white p-6 sm:p-8 rounded-card-lg border border-border-soft shadow-soft max-w-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-border-soft mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-deep-sage">Personal Health Summary</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Information entered and confirmed by you. AI systems reference this only with your explicit permission.
              </p>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill bg-pale-sage/60 text-deep-sage text-xs font-semibold hover:bg-pale-sage"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Confirmed Allergies
                </label>
                <input
                  type="text"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs (or None)"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Current Medications & Supplements
                </label>
                <textarea
                  value={medications}
                  onChange={e => setMedications(e.target.value)}
                  placeholder="e.g. Levothyroxine 50mcg, Vitamin D3 weekly, Iron supplement"
                  className="w-full p-3 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage min-h-[70px] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Relevant Diagnosed Health Conditions
                </label>
                <input
                  type="text"
                  value={conditions}
                  onChange={e => setConditions(e.target.value)}
                  placeholder="e.g. Hypothyroidism, PCOS, Mild Asthma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1">
                  Important Personal Health Observations / Notes
                </label>
                <textarea
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Any baseline details you want documented in your records..."
                  className="w-full p-3 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage min-h-[70px] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-soft">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Confirmed Allergies
                </span>
                <p className="text-xs font-medium text-text-primary">
                  {profile?.allergies || 'No allergies recorded'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Current Medications & Supplements
                </span>
                <p className="text-xs font-medium text-text-primary whitespace-pre-line">
                  {profile?.medications || 'No medications recorded'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Diagnosed Conditions
                </span>
                <p className="text-xs font-medium text-text-primary">
                  {profile?.conditions || 'No diagnosed conditions reported'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAF8F2] border border-border-soft">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                  Personal Observations
                </span>
                <p className="text-xs font-medium text-text-primary leading-relaxed">
                  {profile?.observations || 'No personal baseline notes added yet'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm">
          <div className="bg-white rounded-card-lg shadow-soft-lg w-full max-w-md p-6 border border-border-soft">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-muted-rose tracking-wider">
                  {selectedEvent.type.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="font-serif text-lg font-bold text-deep-sage">
                {selectedEvent.title}
              </h3>
              <p className="text-[11px] text-text-secondary font-mono">
                Date: {selectedEvent.date}
              </p>

              <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-border-soft text-xs text-text-primary leading-relaxed">
                {selectedEvent.description}
              </div>

              {selectedEvent.details?.notes && (
                <div className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Notes: </span>
                  {selectedEvent.details.notes}
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-border-soft flex items-center justify-between">
              {selectedEvent.type === 'symptom' && (
                <button
                  onClick={() => handleDeleteSymptom(selectedEvent.id)}
                  className="flex items-center gap-1.5 text-xs text-red-700 hover:text-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              )}
              <div className="ml-auto">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-1.5 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
