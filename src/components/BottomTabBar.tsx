'use client';
import React from 'react';
import Link from 'next/link';
import { CalendarDays, LayoutList, BarChart2, Bell, Settings, UserCircle } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const TABS = [
  { href: '/', label: 'Calendar', icon: CalendarDays },
  { href: '/daily-planner', label: 'Planner', icon: LayoutList },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/reminders', label: 'Reminders', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/account', label: 'Account', icon: UserCircle },
];

interface BottomTabBarProps {
  activePath: string;
}

export default function BottomTabBar({ activePath }: BottomTabBarProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border shadow-card">
      <div className="flex items-center justify-around h-16 px-2">
        {TABS.map((tab) => {
          const isActive = activePath === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={`tab-${tab.href}`}
              href={tab.href}
              className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-all duration-150 ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}