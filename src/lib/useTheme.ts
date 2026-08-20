'use client';

import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'pf_settings';

function readStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 'system';
    const parsed = JSON.parse(raw);
    if (parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system') {
      return parsed.theme;
    }
  } catch {
    // ignore malformed storage
  }
  return 'system';
}

function prefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeClass(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', isDark);
}

// Reads/writes the theme mode from the same `pf_settings` localStorage object
// Settings already uses for categories/reminder defaults, and applies the
// `dark` class to <html>. A synchronous inline script in layout.tsx handles
// the very first paint (see ThemeInit.tsx) — this hook keeps things in sync
// afterward and reacts to live OS theme changes when mode is "system".
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyThemeClass(stored);
  }, []);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeClass('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    applyThemeClass(mode);
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, theme: mode }));
    } catch {
      // ignore storage write failures (e.g. private browsing quota)
    }
  }, []);

  return { theme, setTheme };
}
