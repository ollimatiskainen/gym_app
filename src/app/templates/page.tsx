'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { getTemplates, deleteTemplate, reorderTemplates, getMovements, getTodayWorkout, createWorkout, addEntriesToWorkout, createTemplate } from '@/lib/firestore';
import TemplateEditor from '@/components/TemplateEditor';
import { SkeletonList } from '@/components/Skeleton';
import { Play, Pencil, Trash2, ArrowUp, ArrowDown, CheckCircle, Loader2, Save } from 'lucide-react';
import type { Template, Movement, WorkoutEntry } from '@/types';

export default function TemplatesPage() {
  const { user } = useAuth();
  const { settings } = useSettings();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [loadedTemplate, setLoadedTemplate] = useState<string | null>(null);
  const [todayHasEntries, setTodayHasEntries] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getTemplates(user.uid), getMovements(user.uid), getTodayWorkout(user.uid)])
      .then(([t, m, w]) => { setTemplates(t); setMovements(m); setTodayHasEntries(!!(w && w.entries.length > 0)); })
      .catch((err) => console.error('Failed to load templates:', err))
      .finally(() => setLoading(false));
  }, [user]);

  const handleLoad = useCallback(async (template: Template) => {
    if (!user) return;
    setLoadingTemplate(template.id);
    const today = new Date().toISOString().split('T')[0];
    let workout = await getTodayWorkout(user.uid);
    if (!workout) {
      const id = await createWorkout(user.uid, today);
      workout = { id, date: today, entries: [], createdAt: Date.now(), completed: false };
    }
    const entries: WorkoutEntry[] = template.entries.map((e) => ({
      id: crypto.randomUUID(), movementName: e.movementName, reps: e.reps, weight: e.weight, unit: e.unit, notes: '', createdAt: Date.now(),
    }));
    await addEntriesToWorkout(user.uid, workout.id, entries);
    setLoadingTemplate(null);
    setLoadedTemplate(template.id);
    setTimeout(() => { setLoadedTemplate(null); router.push('/'); }, 1200);
  }, [user, router]);

  const handleDelete = useCallback(async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    await deleteTemplate(user!.uid, id);
  }, [user]);

  const handleReorder = useCallback(async (index: number, dir: -1 | 1) => {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= templates.length) return;
    const reordered = [...templates];
    [reordered[index], reordered[newIdx]] = [reordered[newIdx], reordered[index]];
    setTemplates(reordered);
    await reorderTemplates(user!.uid, reordered);
  }, [templates, user]);

  const handleSaveEdit = useCallback(async (name: string, entries: Template['entries']) => {
    if (!editing) return;
    const { updateTemplate } = await import('@/lib/firestore');
    await updateTemplate(user!.uid, editing.id, { name, entries });
    setTemplates((prev) => prev.map((t) => t.id === editing.id ? { ...t, name, entries } : t));
    setEditing(null);
  }, [editing, user]);

  const handleSaveCurrentAsTemplate = useCallback(async () => {
    if (!user) return;
    const workout = await getTodayWorkout(user.uid);
    if (!workout || workout.entries.length === 0) return;
    const templateEntries = workout.entries.map((e) => ({ movementName: e.movementName, reps: e.reps, weight: e.weight, unit: e.unit }));
    const name = `Workout ${new Date().toLocaleDateString()}`;
    const id = await createTemplate(user.uid, { name, entries: templateEntries, createdAt: Date.now(), order: templates.length });
    setTemplates((prev) => [...prev, { id, name, entries: templateEntries, createdAt: Date.now(), order: templates.length }]);
  }, [user, templates.length]);

  if (loading) return <div className="py-4"><SkeletonList count={3} /></div>;
  if (editing) return <div className="py-4"><TemplateEditor initialName={editing.name} initialEntries={editing.entries} movements={movements} onSave={handleSaveEdit} onCancel={() => setEditing(null)} /></div>;

  return (
    <div className="flex flex-col gap-4 py-4 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Templates</h1>
      {templates.length === 0 ? (
        <p className="py-8 text-center text-text-tertiary">No templates yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {templates.map((t, i) => (
            <div key={t.id} className="rounded-sm bg-bg-secondary p-4 card-depth">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-text-primary">{t.name}</h3>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleReorder(i, -1)} className="p-1 text-text-tertiary hover:text-accent active:scale-90"><ArrowUp size={14} /></button>
                  <button onClick={() => handleReorder(i, 1)} className="p-1 text-text-tertiary hover:text-accent active:scale-90"><ArrowDown size={14} /></button>
                </div>
              </div>
              <p className="mb-3 text-xs text-text-tertiary truncate">{t.entries.map((e) => e.movementName).join(', ')}</p>
              <div className="flex gap-2">
                <button onClick={() => handleLoad(t)} disabled={loadingTemplate === t.id || loadedTemplate === t.id} className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm py-2.5 text-sm font-bold active:scale-95 ${loadedTemplate === t.id ? 'bg-success text-white' : 'bg-accent text-text-on-accent'}`}>
                  {loadingTemplate === t.id ? <Loader2 size={16} className="animate-spin" /> : loadedTemplate === t.id ? <><CheckCircle size={16} /> Loaded!</> : <><Play size={16} /> Load</>}
                </button>
                <button onClick={() => setEditing(t)} className="rounded-sm border border-border px-3 py-2.5 text-text-secondary hover:bg-bg-tertiary active:scale-95"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(t.id)} className="rounded-sm border border-border px-3 py-2.5 text-text-secondary hover:bg-danger/10 hover:text-danger active:scale-95"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {todayHasEntries && (
        <button onClick={handleSaveCurrentAsTemplate} className="flex items-center justify-center gap-2 rounded-sm border border-dashed border-border py-3 text-sm font-medium text-text-tertiary hover:border-accent hover:text-accent active:scale-[0.98]">
          <Save size={16} /> Save current workout as template
        </button>
      )}
    </div>
  );
}
