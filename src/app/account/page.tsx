import React from 'react';
import AppLayout from '@/components/AppLayout';
import AccountClient from './components/AccountClient';

export const metadata = { title: 'Account — PlannerFlow' };

export default function AccountPage() {
  return (
    <AppLayout activePath="/account">
      <AccountClient />
    </AppLayout>
  );
}
