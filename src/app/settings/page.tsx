import React from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsClient from './components/SettingsClient';

export const metadata = { title: 'Settings — PlannerFlow' };

export default function SettingsPage() {
  return (
    <AppLayout activePath="/settings">
      <SettingsClient />
    </AppLayout>
  );
}
