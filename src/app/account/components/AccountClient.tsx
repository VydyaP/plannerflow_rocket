'use client';
import React, { useState } from 'react';
import {
  User,
  Mail,
  LogOut,
  Shield,
  Bell,
  Smartphone,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuthUser, signOutUser } from '@/lib/useAuthUser';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AccountSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

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

function getInitials(name: string | null, email: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (email ?? '?').slice(0, 2).toUpperCase();
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
  const { user } = useAuthUser();
  const [signingOut, setSigningOut] = useState(false);
  const [photoError, setPhotoError] = useState(false);

  const name = user?.displayName ?? 'Your Name';
  const email = user?.email ?? '';
  const photoURL = user?.photoURL ?? null;
  const initials = getInitials(user?.displayName ?? null, user?.email ?? null);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOutUser();
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Profile card */}
      <Section title="Profile">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          {photoURL && !photoError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoURL}
              alt={name}
              referrerPolicy="no-referrer"
              onError={() => setPhotoError(true)}
              className="w-16 h-16 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">{initials}</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <User size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-base font-semibold text-foreground truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-muted-foreground truncate">{email}</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Google account */}
      <Section title="Google Account">
        <div className="space-y-4">
          {/* Status row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Signed in</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your tasks and reminders are synced to this Google account.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={12} />
              Connected
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <LogOut size={16} />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
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
                title="Coming soon"
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
