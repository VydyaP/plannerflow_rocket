'use client';
import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  BarChart2,
  Bell,
  Clock,
  CheckCircle2,
  ListTodo,
  Flame,
  Plus,
} from 'lucide-react';
import { CATEGORY_CONFIG, formatDateKey, calcDurationMinutes } from '@/lib/plannerData';
import type { Category, Task } from '@/lib/plannerData';
import { useAuthUser } from '@/lib/useAuthUser';
import { useTasks } from '@/lib/useFirestoreCollection';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const monthGridVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -24 : 24, transition: { duration: 0.15, ease: 'easeIn' } }),
};

function getTasksForDate(tasks: Task[], dateKey: string) {
  return tasks.filter((t) => t.date === dateKey);
}

function getTotalHours(tasks: Task[]) {
  const mins = tasks.reduce((acc, t) => acc + Math.max(0, calcDurationMinutes(t.startTime, t.endTime)), 0);
  return (mins / 60).toFixed(1);
}

function getTopCategory(tasks: Task[]): Category | null {
  if (tasks.length === 0) return null;
  const counts: Partial<Record<Category, number>> = {};
  tasks.forEach((t) => {
    counts[t.category] = (counts[t.category] ?? 0) + calcDurationMinutes(t.startTime, t.endTime);
  });
  return (Object.entries(counts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] as Category) ?? null;
}

export default function CalendarGrid() {
  const router = useRouter();
  const { uid, loading: authLoading } = useAuthUser();
  const { data: tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const today = new Date(2026, 7, 20); // Aug 20 2026
  const [viewDate, setViewDate] = useState(new Date(2026, 7, 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [navDirection, setNavDirection] = useState(0);

  const goToMonth = (delta: number) => {
    setNavDirection(delta);
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < firstDay) {
      cells.push({ date: new Date(year, month - 1, prevMonthDays - firstDay + i + 1), isCurrentMonth: false });
    } else if (i < firstDay + daysInMonth) {
      cells.push({ date: new Date(year, month, i - firstDay + 1), isCurrentMonth: true });
    } else {
      cells.push({ date: new Date(year, month + 1, i - firstDay - daysInMonth + 1), isCurrentMonth: false });
    }
  }

  const selectedKey = formatDateKey(selectedDate);
  const selectedTasks = getTasksForDate(tasks, selectedKey);
  const completedCount = selectedTasks.filter((t) => t.completed).length;
  const completionRate = selectedTasks.length > 0 ? Math.round((completedCount / selectedTasks.length) * 100) : 0;
  const topCat = getTopCategory(selectedTasks);

  const isToday = (date: Date) => formatDateKey(date) === formatDateKey(today);
  const isSelected = (date: Date) => formatDateKey(date) === selectedKey;

  if (authLoading || tasksLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <CalendarDays size={28} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Loading your calendar…</h3>
        <p className="text-sm text-muted-foreground max-w-xs">Just a moment while we fetch your tasks.</p>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <CalendarDays size={28} className="text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Couldn&apos;t load your calendar</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{tasksError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Plan your days, track your progress</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(`/daily-planner?date=${formatDateKey(today)}`)}
            className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl shadow-soft hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            <Plus size={16} />
            Plan Today
          </button>
          <button
            onClick={() => router.push('/analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-medium text-foreground rounded-xl shadow-soft hover:bg-secondary active:scale-95 transition-all duration-150"
          >
            <BarChart2 size={16} className="text-primary" />
            Analytics
          </button>
          <button
            onClick={() => router.push('/reminders')}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-medium text-foreground rounded-xl shadow-soft hover:bg-secondary active:scale-95 transition-all duration-150"
          >
            <Bell size={16} className="text-accent" />
            Reminders
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-card rounded-3xl shadow-card border border-border p-6">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => goToMonth(-1)}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-foreground">
              {MONTHS[month]} {year}
            </h2>
            <button
              onClick={() => goToMonth(1)}
              className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-95"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={`wd-${d}`} className="text-center text-xs font-600 text-muted-foreground py-2 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={navDirection} initial={false}>
          <motion.div
            key={`${year}-${month}`}
            custom={navDirection}
            variants={monthGridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="grid grid-cols-7 gap-1"
          >
            {cells.map((cell, i) => {
              const key = formatDateKey(cell.date);
              const cellTasks = getTasksForDate(tasks, key);
              const hasWork = cellTasks.some((t) => t.category === 'Work');
              const hasStudy = cellTasks.some((t) => t.category === 'Study');
              const hasHealth = cellTasks.some((t) => t.category === 'Health');
              const hasPersonal = cellTasks.some((t) => t.category === 'Personal');
              const hasBreak = cellTasks.some((t) => t.category === 'Break');
              const isTod = isToday(cell.date);
              const isSel = isSelected(cell.date);

              return (
                <button
                  key={`cell-${i}`}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative flex flex-col items-center p-1.5 sm:p-2 rounded-xl min-h-[52px] sm:min-h-[64px] transition-all duration-150 active:scale-95 group ${
                    !cell.isCurrentMonth ? 'opacity-30' : ''
                  } ${
                    isSel
                      ? 'bg-primary text-white shadow-soft ring-primary-soft'
                      : isTod
                      ? 'bg-primary/10 text-primary' :'hover:bg-secondary text-foreground'
                  }`}
                >
                  <span className={`text-sm font-semibold mb-1 ${isSel ? 'text-white' : isTod ? 'text-primary' : 'text-foreground'}`}>
                    {cell.date.getDate()}
                  </span>
                  {cellTasks.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {hasWork && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white/70' : 'bg-blue-400'}`} />}
                      {hasStudy && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white/70' : 'bg-emerald-400'}`} />}
                      {hasHealth && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white/70' : 'bg-violet-400'}`} />}
                      {hasPersonal && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white/70' : 'bg-pink-400'}`} />}
                      {hasBreak && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-white/70' : 'bg-amber-400'}`} />}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
          </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
            {(['Work', 'Study', 'Health', 'Personal', 'Break'] as Category[]).map((cat) => (
              <div key={`legend-${cat}`} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_CONFIG[cat].dot }}
                />
                {cat}
              </div>
            ))}
          </div>
        </div>

        {/* Selected date stats */}
        <div className="space-y-4">
          {/* Date header */}
          <div className="bg-card rounded-3xl shadow-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Selected Day</p>
                <h3 className="text-xl font-bold text-foreground mt-0.5">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </p>
              </div>
              <button
                onClick={() => router.push(`/daily-planner?date=${selectedKey}`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary text-xs font-semibold rounded-xl hover:bg-primary/20 active:scale-95 transition-all duration-150"
              >
                <CalendarDays size={14} />
                Open
              </button>
            </div>

            {selectedTasks.length === 0 ? (
              <div className="text-center py-6">
                <ListTodo size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-muted-foreground">No tasks planned</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Open" to start planning this day</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-secondary rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ListTodo size={14} className="text-primary" />
                    <p className="text-xs text-muted-foreground font-medium">Tasks</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground font-tabular">{selectedTasks.length}</p>
                </div>
                <div className="bg-secondary rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-primary" />
                    <p className="text-xs text-muted-foreground font-medium">Hours</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground font-tabular">{getTotalHours(selectedTasks)}</p>
                </div>
                <div className="bg-secondary rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <p className="text-xs text-muted-foreground font-medium">Done</p>
                  </div>
                  <p className="text-2xl font-bold text-foreground font-tabular">{completionRate}%</p>
                </div>
                <div className="bg-secondary rounded-2xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Flame size={14} className="text-accent" />
                    <p className="text-xs text-muted-foreground font-medium">Top</p>
                  </div>
                  {topCat ? (
                    <span
                      className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_CONFIG[topCat].bg, color: CATEGORY_CONFIG[topCat].text }}
                    >
                      {topCat}
                    </span>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Task preview list */}
          {selectedTasks.length > 0 && (
            <div className="bg-card rounded-3xl shadow-card border border-border p-5">
              <h4 className="text-sm font-semibold text-foreground mb-3">Today's Tasks</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl"
                    style={{ backgroundColor: CATEGORY_CONFIG[task.category].bg }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CATEGORY_CONFIG[task.category].dot }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold truncate"
                        style={{ color: CATEGORY_CONFIG[task.category].text }}
                      >
                        {task.description}
                      </p>
                      <p className="text-xs opacity-70 mt-0.5" style={{ color: CATEGORY_CONFIG[task.category].text }}>
                        {task.startTime} – {task.endTime}
                      </p>
                    </div>
                    {task.completed && (
                      <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}