'use client';
import React, { useState } from 'react';
import {
  User,
  Mail,
  RefreshCw,
  LogIn,
  Shield,
  Bell,
  Smartphone,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type SyncStatus = 'connected' | 'pending' | 'disconnected';

interface AccountSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

// ─── Mock placeholder data (replace with real auth data when Google auth connects) ──

const PLACEHOLDER_USER = {
  name: 'Your Name',
  email: 'yourname@gmail.com',
  avatarInitials: 'YN',
  syncStatus: 'disconnected' as SyncStatus,
  lastSynced: null as string | null,
};

const ACCOUNT_SETTINGS: AccountSetting[] = [
  {
    id: 'notifications',
    label: 'Notification Preferences',
    description: 'Manage how and when you receive alerts',
    icon: <Bell size={18} />,
  },
  {
    id: 'devices',
    label: 'Connected Devices',
    description: 'View devices linked to your account',
    icon: <Smartphone size={18} />,
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    description: 'Control your data and account security',
    icon: <Shield size={18} />,
  },
];

// ─── Sync status badge ────────────────────────────────────────────────────────

function SyncBadge({ status }: { status: SyncStatus }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 size={12} />
        Synced
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={12} />
        Syncing…
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-muted-foreground border border-border">
      <AlertCircle size={12} />
      Not connected
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-soft overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-secondary/30">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AccountClient() {
  const [user] = useState(PLACEHOLDER_USER);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and Google sync settings
        </p>
      </div>

      {/* Profile card */}
      <Section title="Profile">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary">{user.avatarInitials}</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <User size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-base font-semibold text-foreground truncate">{user.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Google Sync */}
      <Section title="Google Sync">
        <div className="space-y-4">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Sync status</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.syncStatus === 'connected' && user.lastSynced
                  ? `Last synced ${user.lastSynced}`
                  : 'Connect your Google account to sync data across devices'}
              </p>
            </div>
            <SyncBadge status={user.syncStatus} />
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Connect button */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-secondary/50 text-sm font-medium text-muted-foreground cursor-not-allowed opacity-70 transition-all"
            title="Google auth coming soon"
          >
            <LogIn size={16} />
            Sign in with Google
          </button>

          {/* Info note */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
            <RefreshCw size={14} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Google authentication is not yet wired up. This page is ready to display your real
              name, email, and sync status once connected.
            </p>
          </div>
        </div>
      </Section>

      {/* Account settings */}
      <Section title="Account Settings">
        <ul className="space-y-1">
          {ACCOUNT_SETTINGS.map((setting, idx) => (
            <li key={setting.id}>
              <button
                disabled
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left hover:bg-secondary transition-all duration-150 group opacity-60 cursor-not-allowed"
                title="Available after Google auth connects"
              >
                <span className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0">
                  {setting.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{setting.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{setting.description}</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
              </button>
              {idx < ACCOUNT_SETTINGS.length - 1 && (
                <div className="ml-16 border-t border-border/50" />
              )}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
