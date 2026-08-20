// Shared task/reminder types, category config, and formatting helpers.
// Persistence lives in useFirestoreCollection.ts (Firestore, per-user).

export type Category = 'Work' | 'Personal' | 'Study' | 'Break' | 'Health' | 'Other';

export interface Task {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  description: string;
  category: Category;
  completed: boolean;
}

export type RepeatPreset = 'none' | 'everyday' | 'weekdays' | 'weekends' | 'custom';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun, 1=Mon ... 6=Sat

export interface Reminder {
  id: string;
  taskName: string;
  date: string; // YYYY-MM-DD (start date / one-time date)
  time: string; // HH:MM — empty string means no time set
  category: Category;
  note: string;
  enabled: boolean;
  // Recurring fields
  repeat: RepeatPreset;
  repeatDays: DayOfWeek[]; // used when repeat === 'custom'
}

export const CATEGORY_CONFIG: Record<Category, { bg: string; text: string; dot: string; label: string }> = {
  Work: { bg: 'var(--cat-work)', text: 'var(--cat-work-text)', dot: 'var(--cat-work-dot)', label: 'Work' },
  Personal: { bg: 'var(--cat-personal)', text: 'var(--cat-personal-text)', dot: 'var(--cat-personal-dot)', label: 'Personal' },
  Study: { bg: 'var(--cat-study)', text: 'var(--cat-study-text)', dot: 'var(--cat-study-dot)', label: 'Study' },
  Break: { bg: 'var(--cat-break)', text: 'var(--cat-break-text)', dot: 'var(--cat-break-dot)', label: 'Break' },
  Health: { bg: 'var(--cat-health)', text: 'var(--cat-health-text)', dot: 'var(--cat-health-dot)', label: 'Health' },
  Other: { bg: 'var(--cat-other)', text: 'var(--cat-other-text)', dot: 'var(--cat-other-dot)', label: 'Other' },
};

export const CATEGORY_CHART_COLORS: Record<Category, string> = {
  Work: '#3B82F6',
  Personal: '#EC4899',
  Study: '#10B981',
  Break: '#F59E0B',
  Health: '#8B5CF6',
  Other: '#9CA3AF',
};

export function calcDuration(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const diff = endMins - startMins;
  if (diff <= 0) return '—';
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function calcDurationMinutes(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayTime(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}