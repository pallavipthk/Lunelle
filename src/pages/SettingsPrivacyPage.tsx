import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Download, 
  Trash2, 
  User, 
  Globe, 
  MessageSquare, 
  Lock, 
  LogOut,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { api } from '../api';

export const SettingsPrivacyPage: React.FC = () => {
  const { user, profile, updateProfile, logout } = useAuth();
  const { showToast } = useNotifications();

  const [preferredName, setPreferredName] = useState(profile?.preferred_name || '');
  const [language, setLanguage] = useState<'en' | 'hi' | 'mr'>(profile?.preferred_language || 'en');
  const [commStyle, setCommStyle] = useState<'simple' | 'detailed' | 'conversational'>(profile?.communication_style || 'simple');
  const [cycleEnabled, setCycleEnabled] = useState(profile?.cycle_tracking_enabled ?? true);
  const [pcosEnabled, setPcosEnabled] = useState(profile?.pcos_module_enabled ?? false);
  const [periEnabled, setPeriEnabled] = useState(profile?.perimenopause_module_enabled ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        preferred_name: preferredName.trim(),
        preferred_language: language,
        communication_style: commStyle,
        cycle_tracking_enabled: cycleEnabled,
        pcos_module_enabled: pcosEnabled,
        perimenopause_module_enabled: periEnabled
      });
      showToast('success', 'Settings Updated', 'Your preferences have been saved.');
    } catch (err) {
      showToast('error', 'Error', 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    window.open(api.getExportUrl(), '_blank');
    showToast('info', 'Export Started', 'Your complete personal health data package is downloading.');
  };

  const handleDeleteAllRecords = async () => {
    if (!window.confirm('WARNING: Are you sure you want to permanently erase ALL your health records (symptoms, cycle entries, lab reports, and documents)? This cannot be undone.')) {
      return;
    }
    try {
      await api.deleteAllHealthRecords();
      showToast('success', 'Records Erased', 'All your health data has been permanently deleted from storage.');
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete records.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('To confirm permanent deletion of your Lunelle account and all data, type "DELETE":');
    if (confirmation !== 'DELETE') return;

    try {
      await api.deleteAccount();
      logout();
      showToast('info', 'Account Deleted', 'Your account and data have been completely removed.');
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete account.');
    }
  };

  return (
    <div className="max-w-3xl space-y-8 text-left animate-fade-in pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-border-soft">
        <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
          Settings & Privacy Controls
        </h1>
        <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
          Manage your account, language preferences, active modules, and complete data autonomy.
        </p>
      </div>

      {/* Profile & Language Settings Form */}
      <form onSubmit={handleSavePreferences} className="bg-white p-6 sm:p-8 rounded-card-lg border border-border-soft shadow-soft space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border-soft">
          <User className="w-5 h-5 text-deep-sage" />
          <h2 className="font-serif text-lg font-bold text-deep-sage">Profile & Experience</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Preferred Name / Call Name
            </label>
            <input
              type="text"
              value={preferredName}
              onChange={e => setPreferredName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Account Email (Private)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FAF8F2] text-text-secondary cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Primary Language
            </label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi / Hinglish)</option>
              <option value="mr">मराठी (Marathi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Health Explanation Style
            </label>
            <select
              value={commStyle}
              onChange={e => setCommStyle(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
            >
              <option value="simple">Simple & Direct (Minimal medical jargon)</option>
              <option value="detailed">Comprehensive & Clinical</option>
              <option value="conversational">Warm & Conversational</option>
            </select>
          </div>
        </div>

        {/* Optional Modules Toggles */}
        <div className="pt-4 border-t border-border-soft space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary mb-2">
            Active Health Modules
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-soft hover:bg-[#FAF8F2] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-text-primary">Menstrual & Cycle Tracking</span>
              <p className="text-[11px] text-text-secondary">Shows cycle predictions and flow logs on your dashboard</p>
            </div>
            <input
              type="checkbox"
              checked={cycleEnabled}
              onChange={e => setCycleEnabled(e.target.checked)}
              className="accent-deep-sage w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-soft hover:bg-[#FAF8F2] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-text-primary">PCOS Tracking & Education</span>
              <p className="text-[11px] text-text-secondary">Includes acne, hirsutism, and hormonal shift observations</p>
            </div>
            <input
              type="checkbox"
              checked={pcosEnabled}
              onChange={e => setPcosEnabled(e.target.checked)}
              className="accent-deep-sage w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-border-soft hover:bg-[#FAF8F2] cursor-pointer">
            <div>
              <span className="text-xs font-bold text-text-primary">Perimenopause & Menopause Module</span>
              <p className="text-[11px] text-text-secondary">Includes hot flashes, sleep shifts, and vasomotor tracking</p>
            </div>
            <input
              type="checkbox"
              checked={periEnabled}
              onChange={e => setPeriEnabled(e.target.checked)}
              className="accent-deep-sage w-4 h-4"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>

      {/* Data Export & Autonomous Privacy */}
      <div className="bg-white p-6 sm:p-8 rounded-card-lg border border-border-soft shadow-soft space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border-soft">
          <Lock className="w-5 h-5 text-deep-sage" />
          <h2 className="font-serif text-lg font-bold text-deep-sage">Data Export & Autonomous Deletion</h2>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-[#FAF8F2] border border-border-soft gap-3">
            <div>
              <h3 className="text-xs font-bold text-text-primary">Download Complete Health Archive</h3>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Export all your symptoms, lab results, cycle logs, and reminder data in open JSON format.
              </p>
            </div>
            <button
              onClick={handleExportData}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-pill bg-white border border-border-soft text-text-primary hover:bg-pale-sage/40 text-xs font-semibold shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-deep-sage" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-red-50/50 border border-red-200 gap-3">
            <div>
              <h3 className="text-xs font-bold text-red-900">Erase All Health Records</h3>
              <p className="text-[11px] text-red-800/80 mt-0.5">
                Permanently wipes all symptoms, lab reports, and cycle logs while keeping your account login.
              </p>
            </div>
            <button
              onClick={handleDeleteAllRecords}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-pill bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Erase Health Data</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-red-100/60 border border-red-300 gap-3">
            <div>
              <h3 className="text-xs font-bold text-red-950">Delete Account & Permanent Purge</h3>
              <p className="text-[11px] text-red-900/90 mt-0.5">
                Permanently destroys your user account, login credentials, and all associated medical files.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-pill bg-red-700 text-white hover:bg-red-800 text-xs font-semibold shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
