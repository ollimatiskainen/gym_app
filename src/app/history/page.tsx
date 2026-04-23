'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWorkouts, updateEntry, deleteEntry, deleteWorkout } from '@/lib/firestore';
import WorkoutList from '@/components/WorkoutList';
import { SkeletonList } from '@/components/Skeleton';
import StaggeredList from '@/components/StaggeredList';
import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import type { Workout, WorkoutEntry } from '@/types';

function getWeekKey(dateStr: string) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day;
  const sunday = new Date(d.setDate(diff));
  return sunday.toISOString().split('T')[0];
}

function formatWeekHeader(weekStart: string) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `Week of ${fmt(start)} — ${fmt(end)}`;
}

function relativeDate(dateStr: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  const d = new Date(dateStr);
  const dayDiff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (dayDiff < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ConfirmModal({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-[90%] max-w-sm animate-modal-in rounded-sm bg-bg-secondary p-6 card-depth" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-lg font-bold text-text-primary">{title}</h3>
        <p className="mb-5 text-sm text-text-secondary">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-sm border border-border py-2.5 font-medium text-text-secondary hover:bg-bg-tertiary active:scale-95">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-sm bg-danger py-2.5 font-bold text-white hover:bg-danger-hover active:scale-95">Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ type: 'workout' | 'movement'; workoutId: string; movementName?: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    getWorkouts(user.uid)
      .then(setWorkouts)
      .catch((err) => console.error('Failed to load history:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = (id: string) => setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleUpdateEntry = useCallback(async (workoutId: string, entryId: string, data: Partial<WorkoutEntry>) => {
    setWorkouts((prev) => prev.map((w) => w.id === workoutId ? { ...w, entries: w.entries.map((e) => e.id === entryId ? { ...e, ...data } : e) } : w));
    await updateEntry(user!.uid, workoutId, entryId, data);
  }, [user]);

  const handleDeleteEntry = useCallback(async (workoutId: string, entryId: string) => {
    setWorkouts((prev) => prev.map((w) => w.id === workoutId ? { ...w, entries: w.entries.filter((e) => e.id !== entryId) } : w).filter((w) => w.entries.length > 0));
    await deleteEntry(user!.uid, workoutId, entryId);
  }, [user]);

  const handleDuplicateEntry = useCallback(async (workoutId: string, entry: WorkoutEntry) => {
    const newEntry: WorkoutEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() };
    setWorkouts((prev) => prev.map((w) => w.id === workoutId ? { ...w, entries: [...w.entries, newEntry] } : w));
    const { addEntryToWorkout } = await import('@/lib/firestore');
    await addEntryToWorkout(user!.uid, workoutId, newEntry);
  }, [user]);

  const confirmDeleteWorkout = useCallback(async () => {
    if (!modal || modal.type !== 'workout') return;
    setWorkouts((prev) => prev.filter((w) => w.id !== modal.workoutId));
    await deleteWorkout(user!.uid, modal.workoutId);
    setModal(null);
  }, [modal, user]);

  const confirmDeleteMovement = useCallback(async () => {
    if (!modal || modal.type !== 'movement' || !modal.movementName) return;
    setWorkouts((prev) => prev.map((w) => w.id === modal.workoutId ? { ...w, entries: w.entries.filter((e) => e.movementName !== modal.movementName) } : w).filter((w) => w.entries.length > 0));
    const wo = workouts.find((w) => w.id === modal.workoutId);
    if (wo) {
      const toDelete = wo.entries.filter((e) => e.movementName === modal.movementName);
      for (const e of toDelete) await deleteEntry(user!.uid, modal.workoutId, e.id);
    }
    setModal(null);
  }, [modal, user, workouts]);

  // Group by week
  const weeks = new Map<string, Workout[]>();
  for (const w of workouts) { const k = getWeekKey(w.date); weeks.set(k, [...(weeks.get(k) || []), w]); }

  if (loading) return <div className="py-4"><SkeletonList count={4} /></div>;

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">History</h1>
      {workouts.length === 0 ? (
        <p className="py-8 text-center text-text-tertiary">No workouts yet. Start logging!</p>
      ) : (
        <StaggeredList>
          {Array.from(weeks.entries()).map(([weekKey, weekWorkouts]) => (
            <div key={weekKey} className="mb-4">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-accent">{formatWeekHeader(weekKey)}</h2>
              <div className="flex flex-col gap-2">
                {weekWorkouts.map((w) => {
                  const isOpen = expanded.has(w.id);
                  const movements = [...new Set(w.entries.map((e) => e.movementName))];
                  return (
                    <div key={w.id} className="rounded-sm bg-bg-secondary card-depth overflow-hidden">
                      <div className="flex w-full items-center justify-between p-4 text-left">
                        <div className="flex-1 cursor-pointer" onClick={() => toggle(w.id)}>
                          <p className="font-bold text-text-primary">{relativeDate(w.date)}</p>
                          <p className="mt-0.5 text-xs text-text-tertiary truncate">{movements.join(', ')}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{w.entries.length}</span>
                          <button onClick={() => setModal({ type: 'workout', workoutId: w.id })} className="p-1 text-text-tertiary hover:text-danger active:scale-90"><Trash2 size={16} /></button>
                          <div className="cursor-pointer p-1" onClick={() => toggle(w.id)}>
                            {isOpen ? <ChevronUp size={18} className="text-text-tertiary" /> : <ChevronDown size={18} className="text-text-tertiary" />}
                          </div>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="border-t border-border p-4">
                          <WorkoutList
                            entries={w.entries}
                            onUpdateEntry={(eid, data) => handleUpdateEntry(w.id, eid, data)}
                            onDeleteEntry={(eid) => handleDeleteEntry(w.id, eid)}
                            onDuplicateEntry={(entry) => handleDuplicateEntry(w.id, entry)}
                            onDeleteMovement={(name) => setModal({ type: 'movement', workoutId: w.id, movementName: name })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </StaggeredList>
      )}
      {modal?.type === 'workout' && <ConfirmModal title="Delete Workout" message="This will permanently delete this workout and all its sets." onConfirm={confirmDeleteWorkout} onCancel={() => setModal(null)} />}
      {modal?.type === 'movement' && <ConfirmModal title="Delete Movement" message={`Delete all sets of "${modal.movementName}" from this workout?`} onConfirm={confirmDeleteMovement} onCancel={() => setModal(null)} />}
    </div>
  );
}
