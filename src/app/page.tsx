import React from 'react';
import AppLayout from '@/components/AppLayout';
import CalendarGrid from './components/CalendarGrid';

export default function HomePage() {
  return (
    <AppLayout activePath="/">
      <CalendarGrid />
    </AppLayout>
  );
}