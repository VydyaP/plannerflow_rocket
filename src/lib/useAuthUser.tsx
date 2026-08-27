'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthUserState {
  user: User | null;
  uid: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthUserState | undefined>(undefined);

// Owns the single onAuthStateChanged listener for the whole app. Mounted
// once in the root layout so auth state survives client-side route changes
// instead of every page re-subscribing (and re-waiting) on navigation.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, uid: user?.uid ?? null, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Reports the signed-in Firebase user (or null). Does not sign anyone in —
// pair with AuthGate, which shows a "Sign in with Google" screen when there's
// no user, and signInWithGoogle()/signOutUser() below to change auth state.
export function useAuthUser(): AuthUserState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthUser must be used within an AuthProvider');
  return ctx;
}

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await signInWithPopup(auth, provider);
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
