'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
import { Flame, LayoutList, BarChart2, Bell } from 'lucide-react';
import { useAuthUser, signInWithGoogle } from '@/lib/useAuthUser';
import { DataProvider } from '@/lib/useFirestoreCollection';
import { fadeInUp } from '@/lib/motion';

// Routes that must stay reachable without signing in — e.g. the privacy
// policy, which Play Console's review and data-safety checks fetch directly.
const PUBLIC_PATHS = ['/privacy'];

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 16 4 9 8.5 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.5 35.4 26.9 36 24 36c-5.3 0-9.7-3.1-11.3-7.9l-6.6 5.1C9 39.5 16 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.4C41.4 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
    </svg>
  );
}

function LoadingSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

const HIGHLIGHTS = [
  { icon: LayoutList, label: 'Time-blocked daily planning' },
  { icon: BarChart2, label: 'Analytics on how you spend your day' },
  { icon: Bell, label: 'Reminders that repeat the way you do' },
];

function SignInScreen() {
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
      setSigningIn(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center bg-background px-4">
      {/* Soft decorative background — brand-colored blurred blobs, kept subtle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={fadeInUp}
        className="relative w-full max-w-sm bg-card border border-border rounded-3xl shadow-card p-8 text-center"
      >
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-soft">
          <Flame size={30} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Welcome to PlannerFlow</h1>
        <p className="text-sm text-muted-foreground mt-1.5 mb-6">
          Sign in with Google to sync your day across every device.
        </p>

        <div className="space-y-3 mb-6 text-left">
          {HIGHLIGHTS.map(({ icon: HighlightIcon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <HighlightIcon size={15} className="text-primary" />
              </div>
              <span className="text-sm text-foreground">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-soft hover:bg-secondary active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <GoogleIcon />
          {signingIn ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      </motion.div>
    </div>
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuthUser();

  if (PUBLIC_PATHS.includes(pathname)) return <>{children}</>;
  if (loading) return <LoadingSplash />;
  if (!user) return <SignInScreen />;
  return <DataProvider uid={user.uid}>{children}</DataProvider>;
}
