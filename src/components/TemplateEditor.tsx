'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Copy, X, Save } from 'lucide-react';
import type { Movement, TemplateEntry } from '@/types';
import { useSettings } from '@/context/SettingsContext';
import UndoToast from './UndoToast';

interface TemplateEditorProps {
  initialName: string;
  initialEntries: TemplateEntry[];
  movements: Movement[];
  onSave: (name: string, entries: TemplateEntry[]) => void;
  onCancel: () => void;
}

export default function TemplateEditor({ initialName, initialEntries, movements, onSave, onCancel }: TemplateEditorProps) {
  const { settings } = useSettings();
  const [name, setName] = useState(initialName);
  const [entries, setEntries] = useState<TemplateEntry[]>(initialEntries);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [undoState, setUndoState] = useState<{ entry: TemplateEntry; index: number } | null>(null);

  const suggestions = search.trim() ? movements.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8) : [];

  const addMovement = useCallback((movementName: string) => {
    setEntries((prev) => [...prev, { movementName, reps: 10, weight: 0, unit: settings.unit }]);
    setSearch('');
    setShowSearch(false);
  }, [settings.unit]);

  const removeEntry = useCallback((index: number) => {
    const removed = entries[index];
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setUndoState({ entry: removed, index });
  }, [entries]);

  const undoRemove = useCallback(() => {
    if (!undoState) return;
    setEntries((prev) => { const n = [...prev]; n.splice(undoState.index, 0, undoState.entry); return n; });
    setUndoState(null);
  }, [undoState]);

  const moveEntry = useCallback((index: number, dir: -1 | 1) => {
    const newIdx = index + dir;
    if (newIdx < 0 || newIdx >= entries.length) return;
    setEntries((prev) => { const n = [...prev]; [n[index], n[newIdx]] = [n[newIdx], n[index]]; return n; });
  }, [entries.length]);

  const duplicateEntry = useCallback((index: number) => {
    setEntries((prev) => { const n = [...prev]; n.splice(index + 1, 0, { ...prev[index] }); return n; });
  }, []);

  const updateEntry = useCallback((index: number, data: Partial<TemplateEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...data } : e)));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onCancel} className="flex items-center gap-1 text-sm font-medium text-text-tertiary hover:text-text-primary active:scale-95"><X size={18} /> Cancel</button>
        <button onClick={() => onSave(name, entries)} className="flex items-center gap-1 rounded-sm bg-accent px-4 py-2 text-sm font-bold text-text-on-accent active:scale-95"><Save size={16} /> Save</button>
      </div>

      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="mb-4 w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-lg font-bold text-text-primary focus:border-accent focus:outline-none" />

      {/* Entries */}
      <div className="mb-4 flex flex-col gap-2">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 rounded-sm bg-bg-secondary p-3 card-depth">
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">{entry.movementName}</p>
              <div className="mt-1 flex gap-2">
                <input type="number" value={entry.reps} onChange={(e) => updateEntry(i, { reps: Number(e.target.value) })} className="w-16 rounded-sm border border-border bg-bg-primary px-2 py-1 text-center text-sm focus:outline-none" placeholder="Reps" />
                <input type="number" value={entry.weight} onChange={(e) => updateEntry(i, { weight: Number(e.target.value) })} className="w-20 rounded-sm border border-border bg-bg-primary px-2 py-1 text-center text-sm focus:outline-none" placeholder="Weight" step="0.5" />
                <span className="self-center text-xs text-text-tertiary">{entry.unit}</span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveEntry(i, -1)} className="p-1 text-text-tertiary hover:text-accent active:scale-90"><ArrowUp size={14} /></button>
              <button onClick={() => moveEntry(i, 1)} className="p-1 text-text-tertiary hover:text-accent active:scale-90"><ArrowDown size={14} /></button>
            </div>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => duplicateEntry(i)} className="p-1 text-text-tertiary hover:text-accent active:scale-90"><Copy size={14} /></button>
              <button onClick={() => removeEntry(i)} className="p-1 text-text-tertiary hover:text-danger active:scale-90"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Movement */}
      <div className="relative">
        <button onClick={() => setShowSearch(!showSearch)} className="flex w-full items-center justify-center gap-2 rounded-sm border border-dashed border-border py-3 text-sm font-medium text-text-tertiary hover:border-accent hover:text-accent active:scale-[0.98]">
          <Plus size={16} /> Add Movement
        </button>
        {showSearch && (
          <div className="mt-2">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movements..." autoFocus className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm focus:border-accent focus:outline-none" />
            {suggestions.length > 0 && (
              <div className="mt-1 max-h-48 overflow-y-auto rounded-sm border border-border bg-bg-secondary">
                {suggestions.map((m) => (
                  <button key={m.id} onClick={() => addMovement(m.name)} className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-bg-tertiary">{m.name} <span className="text-xs text-text-tertiary">({m.category})</span></button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {undoState && <UndoToast message={`Removed ${undoState.entry.movementName}`} onUndo={undoRemove} onDismiss={() => setUndoState(null)} />}
    </div>
  );
}
