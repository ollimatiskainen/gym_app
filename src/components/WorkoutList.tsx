'use client';

import { useState, useCallback } from 'react';
import { Trash2, Copy, Pencil, Check, X } from 'lucide-react';
import type { WorkoutEntry } from '@/types';

interface WorkoutListProps {
  entries: WorkoutEntry[];
  onUpdateEntry: (entryId: string, data: Partial<WorkoutEntry>) => void;
  onDeleteEntry: (entryId: string) => void;
  onDuplicateEntry: (entry: WorkoutEntry) => void;
  onDeleteMovement?: (movementName: string) => void;
}

function groupByMovement(entries: WorkoutEntry[]) {
  const map = new Map<string, WorkoutEntry[]>();
  for (const e of entries) {
    const arr = map.get(e.movementName) || [];
    arr.push(e);
    map.set(e.movementName, arr);
  }
  return Array.from(map.entries()).map(([name, ents]) => ({ movementName: name, entries: ents }));
}

function InlineEdit({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const save = () => { const n = Number(editValue); if (!isNaN(n)) onSave(n); setEditing(false); };
  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === 'Enter' && save()} autoFocus className="w-16 rounded-lg border border-accent bg-bg-primary px-2 py-1 text-center text-sm focus:outline-none" />
      </span>
    );
  }
  return <button onClick={() => { setEditValue(String(value)); setEditing(true); }} className="cursor-pointer rounded px-1 hover:bg-bg-tertiary active:scale-95">{value}</button>;
}

export default function WorkoutList({ entries, onUpdateEntry, onDeleteEntry, onDuplicateEntry, onDeleteMovement }: WorkoutListProps) {
  const groups = groupByMovement(entries);
  if (groups.length === 0) return <div className="py-8 text-center text-sm text-text-tertiary">No sets logged yet.</div>;

  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <div key={g.movementName} className="rounded-2xl bg-bg-secondary p-4 card-depth">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-text-primary">{g.movementName}</h3>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">{g.entries.length} {g.entries.length === 1 ? 'set' : 'sets'}</span>
            </div>
            {onDeleteMovement && (
              <button onClick={() => onDeleteMovement(g.movementName)} className="rounded-lg p-1.5 text-text-tertiary hover:bg-danger/10 hover:text-danger active:scale-90"><Trash2 size={16} /></button>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            {g.entries.map((entry, i) => (
              <div key={entry.id} className="flex items-center justify-between rounded-xl bg-bg-primary px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-center text-xs font-bold text-text-tertiary">{i + 1}</span>
                  <InlineEdit value={entry.reps} onSave={(v) => onUpdateEntry(entry.id, { reps: v })} />
                  <span className="text-text-tertiary">×</span>
                  <InlineEdit value={entry.weight} onSave={(v) => onUpdateEntry(entry.id, { weight: v })} />
                  <span className="text-xs text-text-tertiary">{entry.unit}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => onDuplicateEntry(entry)} className="rounded-lg p-1.5 text-text-tertiary hover:text-accent active:scale-90"><Copy size={14} /></button>
                  <button onClick={() => onDeleteEntry(entry.id)} className="rounded-lg p-1.5 text-text-tertiary hover:text-danger active:scale-90"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
