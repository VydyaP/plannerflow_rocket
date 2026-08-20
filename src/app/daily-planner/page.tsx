import React, { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import DailyPlannerClient from './components/DailyPlannerClient';

function DailyPlannerContent() {
  return (
    <AppLayout activePath="/daily-planner">
      <DailyPlannerClient />
    </AppLayout>
  );
}

export default function DailyPlannerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DailyPlannerContent />
    </Suspense>
  );
}