'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import {
  CalendarDays,
  LayoutList,
  BarChart2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCircle,
} from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const NAV_ITEMS = [
  { href: '/', label: 'Calendar', icon: CalendarDays, badge: null },
  { href: '/daily-planner', label: 'Daily Planner', icon: LayoutList, badge: null },
  { href: '/analytics', label: 'Analytics', icon: BarChart2, badge: null },
  { href: '/reminders', label: 'Reminders', icon: Bell, badge: 3 },
  { href: '/settings', label: 'Settings', icon: Settings, badge: null },
  { href: '/account', label: 'Account', icon: UserCircle, badge: null },
];

interface SidebarProps {
  activePath: string;
}

export default function Sidebar({ activePath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 h-screen bg-card border-r border-border shadow-soft z-30 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-border px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-bold text-lg text-foreground tracking-tight">PlannerFlow</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-600 text-muted-foreground uppercase tracking-widest px-3 pb-2">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={`nav-${item.href}`}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-primary/10 text-primary shadow-soft'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="bg-accent text-accent-foreground text-xs font-700 rounded-full w-5 h-5 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span className="absolute top-1 right-1 bg-accent text-accent-foreground text-xs font-700 rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badge}
                </span>
              )}
              {collapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-foreground text-background text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity duration-150 z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}