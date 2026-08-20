'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Task, Reminder } from '@/lib/plannerData';

interface FirestoreCollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  add: (item: Omit<T, 'id'>) => Promise<string | undefined>;
  update: (id: string, patch: Partial<Omit<T, 'id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

// Generic live-synced Firestore subcollection under users/{uid}/{collectionName}.
// Firestore's snapshot listener reflects local writes before the server
// acknowledges them, so add/update/remove feel instant without any manual
// optimistic-state bookkeeping in the components that call this hook.
function useFirestoreCollectionInternal<T extends { id: string }>(
  uid: string | null,
  collectionName: string,
  sortField: Extract<keyof T, string>
): FirestoreCollectionState<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setData([]);
      setLoading(true);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'users', uid, collectionName),
      orderBy(sortField)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(
          snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as T))
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid, collectionName, sortField]);

  const add = useCallback(
    async (item: Omit<T, 'id'>) => {
      if (!uid) return undefined;
      const ref = doc(collection(db, 'users', uid, collectionName));
      await setDoc(ref, item);
      return ref.id;
    },
    [uid, collectionName]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<T, 'id'>>) => {
      if (!uid) return;
      await updateDoc(doc(db, 'users', uid, collectionName, id), patch);
    },
    [uid, collectionName]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!uid) return;
      await deleteDoc(doc(db, 'users', uid, collectionName, id));
    },
    [uid, collectionName]
  );

  return { data, loading, error, add, update, remove };
}

interface DataContextValue {
  tasks: FirestoreCollectionState<Task>;
  reminders: FirestoreCollectionState<Reminder>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

// Owns the single set of Firestore listeners (tasks + reminders) for the
// signed-in user. Mounted once by AuthGate once a user exists, so it
// survives client-side route changes instead of every page opening its own
// fresh onSnapshot listener and re-waiting for the first snapshot.
export function DataProvider({ uid, children }: { uid: string; children: ReactNode }) {
  const tasks = useFirestoreCollectionInternal<Task>(uid, 'tasks', 'date');
  const reminders = useFirestoreCollectionInternal<Reminder>(uid, 'reminders', 'date');

  return (
    <DataContext.Provider value={{ tasks, reminders }}>
      {children}
    </DataContext.Provider>
  );
}

export function useTasks(): FirestoreCollectionState<Task> {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useTasks must be used within a DataProvider');
  return ctx.tasks;
}

export function useReminders(): FirestoreCollectionState<Reminder> {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useReminders must be used within a DataProvider');
  return ctx.reminders;
}
