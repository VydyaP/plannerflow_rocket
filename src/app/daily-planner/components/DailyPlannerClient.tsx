'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { listItemVariants } from '@/lib/motion';
import {
  Plus,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  ListTodo,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  CATEGORY_CONFIG,
  calcDuration,
  calcDurationMinutes,
  formatDateKey,
  formatDisplayTime,
} from '@/lib/plannerData';
import type { Task, Category } from '@/lib/plannerData';
import { useAuthUser } from '@/lib/useAuthUser';
import { useTasks } from '@/lib/useFirestoreCollection';
import TimePickerModal from './TimePickerModal';
import CategoryBadge from './CategoryBadge';

const CATEGORIES: Category[] = ['Work', 'Personal', 'Study', 'Break', 'Health', 'Other'];

function buildDateRange(center: Date): Date[] {
  const dates: Date[] = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function DailyPlannerClient() {
  const searchParams = useSearchParams();
  const paramDate = searchParams.get('date');
  const initialDate = paramDate ? new Date(paramDate + 'T00:00:00') : new Date(2026, 7, 20);

  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const { uid, loading: authLoading } = useAuthUser();
  const { data: tasks, loading: tasksLoading, error: tasksError, add: addTask, update: updateTask, remove: removeTask } = useTasks();
  const [descriptionDrafts, setDescriptionDrafts] = useState<Record<string, string>>({});
  const descriptionTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<{ taskId: string; field: 'startTime' | 'endTime' } | null>(null);
  const [categoryDropdownId, setCategoryDropdownId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers = descriptionTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const dateKey = formatDateKey(currentDate);
  const dayTasks = tasks
    .filter((t) => t.date === dateKey)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalMinutes = dayTasks.reduce((acc, t) => acc + Math.max(0, calcDurationMinutes(t.startTime, t.endTime)), 0);
  const completedCount = dayTasks.filter((t) => t.completed).length;

  const dateRange = buildDateRange(currentDate);

  const handleDateChange = (date: Date) => setCurrentDate(date);

  const reportError = (err: unknown, fallback: string) => {
    toast.error(err instanceof Error ? err.message : fallback);
  };

  const handleAddTask = () => {
    const newTask: Omit<Task, 'id'> = {
      date: dateKey,
      startTime: '09:00',
      endTime: '10:00',
      description: '',
      category: 'Work',
      completed: false,
    };
    addTask(newTask)
      .then(() => toast.success('Task added — fill in the details'))
      .catch((err) => reportError(err, 'Could not add task'));
  };

  const handleDeleteTask = (id: string) => {
    removeTask(id)
      .then(() => toast.success('Task removed'))
      .catch((err) => reportError(err, 'Could not delete task'));
  };

  // Swipe-left-to-delete on the mobile card layout. Fires past a distance
  // threshold or a fast flick; otherwise Motion springs the card back via
  // dragConstraints.
  const handleSwipeEnd = (id: string, info: PanInfo) => {
    if (info.offset.x < -100 || info.velocity.x < -500) {
      handleDeleteTask(id);
    }
  };

  const handleToggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    updateTask(id, { completed: !task.completed }).catch((err) =>
      reportError(err, 'Could not update task')
    );
  };

  // Reflects every keystroke locally right away (so the input stays snappy),
  // and debounces the Firestore write so rapid typing doesn't fire a write
  // per character.
  const handleDescriptionChange = (id: string, value: string) => {
    setDescriptionDrafts((prev) => ({ ...prev, [id]: value }));
    if (descriptionTimers.current[id]) clearTimeout(descriptionTimers.current[id]);
    descriptionTimers.current[id] = setTimeout(() => {
      updateTask(id, { description: value }).catch((err) =>
        reportError(err, 'Could not update task')
      );
    }, 500);
  };

  const handleCategoryChange = (id: string, cat: Category) => {
    updateTask(id, { category: cat }).catch((err) => reportError(err, 'Could not update task'));
    setCategoryDropdownId(null);
  };

  const openTimePicker = (taskId: string, field: 'startTime' | 'endTime') => {
    setTimePickerTarget({ taskId, field });
    setTimePickerOpen(true);
  };

  const handleTimeSelected = (time: string) => {
    if (!timePickerTarget) return;
    const { taskId, field } = timePickerTarget;
    const patch = field === 'startTime' ? { startTime: time } : { endTime: time };
    updateTask(taskId, patch).catch((err) => reportError(err, 'Could not update task'));
    setTimePickerOpen(false);
    setTimePickerTarget(null);
  };

  const handleExport = useCallback(() => {
    const lines = [
      `PlannerFlow — Daily Plan`,
      `Date: ${currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      ``,
      ...dayTasks.map(
        (t) =>
          `[${t.completed ? '✓' : ' '}] ${formatDisplayTime(t.startTime)} – ${formatDisplayTime(t.endTime)} (${calcDuration(t.startTime, t.endTime)}) | ${t.category} | ${t.description}`
      ),
      ``,
      `Total planned: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      `Completed: ${completedCount}/${dayTasks.length}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plannerflow-${dateKey}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Daily plan exported');
  }, [dayTasks, currentDate, dateKey, totalMinutes, completedCount]);

  const currentTimePickerValue = timePickerTarget
    ? tasks.find((t) => t.id === timePickerTarget.taskId)?.[timePickerTarget.field] ?? '09:00' :'09:00';

  if (authLoading || tasksLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
          <ListTodo size={28} className="text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Loading your planner…</h3>
        <p className="text-sm text-muted-foreground max-w-xs">Just a moment while we fetch your tasks.</p>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <ListTodo size={28} className="text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">Couldn&apos;t load your planner</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{tasksError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Planner</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleAddTask}
            className="flex items-center gap-2 px-4 py-2 gradient-primary text-white text-sm font-semibold rounded-xl shadow-soft hover:opacity-90 active:scale-95 transition-all duration-150"
          >
            <Plus size={16} />
            Add Task
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-sm font-medium text-foreground rounded-xl shadow-soft hover:bg-secondary active:scale-95 transition-all duration-150"
          >
            <Download size={16} className="text-primary" />
            Export
          </button>
        </div>
      </div>

      {/* Date bar */}
      <div className="bg-card rounded-2xl border border-border shadow-soft p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() - 7);
              setCurrentDate(d);
            }}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            {dateRange.map((date) => {
              const key = formatDateKey(date);
              const isActive = key === dateKey;
              const today = new Date(2026, 7, 20);
              const isTod = formatDateKey(date) === formatDateKey(today);
              const taskCount = tasks.filter((t) => t.date === key).length;
              return (
                <button
                  key={`datebar-${key}`}
                  onClick={() => handleDateChange(date)}
                  className={`flex flex-col items-center px-3 py-2 rounded-xl flex-shrink-0 min-w-[52px] transition-all duration-150 active:scale-95 ${
                    isActive
                      ? 'gradient-primary text-white shadow-soft'
                      : isTod
                      ? 'bg-primary/10 text-primary' :'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="text-xs font-medium">{DAY_NAMES[date.getDay()]}</span>
                  <span className="text-base font-bold font-tabular">{date.getDate()}</span>
                  <span className="text-xs opacity-70">{MONTH_SHORT[date.getMonth()]}</span>
                  {taskCount > 0 && (
                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isActive ? 'bg-white/70' : 'bg-primary/50'}`} />
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => {
              const d = new Date(currentDate);
              d.setDate(d.getDate() + 7);
              setCurrentDate(d);
            }}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-all duration-150 flex-shrink-0"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-2xl border border-border shadow-soft p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ListTodo size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Tasks</p>
            <p className="text-xl font-bold text-foreground font-tabular">{dayTasks.length}</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-soft p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Clock size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Planned</p>
            <p className="text-xl font-bold text-foreground font-tabular">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-soft p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Done</p>
            <p className="text-xl font-bold text-foreground font-tabular">
              {completedCount}/{dayTasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Task table */}
      <div className="bg-card rounded-3xl border border-border shadow-card overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 border-b border-border bg-secondary/50">
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Start</div>
          <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">End</div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duration</div>
          <div className="col-span-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Tag size={12} />
          </div>
          <div className="col-span-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></div>
        </div>

        {dayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <ListTodo size={28} className="text-primary" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No tasks planned yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Add your first time block to start building your day. Each task gets a start time, end time, and category.
            </p>
            <button
              onClick={handleAddTask}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 gradient-primary text-white text-sm font-semibold rounded-xl shadow-soft hover:opacity-90 active:scale-95 transition-all duration-150"
            >
              <Plus size={16} />
              Add First Task
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <AnimatePresence initial={false}>
              {dayTasks.map((task) => {
              const duration = calcDuration(task.startTime, task.endTime);
              const cfg = CATEGORY_CONFIG[task.category];

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={listItemVariants}
                  className="overflow-hidden"
                  style={{ backgroundColor: task.completed ? undefined : cfg.bg + '55' }}
                >
                  {/* Desktop row */}
                  <div className="hidden md:grid grid-cols-12 gap-3 px-6 py-3 items-center">
                    {/* Complete toggle */}
                    <div className="col-span-1">
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="transition-all duration-150 active:scale-95"
                        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? (
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        ) : (
                          <Circle size={20} className="text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                    </div>

                    {/* Start time */}
                    <div className="col-span-2">
                      <button
                        onClick={() => openTimePicker(task.id, 'startTime')}
                        className="flex items-center gap-1.5 text-sm font-semibold font-tabular text-foreground hover:text-primary transition-colors duration-150 bg-card/60 px-2.5 py-1.5 rounded-lg hover:bg-primary/10"
                        style={{ color: cfg.text }}
                      >
                        <Clock size={13} />
                        {formatDisplayTime(task.startTime)}
                      </button>
                    </div>

                    {/* End time */}
                    <div className="col-span-2">
                      <button
                        onClick={() => openTimePicker(task.id, 'endTime')}
                        className="flex items-center gap-1.5 text-sm font-semibold font-tabular hover:text-primary transition-colors duration-150 bg-card/60 px-2.5 py-1.5 rounded-lg hover:bg-primary/10"
                        style={{ color: cfg.text }}
                      >
                        <Clock size={13} />
                        {formatDisplayTime(task.endTime)}
                      </button>
                    </div>

                    {/* Duration */}
                    <div className="col-span-1">
                      <span className="text-xs font-semibold font-tabular px-2 py-1 rounded-lg bg-card/60" style={{ color: cfg.text }}>
                        {duration}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="col-span-4">
                      <input
                        type="text"
                        value={descriptionDrafts[task.id] ?? task.description}
                        onChange={(e) => handleDescriptionChange(task.id, e.target.value)}
                        placeholder="What are you working on?"
                        className={`w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 border-none outline-none focus:ring-0 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      />
                    </div>

                    {/* Category */}
                    <div className="col-span-1 relative" ref={categoryDropdownId === task.id ? dropdownRef : null}>
                      <button
                        onClick={() => setCategoryDropdownId(categoryDropdownId === task.id ? null : task.id)}
                        className="flex items-center gap-1"
                      >
                        <CategoryBadge category={task.category} size="sm" />
                      </button>
                      {categoryDropdownId === task.id && (
                        <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-2xl shadow-card p-2 min-w-[120px] animate-fade-in">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={`cat-opt-${cat}`}
                              onClick={() => handleCategoryChange(task.id, cat)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-secondary text-left transition-colors duration-100"
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: CATEGORY_CONFIG[cat].dot }}
                              />
                              <span className="text-xs font-medium text-foreground">{cat}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all duration-150 active:scale-95"
                        aria-label="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile card — swipe left to delete */}
                  <div className="md:hidden relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-end bg-red-500 pr-6">
                      <Trash2 size={20} className="text-white" />
                    </div>
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: -96, right: 0 }}
                      dragElastic={{ left: 0.2, right: 0 }}
                      dragTransition={{ bounceStiffness: 400, bounceDamping: 40 }}
                      onDragEnd={(_, info) => handleSwipeEnd(task.id, info)}
                      className="relative bg-card p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <button onClick={() => handleToggleComplete(task.id)} className="mt-0.5 flex-shrink-0">
                          {task.completed ? (
                            <CheckCircle2 size={20} className="text-emerald-500" />
                          ) : (
                            <Circle size={20} className="text-muted-foreground" />
                          )}
                        </button>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={descriptionDrafts[task.id] ?? task.description}
                            onChange={(e) => handleDescriptionChange(task.id, e.target.value)}
                            onPointerDownCapture={(e) => e.stopPropagation()}
                            placeholder="What are you working on?"
                            className={`w-full bg-transparent text-sm font-medium placeholder:text-muted-foreground/60 border-none outline-none ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                          />
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <button
                              onClick={() => openTimePicker(task.id, 'startTime')}
                              className="flex items-center gap-1 text-xs font-semibold font-tabular text-muted-foreground hover:text-primary"
                            >
                              <Clock size={11} />
                              {formatDisplayTime(task.startTime)}
                            </button>
                            <span className="text-muted-foreground text-xs">→</span>
                            <button
                              onClick={() => openTimePicker(task.id, 'endTime')}
                              className="flex items-center gap-1 text-xs font-semibold font-tabular text-muted-foreground hover:text-primary"
                            >
                              <Clock size={11} />
                              {formatDisplayTime(task.endTime)}
                            </button>
                            <span className="text-xs text-muted-foreground">({duration})</span>
                            <CategoryBadge category={task.category} size="sm" />
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 flex-shrink-0"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Add task footer */}
        {dayTasks.length > 0 && (
          <div className="border-t border-border px-6 py-3">
            <button
              onClick={handleAddTask}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-150"
            >
              <Plus size={16} />
              Add another task
            </button>
          </div>
        )}
      </div>

      {/* Time picker modal */}
      <AnimatePresence>
        {timePickerOpen && timePickerTarget && (
          <TimePickerModal
            key="time-picker"
            value={currentTimePickerValue}
            label={timePickerTarget.field === 'startTime' ? 'Start Time' : 'End Time'}
            onConfirm={handleTimeSelected}
            onClose={() => { setTimePickerOpen(false); setTimePickerTarget(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}