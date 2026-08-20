'use client';
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface WeeklyBarChartProps {
  data: { label: string; hours: number }[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-card px-4 py-3">
        <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
        <p className="text-lg font-bold text-foreground font-tabular">{payload[0].value}h</p>
        <p className="text-xs text-muted-foreground">planned</p>
      </div>
    );
  }
  return null;
};

export default function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const max = Math.max(...data.map((d) => d.hours));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.5} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--secondary)', radius: 8 }} />
        <Bar dataKey="hours" radius={[6, 6, 0, 0]} fill="url(#barGrad)">
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.hours === max ? 'var(--primary)' : 'url(#barGrad)'}
              opacity={entry.hours === 0 ? 0.3 : 1}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}