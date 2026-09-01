import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../styles/tailwind.css';
import AuthGate from '@/components/AuthGate';
import { AuthProvider } from '@/lib/useAuthUser';
import ThemeInit from '@/components/ThemeInit';

// Runs synchronously before first paint (no React yet) so there's no flash
// of the wrong theme on load. Mirrors the logic in src/lib/useTheme.ts,
// duplicated here in plain JS since it must execute standalone.
const THEME_INIT_SCRIPT = `(function(){try{var raw=localStorage.getItem('pf_settings');var theme='system';if(raw){var parsed=JSON.parse(raw);if(parsed.theme==='light'||parsed.theme==='dark'||parsed.theme==='system'){theme=parsed.theme;}}var isDark=theme==='dark'||(theme==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark){document.documentElement.classList.add('dark');}}catch(e){}})();`;

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6C63FF',
};

export const metadata: Metadata = {
  title: 'PlannerFlow — Your Calm Daily Planner',
  description:
    'PlannerFlow helps you plan your day with time-blocked tasks, category tracking, analytics, and reminders — all in a calm, minimal interface.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: [{ url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={plusJakartaSans.variable}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className={plusJakartaSans.className}>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ThemeInit />
        <AuthProvider>
          <AuthGate>{children}</AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}