'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getMovements } from '@/lib/firestore';
import { getTodayWorkout, createWorkout, addEntryToWorkout, updateEntry, deleteEntry, completeWorkout } from '@/lib/firestore';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutList from '@/components/WorkoutList';
import UndoToast from '@/components/UndoToast';
import { SkeletonList } from '@/components/Skeleton';
import { CheckCircle } from 'lucide-react';
import type { Movement, Workout, WorkoutEntry } from '@/types';

export default function HomePage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [finishState, setFinishState] = useState<'idle' | 'confirm' | 'done'>('idle');
  const [undoState, setUndoState] = useState<{ entries: WorkoutEntry[]; movementName: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([getMovements(user.uid), getTodayWorkout(user.uid)])
      .then(([m, w]) => { setMovements(m); setWorkout(w); })
      .catch((err) => {
        console.error('Failed to load home page data:', err);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const ensureWorkout = useCallback(async (): Promise<string> => {
    if (workout) return workout.id;
    const today = new Date().toISOString().split('T')[0];
    const id = await createWorkout(user!.uid, today);
    const newWorkout: Workout = { id, date: today, entries: [], createdAt: Date.now(), completed: false };
    setWorkout(newWorkout);
    return id;
  }, [workout, user]);

  const handleLogSet = useCallback(async (data: Omit<WorkoutEntry, 'id' | 'createdAt'>) => {
    const wId = await ensureWorkout();
    const entry: WorkoutEntry = { ...data, id: crypto.randomUUID(), createdAt: Date.now() };
    setWorkout((prev) => prev ? { ...prev, entries: [...prev.entries, entry] } : prev);
    await addEntryToWorkout(user!.uid, wId, entry);
  }, [ensureWorkout, user]);

  const handleUpdateEntry = useCallback(async (entryId: string, data: Partial<WorkoutEntry>) => {
    if (!workout) return;
    setWorkout((prev) => prev ? { ...prev, entries: prev.entries.map((e) => e.id === entryId ? { ...e, ...data } : e) } : prev);
    await updateEntry(user!.uid, workout.id, entryId, data);
  }, [workout, user]);

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    if (!workout) return;
    setWorkout((prev) => prev ? { ...prev, entries: prev.entries.filter((e) => e.id !== entryId) } : prev);
    await deleteEntry(user!.uid, workout.id, entryId);
  }, [workout, user]);

  const handleDuplicateEntry = useCallback(async (entry: WorkoutEntry) => {
    await handleLogSet({ movementName: entry.movementName, reps: entry.reps, weight: entry.weight, unit: entry.unit, notes: '' });
  }, [handleLogSet]);

  const handleDeleteMovement = useCallback(async (movementName: string) => {
    if (!workout) return;
    const removed = workout.entries.filter((e) => e.movementName === movementName);
    setUndoState({ entries: removed, movementName });
    setWorkout((prev) => prev ? { ...prev, entries: prev.entries.filter((e) => e.movementName !== movementName) } : prev);
  }, [workout]);

  const handleUndoDeleteMovement = useCallback(() => {
    if (!undoState || !workout) return;
    setWorkout((prev) => prev ? { ...prev, entries: [...prev.entries, ...undoState.entries] } : prev);
    setUndoState(null);
  }, [undoState, workout]);

  const handleFinish = useCallback(async () => {
    if (finishState === 'idle') { setFinishState('confirm'); setTimeout(() => setFinishState('idle'), 3000); return; }
    if (finishState === 'confirm' && workout) {
      await completeWorkout(user!.uid, workout.id);
      setFinishState('done');
      setTimeout(() => { setWorkout(null); setFinishState('idle'); }, 2000);
    }
  }, [finishState, workout, user]);

  const entries = workout?.entries || [];
  const totalVolume = entries.reduce((sum, e) => sum + e.weight * e.reps, 0);
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  if (loading) return <SkeletonList count={3} />;

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Workout</h1>
      <WorkoutForm movements={movements} lastEntry={lastEntry} onLogSet={handleLogSet} />

      {entries.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">
              Logged Sets
              <span className="ml-2 text-sm font-normal text-text-tertiary">{entries.length} sets · {totalVolume.toLocaleString()} {settings.unit} total</span>
            </h2>
          </div>
          <WorkoutList entries={entries} onUpdateEntry={handleUpdateEntry} onDeleteEntry={handleDeleteEntry} onDuplicateEntry={handleDuplicateEntry} onDeleteMovement={handleDeleteMovement} />

          <button onClick={handleFinish} className={`mt-2 w-full rounded-sm py-3.5 text-lg font-bold active:scale-95 ${finishState === 'done' ? 'bg-success text-white' : finishState === 'confirm' ? 'bg-warning text-black' : 'bg-accent text-text-on-accent shadow-[var(--shadow-btn)]'}`}>
            {finishState === 'done' ? <span className="flex items-center justify-center gap-2"><CheckCircle size={20} /> Done! {entries.length} sets · {totalVolume.toLocaleString()} {settings.unit}</span> : finishState === 'confirm' ? 'Tap again to confirm' : 'Finish Workout'}
          </button>
        </>
      )}

      {undoState && <UndoToast message={`Deleted ${undoState.movementName}`} onUndo={handleUndoDeleteMovement} onDismiss={() => { setUndoState(null); /* persist deletions */ if (workout) { undoState.entries.forEach((e) => deleteEntry(user!.uid, workout.id, e.id)); } }} />}
    </div>
  );
}
