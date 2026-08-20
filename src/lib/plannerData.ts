// Backend integration point: replace with persistent storage (localStorage, IndexedDB, or API)

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

// Seed mock tasks for demo — backend integration replaces this
export const MOCK_TASKS: Task[] = [
  { id: 'task-001', date: '2026-08-20', startTime: '08:00', endTime: '09:30', description: 'Morning standup & sprint planning', category: 'Work', completed: true },
  { id: 'task-002', date: '2026-08-20', startTime: '09:45', endTime: '11:30', description: 'Deep work: Feature development', category: 'Work', completed: true },
  { id: 'task-003', date: '2026-08-20', startTime: '11:30', endTime: '12:00', description: 'Break — walk outside', category: 'Break', completed: false },
  { id: 'task-004', date: '2026-08-20', startTime: '12:00', endTime: '13:00', description: 'Lunch & read', category: 'Personal', completed: false },
  { id: 'task-005', date: '2026-08-20', startTime: '13:00', endTime: '15:00', description: 'Study: TypeScript advanced patterns', category: 'Study', completed: false },
  { id: 'task-006', date: '2026-08-20', startTime: '15:00', endTime: '16:30', description: 'Code review & PR feedback', category: 'Work', completed: false },
  { id: 'task-007', date: '2026-08-20', startTime: '17:00', endTime: '18:00', description: 'Gym session', category: 'Health', completed: false },
  { id: 'task-008', date: '2026-08-19', startTime: '09:00', endTime: '11:00', description: 'Weekly report preparation', category: 'Work', completed: true },
  { id: 'task-009', date: '2026-08-19', startTime: '11:00', endTime: '12:00', description: 'Meditation & journaling', category: 'Health', completed: true },
  { id: 'task-010', date: '2026-08-19', startTime: '13:00', endTime: '15:00', description: 'Client call preparation', category: 'Work', completed: true },
  { id: 'task-011', date: '2026-08-18', startTime: '08:30', endTime: '10:00', description: 'Product roadmap review', category: 'Work', completed: true },
  { id: 'task-012', date: '2026-08-18', startTime: '10:30', endTime: '12:30', description: 'React course — Hooks deep dive', category: 'Study', completed: true },
  { id: 'task-013', date: '2026-08-18', startTime: '14:00', endTime: '15:30', description: 'Grocery shopping', category: 'Personal', completed: true },
  { id: 'task-014', date: '2026-08-17', startTime: '09:00', endTime: '12:00', description: 'Architecture planning session', category: 'Work', completed: true },
  { id: 'task-015', date: '2026-08-17', startTime: '13:00', endTime: '14:00', description: 'Yoga flow', category: 'Health', completed: true },
  { id: 'task-016', date: '2026-08-21', startTime: '09:00', endTime: '10:30', description: 'Team retrospective', category: 'Work', completed: false },
  { id: 'task-017', date: '2026-08-21', startTime: '11:00', endTime: '12:00', description: 'Personal finance review', category: 'Personal', completed: false },
  { id: 'task-018', date: '2026-08-21', startTime: '14:00', endTime: '16:00', description: 'Study: System design patterns', category: 'Study', completed: false },
  { id: 'task-019', date: '2026-08-22', startTime: '08:00', endTime: '09:00', description: 'Morning run', category: 'Health', completed: false },
  { id: 'task-020', date: '2026-08-22', startTime: '10:00', endTime: '12:30', description: 'Feature spec writing', category: 'Work', completed: false },
];

export const MOCK_REMINDERS: Reminder[] = [
  { id: 'rem-001', taskName: 'Morning standup & sprint planning', date: '2026-08-20', time: '09:00', category: 'Work', note: 'Check Jira before joining', enabled: true, repeat: 'weekdays', repeatDays: [] },
  { id: 'rem-002', taskName: 'Take vitamins', date: '2026-08-20', time: '08:00', category: 'Health', note: 'With breakfast', enabled: true, repeat: 'everyday', repeatDays: [] },
  { id: 'rem-003', taskName: 'Gym session', date: '2026-08-20', time: '17:00', category: 'Health', note: 'Pack gym bag the night before', enabled: true, repeat: 'custom', repeatDays: [1, 3, 5] },
  { id: 'rem-004', taskName: 'Personal finance review', date: '2026-08-21', time: '', category: 'Personal', note: 'Check monthly budget spreadsheet', enabled: false, repeat: 'none', repeatDays: [] },
  { id: 'rem-005', taskName: 'Morning run', date: '2026-08-22', time: '07:30', category: 'Health', note: '5km route via the park', enabled: true, repeat: 'weekends', repeatDays: [] },
  { id: 'rem-006', taskName: 'React course — Hooks deep dive', date: '2026-08-18', time: '', category: 'Study', note: 'Take notes in Notion', enabled: false, repeat: 'none', repeatDays: [] },
];

export function getTasksForDate(date: string): Task[] {
  return MOCK_TASKS.filter((t) => t.date === date);
}

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