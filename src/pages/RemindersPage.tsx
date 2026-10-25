import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Pill, 
  Calendar, 
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { api } from '../api';
import { Reminder } from '../types';
import { useNotifications } from '../context/NotificationContext';

export const RemindersPage: React.FC = () => {
  const { showToast, requestBrowserNotificationPermission, sendBrowserNotification } = useNotifications();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // New Reminder form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'medication' | 'appointment' | 'preventive' | 'cycle' | 'task'>('medication');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [repeatInterval, setRepeatInterval] = useState<'daily' | 'weekly' | 'monthly' | 'once'>('daily');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getReminders();
      setReminders(res.reminders || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await api.addReminder({
        title: title.trim(),
        category,
        schedule_time: scheduleTime,
        repeat_interval: repeatInterval,
        notes
      });

      showToast('success', 'Reminder Scheduled', `Reminder for "${title}" created.`);
      setIsAdding(false);
      setTitle('');
      setNotes('');
      loadReminders();
    } catch (err: any) {
      showToast('error', 'Error', err.message || 'Failed to create reminder.');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleReminder(id);
      loadReminders();
    } catch (err) {
      showToast('error', 'Error', 'Failed to update reminder.');
    }
  };

  const handleDelete = async (id: string, remTitle: string) => {
    if (!window.confirm(`Delete reminder "${remTitle}"?`)) return;
    try {
      await api.deleteReminder(id);
      showToast('success', 'Deleted', 'Reminder deleted.');
      loadReminders();
    } catch (err) {
      showToast('error', 'Error', 'Failed to delete reminder.');
    }
  };

  const handleTestNotification = async () => {
    const permission = await requestBrowserNotificationPermission();
    if (permission === 'granted') {
      sendBrowserNotification('Lunelle Reminder Alert', {
        body: 'This is a test notification for your health schedule.'
      });
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-soft">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-sage tracking-tight">
            Reminders & Preventive Tasks
          </h1>
          <p className="text-xs text-text-secondary mt-1 font-accent italic text-base">
            Private, user-controlled reminders for medications, clinical visits, and routine preventive care.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleTestNotification}
            className="px-3.5 py-1.5 rounded-pill bg-white border border-border-soft text-text-secondary hover:text-text-primary text-xs font-semibold shadow-xs"
          >
            Enable Browser Alerts
          </button>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'New Reminder'}</span>
          </button>
        </div>
      </div>

      {/* Add Reminder Modal / Inline Form */}
      {isAdding && (
        <form onSubmit={handleCreateReminder} className="p-6 rounded-card bg-white border border-border-soft shadow-soft space-y-4 max-w-xl">
          <h3 className="font-serif text-base font-bold text-deep-sage">
            Create Schedule Reminder
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-text-primary mb-1">
                Reminder Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Levothyroxine 50mcg, Annual Pap Smear, Hydration"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              >
                <option value="medication">Medication Schedule</option>
                <option value="appointment">Doctor Appointment</option>
                <option value="preventive">Preventive Screening</option>
                <option value="cycle">Cycle Reminder</option>
                <option value="task">General Health Task</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Schedule Time</label>
              <input
                type="time"
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Repeat Interval</label>
              <select
                value={repeatInterval}
                onChange={e => setRepeatInterval(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="once">One-time only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary mb-1">Optional Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Take on empty stomach with water"
                className="w-full px-3 py-2 text-xs rounded-xl border border-border-soft bg-[#FFFEFC] focus:border-deep-sage"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-pill border border-border-soft text-text-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold hover:bg-deep-sage/90"
            >
              Save Schedule
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="p-12 rounded-card bg-white border border-border-soft text-center shadow-soft">
          <Bell className="w-10 h-10 text-botanical-green mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-base font-bold text-deep-sage mb-1">
            No active reminders
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            Create reminders for daily prescribed supplements, cycle phases, or upcoming medical appointments.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map(rem => (
            <div
              key={rem.id}
              className={`p-5 rounded-card border shadow-soft transition-all flex items-start justify-between gap-3 ${
                rem.is_completed ? 'bg-[#FAF8F2] border-border-soft opacity-70' : 'bg-white border-border-soft'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(rem.id)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                    rem.is_completed
                      ? 'bg-deep-sage border-deep-sage text-butter-cream'
                      : 'border-border-soft bg-[#FFFEFC] hover:border-deep-sage'
                  }`}
                  aria-label="Toggle reminder completion"
                >
                  {rem.is_completed && <CheckCircle2 className="w-4 h-4" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className={`font-serif text-sm font-bold ${rem.is_completed ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
                      {rem.title}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pale-sage text-deep-sage uppercase tracking-wider font-semibold">
                      {rem.category}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-botanical-green" />
                    <span>{rem.schedule_time} ({rem.repeat_interval})</span>
                  </p>

                  {rem.notes && (
                    <p className="text-xs text-text-secondary mt-1.5 leading-relaxed italic">
                      "{rem.notes}"
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(rem.id, rem.title)}
                className="text-text-secondary hover:text-red-700 p-1"
                title="Delete reminder"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
