'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { Plus, Bell, BellOff, Trash2, Clock, Calendar, StickyNote, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Reminder, Category, RepeatPreset, DayOfWeek } from '@/lib/plannerData';
import { useAuthUser } from '@/lib/useAuthUser';
import { useReminders } from '@/lib/useFirestoreCollection';
import { listItemVariants } from '@/lib/motion';
import CategoryBadge from '@/app/daily-planner/components/CategoryBadge';

type FilterType = 'all' | 'today' | 'upcoming' | 'recurring';

const TODAY = '2026-08-20';
const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Break', 'Health', 'Other'];

const DAY_LABELS: { key: DayOfWeek; short: string; full: string }[] = [
  { key: 0, short: 'Su', full: 'Sunday' },
  { key: 1, short: 'Mo', full: 'Monday' },
  { key: 2, short: 'Tu', full: 'Tuesday' },
  { key: 3, short: 'We', full: 'Wednesday' },
  { key: 4, short: 'Th', full: 'Thursday' },
  { key: 5, short: 'Fr', full: 'Friday' },
  { key: 6, short: 'Sa', full: 'Saturday' },
];

const REPEAT_PRESETS: { key: RepeatPreset; label: string; desc: string }[] = [
  { key: 'none', label: 'One-time', desc: 'Does not repeat' },
  { key: 'everyday', label: 'Every Day', desc: 'Mon – Sun' },
  { key: 'weekdays', label: 'Weekdays', desc: 'Mon – Fri' },
  { key: 'weekends', label: 'Weekends', desc: 'Sat & Sun' },
  { key: 'custom', label: 'Custom', desc: 'Pick days' },
];

function isToday(date: string): boolean {
  return date === TODAY;
}

function isUpcoming(date: string): boolean {
  return date > TODAY;
}

function isRecurring(repeat: RepeatPreset): boolean {
  return repeat !== 'none';
}

function getRepeatLabel(repeat: RepeatPreset, repeatDays: DayOfWeek[]): string {
  if (repeat === 'none') return '';
  if (repeat === 'everyday') return 'Every day';
  if (repeat === 'weekdays') return 'Weekdays';
  if (repeat === 'weekends') return 'Weekends';
  if (repeat === 'custom' && repeatDays.length > 0) {
    return repeatDays
      .sort((a, b) => a - b)
      .map((d) => DAY_LABELS.find((dl) => dl.key === d)?.short ?? '')
      .join(', ');
  }
  return 'Custom';
}

interface ReminderFormState {
  taskName: string;
  date: string;
  time: string;
  hasTime: boolean;
  category: Category;
  note: string;
  repeat: RepeatPreset;
  repeatDays: DayOfWeek[];
}

const DEFAULT_FORM: ReminderFormState = {
  taskName: '',
  date: TODAY,
  time: '09:00',
  hasTime: true,
  category: 'Work',
  note: '',
  repeat: 'none',
  repeatDays: [],
};

export default function RemindersClient() {
  const { uid, loading: authLoading } = useAuthUser();
  const {
    data: reminders,
    loading: remindersLoading,
    error: remindersError,
    add: addReminder,
    update: updateReminder,
    remove: removeReminder,
  } = useReminders();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ReminderFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ReminderFormState, string>>>({});

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = reminders.filter((r) => {
    if (filter === 'today') return isToday(r.date);
    if (filter === 'upcoming') return isUpcoming(r.date);
    if (filter === 'recurring') return isRecurring(r.repeat);
    return true;
  });

  const recurringCount = reminders.filter((r) => isRecurring(r.repeat)).length;
  const todayCount = reminders.filter((r) => isToday(r.date) && r.enabled).length;

  const FILTER_OPTIONS: { key: FilterType; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: reminders.length },
    { key: 'today', label: 'Today', count: todayCount },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'recurring', label: 'Recurring', count: recurringCount },
  ];

  // ── Handlers ───────────────────────────────────────────────────────────────
  const reportError = (err: unknown, fallback: string) => {
    toast.error(err instanceof Error ? err.message : fallback);
  };

  const handleToggle = (id: string) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;
    updateReminder(id, { enabled: !reminder.enabled }).catch((err) =>
      reportError(err, 'Could not update reminder')
    );
  };

  const handleDelete = (id: string) => {
    const deleted = reminders.find((r) => r.id === id);
    removeReminder(id)
      .then(() => {
        toast.success('Reminder removed', {
          action: deleted
            ? {
                label: 'Undo',
                onClick: () => {
                  const { id: _omit, ...rest } = deleted;
                  addReminder(rest).catch((err) => reportError(err, 'Could not restore reminder'));
                },
              }
            : undefined,
        });
      })
      .catch((err) => reportError(err, 'Could not delete reminder'));
  };

  // Swipe-left-to-delete, mirroring the daily planner's mobile cards —
  // fires past a distance threshold or a fast flick, otherwise Motion
  // springs the card back via dragConstraints.
  const handleSwipeEnd = (id: string, info: PanInfo) => {
    if (info.offset.x < -100 || info.velocity.x < -500) {
      handleDelete(id);
    }
  };

  const toggleRepeatDay = (day: DayOfWeek) => {
    setForm((prev) => {
      const exists = prev.repeatDays.includes(day);
      return {
        ...prev,
        repeatDays: exists ? prev.repeatDays.filter((d) => d !== day) : [...prev.repeatDays, day],
      };
    });
  };

  const handleRepeatPreset = (preset: RepeatPreset) => {
    setForm((prev) => ({
      ...prev,
      repeat: preset,
      repeatDays: preset === 'custom' ? prev.repeatDays : [],
    }));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!form.taskName.trim()) newErrors.taskName = 'Task name is required';
    if (form.repeat === 'none' && !form.date) newErrors.date = 'Date is required for one-time reminders';
    if (form.repeat === 'custom' && form.repeatDays.length === 0)
      newErrors.repeatDays = 'Select at least one day';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const newReminder: Omit<Reminder, 'id'> = {
      taskName: form.taskName.trim(),
      date: form.date,
      time: form.hasTime ? form.time : '',
      category: form.category,
      note: form.note.trim(),
      enabled: true,
      repeat: form.repeat,
      repeatDays: form.repeat === 'custom' ? form.repeatDays : [],
    };
    addReminder(newReminder)
      .then(() => toast.success('Reminder set successfully'))
      .catch((err) => reportError(err, 'Could not set reminder'));
    setForm(DEFAULT_FORM);
    setShowForm(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (authLoading || remindersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <Bell size={28} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Loading your reminders…</h3>
        <p className="text-sm text-muted-foreground max-w-xs">Just a moment while we fetch your data.</p>
      </div>
    );
  }

  if (remindersError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <Bell size={28} className="text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Couldn&apos;t load your reminders</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{remindersError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground mt-0.5">One-time & recurring — never miss a thing</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setForm(DEFAULT_FORM); setErrors({}); }}
          className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl shadow-soft hover:opacity-90 active:scale-95 transition-all duration-150 w-fit"
        >
          <Plus size={16} />
          Add Reminder
        </button>
      </div>

      {/* Add reminder form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto', transition: { duration: 0.2, ease: 'easeOut' } }}
            exit={{ opacity: 0, y: -8, height: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
            className="overflow-hidden"
          >
          <div className="bg-card rounded-3xl border border-border shadow-card p-6">
          <h3 className="text-base font-bold text-foreground mb-5">New Reminder</h3>
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Task name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.taskName}
                onChange={(e) => setForm((p) => ({ ...p, taskName: e.target.value }))}
                placeholder="e.g. Take vitamins, Morning standup…"
                className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-150"
              />
              {errors.taskName && <p className="mt-1 text-xs text-red-500">{errors.taskName}</p>}
            </div>

            {/* Repeat section */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                <span className="flex items-center gap-1.5"><Repeat2 size={14} /> Repeat</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {REPEAT_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleRepeatPreset(preset.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                      form.repeat === preset.key
                        ? 'bg-primary text-white border-primary shadow-soft'
                        : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {preset.label}
                    <span className={`ml-1.5 text-xs font-normal ${form.repeat === preset.key ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom day picker */}
              {form.repeat === 'custom' && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Select days</p>
                  <div className="flex gap-2 flex-wrap">
                    {DAY_LABELS.map((day) => {
                      const selected = form.repeatDays.includes(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => toggleRepeatDay(day.key)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold border transition-all duration-150 ${
                            selected
                              ? 'bg-primary text-white border-primary shadow-soft'
                              : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>
                  {errors.repeatDays && <p className="mt-1 text-xs text-red-500">{errors.repeatDays}</p>}
                </div>
              )}
            </div>

            {/* Date (only for one-time) */}
            {form.repeat === 'none' && (
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-150"
                  />
                </div>
                {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
              </div>
            )}

            {/* Time — optional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <Clock size={14} /> Reminder Time
                </label>
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, hasTime: !p.hasTime }))}
                  className={`relative w-9 h-5 rounded-full transition-all duration-200 ${form.hasTime ? 'bg-primary' : 'bg-muted'}`}
                  aria-label={form.hasTime ? 'Remove time' : 'Add time'}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${form.hasTime ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {form.hasTime ? 'Reminder will fire at the set time' : 'No time — reminder appears as an all-day note'}
              </p>
              {form.hasTime && (
                <div className="relative">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    className="w-full pl-9 pr-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-150"
                  />
                </div>
              )}
            </div>

            {/* Category + Note row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-150"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Note</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Optional note…"
                  className="w-full px-4 py-2.5 bg-input border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-150"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(DEFAULT_FORM); setErrors({}); }}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold shadow-soft hover:opacity-90 active:scale-95 transition-all duration-150"
              >
                Set Reminder
              </button>
            </div>
          </form>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={`filter-${opt.key}`}
            onClick={() => setFilter(opt.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              filter === opt.key
                ? 'bg-primary text-white shadow-soft'
                : 'bg-card border border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === opt.key ? 'bg-white/20' : 'bg-muted text-muted-foreground'}`}>
                {opt.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reminder list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card rounded-3xl border border-border shadow-soft text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Bell size={28} className="text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No reminders here</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {filter === 'recurring' ?'No recurring reminders yet. Add one to repeat daily habits.'
              : filter === 'today' ?'No reminders set for today. Add one to stay on track.' :'No reminders yet. Add one to get notified before your tasks.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
          {filtered.map((reminder) => {
            const repeatLabel = getRepeatLabel(reminder.repeat, reminder.repeatDays);
            const recurring = isRecurring(reminder.repeat);

            return (
              <motion.div
                key={reminder.id}
                layout
                initial="initial"
                animate="animate"
                exit="exit"
                variants={listItemVariants}
                className="relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 flex items-center justify-end rounded-2xl bg-red-500 pr-6">
                  <Trash2 size={20} className="text-white" />
                </div>
                <motion.div
                  drag="x"
                  dragConstraints={{ left: -96, right: 0 }}
                  dragElastic={{ left: 0.2, right: 0 }}
                  dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
                  onDragEnd={(_, info) => handleSwipeEnd(reminder.id, info)}
                  className={`relative bg-card rounded-2xl border shadow-soft p-4 ${recurring ? 'border-primary/20' : 'border-border'}`}
                >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${recurring ? 'bg-primary/10' : 'bg-secondary'}`}>
                    {reminder.enabled ? (
                      recurring
                        ? <Repeat2 size={18} className="text-primary" />
                        : <Bell size={18} className="text-primary" />
                    ) : (
                      <BellOff size={18} className="text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${reminder.enabled ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                          {reminder.taskName}
                        </p>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          {/* Repeat badge */}
                          {recurring ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              <Repeat2 size={10} />
                              {repeatLabel}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar size={11} />
                              {reminder.date}
                            </div>
                          )}

                          {/* Time or no-time */}
                          {reminder.time ? (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock size={11} />
                              {reminder.time}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No time set</span>
                          )}

                          <CategoryBadge category={reminder.category} size="sm" />
                        </div>

                        {/* Custom days row */}
                        {reminder.repeat === 'custom' && reminder.repeatDays.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {DAY_LABELS.map((dl) => {
                              const active = reminder.repeatDays.includes(dl.key);
                              return (
                                <span
                                  key={dl.key}
                                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                                    active ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                                  }`}
                                >
                                  {dl.short}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        {reminder.note && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <StickyNote size={11} className="text-muted-foreground flex-shrink-0" />
                            <p className="text-xs text-muted-foreground">{reminder.note}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Toggle */}
                        <button
                          onClick={() => handleToggle(reminder.id)}
                          className={`relative w-10 h-5 rounded-full transition-all duration-200 ${reminder.enabled ? 'bg-primary' : 'bg-muted'}`}
                          aria-label={reminder.enabled ? 'Disable reminder' : 'Enable reminder'}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${reminder.enabled ? 'left-5' : 'left-0.5'}`} />
                        </button>

                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all duration-150"
                          aria-label="Delete reminder"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                </motion.div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}