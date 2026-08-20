'use client';
import React, { useState } from 'react';
import { Clock, CheckCircle2, Flame, TrendingUp, Calendar } from 'lucide-react';
import { MOCK_TASKS, CATEGORY_CONFIG, CATEGORY_CHART_COLORS, calcDurationMinutes } from '@/lib/plannerData';
import type { Category } from '@/lib/plannerData';
import CategoryPieChart from './CategoryPieChart';
import WeeklyBarChart from './WeeklyBarChart';

// Build weekly data for Aug 14–20 2026
const WEEK_DAYS = [
  { label: 'Thu 14', date: '2026-08-14' },
  { label: 'Fri 15', date: '2026-08-15' },
  { label: 'Sat 16', date: '2026-08-16' },
  { label: 'Sun 17', date: '2026-08-17' },
  { label: 'Mon 18', date: '2026-08-18' },
  { label: 'Tue 19', date: '2026-08-19' },
  { label: 'Wed 20', date: '2026-08-20' },
];

// Supplement with realistic mock hours for days without tasks
const SUPPLEMENTAL_HOURS: Record<string, number> = {
  '2026-08-14': 5.5,
  '2026-08-15': 2.0,
  '2026-08-16': 0.5,
};

function getHoursForDate(date: string): number {
  const tasks = MOCK_TASKS.filter((t) => t.date === date);
  if (tasks.length > 0) {
    const mins = tasks.reduce((acc, t) => acc + Math.max(0, calcDurationMinutes(t.startTime, t.endTime)), 0);
    return Math.round((mins / 60) * 10) / 10;
  }
  return SUPPLEMENTAL_HOURS[date] ?? 0;
}

function getCategoryBreakdown() {
  const totals: Partial<Record<Category, number>> = {};
  MOCK_TASKS.forEach((t) => {
    const mins = Math.max(0, calcDurationMinutes(t.startTime, t.endTime));
    totals[t.category] = (totals[t.category] ?? 0) + mins;
  });
  return Object.entries(totals).map(([cat, mins]) => ({
    name: cat as Category,
    value: Math.round((mins / 60) * 10) / 10,
    color: CATEGORY_CHART_COLORS[cat as Category],
  })).sort((a, b) => b.value - a.value);
}

function getWeeklyTableData() {
  return WEEK_DAYS.map((day) => {
    const tasks = MOCK_TASKS.filter((t) => t.date === day.date);
    const hours = getHoursForDate(day.date);
    const completed = tasks.filter((t) => t.completed).length;
    const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : null;
    return { label: day.label, date: day.date, tasks: tasks.length, hours, completed, rate };
  });
}

export default function AnalyticsClient() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const categoryData = getCategoryBreakdown();
  const weeklyData = WEEK_DAYS.map((d) => ({ label: d.label, hours: getHoursForDate(d.date) }));
  const tableData = getWeeklyTableData();

  const totalHours = weeklyData.reduce((acc, d) => acc + d.hours, 0);
  const avgHours = Math.round((totalHours / 7) * 10) / 10;
  const topCat = categoryData[0];
  const allTasks = MOCK_TASKS.filter((t) => WEEK_DAYS.some((d) => d.date === t.date));
  const completedAll = allTasks.filter((t) => t.completed).length;
  const completionRate = allTasks.length > 0 ? Math.round((completedAll / allTasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your productivity patterns at a glance</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-xl p-1">
          {(['week', 'month'] as const).map((p) => (
            <button
              key={`period-${p}`}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 capitalize ${
                period === p ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards — 4 cards, 2x2 grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock size={16} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Hours</p>
          </div>
          <p className="text-3xl font-bold text-foreground font-tabular">{totalHours.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground mt-1">this week</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daily Avg</p>
          </div>
          <p className="text-3xl font-bold text-foreground font-tabular">{avgHours}h</p>
          <p className="text-xs text-muted-foreground mt-1">per day</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-emerald-600" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion</p>
          </div>
          <p className="text-3xl font-bold text-foreground font-tabular">{completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">{completedAll}/{allTasks.length} tasks done</p>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
              <Flame size={16} className="text-amber-500" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Top Category</p>
          </div>
          {topCat && (
            <>
              <span
                className="inline-flex items-center gap-1.5 text-sm font-bold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: CATEGORY_CONFIG[topCat.name].bg, color: CATEGORY_CONFIG[topCat.name].text }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[topCat.name].dot }} />
                {topCat.name}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{topCat.value}h this week</p>
            </>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar chart — daily hours */}
        <div className="lg:col-span-3 bg-card rounded-3xl border border-border shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Daily Hours Planned</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Aug 14–20, 2026</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar size={13} />
              Week view
            </div>
          </div>
          <WeeklyBarChart data={weeklyData} />
        </div>

        {/* Pie chart — category breakdown */}
        <div className="lg:col-span-2 bg-card rounded-3xl border border-border shadow-card p-6">
          <div className="mb-4">
            <h3 className="text-base font-bold text-foreground">Time by Category</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Hours this week</p>
          </div>
          <CategoryPieChart data={categoryData} />
          <div className="space-y-2 mt-4">
            {categoryData.map((cat) => (
              <div key={`cat-leg-${cat.name}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-medium text-foreground">{cat.name}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground font-tabular">{cat.value}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly summary table */}
      <div className="bg-card rounded-3xl border border-border shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold text-foreground">Weekly Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Day</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasks</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hours</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completion</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tableData.map((row) => (
                <tr key={`trow-${row.date}`} className="hover:bg-secondary/40 transition-colors duration-100">
                  <td className="px-6 py-3 text-sm font-semibold text-foreground">{row.label}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-tabular">{row.tasks}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground font-tabular">{row.hours}h</td>
                  <td className="px-4 py-3">
                    {row.rate !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${row.rate}%`, backgroundColor: row.rate >= 80 ? '#10B981' : row.rate >= 50 ? '#F59E0B' : '#EF4444' }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground font-tabular">{row.rate}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No tasks</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.hours === 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">Rest day</span>
                    ) : row.hours >= 6 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Productive</span>
                    ) : row.hours >= 3 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Moderate</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--cat-personal)', color: 'var(--cat-personal-text)' }}>Light</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}