'use client';

import { useTheme } from '@/lib/useTheme';

// Mounted once at the root so the dark/light class stays in sync app-wide
// (including on the sign-in screen, before AuthGate renders any page
// content). Renders nothing — see useTheme.ts for the actual logic.
export default function ThemeInit() {
  useTheme();
  return null;
}
