'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Repeat, ChevronDown, ChevronUp } from 'lucide-react';
import type { Movement, WorkoutEntry } from '@/types';
import { useSettings } from '@/context/SettingsContext';

interface WorkoutFormProps {
  movements: Movement[];
  lastEntry: WorkoutEntry | null;
  onLogSet: (entry: Omit<WorkoutEntry, 'id' | 'createdAt'>) => void;
}

export default function WorkoutForm({ movements, lastEntry, onLogSet }: WorkoutFormProps) {
  const { settings } = useSettings();
  const [movementName, setMovementName] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [suggestions, setSuggestions] = useState<Movement[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMovementChange = useCallback((value: string) => {
    setMovementName(value);
    if (value.trim().length > 0) {
      const filtered = movements
        .filter((m) => m.name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [movements]);

  const selectMovement = useCallback((name: string) => {
    setMovementName(name);
    setShowSuggestions(false);
    // Auto-fill from last entry of same movement could be added here
  }, []);

  const handleLogSet = useCallback(() => {
    if (!movementName.trim() || !reps) return;
    onLogSet({
      movementName: movementName.trim(),
      reps: Number(reps),
      weight: Number(weight) || 0,
      unit: settings.unit,
      notes: notes.trim(),
    });
    setReps('');
    setWeight('');
    setNotes('');
    setShowNotes(false);
    inputRef.current?.focus();
  }, [movementName, reps, weight, notes, settings.unit, onLogSet]);

  const handleRepeatLast = useCallback(() => {
    if (!lastEntry) return;
    onLogSet({
      movementName: lastEntry.movementName,
      reps: lastEntry.reps,
      weight: lastEntry.weight,
      unit: lastEntry.unit,
      notes: '',
    });
  }, [lastEntry, onLogSet]);

  return (
    <div className="rounded-sm bg-bg-secondary p-4 card-depth animate-fade-in">
      {/* Movement Input */}
      <div className="relative mb-3">
        <input
          ref={inputRef}
          type="text"
          value={movementName}
          onChange={(e) => handleMovementChange(e.target.value)}
          onFocus={() => movementName && handleMovementChange(movementName)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Movement name"
          className="w-full rounded-sm border border-border bg-bg-primary px-4 py-3.5 text-lg text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-sm border border-border bg-bg-secondary shadow-lg">
            {suggestions.map((m) => (
              <button
                key={m.id}
                onMouseDown={() => selectMovement(m.name)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-text-primary hover:bg-bg-tertiary active:scale-[0.99]"
              >
                <span className="font-medium">{m.name}</span>
                <span className="text-xs text-text-tertiary">{m.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reps & Weight */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          placeholder="Reps"
          min="0"
          className="rounded-sm border border-border bg-bg-primary px-4 py-3.5 text-lg text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder={`Weight (${settings.unit})`}
          min="0"
          step="0.5"
          className="rounded-sm border border-border bg-bg-primary px-4 py-3.5 text-lg text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Notes Toggle */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="mb-3 flex items-center gap-1 text-xs font-medium text-text-tertiary hover:text-text-secondary active:scale-95"
      >
        {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Notes
      </button>
      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          rows={2}
          className="mb-3 w-full rounded-sm border border-border bg-bg-primary px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
        />
      )}

      {/* Buttons */}
      <button
        onClick={handleLogSet}
        disabled={!movementName.trim() || !reps}
        className="mb-2 flex w-full items-center justify-center gap-2 rounded-sm bg-accent py-3.5 text-lg font-bold text-text-on-accent shadow-[var(--shadow-btn)] hover:shadow-[var(--shadow-btn-hover)] active:scale-95 active:shadow-[var(--shadow-btn-pressed)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={20} strokeWidth={2.5} />
        Log Set
      </button>

      {lastEntry && (
        <button
          onClick={handleRepeatLast}
          className="flex w-full items-center justify-center gap-2 rounded-sm border border-border bg-bg-primary py-3 text-sm font-medium text-text-secondary hover:bg-bg-tertiary active:scale-95"
        >
          <Repeat size={16} />
          Repeat: {lastEntry.movementName} ({lastEntry.reps} × {lastEntry.weight}{lastEntry.unit})
        </button>
      )}
    </div>
  );
}
