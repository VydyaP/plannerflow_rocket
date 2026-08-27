import React from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';

export const metadata = { title: 'Privacy Policy — PlannerFlow' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
            <Flame size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-foreground">PlannerFlow</span>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-soft p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-xs text-muted-foreground mt-1">Last updated: August 27, 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Information we collect
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you sign in with Google, we receive your name, email address, and profile
              photo through Firebase Authentication. When you use the app, the tasks and
              reminders you create — including their titles, times, dates, and categories —
              are stored under your account in Firebase Firestore.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              How we use it
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your account info and planner data are used solely to provide PlannerFlow&apos;s
              features — showing your name/photo in the app, and keeping your tasks and
              reminders synced across every device you sign in on.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Where it&apos;s stored
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All data is stored on Google Firebase (Authentication and Firestore). We do not
              sell, rent, or share your personal information or planner data with any third
              party.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Deleting your data
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can delete individual tasks and reminders at any time directly in the app.
              To request deletion of your entire account and all associated data, email{' '}
              <a href="mailto:vydyanpandithtv@gmail.com" className="text-primary underline">
                vydyanpandithtv@gmail.com
              </a>{' '}
              and we&apos;ll remove it promptly.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Contact
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Questions about this policy? Reach out at{' '}
              <a href="mailto:vydyanpandithtv@gmail.com" className="text-primary underline">
                vydyanpandithtv@gmail.com
              </a>
              .
            </p>
          </section>

          <div className="pt-2 border-t border-border">
            <Link href="/" className="text-sm text-primary hover:underline">
              &larr; Back to PlannerFlow
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
