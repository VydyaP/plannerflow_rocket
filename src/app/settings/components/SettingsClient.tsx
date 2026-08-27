'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Tag, Sun, Moon, Bell, Download, Trash2, Plus, Pencil, Check, X,
  ChevronRight, AlertTriangle, Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthUser } from '@/lib/useAuthUser';
import { useTheme, type ThemeMode } from '@/lib/useTheme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CustomCategory {
  id: string;
  name: string;
  color: string; // hex
  textColor: string; // hex
}

interface ReminderDefaults {
  defaultTime: string; // HH:MM
  advanceMinutes: number; // minutes before task
  soundEnabled: boolean;
}

// ─── Preset category colors ───────────────────────────────────────────────────

const COLOR_PRESETS = [
  { bg: '#DBEAFE', text: '#1D4ED8', label: 'Blue' },
  { bg: '#FCE7F3', text: '#BE185D', label: 'Pink' },
  { bg: '#D1FAE5', text: '#065F46', label: 'Green' },
  { bg: '#FEF3C7', text: '#92400E', label: 'Amber' },
  { bg: '#EDE9FE', text: '#5B21B6', label: 'Purple' },
  { bg: '#F3F4F6', text: '#374151', label: 'Gray' },
  { bg: '#FEE2E2', text: '#991B1B', label: 'Red' },
  { bg: '#ECFDF5', text: '#065F46', label: 'Mint' },
  { bg: '#FFF7ED', text: '#9A3412', label: 'Orange' },
  { bg: '#F0F9FF', text: '#0369A1', label: 'Sky' },
];

const ADVANCE_OPTIONS = [
  { value: 0, label: 'At time of task' },
  { value: 5, label: '5 minutes before' },
  { value: 10, label: '10 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
];

const DEFAULT_CATEGORIES: CustomCategory[] = [
  { id: 'cat-work', name: 'Work', color: '#DBEAFE', textColor: '#1D4ED8' },
  { id: 'cat-personal', name: 'Personal', color: '#FCE7F3', textColor: '#BE185D' },
  { id: 'cat-study', name: 'Study', color: '#D1FAE5', textColor: '#065F46' },
  { id: 'cat-break', name: 'Break', color: '#FEF3C7', textColor: '#92400E' },
  { id: 'cat-health', name: 'Health', color: '#EDE9FE', textColor: '#5B21B6' },
  { id: 'cat-other', name: 'Other', color: '#F3F4F6', textColor: '#374151' },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-secondary/30">
        <span className="text-primary">{icon}</span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function getInitials(name: string | null, email: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (email ?? '?').slice(0, 2).toUpperCase();
}

export default function SettingsClient() {
  const { user } = useAuthUser();
  const [photoError, setPhotoError] = useState(false);

  // ── Categories state ──
  const [categories, setCategories] = useState<CustomCategory[]>(DEFAULT_CATEGORIES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState(COLOR_PRESETS[0]);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // ── Theme state ──
  const { theme, setTheme } = useTheme();

  // ── Reminder defaults ──
  const [reminderDefaults, setReminderDefaults] = useState<ReminderDefaults>({
    defaultTime: '09:00',
    advanceMinutes: 10,
    soundEnabled: true,
  });

  // ── Reset confirm ──
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pf_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.reminderDefaults) setReminderDefaults(parsed.reminderDefaults);
      }
    } catch {}
  }, []);

  function saveSettings(updates: Partial<{ categories: CustomCategory[]; theme: ThemeMode; reminderDefaults: ReminderDefaults }>) {
    try {
      const current = JSON.parse(localStorage.getItem('pf_settings') || '{}');
      localStorage.setItem('pf_settings', JSON.stringify({ ...current, ...updates }));
    } catch {}
  }

  // ── Category handlers ──
  function startEdit(cat: CustomCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
    const preset = COLOR_PRESETS.find((p) => p.bg === cat.color) ?? COLOR_PRESETS[0];
    setEditColor(preset);
  }

  function confirmEdit(id: string) {
    if (!editName.trim()) return;
    const updated = categories.map((c) =>
      c.id === id ? { ...c, name: editName.trim(), color: editColor.bg, textColor: editColor.text } : c
    );
    setCategories(updated);
    saveSettings({ categories: updated });
    setEditingId(null);
    toast.success('Category updated');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName('');
  }

  function addCategory() {
    if (!newName.trim()) return;
    const newCat: CustomCategory = {
      id: `cat-${Date.now()}`,
      name: newName.trim(),
      color: newColor.bg,
      textColor: newColor.text,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveSettings({ categories: updated });
    setNewName('');
    setNewColor(COLOR_PRESETS[0]);
    setAddingNew(false);
    toast.success('Category added');
  }

  function deleteCategory(id: string) {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    saveSettings({ categories: updated });
    setDeleteConfirmId(null);
    toast.success('Category deleted');
  }

  // ── Theme handler ──
  function handleThemeChange(mode: ThemeMode) {
    setTheme(mode);
    toast.success(`Theme set to ${mode}`);
  }

  // ── Reminder defaults handler ──
  function updateReminderDefaults(patch: Partial<ReminderDefaults>) {
    const updated = { ...reminderDefaults, ...patch };
    setReminderDefaults(updated);
    saveSettings({ reminderDefaults: updated });
  }

  // ── Export handler ──
  function handleExport() {
    const data = {
      exportedAt: new Date().toISOString(),
      categories,
      settings: { theme, reminderDefaults },
      note: 'PlannerFlow data export',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plannerflow-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  }

  // ── Reset handler ──
  function handleReset() {
    setCategories(DEFAULT_CATEGORIES);
    setTheme('system');
    setReminderDefaults({ defaultTime: '09:00', advanceMinutes: 10, soundEnabled: true });
    localStorage.removeItem('pf_settings');
    setShowResetConfirm(false);
    toast.success('Settings reset to defaults');
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your PlannerFlow experience</p>
      </div>

      {/* ── Account ── */}
      <Link
        href="/account"
        className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl shadow-soft hover:bg-secondary/30 transition-all active:scale-[0.98]"
      >
        {user?.photoURL && !photoError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName ?? 'Account'}
            referrerPolicy="no-referrer"
            onError={() => setPhotoError(true)}
            className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">
              {getInitials(user?.displayName ?? null, user?.email ?? null)}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{user?.displayName ?? 'Account'}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email ?? 'Manage your profile'}</p>
        </div>
        <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
      </Link>

      {/* ── 1. Task Categories ── */}
      <Section title="Task Categories" icon={<Tag size={18} />}>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors">
              {editingId === cat.id ? (
                /* Edit row */
                <div className="flex-1 flex flex-col gap-3">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Category name"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => setEditColor(preset)}
                        title={preset.label}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${editColor.bg === preset.bg ? 'border-primary scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: preset.bg }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmEdit(cat.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-all active:scale-95"
                    >
                      <Check size={13} /> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-all active:scale-95"
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : deleteConfirmId === cat.id ? (
                /* Delete confirm row */
                <div className="flex-1 flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground">Delete <strong>{cat.name}</strong>?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all active:scale-95"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal row */
                <>
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: cat.color, color: cat.textColor }}
                  >
                    {cat.name}
                  </span>
                  <span className="flex-1 text-sm text-foreground">{cat.name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(cat.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add new category */}
          {addingNew ? (
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="New category name"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
              />
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => setNewColor(preset)}
                    title={preset.label}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newColor.bg === preset.bg ? 'border-primary scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: preset.bg }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCategory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-all active:scale-95"
                >
                  <Check size={13} /> Add
                </button>
                <button
                  onClick={() => { setAddingNew(false); setNewName(''); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-all active:scale-95"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all active:scale-[0.98]"
            >
              <Plus size={15} /> Add Category
            </button>
          )}
        </div>
      </Section>

      {/* ── 2. App Theme ── */}
      <Section title="App Theme" icon={<Sun size={18} />}>
        <div className="grid grid-cols-3 gap-3">
          {([
            { mode: 'light' as ThemeMode, icon: <Sun size={20} />, label: 'Light' },
            { mode: 'dark' as ThemeMode, icon: <Moon size={20} />, label: 'Dark' },
            { mode: 'system' as ThemeMode, icon: <Monitor size={20} />, label: 'System' },
          ]).map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => handleThemeChange(mode)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150 active:scale-95 ${
                theme === mode
                  ? 'border-primary bg-primary/10 text-primary shadow-soft'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-secondary/50'
              }`}
            >
              {icon}
              <span className="text-sm font-medium">{label}</span>
              {theme === mode && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          System matches your device&apos;s theme automatically, and switches live if it changes.
        </p>
      </Section>

      {/* ── 3. Reminder Notification Defaults ── */}
      <Section title="Reminder Defaults" icon={<Bell size={18} />}>
        <div className="space-y-5">
          {/* Default time */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Default reminder time</p>
              <p className="text-xs text-muted-foreground mt-0.5">Used when creating new reminders without a specific time</p>
            </div>
            <input
              type="time"
              value={reminderDefaults.defaultTime}
              onChange={(e) => updateReminderDefaults({ defaultTime: e.target.value })}
              className="px-3 py-2 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-tabular"
            />
          </div>

          {/* Advance notice */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Advance notice</p>
              <p className="text-xs text-muted-foreground mt-0.5">How early to notify before a task starts</p>
            </div>
            <select
              value={reminderDefaults.advanceMinutes}
              onChange={(e) => updateReminderDefaults({ advanceMinutes: Number(e.target.value) })}
              className="px-3 py-2 rounded-xl border border-border bg-input text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              {ADVANCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Notification sound</p>
              <p className="text-xs text-muted-foreground mt-0.5">Play a sound when a reminder triggers</p>
            </div>
            <button
              onClick={() => updateReminderDefaults({ soundEnabled: !reminderDefaults.soundEnabled })}
              className={`relative w-11 h-6 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                reminderDefaults.soundEnabled ? 'bg-primary' : 'bg-muted'
              }`}
              role="switch"
              aria-checked={reminderDefaults.soundEnabled}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  reminderDefaults.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Section>

      {/* ── 4. Data Export & Reset ── */}
      <Section title="Data & Storage" icon={<Download size={18} />}>
        <div className="space-y-3">
          {/* Export */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Download size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Export data</p>
                <p className="text-xs text-muted-foreground">Download your settings as a JSON file</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-all active:scale-95"
            >
              Export <ChevronRight size={14} />
            </button>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50 hover:bg-red-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
                <Trash2 size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Reset to defaults</p>
                <p className="text-xs text-muted-foreground">Restore all settings to their original values</p>
              </div>
            </div>
            {showResetConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-all active:scale-95"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:bg-muted transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-all active:scale-95"
              >
                <AlertTriangle size={14} /> Reset
              </button>
            )}
          </div>
        </div>
      </Section>

      <div className="text-center">
        <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
