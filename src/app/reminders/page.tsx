import React from 'react';
import AppLayout from '@/components/AppLayout';
import RemindersClient from './components/RemindersClient';

export default function RemindersPage() {
  return (
    <AppLayout activePath="/reminders">
      <RemindersClient />
    </AppLayout>
  );
}